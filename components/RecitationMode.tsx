import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Surah, Verse } from '../types';
import { MOCK_SURAHS } from '../constants';
import { LiveTutor } from './LiveTutor';
import { ArrowLeft, Settings, Eye, EyeOff, MessageSquare } from 'lucide-react';

interface RecitationModeProps {
  onBack: () => void;
  apiKey: string;
}

// Helper to normalize Arabic text (remove Tashkeel, unify Alefs) for matching
const normalizeArabic = (text: string) => {
  if (!text) return "";
  return text
    .replace(/([^\u0621-\u064A\u0660-\u0669a-zA-Z\s])/g, '') // Remove Tashkeel
    .replace(/(آ|إ|أ)/g, 'ا') // Unify Alefs
    .replace(/ى/g, 'ي') // Unify Ya
    .replace(/ة/g, 'ه') // Unify Ta Marbuta
    .replace(/\s+/g, ' ') // Collapse whitespace
    .trim();
};

export const RecitationMode: React.FC<RecitationModeProps> = ({ onBack, apiKey }) => {
  const [activeSurah, setActiveSurah] = useState<Surah>(MOCK_SURAHS[0]);
  const [transcript, setTranscript] = useState('');
  const [aiFeedback, setAiFeedback] = useState('');
  
  // Track the currently recited verse ID
  const [currentVerseId, setCurrentVerseId] = useState<number | null>(null);
  const [hidden, setHidden] = useState(false);
  
  // Refs for auto-scrolling
  const verseRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Normalize Surah verses once for efficient matching
  const normalizedVerses = useMemo(() => {
    return activeSurah.verses.map(v => ({
      ...v,
      normalized: normalizeArabic(v.text)
    }));
  }, [activeSurah]);

  // Handle Surah Change
  const handleSurahChange = (surah: Surah) => {
    setActiveSurah(surah);
    setCurrentVerseId(null);
    setTranscript('');
    setAiFeedback('');
  };

  // Scroll current verse into view smoothly
  useEffect(() => {
    if (currentVerseId && verseRefs.current[currentVerseId]) {
      verseRefs.current[currentVerseId]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentVerseId]);

  // Handle new transcript chunks from LiveTutor
  // We accumulate transcript but keep a window for matching to allow jumping
  const handleTranscriptUpdate = (delta: string) => {
      setTranscript(prev => {
          // Keep a reasonably long history to show context, but not infinite
          const fullTranscript = prev + delta;
          const displayTranscript = fullTranscript.slice(-500); // Keep last 500 chars for display
          
          const windowSize = 100; // Look at last 100 chars for matching
          const recentTranscript = displayTranscript.slice(-windowSize);
          const normalizedTranscript = normalizeArabic(recentTranscript);

          // Find match in current Surah
          let bestMatchId: number | null = null;
          let maxOverlap = 0;

          normalizedVerses.forEach(verse => {
             // 1. Check if the verse text is fully contained in the recent transcript
             if (normalizedTranscript.includes(verse.normalized)) {
                 if (verse.normalized.length > maxOverlap) {
                     maxOverlap = verse.normalized.length;
                     bestMatchId = verse.id;
                 }
             }
             // 2. Check partial overlap (useful for long verses)
             else if (verse.normalized.length > 5 && normalizedTranscript.length > 5) {
                 // Check if the end of transcript matches start of verse
                 // OR if transcript contains a significant chunk of verse (at least 3 words / 15 chars)
                 
                 // Split into words for rough matching
                 const verseWords = verse.normalized.split(' ');
                 const transcriptWords = normalizedTranscript.split(' ');
                 
                 // Very simple n-gram check (match 3 consecutive words)
                 if (verseWords.length >= 3 && transcriptWords.length >= 3) {
                     for(let i=0; i < transcriptWords.length - 2; i++) {
                         const phrase = transcriptWords.slice(i, i+3).join(' ');
                         if (verse.normalized.includes(phrase)) {
                             // Boost score
                             if (phrase.length > maxOverlap) {
                                 maxOverlap = phrase.length;
                                 bestMatchId = verse.id;
                             }
                         }
                     }
                 }
             }
          });

          if (bestMatchId && bestMatchId !== currentVerseId) {
              setCurrentVerseId(bestMatchId);
          }
          
          return displayTranscript;
      });
  };

  return (
    <div className="flex flex-col h-full bg-sand-50 relative">
      {/* Header */}
      <div className="bg-white px-4 py-3 shadow-sm flex items-center justify-between z-20 border-b border-sand-200 shrink-0">
        <button onClick={onBack} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex flex-col items-center">
            <h2 className="font-bold text-gray-900">{activeSurah.transliteration}</h2>
            <span className="text-xs text-emerald-600 font-medium">Continuous Recitation</span>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => setHidden(!hidden)} 
                className={`p-2 rounded-full transition-colors ${hidden ? 'bg-emerald-100 text-emerald-700' : 'text-gray-400 hover:bg-gray-100'}`}
                title="Hide Text"
            >
                {hidden ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                <Settings size={20} />
            </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar Surah List (Desktop) */}
        <div className="hidden md:block w-64 bg-white border-r border-gray-200 overflow-y-auto shrink-0 z-10">
            <div className="p-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Surahs</div>
            {MOCK_SURAHS.map(s => (
                <button 
                    key={s.id}
                    onClick={() => handleSurahChange(s)}
                    className={`w-full text-left px-4 py-3 flex items-center justify-between hover:bg-emerald-50 transition-colors ${activeSurah.id === s.id ? 'bg-emerald-50 border-r-4 border-emerald-500' : ''}`}
                >
                    <div>
                        <div className="font-medium text-gray-800">{s.id}. {s.transliteration}</div>
                        <div className="text-xs text-gray-400">{s.english}</div>
                    </div>
                </button>
            ))}
        </div>

        {/* Main Content - Continuous Scroll View */}
        <div className="flex-1 relative bg-sand-50 flex flex-col">
            
            {/* Scrollable Verses Container */}
            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 md:p-8 pb-48 scroll-smooth">
                <div className="max-w-3xl mx-auto flex flex-col items-center gap-6">
                    {/* Bismillah for Fatiha or others (Simplified) */}
                    <div className="text-center mb-8 opacity-60">
                         <p className="font-quran text-2xl">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</p>
                    </div>

                    {activeSurah.verses.map((verse) => {
                         const isActive = currentVerseId === verse.id;
                         return (
                             <div 
                                key={verse.id}
                                ref={(el) => { verseRefs.current[verse.id] = el }}
                                className={`w-full transition-all duration-500 px-6 py-4 rounded-2xl flex flex-col items-center text-center cursor-pointer
                                    ${isActive 
                                        ? 'bg-white border-2 border-emerald-400 shadow-xl scale-105 z-10' 
                                        : 'bg-transparent border-2 border-transparent opacity-60 hover:opacity-100 hover:bg-white/50'
                                    }
                                `}
                                onClick={() => setCurrentVerseId(verse.id)}
                             >
                                <p className={`font-quran text-3xl md:text-4xl leading-[2.5] text-gray-900 transition-all ${hidden && !isActive ? 'blur-md' : 'blur-0'}`} dir="rtl">
                                    {verse.text}
                                    <span className={`inline-flex items-center justify-center w-8 h-8 mr-2 text-sm border rounded-full font-sans align-middle ${isActive ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-emerald-50/50 text-emerald-800 border-emerald-700/30'}`}>
                                        {verse.id.toLocaleString('ar-EG')}
                                    </span>
                                </p>
                                {isActive && (
                                    <p className="mt-4 text-sm text-emerald-600 font-medium animate-fade-in">
                                        {verse.translation}
                                    </p>
                                )}
                             </div>
                         );
                    })}
                    
                    {/* Spacer for bottom panel */}
                    <div className="h-48"></div>
                </div>
            </div>

            {/* Floating Live Transcript & Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-sand-50 via-sand-50/95 to-transparent z-30">
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-4 items-end md:items-center shadow-2xl rounded-2xl bg-white border border-gray-100 p-4">
                    
                    {/* Left: Tutor Controls */}
                    <div className="shrink-0">
                        <LiveTutor 
                            apiKey={apiKey} 
                            activeSurah={activeSurah} 
                            onTranscriptUpdate={handleTranscriptUpdate}
                            onFeedbackUpdate={setAiFeedback}
                            mode="RECITATION"
                        />
                    </div>

                    {/* Right: Transcript Display */}
                    <div className="flex-1 w-full flex flex-col gap-2">
                        <div className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-wider">
                            <span>Live Transcription</span>
                            <span className={transcript ? "text-emerald-500" : "text-gray-300"}>
                                {transcript ? "Listening..." : "Waiting..."}
                            </span>
                        </div>
                        
                        <div className="bg-gray-50 rounded-xl p-3 h-20 overflow-y-auto border border-gray-100 relative group custom-scrollbar">
                            {transcript ? (
                                <p className="text-right font-quran text-xl text-gray-800 leading-relaxed" dir="rtl">
                                    {transcript.slice(-200)} {/* Show last 200 chars to avoid clutter */}
                                </p>
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-gray-400 italic text-sm">
                                    Start reciting to see text appear here...
                                </div>
                            )}
                        </div>

                         {/* Feedback Toast */}
                         {aiFeedback && (
                             <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg w-fit animate-in fade-in slide-in-from-bottom-2">
                                <MessageSquare size={14} className="fill-emerald-100" />
                                <span className="text-sm font-medium">{aiFeedback}</span>
                             </div>
                         )}
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};
