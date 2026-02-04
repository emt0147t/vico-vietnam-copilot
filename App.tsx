import React, { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { Wizard } from './components/Wizard';
import { CompletionPage } from './components/CompletionPage';
import { LoginPage } from './components/LoginPage';
import { Loader2 } from 'lucide-react';
import { RagService } from './services/ragLayer';

function App() {
  const [view, setView] = useState<'landing' | 'login' | 'wizard' | 'completion'>('landing');
  const [completedData, setCompletedData] = useState<any>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedProgress, setSeedProgress] = useState({ p: 0, msg: '' });

  // Khởi tạo kho tri thức VICO khi App mount
  useEffect(() => {
    const initKnowledge = async () => {
        // Fix: API key availability is handled externally; no manual check or user-facing prompt is permitted as per guidelines.
        try {
            setIsSeeding(true);
            await RagService.autoSeed((p, msg) => {
                setSeedProgress({ p, msg });
            });
        } catch (e) {
            console.error("Knowledge Seeding Failed", e);
        } finally {
            setIsSeeding(false);
        }
    };
    initKnowledge();
  }, []);

  useEffect(() => {
    const savedSession = localStorage.getItem('vico_active_session');
    if (savedSession) {
      try {
        const parsedData = JSON.parse(savedSession);
        if (parsedData && parsedData.orgName) {
            setCompletedData(parsedData);
            setView('completion');
        }
      } catch (e) {
        console.error("Failed to restore session", e);
        localStorage.removeItem('vico_active_session');
      }
    }
  }, []);

  const handleWizardComplete = (data: any) => {
    const cleanData = { ...data, uploadedFiles: [] };
    localStorage.setItem('vico_active_session', JSON.stringify(cleanData));
    setCompletedData(data);
    setView('completion');
  };

  const handleLoginSuccess = (data: any) => {
      localStorage.setItem('vico_active_session', JSON.stringify(data));
      setCompletedData(data);
      setView('completion');
  };

  const handleBackToHome = () => {
    localStorage.removeItem('vico_active_session');
    setCompletedData(null);
    setView('landing');
  };

  return (
    <div className="relative">
      {/* Overlay loading khi đang nạp tri thức lần đầu */}
      {isSeeding && (
          <div className="fixed bottom-6 right-6 z-[100] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-slide-up max-w-xs">
              <div className="relative w-10 h-10 flex items-center justify-center">
                  <Loader2 className="animate-spin text-[#B91C1C]" size={24} />
                  <span className="absolute text-[8px] font-black">{seedProgress.p}%</span>
              </div>
              <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#B91C1C]">VICO Intelligence</span>
                  <span className="text-[9px] text-gray-500 font-bold truncate max-w-[180px]">{seedProgress.msg}</span>
              </div>
          </div>
      )}

      {view === 'landing' && (
        <LandingPage 
            onStart={() => setView('wizard')} 
            onLoginClick={() => setView('login')}
        />
      )}
      
      {view === 'login' && (
          <LoginPage 
            onLoginSuccess={handleLoginSuccess}
            onSignupClick={() => setView('wizard')}
            onBack={() => setView('landing')}
          />
      )}
      
      {view === 'wizard' && (
        <Wizard 
            onComplete={handleWizardComplete} 
            onBack={handleBackToHome} 
            onSignInClick={() => setView('login')}
        />
      )}

      {view === 'completion' && (
        <CompletionPage userData={completedData} onBack={handleBackToHome} />
      )}
    </div>
  );
}

export default App;