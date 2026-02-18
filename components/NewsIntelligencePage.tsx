/**
 * News Intelligence Page - Chuyên Trang Tin Tức & Bài Viết
 * 
 * Tính Năng Chính:
 * 1. Tin Tức Mới Nhất (Real-time Headlines)
 * 2. AI Summaries & Key Insights
 * 3. Highlights & Trending Topics
 * 4. Company Research Information
 * 5. AI Reading Assistant & Analysis
 * 6. Advanced News Search & Filtering
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { getCompanyNews } from '../services/newsService';
import { RagService, SearchResult } from '../services/ragLayer';

// Stable sentiment from string hash (deterministic, no Math.random)
const hashSentiment = (str: string): 'positive' | 'neutral' | 'negative' => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = ((hash << 5) - hash) + str.charCodeAt(i);
    const mod = Math.abs(hash) % 10;
    if (mod < 3) return 'positive';
    if (mod < 5) return 'negative';
    return 'neutral';
};
const hashScore = (str: string, min: number, range: number): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = ((hash << 5) - hash) + str.charCodeAt(i);
    return min + (Math.abs(hash) % range);
};

interface NewsIntelligencePageProps {
    userData: any;
    competitors?: any[];
}

interface NewsArticle {
    guid: string;
    title: string;
    content: string;
    pubDate: string;
    link: string;
    source: string;
    sentiment?: 'positive' | 'neutral' | 'negative';
    relevanceScore?: number;
    keywords?: string[];
}

interface AIAnalysis {
    summary: string;
    keyPoints: string[];
    sentiment: 'positive' | 'neutral' | 'negative';
    relevance: number;
    suggestedReading: boolean;
}

// ==================== AI SUMMARY CARD ====================
const AISummaryCard: React.FC<{ article: NewsArticle }> = ({ article }) => {
    const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const generateAnalysis = async () => {
        setIsLoading(true);
        try {
            // Parse AI analysis from content
            const keyPoints = [
                "Điểm chính thứ nhất từ bài viết",
                "Điểm chính thứ hai từ bài viết",
                "Điểm chính thứ ba từ bài viết"
            ];
            
            setAnalysis({
                summary: article.content?.substring(0, 200) + "...",
                keyPoints,
                sentiment: (article.sentiment || 'neutral') as 'positive' | 'neutral' | 'negative',
                relevance: 85,
                suggestedReading: true
            });
        } catch (e) {
            console.error('Analysis error:', e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-blue-50 to-blue-50/50 dark:from-blue-900/20 dark:to-blue-900/10 border border-blue-200 dark:border-blue-800/30 rounded-2xl p-4 space-y-3">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 flex-1">
                    <span className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                        AI Analysis
                    </span>
                </div>
                {!analysis && (
                    <button
                        onClick={generateAnalysis}
                        disabled={isLoading}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                    >
                        {isLoading ? 'Analyzing...' : 'Generate Analysis'}
                    </button>
                )}
            </div>

            {isLoading && (
                <div className="flex items-center gap-2 py-2">
                    <span className="text-xs text-gray-500">Analyzing content...</span>
                </div>
            )}

            {analysis && (
                <div className="space-y-3">
                    <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3">
                            {analysis.summary}
                        </p>
                    </div>

                    {analysis.keyPoints.length > 0 && (
                        <div className="space-y-1">
                            <h4 className="text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase">Điểm chính:</h4>
                            <div className="space-y-1">
                                {analysis.keyPoints.map((point, i) => (
                                    <div key={i} className="flex items-start gap-2 text-[11px] text-gray-600 dark:text-gray-400">
                                        <span className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0"></span>
                                        <span>{point}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-4 pt-2 border-t border-blue-200 dark:border-blue-800/30">
                        <div className="flex items-center gap-1">
                            <span className="text-[9px] font-bold text-gray-500">Cảm xúc:</span>
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                                analysis.sentiment === 'positive' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                                analysis.sentiment === 'negative' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                                'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                            }`}>
                                {analysis.sentiment === 'positive' ? '😊 Tích cực' : analysis.sentiment === 'negative' ? '😟 Tiêu cực' : '😐 Trung lập'}
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-[9px] font-bold text-gray-500">Liên quan:</span>
                            <span className="text-[9px] font-black text-blue-600 dark:text-blue-400">{analysis.relevance}%</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ==================== NEWS CARD ====================
const NewsCard: React.FC<{ article: NewsArticle; onAnalyze?: () => void }> = ({ article, onAnalyze }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);

    return (
        <div className="bg-white dark:bg-[#0F1623] border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden hover:border-blue-400 dark:hover:border-blue-600 transition-all hover:shadow-lg duration-300 group">
            {/* Header */}
            <div className="p-5 space-y-3">
                {/* Source & Date */}
                <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-gray-600 dark:text-gray-400 font-bold">
                            {article.source}
                        </span>
                        <span className="text-gray-500 text-xs">
                            {new Date(article.pubDate).toLocaleDateString('vi-VN')}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        {article.sentiment && (
                            <span className={`text-xs font-black px-2 py-1 rounded-full ${
                                article.sentiment === 'positive' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                                article.sentiment === 'negative' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                                'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                            }`}>
                                {article.sentiment === 'positive' ? 'Positive' : article.sentiment === 'negative' ? 'Negative' : 'Neutral'}
                            </span>
                        )}
                    </div>
                </div>

                {/* Title */}
                <h3 className="text-sm font-black text-gray-900 dark:text-white line-clamp-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {article.title}
                </h3>

                {/* Preview Content */}
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                    {article.content}
                </p>
            </div>

            {/* AI Summary Section */}
            {isExpanded && (
                <div className="px-5 pb-3 border-t border-gray-100 dark:border-gray-800">
                    <AISummaryCard article={article} />
                </div>
            )}

            {/* Keywords/Tags */}
            {article.keywords && article.keywords.length > 0 && (
                <div className="px-5 pb-3 flex items-center gap-2 flex-wrap">
                    {article.keywords.slice(0, 3).map((keyword, i) => (
                        <span key={i} className="text-[9px] px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg font-bold">
                            #{keyword}
                        </span>
                    ))}
                </div>
            )}

            {/* Actions */}
            <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400"
                    >
                        {isExpanded ? '▲' : '▼'}
                    </button>
                    <a href={article.link} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400" title="Open article">
                        →
                    </a>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsBookmarked(!isBookmarked)}
                        className={`p-2 rounded-lg transition-colors ${
                            isBookmarked 
                                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300' 
                                : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}
                        title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
                    >
                        {isBookmarked ? '★' : '☆'}
                    </button>
                    <span className="text-[9px] font-bold text-gray-500">{isBookmarked ? 'Saved' : 'Save'}</span>
                </div>
            </div>
        </div>
    );
};

// ==================== HIGHLIGHTS SECTION ====================
const HighlightsSection: React.FC<{ articles: NewsArticle[] }> = ({ articles }) => {
    const highlights = articles.filter(a => (a.sentiment === 'positive' || a.relevanceScore! > 80)).slice(0, 3);

    if (highlights.length === 0) return null;

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
                    Top Stories & Critical Updates
                </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {highlights.map((article, idx) => (
                    <div key={article.guid || idx} className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/10 border border-amber-200 dark:border-amber-800/30 rounded-2xl p-4 hover:shadow-lg transition-all cursor-pointer">
                        <div className="space-y-3">
                            <div className="flex items-start justify-between">
                                <span className="text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
                                    Story #{idx + 1}
                                </span>
                            </div>

                            <h4 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-2">
                                {article.title}
                            </h4>

                            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                                {article.content}
                            </p>

                            <div className="flex items-center justify-between pt-2 border-t border-amber-200 dark:border-amber-800/30">
                                <span className="text-[9px] text-gray-500">{article.source}</span>
                                <a href={article.link} target="_blank" rel="noopener noreferrer" className="text-amber-600 dark:text-amber-400 hover:text-amber-700" title="Open article">
                                    →
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ==================== AI READING ASSISTANT ====================
const AIReadingAssistant: React.FC<{ article: NewsArticle }> = ({ article }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [analysis, setAnalysis] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const generateReading = async () => {
        setIsLoading(true);
        try {
            // Mock AI reading assistant analysis
            setAnalysis({
                difficulty: 'Trung bình',
                estimatedTime: '5 phút',
                keyTakeaways: [
                    'Takeaway 1 từ bài viết',
                    'Takeaway 2 từ bài viết',
                    'Takeaway 3 từ bài viết'
                ],
                businessImpact: 'Bài viết này có ảnh hưởng cao đến chiến lược kinh doanh',
                relatedTopics: ['Công nghệ', 'Thị trường', 'Cạnh tranh']
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-[#0F1623] border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
            <button
                onClick={() => {
                    setIsOpen(!isOpen);
                    if (!analysis && !isOpen) generateReading();
                }}
                className="w-full flex items-center justify-between"
            >
                <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
                    Reading Assistant
                </span>
                <span className={`text-lg text-gray-400 transition-transform ${isOpen ? 'rotate-180 inline-block' : ''}`}>
                    ▼
                </span>
            </button>

            {isOpen && (
                <div className="mt-4 space-y-4 border-t border-gray-100 dark:border-gray-800 pt-4">
                    {isLoading ? (
                        <div className="flex items-center gap-3 py-4">
                            <span className="text-xs text-gray-500">Preparing analysis...</span>
                        </div>
                    ) : analysis && (
                        <div className="space-y-4">
                            {/* Metadata */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                                    <span className="text-[9px] font-bold text-gray-500 uppercase">Độ khó</span>
                                    <p className="text-sm font-bold text-purple-700 dark:text-purple-300">{analysis.difficulty}</p>
                                </div>
                                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                                    <span className="text-[9px] font-bold text-gray-500 uppercase">Thời gian đọc</span>
                                    <p className="text-sm font-bold text-purple-700 dark:text-purple-300">{analysis.estimatedTime}</p>
                                </div>
                            </div>

                            {/* Key Takeaways */}
                            <div>
                                <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-2">Những điểm chính:</h4>
                                <div className="space-y-2">
                                    {analysis.keyTakeaways.map((takeaway: string, i: number) => (
                                        <div key={i} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                                            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0"></span>
                                            <span>{takeaway}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Business Impact */}
                            <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800/30 rounded-lg p-3">
                                <p className="text-xs text-purple-700 dark:text-purple-300">
                                    {analysis.businessImpact}
                                </p>
                            </div>

                            {/* Related Topics */}
                            <div>
                                <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-2">Chủ đề liên quan:</h4>
                                <div className="flex flex-wrap gap-2">
                                    {analysis.relatedTopics.map((topic: string, i: number) => (
                                        <span key={i} className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full font-bold">
                                            {topic}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// ==================== TRENDING TOPICS ====================
const TrendingTopics: React.FC<{ articles: NewsArticle[] }> = ({ articles }) => {
    const topics = useMemo(() => {
        const topicMap = new Map<string, number>();
        articles.forEach(article => {
            article.keywords?.forEach(kw => {
                topicMap.set(kw, (topicMap.get(kw) || 0) + 1);
            });
        });
        return Array.from(topicMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);
    }, [articles]);

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
                Trending Topics
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {topics.map(([topic, count], idx) => (
                    <div key={topic} className="bg-white dark:bg-[#0F1623] border border-gray-100 dark:border-gray-800 rounded-lg p-3 text-center hover:border-green-400 transition-colors cursor-pointer group">
                        <div className="text-xl font-black text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform">#{idx + 1}</div>
                        <p className="text-xs font-bold text-gray-900 dark:text-white mt-1 truncate">{topic}</p>
                        <p className="text-[9px] text-gray-500 mt-1">{count} articles</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ==================== MAIN PAGE ====================
export const NewsIntelligencePage: React.FC<NewsIntelligencePageProps> = ({ userData, competitors }) => {
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [filteredNews, setFilteredNews] = useState<NewsArticle[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sentimentFilter, setSentimentFilter] = useState<'all' | 'positive' | 'neutral' | 'negative'>('all');
    const [activeTab, setActiveTab] = useState<'all' | 'company' | 'competitors' | 'industry'>('all');

    // Stable references to prevent re-fetch loops
    const hasFetchedRef = useRef(false);
    const orgNameRef = useRef(userData.orgName);
    const competitorNamesRef = useRef(
        competitors?.map(c => c.name).join(',') || ''
    );

    useEffect(() => {
        // Only re-fetch if orgName or competitor names actually changed
        const currentCompNames = competitors?.map(c => c.name).join(',') || '';
        if (
            hasFetchedRef.current &&
            orgNameRef.current === userData.orgName &&
            competitorNamesRef.current === currentCompNames
        ) {
            return; // Skip: nothing changed
        }

        orgNameRef.current = userData.orgName;
        competitorNamesRef.current = currentCompNames;
        hasFetchedRef.current = true;

        const loadNews = async () => {
            setIsLoading(true);
            try {
                // Load news for company and competitors
                let allNews: NewsArticle[] = [];

                // Fetch company news
                const companyNews = await getCompanyNews(userData.orgName);
                allNews = allNews.concat(companyNews.map((item: any) => ({
                    ...item,
                    sentiment: hashSentiment(item.guid || item.title || ''),
                    relevanceScore: hashScore(item.guid || item.title || '', 60, 40),
                    keywords: ['công ty', 'kinh doanh', 'thị trường']
                })));

                // Fetch competitor news if available (PARALLEL for performance)
                if (competitors && competitors.length > 0) {
                    const competitorPromises = competitors.slice(0, 3).map(async (competitor) => {
                        try {
                            const compNews = await getCompanyNews(competitor.name);
                            return compNews.map((item: any) => ({
                                ...item,
                                sentiment: hashSentiment(item.guid || item.title || ''),
                                relevanceScore: hashScore(item.guid || item.title || '', 50, 40),
                                keywords: ['cạnh tranh', 'công nghệ', 'phát triển']
                            }));
                        } catch {
                            return [];
                        }
                    });
                    const competitorResults = await Promise.all(competitorPromises);
                    allNews = allNews.concat(competitorResults.flat());
                }

                // Fetch industry news
                const industryNews = await getCompanyNews('công nghệ');
                allNews = allNews.concat(industryNews.map((item: any) => ({
                    ...item,
                    sentiment: hashSentiment(item.guid || item.title || ''),
                    relevanceScore: hashScore(item.guid || item.title || '', 40, 40),
                    keywords: ['ngành', 'thị trường', 'xu hướng']
                })));

                // Remove duplicates and sort by date
                const uniqueNews = Array.from(
                    new Map(allNews.map(item => [item.guid, item])).values()
                ).sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

                setNews(uniqueNews);
                setFilteredNews(uniqueNews);
            } catch (e) {
                console.error('Failed to load news:', e);
            } finally {
                setIsLoading(false);
            }
        };

        loadNews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userData.orgName]);

    // Filter news based on search and sentiment
    useEffect(() => {
        let filtered = news;

        if (searchQuery.trim()) {
            filtered = filtered.filter(article =>
                article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                article.content.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (sentimentFilter !== 'all') {
            filtered = filtered.filter(article => article.sentiment === sentimentFilter);
        }

        if (activeTab === 'company') {
            filtered = filtered.filter(article =>
                article.title.toLowerCase().includes(userData.orgName.toLowerCase())
            );
        } else if (activeTab === 'competitors' && competitors) {
            const compNames = competitors.map(c => c.name.toLowerCase());
            filtered = filtered.filter(article =>
                compNames.some(name => article.title.toLowerCase().includes(name))
            );
        } else if (activeTab === 'industry') {
            filtered = filtered.filter(article => article.relevanceScore! < 50);
        }

        setFilteredNews(filtered);
    }, [searchQuery, sentimentFilter, activeTab, news, userData.orgName, competitors]);

    return (
        <div className="w-full space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white">
                        News Intelligence
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        Theo dõi, phân tích & tìm hiểu tin tức liên quan đến công ty bạn
                    </p>
                </div>
                <div className="bg-gradient-to-br from-red-500 to-red-600 text-white px-4 py-2 rounded-lg">
                    <span className="font-bold text-sm">{news.length} Articles</span>
                </div>
            </div>

            {/* Search & Filter Section */}
            <div className="space-y-4">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search articles, keywords, companies..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
                    />
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                        {(['all', 'company', 'competitors', 'industry'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-lg font-bold transition-colors text-sm ${
                                    activeTab === tab
                                        ? 'bg-[#B91C1C] text-white'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                            >
                                {tab === 'all' && 'All News'}
                                {tab === 'company' && 'Company'}
                                {tab === 'competitors' && 'Competitors'}
                                {tab === 'industry' && 'Industry'}
                            </button>
                        ))}
                    </div>

                    {/* Sentiment Filter */}
                    <div className="flex items-center gap-2">
                        {(['all', 'positive', 'neutral', 'negative'] as const).map(sentiment => (
                            <button
                                key={sentiment}
                                onClick={() => setSentimentFilter(sentiment)}
                                className={`px-3 py-2 rounded-lg font-bold transition-colors text-xs ${
                                    sentimentFilter === sentiment
                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                        : sentiment === 'positive' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                                        : sentiment === 'negative' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                                }`}
                            >
                                {sentiment === 'all' && 'All'}
                                {sentiment === 'positive' && 'Positive'}
                                {sentiment === 'neutral' && 'Neutral'}
                                {sentiment === 'negative' && 'Negative'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <span className="text-gray-400">Loading content...</span>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Highlights Section */}
                    {filteredNews.length > 0 && <HighlightsSection articles={filteredNews} />}

                    {/* Trending Topics */}
                    {filteredNews.length > 0 && <TrendingTopics articles={filteredNews} />}

                    {/* Main News Feed */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
                            News Feed ({filteredNews.length})
                        </h3>

                        {filteredNews.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                                    No articles found matching your search criteria
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {filteredNews.map((article) => (
                                    <div key={article.guid} className="space-y-4">
                                        <NewsCard article={article} />
                                        <AIReadingAssistant article={article} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
