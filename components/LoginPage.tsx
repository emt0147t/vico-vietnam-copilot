import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  GoogleLogo,
  MicrosoftOutlookLogo,
  ArrowRight,
  ShieldCheck,
  Target,
  RocketLaunch,
  Buildings,
  ChartLineUp,
  Lightning,
} from '@phosphor-icons/react';
import {
  ArrowLeft, Lock, Mail, Loader2, AlertCircle,
  Eye, EyeOff, User,
} from 'lucide-react';
import { Logo, EnterpriseInput } from './VicoUI';
import { useSignIn, useSignUp, useAuth } from '@clerk/clerk-react';

/* ═══════════════════════════════════════════════════════════════════
   ANIMATION PRESETS  (matches designSystem.ts motion tokens)
   ═══════════════════════════════════════════════════════════════════ */
const fadeUp = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};
const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.12 } },
};

/* ═══════════════════════════════════════════════════════════════════
   STATIC DATA — Right-panel value proposition
   ═══════════════════════════════════════════════════════════════════ */
const corePillars = [
  { label: 'Market Analytics',  desc: 'Real-time signals across 10,000+ Vietnamese companies.',         Icon: ChartLineUp },
  { label: 'ICP Builder',       desc: 'Auto-generated Ideal Customer Profiles with buying triggers.',   Icon: Target },
  { label: 'GTM Strategy',      desc: 'Actionable Go-To-Market playbooks tailored to Vietnam.',        Icon: RocketLaunch },
];

const proofStats = [
  { value: '10,289',     label: 'Companies tracked', Icon: Buildings },
  { value: 'Real-time',   label: 'Data Updates',      Icon: Lightning },
  { value: '9',           label: 'Industry verticals', Icon: ChartLineUp },
];

