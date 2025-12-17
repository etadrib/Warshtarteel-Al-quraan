
import React, { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { RecitationMode } from './components/RecitationMode';
// MemorizationMode component is kept for the specific "flashcard" style testing if needed, 
// but Dashboard now routes mainly to RecitationMode with different params.
import { MemorizationMode } from './components/MemorizationMode'; 
import { AppMode } from './types';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.DASHBOARD);
  const [navParams, setNavParams] = useState<{page: number, surahId?: number} | null>(null);
  
  const apiKey = process.env.API_KEY || ''; 

  const handleNavigate = (targetMode: AppMode, page: number, surahId?: number) => {
    setNavParams({ page, surahId });
    setMode(targetMode);
  };

  const renderContent = () => {
    switch (mode) {
      case AppMode.RECITATION_TEST:
      case AppMode.TAJWEED_PRACTICE:
        return <RecitationMode 
                  onBack={() => setMode(AppMode.DASHBOARD)} 
                  apiKey={apiKey} 
                  initialPage={navParams?.page || 1}
                  initialSurahId={navParams?.surahId}
                  mode={mode}
               />;
      // Keep old memorization mode accessible if needed via settings or legacy links, 
      // though Dashboard now points to RECITATION_TEST
      case AppMode.MEMORIZATION: 
        return <MemorizationMode onBack={() => setMode(AppMode.DASHBOARD)} apiKey={apiKey} />;
      case AppMode.DASHBOARD:
      default:
        return <Dashboard setMode={setMode} onNavigate={handleNavigate} apiKey={apiKey} />;
    }
  };

  return (
    <div className="h-full w-full bg-sand-50 text-gray-900 font-sans">
       {!apiKey && (
         <div className="bg-red-500 text-white text-xs p-1 text-center">
           Warning: process.env.API_KEY is missing. AI features will not work.
         </div>
       )}
       {renderContent()}
    </div>
  );
};

export default App;
