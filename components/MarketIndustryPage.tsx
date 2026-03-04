/**
 * ðŸŒ Market & Industry Page - Dynamic Enterprise Market Intelligence
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

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
    ChevronDown, ChevronUp, TrendingUp, Globe, Building2,
    Scale, Leaf, Cpu, Shield, BarChart3, PieChart, Users,
    DollarSign, Target, Zap, AlertTriangle, CheckCircle, Info,
    Download, Activity, Briefcase, Factory, ShoppingCart,
    Repeat, Gauge, BarChart2, Lightbulb, Handshake, Coins, Rocket,
    RefreshCw, Database, X, FileText, FileJson, Highlighter,
    StickyNote, Copy, Check, Printer, Bookmark, BookmarkCheck,
    Eye
} from 'lucide-react';
import { exportMarketReport } from '../utils/exportReport';
import { exportMarketReportHTML, exportMarketReportJSON } from '../utils/exportMarketReportHTML';
import { sessionCacheGet, sessionCacheSet } from '../utils/sessionCache';
import { parseSimpleMarkdown } from '../utils/parseSimpleMarkdown';

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
        selectedCompetitorNames?: string[];
        dataSources?: string[];
    };
}

// ==================== SECTION COMPONENTS ====================

// Loading Skeleton â€” Executive Crimson
const LoadingSkeleton = () => (
    <div className="space-y-8 animate-fade-in">
        {/* Premium branded loader */}
        <div className="flex flex-col items-center justify-center py-16 gap-6">
            <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-[#FFF1F2]" />
                <div className="absolute inset-0 rounded-full border-4 border-t-[#E11D48] animate-spin" />
                <div className="absolute inset-3 rounded-full bg-gradient-to-br from-[#E11D48] to-[#F97316] animate-pulse" />
            </div>
            <div className="text-center space-y-1.5">
                <p className="text-sm font-semibold text-[#18181B]">Crunching real-time market dataâ€¦</p>
                <p className="text-xs text-[#A1A1AA]">Analyzing 10,000+ companies across Vietnam</p>
            </div>
        </div>
        {/* Skeleton blocks */}
        <div className="animate-pulse space-y-6">
            <div className="h-8 bg-[#E4E4E7] rounded w-1/3"></div>
            <div className="grid grid-cols-4 gap-4">
                {[1,2,3,4].map(i => (
                    <div key={i} className="h-24 bg-[#E4E4E7] rounded-xl"></div>
                ))}
            </div>
            <div className="h-64 bg-[#E4E4E7] rounded-xl"></div>
        </div>
    </div>
);

