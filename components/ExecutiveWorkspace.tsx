/**
 * 📂 Executive Workspace — Phase 14, Step 3
 *
 * Centralized hub for all saved intelligence: ICPs, Playbooks, PESTELs,
 * Market Reports, Competitor Analyses, and GTM Strategies.
 *
 * Consumes:
 *   GET  /api/workspace/stats
 *   GET  /api/workspace/documents(?type=...)
 *   DELETE /api/workspace/documents/:id
 *
 * Design: Executive Crimson — config/designSystem.ts
 */

import React, { useState, useEffect, useCallback } from 'react';
import { tw, iconSize } from '@/config/designSystem';
import { FadeIn, ShimmerSkeleton } from './AnimationUtils';
import {
  Trash,
  Eye,
  CalendarBlank,
  Tag,
  Cube,
  Scroll,
  ClipboardText,
  ChartPie,
  Crosshair,
  Target,
  Sparkle,
  Lightning,
  Buildings,
  Warning,
  ArrowClockwise,
  Archive,
  FolderSimple,
  MagnifyingGlass,
} from '@phosphor-icons/react';

// ============================================================================
// TYPES (mirrors lightweight server shapes)
// ============================================================================

type DocumentType =
  | 'ICP'
  | 'PLAYBOOK'
  | 'PESTEL'
  | 'MARKET_REPORT'
  | 'COMPETITOR_ANALYSIS'
  | 'GTM_STRATEGY';

interface DocumentListItem {
  id: string;
  type: DocumentType;
  title: string;
  industry: string;
  companyName: string;
  createdAt: string;
  updatedAt: string;
  dataSource: 'ai_generated' | 'template' | 'manual';
  tags: string[];
  archived: boolean;
}

