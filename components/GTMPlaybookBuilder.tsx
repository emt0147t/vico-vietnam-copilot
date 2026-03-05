/**
 * GTM Playbook Builder - Static Pre-Researched Data (Phase 17)
 *
 * Renders hyper-realistic gtm_playbook data from CompanyProfile for Hero Companies.
 * Zero Gemini API calls. Fake 1.5s "AI generation" animation for demo UX.
 *
 * Design system: Executive Crimson - bg-zinc-50, white cards, rose-600 accents.
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  ChevronDown, ChevronUp, Users, Target, Building2,
  CheckCircle, Clock,
  Flag, BarChart3, Search,
  Lock, Megaphone, Rocket,
  Sparkles, Shield, BookOpen, Download, Save,
  TrendingUp
} from 'lucide-react';
import { COMPANIES, type CompanyProfile } from '../data/companies';

// ==================== HELPERS ====================

const ENRICHED_COMPANIES = COMPANIES.filter(
  (c): c is CompanyProfile & { gtm_playbook: NonNullable<CompanyProfile['gtm_playbook']> } =>
    c.dataTier === 'premium' && !!c.gtm_playbook
);

type GTMPlaybook = NonNullable<CompanyProfile['gtm_playbook']>;

const PHASE_GRADIENTS = [
  'from-blue-500 to-cyan-500',
  'from-[#E11D48] to-[#F97316]',
  'from-amber-500 to-orange-500',
  'from-emerald-500 to-green-500',
];

const PHASE_ICONS = [Target, Shield, Users, Rocket];

// ==================== SKELETON LOADER ====================

const GeneratingSkeleton: React.FC = () => (
  <div className="space-y-8 animate-pulse">
    {/* Fake stepper */}
    <div className="max-w-lg mx-auto py-10">
      <div className="text-center mb-8">
        <div className="inline-block">
          <Sparkles className="w-10 h-10 text-[#E11D48] animate-spin" style={{ animationDuration: '2s' }} />
        </div>
        <h3 className="mt-4 text-xl font-bold text-[#18181B]">
          VICO Engine is synthesizing Go-To-Market Strategy&hellip;
        </h3>
        <p className="text-sm text-[#71717A] mt-1">
          Analyzing market positioning, competitive landscape, and Vietnam-specific regulatory context
        </p>
      </div>

      <div className="space-y-4">
        {['Analyzing Market Data\u2026', 'Structuring Phases\u2026', 'Localizing for Vietnam\u2026', 'Finalizing Playbook\u2026'].map((label, idx) => (
          <div
            key={idx}
            className="flex items-center gap-4 p-4 rounded-xl border bg-[#FFF1F2] border-[#E11D48]/20"
            style={{ animationDelay: `${idx * 300}ms` }}
          >
            <div className="w-10 h-10 rounded-full bg-[#E11D48]/20 animate-pulse shrink-0" />
            <p className="text-sm font-semibold text-[#E11D48]">{label}</p>
          </div>
        ))}
      </div>
    </div>

    {/* Skeleton cards */}
    <div className="space-y-4">
      <div className="h-40 bg-[#E4E4E7] rounded-2xl" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-24 bg-[#E4E4E7] rounded-2xl" />
        <div className="h-24 bg-[#E4E4E7] rounded-2xl" />
      </div>
      <div className="h-64 bg-[#E4E4E7] rounded-2xl" />
    </div>
  </div>
);

// ==================== SUB-COMPONENTS ====================

