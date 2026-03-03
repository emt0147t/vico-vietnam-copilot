/**
 * VICO Elite Design System — Single Source of Truth
 *
 * Visual benchmarks: Linear.app · Vercel · Stripe · Adobe
 * Layout: Bento-box grids, subtle 1px borders, generous whitespace
 * Aesthetic: Executive Crimson — premium red-dominant enterprise palette
 *
 * KEY RULE: Brand red (#E11D48) is NEVER used for negative/decline metrics.
 * Decline uses muted dark crimson (#991B1B) on neutral stone background to
 * prevent brand-color / error-state confusion.
 *
 * Import tokens from here instead of ad-hoc hex codes in components.
 * Tailwind classes are pre-composed below for DRY usage.
 */

// ============================================================================
// RAW COLOR TOKENS
// ============================================================================

export const palette = {
  // Backgrounds & Surfaces
  bgBase:    '#FAFAFA',   // Zinc 50 – app background
  surface:   '#FFFFFF',   // Pure white cards
  border:    '#E4E4E7',   // Zinc 200 – bento dividers

  // Typography
  inkPrimary: '#18181B',  // Zinc 900 – headings
  inkMuted:   '#71717A',  // Zinc 500 – secondary text
  inkFaint:   '#A1A1AA',  // Zinc 400 – placeholders

  // Brand — Executive Crimson
  primary:       '#E11D48', // Rose 600 – primary actions, active tabs
  primaryHover:  '#BE123C', // Rose 700 – hover state
  primaryLight:  '#FFF1F2', // Rose 50 – tinted backgrounds
  primarySubtle: '#FFE4E6', // Rose 100 – subtle fills

  // AI / Magic — Crimson-to-Sunset gradient
  aiRose:   '#E11D48',   // Rose 600 – gradient start
  aiSunset: '#F97316',   // Orange 500 – gradient end
  aiGlow:   '#FFF7ED',   // Orange 50 – light AI tint

  // Status (note: decline is muted, NOT brand red)
  growth:    '#059669',   // Emerald 600
  growthBg:  '#D1FAE5',   // Emerald 100
  warn:      '#D97706',   // Amber 600
  warnBg:    '#FEF3C7',   // Amber 100
  decline:   '#991B1B',   // Dark crimson 800 – intentionally muted
  declineBg: '#F5F5F4',   // Stone 100 – neutral, not red-tinted
} as const;

// ============================================================================
// FONT STACKS
// ============================================================================

export const fonts = {
  display: '"Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif',
  body:    '"Manrope", ui-sans-serif, system-ui, sans-serif',
  mono:    '"JetBrains Mono", ui-monospace, monospace',
} as const;

// ============================================================================
// PRE-COMPOSED TAILWIND CLASS STRINGS
// Consume these to keep components DRY and consistent.
// ============================================================================

