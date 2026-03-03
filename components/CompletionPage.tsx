
import { useState, useMemo, useEffect, useCallback } from 'react';
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Database, Swords, LogOut, ExternalLink, 
    Newspaper, Target, LineChart, FileText,
    Loader2, Calendar, Rocket, Menu, X
} from 'lucide-react';
import { getCompanyNews } from '../services/newsService';
import { DataPipeline } from './DataPipeline';
import { loadFromDB } from '../utils/db';
import { ThemeToggle } from './ThemeToggle';
import { Logo, StatCard, PremiumCard, Badge } from './VicoUI';
import { GTMStrategyPanel } from './GTMStrategyPanel';
import GTMPlaybookBuilder from './GTMPlaybookBuilder';
import ICPBuilder from './ICPBuilder';
import ExecutiveWorkspace from './ExecutiveWorkspace';
import { CompetitorComparisonDashboard } from './CompetitorComparison';
import { PremiumCompetitorDashboard } from './PremiumCompetitorDashboard';
import { MarketIndustryPage } from './MarketIndustryPage';
import { CompetitorAnalysisPage } from './CompetitorAnalysisPage';
import { CustomerInsightsPage } from './CustomerInsightsPage';
import { NewsIntelligencePage } from './NewsIntelligencePage';
import { NotificationCenter } from './NotificationCenter';
import { useNotifications } from '../hooks/useNotifications';

interface CompletionPageProps { userData: any; onBack: () => void; }

