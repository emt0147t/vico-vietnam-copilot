'use client';

/**
 * 🎨 Animation Utilities — Reusable premium animation components
 *
 * Components:
 * - FadeIn — opacity transition with optional delay
 * - SlideUp — translate + fade for list staggering
 * - ShimmerSkeleton — gradient shimmer loading placeholder
 * - CountUp — animated number counter for statistics
 * - ProgressRing — SVG circular progress indicator
 */

import React, { useState, useEffect, useRef } from 'react';

// ============================================================================
// FADE IN
// ============================================================================

interface FadeInProps {
    children: React.ReactNode;
    delay?: number;       // ms
    duration?: number;    // ms
    className?: string;
}

export const FadeIn: React.FC<FadeInProps> = ({
    children,
    delay = 0,
    duration = 400,
    className = '',
}) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setVisible(true), delay);
        return () => clearTimeout(timer);
    }, [delay]);

    return (
        <div
            className={className}
            style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'none' : 'translateY(8px)',
                transition: `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`,
            }}
        >
            {children}
        </div>
    );
};

// ============================================================================
// SLIDE UP (for staggered list items)
// ============================================================================

interface SlideUpProps {
    children: React.ReactNode;
    index?: number;       // item index for stagger calculation
    staggerMs?: number;   // ms per item
    className?: string;
}

export const SlideUp: React.FC<SlideUpProps> = ({
    children,
    index = 0,
    staggerMs = 80,
    className = '',
}) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setVisible(true), index * staggerMs + 50);
        return () => clearTimeout(timer);
    }, [index, staggerMs]);

    return (
        <div
            className={className}
            style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 350ms ease-out, transform 350ms ease-out',
            }}
        >
            {children}
        </div>
    );
};

// ============================================================================
// SHIMMER SKELETON
// ============================================================================

interface ShimmerSkeletonProps {
    width?: string;
    height?: string;
    borderRadius?: string;
    className?: string;
}

export const ShimmerSkeleton: React.FC<ShimmerSkeletonProps> = ({
    width = '100%',
    height = '20px',
    borderRadius = '8px',
    className = '',
}) => (
    <div
        className={`relative overflow-hidden ${className}`}
        style={{ width, height, borderRadius, background: 'rgba(55, 65, 81, 0.4)' }}
    >
        <div
            style={{
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '200%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent 0%, rgba(99, 102, 241, 0.08) 40%, rgba(99, 102, 241, 0.15) 50%, rgba(99, 102, 241, 0.08) 60%, transparent 100%)',
                animation: 'shimmer 1.8s ease-in-out infinite',
            }}
        />
        <style>{`
            @keyframes shimmer {
                0% { transform: translateX(0); }
                100% { transform: translateX(100%); }
            }
        `}</style>
    </div>
);

/** Card-shaped shimmer skeleton */
export const CardSkeleton: React.FC<{ rows?: number; className?: string }> = ({
    rows = 3,
    className = '',
}) => (
    <div className={`rounded-xl border border-[#E4E4E7]/30 bg-[#FAFAFA]/30 p-5 space-y-3 ${className}`}>
        <ShimmerSkeleton width="60%" height="16px" />
        <ShimmerSkeleton width="100%" height="12px" />
        {Array.from({ length: rows - 1 }, (_, i) => (
            <ShimmerSkeleton key={i} width={`${80 - i * 10}%`} height="12px" />
        ))}
    </div>
);

/** Table-shaped shimmer skeleton */
export const TableSkeleton: React.FC<{ rows?: number; cols?: number; className?: string }> = ({
    rows = 5,
    cols = 4,
    className = '',
}) => (
    <div className={`rounded-xl border border-[#E4E4E7]/30 bg-[#FAFAFA]/30 p-4 space-y-2 ${className}`}>
        {/* Header row */}
        <div className="flex gap-4 pb-2 border-b border-[#E4E4E7]/30">
            {Array.from({ length: cols }, (_, i) => (
                <ShimmerSkeleton key={`h-${i}`} width={i === 0 ? '30%' : '18%'} height="14px" />
            ))}
        </div>
        {/* Data rows */}
        {Array.from({ length: rows }, (_, r) => (
            <div key={r} className="flex gap-4 py-1">
                {Array.from({ length: cols }, (_, c) => (
                    <ShimmerSkeleton key={`r${r}-c${c}`} width={c === 0 ? '30%' : '18%'} height="12px" />
                ))}
            </div>
        ))}
    </div>
);

