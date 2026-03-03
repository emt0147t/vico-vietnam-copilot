import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Funnel,
  Brain,
  RocketLaunch,
  ShieldCheck,
  ArrowRight,
  Play,
  ChartLineUp,
  Buildings,
  Sparkle,
  Lightning,
  Globe,
  Lock,
} from '@phosphor-icons/react';
import { Logo, EnterpriseInput } from './VicoUI';
import { X, CheckCircle2, ChevronDown, Loader2 } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════
   ANIMATION PRESETS
   Matches config/designSystem.ts motion tokens — professional ease
   ═══════════════════════════════════════════════════════════════════ */
const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const } },
} as const;

const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.1 } },
};

/* ═══════════════════════════════════════════════════════════════════
   STATIC DATA
   ═══════════════════════════════════════════════════════════════════ */
const heroCompanies = [
  'FPT Software', 'VNG Corporation', 'MoMo', 'Base.vn', 'VNPay',
  'Tiki', 'BE Group', 'KiotViet', 'Haravan', 'TopCV',
];

const industries = [
  { label: 'Technology',  pct: 92 },
  { label: 'Fintech',     pct: 78 },
  { label: 'E-Commerce',  pct: 65 },
  { label: 'Healthcare',  pct: 51 },
  { label: 'Logistics',   pct: 43 },
];

const gtmPhases = [
  { phase: '01', title: 'Market Discovery',  done: true  },
  { phase: '02', title: 'ICP Validation',    active: true },
  { phase: '03', title: 'Channel Strategy',  done: false },
];

const icpTags = ['Cloud-native', 'AI / ML', 'Vietnam HQ', 'B2B SaaS'];

const statItems = [
  { value: '10,289', label: 'Companies Tracked',  Icon: Buildings },
  { value: '9',      label: 'Industry Verticals',  Icon: Globe },
  { value: 'Real-time', label: 'Data Updates',       Icon: Lightning },
];

