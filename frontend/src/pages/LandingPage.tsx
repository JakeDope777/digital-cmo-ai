import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Brain,
  BarChart2,
  Palette,
  Search,
  Share2,
  Megaphone,
  TrendingUp,
  Users,
  ShoppingCart,
  Rocket,
  Zap,
  ChevronRight,
  Check,
  Star,
  ArrowRight,
  Globe,
  ShieldCheck,
  BarChart,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Agent {
  icon: React.ReactNode;
  name: string;
  desc: string;
  color: string;
  glow: string;
  badge: string;
}

interface Testimonial {
  initials: string;
  name: string;
  role: string;
  company: string;
  quote: string;
  metric: string;
  gradient: string;
}

interface PricingTier {
  name: string;
  price: string;
  period: string;
  desc: string;
  features: string[];
  cta: string;
  href: string;
  popular: boolean;
  accent: string;
}

interface IndustryTab {
  id: string;
  label: string;
  emoji: string;
  headline: string;
  body: string;
  stat: string;
  statLabel: string;
}

// ── Data ──────────────────────────────────────────────────────────────────────
const AGENTS: Agent[] = [
  {
    icon: <Brain size={20} />,
    name: 'Brain Orchestrator',
    desc: 'Routes tasks, manages context, coordinates all sub-agents for seamless execution.',
    color: 'text-blue-400',
    glow: 'group-hover:shadow-blue-500/20',
    badge: 'Core',
  },
  {
    icon: <BarChart2 size={20} />,
    name: 'Market Intelligence',
    desc: 'SWOT, PESTEL, competitor, trend analysis with real-time data feeds.',
    color: 'text-violet-400',
    glow: 'group-hover:shadow-violet-500/20',
    badge: 'Strategy',
  },
  {
    icon: <Palette size={20} />,
    name: 'Creative Studio',
    desc: 'Ad copy, email sequences, landing pages in your brand voice — instantly.',
    color: 'text-rose-400',
    glow: 'group-hover:shadow-rose-500/20',
    badge: 'Creative',
  },
  {
    icon: <Search size={20} />,
    name: 'SEO Engine',
    desc: 'Keyword research, on-page briefs, content gap analysis, technical SEO audits.',
    color: 'text-emerald-400',
    glow: 'group-hover:shadow-emerald-500/20',
    badge: 'Organic',
  },
  {
    icon: <Share2 size={20} />,
    name: 'Social Media',
    desc: 'LinkedIn, X, Instagram, TikTok. Schedules posts, adapts tone per channel.',
    color: 'text-sky-400',
    glow: 'group-hover:shadow-sky-500/20',
    badge: 'Social',
  },
  {
    icon: <Megaphone size={20} />,
    name: 'PR & Comms',
    desc: 'Press releases, journalist pitches, partnership decks, and media contacts at scale.',
    color: 'text-amber-400',
    glow: 'group-hover:shadow-amber-500/20',
    badge: 'PR',
  },
  {
    icon: <BarChart size={20} />,
    name: 'Analytics & ROI',
    desc: 'Tracks 13 KPIs, forecasts revenue, detects anomalies daily before they cost budget.',
    color: 'text-blue-400',
    glow: 'group-hover:shadow-blue-500/20',
    badge: 'Analytics',
  },
  {
    icon: <Users size={20} />,
    name: 'CRM & Pipeline',
    desc: 'Segments contacts, scores leads, and builds automated nurture workflows.',
    color: 'text-teal-400',
    glow: 'group-hover:shadow-teal-500/20',
    badge: 'CRM',
  },
  {
    icon: <ShoppingCart size={20} />,
    name: 'E-commerce',
    desc: 'AI understands your catalogue, customer LTV, and seasonal demand to maximize ROAS.',
    color: 'text-orange-400',
    glow: 'group-hover:shadow-orange-500/20',
    badge: 'Commerce',
  },
  {
    icon: <Rocket size={20} />,
    name: 'Growth Hacker',
    desc: 'Churn-risk detection, win-back campaigns, and conversion optimization loops.',
    color: 'text-pink-400',
    glow: 'group-hover:shadow-pink-500/20',
    badge: 'Growth',
  },
];

