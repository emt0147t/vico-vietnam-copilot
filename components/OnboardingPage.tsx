import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RocketLaunch,
  UsersThree,
  ChartBar,
  Newspaper,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Sparkle,
  Buildings,
  CheckCircle,
} from '@phosphor-icons/react';
import {
  Loader2, Briefcase, Building2, Globe,
  User, Info, Check, Crosshair, Plus, X,
} from 'lucide-react';
import { EnterpriseInput } from './VicoUI';
import { COMPANIES } from '../data/companies';
import { getVerifiedCompanyProfiles } from '../data/verifiedCompanies';
import { RagService } from '../services/ragLayer';
import { loadFromDB } from '../utils/db';

/* ═══════════════════════════════════════════════════════════════════
   ANIMATION PRESETS  (matches designSystem.ts motion tokens)
   ═══════════════════════════════════════════════════════════════════ */
const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -60 : 60,
    opacity: 0,
    transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};



/* ═══════════════════════════════════════════════════════════════════
   STATIC DATA
   ═══════════════════════════════════════════════════════════════════ */
const JOB_ROLES = [
  'CEO / Founder',
  'Chief Technology Officer',
  'Chief Marketing Officer',
  'VP of Strategy',
  'Product Manager',
  'Marketing Director',
  'Strategy Analyst',
  'Business Development',
  'Investor / VC',
] as const;

const INDUSTRIES = [
  'Technology',
  'Fintech',
  'SaaS',
  'E-commerce',
  'Healthcare',
  'Logistics',
  'Real Estate',
  'Education',
  'Manufacturing',
] as const;

const GOAL_CARDS = [
  {
    id: 'gtm',
    label: 'Generate GTM Playbook',
    desc: 'AI-powered go-to-market strategies for Vietnam.',
    Icon: RocketLaunch,
  },
  {
    id: 'icp',
    label: 'Build Ideal Customer Profiles',
    desc: 'Firmographic & technographic customer targeting.',
    Icon: UsersThree,
  },
  {
    id: 'icp_outline',
    label: 'Outline All ICPs',
    desc: 'Map every Ideal Customer Profile for your product.',
    Icon: CheckCircle,
  },
  {
    id: 'competitors',
    label: 'Analyze Competitors',
    desc: 'Cross-industry competitive intelligence.',
    Icon: ChartBar,
  },
  {
    id: 'news',
    label: 'Read Market News',
    desc: 'Real-time Vietnamese tech ecosystem signals.',
    Icon: Newspaper,
  },
] as const;

const STEP_LABELS = ['Your Profile', 'Company Context', 'ICP Outline', 'Competitors', 'Your Goals'] as const;

/** Hero companies: verified-first companies take priority, then premium-enriched legacy */
const VERIFIED_PROFILES = getVerifiedCompanyProfiles();
const VERIFIED_NAMES_SET = new Set(VERIFIED_PROFILES.map((vp: any) => vp.name.toLowerCase()));
const HERO_COMPANIES = [
  ...VERIFIED_PROFILES,
  ...COMPANIES.filter(c => c.dataTier === 'premium' && !VERIFIED_NAMES_SET.has(c.name.toLowerCase())),
];

/** 15 hero company names for competitor autocomplete */
const HERO_COMPANY_NAMES = [
  'FPT Software', 'VNG Corporation', 'MoMo (M_Service)', 'VNPay', 'Base.vn',
  'MISA JSC', 'Sky Mavis', 'KiotViet', 'Tiki', 'Amanotes',
  'CMC Corporation', 'Viettel Solutions', 'KMS Technology', 'Got It', 'Teko Ventures',
] as const;

/* ═══════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════════════ */

