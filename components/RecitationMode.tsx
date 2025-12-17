
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Surah, Verse, AppMode } from '../types';
import { SURAH_LIST, QURAN_CONTENT } from '../constants';
import { LiveTutor } from './LiveTutor';
import { ArrowLeft, Eye, EyeOff, MessageSquare, ChevronLeft, ChevronRight, FileText, Scroll, BookOpen, Mic2, Check, X } from 'lucide-react';

interface RecitationModeProps {
  onBack: () => void;
  apiKey: string;
  initialPage?: number;
  initialSurahId?: number;
  mode: AppMode; // Initial mode
}

const normalizeArabic = (text: string) => {
  if (!text) return "";
  return text
    .replace(/([^\u0621-\u064A\u0660-\u0669a-zA-Z\s])/g, '')
    .replace(/(آ|إ|أ)/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[\u064B-\u065F]/g, '') // Remove tashkeel/harakat
    .replace(/\s+/g, ' ')
    .trim();
};

export const RecitationMode: React.FC<RecitationModeProps> = ({ onBack, apiKey, initialPage = 1, initialSurahId, mode: initialMode }) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  // Default to Page View as requested "Fixed pages"
  const [viewMode, setViewMode] = useState<'PAGE' | 'SCROLL'>('PAGE');
  const [isFocused, setIsFocused] = useState(false); // Controls hiding UI
  
  // Local state for mode to allow switching
  const [currentMode, setCurrentMode] = useState<AppMode>(initialMode);

  // Text Visibility Logic - Linked to mode
  const [isTextVisible, setIsTextVisible] = useState(initialMode === AppMode.TAJWEED_PRACTICE);
  
  // Effect to update text visibility when mode changes
  useEffect(() => {
      setIsTextVisible(currentMode === AppMode.TAJWEED_PRACTICE);
  }, [currentMode]);
  
  // Track revealed verses for Recitation Mode (Set of `${surahId}-${verseId}`)
  const [revealedVerseKeys, setRevealedVerseKeys] = useState<Set<string>>(new Set());
  
  // Track verse status (correct/incorrect) for visual feedback
  const [verseStatuses, setVerseStatuses] = useState<Record<string, 'correct' | 'incorrect'>>({});

  const [transcript, setTranscript] = useState('');
  const [aiFeedback, setAiFeedback] = useState('');
  
  // Track recited verse for highlighting
  const [currentVerseId, setCurrentVerseId] = useState<number | null>(null);
  const [currentSurahId, setCurrentSurahId] = useState<number | null>(initialSurahId || null);
  
  const verseRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const activeVerseRef = useRef<HTMLSpanElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Identify active surah. Use explicit currentSurahId if available (from recitation), otherwise derive from page.
  const activeSurah = useMemo(() => {
      if (currentSurahId) {
          return SURAH_LIST.find(s => s.id === currentSurahId) || SURAH_LIST[0];
      }

      const pageVerses = QURAN_CONTENT.filter(v => v.page === currentPage);
      if (pageVerses.length > 0) {
          const surahId = pageVerses[0].surahId;
          return SURAH_LIST.find(s => s.id === surahId) || SURAH_LIST[0];
      }
      return SURAH_LIST[0];
  }, [currentPage, currentSurahId]);

  // Filter content based on view mode
  const displayedVerses = useMemo(() => {
      if (viewMode === 'PAGE') {
          return QURAN_CONTENT.filter(v => v.page === currentPage);
      } else {
          // In scroll mode, show verses from active Surah
          return QURAN_CONTENT.filter(v => v.surahId === activeSurah.id);
      }
  }, [viewMode, currentPage, activeSurah]);

  // Prepare ALL verses for global matching (not just displayed ones)
  const allNormalizedVerses = useMemo(() => {
    return QURAN_CONTENT.map(v => ({
      ...v,
      normalized: normalizeArabic(v.text)
    }));
  }, []);

  // Handle Recording Status to Trigger Focus Mode
  const handleRecordingStatus = (isRecording: boolean) => {
      setIsFocused(isRecording);
  };

  // Handle AI Commands for Navigation
  const handleAiCommand = (command: {type: 'PAGE' | 'SURAH', value: number}) => {
      if (command.type === 'PAGE') {
          const page = Math.max(1, Math.min(604, command.value));
          setCurrentPage(page);
          setCurrentSurahId(null); // Reset surah preference to let page dictate
          setAiFeedback(`Jumping to page ${page}`);
      } else if (command.type === 'SURAH') {
          const surah = SURAH_LIST.find(s => s.id === command.value);
          if (surah) {
              setCurrentPage(surah.startPage);
              setCurrentSurahId(surah.id);
              setAiFeedback(`Jumping to Surah ${surah.transliteration}`);
          }
      }
  };

  // Handle AI Feedback to mark verses as correct/incorrect
  const handleAiFeedbackUpdate = (text: string) => {
      setAiFeedback(text);
      if (!currentVerseId || !activeSurah) return;

      const key = `${activeSurah.id}-${currentVerseId}`;
      const lower = text.toLowerCase();
      let status: 'correct' | 'incorrect' | null = null;
      
      // Heuristic to detect positive feedback from AI based on System Instructions
      if (lower.includes('mumtaz') || lower.includes('correct') || lower.includes('excellent') || lower.includes('ahsan') || lower.includes('good')) {
          status = 'correct';
      } 
      // Heuristic to detect corrections (assuming non-trivial length text that isn't just status updates)
      else if (text.length > 5 && !lower.includes('listening') && !lower.includes('ready') && !lower.includes('recite')) {
          status = 'incorrect';
      }

      if (status) {
          setVerseStatuses(prev => ({ ...prev, [key]: status as 'correct' | 'incorrect' }));
          
          // FORCE REVEAL: If AI has judged it, it must be visible
          setRevealedVerseKeys(prev => {
              const newSet = new Set(prev);
              newSet.add(key);
              return newSet;
          });
      }
  };

  const handleTranscriptUpdate = (delta: string) => {
      setTranscript(prev => {
          const fullTranscript = prev + delta;
          // Keep a larger history for matching to catch long verses or missed starts
          const displayTranscript = fullTranscript.slice(-500);
          
          // Increase window size for detection
          const windowSize = 200; 
          const recentTranscript = displayTranscript.slice(-windowSize);
          const normalizedInput = normalizeArabic(recentTranscript);

          let bestMatch: Verse | null = null;
          let maxOverlap = 0;

          // Global Fuzzy Matching against ALL content
          allNormalizedVerses.forEach(verse => {
             // 1. Direct inclusion (Verse is inside transcript)
             if (normalizedInput.includes(verse.normalized)) {
                 if (verse.normalized.length > maxOverlap) {
                     maxOverlap = verse.normalized.length;
                     bestMatch = verse;
                 }
             } 
             // 2. Partial inclusion (Transcript is inside verse, but significant enough)
             else if (verse.normalized.length > 10 && normalizedInput.length > 5) {
                 // Check if a significant chunk of the input matches the verse
                 if (verse.normalized.includes(normalizedInput)) {
                      // We require at least 15 chars or 30% of the verse to avoid false positives on short words
                      if (normalizedInput.length > 15 || normalizedInput.length > verse.normalized.length * 0.3) {
                          if (normalizedInput.length > maxOverlap) {
                              maxOverlap = normalizedInput.length;
                              bestMatch = verse;
                          }
                      }
                 }
             }
          });

          if (bestMatch) {
              const matchedVerse = bestMatch as Verse;
              
              // 1. Update Page if jumped (Recite any verse)
              if (matchedVerse.page !== currentPage) {
                  setCurrentPage(matchedVerse.page);
              }

              // 2. Update Active Surah and Highlight
              setCurrentSurahId(matchedVerse.surahId);
              setCurrentVerseId(matchedVerse.id);
              
              // 3. Reveal Verse IMMEDIATELY upon matching
              const key = `${matchedVerse.surahId}-${matchedVerse.id}`;
              setRevealedVerseKeys(prev => {
                  if (prev.has(key)) return prev;
                  const newSet = new Set(prev);
                  newSet.add(key);
                  return newSet;
              });
          }
          
          return displayTranscript;
      });
  };

  // Auto-scroll to active verse when it changes
  useEffect(() => {
      if (!currentVerseId) return;

      if (viewMode === 'PAGE' && activeVerseRef.current) {
          activeVerseRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (viewMode === 'SCROLL') {
          // Construct precise key using the active surah context
          // Note: In scroll mode we use activeSurah.id, which is synced to currentSurahId
          const key = `${activeSurah.id}-${currentVerseId}`;
          const element = verseRefs.current[key];
          
          if (element) {
               element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
      }
  }, [currentVerseId, activeSurah, viewMode]);

  const nextPage = () => {
      setCurrentPage(p => Math.min(p + 1, 604));
      setCurrentSurahId(null); // Reset explicit surah focus on manual page turn
  };
  const prevPage = () => {
      setCurrentPage(p => Math.max(p - 1, 1));
      setCurrentSurahId(null);
  };

  return (
    <div className="flex flex-col h-full bg-[#f3f4f6] relative overflow-hidden">
      
      {/* Header - Hidden in Focus Mode */}
      <div className={`
          bg-white px-4 py-3 shadow-sm flex items-center justify-between z-20 border-b border-gray-200 shrink-0 transition-all duration-500 ease-in-out
          ${isFocused ? '-mt-20 opacity-0 pointer-events-none' : 'mt-0 opacity-100'}
      `}>
        <button onClick={onBack} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex flex-col items-center">
            <h2 className="font-bold text-gray-900">
                {viewMode === 'PAGE' ? `Page ${currentPage}` : activeSurah.transliteration}
            </h2>
            <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>{activeSurah.name}</span>
                <span>•</span>
                <span>Juz {displayedVerses[0]?.juz || '-'}</span>
            </div>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => setIsTextVisible(!isTextVisible)}
                className={`p-2 rounded-full transition-colors ${!isTextVisible ? 'bg-emerald-100 text-emerald-700' : 'text-gray-600 hover:bg-gray-100'}`}
                title={isTextVisible ? "Hide Text (Test Memory)" : "Show Text"}
            >
                {isTextVisible ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
            <button 
                onClick={() => setViewMode(viewMode === 'PAGE' ? 'SCROLL' : 'PAGE')} 
                className="p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
                title="Toggle View"
            >
                {viewMode === 'PAGE' ? <Scroll size={20} /> : <FileText size={20} />}
            </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Main Content Area */}
        <div className="flex-1 relative flex flex-col h-full transition-all duration-500">
            
            {/* Quran Display */}
            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-2 md:p-4 pb-48 scroll-smooth flex justify-center items-start bg-[#fdfbf7]">
                
                {viewMode === 'PAGE' ? (
                    /* MOSHAF PAGE VIEW */
                    <div className={`
                        w-full max-w-2xl bg-[#fffdf5] shadow-2xl border-[16px] border-[#fff] outline outline-1 outline-gray-300
                        rounded-sm min-h-[85vh] relative flex flex-col p-8 md:p-12 transition-all duration-700 my-4
                        ${isFocused ? 'scale-105' : 'scale-100'}
                    `}>
                        {/* Decorative Frame */}
                        <div className="absolute inset-2 border-2 border-[#d4b572] rounded-sm pointer-events-none"></div>
                        <div className="absolute inset-3 border border-[#d4b572] rounded-sm pointer-events-none opacity-50"></div>

                        {/* Surah Header if new Surah starts here */}
                        <div className="flex justify-center mb-6">
                             <div className="bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] bg-emerald-50 px-8 py-2 border-y-2 border-[#d4b572] flex flex-col items-center">
                                 <span className="font-quran text-2xl text-black">{activeSurah.name}</span>
                                 <span className="text-[10px] text-gray-500 uppercase tracking-widest">{activeSurah.transliteration}</span>
                             </div>
                        </div>

                        {/* Verses Layout */}
                        <div className="flex-1 font-quran text-2xl md:text-3xl text-gray-900 leading-[2.6] text-justify px-2" dir="rtl" style={{textAlignLast: 'center'}}>
                            {displayedVerses.length > 0 ? displayedVerses.map((verse) => {
                                const verseKey = `${verse.surahId}-${verse.id}`;
                                const status = verseStatuses[verseKey];
                                
                                // A verse is revealed if: 
                                // 1. Global text is visible (Tajweed mode)
                                // 2. It was explicitly revealed via recitation detection
                                // 3. It has a status (Correct/Incorrect) - Meaning AI processed it
                                const isRevealed = isTextVisible || revealedVerseKeys.has(verseKey) || !!status;
                                
                                const isCurrent = verse.id === currentVerseId && verse.surahId === activeSurah.id;

                                let verseClass = "text-gray-900"; // Default text color
                                if (status === 'correct') verseClass = "text-emerald-800 bg-emerald-100/50 decoration-emerald-300 underline underline-offset-4";
                                else if (status === 'incorrect') verseClass = "text-red-800 bg-red-100/50 decoration-red-300 underline underline-offset-4 decoration-wavy";
                                else if (isCurrent) verseClass = "text-emerald-900 bg-emerald-200/50";
                                else if (!isRevealed) verseClass = "text-transparent blur-[5px] select-none bg-gray-100/50";

                                return (
                                    <React.Fragment key={verse.id}>
                                        <span 
                                            ref={isCurrent ? activeVerseRef : null}
                                            className={`transition-all duration-500 px-1 rounded ${verseClass}`}
                                        >
                                            {verse.text}
                                        </span>
                                        {/* Verse End Symbol */}
                                        <span className={`inline-flex items-center justify-center w-8 h-8 mx-1 text-sm bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Hizb_Sign.svg/1200px-Hizb_Sign.svg.png')] bg-contain bg-no-repeat bg-center text-[#8a8170] font-sans pt-1 select-none opacity-80 ${!isRevealed && 'opacity-20'}`}>
                                            {verse.id.toLocaleString('ar-EG')}
                                        </span>
                                    </React.Fragment>
                                );
                            }) : (
                                <div className="flex flex-col items-center justify-center h-64 text-gray-400 italic gap-2">
                                    <span>Page {currentPage} content not available in demo.</span>
                                    <span className="text-xs">Try Pages 1-5 or 604</span>
                                </div>
                            )}
                        </div>
                        
                         {/* Page Footer */}
                         <div className="flex justify-between items-center text-[#8a8170] text-xs font-bold border-t border-[#e0d8c0] pt-4 mt-6 px-4">
                             <span>Juz {Math.ceil(currentPage / 20)}</span>
                             <span className="text-sm text-black">{currentPage}</span>
                             <span>Hizb {Math.ceil(currentPage / 10)}</span>
                        </div>
                    </div>
                ) : (
                    /* SCROLL VIEW */
                    <div className="max-w-3xl w-full flex flex-col items-center gap-6 pt-10">
                         {displayedVerses.map((verse) => {
                             const verseKey = `${verse.surahId}-${verse.id}`;
                             const status = verseStatuses[verseKey];
                             const isRevealed = isTextVisible || revealedVerseKeys.has(verseKey) || !!status;
                             const isActive = currentVerseId === verse.id && verse.surahId === activeSurah.id;
                             
                             let cardClass = "bg-white/50 hover:bg-white/80 border-transparent";
                             if (status === 'correct') cardClass = "bg-emerald-50 border-emerald-200 ring-1 ring-emerald-100";
                             else if (status === 'incorrect') cardClass = "bg-red-50 border-red-200 ring-1 ring-red-100";
                             else if (isActive) cardClass = "bg-white shadow-xl scale-105 z-10 ring-1 ring-emerald-100";


                             return (
                                 <div 
                                    key={verseKey}
                                    ref={(el) => { verseRefs.current[verseKey] = el }}
                                    className={`w-full transition-all duration-500 px-6 py-8 rounded-2xl flex flex-col items-center text-center cursor-pointer border-b border-transparent relative overflow-hidden
                                        ${cardClass}
                                    `}
                                 >
                                    {isActive && !status && <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>}
                                    
                                    {status === 'correct' && (
                                        <div className="absolute top-0 right-0 p-2 text-emerald-600">
                                            <Check size={20} />
                                        </div>
                                    )}
                                    {status === 'incorrect' && (
                                        <div className="absolute top-0 right-0 p-2 text-red-500">
                                            <X size={20} />
                                        </div>
                                    )}
                                    
                                    <p className={`font-quran text-3xl md:text-4xl leading-[2.5] text-gray-900 transition-all duration-700 ${!isRevealed && !isActive && !status ? 'blur-md text-transparent bg-gray-50 rounded-lg select-none' : ''}`} dir="rtl">
                                        {verse.text}
                                        <span className={`inline-flex items-center justify-center w-10 h-10 mr-3 text-lg border rounded-full font-sans align-middle ${isActive || status ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-800'}`}>
                                            {verse.id.toLocaleString('ar-EG')}
                                        </span>
                                    </p>
                                    <p className="mt-4 text-gray-400 text-sm">{verse.translation}</p>
                                 </div>
                             );
                        })}
                    </div>
                )}
            </div>

            {/* Page Navigation Controls - Hidden when Focused */}
            {!isFocused && viewMode === 'PAGE' && (
                <>
                    <button 
                        onClick={nextPage} 
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-white hover:bg-emerald-50 hover:text-emerald-600 rounded-full shadow-lg text-gray-400 z-10 border border-gray-100 transition-all hover:scale-110"
                        disabled={currentPage >= 604}
                    >
                        <ChevronRight size={24} />
                    </button>
                    <button 
                        onClick={prevPage} 
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-4 bg-white hover:bg-emerald-50 hover:text-emerald-600 rounded-full shadow-lg text-gray-400 z-10 border border-gray-100 transition-all hover:scale-110"
                        disabled={currentPage <= 1}
                    >
                        <ChevronLeft size={24} />
                    </button>
                </>
            )}

            {/* Bottom Panel - Controls and Feedback */}
            <div className={`
                absolute bottom-0 left-0 right-0 transition-all duration-500 ease-in-out z-30
                ${isFocused ? 'p-2 bg-transparent' : 'p-4 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]'}
            `}>
                <div className={`
                    max-w-3xl mx-auto flex flex-col items-center gap-4
                    ${isFocused ? 'bg-black/80 backdrop-blur-md rounded-full p-2 px-6 border border-white/10 shadow-2xl text-white w-fit' : ''}
                `}>
                    
                    {/* Mode Switcher - Only visible when NOT focused (recording) */}
                    {!isFocused && (
                        <div className="flex bg-gray-100 p-1 rounded-full w-full max-w-sm">
                            <button 
                                onClick={() => setCurrentMode(AppMode.TAJWEED_PRACTICE)}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-sm font-medium transition-all ${currentMode === AppMode.TAJWEED_PRACTICE ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <BookOpen size={16} />
                                Tajweed
                            </button>
                            <button 
                                onClick={() => setCurrentMode(AppMode.RECITATION_TEST)}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-sm font-medium transition-all ${currentMode === AppMode.RECITATION_TEST ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <Mic2 size={16} />
                                Recite
                            </button>
                        </div>
                    )}

                    {/* Mic & AI Status */}
                    <div className="flex items-center gap-4 w-full justify-center">
                         <LiveTutor 
                            apiKey={apiKey} 
                            activeSurah={activeSurah} 
                            onTranscriptUpdate={handleTranscriptUpdate}
                            onFeedbackUpdate={handleAiFeedbackUpdate}
                            onRecordingStatusChange={handleRecordingStatus} 
                            onCommand={handleAiCommand}
                            mode={currentMode}
                        />
                        
                        {/* Compact Feedback when NOT focused */}
                        {!isFocused && (
                            <div className="flex-1 hidden md:block">
                                <div className="bg-gray-50 rounded-xl p-3 h-14 overflow-hidden border border-gray-100 flex items-center">
                                    {transcript ? (
                                        <p className="text-right font-quran text-lg text-gray-800 w-full truncate" dir="rtl">
                                            {transcript.slice(-100)}
                                        </p>
                                    ) : (
                                        <span className="text-gray-400 text-sm italic w-full text-center">Ready to listen...</span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* AI Feedback Message */}
                    {aiFeedback && !isFocused && (
                         <div className="text-sm text-emerald-600 font-medium animate-pulse flex items-center gap-2">
                             <MessageSquare size={14} />
                             {aiFeedback}
                         </div>
                    )}

                     {/* Minimal Feedback in Focus Mode */}
                     {isFocused && (
                        <div className="text-sm text-emerald-300 font-medium truncate max-w-[200px] text-center">
                           {aiFeedback || "Reciting..."}
                        </div>
                    )}

                </div>
            </div>

        </div>
      </div>
    </div>
  );
};
