/**
 * 🌍 Market & Industry Page - Dynamic Enterprise Market Intelligence
 * 
 * NOW USES REAL DATA from:
 * - User's company profile
 * - Selected competitors
 * - 10,000+ companies in database
 * - Similarity/Vector algorithms
 * 
 * Features:
 * 1. Market Size & Forecast (TAM, SAM, SOM, CAGR) - Calculated from industry data
 * 2. Market Dynamics (Drivers, Restraints, Trends) - Based on competitor analysis
 * 3. Competitive Landscape (Market Share, Concentration) - From similarity scores
 * 4. Strategic Frameworks (Porter's Five Forces, PESTLE)
 * 5. Deals & Investments (M&A, VC/PE Funding)
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    ChevronDown, ChevronUp, TrendingUp, Globe, Building2,
    Scale, Leaf, Cpu, Shield, BarChart3, PieChart, Users,
    DollarSign, Target, Zap, AlertTriangle, CheckCircle, Info,
    Download, Edit3, Activity, Briefcase, Factory, ShoppingCart,
    Repeat, Gauge, BarChart2, Lightbulb, Handshake, Coins, Rocket,
    Loader2, RefreshCw, Database
} from 'lucide-react';

interface MarketIndustryPageProps {
    userData: any;
    industry?: string;
    market?: string;
}

// Types matching the backend service
interface MarketIntelligenceReport {
    generatedAt: string;
    industry: string;
    market: string;
    companyCount: number;
    marketSize: {
        tam: string;
        samValue: number;
        sam: string;
        som: string;
        cagr: number;
        cagrPeriod: string;
        currentSize: number;
        forecastSize: number;
        revenueHistory: number[];
        years: string[];
        methodology: string;
    };
    competitiveLandscape: {
        marketShare: Array<{
            name: string;
            share: number;
            growth: number;
            type: 'Leader' | 'Challenger' | 'Follower' | 'Niche';
        }>;
        concentration: {
            level: string;
            hhi: number;
            cr4: number;
            description: string;
        };
        totalCompaniesInIndustry: number;
        avgSimilarity: number;
    };
    marketDynamics: {
        drivers: Array<{ title: string; description: string; impact: 'High' | 'Medium' | 'Low' }>;
        restraints: Array<{ title: string; description: string; impact: 'High' | 'Medium' | 'Low' }>;
        trends: Array<{ title: string; description: string; impact: 'High' | 'Medium' | 'Low' }>;
    };
    portersForces: {
        supplierPower: { score: number; description: string };
        buyerPower: { score: number; description: string };
        newEntrants: { score: number; description: string };
        substitutes: { score: number; description: string };
        rivalry: { score: number; description: string };
    };
    funding: {
        totalDeals: number;
        totalValue: string;
        yoyGrowth: number;
        avgDealSize: string;
        topSectors: Array<{ name: string; value: number; percentage: number }>;
        recentDeals: Array<{
            type: string;
            title: string;
            parties: string;
            value: string;
            date: string;
            description: string;
        }>;
    };
    executiveSummary: {
        overview: string;
        keyInsights: string[];
        recommendations: string[];
    };
    sources: {
        competitorsAnalyzed: number;
        industryPeersFound: number;
        similarityThreshold: number;
    };
}

// ==================== SECTION COMPONENTS ====================

// Loading Skeleton
const LoadingSkeleton = () => (
    <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        <div className="grid grid-cols-4 gap-4">
            {[1,2,3,4].map(i => (
                <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            ))}
        </div>
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
    </div>
);

// TAM/SAM/SOM Funnel Visualization
const MarketSizeFunnel = ({ tam, sam, som }: { tam: string; sam: string; som: string }) => (
    <div className="relative py-8">
        <div className="flex flex-col items-center gap-1">
            <div className="relative w-full max-w-md">
                <div className="h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-3xl flex items-center justify-center shadow-lg">
                    <div className="text-center text-white">
                        <p className="text-xs font-medium opacity-80">TAM - Total Addressable Market</p>
                        <p className="text-xl font-black">{tam}</p>
                    </div>
                </div>
            </div>
            <div className="relative w-4/5 max-w-sm">
                <div className="h-16 bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <div className="text-center text-white">
                        <p className="text-xs font-medium opacity-80">SAM - Serviceable Available Market</p>
                        <p className="text-xl font-black">{sam}</p>
                    </div>
                </div>
            </div>
            <div className="relative w-3/5 max-w-xs">
                <div className="h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-b-3xl flex items-center justify-center shadow-lg">
                    <div className="text-center text-white">
                        <p className="text-xs font-medium opacity-80">SOM - Serviceable Obtainable Market</p>
                        <p className="text-xl font-black">{som}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// Revenue Forecast Chart
const RevenueChart = ({ data, years }: { data: number[]; years: string[] }) => {
    const maxValue = Math.max(...data);
    return (
        <div className="space-y-4">
            <div className="flex items-end gap-2 h-48 px-2">
                {data.map((value, idx) => {
                    const isHistorical = idx < 3;
                    const isCurrent = idx === 3;
                    return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                            <span className="text-xs font-bold text-gray-900 dark:text-white">${value.toFixed(1)}B</span>
                            <div 
                                className={`w-full rounded-t-lg transition-all ${
                                    isCurrent ? 'bg-gradient-to-t from-blue-600 to-blue-400 shadow-lg shadow-blue-500/30' :
                                    isHistorical ? 'bg-gray-300 dark:bg-gray-600' : 
                                    'bg-gradient-to-t from-green-500 to-green-400'
                                }`}
                                style={{ height: `${(value / maxValue) * 100}%`, minHeight: '20px' }}
                            />
                            <span className={`text-[10px] ${isCurrent ? 'font-bold text-blue-600' : 'text-gray-500'}`}>{years[idx]}</span>
                        </div>
                    );
                })}
            </div>
            <div className="flex justify-center gap-6 text-xs">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-gray-300 dark:bg-gray-600"></div>
                    <span className="text-gray-500">Historical</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-blue-500"></div>
                    <span className="text-gray-500">Current</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-green-500"></div>
                    <span className="text-gray-500">Forecast</span>
                </div>
            </div>
        </div>
    );
};

// Market Dynamics Card
const DynamicsCard = ({ type, items, icon: Icon, color }: { 
    type: string; 
    items: { title: string; description: string; impact: 'High' | 'Medium' | 'Low' }[];
    icon: any;
    color: string;
}) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const impactColors = {
        High: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        Medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        Low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    };
    
    return (
        <div className="bg-white dark:bg-[#0F1623] border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
            <div 
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
                        <Icon className="text-white" size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white">{type}</h4>
                        <p className="text-xs text-gray-500">{items.length} factors identified</p>
                    </div>
                </div>
                {isExpanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
            </div>
            
            {isExpanded && (
                <div className="px-5 pb-5 space-y-3 border-t border-gray-100 dark:border-gray-800 pt-4">
                    {items.map((item, idx) => (
                        <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                    <h5 className="font-semibold text-gray-900 dark:text-white text-sm">{item.title}</h5>
                                    <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${impactColors[item.impact]}`}>
                                    {item.impact}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// Porter's Five Forces Component
const PortersFiveForces = ({ forces }: { forces: MarketIntelligenceReport['portersForces'] }) => {
    const forcesList = [
        { name: 'Supplier Power', score: forces.supplierPower.score, description: forces.supplierPower.description, icon: Factory },
        { name: 'Buyer Power', score: forces.buyerPower.score, description: forces.buyerPower.description, icon: ShoppingCart },
        { name: 'New Entrants', score: forces.newEntrants.score, description: forces.newEntrants.description, icon: Rocket },
        { name: 'Substitutes', score: forces.substitutes.score, description: forces.substitutes.description, icon: Repeat }
    ];
    
    return (
        <div className="relative">
            <div className="flex justify-center mb-8">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-xl">
                    <div className="text-center text-white">
                        <Activity size={28} className="mx-auto mb-1" />
                        <p className="text-xs font-bold">Rivalry<br/>{forces.rivalry.score}/5</p>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {forcesList.map((force, idx) => {
                    const scoreColor = force.score >= 4 ? 'text-red-600' : force.score >= 3 ? 'text-amber-600' : 'text-green-600';
                    const bgColor = force.score >= 4 ? 'bg-red-50 dark:bg-red-900/20' : force.score >= 3 ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-green-50 dark:bg-green-900/20';
                    return (
                        <div key={idx} className={`p-4 rounded-xl ${bgColor} border border-gray-100 dark:border-gray-800`}>
                            <div className="flex items-center gap-2 mb-2">
                                <force.icon size={18} className={scoreColor} />
                                <h5 className="font-bold text-gray-900 dark:text-white text-sm">{force.name}</h5>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                                {[1,2,3,4,5].map(i => (
                                    <div 
                                        key={i} 
                                        className={`w-4 h-2 rounded-full ${i <= force.score ? (force.score >= 4 ? 'bg-red-500' : force.score >= 3 ? 'bg-amber-500' : 'bg-green-500') : 'bg-gray-200 dark:bg-gray-700'}`}
                                    />
                                ))}
                                <span className={`text-sm font-bold ${scoreColor}`}>{force.score}/5</span>
                            </div>
                            <p className="text-[11px] text-gray-500">{force.description}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// Competitive Landscape Matrix
const CompetitorMatrix = ({ companies }: { companies: MarketIntelligenceReport['competitiveLandscape']['marketShare'] }) => {
    const typeColors = {
        Leader: 'bg-green-500',
        Challenger: 'bg-blue-500', 
        Follower: 'bg-amber-500',
        Niche: 'bg-purple-500'
    };
    
    return (
        <div className="relative h-80 bg-gray-50 dark:bg-gray-800/30 rounded-2xl p-6">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 text-xs font-medium text-gray-400 whitespace-nowrap">
                Market Growth Rate →
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-xs font-medium text-gray-400">
                Relative Market Share →
            </div>
            
            <div className="absolute inset-8 grid grid-cols-2 grid-rows-2 gap-1">
                <div className="bg-green-100/50 dark:bg-green-900/20 rounded-tl-xl flex items-center justify-center">
                    <span className="text-xs text-green-600 font-medium">Stars</span>
                </div>
                <div className="bg-amber-100/50 dark:bg-amber-900/20 rounded-tr-xl flex items-center justify-center">
                    <span className="text-xs text-amber-600 font-medium">Question Marks</span>
                </div>
                <div className="bg-blue-100/50 dark:bg-blue-900/20 rounded-bl-xl flex items-center justify-center">
                    <span className="text-xs text-blue-600 font-medium">Cash Cows</span>
                </div>
                <div className="bg-gray-200/50 dark:bg-gray-700/30 rounded-br-xl flex items-center justify-center">
                    <span className="text-xs text-gray-500 font-medium">Dogs</span>
                </div>
            </div>
            
            {companies.filter(c => c.name !== 'Others').map((company, idx) => {
                const x = 10 + (company.share * 2);
                const y = 90 - (company.growth * 2.5);
                return (
                    <div
                        key={idx}
                        className={`absolute w-8 h-8 rounded-full ${typeColors[company.type]} flex items-center justify-center text-white text-[10px] font-bold shadow-lg transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-125 transition-transform z-10`}
                        style={{ left: `${Math.min(90, Math.max(10, x))}%`, top: `${Math.min(90, Math.max(10, y))}%` }}
                        title={`${company.name}: ${company.share}% share, ${company.growth}% growth`}
                    >
                        {company.name.substring(0, 2)}
                    </div>
                );
            })}
        </div>
    );
};

// Deal Card Component
const DealCard: React.FC<{ deal: { type: string; title: string; parties: string; value: string; date: string; description: string } }> = ({ deal }) => {
    const typeColors: Record<string, string> = {
        'M&A': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        'Series A': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        'Series B': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        'Series C': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
        'IPO': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        'PE': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    };
    
    return (
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:shadow-lg transition-all">
            <div className="flex items-start justify-between gap-3 mb-3">
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${typeColors[deal.type] || 'bg-gray-100 text-gray-700'}`}>
                    {deal.type}
                </span>
                <span className="text-xs text-gray-500">{deal.date}</span>
            </div>
            <h5 className="font-bold text-gray-900 dark:text-white text-sm mb-1">{deal.title}</h5>
            <p className="text-xs text-gray-500 mb-2">{deal.parties}</p>
            <span className="text-lg font-black text-green-600">{deal.value}</span>
            <p className="text-[11px] text-gray-400 mt-2">{deal.description}</p>
        </div>
    );
};

// Market Concentration Gauge
const ConcentrationGauge = ({ level, hhi }: { level: string; hhi: number }) => {
    const getColor = () => {
        if (hhi > 2500) return 'text-red-600';
        if (hhi > 1500) return 'text-amber-600';
        return 'text-green-600';
    };
    
    return (
        <div className="text-center">
            <div className="relative inline-flex items-center justify-center w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90">
                    <circle cx="64" cy="64" r="56" fill="none" stroke="currentColor" strokeWidth="12" className="text-gray-200 dark:text-gray-700" />
                    <circle 
                        cx="64" cy="64" r="56" fill="none" stroke="currentColor" strokeWidth="12" 
                        className={getColor()}
                        strokeDasharray={`${(hhi / 10000) * 352} 352`}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-2xl font-black ${getColor()}`}>{hhi}</span>
                    <span className="text-[10px] text-gray-500">HHI Index</span>
                </div>
            </div>
            <p className={`mt-3 font-bold ${getColor()}`}>{level}</p>
            <p className="text-xs text-gray-500">Market Concentration</p>
        </div>
    );
};

// PESTLE data (static for now, could be dynamic based on industry)
const getPESTLEData = (industry: string) => [
    { letter: 'P', title: 'Political', icon: Scale, color: 'bg-blue-600', score: 4, impact: 'Positive' as const, details: ['Chính phủ hỗ trợ chuyển đổi số', 'Chính sách ưu đãi thuế cho công nghệ cao', 'Môi trường chính trị ổn định', 'FTA: RCEP, CPTPP'] },
    { letter: 'E', title: 'Economic', icon: DollarSign, color: 'bg-green-600', score: 4, impact: 'Positive' as const, details: ['GDP tăng 6.5%', 'Tầng lớp trung lưu 45 triệu', 'FDI tăng 32% YoY', 'Lạm phát kiểm soát 3.5%'] },
    { letter: 'S', title: 'Social', icon: Users, color: 'bg-purple-600', score: 5, impact: 'Positive' as const, details: ['70% dân số dưới 35 tuổi', 'Internet 78%, Smartphone 85%', 'Social commerce tăng 65%', 'E-learning tăng 150%'] },
    { letter: 'T', title: 'Technological', icon: Cpu, color: 'bg-orange-600', score: 4, impact: 'Positive' as const, details: ['5G phủ 63 tỉnh thành', '3,800+ tech startups', 'AI adoption 45%', 'Cloud migration 78%'] },
    { letter: 'L', title: 'Legal', icon: Shield, color: 'bg-red-600', score: 3, impact: 'Neutral' as const, details: ['Luật An ninh mạng 2018', 'PDPD có hiệu lực 2024', 'Fintech sandbox', 'IP protection cần cải thiện'] },
    { letter: 'E', title: 'Environmental', icon: Leaf, color: 'bg-emerald-600', score: 3, impact: 'Neutral' as const, details: ['Net Zero 2050', 'Green financing $15B', 'ESG requirements tăng', 'Renewable 30% by 2030'] }
];

// PESTLE Item Component
const PESTLEItem: React.FC<{ 
    letter: string; title: string; icon: any; color: string; score: number;
    impact: 'Positive' | 'Negative' | 'Neutral'; details: string[];
}> = ({ letter, title, icon: Icon, color, score, impact, details }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const impactColors = {
        Positive: 'text-green-600 bg-green-100 dark:bg-green-900/30',
        Negative: 'text-red-600 bg-red-100 dark:bg-red-900/30',
        Neutral: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30'
    };
    
    return (
        <div className="bg-white dark:bg-[#0F1623] border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
            <div className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
                        <Icon size={24} className="text-white" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-black text-gray-400">{letter}</span>
                            <h4 className="font-bold text-gray-900 dark:text-white">{title}</h4>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                            <div className="flex items-center gap-1">
                                {[1,2,3,4,5].map(i => (
                                    <div key={i} className={`w-2 h-2 rounded-full ${i <= score ? color : 'bg-gray-200 dark:bg-gray-700'}`} />
                                ))}
                            </div>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${impactColors[impact]}`}>{impact}</span>
                        </div>
                    </div>
                </div>
                {isExpanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
            </div>
            {isExpanded && (
                <div className="px-5 pb-5 space-y-3 border-t border-gray-100 dark:border-gray-800 pt-4">
                    {details.map((detail, idx) => (
                        <div key={idx} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
                            <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{detail}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ==================== MAIN COMPONENT ====================

export const MarketIndustryPage: React.FC<MarketIndustryPageProps> = ({ userData, industry = 'Technology', market = 'Vietnam' }) => {
    const [activeSection, setActiveSection] = useState('overview');
    const [report, setReport] = useState<MarketIntelligenceReport | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Fetch market intelligence from backend
    const fetchMarketIntelligence = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            const response = await fetch('/api/market-intelligence', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userCompany: {
                        name: userData?.orgName || 'Unknown Company',
                        industry: userData?.industry || industry,
                        description: userData?.companyDescription || '',
                        products: userData?.productsServices || '',
                        location: userData?.hqCountry || 'Vietnam',
                        size: userData?.orgSize || '11-50'
                    },
                    selectedCompetitors: userData?.competitors?.filter((c: any) => c.selected) || []
                })
            });
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            
            const data = await response.json();
            setReport(data);
        } catch (err) {
            console.error('Market Intelligence fetch error:', err);
            setError(err instanceof Error ? err.message : 'Failed to load market intelligence');
        } finally {
            setIsLoading(false);
        }
    }, [userData, industry]);
    
    useEffect(() => {
        fetchMarketIntelligence();
    }, [fetchMarketIntelligence]);
    
    const sections = [
        { id: 'overview', label: 'Executive Summary' },
        { id: 'market-size', label: 'Market Size & Forecast' },
        { id: 'dynamics', label: 'Market Dynamics' },
        { id: 'landscape', label: 'Competitive Landscape' },
        { id: 'porters', label: "Porter's Five Forces" },
        { id: 'pestle', label: 'PESTLE Analysis' },
        { id: 'deals', label: 'Deals & Investments' },
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header with Actions */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                        Market & Industry
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Dynamic analysis for {report?.industry || industry} in {market}
                        {report && (
                            <span className="ml-2 text-green-600">
                                • {report.sources.industryPeersFound.toLocaleString()} companies analyzed
                            </span>
                        )}
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    <button 
                        onClick={fetchMarketIntelligence}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                        Refresh Data
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        <Download size={16} />
                        Export Report
                    </button>
                </div>
            </div>
            
            {/* Data Source Badge */}
            {report && (
                <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">
                    <Database size={14} className="text-blue-500" />
                    <span>
                        Data from <strong>{report.sources.competitorsAnalyzed}</strong> selected competitors and <strong>{report.sources.industryPeersFound.toLocaleString()}</strong> industry peers • 
                        Similarity threshold: {(report.sources.similarityThreshold * 100).toFixed(0)}% • 
                        Generated: {new Date(report.generatedAt).toLocaleString('vi-VN')}
                    </span>
                </div>
            )}
            
            {/* Section Navigation */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                <span className="text-sm text-gray-500 mr-2 flex-shrink-0">≡ Table of Contents</span>
                {sections.map(section => (
                    <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                            activeSection === section.id 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                    >
                        {section.label}
                    </button>
                ))}
            </div>
            
            {/* Loading State */}
            {isLoading && <LoadingSkeleton />}
            
            {/* Error State */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center">
                    <AlertTriangle className="mx-auto text-red-500 mb-3" size={32} />
                    <p className="text-red-600 font-medium">{error}</p>
                    <button 
                        onClick={fetchMarketIntelligence}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700"
                    >
                        Retry
                    </button>
                </div>
            )}
            
            {/* Content Sections - Only show when data is loaded */}
            {!isLoading && !error && report && (
                <>
                    {/* EXECUTIVE SUMMARY */}
                    {activeSection === 'overview' && (
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-[#0F1623] border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-1 h-8 bg-blue-600 rounded-full"></div>
                                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">Market & Industry: Executive Summary</h3>
                                </div>
                                
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                                    {report.executiveSummary.overview}
                                </p>
                                
                                {/* Key Metrics */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                    <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
                                        <p className="text-xs text-blue-600 font-medium mb-1">Market Size (2024)</p>
                                        <p className="text-2xl font-black text-gray-900 dark:text-white">{report.marketSize.sam}</p>
                                    </div>
                                    <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl">
                                        <p className="text-xs text-green-600 font-medium mb-1">CAGR</p>
                                        <p className="text-2xl font-black text-gray-900 dark:text-white">{report.marketSize.cagr}%</p>
                                    </div>
                                    <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl">
                                        <p className="text-xs text-purple-600 font-medium mb-1">Total Funding (2024)</p>
                                        <p className="text-2xl font-black text-gray-900 dark:text-white">{report.funding.totalValue}</p>
                                    </div>
                                    <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-xl">
                                        <p className="text-xs text-amber-600 font-medium mb-1">Industry Players</p>
                                        <p className="text-2xl font-black text-gray-900 dark:text-white">{report.companyCount.toLocaleString()}</p>
                                    </div>
                                </div>
                                
                                {/* Key Insights */}
                                <div className="mb-6">
                                    <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-3 flex items-center gap-2">
                                        <Lightbulb size={16} className="text-amber-500" />
                                        Key Insights (Based on Your Data)
                                    </h4>
                                    <div className="space-y-2">
                                        {report.executiveSummary.keyInsights.map((insight, idx) => (
                                            <div key={idx} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
                                                <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                                                <span>{insight}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                {/* Recommendations */}
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-3 flex items-center gap-2">
                                        <Target size={16} className="text-blue-500" />
                                        Strategic Recommendations for {userData?.orgName || 'Your Company'}
                                    </h4>
                                    <div className="space-y-3">
                                        {report.executiveSummary.recommendations.map((rec, idx) => (
                                            <div key={idx} className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                                    {idx + 1}
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-300">{rec}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* MARKET SIZE */}
                    {activeSection === 'market-size' && (
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-[#0F1623] border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                        <Target className="text-blue-600" size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white">TAM / SAM / SOM Analysis</h3>
                                        <p className="text-xs text-gray-500">{report.marketSize.methodology}</p>
                                    </div>
                                </div>
                                
                                <div className="grid lg:grid-cols-2 gap-8">
                                    <MarketSizeFunnel tam={report.marketSize.tam} sam={report.marketSize.sam} som={report.marketSize.som} />
                                    
                                    <div className="space-y-4">
                                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border-l-4 border-blue-500">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Globe size={16} className="text-blue-600" />
                                                <h5 className="font-bold text-gray-900 dark:text-white">TAM - Total Addressable Market</h5>
                                            </div>
                                            <p className="text-2xl font-black text-blue-600">{report.marketSize.tam}</p>
                                        </div>
                                        
                                        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border-l-4 border-purple-500">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Building2 size={16} className="text-purple-600" />
                                                <h5 className="font-bold text-gray-900 dark:text-white">SAM - Vietnam Market</h5>
                                            </div>
                                            <p className="text-2xl font-black text-purple-600">{report.marketSize.sam}</p>
                                        </div>
                                        
                                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border-l-4 border-green-500">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Target size={16} className="text-green-600" />
                                                <h5 className="font-bold text-gray-900 dark:text-white">SOM - Obtainable Target</h5>
                                            </div>
                                            <p className="text-2xl font-black text-green-600">{report.marketSize.som}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Revenue Chart */}
                            <div className="grid lg:grid-cols-2 gap-6">
                                <div className="bg-white dark:bg-[#0F1623] border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                            <BarChart3 className="text-green-600" size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white">Revenue Forecast</h3>
                                            <p className="text-xs text-gray-500">Historical & projected (USD Billion)</p>
                                        </div>
                                    </div>
                                    <RevenueChart data={report.marketSize.revenueHistory} years={report.marketSize.years} />
                                </div>
                                
                                <div className="bg-white dark:bg-[#0F1623] border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                            <TrendingUp className="text-amber-600" size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white">Growth Metrics</h3>
                                            <p className="text-xs text-gray-500">Key performance indicators</p>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm text-gray-600 dark:text-gray-300">CAGR ({report.marketSize.cagrPeriod})</span>
                                                <span className="text-xl font-black text-green-600">{report.marketSize.cagr}%</span>
                                            </div>
                                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full" style={{ width: `${report.marketSize.cagr * 3}%` }} />
                                            </div>
                                        </div>
                                        
                                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600 dark:text-gray-300">Current Size</span>
                                                <span className="text-xl font-black text-blue-600">${report.marketSize.currentSize.toFixed(1)}B</span>
                                            </div>
                                        </div>
                                        
                                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600 dark:text-gray-300">Forecast (5Y)</span>
                                                <span className="text-xl font-black text-purple-600">${report.marketSize.forecastSize.toFixed(1)}B</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* MARKET DYNAMICS */}
                    {activeSection === 'dynamics' && (
                        <div className="space-y-6">
                            <div className="grid lg:grid-cols-3 gap-6">
                                <DynamicsCard type="Growth Drivers" items={report.marketDynamics.drivers} icon={TrendingUp} color="bg-green-600" />
                                <DynamicsCard type="Restraints & Challenges" items={report.marketDynamics.restraints} icon={AlertTriangle} color="bg-red-600" />
                                <DynamicsCard type="Emerging Trends" items={report.marketDynamics.trends} icon={Zap} color="bg-purple-600" />
                            </div>
                            
                            <div className="bg-white dark:bg-[#0F1623] border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
                                <h4 className="font-bold text-gray-900 dark:text-white mb-4">Dynamics Summary</h4>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                                        <p className="text-3xl font-black text-green-600">{report.marketDynamics.drivers.length}</p>
                                        <p className="text-xs text-gray-500">Growth Drivers</p>
                                    </div>
                                    <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                                        <p className="text-3xl font-black text-red-600">{report.marketDynamics.restraints.length}</p>
                                        <p className="text-xs text-gray-500">Restraints</p>
                                    </div>
                                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                                        <p className="text-3xl font-black text-purple-600">{report.marketDynamics.trends.length}</p>
                                        <p className="text-xs text-gray-500">Trends</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* COMPETITIVE LANDSCAPE */}
                    {activeSection === 'landscape' && (
                        <div className="space-y-6">
                            <div className="grid lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 bg-white dark:bg-[#0F1623] border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                            <PieChart className="text-blue-600" size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white">Market Share Distribution</h3>
                                            <p className="text-xs text-gray-500">Based on similarity analysis of {report.sources.competitorsAnalyzed} competitors</p>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        {report.competitiveLandscape.marketShare.map((item, idx) => {
                                            const colors = ['bg-blue-600', 'bg-purple-600', 'bg-green-600', 'bg-amber-600', 'bg-red-600', 'bg-gray-400'];
                                            return (
                                                <div key={idx} className="space-y-1">
                                                    <div className="flex justify-between text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-3 h-3 rounded-full ${colors[idx % colors.length]}`}></div>
                                                            <span className="text-gray-700 dark:text-gray-300 font-medium">{item.name}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-xs text-green-600 flex items-center gap-1">
                                                                <TrendingUp size={12} />+{item.growth}%
                                                            </span>
                                                            <span className="font-bold text-gray-900 dark:text-white w-12 text-right">{item.share}%</span>
                                                        </div>
                                                    </div>
                                                    <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                                        <div className={`h-full ${colors[idx % colors.length]} rounded-full`} style={{ width: `${item.share}%` }} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                
                                <div className="bg-white dark:bg-[#0F1623] border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                            <Gauge className="text-amber-600" size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white">Concentration</h3>
                                            <p className="text-xs text-gray-500">HHI Index analysis</p>
                                        </div>
                                    </div>
                                    
                                    <ConcentrationGauge level={report.competitiveLandscape.concentration.level} hhi={report.competitiveLandscape.concentration.hhi} />
                                    
                                    <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-gray-500">CR4 (Top 4)</span>
                                            <span className="font-bold text-gray-900 dark:text-white">{report.competitiveLandscape.concentration.cr4}%</span>
                                        </div>
                                        <p className="text-xs text-gray-500">{report.competitiveLandscape.concentration.description}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white dark:bg-[#0F1623] border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                        <BarChart3 className="text-purple-600" size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white">Competitive Position Matrix</h3>
                                        <p className="text-xs text-gray-500">BCG-style analysis based on similarity scores</p>
                                    </div>
                                </div>
                                <CompetitorMatrix companies={report.competitiveLandscape.marketShare} />
                            </div>
                        </div>
                    )}
                    
                    {/* PORTER'S FIVE FORCES */}
                    {activeSection === 'porters' && (
                        <div className="bg-white dark:bg-[#0F1623] border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                    <Activity className="text-indigo-600" size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">Porter's Five Forces Analysis</h3>
                                    <p className="text-xs text-gray-500">Industry competitive intensity for {report.industry} in {market}</p>
                                </div>
                            </div>
                            
                            <PortersFiveForces forces={report.portersForces} />
                            
                            <div className="mt-8 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl">
                                <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                    <Info size={16} className="text-indigo-600" />
                                    Analysis Summary
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    Based on analysis of {report.sources.industryPeersFound.toLocaleString()} industry players and {report.sources.competitorsAnalyzed} direct competitors. 
                                    Overall rivalry score: {report.portersForces.rivalry.score}/5 - {report.portersForces.rivalry.description}
                                </p>
                            </div>
                        </div>
                    )}
                    
                    {/* PESTLE */}
                    {activeSection === 'pestle' && (
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-[#0F1623] border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                        <Globe className="text-indigo-600" size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white">PESTLE Overview</h3>
                                        <p className="text-xs text-gray-500">Macro-environmental analysis for {market}</p>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                                    {getPESTLEData(report.industry).map((item, idx) => (
                                        <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-center">
                                            <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mx-auto mb-3`}>
                                                <item.icon size={24} className="text-white" />
                                            </div>
                                            <h4 className="font-bold text-gray-900 dark:text-white text-sm">{item.title}</h4>
                                            <span className={`text-xs font-bold mt-2 inline-block ${
                                                item.impact === 'Positive' ? 'text-green-600' : 'text-amber-600'
                                            }`}>{item.impact}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="grid lg:grid-cols-2 gap-4">
                                {getPESTLEData(report.industry).map((item, idx) => (
                                    <PESTLEItem key={idx} {...item} />
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {/* DEALS & INVESTMENTS */}
                    {activeSection === 'deals' && (
                        <div className="space-y-6">
                            <div className="grid lg:grid-cols-4 gap-4">
                                <div className="bg-white dark:bg-[#0F1623] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 text-center">
                                    <DollarSign className="mx-auto text-green-600 mb-2" size={28} />
                                    <p className="text-3xl font-black text-gray-900 dark:text-white">{report.funding.totalValue}</p>
                                    <p className="text-xs text-gray-500">Total Funding (2024)</p>
                                </div>
                                <div className="bg-white dark:bg-[#0F1623] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 text-center">
                                    <Handshake className="mx-auto text-blue-600 mb-2" size={28} />
                                    <p className="text-3xl font-black text-gray-900 dark:text-white">{report.funding.totalDeals}</p>
                                    <p className="text-xs text-gray-500">Total Deals</p>
                                </div>
                                <div className="bg-white dark:bg-[#0F1623] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 text-center">
                                    <TrendingUp className="mx-auto text-green-600 mb-2" size={28} />
                                    <p className="text-3xl font-black text-green-600">+{report.funding.yoyGrowth}%</p>
                                    <p className="text-xs text-gray-500">YoY Growth</p>
                                </div>
                                <div className="bg-white dark:bg-[#0F1623] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 text-center">
                                    <BarChart2 className="mx-auto text-purple-600 mb-2" size={28} />
                                    <p className="text-3xl font-black text-gray-900 dark:text-white">{report.funding.avgDealSize}</p>
                                    <p className="text-xs text-gray-500">Avg Deal Size</p>
                                </div>
                            </div>
                            
                            <div className="grid lg:grid-cols-2 gap-6">
                                <div className="bg-white dark:bg-[#0F1623] border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                            <Coins className="text-green-600" size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white">Funding by Sector</h3>
                                            <p className="text-xs text-gray-500">Where capital is flowing</p>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        {report.funding.topSectors.map((sector, idx) => {
                                            const colors = ['bg-blue-600', 'bg-purple-600', 'bg-orange-600', 'bg-green-600', 'bg-red-600', 'bg-gray-400'];
                                            return (
                                                <div key={idx} className="space-y-1">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-700 dark:text-gray-300 font-medium">{sector.name}</span>
                                                        <span className="font-bold text-gray-900 dark:text-white">{sector.percentage}%</span>
                                                    </div>
                                                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                                        <div className={`h-full ${colors[idx % colors.length]} rounded-full`} style={{ width: `${sector.percentage}%` }} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                
                                <div className="bg-white dark:bg-[#0F1623] border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                            <Briefcase className="text-purple-600" size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white">Recent Notable Deals</h3>
                                            <p className="text-xs text-gray-500">Based on your competitors</p>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-3 max-h-[400px] overflow-y-auto no-scrollbar">
                                        {report.funding.recentDeals.map((deal, idx) => (
                                            <DealCard key={idx} deal={deal} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default MarketIndustryPage;