// Component to display related news (Live RSS Feeds from Google News)
export const NewsFeed = ({ query, limit = 6 }: { query: string, limit?: number }) => {
    const [news, setNews] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchNews = async () => {
            if (!query || !query.trim()) return;
            setLoading(true);
            setError(null);
            try {
                // 🆕 Fetch live news from backend RSS feeds (Google News)
                const liveNews = await getCompanyNews(query);
                setNews(liveNews.slice(0, limit));
            } catch (e) { 
                console.error('❌ News fetch error:', e);
                setError('Unable to load news at this time');
            } finally { 
                setLoading(false); 
            }
        };
        fetchNews();
    }, [query, limit]);

    if (loading) return <div className="flex items-center gap-3 p-8 text-[#A1A1AA] font-bold uppercase text-[10px] tracking-widest"><Loader2 className="animate-spin" size={16}/> Scanning latest news...</div>;
    
    if (error) return <div className="flex items-center gap-3 p-8 text-amber-600 font-bold uppercase text-[10px] tracking-widest" role="alert">⚠️ {error}</div>;
    
    if (news.length === 0) return null;

    return (
        <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase text-[#E11D48] tracking-[0.2em] flex items-center gap-2 mb-4">
                <Newspaper size={14}/> 📰 Latest News from Google News (Real-time Updates)
            </h4>
            <div className="grid gap-4">
                {news.map((item, i) => (
                    <div key={item.guid || i} className="bg-white p-4 rounded-2xl border border-[#E4E4E7] hover:border-[#E11D48]/30 transition-all group cursor-pointer">
                        <div className="flex justify-between items-start mb-2">
                            <h5 className="text-xs font-black text-[#18181B] group-hover:text-[#E11D48] transition-colors line-clamp-2 flex-1">{item.title}</h5>
                            {item.link && <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-[#A1A1AA] hover:text-[#E11D48] ml-2 flex-shrink-0"><ExternalLink size={12}/></a>}
                        </div>
                        <p className="text-[11px] text-[#71717A] line-clamp-2 leading-relaxed mb-3">{item.content || 'No preview available'}</p>
                        <div className="flex items-center gap-4 text-[9px] font-black text-[#A1A1AA] uppercase tracking-widest">
                            <span className="flex items-center gap-1"><Calendar size={10}/> {new Date(item.pubDate).toLocaleDateString('en-US')}</span>
                            <span className="bg-[#FFF1F2] text-[#E11D48] px-2 py-0.5 rounded text-[8px] font-semibold">{item.source || 'Google News'}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const CompletionPage: React.FC<CompletionPageProps> = ({ userData, onBack }) => {
  const { tab } = useParams<{ tab?: string }>();
  const navigate = useNavigate();
  
  const validTabs = ['market-industry', 'news-intelligence', 'competitor-analysis', 'customer-insights', 'icp-builder', 'go-to-market', 'playbook', 'operational', 'pipeline', 'workspace'];
  const activeTab = tab && validTabs.includes(tab) ? tab : 'market-industry';
  
  const setActiveTab = useCallback((newTab: string) => {
    navigate(`/dashboard/${newTab}`, { replace: true });
  }, [navigate]);
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true); // Start collapsed on mobile
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dbCount, setDbCount] = useState(0);

  // True when sidebar labels should be visible (expanded on desktop, or mobile menu open)
  const showLabels = isMobileMenuOpen || !isSidebarCollapsed;

  // 🔔 Notification system — auto-fetch from Google News RSS
  const competitorNames = useMemo(() => 
    (userData.competitors?.filter((c: any) => c.selected)?.map((c: any) => c.name) || []) as string[],
    [userData.competitors]
  );
  const {
    notifications, unreadCount, isLoading: notifsLoading,
    markAsRead, markAllAsRead, dismiss, clearAll, refresh: refreshNotifs,
  } = useNotifications(userData.orgName, competitorNames);

  // Close mobile menu on window resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const hydrate = async () => {
        const vectors = await loadFromDB('vectors');
        setDbCount(vectors.length);
    };
    hydrate();
  }, []);

  const tabLabels: Record<string, string> = {
    'market-industry': 'Market & Industry',
    'news-intelligence': 'News Intelligence',
    'competitor-analysis': 'Competitor Analysis',
    'customer-insights': 'Customer Insights',
    'icp-builder': 'ICP Builder',
    'go-to-market': 'GTM Strategy',
    'playbook': 'GTM Playbook Builder',
    'operational': 'Operations',
    'pipeline': 'Knowledge Base',
    'workspace': 'Executive Workspace',
  };

  const pulseList = useMemo(() => {
      const list = [
          {
              name: userData.orgName,
              year: 2024,
              size: userData.orgSize || "N/A",
              rep: userData.firstName + " " + userData.lastName,
              address: "Vietnam",
              tax_id: "N/A",
              intro: userData.companyDescription,
              products: userData.productsServices,
              customers: "N/A",
              similarity: 100
          }
      ];
      if (userData.competitors) {
          userData.competitors.filter((c:any) => c.selected).forEach((c:any) => {
              list.push(c);
          });
      }
      return list;
  }, [userData]);

  return (
    <div className="flex h-screen bg-[#FAFAFA] font-sans">
      {/* Mobile sidebar overlay - closes menu on tap */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden animate-fade-in" 
          onClick={() => setIsMobileMenuOpen(false)} 
        />
      )}
      
      {/* Sidebar: on mobile it's a slide-over panel, on desktop it's inline */}
      <aside className={`
        bg-white border-r border-[#E4E4E7]
        transition-all duration-300 ease-in-out flex flex-col overflow-hidden
        fixed lg:relative h-full z-50
        ${isMobileMenuOpen 
          ? 'translate-x-0 w-72 shadow-2xl' 
          : '-translate-x-full lg:translate-x-0'
        }
        ${!isMobileMenuOpen && (isSidebarCollapsed ? 'lg:w-[72px]' : 'lg:w-64')}
      `}>
        {/* Sidebar header */}
        <div className="p-4 lg:p-6 h-16 lg:h-20 flex items-center justify-between border-b border-[#E4E4E7]">
            {(!isSidebarCollapsed || isMobileMenuOpen) 
              ? <Logo /> 
              : <img src="/logo.png" alt="VICO" className="w-10 h-10 rounded-xl object-cover shadow-md mx-auto" />
            }
            {/* Close button on mobile */}
            <button 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="lg:hidden p-1.5 text-[#71717A] hover:text-[#18181B] rounded-lg hover:bg-[#FAFAFA]"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
        </div>
        
        <nav className="flex-1 px-3 py-4 overflow-y-auto no-scrollbar">
            {/* MARKET DISCOVERY & RESEARCH Section */}
            <div className="mb-6">
                {showLabels && (
                  <div className="px-3 mb-2">
                    <span className="text-[9px] font-bold text-[#A1A1AA] uppercase tracking-[0.15em]">
                        Market Research
                    </span>
                  </div>
                )}
                {[
                  { id: 'market-industry', icon: FileText, label: 'Market Report' },
                  { id: 'competitor-analysis', icon: Swords, label: 'Competitor Analysis' },
                  { id: 'customer-insights', icon: LineChart, label: 'Customers' },
                  { id: 'icp-builder', icon: Target, label: 'ICP Builder' },
                  { id: 'news-intelligence', icon: Newspaper, label: 'News' },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                    title={!showLabels ? item.label : undefined}
                    className={`w-full p-2.5 rounded-lg flex items-center transition-all ${
                      showLabels ? 'gap-3' : 'justify-center'
                    } ${
                      activeTab === item.id
                        ? 'bg-[#FFF1F2] border-l-2 border-[#E11D48] text-[#E11D48]'
                        : 'hover:bg-[#FAFAFA] text-[#71717A]'
                    }`}
                  >
                    <item.icon size={16} className={activeTab === item.id ? 'text-[#E11D48]' : 'text-[#A1A1AA]'} />
                    {showLabels && (
                      <span className={`text-xs font-semibold truncate ${activeTab === item.id ? 'text-[#E11D48]' : 'text-[#18181B]'}`}>{item.label}</span>
                    )}
                  </button>
                ))}
            </div>
            
            {/* STRATEGY Section */}
            <div className="mb-6">
                {showLabels && (
                  <div className="px-3 mb-2">
                    <span className="text-[9px] font-bold text-[#A1A1AA] uppercase tracking-[0.15em]">
                        Strategy
                    </span>
                  </div>
                )}
                {[
                  { id: 'go-to-market', icon: Rocket, label: 'GTM Strategy' },
                  { id: 'playbook', icon: FileText, label: 'GTM Playbook' },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                    title={!showLabels ? item.label : undefined}
                    className={`w-full p-2.5 rounded-lg flex items-center transition-all ${
                      showLabels ? 'gap-3' : 'justify-center'
                    } ${
                      activeTab === item.id
                        ? 'bg-[#FFF1F2] border-l-2 border-[#E11D48] text-[#E11D48]'
                        : 'hover:bg-[#FAFAFA] text-[#71717A]'
                    }`}
                  >
                    <item.icon size={16} className={activeTab === item.id ? 'text-[#E11D48]' : 'text-[#A1A1AA]'} />
                    {showLabels && (
                      <span className={`text-xs font-semibold truncate ${activeTab === item.id ? 'text-[#E11D48]' : 'text-[#18181B]'}`}>{item.label}</span>
                    )}
                  </button>
                ))}
            </div>
            
            {/* RESOURCES Section */}
            <div className="mb-6">
                {showLabels && (
                  <div className="px-3 mb-2">
                    <span className="text-[9px] font-bold text-[#A1A1AA] uppercase tracking-[0.15em]">
                        Resources
                    </span>
                  </div>
                )}
                {[
                  { id: 'pipeline', icon: Database, label: 'Knowledge Base' },
                  { id: 'workspace', icon: FileText, label: 'Workspace' },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                    title={!showLabels ? item.label : undefined}
                    className={`w-full p-2.5 rounded-lg flex items-center transition-all ${
                      showLabels ? 'gap-3' : 'justify-center'
                    } ${
                      activeTab === item.id
                        ? 'bg-[#FFF1F2] border-l-2 border-[#E11D48] text-[#E11D48]'
                        : 'hover:bg-[#FAFAFA] text-[#71717A]'
                    }`}
                  >
                    <item.icon size={16} className={activeTab === item.id ? 'text-[#E11D48]' : 'text-[#A1A1AA]'} />
                    {showLabels && (
                      <span className={`text-xs font-semibold truncate ${activeTab === item.id ? 'text-[#E11D48]' : 'text-[#18181B]'}`}>{item.label}</span>
                    )}
                  </button>
                ))}
            </div>
        </nav>
        
        {/* Bottom User Section */}
        <div className="p-4 border-t border-[#E4E4E7]">
            {showLabels ? (
              <>
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-[#FFF1F2] flex items-center justify-center text-xs font-bold text-[#E11D48]">
                        {userData.firstName?.[0]}{userData.lastName?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-[#18181B] truncate">{userData.firstName} {userData.lastName}</div>
                        <div className="text-[10px] text-[#A1A1AA] truncate">{userData.email || 'user@vico.vn'}</div>
                    </div>
                </div>
                <button onClick={onBack} className="w-full p-2 flex items-center justify-center gap-2 text-[#71717A] hover:text-[#BE123C] hover:bg-[#F5F5F4] rounded-lg transition-all text-xs font-medium">
                    <LogOut size={14} />
                    <span>Log out</span>
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#FFF1F2] flex items-center justify-center text-xs font-bold text-[#E11D48]" title={`${userData.firstName} ${userData.lastName}`}>
                    {userData.firstName?.[0]}{userData.lastName?.[0]}
                </div>
                <button onClick={onBack} title="Log out" className="p-1.5 text-[#A1A1AA] hover:text-[#BE123C] hover:bg-[#F5F5F4] rounded-lg transition-all">
                    <LogOut size={14} />
                </button>
              </div>
            )}
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          <header className="h-14 lg:h-16 border-b border-[#E4E4E7] bg-white/80 backdrop-blur-xl px-4 lg:px-10 flex items-center justify-between z-20">
              <div className="flex items-center gap-3">
                  {/* Hamburger menu button — visible on mobile */}
                  <button 
                    onClick={() => setIsMobileMenuOpen(true)} 
                    className="lg:hidden p-2 -ml-1 text-[#71717A] hover:text-[#18181B] hover:bg-[#FAFAFA] rounded-lg transition-colors" 
                    aria-label="Open menu"
                  >
                      <Menu size={22} />
                  </button>
                  {/* Desktop sidebar collapse toggle */}
                  <button 
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
                    className="hidden lg:block p-2 text-[#A1A1AA] hover:text-[#18181B] hover:bg-[#FAFAFA] rounded-lg transition-colors" 
                    aria-label="Toggle sidebar"
                  >
                      <Menu size={20} />
                  </button>
                  <h2 className="text-base lg:text-lg font-extrabold text-[#18181B] uppercase tracking-tight truncate">
                      {tabLabels[activeTab] || activeTab}
                  </h2>
              </div>
              <div className="flex items-center gap-3 lg:gap-6">
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
                  <ThemeToggle />
                  <div className="flex items-center gap-3">
                      <div className="text-right hidden sm:block">
                          <div className="text-[10px] font-bold text-[#18181B] uppercase tracking-wide">{userData.firstName} {userData.lastName}</div>
                      </div>
                      <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-[#FFF1F2] border-2 border-[#E11D48]/10 flex items-center justify-center font-black text-[#E11D48] text-sm">
                          {userData.firstName?.[0]}{userData.lastName?.[0]}
                      </div>
                  </div>
              </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 bg-[#FAFAFA] custom-scrollbar">
              <div className="max-w-7xl mx-auto space-y-6 lg:space-y-10">
                  
                  {/* Market & Industry Tab - GlobalCopilot Style */}
                  {activeTab === 'market-industry' && (
                      <MarketIndustryPage 
                          userData={userData}
                          industry={userData.industry || 'Technology'}
                          market="Vietnam"
                      />
                  )}
                  
                  {/* Competitor Analysis Tab - GlobalCopilot Style */}
                  {activeTab === 'competitor-analysis' && (
                      <CompetitorAnalysisPage 
                          userData={userData}
                          competitors={userData.competitors?.filter((c: any) => c.selected) || []}
                      />
                  )}
                  
                  {/* Customer Insights Tab - Dynamic 4-Tier Analysis */}
                  {activeTab === 'customer-insights' && (
                      <CustomerInsightsPage userData={userData} />
                  )}
                  
                  {/* ICP Builder Tab — Phase 13: Smart Customer Segmentation */}
                  {activeTab === 'icp-builder' && (
                      <ICPBuilder />
                  )}
                  
                  {/* News Intelligence Tab */}
                  {activeTab === 'news-intelligence' && (
                      <NewsIntelligencePage 
                          userData={userData} 
                          competitors={userData.competitors?.filter((c: any) => c.selected) || []}
                      />
                  )}
                  
                  {/* Go-To-Market Tab */}
                  {activeTab === 'go-to-market' && (
                      <GTMStrategyPanel />
                  )}
                  
                  {/* GTM Playbook Builder Tab */}
                  {activeTab === 'playbook' && (
                      <GTMPlaybookBuilder />
                  )}
                  
                  {/* Operational Tab — now merged into pipeline */}
                  
                  {activeTab === 'pipeline' && (
                      <div className="space-y-8 animate-fade-in">
                          <div>
                              <h1 className="text-3xl font-extrabold text-[#18181B] uppercase tracking-tight">
                                  Operations &amp; Knowledge Base
                              </h1>
                              <p className="text-[#71717A] text-sm mt-1">
                                  Operational metrics and knowledge management
                              </p>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                              <StatCard title="Knowledge Nodes" value={dbCount.toLocaleString()} icon={Database} trend="up" change="Records" color="blue" />
                              <StatCard title="Competitors Tracked" value={pulseList.length - 1} icon={Swords} trend="up" change="Active" />
                              <StatCard title="Data Coverage" value="100%" icon={Target} trend="up" change="Complete" color="green" />
                              <StatCard title="Last Updated" value="Current" icon={Calendar} trend="up" change="Real-time" color="purple" />
                          </div>
                          
                          <DataPipeline />
                      </div>
                  )}
                  
                  {/* Executive Workspace — Phase 14: Saved Intelligence */}
                  {activeTab === 'workspace' && (
                      <ExecutiveWorkspace
                        onNavigateToICP={() => setActiveTab('icp-builder')}
                        onNavigateToPlaybook={() => setActiveTab('playbook')}
                      />
                  )}
              </div>
          </div>
      </main>
    </div>
  );
};
