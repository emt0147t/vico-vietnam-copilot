/**
 * 🎯 Customer Insights Page - Standalone Page
 * 
 * Trang Customer Insights riêng biệt trong sidebar navigation
 * Sử dụng CustomerInsightsPanel component với đầy đủ 4 tầng thấu hiểu khách hàng
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    ChevronDown, ChevronUp, Users, Target, Building2, Briefcase, Heart,
    AlertTriangle, TrendingUp, MessageSquare, ThumbsUp, ThumbsDown,
    CheckCircle, XCircle, Zap, Clock, DollarSign, Shield, Star,
    ArrowRight, Loader2, RefreshCw, Download, User, MapPin, Quote,
    Lightbulb, Flag, BarChart3, PieChart, Activity, Award, AlertCircle,
    HelpCircle, Volume2, Search, Filter, ChevronRight
} from 'lucide-react';

// ==================== INTERFACES ====================
interface CustomerInsightsReport {
    generatedAt: string;
    companyName: string;
    industry: string;
    idealCustomerProfile: {
        firmographics: {
            companySize: string[];
            industries: string[];
            regions: string[];
            annualRevenue: string;
            employeeCount: string;
            techMaturity: string;
        };
        decisionMakers: Array<{
            title: string;
            role: string;
            concerns: string[];
            successMetrics: string[];
        }>;
        keyInfluencers: Array<{
            title: string;
            influence: string;
            focus: string;
        }>;
    };
    userPersonas: Array<{
        name: string;
        title: string;
        avatar: string;
        age: string;
        background: string;
        goals: string[];
        frustrations: string[];
        preferredChannels: string[];
        quote: string;
        dayInLife: string[];
        techStack: string[];
    }>;
    painPoints: Array<{
        category: string;
        pain: string;
        severity: string;
        frequency: string;
        currentSolution: string;
        costOfInaction: string;
    }>;
    desiredOutcomes: Array<{ outcome: string; metric: string; timeframe: string }>;
    triggerEvents: Array<{
        event: string;
        urgency: string;
        likelihood: number;
        signals: string[];
        approach: string;
    }>;
    buyingProcess: Array<{
        stage: string;
        description: string;
        duration: string;
        activities: string[];
        contentNeeded: string[];
        objections: string[];
        successCriteria: string;
    }>;
    purchaseBarriers: Array<{
        barrier: string;
        category: string;
        severity: string;
        overcomingStrategy: string;
        proofPoints: string[];
    }>;
    buyingCommittee: {
        avgSize: number;
        typicalCycle: string;
        budgetHolder: string;
    };
    commonObjections: Array<{
        objection: string;
        frequency: number;
        category: string;
        response: string;
        proofPoints: string[];
    }>;
    sentimentAnalysis: {
        overall: number;
        positive: number;
        neutral: number;
        negative: number;
        trend: string;
        topPositiveThemes: string[];
        topNegativeThemes: string[];
    };
    featureRequests: Array<{
        feature: string;
        votes: number;
        priority: string;
        segment: string;
        status: string;
    }>;
    npsScore: number;
    executiveSummary: {
        overview: string;
        keyInsights: string[];
        recommendations: string[];
    };
}

interface CustomerInsightsPageProps {
    userData: any;
}

// ==================== LOADING SKELETON ====================
const LoadingSkeleton = () => (
    <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (<div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>))}
        </div>
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
    </div>
);

// ==================== TIER 1: ICP SECTION ====================
const ICPSection: React.FC<{ icp: CustomerInsightsReport['idealCustomerProfile'] }> = ({ icp }) => {
    const [expandedDM, setExpandedDM] = useState<number | null>(null);
    
    const roleColors: Record<string, string> = {
        'Economic Buyer': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        'Technical Buyer': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        'User Buyer': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        'Champion': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
    };
    
    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-[#0F1623] border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <Building2 className="text-blue-600" size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white">Ideal Customer Profile (ICP)</h4>
                        <p className="text-xs text-gray-500">Firmographics - Ai là khách hàng lý tưởng?</p>
                    </div>
                </div>
                
                <div className="grid lg:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                        <div className="text-xs text-gray-500 mb-2 flex items-center gap-1"><Users size={12} />Company Size</div>
                        <div className="flex flex-wrap gap-2">
                            {icp.firmographics.companySize.map((size, idx) => (
                                <span key={idx} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-medium">{size}</span>
                            ))}
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                        <div className="text-xs text-gray-500 mb-2 flex items-center gap-1"><Briefcase size={12} />Target Industries</div>
                        <div className="flex flex-wrap gap-2">
                            {icp.firmographics.industries.map((ind, idx) => (
                                <span key={idx} className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg text-sm font-medium">{ind}</span>
                            ))}
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                        <div className="text-xs text-gray-500 mb-2 flex items-center gap-1"><MapPin size={12} />Regions</div>
                        <div className="flex flex-wrap gap-2">
                            {icp.firmographics.regions.map((region, idx) => (
                                <span key={idx} className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm font-medium">{region}</span>
                            ))}
                        </div>
                    </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl">
                        <DollarSign className="mx-auto text-green-600 mb-1" size={20} />
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{icp.firmographics.annualRevenue}</p>
                        <p className="text-xs text-gray-500">Annual Revenue</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
                        <Users className="mx-auto text-blue-600 mb-1" size={20} />
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{icp.firmographics.employeeCount}</p>
                        <p className="text-xs text-gray-500">Employee Count</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl">
                        <Zap className="mx-auto text-purple-600 mb-1" size={20} />
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{icp.firmographics.techMaturity}</p>
                        <p className="text-xs text-gray-500">Tech Maturity</p>
                    </div>
                </div>
            </div>
            
            {/* Decision Makers */}
            <div className="bg-white dark:bg-[#0F1623] border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                        <User className="text-amber-600" size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white">Decision Makers & Influencers</h4>
                        <p className="text-xs text-gray-500">Ai là người ra quyết định mua?</p>
                    </div>
                </div>
                
                <div className="space-y-3">
                    {icp.decisionMakers.map((dm, idx) => (
                        <div key={idx} className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
                            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50" onClick={() => setExpandedDM(expandedDM === idx ? null : idx)}>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center"><User size={18} className="text-gray-500" /></div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">{dm.title}</p>
                                        <span className={`text-xs px-2 py-0.5 rounded ${roleColors[dm.role] || 'bg-gray-100 text-gray-600'}`}>{dm.role}</span>
                                    </div>
                                </div>
                                {expandedDM === idx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </div>
                            {expandedDM === idx && (
                                <div className="px-4 pb-4 pt-2 border-t border-gray-100 dark:border-gray-800 grid lg:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 uppercase mb-2">🎯 Key Concerns</p>
                                        <ul className="space-y-1">
                                            {dm.concerns.map((c, i) => (<li key={i} className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2"><AlertCircle size={12} className="text-amber-500" />{c}</li>))}
                                        </ul>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 uppercase mb-2">📊 Success Metrics</p>
                                        <ul className="space-y-1">
                                            {dm.successMetrics.map((m, i) => (<li key={i} className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2"><CheckCircle size={12} className="text-green-500" />{m}</li>))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ==================== USER PERSONAS ====================
const PersonaCard: React.FC<{ persona: CustomerInsightsReport['userPersonas'][0] }> = ({ persona }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    return (
        <div className="bg-white dark:bg-[#0F1623] border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
            <div className="p-5 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl">{persona.avatar}</div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h4 className="font-bold text-gray-900 dark:text-white">{persona.name}</h4>
                            <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-gray-500">{persona.age}</span>
                        </div>
                        <p className="text-sm text-blue-600 dark:text-blue-400">{persona.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{persona.background}</p>
                    </div>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border-l-4 border-blue-500">
                    <Quote size={14} className="text-blue-500 mb-1" />
                    <p className="text-sm italic text-gray-600 dark:text-gray-300">{persona.quote}</p>
                </div>
            </div>
            {isExpanded && (
                <div className="px-5 pb-5 pt-0 space-y-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="grid lg:grid-cols-2 gap-4">
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                            <p className="text-xs font-bold text-green-600 mb-2 flex items-center gap-1"><Target size={12} />Goals</p>
                            <ul className="space-y-1">{persona.goals.map((g, idx) => (<li key={idx} className="text-sm text-gray-600 dark:text-gray-300">• {g}</li>))}</ul>
                        </div>
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                            <p className="text-xs font-bold text-red-600 mb-2 flex items-center gap-1"><AlertTriangle size={12} />Frustrations</p>
                            <ul className="space-y-1">{persona.frustrations.map((f, idx) => (<li key={idx} className="text-sm text-gray-600 dark:text-gray-300">• {f}</li>))}</ul>
                        </div>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase mb-2">📅 A Day in Life</p>
                        <div className="flex flex-wrap gap-2">
                            {persona.dayInLife.map((activity, idx) => (<span key={idx} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm text-gray-600 dark:text-gray-300">{activity}</span>))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ==================== PAIN POINTS SECTION ====================
const PainPointsSection: React.FC<{ 
    painPoints: CustomerInsightsReport['painPoints'];
    desiredOutcomes: CustomerInsightsReport['desiredOutcomes'];
    triggerEvents: CustomerInsightsReport['triggerEvents'];
}> = ({ painPoints, desiredOutcomes, triggerEvents }) => {
    const severityColors: Record<string, string> = {
        'Critical': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-500',
        'High': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-500',
        'Medium': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-500',
        'Low': 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-400'
    };
    
    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-[#0F1623] border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center"><AlertTriangle className="text-red-600" size={20} /></div>
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white">Pain Points (Nỗi Đau)</h4>
                        <p className="text-xs text-gray-500">Khách hàng đang gặp khó khăn gì?</p>
                    </div>
                </div>
                <div className="space-y-4">
                    {painPoints.map((pain, idx) => (
                        <div key={idx} className={`p-4 rounded-xl border-l-4 bg-gray-50 dark:bg-gray-800/50 ${severityColors[pain.severity]?.split(' ').pop()}`}>
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <span className="text-xs font-bold text-gray-400 uppercase">{pain.category}</span>
                                    <p className="font-medium text-gray-900 dark:text-white">{pain.pain}</p>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs font-bold ${severityColors[pain.severity]}`}>{pain.severity}</span>
                            </div>
                            <div className="grid lg:grid-cols-3 gap-3 mt-3 text-sm">
                                <div><span className="text-gray-400 text-xs">Frequency:</span><p className="text-gray-600 dark:text-gray-300">{pain.frequency}</p></div>
                                <div><span className="text-gray-400 text-xs">Current Solution:</span><p className="text-gray-600 dark:text-gray-300">{pain.currentSolution}</p></div>
                                <div><span className="text-gray-400 text-xs">Cost of Inaction:</span><p className="text-red-600 dark:text-red-400 font-medium">{pain.costOfInaction}</p></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="bg-white dark:bg-[#0F1623] border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center"><Target className="text-green-600" size={20} /></div>
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white">Desired Outcomes (Kết Quả Mong Muốn)</h4>
                        <p className="text-xs text-gray-500">Họ muốn đạt được gì?</p>
                    </div>
                </div>
                <div className="grid lg:grid-cols-2 gap-4">
                    {desiredOutcomes.map((outcome, idx) => (
                        <div key={idx} className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800">
                            <div className="flex items-start gap-3">
                                <CheckCircle className="text-green-600 mt-0.5" size={18} />
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">{outcome.outcome}</p>
                                    <div className="flex items-center gap-3 mt-2 text-sm">
                                        <span className="px-2 py-1 bg-green-200 dark:bg-green-800 rounded text-green-800 dark:text-green-300 font-medium">{outcome.metric}</span>
                                        <span className="text-gray-500 flex items-center gap-1"><Clock size={12} />{outcome.timeframe}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="bg-white dark:bg-[#0F1623] border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center"><Zap className="text-amber-600" size={20} /></div>
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white">Trigger Events (Sự Kiện Kích Hoạt)</h4>
                        <p className="text-xs text-gray-500">Khi nào họ nảy sinh ý định mua?</p>
                    </div>
                </div>
                <div className="space-y-3">
                    {triggerEvents.map((trigger, idx) => (
                        <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold ${trigger.urgency === 'Immediate' ? 'bg-red-500' : trigger.urgency === 'Short-term' ? 'bg-amber-500' : 'bg-blue-500'}`}>{trigger.likelihood}%</div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">{trigger.event}</p>
                                        <span className={`text-xs ${trigger.urgency === 'Immediate' ? 'text-red-600' : trigger.urgency === 'Short-term' ? 'text-amber-600' : 'text-blue-600'}`}>{trigger.urgency} urgency</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-3 grid lg:grid-cols-2 gap-3">
                                <div>
                                    <span className="text-xs text-gray-400">Signals to watch:</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {trigger.signals.map((sig, i) => (<span key={i} className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-300">{sig}</span>))}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-400">Recommended approach:</span>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{trigger.approach}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ==================== BUYING JOURNEY SECTION ====================
const BuyingJourneySection: React.FC<{ 
    buyingProcess: CustomerInsightsReport['buyingProcess'];
    purchaseBarriers: CustomerInsightsReport['purchaseBarriers'];
    buyingCommittee: CustomerInsightsReport['buyingCommittee'];
}> = ({ buyingProcess, purchaseBarriers, buyingCommittee }) => {
    const [activeStage, setActiveStage] = useState(0);
    
    return (
        <div className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-[#0F1623] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 text-center">
                    <Users className="mx-auto text-blue-600 mb-2" size={28} />
                    <p className="text-3xl font-black text-gray-900 dark:text-white">{buyingCommittee.avgSize}</p>
                    <p className="text-xs text-gray-500">Avg. Committee Size</p>
                </div>
                <div className="bg-white dark:bg-[#0F1623] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 text-center">
                    <Clock className="mx-auto text-amber-600 mb-2" size={28} />
                    <p className="text-3xl font-black text-gray-900 dark:text-white">{buyingCommittee.typicalCycle}</p>
                    <p className="text-xs text-gray-500">Sales Cycle</p>
                </div>
                <div className="bg-white dark:bg-[#0F1623] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 text-center">
                    <DollarSign className="mx-auto text-green-600 mb-2" size={28} />
                    <p className="text-lg font-black text-gray-900 dark:text-white">{buyingCommittee.budgetHolder}</p>
                    <p className="text-xs text-gray-500">Budget Holder</p>
                </div>
            </div>
            
            <div className="bg-white dark:bg-[#0F1623] border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center"><ArrowRight className="text-blue-600" size={20} /></div>
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white">Buying Process</h4>
                        <p className="text-xs text-gray-500">Hành trình mua hàng</p>
                    </div>
                </div>
                
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {buyingProcess.map((stage, idx) => (
                        <button key={idx} onClick={() => setActiveStage(idx)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap ${activeStage === idx ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${activeStage === idx ? 'bg-white text-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}>{idx + 1}</span>
                            {stage.stage.replace(/^\d+\.\s*/, '')}
                        </button>
                    ))}
                </div>
                
                {buyingProcess[activeStage] && (
                    <div className="space-y-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                            <p className="text-gray-700 dark:text-gray-300">{buyingProcess[activeStage].description}</p>
                            <p className="text-sm text-blue-600 mt-2">Duration: {buyingProcess[activeStage].duration}</p>
                        </div>
                        <div className="grid lg:grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                <p className="text-xs font-bold text-gray-500 uppercase mb-3">📋 Activities</p>
                                <ul className="space-y-2">
                                    {buyingProcess[activeStage].activities.map((act, idx) => (<li key={idx} className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2"><CheckCircle size={14} className="text-green-500" />{act}</li>))}
                                </ul>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                <p className="text-xs font-bold text-gray-500 uppercase mb-3">📚 Content Needed</p>
                                <div className="flex flex-wrap gap-2">
                                    {buyingProcess[activeStage].contentNeeded.map((c, idx) => (<span key={idx} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-sm">{c}</span>))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            <div className="bg-white dark:bg-[#0F1623] border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center"><Shield className="text-red-600" size={20} /></div>
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white">Purchase Barriers</h4>
                        <p className="text-xs text-gray-500">Rào cản mua hàng</p>
                    </div>
                </div>
                <div className="space-y-4">
                    {purchaseBarriers.map((b, idx) => (
                        <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">{b.category}</span>
                                    <p className="font-medium text-gray-900 dark:text-white mt-1">{b.barrier}</p>
                                </div>
                                <span className={`text-xs font-bold ${b.severity === 'High' ? 'text-red-600' : 'text-amber-600'}`}>{b.severity}</span>
                            </div>
                            <div className="p-3 bg-white dark:bg-gray-900 rounded-lg mt-2">
                                <p className="text-xs font-bold text-green-600 mb-1">💡 How to Overcome:</p>
                                <p className="text-sm text-gray-600 dark:text-gray-300">{b.overcomingStrategy}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ==================== VOICE OF CUSTOMER SECTION ====================
const VoiceOfCustomerSection: React.FC<{ 
    commonObjections: CustomerInsightsReport['commonObjections'];
    sentimentAnalysis: CustomerInsightsReport['sentimentAnalysis'];
    featureRequests: CustomerInsightsReport['featureRequests'];
    npsScore: number;
}> = ({ commonObjections, sentimentAnalysis, featureRequests, npsScore }) => {
    const [expandedObj, setExpandedObj] = useState<number | null>(null);
    
    return (
        <div className="space-y-6">
            <div className="grid lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-[#0F1623] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 text-center">
                    <div className={`text-4xl font-black ${npsScore >= 50 ? 'text-green-600' : npsScore >= 20 ? 'text-amber-600' : 'text-red-600'}`}>{npsScore}</div>
                    <p className="text-xs text-gray-500 mt-1">NPS Score</p>
                </div>
                <div className="bg-white dark:bg-[#0F1623] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 text-center">
                    <div className="text-4xl font-black text-green-600">{sentimentAnalysis.positive}%</div>
                    <p className="text-xs text-gray-500 mt-1">Positive</p>
                </div>
                <div className="bg-white dark:bg-[#0F1623] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 text-center">
                    <div className="text-4xl font-black text-gray-500">{sentimentAnalysis.neutral}%</div>
                    <p className="text-xs text-gray-500 mt-1">Neutral</p>
                </div>
                <div className="bg-white dark:bg-[#0F1623] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 text-center">
                    <div className="text-4xl font-black text-red-600">{sentimentAnalysis.negative}%</div>
                    <p className="text-xs text-gray-500 mt-1">Negative</p>
                </div>
            </div>
            
            <div className="bg-white dark:bg-[#0F1623] border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center"><MessageSquare className="text-amber-600" size={20} /></div>
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white">Common Objections</h4>
                        <p className="text-xs text-gray-500">Lời từ chối phổ biến và cách phản bác</p>
                    </div>
                </div>
                <div className="space-y-3">
                    {commonObjections.map((obj, idx) => (
                        <div key={idx} className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
                            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50" onClick={() => setExpandedObj(expandedObj === idx ? null : idx)}>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                        <span className="text-lg font-bold text-amber-600">{obj.frequency}%</span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">"{obj.objection}"</p>
                                        <span className="text-xs text-gray-500">{obj.category}</span>
                                    </div>
                                </div>
                                {expandedObj === idx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </div>
                            {expandedObj === idx && (
                                <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-800 pt-3">
                                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                                        <p className="text-xs font-bold text-green-600 mb-1">✅ Response:</p>
                                        <p className="text-sm text-gray-700 dark:text-gray-300">{obj.response}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="bg-white dark:bg-[#0F1623] border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center"><Lightbulb className="text-purple-600" size={20} /></div>
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white">Feature Requests</h4>
                        <p className="text-xs text-gray-500">Yêu cầu tính năng từ khách hàng</p>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-800/50">
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Feature</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">Votes</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">Priority</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {featureRequests.map((fr, idx) => (
                                <tr key={idx}>
                                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{fr.feature}</td>
                                    <td className="px-4 py-3 text-center"><span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded font-bold">{fr.votes}</span></td>
                                    <td className="px-4 py-3 text-center"><span className={`px-2 py-1 rounded text-xs font-bold ${fr.priority === 'Critical' ? 'bg-red-100 text-red-700' : fr.priority === 'High' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>{fr.priority}</span></td>
                                    <td className="px-4 py-3 text-center"><span className={`px-2 py-1 rounded text-xs ${fr.status === 'In Progress' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{fr.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// ==================== MAIN PAGE COMPONENT ====================
export const CustomerInsightsPage: React.FC<CustomerInsightsPageProps> = ({ userData }) => {
    const [activeSection, setActiveSection] = useState('overview');
    const [report, setReport] = useState<CustomerInsightsReport | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [inputCompany, setInputCompany] = useState(userData?.orgName || '');
    const isMountedRef = useRef(false);
    
    const fetchCustomerInsights = useCallback(async (company: string, forceRefresh = false) => {
        if (!company.trim()) return;
        if (isMountedRef.current && !forceRefresh && report) return;
        
        setIsLoading(true);
        setError(null);
        
        try {
            const response = await fetch('http://localhost:3001/api/customer-insights', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    companyName: company,
                    industry: userData?.industry || 'Technology',
                    products: userData?.productsServices || '',
                    targetMarket: 'Vietnam'
                })
            });
            
            if (!response.ok) throw new Error(`API Error: ${response.status}`);
            
            const data = await response.json();
            setReport(data);
            isMountedRef.current = true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load');
        } finally {
            setIsLoading(false);
        }
    }, [userData, report]);
    
    const handleGenerate = () => {
        if (inputCompany.trim()) {
            isMountedRef.current = false;
            fetchCustomerInsights(inputCompany, true);
        }
    };
    
    const sections = [
        { id: 'overview', label: 'Executive Summary', icon: FileText },
        { id: 'icp', label: 'Chân Dung Khách Hàng', icon: Building2 },
        { id: 'personas', label: 'User Personas', icon: Users },
        { id: 'pain', label: 'Nỗi Đau & Động Lực', icon: AlertTriangle },
        { id: 'journey', label: 'Hành Trình Mua', icon: ArrowRight },
        { id: 'voc', label: 'Tiếng Nói Khách Hàng', icon: MessageSquare }
    ];
    
    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                    Customer Insights
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                    4 Tầng Thấu Hiểu Khách Hàng - Tâm lý học hành vi mua hàng
                </p>
            </div>
            
            {/* Search Input */}
            <div className="bg-white dark:bg-[#0F1623] border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <Heart className="text-white" size={24} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Customer Insights Engine</h2>
                        <p className="text-sm text-gray-500">Phân tích sâu về khách hàng mục tiêu</p>
                    </div>
                </div>
                
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={inputCompany}
                        onChange={(e) => setInputCompany(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
                        placeholder="Nhập tên công ty để phân tích khách hàng..."
                        className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button onClick={handleGenerate} disabled={isLoading || !inputCompany.trim()} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium disabled:opacity-50 flex items-center gap-2">
                        {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                        {isLoading ? 'Analyzing...' : 'Generate'}
                    </button>
                </div>
            </div>
            
            {/* Error State */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center">
                    <AlertTriangle className="mx-auto text-red-500 mb-3" size={32} />
                    <p className="text-red-600 font-medium">{error}</p>
                    <button onClick={handleGenerate} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl">Retry</button>
                </div>
            )}
            
            {/* Loading State */}
            {isLoading && <LoadingSkeleton />}
            
            {/* Report Content */}
            {!isLoading && !error && report && (
                <>
                    {/* Section Navigation */}
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {sections.map(s => (
                            <button key={s.id} onClick={() => setActiveSection(s.id)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${activeSection === s.id ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                                <s.icon size={16} />
                                {s.label}
                            </button>
                        ))}
                    </div>
                    
                    {/* Executive Summary */}
                    {activeSection === 'overview' && (
                        <div className="bg-white dark:bg-[#0F1623] border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-1 h-8 bg-blue-600 rounded-full"></div>
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Executive Summary</h3>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">{report.executiveSummary.overview}</p>
                            <div className="grid lg:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2"><AlertCircle size={16} className="text-blue-500" />Key Insights</h4>
                                    <ul className="space-y-2">
                                        {report.executiveSummary.keyInsights.map((i, idx) => (<li key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300"><CheckCircle size={14} className="text-blue-500 mt-0.5" />{i}</li>))}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2"><Target size={16} className="text-green-500" />Recommendations</h4>
                                    <ul className="space-y-2">
                                        {report.executiveSummary.recommendations.map((r, idx) => (<li key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300"><Zap size={14} className="text-green-500 mt-0.5" />{r}</li>))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* ICP Section */}
                    {activeSection === 'icp' && <ICPSection icp={report.idealCustomerProfile} />}
                    
                    {/* Personas Section */}
                    {activeSection === 'personas' && (
                        <div className="space-y-4">
                            {report.userPersonas.map((p, idx) => <PersonaCard key={idx} persona={p} />)}
                        </div>
                    )}
                    
                    {/* Pain Points Section */}
                    {activeSection === 'pain' && <PainPointsSection painPoints={report.painPoints} desiredOutcomes={report.desiredOutcomes} triggerEvents={report.triggerEvents} />}
                    
                    {/* Buying Journey Section */}
                    {activeSection === 'journey' && <BuyingJourneySection buyingProcess={report.buyingProcess} purchaseBarriers={report.purchaseBarriers} buyingCommittee={report.buyingCommittee} />}
                    
                    {/* Voice of Customer Section */}
                    {activeSection === 'voc' && <VoiceOfCustomerSection commonObjections={report.commonObjections} sentimentAnalysis={report.sentimentAnalysis} featureRequests={report.featureRequests} npsScore={report.npsScore} />}
                </>
            )}
            
            {/* Empty State */}
            {!isLoading && !error && !report && (
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-200 dark:border-blue-800 p-12 text-center">
                    <div className="text-6xl mb-6">🎯</div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Customer Insights Engine</h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">Nhập tên công ty để tạo phân tích 4 tầng thấu hiểu khách hàng với AI</p>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-2xl mx-auto">
                        <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                            <Building2 className="mx-auto text-blue-600 mb-2" size={24} />
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">ICP & Decision Makers</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                            <AlertTriangle className="mx-auto text-red-600 mb-2" size={24} />
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Pain Points & Triggers</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                            <ArrowRight className="mx-auto text-amber-600 mb-2" size={24} />
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Buying Journey</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                            <MessageSquare className="mx-auto text-purple-600 mb-2" size={24} />
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Voice of Customer</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerInsightsPage;

// Add missing import
const FileText = ({ className, size }: { className?: string; size?: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
);