const TESTIMONIALS: Testimonial[] = [
  {
    initials: 'MR',
    name: 'Marcus R.',
    role: 'Head of Growth',
    company: 'Velour Commerce',
    quote: 'We onboarded 12 new clients in Q1 without hiring a single person. The white-label reports look better than anything we produced manually — and they ship in minutes.',
    metric: '+12 clients Q1',
    gradient: 'from-blue-500 to-violet-600',
  },
  {
    initials: 'JC',
    name: 'Jamie C.',
    role: 'Founder',
    company: 'Crux Digital Agency',
    quote: 'Digital CMO AI replaced our $8K/month content agency retainer on week one. Our team now operates at 4× capacity with zero extra headcount. It\'s genuinely unfair to the competition.',
    metric: '$8K/mo saved',
    gradient: 'from-violet-500 to-pink-600',
  },
  {
    initials: 'SK',
    name: 'Sarah K.',
    role: 'Chief Marketing Officer',
    company: 'ClearPath Health',
    quote: 'Patient acquisition cost dropped 34% in 90 days. The AI identified channel inefficiencies we\'d been blind to for years. Healthcare compliance guardrails are actually thoughtful too.',
    metric: '−34% patient CAC',
    gradient: 'from-sky-500 to-blue-600',
  },
];

const INDUSTRY_TABS: IndustryTab[] = [
  {
    id: 'ecommerce',
    label: 'E-commerce',
    emoji: '🛍️',
    headline: 'Maximize ROAS across every channel',
    body: 'AI learns your catalogue, customer LTV, and seasonal patterns. It allocates budget across Google, Meta, and TikTok — then rebalances daily based on real-time ROAS data.',
    stat: '5.3×',
    statLabel: 'average ROAS achieved',
  },
  {
    id: 'saas',
    label: 'SaaS',
    emoji: '🚀',
    headline: 'Accelerate pipeline without growing headcount',
    body: 'From ICP targeting to multi-touch attribution — the AI runs demand gen, scores leads, and surfaces churn signals before they become lost revenue.',
    stat: '−31%',
    statLabel: 'CAC reduction',
  },
  {
    id: 'agency',
    label: 'Agency',
    emoji: '🏢',
    headline: 'Scale client delivery without scaling cost',
    body: 'White-label reports, brand-aware creative, and automated campaign briefs. Deliver enterprise-quality output for 10× the clients with the same team.',
    stat: '10×',
    statLabel: 'client capacity increase',
  },
  {
    id: 'healthcare',
    label: 'Healthcare',
    emoji: '🏥',
    headline: 'Compliant patient acquisition at scale',
    body: 'HIPAA-aware copy guardrails, patient journey mapping, and multi-channel outreach — all tuned for healthcare compliance and sensitivity.',
    stat: '−34%',
    statLabel: 'patient acquisition cost',
  },
];

const PRICING_TIERS: PricingTier[] = [
  {
    name: 'Starter',
    price: '$99',
    period: '/mo',
    desc: 'Perfect for solo marketers and small teams getting started.',
    features: [
      '3 AI agents included',
      'Up to 500 AI actions/month',
      'Basic analytics dashboard',
      'Email support',
      'Demo data included',
      '1 brand workspace',
    ],
    cta: 'Start free trial',
    href: '/register',
    popular: false,
    accent: 'border-white/10',
  },
  {
    name: 'Growth',
    price: '$299',
    period: '/mo',
    desc: 'For scaling teams that need the full AI marketing stack.',
    features: [
      'All 10 AI agents unlocked',
      'Unlimited AI actions',
      'Live integrations: HubSpot, GA4, Stripe',
      'Advanced analytics & forecasting',
      'A/B testing & significance tracking',
      'White-label reports',
      'Priority support',
      '3 brand workspaces',
    ],
    cta: 'Start free trial',
    href: '/register',
    popular: true,
    accent: 'border-blue-500',
  },
  {
    name: 'Scale',
    price: '$699',
    period: '/mo',
    desc: 'Enterprise-grade AI for agencies and large marketing orgs.',
    features: [
      'Everything in Growth',
      'Unlimited brand workspaces',
      'Custom memory & brand voice training',
      'SSO + team management',
      'Dedicated onboarding & SLA',
      'White-label client portal',
      '200+ integration connectors',
      'Custom KPI frameworks',
    ],
    cta: 'Contact sales',
    href: '/register',
    popular: false,
    accent: 'border-white/10',
  },
];

