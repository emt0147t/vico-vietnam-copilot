/**
 * 🎯 GlobalCopilot-Style Competitor Comparison Dashboard
 * Displays:
 * - List of competitors with news
 * - Strategy comparison
 * - Market analysis
 * - Recommendations
 */

import { useState, useEffect } from 'react';
import {
    Loader2, AlertTriangle, Target, TrendingUp, Zap,
    Newspaper, BarChart3, Brain, Lightbulb, Shield,
    ChevronRight, ExternalLink, Calendar
} from 'lucide-react';
import {
    generateCompetitorComparison,
    CompetitorComparison,
    CompetitorIntelligence,
} from '../services/competitorIntelligence';
import { NewsFeed } from './CompletionPage';

interface CompetitorComparisonProps {
    companyName: string;
}

export const CompetitorComparisonDashboard = ({ companyName }: CompetitorComparisonProps) => {
    const [comparison, setComparison] = useState<CompetitorComparison | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'intelligence' | 'comparison'>('overview');

    useEffect(() => {
        const fetchComparison = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const finalCompanyName = companyName || 'Vingroup';
                console.log(`📊 Loading competitor comparison for: "${finalCompanyName}"`);
                console.log(`🔧 Props received: companyName="${companyName}"`);
                
                if (!finalCompanyName || finalCompanyName.trim() === '') {
                    throw new Error('Company name is required');
                }
                
                const data = await generateCompetitorComparison(finalCompanyName);
                setComparison(data);
            } catch (err) {
                console.error('❌ Error loading competitor comparison:', err);
                setError(`Unable to load competitor comparison: ${err instanceof Error ? err.message : 'unknown error'}`);
            } finally {
                setLoading(false);
            }
        };

        fetchComparison();
    }, [companyName]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 gap-4">
                <Loader2 className="animate-spin text-[#E11D48]" size={32} />
                <p className="text-sm font-bold text-[#A1A1AA] uppercase tracking-widest">
                    Analyzing {companyName} against competitors...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                <div className="flex items-center gap-3 text-amber-600">
                    <AlertTriangle size={20} />
                    <p className="font-bold">{error}</p>
                </div>
            </div>
        );
    }

    if (!comparison) return null;

    return (
        <div className="space-y-8">
            {/* 📊 Header */}
            <div className="bg-gradient-to-r from-[#E11D48] to-red-700 text-white rounded-2xl p-8">
                <h1 className="text-3xl font-black uppercase mb-2">Competitor Intelligence Report</h1>
                <p className="text-sm opacity-90">Comprehensive market analysis for {companyName}</p>
            </div>

            {/* 🔀 Tabs */}
            <div className="flex gap-4 border-b">
                {(['overview', 'intelligence', 'comparison'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-3 font-bold uppercase text-[11px] tracking-widest transition-all border-b-2 ${
                            activeTab === tab
                                ? 'border-[#E11D48] text-[#E11D48]'
                                : 'border-transparent text-[#A1A1AA] hover:text-[#71717A]'
                        }`}
                    >
                        {tab === 'overview' && 'Overview'}
                        {tab === 'intelligence' && 'Intelligence'}
                        {tab === 'comparison' && 'Comparison'}
                    </button>
                ))}
            </div>

            {/* 📈 Overview Tab - Overall Analysis & Insights */}
            {activeTab === 'overview' && (
                <div className="space-y-8 animate-fade-in">
                    {/* Overall Analysis */}
                    <div className="bg-white border border-[#E4E4E7] rounded-2xl p-8">
                        <h2 className="text-xl font-black uppercase mb-6 flex items-center gap-3">
                            <Brain size={20} className="text-[#E11D48]" />
                            Market Analysis
                        </h2>
                        <p className="text-sm leading-relaxed text-[#18181B] mb-6">
                            {comparison.overallAnalysis}
                        </p>
                    </div>

                    {/* Strategic Insights */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white border border-[#E4E4E7] rounded-2xl p-6">
                            <h3 className="text-sm font-black uppercase mb-6 flex items-center gap-2 text-[#E11D48]">
                                <Zap size={16} /> Strategic Insights
                            </h3>
                            <ul className="space-y-3">
                                {comparison.strategicInsights.map((insight, i) => (
                                    <li key={i} className="flex gap-3">
                                        <ChevronRight size={16} className="text-[#E11D48] flex-shrink-0 mt-0.5" />
                                        <span className="text-xs leading-relaxed text-[#18181B]">
                                            {insight}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Opportunities */}
                        <div className="bg-white border border-[#E4E4E7] rounded-2xl p-6">
                            <h3 className="text-sm font-black uppercase mb-6 flex items-center gap-2 text-green-600">
                                <Lightbulb size={16} /> Growth Opportunities
                            </h3>
                            <ul className="space-y-3">
                                {comparison.opportunities.map((opp, i) => (
                                    <li key={i} className="flex gap-3">
                                        <ChevronRight size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                                        <span className="text-xs leading-relaxed text-[#18181B]">
                                            {opp}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Threats & Recommendations */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white border border-[#E4E4E7] rounded-2xl p-6">
                            <h3 className="text-sm font-black uppercase mb-6 flex items-center gap-2 text-orange-600">
                                <AlertTriangle size={16} /> Competitive Threats
                            </h3>
                            <ul className="space-y-3">
                                {comparison.threats.map((threat, i) => (
                                    <li key={i} className="flex gap-3">
                                        <ChevronRight size={16} className="text-orange-600 flex-shrink-0 mt-0.5" />
                                        <span className="text-xs leading-relaxed text-[#18181B]">
                                            {threat}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Recommendations */}
                        <div className="bg-white border border-[#E4E4E7] rounded-2xl p-6">
                            <h3 className="text-sm font-black uppercase mb-6 flex items-center gap-2 text-blue-600">
                                <Target size={16} /> Recommended Actions
                            </h3>
                            <ul className="space-y-3">
                                {comparison.recommendations.map((rec, i) => (
                                    <li key={i} className="flex gap-3">
                                        <ChevronRight size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                                        <span className="text-xs leading-relaxed text-[#18181B]">
                                            {rec}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* 🔍 Intelligence Tab - Per Competitor Details */}
            {activeTab === 'intelligence' && (
                <div className="space-y-8 animate-fade-in">
                    {comparison.competitors.map((comp: CompetitorIntelligence, idx: number) => (
                        <div key={`comp-${idx}-${comp.competitor.name}`}>
                            <CompetitorCard intelligence={comp} />
                        </div>
                    ))}
                </div>
            )}

            {/* ⚔️ Comparison Tab - Side-by-Side Matrix */}
            {activeTab === 'comparison' && (
                <div className="space-y-8 animate-fade-in">
                    <ComparisonMatrix competitors={comparison.competitors} primaryCompany={companyName} />
                </div>
            )}
        </div>
    );
};

// 🏢 Individual Competitor Card with News
interface CompetitorCardProps {
    intelligence: CompetitorIntelligence;
}

function CompetitorCard({ intelligence }: CompetitorCardProps) {
    const { competitor, news, newsSummary, marketPosition } = intelligence;

    return (
        <div className="bg-white border border-[#E4E4E7] rounded-2xl p-8 hover:border-[#E11D48] transition-all">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-[#E11D48] to-red-700 rounded-lg flex items-center justify-center text-white font-black text-sm">
                    {competitor.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-black uppercase">{competitor.name}</h3>
                    <p className="text-xs text-[#71717A] uppercase tracking-widest">
                        {competitor.industry} • {competitor.location || 'Vietnam'}
                    </p>
                </div>
            </div>

            {/* News Summary */}
            <div className="bg-[#FAFAFA] rounded-lg p-4 mb-6">
                <h4 className="text-[10px] font-black uppercase text-[#A1A1AA] tracking-widest mb-3 flex items-center gap-2">
                    <Newspaper size={12} /> Latest News Summary
                </h4>
                <p className="text-xs leading-relaxed text-[#18181B]">
                    {newsSummary}
                </p>
            </div>

            {/* Market Position */}
            {marketPosition && (
                <div className="grid grid-cols-3 gap-4 mb-6">
                    {marketPosition.marketShare && (
                        <div className="bg-blue-50 rounded-lg p-3">
                            <div className="text-xs font-black text-blue-600 uppercase">Market Share</div>
                            <div className="text-lg font-black text-blue-700">{marketPosition.marketShare.toFixed(1)}%</div>
                        </div>
                    )}
                    {marketPosition.growthRate && (
                        <div className="bg-green-50 rounded-lg p-3">
                            <div className="text-xs font-black text-green-600 uppercase">Growth Rate</div>
                            <div className="text-lg font-black text-green-700">{marketPosition.growthRate.toFixed(1)}%</div>
                        </div>
                    )}
                    {marketPosition.visibility && (
                        <div className="bg-purple-50 rounded-lg p-3">
                            <div className="text-xs font-black text-purple-600 uppercase">Visibility</div>
                            <div className="text-lg font-black text-purple-700">{marketPosition.visibility.toFixed(0)}%</div>
                        </div>
                    )}
                </div>
            )}

            {/* Recent News */}
            {news.length > 0 && (
                <div className="space-y-3">
                    <h4 className="text-xs font-black uppercase text-[#A1A1AA] tracking-widest">Recent News Articles</h4>
                    {news.slice(0, 3).map((item, i) => (
                        <a
                            key={i}
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex gap-3 p-3 bg-[#FAFAFA] rounded-lg hover:bg-[#F4F4F5] transition-all group"
                        >
                            <Calendar size={12} className="text-[#A1A1AA] flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-[#18181B] group-hover:text-[#E11D48] transition-colors line-clamp-2">
                                    {item.title}
                                </p>
                                <p className="text-[10px] text-[#71717A] mt-1">
                                    {new Date(item.pubDate).toLocaleDateString('en-US')}
                                </p>
                            </div>
                            <ExternalLink size={12} className="text-[#A1A1AA] flex-shrink-0 mt-0.5 group-hover:text-[#E11D48]" />
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
};

// ⚔️ Comparison Matrix
const ComparisonMatrix = ({ competitors, primaryCompany }: { competitors: CompetitorIntelligence[], primaryCompany: string }) => {
    const metrics = [
        { key: 'marketShare', label: 'Market Share', unit: '%' },
        { key: 'growthRate', label: 'Growth Rate', unit: '%' },
        { key: 'visibility', label: 'Market Visibility', unit: '%' },
    ];

    return (
        <div className="bg-white border border-[#E4E4E7] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-[#FAFAFA]">
                            <th className="px-6 py-4 text-left text-xs font-black uppercase text-[#71717A]">Company</th>
                            {metrics.map(m => (
                                <th key={m.key} className="px-6 py-4 text-left text-xs font-black uppercase text-[#71717A] whitespace-nowrap">
                                    {m.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {competitors.map((comp, idx) => (
                            <tr key={idx} className={`hover:bg-[#FAFAFA] ${idx === 0 ? 'bg-red-50/20' : ''}`}>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-[#F4F4F5] rounded text-xs font-black flex items-center justify-center">
                                            {comp.competitor.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <span className="font-bold text-sm uppercase">{comp.competitor.name}</span>
                                    </div>
                                </td>
                                {metrics.map(m => {
                                    const value = comp.marketPosition[m.key as keyof typeof comp.marketPosition];
                                    return (
                                        <td key={m.key} className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 bg-[#E4E4E7] rounded-full h-2 max-w-[100px]">
                                                    <div
                                                        className="bg-[#E11D48] h-full rounded-full transition-all"
                                                        style={{ width: `${Math.min((value as number) || 0, 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-bold text-[#18181B] w-12 text-right">
                                                    {(value as number)?.toFixed(1) || 0}{m.unit}
                                                </span>
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