// TAM/SAM/SOM Funnel Visualization
const MarketSizeFunnel = ({ tam, sam, som }: { tam: string; sam: string; som: string }) => (
    <div className="relative py-8">
        <div className="flex flex-col items-center gap-1">
            <div className="relative w-full max-w-md">
                <div className="h-16 bg-gradient-to-r from-[#E11D48] to-[#BE123C] rounded-t-3xl flex items-center justify-center shadow-lg">
                    <div className="text-center text-white">
                        <p className="text-xs font-medium opacity-80">TAM - Total Addressable Market</p>
                        <p className="text-xl font-black">{tam}</p>
                    </div>
                </div>
            </div>
            <div className="relative w-4/5 max-w-sm">
                <div className="h-16 bg-gradient-to-r from-[#F97316] to-[#EA580C] flex items-center justify-center shadow-lg">
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
                            <span className="text-xs font-bold text-[#18181B]">${value.toFixed(1)}B</span>
                            <div 
                                className={`w-full rounded-t-lg transition-all ${
                                    isCurrent ? 'bg-gradient-to-t from-blue-600 to-blue-400 shadow-lg shadow-blue-500/30' :
                                    isHistorical ? 'bg-[#D4D4D8]' : 
                                    'bg-gradient-to-t from-green-500 to-green-400'
                                }`}
                                style={{ height: `${(value / maxValue) * 100}%`, minHeight: '20px' }}
                            />
                            <span className={`text-[10px] ${isCurrent ? 'font-bold text-[#E11D48]' : 'text-[#71717A]'}`}>{years[idx]}</span>
                        </div>
                    );
                })}
            </div>
            <div className="flex justify-center gap-6 text-xs">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-[#D4D4D8]"></div>
                    <span className="text-[#71717A]">Historical</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-blue-500"></div>
                    <span className="text-[#71717A]">Current</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-green-500"></div>
                    <span className="text-[#71717A]">Forecast</span>
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
        High: 'bg-red-100 text-red-700',
        Medium: 'bg-amber-100 text-amber-700',
        Low: 'bg-green-100 text-green-700'
    };
    
    return (
        <div className="bg-white border border-[#E4E4E7] rounded-2xl overflow-hidden">
            <div 
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-[#FAFAFA]"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
                        <Icon className="text-white" size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-[#18181B]">{type}</h4>
                        <p className="text-xs text-[#71717A]">{items.length} factors identified</p>
                    </div>
                </div>
                {isExpanded ? <ChevronUp size={20} className="text-[#A1A1AA]" /> : <ChevronDown size={20} className="text-[#A1A1AA]" />}
            </div>
            
            {isExpanded && (
                <div className="px-5 pb-5 space-y-3 border-t border-[#E4E4E7] pt-4">
                    {items.map((item, idx) => (
                        <div key={idx} className="p-4 bg-[#FAFAFA] rounded-xl">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                    <h5 className="font-semibold text-[#18181B] text-sm">{item.title}</h5>
                                    <p className="text-xs text-[#71717A] mt-1">{item.description}</p>
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
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#E11D48] to-[#7C3AED] flex items-center justify-center shadow-xl">
                    <div className="text-center text-white">
                        <Activity size={28} className="mx-auto mb-1" />
                        <p className="text-xs font-bold">Rivalry<br/>{forces.rivalry.score}/5</p>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {forcesList.map((force, idx) => {
                    const scoreColor = force.score >= 4 ? 'text-red-600' : force.score >= 3 ? 'text-amber-600' : 'text-green-600';
                    const bgColor = force.score >= 4 ? 'bg-red-50' : force.score >= 3 ? 'bg-amber-50' : 'bg-green-50';
                    return (
                        <div key={idx} className={`p-4 rounded-xl ${bgColor} border border-[#E4E4E7]`}>
                            <div className="flex items-center gap-2 mb-2">
                                <force.icon size={18} className={scoreColor} />
                                <h5 className="font-bold text-[#18181B] text-sm">{force.name}</h5>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                                {[1,2,3,4,5].map(i => (
                                    <div 
                                        key={i} 
                                        className={`w-4 h-2 rounded-full ${i <= force.score ? (force.score >= 4 ? 'bg-red-500' : force.score >= 3 ? 'bg-amber-500' : 'bg-green-500') : 'bg-[#E4E4E7]'}`}
                                    />
                                ))}
                                <span className={`text-sm font-bold ${scoreColor}`}>{force.score}/5</span>
                            </div>
                            <p className="text-[11px] text-[#71717A]">{force.description}</p>
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
        <div className="relative h-80 bg-[#FAFAFA] rounded-2xl p-6">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 text-xs font-medium text-[#A1A1AA] whitespace-nowrap">
                Market Growth Rate â†’
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-xs font-medium text-[#A1A1AA]">
                Relative Market Share â†’
            </div>
            
            <div className="absolute inset-8 grid grid-cols-2 grid-rows-2 gap-1">
                <div className="bg-green-100/50 rounded-tl-xl flex items-center justify-center">
                    <span className="text-xs text-green-600 font-medium">Stars</span>
                </div>
                <div className="bg-amber-100/50 rounded-tr-xl flex items-center justify-center">
                    <span className="text-xs text-amber-600 font-medium">Question Marks</span>
                </div>
                <div className="bg-[#FFF1F2]/50 rounded-bl-xl flex items-center justify-center">
                    <span className="text-xs text-[#E11D48] font-medium">Cash Cows</span>
                </div>
                <div className="bg-[#E4E4E7]/50 rounded-br-xl flex items-center justify-center">
                    <span className="text-xs text-[#71717A] font-medium">Dogs</span>
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
        'M&A': 'bg-[#FFF1F2] text-[#E11D48]',
        'Series A': 'bg-green-100 text-green-700',
        'Series B': 'bg-[#FFF1F2] text-[#E11D48]',
        'Series C': 'bg-[#FFF1F2] text-[#BE123C]',
        'IPO': 'bg-amber-100 text-amber-700',
        'PE': 'bg-red-100 text-red-700'
    };
    
    return (
        <div className="p-4 bg-[#FAFAFA] rounded-xl hover:shadow-lg transition-all">
            <div className="flex items-start justify-between gap-3 mb-3">
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${typeColors[deal.type] || 'bg-[#F4F4F5] text-[#18181B]'}`}>
                    {deal.type}
                </span>
                <span className="text-xs text-[#71717A]">{deal.date}</span>
            </div>
            <h5 className="font-bold text-[#18181B] text-sm mb-1">{deal.title}</h5>
            <p className="text-xs text-[#71717A] mb-2">{deal.parties}</p>
            <span className="text-lg font-black text-green-600">{deal.value}</span>
            <p className="text-[11px] text-[#A1A1AA] mt-2">{deal.description}</p>
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
                    <circle cx="64" cy="64" r="56" fill="none" stroke="currentColor" strokeWidth="12" className="text-[#A1A1AA]" />
                    <circle 
                        cx="64" cy="64" r="56" fill="none" stroke="currentColor" strokeWidth="12" 
                        className={getColor()}
                        strokeDasharray={`${(hhi / 10000) * 352} 352`}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-2xl font-black ${getColor()}`}>{hhi}</span>
                    <span className="text-[10px] text-[#71717A]">HHI Index</span>
                </div>
            </div>
            <p className={`mt-3 font-bold ${getColor()}`}>{level}</p>
            <p className="text-xs text-[#71717A]">Market Concentration</p>
        </div>
    );
};

// PESTLE data â€” varies by industry and includes company context
const getPESTLEData = (industry: string) => {
    const industrySpecific: Record<string, { pDetails: string[]; eDetails: string[]; sDetails: string[]; tDetails: string[]; lDetails: string[]; envDetails: string[] }> = {
        'Technology': {
            pDetails: ['QD 749: Chuyen doi so quoc gia 2025-2030', 'Uu dai thue cho DN cong nghe cao', 'Chinh tri on dinh, FTA: RCEP, CPTPP, EVFTA', 'Ngan sach $2B cho digital infrastructure'],
            eDetails: ['GDP tang 6.5%, kinh te so 16.5% GDP', 'FDI dang ky $36.6B (2024)', 'Tang lop trung luu 33 trieu', 'Outsourcing hub top 6 toan cau'],
            sDetails: ['79.1M nguoi dung internet (78.4%)', '72.7M smartphone users', 'Median age 31.9 tuoi', '530,000+ lap trinh vien'],
            tDetails: ['5G phu song 63 tinh', 'AI market uoc $700M (2025)', '3,800+ tech startups', 'Cloud migration tang 78%'],
            lDetails: ['Luat An ninh mang 2018', 'ND 13/2023: Data localization', 'Sandbox fintech', 'PDPD co hieu luc 2024'],
            envDetails: ['Net Zero 2050', 'Green IT chiem 12% ngan sach CNTT', 'ESG compliance bat buoc', 'Renewable 30% den 2030']
        },
        'Finance': {
            pDetails: ['NHNN khuyen khich so hoa (QD 810)', '69% chua su dung ngan hang day du', 'Sandbox fintech regulation', 'Chinh sach tien te on dinh'],
            eDetails: ['85 trieu tai khoan mobile banking', 'E-wallet GMV tang 65% YoY', 'NPL ratio 4.55% (Q3/2024)', 'FDI nganh tai chinh tang'],
            sDetails: ['48M vi dien tu', 'Gen Z/Millennial digital-first', 'BNPL tang 180% GMV', 'Financial literacy dang tang'],
            tDetails: ['Open Banking pilot voi NAPAS', 'AI credit scoring pho bien', 'Blockchain/DeFi thi nghiem', 'eKYC bat buoc'],
            lDetails: ['ND 101/2024 that chat P2P', 'Cap phep e-wallet 12-18 thang', 'AML/CFT nang cao', 'Basel III trien khai'],
            envDetails: ['Green bond thi truong $15B', 'ESG cho ngan hang 2025', 'Sustainable finance framework', 'Carbon credit trading']
        },
        'Retail': {
            pDetails: ['VECOM ho tro e-commerce', 'FTA giam thue xuat nhap khau 0-5%', 'Chinh sach bao ve nguoi tieu dung', 'Uu dai DN vua va nho'],
            eDetails: ['E-commerce GMV $20.5B (2024)', 'Tang lop trung luu 33 trieu -> 50 trieu', 'Bien loi nhuan ban le 2-5%', 'Social commerce tang 300%'],
            sDetails: ['55% mua hang qua social media', 'Livestream selling bung no', 'Quick commerce 30 phut', '75% ung ho hang Viet chat luong'],
            tDetails: ['Shopee, Lazada, TikTok Shop chiem 90%', 'Omnichannel retail mo rong', 'AI personalization', 'Dark store logistics'],
            lDetails: ['Bao ve quyen nguoi tieu dung', 'Quy dinh e-commerce moi', 'Thue san thuong mai dien tu', 'IP enforcement'],
            envDetails: ['Bao bi xanh bat buoc', 'Circular economy', 'Tieu dung ben vung tang', 'Carbon footprint labeling']
        },
        'Healthcare': {
            pDetails: ['Chi tieu y te tang 12% YoY', 'Ho so suc khoe dien tu 2025', 'Bao hiem y te pho cap', 'Chinh sach telehealth'],
            eDetails: ['Tong chi y te $20B (5.5% GDP)', 'Healthtech market $1.2B', '120+ healthtech startups', 'Medical tourism tang'],
            sDetails: ['12.8% dan so tren 60 tuoi', 'Nhu cau cham soc man tinh tang', '50,000+ benh nhan quoc te/nam', 'Nhan thuc suc khoe tang'],
            tDetails: ['Telehealth post-COVID tang 35%', '45% benh vien da so hoa', 'AI diagnostics', 'Wearable health devices'],
            lDetails: ['Quy dinh thiet bi y te', 'Data privacy y te', 'Sandbox healthtech', 'Quy dinh duoc pham'],
            envDetails: ['Xu ly chat thai y te', 'Green hospital', 'Sustainable pharma', 'Vaccine cold chain green']
        }
    };

    const data = industrySpecific[industry] || {
        pDetails: ['Chinh phu ho tro nganh ' + industry, 'On dinh chinh tri', 'FTA: RCEP, CPTPP, EVFTA', 'Quy hoach nganh 2025-2030'],
        eDetails: ['GDP tang 6.5%', 'Tang lop trung luu 33 trieu', 'FDI tang 32% YoY', 'Lam phat kiem soat 3.5%'],
        sDetails: ['70% dan so duoi 35 tuoi', 'Internet 78%, Smartphone 85%', 'Thi truong 100M dan', 'Digital adoption cao'],
        tDetails: ['5G phu song 63 tinh', 'AI adoption tang', 'Cloud migration 78%', 'Startup ecosystem phat trien'],
        lDetails: ['Luat An ninh mang 2018', 'PDPD co hieu luc 2024', 'IP protection can cai thien', 'Quy dinh nganh cap nhat'],
        envDetails: ['Net Zero 2050', 'Green financing $15B', 'ESG requirements tang', 'Renewable 30% den 2030']
    };

    return [
        { letter: 'P', title: 'Political', icon: Scale, color: 'bg-rose-600', score: 4, impact: 'Positive' as const, details: data.pDetails },
        { letter: 'E', title: 'Economic', icon: DollarSign, color: 'bg-green-600', score: 4, impact: 'Positive' as const, details: data.eDetails },
        { letter: 'S', title: 'Social', icon: Users, color: 'bg-orange-600', score: 5, impact: 'Positive' as const, details: data.sDetails },
        { letter: 'T', title: 'Technological', icon: Cpu, color: 'bg-orange-600', score: 4, impact: 'Positive' as const, details: data.tDetails },
        { letter: 'L', title: 'Legal', icon: Shield, color: 'bg-red-600', score: 3, impact: 'Neutral' as const, details: data.lDetails },
        { letter: 'E', title: 'Environmental', icon: Leaf, color: 'bg-emerald-600', score: 3, impact: 'Neutral' as const, details: data.envDetails }
    ];
};

// PESTLE Item Component
const PESTLEItem: React.FC<{ 
    letter: string; title: string; icon: any; color: string; score: number;
    impact: 'Positive' | 'Negative' | 'Neutral'; details: string[];
}> = ({ letter, title, icon: Icon, color, score, impact, details }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const impactColors = {
        Positive: 'text-green-600 bg-green-100',
        Negative: 'text-red-600 bg-red-100',
        Neutral: 'text-amber-600 bg-amber-100'
    };
    
    return (
        <div className="bg-white border border-[#E4E4E7] rounded-2xl overflow-hidden">
            <div className="p-5 flex items-center justify-between cursor-pointer hover:bg-[#FAFAFA]" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
                        <Icon size={24} className="text-white" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-black text-[#A1A1AA]">{letter}</span>
                            <h4 className="font-bold text-[#18181B]">{title}</h4>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                            <div className="flex items-center gap-1">
                                {[1,2,3,4,5].map(i => (
                                    <div key={i} className={`w-2 h-2 rounded-full ${i <= score ? color : 'bg-[#E4E4E7]'}`} />
                                ))}
                            </div>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${impactColors[impact]}`}>{impact}</span>
                        </div>
                    </div>
                </div>
                {isExpanded ? <ChevronUp size={20} className="text-[#A1A1AA]" /> : <ChevronDown size={20} className="text-[#A1A1AA]" />}
            </div>
            {isExpanded && (
                <div className="px-5 pb-5 space-y-3 border-t border-[#E4E4E7] pt-4">
                    {details.map((detail, idx) => (
                        <div key={idx} className="flex items-start gap-3 text-sm text-[#71717A]">
                            <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{detail}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ==================== EXPORT MODAL ====================

const ExportModal: React.FC<{
    report: MarketIntelligenceReport;
    companyName?: string;
    onClose: () => void;
}> = ({ report, companyName, onClose }) => {
    const [exporting, setExporting] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose]);

    const handleExport = async (type: 'html' | 'txt' | 'json') => {
        setExporting(type);
        setSuccess(null);
        // Small delay for UX
        await new Promise(r => setTimeout(r, 400));
        try {
            if (type === 'html') exportMarketReportHTML(report, companyName);
            else if (type === 'json') exportMarketReportJSON(report);
            else exportMarketReport(report);
            setSuccess(type);
        } catch (e) {
            console.error('Export failed:', e);
        } finally {
            setExporting(null);
        }
    };

    const formats = [
        {
            key: 'html' as const,
            title: 'Premium HTML Report',
            desc: 'Beautiful branded VICO report â€” open in browser or print to PDF',
            icon: FileText,
            color: 'bg-gradient-to-br from-[#E11D48] to-[#BE123C]',
            recommended: true,
        },
        {
            key: 'txt' as const,
            title: 'Plain Text Report',
            desc: 'Plain text format â€” easy to copy/paste into email or documents',
            icon: FileText,
            color: 'bg-gradient-to-br from-[#3F3F46] to-[#18181B]',
            recommended: false,
        },
        {
            key: 'json' as const,
            title: 'JSON (Machine-Readable)',
            desc: 'Raw data â€” for system integrations or advanced analysis',
            icon: FileJson,
            color: 'bg-gradient-to-br from-[#7C3AED] to-[#6D28D9]',
            recommended: false,
        },
    ];

    return (
        <>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-[#E4E4E7]">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#FFF1F2] flex items-center justify-center">
                                <Download size={20} className="text-[#E11D48]" />
                            </div>
                            <div>
                                <h3 className="font-bold text-[#18181B]">Export Report</h3>
                                <p className="text-xs text-[#A1A1AA]">Choose export format</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#F4F4F5]:bg-gray-800 text-[#A1A1AA] hover:text-[#18181B] transition-colors">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Format Options */}
                    <div className="p-6 space-y-3">
                        {formats.map(fmt => {
                            const Icon = fmt.icon;
                            const isExporting = exporting === fmt.key;
                            const isDone = success === fmt.key;
                            return (
                                <button
                                    key={fmt.key}
                                    onClick={() => handleExport(fmt.key)}
                                    disabled={!!exporting}
                                    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left group ${
                                        isDone
                                            ? 'border-green-300 bg-green-50'
                                            : 'border-[#E4E4E7] hover:border-[#E11D48]/30 hover:bg-[#FFF1F2]/50:bg-[#E11D48]/5'
                                    } disabled:opacity-50`}
                                >
                                    <div className={`w-12 h-12 rounded-xl ${fmt.color} flex items-center justify-center shrink-0`}>
                                        {isExporting ? (
                                            <RefreshCw size={20} className="text-white animate-spin" />
                                        ) : isDone ? (
                                            <Check size={20} className="text-white" />
                                        ) : (
                                            <Icon size={20} className="text-white" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-sm text-[#18181B]">{fmt.title}</span>
                                            {fmt.recommended && (
                                                <span className="px-2 py-0.5 rounded-full bg-[#FFF1F2] text-[#E11D48] text-[9px] font-bold">Recommended</span>
                                            )}
                                        </div>
                                        <p className="text-xs text-[#71717A] mt-0.5">{fmt.desc}</p>
                                    </div>
                                    {isDone && (
                                        <Check size={16} className="text-green-600 shrink-0" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-3 bg-[#FAFAFA] border-t border-[#E4E4E7] flex items-center justify-between">
                        <span className="text-[10px] text-[#A1A1AA]">VICO Intelligence Â· {report.industry} Â· {report.market}</span>
                        <button onClick={onClose} className="text-xs font-semibold text-[#71717A] hover:text-[#18181B] transition-colors">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

// ==================== COPY METRIC BUTTON ====================

const CopyMetricBtn: React.FC<{ value: string; label?: string }> = ({ value, label }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(`${label ? label + ': ' : ''}${value}`);
        } catch {
            const ta = document.createElement('textarea');
            ta.value = `${label ? label + ': ' : ''}${value}`;
            document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };
    return (
        <button
            onClick={handleCopy}
            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[#F4F4F5]:bg-gray-800 text-[#A1A1AA] hover:text-[#E11D48] transition-all ml-1"
            title="Copy"
        >
            {copied ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
        </button>
    );
};

// ==================== SECTION NOTE COMPONENT ====================

const SectionNote: React.FC<{ sectionId: string }> = ({ sectionId }) => {
    const storageKey = `vico_market_note_${sectionId}`;
    const [isOpen, setIsOpen] = useState(false);
    const [note, setNote] = useState(() => {
        try { return localStorage.getItem(storageKey) || ''; } catch { return ''; }
    });
    const [saved, setSaved] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (isOpen && textareaRef.current) textareaRef.current.focus();
    }, [isOpen]);

    const handleSave = () => {
        try { localStorage.setItem(storageKey, note); } catch {}
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
    };

    const handleClear = () => {
        setNote('');
        try { localStorage.removeItem(storageKey); } catch {}
    };

    return (
        <div className="inline-flex items-center">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-1.5 rounded-lg transition-colors ${
                    note
                        ? 'bg-amber-50 text-amber-500'
                        : 'hover:bg-[#F4F4F5]:bg-gray-800 text-[#A1A1AA] hover:text-[#71717A]'
                }`}
                title={note ? 'View notes' : 'Add note'}
            >
                <StickyNote size={14} />
            </button>

            {isOpen && (
                <div className="absolute z-40 mt-1 right-0 top-full w-72 bg-white rounded-xl border border-[#E4E4E7] shadow-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#18181B] flex items-center gap-1.5">
                            <StickyNote size={12} className="text-amber-500" /> Personal Notes
                        </span>
                        <button onClick={() => setIsOpen(false)} className="p-1 rounded hover:bg-[#F4F4F5]:bg-gray-800 text-[#A1A1AA]">
                            <X size={12} />
                        </button>
                    </div>
                    <textarea
                        ref={textareaRef}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Write a note for this section..."
                        className="w-full h-20 text-xs text-[#18181B] bg-[#FAFAFA] rounded-lg border border-[#E4E4E7] p-2.5 resize-none focus:outline-none focus:ring-1 focus:ring-[#E11D48]/30 placeholder:text-[#A1A1AA]"
                    />
                    <div className="flex items-center justify-between">
                        <button onClick={handleClear} className="text-[10px] text-[#A1A1AA] hover:text-[#991B1B] transition-colors">
                            Clear
                        </button>
                        <button
                            onClick={handleSave}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[#E11D48] text-white text-[10px] font-semibold hover:bg-[#BE123C] transition-colors"
                        >
                            {saved ? <><Check size={10} /> Saved</> : 'Save Note'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// ==================== MAIN COMPONENT ====================

export const MarketIndustryPage: React.FC<MarketIndustryPageProps> = ({ userData, industry = 'Technology', market = 'Vietnam' }) => {
    // Build a cache key based on user's company + selected competitors to avoid stale data
    const cacheKey = useMemo(() => {
        const compNames = (userData?.competitors?.filter((c: any) => c.selected)?.map((c: any) => c.name) || []).sort().join(',');
        return `market_report_${userData?.orgName || ''}_${compNames}`;
    }, [userData]);

    const [activeSection, setActiveSection] = useState('overview');
    const [report, setReport] = useState<MarketIntelligenceReport | null>(() => sessionCacheGet<MarketIntelligenceReport>(cacheKey));
    const [isLoading, setIsLoading] = useState(!sessionCacheGet(cacheKey));
    const [error, setError] = useState<string | null>(null);
    const [isPageReady, setIsPageReady] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [highlightMode, setHighlightMode] = useState(false);
    const [bookmarkedSections, setBookmarkedSections] = useState<Set<string>>(() => {
        try {
            const saved = localStorage.getItem('vico_market_bookmarks');
            return saved ? new Set(JSON.parse(saved)) : new Set<string>();
        } catch { return new Set<string>(); }
    });

    const toggleBookmarkSection = useCallback((sectionId: string) => {
        setBookmarkedSections(prev => {
            const next = new Set(prev);
            if (next.has(sectionId)) next.delete(sectionId);
            else next.add(sectionId);
            try { localStorage.setItem('vico_market_bookmarks', JSON.stringify([...next])); } catch {}
            return next;
        });
    }, []);
    
    // Artificial minimum load time â€” "crunching data" feel
    useEffect(() => {
        const t = setTimeout(() => setIsPageReady(true), 1800);
        return () => clearTimeout(t);
    }, []);
    
    // Fetch market intelligence from backend (with 30s timeout)
    const fetchMarketIntelligence = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);
        
        try {
            const response = await fetch('/api/market-intelligence', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                signal: controller.signal,
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
            sessionCacheSet(cacheKey, data);
        } catch (err) {
            console.error('Market Intelligence fetch error:', err);
            if (err instanceof DOMException && err.name === 'AbortError') {
                setError('Request timed out (30s). The server may be overloaded.');
            } else {
                setError(err instanceof Error ? err.message : 'Unable to load market data');
            }
        } finally {
            clearTimeout(timeoutId);
            setIsLoading(false);
        }
    }, [userData, industry, cacheKey]);
    
    useEffect(() => {
        // Skip fetch if we already have cached data
        if (!report) fetchMarketIntelligence();
    }, [fetchMarketIntelligence, report]);
    
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
                    <h1 className="text-3xl font-black text-[#18181B] uppercase tracking-tight">
                        Market & Industry
                    </h1>
                    <p className="text-[#71717A] text-sm mt-1">
                        Dynamic analysis for {report?.industry || industry} in {market}
                        {report && (
                            <span className="ml-2 text-green-600">
                                â€¢ {report.sources.industryPeersFound.toLocaleString()} companies analyzed
                            </span>
                        )}
                    </p>
                </div>
                
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Highlight mode toggle */}
                    <button
                        onClick={() => setHighlightMode(!highlightMode)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                            highlightMode
                                ? 'bg-amber-100 text-amber-700 border border-amber-300 shadow-sm'
                                : 'bg-[#F4F4F5] text-[#71717A] hover:bg-[#E4E4E7]:bg-gray-700 border border-transparent'
                        }`}
                        title={highlightMode ? 'Turn off highlighting' : 'Highlight key metrics'}
                    >
                        <Highlighter size={14} />
                        {highlightMode ? 'Highlight ON' : 'Highlight'}
                    </button>

                    {/* Print button */}
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-1.5 px-3 py-2 bg-[#F4F4F5] rounded-xl text-xs font-semibold text-[#71717A] hover:bg-[#E4E4E7]:bg-gray-700 transition-colors"
                        title="Print page"
                    >
                        <Printer size={14} />
                        Print
                    </button>

                    {/* Refresh */}
                    <button 
                        onClick={fetchMarketIntelligence}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-[#E11D48] hover:bg-[#BE123C] text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                        Refresh
                    </button>

                    {/* Export â€” opens modal */}
                    <button
                        onClick={() => setShowExportModal(true)}
                        disabled={!report}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#E11D48] to-[#BE123C] hover:from-[#BE123C] hover:to-[#991B1B] text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                    >
                        <Download size={16} />
                        Export Report
                    </button>
                </div>
            </div>
            
            {/* Data Source Badge */}
            {report && (
                <div className="flex flex-col gap-1.5 text-xs text-[#71717A] bg-[#FAFAFA] p-3 rounded-xl">
                    <div className="flex items-center gap-2">
                        <Database size={14} className="text-[#E11D48]" />
                        <span>
                            Data from <strong>{report.sources.competitorsAnalyzed}</strong> selected competitors and <strong>{report.sources.industryPeersFound.toLocaleString()}</strong> industry peers â€¢ 
                            Similarity threshold: {(report.sources.similarityThreshold * 100).toFixed(0)}% â€¢ 
                            Generated: {new Date(report.generatedAt).toLocaleString('en-US')}
                        </span>
                    </div>
                    {report.sources.selectedCompetitorNames && report.sources.selectedCompetitorNames.length > 0 && (
                        <div className="flex items-center gap-2 pl-6">
                            <span className="text-[#18181B] font-medium">
                                Analyzing: {report.sources.selectedCompetitorNames.join(', ')}
                            </span>
                        </div>
                    )}
                </div>
            )}
            
            {/* Section Navigation */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                <span className="text-sm text-[#71717A] mr-2 flex-shrink-0">â‰¡ Table of Contents</span>
                {sections.map(section => (
                    <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`relative px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                            activeSection === section.id 
                                ? 'bg-[#E11D48] text-white' 
                                : 'bg-[#F4F4F5] text-[#71717A] hover:bg-[#E4E4E7]:bg-gray-700'
                        }`}
                    >
                        {bookmarkedSections.has(section.id) && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full border border-white" />
                        )}
                        {section.label}
                    </button>
                ))}
            </div>
            
            {/* Loading State */}
            {(!isPageReady || isLoading) && <LoadingSkeleton />}
            
            {/* Error State */}
            {isPageReady && error && !isLoading && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
                    <AlertTriangle className="mx-auto text-red-500 mb-4" size={40} />
                    <h3 className="text-red-700 font-bold text-lg mb-2">Unable to Load Data</h3>
                    <p className="text-red-600 text-sm mb-1">{error}</p>
                    <p className="text-[#71717A] text-xs mb-5">Please check your network connection or try again later.</p>
                    <button 
                        onClick={fetchMarketIntelligence}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors"
                    >
                        <RefreshCw size={16} />
                        Retry
                    </button>
                </div>
            )}
            
            {/* Content Sections - Only show when data is loaded */}
            {isPageReady && !isLoading && !error && report && (
                <>
                    {/* EXECUTIVE SUMMARY */}
                    {activeSection === 'overview' && (
                        <div className="space-y-6">
                            <div className="bg-white border border-[#E4E4E7] rounded-2xl p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1 h-8 bg-[#E11D48] rounded-full"></div>
                                        <h3 className="font-bold text-[#18181B] text-lg">Market & Industry: Executive Summary</h3>
                                    </div>
                                    <div className="flex items-center gap-1 relative">
                                        <button
                                            onClick={() => toggleBookmarkSection('overview')}
                                            className={`p-1.5 rounded-lg transition-colors ${
                                                bookmarkedSections.has('overview')
                                                    ? 'bg-amber-50 text-amber-500'
                                                    : 'hover:bg-[#F4F4F5]:bg-gray-800 text-[#A1A1AA]'
                                            }`}
                                            title={bookmarkedSections.has('overview') ? 'Bá» bookmark' : 'Bookmark pháº§n nÃ y'}
                                        >
                                            {bookmarkedSections.has('overview') ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                                        </button>
                                        <SectionNote sectionId="overview" />
                                    </div>
                                </div>
                                
                                <p className="text-[#71717A] leading-relaxed mb-6">
                                    {parseSimpleMarkdown(report.executiveSummary.overview)}
                                </p>
                                
                                {/* Key Metrics â€” with highlight mode & copy buttons */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                    <div className={`group p-4 rounded-xl transition-all ${highlightMode ? 'bg-[#FFF1F2] ring-2 ring-[#E11D48]/30 shadow-md scale-[1.02]' : 'bg-gradient-to-br from-[#FFF1F2] to-[#FFF1F2]'}`}>
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs text-[#E11D48] font-medium mb-1">Market Size (2024)</p>
                                            <CopyMetricBtn value={report.marketSize.sam} label="Market Size" />
                                        </div>
                                        <p className={`text-2xl font-black text-[#18181B] ${highlightMode ? 'bg-yellow-200/60 px-1 rounded' : ''}`}>{report.marketSize.sam}</p>
                                    </div>
                                    <div className={`group p-4 rounded-xl transition-all ${highlightMode ? 'bg-green-50 ring-2 ring-green-500/30 shadow-md scale-[1.02]' : 'bg-gradient-to-br from-green-50 to-green-100'}`}>
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs text-green-600 font-medium mb-1">CAGR</p>
                                            <CopyMetricBtn value={`${report.marketSize.cagr}%`} label="CAGR" />
                                        </div>
                                        <p className={`text-2xl font-black text-[#18181B] ${highlightMode ? 'bg-yellow-200/60 px-1 rounded' : ''}`}>{report.marketSize.cagr}%</p>
                                    </div>
                                    <div className={`group p-4 rounded-xl transition-all ${highlightMode ? 'bg-purple-50 ring-2 ring-purple-500/30 shadow-md scale-[1.02]' : 'bg-gradient-to-br from-purple-50 to-[#FFF1F2]'}`}>
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs text-[#E11D48] font-medium mb-1">Total Funding (2024)</p>
                                            <CopyMetricBtn value={report.funding.totalValue} label="Total Funding" />
                                        </div>
                                        <p className={`text-2xl font-black text-[#18181B] ${highlightMode ? 'bg-yellow-200/60 px-1 rounded' : ''}`}>{report.funding.totalValue}</p>
                                    </div>
                                    <div className={`group p-4 rounded-xl transition-all ${highlightMode ? 'bg-amber-50 ring-2 ring-amber-500/30 shadow-md scale-[1.02]' : 'bg-gradient-to-br from-amber-50 to-amber-100'}`}>
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs text-amber-600 font-medium mb-1">Industry Players</p>
                                            <CopyMetricBtn value={report.companyCount.toLocaleString()} label="Industry Players" />
                                        </div>
                                        <p className={`text-2xl font-black text-[#18181B] ${highlightMode ? 'bg-yellow-200/60 px-1 rounded' : ''}`}>{report.companyCount.toLocaleString()}</p>
                                    </div>
                                </div>
                                
                                {/* Key Insights */}
                                <div className="mb-6">
                                    <h4 className="font-bold text-[#18181B] text-sm mb-3 flex items-center gap-2">
                                        <Lightbulb size={16} className="text-amber-500" />
                                        Key Insights (Based on Your Data)
                                    </h4>
                                    <div className="space-y-2">
                                        {report.executiveSummary.keyInsights.map((insight, idx) => (
                                            <div key={idx} className="flex items-start gap-3 text-sm text-[#71717A]">
                                                <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                                                <span>{parseSimpleMarkdown(insight)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                {/* Recommendations */}
                                <div>
                                    <h4 className="font-bold text-[#18181B] text-sm mb-3 flex items-center gap-2">
                                        <Target size={16} className="text-[#E11D48]" />
                                        Strategic Recommendations for {userData?.orgName || 'Your Company'}
                                    </h4>
                                    <div className="space-y-3">
                                        {report.executiveSummary.recommendations.map((rec, idx) => (
                                            <div key={idx} className="flex gap-4 p-4 bg-[#FAFAFA] rounded-xl">
                                                <div className="w-6 h-6 rounded-full bg-[#FFF1F2] text-[#E11D48] flex items-center justify-center text-xs font-bold flex-shrink-0">
                                                    {idx + 1}
                                                </div>
                                                <p className="text-sm text-[#71717A]">{parseSimpleMarkdown(rec)}</p>
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
                            <div className="bg-white border border-[#E4E4E7] rounded-2xl p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-[#FFF1F2] flex items-center justify-center">
                                            <Target className="text-[#E11D48]" size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-[#18181B]">TAM / SAM / SOM Analysis</h3>
                                            <p className="text-xs text-[#71717A]">{report.marketSize.methodology}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 relative">
                                        <button
                                            onClick={() => toggleBookmarkSection('market-size')}
                                            className={`p-1.5 rounded-lg transition-colors ${
                                                bookmarkedSections.has('market-size')
                                                    ? 'bg-amber-50 text-amber-500'
                                                    : 'hover:bg-[#F4F4F5]:bg-gray-800 text-[#A1A1AA]'
                                            }`}
                                        >
                                            {bookmarkedSections.has('market-size') ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                                        </button>
                                        <SectionNote sectionId="market-size" />
                                    </div>
                                </div>
                                
                                <div className="grid lg:grid-cols-2 gap-8">
                                    <MarketSizeFunnel tam={report.marketSize.tam} sam={report.marketSize.sam} som={report.marketSize.som} />
                                    
                                    <div className="space-y-4">
                                        <div className="p-4 bg-[#FFF1F2] rounded-xl border-l-4 border-blue-500">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Globe size={16} className="text-[#E11D48]" />
                                                <h5 className="font-bold text-[#18181B]">TAM - Total Addressable Market</h5>
                                            </div>
                                            <p className="text-2xl font-black text-[#E11D48]">{report.marketSize.tam}</p>
                                        </div>
                                        
                                        <div className="p-4 bg-[#FFF1F2] rounded-xl border-l-4 border-purple-500">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Building2 size={16} className="text-[#E11D48]" />
                                                <h5 className="font-bold text-[#18181B]">SAM - Vietnam Market</h5>
                                            </div>
                                            <p className="text-2xl font-black text-[#E11D48]">{report.marketSize.sam}</p>
                                        </div>
                                        
                                        <div className="p-4 bg-green-50 rounded-xl border-l-4 border-green-500">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Target size={16} className="text-green-600" />
                                                <h5 className="font-bold text-[#18181B]">SOM - Obtainable Target</h5>
                                            </div>
                                            <p className="text-2xl font-black text-green-600">{report.marketSize.som}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Revenue Chart */}
                            <div className="grid lg:grid-cols-2 gap-6">
                                <div className="bg-white border border-[#E4E4E7] rounded-2xl p-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                                            <BarChart3 className="text-green-600" size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-[#18181B]">Revenue Forecast</h3>
                                            <p className="text-xs text-[#71717A]">Historical & projected (USD Billion)</p>
                                        </div>
                                    </div>
                                    <RevenueChart data={report.marketSize.revenueHistory} years={report.marketSize.years} />
                                </div>
                                
                                <div className="bg-white border border-[#E4E4E7] rounded-2xl p-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                                            <TrendingUp className="text-amber-600" size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-[#18181B]">Growth Metrics</h3>
                                            <p className="text-xs text-[#71717A]">Key performance indicators</p>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div className={`group p-4 rounded-xl transition-all ${highlightMode ? 'bg-[#FAFAFA] ring-2 ring-green-500/30 shadow-md' : 'bg-[#FAFAFA]'}`}>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm text-[#71717A]">CAGR ({report.marketSize.cagrPeriod})</span>
                                                <div className="flex items-center gap-1">
                                                    <span className={`text-xl font-black text-green-600 ${highlightMode ? 'bg-yellow-200/60 px-1 rounded' : ''}`}>{report.marketSize.cagr}%</span>
                                                    <CopyMetricBtn value={`${report.marketSize.cagr}%`} label="CAGR" />
                                                </div>
                                            </div>
                                            <div className="h-2 bg-[#E4E4E7] rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full" style={{ width: `${report.marketSize.cagr * 3}%` }} />
                                            </div>
                                        </div>
                                        
                                        <div className={`group p-4 rounded-xl transition-all ${highlightMode ? 'bg-[#FAFAFA] ring-2 ring-[#E11D48]/30 shadow-md' : 'bg-[#FAFAFA]'}`}>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-[#71717A]">Current Size</span>
                                                <div className="flex items-center gap-1">
                                                    <span className={`text-xl font-black text-[#E11D48] ${highlightMode ? 'bg-yellow-200/60 px-1 rounded' : ''}`}>${report.marketSize.currentSize.toFixed(1)}B</span>
                                                    <CopyMetricBtn value={`$${report.marketSize.currentSize.toFixed(1)}B`} label="Current Size" />
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className={`group p-4 rounded-xl transition-all ${highlightMode ? 'bg-[#FAFAFA] ring-2 ring-purple-500/30 shadow-md' : 'bg-[#FAFAFA]'}`}>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-[#71717A]">Forecast (5Y)</span>
                                                <div className="flex items-center gap-1">
                                                    <span className={`text-xl font-black text-[#E11D48] ${highlightMode ? 'bg-yellow-200/60 px-1 rounded' : ''}`}>${report.marketSize.forecastSize.toFixed(1)}B</span>
                                                    <CopyMetricBtn value={`$${report.marketSize.forecastSize.toFixed(1)}B`} label="Forecast 5Y" />
                                                </div>
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
                                <DynamicsCard type="Emerging Trends" items={report.marketDynamics.trends} icon={Zap} color="bg-[#E11D48]" />
                            </div>
                            
                            <div className="bg-white border border-[#E4E4E7] rounded-2xl p-6">
                                <h4 className="font-bold text-[#18181B] mb-4">Dynamics Summary</h4>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="text-center p-4 bg-green-50 rounded-xl">
                                        <p className="text-3xl font-black text-green-600">{report.marketDynamics.drivers.length}</p>
                                        <p className="text-xs text-[#71717A]">Growth Drivers</p>
                                    </div>
                                    <div className="text-center p-4 bg-red-50 rounded-xl">
                                        <p className="text-3xl font-black text-red-600">{report.marketDynamics.restraints.length}</p>
                                        <p className="text-xs text-[#71717A]">Restraints</p>
                                    </div>
                                    <div className="text-center p-4 bg-[#FFF1F2] rounded-xl">
                                        <p className="text-3xl font-black text-[#E11D48]">{report.marketDynamics.trends.length}</p>
                                        <p className="text-xs text-[#71717A]">Trends</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* COMPETITIVE LANDSCAPE */}
                    {activeSection === 'landscape' && (
                        <div className="space-y-6">
                            <div className="grid lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 bg-white border border-[#E4E4E7] rounded-2xl p-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-xl bg-[#FFF1F2] flex items-center justify-center">
                                            <PieChart className="text-[#E11D48]" size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-[#18181B]">Market Share Distribution</h3>
                                            <p className="text-xs text-[#71717A]">Based on similarity analysis of {report.sources.competitorsAnalyzed} competitors</p>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        {report.competitiveLandscape.marketShare.map((item, idx) => {
                                            const colors = ['bg-rose-600', 'bg-orange-600', 'bg-green-600', 'bg-amber-600', 'bg-red-600', 'bg-[#A1A1AA]'];
                                            return (
                                                <div key={idx} className="space-y-1">
                                                    <div className="flex justify-between text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-3 h-3 rounded-full ${colors[idx % colors.length]}`}></div>
                                                            <span className="text-[#18181B] font-medium">{item.name}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-xs text-green-600 flex items-center gap-1">
                                                                <TrendingUp size={12} />+{item.growth}%
                                                            </span>
                                                            <span className="font-bold text-[#18181B] w-12 text-right">{item.share}%</span>
                                                        </div>
                                                    </div>
                                                    <div className="h-3 bg-[#F4F4F5] rounded-full overflow-hidden">
                                                        <div className={`h-full ${colors[idx % colors.length]} rounded-full`} style={{ width: `${item.share}%` }} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                
                                <div className="bg-white border border-[#E4E4E7] rounded-2xl p-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                                            <Gauge className="text-amber-600" size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-[#18181B]">Concentration</h3>
                                            <p className="text-xs text-[#71717A]">HHI Index analysis</p>
                                        </div>
                                    </div>
                                    
                                    <ConcentrationGauge level={report.competitiveLandscape.concentration.level} hhi={report.competitiveLandscape.concentration.hhi} />
                                    
                                    <div className="mt-4 p-3 bg-[#FAFAFA] rounded-xl">
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-[#71717A]">CR4 (Top 4)</span>
                                            <span className="font-bold text-[#18181B]">{report.competitiveLandscape.concentration.cr4}%</span>
                                        </div>
                                        <p className="text-xs text-[#71717A]">{report.competitiveLandscape.concentration.description}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white border border-[#E4E4E7] rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-[#FFF1F2] flex items-center justify-center">
                                        <BarChart3 className="text-[#E11D48]" size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-[#18181B]">Competitive Position Matrix</h3>
                                        <p className="text-xs text-[#71717A]">BCG-style analysis based on similarity scores</p>
                                    </div>
                                </div>
                                <CompetitorMatrix companies={report.competitiveLandscape.marketShare} />
                            </div>
                        </div>
                    )}
                    
                    {/* PORTER'S FIVE FORCES */}
                    {activeSection === 'porters' && (
                        <div className="bg-white border border-[#E4E4E7] rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-[#FFF1F2] flex items-center justify-center">
                                    <Activity className="text-[#E11D48]" size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#18181B]">Porter's Five Forces Analysis</h3>
                                    <p className="text-xs text-[#71717A]">Industry competitive intensity for {report.industry} in {market}</p>
                                </div>
                            </div>
                            
                            <PortersFiveForces forces={report.portersForces} />
                            
                            <div className="mt-8 p-4 bg-gradient-to-r from-[#FFF1F2] to-[#FFF1F2] rounded-xl">
                                <h4 className="font-bold text-[#18181B] mb-2 flex items-center gap-2">
                                    <Info size={16} className="text-[#E11D48]" />
                                    Analysis Summary
                                </h4>
                                <p className="text-sm text-[#71717A]">
                                    Based on analysis of {report.sources.industryPeersFound.toLocaleString()} industry players and {report.sources.competitorsAnalyzed} direct competitors. 
                                    Overall rivalry score: {report.portersForces.rivalry.score}/5 - {report.portersForces.rivalry.description}
                                </p>
                                {report.sources.dataSources && report.sources.dataSources.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-[#E4E4E7]">
                                        <p className="text-xs font-semibold text-[#BE123C] mb-1 flex items-center gap-1">
                                            <Database size={12} />
                                            Data Sources:
                                        </p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {report.sources.dataSources.map((src, idx) => (
                                                <span key={idx} className="px-2 py-0.5 bg-[#FFF1F2] text-[#BE123C] rounded text-[10px] font-medium">
                                                    {src}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    
                    {/* PESTLE */}
                    {activeSection === 'pestle' && (
                        <div className="space-y-6">
                            <div className="bg-white border border-[#E4E4E7] rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-[#FFF1F2] flex items-center justify-center">
                                        <Globe className="text-[#E11D48]" size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-[#18181B]">PESTLE Overview</h3>
                                        <p className="text-xs text-[#71717A]">Macro-environmental analysis for {market}</p>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                                    {getPESTLEData(report.industry).map((item, idx) => (
                                        <div key={idx} className="p-4 bg-[#FAFAFA] rounded-xl text-center">
                                            <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mx-auto mb-3`}>
                                                <item.icon size={24} className="text-white" />
                                            </div>
                                            <h4 className="font-bold text-[#18181B] text-sm">{item.title}</h4>
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
                                <div className={`group bg-white border border-[#E4E4E7] rounded-2xl p-6 text-center transition-all ${highlightMode ? 'ring-2 ring-green-500/30 shadow-md' : ''}`}>
                                    <DollarSign className="mx-auto text-green-600 mb-2" size={28} />
                                    <div className="flex items-center justify-center gap-1">
                                        <p className={`text-3xl font-black text-[#18181B] ${highlightMode ? 'bg-yellow-200/60 px-1 rounded' : ''}`}>{report.funding.totalValue}</p>
                                        <CopyMetricBtn value={report.funding.totalValue} label="Total Funding" />
                                    </div>
                                    <p className="text-xs text-[#71717A]">Total Funding (2024)</p>
                                </div>
                                <div className={`group bg-white border border-[#E4E4E7] rounded-2xl p-6 text-center transition-all ${highlightMode ? 'ring-2 ring-[#E11D48]/30 shadow-md' : ''}`}>
                                    <Handshake className="mx-auto text-[#E11D48] mb-2" size={28} />
                                    <div className="flex items-center justify-center gap-1">
                                        <p className={`text-3xl font-black text-[#18181B] ${highlightMode ? 'bg-yellow-200/60 px-1 rounded' : ''}`}>{report.funding.totalDeals}</p>
                                        <CopyMetricBtn value={String(report.funding.totalDeals)} label="Total Deals" />
                                    </div>
                                    <p className="text-xs text-[#71717A]">Total Deals</p>
                                </div>
                                <div className={`group bg-white border border-[#E4E4E7] rounded-2xl p-6 text-center transition-all ${highlightMode ? 'ring-2 ring-green-500/30 shadow-md' : ''}`}>
                                    <TrendingUp className="mx-auto text-green-600 mb-2" size={28} />
                                    <div className="flex items-center justify-center gap-1">
                                        <p className={`text-3xl font-black text-green-600 ${highlightMode ? 'bg-yellow-200/60 px-1 rounded' : ''}`}>+{report.funding.yoyGrowth}%</p>
                                        <CopyMetricBtn value={`+${report.funding.yoyGrowth}%`} label="YoY Growth" />
                                    </div>
                                    <p className="text-xs text-[#71717A]">YoY Growth</p>
                                </div>
                                <div className={`group bg-white border border-[#E4E4E7] rounded-2xl p-6 text-center transition-all ${highlightMode ? 'ring-2 ring-amber-500/30 shadow-md' : ''}`}>
                                    <BarChart2 className="mx-auto text-[#E11D48] mb-2" size={28} />
                                    <div className="flex items-center justify-center gap-1">
                                        <p className={`text-3xl font-black text-[#18181B] ${highlightMode ? 'bg-yellow-200/60 px-1 rounded' : ''}`}>{report.funding.avgDealSize}</p>
                                        <CopyMetricBtn value={report.funding.avgDealSize} label="Avg Deal Size" />
                                    </div>
                                    <p className="text-xs text-[#71717A]">Avg Deal Size</p>
                                </div>
                            </div>
                            
                            <div className="grid lg:grid-cols-2 gap-6">
                                <div className="bg-white border border-[#E4E4E7] rounded-2xl p-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                                            <Coins className="text-green-600" size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-[#18181B]">Funding by Sector</h3>
                                            <p className="text-xs text-[#71717A]">Where capital is flowing</p>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        {report.funding.topSectors.map((sector, idx) => {
                                            const colors = ['bg-rose-600', 'bg-orange-600', 'bg-orange-600', 'bg-green-600', 'bg-red-600', 'bg-[#A1A1AA]'];
                                            return (
                                                <div key={idx} className="space-y-1">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-[#18181B] font-medium">{sector.name}</span>
                                                        <span className="font-bold text-[#18181B]">{sector.percentage}%</span>
                                                    </div>
                                                    <div className="h-2 bg-[#F4F4F5] rounded-full overflow-hidden">
                                                        <div className={`h-full ${colors[idx % colors.length]} rounded-full`} style={{ width: `${sector.percentage}%` }} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                
                                <div className="bg-white border border-[#E4E4E7] rounded-2xl p-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-xl bg-[#FFF1F2] flex items-center justify-center">
                                            <Briefcase className="text-[#E11D48]" size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-[#18181B]">Recent Notable Deals</h3>
                                            <p className="text-xs text-[#71717A]">Based on your competitors</p>
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

                    {/* Data Sources & Methodology Footer */}
                    <div className="bg-white border border-[#E4E4E7] rounded-2xl p-5 mt-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Database className="w-4 h-4 text-[#A1A1AA]" />
                                    <span className="text-xs font-semibold text-[#18181B]">Data Sources &amp; Methodology</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        'VICO Company Database (10,000+ companies)',
                                        'Vietnam GSO (General Statistics Office)',
                                        'Ministry of Planning & Investment (MPI)',
                                        'World Bank Vietnam Reports',
                                        'Statista & IDC Vietnam Market Data',
                                        'CafeF & VnExpress Financial Data',
                                    ].map((src, idx) => (
                                        <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FAFAFA] border border-[#E4E4E7] text-[10px] text-[#71717A]">
                                            <CheckCircle className="w-2.5 h-2.5 text-emerald-500" />
                                            {src}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="text-[10px] text-[#A1A1AA] leading-relaxed">
                                    Last verified: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                                </p>
                                <p className="text-[10px] text-[#A1A1AA]">
                                    VICO Intelligence &middot; Market Research
                                </p>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Export Modal */}
            {showExportModal && report && (
                <ExportModal
                    report={report}
                    companyName={userData?.orgName}
                    onClose={() => setShowExportModal(false)}
                />
            )}

            {/* Highlight Mode indicator */}
            {highlightMode && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-5 py-2.5 bg-amber-100 border border-amber-300 rounded-full shadow-lg backdrop-blur-sm">
                    <Eye size={14} className="text-amber-700" />
                    <span className="text-xs font-semibold text-amber-800">Highlight Mode â€” Key metrics are highlighted</span>
                    <button
                        onClick={() => setHighlightMode(false)}
                        className="p-1 rounded-full hover:bg-amber-200:bg-amber-800 text-amber-700 transition-colors"
                    >
                        <X size={12} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default MarketIndustryPage;
