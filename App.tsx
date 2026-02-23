import React, { useState, useEffect, Component, ErrorInfo, ReactNode, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { Wizard } from './components/Wizard';
import { CompletionPage } from './components/CompletionPage';
import { VicoChatBot } from './components/VicoChatBot';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { RagService } from './services/ragLayer';
import { logger } from './utils/logger';
import type { UserSession, WizardData } from './types/index';
import { useAuth, useUser, useClerk } from '@clerk/clerk-react';

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

// Session storage key for wizard data persistence across refresh
const WIZARD_DATA_KEY = 'vico_wizard_data';

function saveWizardData(data: WizardData) {
  try { sessionStorage.setItem(WIZARD_DATA_KEY, JSON.stringify(data)); } catch {}
}
function loadWizardData(): WizardData | null {
  try {
    const raw = sessionStorage.getItem(WIZARD_DATA_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function clearWizardData() {
  try { sessionStorage.removeItem(WIZARD_DATA_KEY); } catch {}
}

interface AppState {
  completedData: WizardData | null;
  isSeeding: boolean;
  seedProgress: { p: number; msg: string };
  user: any;
}

/**
 * Main VICO Application Component
 * URL-based routing: / → /login → /setup → /dashboard/*
 * Auth: Clerk
 */
function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [appState, setAppState] = useState<AppState>({
    completedData: loadWizardData(),
    isSeeding: false,
    seedProgress: { p: 0, msg: '' },
    user: null,
  });

  // Clerk hooks for auth state
  const { isSignedIn, isLoaded: isAuthLoaded, userId } = useAuth();
  const { user: clerkUser } = useUser();
  const clerk = useClerk();

  // Initialize knowledge base on mount (with abort on unmount)
  // ALL hooks must be called before any conditional return (Rules of Hooks)
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

  // Auto-redirect to dashboard if wizard data exists and user lands on /
  useEffect(() => {
    if (appState.completedData && location.pathname === '/') {
      navigate('/dashboard', { replace: true });
    }
  }, [appState.completedData, location.pathname, navigate]);

  const handleLoginSuccess = useCallback((userData: any): void => {
    logger.info('User logged in', { email: userData.email });
    setAppState(prev => ({ ...prev, user: userData }));
    navigate('/setup');
  }, [navigate]);

  const handleWizardComplete = useCallback((data: WizardData): void => {
    logger.info('Wizard completed', { companyName: data.orgName });
    saveWizardData(data);
    setAppState(prev => ({ ...prev, completedData: data }));
    navigate('/dashboard');
  }, [navigate]);

  const handleBackToHome = useCallback((): void => {
    logger.info('Returning to home');
    clearWizardData();
    setAppState(prev => ({ ...prev, completedData: null, user: null }));
    navigate('/');
  }, [navigate]);

  const handleLogout = useCallback(async (): Promise<void> => {
    logger.info('User logged out');
    
    try {
      await clerk.signOut();
    } catch (err) {
      logger.error('Clerk signOut failed', err as Error);
    }
    
    clearWizardData();
    setAppState(prev => ({ ...prev, completedData: null, user: null }));
    navigate('/');
  }, [clerk, navigate]);

  // While Clerk is still loading session from cookies, show a minimal spinner
  // to prevent flash-redirect to /login on refresh
  if (!isAuthLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FDFCFB] dark:bg-[#0B101B]">
        <div className="text-center">
          <Loader2 className="animate-spin text-[#B91C1C] mx-auto mb-3" size={32} />
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Đang khôi phục phiên...</p>
        </div>
      </div>
    );
  }

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

        <Routes>
          <Route path="/" element={
            <LandingPage 
              onStart={() => isSignedIn ? navigate('/setup') : navigate('/login')}
              onLoginClick={() => navigate('/login')}
            />
          } />

          <Route path="/login" element={
            isSignedIn 
              ? <Navigate to={appState.completedData ? '/dashboard' : '/setup'} replace />
              : <LoginPage 
                  onLoginSuccess={handleLoginSuccess}
                  onBack={() => navigate('/')}
                />
          } />

          <Route path="/setup" element={
            !isSignedIn 
              ? <Navigate to="/login" replace />
              : <Wizard 
                  onComplete={handleWizardComplete}
                  onBack={() => navigate('/')}
                />
          } />

          <Route path="/dashboard" element={
            !isSignedIn ? (
              <Navigate to="/login" replace />
            ) : appState.completedData ? (
              <CompletionPage 
                userData={appState.completedData}
                onBack={handleLogout}
              />
            ) : (
              <Navigate to="/setup" replace />
            )
          } />

          <Route path="/dashboard/:tab" element={
            !isSignedIn ? (
              <Navigate to="/login" replace />
            ) : appState.completedData ? (
              <CompletionPage 
                userData={appState.completedData}
                onBack={handleLogout}
              />
            ) : (
              <Navigate to="/setup" replace />
            )
          } />

          {/* Fallback: redirect unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <VicoChatBot />
    </AppErrorBoundary>
  );
}

export default App;