/* ═══════════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
interface LoginPageProps {
  onLoginSuccess: (data: any) => void;
  onBack: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onBack }) => {
  /* ── State ──────────────────────────────────────────────────── */
  const [mode, setMode] = useState<'login' | 'signup' | 'verify'>('login');
  const [verifySource, setVerifySource] = useState<'login' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  /* ── Clerk hooks ────────────────────────────────────────────── */
  const { signIn, setActive: setSignInActive } = useSignIn();
  const { signUp, setActive: setSignUpActive } = useSignUp();
  const { isSignedIn, userId } = useAuth();
  const clerkAvailable = !!signIn;

  /* ── Auto-redirect if already signed in ─────────────────────── */
  useEffect(() => {
    if (isSignedIn && userId) {
      onLoginSuccess({ id: userId, email: '', firstName: '', lastName: '', source: 'clerk' });
    }
  }, [isSignedIn, userId]);

  /* ── Cleanup timers ─────────────────────────────────────────── */
  useEffect(() => () => { timersRef.current.forEach(clearTimeout); }, []);

  /* ══════════════════════════════════════════════════════════════
     AUTH HANDLERS  (preserved from original, identical logic)
     ══════════════════════════════════════════════════════════════ */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!clerkAvailable) {
      setIsLoading(false);
      setError('Authentication system not configured. Please set up Clerk API keys in .env');
      return;
    }

    try {
      const result = await signIn!.create({ identifier: email, password });

      if (result.status === 'complete') {
        await setSignInActive!({ session: result.createdSessionId });
        onLoginSuccess({ id: result.id, email, firstName: '', lastName: '', source: 'clerk' });
      } else if (
        result.status === 'needs_first_factor' ||
        result.status === 'needs_second_factor'
      ) {
        const emailCodeFactor = result.supportedFirstFactors?.find(
          (f: any) => f.strategy === 'email_code',
        );
        if (emailCodeFactor) {
          await signIn!.prepareFirstFactor({
            strategy: 'email_code',
            emailAddressId: (emailCodeFactor as any).emailAddressId,
          });
          setVerifySource('login');
          setMode('verify');
          setSuccessMessage(`Verification code sent to ${email}. Please check your inbox.`);
        } else {
          setError('Additional authentication step required. Please check your email.');
        }
      } else {
        setError('Additional authentication step required. Please check your email.');
      }
    } catch (err: any) {
      const clerkError = err?.errors?.[0];
      if (clerkError) {
        const errorMap: Record<string, string> = {
          form_identifier_not_found: 'Account not found. Click "Create account" to sign up.',
          form_password_incorrect: 'Incorrect password.',
          form_identifier_exists: 'Email already registered.',
          too_many_requests: 'Too many attempts. Please wait a few minutes.',
        };
        setError(errorMap[clerkError.code] || clerkError.longMessage || 'Sign in failed.');
      } else {
        setError('Connection error. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!signUp) {
      setIsLoading(false);
      setError('Registration system not ready.');
      return;
    }

    try {
      const result = await signUp.create({
        emailAddress: email,
        password,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
      });

      if (result.status === 'complete') {
        await setSignUpActive!({ session: result.createdSessionId });
        onLoginSuccess({ id: result.id, email, firstName, lastName, source: 'clerk' });
      } else {
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
        setVerifySource('signup');
        setMode('verify');
        setSuccessMessage(`Verification code sent to ${email}. Please check your inbox.`);
      }
    } catch (err: any) {
      const clerkError = err?.errors?.[0];
      if (clerkError) {
        const errorMap: Record<string, string> = {
          form_identifier_exists: 'This email is already registered. Please sign in.',
          form_password_pwned: 'This password is compromised. Please choose another.',
          form_password_length_too_short: 'Password must be at least 8 characters.',
          too_many_requests: 'Too many attempts. Please wait a few minutes.',
        };
        setError(errorMap[clerkError.code] || clerkError.longMessage || 'Registration failed.');
      } else {
        setError('Connection error. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (verifySource === 'login') {
        if (!signIn) { setIsLoading(false); return; }
        const result = await signIn.attemptFirstFactor({ strategy: 'email_code', code: verificationCode });
        if (result.status === 'complete') {
          await setSignInActive!({ session: result.createdSessionId });
          onLoginSuccess({ id: result.id, email, firstName: '', lastName: '', source: 'clerk' });
        } else {
          setError('Verification incomplete. Please try again.');
        }
      } else {
        if (!signUp) { setIsLoading(false); return; }
        const result = await signUp.attemptEmailAddressVerification({ code: verificationCode });
        if (result.status === 'complete') {
          await setSignUpActive!({ session: result.createdSessionId });
          onLoginSuccess({ id: result.id, email, firstName, lastName, source: 'clerk' });
        } else {
          setError('Verification incomplete. Please try again.');
        }
      }
    } catch (err: any) {
      const clerkError = err?.errors?.[0];
      if (clerkError) {
        const errorMap: Record<string, string> = {
          form_code_incorrect: 'Incorrect code. Please check and try again.',
          verification_expired: 'Code expired. Please request a new one.',
        };
        setError(errorMap[clerkError.code] || clerkError.longMessage || 'Verification failed.');
      } else {
        setError('Connection error. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  /* ══════════════════════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════════════════════ */
  return (
    <div className="flex h-screen bg-[#FAFAFA] antialiased selection:bg-[#E11D48] selection:text-white">

      {/* ─────────────────────── LEFT COLUMN — AUTH FORM ─────────────────────── */}
      <div className="relative flex w-full lg:w-1/2 flex-col items-center justify-center bg-white px-6 py-12 sm:px-12 lg:px-16 xl:px-24">

        {/* Back button — top-left */}
        <button
          onClick={onBack}
          className="absolute top-6 left-6 flex items-center gap-2 text-[#A1A1AA] hover:text-[#18181B] transition-colors text-xs font-semibold group"
          aria-label="Back to homepage"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          Back
        </button>

        <div className="w-full max-w-[400px]">

          {/* ── Logo ── */}
          <div className="mb-10">
            <Logo />
          </div>

          {/* ── Heading ── */}
          <div className="mb-8">
            <h1 className="font-display text-2xl font-extrabold tracking-tight text-[#18181B] mb-1.5">
              {mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Create your account' : 'Verify your email'}
            </h1>
            <p className="text-sm text-[#71717A]">
              {mode === 'login'
                ? 'Enter your details to access your workspace.'
                : mode === 'signup'
                  ? 'Start exploring Vietnam\'s tech ecosystem.'
                  : `We sent a code to ${email}`}
            </p>
          </div>

          {/* ── Clerk warning ── */}
          {!clerkAvailable && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-[#D97706]/20 bg-[#FEF3C7] p-3">
              <AlertCircle size={14} className="text-[#D97706] mt-0.5 shrink-0" />
              <p className="text-[11px] font-semibold text-[#D97706]">
                Clerk not configured. Set <code className="font-mono">VITE_CLERK_PUBLISHABLE_KEY</code> in your .env
              </p>
            </div>
          )}

          {/* ── Success message ── */}
          {successMessage && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-[#059669]/20 bg-[#D1FAE5] p-3">
              <ShieldCheck weight="duotone" size={14} className="text-[#059669] mt-0.5 shrink-0" />
              <p className="text-[11px] font-semibold text-[#059669]">{successMessage}</p>
            </div>
          )}

          {/* ══════════════ VERIFY MODE ══════════════ */}
          {mode === 'verify' && (
            <form onSubmit={handleVerify} className="space-y-4">
              <EnterpriseInput
                label="Verification code"
                type="text"
                required
                value={verificationCode}
                onChange={(e: any) => setVerificationCode(e.target.value)}
                placeholder="Enter 6-digit code"
              />

              {error && <ErrorBanner message={error} />}

              <button
                disabled={isLoading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-[10px] bg-[#E11D48] px-5 py-3 text-sm font-semibold text-white hover:bg-[#BE123C] active:scale-[0.98] transition-all duration-150 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <>Verify<ArrowRight weight="bold" size={14} /></>}
              </button>

              <p className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(''); setSuccessMessage(''); }}
                  className="text-xs font-semibold text-[#71717A] hover:text-[#E11D48] transition-colors"
                >
                  &larr; Back to sign in
                </button>
              </p>
            </form>
          )}

          {/* ══════════════ LOGIN MODE ══════════════ */}
          {mode === 'login' && (
            <>
              {/* SSO Buttons */}
              <div className="space-y-3 mb-6">
                <button
                  type="button"
                  className="inline-flex w-full items-center justify-center gap-2.5 rounded-[10px] border border-[#E4E4E7] bg-white px-5 py-3 text-sm font-semibold text-[#18181B] hover:bg-[#FAFAFA] hover:border-[#A1A1AA] active:scale-[0.98] transition-all duration-150"
                >
                  <GoogleLogo weight="bold" size={18} />
                  Continue with Google
                </button>
                <button
                  type="button"
                  className="inline-flex w-full items-center justify-center gap-2.5 rounded-[10px] border border-[#E4E4E7] bg-white px-5 py-3 text-sm font-semibold text-[#18181B] hover:bg-[#FAFAFA] hover:border-[#A1A1AA] active:scale-[0.98] transition-all duration-150"
                >
                  <MicrosoftOutlookLogo weight="bold" size={18} />
                  Continue with Microsoft
                </button>
              </div>

              {/* OR divider */}
              <div className="relative flex items-center my-6">
                <div className="flex-1 border-t border-[#E4E4E7]" />
                <span className="mx-4 text-[11px] font-semibold uppercase tracking-widest text-[#A1A1AA]">or</span>
                <div className="flex-1 border-t border-[#E4E4E7]" />
              </div>

              {/* Email / Password form */}
              <form onSubmit={handleLogin} className="space-y-4">
                <EnterpriseInput
                  label="Email"
                  type="email"
                  required
                  value={email}
                  onChange={(e: any) => setEmail(e.target.value)}
                  placeholder="you@company.vn"
                  icon={Mail}
                />

                <div className="relative">
                  <EnterpriseInput
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e: any) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    icon={Lock}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 bottom-3 text-[#A1A1AA] hover:text-[#18181B] transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Forgot password link */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="text-xs font-semibold text-[#E11D48] hover:text-[#BE123C] transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>

                {error && <ErrorBanner message={error} />}

                <button
                  disabled={isLoading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-[10px] bg-[#E11D48] px-5 py-3 text-sm font-semibold text-white hover:bg-[#BE123C] active:scale-[0.98] transition-all duration-150 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? <Loader2 size={16} className="animate-spin" /> : <>Sign In<ArrowRight weight="bold" size={14} /></>}
                </button>
              </form>

              <p className="text-center text-sm text-[#71717A] mt-6">
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setError(''); }}
                  className="font-semibold text-[#E11D48] hover:text-[#BE123C] transition-colors"
                >
                  Create account
                </button>
              </p>
            </>
          )}

          {/* ══════════════ SIGNUP MODE ══════════════ */}
          {mode === 'signup' && (
            <>
              {/* SSO */}
              <div className="space-y-3 mb-6">
                <button
                  type="button"
                  className="inline-flex w-full items-center justify-center gap-2.5 rounded-[10px] border border-[#E4E4E7] bg-white px-5 py-3 text-sm font-semibold text-[#18181B] hover:bg-[#FAFAFA] hover:border-[#A1A1AA] active:scale-[0.98] transition-all duration-150"
                >
                  <GoogleLogo weight="bold" size={18} />
                  Continue with Google
                </button>
                <button
                  type="button"
                  className="inline-flex w-full items-center justify-center gap-2.5 rounded-[10px] border border-[#E4E4E7] bg-white px-5 py-3 text-sm font-semibold text-[#18181B] hover:bg-[#FAFAFA] hover:border-[#A1A1AA] active:scale-[0.98] transition-all duration-150"
                >
                  <MicrosoftOutlookLogo weight="bold" size={18} />
                  Continue with Microsoft
                </button>
              </div>

              <div className="relative flex items-center my-6">
                <div className="flex-1 border-t border-[#E4E4E7]" />
                <span className="mx-4 text-[11px] font-semibold uppercase tracking-widest text-[#A1A1AA]">or</span>
                <div className="flex-1 border-t border-[#E4E4E7]" />
              </div>

              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <EnterpriseInput
                    label="Last name"
                    type="text"
                    value={lastName}
                    onChange={(e: any) => setLastName(e.target.value)}
                    placeholder="Nguyen"
                    icon={User}
                  />
                  <EnterpriseInput
                    label="First name"
                    type="text"
                    value={firstName}
                    onChange={(e: any) => setFirstName(e.target.value)}
                    placeholder="An"
                    icon={User}
                  />
                </div>

                <EnterpriseInput
                  label="Work email"
                  type="email"
                  required
                  value={email}
                  onChange={(e: any) => setEmail(e.target.value)}
                  placeholder="you@company.vn"
                  icon={Mail}
                />

                <div className="relative">
                  <EnterpriseInput
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e: any) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    icon={Lock}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 bottom-3 text-[#A1A1AA] hover:text-[#18181B] transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {error && <ErrorBanner message={error} />}

                <button
                  disabled={isLoading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-[10px] bg-[#E11D48] px-5 py-3 text-sm font-semibold text-white hover:bg-[#BE123C] active:scale-[0.98] transition-all duration-150 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? <Loader2 size={16} className="animate-spin" /> : <>Create Account<ArrowRight weight="bold" size={14} /></>}
                </button>
              </form>

              <p className="text-center text-sm text-[#71717A] mt-6">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(''); }}
                  className="font-semibold text-[#E11D48] hover:text-[#BE123C] transition-colors"
                >
                  Sign in
                </button>
              </p>
            </>
          )}

          {/* Encrypted badge */}
          <div className="mt-10 flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-[#A1A1AA]">
            <ShieldCheck weight="duotone" size={12} className="text-[#E11D48]" />
            End-to-end encrypted
          </div>
        </div>
      </div>

      {/* ─────────────────────── RIGHT COLUMN — BRAND SHOWCASE ─────────────────────── */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-[#18181B] text-white items-center justify-center p-16 xl:p-24">

        {/* Subtle gradient overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-[#E11D48]/10 via-transparent to-[#F97316]/5 pointer-events-none"
          aria-hidden="true"
        />
        {/* Ambient glow */}
        <div
          className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-[#E11D48]/[0.06] rounded-full blur-[150px] pointer-events-none"
          aria-hidden="true"
        />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="relative z-10 max-w-lg"
        >
          {/* Manifesto heading */}
          <motion.div variants={fadeUp} className="mb-4">
            <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#E11D48]/10 text-[#E11D48] border border-[#E11D48]/20 mb-6">
              Vietnam Intelligence Platform
            </span>
            <h2 className="font-display text-3xl xl:text-4xl font-extrabold leading-[1.15] tracking-tight text-white">
              Master the Vietnamese<br />Tech Market.
            </h2>
          </motion.div>

          <motion.p variants={fadeUp} className="text-sm xl:text-base text-white/60 leading-relaxed mb-10 max-w-md">
            Access real-time intelligence, build Ideal Customer Profiles, and generate actionable Go-To-Market playbooks based on deep, localized market data.
          </motion.p>

          {/* Core pillars */}
          <motion.div variants={fadeUp} className="space-y-4 mb-10">
            {corePillars.map((p) => (
              <div key={p.label} className="flex items-start gap-4 group">
                <div className="w-9 h-9 rounded-xl bg-[#E11D48]/10 border border-[#E11D48]/20 flex items-center justify-center shrink-0 group-hover:bg-[#E11D48]/20 transition-colors">
                  <p.Icon weight="duotone" size={18} className="text-[#E11D48]" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{p.label}</div>
                  <div className="text-xs text-white/40 leading-relaxed mt-0.5">{p.desc}</div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Divider */}
          <motion.div variants={fadeUp} className="border-t border-white/10 mb-10" />

          {/* Stats row */}
          <motion.div variants={fadeUp} className="grid grid-cols-3 gap-6">
            {proofStats.map((s) => (
              <div key={s.label} className="text-center">
                <s.Icon weight="duotone" size={20} className="text-[#E11D48] mx-auto mb-2" />
                <div className="font-display text-xl font-extrabold tracking-tight text-white">
                  {s.value}
                </div>
                <div className="text-[10px] font-semibold uppercase tracking-widest text-white/40 mt-1">
                  {s.label}
                </div>
              </div>
            ))}
          </motion.div>

          {/* Ecosystem coverage */}
          <motion.div variants={fadeUp} className="mt-12 pt-8 border-t border-white/10">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-4">
              Analyzing data from Vietnam&apos;s leading tech ecosystems
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {['FPT Software', 'VNG', 'MoMo', 'Base.vn', 'VNPay'].map((name) => (
                <span key={name} className="text-sm font-bold text-white/20">
                  {name}
                </span>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   HELPER COMPONENTS
   ═══════════════════════════════════════════════════════════════════ */
const ErrorBanner: React.FC<{ message: string }> = ({ message }) => (
  <div
    className="flex items-start gap-2.5 rounded-xl border border-[#BE123C]/20 bg-[#F5F5F4] p-3"
    role="alert"
  >
    <AlertCircle size={14} className="text-[#BE123C] mt-0.5 shrink-0" />
    <p className="text-[11px] font-semibold text-[#BE123C]">{message}</p>
  </div>
);
