import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { AudioVisualizer } from './AudioVisualizer';
import { Surah } from '../types';
import { Mic, MicOff, Volume2, AlertCircle, VolumeX } from 'lucide-react';

interface LiveTutorProps {
  apiKey: string;
  activeSurah: Surah;
  onTranscriptUpdate: (textDelta: string) => void;
  onFeedbackUpdate: (text: string) => void;
  mode: 'RECITATION' | 'MEMORIZATION';
}

// Audio helpers
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

export const LiveTutor: React.FC<LiveTutorProps> = ({ apiKey, activeSurah, onTranscriptUpdate, onFeedbackUpdate, mode }) => {
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
  
  // Audio level check reference
  const silenceCounterRef = useRef(0);

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
      const config = {
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: `You are a strict Quran teacher specializing in Warsh 'an Nafi' narration.
          User is reciting Surah ${activeSurah.transliteration}.
          
          Important:
          1. Transcription: The user is speaking Arabic. 
          2. Rules: Listen for Warsh recitation (e.g., 'Maliki' not 'Maaliki' in Fatiha).
          3. Interaction: If correct, say 'Mumtaz' briefly. If wrong, correct them.
          4. Output: Keep audio responses very short.
          `,
          // FIX: Pass empty objects to enable transcription, do NOT pass { model: ... }
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
              
              // Silence detection
              let sum = 0;
              for(let i=0; i<inputData.length; i+=100) sum += Math.abs(inputData[i]);
              const avg = sum / (inputData.length/100);
              
              if (avg < 0.01) {
                  silenceCounterRef.current++;
                  if (silenceCounterRef.current > 20) setIsNoAudioDetected(true); // ~5 seconds silence
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
            if (message.serverContent?.outputTranscription) {
               onFeedbackUpdate(message.serverContent.outputTranscription.text);
            } 
            
            // Handle Input Transcription
            if (message.serverContent?.inputTranscription) {
               const text = message.serverContent.inputTranscription.text;
               if (text) {
                   onTranscriptUpdate(text); 
               }
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
            // Don't show generic error to user immediately unless strictly failed
            // setError("Connection interrupted."); 
            // stopSession();
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
  
  useEffect(() => {
    return () => { stopSession(); };
  }, [stopSession, activeSurah]);

  return (
    <div className="flex flex-col gap-2">
      {/* Mini Controls for Bottom Bar Integration */}
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
             
             {/* Small visualizer ring if recording */}
             {isRecording && (
                 <div className="absolute -inset-1 rounded-full border border-red-200 animate-ping opacity-75 pointer-events-none"></div>
             )}
        </div>
        
        <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-800">
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
                <span className="text-xs text-gray-400">Warsh Mode</span>
            )}
        </div>
      </div>
    </div>
  );
};
