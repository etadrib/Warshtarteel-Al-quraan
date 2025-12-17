import React, { useState, useMemo } from 'react';
import { Surah, AppMode } from '../types';
import { SURAH_LIST, QURAN_CONTENT } from '../constants';
import { LiveTutor } from './LiveTutor';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

interface MemorizationModeProps {
  onBack: () => void;
  apiKey: string;
}

export const MemorizationMode: React.FC<MemorizationModeProps> = ({ onBack, apiKey }) => {
  // Default to a surah that has content (e.g. Al-Ikhlas id 112), or the first one
  const [activeSurah, setActiveSurah] = useState<Surah>(
    SURAH_LIST.find(s => s.id === 112) || SURAH_LIST[0]
  ); 
  const [revealedVerses, setRevealedVerses] = useState<number[]>([]);
  const [transcript, setTranscript] = useState('');
  const [aiFeedback, setAiFeedback] = useState('Recite to reveal verses...');
  const [isAllRevealed, setIsAllRevealed] = useState(false);

  const activeVerses = useMemo(() => {
    return QURAN_CONTENT
      .filter(v => v.surahId === activeSurah.id)
      .sort((a, b) => a.id - b.id);
  }, [activeSurah.id]);

  const toggleReveal = (id: number) => {
    setRevealedVerses(prev => 
      prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
    );
  };

  const revealAll = () => {
    if (isAllRevealed) {
      setRevealedVerses([]);
    } else {
      setRevealedVerses(activeVerses.map(v => v.id));
    }
    setIsAllRevealed(!isAllRevealed);
  };

  return (
    <div className="flex flex-col h-full bg-emerald-50/30">
       {/* Top Bar */}
       <div className="bg-white px-4 py-3 shadow-sm flex items-center justify-between z-10">
        <button onClick={onBack} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex flex-col items-center">
            <h2 className="font-bold text-gray-900">Memorization Test</h2>
            <span className="text-xs text-emerald-600 font-medium">{activeSurah.transliteration}</span>
        </div>
        <button 
            onClick={revealAll}
            className={`p-2 rounded-full transition-colors ${isAllRevealed ? 'text-emerald-600 bg-emerald-50' : 'text-gray-400 hover:bg-gray-100'}`}
        >
          {isAllRevealed ? <Eye size={20} /> : <EyeOff size={20} />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-40">
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex justify-center gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
                {SURAH_LIST.map(s => (
                    <button
                        key={s.id}
                        onClick={() => { setActiveSurah(s); setRevealedVerses([]); setIsAllRevealed(false); }}
                        className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${activeSurah.id === s.id ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200'}`}
                    >
                        {s.transliteration}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-sm border border-emerald-100 min-h-[50vh] flex flex-col items-center justify-center relative overflow-hidden" dir="rtl">
                {/* Background Pattern */}
                <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none" 
                     style={{backgroundImage: 'radial-gradient(#059669 1px, transparent 1px)', backgroundSize: '20px 20px'}}>
                </div>

                <div className="space-y-10 w-full z-10">
                     {activeVerses.map((verse) => {
                         const isRevealed = revealedVerses.includes(verse.id);
                         return (
                            <div 
                                key={verse.id} 
                                onClick={() => toggleReveal(verse.id)}
                                className={`
                                    relative transition-all duration-500 cursor-pointer p-4 rounded-xl
                                    ${isRevealed ? 'bg-transparent' : 'bg-gray-50 hover:bg-gray-100'}
                                `}
                            >
                                <div className={`
                                    font-quran text-3xl md:text-4xl text-center leading-loose transition-all duration-500
                                    ${isRevealed ? 'text-gray-800 blur-0' : 'text-transparent blur-md select-none'}
                                `}>
                                    {verse.text}
                                </div>
                                
                                {!isRevealed && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <EyeOff className="text-gray-300 opacity-50" size={32} />
                                    </div>
                                )}
                            </div>
                         );
                     })}
                     {activeVerses.length === 0 && (
                       <div className="text-gray-400 text-center">No verses available for this Surah in demo.</div>
                     )}
                </div>
            </div>
        </div>
      </div>

       {/* Bottom Control Panel */}
       <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-emerald-100 p-4 z-20">
         <div className="max-w-2xl mx-auto">
             <LiveTutor 
                apiKey={apiKey} 
                activeSurah={activeSurah} 
                onTranscriptUpdate={setTranscript}
                onFeedbackUpdate={(fb) => {
                    setAiFeedback(fb);
                    // Simple logic to simulate auto-reveal based on positive feedback
                    if (fb.toLowerCase().includes('correct') || fb.toLowerCase().includes('mumtaz')) {
                        // reveal next unrevealed verse
                        const nextId = activeVerses.find(v => !revealedVerses.includes(v.id))?.id;
                        if (nextId) setRevealedVerses(prev => [...prev, nextId]);
                    }
                }}
                mode={AppMode.MEMORIZATION}
            />
            <div className="mt-2 text-center">
                <p className="text-emerald-700 text-sm font-medium animate-pulse">{aiFeedback}</p>
            </div>
         </div>
      </div>
    </div>
  );
};