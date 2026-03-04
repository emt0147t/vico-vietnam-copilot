/**
 * Competitor Analysis Page  Multi-Select Comparison (Phase 20)
 *
 * Users select 2+ Hero Companies and get a detailed side-by-side comparison.
 * Zero API calls. Pure CSS/Tailwind charts. Executive Crimson design system.
 *
 * Sections: Multi-Select, Hero Cards, Market Map, Head-to-Head Table,
 *           Market Share, Growth vs CSAT, Products, Tech Stack, Vulnerabilities
 */

import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import {
    Users, Building2, DollarSign, Target,
    CheckCircle, BarChart3, Star,
    Award, TrendingUp, Shield, Flag, Sparkles,
    Rocket, Crown, Zap, Globe, Calendar, Package,
    Briefcase, CircleDot, Database,
    Download, X, FileText, FileJson, Highlighter,
    StickyNote, Copy, Check, Printer,
    Bookmark, BookmarkCheck, Eye
} from 'lucide-react';
import { COMPANIES, type CompanyProfile } from '../data/companies';
import {
    exportCompetitorReportHTML,
    exportCompetitorReportJSON,
    exportCompetitorReportTXT,
    type CompetitorExportData,
} from '../utils/exportCompetitorReportHTML';

// ==================== HELPER COMPONENTS ====================

/** Compact copy-to-clipboard button that appears on hover */
const CopyMetricBtn: React.FC<{ value: string }> = ({ value }) => {
    const [copied, setCopied] = useState(false);
    return (
        <button
            className="inline-flex items-center justify-center w-5 h-5 rounded ml-1 opacity-0 group-hover:opacity-100 transition-opacity bg-[#FAFAFA] hover:bg-[#E4E4E7] border border-transparent hover:border-[#E4E4E7]"
            title="Copy"
            onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1200); }}
        >
            {copied ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} className="text-[#A1A1AA]" />}
        </button>
    );
};