interface StatItem {
  type: DocumentType;
  count: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/** Filter tabs — "ALL" plus each document type */
const FILTER_TABS: Array<{ key: DocumentType | 'ALL'; label: string }> = [
  { key: 'ALL',                  label: 'All' },
  { key: 'ICP',                  label: 'ICP Profiles' },
  { key: 'PLAYBOOK',            label: 'Playbooks' },
  { key: 'PESTEL',              label: 'PESTEL' },
  { key: 'MARKET_REPORT',       label: 'Market Reports' },
  { key: 'COMPETITOR_ANALYSIS', label: 'Competitor' },
  { key: 'GTM_STRATEGY',        label: 'GTM Strategy' },
];

/** Icon + badge variant per document type */
const TYPE_META: Record<DocumentType, {
  icon: React.ReactNode;
  badge: 'brand' | 'ai' | 'growth' | 'warn' | 'neutral' | 'decline';
  label: string;
}> = {
  ICP:                  { icon: <Crosshair   size={iconSize.sm} weight="duotone" />, badge: 'brand',   label: 'ICP' },
  PLAYBOOK:             { icon: <ClipboardText size={iconSize.sm} weight="duotone" />, badge: 'ai',      label: 'Playbook' },
  PESTEL:               { icon: <ChartPie    size={iconSize.sm} weight="duotone" />, badge: 'warn',    label: 'PESTEL' },
  MARKET_REPORT:        { icon: <Scroll      size={iconSize.sm} weight="duotone" />, badge: 'growth',  label: 'Market Report' },
  COMPETITOR_ANALYSIS:  { icon: <Target      size={iconSize.sm} weight="duotone" />, badge: 'neutral', label: 'Competitor' },
  GTM_STRATEGY:         { icon: <Lightning   size={iconSize.sm} weight="duotone" />, badge: 'ai',      label: 'GTM Strategy' },
};

/** Stat card icon per document type */
const STAT_ICONS: Record<string, React.ReactNode> = {
  ICP:                  <Crosshair    size={iconSize.md} weight="duotone" />,
  PLAYBOOK:             <ClipboardText size={iconSize.md} weight="duotone" />,
  PESTEL:               <ChartPie     size={iconSize.md} weight="duotone" />,
  MARKET_REPORT:        <Scroll       size={iconSize.md} weight="duotone" />,
  COMPETITOR_ANALYSIS:  <Target       size={iconSize.md} weight="duotone" />,
  GTM_STRATEGY:         <Lightning    size={iconSize.md} weight="duotone" />,
};

// ============================================================================
// HELPERS
// ============================================================================

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(iso);
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface ExecutiveWorkspaceProps {
  /** Optional callback to navigate to ICP Builder tab */
  onNavigateToICP?: () => void;
  /** Optional callback to navigate to Playbook Builder tab */
  onNavigateToPlaybook?: () => void;
}

export default function ExecutiveWorkspace({ onNavigateToICP, onNavigateToPlaybook }: ExecutiveWorkspaceProps) {
  const [documents, setDocuments] = useState<DocumentListItem[]>([]);
  const [stats, setStats] = useState<StatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter / search state
  const [activeFilter, setActiveFilter] = useState<DocumentType | 'ALL'>('ALL');
  const [search, setSearch] = useState('');

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // View modal
  const [viewDoc, setViewDoc] = useState<any | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

  // User-visible action error (delete / view failures)
  const [actionError, setActionError] = useState<string | null>(null);

  // -----------------------------------------------------------------------
  // Fetch data
  // -----------------------------------------------------------------------
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [docsRes, statsRes] = await Promise.all([
        fetch('/api/workspace/documents'),
        fetch('/api/workspace/stats'),
      ]);

      if (!docsRes.ok) throw new Error(`Documents API returned ${docsRes.status}`);
      if (!statsRes.ok) throw new Error(`Stats API returned ${statsRes.status}`);

      const docsData = await docsRes.json();
      const statsData = await statsRes.json();

      setDocuments(docsData.documents ?? []);
      setStats(statsData.stats ?? []);
    } catch (err: any) {
      setError(err.message || 'Failed to load workspace data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // -----------------------------------------------------------------------
  // Delete document
  // -----------------------------------------------------------------------
  const handleDelete = useCallback(async (id: string) => {
    setDeleting(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/workspace/documents/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');

      // Remove from local state immediately
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      // Refresh stats
      const statsRes = await fetch('/api/workspace/stats');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats ?? []);
      }
    } catch (err: any) {
      console.error('Delete error:', err);
      setActionError('Failed to delete document — please try again');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }, []);

  // -----------------------------------------------------------------------
  // View document (fetch full content)
  // -----------------------------------------------------------------------
  const handleView = useCallback(async (id: string) => {
    setViewLoading(true);
    setViewDoc(null);
    setActionError(null);
    try {
      const res = await fetch(`/api/workspace/documents/${id}`);
      if (!res.ok) throw new Error('Fetch failed');
      const data = await res.json();
      setViewDoc(data.document ?? null);
    } catch (err: any) {
      console.error('View error:', err);
      setActionError('Failed to load document — please try again');
      setViewLoading(false);
    } finally {
      setViewLoading(false);
    }
  }, []);

  // -----------------------------------------------------------------------
  // Filtered documents
  // -----------------------------------------------------------------------
  const filteredDocs = documents.filter((d) => {
    if (activeFilter !== 'ALL' && d.type !== activeFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        d.title.toLowerCase().includes(q) ||
        d.industry.toLowerCase().includes(q) ||
        d.companyName.toLowerCase().includes(q) ||
        d.type.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Total documents count
  const totalCount = stats.reduce((s, item) => s + item.count, 0);

  // -----------------------------------------------------------------------
  // RENDER: Loading
  // -----------------------------------------------------------------------
  if (loading) {
    return (
      <div className="space-y-6 pb-8">
        <div className="space-y-2">
          <ShimmerSkeleton width="35%" height="32px" borderRadius="8px" />
          <ShimmerSkeleton width="55%" height="14px" />
        </div>
        <div className={`${tw.bentoGrid} grid-cols-2 md:grid-cols-4`}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`${tw.card} ${tw.cardPadding} space-y-2`}>
              <ShimmerSkeleton width="50%" height="12px" />
              <ShimmerSkeleton width="40%" height="28px" />
            </div>
          ))}
        </div>
        <div className={`${tw.card} p-6 space-y-4`}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <ShimmerSkeleton width="40px" height="40px" borderRadius="10px" />
              <div className="flex-1 space-y-1.5">
                <ShimmerSkeleton width="60%" height="14px" />
                <ShimmerSkeleton width="30%" height="10px" />
              </div>
              <ShimmerSkeleton width="80px" height="24px" borderRadius="12px" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // RENDER: Error
  // -----------------------------------------------------------------------
  if (error) {
    return (
      <div className={tw.callout('error')}>
        <Warning size={iconSize.lg} weight="duotone" className="shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-bold text-base mb-1">Unable to Load Workspace</h3>
          <p className="text-sm opacity-80 mb-3">{error}</p>
          <button onClick={fetchData} className={tw.btnPrimary}>
            <ArrowClockwise size={iconSize.sm} weight="bold" /> Retry
          </button>
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // RENDER: Main
  // -----------------------------------------------------------------------
  return (
    <FadeIn duration={400}>
      <div className="space-y-6 pb-10">
        {/* ─── Page Header ──────────────────────────────────── */}
        <div>
          <h1 className={tw.h1}>
            <span className={tw.aiGradientText}>Executive Workspace</span>
          </h1>
          <p className={`${tw.body} mt-1.5`}>
            Your saved intelligence vault — ICPs, Playbooks, Market Reports & more
          </p>
        </div>

        {/* ─── Stats Bento Row ──────────────────────────────── */}
        <div className={`${tw.bentoGrid} grid-cols-2 md:grid-cols-4`}>
          {/* Total */}
          <div className={`${tw.card} ${tw.cardPadding} group`}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[#FFF1F2] flex items-center justify-center text-[#E11D48]">
                <Archive size={iconSize.md} weight="duotone" />
              </div>
              <span className={tw.label}>Total Documents</span>
            </div>
            <p className={`${tw.metric} text-[#18181B]`}>{totalCount}</p>
            <p className="text-xs text-[#A1A1AA] mt-0.5">saved reports</p>
          </div>

          {/* Top 3 type stats */}
          {stats.slice(0, 3).map((stat) => (
            <div key={stat.type} className={`${tw.card} ${tw.cardPadding} group`}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#FFF1F2] flex items-center justify-center text-[#E11D48]">
                  {STAT_ICONS[stat.type] ?? <Cube size={iconSize.md} weight="duotone" />}
                </div>
                <span className={tw.label}>{TYPE_META[stat.type]?.label ?? stat.type}</span>
              </div>
              <p className={`${tw.metric} text-[#18181B]`}>{stat.count}</p>
              <p className="text-xs text-[#A1A1AA] mt-0.5">reports</p>
            </div>
          ))}

          {/* Fill empty stat slots if fewer than 3 types */}
          {stats.length < 3 &&
            Array.from({ length: 3 - stats.length }).map((_, i) => (
              <div key={`empty-stat-${i}`} className={`${tw.card} ${tw.cardPadding} opacity-50`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-[#FAFAFA] flex items-center justify-center text-[#A1A1AA]">
                    <Cube size={iconSize.md} weight="duotone" />
                  </div>
                  <span className={tw.label}>—</span>
                </div>
                <p className={`${tw.metric} text-[#A1A1AA]`}>0</p>
              </div>
            ))
          }
        </div>

        {/* ─── Filter Tabs + Search ─────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex gap-0.5 overflow-x-auto no-scrollbar border-b border-[#E4E4E7] -mb-px pb-0">
            {FILTER_TABS.map((tab) => {
              const isActive = activeFilter === tab.key;
              const count = tab.key === 'ALL'
                ? totalCount
                : stats.find((s) => s.type === tab.key)?.count ?? 0;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveFilter(tab.key)}
                  className={`relative px-3.5 py-2.5 text-xs font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'text-[#E11D48] font-semibold'
                      : 'text-[#71717A] hover:text-[#18181B]'
                  }`}
                >
                  {tab.label}
                  {count > 0 && (
                    <span className={`ml-1.5 text-[10px] tabular-nums ${
                      isActive ? 'text-[#E11D48]' : 'text-[#A1A1AA]'
                    }`}>
                      {count}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E11D48] rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search documents…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`${tw.input} pl-9 py-2 text-xs`}
            />
            <MagnifyingGlass
              size={iconSize.sm}
              weight="duotone"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]"
            />
          </div>
        </div>

        {/* ─── Document List OR Empty State ──────────────────── */}
        {/* Action error toast */}
        {actionError && (
          <div className={tw.callout('error')}>
            <Warning size={iconSize.sm} weight="duotone" className="shrink-0" />
            <span className="flex-1 text-sm">{actionError}</span>
            <button onClick={() => setActionError(null)} className="text-xs font-bold opacity-70 hover:opacity-100 ml-2">✕</button>
          </div>
        )}

        {filteredDocs.length === 0 ? (
          <EmptyState
            hasAnyDocs={documents.length > 0}
            searchActive={!!search.trim() || activeFilter !== 'ALL'}
            onClearFilters={() => { setSearch(''); setActiveFilter('ALL'); }}
            onNavigateToICP={onNavigateToICP}
            onNavigateToPlaybook={onNavigateToPlaybook}
          />
        ) : (
          <div className={`${tw.card} overflow-hidden`}>
            <div className={tw.accentBar} />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E4E4E7]">
                    <th className={tw.th}>Document</th>
                    <th className={`${tw.th} hidden sm:table-cell`}>Type</th>
                    <th className={`${tw.th} hidden md:table-cell`}>Industry</th>
                    <th className={`${tw.th} hidden lg:table-cell`}>Source</th>
                    <th className={tw.th}>Created</th>
                    <th className={`${tw.th} text-right`}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocs.map((doc) => {
                    const meta = TYPE_META[doc.type] ?? TYPE_META['ICP'];
                    return (
                      <tr
                        key={doc.id}
                        className="group border-b border-[#E4E4E7]/50 last:border-0 transition-colors hover:bg-[#FFF1F2]/30"
                      >
                        {/* Title + company */}
                        <td className={tw.td}>
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-lg bg-[#FFF1F2] flex items-center justify-center text-[#E11D48] shrink-0">
                              {meta.icon}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-[#18181B] truncate max-w-[260px]">
                                {doc.title}
                              </p>
                              {doc.companyName && (
                                <p className="text-[11px] text-[#A1A1AA] truncate">
                                  <Buildings size={10} weight="duotone" className="inline mr-0.5 -mt-px" />
                                  {doc.companyName}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Type badge */}
                        <td className={`${tw.td} hidden sm:table-cell`}>
                          <span className={tw.badge(meta.badge)}>
                            {meta.label}
                          </span>
                        </td>

                        {/* Industry */}
                        <td className={`${tw.td} hidden md:table-cell`}>
                          <span className="text-xs text-[#71717A]">
                            {doc.industry || '—'}
                          </span>
                        </td>

                        {/* Data source */}
                        <td className={`${tw.td} hidden lg:table-cell`}>
                          {doc.dataSource === 'ai_generated' ? (
                            <span className={tw.badge('ai')}>
                              <Sparkle size={iconSize.xs} weight="fill" /> AI
                            </span>
                          ) : doc.dataSource === 'template' ? (
                            <span className={tw.badge('neutral')}>Template</span>
                          ) : (
                            <span className={tw.badge('neutral')}>Manual</span>
                          )}
                        </td>

                        {/* Created */}
                        <td className={tw.td}>
                          <div className="flex items-center gap-1.5 text-xs text-[#71717A] whitespace-nowrap">
                            <CalendarBlank size={iconSize.xs} weight="duotone" />
                            <span title={`${formatDate(doc.createdAt)} ${formatTime(doc.createdAt)}`}>
                              {timeAgo(doc.createdAt)}
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className={`${tw.td} text-right`}>
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleView(doc.id)}
                              className="p-1.5 rounded-lg text-[#71717A] hover:text-[#E11D48] hover:bg-[#FFF1F2] transition-colors"
                              title="View document"
                            >
                              <Eye size={iconSize.sm} weight="duotone" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(doc.id)}
                              className="p-1.5 rounded-lg text-[#71717A] hover:text-[#BE123C] hover:bg-[#F5F5F4] transition-colors"
                              title="Delete document"
                            >
                              <Trash size={iconSize.sm} weight="duotone" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Table footer */}
            <div className="px-4 py-3 border-t border-[#E4E4E7] flex items-center justify-between">
              <span className="text-xs text-[#A1A1AA]">
                {filteredDocs.length} document{filteredDocs.length !== 1 ? 's' : ''} shown
              </span>
              <button onClick={fetchData} className={tw.btnGhost}>
                <ArrowClockwise size={iconSize.xs} weight="bold" /> Refresh
              </button>
            </div>
          </div>
        )}

        {/* ─── Delete Confirmation Modal ────────────────────── */}
        {deleteTarget && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDeleteTarget(null)}>
            <div
              className={`${tw.card} ${tw.cardPadding} max-w-sm w-full`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#F5F5F4] flex items-center justify-center text-[#BE123C]">
                  <Trash size={iconSize.lg} weight="duotone" />
                </div>
                <div>
                  <h3 className={tw.h3}>Delete Document</h3>
                  <p className="text-xs text-[#71717A]">This action cannot be undone</p>
                </div>
              </div>
              <p className={`${tw.body} mb-5`}>
                Are you sure you want to permanently delete this document from your workspace? All associated data will be lost.
              </p>
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className={tw.btnSecondary}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteTarget)}
                  className={tw.btnDanger}
                  disabled={deleting}
                >
                  {deleting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Deleting…
                    </>
                  ) : (
                    <>
                      <Trash size={iconSize.sm} weight="bold" /> Delete Permanently
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── View Document Modal ──────────────────────────── */}
        {(viewDoc || viewLoading) && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setViewDoc(null)}>
            <div
              className={`${tw.card} max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="px-5 py-4 lg:px-6 border-b border-[#E4E4E7] flex items-center justify-between shrink-0">
                {viewLoading ? (
                  <ShimmerSkeleton width="50%" height="20px" />
                ) : viewDoc ? (
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-[#FFF1F2] flex items-center justify-center text-[#E11D48] shrink-0">
                      {TYPE_META[viewDoc.type as DocumentType]?.icon ?? <Cube size={iconSize.sm} weight="duotone" />}
                    </div>
                    <div className="min-w-0">
                      <h3 className={`${tw.h3} truncate`}>{viewDoc.title}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={tw.badge(TYPE_META[viewDoc.type as DocumentType]?.badge ?? 'neutral')}>
                          {TYPE_META[viewDoc.type as DocumentType]?.label ?? viewDoc.type}
                        </span>
                        <span className="text-[10px] text-[#A1A1AA]">
                          {formatDate(viewDoc.createdAt)} {formatTime(viewDoc.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : null}
                <button
                  onClick={() => setViewDoc(null)}
                  className="p-1.5 rounded-lg text-[#71717A] hover:text-[#18181B] hover:bg-[#FAFAFA] transition-colors shrink-0"
                >
                  ✕
                </button>
              </div>

              {/* Modal body */}
              <div className="flex-1 overflow-y-auto p-5 lg:p-6">
                {viewLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <ShimmerSkeleton key={i} width="100%" height="16px" />
                    ))}
                  </div>
                ) : viewDoc?.content ? (
                  <div>
                    {/* Meta info */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
                      {viewDoc.industry && (
                        <div>
                          <p className={tw.label}>Industry</p>
                          <p className="text-sm font-semibold text-[#18181B] mt-0.5">{viewDoc.industry}</p>
                        </div>
                      )}
                      {viewDoc.companyName && (
                        <div>
                          <p className={tw.label}>Company</p>
                          <p className="text-sm font-semibold text-[#18181B] mt-0.5">{viewDoc.companyName}</p>
                        </div>
                      )}
                      <div>
                        <p className={tw.label}>Data Source</p>
                        <p className="text-sm font-semibold text-[#18181B] mt-0.5 capitalize">{viewDoc.dataSource?.replace('_', ' ')}</p>
                      </div>
                    </div>

                    {/* Tags */}
                    {viewDoc.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {viewDoc.tags.map((tag: string, i: number) => (
                          <span key={i} className={tw.badge('neutral')}>
                            <Tag size={iconSize.xs} weight="duotone" /> {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className={tw.divider} />

                    {/* Raw content — pretty-printed JSON */}
                    <div className="mt-4">
                      <p className={`${tw.label} mb-2`}>Report Content</p>
                      <pre className="bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl p-4 text-xs font-mono text-[#18181B] overflow-x-auto max-h-[50vh] leading-relaxed">
                        {JSON.stringify(viewDoc.content, null, 2)}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <p className={tw.body}>No content available.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── Footer ───────────────────────────────────────── */}
        <p className="text-xs text-[#A1A1AA] text-center">
          VICO Executive Workspace · {totalCount} document{totalCount !== 1 ? 's' : ''} stored
        </p>
      </div>
    </FadeIn>
  );
}

// ============================================================================
// EMPTY STATE
// ============================================================================

function EmptyState({
  hasAnyDocs,
  searchActive,
  onClearFilters,
  onNavigateToICP,
  onNavigateToPlaybook,
}: {
  hasAnyDocs: boolean;
  searchActive: boolean;
  onClearFilters: () => void;
  onNavigateToICP?: () => void;
  onNavigateToPlaybook?: () => void;
}) {
  // If user has docs but filters hide them
  if (hasAnyDocs && searchActive) {
    return (
      <div className={`${tw.card} ${tw.cardPadding} text-center py-16`}>
        <MagnifyingGlass size={40} weight="duotone" className="mx-auto text-[#A1A1AA] mb-4" />
        <h3 className={tw.h3}>No matching documents</h3>
        <p className={`${tw.body} mt-1 mb-5`}>
          Try adjusting your search or filter to find what you're looking for.
        </p>
        <button onClick={onClearFilters} className={tw.btnSecondary}>
          Clear Filters
        </button>
      </div>
    );
  }

  // Truly empty workspace
  return (
    <div className={`${tw.card} overflow-hidden`}>
      <div className={tw.accentBar} />
      <div className={`${tw.cardPadding} text-center py-20`}>
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#FFF1F2] to-[#FFF7ED] flex items-center justify-center mb-5">
          <FolderSimple size={32} weight="duotone" className="text-[#E11D48]" />
        </div>
        <h2 className={tw.h2}>Your strategy vault is empty</h2>
        <p className={`${tw.body} mt-2 max-w-md mx-auto mb-8`}>
          Generate your first AI-powered ICP or GTM Playbook and it will appear here. All your intelligence reports are stored and accessible from this command center.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {onNavigateToICP && (
            <button onClick={onNavigateToICP} className={tw.btnAI}>
              <Crosshair size={iconSize.sm} weight="duotone" />
              Build Your First ICP
            </button>
          )}
          {onNavigateToPlaybook && (
            <button onClick={onNavigateToPlaybook} className={tw.btnSecondary}>
              <ClipboardText size={iconSize.sm} weight="duotone" />
              Create GTM Playbook
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
