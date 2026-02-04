/**
 * 📰 Company Intelligence & News Center
 * Bloomberg Terminal meets Modern SaaS
 * Immersive dashboard for comprehensive company intelligence
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingUp, TrendingDown, Zap, Filter, Search, X,
    Calendar, Globe, BarChart3, AlertCircle, CheckCircle,
    ChevronDown, Share2, Download, Clock, Activity
} from 'lucide-react';
import { getUnifiedCompanyNews, UnifiedNewsResponse, UnifiedNewsItem } from '../services/unifiedNewsService';

interface CompanyIntelligencePageProps {
    companyName: string;
    onClose?: () => void;
}

export const CompanyIntelligencePage = ({ companyName, onClose }: CompanyIntelligencePageProps) => {
    const [data, setData] = useState<UnifiedNewsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await getUnifiedCompanyNews(companyName);
                setData(response);
            } catch (err) {
                console.error('Error loading intelligence:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [companyName]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-12 h-12 border-4 border-blue-500 border-t-cyan-400 rounded-full"
                />
            </div>
        );
    }

    if (!data) return null;

    // Filter logic
    const filteredNews = data.news.filter(item => {
        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.summary?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const categories = ['All', ...data.categories];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
            {/* Header */}
            <Header
                companyName={companyName}
                data={data}
                onClose={onClose}
            />

            {/* Market Pulse Sentiment */}
            <SentimentMeter data={data} />

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar - Filters */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-1"
                    >
                        <FilterSidebar
                            categories={categories}
                            selectedCategory={selectedCategory}
                            onSelectCategory={setSelectedCategory}
                            data={data}
                        />
                    </motion.div>

                    {/* Main Feed */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-3 space-y-6"
                    >
                        {/* Search */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search news..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-colors"
                            />
                            <Search className="absolute right-3 top-3 text-slate-500" size={20} />
                        </div>

                        {/* Breaking News */}
                        {data.breakingCount > 0 && (
                            <BreakingNewsBanner news={filteredNews.filter(n => n.isBreaking)} />
                        )}

                        {/* News Feed */}
                        {filteredNews.length > 0 ? (
                            <div className="space-y-4">
                                <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider">
                                    {filteredNews.length} {selectedCategory === 'All' ? 'Articles' : selectedCategory.toLowerCase()}
                                </p>
                                <div className="space-y-4">
                                    {filteredNews.map((item, idx) => (
                                        <div key={`news-${item.id}`}>
                                            <NewsCard item={item} index={idx} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-slate-400">No news found for "{selectedCategory}"</p>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────
// HEADER COMPONENT
// ─────────────────────────────────────────────────────────────
const Header = ({ companyName, data, onClose }: { companyName: string; data: UnifiedNewsResponse; onClose?: () => void }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-b border-slate-700 bg-slate-800/50 backdrop-blur"
        >
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-4xl font-black text-white mb-2">
                            {companyName}
                        </h1>
                        <p className="text-slate-400 text-sm flex items-center gap-2">
                            <Activity size={16} />
                            Company Intelligence Center • Updated {data.lastUpdated.toLocaleString()}
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                        >
                            <Download size={16} /> Export
                        </motion.button>
                        {onClose && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onClose}
                                className="px-4 py-2 bg-red-900/30 hover:bg-red-900/50 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </motion.button>
                        )}
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-4 gap-4">
                    <StatBox label="Total News" value={data.news.length} />
                    <StatBox label="Breaking" value={data.breakingCount} highlight={data.breakingCount > 0} />
                    <StatBox label="Live Sources" value={data.liveCount} />
                    <StatBox label="Categories" value={data.categories.length} />
                </div>
            </div>
        </motion.div>
    );
};

const StatBox = ({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) => {
    return (
        <div className={`bg-slate-700/50 border ${highlight ? 'border-cyan-500' : 'border-slate-600'} rounded-lg p-4`}>
            <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-1">{label}</p>
            <p className={`text-2xl font-black ${highlight ? 'text-cyan-400' : 'text-white'}`}>{value}</p>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────
// SENTIMENT METER
// ─────────────────────────────────────────────────────────────
const SentimentMeter = ({ data }: { data: UnifiedNewsResponse }) => {
    const sentiment = data.sentiment;
    const colors = sentiment < 0.35
        ? { bar: 'bg-red-600', label: 'BEARISH', icon: TrendingDown }
        : sentiment > 0.65
            ? { bar: 'bg-green-600', label: 'BULLISH', icon: TrendingUp }
            : { bar: 'bg-yellow-600', label: 'NEUTRAL', icon: BarChart3 };

    const Icon = colors.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/50 border-b border-slate-700 backdrop-blur"
        >
            <div className="max-w-7xl mx-auto px-6 py-6">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <Icon size={28} className={colors.bar.replace('bg-', 'text-')} />
                        <div>
                            <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Market Sentiment</p>
                            <p className="text-2xl font-black text-white">{colors.label}</p>
                        </div>
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center gap-4">
                            <p className="text-slate-500 text-sm min-w-fit">Bearish</p>
                            <div className="flex-1 h-3 bg-slate-700 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${sentiment * 100}%` }}
                                    transition={{ duration: 1 }}
                                    className={`h-full ${colors.bar} transition-all`}
                                />
                            </div>
                            <p className="text-slate-500 text-sm min-w-fit">Bullish</p>
                        </div>
                        <p className="text-right text-xs text-slate-400 mt-2">{(sentiment * 100).toFixed(0)}% Bullish</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// ─────────────────────────────────────────────────────────────
// FILTER SIDEBAR
// ─────────────────────────────────────────────────────────────
const FilterSidebar = ({
    categories,
    selectedCategory,
    onSelectCategory,
    data
}: {
    categories: string[];
    selectedCategory: string;
    onSelectCategory: (cat: string) => void;
    data: UnifiedNewsResponse;
}) => {
    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 sticky top-24">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
                <Filter size={16} /> Filter by Category
            </h3>

            <div className="space-y-2">
                {categories.map(cat => {
                    const count = cat === 'All'
                        ? data.news.length
                        : data.news.filter(n => n.category === cat).length;

                    return (
                        <motion.button
                            key={cat}
                            whileHover={{ x: 4 }}
                            onClick={() => onSelectCategory(cat)}
                            className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                                selectedCategory === cat
                                    ? 'bg-cyan-600 text-white font-semibold'
                                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <span>{cat}</span>
                                <span className="text-xs bg-slate-600 px-2 py-1 rounded">{count}</span>
                            </div>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────
// BREAKING NEWS BANNER
// ─────────────────────────────────────────────────────────────
const BreakingNewsBanner = ({ news }: { news: UnifiedNewsItem[] }) => {
    if (news.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-900/20 border-l-4 border-red-500 rounded-lg p-4 mb-6"
        >
            <div className="flex items-start gap-3">
                <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-red-500 flex-shrink-0 mt-1"
                >
                    <AlertCircle size={20} />
                </motion.div>
                <div>
                    <p className="text-xs font-black text-red-400 uppercase tracking-wider mb-2">🔴 Breaking News</p>
                    <p className="text-white font-semibold">{news[0]?.title}</p>
                </div>
            </div>
        </motion.div>
    );
};

// ─────────────────────────────────────────────────────────────
// NEWS CARD - Main Content Unit
// ─────────────────────────────────────────────────────────────
interface NewsCardProps {
    item: UnifiedNewsItem;
    index: number;
}

function NewsCard({ item, index }: NewsCardProps) {
    const sentimentColors = {
        positive: { bg: 'bg-green-900/20', border: 'border-green-600', dot: 'bg-green-500', text: 'text-green-400', icon: CheckCircle },
        negative: { bg: 'bg-red-900/20', border: 'border-red-600', dot: 'bg-red-500', text: 'text-red-400', icon: AlertCircle },
        neutral: { bg: 'bg-slate-800/50', border: 'border-slate-600', dot: 'bg-slate-400', text: 'text-slate-400', icon: BarChart3 }
    };

    const colors = sentimentColors[item.sentiment];
    const SentimentIcon = colors.icon;

    const timeAgo = getTimeAgo(item.date);

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ x: 4 }}
            className={`bg-slate-800/50 border ${colors.border} rounded-lg p-6 hover:bg-slate-800 transition-all cursor-pointer group`}
        >
            <div className="flex items-start gap-4">
                {/* Sentiment Indicator */}
                <div className={`flex-shrink-0 w-10 h-10 ${colors.bg} border ${colors.border} rounded-lg flex items-center justify-center`}>
                    <SentimentIcon size={20} className={colors.text} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-white font-bold leading-tight group-hover:text-cyan-400 transition-colors">
                            {item.title}
                        </h3>
                        {item.isBreaking && (
                            <motion.span
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="text-xs font-black text-red-400 uppercase tracking-wider whitespace-nowrap"
                            >
                                🔥 Breaking
                            </motion.span>
                        )}
                    </div>

                    {item.summary && (
                        <p className="text-slate-400 text-sm leading-relaxed mb-3 line-clamp-2">
                            {item.summary}
                        </p>
                    )}

                    {/* Metadata */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1.5">
                                <Globe size={14} />
                                {item.source}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Clock size={14} />
                                {timeAgo}
                            </span>
                            <span className="px-2 py-1 bg-slate-700 rounded text-slate-300 uppercase tracking-wider font-semibold text-[10px]">
                                {item.category}
                            </span>
                            {item.sourceType === 'mock' && (
                                <span className="px-2 py-1 bg-slate-700/50 rounded text-slate-400 text-[10px]">Demo</span>
                            )}
                        </div>
                        {item.link && (
                            <motion.a
                                whileHover={{ scale: 1.1 }}
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-cyan-500 hover:text-cyan-400 text-xs font-semibold uppercase tracking-wider"
                            >
                                Read →
                            </motion.a>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

/**
 * Format date as "X hours/days ago"
 */
const getTimeAgo = (date: Date | string): string => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return then.toLocaleDateString();
};
