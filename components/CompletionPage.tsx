
import { useState, useMemo, useEffect } from 'react';
import React from 'react';
import { 
    LayoutDashboard, Globe, Database, Swords, 
    LogOut, ExternalLink, ArrowUpRight, ArrowDownRight, Zap, 
    Newspaper, ShieldCheck, Sparkles, MapPin, Building,
    Target, LineChart, Shield, TrendingUp, AlertTriangle, FileText, ChevronRight,
    Loader2, Terminal, Link as LinkIcon, Calendar, Rocket
} from 'lucide-react';
import { RagService, SearchResult } from '../services/ragLayer';
import { CopilotService, GlobalCopilotReport } from '../services/CopilotService';
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
                setError('Unable to fetch news at this moment');
            } finally { 
                setLoading(false); 
            }
        };
        fetchNews();
    }, [query, limit]);

    if (loading) return <div className="flex items-center gap-3 p-8 text-gray-400 font-bold uppercase text-[10px] tracking-widest"><Loader2 className="animate-spin" size={16}/> Đang quét tin tức mới nhất từ Google News...</div>;
    
    if (error) return <div className="flex items-center gap-3 p-8 text-amber-600 font-bold uppercase text-[10px] tracking-widest">⚠️ {error}</div>;
    
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
                        <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed mb-3">{item.content || 'No preview available'}</p>
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

// Strategy Matrix for visualization
const StrategyMatrix = ({ data }: { data: any[] }) => {
    return (
        <div className="bg-white dark:bg-[#0F1623] border border-gray-100 dark:border-gray-800 rounded-3xl p-8 relative overflow-hidden h-[450px]">
             <h3 className="absolute top-6 left-8 font-black text-sm uppercase text-gray-500 tracking-widest z-10">Strategic Positioning Matrix</h3>
             <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Market Presence (0-100)</div>
             <div className="absolute left-4 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Innovation Index (0-100)</div>
             <div className="absolute inset-16 border-l-2 border-b-2 border-gray-100 dark:border-gray-800 grid grid-cols-2 grid-rows-2">
                 <div className="border-r border-dashed border-gray-100 dark:border-gray-800/50"></div>
                 <div className="border-b border-dashed border-gray-100 dark:border-gray-800/50 col-start-2 row-start-1"></div>
             </div>
             <div className="absolute inset-16">
                 {data.map((item, i) => (
                    <div 
                        key={i}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer transition-all duration-700 hover:scale-125 hover:z-30"
                        style={{ bottom: `${item.y}%`, left: `${item.x}%` }}
                    >
                        <div className={`w-4 h-4 rounded-lg border-2 border-white dark:border-[#0F1623] shadow-xl rotate-45 ${i === 0 ? 'bg-[#B91C1C] ring-4 ring-[#B91C1C]/10' : 'bg-gray-800'}`}></div>
                        <div className="mt-4 bg-gray-950 text-white px-3 py-1.5 rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-black uppercase whitespace-nowrap z-20 border border-white/10">
                            {item.name}
                            <div className="text-[8px] text-gray-400 font-bold mt-0.5">{item.label}</div>
                        </div>
                    </div>
                 ))}
             </div>
        </div>
    );
};

const CompetitiveMap = ({ competitors }: { competitors: any[] }) => {
    return (
        <div className="bg-white dark:bg-[#0F1623] border border-gray-100 dark:border-gray-800 rounded-3xl p-8 relative overflow-hidden h-[400px]">
             <h3 className="absolute top-6 left-8 font-black text-sm uppercase text-gray-500 tracking-widest z-10">Competitive Landscape Matrix</h3>
             <div className="absolute inset-12 border-l-2 border-b-2 border-gray-100 dark:border-gray-800 grid grid-cols-2 grid-rows-2">
                 <div className="border-r border-dashed border-gray-50 dark:border-gray-800/50"></div>
             </div>
             <div className="absolute inset-12">
                 {competitors.map((c, i) => {
                     const y = Math.max(0, Math.min(100, (c.similarity - 50) * 2));
                     let yearVal = 2015;
                     if (c.year) yearVal = parseInt(c.year) || 2015;
                     const x = Math.max(5, Math.min(95, ((yearVal - 1990) / 35) * 100));
                     return (
                         <div key={i} className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer transition-all duration-500 hover:scale-110" style={{ bottom: `${y}%`, left: `${x}%` }}>
                             <div className={`w-3 h-3 rounded-full border-2 border-white dark:border-[#0F1623] shadow-lg ${i===0 ? 'bg-[#B91C1C] w-4 h-4' : 'bg-blue-500'}`}></div>
                             <div className="mt-2 bg-white dark:bg-gray-800 px-2 py-1 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity text-[9px] font-black uppercase whitespace-nowrap z-10">{c.name}</div>
                         </div>
                     );
                 })}
             </div>
        </div>
    );
};

