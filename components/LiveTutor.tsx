
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob, Type, FunctionDeclaration, Tool } from '@google/genai';
import { AudioVisualizer } from './AudioVisualizer';
import { Surah, AppMode } from '../types';
import { Mic, MicOff, Volume2, AlertCircle, VolumeX, Navigation } from 'lucide-react';

interface LiveTutorProps {
  apiKey: string;
  activeSurah: Surah;
  onTranscriptUpdate: (textDelta: string) => void;
  onFeedbackUpdate: (text: string) => void;
  onRecordingStatusChange?: (isRecording: boolean) => void;
  onCommand?: (command: { type: 'PAGE' | 'SURAH'; value: number }) => void;
  mode: AppMode;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    const s = Math.max(-1, Math.min(1, data[i]));
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const NAVIGATION_TOOLS: Tool[] = [
  {
    functionDeclarations: [
      {
        name: "change_page",
        description: "Navigates the Quran application to a specific page number.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            page: {
              type: Type.NUMBER,
              description: "The page number to navigate to (1-604)."
            }
          },
          required: ["page"]
        }
      },
      {
        name: "change_surah",
        description: "Navigates the Quran application to the beginning of a specific Surah.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            surah_id: {
              type: Type.NUMBER,
              description: "The ID of the Surah (1-114). e.g., 2 for Al-Baqarah."
            }
          },
          required: ["surah_id"]
        }
      }
    ]
  }
];

