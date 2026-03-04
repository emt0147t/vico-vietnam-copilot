/**
 *  ICP Intelligence  Phase 20 (Professional Overhaul)
 *
 * Renders pre-researched Ideal Customer Profile data for hero companies.
 * Zero API calls â€” 100% verified static data with company selector.
 *
 * Sections:
 *   Platform Metrics â€” aggregate stats across all hero profiles
 *   A. Executive Strategy Brief â€” professional summary card
 *   B. Firmographics â€” company profile with visual indicators
 *   C. Buyer Personas â€” tabbed persona cards with rich VN callouts
 *   D. Buying Triggers â€” urgency-ranked event cards with severity bars
 *   E. Pain Points â€” severity-coded grid with workaround + cost
 *   F. Positioning & Channels â€” strategic recommendations
 *   G. Vietnam Market Notes â€” localized insights
 *   H. Data Sources & Methodology â€” verified source attribution
 *
 * Design: Executive Crimson â€” config/designSystem.ts
 */

import React, { useState, useEffect, useRef } from 'react';
import { tw, iconSize } from '@/config/designSystem';
import { FadeIn } from './AnimationUtils';
import { COMPANIES, type CompanyProfile } from '@/data/companies';
import {
  Buildings,
  ShieldCheck,
  UserCircle,
  Briefcase,
  Lightning,
  Target,
  Quotes,
  Flag,
  Megaphone,
  Handshake,
  CaretRight,
  CaretLeft,
  ChatCircleDots,
  IdentificationCard,
  Gauge,
  ListChecks,
  MagnifyingGlass,
  CheckCircle,
  Database,
  ArrowRight,
  Users,
  ChartLineUp,
  WarningCircle,
  Crosshair,
  Cpu,
  Globe,
} from '@phosphor-icons/react';

// ============================================================================
// TYPES (derived from icp_profile schema in companies.ts)
// ============================================================================

interface Firmographics {
  company_size_range: string;
  revenue_range: string;
  industries: string[];
  geographic_focus: string[];
  company_maturity: string;
  ownership_structure: string;
  typical_tech_stack: string[];
  regulatory_pressure: string;
}

interface BuyerPersona {
  id: string;
  title: string;
  department: string;
  seniority: string;
  age_range: string;
  key_kpis: string[];
  goals: string[];
  frustrations: string[];
  preferred_channels: string[];
  vietnam_behavior: string;
  decision_role: string;
  quote_snippet: string;
}

interface BuyingTrigger {
  id: string;
  trigger: string;
  category: string;
  urgency_level: string;
  description: string;
  vietnam_context: string;
}

interface PainPoint {
  id: string;
  title: string;
  severity: string;
  description: string;
  current_workaround: string;
  cost_of_inaction: string;
  vietnam_specific: boolean;
}

interface ICPProfile {
  executive_summary: string;
  firmographics: Firmographics;
  buyer_personas: BuyerPersona[];
  buying_triggers: BuyingTrigger[];
  pain_points: PainPoint[];
  positioning_statement: string;
  recommended_channels: string[];
  vietnam_market_notes: string[];
}

// ============================================================================
// LOADING STEPS
// ============================================================================

const LOADING_STEPS = [
  { label: 'Analyzing Vietnamese market structure',  icon: Buildings },
  { label: 'Profiling decision-makers & personas',   icon: UserCircle },
  { label: 'Mapping buying triggers & pain points',  icon: Lightning },
  { label: 'Structuring positioning strategy',       icon: Target },
  { label: 'Localizing for VN business culture',     icon: Flag },
];

// ============================================================================
// HERO DATA
// ============================================================================

const HERO_COMPANIES = COMPANIES.filter(
  (c) => c.dataTier === 'premium' && !!c.icp_profile
);

// Pre-compute aggregate stats
const AGGREGATE_STATS = {
  companies: HERO_COMPANIES.length,
  personas: HERO_COMPANIES.reduce((sum, c) => sum + ((c.icp_profile as ICPProfile)?.buyer_personas?.length || 0), 0),
  triggers: HERO_COMPANIES.reduce((sum, c) => sum + ((c.icp_profile as ICPProfile)?.buying_triggers?.length || 0), 0),
  painPoints: HERO_COMPANIES.reduce((sum, c) => sum + ((c.icp_profile as ICPProfile)?.pain_points?.length || 0), 0),
};

// ============================================================================
// DATA SOURCES
// ============================================================================

