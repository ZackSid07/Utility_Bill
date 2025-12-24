
import React, { useState } from 'react';
import Header from './components/Header';
import UserView from './components/UserView';
import AdminView from './components/AdminView';
import ConfigurationWarning from './components/ConfigurationWarning';
import SetupGuide from './components/SetupGuide';
import { isConfigured } from './supabase/client';

export type View = 'user' | 'admin';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('user');
  const [showSetupGuide, setShowSetupGuide] = useState(!isConfigured);

  const handleCloseGuide = () => {
    setShowSetupGuide(false);
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      {!isConfigured && <ConfigurationWarning />}
      {showSetupGuide && <SetupGuide onClose={handleCloseGuide} />}
      
      <div className="container mx-auto p-4 md:p-8">
        <Header currentView={currentView} setCurrentView={setCurrentView} />
        <main className="mt-8">
          {currentView === 'user' ? <UserView /> : <AdminView />}
        </main>
        <footer className="text-center mt-12 text-gray-500 text-sm">
          <p>Acme AI Fellowship (Cohort V) Project</p>
          <p>Admin-Driven Rule-Engine Utility Bill Calculator</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