/* ═══════════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
interface LandingPageProps {
  onStart: () => void;
  onLoginClick?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, onLoginClick }) => {
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [demoSubmitted, setDemoSubmitted] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoError, setDemoError] = useState('');

  /* ── Demo form handler ──────────────────────────────────────── */
  const handleDemoSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setDemoError('');
    setDemoLoading(true);

    const form = e.currentTarget;
    const fd   = new FormData(form);
    const payload = {
      lastName:  (fd.get('lastName')  as string || '').trim(),
      firstName: (fd.get('firstName') as string || '').trim(),
      email:     (fd.get('email')     as string || '').trim(),
      jobTitle:  (fd.get('jobTitle')  as string || '').trim(),
      phone:     (fd.get('phone')     as string || '').trim(),
    };

    try {
      const res  = await fetch('/api/demo-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setDemoError(data.error || 'Submission failed. Please try again.');
        setDemoLoading(false);
        return;
      }

      setDemoSubmitted(true);
      setDemoLoading(false);
      setTimeout(() => { setShowDemoModal(false); setDemoSubmitted(false); }, 2500);
    } catch {
      setDemoError('Cannot connect to server. Please try again later.');
      setDemoLoading(false);
    }
  };

  /* ══════════════════════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#18181B] antialiased overflow-x-hidden">

      {/* Inline marquee keyframes */}
      <style>{`
        @keyframes vico-marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .vico-marquee { animation: vico-marquee 45s linear infinite; }
        .vico-marquee:hover { animation-play-state: paused; }
      `}</style>

      {/* ─────────────── NAVIGATION ─────────────── */}
      <header className="sticky top-0 z-50 bg-[#FAFAFA]/80 backdrop-blur-xl border-b border-[#E4E4E7]/60">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3 lg:px-10">
          <button
            onClick={() => window.location.reload()}
            className="bg-transparent border-none cursor-pointer"
            aria-label="Home"
          >
            <Logo />
          </button>

          <div className="flex items-center gap-3 lg:gap-5">
            <button
              onClick={onLoginClick}
              className="text-[#71717A] hover:text-[#18181B] text-sm font-semibold transition-colors hidden sm:block"
            >
              Sign In
            </button>
            <button
              onClick={onStart}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[10px] bg-[#E11D48] text-white text-sm font-semibold hover:bg-[#BE123C] active:scale-[0.98] transition-all duration-150 shadow-sm"
            >
              Enter Workspace
              <ArrowRight weight="bold" size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* ─────────────── HERO SECTION ─────────────── */}
      <section className="relative pt-20 pb-16 lg:pt-32 lg:pb-24 px-6 text-center overflow-hidden">
        {/* Ambient glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-br from-[#E11D48]/[0.04] to-[#F97316]/[0.04] rounded-full blur-[120px] pointer-events-none"
          aria-hidden="true"
        />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="relative z-10 max-w-4xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            variants={fadeUp}
            className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#E4E4E7] shadow-sm text-xs font-semibold text-[#71717A]"
          >
            <Sparkle weight="duotone" size={14} className="text-[#E11D48]" />
            Vietnam Market Intelligence Platform
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            className="font-display text-4xl sm:text-5xl lg:text-[3.75rem] font-extrabold leading-[1.1] tracking-tight mb-6"
          >
            Strategic Market Intelligence{' '}
            <br className="hidden sm:block" />
            for{' '}
            <span className="bg-gradient-to-r from-[#E11D48] to-[#F97316] bg-clip-text text-transparent">
              Vietnam&apos;s Tech Ecosystem
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={fadeUp}
            className="text-base lg:text-lg text-[#71717A] max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Empowering executives with real-time data, auto&#8209;generated ICP profiles,
            and actionable GTM playbooks&nbsp;&mdash; all in one premium workspace.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onStart}
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-[#E11D48] text-white text-base font-bold hover:bg-[#BE123C] active:scale-[0.97] transition-all duration-150 shadow-[0_8px_24px_rgba(225,29,72,0.25)] hover:shadow-[0_12px_32px_rgba(225,29,72,0.35)] w-full sm:w-auto"
            >
              Enter Workspace
              <ArrowRight weight="bold" size={18} />
            </button>
            <button
              onClick={() => setShowDemoModal(true)}
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-white border border-[#E4E4E7] text-[#18181B] text-base font-bold hover:border-[#E11D48]/30 hover:bg-white active:scale-[0.97] transition-all duration-150 shadow-sm w-full sm:w-auto"
            >
              <Play weight="fill" size={16} className="text-[#E11D48]" />
              Book Demo
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* ─────────────── SOCIAL PROOF MARQUEE ─────────────── */}
      <section className="py-10 border-y border-[#E4E4E7]/60 bg-white/50">
        <p className="text-center text-[10px] font-semibold uppercase tracking-[0.25em] text-[#A1A1AA] mb-6">
          Analyzing data from Vietnam&apos;s leading tech ecosystems
        </p>
        <div className="overflow-hidden relative max-w-5xl mx-auto">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#FAFAFA] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#FAFAFA] to-transparent z-10 pointer-events-none" />
          <div className="flex vico-marquee whitespace-nowrap">
            {[...heroCompanies, ...heroCompanies].map((name, i) => (
              <span
                key={i}
                className="mx-8 lg:mx-12 text-lg lg:text-xl font-bold text-[#D4D4D8] select-none"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────── FEATURES BENTO GRID ─────────────── */}
      <section className="py-20 lg:py-28 px-6">
        <div className="max-w-6xl mx-auto">

          {/* Section header */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={stagger}
            className="text-center mb-14"
          >
            <motion.p variants={fadeUp} className="text-[11px] font-semibold uppercase tracking-widest text-[#E11D48] mb-3">
              Platform Capabilities
            </motion.p>
            <motion.h2 variants={fadeUp} className="font-display text-3xl lg:text-4xl font-extrabold tracking-tight mb-4">
              Everything you need to win in Vietnam
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[#71717A] text-base max-w-xl mx-auto">
              From market screening to GTM execution&nbsp;&mdash; one intelligent platform.
            </motion.p>
          </motion.div>

          {/* Bento Grid */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={stagger}
            className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5"
          >
            {/* ── CARD 1: Cross-Industry Screener (Large — spans 2 rows) ── */}
            <motion.div
              variants={fadeUp}
              className="bg-white border border-[#E4E4E7] rounded-3xl p-7 lg:p-8 lg:row-span-2 flex flex-col justify-between hover:shadow-lg hover:border-[#E11D48]/20 transition-all duration-300"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#FFF1F2] flex items-center justify-center mb-5">
                  <Funnel weight="duotone" size={24} className="text-[#E11D48]" />
                </div>
                <h3 className="font-display text-xl font-bold tracking-tight mb-2">Cross-Industry Screener</h3>
                <p className="text-sm text-[#71717A] leading-relaxed mb-6">
                  Filter 10,000+ Vietnamese companies across 9 verticals by revenue,
                  headcount, funding stage, and AI&#8209;readiness score.
                </p>
              </div>

              {/* Mini chart visualization */}
              <div className="space-y-3 bg-[#FAFAFA] rounded-2xl p-5 border border-[#E4E4E7]/60">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-[#A1A1AA]">Industry match</span>
                  <span className="text-[10px] font-bold text-[#E11D48]">47 companies</span>
                </div>
                {industries.map((bar) => (
                  <div key={bar.label} className="flex items-center gap-3">
                    <span className="text-[10px] font-medium text-[#71717A] w-20 text-right shrink-0">{bar.label}</span>
                    <div className="flex-1 h-2 bg-[#E4E4E7]/40 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#E11D48] to-[#F97316]"
                        style={{ width: `${bar.pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-[#18181B] w-8 text-right">{bar.pct}%</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* ── CARD 2: Smart ICP Builder ── */}
            <motion.div
              variants={fadeUp}
              className="bg-white border border-[#E4E4E7] rounded-3xl p-7 lg:p-8 hover:shadow-lg hover:border-[#E11D48]/20 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E11D48] to-[#F97316] flex items-center justify-center mb-5">
                <Brain weight="duotone" size={24} className="text-white" />
              </div>
              <h3 className="font-display text-xl font-bold tracking-tight mb-2">Smart ICP Builder</h3>
              <p className="text-sm text-[#71717A] leading-relaxed mb-5">
                Automatically generates Ideal Customer Profiles with firmographics,
                technographics, and buying signals.
              </p>

              {/* Mock persona card */}
              <div className="bg-[#FAFAFA] rounded-2xl p-4 border border-[#E4E4E7]/60 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#E11D48] to-[#F97316] flex items-center justify-center shrink-0">
                    <span className="text-white text-[10px] font-extrabold">AI</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#18181B]">VP of Engineering</div>
                    <div className="text-[10px] text-[#A1A1AA]">Series B+ &bull; 50–200 employees</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {icpTags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-0.5 text-[9px] font-semibold rounded-full bg-[#FFF1F2] text-[#E11D48] border border-[#E11D48]/10"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* ── CARD 3: GTM Playbooks ── */}
            <motion.div
              variants={fadeUp}
              className="bg-white border border-[#E4E4E7] rounded-3xl p-7 lg:p-8 hover:shadow-lg hover:border-[#E11D48]/20 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#FFF7ED] flex items-center justify-center mb-5">
                <RocketLaunch weight="duotone" size={24} className="text-[#F97316]" />
              </div>
              <h3 className="font-display text-xl font-bold tracking-tight mb-2">GTM Playbooks</h3>
              <p className="text-sm text-[#71717A] leading-relaxed mb-5">
                AI-generated go-to-market strategies with phased execution plans
                tailored to the Vietnamese market.
              </p>

              {/* Phase indicators */}
              <div className="space-y-3">
                {gtmPhases.map((step) => (
                  <div key={step.phase} className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        step.done
                          ? 'bg-[#D1FAE5] text-[#059669]'
                          : step.active
                            ? 'bg-gradient-to-br from-[#E11D48] to-[#F97316] text-white shadow-sm'
                            : 'bg-[#FAFAFA] text-[#A1A1AA] border border-[#E4E4E7]'
                      }`}
                    >
                      {step.phase}
                    </div>
                    <span
                      className={`text-sm font-semibold ${
                        step.done || step.active ? 'text-[#18181B]' : 'text-[#A1A1AA]'
                      }`}
                    >
                      {step.title}
                    </span>
                    {step.done && <CheckCircle2 size={14} className="text-[#059669] ml-auto" />}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* ── CARD 4: Executive Workspace (Full-width) ── */}
            <motion.div
              variants={fadeUp}
              className="bg-white border border-[#E4E4E7] rounded-3xl p-7 lg:p-8 lg:col-span-2 hover:shadow-lg hover:border-[#E11D48]/20 transition-all duration-300"
            >
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div className="flex-1">
                  <div className="w-12 h-12 rounded-2xl bg-[#FFF1F2] flex items-center justify-center mb-5">
                    <ShieldCheck weight="duotone" size={24} className="text-[#E11D48]" />
                  </div>
                  <h3 className="font-display text-xl font-bold tracking-tight mb-2">Executive Workspace</h3>
                  <p className="text-sm text-[#71717A] leading-relaxed">
                    Save research, GTM plans, and competitive analyses in your private,
                    encrypted workspace. Access your strategic assets from anywhere.
                  </p>
                </div>
                {/* Mock saved-reports stack */}
                <div className="flex items-center gap-3 bg-[#FAFAFA] rounded-2xl p-4 border border-[#E4E4E7]/60 shrink-0">
                  <div className="flex -space-x-2">
                    {['📊', '📈', '📋', '🎯'].map((emoji, i) => (
                      <div
                        key={i}
                        className="w-10 h-10 rounded-xl bg-white border border-[#E4E4E7] flex items-center justify-center text-base shadow-sm"
                      >
                        {emoji}
                      </div>
                    ))}
                  </div>
                  <div className="ml-2">
                    <div className="text-xs font-bold text-[#18181B]">4 reports saved</div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Lock weight="duotone" size={10} className="text-[#059669]" />
                      <span className="text-[10px] text-[#A1A1AA]">End-to-end encrypted</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─────────────── STATS ROW ─────────────── */}
      <section className="py-16 border-y border-[#E4E4E7]/60 bg-white/50">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 lg:gap-12 px-6 text-center"
        >
          {statItems.map((s) => (
            <motion.div key={s.label} variants={fadeUp} className="flex flex-col items-center gap-2">
              <s.Icon weight="duotone" size={28} className="text-[#E11D48] mb-1" />
              <span className="font-display text-3xl lg:text-4xl font-extrabold tracking-tight text-[#18181B]">
                {s.value}
              </span>
              <span className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-widest">
                {s.label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ─────────────── FINAL CTA ─────────────── */}
      <section className="py-20 lg:py-28 px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="max-w-3xl mx-auto text-center"
        >
          <motion.div
            variants={fadeUp}
            className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#E11D48] to-[#F97316] flex items-center justify-center mx-auto mb-8 shadow-lg shadow-[#E11D48]/20"
          >
            <ChartLineUp weight="duotone" size={32} className="text-white" />
          </motion.div>

          <motion.h2 variants={fadeUp} className="font-display text-3xl lg:text-4xl font-extrabold tracking-tight mb-4">
            Ready to dominate your market?
          </motion.h2>
          <motion.p variants={fadeUp} className="text-[#71717A] text-base mb-10 max-w-lg mx-auto">
            Join the executives using VICO to make data-driven decisions in
            Vietnam&apos;s fastest-growing sectors.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onStart}
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-[#E11D48] text-white text-base font-bold hover:bg-[#BE123C] active:scale-[0.97] transition-all duration-150 shadow-[0_8px_24px_rgba(225,29,72,0.25)] w-full sm:w-auto"
            >
              Start Free
              <ArrowRight weight="bold" size={18} />
            </button>
            <button
              onClick={() => setShowDemoModal(true)}
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-white border border-[#E4E4E7] text-[#18181B] text-base font-bold hover:border-[#E11D48]/30 transition-all duration-150 shadow-sm w-full sm:w-auto"
            >
              Book a Demo
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* ─────────────── FOOTER ─────────────── */}
      <footer className="border-t border-[#E4E4E7] py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-[#E11D48] to-[#F97316] rounded-lg flex items-center justify-center text-white font-extrabold text-xs">
              V
            </div>
            <span className="text-sm font-bold text-[#18181B]">VICO</span>
            <span className="text-xs text-[#A1A1AA]">&copy; 2026</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-[#A1A1AA] font-medium">
            <span className="hover:text-[#18181B] cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-[#18181B] cursor-pointer transition-colors">Terms</span>
            <span className="hover:text-[#18181B] cursor-pointer transition-colors">Contact</span>
          </div>
        </div>
      </footer>

      {/* ═══════════════════════════════════════════════════════════════
          DEMO MODAL
         ═══════════════════════════════════════════════════════════════ */}
      {showDemoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#18181B]/60 backdrop-blur-md"
          onClick={() => setShowDemoModal(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Book a Demo"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="bg-white w-full max-w-5xl rounded-3xl overflow-hidden border border-[#E4E4E7] shadow-2xl flex flex-col md:flex-row relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setShowDemoModal(false)}
              className="absolute top-5 right-5 text-[#A1A1AA] hover:text-[#18181B] z-10 p-2 hover:bg-[#FAFAFA] rounded-xl transition-all"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            {/* ── Left Panel ── */}
            <div className="w-full md:w-5/12 p-8 md:p-12 bg-[#FAFAFA] border-b md:border-b-0 md:border-r border-[#E4E4E7] flex flex-col justify-between relative overflow-hidden">
              <div
                className="absolute inset-0 bg-gradient-to-br from-[#E11D48]/[0.02] to-[#F97316]/[0.02] pointer-events-none"
                aria-hidden="true"
              />
              <div className="relative z-10">
                <Logo />

                <h2 className="font-display text-3xl lg:text-4xl font-extrabold mt-10 mb-8 leading-[1.1] tracking-tight">
                  Book a{' '}
                  <span className="text-[#E11D48]">30&#8209;minute</span>{' '}
                  demo.
                </h2>

                <p className="text-[10px] font-semibold text-[#A1A1AA] uppercase tracking-widest mb-5">
                  What you&apos;ll get
                </p>
                <ul className="space-y-5 text-[#71717A]">
                  {[
                    'Personalized demo for your industry',
                    'Investment sector case study',
                    'Enterprise pricing framework',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-lg bg-[#FFF1F2] flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="text-[#E11D48]" size={14} />
                      </div>
                      <span className="font-semibold text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* ── Right Panel — Form ── */}
            <div className="w-full md:w-7/12 p-8 md:p-12 bg-white">
              {demoSubmitted ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 bg-[#D1FAE5] rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="text-[#059669]" size={32} />
                  </div>
                  <h3 className="text-xl font-extrabold text-[#18181B] mb-2">Request received!</h3>
                  <p className="text-sm text-[#71717A]">We&apos;ll reach out within 24 hours.</p>
                </div>
              ) : (
                <form className="space-y-5" onSubmit={handleDemoSubmit}>
                  <div className="grid grid-cols-2 gap-4">
                    <EnterpriseInput label="Last name" name="lastName" required type="text" placeholder="Nguyen" />
                    <EnterpriseInput label="First name" name="firstName" required type="text" placeholder="An" />
                  </div>

                  <EnterpriseInput label="Work email" name="email" required type="email" placeholder="ceo@company.com.vn" />
                  <EnterpriseInput label="Job title" name="jobTitle" required type="text" placeholder="Chief Strategy Officer" />

                  <div className="grid grid-cols-[120px_1fr] gap-4">
                    <div className="relative border rounded-xl bg-white border-[#E4E4E7] p-3 px-4 h-[64px] hover:border-[#A1A1AA] transition-all group">
                      <label className="text-[10px] font-semibold text-[#A1A1AA] uppercase tracking-wider block mb-1 leading-none group-hover:text-[#71717A]">
                        Region
                      </label>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-[#18181B]">VN +84</span>
                        <ChevronDown size={14} className="text-[#A1A1AA]" />
                      </div>
                    </div>
                    <EnterpriseInput label="Phone" name="phone" type="tel" placeholder="090 123 4567" />
                  </div>

                  {demoError && (
                    <p className="text-[#BE123C] text-sm font-semibold text-center">{demoError}</p>
                  )}

                  <button
                    disabled={demoLoading}
                    className="w-full bg-[#E11D48] hover:bg-[#BE123C] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl text-base transition-all shadow-[0_8px_24px_rgba(225,29,72,0.25)] hover:shadow-[0_12px_32px_rgba(225,29,72,0.35)] active:scale-[0.98] mt-2 uppercase tracking-widest flex items-center justify-center gap-3"
                  >
                    {demoLoading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Book Demo Now'
                    )}
                  </button>

                  <p className="text-center text-[10px] font-semibold text-[#A1A1AA] uppercase tracking-widest mt-4">
                    Encrypted &bull; No third-party sharing
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
