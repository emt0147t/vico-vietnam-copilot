/**
 * 🏢 Enterprise Dashboard Layout
 * Premium B2B SaaS interface inspired by Linear, Vercel, Bloomberg
 * 
 * Features:
 * - Collapsible sidebar navigation
 * - Command Center (Cmd+K) global search
 * - Responsive split-pane views
 * - Skeleton loading states
 * - Keyboard shortcuts
 */

import React, { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Search, Command, Settings, LogOut,
    ChevronLeft, ChevronRight, User,
    Building2, Newspaper, Target, Database, Zap, X,
    ArrowRight, Clock, TrendingUp, FileText, Globe
} from 'lucide-react';
import { NotificationCenter } from './NotificationCenter';
import { useNotifications } from '../hooks/useNotifications';

// ============================================================================
// TYPES
// ============================================================================

interface NavItem {
    id: string;
    label: string;
    icon: React.ElementType;
    badge?: number;
    shortcut?: string;
}

interface DashboardLayoutProps {
    children: ReactNode;
    activeView: string;
    onViewChange: (view: string) => void;
    userName?: string;
    orgName?: string;
    onLogout?: () => void;
}

interface CommandCenterProps {
    isOpen: boolean;
    onClose: () => void;
    onSearch: (query: string, type: 'company' | 'news' | 'all') => void;
    recentSearches?: string[];
}

// ============================================================================
// CONTEXT
// ============================================================================

interface DashboardContextType {
    isSidebarCollapsed: boolean;
    toggleSidebar: () => void;
    openCommandCenter: () => void;
}

const DashboardContext = createContext<DashboardContextType | null>(null);

export const useDashboard = () => {
    const context = useContext(DashboardContext);
    if (!context) throw new Error('useDashboard must be used within DashboardProvider');
    return context;
};

// ============================================================================
// SKELETON COMPONENTS
// ============================================================================

export const Skeleton = ({ className = '', variant = 'rect' }: { className?: string; variant?: 'rect' | 'circle' | 'text' }) => {
    const baseClass = 'animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]';
    const variantClass = variant === 'circle' ? 'rounded-full' : variant === 'text' ? 'rounded h-4' : 'rounded-lg';
    
    return <div className={`${baseClass} ${variantClass} ${className}`} />;
};

export const CardSkeleton = () => (
    <div className="bg-white rounded-2xl border border-[#E4E4E7] p-6 space-y-4">
        <div className="flex items-center gap-4">
            <Skeleton variant="circle" className="w-12 h-12" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
            </div>
        </div>
        <Skeleton className="h-20 w-full" />
        <div className="flex gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-14" />
        </div>
    </div>
);

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
    <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-[#E4E4E7]">
                <Skeleton variant="circle" className="w-10 h-10 flex-shrink-0" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-16 rounded-full" />
            </div>
        ))}
    </div>
);

// ============================================================================
// COMMAND CENTER (Cmd+K)
// ============================================================================

