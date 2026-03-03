'use client';

/**
 * 🧠 PESTEL Analysis Component
 *
 * Visual PESTEL framework showing 6 macro-environment dimensions:
 * Political, Economic, Social, Technological, Environmental, Legal
 *
 * Features:
 * - Spider/radar chart with 6 axes
 * - Expandable cards for each dimension with evidence
 * - Trend indicators (↑ improving, → stable, ↓ declining)
 * - Data provenance badges
 */

import React, { useState, useEffect, useCallback } from 'react';
import { SlideUp, ShimmerSkeleton } from './AnimationUtils';

// ============================================================================
// TYPES (inline to avoid server import issues in client component)
// ============================================================================

type TrendDirection = 'improving' | 'stable' | 'declining';

interface PESTELFactor {
    id: string;
    dimension: string;
    title: string;
    titleVi: string;
    score: number;
    trend: TrendDirection;
    evidence: string[];
    impact: 'High' | 'Medium' | 'Low';
    dataSource: string;
}

interface PESTELDimensionSummary {
    dimension: string;
    label: string;
    labelVi: string;
    icon: string;
    overallScore: number;
    overallTrend: TrendDirection;
    factors: PESTELFactor[];
    summary: string;
}

interface PESTELReport {
    country: string;
    generatedAt: string;
    industry?: string;
    company?: string;
    dimensions: PESTELDimensionSummary[];
    overallScore: number;
    overallAssessment: string;
    dataProvenance: string[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DIMENSION_COLORS: Record<string, string> = {
    political: '#6366f1',
    economic: '#22c55e',
    social: '#f59e0b',
    technological: '#3b82f6',
    environmental: '#10b981',
    legal: '#8b5cf6',
};

const TREND_ICONS: Record<TrendDirection, { icon: string; color: string; label: string }> = {
    improving: { icon: '↑', color: '#22c55e', label: 'Improving' },
    stable: { icon: '→', color: '#f59e0b', label: 'Stable' },
    declining: { icon: '↓', color: '#ef4444', label: 'Declining' },
};

// ============================================================================
// RADAR CHART (SVG)
// ============================================================================

const PESTELRadarChart: React.FC<{ dimensions: PESTELDimensionSummary[] }> = ({ dimensions }) => {
    const size = 280;
    const center = size / 2;
    const maxRadius = 110;
    const levels = 5;

    const angleStep = (2 * Math.PI) / 6;
    const startAngle = -Math.PI / 2; // Start from top

    const getPoint = (index: number, value: number): { x: number; y: number } => {
        const angle = startAngle + index * angleStep;
        const radius = (value / 5) * maxRadius;
        return {
            x: center + radius * Math.cos(angle),
            y: center + radius * Math.sin(angle),
        };
    };

    // Data polygon
    const dataPoints = dimensions.map((d, i) => getPoint(i, d.overallScore));
    const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

    return (
        <div className="flex justify-center">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {/* Background grid */}
                {Array.from({ length: levels }, (_, level) => {
                    const levelValue = (level + 1);
                    const points = Array.from({ length: 6 }, (_, i) => {
                        const p = getPoint(i, levelValue);
                        return `${p.x},${p.y}`;
                    }).join(' ');
                    return (
                        <polygon
                            key={level}
                            points={points}
                            fill="none"
                            stroke="#374151"
                            strokeWidth="0.5"
                            opacity={0.3}
                        />
                    );
                })}

                {/* Axis lines */}
                {dimensions.map((_, i) => {
                    const end = getPoint(i, 5);
                    return (
                        <line
                            key={`axis-${i}`}
                            x1={center}
                            y1={center}
                            x2={end.x}
                            y2={end.y}
                            stroke="#374151"
                            strokeWidth="0.5"
                            opacity={0.3}
                        />
                    );
                })}

                {/* Data polygon — animated draw */}
                <path
                    d={dataPath}
                    fill="rgba(99, 102, 241, 0.15)"
                    stroke="#6366f1"
                    strokeWidth="2"
                    style={{
                        strokeDasharray: 1000,
                        strokeDashoffset: 0,
                        animation: 'pestel-draw 1.2s ease-out forwards',
                    }}
                />
                <style>{`
                    @keyframes pestel-draw {
                        from { stroke-dashoffset: 1000; opacity: 0; }
                        to { stroke-dashoffset: 0; opacity: 1; }
                    }
                `}</style>

                {/* Data points */}
                {dataPoints.map((p, i) => (
                    <circle
                        key={`point-${i}`}
                        cx={p.x}
                        cy={p.y}
                        r={4}
                        fill={dimensions[i] ? (DIMENSION_COLORS[dimensions[i].dimension] || '#6366f1') : '#6366f1'}
                        stroke="white"
                        strokeWidth="1.5"
                    />
                ))}

                {/* Labels */}
                {dimensions.map((d, i) => {
                    const labelPoint = getPoint(i, 5.8);
                    return (
                        <text
                            key={`label-${i}`}
                            x={labelPoint.x}
                            y={labelPoint.y}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="text-xs font-medium fill-gray-400"
                            style={{ fontSize: '11px' }}
                        >
                            {d.icon} {d.label}
                        </text>
                    );
                })}
            </svg>
        </div>
    );
};

// ============================================================================
// DIMENSION CARD
// ============================================================================

const DimensionCard: React.FC<{
    dimension: PESTELDimensionSummary;
    isExpanded: boolean;
    onToggle: () => void;
}> = ({ dimension, isExpanded, onToggle }) => {
    const trend = TREND_ICONS[dimension.overallTrend];
    const color = DIMENSION_COLORS[dimension.dimension] || '#6366f1';

    return (
        <div
            className="rounded-xl border border-[#E4E4E7]/50 overflow-hidden transition-all duration-300 hover:border-[#E4E4E7]/70 hover:bg-[#F4F4F5]/20"
            style={{ borderLeftColor: color, borderLeftWidth: '3px' }}
        >
            {/* Header */}
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-4 hover:bg-[#F4F4F5]/50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <span className="text-2xl">{dimension.icon}</span>
                    <div className="text-left">
                        <div className="font-semibold text-white text-sm">
                            {dimension.label}
                            <span className="ml-2 text-[#A1A1AA] font-normal text-xs">({dimension.labelVi})</span>
                        </div>
                        <div className="text-[#A1A1AA] text-xs mt-0.5">{dimension.summary}</div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Score badge */}
                    <div
                        className="px-2.5 py-1 rounded-full text-sm font-bold text-white"
                        style={{ backgroundColor: `${color}33`, color }}
                    >
                        {dimension.overallScore.toFixed(1)}/5
                    </div>

                    {/* Trend */}
                    <span
                        className="text-lg font-bold"
                        style={{ color: trend.color }}
                        title={trend.label}
                    >
                        {trend.icon}
                    </span>

                    {/* Expand arrow */}
                    <span className={`text-[#71717A] transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                        ▼
                    </span>
                </div>
            </button>

            {/* Expanded content */}
            {isExpanded && (
                <div className="px-4 pb-4 space-y-3 border-t border-[#E4E4E7]/30 pt-3">
                    {dimension.factors.map((factor) => (
                        <div key={factor.id} className="rounded-lg bg-[#F4F4F5]/30 p-3">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-[#A1A1AA]">{factor.title}</span>
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`text-xs px-1.5 py-0.5 rounded ${factor.impact === 'High' ? 'bg-red-500/20 text-red-400' :
                                            factor.impact === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                                'bg-green-500/20 text-green-400'
                                            }`}
                                    >
                                        {factor.impact}
                                    </span>
                                    <span className="text-sm font-bold" style={{ color }}>
                                        {factor.score}/5
                                    </span>
                                    <span style={{ color: TREND_ICONS[factor.trend].color }}>
                                        {TREND_ICONS[factor.trend].icon}
                                    </span>
                                </div>
                            </div>

                            {/* Evidence bullets */}
                            <ul className="space-y-1">
                                {factor.evidence.slice(0, 3).map((e, i) => (
                                    <li key={i} className="text-xs text-[#A1A1AA] flex items-start gap-1.5">
                                        <span className="text-[#71717A] mt-0.5">•</span>
                                        <span>{e}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* Data source */}
                            <div className="mt-2 text-xs text-[#71717A] flex items-center gap-1">
                                📊 {factor.dataSource}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface PESTELAnalysisProps {
    industry?: string;
    company?: string;
    compact?: boolean;
}

const PESTELAnalysis: React.FC<PESTELAnalysisProps> = ({
    industry,
    company,
    compact = false,
}) => {
    const [report, setReport] = useState<PESTELReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedDimension, setExpandedDimension] = useState<string | null>(null);

    const fetchReport = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams();
            if (industry) params.set('industry', industry);
            if (company) params.set('company', company);
            if (compact) params.set('quick', 'true');

            const response = await fetch(`/api/pestel?${params.toString()}`);
            const result = await response.json();

            if (!result.success) throw new Error(result.error);

            if (compact) {
                // Quick scores mode — build minimal report structure
                const dimensions: PESTELDimensionSummary[] = Object.entries(result.data).map(
                    ([dim, data]: [string, any]) => ({
                        dimension: dim,
                        label: dim.charAt(0).toUpperCase() + dim.slice(1),
                        labelVi: dim,
                        icon: '📊',
                        overallScore: data.score,
                        overallTrend: data.trend,
                        factors: [],
                        summary: '',
                    })
                );
                setReport({
                    country: 'Vietnam',
                    generatedAt: new Date().toISOString(),
                    industry,
                    company,
                    dimensions,
                    overallScore: dimensions.reduce((s, d) => s + d.overallScore, 0) / dimensions.length,
                    overallAssessment: '',
                    dataProvenance: [],
                });
            } else {
                setReport(result.data);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load PESTEL analysis');
        } finally {
            setLoading(false);
        }
    }, [industry, company, compact]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    if (loading) {
        return (
            <div className="rounded-2xl bg-[#FAFAFA]/50 border border-[#E4E4E7]/50 p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <ShimmerSkeleton width="40%" height="20px" />
                    <ShimmerSkeleton width="60px" height="28px" borderRadius="14px" />
                </div>
                <div className="flex justify-center py-4">
                    <ShimmerSkeleton width="200px" height="200px" borderRadius="50%" />
                </div>
                <div className="space-y-2">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <ShimmerSkeleton key={i} width="100%" height="48px" borderRadius="12px" />
                    ))}
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                    <div className="animate-spin h-4 w-4 border-2 border-[#E11D48] border-t-transparent rounded-full" />
                    <span className="text-[#A1A1AA] text-sm">Analyzing macro-environment...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-2xl bg-red-900/20 border border-red-500/30 p-6">
                <p className="text-red-400 text-sm">⚠️ {error}</p>
                <button
                    onClick={fetchReport}
                    className="mt-3 text-xs text-[#E11D48] hover:text-[#E11D48] underline"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (!report) return null;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        🧠 PESTEL Analysis
                        <span className="text-sm font-normal text-[#A1A1AA]">— Vietnam</span>
                        {industry && (
                            <span className="text-sm bg-[#E11D48]/20 text-[#E11D48] px-2 py-0.5 rounded-full">
                                {industry}
                            </span>
                        )}
                    </h3>
                    {company && (
                        <p className="text-sm text-[#A1A1AA] mt-1">Company focus: {company}</p>
                    )}
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-white">{report.overallScore.toFixed(1)}<span className="text-sm text-[#A1A1AA]">/5</span></div>
                    <div className="text-xs text-[#71717A]">Overall Score</div>
                </div>
            </div>

            {/* Radar Chart */}
            {!compact && report.dimensions.length === 6 && (
                <div className="rounded-xl bg-[#FAFAFA]/50 border border-[#E4E4E7]/30 p-4">
                    <PESTELRadarChart dimensions={report.dimensions} />
                </div>
            )}

            {/* Overall Assessment */}
            {report.overallAssessment && (
                <div className="rounded-xl bg-[#E11D48]/5 border border-[#E11D48]/20 p-4">
                    <p className="text-sm text-[#A1A1AA] leading-relaxed">{report.overallAssessment}</p>
                </div>
            )}

            {/* Dimension Cards — staggered entrance */}
            <div className="space-y-2">
                {report.dimensions.map((dim, index) => (
                    <SlideUp key={dim.dimension} index={index} staggerMs={100}>
                        <DimensionCard
                            dimension={dim}
                            isExpanded={expandedDimension === dim.dimension}
                            onToggle={() =>
                                setExpandedDimension(expandedDimension === dim.dimension ? null : dim.dimension)
                            }
                        />
                    </SlideUp>
                ))}
            </div>

            {/* Data Provenance */}
            {!compact && report.dataProvenance.length > 0 && (
                <div className="text-xs text-[#71717A] border-t border-[#E4E4E7] pt-3">
                    <span className="font-medium">Data sources:</span>{' '}
                    {report.dataProvenance.slice(0, 8).join(' • ')}
                    {report.dataProvenance.length > 8 && ` • +${report.dataProvenance.length - 8} more`}
                </div>
            )}
        </div>
    );
};

export default PESTELAnalysis;