const ExecutiveSummaryCard: React.FC<{ data: GTMPlaybook; companyName: string }> = ({ data, companyName }) => (
  <div className="bg-gradient-to-r from-[#FFF1F2] to-[#FFF7ED] border border-[#E11D48]/20 rounded-2xl p-6">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-xl bg-[#E11D48] flex items-center justify-center">
        <Sparkles className="text-white" size={20} />
      </div>
      <div>
        <h3 className="font-bold text-[#18181B]">Executive Summary</h3>
        <p className="text-xs text-[#71717A]">AI-synthesized GTM strategy for {companyName}</p>
      </div>
    </div>
    <p className="text-sm text-[#18181B] leading-relaxed">{data.executive_summary}</p>
  </div>
);

const TargetAudienceCard: React.FC<{ data: GTMPlaybook }> = ({ data }) => (
  <div className="bg-white border border-[#E4E4E7] rounded-2xl p-6">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
        <Users className="text-purple-600" size={20} />
      </div>
      <div>
        <h4 className="font-bold text-[#18181B]">Target Audience</h4>
        <p className="text-xs text-[#71717A]">Primary buyer segments and decision makers</p>
      </div>
    </div>
    <p className="text-sm text-[#71717A] leading-relaxed">{data.target_audience}</p>
  </div>
);

const VietnamContextCard: React.FC<{ data: GTMPlaybook }> = ({ data }) => (
  <div className="bg-white border border-[#E4E4E7] rounded-2xl p-6">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
        <Flag className="text-amber-600" size={20} />
      </div>
      <div>
        <h4 className="font-bold text-[#18181B]">Vietnam Market Context</h4>
        <p className="text-xs text-[#71717A]">Regulatory, cultural, and market-specific considerations</p>
      </div>
    </div>
    <p className="text-sm text-[#71717A] leading-relaxed">{data.vietnam_context}</p>
  </div>
);

const PhaseTimeline: React.FC<{ phases: GTMPlaybook['phases'] }> = ({ phases }) => {
  const [openPhase, setOpenPhase] = useState<number>(0);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <BookOpen className="text-[#E11D48]" size={20} />
        <h3 className="font-bold text-lg text-[#18181B]">Execution Phases</h3>
      </div>

      {phases.map((phase, idx) => {
        const Icon = PHASE_ICONS[idx % PHASE_ICONS.length] ?? Target;
        const gradient = PHASE_GRADIENTS[idx % PHASE_GRADIENTS.length] ?? PHASE_GRADIENTS[0];
        const isOpen = openPhase === idx;

        return (
          <div key={idx} className="relative">
            {/* Timeline connector */}
            {idx > 0 && <div className="absolute left-6 -top-5 w-0.5 h-5 bg-[#E4E4E7]" />}

            <div className="bg-white border border-[#E4E4E7] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {/* Phase header */}
              <button
                onClick={() => setOpenPhase(isOpen ? -1 : idx)}
                className="w-full flex items-center gap-4 p-5 text-left"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} text-white flex items-center justify-center shrink-0 shadow-lg`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">Phase {phase.phase_number}</span>
                    <span className="text-xs text-[#A1A1AA]">&middot;</span>
                    <span className="text-xs text-[#71717A] flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {phase.duration}
                    </span>
                  </div>
                  <h4 className="font-bold text-lg text-[#18181B] mt-0.5 truncate">{phase.title}</h4>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-[#A1A1AA] hidden sm:inline">{phase.key_actions.length} actions</span>
                  {isOpen
                    ? <ChevronUp className="w-5 h-5 text-[#A1A1AA]" />
                    : <ChevronDown className="w-5 h-5 text-[#A1A1AA]" />
                  }
                </div>
              </button>

              {/* Expanded actions */}
              {isOpen && (
                <div className="px-5 pb-5 border-t border-[#E4E4E7]">
                  <div className="mt-4 space-y-3">
                    {phase.key_actions.map((action, aIdx) => (
                      <div key={aIdx} className="flex items-start gap-3 p-3 bg-[#FAFAFA] rounded-xl border border-[#E4E4E7]">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-rose-100 to-orange-100 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-[#E11D48]">{aIdx + 1}</span>
                        </div>
                        <p className="text-sm text-[#18181B] leading-relaxed">{action}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const GrowthChannelsCard: React.FC<{ channels: string[] }> = ({ channels }) => (
  <div className="bg-white border border-[#E4E4E7] rounded-2xl p-6">
    <div className="flex items-center gap-3 mb-5">
      <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
        <Megaphone className="text-blue-600" size={20} />
      </div>
      <div>
        <h4 className="font-bold text-[#18181B]">Growth Channels</h4>
        <p className="text-xs text-[#71717A]">Prioritized go-to-market distribution channels</p>
      </div>
    </div>
    <div className="grid lg:grid-cols-2 gap-3">
      {channels.map((channel, idx) => (
        <div key={idx} className="flex items-center gap-3 p-4 bg-[#FAFAFA] rounded-xl border border-[#E4E4E7]">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs shrink-0">{idx + 1}</div>
          <p className="text-sm text-[#18181B] font-medium">{channel}</p>
        </div>
      ))}
    </div>
  </div>
);

const KPIsCard: React.FC<{ kpis: string[] }> = ({ kpis }) => (
  <div className="bg-white border border-[#E4E4E7] rounded-2xl p-6">
    <div className="flex items-center gap-3 mb-5">
      <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
        <BarChart3 className="text-green-600" size={20} />
      </div>
      <div>
        <h4 className="font-bold text-[#18181B]">Key Performance Indicators</h4>
        <p className="text-xs text-[#71717A]">Measurable targets for strategic accountability</p>
      </div>
    </div>
    <div className="space-y-3">
      {kpis.map((kpi, idx) => (
        <div key={idx} className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
          <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
            <TrendingUp size={14} className="text-green-600" />
          </div>
          <p className="text-sm text-[#18181B] font-medium">{kpi}</p>
        </div>
      ))}
    </div>
  </div>
);

// ==================== LOCKED STATE ====================

const LockedState: React.FC = () => (
  <div className="bg-gradient-to-br from-zinc-50 to-zinc-100 rounded-2xl border border-zinc-200 p-12 text-center">
    <div className="w-16 h-16 rounded-2xl bg-zinc-200 flex items-center justify-center mx-auto mb-4">
      <Lock className="text-zinc-400" size={28} />
    </div>
    <h3 className="text-xl font-bold text-[#18181B] mb-2">GTM Playbook Not Available</h3>
    <p className="text-[#71717A] mb-6 max-w-md mx-auto text-sm">
      Pre-researched GTM strategies are available for our 5 premium Hero Companies.
      Select one from the dropdown above to generate an instant playbook.
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

// ==================== MAIN COMPONENT ====================

export default function GTMPlaybookBuilder({ userData }: { userData?: any }) {
  const [selectedCompanyName, setSelectedCompanyName] = useState<string>(() => {
    if (userData?.orgName) {
      const match = ENRICHED_COMPANIES.find(
        c => c.name.toLowerCase() === userData.orgName.toLowerCase()
      );
      if (match) return match.name;
    }
    return ENRICHED_COMPANIES[0]?.name || '';
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPlaybook, setShowPlaybook] = useState(true);

  const selectedCompany = useMemo(
    () => ENRICHED_COMPANIES.find(c => c.name === selectedCompanyName) ?? null,
    [selectedCompanyName]
  );

  const playbook = selectedCompany?.gtm_playbook ?? null;

  const filteredCompanies = useMemo(() => {
    if (!searchTerm.trim()) return ENRICHED_COMPANIES;
    const lower = searchTerm.toLowerCase();
    return ENRICHED_COMPANIES.filter(c => c.name.toLowerCase().includes(lower));
  }, [searchTerm]);

  // Fake 1.5s generation animation
  const triggerGeneration = useCallback((companyName: string) => {
    setSelectedCompanyName(companyName);
    setDropdownOpen(false);
    setSearchTerm('');
    setShowPlaybook(false);
    setIsGenerating(true);

    setTimeout(() => {
      setIsGenerating(false);
      setShowPlaybook(true);
    }, 1500);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="inline-flex items-center gap-2 bg-[#FFF1F2] px-3 py-1 rounded-full">
            <Rocket className="w-3.5 h-3.5 text-[#E11D48]" />
            <span className="text-[10px] font-bold text-[#E11D48] uppercase tracking-wider">GTM Playbook Engine</span>
          </div>
        </div>
        <h1 className="text-3xl font-black text-[#18181B] uppercase tracking-tight">
          Go-To-Market Playbook
        </h1>
        <p className="text-[#71717A] text-sm mt-1">
          Pre-researched, McKinsey-grade GTM strategies for Vietnam&apos;s top technology companies
        </p>
      </div>

      {/* Company Selector */}
      <div className="bg-white border border-[#E4E4E7] rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E11D48] to-[#F97316] flex items-center justify-center">
            <Rocket className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#18181B]">Vietnam GTM Strategy Generator</h2>
            <p className="text-sm text-[#71717A]">Select a Hero Company to synthesize a tailored playbook</p>
          </div>
        </div>

        {/* Dropdown */}
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
                    onClick={() => triggerGeneration(c.name)}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-[#FAFAFA] transition-colors border-b border-[#E4E4E7] last:border-b-0 ${
                      c.name === selectedCompanyName ? 'bg-rose-50' : ''
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-100 to-orange-100 flex items-center justify-center">
                      <Building2 size={14} className="text-[#E11D48]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#18181B] truncate">{c.name}</p>
                      <p className="text-[10px] text-[#A1A1AA]">{c.sub_industry}</p>
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

      {/* Backdrop */}
      {dropdownOpen && (
        <div className="fixed inset-0 z-40" onClick={() => { setDropdownOpen(false); setSearchTerm(''); }} />
      )}

      {/* Generating State */}
      {isGenerating && <GeneratingSkeleton />}

      {/* Playbook Content */}
      {!isGenerating && showPlaybook && playbook ? (
        <div className="space-y-6">

          {/* Header bar */}
          <div className="bg-white border border-[#E4E4E7] rounded-2xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-xl font-extrabold text-[#18181B]">
                  {selectedCompanyName} &mdash; GTM Playbook
                </h2>
                <div className="flex items-center gap-3 mt-1 text-sm text-[#71717A] flex-wrap">
                  <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{selectedCompany?.sub_industry}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />36 weeks total</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-[#FFF1F2] text-[#E11D48]">
                    <Sparkles className="w-3 h-3" /> VICO Intelligence
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#E4E4E7] text-sm font-medium text-[#18181B] hover:bg-[#FAFAFA] transition">
                  <Save className="w-4 h-4" /> Save
                </button>
                <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#E4E4E7] text-sm font-medium text-[#18181B] hover:bg-[#FAFAFA] transition">
                  <Download className="w-4 h-4" /> Export PDF
                </button>
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          <ExecutiveSummaryCard data={playbook} companyName={selectedCompanyName} />

          {/* Target Audience + Vietnam Context */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TargetAudienceCard data={playbook} />
            <VietnamContextCard data={playbook} />
          </div>

          {/* Phase Timeline */}
          <PhaseTimeline phases={playbook.phases} />

          {/* Growth Channels + KPIs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GrowthChannelsCard channels={playbook.growth_channels} />
            <KPIsCard kpis={playbook.kpis} />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between bg-white border border-[#E4E4E7] rounded-2xl p-5">
            <p className="text-xs text-[#A1A1AA]">
              Generated {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              {' \u00b7 '}VICO Intelligence \u00b7 Pre-Researched Strategy
            </p>
            <button
              onClick={() => triggerGeneration(selectedCompanyName)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#E11D48] hover:bg-[#BE123C] text-white text-sm font-medium shadow transition"
            >
              <Sparkles className="w-4 h-4" /> Regenerate
            </button>
          </div>
        </div>
      ) : !isGenerating ? (
        <LockedState />
      ) : null}
    </div>
  );
}
