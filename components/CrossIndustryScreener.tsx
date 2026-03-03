/**
 * Cross-Industry Screener / Leaderboard
 *
 * Fetches /api/analytics/compare and displays all industries ranked
 * in a sortable, enterprise-grade data table with health badges,
 * concentration labels, top players, and hiring trend arrows.
 *
 * Phase 11: Analytics API & Cross-Industry Intelligence
 * Design: Executive Crimson — config/designSystem.ts
 */

'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { FadeIn, ShimmerSkeleton, TableSkeleton } from './AnimationUtils';
import { tw, iconSize } from '@/config/designSystem';
import {
  TrendUp,
  TrendDown,
  ArrowRight,
  MagnifyingGlass,
  Warning,
  ArrowClockwise,
  Buildings,
  Users,
  Trophy,
  ChartLineUp,
  Crown,
  Medal,
  CaretUpDown,
  CaretUp,
  CaretDown,
} from '@phosphor-icons/react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface IndustryRow {
  name: string;
  ranking: number;
  marketShare: number;
  totalCompanies: number;
  totalEmployees: number;
  estimatedMarketSize: string;
  dynamicScore: number;
  sentimentScore: number;
  concentrationLevel: string;
  top5Share: number;
  topPlayer: string;
  hiringTrend: 'Growing' | 'Stable' | 'Declining';
  growthPct: number;
  avgGrowthRate: number;
}

interface MarketSummary {
  totalCompanies: number;
  totalEstimatedEmployees: number;
  averageSentiment: number;
  topGrowingIndustry: string;
  mostFragmentedIndustry: string;
  largestIndustry: string;
}

type SortKey = keyof IndustryRow;
type SortDir = 'asc' | 'desc';

// ---------------------------------------------------------------------------
// Helpers (using designSystem tokens)
// ---------------------------------------------------------------------------

function healthVariant(score: number): 'growth' | 'warn' | 'decline' {
  if (score >= 70) return 'growth';
  if (score >= 40) return 'warn';
  return 'decline';
}

function healthLabel(score: number): string {
  if (score >= 70) return 'Strong';
  if (score >= 40) return 'Moderate';
  return 'Weak';
}

