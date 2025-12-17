
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { MOCK_PROGRESS, SURAH_LIST, QURAN_CONTENT } from '../constants';
import { AppMode, Surah } from '../types';
import { BookOpen, Brain, Trophy, Activity, ArrowRight, Mic, Search, Mic2 } from 'lucide-react';
import { LiveTutor } from './LiveTutor';

interface DashboardProps {
  setMode: (mode: AppMode) => void;
  // Callback to navigate to specific surah/page
  onNavigate: (mode: AppMode, page: number, surahId?: number) => void;
  apiKey: string;
}

const normalizeArabic = (text: string) => {
  if (!text) return "";
  return text
    .replace(/([^\u0621-\u064A\u0660-\u0669a-zA-Z\s])/g, '')
    .replace(/(آ|إ|أ)/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/\s+/g, ' ')
    .trim();
};

export const Dashboard: React.FC<DashboardProps> = ({ setMode, onNavigate, apiKey }) => {
  const [isQuickReciting, setIsQuickReciting] = useState(false);
  const [quickReciteFeedback, setQuickReciteFeedback] = useState("");

  const handleQuickReciteTranscript = (text: string) => {
     // Check if the text matches any verse in our database
     const normalizedInput = normalizeArabic(text);
     
     // Needs a minimum length to be a valid search to avoid false positives
     if (normalizedInput.length < 10) return;

     const match = QURAN_CONTENT.find(v => {
         const normVerse = normalizeArabic(v.text);
         return normVerse.includes(normalizedInput) || normalizedInput.includes(normVerse);
     });

     if (match) {
         setQuickReciteFeedback(`Found: Surah ${SURAH_LIST.find(s=>s.id===match.surahId)?.transliteration}`);
         // Small delay to let user see feedback
         setTimeout(() => {
             // Default to Tajweed mode for quick jumping
             onNavigate(AppMode.TAJWEED_PRACTICE, match.page, match.surahId);
         }, 1000);
     }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto w-full animate-fade-in flex flex-col h-full overflow-y-auto bg-sand-50">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-emerald-900">Warsh Quran Assistant</h1>
            <p className="text-gray-500 mt-1">Master your recitation and memorization.</p>
        </div>
        
        {/* Quick Recite Button */}
        <div className="relative w-full md:w-auto">
            {isQuickReciting ? (
                <div className="bg-white p-3 rounded-2xl shadow-lg border border-emerald-200 flex flex-col gap-2 min-w-[300px] animate-in fade-in zoom-in">
                    <div className="flex items-center justify-between">
                         <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Listening...</span>
                         <button onClick={() => setIsQuickReciting(false)} className="text-xs text-gray-400 hover:text-red-500">Cancel</button>
                    </div>
                    <LiveTutor 
                        apiKey={apiKey}
                        // Dummy props for this mode
                        activeSurah={SURAH_LIST[0]} 
                        mode={AppMode.TAJWEED_PRACTICE}
                        onTranscriptUpdate={handleQuickReciteTranscript}
                        onFeedbackUpdate={() => {}}
                    />
                    <div className="text-center text-sm font-medium text-gray-700 min-h-[20px]">
                        {quickReciteFeedback || "Recite any verse to jump..."}
                    </div>
                </div>
            ) : (
                <button 
                    onClick={() => setIsQuickReciting(true)}
                    className="flex items-center gap-2 bg-white hover:bg-emerald-50 text-emerald-700 font-medium py-3 px-6 rounded-full border border-emerald-200 shadow-sm transition-all hover:shadow-md w-full md:w-auto"
                >
                    <Mic size={20} />
                    <span>Quick Recite / Search</span>
                </button>
            )}
        </div>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-50 flex items-center gap-4">
          <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600">
            <Trophy size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Memorized Verses</p>
            <p className="text-2xl font-bold text-gray-900">1,240</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-50 flex items-center gap-4">
           <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Avg. Accuracy</p>
            <p className="text-2xl font-bold text-gray-900">92%</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-50 flex items-center gap-4">
           <div className="p-3 bg-orange-100 rounded-xl text-orange-600">
            <Brain size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Daily Streak</p>
            <p className="text-2xl font-bold text-gray-900">12 Days</p>
          </div>
        </div>
      </div>

      {/* Main Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Tajweed Mode Card */}
        <div 
            onClick={() => onNavigate(AppMode.TAJWEED_PRACTICE, 1, 1)} 
            className="group cursor-pointer bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all hover:scale-[1.01]"
        >
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-xl font-bold mb-2">Tajweed Mode</h2>
                    <p className="text-emerald-100 text-sm mb-4">Read with text visible. AI corrects pronunciation and Tajweed rules.</p>
                </div>
                <BookOpen className="opacity-80 group-hover:opacity-100 transition-opacity" size={32} />
            </div>
            <div className="flex items-center gap-2 text-sm font-medium bg-white/20 w-fit px-3 py-1.5 rounded-lg backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                Start Reading <ArrowRight size={14} />
            </div>
        </div>

        {/* Recitation (Memorization) Mode Card */}
        <div 
            onClick={() => onNavigate(AppMode.RECITATION_TEST, 1, 1)}
            className="group cursor-pointer bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:border-emerald-200 hover:shadow-md transition-all hover:scale-[1.01]"
        >
             <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Recitation Mode</h2>
                    <p className="text-gray-500 text-sm mb-4">Test your memory. Text hidden by default. AI corrects words.</p>
                </div>
                <Mic2 className="text-emerald-600 opacity-80 group-hover:opacity-100 transition-opacity" size={32} />
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-emerald-700 bg-emerald-50 w-fit px-3 py-1.5 rounded-lg group-hover:bg-emerald-100 transition-colors">
                Start Testing <ArrowRight size={14} />
            </div>
        </div>
      </div>

      {/* Progress Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-50">
        <h3 className="text-lg font-bold text-gray-800 mb-6">Weekly Activity</h3>
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart data={MOCK_PROGRESS}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af'}} />
              <YAxis hide />
              <Tooltip 
                cursor={{fill: '#f3f4f6'}}
                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
              />
              <Bar dataKey="accuracy" radius={[4, 4, 0, 0]}>
                {MOCK_PROGRESS.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.accuracy > 90 ? '#10b981' : '#34d399'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
