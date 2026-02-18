import React, { useState, useEffect } from 'react';
// Temporarily disabled: Clerk dependency issue
// import { useUser } from '@clerk/react';
import { LandingPage } from './components/LandingPage';
import { Wizard } from './components/Wizard';
import { CompletionPage } from './components/CompletionPage';
import { Loader2 } from 'lucide-react';
import { RagService } from './services/ragLayer';
import { logger } from './utils/logger';
import type { UserSession, WizardData } from './types/index';

// HACK: Mock useUser for now due to Clerk dependency
const useUser = () => ({ user: null, isLoaded: true });

type ViewType = 'landing' | 'wizard' | 'completion';

interface AppState {
  completedData: WizardData | null;
  isSeeding: boolean;
  seedProgress: { p: number; msg: string };
}

/**
 * Main VICO Application Component
 * Manages routing between landing, wizard, and completion pages
 * Uses Clerk for authentication (session managed automatically)
 */
function App() {
  const { user, isLoaded: clerkLoaded } = useUser();
  const [view, setView] = useState<ViewType>('landing');
  const [appState, setAppState] = useState<AppState>({
    completedData: null,
    isSeeding: false,
    seedProgress: { p: 0, msg: '' },
  });

  // Initialize knowledge base on mount
  useEffect(() => {
    const initializeKnowledge = async (): Promise<void> => {
      try {
        setAppState(prev => ({ ...prev, isSeeding: true }));
        logger.info('Starting knowledge base initialization');
        
        await RagService.autoSeed((progress: number, message: string) => {
          setAppState(prev => ({
            ...prev,
            seedProgress: { p: progress, msg: message },
          }));
        });
        
        logger.info('Knowledge base initialization complete');
      } catch (error) {
        logger.error('Knowledge base initialization failed', error as Error, {
          operation: 'RagService.autoSeed',
        });
      } finally {
        setAppState(prev => ({ ...prev, isSeeding: false }));
      }
    };

    initializeKnowledge();
  }, []);

  const handleWizardComplete = (data: WizardData): void => {
    logger.info('Wizard completed', {
      companyName: data.companyName,
      userId: user?.id,
    });

    // Data persists via database (Clerk + PostgreSQL)
    // No localStorage needed - database handles persistence
    setAppState(prev => ({ ...prev, completedData: data }));
    setView('completion');
  };

  const handleBackToHome = (): void => {
    logger.info('Returning to home', { userId: user?.id });
    
    setAppState(prev => ({ ...prev, completedData: null }));
    setView('landing');
  };

  const loadingOverlay = appState.isSeeding && (
    <div className="fixed bottom-6 right-6 z-[100] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-slide-up max-w-xs">
      <div className="relative w-10 h-10 flex items-center justify-center">
        <Loader2 className="animate-spin text-[#B91C1C]" size={24} />
        <span className="absolute text-[8px] font-black">{appState.seedProgress.p}%</span>
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] font-black uppercase tracking-widest text-[#B91C1C]">
          VICO Intelligence
        </span>
        <span className="text-[9px] text-gray-500 font-bold truncate max-w-[180px]">
          {appState.seedProgress.msg}
        </span>
      </div>
    </div>
  );

  if (!clerkLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <Loader2 className="animate-spin text-[#B91C1C]" size={40} />
      </div>
    );
  }

  return (
    <div className="relative">
      {loadingOverlay}

      {view === 'landing' && (
        <LandingPage 
          onStart={() => setView('wizard')}
          onLoginClick={() => setView('wizard')}
        />
      )}

      {view === 'wizard' && (
        <Wizard 
          onComplete={handleWizardComplete}
          onBack={handleBackToHome}
          onSignInClick={() => setView('wizard')}
        />
      )}

      {view === 'completion' && appState.completedData && (
        <CompletionPage 
          userData={appState.completedData}
          onBack={handleBackToHome}
        />
      )}
    </div>
  );
}

export default App;