const INTEGRATION_LOGOS = [
  {
    name: 'HubSpot',
    color: '#ff7a59',
    svg: (
      <svg viewBox="0 0 512 512" width="22" height="22" fill="currentColor">
        <path d="M267.4 211.6c-25 0-48.3 7.4-67.8 20.2L145.7 178c4.3-10.2 6.7-21.4 6.7-33.1 0-47.8-38.7-86.5-86.5-86.5S-.3 97.1-.3 144.9s38.7 86.5 86.5 86.5c20.9 0 40.1-7.4 54.9-19.6l53.4 53.4c-13.4 19.7-21.2 43.5-21.2 69.1 0 68.3 55.4 123.7 123.7 123.7S420.4 402.6 420.4 334.3s-55.5-122.7-153-122.7zm0 195.6c-40 0-72.4-32.4-72.4-72.4s32.4-72.4 72.4-72.4 72.4 32.4 72.4 72.4-32.4 72.4-72.4 72.4zM66.2 188.1c-23.9 0-43.3-19.4-43.3-43.3s19.4-43.3 43.3-43.3 43.3 19.4 43.3 43.3-19.4 43.3-43.3 43.3z"/>
      </svg>
    ),
  },
  {
    name: 'Google Ads',
    color: '#4285F4',
    svg: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
      </svg>
    ),
  },
  {
    name: 'LinkedIn',
    color: '#0077B5',
    svg: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
  },
  {
    name: 'Stripe',
    color: '#635BFF',
    svg: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
        <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/>
      </svg>
    ),
  },
  {
    name: 'SendGrid',
    color: '#1A82E2',
    svg: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
        <path d="M0 8h8V0H0v8zm1-7h6v6H1V1zm7 15H0v8h8v-8zm-1 7H1v-6h6v6zm1-15h8V0H8v8zm1-7h6v6H9V1zM8 16h8v-8H8v8zm1-7h6v6H9V9zm7-9h8v8h-8V0zm1 7h6V1h-6v6zm-1 9h8v8h-8v-8zm1 7h6v-6h-6v6z"/>
      </svg>
    ),
  },
  {
    name: 'GA4',
    color: '#E37400',
    svg: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
        <path d="M12.954 11.616l2.957-2.957L6 2v3.531l6.954 6.085zm3.461 3.462l3.033-3.032-3.983-7.008-2.957 2.957 3.907 7.083zM.15 0h-.15v24l4-4V4L.15 0zM24 14.049l-4.966-8.735-3.03 3.031 4.966 8.735L24 14.049z"/>
      </svg>
    ),
  },
];

// ── Subcomponents ──────────────────────────────────────────────────────────────

