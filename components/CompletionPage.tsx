
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
import { CompetitorComparisonDashboard } from './CompetitorComparison';
import { PremiumCompetitorDashboard } from './PremiumCompetitorDashboard';
import { MarketIndustryPage } from './MarketIndustryPage';
import { CompetitorAnalysisPage } from './CompetitorAnalysisPage';
import { CustomerInsightsPage } from './CustomerInsightsPage';
import { NewsIntelligencePage } from './NewsIntelligencePage';
import { NotificationCenter } from './NotificationCenter';
import { useNotifications } from '../hooks/useNotifications';

interface CompletionPageProps { userData: any; onBack: () => void; }

// Component hiển thị tin tức liên quan (Live RSS Feeds từ Google News)
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
                // 🆕 Fetch live news from backend RSS feeds (Google News Vietnamese)
                const liveNews = await getCompanyNews(query);
                setNews(liveNews.slice(0, limit));
            } catch (e) { 
                console.error('❌ News fetch error:', e);
                setError('Không thể tải tin tức lúc này');
            } finally { 
                setLoading(false); 
            }
        };
        fetchNews();
    }, [query, limit]);

    if (loading) return <div className="flex items-center gap-3 p-8 text-gray-400 font-bold uppercase text-[10px] tracking-widest"><Loader2 className="animate-spin" size={16}/> Đang quét tin tức mới nhất...</div>;
    
    if (error) return <div className="flex items-center gap-3 p-8 text-amber-600 font-bold uppercase text-[10px] tracking-widest" role="alert">⚠️ {error}</div>;
    
    if (news.length === 0) return null;

    return (
        <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase text-[#B91C1C] tracking-[0.2em] flex items-center gap-2 mb-4">
                <Newspaper size={14}/> 📰 Tin tức mới nhất từ Google News (Cập nhật real-time)
            </h4>
            <div className="grid gap-4">
                {news.map((item, i) => (
                    <div key={item.guid || i} className="bg-white dark:bg-gray-800/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-blue-400 transition-all group cursor-pointer">
                        <div className="flex justify-between items-start mb-2">
                            <h5 className="text-xs font-black dark:text-white group-hover:text-blue-500 transition-colors line-clamp-2 flex-1">{item.title}</h5>
                            {item.link && <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-500 ml-2 flex-shrink-0"><ExternalLink size={12}/></a>}
                        </div>
                        <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed mb-3">{item.content || 'Không có bản xem trước'}</p>
                        <div className="flex items-center gap-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                            <span className="flex items-center gap-1"><Calendar size={10}/> {new Date(item.pubDate).toLocaleDateString('vi-VN')}</span>
                            <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 px-2 py-0.5 rounded text-[8px]">{item.source || 'Google News'}</span>
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
  
  const validTabs = ['market-industry', 'news-intelligence', 'competitor-analysis', 'customer-insights', 'go-to-market', 'operational', 'pipeline'];
  const activeTab = tab && validTabs.includes(tab) ? tab : 'market-industry';
  
  const setActiveTab = useCallback((newTab: string) => {
    navigate(`/dashboard/${newTab}`, { replace: true });
  }, [navigate]);
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true); // Start collapsed on mobile
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dbCount, setDbCount] = useState(0);

  // 🔔 Notification system — auto-fetch từ Google News RSS
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
    'market-industry': 'Thị trường & Ngành',
    'news-intelligence': 'Tin tức Thông minh',
    'competitor-analysis': 'Phân tích Đối thủ',
    'customer-insights': 'Hiểu biết Khách hàng',
    'go-to-market': 'Chiến lược GTM',
    'operational': 'Vận hành',
    'pipeline': 'Kho Tri thức',
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
    <div className="flex h-screen bg-[#FDFCFB] dark:bg-[#0B101B] transition-colors duration-300 font-sans">
      {/* Mobile sidebar overlay - closes menu on tap */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden animate-fade-in" 
          onClick={() => setIsMobileMenuOpen(false)} 
        />
      )}
      
      {/* Sidebar: on mobile it's a slide-over panel, on desktop it's inline */}
      <aside className={`
        bg-white dark:bg-[#0F1623] border-r border-gray-100 dark:border-gray-800 
        transition-all duration-300 ease-in-out flex flex-col
        fixed lg:relative h-full z-50
        ${isMobileMenuOpen 
          ? 'translate-x-0 w-72 shadow-2xl' 
          : '-translate-x-full lg:translate-x-0'
        }
        ${!isMobileMenuOpen && (isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64')}
      `}>
        {/* Sidebar header */}
        <div className="p-4 lg:p-6 h-16 lg:h-20 flex items-center justify-between border-b dark:border-gray-800">
            {(!isSidebarCollapsed || isMobileMenuOpen) 
              ? <Logo /> 
              : <div className="w-10 h-10 bg-[#B91C1C] rounded-xl mx-auto flex items-center justify-center text-white font-black text-xl shadow-lg">V</div>
            }
            {/* Close button on mobile */}
            <button 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="lg:hidden p-1.5 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Đóng menu"
            >
              <X size={20} />
            </button>
        </div>
        
        <nav className="flex-1 px-3 py-4 overflow-y-auto no-scrollbar">
            {/* MARKET DISCOVERY & RESEARCH Section */}
            <div className="mb-6">
                {(!isSidebarCollapsed || isMobileMenuOpen) && (
                    <div className="px-3 mb-2">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.15em]">
                            Nghiên cứu Thị trường
                        </span>
                    </div>
                )}
                {isSidebarCollapsed && !isMobileMenuOpen && (
                    <div className="h-px bg-gray-200 dark:bg-gray-700 mx-2 mb-3" />
                )}
                {[
                    { id: 'market-industry', icon: FileText, label: 'Báo cáo Thị trường' },
                    { id: 'competitor-analysis', icon: Swords, label: 'Phân tích Đối thủ' },
                    { id: 'customer-insights', icon: LineChart, label: 'Hiểu biết Khách hàng' },
                    { id: 'news-intelligence', icon: Newspaper, label: 'Tin tức Thông minh' },
                ].map(item => (
                    <button 
                        key={item.id}
                        onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }} 
                        title={isSidebarCollapsed && !isMobileMenuOpen ? item.label : undefined}
                        className={`w-full p-2.5 rounded-lg flex items-center transition-all ${
                            isSidebarCollapsed && !isMobileMenuOpen ? 'justify-center' : 'gap-3'
                        } ${
                            activeTab === item.id 
                                ? 'bg-red-50 dark:bg-red-900/20 border-l-2 border-[#B91C1C]' 
                                : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                        }`}
                    >
                        <item.icon size={18} className={`flex-shrink-0 ${
                            activeTab === item.id ? 'text-[#B91C1C]' : 'text-gray-500'
                        }`} />
                        {(!isSidebarCollapsed || isMobileMenuOpen) && (
                            <span className={`text-xs font-medium ${
                                activeTab === item.id ? 'text-[#B91C1C] dark:text-red-400' : 'text-gray-700 dark:text-gray-300'
                            }`}>{item.label}</span>
                        )}
                    </button>
                ))}
            </div>
            
            {/* STRATEGY Section */}
            <div className="mb-6">
                {(!isSidebarCollapsed || isMobileMenuOpen) && (
                    <div className="px-3 mb-2">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.15em]">
                            Chiến lược
                        </span>
                    </div>
                )}
                {isSidebarCollapsed && !isMobileMenuOpen && (
                    <div className="h-px bg-gray-200 dark:bg-gray-700 mx-2 mb-3" />
                )}
                {[
                    { id: 'go-to-market', icon: Rocket, label: 'Chiến lược GTM' },
                    { id: 'operational', icon: Target, label: 'Vận hành' },
                ].map(item => (
                    <button 
                        key={item.id}
                        onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }} 
                        title={isSidebarCollapsed && !isMobileMenuOpen ? item.label : undefined}
                        className={`w-full p-2.5 rounded-lg flex items-center transition-all ${
                            isSidebarCollapsed && !isMobileMenuOpen ? 'justify-center' : 'gap-3'
                        } ${
                            activeTab === item.id 
                                ? 'bg-red-50 dark:bg-red-900/20 border-l-2 border-[#B91C1C]' 
                                : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                        }`}
                    >
                        <item.icon size={18} className={`flex-shrink-0 ${
                            activeTab === item.id ? 'text-[#B91C1C]' : 'text-gray-500'
                        }`} />
                        {(!isSidebarCollapsed || isMobileMenuOpen) && (
                            <span className={`text-xs font-medium ${
                                activeTab === item.id ? 'text-[#B91C1C] dark:text-red-400' : 'text-gray-700 dark:text-gray-300'
                            }`}>{item.label}</span>
                        )}
                    </button>
                ))}
            </div>
            
            {/* RESOURCES Section */}
            <div className="mb-6">
                {(!isSidebarCollapsed || isMobileMenuOpen) && (
                    <div className="px-3 mb-2">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.15em]">
                            Tài nguyên
                        </span>
                    </div>
                )}
                {isSidebarCollapsed && !isMobileMenuOpen && (
                    <div className="h-px bg-gray-200 dark:bg-gray-700 mx-2 mb-3" />
                )}
                <button 
                    onClick={() => { setActiveTab('pipeline'); setIsMobileMenuOpen(false); }} 
                    title={isSidebarCollapsed && !isMobileMenuOpen ? 'Kho Tri thức' : undefined}
                    className={`w-full p-2.5 rounded-lg flex items-center transition-all ${
                        isSidebarCollapsed && !isMobileMenuOpen ? 'justify-center' : 'gap-3'
                    } ${
                        activeTab === 'pipeline' 
                            ? 'bg-red-50 dark:bg-red-900/20 border-l-2 border-[#B91C1C]' 
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                >
                    <Database size={18} className={`flex-shrink-0 ${
                        activeTab === 'pipeline' ? 'text-[#B91C1C]' : 'text-gray-500'
                    }`} />
                    {(!isSidebarCollapsed || isMobileMenuOpen) && (
                        <span className={`text-xs font-medium ${
                            activeTab === 'pipeline' ? 'text-[#B91C1C] dark:text-red-400' : 'text-gray-700 dark:text-gray-300'
                        }`}>Kho Tri thức</span>
                    )}
                </button>
            </div>
        </nav>
        
        {/* Bottom User Section */}
        <div className="p-4 border-t dark:border-gray-800">
            {(!isSidebarCollapsed || isMobileMenuOpen) ? (
                <>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-xs font-bold text-[#B91C1C]">
                            {userData.firstName?.[0]}{userData.lastName?.[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-gray-900 dark:text-white truncate">{userData.firstName} {userData.lastName}</div>
                            <div className="text-[10px] text-gray-500 truncate">{userData.email || 'user@vico.vn'}</div>
                        </div>
                    </div>
                    <button onClick={onBack} className="w-full p-2 flex items-center justify-center gap-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-all text-xs">
                        <LogOut size={14} />
                        <span>Đăng xuất</span>
                    </button>
                </>
            ) : (
                <div className="flex flex-col items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-xs font-bold text-[#B91C1C]" title={`${userData.firstName} ${userData.lastName}`}>
                        {userData.firstName?.[0]}{userData.lastName?.[0]}
                    </div>
                    <button onClick={onBack} title="Đăng xuất" className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-all">
                        <LogOut size={16} />
                    </button>
                </div>
            )}
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          <header className="h-14 lg:h-16 border-b dark:border-gray-800 bg-white/70 dark:bg-[#0B101B]/70 backdrop-blur-xl px-4 lg:px-10 flex items-center justify-between z-20">
              <div className="flex items-center gap-3">
                  {/* Hamburger menu button — visible on mobile */}
                  <button 
                    onClick={() => setIsMobileMenuOpen(true)} 
                    className="lg:hidden p-2 -ml-1 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" 
                    aria-label="Mở menu"
                  >
                      <Menu size={22} />
                  </button>
                  {/* Desktop sidebar collapse toggle */}
                  <button 
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
                    className="hidden lg:block p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" 
                    aria-label="Thu gọn sidebar"
                  >
                      <Menu size={20} />
                  </button>
                  <h2 className="text-base lg:text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter truncate">
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
                          <div className="text-[10px] font-black text-gray-900 dark:text-white uppercase">{userData.firstName} {userData.lastName}</div>
                      </div>
                      <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-red-50 dark:bg-red-900/40 border-2 border-[#B91C1C]/10 flex items-center justify-center font-black text-[#B91C1C] text-sm">
                          {userData.firstName?.[0]}{userData.lastName?.[0]}
                      </div>
                  </div>
              </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 bg-[#FDFCFB]/50 dark:bg-[#0B101B]/50 custom-scrollbar">
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
                  
                  {/* Operational Tab */}
                  {activeTab === 'operational' && (
                      <div className="space-y-8 animate-fade-in">
                          <div>
                              <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                                  Vận hành Thông minh
                              </h1>
                              <p className="text-gray-500 text-sm mt-1">
                                  Chỉ số vận hành và quản lý tri thức
                              </p>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                              <StatCard title="Nút Tri thức" value={dbCount.toLocaleString()} icon={Database} trend="up" change="Bản ghi" color="blue" />
                              <StatCard title="Đối thủ Theo dõi" value={pulseList.length - 1} icon={Swords} trend="up" change="Đang hoạt động" />
                              <StatCard title="Phủ sóng Dữ liệu" value="100%" icon={Target} trend="up" change="Hoàn tất" color="green" />
                              <StatCard title="Cập nhật lần cuối" value="Hiện tại" icon={Calendar} trend="up" change="Thời gian thực" color="purple" />
                          </div>
                          
                          <DataPipeline />
                      </div>
                  )}
                  
                  {activeTab === 'pipeline' && (
                      <DataPipeline />
                  )}
              </div>
          </div>
      </main>
    </div>
  );
};