export const CommandCenter = ({ isOpen, onClose, onSearch, recentSearches = [] }: CommandCenterProps) => {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [searchType, setSearchType] = useState<'all' | 'company' | 'news'>('all');

    const suggestions = [
        { type: 'company' as const, icon: Building2, label: 'Search Companies', shortcut: '⌘1' },
        { type: 'news' as const, icon: Newspaper, label: 'Search News', shortcut: '⌘2' },
        { type: 'all' as const, icon: Globe, label: 'Search Everything', shortcut: '⌘3' },
    ];

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter' && query.trim()) {
            onSearch(query, searchType);
            onClose();
        } else if (e.key === '1' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            setSearchType('company');
        } else if (e.key === '2' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            setSearchType('news');
        } else if (e.key === '3' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            setSearchType('all');
        }
    }, [query, searchType, onSearch, onClose, suggestions.length]);

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [isOpen, handleKeyDown]);

    useEffect(() => {
        if (!isOpen) {
            setQuery('');
            setSelectedIndex(0);
        }
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />
                    
                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-2xl z-50"
                    >
                        <div className="bg-white rounded-2xl shadow-2xl border border-[#E4E4E7] overflow-hidden">
                            {/* Search Input */}
                            <div className="flex items-center gap-4 p-4 border-b border-[#E4E4E7]">
                                <Search className="w-5 h-5 text-[#A1A1AA]" />
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Search companies, news, insights..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="flex-1 bg-transparent text-[#18181B] placeholder-[#A1A1AA] outline-none text-lg"
                                />
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider transition-colors ${
                                        searchType === 'company' ? 'bg-blue-100 text-blue-700' :
                                        searchType === 'news' ? 'bg-green-100 text-green-700' :
                                        'bg-[#F4F4F5] text-[#18181B]'
                                    }`}>
                                        {searchType}
                                    </span>
                                    <button onClick={onClose} className="p-1 hover:bg-[#F4F4F5] rounded">
                                        <X className="w-4 h-4 text-[#A1A1AA]" />
                                    </button>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="p-2">
                                <p className="px-3 py-2 text-xs font-bold text-[#A1A1AA] uppercase tracking-wider">Quick Actions</p>
                                {suggestions.map((item, index) => (
                                    <button
                                        key={item.type}
                                        onClick={() => {
                                            setSearchType(item.type);
                                            if (query.trim()) {
                                                onSearch(query, item.type);
                                                onClose();
                                            }
                                        }}
                                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${
                                            selectedIndex === index
                                                ? 'bg-[#F4F4F5]'
                                                : 'hover:bg-[#FAFAFA]'
                                        }`}
                                    >
                                        <item.icon className="w-5 h-5 text-[#71717A]" />
                                        <span className="flex-1 text-left text-[#18181B] font-medium">
                                            {item.label}
                                        </span>
                                        <span className="text-xs text-[#A1A1AA] font-mono">{item.shortcut}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Recent Searches */}
                            {recentSearches.length > 0 && (
                                <div className="p-2 border-t border-[#E4E4E7]">
                                    <p className="px-3 py-2 text-xs font-bold text-[#A1A1AA] uppercase tracking-wider">Recent</p>
                                    {recentSearches.slice(0, 3).map((search, i) => (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                setQuery(search);
                                                onSearch(search, searchType);
                                                onClose();
                                            }}
                                            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[#FAFAFA] transition-colors"
                                        >
                                            <Clock className="w-4 h-4 text-[#A1A1AA]" />
                                            <span className="text-[#71717A]">{search}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Footer */}
                            <div className="px-4 py-3 bg-[#FAFAFA] border-t border-[#E4E4E7] flex items-center justify-between">
                                <div className="flex items-center gap-4 text-xs text-[#A1A1AA]">
                                    <span className="flex items-center gap-1">
                                        <kbd className="px-1.5 py-0.5 bg-[#E4E4E7] rounded text-[10px] font-mono">↵</kbd>
                                        to search
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <kbd className="px-1.5 py-0.5 bg-[#E4E4E7] rounded text-[10px] font-mono">esc</kbd>
                                        to close
                                    </span>
                                </div>
                                <span className="text-xs text-[#A1A1AA] flex items-center gap-1">
                                    <Zap className="w-3 h-3" /> Powered by VICO AI
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

// ============================================================================
// MAIN DASHBOARD LAYOUT
// ============================================================================

export const DashboardLayout = ({
    children,
    activeView,
    onViewChange,
    userName = 'User',
    orgName = 'Organization',
    onLogout
}: DashboardLayoutProps) => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isSidebarPinned, setIsSidebarPinned] = useState(true);
    const [isCommandCenterOpen, setIsCommandCenterOpen] = useState(false);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);

    // Sidebar hover auto-expand
    const handleSidebarMouseEnter = () => {
        if (!isSidebarPinned && isSidebarCollapsed) {
            setIsSidebarCollapsed(false);
        }
    };
    const handleSidebarMouseLeave = () => {
        if (!isSidebarPinned) {
            setIsSidebarCollapsed(true);
        }
    };

    // 🔔 Notification system
    const {
        notifications, unreadCount, isLoading: notifsLoading,
        markAsRead, markAllAsRead, dismiss, clearAll, refresh: refreshNotifs,
    } = useNotifications(orgName);

    const navItems: NavItem[] = [
        { id: 'overview', label: 'Dashboard', icon: LayoutDashboard, shortcut: '⌘D' },
        { id: 'companies', label: 'Companies', icon: Building2, badge: 10224, shortcut: '⌘C' },
        { id: 'news', label: 'News Center', icon: Newspaper, shortcut: '⌘N' },
        { id: 'gtm', label: 'GTM Strategy', icon: Target, shortcut: '⌘G' },
        { id: 'rivals', label: 'Competitor Intel', icon: TrendingUp, shortcut: '⌘R' },
        { id: 'knowledge', label: 'Knowledge Base', icon: Database, shortcut: '⌘K' },
    ];

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Cmd+K or Ctrl+K for command center
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsCommandCenterOpen(true);
            }
            // Cmd+B to toggle sidebar
            if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
                e.preventDefault();
                setIsSidebarCollapsed(prev => {
                    const willCollapse = !prev;
                    setIsSidebarPinned(!willCollapse);
                    return willCollapse;
                });
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleSearch = (query: string, type: 'company' | 'news' | 'all') => {
        setRecentSearches(prev => [query, ...prev.filter(s => s !== query)].slice(0, 5));
        console.log(`Searching for "${query}" in ${type}`);
        // Trigger actual search
    };

    const contextValue: DashboardContextType = {
        isSidebarCollapsed,
        toggleSidebar: () => setIsSidebarCollapsed(prev => !prev),
        openCommandCenter: () => setIsCommandCenterOpen(true),
    };

    return (
        <DashboardContext.Provider value={contextValue}>
            <div className="flex h-screen bg-[#FAFAFA] transition-colors duration-300">
                {/* Sidebar */}
                <motion.aside
                    animate={{ width: isSidebarCollapsed ? 80 : 280 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="bg-white border-r border-[#E4E4E7] flex flex-col z-30"
                    onMouseEnter={handleSidebarMouseEnter}
                    onMouseLeave={handleSidebarMouseLeave}
                >
                    {/* Logo */}
                    <div className="h-16 flex items-center justify-between px-4 border-b border-[#E4E4E7]">
                        <AnimatePresence mode="wait">
                            {!isSidebarCollapsed ? (
                                <motion.div
                                    key="full-logo"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-center gap-3"
                                >
                                    <img src="/logo.png" alt="VICO" className="w-10 h-10 rounded-xl object-cover shadow-lg" />
                                    <div>
                                        <h1 className="font-black text-[#18181B] tracking-tight">VICO</h1>
                                        <p className="text-[10px] text-[#A1A1AA] font-semibold uppercase tracking-widest">Vietnam Copilot</p>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="mini-logo"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="mx-auto"
                                >
                                    <img src="/logo.png" alt="VICO" className="w-10 h-10 rounded-xl object-cover shadow-lg" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                        
                        <button
                            onClick={() => {
                                const willCollapse = !isSidebarCollapsed;
                                setIsSidebarCollapsed(willCollapse);
                                // If user manually expands, pin it; if manually collapses, unpin for hover mode
                                setIsSidebarPinned(!willCollapse);
                            }}
                            className="p-1.5 hover:bg-[#F4F4F5] rounded-lg transition-colors"
                            title={isSidebarCollapsed ? 'Expand sidebar (hover to preview)' : 'Collapse sidebar'}
                        >
                            {isSidebarCollapsed ? (
                                <ChevronRight className="w-4 h-4 text-[#A1A1AA]" />
                            ) : (
                                <ChevronLeft className="w-4 h-4 text-[#A1A1AA]" />
                            )}
                        </button>
                    </div>

                    {/* Search Trigger */}
                    <div className="px-3 py-4">
                        <button
                            onClick={() => setIsCommandCenterOpen(true)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 bg-[#FAFAFA] hover:bg-[#F4F4F5] rounded-xl border border-[#E4E4E7] transition-colors ${
                                isSidebarCollapsed ? 'justify-center' : ''
                            }`}
                        >
                            <Search className="w-4 h-4 text-[#A1A1AA]" />
                            {!isSidebarCollapsed && (
                                <>
                                    <span className="flex-1 text-left text-sm text-[#A1A1AA]">Search...</span>
                                    <kbd className="px-1.5 py-0.5 bg-[#E4E4E7] rounded text-[10px] font-mono text-[#71717A]">⌘K</kbd>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => onViewChange(item.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                                    activeView === item.id
                                        ? 'bg-red-50 text-red-700'
                                        : 'text-[#71717A] hover:bg-[#FAFAFA] hover:text-[#18181B]'
                                } ${isSidebarCollapsed ? 'justify-center' : ''}`}
                            >
                                <item.icon className={`w-5 h-5 flex-shrink-0 ${
                                    activeView === item.id ? 'text-red-600' : ''
                                }`} />
                                {!isSidebarCollapsed && (
                                    <>
                                        <span className="flex-1 text-left font-medium text-sm">{item.label}</span>
                                        {item.badge && (
                                            <span className="px-2 py-0.5 bg-[#F4F4F5] rounded-full text-[10px] font-bold text-[#71717A]">
                                                {item.badge.toLocaleString()}
                                            </span>
                                        )}
                                    </>
                                )}
                            </button>
                        ))}
                    </nav>

                    {/* Footer */}
                    <div className="p-3 border-t border-[#E4E4E7] space-y-2">
                        {/* User Profile */}
                        <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#FAFAFA] ${
                            isSidebarCollapsed ? 'justify-center' : ''
                        }`}>
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                {userName.charAt(0).toUpperCase()}
                            </div>
                            {!isSidebarCollapsed && (
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-[#18181B] truncate">{userName}</p>
                                    <p className="text-[10px] text-[#A1A1AA] truncate">{orgName}</p>
                                </div>
                            )}
                        </div>

                        {/* Logout */}
                        {onLogout && (
                            <button
                                onClick={onLogout}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#71717A] hover:bg-red-50 hover:text-red-600 transition-colors ${
                                    isSidebarCollapsed ? 'justify-center' : ''
                                }`}
                            >
                                <LogOut className="w-5 h-5" />
                                {!isSidebarCollapsed && <span className="font-medium text-sm">Sign Out</span>}
                            </button>
                        )}
                    </div>
                </motion.aside>

                {/* Main Content */}
                <main className="flex-1 flex flex-col overflow-hidden">
                    {/* Top Bar */}
                    <header className="h-16 bg-white border-b border-[#E4E4E7] flex items-center justify-between px-6">
                        <div className="flex items-center gap-4">
                            <h2 className="text-lg font-bold text-[#18181B] capitalize">
                                {navItems.find(n => n.id === activeView)?.label || 'Dashboard'}
                            </h2>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <NotificationCenter
                                notifications={notifications}
                                unreadCount={unreadCount}
                                isLoading={notifsLoading}
                                onMarkAsRead={markAsRead}
                                onMarkAllAsRead={markAllAsRead}
                                onDismiss={dismiss}
                                onClearAll={clearAll}
                                onRefresh={refreshNotifs}
                            />
                            <button className="p-2 hover:bg-[#F4F4F5] rounded-xl transition-colors">
                                <Settings className="w-5 h-5 text-[#71717A]" />
                            </button>
                        </div>
                    </header>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {children}
                    </div>
                </main>

                {/* Command Center Modal */}
                <CommandCenter
                    isOpen={isCommandCenterOpen}
                    onClose={() => setIsCommandCenterOpen(false)}
                    onSearch={handleSearch}
                    recentSearches={recentSearches}
                />
            </div>
        </DashboardContext.Provider>
    );
};

export default DashboardLayout;
