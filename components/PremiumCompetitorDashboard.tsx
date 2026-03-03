/**
 * 🏆 Premium Competitor Intelligence Dashboard
 * Inspired by GlobalCopilot design patterns
 * Real data powered by VICO backend
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart3, TrendingUp, TrendingDown, Plus, X,
    Zap, Target, Shield, Brain, Award, AlertCircle,
    ChevronDown, Filter, Download, Share2
} from 'lucide-react';
import { generateCompetitorComparison, CompetitorComparison, CompetitorIntelligence } from '../services/competitorIntelligence';

interface CompetitorDashboardProps {
    companyName: string;
}

export const PremiumCompetitorDashboard = ({ companyName }: CompetitorDashboardProps) => {
    const [comparison, setComparison] = useState<CompetitorComparison | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'analysis'>('overview');
    const [expandedCompetitor, setExpandedCompetitor] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const data = await generateCompetitorComparison(companyName);
                setComparison(data);
            } catch (err) {
                console.error('Error loading competitor data:', err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [companyName]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full"
                />
            </div>
        );
    }

    if (!comparison) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-6">
            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-4xl font-black text-[#18181B] mb-2">
                            Competitive Analysis
                        </h1>
                        <p className="text-[#71717A]">
                            Market intelligence for <span className="font-bold text-blue-600">{companyName}</span>
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2 bg-white border border-[#E4E4E7] rounded-lg hover:border-[#E4E4E7] transition-colors flex items-center gap-2 text-sm font-medium"
                        >
                            <Download size={16} /> Export
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium"
                        >
                            <Share2 size={16} /> Share
                        </motion.button>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-1 bg-white rounded-lg border border-[#E4E4E7] p-1 w-fit">
                    {[
                        { id: 'overview', label: 'Market Overview' },
                        { id: 'metrics', label: 'Competitor Metrics' },
                        { id: 'analysis', label: 'Detailed Analysis' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-6 py-2 rounded transition-all font-medium text-sm ${
                                activeTab === tab.id
                                    ? 'bg-blue-600 text-white'
                                    : 'text-[#71717A] hover:text-[#18181B]'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Content Sections */}
            <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                    <motion.div key="overview">
                        <OverviewSection comparison={comparison} />
                    </motion.div>
                )}
                {activeTab === 'metrics' && (
                    <motion.div key="metrics">
                        <MetricsSection comparison={comparison} />
                    </motion.div>
                )}
                {activeTab === 'analysis' && (
                    <motion.div key="analysis">
                        <AnalysisSection comparison={comparison} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────
// OVERVIEW SECTION
// ─────────────────────────────────────────────────────────────
const OverviewSection = ({ comparison }: { comparison: CompetitorComparison }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
        >
            {/* Market Analysis Card */}
            <div className="bg-white rounded-2xl border border-[#E4E4E7] p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Brain size={24} className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-[#18181B] mb-2">Market Landscape</h2>
                        <p className="text-[#71717A] text-sm">AI-powered competitive intelligence</p>
                    </div>
                </div>
                <p className="text-[#18181B] leading-relaxed">
                    {comparison.overallAnalysis}
                </p>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KPICard
                    icon={Zap}
                    title="Key Insights"
                    items={comparison.strategicInsights.slice(0, 3)}
                    color="blue"
                />
                <KPICard
                    icon={Target}
                    title="Growth Opportunities"
                    items={comparison.opportunities}
                    color="green"
                />
                <KPICard
                    icon={AlertCircle}
                    title="Market Threats"
                    items={comparison.threats}
                    color="orange"
                />
            </div>

            {/* Competitor Overview Cards */}
            <div>
                <h2 className="text-2xl font-bold text-[#18181B] mb-4">Competitor Profiles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {comparison.competitors.slice(0, 6).map((comp, idx) => (
                        <div key={`${comp.competitor.name}-${idx}`}>
                            <CompetitorCard competitor={comp} />
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

// KPI Card Component
const KPICard = ({ icon: Icon, title, items, color }: { icon: any; title: string; items: string[]; color: string }) => {
    const colors: any = {
        blue: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-600', text: 'text-blue-700' },
        green: { bg: 'bg-green-50', border: 'border-green-200', icon: 'text-green-600', text: 'text-green-700' },
        orange: { bg: 'bg-orange-50', border: 'border-orange-200', icon: 'text-orange-600', text: 'text-orange-700' },
    };
    const c = colors[color] || colors.blue;

    return (
        <motion.div
            whileHover={{ translateY: -4 }}
            className={`${c.bg} border ${c.border} rounded-2xl p-6`}
        >
            <div className="flex items-center gap-3 mb-4">
                <Icon size={20} className={c.icon} />
                <h3 className="font-bold text-[#18181B]">{title}</h3>
            </div>
            <ul className="space-y-2">
                {items.map((item, i) => (
                    <li key={i} className={`${c.text} text-sm leading-relaxed flex items-start gap-2`}>
                        <span className="mt-1">•</span>
                        <span>{item}</span>
                    </li>
                ))}
            </ul>
        </motion.div>
    );
};

// Competitor Card Component
interface CompetitorCardDashboardProps {
    competitor: CompetitorIntelligence;
}

function CompetitorCard({ competitor }: CompetitorCardDashboardProps) {
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const initials = getInitials(competitor.competitor.name);
    const bgColors = ['bg-blue-600', 'bg-purple-600', 'bg-pink-600', 'bg-orange-600', 'bg-green-600', 'bg-red-600'];
    const bgColor = bgColors[Math.abs(competitor.competitor.name.charCodeAt(0)) % bgColors.length];

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-2xl border border-[#E4E4E7] p-6 shadow-sm hover:shadow-md transition-all"
        >
            <div className="flex items-start gap-4 mb-4">
                <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center text-white font-bold text-lg`}>
                    {initials}
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-[#18181B]">{competitor.competitor.name}</h3>
                    <p className="text-xs text-[#71717A] uppercase tracking-wide">{competitor.competitor.industry}</p>
                </div>
            </div>

            <div className="space-y-3 mb-4">
                <div>
                    <p className="text-xs font-bold text-[#71717A] uppercase tracking-wide mb-1">Market Position</p>
                    <div className="flex gap-3">
                        {competitor.marketPosition.marketShare && (
                            <div className="flex-1 bg-[#F4F4F5] rounded-lg p-2">
                                <p className="text-xs text-[#71717A]">Market Share</p>
                                <p className="text-lg font-bold text-[#18181B]">{competitor.marketPosition.marketShare.toFixed(1)}%</p>
                            </div>
                        )}
                        {competitor.marketPosition.growthRate && (
                            <div className="flex-1 bg-green-50 rounded-lg p-2">
                                <p className="text-xs text-[#71717A]">Growth</p>
                                <p className="text-lg font-bold text-green-600">+{competitor.marketPosition.growthRate.toFixed(1)}%</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {competitor.news && competitor.news.length > 0 && (
                <div>
                    <p className="text-xs font-bold text-[#71717A] uppercase tracking-wide mb-2">Latest News</p>
                    <p className="text-xs text-[#71717A] line-clamp-2">{competitor.news[0]?.title}</p>
                </div>
            )}
        </motion.div>
    );
};

// ─────────────────────────────────────────────────────────────
// METRICS SECTION - Comparison Table
// ─────────────────────────────────────────────────────────────
const MetricsSection = ({ comparison }: { comparison: CompetitorComparison }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
        >
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[#18181B]">Competitor Comparison Matrix</h2>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="px-4 py-2 bg-white border border-[#E4E4E7] rounded-lg hover:border-[#E4E4E7] flex items-center gap-2 text-sm font-medium"
                >
                    <Filter size={16} /> Filter
                </motion.button>
            </div>

            <div className="bg-white rounded-2xl border border-[#E4E4E7] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-[#FAFAFA] border-b border-[#E4E4E7]">
                                <th className="px-6 py-4 text-left text-xs font-bold text-[#71717A] uppercase tracking-wider">Competitor</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-[#71717A] uppercase tracking-wider">Market Share</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-[#71717A] uppercase tracking-wider">Growth Rate</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-[#71717A] uppercase tracking-wider">Visibility</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-[#71717A] uppercase tracking-wider">Trend</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E4E4E7]">
                            {comparison.competitors.map((comp, idx) => (
                                <motion.tr
                                    key={`table-${idx}`}
                                    whileHover={{ backgroundColor: '#F9FAFB' }}
                                    className="transition-colors"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                                {comp.competitor.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-[#18181B]">{comp.competitor.name}</p>
                                                <p className="text-xs text-[#71717A]">{comp.competitor.industry}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col items-center">
                                            <span className="font-bold text-[#18181B]">
                                                {(comp.marketPosition.marketShare as number)?.toFixed(1) || 0}%
                                            </span>
                                            <div className="w-16 h-2 bg-[#E4E4E7] rounded-full mt-2">
                                                <div
                                                    className="h-full bg-blue-600 rounded-full transition-all"
                                                    style={{ width: `${Math.min(100, (comp.marketPosition.marketShare as number) || 0)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <span className="font-bold text-green-600">
                                                +{(comp.marketPosition.growthRate as number)?.toFixed(1) || 0}%
                                            </span>
                                            <TrendingUp size={16} className="text-green-600" />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-center">
                                            <span className="font-bold text-[#18181B]">
                                                {(comp.marketPosition.visibility as number)?.toFixed(0) || 0}%
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center">
                                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                                                ↗ Positive
                                            </span>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Metric Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InsightCard
                    title="Top Performer"
                    value={comparison.competitors[0]?.competitor.name || 'N/A'}
                    metric="Highest Market Share"
                    icon={Award}
                    color="gold"
                />
                <InsightCard
                    title="Growth Leader"
                    value={`+${(comparison.competitors[1]?.marketPosition.growthRate as number)?.toFixed(1) || 0}%`}
                    metric="Fastest Growing"
                    icon={TrendingUp}
                    color="green"
                />
            </div>
        </motion.div>
    );
};

// Insight Card Component
const InsightCard = ({ title, value, metric, icon: Icon, color }: { title: string; value: string; metric: string; icon: any; color: string }) => {
    const colors: any = {
        gold: { bg: 'bg-yellow-50', border: 'border-yellow-200', icon: 'text-yellow-600' },
        green: { bg: 'bg-green-50', border: 'border-green-200', icon: 'text-green-600' },
    };
    const c = colors[color] || colors.gold;

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className={`${c.bg} border ${c.border} rounded-2xl p-6`}
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-semibold text-[#71717A] uppercase tracking-wide mb-2">{title}</p>
                    <p className="text-3xl font-black text-[#18181B] mb-2">{value}</p>
                    <p className="text-xs text-[#71717A]">{metric}</p>
                </div>
                <Icon size={32} className={c.icon} opacity={0.5} />
            </div>
        </motion.div>
    );
};

// ─────────────────────────────────────────────────────────────
// ANALYSIS SECTION - Detailed Insights
// ─────────────────────────────────────────────────────────────
const AnalysisSection = ({ comparison }: { comparison: CompetitorComparison }) => {
    const [expanded, setExpanded] = useState<string | null>('strengths');

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
        >
            <h2 className="text-2xl font-bold text-[#18181B]">Strategic Insights & Recommendations</h2>

            {[
                {
                    id: 'insights',
                    title: '💡 Strategic Insights',
                    icon: Brain,
                    items: comparison.strategicInsights,
                    color: 'blue'
                },
                {
                    id: 'opportunities',
                    title: '🎯 Growth Opportunities',
                    icon: Target,
                    items: comparison.opportunities,
                    color: 'green'
                },
                {
                    id: 'threats',
                    title: '⚠️ Competitive Threats',
                    icon: AlertCircle,
                    items: comparison.threats,
                    color: 'orange'
                },
                {
                    id: 'recommendations',
                    title: '✅ Recommended Actions',
                    icon: Shield,
                    items: comparison.recommendations,
                    color: 'purple'
                }
            ].map(section => (
                <div key={section.id}>
                    <AnalysisCard
                        section={section}
                        isExpanded={expanded === section.id}
                        onToggle={() => setExpanded(expanded === section.id ? null : section.id)}
                    />
                </div>
            ))}
        </motion.div>
    );
};

interface AnalysisSectionType {
    id: string;
    title: string;
    icon: any;
    items: string[];
    color: string;
}

interface AnalysisCardProps {
    section: AnalysisSectionType;
    isExpanded: boolean;
    onToggle: () => void;
}

function AnalysisCard({ section, isExpanded, onToggle }: AnalysisCardProps) {
    const colors: Record<string, { bg: string; border: string; text: string; header: string }> = {
        blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', header: 'bg-blue-100' },
        green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', header: 'bg-green-100' },
        orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', header: 'bg-orange-100' },
        purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', header: 'bg-purple-100' },
    };
    const c = colors[section.color] || colors.blue;
    const Icon = section.icon;

    return (
        <motion.div
            className={`${c.bg} border ${c.border} rounded-2xl overflow-hidden`}
        >
            <motion.button
                onClick={onToggle}
                className={`w-full ${c.header} px-6 py-4 flex items-center justify-between transition-colors hover:opacity-80`}
            >
                <div className="flex items-center gap-3">
                    <Icon size={20} className={c.text} />
                    <h3 className="font-bold text-[#18181B]">{section.title}</h3>
                </div>
                <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronDown size={20} className={c.text} />
                </motion.div>
            </motion.button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-6 py-4 border-t border-[#E4E4E7]"
                    >
                        <ul className="space-y-3">
                            {section.items.map((item: string, i: number) => (
                                <motion.li
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="flex items-start gap-3"
                                >
                                    <span className={`mt-1.5 w-2 h-2 ${c.text.replace('text-', 'bg-')} rounded-full flex-shrink-0`} />
                                    <span className={`${c.text} text-sm leading-relaxed`}>{item}</span>
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
