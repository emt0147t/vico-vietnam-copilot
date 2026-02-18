/**
 * 🎯 Competitor Analysis Page - Enterprise Edition
 * 
 * 5 Tầng Thông Tin Chiến Lược:
 * 1. Hồ Sơ & Sức Khỏe (Firmographics, Tech Stack)
 * 2. Định Vị & Chiến Lược (Market Map, SWOT, GTM)
 * 3. Sales Battlecards (Why Win/Lose, Feature Matrix)
 * 4. Tín Hiệu Sớm (Hiring, Website, News)
 * 5. Digital Footprint (Traffic, Keywords, Social)
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    ChevronDown, ChevronUp, ChevronLeft, ChevronRight, TrendingUp, TrendingDown,
    Building2, Users, Globe, DollarSign, Target, Zap, AlertTriangle, 
    CheckCircle, XCircle, Info, Download, Edit3, ExternalLink, Search, Filter,
    BarChart3, Loader2, Star, Award, Briefcase, MapPin, Calendar, RefreshCw,
    Database, Cpu, Server, Code, Shield, Eye, Share2, MessageSquare, Linkedin,
    Facebook, Twitter, FileText, TrendingDown as TrendDown, Activity, Layers,
    Swords, ThumbsUp, ThumbsDown, Crosshair, Flag, AlertCircle, Minus, PieChart
} from 'lucide-react';

interface CompetitorAnalysisPageProps {
    userData: any;
    competitors?: any[];
}

// Types matching the backend service
interface CompetitorProfile {
    id: string;
    name: string;
    logo: string;
    industry: string;
    similarity: number;
    source: string;
    firmographics: {
        revenue: string;
        revenueGrowth: number;
        headcount: number;
        headcountGrowth: number;
        headcountHistory: number[];
        funding: { total: string; lastRound: string; lastRoundDate: string; investors: string[] };
        hq: string;
        offices: string[];
        foundedYear: number;
        website: string;
    };
    techStack: { cloud: string[]; frontend: string[]; backend: string[]; database: string[]; analytics: string[]; other: string[] };
    positioning: { x: number; y: number; quadrant: 'Leader' | 'Challenger' | 'Niche' | 'Visionary'; marketShare: number };
    swot: { strengths: string[]; weaknesses: string[]; opportunities: string[]; threats: string[] };
    gtmStrategy: { targetSegment: string; salesModel: string; pricingModel: string; keyChannels: string[] };
    battlecard: { whyWeWin: string[]; whyWeLose: string[]; killPoints: string[]; landmines: string[]; objectionHandlers: Array<{ objection: string; response: string }> };
    featureComparison: Array<{ feature: string; category: string; us: boolean | 'partial'; them: boolean | 'partial'; notes: string }>;
    signals: {
        hiringTrends: Array<{ role: string; count: number; change: number; signal: string }>;
        websiteChanges: Array<{ type: string; date: string; description: string; impact: 'High' | 'Medium' | 'Low' }>;
        newsSentiment: { positive: number; neutral: number; negative: number; trend: string; recentHeadlines: string[] };
    };
    digitalFootprint: {
        monthlyTraffic: string;
        trafficGrowth: number;
        trafficSources: Array<{ source: string; percentage: number }>;
        topKeywords: Array<{ keyword: string; position: number; volume: number }>;
        socialMetrics: { linkedin: { followers: number; engagement: number }; facebook: { followers: number; engagement: number }; twitter: { followers: number; engagement: number } };
        contentStrategy: string[];
    };
}

interface CompetitorIntelligenceReport {
    generatedAt: string;
    userCompany: string;
    industry: string;
    totalCompetitors: number;
    competitors: CompetitorProfile[];
    marketPositioningMap: { quadrants: { leaders: string[]; challengers: string[]; niche: string[]; visionaries: string[] }; avgPrice: number; avgFeatures: number };
    industryOverview: { totalPlayers: number; avgRevenue: string; avgHeadcount: number; topTechStacks: Array<{ tech: string; adoption: number }> };
    executiveSummary: { overview: string; keyFindings: string[]; recommendations: string[] };
}

// ==================== LOADING SKELETON ====================
const LoadingSkeleton = () => (
    <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        <div className="grid grid-cols-4 gap-4">
            {[1,2,3,4].map(i => (<div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>))}
        </div>
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
    </div>
);

// ==================== TIER 1: FIRMOGRAPHICS ====================
const FirmographicsCard: React.FC<{ competitor: CompetitorProfile }> = ({ competitor }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const f = competitor.firmographics;
    
    return (
        <div className="bg-white dark:bg-[#0F1623] border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
            <div className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-white text-lg ${
                        competitor.source === 'ts' ? 'bg-gradient-to-br from-blue-500 to-purple-600' : 'bg-gradient-to-br from-gray-500 to-gray-700'
                    }`}>
                        {competitor.logo}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="font-bold text-gray-900 dark:text-white">{competitor.name}</h4>
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                                competitor.positioning.quadrant === 'Leader' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                competitor.positioning.quadrant === 'Challenger' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                competitor.positioning.quadrant === 'Niche' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                                'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                            }`}>
                                {competitor.positioning.quadrant}
                            </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                            <span className="flex items-center gap-1"><Briefcase size={12} />{competitor.industry}</span>
                            <span className="flex items-center gap-1"><MapPin size={12} />{f.hq.split(',')[0]}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <div className="text-2xl font-black text-gray-900 dark:text-white">{competitor.similarity}%</div>
                        <div className="text-xs text-gray-500">Similarity</div>
                    </div>
                    {isExpanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                </div>
            </div>
            
            {isExpanded && (
                <div className="px-5 pb-5 space-y-6 border-t border-gray-100 dark:border-gray-800 pt-5">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                                <DollarSign size={16} className="text-green-600" />
                                <span className="text-xs text-gray-500">Revenue (Est.)</span>
                            </div>
                            <div className="text-xl font-black text-gray-900 dark:text-white">{f.revenue}</div>
                            <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                                <TrendingUp size={12} />+{f.revenueGrowth}% YoY
                            </div>
                        </div>
                        
                        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                                <Users size={16} className="text-blue-600" />
                                <span className="text-xs text-gray-500">Headcount</span>
                            </div>
                            <div className="text-xl font-black text-gray-900 dark:text-white">{f.headcount}</div>
                            <div className="flex items-center gap-1 text-xs text-blue-600 mt-1">
                                <TrendingUp size={12} />+{f.headcountGrowth}% (6mo)
                            </div>
                        </div>
                        
                        <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                                <Briefcase size={16} className="text-purple-600" />
                                <span className="text-xs text-gray-500">Total Funding</span>
                            </div>
                            <div className="text-xl font-black text-gray-900 dark:text-white">{f.funding.total}</div>
                            <div className="text-xs text-purple-600 mt-1">{f.funding.lastRound}</div>
                        </div>
                        
                        <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                                <Calendar size={16} className="text-amber-600" />
                                <span className="text-xs text-gray-500">Founded</span>
                            </div>
                            <div className="text-xl font-black text-gray-900 dark:text-white">{f.foundedYear}</div>
                            <div className="text-xs text-amber-600 mt-1">{2026 - f.foundedYear} years old</div>
                        </div>
                    </div>
                    
                    {/* Headcount Trend */}
                    <div>
                        <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Headcount Trend (Last 6 Months)</h5>
                        <div className="flex items-end gap-2 h-20">
                            {f.headcountHistory.map((count, idx) => {
                                const maxCount = Math.max(...f.headcountHistory);
                                const height = (count / maxCount) * 100;
                                const isLatest = idx === f.headcountHistory.length - 1;
                                return (
                                    <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                                        <span className="text-[10px] text-gray-500">{count}</span>
                                        <div 
                                            className={`w-full rounded-t ${isLatest ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                                            style={{ height: `${height}%`, minHeight: '4px' }}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    
                    {/* Investors & Offices */}
                    <div className="grid lg:grid-cols-2 gap-4">
                        <div>
                            <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Key Investors</h5>
                            <div className="flex flex-wrap gap-2">
                                {f.funding.investors.map((inv, idx) => (
                                    <span key={idx} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300">{inv}</span>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Office Locations</h5>
                            <div className="flex flex-wrap gap-2">
                                {f.offices.map((office, idx) => (
                                    <span key={idx} className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-700 dark:text-blue-300 flex items-center gap-1">
                                        <MapPin size={12} />{office}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    {/* Tech Stack */}
                    <div>
                        <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Cpu size={14} />Tech Stack
                        </h5>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                            {Object.entries(competitor.techStack).map(([category, techs]) => {
                                const techArray = techs as string[];
                                return techArray.length > 0 && (
                                    <div key={category} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                        <div className="text-[10px] font-bold text-gray-400 uppercase mb-2">{category}</div>
                                        <div className="flex flex-wrap gap-1">
                                            {techArray.map((tech, idx) => (
                                                <span key={idx} className="px-2 py-0.5 bg-white dark:bg-gray-700 rounded text-xs text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">{tech}</span>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ==================== TIER 2: MARKET POSITIONING MAP ====================
const MarketPositioningMap: React.FC<{ competitors: CompetitorProfile[]; userCompany: string }> = ({ competitors, userCompany }) => {
    const quadrantColors = {
        Leader: 'bg-green-500',
        Challenger: 'bg-blue-500',
        Niche: 'bg-purple-500',
        Visionary: 'bg-amber-500'
    };
    
    return (
        <div className="bg-white dark:bg-[#0F1623] border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                    <Target className="text-indigo-600" size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">Market Positioning Map</h3>
                    <p className="text-xs text-gray-500">Gartner-style Magic Quadrant</p>
                </div>
            </div>
            
            <div className="relative h-[400px] bg-gray-50 dark:bg-gray-800/30 rounded-2xl overflow-hidden">
                {/* Axis Labels */}
                <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-gray-500 font-medium whitespace-nowrap">
                    Ability to Execute →
                </div>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-gray-500 font-medium">
                    Completeness of Vision →
                </div>
                
                {/* Quadrants */}
                <div className="absolute inset-8 grid grid-cols-2 grid-rows-2 gap-1">
                    <div className="bg-purple-50 dark:bg-purple-900/10 rounded-tl-xl flex items-start justify-start p-3">
                        <span className="text-xs font-bold text-purple-600">NICHE PLAYERS</span>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/10 rounded-tr-xl flex items-start justify-end p-3">
                        <span className="text-xs font-bold text-green-600">LEADERS</span>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-900/10 rounded-bl-xl flex items-end justify-start p-3">
                        <span className="text-xs font-bold text-amber-600">VISIONARIES</span>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/10 rounded-br-xl flex items-end justify-end p-3">
                        <span className="text-xs font-bold text-blue-600">CHALLENGERS</span>
                    </div>
                </div>
                
                {/* Center Lines */}
                <div className="absolute left-8 right-8 top-1/2 border-t-2 border-dashed border-gray-300 dark:border-gray-600" />
                <div className="absolute top-8 bottom-8 left-1/2 border-l-2 border-dashed border-gray-300 dark:border-gray-600" />
                
                {/* Data Points */}
                <div className="absolute inset-12">
                    {/* User Company */}
                    <div
                        className="absolute w-12 h-12 rounded-full bg-red-600 ring-4 ring-red-200 dark:ring-red-900/50 flex items-center justify-center shadow-lg transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform z-20"
                        style={{ left: '65%', bottom: '55%' }}
                        title={userCompany}
                    >
                        <span className="text-white font-bold text-xs">{userCompany?.substring(0, 2).toUpperCase() || 'YOU'}</span>
                    </div>
                    
                    {/* Competitors */}
                    {competitors.map((comp, idx) => (
                        <div
                            key={idx}
                            className={`absolute w-10 h-10 rounded-full ${quadrantColors[comp.positioning.quadrant]} flex items-center justify-center shadow-lg transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-125 transition-transform z-10 group`}
                            style={{ 
                                left: `${Math.min(95, Math.max(5, comp.positioning.x))}%`, 
                                bottom: `${Math.min(95, Math.max(5, comp.positioning.y))}%` 
                            }}
                        >
                            <span className="text-white font-bold text-[10px]">{comp.logo}</span>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-gray-900 text-white px-3 py-2 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity text-xs whitespace-nowrap z-50">
                                <div className="font-bold">{comp.name}</div>
                                <div className="text-gray-400">{comp.positioning.quadrant} • {comp.similarity}%</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-4 justify-center">
                {Object.entries(quadrantColors).map(([quadrant, color]) => (
                    <div key={quadrant} className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${color}`} />
                        <span className="text-xs text-gray-600 dark:text-gray-400">{quadrant}</span>
                    </div>
                ))}
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-600 ring-2 ring-red-200" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">Your Company</span>
                </div>
            </div>
        </div>
    );
};

