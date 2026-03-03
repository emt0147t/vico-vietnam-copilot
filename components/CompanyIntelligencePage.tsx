/**
 * 📰 Company Intelligence & News Center
 * Bloomberg Terminal meets Modern SaaS
 * Comprehensive deep dive: Profile → PESTEL → News → Competitors → Data Quality
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp, TrendingDown, Filter, Search, X,
    Globe, BarChart3, AlertCircle, CheckCircle,
    Download, Clock, Activity, Building2, MapPin,
    Users, Tag, Shield, Zap
} from 'lucide-react';
import { getUnifiedCompanyNews, UnifiedNewsResponse, UnifiedNewsItem } from '../services/unifiedNewsService';
import { exportCompanyNews } from '../utils/exportReport';

interface CompanyIntelligencePageProps {
    companyName: string;
    onClose?: () => void;
}

// Company profile from CompaniesDataService
interface CompanyProfile {
    name: string;
    industry?: string;
    ticker?: string;
    size?: string;
    location?: string;
    founded?: number;
    intro?: string;
    dataTier?: 'premium' | 'standard' | 'basic';
    dataScore?: number;
}

// PESTEL quick scores
interface PESTELScores {
    [dimension: string]: { score: number; trend: string };
}

// Competitor entry
interface CompetitorInfo {
    name: string;
    industry?: string;
    size?: string;
    dataTier?: string;
}

export const CompanyIntelligencePage = ({ companyName, onClose }: CompanyIntelligencePageProps) => {
    const [data, setData] = useState<UnifiedNewsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
    const [pestelScores, setPestelScores] = useState<PESTELScores | null>(null);
    const [competitors, setCompetitors] = useState<CompetitorInfo[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch news (existing)
                const newsPromise = getUnifiedCompanyNews(companyName);

                // Fetch company profile from API
                const profilePromise = fetch(`/api/companies?search=${encodeURIComponent(companyName)}&limit=1`)
                    .then(r => r.ok ? r.json() : null)
                    .catch(() => null);

                // Fetch PESTEL scores
                const pestelPromise = fetch(`/api/pestel?industry=Technology`)
                    .then(r => r.ok ? r.json() : null)
                    .catch(() => null);

                const [newsData, profileData, pestelData] = await Promise.all([
                    newsPromise, profilePromise, pestelPromise
                ]);

                setData(newsData);

                // Extract company profile from search results
                if (profileData?.companies?.length > 0) {
                    const c = profileData.companies[0];
                    setCompanyProfile({
                        name: c.name,
                        industry: c.industry,
                        ticker: c.ticker,
                        size: c.size,
                        location: c.location || c.address,
                        founded: c.year || c.founded,
                        intro: c.intro || c.description,
                        dataTier: c.dataTier,
                        dataScore: c.dataScore,
                    });

                    // Fetch competitors (same industry)
                    if (c.industry) {
                        fetch(`/api/companies?industry=${encodeURIComponent(c.industry)}&limit=6`)
                            .then(r => r.ok ? r.json() : null)
                            .then(data => {
                                if (data?.companies) {
                                    setCompetitors(
                                        data.companies
                                            .filter((comp: any) => comp.name !== companyName)
                                            .slice(0, 5)
                                            .map((comp: any) => ({
                                                name: comp.name,
                                                industry: comp.industry,
                                                size: comp.size,
                                                dataTier: comp.dataTier,
                                            }))
                                    );
                                }
                            })
                            .catch(() => { });

                        // Re-fetch PESTEL with correct industry
                        fetch(`/api/pestel?industry=${encodeURIComponent(c.industry)}`)
                            .then(r => r.ok ? r.json() : null)
                            .then(data => {
                                if (data?.quickScores) setPestelScores(data.quickScores);
                            })
                            .catch(() => { });
                    }
                }

                if (pestelData?.quickScores) setPestelScores(pestelData.quickScores);

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
            <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center transition-colors">
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
        <div className="min-h-screen bg-[#FDFCFB] text-[#18181B] transition-colors">
            {/* Header */}
            <Header
                companyName={companyName}
                data={data}
                onClose={onClose}
                profile={companyProfile}
            />

            {/* Company Profile Strip */}
            {companyProfile && <CompanyProfileStrip profile={companyProfile} />}

            {/* PESTEL Impact Strip */}
            {pestelScores && <PESTELStrip scores={pestelScores} industry={companyProfile?.industry} />}

            {/* Market Pulse Sentiment */}
            <SentimentMeter data={data} />

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar - Filters */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-1 space-y-6"
                    >
                        <FilterSidebar
                            categories={categories}
                            selectedCategory={selectedCategory}
                            onSelectCategory={setSelectedCategory}
                            data={data}
                        />

                        {/* Competitive Position */}
                        {competitors.length > 0 && (
                            <CompetitorsPanel competitors={competitors} />
                        )}

                        {/* Data Quality */}
                        {companyProfile && (
                            <DataQualityCard profile={companyProfile} />
                        )}
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
                                className="w-full px-4 py-3 bg-white border border-[#E4E4E7] rounded-lg text-[#18181B] placeholder-[#A1A1AA] focus:border-cyan-500 focus:outline-none transition-colors"
                            />
                            <Search className="absolute right-3 top-3 text-[#A1A1AA]" size={20} />
                        </div>

                        {/* Breaking News */}
                        {data.breakingCount > 0 && (
                            <BreakingNewsBanner news={filteredNews.filter(n => n.isBreaking)} />
                        )}

                        {/* News Feed */}
                        {filteredNews.length > 0 ? (
                            <div className="space-y-4">
                                <p className="text-[#71717A] text-sm font-semibold uppercase tracking-wider">
                                    {filteredNews.length} {selectedCategory === 'All' ? 'articles' : selectedCategory.toLowerCase()}
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
                                <p className="text-[#71717A]">No news found for "{selectedCategory}"</p>
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
const Header = ({ companyName, data, onClose, profile }: { companyName: string; data: UnifiedNewsResponse; onClose?: () => void; profile?: CompanyProfile | null }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-b border-[#E4E4E7] bg-white/50 backdrop-blur"
        >
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-4xl font-black text-[#18181B]">
                                {companyName}
                            </h1>
                            {profile?.ticker && (
                                <span className="px-2.5 py-1 bg-cyan-100 text-cyan-700 text-sm font-bold rounded-lg">
                                    {profile.ticker}
                                </span>
                            )}
                            {profile?.dataTier && (
                                <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                                    (profile as any)._isVerifiedFirst ? 'bg-green-100 text-green-700' :
                                    profile.dataTier === 'premium' ? 'bg-amber-100 text-amber-700' :
                                    profile.dataTier === 'standard' ? 'bg-blue-100 text-blue-700' :
                                        'bg-[#F4F4F5] text-[#71717A]'
                                    }`}>
                                    {(profile as any)._isVerifiedFirst ? '🏆 VERIFIED' : profile.dataTier.toUpperCase()}
                                </span>
                            )}
                        </div>
                        <p className="text-[#71717A] text-sm flex items-center gap-2">
                            <Activity size={16} />
                            {profile?.industry ? `${profile.industry} • ` : ''}Company Intelligence Center • Updated {data.lastUpdated.toLocaleString()}
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => exportCompanyNews(companyName, data)}
                            className="px-4 py-2 bg-[#F4F4F5] hover:bg-[#E4E4E7] text-[#18181B] rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                        >
                            <Download size={16} /> Export Report
                        </motion.button>
                        {onClose && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onClose}
                                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </motion.button>
                        )}
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
        <div className={`bg-[#FAFAFA] border ${highlight ? 'border-cyan-500' : 'border-[#E4E4E7]'} rounded-lg p-4`}>
            <p className="text-[#71717A] text-xs uppercase tracking-wider font-semibold mb-1">{label}</p>
            <p className={`text-2xl font-black ${highlight ? 'text-cyan-600' : 'text-[#18181B]'}`}>{value}</p>
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
            className="bg-[#FAFAFA] border-b border-[#E4E4E7] backdrop-blur"
        >
            <div className="max-w-7xl mx-auto px-6 py-6">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <Icon size={28} className={colors.bar.replace('bg-', 'text-')} />
                        <div>
                            <p className="text-[#71717A] text-xs uppercase tracking-wider font-semibold">Market Sentiment</p>
                            <p className="text-2xl font-black text-[#18181B]">{colors.label}</p>
                        </div>
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center gap-4">
                            <p className="text-[#A1A1AA] text-sm min-w-fit">Bearish</p>
                            <div className="flex-1 h-3 bg-[#E4E4E7] rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${sentiment * 100}%` }}
                                    transition={{ duration: 1 }}
                                    className={`h-full ${colors.bar} transition-all`}
                                />
                            </div>
                            <p className="text-[#A1A1AA] text-sm min-w-fit">Bullish</p>
                        </div>
                        <p className="text-right text-xs text-[#71717A] mt-2">{(sentiment * 100).toFixed(0)}% Bullish</p>
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
        <div className="bg-white border border-[#E4E4E7] rounded-lg p-6 sticky top-24">
            <h3 className="text-sm font-black uppercase tracking-wider text-[#71717A] mb-4 flex items-center gap-2">
                <Filter size={16} /> Filter by category
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
                            className={`w-full text-left px-4 py-3 rounded-lg transition-all ${selectedCategory === cat
                                ? 'bg-cyan-600 text-white font-semibold'
                                : 'bg-[#FAFAFA] text-[#18181B] hover:bg-[#F4F4F5]'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <span>{cat}</span>
                                <span className="text-xs bg-[#E4E4E7] text-[#71717A] px-2 py-1 rounded">{count}</span>
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
            className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 mb-6"
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
                    <p className="text-xs font-black text-red-600 uppercase tracking-wider mb-2">🔴 Breaking News</p>
                    <p className="text-[#18181B] font-semibold">{news[0]?.title}</p>
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
        positive: { bg: 'bg-green-50', border: 'border-green-300', dot: 'bg-green-500', text: 'text-green-600', icon: CheckCircle },
        negative: { bg: 'bg-red-50', border: 'border-red-300', dot: 'bg-red-500', text: 'text-red-600', icon: AlertCircle },
        neutral: { bg: 'bg-[#FAFAFA]', border: 'border-[#E4E4E7]', dot: 'bg-[#A1A1AA]', text: 'text-[#71717A]', icon: BarChart3 }
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
            className={`bg-white border ${colors.border} rounded-lg p-6 hover:bg-[#FAFAFA] transition-all cursor-pointer group`}
        >
            <div className="flex items-start gap-4">
                {/* Sentiment Indicator */}
                <div className={`flex-shrink-0 w-10 h-10 ${colors.bg} border ${colors.border} rounded-lg flex items-center justify-center`}>
                    <SentimentIcon size={20} className={colors.text} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-[#18181B] font-bold leading-tight group-hover:text-cyan-600 transition-colors">
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
                        <p className="text-[#71717A] text-sm leading-relaxed mb-3 line-clamp-2">
                            {item.summary}
                        </p>
                    )}

                    {/* Metadata */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-[#A1A1AA]">
                            <span className="flex items-center gap-1.5">
                                <Globe size={14} />
                                {item.source}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Clock size={14} />
                                {timeAgo}
                            </span>
                            <span className="px-2 py-1 bg-[#F4F4F5] rounded text-[#71717A] uppercase tracking-wider font-semibold text-[10px]">
                                {item.category}
                            </span>
                            {(item.sourceType as string) === 'mock' && (
                                <span className="px-2 py-1 bg-[#F4F4F5] rounded text-[#A1A1AA] text-[10px]">Demo</span>
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

// ─────────────────────────────────────────────────────────────
// COMPANY PROFILE STRIP
// ─────────────────────────────────────────────────────────────
const CompanyProfileStrip = ({ profile }: { profile: CompanyProfile }) => {
    const infoCards = [
        { icon: Building2, label: 'Industry', value: profile.industry || 'N/A', color: 'text-blue-500' },
        { icon: Users, label: 'Size', value: profile.size || 'N/A', color: 'text-emerald-500' },
        { icon: MapPin, label: 'Location', value: profile.location || 'N/A', color: 'text-[#F97316]' },
        { icon: Tag, label: 'Founded', value: profile.founded ? String(profile.founded) : 'N/A', color: 'text-amber-500' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white border-b border-[#E4E4E7]"
        >
            <div className="max-w-7xl mx-auto px-6 py-4">
                {profile.intro && (
                    <p className="text-[#71717A] text-sm mb-3 line-clamp-2">{profile.intro}</p>
                )}
                <div className="flex flex-wrap gap-4">
                    {infoCards.map((card) => {
                        const Icon = card.icon;
                        return (
                            <div key={card.label} className="flex items-center gap-2 bg-[#FAFAFA] rounded-lg px-3 py-2">
                                <Icon size={16} className={card.color} />
                                <span className="text-[#71717A] text-xs">{card.label}:</span>
                                <span className="text-[#18181B] text-sm font-semibold">{card.value}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
};

// ─────────────────────────────────────────────────────────────
// PESTEL IMPACT STRIP
// ─────────────────────────────────────────────────────────────
const PESTEL_LABELS: Record<string, { emoji: string; label: string; color: string }> = {
    political: { emoji: '🏛️', label: 'Political', color: 'text-red-500' },
    economic: { emoji: '💰', label: 'Economic', color: 'text-emerald-500' },
    social: { emoji: '👥', label: 'Social', color: 'text-blue-500' },
    technological: { emoji: '💻', label: 'Technology', color: 'text-[#F97316]' },
    environmental: { emoji: '🌿', label: 'Environment', color: 'text-green-500' },
    legal: { emoji: '⚖️', label: 'Legal', color: 'text-amber-500' },
};

const PESTELStrip = ({ scores, industry }: { scores: PESTELScores; industry?: string }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-[#FAFAFA] border-b border-[#E4E4E7]"
        >
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center gap-2 mb-3">
                    <Zap size={14} className="text-amber-500" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#71717A]">
                        PESTEL Impact {industry ? `— ${industry}` : ''}
                    </span>
                </div>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                    {Object.entries(scores).map(([dim, data]) => {
                        const meta = PESTEL_LABELS[dim] || { emoji: '📊', label: dim, color: 'text-[#71717A]' };
                        const score = (data as any).score || 0;
                        const trend = (data as any).trend || 'stable';
                        const trendIcon = trend === 'improving' ? '↑' : trend === 'declining' ? '↓' : '→';
                        const trendColor = trend === 'improving' ? 'text-emerald-500' : trend === 'declining' ? 'text-red-500' : 'text-[#A1A1AA]';

                        return (
                            <div key={dim} className="bg-white rounded-lg p-3 border border-[#E4E4E7] hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <span className="text-sm">{meta.emoji}</span>
                                    <span className="text-xs font-semibold text-[#71717A] truncate">{meta.label}</span>
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className={`text-lg font-black ${meta.color}`}>{score.toFixed(1)}</span>
                                    <span className="text-[#A1A1AA] text-xs">/5</span>
                                    <span className={`text-sm font-bold ml-auto ${trendColor}`}>{trendIcon}</span>
                                </div>
                                <div className="w-full bg-[#E4E4E7] rounded-full h-1 mt-1.5">
                                    <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-1 rounded-full transition-all" style={{ width: `${(score / 5) * 100}%` }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
};

// ─────────────────────────────────────────────────────────────
// COMPETITORS PANEL (Sidebar)
// ─────────────────────────────────────────────────────────────
const CompetitorsPanel = ({ competitors }: { competitors: CompetitorInfo[] }) => {
    return (
        <div className="bg-white border border-[#E4E4E7] rounded-lg p-5">
            <h3 className="text-sm font-black uppercase tracking-wider text-[#71717A] mb-4 flex items-center gap-2">
                <Shield size={16} className="text-blue-500" /> Competitors
            </h3>
            <div className="space-y-2">
                {competitors.map((comp, i) => (
                    <motion.div
                        key={comp.name}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="flex items-center justify-between bg-[#FAFAFA] rounded-lg px-3 py-2.5 hover:bg-[#F4F4F5] transition-colors group"
                    >
                        <div className="min-w-0">
                            <p className="text-[#18181B] text-sm font-semibold truncate">{comp.name}</p>
                            <p className="text-[#A1A1AA] text-xs">{comp.size || 'Unknown size'}</p>
                        </div>
                        <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded uppercase ${
                            (comp as any)._isVerifiedFirst ? 'bg-green-100 text-green-600' :
                            comp.dataTier === 'premium' ? 'bg-amber-100 text-amber-600' :
                            comp.dataTier === 'standard' ? 'bg-blue-100 text-blue-600' :
                                'bg-[#F4F4F5] text-[#A1A1AA]'
                            }`}>
                            {(comp as any)._isVerifiedFirst ? '🏆 verified' : (comp.dataTier || 'basic')}
                        </span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────
// DATA QUALITY CARD (Sidebar)
// ─────────────────────────────────────────────────────────────
const DataQualityCard = ({ profile }: { profile: CompanyProfile }) => {
    const score = profile.dataScore ?? 0;
    const circumference = 2 * Math.PI * 32;
    const progress = (score / 100) * circumference;

    const signals = [
        { label: 'Ticker', present: !!profile.ticker },
        { label: 'Industry', present: !!profile.industry },
        { label: 'Size', present: !!profile.size },
        { label: 'Location', present: !!profile.location },
        { label: 'Founded', present: !!profile.founded },
        { label: 'Description', present: !!profile.intro },
    ];

    const completeness = Math.round((signals.filter(s => s.present).length / signals.length) * 100);

    return (
        <div className="bg-white border border-[#E4E4E7] rounded-lg p-5">
            <h3 className="text-sm font-black uppercase tracking-wider text-[#71717A] mb-4 flex items-center gap-2">
                <Shield size={16} className="text-emerald-500" /> Data Quality
            </h3>

            <div className="flex items-center gap-4 mb-4">
                <div className="relative w-20 h-20">
                    <svg className="w-20 h-20 -rotate-90" viewBox="0 0 72 72">
                        <circle cx="36" cy="36" r="32" fill="none" strokeWidth="4" className="stroke-gray-200" />
                        <circle cx="36" cy="36" r="32" fill="none" strokeWidth="4"
                            strokeDasharray={circumference}
                            strokeDashoffset={circumference - progress}
                            strokeLinecap="round"
                            className={score >= 70 ? 'stroke-emerald-500' : score >= 40 ? 'stroke-amber-500' : 'stroke-red-500'}
                            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-black text-[#18181B]">{score}</span>
                    </div>
                </div>
                <div>
                    <p className="text-[#18181B] text-sm font-bold">Data Score</p>
                    <p className="text-[#A1A1AA] text-xs">{completeness}% fields complete</p>
                </div>
            </div>

            <div className="space-y-1.5">
                {signals.map(s => (
                    <div key={s.label} className="flex items-center gap-2 text-xs">
                        <div className={`w-3 h-3 rounded-full flex items-center justify-center ${s.present ? 'bg-emerald-500 text-white' : 'bg-[#E4E4E7]'
                            }`}>
                            {s.present && <CheckCircle size={8} />}
                        </div>
                        <span className={s.present ? 'text-[#18181B]' : 'text-[#A1A1AA]'}>
                            {s.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
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