export const tw = {
  // ---------- Layout ----------
  pageShell:
    'min-h-screen bg-[#FAFAFA] dark:bg-gray-950 text-[#18181B] dark:text-white antialiased',
  bentoGrid:
    'grid gap-4 lg:gap-5',

  // ---------- Cards / Surfaces ----------
  card:
    'bg-white dark:bg-gray-900 border border-[#E4E4E7] dark:border-gray-800 rounded-bento shadow-bento',
  cardHover:
    'bg-white dark:bg-gray-900 border border-[#E4E4E7] dark:border-gray-800 rounded-bento shadow-bento hover:shadow-bento-hover hover:border-brand/30 transition-all duration-200',
  cardPadding:
    'p-5 lg:p-6',

  // ---------- Typography ----------
  h1: 'font-display text-3xl lg:text-4xl font-extrabold tracking-tight text-[#18181B] dark:text-white',
  h2: 'font-display text-xl lg:text-2xl font-bold tracking-tight text-[#18181B] dark:text-white',
  h3: 'font-display text-base lg:text-lg font-bold tracking-tight text-[#18181B] dark:text-white',
  label:   'text-[11px] font-semibold uppercase tracking-widest text-[#71717A] dark:text-zinc-400',
  body:    'font-body text-sm text-[#71717A] dark:text-zinc-300 leading-relaxed',
  bodyAlt: 'font-body text-sm text-[#18181B] dark:text-zinc-200 leading-relaxed',
  metric:  'font-display text-2xl lg:text-3xl font-extrabold tabular-nums tracking-tight',

  // ---------- Buttons ----------
  btnPrimary:
    'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[10px] bg-[#E11D48] text-white text-sm font-semibold hover:bg-[#BE123C] active:scale-[0.98] transition-all duration-150 shadow-sm',
  btnSecondary:
    'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[10px] border border-[#E4E4E7] dark:border-gray-700 text-[#18181B] dark:text-zinc-200 text-sm font-semibold hover:bg-[#FAFAFA] dark:hover:bg-gray-800 transition-all duration-150',
  btnGhost:
    'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-[10px] text-sm font-medium text-[#71717A] dark:text-zinc-400 hover:bg-[#FAFAFA] dark:hover:bg-gray-800/60 transition-colors',
  btnAI:
    'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[10px] bg-gradient-to-r from-[#E11D48] to-[#F97316] text-white text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all duration-150 shadow-md',
  btnDanger:
    'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[10px] bg-[#991B1B] text-white text-sm font-semibold hover:bg-[#7F1D1D] active:scale-[0.98] transition-all duration-150',

  // ---------- Inputs ----------
  input:
    'w-full rounded-[10px] border border-[#E4E4E7] dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-[#18181B] dark:text-white placeholder:text-[#A1A1AA] focus:ring-2 focus:ring-[#E11D48]/30 focus:border-[#E11D48] transition-colors',
  select:
    'w-full appearance-none rounded-[10px] border border-[#E4E4E7] dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 pr-10 text-sm text-[#18181B] dark:text-white focus:ring-2 focus:ring-[#E11D48]/30 focus:border-[#E11D48] transition-colors',

  // ---------- Badges / Pills ----------
  badge: (variant: 'growth' | 'warn' | 'decline' | 'neutral' | 'ai' | 'brand') => {
    const map = {
      growth:  'bg-[#D1FAE5] text-[#059669] border border-[#059669]/20',
      warn:    'bg-[#FEF3C7] text-[#D97706] border border-[#D97706]/20',
      decline: 'bg-[#F5F5F4] text-[#991B1B] border border-[#991B1B]/15',
      neutral: 'bg-[#FAFAFA] text-[#71717A] border border-[#E4E4E7] dark:bg-gray-800 dark:text-zinc-400 dark:border-gray-700',
      ai:      'bg-[#FFF7ED] text-[#E11D48] border border-[#E11D48]/15',
      brand:   'bg-[#FFF1F2] text-[#E11D48] border border-[#E11D48]/20',
    };
    return `inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${map[variant]}`;
  },

  // ---------- Callouts ----------
  callout: (variant: 'info' | 'success' | 'warning' | 'error' | 'ai') => {
    const map = {
      info:    'bg-[#FFF1F2] dark:bg-[#E11D48]/10 border-[#E11D48]/20 text-[#E11D48] dark:text-rose-300',
      success: 'bg-[#D1FAE5] dark:bg-emerald-950/30 border-[#059669]/20 text-[#059669] dark:text-emerald-300',
      warning: 'bg-[#FEF3C7] dark:bg-amber-950/30 border-[#D97706]/20 text-[#D97706] dark:text-amber-300',
      error:   'bg-[#F5F5F4] dark:bg-stone-900/30 border-[#991B1B]/20 text-[#991B1B] dark:text-stone-300',
      ai:      'bg-gradient-to-r from-[#FFF1F2] to-[#FFF7ED] dark:from-[#E11D48]/10 dark:to-[#F97316]/10 border-[#E11D48]/15 text-[#E11D48] dark:text-rose-300',
    };
    return `flex items-start gap-3 rounded-bento border p-4 ${map[variant]}`;
  },

  // ---------- Status Dot ----------
  statusDot: (status: 'growth' | 'warn' | 'decline') => {
    const map = {
      growth:  'bg-[#059669]',
      warn:    'bg-[#D97706]',
      decline: 'bg-[#991B1B]',
    };
    return `w-2 h-2 rounded-full ${map[status]}`;
  },

  // ---------- Active / Selected States ----------
  activeTab:
    'border-b-2 border-[#E11D48] text-[#E11D48] font-semibold',
  activeSidebar:
    'bg-[#FFF1F2] dark:bg-[#E11D48]/10 border-l-2 border-[#E11D48] text-[#E11D48] dark:text-rose-300',

  // ---------- Table ----------
  th: 'text-left text-[11px] font-semibold uppercase tracking-widest text-[#71717A] dark:text-zinc-400 px-4 py-3 border-b border-[#E4E4E7] dark:border-gray-800',
  td: 'px-4 py-3 text-sm text-[#18181B] dark:text-zinc-200 border-b border-[#E4E4E7]/50 dark:border-gray-800/50',

  // ---------- Dividers ----------
  divider: 'border-t border-[#E4E4E7] dark:border-gray-800',

  // ---------- AI Gradient Text ----------
  aiGradientText:
    'bg-gradient-to-r from-[#E11D48] to-[#F97316] bg-clip-text text-transparent',

  // ---------- Brand Accent Bar ----------
  accentBar:
    'h-1 w-full bg-gradient-to-r from-[#E11D48] to-[#F97316] rounded-full',
  accentDot:
    'w-2 h-2 rounded-full bg-[#E11D48]',
} as const;

// ============================================================================
// ANIMATION VARIANTS (Framer Motion)
// ============================================================================

export const motion = {
  fadeUp: {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    exit:    { opacity: 0, y: 8 },
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit:    { opacity: 0 },
    transition: { duration: 0.2 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.96 },
    animate: { opacity: 1, scale: 1 },
    exit:    { opacity: 0, scale: 0.96 },
    transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  staggerChildren: (stagger = 0.06) => ({
    animate: { transition: { staggerChildren: stagger } },
  }),
} as const;

// ============================================================================
// ICON SIZE PRESETS  (for @phosphor-icons/react)
// ============================================================================

export const iconSize = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
} as const;