/** Section-level sticky note persisted in localStorage */
const SectionNote: React.FC<{ sectionId: string }> = ({ sectionId }) => {
    const storageKey = `vico_competitor_note_${sectionId}`;
    const [open, setOpen] = useState(false);
    const [text, setText] = useState(() => localStorage.getItem(storageKey) || '');
    const save = () => { localStorage.setItem(storageKey, text); };
    const clear = () => { setText(''); localStorage.removeItem(storageKey); };

    if (!open) return (
        <button onClick={() => setOpen(true)} title="Notes" className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium text-[#71717A] hover:text-[#E11D48] hover:bg-[#FFF1F2] transition-colors border border-transparent hover:border-[#FFE4E6]">
            <StickyNote size={12} />
            {text ? <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> : null}
        </button>
    );

    return (
        <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3 animate-fade-in">
            <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1"><StickyNote size={10} /> Notes</span>
                <div className="flex gap-1">
                    <button onClick={save} className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-800 hover:bg-amber-300">Save</button>
                    <button onClick={clear} className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-600 hover:bg-amber-200">Clear</button>
                    <button onClick={() => setOpen(false)} className="px-1.5 py-0.5 rounded text-[10px] text-amber-500 hover:bg-amber-100"><X size={10} /></button>
                </div>
            </div>
            <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Enter a note for this section..."
                className="w-full h-20 text-xs bg-white border border-amber-200 rounded-lg p-2 resize-none focus:outline-none focus:ring-1 focus:ring-amber-300"
            />
        </div>
    );
};

/** Export Modal — format picker with HTML / TXT / JSON */
const ExportModal: React.FC<{
    show: boolean;
    onClose: () => void;
    onExport: (format: 'html' | 'txt' | 'json') => void;
}> = ({ show, onClose, onExport }) => {
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    if (!show) return null;

    const handleExport = (fmt: 'html' | 'txt' | 'json') => {
        setLoading(true);
        setTimeout(() => {
            onExport(fmt);
            setLoading(false);
            setDone(true);
            setTimeout(() => { setDone(false); onClose(); }, 1200);
        }, 600);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl border border-[#E4E4E7] w-full max-w-md p-6 animate-slide-up" onClick={e => e.stopPropagation()}>
                {done ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                            <Check className="text-emerald-600" size={32} />
                        </div>
                        <p className="text-lg font-bold text-[#18181B]">Report exported successfully!</p>
                        <p className="text-sm text-[#71717A] mt-1">File has been downloaded.</p>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h3 className="text-lg font-bold text-[#18181B]">Export Competitor Report</h3>
                                <p className="text-xs text-[#71717A]">Choose a format to download</p>
                            </div>
                            <button onClick={onClose} className="p-2 rounded-xl hover:bg-[#FAFAFA]"><X size={18} className="text-[#A1A1AA]" /></button>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center py-10">
                                <div className="w-10 h-10 border-4 border-[#E11D48] border-t-transparent rounded-full animate-spin mb-4" />
                                <p className="text-sm text-[#71717A]">Generating report...</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <button onClick={() => handleExport('html')} className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-[#E11D48] bg-[#FFF1F2] hover:bg-[#FFE4E6] transition-colors text-left group">
                                    <div className="w-10 h-10 rounded-xl bg-[#E11D48] flex items-center justify-center"><Eye className="text-white" size={18} /></div>
                                    <div className="flex-1">
                                        <div className="text-sm font-bold text-[#18181B]">HTML Premium Report</div>
                                        <div className="text-[10px] text-[#71717A]">Beautiful report with charts & tables, ready to print</div>
                                    </div>
                                    <span className="px-2 py-0.5 rounded-full bg-[#E11D48] text-white text-[9px] font-bold">RECOMMENDED</span>
                                </button>
                                <button onClick={() => handleExport('txt')} className="w-full flex items-center gap-4 p-4 rounded-xl border border-[#E4E4E7] bg-white hover:bg-[#FAFAFA] transition-colors text-left">
                                    <div className="w-10 h-10 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] flex items-center justify-center"><FileText className="text-[#71717A]" size={18} /></div>
                                    <div className="flex-1">
                                        <div className="text-sm font-bold text-[#18181B]">Plain Text (.txt)</div>
                                        <div className="text-[10px] text-[#71717A]">Simple plain text format</div>
                                    </div>
                                </button>
                                <button onClick={() => handleExport('json')} className="w-full flex items-center gap-4 p-4 rounded-xl border border-[#E4E4E7] bg-white hover:bg-[#FAFAFA] transition-colors text-left">
                                    <div className="w-10 h-10 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] flex items-center justify-center"><FileJson className="text-[#71717A]" size={18} /></div>
                                    <div className="flex-1">
                                        <div className="text-sm font-bold text-[#18181B]">JSON Data</div>
                                        <div className="text-[10px] text-[#71717A]">Structured data for integrations</div>
                                    </div>
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

// ==================== TYPES ====================

interface CompetitorAnalysisPageProps {
    userData?: any;
    competitors?: any[];
}

type QuadrantType = 'Leader' | 'Challenger' | 'Visionary' | 'Niche Player';

// ==================== DATA HELPERS ====================

const HERO_COMPANIES = COMPANIES.filter(
    (c): c is CompanyProfile & {
        quadrant_position: QuadrantType;
        market_share_percentage: number;
        yoy_growth: string;
        csat_score: number;
    } =>
        c.dataTier === 'premium' &&
        !!c.quadrant_position &&
        typeof c.market_share_percentage === 'number'
);

const QUADRANT_CONFIG: Record<QuadrantType, { color: string; bg: string; border: string; textColor: string }> = {
    Leader:        { color: 'bg-emerald-500', bg: 'bg-emerald-50',  border: 'border-emerald-200', textColor: 'text-emerald-700' },
    Challenger:    { color: 'bg-blue-500',    bg: 'bg-blue-50',     border: 'border-blue-200',    textColor: 'text-blue-700' },
    Visionary:     { color: 'bg-amber-500',   bg: 'bg-amber-50',    border: 'border-amber-200',   textColor: 'text-amber-700' },
    'Niche Player':{ color: 'bg-purple-500',  bg: 'bg-purple-50',   border: 'border-purple-200',  textColor: 'text-purple-700' },
};

const COMPANY_COLORS = [
    { bg: 'bg-[#E11D48]', text: 'text-white', ring: 'ring-[#E11D48]/30', accent: '#E11D48', bgLight: 'bg-[#FFF1F2]', textDark: 'text-[#E11D48]' },
    { bg: 'bg-blue-600',  text: 'text-white', ring: 'ring-blue-600/30',  accent: '#2563EB', bgLight: 'bg-blue-50',   textDark: 'text-blue-600' },
    { bg: 'bg-emerald-600', text: 'text-white', ring: 'ring-emerald-600/30', accent: '#059669', bgLight: 'bg-emerald-50', textDark: 'text-emerald-600' },
    { bg: 'bg-amber-500',  text: 'text-white', ring: 'ring-amber-500/30', accent: '#D97706', bgLight: 'bg-amber-50', textDark: 'text-amber-600' },
    { bg: 'bg-purple-600', text: 'text-white', ring: 'ring-purple-600/30', accent: '#7C3AED', bgLight: 'bg-purple-50', textDark: 'text-purple-600' },
];

function parseGrowth(g: string): number {
    return parseFloat(g.replace(/[^0-9.\-]/g, '')) || 0;
}

function shortName(name: string): string {
    return name.split('(')[0]?.trim().split(' ')[0] ?? name;
}



// ==================== COMPARISON HERO CARDS ====================

const ComparisonHeroCards: React.FC<{ companies: typeof HERO_COMPANIES; highlightMode?: boolean }> = ({ companies, highlightMode }) => (
    <div className={`grid gap-4 ${companies.length === 2 ? 'grid-cols-1 md:grid-cols-2' : companies.length === 3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-' + Math.min(companies.length, 4)}`}>
        {companies.map((c, idx) => {
            const cc = COMPANY_COLORS[idx % COMPANY_COLORS.length]!;
            const qc = QUADRANT_CONFIG[c.quadrant_position];
            return (
                <div key={c.name} className="bg-white border border-[#E4E4E7] rounded-2xl overflow-hidden">
                    {/* Color accent bar */}
                    <div className={`h-1.5 ${cc.bg}`} />
                    <div className="p-5">
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-white border-2 border-[#E4E4E7] shadow flex items-center justify-center overflow-hidden">
                                {c.logoUrl ? (
                                    <img src={c.logoUrl} alt={c.name} className="w-8 h-8 object-contain" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling && ((e.target as HTMLImageElement).nextElementSibling as HTMLElement).classList.remove('hidden'); }} />
                                ) : null}
                                <span className={`text-lg font-black ${cc.textDark} ${c.logoUrl ? 'hidden' : ''}`}>{c.name.substring(0, 2).toUpperCase()}</span>
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="text-base font-bold text-[#18181B] truncate">{c.name.split('(')[0]?.trim()}</h3>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${qc.bg} ${qc.textColor} border ${qc.border}`}>{c.quadrant_position}</span>
                                    <span className="text-[10px] text-[#A1A1AA]">{c.sub_industry}</span>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-[#71717A] line-clamp-2 mb-4">{c.description || c.intro}</p>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className={`group bg-[#FAFAFA] rounded-xl p-3 text-center ${highlightMode ? 'ring-1 ring-amber-300 bg-amber-50/40' : ''}`}>
                                <div className="text-[10px] text-[#A1A1AA] flex items-center justify-center gap-1"><DollarSign size={10} />Revenue</div>
                                <div className="text-lg font-black text-[#18181B] mt-0.5">{c.revenue || 'N/A'}<CopyMetricBtn value={c.revenue || 'N/A'} /></div>
                            </div>
                            <div className={`group bg-[#FAFAFA] rounded-xl p-3 text-center ${highlightMode ? 'ring-1 ring-amber-300 bg-amber-50/40' : ''}`}>
                                <div className="text-[10px] text-[#A1A1AA] flex items-center justify-center gap-1"><Users size={10} />Headcount</div>
                                <div className="text-lg font-black text-[#18181B] mt-0.5">{c.headcount ? c.headcount.toLocaleString() : 'N/A'}<CopyMetricBtn value={c.headcount ? c.headcount.toLocaleString() : 'N/A'} /></div>
                            </div>
                            <div className={`group bg-[#FAFAFA] rounded-xl p-3 text-center ${highlightMode ? 'ring-1 ring-amber-300 bg-amber-50/40' : ''}`}>
                                <div className="text-[10px] text-[#A1A1AA] flex items-center justify-center gap-1"><TrendingUp size={10} />Growth</div>
                                <div className="text-lg font-black text-emerald-600 mt-0.5">{c.yoy_growth}<CopyMetricBtn value={c.yoy_growth} /></div>
                            </div>
                            <div className={`group bg-[#FAFAFA] rounded-xl p-3 text-center ${highlightMode ? 'ring-1 ring-amber-300 bg-amber-50/40' : ''}`}>
                                <div className="text-[10px] text-[#A1A1AA] flex items-center justify-center gap-1"><Star size={10} />CSAT</div>
                                <div className="text-lg font-black text-[#E11D48] mt-0.5">{c.csat_score}/100<CopyMetricBtn value={`${c.csat_score}/100`} /></div>
                            </div>
                        </div>

                        {/* Extra details */}
                        <div className="mt-3 space-y-1.5">
                            <div className={`group flex items-center gap-2 text-xs text-[#71717A] ${highlightMode ? 'bg-amber-50/60 rounded-lg px-2 py-1' : ''}`}>
                                <BarChart3 size={12} className={cc.textDark} />
                                <span>Market Share: <strong className="text-[#18181B]">{c.market_share_percentage}%</strong><CopyMetricBtn value={`${c.market_share_percentage}%`} /></span>
                            </div>
                            {c.total_funding && (
                                <div className="group flex items-center gap-2 text-xs text-[#71717A]">
                                    <DollarSign size={12} className={cc.textDark} />
                                    <span className="truncate">Funding: <strong className="text-[#18181B]">{c.total_funding}</strong><CopyMetricBtn value={c.total_funding} /></span>
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-xs text-[#71717A]">
                                <Calendar size={12} className={cc.textDark} />
                                <span>Founded: <strong className="text-[#18181B]">{c.year}</strong></span>
                            </div>
                        </div>
                    </div>
                </div>
            );
        })}
    </div>
);

// ==================== MARKET MAP (2x2 QUADRANT) ====================

const MarketMapQuadrant: React.FC<{ companies: typeof HERO_COMPANIES; selectedNames: string[] }> = ({ companies, selectedNames }) => {
    const quadrantPositions: Record<QuadrantType, { gridArea: string; label: string }> = {
        'Niche Player': { gridArea: '1 / 1 / 2 / 2', label: 'NICHE PLAYERS' },
        Leader:         { gridArea: '1 / 2 / 2 / 3', label: 'LEADERS' },
        Visionary:      { gridArea: '2 / 1 / 3 / 2', label: 'VISIONARIES' },
        Challenger:     { gridArea: '2 / 2 / 3 / 3', label: 'CHALLENGERS' },
    };

    const grouped = companies.reduce((acc, c) => {
        const q = c.quadrant_position;
        if (!acc[q]) acc[q] = [];
        acc[q].push(c);
        return acc;
    }, {} as Record<QuadrantType, typeof companies>);

    return (
        <div className="bg-white border border-[#E4E4E7] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-[#FFF1F2] flex items-center justify-center">
                    <Target className="text-[#E11D48]" size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-[#18181B]">Market Positioning Map</h3>
                    <p className="text-xs text-[#71717A]">Gartner-style Magic Quadrant  {companies.length} Vietnamese Tech Companies</p>
                </div>
            </div>

            <div className="relative">
                <div className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider text-center mb-1">
                    Completeness of Vision &rarr;
                </div>
                <div className="flex gap-0">
                    <div className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider -rotate-90 origin-center shrink-0 w-5 flex items-center justify-center" style={{writingMode: 'vertical-rl', transform: 'rotate(180deg)'}}>
                        Ability to Execute &rarr;
                    </div>
                    <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-1 min-h-[340px]">
                        {(Object.entries(quadrantPositions) as [QuadrantType, typeof quadrantPositions[QuadrantType]][]).map(([quadrant, config]) => {
                            const qc = QUADRANT_CONFIG[quadrant];
                            const items = grouped[quadrant] || [];
                            return (
                                <div key={quadrant} className={`${qc.bg} rounded-xl p-3 flex flex-col`} style={{ gridArea: config.gridArea }}>
                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${qc.textColor} mb-2`}>{config.label}</span>
                                    <div className="flex flex-wrap gap-2 flex-1 content-start">
                                        {items.map(c => {
                                            const isSelected = selectedNames.includes(c.name);
                                            const selIdx = selectedNames.indexOf(c.name);
                                            const cc = selIdx >= 0 ? COMPANY_COLORS[selIdx % COMPANY_COLORS.length]! : null;
                                            return (
                                                <div
                                                    key={c.name}
                                                    className={`group relative flex items-center gap-2 px-3 py-2 rounded-xl border transition-all cursor-default ${
                                                        isSelected
                                                            ? `${cc?.bg} ${cc?.text} border-transparent ring-2 ${cc?.ring} shadow-lg`
                                                            : 'bg-white/60 border-[#E4E4E7] text-[#71717A]'
                                                    }`}
                                                >
                                                    <span className={`text-xs font-semibold truncate max-w-[100px]`}>
                                                        {shortName(c.name)}
                                                    </span>
                                                    {isSelected && <Crown size={12} className="opacity-80 shrink-0" />}
                                                    <div className="absolute z-30 bottom-full left-1/2 -translate-x-1/2 mb-2 bg-zinc-900 text-white px-3 py-2 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity text-xs whitespace-nowrap pointer-events-none">
                                                        <div className="font-bold">{c.name}</div>
                                                        <div className="text-zinc-400">{c.market_share_percentage}% share &middot; {c.yoy_growth} growth</div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap gap-4 mt-4 justify-center">
                {(Object.entries(QUADRANT_CONFIG) as [QuadrantType, typeof QUADRANT_CONFIG[QuadrantType]][]).map(([q, cfg]) => (
                    <div key={q} className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${cfg.color}`} />
                        <span className="text-xs text-[#71717A]">{q}</span>
                    </div>
                ))}
                {selectedNames.map((name, idx) => {
                    const cc = COMPANY_COLORS[idx % COMPANY_COLORS.length]!;
                    return (
                        <div key={name} className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${cc.bg} ring-2 ${cc.ring}`} />
                            <span className="text-xs text-[#71717A]">{shortName(name)}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// ==================== HEAD-TO-HEAD COMPARISON TABLE ====================

const HeadToHeadTable: React.FC<{ companies: typeof HERO_COMPANIES; highlightMode?: boolean }> = ({ companies, highlightMode: _highlightMode }) => {
    return (
        <div className="bg-white border border-[#E4E4E7] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                    <Award className="text-purple-600" size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-[#18181B]">Head-to-Head Comparison</h3>
                    <p className="text-xs text-[#71717A]">{companies.map(c => shortName(c.name)).join(' vs ')}</p>
                </div>
            </div>

            <div className="overflow-x-auto -mx-1">
                <table className="w-full min-w-[600px]">
                    <thead>
                        <tr className="bg-[#FAFAFA]">
                            <th className="px-4 py-3 text-left text-xs font-bold text-[#71717A] uppercase w-36">Metric</th>
                            {companies.map((c, idx) => {
                                const cc = COMPANY_COLORS[idx % COMPANY_COLORS.length]!;
                                return (
                                    <th key={c.name} className="px-4 py-3 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-6 h-6 rounded-lg bg-white border border-[#E4E4E7] flex items-center justify-center overflow-hidden">
                                                {c.logoUrl ? <img src={c.logoUrl} alt="" className="w-4 h-4 object-contain" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} /> : <span className="text-[8px] font-bold">{c.name.substring(0,2)}</span>}
                                            </div>
                                            <span className={`text-xs font-bold ${cc.textDark}`}>{shortName(c.name)}</span>
                                        </div>
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E4E4E7]">
                        <MetricRow label="Revenue" icon={<DollarSign size={14} />} companies={companies} render={c => c.revenue || 'N/A'} />
                        <MetricRow label="Headcount" icon={<Users size={14} />} companies={companies} render={c => c.headcount ? c.headcount.toLocaleString() : 'N/A'} />
                        <MetricRow label="Founded" icon={<Calendar size={14} />} companies={companies} render={c => String(c.year)} />
                        <MetricRow label="Total Funding" icon={<DollarSign size={14} />} companies={companies} render={c => c.total_funding || 'N/A'} />
                        <MetricRow label="YoY Growth" icon={<TrendingUp size={14} />} companies={companies} render={c => c.yoy_growth} highlight="growth" />
                        <MetricRow label="CSAT Score" icon={<Star size={14} />} companies={companies} render={c => `${c.csat_score}/100`} highlight="csat" />
                        <MetricRow label="Market Share" icon={<BarChart3 size={14} />} companies={companies} render={c => `${c.market_share_percentage}%`} highlight="share" />
                        <MetricRow label="Quadrant" icon={<Target size={14} />} companies={companies} render={c => c.quadrant_position} renderBadge />
                        <MetricRow label="Industry" icon={<Building2 size={14} />} companies={companies} render={c => c.sub_industry || c.industry || 'Technology'} />
                        <MetricRow label="Website" icon={<Globe size={14} />} companies={companies} render={c => c.website || 'N/A'} />
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const MetricRow: React.FC<{
    label: string;
    icon: React.ReactNode;
    companies: typeof HERO_COMPANIES;
    render: (c: typeof HERO_COMPANIES[0]) => string;
    highlight?: 'growth' | 'csat' | 'share';
    renderBadge?: boolean;
}> = ({ label, icon, companies, render, highlight, renderBadge }) => {
    // Determine the "winner" for highlighting
    let bestIdx = -1;
    if (highlight === 'growth') {
        let best = -Infinity;
        companies.forEach((c, i) => { const v = parseGrowth(c.yoy_growth); if (v > best) { best = v; bestIdx = i; } });
    } else if (highlight === 'csat') {
        let best = -Infinity;
        companies.forEach((c, i) => { if (c.csat_score > best) { best = c.csat_score; bestIdx = i; } });
    } else if (highlight === 'share') {
        let best = -Infinity;
        companies.forEach((c, i) => { if (c.market_share_percentage > best) { best = c.market_share_percentage; bestIdx = i; } });
    }

    return (
        <tr className="hover:bg-[#FAFAFA]">
            <td className="px-4 py-3 text-xs font-semibold text-[#71717A] flex items-center gap-2">{icon} {label}</td>
            {companies.map((c, idx) => {
                const val = render(c);
                const isBest = bestIdx === idx;
                const cc = COMPANY_COLORS[idx % COMPANY_COLORS.length]!;
                return (
                    <td key={c.name} className="px-4 py-3 text-center group">
                        {renderBadge ? (
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${QUADRANT_CONFIG[c.quadrant_position]?.bg} ${QUADRANT_CONFIG[c.quadrant_position]?.textColor}`}>
                                {val}
                            </span>
                        ) : (
                            <span className={`text-sm font-bold ${isBest ? cc.textDark + ' underline decoration-2 decoration-dotted underline-offset-4' : 'text-[#18181B]'}`}>
                                {isBest && <Crown size={10} className="inline -mt-0.5 mr-1" />}
                                {val}
                                <CopyMetricBtn value={val} />
                            </span>
                        )}
                    </td>
                );
            })}
        </tr>
    );
};

// ==================== MARKET SHARE BARS ====================

const MarketShareComparison: React.FC<{ companies: typeof HERO_COMPANIES; highlightMode?: boolean }> = ({ companies, highlightMode }) => {
    const maxShare = Math.max(...companies.map(c => c.market_share_percentage));
    const sorted = useMemo(() => [...companies].sort((a, b) => b.market_share_percentage - a.market_share_percentage), [companies]);

    return (
        <div className="bg-white border border-[#E4E4E7] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <BarChart3 className="text-blue-600" size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-[#18181B]">Market Share Comparison</h3>
                    <p className="text-xs text-[#71717A]">Selected companies only  estimated share in Vietnamese tech sector</p>
                </div>
            </div>
            <div className="space-y-3">
                {sorted.map((c) => {
                    const origIdx = companies.indexOf(c);
                    const cc = COMPANY_COLORS[origIdx % COMPANY_COLORS.length]!;
                    const pct = maxShare > 0 ? (c.market_share_percentage / maxShare) * 100 : 0;
                    return (
                        <div key={c.name} className={`group flex items-center gap-3 p-3 rounded-xl ${cc.bgLight} ${highlightMode ? 'ring-1 ring-amber-300' : ''}`}>
                            <div className="w-8 h-8 rounded-lg bg-white border border-[#E4E4E7] flex items-center justify-center overflow-hidden shrink-0">
                                {c.logoUrl ? <img src={c.logoUrl} alt="" className="w-5 h-5 object-contain" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} /> : <span className="text-[10px] font-bold">{c.name.substring(0,2)}</span>}
                            </div>
                            <div className="w-24 shrink-0">
                                <p className={`text-xs font-semibold ${cc.textDark}`}>{c.name.split('(')[0]?.trim() ?? c.name}</p>
                            </div>
                            <div className="flex-1 h-7 bg-white border border-[#E4E4E7] rounded-lg overflow-hidden">
                                <div className={`h-full ${cc.bg} rounded-lg transition-all duration-700 ease-out flex items-center justify-end pr-2`} style={{ width: `${pct}%` }}>
                                    {pct > 25 && <span className="text-[10px] font-bold text-white">{c.market_share_percentage}%</span>}
                                </div>
                            </div>
                            {pct <= 25 && <span className={`text-xs font-bold ${cc.textDark} w-10 text-right shrink-0`}>{c.market_share_percentage}%</span>}
                            <CopyMetricBtn value={`${c.market_share_percentage}%`} />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// ==================== GROWTH vs CSAT COMPARISON ====================

const GrowthCsatComparison: React.FC<{ companies: typeof HERO_COMPANIES; highlightMode?: boolean }> = ({ companies, highlightMode }) => {
    const maxGrowth = Math.max(...companies.map(c => parseGrowth(c.yoy_growth)));
    const maxCsat = 100;

    return (
        <div className="bg-white border border-[#E4E4E7] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <TrendingUp className="text-emerald-600" size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-[#18181B]">Growth vs. Customer Satisfaction</h3>
                    <p className="text-xs text-[#71717A]">Year-over-year growth and CSAT score for selected companies</p>
                </div>
            </div>

            <div className="space-y-4">
                {companies.map((c, idx) => {
                    const cc = COMPANY_COLORS[idx % COMPANY_COLORS.length]!;
                    const growth = parseGrowth(c.yoy_growth);
                    const growthPct = maxGrowth > 0 ? (growth / maxGrowth) * 100 : 0;
                    const csatPct = (c.csat_score / maxCsat) * 100;

                    return (
                        <div key={c.name} className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded bg-white border border-[#E4E4E7] flex items-center justify-center overflow-hidden">
                                    {c.logoUrl ? <img src={c.logoUrl} alt="" className="w-4 h-4 object-contain" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} /> : <span className="text-[8px] font-bold">{c.name.substring(0,2)}</span>}
                                </div>
                                <span className={`text-sm font-bold ${cc.textDark}`}>{c.name.split('(')[0]?.trim()}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {/* Growth */}
                                <div className={`group flex items-center gap-2 ${highlightMode ? 'bg-amber-50/50 rounded-lg px-1' : ''}`}>
                                    <span className="text-[10px] text-[#A1A1AA] w-12 shrink-0">Growth</span>
                                    <div className="flex-1 h-5 bg-[#FAFAFA] border border-[#E4E4E7] rounded overflow-hidden">
                                        <div className={`h-full rounded transition-all duration-700`} style={{ width: `${growthPct}%`, backgroundColor: cc.accent }} />
                                    </div>
                                    <span className="text-xs font-bold text-emerald-600 w-12 text-right">{c.yoy_growth}</span>
                                    <CopyMetricBtn value={c.yoy_growth} />
                                </div>

                                {/* CSAT */}
                                <div className={`group flex items-center gap-2 ${highlightMode ? 'bg-amber-50/50 rounded-lg px-1' : ''}`}>
                                    <span className="text-[10px] text-[#A1A1AA] w-12 shrink-0">CSAT</span>
                                    <div className="flex-1 h-5 bg-[#FAFAFA] border border-[#E4E4E7] rounded overflow-hidden">
                                        <div className="h-full rounded transition-all duration-700 bg-blue-500" style={{ width: `${csatPct}%` }} />
                                    </div>
                                    <span className="text-xs font-bold text-blue-600 w-12 text-right">{c.csat_score}/100</span>
                                    <CopyMetricBtn value={`${c.csat_score}/100`} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex gap-6 mt-5 justify-center">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-emerald-500" /><span className="text-[10px] text-[#71717A]">YoY Growth</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-blue-500" /><span className="text-[10px] text-[#71717A]">CSAT Score</span></div>
            </div>
        </div>
    );
};

// ==================== PRODUCT & FUNDING COMPARISON ====================

const ProductComparisonPanel: React.FC<{ companies: typeof HERO_COMPANIES }> = ({ companies }) => (
    <div className="bg-white border border-[#E4E4E7] rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] flex items-center justify-center">
                <Package className="text-[#F97316]" size={20} />
            </div>
            <div>
                <h3 className="font-bold text-[#18181B]">Product & Service Portfolio</h3>
                <p className="text-xs text-[#71717A]">Side-by-side product comparison</p>
            </div>
        </div>

        <div className={`grid gap-4 ${companies.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-' + Math.min(companies.length, 3)}`}>
            {companies.map((c, idx) => {
                const cc = COMPANY_COLORS[idx % COMPANY_COLORS.length]!;
                const products = (c.products_new || c.products || '').split(',').map(p => p.trim()).filter(Boolean);
                return (
                    <div key={c.name} className={`rounded-xl border p-4 ${cc.bgLight} border-transparent`}>
                        <h4 className={`text-sm font-bold ${cc.textDark} mb-3 flex items-center gap-2`}>
                            <CircleDot size={14} />
                            {shortName(c.name)} Products
                        </h4>
                        <div className="space-y-1.5">
                            {products.slice(0, 8).map((prod, i) => (
                                <div key={i} className="flex items-start gap-2">
                                    <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0`} style={{ backgroundColor: cc.accent }} />
                                    <span className="text-xs text-[#18181B] leading-relaxed">{prod}</span>
                                </div>
                            ))}
                        </div>

                        {/* Target Audience */}
                        {c.target_audience && c.target_audience.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-[#E4E4E7]/50">
                                <p className="text-[10px] font-bold text-[#71717A] uppercase mb-2">Target Audience</p>
                                <div className="flex flex-wrap gap-1">
                                    {c.target_audience.slice(0, 4).map((a, i) => (
                                        <span key={i} className="inline-block px-2 py-1 rounded-lg bg-white border border-[#E4E4E7] text-[10px] text-[#18181B]">{a}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    </div>
);

// ==================== TECH STACK COMPARISON ====================

const TechStackComparison: React.FC<{ companies: typeof HERO_COMPANIES }> = ({ companies }) => {
    const allTechs = useMemo(() => {
        const set = new Set<string>();
        companies.forEach(c => (c.tech_stack || []).forEach(t => set.add(t)));
        return Array.from(set).sort();
    }, [companies]);

    return (
        <div className="bg-white border border-[#E4E4E7] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center">
                    <Zap className="text-cyan-600" size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-[#18181B]">Technology Stack Comparison</h3>
                    <p className="text-xs text-[#71717A]">Core technologies used by each company</p>
                </div>
            </div>

            <div className="overflow-x-auto -mx-1">
                <table className="w-full min-w-[500px]">
                    <thead>
                        <tr className="bg-[#FAFAFA]">
                            <th className="px-4 py-2 text-left text-xs font-bold text-[#71717A] uppercase">Technology</th>
                            {companies.map((c, idx) => {
                                const cc = COMPANY_COLORS[idx % COMPANY_COLORS.length]!;
                                return (
                                    <th key={c.name} className="px-4 py-2 text-center">
                                        <span className={`text-xs font-bold ${cc.textDark}`}>{shortName(c.name)}</span>
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F4F4F5]">
                        {allTechs.map(tech => (
                            <tr key={tech} className="hover:bg-[#FAFAFA]">
                                <td className="px-4 py-2 text-xs text-[#18181B] font-medium">{tech}</td>
                                {companies.map((c, idx) => {
                                    const has = (c.tech_stack || []).some(t => t.toLowerCase() === tech.toLowerCase());
                                    const cc = COMPANY_COLORS[idx % COMPANY_COLORS.length]!;
                                    return (
                                        <td key={c.name} className="px-4 py-2 text-center">
                                            {has ? (
                                                <CheckCircle size={16} className={cc.textDark} />
                                            ) : (
                                                <span className="text-[#D4D4D8]">&mdash;</span>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Summary tags per company */}
            <div className={`grid gap-4 mt-5 ${companies.length === 2 ? 'grid-cols-2' : 'grid-cols-' + Math.min(companies.length, 3)}`}>
                {companies.map((c, idx) => {
                    const cc = COMPANY_COLORS[idx % COMPANY_COLORS.length]!;
                    return (
                        <div key={c.name}>
                            <p className={`text-[10px] font-bold ${cc.textDark} uppercase mb-1.5`}>{shortName(c.name)} Stack</p>
                            <div className="flex flex-wrap gap-1">
                                {(c.tech_stack || []).map((tech, i) => (
                                    <span key={i} className="px-2 py-1 bg-[#FAFAFA] border border-[#E4E4E7] rounded-lg text-[10px] text-[#18181B] font-medium">{tech}</span>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// ==================== VULNERABILITIES COMPARISON ====================

const VulnerabilitiesComparison: React.FC<{ companies: typeof HERO_COMPANIES }> = ({ companies }) => (
    <div className="bg-white border border-[#E4E4E7] rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <Shield className="text-amber-600" size={20} />
            </div>
            <div>
                <h3 className="font-bold text-[#18181B]">Competitive Vulnerabilities</h3>
                <p className="text-xs text-[#71717A]">Known pain points and competitive weaknesses</p>
            </div>
        </div>

        <div className={`grid gap-4 ${companies.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-' + Math.min(companies.length, 3)}`}>
            {companies.map((c, idx) => {
                const cc = COMPANY_COLORS[idx % COMPANY_COLORS.length]!;
                return (
                    <div key={c.name}>
                        <h4 className={`text-sm font-bold ${cc.textDark} mb-3 flex items-center gap-2`}>
                            <Flag size={14} />
                            {shortName(c.name)} Vulnerabilities
                        </h4>
                        <div className="space-y-2">
                            {(c.key_pain_points || []).slice(0, 5).map((pain, i) => (
                                <div key={i} className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100">
                                    <Flag size={12} className="text-amber-500 mt-0.5 shrink-0" />
                                    <span className="text-xs text-[#18181B] leading-relaxed">{pain}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
);

// ==================== RECENT EVENTS COMPARISON ====================

const RecentEventsComparison: React.FC<{ companies: typeof HERO_COMPANIES }> = ({ companies }) => (
    <div className="bg-white border border-[#E4E4E7] rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-[#FFF1F2] flex items-center justify-center">
                <Rocket className="text-[#E11D48]" size={20} />
            </div>
            <div>
                <h3 className="font-bold text-[#18181B]">Recent Events & Milestones</h3>
                <p className="text-xs text-[#71717A]">Latest developments from selected companies</p>
            </div>
        </div>

        <div className={`grid gap-4 ${companies.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-' + Math.min(companies.length, 3)}`}>
            {companies.map((c, idx) => {
                const cc = COMPANY_COLORS[idx % COMPANY_COLORS.length]!;
                return (
                    <div key={c.name}>
                        <h4 className={`text-sm font-bold ${cc.textDark} mb-3 flex items-center gap-2`}>
                            <Briefcase size={14} />
                            {shortName(c.name)}
                        </h4>
                        <div className="space-y-2">
                            {(c.recent_events || []).slice(0, 5).map((event, i) => (
                                <div key={i} className="flex items-start gap-2 p-3 bg-[#FAFAFA] rounded-xl border border-[#E4E4E7]">
                                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: cc.accent }} />
                                    <span className="text-xs text-[#18181B] leading-relaxed">{event}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
);

// ==================== MAIN COMPONENT ====================

// ==================== SECTION IDS FOR BOOKMARKS ====================

const SECTION_IDS = [
    { id: 'hero-cards', label: 'Company Overview' },
    { id: 'market-map', label: 'Market Map' },
    { id: 'head-to-head', label: 'Head-to-Head' },
    { id: 'growth-csat', label: 'Growth vs CSAT' },
    { id: 'products', label: 'Product Portfolio' },
    { id: 'tech-stack', label: 'Tech Stack' },
    { id: 'recent-events', label: 'Recent Events' },
    { id: 'vulnerabilities', label: 'Vulnerabilities' },
] as const;

// ==================== SECTION WRAPPER (bookmark + note + highlight ring) ====================

const SectionWrapper: React.FC<{
    id: string;
    highlight: boolean;
    bookmarked: boolean;
    onToggleBookmark: () => void;
    children: React.ReactNode;
}> = ({ id, highlight, bookmarked, onToggleBookmark, children }) => (
    <div id={id} className={`relative transition-all duration-300 ${highlight ? 'ring-2 ring-amber-400 ring-offset-2 rounded-2xl shadow-lg shadow-amber-100' : ''}`}>
        {/* Floating action buttons — top‑right */}
        <div className="absolute -top-2 right-3 z-10 flex items-center gap-1">
            <button
                onClick={onToggleBookmark}
                title={bookmarked ? 'Remove bookmark' : 'Bookmark this section'}
                className={`p-1.5 rounded-lg border shadow-sm transition-colors ${
                    bookmarked
                        ? 'bg-amber-50 border-amber-300 text-amber-600 hover:bg-amber-100'
                        : 'bg-white border-[#E4E4E7] text-[#A1A1AA] hover:text-[#E11D48] hover:border-[#FFE4E6]'
                }`}
            >
                {bookmarked ? <BookmarkCheck size={13} /> : <Bookmark size={13} />}
            </button>
        </div>
        {children}
        <SectionNote sectionId={id} />
    </div>
);

// ==================== MAIN COMPONENT ====================

export const CompetitorAnalysisPage: React.FC<CompetitorAnalysisPageProps> = ({ userData: _userData, competitors }) => {
    // Match competitors from onboarding against HERO_COMPANIES by name (fuzzy)
    const selectedCompanies = useMemo(() => {
        const inputNames: string[] = (competitors || []).map((c: any) => (c.name || '').toLowerCase().trim());
        if (inputNames.length === 0) return HERO_COMPANIES.slice(0, 3); // fallback

        return HERO_COMPANIES.filter(hero => {
            const heroLower = hero.name.toLowerCase();
            return inputNames.some(input =>
                heroLower.includes(input) || input.includes(heroLower) ||
                heroLower.split('(')[0]?.trim() === input.split('(')[0]?.trim() ||
                heroLower.startsWith(input.split(' ')[0] || '') && input.length > 2
            );
        });
    }, [competitors]);

    const selectedNames = useMemo(() => selectedCompanies.map(c => c.name), [selectedCompanies]);

    // ── Feature state ──
    const [showExportModal, setShowExportModal] = useState(false);
    const [highlightMode, setHighlightMode] = useState(false);
    const [activeSection, setActiveSection] = useState<string>('');
    const observerRef = useRef<IntersectionObserver | null>(null);

    // ── Scroll spy — IntersectionObserver tracks which section is in the viewport ──
    useEffect(() => {
        // Clean up previous observer
        if (observerRef.current) observerRef.current.disconnect();

        const visibleMap = new Map<string, number>();

        observerRef.current = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        visibleMap.set(entry.target.id, entry.intersectionRatio);
                    } else {
                        visibleMap.delete(entry.target.id);
                    }
                });

                // Pick the section with the highest intersection ratio
                let bestId = '';
                let bestRatio = 0;
                visibleMap.forEach((ratio, id) => {
                    if (ratio > bestRatio) { bestRatio = ratio; bestId = id; }
                });

                // Fallback: if no best by ratio, pick topmost visible section in DOM order
                if (!bestId && visibleMap.size > 0) {
                    for (const s of SECTION_IDS) {
                        if (visibleMap.has(s.id)) { bestId = s.id; break; }
                    }
                }

                if (bestId) setActiveSection(bestId);
            },
            { threshold: [0, 0.2, 0.4, 0.6, 0.8, 1], rootMargin: '-80px 0px -30% 0px' }
        );

        // Observe all section elements
        SECTION_IDS.forEach(s => {
            const el = document.getElementById(s.id);
            if (el) observerRef.current!.observe(el);
        });

        return () => { observerRef.current?.disconnect(); };
    }, [selectedCompanies]); // re-bind when companies change

    const [bookmarkedSections, setBookmarkedSections] = useState<Set<string>>(() => {
        try {
            const saved = localStorage.getItem('vico_competitor_bookmarks');
            return saved ? new Set(JSON.parse(saved)) : new Set();
        } catch { return new Set(); }
    });

    const toggleBookmarkSection = useCallback((id: string) => {
        setBookmarkedSections(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            localStorage.setItem('vico_competitor_bookmarks', JSON.stringify(Array.from(next)));
            return next;
        });
    }, []);

    const handleExport = useCallback((format: 'html' | 'txt' | 'json') => {
        const data = selectedCompanies as unknown as CompetitorExportData[];
        if (format === 'html') exportCompetitorReportHTML(data);
        else if (format === 'json') exportCompetitorReportJSON(data);
        else exportCompetitorReportTXT(data);
    }, [selectedCompanies]);

    // If no matches found, show a friendly fallback
    if (selectedCompanies.length === 0) {
        return (
            <div className="space-y-6 animate-fade-in">
                <div>
                    <div className="inline-flex items-center gap-2 bg-[#FFF1F2] px-3 py-1 rounded-full mb-2">
                        <Rocket className="w-3.5 h-3.5 text-[#E11D48]" />
                        <span className="text-[10px] font-bold text-[#E11D48] uppercase tracking-wider">Competitor Intelligence Engine</span>
                    </div>
                    <h1 className="text-3xl font-black text-[#18181B] uppercase tracking-tight">Competitor Analysis</h1>
                </div>
                <div className="bg-white border border-[#E4E4E7] rounded-2xl p-12 text-center">
                    <Target className="w-12 h-12 text-[#A1A1AA] mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-[#18181B] mb-1">No matching companies found</h3>
                    <p className="text-sm text-[#71717A]">
                        The competitors selected during onboarding could not be matched to our premium database.
                        Please go back and update your competitor selections.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="inline-flex items-center gap-2 bg-[#FFF1F2] px-3 py-1 rounded-full">
                        <Rocket className="w-3.5 h-3.5 text-[#E11D48]" />
                        <span className="text-[10px] font-bold text-[#E11D48] uppercase tracking-wider">Competitor Intelligence Engine</span>
                    </div>
                </div>
                <h1 className="text-3xl font-black text-[#18181B] uppercase tracking-tight">
                    Competitor Analysis
                </h1>
                <p className="text-[#71717A] text-sm mt-1">
                    Head-to-head competitive comparison for your selected competitors
                </p>
            </div>

            {/* ── Floating Toolbar ── */}
            <div className="bg-white border border-[#E4E4E7] rounded-2xl p-3 flex flex-wrap items-center gap-2 sticky top-0 z-30 shadow-sm">
                {/* Export */}
                <button
                    onClick={() => setShowExportModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#E11D48] text-white hover:bg-[#BE123C] transition-colors shadow-sm"
                >
                    <Download size={13} /> Export Report
                </button>

                {/* Highlight Mode */}
                <button
                    onClick={() => setHighlightMode(h => !h)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors border ${
                        highlightMode
                            ? 'bg-amber-50 text-amber-700 border-amber-300'
                            : 'bg-white text-[#71717A] border-[#E4E4E7] hover:text-amber-600 hover:border-amber-300'
                    }`}
                >
                    <Highlighter size={13} /> {highlightMode ? 'Highlight Off' : 'Highlight'}
                </button>

                {/* Print */}
                <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-[#71717A] border border-[#E4E4E7] hover:text-[#18181B] hover:border-[#A1A1AA] transition-colors"
                >
                    <Printer size={13} /> Print
                </button>

                {/* Divider */}
                <div className="w-px h-6 bg-[#E4E4E7] mx-1" />

                {/* Section navigation with scroll-spy active indicator */}
                {SECTION_IDS.map(s => {
                    const isActive = activeSection === s.id;
                    const isBookmarked = bookmarkedSections.has(s.id);
                    return (
                        <button
                            key={s.id}
                            onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all duration-200 border ${
                                isActive
                                    ? 'bg-[#E11D48] text-white border-[#E11D48] shadow-sm shadow-[#E11D48]/20 scale-[1.04]'
                                    : isBookmarked
                                        ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                                        : 'bg-white text-[#A1A1AA] border-transparent hover:text-[#71717A] hover:bg-[#FAFAFA]'
                            }`}
                            title={s.label}
                        >
                            {isBookmarked && !isActive && <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 mr-1" />}
                            {s.label}
                        </button>
                    );
                })}
            </div>

            {/* Export Modal */}
            <ExportModal show={showExportModal} onClose={() => setShowExportModal(false)} onExport={handleExport} />

            {/* Summary Bar */}
            <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF1F2] text-[#E11D48] text-xs font-bold">
                    <Sparkles size={12} /> Instant Comparison
                </span>
                <span className="text-sm text-[#71717A]">
                    {selectedCompanies.map(c => shortName(c.name)).join(' vs ')}
                </span>
                <span className="text-xs text-[#A1A1AA]">
                    ({selectedCompanies.length} companies from your onboarding selections)
                </span>
            </div>

            {/* Hero Cards */}
            <SectionWrapper id="hero-cards" highlight={highlightMode} bookmarked={bookmarkedSections.has('hero-cards')} onToggleBookmark={() => toggleBookmarkSection('hero-cards')}>
                <ComparisonHeroCards companies={selectedCompanies} highlightMode={highlightMode} />
            </SectionWrapper>

            {/* Market Map + Share */}
            <SectionWrapper id="market-map" highlight={highlightMode} bookmarked={bookmarkedSections.has('market-map')} onToggleBookmark={() => toggleBookmarkSection('market-map')}>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <MarketMapQuadrant companies={HERO_COMPANIES} selectedNames={selectedNames} />
                    <MarketShareComparison companies={selectedCompanies} highlightMode={highlightMode} />
                </div>
            </SectionWrapper>

            {/* Head-to-Head Table */}
            <SectionWrapper id="head-to-head" highlight={highlightMode} bookmarked={bookmarkedSections.has('head-to-head')} onToggleBookmark={() => toggleBookmarkSection('head-to-head')}>
                <HeadToHeadTable companies={selectedCompanies} highlightMode={highlightMode} />
            </SectionWrapper>

            {/* Growth vs CSAT */}
            <SectionWrapper id="growth-csat" highlight={highlightMode} bookmarked={bookmarkedSections.has('growth-csat')} onToggleBookmark={() => toggleBookmarkSection('growth-csat')}>
                <GrowthCsatComparison companies={selectedCompanies} highlightMode={highlightMode} />
            </SectionWrapper>

            {/* Product portfolios */}
            <SectionWrapper id="products" highlight={highlightMode} bookmarked={bookmarkedSections.has('products')} onToggleBookmark={() => toggleBookmarkSection('products')}>
                <ProductComparisonPanel companies={selectedCompanies} />
            </SectionWrapper>

            {/* Tech Stack */}
            <SectionWrapper id="tech-stack" highlight={highlightMode} bookmarked={bookmarkedSections.has('tech-stack')} onToggleBookmark={() => toggleBookmarkSection('tech-stack')}>
                <TechStackComparison companies={selectedCompanies} />
            </SectionWrapper>

            {/* Recent Events */}
            <SectionWrapper id="recent-events" highlight={highlightMode} bookmarked={bookmarkedSections.has('recent-events')} onToggleBookmark={() => toggleBookmarkSection('recent-events')}>
                <RecentEventsComparison companies={selectedCompanies} />
            </SectionWrapper>

            {/* Vulnerabilities */}
            <SectionWrapper id="vulnerabilities" highlight={highlightMode} bookmarked={bookmarkedSections.has('vulnerabilities')} onToggleBookmark={() => toggleBookmarkSection('vulnerabilities')}>
                <VulnerabilitiesComparison companies={selectedCompanies} />
            </SectionWrapper>

            {/* Data Sources & Methodology Footer */}
            <div className="bg-white border border-[#E4E4E7] rounded-2xl p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Database className="w-4 h-4 text-[#A1A1AA]" />
                            <span className="text-xs font-semibold text-[#18181B]">Data Sources &amp; Methodology</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {[
                                'VICO Company Database (10,000+ companies)',
                                'CafeF & VnExpress Financials',
                                'Gartner & ISG Analyst Reports',
                                'Company Annual Reports & IR Filings',
                                'Vietnam Enterprise Registration (DPI)',
                                'Crunchbase & PitchBook Funding Data',
                            ].map((src, idx) => (
                                <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FAFAFA] border border-[#E4E4E7] text-[10px] text-[#71717A]">
                                    <CheckCircle className="w-2.5 h-2.5 text-emerald-500" />
                                    {src}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="text-right shrink-0">
                        <p className="text-[10px] text-[#A1A1AA] leading-relaxed">
                            Last verified: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                        </p>
                        <p className="text-[10px] text-[#A1A1AA]">
                            VICO Intelligence &middot; Competitive Analysis
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompetitorAnalysisPage;