// ==================== TIER 2: SWOT ANALYSIS ====================
const SWOTAnalysis: React.FC<{ competitor: CompetitorProfile }> = ({ competitor }) => {
    const swot = competitor.swot;
    
    const quadrants = [
        { key: 'strengths', title: 'Strengths', items: swot.strengths, color: 'bg-green-500', bgColor: 'bg-green-50 dark:bg-green-900/20', textColor: 'text-green-700 dark:text-green-400', icon: ThumbsUp },
        { key: 'weaknesses', title: 'Weaknesses', items: swot.weaknesses, color: 'bg-red-500', bgColor: 'bg-red-50 dark:bg-red-900/20', textColor: 'text-red-700 dark:text-red-400', icon: ThumbsDown },
        { key: 'opportunities', title: 'Opportunities', items: swot.opportunities, color: 'bg-blue-500', bgColor: 'bg-blue-50 dark:bg-blue-900/20', textColor: 'text-blue-700 dark:text-blue-400', icon: Target },
        { key: 'threats', title: 'Threats', items: swot.threats, color: 'bg-amber-500', bgColor: 'bg-amber-50 dark:bg-amber-900/20', textColor: 'text-amber-700 dark:text-amber-400', icon: AlertTriangle }
    ];
    
    return (
        <div className="grid grid-cols-2 gap-4">
            {quadrants.map(q => (
                <div key={q.key} className={`${q.bgColor} rounded-xl p-4`}>
                    <div className="flex items-center gap-2 mb-3">
                        <div className={`w-8 h-8 rounded-lg ${q.color} flex items-center justify-center`}>
                            <q.icon size={16} className="text-white" />
                        </div>
                        <h5 className={`font-bold ${q.textColor}`}>{q.title}</h5>
                    </div>
                    <ul className="space-y-2">
                        {q.items.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                                <CheckCircle size={14} className={`mt-0.5 flex-shrink-0 ${q.textColor}`} />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
};

// ==================== TIER 3: BATTLECARD ====================
const BattlecardSection: React.FC<{ competitor: CompetitorProfile; userCompany: string }> = ({ competitor, userCompany }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const bc = competitor.battlecard;
    
    const tabs = [
        { id: 'overview', label: 'Overview', icon: Layers },
        { id: 'win', label: 'Why We Win', icon: ThumbsUp },
        { id: 'lose', label: 'Why We Lose', icon: ThumbsDown },
        { id: 'kill', label: 'Kill Points', icon: Crosshair },
        { id: 'landmines', label: 'Landmines', icon: Flag },
        { id: 'features', label: 'Feature Matrix', icon: CheckCircle }
    ];
    
    return (
        <div className="bg-white dark:bg-[#0F1623] border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <Swords className="text-red-600" size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">Sales Battlecard: {competitor.name}</h3>
                        <p className="text-xs text-gray-500">Chiến lược cạnh tranh trực tiếp</p>
                    </div>
                </div>
                
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                                activeTab === tab.id
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                        >
                            <tab.icon size={14} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="p-5">
                {activeTab === 'overview' && (
                    <div className="grid lg:grid-cols-2 gap-6">
                        <div>
                            <h5 className="text-sm font-bold text-green-600 mb-3 flex items-center gap-2">
                                <ThumbsUp size={16} />Why We Win ({userCompany})
                            </h5>
                            <ul className="space-y-2">
                                {bc.whyWeWin.slice(0, 3).map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                                        <CheckCircle size={14} className="text-green-500 mt-0.5" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h5 className="text-sm font-bold text-red-600 mb-3 flex items-center gap-2">
                                <ThumbsDown size={16} />Why We Lose
                            </h5>
                            <ul className="space-y-2">
                                {bc.whyWeLose.slice(0, 3).map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                                        <XCircle size={14} className="text-red-500 mt-0.5" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
                
                {activeTab === 'win' && (
                    <div className="space-y-3">
                        {bc.whyWeWin.map((item, idx) => (
                            <div key={idx} className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-start gap-3">
                                <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
                                <span className="text-gray-700 dark:text-gray-300">{item}</span>
                            </div>
                        ))}
                    </div>
                )}
                
                {activeTab === 'lose' && (
                    <div className="space-y-3">
                        {bc.whyWeLose.map((item, idx) => (
                            <div key={idx} className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-start gap-3">
                                <XCircle className="text-red-500 flex-shrink-0" size={20} />
                                <span className="text-gray-700 dark:text-gray-300">{item}</span>
                            </div>
                        ))}
                    </div>
                )}
                
                {activeTab === 'kill' && (
                    <div className="space-y-3">
                        <p className="text-sm text-gray-500 mb-4">Câu hỏi/thông tin khiến đối thủ "cứng họng" khi deal</p>
                        {bc.killPoints.map((item, idx) => (
                            <div key={idx} className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-start gap-3 border-l-4 border-amber-500">
                                <Crosshair className="text-amber-600 flex-shrink-0" size={20} />
                                <span className="text-gray-700 dark:text-gray-300">{item}</span>
                            </div>
                        ))}
                    </div>
                )}
                
                {activeTab === 'landmines' && (
                    <div className="space-y-3">
                        <p className="text-sm text-gray-500 mb-4">Những điều đối thủ hay nói xấu về bạn và cách phản bác</p>
                        {bc.landmines.map((item, idx) => (
                            <div key={idx} className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                                <div className="flex items-start gap-3">
                                    <Flag className="text-purple-600 flex-shrink-0" size={20} />
                                    <span className="text-gray-700 dark:text-gray-300">{item}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                {activeTab === 'features' && (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-800/50">
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Feature</th>
                                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">{userCompany || 'Us'}</th>
                                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">{competitor.name}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {competitor.featureComparison.map((f, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-gray-900 dark:text-white text-sm">{f.feature}</div>
                                            <div className="text-xs text-gray-500">{f.category}</div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {f.us === true ? <CheckCircle className="inline text-green-500" size={20} /> :
                                             f.us === 'partial' ? <Minus className="inline text-amber-500" size={20} /> :
                                             <XCircle className="inline text-gray-300" size={20} />}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {f.them === true ? <CheckCircle className="inline text-green-500" size={20} /> :
                                             f.them === 'partial' ? <Minus className="inline text-amber-500" size={20} /> :
                                             <XCircle className="inline text-gray-300" size={20} />}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

// ==================== TIER 4: EARLY WARNING SIGNALS ====================
const EarlyWarningSignals: React.FC<{ competitor: CompetitorProfile }> = ({ competitor }) => {
    const signals = competitor.signals;
    
    return (
        <div className="space-y-6">
            {/* Hiring Trends */}
            <div className="bg-white dark:bg-[#0F1623] border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <Users className="text-blue-600" size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white">Hiring Trends</h4>
                        <p className="text-xs text-gray-500">Xu hướng tuyển dụng - Dự báo hướng đi của đối thủ</p>
                    </div>
                </div>
                
                <div className="space-y-3">
                    {signals.hiringTrends.map((trend, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                    <span className="text-lg font-bold text-blue-600">{trend.count}</span>
                                </div>
                                <div>
                                    <div className="font-medium text-gray-900 dark:text-white">{trend.role}</div>
                                    <div className="flex items-center gap-2 text-xs">
                                        <span className={`flex items-center gap-1 ${trend.change > 30 ? 'text-red-600' : 'text-green-600'}`}>
                                            <TrendingUp size={12} />+{trend.change}%
                                        </span>
                                        <span className="text-gray-500">vs last quarter</span>
                                    </div>
                                </div>
                            </div>
                            <div className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                                trend.signal.includes('🚨') ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            }`}>
                                {trend.signal}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Website Changes */}
            <div className="bg-white dark:bg-[#0F1623] border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <Globe className="text-purple-600" size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white">Website Changes</h4>
                        <p className="text-xs text-gray-500">Thay đổi trên website đối thủ</p>
                    </div>
                </div>
                
                <div className="space-y-3">
                    {signals.websiteChanges.map((change, idx) => (
                        <div key={idx} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                            <div className={`px-2 py-1 rounded text-xs font-bold ${
                                change.impact === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-900/30' :
                                change.impact === 'Medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30' :
                                'bg-gray-100 text-gray-600 dark:bg-gray-700'
                            }`}>
                                {change.type}
                            </div>
                            <div className="flex-1">
                                <div className="font-medium text-gray-900 dark:text-white text-sm">{change.description}</div>
                                <div className="text-xs text-gray-500 mt-1">{change.date}</div>
                            </div>
                            <span className={`text-xs font-bold ${
                                change.impact === 'High' ? 'text-red-600' : change.impact === 'Medium' ? 'text-amber-600' : 'text-gray-500'
                            }`}>
                                {change.impact} Impact
                            </span>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* News Sentiment */}
            <div className="bg-white dark:bg-[#0F1623] border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                        <FileText className="text-amber-600" size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white">News & PR Sentiment</h4>
                        <p className="text-xs text-gray-500">Phân tích cảm xúc tin tức</p>
                    </div>
                </div>
                
                <div className="grid lg:grid-cols-2 gap-6">
                    <div>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-green-600">Positive</span>
                                    <span className="font-bold">{signals.newsSentiment.positive}%</span>
                                </div>
                                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${signals.newsSentiment.positive}%` }} />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-500">Neutral</span>
                                    <span className="font-bold">{signals.newsSentiment.neutral}%</span>
                                </div>
                                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-gray-400 rounded-full" style={{ width: `${signals.newsSentiment.neutral}%` }} />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-red-600">Negative</span>
                                    <span className="font-bold">{signals.newsSentiment.negative}%</span>
                                </div>
                                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-red-500 rounded-full" style={{ width: `${signals.newsSentiment.negative}%` }} />
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <h5 className="text-xs font-bold text-gray-500 uppercase mb-3">Recent Headlines</h5>
                        <div className="space-y-2">
                            {signals.newsSentiment.recentHeadlines.map((headline, idx) => (
                                <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                                    {headline}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ==================== TIER 5: DIGITAL FOOTPRINT ====================
const DigitalFootprint: React.FC<{ competitor: CompetitorProfile }> = ({ competitor }) => {
    const df = competitor.digitalFootprint;
    
    return (
        <div className="space-y-6">
            {/* Traffic Overview */}
            <div className="grid lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-[#0F1623] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 text-center">
                    <Globe className="mx-auto text-blue-600 mb-2" size={28} />
                    <p className="text-3xl font-black text-gray-900 dark:text-white">{df.monthlyTraffic}</p>
                    <p className="text-xs text-gray-500">Monthly Traffic</p>
                    <p className="text-xs text-green-600 mt-1">+{df.trafficGrowth}% MoM</p>
                </div>
                <div className="bg-white dark:bg-[#0F1623] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 text-center">
                    <Linkedin className="mx-auto text-blue-700 mb-2" size={28} />
                    <p className="text-3xl font-black text-gray-900 dark:text-white">{(df.socialMetrics.linkedin.followers / 1000).toFixed(0)}K</p>
                    <p className="text-xs text-gray-500">LinkedIn Followers</p>
                    <p className="text-xs text-blue-600 mt-1">{df.socialMetrics.linkedin.engagement}% Engagement</p>
                </div>
                <div className="bg-white dark:bg-[#0F1623] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 text-center">
                    <Facebook className="mx-auto text-blue-600 mb-2" size={28} />
                    <p className="text-3xl font-black text-gray-900 dark:text-white">{(df.socialMetrics.facebook.followers / 1000).toFixed(0)}K</p>
                    <p className="text-xs text-gray-500">Facebook Followers</p>
                    <p className="text-xs text-blue-600 mt-1">{df.socialMetrics.facebook.engagement}% Engagement</p>
                </div>
                <div className="bg-white dark:bg-[#0F1623] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 text-center">
                    <Twitter className="mx-auto text-sky-500 mb-2" size={28} />
                    <p className="text-3xl font-black text-gray-900 dark:text-white">{(df.socialMetrics.twitter.followers / 1000).toFixed(0)}K</p>
                    <p className="text-xs text-gray-500">Twitter Followers</p>
                    <p className="text-xs text-sky-600 mt-1">{df.socialMetrics.twitter.engagement}% Engagement</p>
                </div>
            </div>
            
            {/* Traffic Sources & Keywords */}
            <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-[#0F1623] border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <PieChart size={18} className="text-purple-600" />
                        Traffic Sources
                    </h4>
                    <div className="space-y-3">
                        {df.trafficSources.map((source, idx) => {
                            const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-amber-500', 'bg-red-500'];
                            return (
                                <div key={idx} className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-300">{source.source}</span>
                                        <span className="font-bold text-gray-900 dark:text-white">{source.percentage}%</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                        <div className={`h-full ${colors[idx % colors.length]} rounded-full`} style={{ width: `${source.percentage}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                
                <div className="bg-white dark:bg-[#0F1623] border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Search size={18} className="text-green-600" />
                        Top Keywords
                    </h4>
                    <div className="space-y-3">
                        {df.topKeywords.map((kw, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                <div>
                                    <div className="font-medium text-gray-900 dark:text-white">{kw.keyword}</div>
                                    <div className="text-xs text-gray-500">{kw.volume.toLocaleString()} searches/mo</div>
                                </div>
                                <div className={`px-3 py-1 rounded-lg text-sm font-bold ${
                                    kw.position <= 3 ? 'bg-green-100 text-green-700 dark:bg-green-900/30' :
                                    kw.position <= 10 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30' :
                                    'bg-gray-100 text-gray-600 dark:bg-gray-700'
                                }`}>
                                    #{kw.position}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            {/* Content Strategy */}
            <div className="bg-white dark:bg-[#0F1623] border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
                <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <FileText size={18} className="text-amber-600" />
                    Content Strategy
                </h4>
                <div className="flex flex-wrap gap-2">
                    {df.contentStrategy.map((strategy, idx) => (
                        <span key={idx} className="px-4 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-xl text-sm font-medium">
                            {strategy}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ==================== MAIN COMPONENT ====================
export const CompetitorAnalysisPage: React.FC<CompetitorAnalysisPageProps> = ({ userData, competitors = [] }) => {
    const [activeSection, setActiveSection] = useState('overview');
    const [selectedCompetitor, setSelectedCompetitor] = useState<number>(0);
    const [report, setReport] = useState<CompetitorIntelligenceReport | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Use refs to avoid closure stale values
    const userDataRef = React.useRef(userData);
    const competitorsRef = React.useRef(competitors);
    const isMountedRef = React.useRef(false);
    
    // Update refs when props change
    userDataRef.current = userData;
    competitorsRef.current = competitors;
    
    // Stable fetch function that reads from refs
    const fetchCompetitorIntelligence = useCallback(async (forceRefresh = false) => {
        // Skip if already fetched and not forcing refresh
        if (isMountedRef.current && !forceRefresh) return;
        
        setIsLoading(true);
        setError(null);
        
        try {
            const currentUserData = userDataRef.current;
            const currentCompetitors = competitorsRef.current;
            
            // Use provided competitors or fetch from API
            const selectedComps = currentCompetitors.length > 0 
                ? currentCompetitors.filter(c => c.selected !== false)
                : currentUserData?.competitors?.filter((c: any) => c.selected) || [];
            
            const response = await fetch('/api/competitor-intelligence', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userCompany: {
                        name: currentUserData?.orgName || 'Your Company',
                        industry: currentUserData?.industry || 'Technology',
                        description: currentUserData?.companyDescription || '',
                        products: currentUserData?.productsServices || '',
                        location: currentUserData?.hqCountry || 'Vietnam',
                        size: currentUserData?.orgSize || '11-50'
                    },
                    selectedCompetitors: selectedComps
                })
            });
            
            if (!response.ok) throw new Error(`API Error: ${response.status}`);
            
            const data = await response.json();
            setReport(data);
            isMountedRef.current = true;
        } catch (err) {
            console.error('Competitor Intelligence fetch error:', err);
            setError(err instanceof Error ? err.message : 'Failed to load competitor intelligence');
        } finally {
            setIsLoading(false);
        }
    }, []);
    
    // Only fetch on initial mount
    useEffect(() => {
        fetchCompetitorIntelligence();
    }, [fetchCompetitorIntelligence]);
    
    const sections = useMemo(() => [
        { id: 'overview', label: 'Executive Summary' },
        { id: 'firmographics', label: '1. Hồ Sơ & Sức Khỏe' },
        { id: 'positioning', label: '2. Định Vị & Chiến Lược' },
        { id: 'battlecards', label: '3. Sales Battlecards' },
        { id: 'signals', label: '4. Tín Hiệu Sớm' },
        { id: 'digital', label: '5. Digital Footprint' }
    ], []);
    
    const currentCompetitor = report?.competitors[selectedCompetitor];
    
    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                        Competitor Analysis
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Enterprise Intelligence cho {userData?.orgName || 'công ty của bạn'}
                        {report && <span className="ml-2 text-green-600">• {report.totalCompetitors} competitors analyzed</span>}
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    <button onClick={() => fetchCompetitorIntelligence(true)} disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium disabled:opacity-50">
                        <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">
                        <Download size={16} />
                        Export
                    </button>
                </div>
            </div>
            
            {/* Section Navigation */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                <span className="text-sm text-gray-500 mr-2 flex-shrink-0">≡ 5 Tầng Phân Tích</span>
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
            
            {/* Loading */}
            {isLoading && <LoadingSkeleton />}
            
            {/* Error */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center">
                    <AlertTriangle className="mx-auto text-red-500 mb-3" size={32} />
                    <p className="text-red-600 font-medium">{error}</p>
                    <button onClick={fetchCompetitorIntelligence} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700">
                        Retry
                    </button>
                </div>
            )}
            
            {/* Content */}
            {!isLoading && !error && report && (
                <>
                    {/* Competitor Selector */}
                    {report.competitors.length > 1 && activeSection !== 'overview' && activeSection !== 'positioning' && (
                        <div className="flex items-center gap-2 overflow-x-auto pb-2">
                            <span className="text-sm text-gray-500 mr-2 flex-shrink-0">Chọn đối thủ:</span>
                            {report.competitors.map((comp, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedCompetitor(idx)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                                        selectedCompetitor === idx
                                            ? 'bg-red-600 text-white'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    <span className="w-6 h-6 rounded-full bg-gray-500 text-white text-xs flex items-center justify-center">{comp.logo}</span>
                                    {comp.name}
                                    <span className="text-xs opacity-70">{comp.similarity}%</span>
                                </button>
                            ))}
                        </div>
                    )}
                    
                    {/* EXECUTIVE SUMMARY */}
                    {activeSection === 'overview' && (
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-[#0F1623] border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-1 h-8 bg-blue-600 rounded-full"></div>
                                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">Executive Summary</h3>
                                </div>
                                
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">{report.executiveSummary.overview}</p>
                                
                                <div className="grid lg:grid-cols-4 gap-4 mb-6">
                                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-center">
                                        <p className="text-3xl font-black text-blue-600">{report.totalCompetitors}</p>
                                        <p className="text-xs text-gray-500">Competitors Analyzed</p>
                                    </div>
                                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl text-center">
                                        <p className="text-3xl font-black text-green-600">{report.marketPositioningMap.quadrants.leaders.length}</p>
                                        <p className="text-xs text-gray-500">Market Leaders</p>
                                    </div>
                                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-center">
                                        <p className="text-3xl font-black text-purple-600">{report.industryOverview.totalPlayers.toLocaleString()}</p>
                                        <p className="text-xs text-gray-500">Industry Players</p>
                                    </div>
                                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-center">
                                        <p className="text-3xl font-black text-amber-600">{report.industryOverview.avgRevenue}</p>
                                        <p className="text-xs text-gray-500">Avg Revenue</p>
                                    </div>
                                </div>
                                
                                <div className="grid lg:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                            <AlertCircle size={16} className="text-blue-500" />Key Findings
                                        </h4>
                                        <ul className="space-y-2">
                                            {report.executiveSummary.keyFindings.map((finding, idx) => (
                                                <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                                                    <CheckCircle size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
                                                    {finding}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                            <Target size={16} className="text-green-500" />Recommendations
                                        </h4>
                                        <ul className="space-y-2">
                                            {report.executiveSummary.recommendations.map((rec, idx) => (
                                                <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                                                    <Zap size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                                                    {rec}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* TIER 1: FIRMOGRAPHICS */}
                    {activeSection === 'firmographics' && currentCompetitor && (
                        <FirmographicsCard competitor={currentCompetitor} />
                    )}
                    
                    {/* TIER 2: POSITIONING & STRATEGY */}
                    {activeSection === 'positioning' && (
                        <div className="space-y-6">
                            <MarketPositioningMap competitors={report.competitors} userCompany={report.userCompany} />
                            
                            {currentCompetitor && (
                                <>
                                    <div className="bg-white dark:bg-[#0F1623] border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                                <Activity className="text-green-600" size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 dark:text-white">SWOT Analysis: {currentCompetitor.name}</h3>
                                                <p className="text-xs text-gray-500">Điểm mạnh, yếu, cơ hội, thách thức</p>
                                            </div>
                                        </div>
                                        <SWOTAnalysis competitor={currentCompetitor} />
                                    </div>
                                    
                                    <div className="bg-white dark:bg-[#0F1623] border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                                <Target className="text-purple-600" size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 dark:text-white">GTM Strategy</h3>
                                                <p className="text-xs text-gray-500">Chiến lược Go-to-Market của {currentCompetitor.name}</p>
                                            </div>
                                        </div>
                                        <div className="grid lg:grid-cols-4 gap-4">
                                            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                                <div className="text-xs text-gray-500 mb-1">Target Segment</div>
                                                <div className="font-bold text-gray-900 dark:text-white">{currentCompetitor.gtmStrategy.targetSegment}</div>
                                            </div>
                                            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                                <div className="text-xs text-gray-500 mb-1">Sales Model</div>
                                                <div className="font-bold text-gray-900 dark:text-white">{currentCompetitor.gtmStrategy.salesModel}</div>
                                            </div>
                                            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                                <div className="text-xs text-gray-500 mb-1">Pricing</div>
                                                <div className="font-bold text-gray-900 dark:text-white text-sm">{currentCompetitor.gtmStrategy.pricingModel}</div>
                                            </div>
                                            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                                <div className="text-xs text-gray-500 mb-1">Key Channels</div>
                                                <div className="text-sm text-gray-700 dark:text-gray-300">{currentCompetitor.gtmStrategy.keyChannels.join(', ')}</div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                    
                    {/* TIER 3: BATTLECARDS */}
                    {activeSection === 'battlecards' && currentCompetitor && (
                        <BattlecardSection competitor={currentCompetitor} userCompany={report.userCompany} />
                    )}
                    
                    {/* TIER 4: EARLY WARNING SIGNALS */}
                    {activeSection === 'signals' && currentCompetitor && (
                        <EarlyWarningSignals competitor={currentCompetitor} />
                    )}
                    
                    {/* TIER 5: DIGITAL FOOTPRINT */}
                    {activeSection === 'digital' && currentCompetitor && (
                        <DigitalFootprint competitor={currentCompetitor} />
                    )}
                </>
            )}
        </div>
    );
};

export default CompetitorAnalysisPage;