export const CompletionPage: React.FC<CompletionPageProps> = ({ userData, onBack }) => {
  const [activeView, setActiveView] = useState('overview');
  const [activeTab, setActiveTab] = useState('market-industry'); // For top navigation tabs
  const [isSidebarCollapsed] = useState(false);
  const [dbCount, setDbCount] = useState(0);
  const [report, setReport] = useState<GlobalCopilotReport | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const hydrate = async () => {
        const vectors = await loadFromDB('vectors');
        setDbCount(vectors.length);
    };
    hydrate();
  }, []);

  // Top navigation tabs (GlobalCopilot style)
  const topTabs = [
    { id: 'market-industry', label: 'Market & Industry' },
    { id: 'competitor-analysis', label: 'Competitor Analysis' },
    { id: 'customer-insights', label: 'Customer Insights' },
    { id: 'go-to-market', label: 'Go-To-Market' },
    { id: 'operational', label: 'Operational' },
  ];

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

  const generateReport = async () => {
      setIsGenerating(true);
      const competitorNames = pulseList.slice(1).map(c => c.name);
      const res = await CopilotService.generateFullReport(
          userData.orgName,
          "Technology",
          competitorNames,
          userData.companyDescription + "\n" + userData.productsServices
      );
      if (res) setReport(res);
      setIsGenerating(false);
  };

  return (
    <div className="flex h-screen bg-[#FDFCFB] dark:bg-[#0B101B] transition-colors duration-300 font-sans">
      <aside className={`bg-white dark:bg-[#0F1623] border-r border-gray-100 dark:border-gray-800 transition-all duration-500 flex flex-col z-30 ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
        <div className="p-6 h-20 flex items-center justify-between border-b dark:border-gray-800">
            {!isSidebarCollapsed ? <Logo /> : <div className="w-10 h-10 bg-[#B91C1C] rounded-xl mx-auto flex items-center justify-center text-white font-black text-xl shadow-lg">V</div>}
        </div>
        
        <nav className="flex-1 px-3 py-4 overflow-y-auto no-scrollbar">
            {/* MARKET DISCOVERY & RESEARCH Section */}
            <div className="mb-6">
                <div className="px-3 mb-2">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.15em]">
                        Market Discovery & Research
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
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Market Report</span>
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
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Competitor Analysis</span>
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
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Customer Insights</span>
                </button>
            </div>
            
            {/* STRATEGY Section */}
            <div className="mb-6">
                <div className="px-3 mb-2">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.15em]">
                        Strategy
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
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Go-To-Market</span>
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
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Operational</span>
                </button>
            </div>
            
            {/* RESOURCES Section */}
            <div className="mb-6">
                <div className="px-3 mb-2">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.15em]">
                        Resources
                    </span>
                </div>
                <button 
                    onClick={() => setActiveView('pipeline')} 
                    className={`w-full p-2.5 rounded-lg flex items-center gap-3 transition-all ${
                        activeView === 'pipeline' 
                            ? 'bg-gray-100 dark:bg-gray-800 border-l-2 border-[#B91C1C]' 
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                >
                    <Database size={16} className="text-gray-500" />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Knowledge Base</span>
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
          {/* Top Navigation Tabs - GlobalCopilot Style */}
          <div className="h-14 border-b dark:border-gray-800 bg-white dark:bg-[#0F1623] px-6 flex items-center gap-1 overflow-x-auto">
              {topTabs.map((tab) => (
                  <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                          activeTab === tab.id
                              ? 'bg-blue-600 text-white shadow-lg'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                  >
                      {tab.label}
                  </button>
              ))}
          </div>
          
          <header className="h-16 border-b dark:border-gray-800 bg-white/70 dark:bg-[#0B101B]/70 backdrop-blur-xl px-10 flex items-center justify-between z-20">
              <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                  {topTabs.find(t => t.id === activeTab)?.label || activeView}
              </h2>
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
                  
                  {/* Go-To-Market Tab */}
                  {activeTab === 'go-to-market' && (
                      <GTMStrategyPanel />
                  )}
                  
                  {/* Operational Tab */}
                  {activeTab === 'operational' && (
                      <div className="space-y-8 animate-fade-in">
                          <div>
                              <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                                  Operational Intelligence
                              </h1>
                              <p className="text-gray-500 text-sm mt-1">
                                  Operational metrics and knowledge management
                              </p>
                          </div>
                          
                          <div className="grid grid-cols-4 gap-6">
                              <StatCard title="Knowledge Nodes" value={dbCount.toLocaleString()} icon={Database} trend="up" change="Records" color="blue" />
                              <StatCard title="Competitors Tracked" value={pulseList.length - 1} icon={Swords} trend="up" change="Active" />
                              <StatCard title="Data Coverage" value="100%" icon={Target} trend="up" change="Complete" color="green" />
                              <StatCard title="Last Updated" value="Now" icon={Calendar} trend="up" change="Real-time" color="purple" />
                          </div>
                          
                          <DataPipeline />
                      </div>
                  )}
              </div>
          </div>
      </main>
    </div>
  );
};
