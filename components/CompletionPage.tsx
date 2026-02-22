
import { useState, useMemo, useEffect } from 'react';
import React from 'react';
import { 
    Database, Swords, LogOut, ExternalLink, 
    Newspaper, Target, LineChart, FileText,
    Loader2, Calendar, Rocket
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
  const [activeTab, setActiveTab] = useState('market-industry');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [dbCount, setDbCount] = useState(0);

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
      {/* Mobile sidebar overlay */}
      {!isSidebarCollapsed && (
        <div className="fixed inset-0 bg-black/30 z-20 lg:hidden" onClick={() => setIsSidebarCollapsed(true)} />
      )}
      <aside className={`bg-white dark:bg-[#0F1623] border-r border-gray-100 dark:border-gray-800 transition-all duration-500 flex flex-col z-30 fixed lg:relative h-full ${isSidebarCollapsed ? '-translate-x-full lg:translate-x-0 lg:w-20 w-0' : 'translate-x-0 w-64'}`}>
        <div className="p-6 h-20 flex items-center justify-between border-b dark:border-gray-800">
            {!isSidebarCollapsed ? <Logo /> : <div className="w-10 h-10 bg-[#B91C1C] rounded-xl mx-auto flex items-center justify-center text-white font-black text-xl shadow-lg">V</div>}
        </div>
        
        <nav className="flex-1 px-3 py-4 overflow-y-auto no-scrollbar">
            {/* MARKET DISCOVERY & RESEARCH Section */}
            <div className="mb-6">
                <div className="px-3 mb-2">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.15em]">
                        Nghiên cứu Thị trường
                    </span>
                </div>
                <button 
                    onClick={() => setActiveTab('market-industry')} 
                    className={`w-full p-2.5 rounded-lg flex items-center gap-3 transition-all ${
                        activeTab === 'market-industry' 
                            ? 'bg-gray-100 dark:bg-gray-800 border-l-2 border-[#B91C1C]' 
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                >
                    <FileText size={16} className="text-gray-500" />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Báo cáo Thị trường</span>
                </button>
                <button 
                    onClick={() => setActiveTab('competitor-analysis')} 
                    className={`w-full p-2.5 rounded-lg flex items-center gap-3 transition-all ${
                        activeTab === 'competitor-analysis' 
                            ? 'bg-gray-100 dark:bg-gray-800 border-l-2 border-[#B91C1C]' 
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                >
                    <Swords size={16} className="text-gray-500" />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Phân tích Đối thủ</span>
                </button>
                <button 
                    onClick={() => setActiveTab('customer-insights')} 
                    className={`w-full p-2.5 rounded-lg flex items-center gap-3 transition-all ${
                        activeTab === 'customer-insights' 
                            ? 'bg-gray-100 dark:bg-gray-800 border-l-2 border-[#B91C1C]' 
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                >
                    <LineChart size={16} className="text-gray-500" />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Hiểu biết Khách hàng</span>
                </button>
                <button 
                    onClick={() => setActiveTab('news-intelligence')} 
                    className={`w-full p-2.5 rounded-lg flex items-center gap-3 transition-all ${
                        activeTab === 'news-intelligence' 
                            ? 'bg-gray-100 dark:bg-gray-800 border-l-2 border-[#B91C1C]' 
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                >
                    <Newspaper size={16} className="text-gray-500" />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Tin tức Thông minh</span>
                </button>
            </div>
            
            {/* STRATEGY Section */}
            <div className="mb-6">
                <div className="px-3 mb-2">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.15em]">
                        Chiến lược
                    </span>
                </div>
                <button 
                    onClick={() => setActiveTab('go-to-market')} 
                    className={`w-full p-2.5 rounded-lg flex items-center gap-3 transition-all ${
                        activeTab === 'go-to-market' 
                            ? 'bg-gray-100 dark:bg-gray-800 border-l-2 border-[#B91C1C]' 
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                >
                    <Rocket size={16} className="text-gray-500" />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Chiến lược GTM</span>
                </button>
                <button 
                    onClick={() => setActiveTab('operational')} 
                    className={`w-full p-2.5 rounded-lg flex items-center gap-3 transition-all ${
                        activeTab === 'operational' 
                            ? 'bg-gray-100 dark:bg-gray-800 border-l-2 border-[#B91C1C]' 
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                >
                    <Target size={16} className="text-gray-500" />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Vận hành</span>
                </button>
            </div>
            
            {/* RESOURCES Section */}
            <div className="mb-6">
                <div className="px-3 mb-2">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.15em]">
                        Tài nguyên
                    </span>
                </div>
                <button 
                    onClick={() => setActiveTab('pipeline')} 
                    className={`w-full p-2.5 rounded-lg flex items-center gap-3 transition-all ${
                        activeTab === 'pipeline' 
                            ? 'bg-gray-100 dark:bg-gray-800 border-l-2 border-[#B91C1C]' 
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                >
                    <Database size={16} className="text-gray-500" />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Kho Tri thức</span>
                </button>
            </div>
        </nav>
        
        {/* Bottom User Section */}
        <div className="p-4 border-t dark:border-gray-800">
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
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          <header className="h-16 border-b dark:border-gray-800 bg-white/70 dark:bg-[#0B101B]/70 backdrop-blur-xl px-6 lg:px-10 flex items-center justify-between z-20">
              <div className="flex items-center gap-3">
                  <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="lg:hidden p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white" aria-label="Menu">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
                  </button>
                  <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                      {tabLabels[activeTab] || activeTab}
                  </h2>
              </div>
              <div className="flex items-center gap-6">
                  <ThemeToggle />
                  <div className="flex items-center gap-3">
                      <div className="text-right hidden sm:block">
                          <div className="text-[10px] font-black text-gray-900 dark:text-white uppercase">{userData.firstName} {userData.lastName}</div>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/40 border-2 border-[#B91C1C]/10 flex items-center justify-center font-black text-[#B91C1C]">
                          {userData.firstName?.[0]}{userData.lastName?.[0]}
                      </div>
                  </div>
              </div>
          </header>

          <div className="flex-1 overflow-y-auto p-10 bg-[#FDFCFB]/50 dark:bg-[#0B101B]/50 custom-scrollbar">
              <div className="max-w-7xl mx-auto space-y-10">
                  
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
                          
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
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
