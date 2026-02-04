/**
 * 🏢 Enterprise Company Card Component
 * Premium data visualization with skeleton states
 * 
 * Features:
 * - Real-time sentiment indicators
 * - News count badges
 * - Headline snapshot preview
 * - Hover animations
 * - Skeleton loading state
 * - Responsive design
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Building2, TrendingUp, TrendingDown, Minus,
    Newspaper, Calendar, MapPin, Users, ExternalLink,
    ChevronRight, Sparkles, AlertCircle, RefreshCw
} from 'lucide-react';
import { Skeleton } from './DashboardLayout';

// ============================================================================
// TYPES
// ============================================================================

export interface CompanyCardData {
    id: string;
    name: string;
    englishName?: string;
    ticker?: string;
    industry?: string;
    address?: string;
    yearFounded?: number;
    employeeSize?: string;
    revenue?: string;
    growthRate?: number;
    products?: string;
    customers?: string;
    intro?: string;
    
    // Denormalized fields from Prisma schema
    latestNewsSentiment?: 'Positive' | 'Neutral' | 'Negative' | null;
    newsCount?: number;
    headlineSnapshot?: string[];
    latestNewsAt?: Date | string;
    marketShare?: number;
}

interface CompanyCardProps {
    company?: CompanyCardData;
    isLoading?: boolean;
    onClick?: (company: CompanyCardData) => void;
    variant?: 'default' | 'compact' | 'expanded';
    showNews?: boolean;
    showActions?: boolean;
}

interface ErrorStateProps {
    message?: string;
    onRetry?: () => void;
}

// ============================================================================
// SKELETON COMPONENT
// ============================================================================

export const CompanyCardSkeleton = ({ variant = 'default' }: { variant?: 'default' | 'compact' | 'expanded' }) => {
    if (variant === 'compact') {
        return (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 flex items-center gap-4">
                <Skeleton variant="circle" className="w-10 h-10 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-4">
            <div className="flex items-start gap-4">
                <Skeleton variant="circle" className="w-14 h-14 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <div className="flex gap-2 mt-2">
                        <Skeleton className="h-5 w-16 rounded-full" />
                        <Skeleton className="h-5 w-20 rounded-full" />
                    </div>
                </div>
            </div>
            {variant === 'expanded' && (
                <>
                    <Skeleton className="h-16 w-full" />
                    <div className="grid grid-cols-3 gap-4">
                        <Skeleton className="h-16 rounded-xl" />
                        <Skeleton className="h-16 rounded-xl" />
                        <Skeleton className="h-16 rounded-xl" />
                    </div>
                </>
            )}
            <div className="flex gap-2">
                <Skeleton className="h-8 flex-1 rounded-lg" />
                <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
        </div>
    );
};

// ============================================================================
// ERROR STATE COMPONENT
// ============================================================================

export const ErrorState = ({ message = 'Failed to load data', onRetry }: ErrorStateProps) => (
    <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800 p-6 flex flex-col items-center justify-center text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-red-500" />
        <p className="text-red-700 dark:text-red-400 font-medium">{message}</p>
        {onRetry && (
            <button
                onClick={onRetry}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
                <RefreshCw className="w-4 h-4" />
                Retry
            </button>
        )}
    </div>
);

// ============================================================================
// SENTIMENT BADGE COMPONENT
// ============================================================================

const SentimentBadge = ({ sentiment }: { sentiment?: 'Positive' | 'Neutral' | 'Negative' | null }) => {
    const config = {
        Positive: {
            bg: 'bg-emerald-100 dark:bg-emerald-900/30',
            text: 'text-emerald-700 dark:text-emerald-400',
            icon: TrendingUp,
            label: 'Bullish'
        },
        Negative: {
            bg: 'bg-red-100 dark:bg-red-900/30',
            text: 'text-red-700 dark:text-red-400',
            icon: TrendingDown,
            label: 'Bearish'
        },
        Neutral: {
            bg: 'bg-gray-100 dark:bg-gray-800',
            text: 'text-gray-600 dark:text-gray-400',
            icon: Minus,
            label: 'Neutral'
        }
    };

    const current = config[sentiment || 'Neutral'];
    const Icon = current.icon;

    return (
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${current.bg} ${current.text}`}>
            <Icon className="w-3 h-3" />
            {current.label}
        </div>
    );
};

// ============================================================================
// MAIN COMPANY CARD COMPONENT
// ============================================================================

export const CompanyCard = ({
    company,
    isLoading = false,
    onClick,
    variant = 'default',
    showNews = true,
    showActions = true
}: CompanyCardProps) => {
    const [isHovered, setIsHovered] = useState(false);

    // Loading state
    if (isLoading || !company) {
        return <CompanyCardSkeleton variant={variant} />;
    }

    // Format date helper
    const formatDate = (date?: Date | string) => {
        if (!date) return null;
        const d = typeof date === 'string' ? new Date(date) : date;
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    // Compact variant
    if (variant === 'compact') {
        return (
            <motion.div
                whileHover={{ scale: 1.01 }}
                onClick={() => onClick?.(company)}
                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 flex items-center gap-4 cursor-pointer hover:border-red-200 dark:hover:border-red-900 hover:shadow-md transition-all"
            >
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">
                    {company.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">{company.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {company.industry} {company.ticker && `· ${company.ticker}`}
                    </p>
                </div>
                <SentimentBadge sentiment={company.latestNewsSentiment} />
                <ChevronRight className="w-4 h-4 text-gray-400" />
            </motion.div>
        );
    }

    return (
        <motion.div
            layout
            whileHover={{ scale: 1.01, y: -2 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            onClick={() => onClick?.(company)}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden cursor-pointer hover:border-red-200 dark:hover:border-red-900 hover:shadow-xl transition-all duration-300"
        >
            {/* Header */}
            <div className="p-6 pb-4">
                <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg flex-shrink-0">
                        {company.name.charAt(0).toUpperCase()}
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate">{company.name}</h3>
                            {company.ticker && (
                                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold rounded">
                                    {company.ticker}
                                </span>
                            )}
                        </div>
                        {company.englishName && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{company.englishName}</p>
                        )}
                        
                        {/* Tags */}
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                            {company.industry && (
                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-medium rounded-lg">
                                    {company.industry}
                                </span>
                            )}
                            <SentimentBadge sentiment={company.latestNewsSentiment} />
                            {company.newsCount !== undefined && company.newsCount > 0 && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-medium rounded-lg">
                                    <Newspaper className="w-3 h-3" />
                                    {company.newsCount} articles
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Description */}
            {company.intro && (
                <div className="px-6 pb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {company.intro}
                    </p>
                </div>
            )}

            {/* Headlines Preview */}
            {showNews && company.headlineSnapshot && company.headlineSnapshot.length > 0 && (
                <div className="px-6 pb-4">
                    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl space-y-2">
                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            <Sparkles className="w-3 h-3" />
                            Latest Headlines
                        </div>
                        {company.headlineSnapshot.slice(0, 2).map((headline, i) => (
                            <p key={i} className="text-sm text-gray-700 dark:text-gray-300 line-clamp-1">
                                • {headline}
                            </p>
                        ))}
                    </div>
                </div>
            )}

            {/* Stats Row */}
            {variant === 'expanded' && (
                <div className="px-6 pb-4 grid grid-cols-3 gap-3">
                    {company.yearFounded && (
                        <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-center">
                            <Calendar className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                            <p className="text-xs text-gray-500">Founded</p>
                            <p className="font-bold text-gray-900 dark:text-white">{company.yearFounded}</p>
                        </div>
                    )}
                    {company.employeeSize && (
                        <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-center">
                            <Users className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                            <p className="text-xs text-gray-500">Employees</p>
                            <p className="font-bold text-gray-900 dark:text-white">{company.employeeSize}</p>
                        </div>
                    )}
                    {company.revenue && (
                        <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-center">
                            <TrendingUp className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                            <p className="text-xs text-gray-500">Revenue</p>
                            <p className="font-bold text-gray-900 dark:text-white">{company.revenue}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                    {company.address && (
                        <span className="flex items-center gap-1 truncate max-w-[200px]">
                            <MapPin className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{company.address}</span>
                        </span>
                    )}
                </div>
                
                {showActions && (
                    <AnimatePresence>
                        {isHovered && (
                            <motion.div
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="flex items-center gap-1 text-red-600 dark:text-red-400 font-semibold text-sm"
                            >
                                View Details
                                <ChevronRight className="w-4 h-4" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </div>
        </motion.div>
    );
};

// ============================================================================
// COMPANY GRID COMPONENT
// ============================================================================

interface CompanyGridProps {
    companies?: CompanyCardData[];
    isLoading?: boolean;
    error?: string;
    onRetry?: () => void;
    onCompanyClick?: (company: CompanyCardData) => void;
    variant?: 'default' | 'compact' | 'expanded';
    columns?: 1 | 2 | 3;
    emptyMessage?: string;
}

export const CompanyGrid = ({
    companies = [],
    isLoading = false,
    error,
    onRetry,
    onCompanyClick,
    variant = 'default',
    columns = 2,
    emptyMessage = 'No companies found'
}: CompanyGridProps) => {
    // Error state
    if (error) {
        return <ErrorState message={error} onRetry={onRetry} />;
    }

    // Loading state
    if (isLoading) {
        return (
            <div className={`grid gap-4 ${
                columns === 1 ? 'grid-cols-1' :
                columns === 2 ? 'grid-cols-1 md:grid-cols-2' :
                'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            }`}>
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i}>
                        <CompanyCardSkeleton variant={variant} />
                    </div>
                ))}
            </div>
        );
    }

    // Empty state
    if (companies.length === 0) {
        return (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 p-12 flex flex-col items-center justify-center text-center">
                <Building2 className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">{emptyMessage}</p>
            </div>
        );
    }

    // Grid
    return (
        <div className={`grid gap-4 ${
            columns === 1 ? 'grid-cols-1' :
            columns === 2 ? 'grid-cols-1 md:grid-cols-2' :
            'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }`}>
            {companies.map((company) => (
                <div key={company.id}>
                    <CompanyCard
                        company={company}
                        onClick={onCompanyClick}
                        variant={variant}
                    />
                </div>
            ))}
        </div>
    );
};

export default CompanyCard;
