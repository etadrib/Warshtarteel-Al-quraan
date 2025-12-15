import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { RecitationMode } from './components/RecitationMode';
import { MemorizationMode } from './components/MemorizationMode';
import { AppMode } from './types';
import { Layout } from 'lucide-react';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.DASHBOARD);
  
  // Strictly following instructions: API Key from process.env.API_KEY
  // If undefined in development, the app will show errors in console/UI but we don't ask user.
  const apiKey = process.env.API_KEY || ''; 

  const renderContent = () => {
    switch (mode) {
      case AppMode.RECITATION:
        return <RecitationMode onBack={() => setMode(AppMode.DASHBOARD)} apiKey={apiKey} />;
      case AppMode.MEMORIZATION:
        return <MemorizationMode onBack={() => setMode(AppMode.DASHBOARD)} apiKey={apiKey} />;
      case AppMode.DASHBOARD:
      default:
        return <Dashboard setMode={setMode} />;
    }
  };

  return (
    <div className="h-full w-full bg-sand-50 text-gray-900 font-sans">
       {/* Small warning if no API key is detected, just for developer sanity in preview */}
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