function trendArrow(trend: string) {
  switch (trend) {
    case 'Growing':
      return (
        <span className="inline-flex items-center gap-1 text-[#059669] font-semibold text-xs">
          <TrendUp size={iconSize.sm} weight="duotone" /> Growing
        </span>
      );
    case 'Declining':
      return (
        <span className="inline-flex items-center gap-1 text-[#BE123C] font-semibold text-xs">
          <TrendDown size={iconSize.sm} weight="duotone" /> Declining
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 text-[#71717A] font-semibold text-xs">
          <ArrowRight size={iconSize.sm} weight="duotone" /> Stable
        </span>
      );
  }
}

function concentrationVariant(level: string): 'decline' | 'warn' | 'growth' | 'neutral' {
  if (level === 'Highly Concentrated') return 'decline';
  if (level === 'Concentrated') return 'warn';
  if (level === 'Moderate') return 'warn';
  if (level === 'Highly Fragmented') return 'growth';
  return 'neutral';
}

function formatEmployees(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CrossIndustryScreener() {
  const [rows, setRows] = useState<IndustryRow[]>([]);
  const [summary, setSummary] = useState<MarketSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sort state
  const [sortKey, setSortKey] = useState<SortKey>('dynamicScore');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  // Search filter
  const [search, setSearch] = useState('');

  // -----------------------------------------------------------------------
  // Fetch
  // -----------------------------------------------------------------------
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetch('/api/analytics/compare', { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`API returned ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (!data.success) throw new Error(data.error || 'Compare API failed');

        const parsed: IndustryRow[] = Object.entries(data.industries).map(
          ([name, entry]: [string, any]) => {
            const mi = entry?.marketIndex ?? {};
            const health = mi.industryHealth ?? {};
            const concentration = mi.concentrationRatio ?? {};
            const hiring = mi.hiringTrend ?? {};
            return {
              name,
              ranking: entry.ranking ?? 0,
              marketShare: entry.marketShare ?? 0,
              totalCompanies: mi.totalCompanies ?? 0,
              totalEmployees: mi.totalEmployees ?? 0,
              estimatedMarketSize: mi.estimatedMarketSize ?? '—',
              dynamicScore: health.dynamicScore ?? 0,
              sentimentScore: health.sentimentScore ?? 0,
              concentrationLevel: concentration.marketConcentration ?? '—',
              top5Share: concentration.top5EmployeeShare ?? 0,
              topPlayer: concentration.top5Companies?.[0]?.name || '—',
              hiringTrend: hiring.trend ?? '—',
              growthPct: hiring.growthPercentage ?? 0,
              avgGrowthRate: health.avgGrowthRate ?? 0,
            };
          },
        );

        setRows(parsed);
        setSummary(data.marketSummary);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err.message);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  // -----------------------------------------------------------------------
  // Sort handler
  // -----------------------------------------------------------------------
  const toggleSort = useCallback(
    (key: SortKey) => {
      if (sortKey === key) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortKey(key);
        setSortDir(key === 'name' ? 'asc' : 'desc');
      }
    },
    [sortKey],
  );

  // -----------------------------------------------------------------------
  // Filtered + sorted rows
  // -----------------------------------------------------------------------
  const displayRows = useMemo(() => {
    let filtered = rows;
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = rows.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.topPlayer.toLowerCase().includes(q) ||
          r.concentrationLevel.toLowerCase().includes(q),
      );
    }

    return [...filtered].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'string' && typeof bv === 'string') {
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortDir === 'asc' ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
  }, [rows, search, sortKey, sortDir]);

  // -----------------------------------------------------------------------
  // Sort indicator (Phosphor icons)
  // -----------------------------------------------------------------------
  const sortIcon = (key: SortKey) => {
    if (sortKey !== key)
      return <CaretUpDown size={iconSize.xs} weight="bold" className="ml-1 text-[#A1A1AA]" />;
    return sortDir === 'asc' ? (
      <CaretUp size={iconSize.xs} weight="bold" className="ml-1 text-[#E11D48]" />
    ) : (
      <CaretDown size={iconSize.xs} weight="bold" className="ml-1 text-[#E11D48]" />
    );
  };

  // -----------------------------------------------------------------------
  // Render: Loading
  // -----------------------------------------------------------------------
  if (loading) {
    return (
      <div className="space-y-6 pb-8">
        <div className="space-y-2">
          <ShimmerSkeleton width="40%" height="28px" borderRadius="8px" />
          <ShimmerSkeleton width="60%" height="14px" />
        </div>
        <div className={`${tw.bentoGrid} grid-cols-2 md:grid-cols-4`}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`${tw.card} ${tw.cardPadding} space-y-2`}>
              <ShimmerSkeleton width="50%" height="12px" />
              <ShimmerSkeleton width="70%" height="24px" />
            </div>
          ))}
        </div>
        <TableSkeleton rows={10} cols={6} />
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // Render: Error
  // -----------------------------------------------------------------------
  if (error) {
    return (
      <div className={tw.callout('error')}>
        <Warning size={iconSize.lg} weight="duotone" className="shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-bold text-base mb-1">Unable to Load Industry Data</h3>
          <p className="text-sm opacity-80 mb-3">{error}</p>
          <button onClick={() => window.location.reload()} className={tw.btnPrimary}>
            <ArrowClockwise size={iconSize.sm} weight="bold" /> Retry
          </button>
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // Render: Main
  // -----------------------------------------------------------------------
  return (
    <FadeIn duration={400}>
      <div className="space-y-6 pb-8">
        {/* ── Page header ─────────────────────────────────────── */}
        <div>
          <h1 className={tw.h1}>Cross-Industry Screener</h1>
          <p className={`${tw.body} mt-1`}>
            All industries ranked by VICO Market Index — sortable, searchable leaderboard
          </p>
        </div>

        {/* ── Summary Bento Cards ─────────────────────────────── */}
        {summary && (
          <div className={`${tw.bentoGrid} grid-cols-2 lg:grid-cols-4`}>
            <SummaryCard
              icon={<Buildings size={iconSize.md} weight="duotone" />}
              label="Total Companies"
              value={summary.totalCompanies.toLocaleString()}
              sub="across all industries"
            />
            <SummaryCard
              icon={<Users size={iconSize.md} weight="duotone" />}
              label="Est. Total Workforce"
              value={formatEmployees(summary.totalEstimatedEmployees)}
              sub="employees tracked"
            />
            <SummaryCard
              icon={<ChartLineUp size={iconSize.md} weight="duotone" />}
              label="Top Growing"
              value={summary.topGrowingIndustry}
              sub="highest growth rate"
            />
            <SummaryCard
              icon={<Trophy size={iconSize.md} weight="duotone" />}
              label="Avg Sentiment"
              value={`${summary.averageSentiment.toFixed(0)}/100`}
              sub="market-wide score"
            />
          </div>
        )}

        {/* ── Search Bar ──────────────────────────────────────── */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              placeholder="Search industry, company, or structure…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`${tw.input} pl-10`}
            />
            <MagnifyingGlass
              size={iconSize.sm}
              weight="duotone"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA]"
            />
          </div>
          <span className={tw.label}>{displayRows.length} industries</span>
        </div>

        {/* ── Data Table ──────────────────────────────────────── */}
        <div className={`${tw.card} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E4E4E7]">
                  <SortableHeader label="#" sortKey="ranking" current={sortKey} dir={sortDir} onClick={toggleSort} icon={sortIcon} />
                  <SortableHeader label="Industry" sortKey="name" current={sortKey} dir={sortDir} onClick={toggleSort} icon={sortIcon} wide />
                  <SortableHeader label="Health Score" sortKey="dynamicScore" current={sortKey} dir={sortDir} onClick={toggleSort} icon={sortIcon} />
                  <SortableHeader label="Concentration" sortKey="concentrationLevel" current={sortKey} dir={sortDir} onClick={toggleSort} icon={sortIcon} />
                  <SortableHeader label="Top Player" sortKey="topPlayer" current={sortKey} dir={sortDir} onClick={toggleSort} icon={sortIcon} />
                  <SortableHeader label="Hiring Trend" sortKey="hiringTrend" current={sortKey} dir={sortDir} onClick={toggleSort} icon={sortIcon} />
                  <SortableHeader label="Companies" sortKey="totalCompanies" current={sortKey} dir={sortDir} onClick={toggleSort} icon={sortIcon} />
                  <SortableHeader label="Market Share" sortKey="marketShare" current={sortKey} dir={sortDir} onClick={toggleSort} icon={sortIcon} />
                  <SortableHeader label="Est. Size" sortKey="estimatedMarketSize" current={sortKey} dir={sortDir} onClick={toggleSort} icon={sortIcon} />
                </tr>
              </thead>
              <tbody>
                {displayRows.map((row) => {
                  const hVariant = healthVariant(row.dynamicScore);
                  const cVariant = concentrationVariant(row.concentrationLevel);
                  return (
                    <tr
                      key={row.name}
                      className="border-b border-[#E4E4E7]/50 last:border-0 transition-colors hover:bg-[#FFF1F2]/40"
                    >
                      {/* Rank */}
                      <td className={`${tw.td} text-center`}>
                        <RankBadge rank={row.ranking} />
                      </td>

                      {/* Industry Name */}
                      <td className={`${tw.td} font-semibold text-[#18181B] whitespace-nowrap`}>
                        {row.name}
                      </td>

                      {/* Health Score — token badge */}
                      <td className={tw.td}>
                        <div className="flex items-center gap-2">
                          <span className={tw.badge(hVariant)}>
                            {row.dynamicScore.toFixed(0)}
                          </span>
                          <span className="text-xs text-[#A1A1AA]">{healthLabel(row.dynamicScore)}</span>
                        </div>
                      </td>

                      {/* Concentration — token badge */}
                      <td className={tw.td}>
                        <span className={`${tw.badge(cVariant)} whitespace-nowrap`}>
                          {row.concentrationLevel}
                        </span>
                      </td>

                      {/* Top Player */}
                      <td className={`${tw.td} whitespace-nowrap max-w-[180px] truncate`} title={row.topPlayer}>
                        {row.topPlayer}
                      </td>

                      {/* Hiring Trend */}
                      <td className={`${tw.td} whitespace-nowrap`}>
                        {trendArrow(row.hiringTrend)}
                      </td>

                      {/* Companies count */}
                      <td className={`${tw.td} text-center font-mono`}>
                        {row.totalCompanies}
                      </td>

                      {/* Market share — crimson gradient bar */}
                      <td className={tw.td}>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 max-w-[80px] bg-[#E4E4E7] rounded-full h-1.5 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#E11D48] to-[#F97316] rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(100, row.marketShare * 3)}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-[#18181B]">
                            {row.marketShare.toFixed(1)}%
                          </span>
                        </div>
                      </td>

                      {/* Estimated size */}
                      <td className={`${tw.td} font-mono whitespace-nowrap`}>
                        {row.estimatedMarketSize}
                      </td>
                    </tr>
                  );
                })}

                {displayRows.length === 0 && (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-[#A1A1AA]">
                      No industries match <strong className="text-[#18181B]">"{search}"</strong>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Footer ──────────────────────────────────────────── */}
        <p className="text-xs text-[#A1A1AA] text-center">
          Data sourced from VICO database ({rows.length} industries) · Dynamic Score = 40% Growth + 60% Sentiment
        </p>
      </div>
    </FadeIn>
  );
}

// ===========================================================================
// Sub-components
// ===========================================================================

/** Summary metric Bento card — uses designSystem tokens */
function SummaryCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className={`${tw.card} ${tw.cardPadding} group`}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-[#FFF1F2] flex items-center justify-center text-[#E11D48]">
          {icon}
        </div>
        <span className={tw.label}>{label}</span>
      </div>
      <p className={`${tw.metric} text-[#18181B]`}>{value}</p>
      <p className="text-xs text-[#A1A1AA] mt-0.5">{sub}</p>
    </div>
  );
}

/** Rank badge with medal coloring for top 3 */
function RankBadge({ rank }: { rank: number }) {
  if (rank === 1)
    return (
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#FEF3C7] text-[#D97706]">
        <Crown size={iconSize.sm} weight="fill" />
      </span>
    );
  if (rank === 2)
    return (
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#F5F5F4] text-[#71717A]">
        <Medal size={iconSize.sm} weight="duotone" />
      </span>
    );
  if (rank === 3)
    return (
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#FFEDD5] text-[#F97316]">
        <Medal size={iconSize.sm} weight="duotone" />
      </span>
    );

  return (
    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#FAFAFA] text-[#A1A1AA] text-xs font-bold">
      {rank}
    </span>
  );
}

/** Sortable table header cell — designSystem th styling */
function SortableHeader({
  label,
  sortKey: key,
  onClick,
  icon,
  wide,
}: {
  label: string;
  sortKey: SortKey;
  current: SortKey;
  dir: SortDir;
  onClick: (key: SortKey) => void;
  icon: (key: SortKey) => React.ReactNode;
  wide?: boolean;
}) {
  return (
    <th
      className={`${tw.th} cursor-pointer select-none hover:text-[#E11D48] transition-colors ${wide ? 'min-w-[160px]' : ''}`}
      onClick={() => onClick(key)}
    >
      <span className="inline-flex items-center">
        {label}
        {icon(key)}
      </span>
    </th>
  );
}
