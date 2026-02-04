/**
 * 🎯 GlobalCopilot-Style Competitor Comparison Dashboard
 * Hiển thị:
 * - Danh sách đối thủ với tin tức
 * - So sánh chiến lược
 * - Phân tích thị trường
 * - Khuyến nghị
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
                <Loader2 className="animate-spin text-[#B91C1C]" size={32} />
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                    Analyzing {companyName} against competitors...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
                <div className="flex items-center gap-3 text-amber-600 dark:text-amber-500">
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
            <div className="bg-gradient-to-r from-[#B91C1C] to-red-700 text-white rounded-2xl p-8">
                <h1 className="text-3xl font-black uppercase mb-2">Competitor Intelligence Report</h1>
                <p className="text-sm opacity-90">Comprehensive market analysis for {companyName}</p>
            </div>

            {/* 🔀 Tabs */}
            <div className="flex gap-4 border-b dark:border-gray-800">
                {(['overview', 'intelligence', 'comparison'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-3 font-bold uppercase text-[11px] tracking-widest transition-all border-b-2 ${
                            activeTab === tab
                                ? 'border-[#B91C1C] text-[#B91C1C]'
                                : 'border-transparent text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        {tab === 'overview' && '📈 Overview'}
                        {tab === 'intelligence' && '🔍 Intelligence'}
                        {tab === 'comparison' && '⚔️ Comparison'}
                    </button>
                ))}
            </div>

            {/* 📈 Overview Tab - Overall Analysis & Insights */}
            {activeTab === 'overview' && (
                <div className="space-y-8 animate-fade-in">
                    {/* Overall Analysis */}
                    <div className="bg-white dark:bg-[#0F1623] border border-gray-100 dark:border-gray-800 rounded-2xl p-8">
                        <h2 className="text-xl font-black uppercase mb-6 flex items-center gap-3">
                            <Brain size={20} className="text-[#B91C1C]" />
                            Market Analysis
                        </h2>
                        <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
                            {comparison.overallAnalysis}
                        </p>
                    </div>

                    {/* Strategic Insights */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-[#0F1623] border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
                            <h3 className="text-sm font-black uppercase mb-6 flex items-center gap-2 text-[#B91C1C]">
                                <Zap size={16} /> Strategic Insights
                            </h3>
                            <ul className="space-y-3">
                                {comparison.strategicInsights.map((insight, i) => (
                                    <li key={i} className="flex gap-3">
                                        <ChevronRight size={16} className="text-[#B91C1C] flex-shrink-0 mt-0.5" />
                                        <span className="text-xs leading-relaxed text-gray-700 dark:text-gray-300">
                                            {insight}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Opportunities */}
                        <div className="bg-white dark:bg-[#0F1623] border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
                            <h3 className="text-sm font-black uppercase mb-6 flex items-center gap-2 text-green-600">
                                <Lightbulb size={16} /> Growth Opportunities
                            </h3>
                            <ul className="space-y-3">
                                {comparison.opportunities.map((opp, i) => (
                                    <li key={i} className="flex gap-3">
                                        <ChevronRight size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                                        <span className="text-xs leading-relaxed text-gray-700 dark:text-gray-300">
                                            {opp}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Threats & Recommendations */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-[#0F1623] border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
                            <h3 className="text-sm font-black uppercase mb-6 flex items-center gap-2 text-orange-600">
                                <AlertTriangle size={16} /> Competitive Threats
                            </h3>
                            <ul className="space-y-3">
                                {comparison.threats.map((threat, i) => (
                                    <li key={i} className="flex gap-3">
                                        <ChevronRight size={16} className="text-orange-600 flex-shrink-0 mt-0.5" />
                                        <span className="text-xs leading-relaxed text-gray-700 dark:text-gray-300">
                                            {threat}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Recommendations */}
                        <div className="bg-white dark:bg-[#0F1623] border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
                            <h3 className="text-sm font-black uppercase mb-6 flex items-center gap-2 text-blue-600">
                                <Target size={16} /> Recommended Actions
                            </h3>
                            <ul className="space-y-3">
                                {comparison.recommendations.map((rec, i) => (
                                    <li key={i} className="flex gap-3">
                                        <ChevronRight size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                                        <span className="text-xs leading-relaxed text-gray-700 dark:text-gray-300">
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
        <div className="bg-white dark:bg-[#0F1623] border border-gray-100 dark:border-gray-800 rounded-2xl p-8 hover:border-[#B91C1C] transition-all">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-[#B91C1C] to-red-700 rounded-lg flex items-center justify-center text-white font-black text-sm">
                    {competitor.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-black uppercase dark:text-white">{competitor.name}</h3>
                    <p className="text-xs text-gray-500 uppercase tracking-widest">
                        {competitor.industry} • {competitor.location || 'Vietnam'}
                    </p>
                </div>
            </div>

            {/* News Summary */}
            <div className="bg-gray-50 dark:bg-gray-800/30 rounded-lg p-4 mb-6">
                <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-3 flex items-center gap-2">
                    <Newspaper size={12} /> Latest News Summary
                </h4>
                <p className="text-xs leading-relaxed text-gray-700 dark:text-gray-300">
                    {newsSummary}
                </p>
            </div>

            {/* Market Position */}
            {marketPosition && (
                <div className="grid grid-cols-3 gap-4 mb-6">
                    {marketPosition.marketShare && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                            <div className="text-xs font-black text-blue-600 uppercase">Market Share</div>
                            <div className="text-lg font-black text-blue-700">{marketPosition.marketShare.toFixed(1)}%</div>
                        </div>
                    )}
                    {marketPosition.growthRate && (
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                            <div className="text-xs font-black text-green-600 uppercase">Growth Rate</div>
                            <div className="text-lg font-black text-green-700">{marketPosition.growthRate.toFixed(1)}%</div>
                        </div>
                    )}
                    {marketPosition.visibility && (
                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                            <div className="text-xs font-black text-purple-600 uppercase">Visibility</div>
                            <div className="text-lg font-black text-purple-700">{marketPosition.visibility.toFixed(0)}%</div>
                        </div>
                    )}
                </div>
            )}

            {/* Recent News */}
            {news.length > 0 && (
                <div className="space-y-3">
                    <h4 className="text-xs font-black uppercase text-gray-400 tracking-widest">Recent News Articles</h4>
                    {news.slice(0, 3).map((item, i) => (
                        <a
                            key={i}
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/60 transition-all group"
                        >
                            <Calendar size={12} className="text-gray-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-gray-700 dark:text-gray-300 group-hover:text-[#B91C1C] transition-colors line-clamp-2">
                                    {item.title}
                                </p>
                                <p className="text-[10px] text-gray-500 mt-1">
                                    {new Date(item.pubDate).toLocaleDateString('vi-VN')}
                                </p>
                            </div>
                            <ExternalLink size={12} className="text-gray-400 flex-shrink-0 mt-0.5 group-hover:text-[#B91C1C]" />
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
        <div className="bg-white dark:bg-[#0F1623] border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800/50">
                            <th className="px-6 py-4 text-left text-xs font-black uppercase text-gray-500">Company</th>
                            {metrics.map(m => (
                                <th key={m.key} className="px-6 py-4 text-left text-xs font-black uppercase text-gray-500 whitespace-nowrap">
                                    {m.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-gray-800">
                        {competitors.map((comp, idx) => (
                            <tr key={idx} className={`hover:bg-gray-50 dark:hover:bg-gray-800/20 ${idx === 0 ? 'bg-red-50/20 dark:bg-red-900/5' : ''}`}>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded text-xs font-black flex items-center justify-center">
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
                                                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 max-w-[100px]">
                                                    <div
                                                        className="bg-[#B91C1C] h-full rounded-full transition-all"
                                                        style={{ width: `${Math.min((value as number) || 0, 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 w-12 text-right">
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