function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <nav className="sticky top-0 z-50 border-b border-white/8 backdrop-blur-xl" style={{ background: 'oklch(9% .008 255 / 0.85)' }}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: 'oklch(65% .16 253)', boxShadow: '0 0 16px #3c91ed4d' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-sm font-bold tracking-tight text-white">Digital CMO AI</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6 text-sm text-white/55">
          <a href="#agents" className="hover:text-white transition-colors">Agents</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a>
          <Link to="/use-cases" className="hover:text-white transition-colors">Use Cases</Link>
        </div>

        {/* CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/login" className="text-sm text-white/55 hover:text-white transition-colors px-3 py-2">Sign in</Link>
          <Link to="/demo" className="rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white hover:border-white/35 hover:bg-white/5 transition-colors">Try demo</Link>
          <Link
            to="/register"
            className="rounded-lg px-4 py-2 text-sm font-bold text-white transition-all hover:scale-[1.02]"
            style={{ background: 'oklch(65% .16 253)', boxShadow: '0 0 16px #3c91ed30' }}
          >
            Start free →
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-white/60 hover:text-white">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {menuOpen
              ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
              : <><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></>}
          </svg>
        </button>
      </div>
      {menuOpen && (
        <div className="border-t border-white/8 px-6 py-4 md:hidden space-y-3" style={{ background: 'oklch(9% .008 255)' }}>
          <a href="#agents" onClick={() => setMenuOpen(false)} className="block text-sm text-white/60 hover:text-white py-1">Agents</a>
          <a href="#pricing" onClick={() => setMenuOpen(false)} className="block text-sm text-white/60 hover:text-white py-1">Pricing</a>
          <a href="#testimonials" onClick={() => setMenuOpen(false)} className="block text-sm text-white/60 hover:text-white py-1">Testimonials</a>
          <Link to="/use-cases" onClick={() => setMenuOpen(false)} className="block text-sm text-white/60 hover:text-white py-1">Use Cases</Link>
          <div className="flex gap-3 pt-2">
            <Link to="/demo" className="flex-1 rounded-lg border border-white/20 py-2.5 text-center text-sm font-medium text-white">Try demo</Link>
            <Link to="/register" className="flex-1 rounded-lg py-2.5 text-center text-sm font-bold text-white" style={{ background: 'oklch(65% .16 253)' }}>Start free</Link>
          </div>
        </div>
      )}
    </nav>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden px-6 py-24 lg:py-36">
      {/* Dot grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{ backgroundImage: 'radial-gradient(circle,#3c91ed0f 1px,#0000 1px)', backgroundSize: '28px 28px' }}
      />
      {/* Glow orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-20 h-[600px] w-[600px] rounded-full opacity-30 blur-[100px]" style={{ background: '#3c91ed' }} />
        <div className="absolute right-0 top-40 h-[400px] w-[400px] rounded-full opacity-20 blur-[100px]" style={{ background: '#7c3aed' }} />
        <div className="absolute bottom-0 left-1/2 h-[300px] w-[700px] -translate-x-1/2 rounded-full opacity-15 blur-[100px]" style={{ background: '#3c91ed' }} />
      </div>

      <div className="relative mx-auto max-w-5xl text-center">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold" style={{ borderColor: '#3c91ed40', background: '#3c91ed10', color: '#3c91ed' }}>
          <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: '#3c91ed' }} />
          10 AI agents · One marketing OS
        </div>

        {/* Headline */}
        <h1 className="text-5xl font-extrabold tracking-tight leading-[1.05] lg:text-7xl">
          From strategy to{' '}
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: 'linear-gradient(135deg, #3c91ed 0%, #7c3aed 100%)' }}
          >
            execution
          </span>
          <br />in minutes.
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/55">
          10 AI marketing agents that plan, execute, and optimize every channel — SEO, paid ads, content, email, and more.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/demo"
            className="inline-flex items-center gap-2 rounded-xl px-8 py-4 text-base font-bold text-white transition-all hover:scale-[1.03]"
            style={{ background: 'oklch(65% .16 253)', boxShadow: '0 0 24px #3c91ed2e, 0 1px 3px #0000004d' }}
          >
            <Zap size={16} fill="currentColor" />
            Try Live Demo
          </Link>
          <a
            href="#agents"
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-8 py-4 text-base font-medium text-white hover:border-white/35 hover:bg-white/5 transition-all"
          >
            See how it works <ChevronRight size={16} />
          </a>
        </div>

        <p className="mt-4 text-xs text-white/25">No credit card · No setup required · Live in 2 minutes</p>

        {/* Stats */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-8 border-t border-white/8 pt-10">
          {[
            { value: '2,400+', label: 'teams using Digital CMO AI' },
            { value: '10', label: 'AI agents coordinating your marketing' },
            { value: '$47K', label: 'saved/month vs. in-house CMO' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-extrabold" style={{ color: '#3c91ed' }}>{s.value}</div>
              <div className="mt-1 text-sm text-white/40">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrustBar() {
  return (
    <section className="border-y border-white/8 py-8 px-6" style={{ background: 'oklch(7% .006 255)' }}>
      <div className="mx-auto max-w-6xl">
        <p className="mb-6 text-center text-[11px] font-semibold uppercase tracking-widest text-white/25">
          Trusted by 2,400+ marketing teams · Integrates with your stack
        </p>
        <div className="flex flex-wrap items-center justify-center gap-5">
          {INTEGRATION_LOGOS.map((logo) => (
            <div
              key={logo.name}
              className="flex items-center gap-2.5 rounded-xl border border-white/10 px-5 py-3 transition-all hover:border-white/20"
              style={{ background: 'oklch(11% .008 255)' }}
            >
              <span style={{ color: logo.color }}>{logo.svg}</span>
              <span className="text-sm font-semibold text-white/60">{logo.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AgentCard({ agent, index }: { agent: Agent; index: number }) {
  return (
    <div
      className={`group relative rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${agent.glow}`}
      style={{
        background: 'oklch(11% .008 255)',
        border: '1px solid transparent',
        backgroundClip: 'padding-box',
        boxShadow: '0 0 0 1px rgba(60,145,237,0.12)',
      }}
    >
      {/* Gradient border on hover via overlay */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: 'linear-gradient(135deg, #3c91ed20, #7c3aed15, transparent)', borderRadius: 'inherit' }}
      />

      <div className="relative">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${agent.color}`}
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            {agent.icon}
          </div>
          <span className="rounded-full border border-white/10 px-2.5 py-0.5 text-[10px] font-semibold text-white/35">
            {agent.badge}
          </span>
        </div>

        {/* Number */}
        <div className="mb-1 text-[11px] font-mono text-white/20">0{index + 1}</div>

        <h3 className={`mb-2 font-bold text-white text-[15px] group-hover:${agent.color} transition-colors`}>
          {agent.name}
        </h3>
        <p className="text-sm leading-relaxed text-white/50">{agent.desc}</p>
      </div>
    </div>
  );
}

function AgentsSection() {
  return (
    <section id="agents" className="border-t border-white/8 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest" style={{ color: '#3c91ed' }}>
            10 AI agents · One unified OS
          </p>
          <h2 className="text-4xl font-extrabold tracking-tight">
            Everything your marketing team needs
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/45">
            Each agent specializes in a discipline — they share context, memory, and your brand voice.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
          {AGENTS.map((agent, i) => (
            <AgentCard key={agent.name} agent={agent} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function IndustrySection() {
  const [activeTab, setActiveTab] = useState('ecommerce');
  const active = INDUSTRY_TABS.find((t) => t.id === activeTab) ?? INDUSTRY_TABS[0];

  return (
    <section className="border-t border-white/8 px-6 py-24" style={{ background: 'oklch(7% .006 255)' }}>
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest" style={{ color: '#3c91ed' }}>
            Industry-specific
          </p>
          <h2 className="text-4xl font-extrabold tracking-tight">
            Tailored for how your industry works
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/45">
            Pre-loaded with industry-specific KPIs, workflows, compliance guardrails, and integration stacks.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
          {INDUSTRY_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-semibold transition-all"
              style={
                activeTab === tab.id
                  ? { borderColor: '#3c91ed', background: '#3c91ed18', color: '#3c91ed' }
                  : { borderColor: 'rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.4)' }
              }
            >
              <span>{tab.emoji}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Active tab content */}
        <div
          className="rounded-2xl p-8 md:p-12"
          style={{
            background: 'oklch(11% .008 255)',
            boxShadow: '0 0 24px #3c91ed2e, 0 1px 3px #0000004d',
            border: '1px solid #3c91ed25',
          }}
        >
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <h3 className="mb-4 text-2xl font-extrabold text-white">{active.headline}</h3>
              <p className="text-base leading-relaxed text-white/55">{active.body}</p>
              <div className="mt-6">
                <Link
                  to="/demo"
                  className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white transition-all hover:scale-[1.02]"
                  style={{ background: 'oklch(65% .16 253)', boxShadow: '0 0 16px #3c91ed30' }}
                >
                  Try {active.label} demo <ArrowRight size={14} />
                </Link>
              </div>
            </div>
            <div className="text-center">
              <div className="text-7xl font-extrabold" style={{ color: '#3c91ed' }}>{active.stat}</div>
              <div className="mt-2 text-base text-white/45">{active.statLabel}</div>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {(['E-commerce', 'SaaS', 'Agencies', 'Finance', 'Healthcare', 'iGaming'] as const).map((ind) => (
                  <span key={ind} className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/35" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    {ind}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section id="pricing" className="border-t border-white/8 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest" style={{ color: '#3c91ed' }}>
            Simple pricing
          </p>
          <h2 className="text-4xl font-extrabold tracking-tight">Start free. Scale as you grow.</h2>
          <p className="mx-auto mt-4 max-w-lg text-lg text-white/45">
            Transparent pricing, no hidden fees. Cancel or change plans anytime.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {PRICING_TIERS.map((tier) => (
            <div
              key={tier.name}
              className="relative rounded-2xl p-8 flex flex-col transition-all hover:-translate-y-1"
              style={{
                background: 'oklch(11% .008 255)',
                border: `1px solid ${tier.popular ? '#3c91ed' : 'rgba(255,255,255,0.08)'}`,
                boxShadow: tier.popular ? '0 0 32px #3c91ed20, 0 1px 3px #0000004d' : 'none',
              }}
            >
              {tier.popular && (
                <div
                  className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full px-5 py-1.5 text-xs font-bold text-white shadow-lg"
                  style={{ background: 'oklch(65% .16 253)', boxShadow: '0 0 16px #3c91ed50' }}
                >
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <p className="text-sm font-semibold" style={{ color: tier.popular ? '#3c91ed' : 'rgba(255,255,255,0.45)' }}>
                  {tier.name}
                </p>
                <div className="mt-2 flex items-end gap-1">
                  <span className="text-4xl font-extrabold text-white">{tier.price}</span>
                  <span className="mb-1 text-white/35">{tier.period}</span>
                </div>
                <p className="mt-1 text-xs text-white/30">{tier.desc}</p>
              </div>

              <ul className="mb-8 flex-1 space-y-3">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-white/60">
                    <span className="mt-0.5 flex-shrink-0" style={{ color: '#3c91ed' }}>
                      <Check size={13} strokeWidth={3} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                to={tier.href}
                className="block w-full rounded-xl py-3 text-center text-sm font-bold transition-all hover:scale-[1.02]"
                style={
                  tier.popular
                    ? { background: 'oklch(65% .16 253)', color: 'white', boxShadow: '0 0 16px #3c91ed30' }
                    : { border: '1px solid rgba(255,255,255,0.15)', color: 'white', background: 'transparent' }
                }
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section id="testimonials" className="border-t border-white/8 px-6 py-24" style={{ background: 'oklch(7% .006 255)' }}>
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest" style={{ color: '#3c91ed' }}>
            Real results
          </p>
          <h2 className="text-4xl font-extrabold tracking-tight">What our teams say</h2>
          <p className="mt-3 text-white/40 text-sm">From growth teams, agencies, and enterprise marketing orgs.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="flex flex-col rounded-2xl p-7 transition-all hover:-translate-y-1"
              style={{
                background: 'oklch(11% .008 255)',
                boxShadow: '0 0 0 1px rgba(60,145,237,0.12)',
                border: '1px solid rgba(60,145,237,0.12)',
              }}
            >
              {/* Stars */}
              <div className="mb-3 flex items-center gap-1 text-amber-400">
                {[0, 1, 2, 3, 4].map((i) => <Star key={i} size={12} fill="currentColor" stroke="none" />)}
              </div>

              {/* Quote */}
              <p className="mb-6 flex-1 text-sm leading-relaxed text-white/65">
                "{t.quote}"
              </p>

              {/* Metric badge */}
              <div className="mb-4">
                <span
                  className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold"
                  style={{ background: '#3c91ed18', color: '#3c91ed', border: '1px solid #3c91ed30' }}
                >
                  {t.metric}
                </span>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${t.gradient} text-xs font-bold text-white`}
                >
                  {t.initials}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{t.name}</div>
                  <div className="text-xs text-white/40">{t.role} · {t.company}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="border-t border-white/8 px-6 py-24">
      <div className="mx-auto max-w-3xl text-center">
        {/* Dot grid bg */}
        <div className="relative overflow-hidden rounded-3xl p-12 md:p-16"
          style={{
            background: 'oklch(11% .01 255)',
            border: '1px solid #3c91ed25',
            boxShadow: '0 0 80px #3c91ed18',
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-50"
            style={{ backgroundImage: 'radial-gradient(circle,#3c91ed0f 1px,#0000 1px)', backgroundSize: '28px 28px' }}
          />
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-0 h-[200px] w-[400px] -translate-x-1/2 rounded-full opacity-25 blur-[80px]" style={{ background: '#3c91ed' }} />
          </div>

          <div className="relative">
            <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest" style={{ color: '#3c91ed' }}>
              <span className="h-1 w-4 rounded-full" style={{ background: '#3c91ed' }} />
              Ready to launch
              <span className="h-1 w-4 rounded-full" style={{ background: '#3c91ed' }} />
            </div>

            <h2 className="mt-4 text-3xl font-extrabold tracking-tight md:text-4xl">
              Replace your entire marketing stack.
              <br />
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #3c91ed 0%, #7c3aed 100%)' }}>
                Start free.
              </span>
            </h2>

            <p className="mx-auto mt-4 max-w-lg text-white/45">
              10 AI agents. Every channel. No agency retainer. No CMO salary. Just results.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/demo"
                className="inline-flex items-center gap-2 rounded-xl px-8 py-4 text-base font-bold text-white transition-all hover:scale-[1.03]"
                style={{ background: 'oklch(65% .16 253)', boxShadow: '0 0 24px #3c91ed2e, 0 1px 3px #0000004d' }}
              >
                <Zap size={16} fill="currentColor" />
                Try Live Demo
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-8 py-4 text-base font-medium text-white hover:border-white/35 hover:bg-white/5 transition-all"
              >
                Create free account <ArrowRight size={14} />
              </Link>
            </div>

            <p className="mt-4 text-sm text-white/20">
              No credit card · No agency briefing · Live in 2 minutes
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/8 px-6 py-12" style={{ background: 'oklch(7% .006 255)' }}>
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 grid gap-8 md:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: 'oklch(65% .16 253)' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="text-sm font-bold text-white">Digital CMO AI</span>
            </Link>
            <p className="text-xs text-white/30 leading-relaxed">10 AI marketing agents. Strategy, execution, optimization — unified.</p>
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/25">Product</p>
            <div className="space-y-2 text-sm text-white/45">
              <div><a href="#agents" className="hover:text-white transition-colors">AI Agents</a></div>
              <div><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></div>
              <div><Link to="/demo" className="hover:text-white transition-colors">Live Demo</Link></div>
            </div>
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/25">Company</p>
            <div className="space-y-2 text-sm text-white/45">
              <div><Link to="/use-cases" className="hover:text-white transition-colors">Use Cases</Link></div>
              <div><Link to="/white-paper" className="hover:text-white transition-colors">White Paper</Link></div>
            </div>
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/25">Account</p>
            <div className="space-y-2 text-sm text-white/45">
              <div><Link to="/login" className="hover:text-white transition-colors">Sign in</Link></div>
              <div><Link to="/register" className="hover:text-white transition-colors">Register free</Link></div>
            </div>
          </div>
        </div>
        <div className="border-t border-white/8 pt-6 flex flex-col items-center justify-between gap-3 md:flex-row">
          <div className="flex items-center gap-4 text-xs text-white/20">
            <ShieldCheck size={14} className="text-white/15" />
            <span>© 2026 Digital CMO AI. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-white/20">
            <Globe size={14} className="text-white/15" />
            <span>Built for growth teams who move fast.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen text-white" style={{ background: 'oklch(9% .008 255)' }}>
      <NavBar />
      <HeroSection />
      <TrustBar />
      <AgentsSection />
      <IndustrySection />
      <PricingSection />
      <TestimonialsSection />
      <FinalCTA />
      <Footer />
    </div>
  );
}