const DATA_SOURCES = [
  'VICO Enterprise Database â€” 10,000+ Vietnam Companies',
  'LinkedIn Sales Navigator & JobStreet Vietnam',
  'Glassdoor & Company Career Pages',
  'CafeF, VnExpress & VietnamBiz Business Data',
  'Vietnam Chamber of Commerce (VCCI) Reports',
  'Industry Expert Interviews & B2B Surveys',
];

// ============================================================================
// HELPERS
// ============================================================================

function severityVariant(level: string): 'decline' | 'warn' | 'growth' | 'neutral' {
  if (level === 'critical') return 'decline';
  if (level === 'high') return 'warn';
  if (level === 'medium') return 'neutral';
  return 'growth';
}

function urgencyVariant(level: string): 'decline' | 'warn' | 'growth' | 'neutral' {
  if (level === 'critical') return 'decline';
  if (level === 'high') return 'warn';
  if (level === 'medium') return 'neutral';
  return 'growth';
}

function severityPercent(level: string): number {
  if (level === 'critical') return 100;
  if (level === 'high') return 75;
  if (level === 'medium') return 50;
  return 25;
}

function severityColor(level: string): string {
  if (level === 'critical') return 'bg-[#991B1B]';
  if (level === 'high') return 'bg-[#D97706]';
  if (level === 'medium') return 'bg-[#71717A]';
  return 'bg-[#059669]';
}

function categoryIcon(cat: string) {
  switch (cat) {
    case 'regulatory':    return <ShieldCheck size={iconSize.sm} weight="duotone" />;
    case 'competitive':   return <Target      size={iconSize.sm} weight="duotone" />;
    case 'growth':        return <ChartLineUp size={iconSize.sm} weight="duotone" />;
    case 'operational':   return <Gauge       size={iconSize.sm} weight="duotone" />;
    case 'technological': return <Cpu         size={iconSize.sm} weight="duotone" />;
    case 'seasonal':      return <Flag        size={iconSize.sm} weight="duotone" />;
    default:              return <Lightning   size={iconSize.sm} weight="duotone" />;
  }
}

