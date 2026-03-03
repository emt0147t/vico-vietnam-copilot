/**
 * Customer Insights Page - Static Pre-Researched Data
 *
 * Phase 16 rewrite: Renders hyper-realistic customer-insights data
 * from the CompanyProfile.customer_insights field for Hero Companies.
 * Zero AI / Gemini calls - instant render, zero hallucination.
 *
 * Design system: Executive Crimson (tw helpers + Bento Grid)
 */

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  ChevronDown, ChevronUp, Users, Target, Building2,
  AlertTriangle, CheckCircle, Zap,
  DollarSign, User, MapPin, Quote,
  Flag, BarChart3, Search, Lock, Globe, Cpu,
  Megaphone, FileText, Database,
  Download, X, FileJson, Highlighter,
  StickyNote, Copy, Check, Printer,
  Bookmark, BookmarkCheck, Eye
} from 'lucide-react';
import { COMPANIES, type CompanyProfile } from '../data/companies';
import {
  exportCustomerInsightsHTML,
  exportCustomerInsightsJSON,
  exportCustomerInsightsTXT,
  type CustomerExportInsights,
} from '../utils/exportCustomerInsightsHTML';

// ==================== HELPERS ====================

/** Hero companies with customer_insights populated */
const ENRICHED_COMPANIES = COMPANIES.filter(
  (c): c is CompanyProfile & { customer_insights: NonNullable<CompanyProfile['customer_insights']> } =>
    c.dataTier === 'premium' && !!c.customer_insights
);

type CustomerInsights = NonNullable<CompanyProfile['customer_insights']>;

interface CustomerInsightsPageProps {
  userData?: any;
}

// Severity / urgency color maps
const severityColors: Record<string, string> = {
  critical: 'bg-red-100 text-red-700 border-red-300',
  high:     'bg-amber-100 text-amber-700 border-amber-300',
  medium:   'bg-blue-100 text-blue-700 border-blue-300',
  low:      'bg-zinc-100 text-zinc-600 border-zinc-300',
};

const urgencyBg: Record<string, string> = {
  critical: 'bg-red-500',
  high:     'bg-amber-500',
  medium:   'bg-blue-500',
  low:      'bg-zinc-400',
};

// ==================== SUB-COMPONENTS ====================

