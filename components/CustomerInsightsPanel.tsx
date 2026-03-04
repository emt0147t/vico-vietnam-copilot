/**
 * 🎯 Customer Insights Panel - Enterprise Edition
 * 
 * 4 Customer Understanding Layers:
 * 1. Customer Profile & Identity (Who are they?)
 * 2. Pain Points & Motivations (Why they buy?)
 * 3. Buying Journey (How they buy?)
 * 4. Voice of Customer
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

// Types
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

interface CustomerInsightsPanelProps {
    companyName?: string;
    industry?: string;
    products?: string;
    targetMarket?: string;
    onDataLoad?: (report: CustomerInsightsReport) => void;
}

// ==================== LOADING SKELETON ====================
const LoadingSkeleton = () => (
    <div className="animate-pulse space-y-6">
        <div className="h-8 bg-[#E4E4E7] rounded w-1/3"></div>
        <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (<div key={i} className="h-24 bg-[#E4E4E7] rounded-xl"></div>))}
        </div>
        <div className="h-64 bg-[#E4E4E7] rounded-xl"></div>
    </div>
);

// ==================== TIER 1: ICP & PERSONAS ====================
const ICPSection: React.FC<{ icp: CustomerInsightsReport['idealCustomerProfile'] }> = ({ icp }) => {
    const [expandedDM, setExpandedDM] = useState<number | null>(null);
    
    const roleColors: Record<string, string> = {
        'Economic Buyer': 'bg-green-100 text-green-700',
        'Technical Buyer': 'bg-blue-100 text-blue-700',
        'User Buyer': 'bg-purple-100 text-purple-700',
        'Champion': 'bg-amber-100 text-amber-700'
    };
    
    return (
        <div className="space-y-6">
            {/* Firmographics */}
            <div className="bg-white border border-[#E4E4E7] rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                        <Building2 className="text-blue-600" size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-[#18181B]">Ideal Customer Profile (ICP)</h4>
                        <p className="text-xs text-[#71717A]">Firmographics - Who is the ideal customer?</p>
                    </div>
                </div>
                
                <div className="grid lg:grid-cols-3 gap-4">
                    <div className="p-4 bg-[#FAFAFA] rounded-xl">
                        <div className="text-xs text-[#71717A] mb-2 flex items-center gap-1">
                            <Users size={12} />Company Size
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {icp.firmographics.companySize.map((size, idx) => (
                                <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                                    {size}
                                </span>
                            ))}
                        </div>
                    </div>
                    
                    <div className="p-4 bg-[#FAFAFA] rounded-xl">
                        <div className="text-xs text-[#71717A] mb-2 flex items-center gap-1">
                            <Briefcase size={12} />Target Industries
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {icp.firmographics.industries.map((ind, idx) => (
                                <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium">
                                    {ind}
                                </span>
                            ))}
                        </div>
                    </div>
                    
                    <div className="p-4 bg-[#FAFAFA] rounded-xl">
                        <div className="text-xs text-[#71717A] mb-2 flex items-center gap-1">
                            <MapPin size={12} />Regions
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {icp.firmographics.regions.map((region, idx) => (
                                <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                                    {region}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                        <DollarSign className="mx-auto text-green-600 mb-1" size={20} />
                        <p className="text-lg font-bold text-[#18181B]">{icp.firmographics.annualRevenue}</p>
                        <p className="text-xs text-[#71717A]">Annual Revenue</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                        <Users className="mx-auto text-blue-600 mb-1" size={20} />
                        <p className="text-lg font-bold text-[#18181B]">{icp.firmographics.employeeCount}</p>
                        <p className="text-xs text-[#71717A]">Employee Count</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                        <Zap className="mx-auto text-purple-600 mb-1" size={20} />
                        <p className="text-lg font-bold text-[#18181B]">{icp.firmographics.techMaturity}</p>
                        <p className="text-xs text-[#71717A]">Tech Maturity</p>
                    </div>
                </div>
            </div>
            
            {/* Decision Makers */}
            <div className="bg-white border border-[#E4E4E7] rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                        <User className="text-amber-600" size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-[#18181B]">Decision Makers & Influencers</h4>
                        <p className="text-xs text-[#71717A]">Who is the buying decision-maker?</p>
                    </div>
                </div>
                
                <div className="space-y-3">
                    {icp.decisionMakers.map((dm, idx) => (
                        <div key={idx} className="border border-[#E4E4E7] rounded-xl overflow-hidden">
                            <div 
                                className="flex items-center justify-between p-4 cursor-pointer hover:bg-[#FAFAFA]"
                                onClick={() => setExpandedDM(expandedDM === idx ? null : idx)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[#E4E4E7] flex items-center justify-center">
                                        <User size={18} className="text-[#71717A]" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-[#18181B]">{dm.title}</p>
                                        <span className={`text-xs px-2 py-0.5 rounded ${roleColors[dm.role] || 'bg-[#F4F4F5] text-[#71717A]'}`}>
                                            {dm.role}
                                        </span>
                                    </div>
                                </div>
                                {expandedDM === idx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </div>
                            
                            {expandedDM === idx && (
                                <div className="px-4 pb-4 pt-2 border-t border-[#E4E4E7] grid lg:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs font-bold text-[#71717A] uppercase mb-2">Key Concerns</p>
                                        <ul className="space-y-1">
                                            {dm.concerns.map((c, i) => (
                                                <li key={i} className="text-sm text-[#71717A] flex items-center gap-2">
                                                    <AlertCircle size={12} className="text-amber-500" />{c}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-[#71717A] uppercase mb-2">Success Metrics</p>
                                        <ul className="space-y-1">
                                            {dm.successMetrics.map((m, i) => (
                                                <li key={i} className="text-sm text-[#71717A] flex items-center gap-2">
                                                    <CheckCircle size={12} className="text-green-500" />{m}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                
                {/* Key Influencers */}
                <div className="mt-4 p-4 bg-[#FAFAFA] rounded-xl">
                    <p className="text-xs font-bold text-[#71717A] uppercase mb-3">Key Influencers</p>
                    <div className="flex flex-wrap gap-3">
                        {icp.keyInfluencers.map((inf, idx) => (
                            <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-[#E4E4E7]">
                                <div className={`w-2 h-2 rounded-full ${
                                    inf.influence === 'High' ? 'bg-red-500' :
                                    inf.influence === 'Medium' ? 'bg-amber-500' : 'bg-[#A1A1AA]'
                                }`} />
                                <span className="text-sm font-medium text-[#18181B]">{inf.title}</span>
                                <span className="text-xs text-[#A1A1AA]">({inf.focus})</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ==================== USER PERSONAS ====================
const PersonaCard: React.FC<{ persona: CustomerInsightsReport['userPersonas'][0] }> = ({ persona }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    return (
        <div className="bg-white border border-[#E4E4E7] rounded-2xl overflow-hidden">
            <div className="p-5 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl">
                        {persona.avatar}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h4 className="font-bold text-[#18181B]">{persona.name}</h4>
                            <span className="text-xs px-2 py-0.5 bg-[#F4F4F5] rounded text-[#71717A]">{persona.age}</span>
                        </div>
                        <p className="text-sm text-blue-600">{persona.title}</p>
                        <p className="text-xs text-[#71717A] mt-1">{persona.background}</p>
                    </div>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
                
                {/* Quote */}
                <div className="mt-4 p-3 bg-blue-50 rounded-xl border-l-4 border-blue-500">
                    <Quote size={14} className="text-blue-500 mb-1" />
                    <p className="text-sm italic text-[#71717A]">{persona.quote}</p>
                </div>
            </div>
            
            {isExpanded && (
                <div className="px-5 pb-5 pt-0 space-y-4 border-t border-[#E4E4E7]">
                    <div className="grid lg:grid-cols-2 gap-4">
                        <div className="p-3 bg-green-50 rounded-xl">
                            <p className="text-xs font-bold text-green-600 mb-2 flex items-center gap-1">
                                <Target size={12} />Goals
                            </p>
                            <ul className="space-y-1">
                                {persona.goals.map((g, idx) => (
                                    <li key={idx} className="text-sm text-[#71717A]">• {g}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="p-3 bg-red-50 rounded-xl">
                            <p className="text-xs font-bold text-red-600 mb-2 flex items-center gap-1">
                                <AlertTriangle size={12} />Frustrations
                            </p>
                            <ul className="space-y-1">
                                {persona.frustrations.map((f, idx) => (
                                    <li key={idx} className="text-sm text-[#71717A]">• {f}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    
                    <div>
                        <p className="text-xs font-bold text-[#71717A] uppercase mb-2">A Day in Life</p>
                        <div className="flex flex-wrap gap-2">
                            {persona.dayInLife.map((activity, idx) => (
                                <span key={idx} className="px-3 py-1 bg-[#F4F4F5] rounded-lg text-sm text-[#71717A]">
                                    {activity}
                                </span>
                            ))}
                        </div>
                    </div>
                    
                    <div className="grid lg:grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs font-bold text-[#71717A] uppercase mb-2">Preferred Channels</p>
                            <div className="flex flex-wrap gap-2">
                                {persona.preferredChannels.map((ch, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                        {ch}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-[#71717A] uppercase mb-2">Tech Stack</p>
                            <div className="flex flex-wrap gap-2">
                                {persona.techStack.map((tech, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ==================== TIER 2: PAIN POINTS ====================
const PainPointsSection: React.FC<{ 
    painPoints: CustomerInsightsReport['painPoints'];
    desiredOutcomes: CustomerInsightsReport['desiredOutcomes'];
    triggerEvents: CustomerInsightsReport['triggerEvents'];
}> = ({ painPoints, desiredOutcomes, triggerEvents }) => {
    
    const severityColors: Record<string, string> = {
        'Critical': 'bg-red-100 text-red-700 border-red-500',
        'High': 'bg-amber-100 text-amber-700 border-amber-500',
        'Medium': 'bg-blue-100 text-blue-700 border-blue-500',
        'Low': 'bg-[#F4F4F5] text-[#71717A] border-[#A1A1AA]'
    };
    
    return (
        <div className="space-y-6">
            {/* Pain Points */}
            <div className="bg-white border border-[#E4E4E7] rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                        <AlertTriangle className="text-red-600" size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-[#18181B]">Pain Points</h4>
                        <p className="text-xs text-[#71717A]">What challenges are customers facing?</p>
                    </div>
                </div>
                
                <div className="space-y-4">
                    {painPoints.map((pain, idx) => (
                        <div key={idx} className={`p-4 rounded-xl border-l-4 bg-[#FAFAFA] ${severityColors[pain.severity]?.split(' ').pop()}`}>
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <span className="text-xs font-bold text-[#A1A1AA] uppercase">{pain.category}</span>
                                    <p className="font-medium text-[#18181B]">{pain.pain}</p>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs font-bold ${severityColors[pain.severity]}`}>
                                    {pain.severity}
                                </span>
                            </div>
                            <div className="grid lg:grid-cols-3 gap-3 mt-3 text-sm">
                                <div>
                                    <span className="text-[#A1A1AA] text-xs">Frequency:</span>
                                    <p className="text-[#71717A]">{pain.frequency}</p>
                                </div>
                                <div>
                                    <span className="text-[#A1A1AA] text-xs">Current Solution:</span>
                                    <p className="text-[#71717A]">{pain.currentSolution}</p>
                                </div>
                                <div>
                                    <span className="text-[#A1A1AA] text-xs">Cost of Inaction:</span>
                                    <p className="text-red-600 font-medium">{pain.costOfInaction}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Desired Outcomes */}
            <div className="bg-white border border-[#E4E4E7] rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                        <Target className="text-green-600" size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-[#18181B]">Desired Outcomes</h4>
                        <p className="text-xs text-[#71717A]">What do they want to achieve?</p>
                    </div>
                </div>
                
                <div className="grid lg:grid-cols-2 gap-4">
                    {desiredOutcomes.map((outcome, idx) => (
                        <div key={idx} className="p-4 bg-green-50 rounded-xl border border-green-100">
                            <div className="flex items-start gap-3">
                                <CheckCircle className="text-green-600 mt-0.5" size={18} />
                                <div>
                                    <p className="font-medium text-[#18181B]">{outcome.outcome}</p>
                                    <div className="flex items-center gap-3 mt-2 text-sm">
                                        <span className="px-2 py-1 bg-green-200 rounded text-green-800 font-medium">
                                            {outcome.metric}
                                        </span>
                                        <span className="text-[#71717A] flex items-center gap-1">
                                            <Clock size={12} />{outcome.timeframe}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Trigger Events */}
            <div className="bg-white border border-[#E4E4E7] rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                        <Zap className="text-amber-600" size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-[#18181B]">Trigger Events</h4>
                        <p className="text-xs text-[#71717A]">When does buying intent arise?</p>
                    </div>
                </div>
                
                <div className="space-y-3">
                    {triggerEvents.map((trigger, idx) => (
                        <div key={idx} className="p-4 bg-[#FAFAFA] rounded-xl">
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold ${
                                        trigger.urgency === 'Immediate' ? 'bg-red-500' :
                                        trigger.urgency === 'Short-term' ? 'bg-amber-500' : 'bg-blue-500'
                                    }`}>
                                        {trigger.likelihood}%
                                    </div>
                                    <div>
                                        <p className="font-medium text-[#18181B]">{trigger.event}</p>
                                        <span className={`text-xs ${
                                            trigger.urgency === 'Immediate' ? 'text-red-600' :
                                            trigger.urgency === 'Short-term' ? 'text-amber-600' : 'text-blue-600'
                                        }`}>
                                            {trigger.urgency} urgency
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-3 grid lg:grid-cols-2 gap-3">
                                <div>
                                    <span className="text-xs text-[#A1A1AA]">Signals to watch:</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {trigger.signals.map((sig, i) => (
                                            <span key={i} className="px-2 py-0.5 bg-[#E4E4E7] rounded text-xs text-[#71717A]">
                                                {sig}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-xs text-[#A1A1AA]">Recommended approach:</span>
                                    <p className="text-sm text-[#71717A] mt-1">{trigger.approach}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ==================== TIER 3: BUYING JOURNEY ====================
const BuyingJourneySection: React.FC<{ 
    buyingProcess: CustomerInsightsReport['buyingProcess'];
    purchaseBarriers: CustomerInsightsReport['purchaseBarriers'];
    buyingCommittee: CustomerInsightsReport['buyingCommittee'];
}> = ({ buyingProcess, purchaseBarriers, buyingCommittee }) => {
    const [activeStage, setActiveStage] = useState(0);
    
    return (
        <div className="space-y-6">
            {/* Buying Committee Overview */}
            <div className="grid lg:grid-cols-3 gap-4">
                <div className="bg-white border border-[#E4E4E7] rounded-2xl p-6 text-center">
                    <Users className="mx-auto text-blue-600 mb-2" size={28} />
                    <p className="text-3xl font-black text-[#18181B]">{buyingCommittee.avgSize}</p>
                    <p className="text-xs text-[#71717A]">Avg. Committee Size</p>
                </div>
                <div className="bg-white border border-[#E4E4E7] rounded-2xl p-6 text-center">
                    <Clock className="mx-auto text-amber-600 mb-2" size={28} />
                    <p className="text-3xl font-black text-[#18181B]">{buyingCommittee.typicalCycle}</p>
                    <p className="text-xs text-[#71717A]">Sales Cycle</p>
                </div>
                <div className="bg-white border border-[#E4E4E7] rounded-2xl p-6 text-center">
                    <DollarSign className="mx-auto text-green-600 mb-2" size={28} />
                    <p className="text-lg font-black text-[#18181B]">{buyingCommittee.budgetHolder}</p>
                    <p className="text-xs text-[#71717A]">Budget Holder</p>
                </div>
            </div>
            
            {/* Buying Process */}
            <div className="bg-white border border-[#E4E4E7] rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                        <ArrowRight className="text-blue-600" size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-[#18181B]">Buying Process</h4>
                        <p className="text-xs text-[#71717A]">Buying Journey</p>
                    </div>
                </div>
                
                {/* Stage Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {buyingProcess.map((stage, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveStage(idx)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap ${
                                activeStage === idx
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-[#F4F4F5] text-[#71717A]'
                            }`}
                        >
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                                activeStage === idx ? 'bg-white text-blue-600' : 'bg-[#D4D4D8]'
                            }`}>{idx + 1}</span>
                            {stage.stage.replace(/^\d+\.\s*/, '')}
                        </button>
                    ))}
                </div>
                
                {/* Active Stage */}
                {buyingProcess[activeStage] && (
                    <div className="space-y-4">
                        <div className="p-4 bg-blue-50 rounded-xl">
                            <p className="text-[#18181B]">{buyingProcess[activeStage].description}</p>
                            <p className="text-sm text-blue-600 mt-2">Duration: {buyingProcess[activeStage].duration}</p>
                        </div>
                        
                        <div className="grid lg:grid-cols-2 gap-4">
                            <div className="p-4 bg-[#FAFAFA] rounded-xl">
                                <p className="text-xs font-bold text-[#71717A] uppercase mb-3">Activities</p>
                                <ul className="space-y-2">
                                    {buyingProcess[activeStage].activities.map((act, idx) => (
                                        <li key={idx} className="text-sm text-[#71717A] flex items-center gap-2">
                                            <CheckCircle size={14} className="text-green-500" />{act}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="p-4 bg-[#FAFAFA] rounded-xl">
                                <p className="text-xs font-bold text-[#71717A] uppercase mb-3">Content Needed</p>
                                <div className="flex flex-wrap gap-2">
                                    {buyingProcess[activeStage].contentNeeded.map((c, idx) => (
                                        <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm">{c}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-4 bg-amber-50 rounded-xl">
                            <p className="text-xs font-bold text-amber-600 uppercase mb-3">Common Objections</p>
                            <ul className="space-y-2">
                                {buyingProcess[activeStage].objections.map((obj, idx) => (
                                    <li key={idx} className="text-sm text-[#71717A]">"{obj}"</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Purchase Barriers */}
            <div className="bg-white border border-[#E4E4E7] rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                        <Shield className="text-red-600" size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-[#18181B]">Purchase Barriers</h4>
                        <p className="text-xs text-[#71717A]">Buying Barriers</p>
                    </div>
                </div>
                
                <div className="space-y-4">
                    {purchaseBarriers.map((b, idx) => (
                        <div key={idx} className="p-4 bg-[#FAFAFA] rounded-xl">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <span className="text-xs px-2 py-0.5 bg-[#E4E4E7] rounded">{b.category}</span>
                                    <p className="font-medium text-[#18181B] mt-1">{b.barrier}</p>
                                </div>
                                <span className={`text-xs font-bold ${b.severity === 'High' ? 'text-red-600' : 'text-amber-600'}`}>{b.severity}</span>
                            </div>
                            <div className="p-3 bg-white rounded-lg mt-2">
                                <p className="text-xs font-bold text-green-600 mb-1">How to Overcome:</p>
                                <p className="text-sm text-[#71717A]">{b.overcomingStrategy}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ==================== TIER 4: VOICE OF CUSTOMER ====================
const VoiceOfCustomerSection: React.FC<{ 
    commonObjections: CustomerInsightsReport['commonObjections'];
    sentimentAnalysis: CustomerInsightsReport['sentimentAnalysis'];
    featureRequests: CustomerInsightsReport['featureRequests'];
    npsScore: number;
}> = ({ commonObjections, sentimentAnalysis, featureRequests, npsScore }) => {
    const [expandedObj, setExpandedObj] = useState<number | null>(null);
    
    return (
        <div className="space-y-6">
            {/* Sentiment Overview */}
            <div className="grid lg:grid-cols-4 gap-4">
                <div className="bg-white border border-[#E4E4E7] rounded-2xl p-6 text-center">
                    <div className={`text-4xl font-black ${npsScore >= 50 ? 'text-green-600' : npsScore >= 20 ? 'text-amber-600' : 'text-red-600'}`}>{npsScore}</div>
                    <p className="text-xs text-[#71717A] mt-1">NPS Score</p>
                </div>
                <div className="bg-white border border-[#E4E4E7] rounded-2xl p-6 text-center">
                    <div className="text-4xl font-black text-green-600">{sentimentAnalysis.positive}%</div>
                    <p className="text-xs text-[#71717A] mt-1">Positive</p>
                </div>
                <div className="bg-white border border-[#E4E4E7] rounded-2xl p-6 text-center">
                    <div className="text-4xl font-black text-[#71717A]">{sentimentAnalysis.neutral}%</div>
                    <p className="text-xs text-[#71717A] mt-1">Neutral</p>
                </div>
                <div className="bg-white border border-[#E4E4E7] rounded-2xl p-6 text-center">
                    <div className="text-4xl font-black text-red-600">{sentimentAnalysis.negative}%</div>
                    <p className="text-xs text-[#71717A] mt-1">Negative</p>
                </div>
            </div>
            
            {/* Common Objections */}
            <div className="bg-white border border-[#E4E4E7] rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                        <MessageSquare className="text-amber-600" size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-[#18181B]">Common Objections</h4>
                        <p className="text-xs text-[#71717A]">Common objections and how to counter them</p>
                    </div>
                </div>
                
                <div className="space-y-3">
                    {commonObjections.map((obj, idx) => (
                        <div key={idx} className="border border-[#E4E4E7] rounded-xl overflow-hidden">
                            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-[#FAFAFA]" onClick={() => setExpandedObj(expandedObj === idx ? null : idx)}>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                                        <span className="text-lg font-bold text-amber-600">{obj.frequency}%</span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-[#18181B]">"{obj.objection}"</p>
                                        <span className="text-xs text-[#71717A]">{obj.category}</span>
                                    </div>
                                </div>
                                {expandedObj === idx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </div>
                            {expandedObj === idx && (
                                <div className="px-4 pb-4 border-t border-[#E4E4E7] pt-3">
                                    <div className="p-3 bg-green-50 rounded-xl">
                                        <p className="text-xs font-bold text-green-600 mb-1">Response:</p>
                                        <p className="text-sm text-[#18181B]">{obj.response}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Feature Requests */}
            <div className="bg-white border border-[#E4E4E7] rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                        <Lightbulb className="text-purple-600" size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-[#18181B]">Feature Requests</h4>
                        <p className="text-xs text-[#71717A]">Feature requests from customers</p>
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-[#FAFAFA]">
                                <th className="px-4 py-3 text-left text-xs font-bold text-[#71717A] uppercase">Feature</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-[#71717A] uppercase">Votes</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-[#71717A] uppercase">Priority</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-[#71717A] uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E4E4E7]">
                            {featureRequests.map((fr, idx) => (
                                <tr key={idx}>
                                    <td className="px-4 py-3 font-medium text-[#18181B]">{fr.feature}</td>
                                    <td className="px-4 py-3 text-center"><span className="px-2 py-1 bg-purple-100 text-purple-700 rounded font-bold">{fr.votes}</span></td>
                                    <td className="px-4 py-3 text-center"><span className={`px-2 py-1 rounded text-xs font-bold ${fr.priority === 'Critical' ? 'bg-red-100 text-red-700' : fr.priority === 'High' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>{fr.priority}</span></td>
                                    <td className="px-4 py-3 text-center"><span className={`px-2 py-1 rounded text-xs ${fr.status === 'In Progress' ? 'bg-green-100 text-green-700' : 'bg-[#F4F4F5] text-[#71717A]'}`}>{fr.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// ==================== MAIN COMPONENT ====================
export const CustomerInsightsPanel: React.FC<CustomerInsightsPanelProps> = ({
    companyName = '',
    industry = '',
    products = '',
    targetMarket = 'Vietnam',
    onDataLoad
}) => {
    const [activeSection, setActiveSection] = useState('overview');
    const [report, setReport] = useState<CustomerInsightsReport | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [inputCompany, setInputCompany] = useState(companyName);
    const isMountedRef = useRef(false);
    
    const fetchCustomerInsights = useCallback(async (company: string, forceRefresh = false) => {
        if (!company.trim()) return;
        if (isMountedRef.current && !forceRefresh && report) return;
        
        setIsLoading(true);
        setError(null);
        
        try {
            const response = await fetch('/api/customer-insights', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ companyName: company, industry, products, targetMarket })
            });
            
            if (!response.ok) throw new Error(`API Error: ${response.status}`);
            
            const data = await response.json();
            setReport(data);
            isMountedRef.current = true;
            onDataLoad?.(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load');
        } finally {
            setIsLoading(false);
        }
    }, [industry, products, targetMarket, onDataLoad, report]);
    
    const handleGenerate = () => {
        if (inputCompany.trim()) {
            isMountedRef.current = false;
            fetchCustomerInsights(inputCompany, true);
        }
    };
    
    const sections = [
        { id: 'overview', label: 'Executive Summary' },
        { id: 'icp', label: '1. Customer Profile' },
        { id: 'personas', label: '2. User Personas' },
        { id: 'pain', label: '3. Pain Points & Motivations' },
        { id: 'journey', label: '4. Buying Journey' },
        { id: 'voc', label: '5. Voice of Customer' }
    ];
    
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white border border-[#E4E4E7] rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <Heart className="text-white" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-[#18181B]">Customer Insights</h2>
                        <p className="text-sm text-[#71717A]">Customer Understanding - Behavioral Psychology</p>
                    </div>
                </div>
                
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={inputCompany}
                        onChange={(e) => setInputCompany(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
                        placeholder="Enter company name to analyze customers..."
                        className="flex-1 px-4 py-3 border border-[#E4E4E7] rounded-xl bg-white text-[#18181B]"
                    />
                    <button onClick={handleGenerate} disabled={isLoading || !inputCompany.trim()} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium disabled:opacity-50 flex items-center gap-2">
                        {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                        {isLoading ? 'Analyzing...' : 'Generate'}
                    </button>
                </div>
            </div>
            
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                    <AlertTriangle className="mx-auto text-red-500 mb-3" size={32} />
                    <p className="text-red-600">{error}</p>
                    <button onClick={handleGenerate} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl">Retry</button>
                </div>
            )}
            
            {isLoading && <LoadingSkeleton />}
            
            {!isLoading && !error && report && (
                <>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {sections.map(s => (
                            <button key={s.id} onClick={() => setActiveSection(s.id)} className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap ${activeSection === s.id ? 'bg-blue-600 text-white' : 'bg-[#F4F4F5] text-[#71717A]'}`}>
                                {s.label}
                            </button>
                        ))}
                    </div>
                    
                    {activeSection === 'overview' && (
                        <div className="bg-white border border-[#E4E4E7] rounded-2xl p-6">
                            <h3 className="font-bold text-lg text-[#18181B] mb-4">Executive Summary</h3>
                            <p className="text-[#71717A] mb-6">{report.executiveSummary.overview}</p>
                            <div className="grid lg:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-bold text-[#18181B] mb-3">Key Insights</h4>
                                    <ul className="space-y-2">
                                        {report.executiveSummary.keyInsights.map((i, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-sm text-[#71717A]">
                                                <CheckCircle size={14} className="text-blue-500 mt-0.5" />{i}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-bold text-[#18181B] mb-3">Recommendations</h4>
                                    <ul className="space-y-2">
                                        {report.executiveSummary.recommendations.map((r, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-sm text-[#71717A]">
                                                <Zap size={14} className="text-green-500 mt-0.5" />{r}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {activeSection === 'icp' && <ICPSection icp={report.idealCustomerProfile} />}
                    {activeSection === 'personas' && report.userPersonas.map((p, idx) => <PersonaCard key={idx} persona={p} />)}
                    {activeSection === 'pain' && <PainPointsSection painPoints={report.painPoints} desiredOutcomes={report.desiredOutcomes} triggerEvents={report.triggerEvents} />}
                    {activeSection === 'journey' && <BuyingJourneySection buyingProcess={report.buyingProcess} purchaseBarriers={report.purchaseBarriers} buyingCommittee={report.buyingCommittee} />}
                    {activeSection === 'voc' && <VoiceOfCustomerSection commonObjections={report.commonObjections} sentimentAnalysis={report.sentimentAnalysis} featureRequests={report.featureRequests} npsScore={report.npsScore} />}
                </>
            )}
            
            {!isLoading && !error && !report && (
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-200 p-8 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-[#FFF1F2] flex items-center justify-center mb-4"><span className="text-2xl font-black text-[#E11D48]">ICP</span></div>
                    <h3 className="text-lg font-bold text-[#18181B] mb-2">Customer Insights Engine</h3>
                    <p className="text-[#71717A] mb-4">Enter a company name to generate 4-layer customer analysis</p>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 max-w-2xl mx-auto text-sm">
                        <div className="p-3 bg-white rounded-xl"><User className="mx-auto text-blue-600 mb-1" size={20} /><p>ICP & Personas</p></div>
                        <div className="p-3 bg-white rounded-xl"><AlertTriangle className="mx-auto text-red-600 mb-1" size={20} /><p>Pain Points</p></div>
                        <div className="p-3 bg-white rounded-xl"><ArrowRight className="mx-auto text-amber-600 mb-1" size={20} /><p>Buying Journey</p></div>
                        <div className="p-3 bg-white rounded-xl"><MessageSquare className="mx-auto text-purple-600 mb-1" size={20} /><p>Voice of Customer</p></div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerInsightsPanel;