// ============================================================================
// COUNT UP (animated number)
// ============================================================================

interface CountUpProps {
    end: number;
    duration?: number;    // ms
    decimals?: number;
    prefix?: string;
    suffix?: string;
    className?: string;
}

export const CountUp: React.FC<CountUpProps> = ({
    end,
    duration = 1200,
    decimals = 0,
    prefix = '',
    suffix = '',
    className = '',
}) => {
    const [value, setValue] = useState(0);
    const startTime = useRef<number>(0);
    const rafId = useRef<number>(0);

    useEffect(() => {
        startTime.current = performance.now();

        const animate = (now: number) => {
            const elapsed = now - startTime.current;
            const progress = Math.min(elapsed / duration, 1);

            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(eased * end);

            if (progress < 1) {
                rafId.current = requestAnimationFrame(animate);
            }
        };

        rafId.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(rafId.current);
    }, [end, duration]);

    return (
        <span className={className}>
            {prefix}{value.toFixed(decimals)}{suffix}
        </span>
    );
};

// ============================================================================
// PROGRESS RING (SVG circular progress)
// ============================================================================

interface ProgressRingProps {
    value: number;        // 0-100
    size?: number;
    strokeWidth?: number;
    color?: string;
    bgColor?: string;
    className?: string;
    showValue?: boolean;
    label?: string;
    animated?: boolean;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
    value,
    size = 48,
    strokeWidth = 4,
    color,
    bgColor = 'rgba(55, 65, 81, 0.4)',
    className = '',
    showValue = true,
    label,
    animated = true,
}) => {
    const [displayValue, setDisplayValue] = useState(animated ? 0 : value);
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (displayValue / 100) * circumference;

    // Auto-color based on value
    const autoColor = value >= 80 ? '#22c55e' : value >= 50 ? '#f59e0b' : '#ef4444';
    const ringColor = color || autoColor;

    useEffect(() => {
        if (!animated) {
            setDisplayValue(value);
            return;
        }
        const timer = setTimeout(() => setDisplayValue(value), 100);
        return () => clearTimeout(timer);
    }, [value, animated]);

    return (
        <div className={`relative inline-flex items-center justify-center ${className}`}>
            <svg width={size} height={size} className="-rotate-90">
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={bgColor}
                    strokeWidth={strokeWidth}
                />
                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={ringColor}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    style={{
                        transition: animated ? 'stroke-dashoffset 800ms ease-out' : 'none',
                    }}
                />
            </svg>
            {showValue && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xs font-bold text-white" style={{ fontSize: size < 40 ? '9px' : '11px' }}>
                        {Math.round(displayValue)}
                    </span>
                    {label && (
                        <span className="text-[#71717A]" style={{ fontSize: '7px' }}>{label}</span>
                    )}
                </div>
            )}
        </div>
    );
};

// ============================================================================
// TIER BADGE
// ============================================================================

interface TierBadgeProps {
    tier: 'premium' | 'standard' | 'basic';
    size?: 'sm' | 'md';
}

const TIER_STYLES = {
    premium: {
        bg: 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20',
        border: 'border-amber-500/40',
        text: 'text-amber-400',
        icon: '⭐',
        label: 'Premium',
    },
    standard: {
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30',
        text: 'text-blue-400',
        icon: '●',
        label: 'Standard',
    },
    basic: {
        bg: 'bg-[#FAFAFA]/10',
        border: 'border-[#E4E4E7]/30',
        text: 'text-[#71717A]',
        icon: '○',
        label: 'Basic',
    },
};

export const TierBadge: React.FC<TierBadgeProps> = ({ tier, size = 'sm' }) => {
    const style = TIER_STYLES[tier];
    const sizeClasses = size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-1';

    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full border font-medium ${style.bg} ${style.border} ${style.text} ${sizeClasses}`}
        >
            <span style={{ fontSize: size === 'sm' ? '8px' : '10px' }}>{style.icon}</span>
            {style.label}
        </span>
    );
};

export default {
    FadeIn,
    SlideUp,
    ShimmerSkeleton,
    CardSkeleton,
    TableSkeleton,
    CountUp,
    ProgressRing,
    TierBadge,
};