// --- Executive Summary ---
const ExecutiveSummarySection: React.FC<{ data: CustomerInsights; company: CompanyProfile; highlightMode?: boolean }> = ({ data, highlightMode }) => (
  <div className="space-y-6">
    {/* Hero card */}
    <div className="bg-white border border-[#E4E4E7] rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-1 h-8 bg-[#E11D48] rounded-full" />
        <h3 className="font-bold text-lg text-[#18181B]">Executive Summary</h3>
      </div>
      <p className="text-[#71717A] leading-relaxed text-sm">{data.executive_summary}</p>
    </div>

    {/* Positioning */}
    <div className="bg-gradient-to-br from-rose-50 to-orange-50 border border-rose-200 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <Target className="text-[#E11D48]" size={20} />
        <h4 className="font-bold text-[#18181B]">Positioning Statement</h4>
      </div>
      <p className="text-sm text-[#18181B] leading-relaxed italic">&quot;{data.positioning_statement}&quot;</p>
    </div>

    {/* Firmographics quick stats */}
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      <StatCard icon={<Building2 size={18} />} iconBg="bg-blue-100" iconColor="text-blue-600" label="Industry" value={data.firmographics.industry_vertical} highlightMode={highlightMode} />
      <StatCard icon={<Users size={18} />} iconBg="bg-purple-100" iconColor="text-purple-600" label="Employees" value={data.firmographics.employee_count} highlightMode={highlightMode} />
      <StatCard icon={<DollarSign size={18} />} iconBg="bg-green-100" iconColor="text-green-600" label="Revenue" value={data.firmographics.estimated_revenue} highlightMode={highlightMode} />
      <StatCard icon={<Globe size={18} />} iconBg="bg-amber-100" iconColor="text-amber-600" label="Ownership" value={data.firmographics.ownership} highlightMode={highlightMode} />
      <StatCard icon={<Cpu size={18} />} iconBg="bg-rose-100" iconColor="text-rose-600" label="Tech Maturity" value={data.firmographics.tech_maturity} highlightMode={highlightMode} />
      <StatCard icon={<MapPin size={18} />} iconBg="bg-teal-100" iconColor="text-teal-600" label="Markets" value={data.firmographics.geographic_focus.join(', ')} highlightMode={highlightMode} />
    </div>

    {/* Vietnam market notes */}
    <div className="bg-white border border-[#E4E4E7] rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <Flag className="text-[#E11D48]" size={18} />
        <h4 className="font-bold text-[#18181B]">Vietnam Market Notes</h4>
      </div>
      <ul className="space-y-3">
        {data.vietnam_market_notes.map((note, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-[#71717A]">
            <span className="mt-0.5 w-5 h-5 rounded-full bg-rose-100 text-[#E11D48] flex items-center justify-center text-[10px] font-bold shrink-0">{i + 1}</span>
            {note}
          </li>
        ))}
      </ul>
    </div>
  </div>
);

const StatCard: React.FC<{ icon: React.ReactNode; iconBg: string; iconColor: string; label: string; value: string; highlightMode?: boolean }> = ({ icon, iconBg, iconColor, label, value, highlightMode }) => {
  const [copied, setCopied] = useState(false);
  const doCopy = () => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1200); };
  return (
    <div className={`bg-white border border-[#E4E4E7] rounded-2xl p-5 relative group transition-all ${highlightMode ? 'ring-2 ring-yellow-300 bg-yellow-50/30' : ''}`}>
      <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center ${iconColor} mb-3`}>{icon}</div>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-[#A1A1AA] mb-1">{label}</p>
      <p className="text-sm font-semibold text-[#18181B] leading-snug">{value}</p>
      <button onClick={doCopy} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-zinc-100 print:hidden" title="Copy">
        {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} className="text-zinc-400" />}
      </button>
    </div>
  );
};

// --- Buyer Personas ---
const BuyerPersonasSection: React.FC<{ data: CustomerInsights }> = ({ data }) => {
  const [expanded, setExpanded] = useState<number | null>(0);

  const roleColors: Record<string, string> = {
    'Decision Maker': 'bg-green-100 text-green-700',
    'Influencer':     'bg-blue-100 text-blue-700',
    'Champion':       'bg-purple-100 text-purple-700',
    'Gatekeeper':     'bg-amber-100 text-amber-700',
    'End User':       'bg-zinc-100 text-zinc-600',
  };

  return (
    <div className="space-y-4">
      {data.buyer_personas.map((persona, idx) => (
        <div key={idx} className="bg-white border border-[#E4E4E7] rounded-2xl overflow-hidden">
          {/* Header */}
          <div
            className="flex items-center justify-between p-5 cursor-pointer hover:bg-[#FAFAFA] transition-colors"
            onClick={() => setExpanded(expanded === idx ? null : idx)}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-100 to-orange-100 flex items-center justify-center">
                <User size={22} className="text-[#E11D48]" />
              </div>
              <div>
                <p className="font-bold text-[#18181B]">{persona.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-[#71717A]">{persona.department} &middot; {persona.seniority}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${roleColors[persona.decision_role] || 'bg-zinc-100 text-zinc-600'}`}>
                    {persona.decision_role}
                  </span>
                </div>
              </div>
            </div>
            {expanded === idx ? <ChevronUp size={16} className="text-[#A1A1AA]" /> : <ChevronDown size={16} className="text-[#A1A1AA]" />}
          </div>

          {/* Expanded Details */}
          {expanded === idx && (
            <div className="px-5 pb-5 border-t border-[#E4E4E7] space-y-5">
              {/* Quote */}
              {persona.quote_snippet && (
                <div className="mt-4 p-4 bg-rose-50 rounded-xl border-l-4 border-[#E11D48]">
                  <Quote size={14} className="text-[#E11D48] mb-1" />
                  <p className="text-sm italic text-[#71717A]">&quot;{persona.quote_snippet}&quot;</p>
                </div>
              )}

              <div className="grid lg:grid-cols-2 gap-4 mt-3">
                {/* KPIs */}
                <div className="p-4 bg-green-50 rounded-xl">
                  <p className="text-xs font-bold text-green-700 mb-2 uppercase tracking-wider">KPIs They Track</p>
                  <ul className="space-y-1.5">
                    {persona.kpis.map((kpi, i) => (
                      <li key={i} className="text-sm text-[#71717A] flex items-center gap-2">
                        <BarChart3 size={12} className="text-green-600 shrink-0" />{kpi}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pain Points */}
                <div className="p-4 bg-red-50 rounded-xl">
                  <p className="text-xs font-bold text-red-700 mb-2 uppercase tracking-wider">Pain Points</p>
                  <ul className="space-y-1.5">
                    {persona.pain_points.map((pp, i) => (
                      <li key={i} className="text-sm text-[#71717A] flex items-center gap-2">
                        <AlertTriangle size={12} className="text-red-500 shrink-0" />{pp}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Channels */}
              <div className="p-4 bg-[#FAFAFA] rounded-xl">
                <p className="text-xs font-bold text-[#71717A] mb-2 uppercase tracking-wider">Preferred Channels</p>
                <div className="flex flex-wrap gap-2">
                  {persona.preferred_channels.map((ch, i) => (
                    <span key={i} className="px-3 py-1 bg-white border border-[#E4E4E7] rounded-lg text-xs text-[#71717A]">{ch}</span>
                  ))}
                </div>
              </div>

              {/* Vietnam Behavior */}
              {persona.vietnam_behavior && (
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <p className="text-xs font-bold text-amber-700 mb-1 flex items-center gap-1"><Flag size={12} /> Vietnam-specific Behavior</p>
                  <p className="text-sm text-[#71717A]">{persona.vietnam_behavior}</p>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// --- Buying Triggers ---
const BuyingTriggersSection: React.FC<{ data: CustomerInsights }> = ({ data }) => (
  <div className="space-y-6">
    <div className="bg-white border border-[#E4E4E7] rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
          <Zap className="text-amber-600" size={20} />
        </div>
        <div>
          <h4 className="font-bold text-[#18181B]">Buying Triggers</h4>
          <p className="text-xs text-[#71717A]">Events that create urgent buying intent</p>
        </div>
      </div>
      <div className="space-y-4">
        {data.buying_triggers.map((trigger, idx) => (
          <div key={idx} className="p-5 bg-[#FAFAFA] rounded-xl border border-[#E4E4E7]">
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-xl text-white flex items-center justify-center shrink-0 ${urgencyBg[trigger.urgency]}`}>
                <Zap size={18} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-[#18181B]">{trigger.event}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${severityColors[trigger.urgency]}`}>
                    {trigger.urgency.toUpperCase()}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500 border border-zinc-200">
                    {trigger.category}
                  </span>
                </div>
                <p className="text-sm text-[#71717A] mt-2">{trigger.description}</p>
                {trigger.vietnam_context && (
                  <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                    <p className="text-xs text-amber-700 font-medium flex items-center gap-1"><Flag size={11} /> Vietnam Context</p>
                    <p className="text-sm text-[#71717A] mt-1">{trigger.vietnam_context}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// --- Pain Points Detailed ---
const PainPointsDetailedSection: React.FC<{ data: CustomerInsights }> = ({ data }) => (
  <div className="space-y-6">
    <div className="bg-white border border-[#E4E4E7] rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
          <AlertTriangle className="text-red-600" size={20} />
        </div>
        <div>
          <h4 className="font-bold text-[#18181B]">Pain Points (Detailed)</h4>
          <p className="text-xs text-[#71717A]">Deep analysis of challenges, workarounds, and cost of inaction</p>
        </div>
      </div>
      <div className="space-y-4">
        {data.pain_points_detailed.map((pp, idx) => (
          <div key={idx} className="p-5 bg-[#FAFAFA] rounded-xl border-l-4" style={{ borderLeftColor: pp.severity === 'critical' ? '#ef4444' : pp.severity === 'high' ? '#f59e0b' : '#3b82f6' }}>
            <div className="flex items-start justify-between mb-3">
              <p className="font-semibold text-[#18181B]">{pp.title}</p>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-3 ${severityColors[pp.severity]}`}>
                {pp.severity.toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-[#71717A] mb-4">{pp.description}</p>
            <div className="grid lg:grid-cols-2 gap-4">
              <div className="p-3 bg-white rounded-lg border border-[#E4E4E7]">
                <p className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider mb-1">Current Workaround</p>
                <p className="text-sm text-[#71717A]">{pp.current_workaround}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-1">Cost of Inaction</p>
                <p className="text-sm text-red-700 font-medium">{pp.cost_of_inaction}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// --- Recommended Channels ---
const ChannelsSection: React.FC<{ data: CustomerInsights }> = ({ data }) => (
  <div className="space-y-6">
    <div className="bg-white border border-[#E4E4E7] rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
          <Megaphone className="text-purple-600" size={20} />
        </div>
        <div>
          <h4 className="font-bold text-[#18181B]">Recommended GTM Channels</h4>
          <p className="text-xs text-[#71717A]">Best channels to reach and convert this company's buyers</p>
        </div>
      </div>
      <div className="grid lg:grid-cols-2 gap-3">
        {data.recommended_channels.map((channel, idx) => (
          <div key={idx} className="flex items-center gap-3 p-4 bg-[#FAFAFA] rounded-xl border border-[#E4E4E7]">
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xs shrink-0">{idx + 1}</div>
            <p className="text-sm text-[#18181B] font-medium">{channel}</p>
          </div>
        ))}
      </div>
    </div>

    {/* Vietnam market notes */}
    <div className="bg-white border border-[#E4E4E7] rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <Flag className="text-[#E11D48]" size={18} />
        <h4 className="font-bold text-[#18181B]">Vietnam Market Intelligence</h4>
      </div>
      <ul className="space-y-3">
        {data.vietnam_market_notes.map((note, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-[#71717A]">
            <span className="mt-0.5 w-5 h-5 rounded-full bg-rose-100 text-[#E11D48] flex items-center justify-center text-[10px] font-bold shrink-0">{i + 1}</span>
            {note}
          </li>
        ))}
      </ul>
    </div>
  </div>
);


// ==================== USER SUPPORT COMPONENTS ====================

/** Inline note per section — saved in localStorage */
const SectionNote: React.FC<{ sectionId: string }> = ({ sectionId }) => {
  const key = `vico_ci_note_${sectionId}`;
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(() => localStorage.getItem(key) || '');
  const save = (v: string) => { setValue(v); localStorage.setItem(key, v); };

  return (
    <div className="mt-3 print:hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${value ? 'text-amber-600' : 'text-[#A1A1AA] hover:text-[#71717A]'}`}
      >
        <StickyNote size={13} />
        {value ? 'Ghi chú đã lưu' : 'Thêm ghi chú'}
      </button>
      {open && (
        <div className="mt-2 bg-amber-50/50 border border-amber-200 rounded-xl p-3">
          <textarea
            value={value}
            onChange={e => save(e.target.value)}
            placeholder="Viết ghi chú cho mục này..."
            className="w-full bg-transparent text-sm text-[#18181B] placeholder:text-amber-300 resize-none focus:outline-none min-h-[56px]"
            rows={2}
          />
          <div className="flex items-center justify-between mt-1">
            <span className="text-[10px] text-amber-400">{value.length > 0 ? 'Tự động lưu' : ''}</span>
            {value && (
              <button onClick={() => save('')} className="text-[10px] text-red-400 hover:text-red-600 transition-colors">Xóa</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/** Export modal — HTML / JSON / TXT */
const ExportModal: React.FC<{
  onClose: () => void;
  companyName: string;
  insights: CustomerInsights;
}> = ({ onClose, companyName, insights }) => {
  const formats: { id: string; label: string; desc: string; icon: React.ReactNode; action: () => void }[] = [
    {
      id: 'html', label: 'HTML Report', desc: 'Báo cáo chuyên nghiệp với VICO branding',
      icon: <Eye size={18} className="text-[#E11D48]" />,
      action: () => exportCustomerInsightsHTML(companyName, insights as unknown as CustomerExportInsights),
    },
    {
      id: 'json', label: 'JSON Data', desc: 'Dữ liệu thô cho phân tích kỹ thuật',
      icon: <FileJson size={18} className="text-blue-500" />,
      action: () => exportCustomerInsightsJSON(companyName, insights as unknown as CustomerExportInsights),
    },
    {
      id: 'txt', label: 'Plain Text', desc: 'Văn bản thuần — chia sẻ nhanh qua email / Slack',
      icon: <FileText size={18} className="text-zinc-500" />,
      action: () => exportCustomerInsightsTXT(companyName, insights as unknown as CustomerExportInsights),
    },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm print:hidden" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl border border-[#E4E4E7] w-full max-w-md mx-4 overflow-hidden animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E4E4E7]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FFF1F2] flex items-center justify-center">
              <Download size={16} className="text-[#E11D48]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#18181B]">Xuất báo cáo Customer Insights</h3>
              <p className="text-[10px] text-[#A1A1AA]">{companyName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-100 transition-colors">
            <X size={16} className="text-[#A1A1AA]" />
          </button>
        </div>
        <div className="p-4 space-y-2">
          {formats.map(f => (
            <button
              key={f.id}
              onClick={() => { f.action(); onClose(); }}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-[#E4E4E7] hover:border-[#E11D48]/30 hover:bg-[#FFF1F2]/30 transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#F4F4F5] group-hover:bg-white flex items-center justify-center shrink-0">
                {f.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#18181B]">{f.label}</p>
                <p className="text-[11px] text-[#A1A1AA]">{f.desc}</p>
              </div>
              <Download size={14} className="text-[#A1A1AA] group-hover:text-[#E11D48] transition-colors shrink-0" />
            </button>
          ))}
        </div>
        <div className="px-6 py-3 bg-[#FAFAFA] border-t border-[#E4E4E7]">
          <p className="text-[10px] text-[#A1A1AA] text-center">Exported by VICO Intelligence · Customer Research</p>
        </div>
      </div>
    </div>
  );
};

// ==================== LOCKED / EMPTY STATE ====================
const LockedState: React.FC = () => (
  <div className="bg-gradient-to-br from-zinc-50 to-zinc-100 rounded-2xl border border-zinc-200 p-12 text-center">
    <div className="w-16 h-16 rounded-2xl bg-zinc-200 flex items-center justify-center mx-auto mb-4">
      <Lock className="text-zinc-400" size={28} />
    </div>
    <h3 className="text-xl font-bold text-[#18181B] mb-2">Insights Not Available</h3>
    <p className="text-[#71717A] mb-6 max-w-md mx-auto text-sm">
      Pre-researched customer insights are available for our 5 premium Hero Companies.
      Select one from the dropdown above to view instant, zero-hallucination buyer intelligence.
    </p>
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 max-w-3xl mx-auto">
      {ENRICHED_COMPANIES.map(c => (
        <div key={c.name} className="p-3 bg-white rounded-xl border border-[#E4E4E7] shadow-sm">
          <p className="text-xs font-semibold text-[#18181B] truncate">{c.name}</p>
        </div>
      ))}
    </div>
  </div>
);


// ==================== MAIN PAGE COMPONENT ====================
export const CustomerInsightsPage: React.FC<CustomerInsightsPageProps> = () => {
  const [selectedCompanyName, setSelectedCompanyName] = useState<string>(
    ENRICHED_COMPANIES[0]?.name || ''
  );
  const [activeSection, setActiveSection] = useState('overview');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  const [highlightMode, setHighlightMode] = useState(false);
  const [bookmarkedSections, setBookmarkedSections] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem('vico_ci_bookmarks') || '[]')); } catch { return new Set(); }
  });

  const toggleBookmark = useCallback((id: string) => {
    setBookmarkedSections(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      localStorage.setItem('vico_ci_bookmarks', JSON.stringify([...next]));
      return next;
    });
  }, []);

  const selectedCompany = useMemo(
    () => ENRICHED_COMPANIES.find(c => c.name === selectedCompanyName) ?? null,
    [selectedCompanyName]
  );

  const insights = selectedCompany?.customer_insights ?? null;

  // Filter dropdown options
  const filteredCompanies = useMemo(() => {
    if (!searchTerm.trim()) return ENRICHED_COMPANIES;
    const lower = searchTerm.toLowerCase();
    return ENRICHED_COMPANIES.filter(c => c.name.toLowerCase().includes(lower));
  }, [searchTerm]);

  const sections = [
    { id: 'overview',  label: 'Executive Summary',   icon: FileText },
    { id: 'personas',  label: 'Buyer Personas',      icon: Users },
    { id: 'triggers',  label: 'Buying Triggers',     icon: Zap },
    { id: 'pain',      label: 'Pain Points',         icon: AlertTriangle },
    { id: 'channels',  label: 'GTM Channels',        icon: Megaphone },
  ];

  /* ── Scroll-spy ── */
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!insights) return;
    const observer = new IntersectionObserver(
      entries => { for (const en of entries) { if (en.isIntersecting) setActiveSection(en.target.id); } },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 },
    );
    sections.forEach(s => { const el = sectionRefs.current[s.id]; if (el) observer.observe(el); });
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [insights, selectedCompanyName]);

  const scrollTo = useCallback((id: string) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handlePrint = () => window.print();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-black text-[#18181B] uppercase tracking-tight">
          Customer Insights
        </h1>
        <p className="text-[#71717A] text-sm mt-1">
          Pre-researched buyer intelligence for Vietnam&apos;s top technology companies
        </p>
      </div>

      {/* Company Selector */}
      <div className="bg-white border border-[#E4E4E7] rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E11D48] to-[#F97316] flex items-center justify-center">
            <Target className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#18181B]">Customer Intelligence Engine</h2>
            <p className="text-sm text-[#71717A]">Select a Hero Company for instant buyer insights</p>
          </div>
        </div>

        {/* Custom Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full flex items-center justify-between px-4 py-3 border border-[#E4E4E7] rounded-xl bg-white text-left hover:border-[#E11D48]/40 focus:ring-2 focus:ring-[#E11D48]/20 transition-all"
          >
            <div className="flex items-center gap-3">
              <Building2 size={18} className="text-[#E11D48]" />
              <div>
                <p className="font-semibold text-[#18181B] text-sm">{selectedCompanyName || 'Select a company...'}</p>
                {selectedCompany && (
                  <p className="text-[10px] text-[#A1A1AA]">{selectedCompany.sub_industry} &middot; {selectedCompany.size}</p>
                )}
              </div>
            </div>
            <ChevronDown size={16} className={`text-[#A1A1AA] transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute z-50 mt-2 w-full bg-white border border-[#E4E4E7] rounded-xl shadow-xl overflow-hidden">
              <div className="p-3 border-b border-[#E4E4E7]">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search companies..."
                    className="w-full pl-9 pr-3 py-2 text-sm border border-[#E4E4E7] rounded-lg bg-[#FAFAFA] placeholder:text-[#A1A1AA] focus:outline-none focus:ring-1 focus:ring-[#E11D48]/30"
                    autoFocus
                  />
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {filteredCompanies.map(c => (
                  <button
                    key={c.name}
                    onClick={() => {
                      setSelectedCompanyName(c.name);
                      setDropdownOpen(false);
                      setSearchTerm('');
                      setActiveSection('overview');
                    }}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-[#FAFAFA] transition-colors border-b border-[#E4E4E7] last:border-b-0 ${
                      c.name === selectedCompanyName ? 'bg-rose-50' : ''
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-100 to-orange-100 flex items-center justify-center">
                      <Building2 size={14} className="text-[#E11D48]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#18181B] truncate">{c.name}</p>
                      <p className="text-[10px] text-[#A1A1AA]">{c.sub_industry} &middot; {c.customer_insights.firmographics.estimated_revenue}</p>
                    </div>
                    {c.name === selectedCompanyName && (
                      <CheckCircle size={16} className="text-[#E11D48] shrink-0" />
                    )}
                  </button>
                ))}
                {filteredCompanies.length === 0 && (
                  <div className="p-6 text-center text-sm text-[#A1A1AA]">No matching companies</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Close dropdown backdrop */}
      {dropdownOpen && (
        <div className="fixed inset-0 z-40" onClick={() => { setDropdownOpen(false); setSearchTerm(''); }} />
      )}

      {/* Report Content */}
      {insights ? (
        <>
          {/* ── Sticky Toolbar ── */}
          <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border border-[#E4E4E7] rounded-2xl p-3 flex items-center gap-2 flex-wrap shadow-sm print:hidden">
            <div className="flex gap-1.5 overflow-x-auto flex-1 mr-2">
              {sections.map(s => {
                const isActive = activeSection === s.id;
                const isBm = bookmarkedSections.has(s.id);
                return (
                  <button key={s.id} onClick={() => scrollTo(s.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                      isActive ? 'bg-[#E11D48] text-white shadow-sm' : 'text-[#71717A] hover:bg-[#F4F4F5]'
                    }`}
                  >
                    <s.icon size={13} />
                    {s.label}
                    {isBm && <BookmarkCheck size={11} className={isActive ? 'text-white/80' : 'text-amber-500'} />}
                  </button>
                );
              })}
            </div>
            <div className="w-px h-7 bg-[#E4E4E7]" />
            <button onClick={() => setShowExportModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E11D48] text-white text-xs font-semibold hover:bg-[#BE123C] transition-colors">
              <Download size={13} /> Xuất báo cáo
            </button>
            <button onClick={() => setHighlightMode(h => !h)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${highlightMode ? 'bg-yellow-100 text-yellow-700 ring-1 ring-yellow-300' : 'text-[#71717A] hover:bg-[#F4F4F5]'}`}>
              <Highlighter size={13} /> Highlight
            </button>
            <button onClick={handlePrint} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#71717A] hover:bg-[#F4F4F5] transition-colors">
              <Printer size={13} /> In
            </button>
          </div>

          {/* ── Section: Executive Summary ── */}
          <div id="overview" ref={el => { sectionRefs.current['overview'] = el; }} className="scroll-mt-24">
            <div className="flex items-center justify-end mb-1 print:hidden">
              <button onClick={() => toggleBookmark('overview')} className="flex items-center gap-1 text-xs text-[#A1A1AA] hover:text-amber-500 transition-colors">
                {bookmarkedSections.has('overview') ? <BookmarkCheck size={13} className="text-amber-500" /> : <Bookmark size={13} />}
              </button>
            </div>
            <div className={highlightMode ? 'ring-2 ring-yellow-300/60 rounded-2xl transition-all' : 'transition-all'}>
              <ExecutiveSummarySection data={insights} company={selectedCompany!} highlightMode={highlightMode} />
            </div>
            <SectionNote sectionId="ci_overview" />
          </div>

          {/* ── Section: Buyer Personas ── */}
          <div id="personas" ref={el => { sectionRefs.current['personas'] = el; }} className="scroll-mt-24">
            <div className="flex items-center justify-end mb-1 print:hidden">
              <button onClick={() => toggleBookmark('personas')} className="flex items-center gap-1 text-xs text-[#A1A1AA] hover:text-amber-500 transition-colors">
                {bookmarkedSections.has('personas') ? <BookmarkCheck size={13} className="text-amber-500" /> : <Bookmark size={13} />}
              </button>
            </div>
            <div className={highlightMode ? 'ring-2 ring-yellow-300/60 rounded-2xl transition-all' : 'transition-all'}>
              <BuyerPersonasSection data={insights} />
            </div>
            <SectionNote sectionId="ci_personas" />
          </div>

          {/* ── Section: Buying Triggers ── */}
          <div id="triggers" ref={el => { sectionRefs.current['triggers'] = el; }} className="scroll-mt-24">
            <div className="flex items-center justify-end mb-1 print:hidden">
              <button onClick={() => toggleBookmark('triggers')} className="flex items-center gap-1 text-xs text-[#A1A1AA] hover:text-amber-500 transition-colors">
                {bookmarkedSections.has('triggers') ? <BookmarkCheck size={13} className="text-amber-500" /> : <Bookmark size={13} />}
              </button>
            </div>
            <div className={highlightMode ? 'ring-2 ring-yellow-300/60 rounded-2xl transition-all' : 'transition-all'}>
              <BuyingTriggersSection data={insights} />
            </div>
            <SectionNote sectionId="ci_triggers" />
          </div>

          {/* ── Section: Pain Points ── */}
          <div id="pain" ref={el => { sectionRefs.current['pain'] = el; }} className="scroll-mt-24">
            <div className="flex items-center justify-end mb-1 print:hidden">
              <button onClick={() => toggleBookmark('pain')} className="flex items-center gap-1 text-xs text-[#A1A1AA] hover:text-amber-500 transition-colors">
                {bookmarkedSections.has('pain') ? <BookmarkCheck size={13} className="text-amber-500" /> : <Bookmark size={13} />}
              </button>
            </div>
            <div className={highlightMode ? 'ring-2 ring-yellow-300/60 rounded-2xl transition-all' : 'transition-all'}>
              <PainPointsDetailedSection data={insights} />
            </div>
            <SectionNote sectionId="ci_pain" />
          </div>

          {/* ── Section: GTM Channels ── */}
          <div id="channels" ref={el => { sectionRefs.current['channels'] = el; }} className="scroll-mt-24">
            <div className="flex items-center justify-end mb-1 print:hidden">
              <button onClick={() => toggleBookmark('channels')} className="flex items-center gap-1 text-xs text-[#A1A1AA] hover:text-amber-500 transition-colors">
                {bookmarkedSections.has('channels') ? <BookmarkCheck size={13} className="text-amber-500" /> : <Bookmark size={13} />}
              </button>
            </div>
            <div className={highlightMode ? 'ring-2 ring-yellow-300/60 rounded-2xl transition-all' : 'transition-all'}>
              <ChannelsSection data={insights} />
            </div>
            <SectionNote sectionId="ci_channels" />
          </div>
        </>
      ) : (
        <LockedState />
      )}

      {/* Export Modal */}
      {showExportModal && insights && (
        <ExportModal onClose={() => setShowExportModal(false)} companyName={selectedCompanyName} insights={insights} />
      )}

      {/* Data Sources & Methodology Footer */}
      {insights && (
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
                  'LinkedIn & JobStreet Buyer Research',
                  'CafeF & VnExpress Market Data',
                  'Vietnam Chamber of Commerce (VCCI)',
                  'Industry expert interviews & surveys',
                  'Company IR filings & press releases',
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
                VICO Intelligence &middot; Customer Research
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerInsightsPage;
