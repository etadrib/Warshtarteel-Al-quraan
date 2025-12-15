import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { MOCK_PROGRESS } from '../constants';
import { AppMode } from '../types';
import { BookOpen, Brain, Trophy, Activity, ArrowRight } from 'lucide-react';

interface DashboardProps {
  setMode: (mode: AppMode) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setMode }) => {
  return (
    <div className="p-6 max-w-7xl mx-auto w-full animate-fade-in flex flex-col h-full overflow-y-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-emerald-900">Assalamu Alaikum, Hafiz</h1>
        <p className="text-gray-500 mt-1">Ready to continue your journey with Warsh narration today?</p>
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
        <div 
            onClick={() => setMode(AppMode.RECITATION)}
            className="group cursor-pointer bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all hover:scale-[1.01]"
        >
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-xl font-bold mb-2">Start Recitation</h2>
                    <p className="text-emerald-100 text-sm mb-4">Practice your Warsh recitation with real-time AI feedback.</p>
                </div>
                <BookOpen className="opacity-80 group-hover:opacity-100 transition-opacity" size={32} />
            </div>
            <div className="flex items-center gap-2 text-sm font-medium bg-white/20 w-fit px-3 py-1.5 rounded-lg backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                Continue Al-Fatiha <ArrowRight size={14} />
            </div>
        </div>

        <div 
            onClick={() => setMode(AppMode.MEMORIZATION)}
            className="group cursor-pointer bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:border-emerald-200 hover:shadow-md transition-all hover:scale-[1.01]"
        >
             <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Memorization Mode</h2>
                    <p className="text-gray-500 text-sm mb-4">Test your memory by hiding verses and revealing them as you speak.</p>
                </div>
                <Brain className="text-emerald-600 opacity-80 group-hover:opacity-100 transition-opacity" size={32} />
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-emerald-700 bg-emerald-50 w-fit px-3 py-1.5 rounded-lg group-hover:bg-emerald-100 transition-colors">
                Start Session <ArrowRight size={14} />
            </div>
        </div>
      </div>

      {/* Progress Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-50">
        <h3 className="text-lg font-bold text-gray-800 mb-6">Weekly Activity</h3>
        <div className="w-full min-h-[300px]" style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
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