/** Dark left sidebar with branding + vertical step indicator (desktop only) */
const LeftPanel: React.FC<{ step: number }> = ({ step }) => (
  <div className="hidden lg:flex flex-col w-[360px] min-h-screen bg-[#18181B] text-white px-8 py-10 relative overflow-hidden shrink-0">
    {/* Ambient glow */}
    <div className="absolute inset-0 pointer-events-none select-none">
      <div className="absolute -top-40 -left-40 w-80 h-80 bg-[#E11D48]/8 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-0 w-60 h-60 bg-[#F97316]/6 rounded-full blur-[100px]" />
    </div>

    {/* Brand mark */}
    <div className="relative z-10 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E11D48] to-[#BE123C] flex items-center justify-center shadow-lg shadow-[#E11D48]/25">
        <span className="text-white font-extrabold text-lg tracking-tight">V</span>
      </div>
      <div>
        <h2 className="font-display text-base font-extrabold tracking-tight leading-none">VICO</h2>
        <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em] mt-0.5">Intelligence Platform</p>
      </div>
    </div>

    {/* Vertical step list */}
    <nav className="relative z-10 mt-14 flex-1 space-y-1">
      {STEP_LABELS.map((label, i) => {
        const active = i === step;
        const done = i < step;
        return (
          <div
            key={i}
            className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-300 ${
              active ? 'bg-white/[0.07]' : ''
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-extrabold transition-all duration-300 shrink-0 ${
                done
                  ? 'bg-[#E11D48]/20 text-[#E11D48]'
                  : active
                    ? 'bg-[#E11D48] text-white shadow-lg shadow-[#E11D48]/30'
                    : 'bg-white/[0.04] text-white/20'
              }`}
            >
              {done ? <Check size={13} strokeWidth={3} /> : i + 1}
            </div>
            <span
              className={`text-[13px] font-semibold transition-colors duration-300 ${
                active ? 'text-white' : done ? 'text-white/50' : 'text-white/20'
              }`}
            >
              {label}
            </span>
          </div>
        );
      })}
    </nav>

    {/* Progress bar */}
    <div className="relative z-10 mb-6">
      <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#E11D48] to-[#F97316]"
          initial={false}
          animate={{ width: `${((step + 1) / STEP_LABELS.length) * 100}%` }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
      </div>
      <p className="text-[10px] text-white/20 mt-2 font-semibold">
        Step {step + 1} of {STEP_LABELS.length}
      </p>
    </div>

    {/* Trust badge */}
    <div className="relative z-10 space-y-3 pt-6 border-t border-white/[0.06]">
      <div className="flex items-center gap-2.5">
        <ShieldCheck weight="duotone" size={14} className="text-[#E11D48]/70" />
        <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest leading-none">
          End-to-end encrypted
        </p>
      </div>
      <p className="text-[10px] text-white/15">
        Your data stays private &bull; Enterprise-grade security
      </p>
    </div>
  </div>
);

/** Compact mobile progress dots (shown below top bar on small screens) */
const MobileProgress: React.FC<{ step: number; total: number }> = ({ step, total }) => (
  <div className="lg:hidden flex items-center justify-center gap-2 py-4">
    {Array.from({ length: total }, (_, i) => (
      <div
        key={i}
        className={`h-1.5 rounded-full transition-all duration-300 ${
          i === step
            ? 'w-8 bg-[#E11D48]'
            : i < step
              ? 'w-4 bg-[#E11D48]/40'
              : 'w-4 bg-[#E4E4E7]'
        }`}
      />
    ))}
  </div>
);

/** Company autocomplete input using the existing SuggestionInput pattern */
const CompanyInput: React.FC<{
  value: string;
  onChange: (v: string) => void;
  onSelect: (company: any) => void;
}> = ({ value, onChange, onSelect }) => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [show, setShow] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.length > 1) {
      debounceRef.current = setTimeout(() => fetchSuggestions(value), 300);
    } else {
      setSuggestions([]);
    }
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [value]);

  const fetchSuggestions = async (q: string) => {
    try {
      const res = await fetch(`/api/companies/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.companies?.length) { setSuggestions(data.companies.slice(0, 5)); return; }
      }
    } catch { /* fallback */ }
    setSuggestions(COMPANIES.filter(c => c.name?.toLowerCase().includes(q.toLowerCase())).slice(0, 5));
  };

  return (
    <div className="relative">
      <EnterpriseInput
        label="Company name"
        value={value}
        onChange={(e: any) => { onChange(e.target.value); setShow(true); }}
        onFocus={() => { if (suggestions.length) setShow(true); }}
        onBlur={() => setTimeout(() => setShow(false), 200)}
        placeholder="e.g. VinFast, FPT Software"
        icon={Building2}
        autoComplete="off"
      />
      {show && suggestions.length > 0 && (
        <div className="absolute z-50 left-0 right-0 top-[calc(100%+6px)] bg-white border border-[#E4E4E7] rounded-2xl shadow-xl overflow-hidden p-1.5">
          {suggestions.map((s: any, i: number) => (
            <button
              key={i}
              onMouseDown={(e) => { e.preventDefault(); onSelect(s); setShow(false); }}
              className="w-full px-4 py-2.5 text-left hover:bg-[#FAFAFA] flex items-center gap-3 rounded-xl transition-colors"
            >
              <div className="w-8 h-8 bg-[#FFF1F2] rounded-lg flex items-center justify-center text-[#E11D48] shrink-0">
                <Buildings weight="duotone" size={16} />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-[#18181B] truncate">{s.name}</div>
                {s.industry && (
                  <div className="text-[10px] text-[#A1A1AA] font-semibold uppercase tracking-wider truncate">{s.industry}</div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
interface OnboardingPageProps {
  onComplete: (data: any) => void;
  onBack: () => void;
}

export function OnboardingPage({ onComplete, onBack }: OnboardingPageProps) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const [isLaunching, setIsLaunching] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  /* ── Form state ── */
  const [fullName, setFullName] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [productsServices, setProductsServices] = useState('');
  const [orgWebsite, setOrgWebsite] = useState('');
  const [orgSize, setOrgSize] = useState('251-1000');
  const [selectedGoals, setSelectedGoals] = useState<Set<string>>(new Set());
  const [competitorInput, setCompetitorInput] = useState('');
  const [selectedCompetitors, setSelectedCompetitors] = useState<string[]>([]);

  /* ── ICP Outline state (Step 3) ── */
  interface ICPEntry {
    id: string;
    segment: string;
    painPoints: string;
    description: string;
  }
  const [icpEntries, setIcpEntries] = useState<ICPEntry[]>([]);
  const [icpAutoFilled, setIcpAutoFilled] = useState(false);

  /* ── Suggested competitors state (Step 4) ── */
  const [suggestedCompetitors, setSuggestedCompetitors] = useState<Array<{
    name: string;
    sub_industry: string;
    revenue: string;
    similarity: number;
    selected: boolean;
  }>>([]);
  const [competitorsSuggested, setCompetitorsSuggested] = useState(false);



  // Cleanup
  useEffect(() => () => { timersRef.current.forEach(clearTimeout); }, []);

  // Ensure knowledge base is seeded
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const docs = await loadFromDB('vectors');
      if (cancelled) return;
      if (docs.length === 0) await RagService.autoSeed(() => {});
    })();
    return () => { cancelled = true; };
  }, []);

  /* ── Navigation ── */
  const totalSteps = STEP_LABELS.length;
  const goNext = () => { setDirection(1); setStep(s => Math.min(s + 1, totalSteps - 1)); };
  const goBack = () => { setDirection(-1); setStep(s => Math.max(s - 1, 0)); };

  /* ── Auto-fill ICP entries when reaching Step 3 ── */
  useEffect(() => {
    if (step === 2 && !icpAutoFilled && companyName.trim()) {
      const match = HERO_COMPANIES.find(
        c => c.name.toLowerCase() === companyName.trim().toLowerCase()
      );
      const entries: ICPEntry[] = [];
      if (match?.target_audience?.length) {
        match.target_audience.forEach((audience, i) => {
          entries.push({
            id: `auto-${i}`,
            segment: audience,
            painPoints: match.key_pain_points?.[i] || '',
            description: i === 0 ? (match.description || match.intro_new || match.intro || '') : '',
          });
        });
      }
      if (entries.length === 0) {
        // Provide one blank entry for manual input
        entries.push({ id: 'manual-0', segment: '', painPoints: '', description: '' });
      }
      setIcpEntries(entries);
      setIcpAutoFilled(true);
    }
  }, [step, icpAutoFilled, companyName]);

  /* ── Auto-suggest competitors when reaching Step 4 ── */
  useEffect(() => {
    if (step === 3 && !competitorsSuggested) {
      const selected = HERO_COMPANIES.find(
        c => c.name.toLowerCase() === companyName.trim().toLowerCase()
      );
      const selectedIndustry = selected?.sub_industry || selected?.industry || industry;
      
      const suggestions = HERO_COMPANIES
        .filter(c => c.name.toLowerCase() !== companyName.trim().toLowerCase())
        .map(c => {
          // Simple similarity: same sub_industry = 85, same industry = 65, else = 40
          let sim = 40;
          if (selectedIndustry && c.sub_industry && c.sub_industry.toLowerCase() === selectedIndustry.toLowerCase()) sim = 85;
          else if (c.industry?.toLowerCase() === (selected?.industry || industry).toLowerCase()) sim = 65;
          return {
            name: c.name,
            sub_industry: c.sub_industry || c.industry || '',
            revenue: c.revenue_range || c.revenue || '',
            similarity: sim,
            selected: sim >= 65,
          };
        })
        .sort((a, b) => b.similarity - a.similarity);
      
      setSuggestedCompetitors(suggestions);
      setCompetitorsSuggested(true);
    }
  }, [step, competitorsSuggested, companyName, industry]);

  /* ── Toggle a goal card ── */
  const toggleGoal = (id: string) => {
    setSelectedGoals(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  /* ── Company autocomplete handler ── */
  const handleSelectCompany = useCallback((company: any) => {
    setCompanyName(company.name);
    setOrgWebsite(company.website || '');
    setOrgSize(company.size || '251-1000');
    setCompanyDescription(company.intro_new || company.intro || company.giới_thiệu_mới || '');
    setProductsServices(company.products_new || company.products || company.sản_phẩm_dịch_vụ_mới || '');
    if (company.industry) setIndustry(company.industry);
  }, []);

  /* ── Final submit ── */
  const handleComplete = async () => {
    setIsLaunching(true);

    // Merge: user-selected from Step 2 + suggested from Step 4
    // Pass full company profile data so competitor analysis can use DB fields as fallbacks
    const step4Selected = suggestedCompetitors.filter(c => c.selected).map(c => {
      const profile = HERO_COMPANIES.find(h => h.name === c.name);
      return {
        name: c.name,
        industry: c.sub_industry,
        similarity: c.similarity,
        selected: true,
        // Rich data for competitor analysis service
        products: profile?.products || '',
        intro: profile?.intro || '',
        address: profile?.address || '',
        size: profile?.size || '',
        website: profile?.website || '',
        year: profile?.year || 0,
        revenue: profile?.revenue || '',
        headcount: profile?.headcount || 0,
        total_funding: profile?.total_funding || '',
        employee_range: profile?.employee_range || '',
      };
    });
    const manualPicked = selectedCompetitors
      .filter(name => !step4Selected.find(s => s.name === name))
      .map(name => {
        const profile = HERO_COMPANIES.find(h => h.name === name);
        return {
          name,
          industry: profile?.sub_industry || profile?.industry || '',
          similarity: 100,
          selected: true,
          products: profile?.products || '',
          intro: profile?.intro || '',
          address: profile?.address || '',
          size: profile?.size || '',
          website: profile?.website || '',
          year: profile?.year || 0,
          revenue: profile?.revenue || '',
          headcount: profile?.headcount || 0,
          total_funding: profile?.total_funding || '',
          employee_range: profile?.employee_range || '',
        };
      });
    const competitors = [...manualPicked, ...step4Selected];

    // Parse name
    const nameParts = fullName.trim().split(/\s+/);
    const firstName = nameParts[nameParts.length - 1] || '';
    const lastName = nameParts.slice(0, -1).join(' ') || '';

    // Small delay for the animation to play
    const timer = setTimeout(() => {
      onComplete({
        firstName,
        lastName,
        email: '', // comes from Clerk session
        jobTitle: jobRole,
        orgName: companyName,
        orgWebsite,
        orgSize,
        hqCountry: 'Vietnam',
        companyDescription,
        productsServices,
        industry: industry || 'Technology',
        competitors,
        icpProfiles: icpEntries.filter(e => e.segment.trim()),
        goals: Array.from(selectedGoals),
      });
    }, 2200);
    timersRef.current.push(timer);
  };

  /* ── Validation ── */
  const step1Valid = fullName.trim().length > 0 && jobRole.length > 0;
  const step2Valid = companyName.trim().length > 0 && industry.length > 0;
  const step3Valid = icpEntries.some(e => e.segment.trim().length > 0); // At least one ICP segment
  // Step 4 (Competitor Suggestions) is always valid — selection is optional
  const step5Valid = selectedGoals.size > 0;

  /* ══════════════════════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-[#FAFAFA] antialiased flex selection:bg-[#E11D48] selection:text-white">

      {/* ─── LAUNCH OVERLAY ─── */}
      <AnimatePresence>
        {isLaunching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-[#18181B] flex items-center justify-center"
          >
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#E11D48]/10 rounded-full blur-[150px] animate-pulse" />
            </div>
            <div className="relative z-10 text-center space-y-8">
              {/* Animated logo */}
              <div className="relative mx-auto w-28 h-28">
                <div className="absolute inset-0 rounded-full border-2 border-[#E11D48]/30 animate-spin" style={{ animationDuration: '3s' }} />
                <div className="absolute inset-3 rounded-full border-2 border-dashed border-[#E11D48]/50 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
                <div className="absolute inset-6 rounded-full overflow-hidden shadow-2xl shadow-[#E11D48]/30">
                  <img src="/logo.png" alt="VICO" className="w-full h-full object-cover" />
                </div>
                <div className="absolute inset-0 rounded-full bg-[#E11D48]/20 animate-ping" style={{ animationDuration: '1.5s' }} />
              </div>

              <div className="space-y-2">
                <h2 className="font-display text-2xl font-extrabold text-white tracking-tight">Preparing your workspace</h2>
                <p className="text-sm text-white/50">
                  Calibrating intelligence for <span className="text-[#E11D48] font-bold">{companyName || 'your organization'}</span>
                </p>
              </div>

              <div className="w-48 mx-auto">
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#E11D48] to-[#F97316] rounded-full animate-loading-bar" />
                </div>
              </div>

              <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest">
                VICO Intelligence &bull; Vietnam Market Platform
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── LEFT PANEL (desktop only) ─── */}
      <LeftPanel step={step} />

      {/* ─── RIGHT CONTENT ─── */}
      <div className="flex-1 min-h-screen flex flex-col">
        {/* Top nav */}
        <div className="px-6 lg:px-12 pt-6 lg:pt-8 flex items-center justify-between">
          <button
            onClick={step === 0 ? onBack : goBack}
            className="flex items-center gap-1.5 text-[#A1A1AA] hover:text-[#18181B] transition-colors text-xs font-semibold group"
          >
            <ArrowLeft weight="bold" size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            {step === 0 ? 'Back' : 'Previous'}
          </button>
          <span className="lg:hidden text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-widest">
            Step {step + 1} of {totalSteps}
          </span>
        </div>

        {/* Mobile progress dots */}
        <MobileProgress step={step} total={totalSteps} />

        {/* Main content area */}
        <div className="flex-1 relative overflow-hidden max-w-[540px] w-full mx-auto px-6 lg:px-8 pt-6 lg:pt-10 pb-12">
          <AnimatePresence mode="wait" custom={direction}>
            {/* ══════════════ STEP 1: YOUR PROFILE ══════════════ */}
            {step === 0 && (
              <motion.div
                key="step-1"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                {/* Header */}
                <div className="mb-10">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkle weight="duotone" size={16} className="text-[#E11D48]" />
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-[#E11D48]">Step 1</span>
                  </div>
                  <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#18181B] mb-2">
                    Let's get started
                  </h1>
                  <p className="text-sm text-[#71717A] mb-5">Tell us about yourself so we can personalize your intelligence experience.</p>
                  {/* Value prop pills */}
                  <div className="flex flex-wrap gap-2">
                    {['Market Intelligence', 'GTM Playbooks', 'Competitor Analysis'].map(tag => (
                      <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E4E4E7] text-[10px] font-semibold text-[#71717A]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48]" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Fields */}
                <div className="space-y-5">
                  <EnterpriseInput
                    label="Full name"
                    type="text"
                    value={fullName}
                    onChange={(e: any) => setFullName(e.target.value)}
                    placeholder="Nguyen Van An"
                    icon={User}
                  />

                  <div className="relative">
                    <label className="block text-[10px] font-semibold text-[#A1A1AA] uppercase tracking-widest mb-1.5">
                      Job role
                    </label>
                    <div className="relative">
                      <input
                        list="job-roles-datalist"
                        value={jobRole}
                        onChange={(e) => setJobRole(e.target.value)}
                        placeholder="Select or type your role"
                        className="w-full rounded-[10px] border border-[#E4E4E7] bg-white px-4 py-3 pr-10 text-sm font-semibold text-[#18181B] focus:ring-2 focus:ring-[#E11D48]/30 focus:border-[#E11D48] transition-colors outline-none"
                      />
                      <datalist id="job-roles-datalist">
                        {JOB_ROLES.map(r => <option key={r} value={r} />)}
                      </datalist>
                      <Briefcase size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A1A1AA] pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="mt-10">
                  <button
                    onClick={goNext}
                    disabled={!step1Valid}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-[10px] bg-[#E11D48] px-5 py-3.5 text-sm font-semibold text-white hover:bg-[#BE123C] active:scale-[0.98] transition-all duration-150 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next Step
                    <ArrowRight weight="bold" size={14} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ══════════════ STEP 2: COMPANY CONTEXT ══════════════ */}
            {step === 1 && (
              <motion.div
                key="step-2"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <div className="mb-10">
                  <div className="flex items-center gap-2 mb-3">
                    <Buildings weight="duotone" size={16} className="text-[#E11D48]" />
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-[#E11D48]">Step 2</span>
                  </div>
                  <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#18181B] mb-2">
                    Set up your workspace
                  </h1>
                  <p className="text-sm text-[#71717A]">Help VICO understand your business context.</p>
                </div>

                <div className="space-y-5">
                  <CompanyInput
                    value={companyName}
                    onChange={setCompanyName}
                    onSelect={handleSelectCompany}
                  />

                  <div className="relative">
                    <label className="block text-[10px] font-semibold text-[#A1A1AA] uppercase tracking-widest mb-1.5">
                      Industry
                    </label>
                    <div className="relative">
                      <select
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className="w-full appearance-none rounded-[10px] border border-[#E4E4E7] bg-white px-4 py-3 pr-10 text-sm font-semibold text-[#18181B] focus:ring-2 focus:ring-[#E11D48]/30 focus:border-[#E11D48] transition-colors outline-none"
                      >
                        <option value="" disabled>Select your industry</option>
                        {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                      </select>
                      <Globe size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A1A1AA] pointer-events-none" />
                    </div>
                  </div>

                  {/* Subtle info callout */}
                  <div className="flex items-start gap-3 rounded-xl border border-[#E11D48]/10 bg-[#FFF1F2] p-3.5">
                    <Info size={14} className="text-[#E11D48] mt-0.5 shrink-0" />
                    <p className="text-[11px] font-medium text-[#E11D48]/80">
                      VICO AI will use your company and industry context to tailor market insights, competitor analysis, and GTM strategies.
                    </p>
                  </div>

                  {/* Key Competitors (autocomplete from hero companies) */}
                  <div>
                    <label className="block text-[10px] font-semibold text-[#A1A1AA] uppercase tracking-widest mb-1.5">
                      Key Competitors <span className="normal-case text-[#A1A1AA]">(optional)</span>
                    </label>
                    <div className="relative">
                      <input
                        list="hero-companies-datalist"
                        value={competitorInput}
                        onChange={(e) => setCompetitorInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && competitorInput.trim()) {
                            e.preventDefault();
                            const match = HERO_COMPANY_NAMES.find(
                              (n) => n.toLowerCase() === competitorInput.trim().toLowerCase()
                            );
                            if (match && !selectedCompetitors.includes(match)) {
                              setSelectedCompetitors((prev) => [...prev, match]);
                              setCompetitorInput('');
                            }
                          }
                        }}
                        placeholder="Search hero companies (e.g. FPT Software, MoMo)…"
                        className="w-full rounded-[10px] border border-[#E4E4E7] bg-white px-4 py-3 pr-10 text-sm font-semibold text-[#18181B] focus:ring-2 focus:ring-[#E11D48]/30 focus:border-[#E11D48] transition-colors outline-none"
                      />
                      <datalist id="hero-companies-datalist">
                        {HERO_COMPANY_NAMES.filter((n) => !selectedCompetitors.includes(n)).map((n) => (
                          <option key={n} value={n} />
                        ))}
                      </datalist>
                      <Buildings weight="duotone" size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A1A1AA] pointer-events-none" />
                    </div>
                    {selectedCompetitors.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedCompetitors.map((name) => (
                          <span
                            key={name}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFF1F2] text-[#E11D48] rounded-full text-xs font-semibold border border-[#E11D48]/10"
                          >
                            {name}
                            <button
                              type="button"
                              onClick={() => setSelectedCompetitors((prev) => prev.filter((n) => n !== name))}
                              className="hover:text-[#BE123C] transition-colors"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-10">
                  <button
                    onClick={goNext}
                    disabled={!step2Valid}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-[10px] bg-[#E11D48] px-5 py-3.5 text-sm font-semibold text-white hover:bg-[#BE123C] active:scale-[0.98] transition-all duration-150 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next Step
                    <ArrowRight weight="bold" size={14} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ══════════════ STEP 3: ICP OUTLINE ══════════════ */}
            {step === 2 && (
              <motion.div
                key="step-3-icp"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-3">
                    <Crosshair size={16} className="text-[#E11D48]" />
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-[#E11D48]">Step 3</span>
                  </div>
                  <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#18181B] mb-2">
                    Outline your ICPs
                  </h1>
                  <p className="text-sm text-[#71717A]">
                    Define your Ideal Customer Profiles. Add at least one customer segment to continue.
                  </p>
                </div>

                {/* Auto-fill indicator */}
                {icpEntries.length > 1 && icpEntries[0]?.segment && (
                  <div className="flex items-center gap-2 mb-4 px-3.5 py-2.5 rounded-xl bg-[#FFF1F2]/60 border border-[#E11D48]/10">
                    <Sparkle weight="duotone" size={14} className="text-[#E11D48] shrink-0" />
                    <p className="text-[11px] font-medium text-[#E11D48]/80">
                      Auto-filled from <span className="font-bold">{companyName}</span> data — edit as needed
                    </p>
                  </div>
                )}

                <div className="space-y-4 max-h-[48vh] overflow-y-auto pr-1 custom-scrollbar">
                  {icpEntries.map((entry, idx) => (
                    <div key={entry.id} className="relative bg-white border border-[#E4E4E7] rounded-2xl overflow-hidden group hover:border-[#E11D48]/20 transition-colors">
                      {/* Left accent bar */}
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#E11D48] to-[#F97316] rounded-l-2xl" />

                      <div className="pl-5 pr-4 py-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-[#FFF1F2] text-[#E11D48] flex items-center justify-center text-[10px] font-extrabold">
                              {idx + 1}
                            </span>
                            <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-widest">ICP Segment</span>
                          </div>
                          {icpEntries.length > 1 && (
                            <button
                              onClick={() => setIcpEntries(prev => prev.filter(e => e.id !== entry.id))}
                              className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-md flex items-center justify-center text-[#A1A1AA] hover:bg-[#FFF1F2] hover:text-[#E11D48] transition-all"
                              title="Remove"
                            >
                              <X size={13} />
                            </button>
                          )}
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-[#A1A1AA] uppercase tracking-widest mb-1">
                            Target Segment <span className="text-[#E11D48]">*</span>
                          </label>
                          <input
                            type="text"
                            value={entry.segment}
                            onChange={(e) => setIcpEntries(prev => prev.map(en => en.id === entry.id ? { ...en, segment: e.target.value } : en))}
                            placeholder="e.g. Enterprise CIOs seeking offshore dev partners"
                            className="w-full rounded-lg border border-[#E4E4E7] bg-[#FAFAFA] px-3 py-2.5 text-sm text-[#18181B] focus:ring-2 focus:ring-[#E11D48]/20 focus:border-[#E11D48] outline-none transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-[#A1A1AA] uppercase tracking-widest mb-1">
                            Key Pain Point
                          </label>
                          <input
                            type="text"
                            value={entry.painPoints}
                            onChange={(e) => setIcpEntries(prev => prev.map(en => en.id === entry.id ? { ...en, painPoints: e.target.value } : en))}
                            placeholder="e.g. High developer turnover, margin pressure"
                            className="w-full rounded-lg border border-[#E4E4E7] bg-[#FAFAFA] px-3 py-2.5 text-sm text-[#18181B] focus:ring-2 focus:ring-[#E11D48]/20 focus:border-[#E11D48] outline-none transition-colors"
                          />
                        </div>
                        {idx === 0 && (
                          <div>
                            <label className="block text-[10px] font-semibold text-[#A1A1AA] uppercase tracking-widest mb-1">
                              Company Context
                            </label>
                            <textarea
                              value={entry.description}
                              onChange={(e) => setIcpEntries(prev => prev.map(en => en.id === entry.id ? { ...en, description: e.target.value } : en))}
                              placeholder="Brief description of your product/company…"
                              rows={2}
                              className="w-full rounded-lg border border-[#E4E4E7] bg-[#FAFAFA] px-3 py-2.5 text-sm text-[#18181B] focus:ring-2 focus:ring-[#E11D48]/20 focus:border-[#E11D48] outline-none transition-colors resize-none"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add ICP button */}
                <button
                  onClick={() => setIcpEntries(prev => [...prev, { id: `manual-${Date.now()}`, segment: '', painPoints: '', description: '' }])}
                  className="mt-4 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-[#E11D48] hover:bg-[#FFF1F2] transition-colors"
                >
                  <Plus size={14} /> Add another ICP segment
                </button>

                <div className="mt-8">
                  <button
                    onClick={goNext}
                    disabled={!step3Valid}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-[10px] bg-[#E11D48] px-5 py-3.5 text-sm font-semibold text-white hover:bg-[#BE123C] active:scale-[0.98] transition-all duration-150 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next Step
                    <ArrowRight weight="bold" size={14} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ══════════════ STEP 4: COMPETITOR SUGGESTIONS ══════════════ */}
            {step === 3 && (
              <motion.div
                key="step-4-competitors"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-3">
                    <ChartBar weight="duotone" size={16} className="text-[#E11D48]" />
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-[#E11D48]">Step 4</span>
                  </div>
                  <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#18181B] mb-2">
                    Your competitive landscape
                  </h1>
                  <p className="text-sm text-[#71717A]">
                    We identified companies similar to <span className="font-semibold text-[#18181B]">{companyName || 'your company'}</span>. Toggle the ones you want to track.
                  </p>
                </div>

                {/* Select / Clear controls */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-semibold text-[#71717A]">
                    {suggestedCompetitors.filter(c => c.selected).length} of {suggestedCompetitors.length} selected
                  </span>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setSuggestedCompetitors(prev => prev.map(c => ({ ...c, selected: true })))}
                      className="text-[11px] font-semibold text-[#E11D48] hover:text-[#BE123C] transition-colors"
                    >
                      Select all
                    </button>
                    <span className="text-[#E4E4E7]">|</span>
                    <button
                      onClick={() => setSuggestedCompetitors(prev => prev.map(c => ({ ...c, selected: false })))}
                      className="text-[11px] font-semibold text-[#A1A1AA] hover:text-[#18181B] transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-1 custom-scrollbar">
                  {suggestedCompetitors.map((comp) => (
                    <button
                      key={comp.name}
                      onClick={() => setSuggestedCompetitors(prev =>
                        prev.map(c => c.name === comp.name ? { ...c, selected: !c.selected } : c)
                      )}
                      className={`text-left p-4 rounded-2xl border-2 transition-all duration-200 group relative overflow-hidden ${
                        comp.selected
                          ? 'bg-[#FFF1F2] border-[#E11D48] shadow-sm'
                          : 'bg-white border-[#E4E4E7] hover:border-[#E11D48]/20'
                      }`}
                    >
                      {/* Selection check */}
                      {comp.selected && (
                        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#E11D48] flex items-center justify-center">
                          <Check size={9} className="text-white" strokeWidth={3} />
                        </div>
                      )}

                      {/* Company initial avatar */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-extrabold mb-3 transition-colors ${
                        comp.selected
                          ? 'bg-[#E11D48] text-white'
                          : 'bg-[#F4F4F5] text-[#71717A] group-hover:bg-[#FFF1F2] group-hover:text-[#E11D48]'
                      }`}>
                        {comp.name.charAt(0)}
                      </div>

                      <h4 className="text-[13px] font-bold text-[#18181B] truncate mb-0.5">{comp.name}</h4>
                      <p className="text-[11px] text-[#71717A] truncate">{comp.sub_industry}</p>

                      {/* Similarity bar */}
                      <div className="mt-2.5 flex items-center gap-2">
                        <div className="flex-1 h-1 bg-[#E4E4E7]/50 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              comp.similarity >= 80 ? 'bg-[#E11D48]' :
                              comp.similarity >= 60 ? 'bg-amber-400' :
                              'bg-[#A1A1AA]'
                            }`}
                            style={{ width: `${comp.similarity}%` }}
                          />
                        </div>
                        <span className={`text-[10px] font-bold shrink-0 ${
                          comp.similarity >= 80 ? 'text-[#E11D48]' :
                          comp.similarity >= 60 ? 'text-amber-600' :
                          'text-[#A1A1AA]'
                        }`}>
                          {comp.similarity}%
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-8">
                  <button
                    onClick={goNext}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-[10px] bg-[#E11D48] px-5 py-3.5 text-sm font-semibold text-white hover:bg-[#BE123C] active:scale-[0.98] transition-all duration-150 shadow-sm"
                  >
                    Next Step
                    <ArrowRight weight="bold" size={14} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ══════════════ STEP 5: PRIMARY GOALS ══════════════ */}
            {step === 4 && (
              <motion.div
                key="step-5"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <div className="mb-10">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle weight="duotone" size={16} className="text-[#E11D48]" />
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-[#E11D48]">Step 5</span>
                  </div>
                  <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#18181B] mb-2">
                    What do you want to achieve?
                  </h1>
                  <p className="text-sm text-[#71717A]">Select one or more goals. You can always explore everything later.</p>
                </div>

                {/* 2x2 Bento Goal Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {GOAL_CARDS.map((card) => {
                    const isSelected = selectedGoals.has(card.id);
                    return (
                      <button
                        key={card.id}
                        onClick={() => toggleGoal(card.id)}
                        className={`text-left p-5 rounded-2xl border-2 transition-all duration-200 group relative overflow-hidden ${
                          isSelected
                            ? 'bg-[#FFF1F2] border-[#E11D48] ring-2 ring-[#E11D48]/20 shadow-sm'
                            : 'bg-white border-[#E4E4E7] hover:border-[#E11D48]/30 hover:shadow-sm'
                        }`}
                      >
                        {/* Check indicator */}
                        {isSelected && (
                          <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#E11D48] flex items-center justify-center">
                            <Check size={10} className="text-white" strokeWidth={3} />
                          </div>
                        )}

                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${
                            isSelected
                              ? 'bg-[#E11D48] text-white'
                              : 'bg-[#FAFAFA] text-[#A1A1AA] group-hover:text-[#E11D48] group-hover:bg-[#FFF1F2]'
                          }`}
                        >
                          <card.Icon weight="duotone" size={22} />
                        </div>
                        <h3
                          className={`font-display text-sm font-bold tracking-tight mb-1 transition-colors ${
                            isSelected ? 'text-[#E11D48]' : 'text-[#18181B]'
                          }`}
                        >
                          {card.label}
                        </h3>
                        <p className="text-[11px] text-[#71717A] leading-relaxed">{card.desc}</p>
                      </button>
                    );
                  })}
                </div>

                {/* Complete CTA — AI gradient */}
                <div className="mt-10">
                  <button
                    onClick={handleComplete}
                    disabled={!step5Valid || isLaunching}
                    className="inline-flex w-full items-center justify-center gap-2.5 rounded-[10px] bg-gradient-to-r from-[#E11D48] to-[#F97316] px-5 py-4 text-sm font-semibold text-white hover:opacity-90 active:scale-[0.98] transition-all duration-150 shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isLaunching ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <>
                        Complete Setup & Enter Dashboard
                        <ArrowRight weight="bold" size={16} />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer — mobile only; desktop shows this in LeftPanel */}
        <div className="lg:hidden pt-6 pb-8 flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-[#A1A1AA]">
          <ShieldCheck weight="duotone" size={12} className="text-[#E11D48]" />
          End-to-end encrypted &bull; Your data stays private
        </div>
      </div>
    </div>
  );
}
