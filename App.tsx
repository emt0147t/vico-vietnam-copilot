import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { Wizard } from './components/Wizard';
import { CompletionPage } from './components/CompletionPage';
import { VicoChatBot } from './components/VicoChatBot';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { RagService } from './services/ragLayer';
import { logger } from './utils/logger';
import type { UserSession, WizardData } from './types/index';

// --- Error Boundary ---
interface ErrorBoundaryState { hasError: boolean; error?: Error }
class AppErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  componentDidCatch(error: Error, info: ErrorInfo) { logger.error('React Error Boundary caught error', error, { componentStack: info.componentStack }); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-[#0B101B] p-8 text-center">
          <AlertTriangle className="text-[#B91C1C] mb-4" size={48} />
          <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Đã xảy ra lỗi</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md text-sm">{this.state.error?.message || 'Ứng dụng gặp lỗi không mong muốn.'}</p>
          <button onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
            className="flex items-center gap-2 px-6 py-3 bg-[#B91C1C] hover:bg-red-700 text-white font-bold rounded-xl transition-all">
            <RefreshCw size={16} /> Tải lại trang
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

type ViewType = 'landing' | 'login' | 'wizard' | 'completion';

interface AppState {
  completedData: WizardData | null;
  isSeeding: boolean;
  seedProgress: { p: number; msg: string };
  user: any;
}

/**
 * Main VICO Application Component
 * Full routing: Landing → Login → Wizard → Dashboard
 */
function App() {
  const [view, setView] = useState<ViewType>('landing');
  const [appState, setAppState] = useState<AppState>({
    completedData: null,
    isSeeding: false,
    seedProgress: { p: 0, msg: '' },
    user: null,
  });

  // Initialize knowledge base on mount (with abort on unmount)
  useEffect(() => {
    let cancelled = false;
    const initializeKnowledge = async (): Promise<void> => {
      try {
        setAppState(prev => ({ ...prev, isSeeding: true }));
        logger.info('Starting knowledge base initialization');
        
        await RagService.autoSeed((progress: number, message: string) => {
          if (!cancelled) {
            setAppState(prev => ({
              ...prev,
              seedProgress: { p: progress, msg: message },
            }));
          }
        });
        
        if (!cancelled) logger.info('Knowledge base initialization complete');
      } catch (error) {
        if (!cancelled) {
          logger.error('Knowledge base initialization failed', error as Error, {
            operation: 'RagService.autoSeed',
          });
        }
      } finally {
        if (!cancelled) setAppState(prev => ({ ...prev, isSeeding: false }));
      }
    };

    initializeKnowledge();
    return () => { cancelled = true; };
  }, []);

  const handleLoginSuccess = (userData: any): void => {
    logger.info('User logged in', { email: userData.email });
    setAppState(prev => ({ ...prev, user: userData }));
    setView('wizard');
  };

  const handleWizardComplete = (data: WizardData): void => {
    logger.info('Wizard completed', { companyName: data.companyName });
    setAppState(prev => ({ ...prev, completedData: data }));
    setView('completion');
  };

  const handleBackToHome = (): void => {
    logger.info('Returning to home');
    setAppState(prev => ({ ...prev, completedData: null, user: null }));
    setView('landing');
  };

  const handleLogout = (): void => {
    logger.info('User logged out');
    setAppState(prev => ({ ...prev, completedData: null, user: null }));
    setView('landing');
  };

  const loadingOverlay = appState.isSeeding && (
    <div className="fixed bottom-6 left-6 z-[100] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-fade-in max-w-xs">
      <div className="relative w-10 h-10 flex items-center justify-center">
        <Loader2 className="animate-spin text-[#B91C1C]" size={24} />
        <span className="absolute text-[8px] font-black text-gray-900 dark:text-white">{appState.seedProgress.p}%</span>
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] font-black uppercase tracking-widest text-[#B91C1C]">
          VICO Intelligence
        </span>
        <span className="text-[10px] text-gray-500 font-bold truncate max-w-[180px]">
          {appState.seedProgress.msg}
        </span>
      </div>
    </div>
  );

  return (
    <AppErrorBoundary>
      <div className="relative">
        {loadingOverlay}

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
            onBack={handleBackToHome}
          />
        )}

        {view === 'wizard' && (
          <Wizard 
            onComplete={handleWizardComplete}
            onBack={handleBackToHome}
          />
        )}

        {view === 'completion' && appState.completedData && (
          <CompletionPage 
            userData={appState.completedData}
            onBack={handleLogout}
          />
        )}
      </div>
      <VicoChatBot />
    </AppErrorBoundary>
  );
}

export default App;