export const LiveTutor: React.FC<LiveTutorProps> = ({ apiKey, activeSurah, onTranscriptUpdate, onFeedbackUpdate, onRecordingStatusChange, onCommand, mode }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNoAudioDetected, setIsNoAudioDetected] = useState(false);
  const [freqData, setFreqData] = useState<Uint8Array | null>(null);
  
  const sessionRef = useRef<any>(null); 
  const inputContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const silenceCounterRef = useRef(0);
  
  // Track previous surah to detect changes and send updates
  const prevSurahIdRef = useRef<number>(activeSurah.id);

  // Notify parent of recording status
  useEffect(() => {
    if (onRecordingStatusChange) {
        onRecordingStatusChange(isRecording);
    }
  }, [isRecording, onRecordingStatusChange]);

  // Send context update to AI when surah changes while recording
  useEffect(() => {
    if (isRecording && sessionRef.current && prevSurahIdRef.current !== activeSurah.id) {
        console.log("Sending context update to AI: Surah " + activeSurah.transliteration);
        sessionRef.current.sendRealtimeInput({
            content: { parts: [{ text: `Context Update: The user has navigated to Surah ${activeSurah.id} (${activeSurah.transliteration}). Focus on this Surah now.` }] }
        });
        prevSurahIdRef.current = activeSurah.id;
    } else {
        prevSurahIdRef.current = activeSurah.id;
    }
  }, [activeSurah, isRecording]);

  const stopSession = useCallback(() => {
    if (sessionRef.current) {
      try { sessionRef.current.close(); } catch (e) { console.warn("Error closing session:", e); }
      sessionRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    
    if (inputContextRef.current) {
      inputContextRef.current.close();
      inputContextRef.current = null;
    }
    
    if (outputContextRef.current) {
      outputContextRef.current.close();
      outputContextRef.current = null;
    }

    sourcesRef.current.forEach(source => {
        try { source.stop(); } catch(e) {}
    });
    sourcesRef.current.clear();
    
    setIsRecording(false);
    setFreqData(null);
    setIsNoAudioDetected(false);
    silenceCounterRef.current = 0;
  }, []);

  const startSession = async () => {
    if (!apiKey) {
      setError("API Key is missing.");
      return;
    }
    setError(null);
    setIsRecording(true);
    setIsNoAudioDetected(false);
    silenceCounterRef.current = 0;

    try {
      const ai = new GoogleGenAI({ apiKey });
      
      let instructions = "";
      if (mode === AppMode.TAJWEED_PRACTICE) {
         instructions = `You are a strict Tajweed teacher for the Quran (Warsh narration).
         Current Context: Surah ${activeSurah.transliteration}.
         Focus heavily on pronunciation, madd, idgham, and ghunnah.
         IF CORRECT: Silent.
         IF MISTAKE: Correct the pronunciation clearly.`;
      } else {
         instructions = `You are a Memorization tester for the Quran (Warsh narration).
         Current Context: Surah ${activeSurah.transliteration}.
         Focus primarily on WORD ACCURACY (missing words, wrong words). Ignore minor tajweed slips.
         IF CORRECT: Silent.
         IF MISTAKE: Speak the missing/wrong word to prompt them.`;
      }

      const config = {
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          tools: NAVIGATION_TOOLS,
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: `
          ${instructions}
          
          GENERAL RULES:
          1. Listen to Arabic recitation.
          2. IF CORRECT: Output text "Mumtaz" or "Correct". AUDIO: Generate SILENCE.
          3. IF MISTAKE: Output brief error text. AUDIO: Speak correction.
          4. Always transcribe.
          5. NAVIGATION: You have tools to change the page or Surah. If the user asks "Go to Surah Baqarah" or "Open Page 50", use the tool IMMEDIATELY.
          `,
          outputAudioTranscription: {}, 
          inputAudioTranscription: {}, 
        }
      };

      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      if (inputCtx.state === 'suspended') await inputCtx.resume();
      if (outputCtx.state === 'suspended') await outputCtx.resume();
      
      inputContextRef.current = inputCtx;
      outputContextRef.current = outputCtx;
      
      const outputNode = outputCtx.createGain();
      outputNode.connect(outputCtx.destination);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const analyser = inputCtx.createAnalyser();
      analyser.fftSize = 64;
      analyzerRef.current = analyser;
      
      const source = inputCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      
      const processor = inputCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;
      
      source.connect(processor);
      processor.connect(inputCtx.destination);

      const sessionPromise = ai.live.connect({
        ...config,
        callbacks: {
          onopen: () => {
            console.log("Session Open");
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              let sum = 0;
              for(let i=0; i<inputData.length; i+=100) sum += Math.abs(inputData[i]);
              const avg = sum / (inputData.length/100);
              
              if (avg < 0.01) {
                  silenceCounterRef.current++;
                  if (silenceCounterRef.current > 20) setIsNoAudioDetected(true);
              } else {
                  silenceCounterRef.current = 0;
                  setIsNoAudioDetected(false);
              }

              const pcmBlob = createBlob(inputData);
              sessionPromise.then(session => {
                  try { session.sendRealtimeInput({ media: pcmBlob }); } catch (e) { console.error(e); }
              });
              
              const dataArray = new Uint8Array(analyser.frequencyBinCount);
              analyser.getByteFrequencyData(dataArray);
              setFreqData(dataArray);
            };
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Tool Calls (Navigation)
            if (message.toolCall) {
                const functionCalls = message.toolCall.functionCalls;
                if (functionCalls && functionCalls.length > 0) {
                    const call = functionCalls[0];
                    let result = "Failed to navigate";
                    
                    if (call.name === 'change_page' && call.args && onCommand) {
                        const p = Number(call.args['page']);
                        if (!isNaN(p)) {
                            onCommand({ type: 'PAGE', value: p });
                            result = `Navigated to page ${p}`;
                        }
                    } else if (call.name === 'change_surah' && call.args && onCommand) {
                        const s = Number(call.args['surah_id']);
                        if (!isNaN(s)) {
                            onCommand({ type: 'SURAH', value: s });
                            result = `Navigated to Surah ID ${s}`;
                        }
                    }

                    // Send response back
                    sessionPromise.then(session => {
                        session.sendToolResponse({
                            functionResponses: [{
                                id: call.id,
                                name: call.name,
                                response: { result: { status: "OK", message: result } }
                            }]
                        });
                    });
                }
            }

            if (message.serverContent?.outputTranscription) {
               onFeedbackUpdate(message.serverContent.outputTranscription.text);
            } 
            
            if (message.serverContent?.inputTranscription) {
               const text = message.serverContent.inputTranscription.text;
               if (text) onTranscriptUpdate(text); 
            }

            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
               nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
               const audioBuffer = await decodeAudioData(decode(base64Audio), outputCtx, 24000, 1);
               const source = outputCtx.createBufferSource();
               source.buffer = audioBuffer;
               source.connect(outputNode);
               source.addEventListener('ended', () => { sourcesRef.current.delete(source); });
               source.start(nextStartTimeRef.current);
               nextStartTimeRef.current += audioBuffer.duration;
               sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} sourcesRef.current.delete(s); });
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => setIsRecording(false),
          onerror: (err) => {
            console.error("Session Error", err);
          }
        }
      });

      sessionRef.current = await sessionPromise;

    } catch (e: any) {
      console.error(e);
      setError("Failed to start.");
      setIsRecording(false);
    }
  };

  const toggleSession = () => isRecording ? stopSession() : startSession();
  
  // Clean up only on unmount (or if apiKey/mode changes violently, but we try to persist across surah changes)
  useEffect(() => {
    return () => { stopSession(); };
  }, [stopSession]); 

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <div className="relative">
             <div className={`
                w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-md cursor-pointer
                ${isRecording 
                    ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse ring-2 ring-red-100' 
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'}
             `}
             onClick={toggleSession}
             >
                {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
             </div>
             
             {isRecording && (
                 <div className="absolute -inset-1 rounded-full border border-red-200 animate-ping opacity-75 pointer-events-none"></div>
             )}
        </div>
        
        <div className="flex flex-col">
            <span className={`text-sm font-bold ${isRecording ? 'text-white md:text-gray-800' : 'text-gray-800'}`}>
                {isRecording ? "Listening..." : "Tap to Recite"}
            </span>
             {error ? (
                <span className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle size={10} /> {error}
                </span>
            ) : isNoAudioDetected && isRecording ? (
                 <span className="text-xs text-orange-500 flex items-center gap-1 animate-pulse">
                    <VolumeX size={10} /> Check Mic
                </span>
            ) : (
                <span className={`text-xs ${isRecording ? 'text-white/80 md:text-gray-400' : 'text-gray-400'}`}>
                    {mode === AppMode.TAJWEED_PRACTICE ? "Tajweed Mode" : "Recitation Mode"}
                </span>
            )}
        </div>
      </div>
    </div>
  );
};
