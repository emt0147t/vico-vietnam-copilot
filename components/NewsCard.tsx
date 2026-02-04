/**
 * 📰 Enterprise News Card Component
 * Premium news visualization with sentiment indicators
 * 
 * Features:
 * - Sentiment color coding
 * - Source attribution
 * - Time-relative formatting
 * - Skeleton loading states
 * - Hover animations
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Newspaper, ExternalLink, Clock, Tag, TrendingUp,
    TrendingDown, Minus, Bookmark, Share2, Building2
} from 'lucide-react';
import { Skeleton } from './DashboardLayout';

// ============================================================================
// TYPES
// ============================================================================

export interface NewsCardData {
    id: string;
    title: string;
    summary?: string;
    url: string;
    sourceName?: string;
    publishedAt?: Date | string;
    sentiment?: 'Positive' | 'Neutral' | 'Negative' | null;
    category?: string;
    imageUrl?: string;
    companyName?: string;
    companyId?: string;
}

interface NewsCardProps {
    news?: NewsCardData;
    isLoading?: boolean;
    onClick?: (news: NewsCardData) => void;
    variant?: 'default' | 'compact' | 'featured';
    showCompany?: boolean;
}

// ============================================================================
// SKELETON COMPONENT
// ============================================================================

export const NewsCardSkeleton = ({ variant = 'default' }: { variant?: 'default' | 'compact' | 'featured' }) => {
    if (variant === 'compact') {
        return (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 flex items-start gap-3">
                <Skeleton className="w-1 h-12 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
            </div>
        );
    }

    if (variant === 'featured') {
        return (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                <Skeleton className="h-48 w-full rounded-none" />
                <div className="p-6 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <div className="flex gap-2 pt-2">
                        <Skeleton className="h-6 w-20 rounded-full" />
                        <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 space-y-3">
            <div className="flex items-center gap-3">
                <Skeleton className="w-3 h-3 rounded-full" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
        </div>
    );
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const formatTimeAgo = (date?: Date | string): string => {
    if (!date) return '';
    
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getSentimentConfig = (sentiment?: 'Positive' | 'Neutral' | 'Negative' | null) => {
    const configs = {
        Positive: {
            bg: 'bg-emerald-500',
            lightBg: 'bg-emerald-100 dark:bg-emerald-900/30',
            text: 'text-emerald-700 dark:text-emerald-400',
            icon: TrendingUp,
            label: 'Positive'
        },
        Negative: {
            bg: 'bg-red-500',
            lightBg: 'bg-red-100 dark:bg-red-900/30',
            text: 'text-red-700 dark:text-red-400',
            icon: TrendingDown,
            label: 'Negative'
        },
        Neutral: {
            bg: 'bg-gray-400',
            lightBg: 'bg-gray-100 dark:bg-gray-800',
            text: 'text-gray-600 dark:text-gray-400',
            icon: Minus,
            label: 'Neutral'
        }
    };
    
    return configs[sentiment || 'Neutral'];
};

// ============================================================================
// MAIN NEWS CARD COMPONENT
// ============================================================================

export const NewsCard = ({
    news,
    isLoading = false,
    onClick,
    variant = 'default',
    showCompany = false
}: NewsCardProps) => {
    const [isHovered, setIsHovered] = useState(false);

    if (isLoading || !news) {
        return <NewsCardSkeleton variant={variant} />;
    }

    const sentimentConfig = getSentimentConfig(news.sentiment);
    const SentimentIcon = sentimentConfig.icon;

    // Compact variant
    if (variant === 'compact') {
        return (
            <motion.div
                whileHover={{ scale: 1.01 }}
                onClick={() => onClick?.(news)}
                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 flex items-start gap-3 cursor-pointer hover:border-gray-200 dark:hover:border-gray-700 transition-all"
            >
                <div className={`w-1 h-12 ${sentimentConfig.bg} rounded-full flex-shrink-0`} />
                <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-gray-900 dark:text-white line-clamp-2">{news.title}</h4>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <span>{news.sourceName}</span>
                        <span>•</span>
                        <span>{formatTimeAgo(news.publishedAt)}</span>
                    </div>
                </div>
            </motion.div>
        );
    }

    // Featured variant
    if (variant === 'featured') {
        return (
            <motion.div
                whileHover={{ scale: 1.01, y: -4 }}
                onClick={() => onClick?.(news)}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300"
            >
                {/* Image */}
                {news.imageUrl ? (
                    <div className="relative h-48 overflow-hidden">
                        <img 
                            src={news.imageUrl} 
                            alt={news.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 ${sentimentConfig.lightBg} ${sentimentConfig.text} text-xs font-semibold rounded-full`}>
                                <SentimentIcon className="w-3 h-3" />
                                {sentimentConfig.label}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className={`h-48 ${sentimentConfig.lightBg} flex items-center justify-center`}>
                        <Newspaper className={`w-12 h-12 ${sentimentConfig.text} opacity-50`} />
                    </div>
                )}

                {/* Content */}
                <div className="p-6">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-2 mb-2">
                        {news.title}
                    </h3>
                    {news.summary && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                            {news.summary}
                        </p>
                    )}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span>{formatTimeAgo(news.publishedAt)}</span>
                            {news.sourceName && (
                                <>
                                    <span>•</span>
                                    <span>{news.sourceName}</span>
                                </>
                            )}
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                    </div>
                </div>
            </motion.div>
        );
    }

    // Default variant
    return (
        <motion.div
            layout
            whileHover={{ scale: 1.01 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            onClick={() => onClick?.(news)}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 cursor-pointer hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-md transition-all duration-200"
        >
            {/* Header */}
            <div className="flex items-center gap-3 mb-3">
                <div className={`w-3 h-3 ${sentimentConfig.bg} rounded-full flex-shrink-0`} />
                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    {news.sourceName || 'Unknown Source'}
                </span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 ${sentimentConfig.lightBg} ${sentimentConfig.text} text-xs font-semibold rounded-full`}>
                    <SentimentIcon className="w-3 h-3" />
                    {sentimentConfig.label}
                </span>
            </div>

            {/* Title */}
            <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2">
                {news.title}
            </h3>

            {/* Summary */}
            {news.summary && (
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                    {news.summary}
                </p>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatTimeAgo(news.publishedAt)}
                    </span>
                    {news.category && (
                        <span className="flex items-center gap-1">
                            <Tag className="w-3.5 h-3.5" />
                            {news.category}
                        </span>
                    )}
                    {showCompany && news.companyName && (
                        <span className="flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5" />
                            {news.companyName}
                        </span>
                    )}
                </div>

                <AnimatePresence>
                    {isHovered && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex items-center gap-1"
                        >
                            <button 
                                onClick={(e) => { e.stopPropagation(); }}
                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                <Bookmark className="w-4 h-4 text-gray-400" />
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); }}
                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                <Share2 className="w-4 h-4 text-gray-400" />
                            </button>
                            <ExternalLink className="w-4 h-4 text-gray-400 ml-1" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

// ============================================================================
// NEWS FEED COMPONENT
// ============================================================================

interface NewsFeedProps {
    news?: NewsCardData[];
    isLoading?: boolean;
    error?: string;
    onRetry?: () => void;
    onNewsClick?: (news: NewsCardData) => void;
    variant?: 'default' | 'compact' | 'featured';
    showCompany?: boolean;
    emptyMessage?: string;
    title?: string;
}

export const NewsFeed = ({
    news = [],
    isLoading = false,
    error,
    onRetry,
    onNewsClick,
    variant = 'default',
    showCompany = false,
    emptyMessage = 'No news articles found',
    title
}: NewsFeedProps) => {
    // Error state
    if (error) {
        return (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 p-6 text-center">
                <p className="text-red-700 dark:text-red-400 font-medium mb-3">{error}</p>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                        Retry
                    </button>
                )}
            </div>
        );
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="space-y-4">
                {title && (
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-8 w-24 rounded-lg" />
                    </div>
                )}
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i}>
                        <NewsCardSkeleton variant={variant} />
                    </div>
                ))}
            </div>
        );
    }

    // Empty state
    if (news.length === 0) {
        return (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
                <Newspaper className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {title && (
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">{title}</h3>
                    <span className="text-sm text-gray-500">{news.length} articles</span>
                </div>
            )}
            
            {variant === 'featured' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {news.map((item) => (
                        <div key={item.id}>
                            <NewsCard
                                news={item}
                                onClick={onNewsClick}
                                variant={variant}
                                showCompany={showCompany}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-3">
                    {news.map((item) => (
                        <div key={item.id}>
                            <NewsCard
                                news={item}
                                onClick={onNewsClick}
                                variant={variant}
                                showCompany={showCompany}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NewsCard;