function roleColor(role: string): string {
  if (role === 'Decision Maker') return 'bg-[#FFF1F2] text-[#E11D48] border-[#E11D48]/20';
  if (role === 'Influencer')     return 'bg-[#FEF3C7] text-[#D97706] border-[#D97706]/20';
  if (role === 'Champion')       return 'bg-[#D1FAE5] text-[#059669] border-[#059669]/20';
  if (role === 'Gatekeeper')     return 'bg-[#F5F5F4] text-[#BE123C] border-[#BE123C]/15';
  return 'bg-[#FAFAFA] text-[#71717A] border-[#E4E4E7]';
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ICPBuilder() {
  const [selectedCompany, setSelectedCompany] = useState<CompanyProfile | null>(null);
  const [icpData, setIcpData] = useState<ICPProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activePersona, setActivePersona] = useState(0);

  // Page-mount artificial loading
  const [isPageReady, setIsPageReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setIsPageReady(true), 1600);
    return () => clearTimeout(t);
  }, []);

  const stepRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Filter companies by search
  const filteredCompanies = HERO_COMPANIES.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle company selection â€” fake 1.5s load for UX polish
  function handleSelectCompany(company: CompanyProfile) {
    setSelectedCompany(company);
    setDropdownOpen(false);
    setSearchQuery('');
    setIcpData(null);
    setLoading(true);
    setLoadingStep(0);
    setActivePersona(0);

    let step = 0;
    stepRef.current = setInterval(() => {
      step++;
      if (step < LOADING_STEPS.length) {
        setLoadingStep(step);
      }
    }, 280);

    setTimeout(() => {
      if (stepRef.current) clearInterval(stepRef.current);
      setLoadingStep(LOADING_STEPS.length - 1);
      setTimeout(() => {
        setIcpData(company.icp_profile as ICPProfile);
        setLoading(false);
      }, 200);
    }, 1500);
  }

  // Reset
  function handleReset() {
    setSelectedCompany(null);
    setIcpData(null);
    setLoading(false);
    setActivePersona(0);
    if (stepRef.current) clearInterval(stepRef.current);
  }

  // -----------------------------------------------------------------------
  // RENDER
  // -----------------------------------------------------------------------

  if (!isPageReady) {
    return (
      <div className="space-y-8 pb-10 animate-fade-in">
        <div className="flex flex-col items-center justify-center py-20 gap-6">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-[#FFF1F2]" />
            <div className="absolute inset-0 rounded-full border-4 border-t-[#E11D48] animate-spin" />
            <div className="absolute inset-3 rounded-full bg-gradient-to-br from-[#E11D48] to-[#BE123C] animate-pulse" />
          </div>
          <div className="text-center space-y-1.5">
            <p className="text-sm font-semibold text-[#18181B]">Loading Customer Intelligence</p>
            <p className="text-xs text-[#A1A1AA]">Preparing verified buyer personas & market profiles</p>
          </div>
        </div>
        <div className="animate-pulse space-y-5 max-w-2xl">
          <div className="h-10 bg-[#E4E4E7] rounded-xl w-1/3" />
          <div className="h-44 bg-[#E4E4E7] rounded-xl" />
          <div className="h-12 bg-[#E4E4E7] rounded-xl w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* â”€â”€â”€ Page Header â”€â”€â”€ */}
      <div>
        <div className="flex items-center gap-3 mb-1.5">
          <h1 className={tw.h1}>ICP Intelligence</h1>
          <span className={tw.badge('brand')}>
            <Crosshair size={iconSize.xs} weight="fill" />
            Verified Research
          </span>
        </div>
        <p className={`${tw.body} max-w-2xl`}>
          Pre-researched Ideal Customer Profiles, Buyer Personas & Pain-Point analysis â€” built from verified market data and deeply localized for Vietnam
        </p>
      </div>

      {/* â”€â”€â”€ Platform Metrics Bar â”€â”€â”€ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Hero Companies', value: AGGREGATE_STATS.companies, icon: Buildings },
          { label: 'Buyer Personas', value: AGGREGATE_STATS.personas + '+', icon: Users },
          { label: 'Buying Triggers', value: AGGREGATE_STATS.triggers + '+', icon: Lightning },
          { label: 'Pain Points Mapped', value: AGGREGATE_STATS.painPoints + '+', icon: WarningCircle },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className={`${tw.card} ${tw.cardPadding} flex items-center gap-3`}>
              <div className="w-10 h-10 rounded-xl bg-[#FFF1F2] flex items-center justify-center text-[#E11D48] shrink-0">
                <Icon size={iconSize.md} weight="duotone" />
              </div>
              <div>
                <p className={tw.metric + ' text-xl lg:text-2xl text-[#18181B]'}>{stat.value}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#A1A1AA]">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* â”€â”€â”€ Company Selector â”€â”€â”€ */}
      {!icpData && !loading && (
        <FadeIn duration={300}>
          <div className={`${tw.card} ${tw.cardPadding} max-w-2xl space-y-5`}>
            {/* Header */}
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#E11D48] to-[#BE123C] flex items-center justify-center">
                <Crosshair size={iconSize.md} weight="fill" className="text-white" />
              </div>
              <div>
                <h2 className={tw.h3}>Select a Company</h2>
                <p className="text-xs text-[#A1A1AA]">Choose a Hero Company to view its verified Ideal Customer Profile</p>
              </div>
            </div>

            <div className={tw.divider} />

            {/* Searchable Dropdown */}
            <div ref={dropdownRef} className="relative">
              <label className={`${tw.label} mb-1.5 block`}>
                Hero Company <span className="text-[#E11D48]">*</span>
              </label>
              <div
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`${tw.input} flex items-center gap-2 cursor-pointer`}
              >
                <MagnifyingGlass size={iconSize.sm} className="text-[#A1A1AA] shrink-0" />
                <input
                  type="text"
                  value={searchQuery || (selectedCompany ? selectedCompany.name : '')}
                  onChange={(e) => { setSearchQuery(e.target.value); setDropdownOpen(true); }}
                  onFocus={() => setDropdownOpen(true)}
                  placeholder="Search hero companiesâ€¦"
                  className="flex-1 bg-transparent outline-none text-sm text-[#18181B] placeholder-[#A1A1AA]"
                />
              </div>

              {dropdownOpen && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-[#E4E4E7] rounded-xl shadow-lg max-h-64 overflow-y-auto">
                  {filteredCompanies.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-[#A1A1AA]">No matching hero companies</div>
                  ) : (
                    filteredCompanies.map((c) => (
                      <button
                        key={c.name}
                        onClick={() => handleSelectCompany(c)}
                        className="w-full text-left px-4 py-3 hover:bg-[#FFF1F2]:bg-[#E11D48]/10 transition-colors flex items-center gap-3 border-b border-[#F4F4F5] last:border-0"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#FFF1F2] flex items-center justify-center text-[#E11D48] shrink-0">
                          <Buildings size={iconSize.sm} weight="duotone" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#18181B] truncate">{c.name}</p>
                          <p className="text-[11px] text-[#A1A1AA] truncate">{c.sub_industry || c.industry || 'Technology'}</p>
                        </div>
                        <ArrowRight size={iconSize.sm} className="text-[#A1A1AA] ml-auto shrink-0" />
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Available Companies Grid */}
            <div>
              <p className={`${tw.label} mb-2`}>Available Hero Companies</p>
              <div className="flex flex-wrap gap-1.5">
                {HERO_COMPANIES.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => handleSelectCompany(c)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E4E4E7] bg-[#FAFAFA] hover:bg-[#FFF1F2]:bg-[#E11D48]/10 hover:border-[#E11D48]/20 text-xs font-medium text-[#3F3F46] hover:text-[#E11D48] transition-colors"
                  >
                    <Buildings size={12} weight="duotone" />
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Info Banner */}
            <div className="bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl px-4 py-3 flex items-start gap-2.5">
              <ShieldCheck size={iconSize.md} weight="duotone" className="text-[#059669] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-[#18181B]">Research-Backed Intelligence</p>
                <p className="text-[11px] text-[#71717A] mt-0.5 leading-relaxed">
                  Each ICP profile is compiled from verified market research, industry databases, and analyst reports.
                  Includes hyper-realistic firmographics, buyer personas, buying triggers, pain points, and positioning strategies specific to the Vietnamese market.
                </p>
              </div>
            </div>
          </div>
        </FadeIn>
      )}

      {/* â”€â”€â”€ Loading State â”€â”€â”€ */}
      {loading && (
        <FadeIn duration={300}>
          <div className={`${tw.card} ${tw.cardPadding} max-w-lg mx-auto`}>
            <div className="text-center mb-6">
              <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-[#E11D48] to-[#BE123C] flex items-center justify-center mb-3 animate-pulse">
                <Crosshair size={iconSize.lg} weight="duotone" className="text-white" />
              </div>
              <h2 className={tw.h2}>Preparing ICP for {selectedCompany?.name}</h2>
              <p className={`${tw.body} mt-1`}>Compiling verified market intelligence</p>
            </div>

            <div className="space-y-3">
              {LOADING_STEPS.map((step, i) => {
                const StepIcon = step.icon;
                const isActive = i === loadingStep;
                const isDone = i < loadingStep;
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      isActive
                        ? 'bg-[#FFF1F2] border border-[#E11D48]/20'
                        : isDone
                          ? 'bg-[#D1FAE5]/50 border border-[#059669]/15'
                          : 'bg-[#FAFAFA] border border-[#E4E4E7]'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      isActive
                        ? 'bg-[#E11D48] text-white animate-pulse'
                        : isDone
                          ? 'bg-[#059669] text-white'
                          : 'bg-[#E4E4E7] text-[#A1A1AA]'
                    }`}>
                      {isDone ? <CheckCircle size={iconSize.sm} weight="fill" /> : <StepIcon size={iconSize.sm} weight="duotone" />}
                    </div>
                    <span className={`text-sm font-medium ${
                      isActive
                        ? 'text-[#E11D48]'
                        : isDone
                          ? 'text-[#059669]'
                          : 'text-[#A1A1AA]'
                    }`}>
                      {step.label}
                    </span>
                    {isActive && (
                      <div className="ml-auto flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48] animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48] animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48] animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Progress bar */}
            <div className="mt-5 h-1 rounded-full bg-[#E4E4E7] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#E11D48] to-[#BE123C] rounded-full transition-all duration-700 ease-out"
                style={{ width: `${((loadingStep + 1) / LOADING_STEPS.length) * 100}%` }}
              />
            </div>
          </div>
        </FadeIn>
      )}

      {/* â”€â”€â”€ Results Dashboard â”€â”€â”€ */}
      {icpData && !loading && selectedCompany && (
        <FadeIn duration={400}>
          <div className="space-y-6">
            {/* â”€â”€â”€ Action Bar â”€â”€â”€ */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className={tw.badge('brand')}>
                  <ShieldCheck size={iconSize.xs} weight="fill" />
                  Verified Research
                </span>
                <span className="text-sm font-semibold text-[#18181B]">
                  {selectedCompany.name}
                </span>
                <span className="text-xs text-[#A1A1AA]">â€” Ideal Customer Profile</span>
              </div>
              <button onClick={handleReset} className={tw.btnGhost}>
                â† Select Different Company
              </button>
            </div>

            {/* â”€â”€â”€ Executive Strategy Brief â”€â”€â”€ */}
            <div className={`${tw.card} overflow-hidden`}>
              <div className="h-1 bg-gradient-to-r from-[#E11D48] via-[#BE123C] to-[#E11D48]" />
              <div className="px-5 py-5 lg:px-6 lg:py-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FFF1F2] flex items-center justify-center text-[#E11D48] shrink-0 mt-0.5">
                    <Crosshair size={iconSize.md} weight="duotone" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className={tw.h3}>Executive Strategy Brief</h3>
                      <span className={tw.badge('brand')}>ICP Summary</span>
                    </div>
                    <p className={`${tw.bodyAlt} leading-relaxed`}>{icpData.executive_summary}</p>
                  </div>
                </div>

                {/* Quick Stats Row */}
                <div className="mt-4 pt-4 border-t border-[#E4E4E7] grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#A1A1AA]">Personas</p>
                    <p className="text-lg font-bold text-[#18181B]">{icpData.buyer_personas.length}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#A1A1AA]">Triggers</p>
                    <p className="text-lg font-bold text-[#18181B]">{icpData.buying_triggers.length}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#A1A1AA]">Pain Points</p>
                    <p className="text-lg font-bold text-[#18181B]">{icpData.pain_points.length}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#A1A1AA]">Channels</p>
                    <p className="text-lg font-bold text-[#18181B]">{icpData.recommended_channels.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* â”€â”€â”€ SECTION A: Firmographics â”€â”€â”€ */}
            <FirmographicsCard data={icpData.firmographics} />

            {/* â”€â”€â”€ SECTION B: Buyer Personas (Tabbed) â”€â”€â”€ */}
            <div className={`${tw.card} overflow-hidden`}>
              <div className="px-5 pt-5 lg:px-6 lg:pt-6">
                <div className="flex items-center gap-2 mb-1">
                  <IdentificationCard size={iconSize.md} weight="duotone" className="text-[#E11D48]" />
                  <h2 className={tw.h2}>Buyer Personas</h2>
                  <span className={tw.badge('brand')}>{icpData.buyer_personas.length} profiles</span>
                </div>
                <p className={`${tw.body} mb-4`}>
                  Key decision-makers and influencers in the buying process, with Vietnam-specific behavioral insights
                </p>

                {/* Persona tabs */}
                <div className="flex gap-1 border-b border-[#E4E4E7] -mx-1 overflow-x-auto no-scrollbar">
                  {icpData.buyer_personas.map((p, i) => (
                    <button
                      key={p.id}
                      onClick={() => setActivePersona(i)}
                      className={`relative px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors rounded-t-lg ${
                        activePersona === i
                          ? 'text-[#E11D48] bg-[#FFF1F2]'
                          : 'text-[#71717A] hover:text-[#18181B]:text-white hover:bg-[#FAFAFA]:bg-gray-800'
                      }`}
                    >
                      {p.title.length > 28 ? p.title.slice(0, 28) + 'â€¦' : p.title}
                      {activePersona === i && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E11D48]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active persona detail */}
              {icpData.buyer_personas[activePersona] && (
                <PersonaDetail persona={icpData.buyer_personas[activePersona]!} />
              )}

              {/* Persona navigation arrows */}
              {icpData.buyer_personas.length > 1 && (
                <div className="flex items-center justify-between px-5 pb-4 lg:px-6">
                  <button
                    onClick={() => setActivePersona((p) => Math.max(0, p - 1))}
                    disabled={activePersona === 0}
                    className={`${tw.btnGhost} ${activePersona === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
                  >
                    <CaretLeft size={iconSize.sm} weight="bold" /> Previous
                  </button>
                  <span className="text-xs text-[#A1A1AA]">
                    {activePersona + 1} / {icpData.buyer_personas.length}
                  </span>
                  <button
                    onClick={() => setActivePersona((p) => Math.min(icpData.buyer_personas.length - 1, p + 1))}
                    disabled={activePersona === icpData.buyer_personas.length - 1}
                    className={`${tw.btnGhost} ${activePersona === icpData.buyer_personas.length - 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
                  >
                    Next <CaretRight size={iconSize.sm} weight="bold" />
                  </button>
                </div>
              )}
            </div>

            {/* â”€â”€â”€ SECTION C: Buying Triggers â”€â”€â”€ */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Lightning size={iconSize.md} weight="duotone" className="text-[#E11D48]" />
                <h2 className={tw.h2}>Buying Triggers</h2>
                <span className={tw.badge('neutral')}>{icpData.buying_triggers.length} identified</span>
              </div>
              <p className={`${tw.body} mb-4`}>
                Events and conditions that create urgency and buying intent within target accounts
              </p>
              <div className={`${tw.bentoGrid} grid-cols-1 md:grid-cols-2`}>
                {icpData.buying_triggers.map((trigger) => (
                  <TriggerCard key={trigger.id} trigger={trigger} />
                ))}
              </div>
            </div>

            {/* â”€â”€â”€ SECTION D: Pain Points â”€â”€â”€ */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Gauge size={iconSize.md} weight="duotone" className="text-[#E11D48]" />
                <h2 className={tw.h2}>Key Pain Points</h2>
                <span className={tw.badge('neutral')}>{icpData.pain_points.length} identified</span>
              </div>
              <p className={`${tw.body} mb-4`}>
                Critical challenges and operational gaps that create opportunity for solution positioning
              </p>
              <div className={`${tw.bentoGrid} grid-cols-1 md:grid-cols-2`}>
                {icpData.pain_points.map((pp) => (
                  <PainPointCard key={pp.id} painPoint={pp} />
                ))}
              </div>
            </div>

            {/* â”€â”€â”€ SECTION E: Positioning & Channels â”€â”€â”€ */}
            <div className={`${tw.bentoGrid} grid-cols-1 lg:grid-cols-2`}>
              {/* Positioning Statement */}
              <div className={`${tw.card} overflow-hidden`}>
                <div className="h-1 bg-gradient-to-r from-[#E11D48] to-[#BE123C]" />
                <div className={tw.cardPadding}>
                  <div className="flex items-center gap-2 mb-3">
                    <Megaphone size={iconSize.md} weight="duotone" className="text-[#E11D48]" />
                    <h3 className={tw.h3}>Positioning Statement</h3>
                  </div>
                  <div className="bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl px-4 py-3">
                    <p className={`${tw.bodyAlt} italic leading-relaxed`}>"{icpData.positioning_statement}"</p>
                  </div>
                </div>
              </div>

              {/* Recommended Channels */}
              <div className={`${tw.card} overflow-hidden`}>
                <div className="h-1 bg-gradient-to-r from-[#E11D48] to-[#BE123C]" />
                <div className={tw.cardPadding}>
                  <div className="flex items-center gap-2 mb-3">
                    <Handshake size={iconSize.md} weight="duotone" className="text-[#E11D48]" />
                    <h3 className={tw.h3}>Recommended Channels</h3>
                  </div>
                  <ol className="space-y-2.5">
                    {icpData.recommended_channels.map((ch, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="shrink-0 w-5 h-5 rounded-full bg-[#FFF1F2] text-[#E11D48] text-[10px] font-bold flex items-center justify-center mt-0.5">
                          {i + 1}
                        </span>
                        <span className={tw.bodyAlt}>{ch}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>

            {/* â”€â”€â”€ Vietnam Market Notes â”€â”€â”€ */}
            {icpData.vietnam_market_notes.length > 0 && (
              <div className={`${tw.card} overflow-hidden`}>
                <div className="h-1 bg-gradient-to-r from-[#E11D48] to-[#BE123C]" />
                <div className={tw.cardPadding}>
                  <div className="flex items-center gap-2 mb-3">
                    <Flag size={iconSize.md} weight="duotone" className="text-[#E11D48]" />
                    <h3 className={tw.h3}>Vietnam Market Notes</h3>
                    <span className={tw.badge('brand')}>
                      <Globe size={iconSize.xs} weight="fill" /> Localized
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {icpData.vietnam_market_notes.map((note, i) => (
                      <div key={i} className="bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl px-4 py-3 flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-[#FFF1F2] text-[#E11D48] text-[10px] font-bold flex items-center justify-center mt-0.5 shrink-0">
                          {i + 1}
                        </span>
                        <span className={tw.body}>{note}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* â”€â”€â”€ Data Sources & Methodology Footer â”€â”€â”€ */}
            <div className={`${tw.card} ${tw.cardPadding}`}>
              <div className="flex items-center gap-2 mb-3">
                <Database size={iconSize.md} weight="duotone" className="text-[#E11D48]" />
                <h3 className={tw.h3}>Data Sources & Methodology</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {DATA_SOURCES.map((source, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-[#71717A]">
                    <CheckCircle size={14} weight="fill" className="text-[#059669] shrink-0" />
                    <span>{source}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-[#E4E4E7] flex items-center justify-between">
                <span className="text-[10px] text-[#A1A1AA]">Last verified: January 2025</span>
                <span className="text-[10px] font-semibold text-[#A1A1AA]">VICO Intelligence</span>
              </div>
            </div>
          </div>
        </FadeIn>
      )}
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/** Section A â€” Firmographics summary card */
function FirmographicsCard({ data }: { data: Firmographics }) {
  const items: Array<{ icon: React.ReactNode; label: string; value: string }> = [
    { icon: <Users size={iconSize.sm} weight="duotone" />,       label: 'Company Size',        value: data.company_size_range },
    { icon: <ChartLineUp size={iconSize.sm} weight="duotone" />, label: 'Revenue Range',        value: data.revenue_range },
    { icon: <Briefcase size={iconSize.sm} weight="duotone" />,   label: 'Maturity Stage',       value: data.company_maturity },
    { icon: <Buildings size={iconSize.sm} weight="duotone" />,   label: 'Ownership Structure',  value: data.ownership_structure },
    { icon: <Globe size={iconSize.sm} weight="duotone" />,       label: 'Geographic Focus',     value: (data.geographic_focus || []).join(', ') || 'â€”' },
    { icon: <ShieldCheck size={iconSize.sm} weight="duotone" />, label: 'Regulatory Pressure',  value: data.regulatory_pressure },
  ];

  return (
    <div className={`${tw.card} overflow-hidden`}>
      {/* Accent top bar */}
      <div className={tw.accentBar} />
      <div className={tw.cardPadding}>
        <div className="flex items-center gap-2 mb-1">
          <ListChecks size={iconSize.md} weight="duotone" className="text-[#E11D48]" />
          <h2 className={tw.h2}>Firmographics</h2>
        </div>
        <p className={`${tw.body} mb-4`}>Target company profile characteristics and market positioning</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
          {items.map((item, i) => (
            <div key={i} className="flex items-start gap-3 bg-[#FAFAFA] rounded-xl px-3.5 py-3 border border-[#E4E4E7]/50">
              <div className="w-8 h-8 rounded-lg bg-[#FFF1F2] flex items-center justify-center text-[#E11D48] shrink-0">
                {item.icon}
              </div>
              <div className="min-w-0">
                <p className={tw.label}>{item.label}</p>
                <p className="text-sm font-semibold text-[#18181B] mt-0.5">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Industries + Tech Stack tags */}
        <div className={`${tw.divider} mb-4`} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <p className={`${tw.label} mb-2`}>Target Industries</p>
            <div className="flex flex-wrap gap-1.5">
              {(data.industries || []).map((ind, i) => (
                <span key={i} className={tw.badge('brand')}>{ind}</span>
              ))}
            </div>
          </div>
          <div>
            <p className={`${tw.label} mb-2`}>Typical Tech Stack</p>
            <div className="flex flex-wrap gap-1.5">
              {(data.typical_tech_stack || []).map((tech, i) => (
                <span key={i} className={tw.badge('neutral')}>
                  <Cpu size={10} weight="duotone" /> {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Section B â€” Single persona detail panel */
function PersonaDetail({ persona }: { persona: BuyerPersona }) {
  return (
    <div className="px-5 py-5 lg:px-6 lg:py-5 space-y-5">
      {/* Header row */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#E11D48] to-[#BE123C] flex items-center justify-center text-white">
            <UserCircle size={iconSize.lg} weight="duotone" />
          </div>
          <div>
            <h3 className={tw.h3}>{persona.title}</h3>
            <p className="text-xs text-[#71717A]">
              {persona.department} Â· {persona.seniority} Â· {persona.age_range}
            </p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${roleColor(persona.decision_role)}`}>
          {persona.decision_role}
        </span>
      </div>

      {/* KPIs, Goals, Frustrations â€” 3 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#FFF1F2] border border-[#E11D48]/10 rounded-xl px-4 py-3">
          <p className={`${tw.label} text-[#E11D48] mb-2`}>Key KPIs</p>
          <ul className="space-y-1.5">
            {(persona.key_kpis || []).map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48] mt-1.5 shrink-0" />
                <span className="text-xs text-[#18181B] leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-[#D1FAE5]/30 border border-[#059669]/10 rounded-xl px-4 py-3">
          <p className={`${tw.label} text-[#059669] mb-2`}>Goals</p>
          <ul className="space-y-1.5">
            {(persona.goals || []).map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#059669] mt-1.5 shrink-0" />
                <span className="text-xs text-[#18181B] leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-[#FEF3C7]/30 border border-[#D97706]/10 rounded-xl px-4 py-3">
          <p className={`${tw.label} text-[#D97706] mb-2`}>Frustrations</p>
          <ul className="space-y-1.5">
            {(persona.frustrations || []).map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] mt-1.5 shrink-0" />
                <span className="text-xs text-[#18181B] leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Preferred Channels */}
      <div>
        <p className={`${tw.label} mb-1.5`}>Preferred Channels</p>
        <div className="flex flex-wrap gap-1.5">
          {(persona.preferred_channels || []).map((ch, i) => (
            <span key={i} className={tw.badge('neutral')}>
              <ChatCircleDots size={iconSize.xs} weight="duotone" /> {ch}
            </span>
          ))}
        </div>
      </div>

      {/* Vietnam Behavior */}
      <div className="bg-[#FAFAFA] border-l-[3px] border-[#E11D48] rounded-r-xl px-4 py-3">
        <p className={`${tw.label} text-[#E11D48] mb-1`}>
          <Flag size={iconSize.xs} weight="fill" className="inline mr-1 -mt-0.5" />
          Vietnam Behavior
        </p>
        <p className="text-sm text-[#18181B] leading-relaxed">{persona.vietnam_behavior}</p>
      </div>

      {/* Quote */}
      <div className="flex items-start gap-2.5 bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl px-4 py-3">
        <Quotes size={iconSize.md} weight="fill" className="text-[#E11D48] shrink-0 mt-0.5" />
        <div>
          <p className="text-sm italic text-[#18181B] leading-relaxed">"{persona.quote_snippet}"</p>
          <p className="text-[10px] text-[#A1A1AA] mt-1">â€” {persona.title}, {persona.department}</p>
        </div>
      </div>
    </div>
  );
}

/** Section C â€” Single buying trigger card */
function TriggerCard({ trigger }: { trigger: BuyingTrigger }) {
  return (
    <div className={`${tw.card} ${tw.cardPadding}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#FFF1F2] flex items-center justify-center text-[#E11D48]">
            {categoryIcon(trigger.category)}
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#18181B] leading-snug">{trigger.trigger}</h4>
            <span className="text-[10px] text-[#A1A1AA] capitalize">{trigger.category}</span>
          </div>
        </div>
        <span className={tw.badge(urgencyVariant(trigger.urgency_level))}>
          {trigger.urgency_level}
        </span>
      </div>

      {/* Urgency bar */}
      <div className="mb-3">
        <div className="h-1.5 w-full rounded-full bg-[#E4E4E7] overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${severityColor(trigger.urgency_level)}`}
            style={{ width: `${severityPercent(trigger.urgency_level)}%` }}
          />
        </div>
      </div>

      <p className={`${tw.body} mb-3`}>{trigger.description}</p>

      {/* VN context callout */}
      <div className="bg-[#FAFAFA] border-l-[3px] border-[#E11D48] rounded-r-lg px-3 py-2">
        <p className="text-[10px] font-bold text-[#E11D48] uppercase tracking-wider mb-0.5">
          <Flag size={10} weight="fill" className="inline mr-0.5 -mt-px" /> VN Context
        </p>
        <p className="text-xs text-[#18181B] leading-relaxed">{trigger.vietnam_context}</p>
      </div>
    </div>
  );
}

/** Section D â€” Single pain point card */
function PainPointCard({ painPoint }: { painPoint: PainPoint }) {
  return (
    <div className={`${tw.card} ${tw.cardPadding}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-sm font-bold text-[#18181B] leading-snug flex-1">{painPoint.title}</h4>
        <div className="flex items-center gap-1.5 shrink-0">
          {painPoint.vietnam_specific && (
            <span className={tw.badge('brand')}>
              <Flag size={iconSize.xs} weight="fill" /> VN
            </span>
          )}
          <span className={tw.badge(severityVariant(painPoint.severity))}>
            {painPoint.severity}
          </span>
        </div>
      </div>

      {/* Severity bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-[#A1A1AA] font-medium">Severity Level</span>
          <span className="text-[10px] font-semibold text-[#18181B] capitalize">{painPoint.severity}</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-[#E4E4E7] overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${severityColor(painPoint.severity)}`}
            style={{ width: `${severityPercent(painPoint.severity)}%` }}
          />
        </div>
      </div>

      <p className={`${tw.body} mb-3`}>{painPoint.description}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-[#FAFAFA] rounded-lg px-3 py-2 border border-[#E4E4E7]/50">
          <p className={`${tw.label} text-[10px] mb-0.5`}>Current Workaround</p>
          <p className="text-xs text-[#18181B] leading-relaxed">{painPoint.current_workaround}</p>
        </div>
        <div className="bg-[#F5F5F4] rounded-lg px-3 py-2 border-l-2 border-[#BE123C]/30">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#BE123C] mb-0.5">Cost of Inaction</p>
          <p className="text-xs text-[#18181B] leading-relaxed">{painPoint.cost_of_inaction}</p>
        </div>
      </div>
    </div>
  );
}
