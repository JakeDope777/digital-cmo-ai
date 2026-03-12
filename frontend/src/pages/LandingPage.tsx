import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { growthService } from '../services/api';
import { getStoredUtm, trackEvent, trackOnboardingStep } from '../services/analytics';
import { industries } from '../data/industries';
import {
  getDomainDefinition,
  isDomainId,
  MODULE_CATALOG,
  MODULE_ORDER,
  resolveDomainId,
  SUPPORTED_DOMAINS,
  withDomainQuery,
} from '../data/domainModuleCatalog';
import { getOnboardingState, setSelectedDomain, setSelectedModule } from '../services/onboarding';
import type { DomainId, ModuleId } from '../types/catalog';
import LaunchReadinessPanel from '../components/common/LaunchReadinessPanel';

// ── Icons ────────────────────────────────────────────────────────────────────
const ArrowRight = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);
const Check = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const ChevronDown = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const StarIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

// Module SVG icons
const ModuleIcons: Record<ModuleId, () => JSX.Element> = {
  dashboard: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>
    </svg>
  ),
  chat: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  analysis: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><path d="M11 8v6m-3-3h6"/>
    </svg>
  ),
  creative: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 19 7-7 3 3-7 7-3-3z"/><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><circle cx="11" cy="11" r="2"/>
    </svg>
  ),
  crm: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  growth: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
    </svg>
  ),
  integrations: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>
  ),
  billing: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  ),
  profile: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  settings: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
};

const MODULE_ACCENT: Record<ModuleId, string> = {
  dashboard: 'card-accent-orange', chat: 'card-accent-violet', analysis: 'card-accent-sky',
  creative: 'card-accent-rose', crm: 'card-accent-emerald', growth: 'card-accent-amber',
  integrations: 'card-accent-sky', billing: 'card-accent-emerald', profile: 'card-accent-violet',
  settings: 'card-accent-orange',
};
const MODULE_ICON_COLOR: Record<ModuleId, string> = {
  dashboard: 'text-orange-400', chat: 'text-violet-400', analysis: 'text-sky-400',
  creative: 'text-rose-400', crm: 'text-emerald-400', growth: 'text-amber-400',
  integrations: 'text-sky-400', billing: 'text-emerald-400', profile: 'text-violet-400',
  settings: 'text-orange-400',
};

// ── Integration marquee ───────────────────────────────────────────────────────
const INTEGRATIONS = [
  { name: 'HubSpot', color: 'text-orange-400' }, { name: 'Shopify', color: 'text-emerald-400' },
  { name: 'Stripe', color: 'text-violet-400' }, { name: 'Google Ads', color: 'text-sky-400' },
  { name: 'Meta Ads', color: 'text-blue-400' }, { name: 'GA4', color: 'text-amber-400' },
  { name: 'Salesforce', color: 'text-sky-400' }, { name: 'Klaviyo', color: 'text-rose-400' },
  { name: 'LinkedIn Ads', color: 'text-blue-400' }, { name: 'Mailchimp', color: 'text-yellow-400' },
  { name: 'Intercom', color: 'text-blue-400' }, { name: 'Mixpanel', color: 'text-violet-400' },
];

// ── FAQ data ──────────────────────────────────────────────────────────────────
const faqs = [
  { q: 'Do I need technical skills to use Digital CMO AI?', a: 'Not at all. The entire product works through a conversational interface. Describe your goal in plain English and the AI handles the rest. No SQL, no dashboards to configure.' },
  { q: 'How is this different from ChatGPT or Jasper?', a: 'General AI tools have no memory of your brand, no access to your workspace context, and no ability to execute actions. Digital CMO AI connects to your managed live pilot stack or demo fallback, remembers your history and goals across sessions, and returns execution-ready plans.' },
  { q: 'Which integrations are supported?', a: 'Live during the pilot: HubSpot, GA4, and Stripe through managed workspace connections. The connector marketplace also includes 200+ additional templates and demo-backed connectors, with self-serve OAuth rolling out after the pilot.' },
  { q: 'Can I start with demo data before connecting my real accounts?', a: "Yes — every integration has a demo-mode fallback. You can experience the full product loop with realistic data and connect your live accounts when you're ready. No API keys required to get started." },
  { q: 'Is my data secure?', a: 'All data is encrypted at rest and in transit. We never train shared models on your proprietary data. Your memory store, brand voice, and campaign data are isolated per workspace. SOC 2 compliance is on the roadmap for Q3 2026.' },
  { q: 'What does the pilot programme include?', a: "Pilot users get full Pro-tier access, a personal onboarding session, a direct Slack channel with the founding team, and input on the roadmap. We read every piece of feedback and ship weekly." },
];

// ── Components ────────────────────────────────────────────────────────────────
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/8 last:border-0">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between py-5 text-left text-sm font-semibold text-white/80 hover:text-white transition-colors">
        {q}
        <span className={`ml-4 flex-shrink-0 text-white/30 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}><ChevronDown /></span>
      </button>
      {open && <p className="pb-5 text-sm leading-relaxed text-white/50">{a}</p>}
    </div>
  );
}

function DashMockup() {
  return (
    <div className="relative">
      <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-orange-500/20 via-violet-500/10 to-transparent blur-3xl" />
      <div className="relative rounded-2xl border border-white/10 bg-[#0e0e0e] shadow-2xl overflow-hidden ring-1 ring-white/5">
        <div className="flex items-center gap-1.5 border-b border-white/8 px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-rose-400/80" />
          <span className="h-3 w-3 rounded-full bg-amber-400/80" />
          <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
          <span className="ml-3 font-mono text-[11px] text-white/30">dashboard · live</span>
          <span className="ml-auto flex items-center gap-1.5 text-[10px] text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />AI CMO Active
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-4">
          {[
            { label: 'Pipeline Rev.', val: '$248K', note: '↑ 18% MoM', good: true },
            { label: 'ROAS', val: '5.3×', note: '↑ Target: 4.0×', good: true },
            { label: 'CAC', val: '$125', note: '↓ −12.4%', good: true },
            { label: 'Active Campaigns', val: '14', note: '3 optimising', good: null },
          ].map((k) => (
            <div key={k.label} className="rounded-xl bg-white/5 p-3">
              <p className="text-[10px] text-white/40">{k.label}</p>
              <p className="mt-1 text-xl font-bold text-white">{k.val}</p>
              <p className={`mt-0.5 text-[10px] ${k.good === true ? 'text-emerald-400' : k.good === false ? 'text-rose-400' : 'text-white/30'}`}>{k.note}</p>
            </div>
          ))}
        </div>
        <div className="mx-4 mb-3 h-24 rounded-xl bg-white/3 p-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-white/20">Marketing Spend · 6 months</p>
          <svg viewBox="0 0 280 60" className="w-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="sgb" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0,50 C30,45 60,35 90,28 C120,21 150,32 180,20 C210,8 240,15 280,5" stroke="#f97316" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M0,50 C30,45 60,35 90,28 C120,21 150,32 180,20 C210,8 240,15 280,5 L280,60 L0,60 Z" fill="url(#sgb)" />
          </svg>
        </div>
        <div className="mx-4 mb-4 rounded-xl border border-orange-500/20 bg-orange-500/8 p-3">
          <p className="text-[10px] font-semibold text-orange-400 mb-1">AI CMO · insight · just now</p>
          <p className="text-[11px] text-white/70 leading-relaxed">Google Ads CTR dropped 0.8% this week. Reallocating <span className="text-white font-semibold">$1,200</span> projects <span className="text-emerald-400 font-semibold">+$4,100 revenue</span> this month.</p>
          <div className="mt-2 flex gap-2">
            <span className="rounded-md bg-orange-500 px-2 py-0.5 text-[10px] font-bold text-black cursor-default">Apply Reallocation</span>
            <span className="rounded-md border border-white/15 px-2 py-0.5 text-[10px] text-white/40 cursor-default">View Analysis</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function IntegrationMarquee() {
  const doubled = [...INTEGRATIONS, ...INTEGRATIONS];
  return (
    <section className="border-y border-white/8 bg-[#0a0a0a] py-5 overflow-hidden">
      <p className="mb-4 text-center text-[11px] font-semibold uppercase tracking-widest text-white/25">
        Connects with your entire stack
      </p>
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-r from-[#0a0a0a] to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-l from-[#0a0a0a] to-transparent pointer-events-none" />
        <div className="flex marquee-track" style={{ width: 'max-content' }}>
          {doubled.map((item, i) => (
            <div key={i} className="mx-2 flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-4 py-2 text-sm font-medium whitespace-nowrap">
              <span className={`h-1.5 w-1.5 rounded-full bg-current ${item.color}`} />
              <span className="text-white/60">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const initialDomain = (() => {
    if (typeof window === 'undefined') return getOnboardingState().selected_domain;
    const queryDomain = resolveDomainId(new URLSearchParams(window.location.search).get('domain'));
    return queryDomain ?? getOnboardingState().selected_domain;
  })();

  const [menuOpen, setMenuOpen] = useState(false);
  const [earlyName, setEarlyName] = useState('');
  const [earlyEmail, setEarlyEmail] = useState('');
  const [earlyCompany, setEarlyCompany] = useState('');
  const [selectedDomain, setSelectedDomainState] = useState<DomainId | undefined>(initialDomain);
  const [earlyLoading, setEarlyLoading] = useState(false);
  const [earlySuccess, setEarlySuccess] = useState(false);
  const [earlyError, setEarlyError] = useState('');
  const earlyRef = useRef<HTMLDivElement>(null);
  const trackedModuleViews = useRef(false);
  const registerHref = withDomainQuery('/register', selectedDomain);
  const demoDashboardHref = withDomainQuery('/app/dashboard', selectedDomain, { demo: '1' });
  const supportedIndustries = industries.filter((ind) => isDomainId(ind.slug));

  // suppress unused warning — getDomainDefinition used indirectly via selectedDomain label
  void getDomainDefinition;

  useEffect(() => {
    if (selectedDomain) setSelectedDomain(selectedDomain);
    void trackOnboardingStep('landing_seen', { source: 'landing' });
    document.title = 'Digital CMO AI — Your AI-Powered Chief Marketing Officer';
  }, [selectedDomain]);

  useEffect(() => {
    if (trackedModuleViews.current) return;
    trackedModuleViews.current = true;
    MODULE_ORDER.forEach((moduleId) => {
      void trackEvent('module_card_viewed', { module_id: moduleId, location: 'landing' });
    });
  }, []);

  const handleEarlyAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (earlyLoading) return;
    setEarlyError('');
    setEarlyLoading(true);
    try {
      const utm = getStoredUtm();
      await growthService.joinWaitlist({ name: earlyName.trim(), email: earlyEmail.trim(), company: earlyCompany.trim() || undefined, source: 'landing_early_access', ...utm });
      await trackEvent('waitlist_joined', { company: earlyCompany.trim() || undefined, industry: selectedDomain, source: 'landing_early_access' });
      setEarlySuccess(true);
    } catch {
      setEarlyError('Something went wrong. Please try again.');
    } finally {
      setEarlyLoading(false);
    }
  };

  const scrollToEarly = () => earlyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });

  return (
    <div className="min-h-screen bg-black text-white">

      {/* NAV */}
      <nav className="sticky top-0 z-50 border-b border-white/8 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 shadow-lg shadow-orange-500/30">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-sm font-bold tracking-tight text-white">Digital CMO AI</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm text-white/55">
            <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
            <Link to="/use-cases" className="hover:text-white transition-colors">Use Cases</Link>
            <Link to="/white-paper" className="hover:text-white transition-colors">White Paper</Link>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="text-sm text-white/55 hover:text-white transition-colors px-3 py-2">Sign in</Link>
            <Link to={demoDashboardHref} className="rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white hover:border-white/35 hover:bg-white/5 transition-colors">Try demo</Link>
            <Link to={registerHref} className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-bold text-black hover:bg-orange-400 transition-colors shadow shadow-orange-500/20">Start free</Link>
          </div>
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-white/60 hover:text-white">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {menuOpen ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></> : <><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></>}
            </svg>
          </button>
        </div>
        {menuOpen && (
          <div className="border-t border-white/8 bg-black px-6 py-4 md:hidden space-y-3">
            <a href="#how-it-works" onClick={() => setMenuOpen(false)} className="block text-sm text-white/60 hover:text-white py-1">How it works</a>
            <Link to="/use-cases" onClick={() => setMenuOpen(false)} className="block text-sm text-white/60 hover:text-white py-1">Use Cases</Link>
            <Link to="/white-paper" onClick={() => setMenuOpen(false)} className="block text-sm text-white/60 hover:text-white py-1">White Paper</Link>
            <a href="#pricing" onClick={() => setMenuOpen(false)} className="block text-sm text-white/60 hover:text-white py-1">Pricing</a>
            <div className="flex gap-3 pt-2">
              <Link to={demoDashboardHref} className="flex-1 rounded-lg border border-white/20 py-2.5 text-center text-sm font-medium text-white">Try demo</Link>
              <Link to={registerHref} className="flex-1 rounded-lg bg-orange-500 py-2.5 text-center text-sm font-bold text-black">Start free</Link>
            </div>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden px-6 py-20 lg:py-28">
        <div className="pointer-events-none absolute inset-0 hero-grid opacity-80" />
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-32 top-0 h-[500px] w-[500px] rounded-full bg-orange-500/8 blur-3xl" />
          <div className="absolute right-0 top-20 h-[400px] w-[400px] rounded-full bg-violet-500/8 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-orange-500/5 blur-3xl" />
        </div>
        <div className="relative mx-auto grid max-w-6xl gap-16 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-500/25 bg-orange-500/8 px-4 py-1.5 text-xs font-medium text-orange-400 ring-1 ring-inset ring-orange-500/10">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-pulse" />
              Now in Pilot — Limited Spots Available
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight leading-[1.05] lg:text-6xl xl:text-7xl">
              The AI that runs<br />
              <span className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">your marketing.</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-white/55 max-w-lg">
              Strategy, execution, and reporting — through a single conversational interface. Replace agency retainers with AI that knows your brand, works with managed live pilot data or demo fallback, and executes in minutes.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/demo" className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3.5 text-base font-bold text-black hover:bg-orange-400 transition-all shadow-lg shadow-orange-500/25 hover:shadow-orange-500/35 hover:scale-[1.02]">
                ⚡ Try Live Demo <ArrowRight size={16} />
              </Link>
              <Link to={registerHref} className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-6 py-3.5 text-base font-medium text-white hover:border-white/35 hover:bg-white/5 transition-all">
                Create free account
              </Link>
            </div>
            <p className="mt-3 text-xs text-white/30">No credit card · No setup required · Demo works instantly</p>
            <LaunchReadinessPanel
              title="Pilot workspace status"
              tone="dark"
              variant="compact"
              className="mt-6 max-w-xl"
              showModeLegend
            />
            <div className="mt-6 flex items-center gap-3">
              <div className="flex items-center gap-0.5 text-amber-400">
                {[0,1,2,3,4].map((i) => <StarIcon key={i} />)}
              </div>
              <span className="text-sm font-semibold text-white/70">4.9 / 5</span>
              <span className="text-sm text-white/35">from 47 pilot users</span>
            </div>
            <div className="mt-8 border-t border-white/8 pt-6">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-white/25">Trusted by pilot teams at</p>
              <div className="flex flex-wrap items-center gap-3">
                {['Revver', 'Stackd.io', 'GrowthLoop', 'Keel Labs', 'Meridian HQ'].map((name) => (
                  <span key={name} className="rounded-full border border-white/12 bg-white/4 px-3 py-1 text-xs font-semibold text-white/50">{name}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="hidden lg:block"><DashMockup /></div>
        </div>
      </section>

      {/* INTEGRATION MARQUEE */}
      <IntegrationMarquee />

      {/* BUILT FOR SCALE */}
      <section className="border-b border-white/8 bg-[#080808] px-6 py-14">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-white/25">Built for scale</p>
            <h2 className="text-2xl font-bold tracking-tight text-white">Integrates with the tools you already use</h2>
            <p className="mt-2 text-sm text-white/40">Native connectors. No CSV exports. No manual sync.</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {/* HubSpot */}
            <div className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-[#111] px-6 py-4 shadow-sm hover:border-orange-500/30 transition-colors group">
              <svg width="24" height="24" viewBox="0 0 512 512" className="text-orange-400" fill="currentColor">
                <path d="M267.4 211.6c-25 0-48.3 7.4-67.8 20.2L145.7 178c4.3-10.2 6.7-21.4 6.7-33.1 0-47.8-38.7-86.5-86.5-86.5S-.3 97.1-.3 144.9s38.7 86.5 86.5 86.5c20.9 0 40.1-7.4 54.9-19.6l53.4 53.4c-13.4 19.7-21.2 43.5-21.2 69.1 0 68.3 55.4 123.7 123.7 123.7S420.4 402.6 420.4 334.3s-55.5-122.7-153-122.7zm0 195.6c-40 0-72.4-32.4-72.4-72.4s32.4-72.4 72.4-72.4 72.4 32.4 72.4 72.4-32.4 72.4-72.4 72.4zM66.2 188.1c-23.9 0-43.3-19.4-43.3-43.3s19.4-43.3 43.3-43.3 43.3 19.4 43.3 43.3-19.4 43.3-43.3 43.3z"/>
              </svg>
              <span className="text-sm font-semibold text-white/70 group-hover:text-white transition-colors">HubSpot</span>
            </div>
            {/* Google Ads */}
            <div className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-[#111] px-6 py-4 shadow-sm hover:border-sky-500/30 transition-colors group">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-sky-400">
                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="currentColor"/>
              </svg>
              <span className="text-sm font-semibold text-white/70 group-hover:text-white transition-colors">Google Ads</span>
            </div>
            {/* LinkedIn */}
            <div className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-[#111] px-6 py-4 shadow-sm hover:border-blue-500/30 transition-colors group">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-blue-400">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              <span className="text-sm font-semibold text-white/70 group-hover:text-white transition-colors">LinkedIn</span>
            </div>
            {/* Stripe */}
            <div className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-[#111] px-6 py-4 shadow-sm hover:border-violet-500/30 transition-colors group">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-violet-400">
                <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/>
              </svg>
              <span className="text-sm font-semibold text-white/70 group-hover:text-white transition-colors">Stripe</span>
            </div>
            {/* SendGrid */}
            <div className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-[#111] px-6 py-4 shadow-sm hover:border-sky-400/30 transition-colors group">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-sky-300">
                <path d="M0 8h8V0H0v8zm1-7h6v6H1V1zm7 15H0v8h8v-8zm-1 7H1v-6h6v6zm1-15h8V0H8v8zm1-7h6v6H9V1zM8 16h8v-8H8v8zm1-7h6v6H9V9zm7-9h8v8h-8V0zm1 7h6V1h-6v6zm-1 9h8v8h-8v-8zm1 7h6v-6h-6v6z"/>
              </svg>
              <span className="text-sm font-semibold text-white/70 group-hover:text-white transition-colors">SendGrid</span>
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF STATS */}
      <section className="border-b border-white/8 bg-[#080808] px-6 py-14">
        <div className="mx-auto max-w-6xl">
          <p className="mb-10 text-center text-[11px] font-semibold uppercase tracking-widest text-white/25">Why marketing teams switch to AI</p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              { stat: '14 hrs', unit: '/week', desc: 'lost to manual reporting per marketing FTE', color: 'text-orange-400' },
              { stat: '$180K', unit: '/year', desc: 'average agency retainer for a mid-market team', color: 'text-violet-400' },
              { stat: '63%', unit: ' of campaigns', desc: 'underperform because of stale data and slow iteration', color: 'text-sky-400' },
            ].map((item, i) => (
              <div key={i} className="rounded-2xl border border-white/8 bg-white/3 p-8 text-center">
                <div className={`text-5xl font-extrabold tracking-tight ${item.color}`}>
                  {item.stat}<span className="text-2xl font-semibold text-white/30">{item.unit}</span>
                </div>
                <div className="mt-3 text-sm leading-relaxed text-white/45">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-orange-500">How it works</p>
            <h2 className="text-4xl font-extrabold tracking-tight">From zero to campaign in 3 steps.</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                step: '01', accent: 'card-accent-orange',
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-400"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
                title: 'Connect your stack',
                desc: 'Start with managed HubSpot, GA4, and Stripe pilot setup, then explore 200+ additional connectors in demo mode while self-serve OAuth rolls out after the pilot.',
              },
              {
                step: '02', accent: 'card-accent-violet',
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-400"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
                title: 'Ask your AI CMO anything',
                desc: 'Describe a goal in plain English. The AI routes to the right module and returns an execution-ready plan — not just text to copy-paste.',
              },
              {
                step: '03', accent: 'card-accent-emerald',
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
                title: 'Execute, measure, iterate',
                desc: 'Launch campaigns, track velocity, generate A/B variants, and get proactive alerts before problems cost you budget.',
              },
            ].map((item) => (
              <div key={item.step} className={`rounded-2xl border border-white/10 bg-[#111111] p-8 ${item.accent} transition-all hover:bg-[#161616]`}>
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/6">{item.icon}</div>
                  <span className="text-4xl font-extrabold text-white/8">{item.step}</span>
                </div>
                <h3 className="mb-3 text-lg font-bold text-white">{item.title}</h3>
                <p className="text-sm leading-relaxed text-white/50">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link to={demoDashboardHref} className="inline-flex items-center gap-2 text-sm font-semibold text-orange-500 hover:text-orange-400 transition-colors">
              See all 3 steps in the live demo <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* 10 MODULES */}
      <section className="border-t border-white/8 bg-[#080808] px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-orange-500">Ten modules. One OS.</p>
            <h2 className="text-4xl font-extrabold tracking-tight">Everything your marketing team needs — unified.</h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-white/45">Each module shares the same domain-aware memory context and brand voice.</p>
          </div>
          {/* Industry pill filter */}
          <div className="mb-10 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-white/30 mr-1">Personalize for:</span>
            <button
              onClick={() => { setSelectedDomainState(undefined); setSelectedDomain(undefined); }}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${!selectedDomain ? 'border-orange-500 bg-orange-500/15 text-orange-400' : 'border-white/12 bg-white/3 text-white/40 hover:border-white/25'}`}
            >All</button>
            {SUPPORTED_DOMAINS.slice(0, 6).map((domain) => (
              <button
                key={domain.id}
                onClick={() => { setSelectedDomainState(domain.id); setSelectedDomain(domain.id); }}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${selectedDomain === domain.id ? 'border-orange-500 bg-orange-500/15 text-orange-400' : 'border-white/12 bg-white/3 text-white/40 hover:border-white/25 hover:text-white/60'}`}
              >
                {(domain as { shortName?: string }).shortName ?? domain.name}
              </button>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {MODULE_ORDER.map((moduleId) => {
              const module = MODULE_CATALOG[moduleId];
              const Icon = ModuleIcons[moduleId];
              const moduleDemoHref = withDomainQuery(module.route, selectedDomain, { demo: '1' });
              return (
                <div key={module.id} className={`rounded-2xl border border-white/10 bg-[#111111] p-6 ${MODULE_ACCENT[moduleId]} transition-all hover:border-white/20 hover:bg-[#161616] group`}>
                  <div className="mb-4 flex items-center justify-between">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-white/6 ${MODULE_ICON_COLOR[moduleId]}`}><Icon /></div>
                    <span className="rounded-full bg-white/6 px-2 py-0.5 text-[10px] font-semibold text-white/35">{module.badge}</span>
                  </div>
                  <h3 className="mb-1.5 text-sm font-bold text-white">{module.title}</h3>
                  <p className="mb-4 text-xs leading-relaxed text-white/45 line-clamp-3">{module.description}</p>
                  {selectedDomain && (
                    <p className="mb-3 rounded-lg bg-white/4 px-2.5 py-2 text-[10px] text-white/35 leading-relaxed">{module.domain_overrides[selectedDomain]}</p>
                  )}
                  <Link
                    to={moduleDemoHref}
                    onClick={() => { setSelectedModule(module.id); void trackEvent('module_card_clicked', { module_id: module.id, location: 'landing' }); }}
                    className={`inline-flex items-center gap-1 text-xs font-semibold transition-colors ${MODULE_ICON_COLOR[moduleId]} opacity-55 group-hover:opacity-100`}
                  >
                    Open in demo <ArrowRight size={11} />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* COMPARISON */}
      <section className="border-t border-white/8 px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-orange-500">The difference</p>
            <h2 className="text-4xl font-extrabold tracking-tight">Not a chatbot. A persistent AI co-founder for growth.</h2>
          </div>
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <div className="grid grid-cols-4 border-b border-white/8 bg-white/3 px-6 py-4 text-xs font-semibold uppercase tracking-widest">
              <div className="text-white/35">Capability</div>
              <div className="text-center text-white/25">Agency</div>
              <div className="text-center text-white/25">Generic AI</div>
              <div className="text-center text-orange-400">Digital CMO AI</div>
            </div>
            {[
              'Persistent memory of your brand', 'Live data access', 'Multi-module orchestration',
              'Brand voice lock', '200+ connector templates', 'Marketing-specific skills',
              'Demo mode (no setup)', 'Available 24/7',
            ].map((row, i) => (
              <div key={row} className={`grid grid-cols-4 items-center px-6 py-3.5 text-sm ${i % 2 === 0 ? '' : 'bg-white/2'}`}>
                <div className="text-white/55">{row}</div>
                <div className="text-center text-white/20 text-base">✗</div>
                <div className="text-center text-white/20 text-base">✗</div>
                <div className="text-center">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-orange-500/15 text-orange-400"><Check size={10} /></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* USE CASES PREVIEW */}
      <section className="border-t border-white/8 bg-[#080808] px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-orange-500">Real workflows</p>
              <h2 className="text-4xl font-extrabold tracking-tight">What teams use it for.</h2>
            </div>
            <Link to="/use-cases" className="inline-flex items-center gap-2 text-sm font-semibold text-white/45 hover:text-white transition-colors whitespace-nowrap">
              See all 8 workflows <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              {
                tag: 'Content', tagColor: 'text-violet-400 bg-violet-400/10 border-violet-400/20',
                iconEl: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-400"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
                title: 'Replace your content agency', outcome: 'Save $6–12K/month',
                desc: 'Generate a full month of brand-consistent content — blog posts, social, and email — in a single 2-hour session.',
              },
              {
                tag: 'Growth', tagColor: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
                iconEl: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
                title: 'Reduce CAC by 30%', outcome: 'Avg. 31% CAC reduction',
                desc: 'AI identifies your highest-ROI channels, proposes a budget reallocation, and tracks the impact in real time.',
              },
              {
                tag: 'Testing', tagColor: 'text-sky-400 bg-sky-400/10 border-sky-400/20',
                iconEl: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-400"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v11m0 0H5a2 2 0 0 1-2-2V9m6 5h10a2 2 0 0 0 2-2V9m-6 8v3m0 0h-4m4 0h4"/></svg>,
                title: 'A/B test without a developer', outcome: 'Ship tests in hours',
                desc: 'Generate 10 distinct variants for any campaign element. AI tracks significance and declares a winner automatically.',
              },
            ].map((uc) => (
              <Link to="/use-cases" key={uc.title} className="group rounded-2xl border border-white/10 bg-[#111111] p-7 transition-all hover:border-white/20 hover:bg-[#161616]">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">{uc.iconEl}</div>
                  <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${uc.tagColor}`}>{uc.tag}</span>
                </div>
                <h3 className="mb-2 font-bold text-white">{uc.title}</h3>
                <p className="mb-5 text-sm leading-relaxed text-white/50">{uc.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-orange-400">{uc.outcome}</span>
                  <span className="text-white/30 transition-colors group-hover:text-orange-400"><ArrowRight size={14} /></span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* WHITE PAPER TEASER */}
      <section className="border-t border-white/8 px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <Link to="/white-paper" className="group flex flex-col items-start justify-between gap-6 rounded-2xl border border-white/10 bg-gradient-to-br from-[#111111] to-[#0d0d0d] p-8 transition-all hover:border-orange-500/30 md:flex-row md:items-center">
            <div className="flex items-start gap-5">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-orange-500/15 text-orange-400">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
                </svg>
              </div>
              <div>
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-orange-500">Free White Paper</p>
                <h3 className="text-xl font-bold text-white">The AI CMO Playbook</h3>
                <p className="mt-1 text-sm text-white/50">How modern growth teams are replacing agency retainers with AI — and what the first 90 days look like.</p>
              </div>
            </div>
            <div className="flex flex-shrink-0 items-center gap-2 rounded-xl border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition-all group-hover:border-orange-500/50 group-hover:text-orange-400 group-hover:bg-orange-500/5">
              Download free <ArrowRight size={14} />
            </div>
          </Link>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="border-t border-white/8 bg-[#080808] px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-orange-500">What our beta users say</p>
            <h2 className="text-4xl font-extrabold tracking-tight">Real results from real teams.</h2>
            <p className="mt-3 text-white/40 text-sm">From our closed beta cohort of 47 marketing teams.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                quote: "We cut our weekly reporting time from 6 hours to 20 minutes. It identified a $4,100 reallocation opportunity in our Google Ads on day one — we applied it and saw the lift within 10 days. I genuinely don't know how we managed without it.",
                name: 'Sarah K.',
                role: 'Head of Growth · B2B SaaS · Series A',
                initials: 'SK',
                from: 'from-orange-500',
                to: 'to-rose-500',
                metric: '14 hrs/week saved',
              },
              {
                quote: "It completely replaced our $9K/month content agency retainer. The brand memory means I never have to re-brief it — it already knows our tone, our ICP, our positioning. The output quality is genuinely better than what we were paying an agency for.",
                name: 'Marcus T.',
                role: 'Co-Founder & CEO · D2C Brand · $2.4M ARR',
                initials: 'MT',
                from: 'from-violet-500',
                to: 'to-purple-600',
                metric: '$9K/mo agency replaced',
              },
              {
                quote: "The channel attribution analysis was eye-opening. We were spending 60% of our budget on Meta because it 'felt' like it was working. Turns out LinkedIn was delivering 8× ROAS and we'd been capping it. We reallocated in week 1 and pipeline jumped 34% that month.",
                name: 'Priya M.',
                role: 'CMO · Growth-Stage SaaS · 120 employees',
                initials: 'PM',
                from: 'from-sky-500',
                to: 'to-blue-600',
                metric: '+34% pipeline in month 1',
              },
            ].map((t) => (
              <div key={t.name} className="rounded-2xl border border-white/10 bg-[#111111] p-7 card-accent-orange flex flex-col">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[0,1,2,3,4].map((i) => <StarIcon key={i} />)}
                  </div>
                  <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400">{t.metric}</span>
                </div>
                <p className="mb-6 flex-1 text-sm leading-relaxed text-white/70">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${t.from} ${t.to} text-xs font-bold text-white`}>{t.initials}</div>
                  <div>
                    <div className="text-sm font-semibold text-white">{t.name}</div>
                    <div className="text-xs text-white/40">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INDUSTRIES */}
      <section className="border-t border-white/8 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-orange-500">Industry-specific</p>
            <h2 className="text-4xl font-extrabold tracking-tight">Tailored for how your industry works.</h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-white/45">Pre-loaded with industry-specific KPIs, workflows, compliance guardrails, and integration stacks.</p>
          </div>
          <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
            {supportedIndustries.map((ind) => (
              <Link
                key={ind.slug}
                to={withDomainQuery(`/industries/${ind.slug}`, resolveDomainId(ind.slug))}
                className="group flex items-center gap-3 rounded-xl border border-white/10 bg-[#111111] px-5 py-4 transition-all hover:border-white/20 hover:bg-[#161616]"
              >
                <span className="text-xl">{ind.emoji}</span>
                <div>
                  <div className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors">{ind.shortName}</div>
                  <div className="text-[11px] text-white/30">{ind.tagline}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="border-t border-white/8 bg-[#080808] px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-orange-500">Pricing</p>
            <h2 className="text-4xl font-extrabold tracking-tight">Start free. Scale as you grow.</h2>
            <p className="mx-auto mt-4 max-w-lg text-lg text-white/45">Transparent pricing, no hidden fees. Cancel or change plans anytime.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-[#111111] p-8 card-accent-orange">
              <div className="mb-6">
                <p className="text-sm font-semibold text-white/45">Starter</p>
                <div className="mt-2 flex items-end gap-1"><span className="text-4xl font-extrabold text-white">$0</span><span className="mb-1 text-white/35">/mo</span></div>
                <p className="mt-1 text-xs text-white/30">Free forever</p>
              </div>
              <ul className="mb-8 space-y-3 text-sm">
                {['AI Chat — 50 msg/month', 'Business Analysis (demo data)', 'Creative Studio — 10 gen/month', 'Dashboard & Reporting', 'Email support'].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-white/55"><span className="text-white/25"><Check /></span>{f}</li>
                ))}
              </ul>
              <Link to={demoDashboardHref} className="block w-full rounded-xl border border-white/15 py-3 text-center text-sm font-semibold text-white hover:border-white/30 hover:bg-white/5 transition-colors">Open demo</Link>
            </div>
            <div className="relative rounded-2xl border border-orange-500 bg-[#111111] p-8 shadow-lg shadow-orange-500/12">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-orange-500 px-4 py-1 text-xs font-bold text-black shadow-lg shadow-orange-500/30">Most Popular</div>
              <div className="mb-6">
                <p className="text-sm font-semibold text-orange-400">Pro</p>
                <div className="mt-2 flex items-end gap-1"><span className="text-4xl font-extrabold text-white">$149</span><span className="mb-1 text-white/35">/mo</span></div>
                <p className="mt-1 text-xs text-white/30">Billed monthly, cancel anytime</p>
              </div>
              <ul className="mb-8 space-y-3 text-sm">
                {['Unlimited AI Chat', 'Managed live pilot connectors: HubSpot, GA4, Stripe', 'Unlimited Creative Generation', 'Full CRM & Campaign Orchestration', 'Advanced Analytics & Forecasting', 'A/B significance testing', 'Priority support'].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-white/70"><span className="text-orange-500"><Check /></span>{f}</li>
                ))}
              </ul>
              <Link to={registerHref} className="block w-full rounded-xl bg-orange-500 py-3 text-center text-sm font-bold text-black hover:bg-orange-400 transition-colors shadow shadow-orange-500/20">Create account</Link>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#111111] p-8 card-accent-violet">
              <div className="mb-6">
                <p className="text-sm font-semibold text-white/45">Enterprise</p>
                <div className="mt-2"><span className="text-4xl font-extrabold text-white">Custom</span></div>
                <p className="mt-1 text-xs text-white/30">Tailored to your scale</p>
              </div>
              <ul className="mb-8 space-y-3 text-sm">
                {['Everything in Pro', 'Expanded managed connector rollout', 'White-label option', 'Custom memory & brand voice', 'Dedicated onboarding + SLA', 'SSO + team management'].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-white/55"><span className="text-white/25"><Check /></span>{f}</li>
                ))}
              </ul>
              <button onClick={scrollToEarly} className="block w-full rounded-xl border border-white/15 py-3 text-center text-sm font-semibold text-white hover:border-white/30 hover:bg-white/5 transition-colors">Contact sales</button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-white/8 px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-12 text-center"><h2 className="text-4xl font-extrabold tracking-tight">Common questions.</h2></div>
          {faqs.map((faq) => <FAQItem key={faq.q} q={faq.q} a={faq.a} />)}
        </div>
      </section>

      {/* EARLY ACCESS */}
      <section ref={earlyRef} className="border-t border-white/8 bg-[#080808] px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#111111] to-[#0d0d0d] p-10 text-center md:p-14 ring-1 ring-white/5">
            <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-orange-500">
              <span className="h-1 w-4 rounded-full bg-orange-500" />Limited early access<span className="h-1 w-4 rounded-full bg-orange-500" />
            </div>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight md:text-4xl">Get early access before public launch.</h2>
            <p className="mx-auto mt-4 max-w-lg text-white/45">We're onboarding a select group of founders and growth teams. We'll be in touch within 24 hours.</p>
            {earlySuccess ? (
              <div className="mt-8 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-6">
                <p className="font-semibold text-emerald-400">You're on the list.</p>
                <p className="mt-1 text-sm text-emerald-400/70">We'll reach out within 24 hours. In the meantime, try the demo.</p>
                <Link to={demoDashboardHref} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-bold text-black hover:bg-orange-400 transition-colors">Open demo now <ArrowRight size={14} /></Link>
              </div>
            ) : (
              <form onSubmit={handleEarlyAccess} className="mt-8">
                <div className="grid gap-4 md:grid-cols-3">
                  <input type="text" required value={earlyName} onChange={(e) => setEarlyName(e.target.value)} placeholder="Your name" className="rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white placeholder:text-white/25 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500" />
                  <input type="email" required value={earlyEmail} onChange={(e) => setEarlyEmail(e.target.value)} placeholder="Work email" className="rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white placeholder:text-white/25 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500" />
                  <input type="text" value={earlyCompany} onChange={(e) => setEarlyCompany(e.target.value)} placeholder="Company (optional)" className="rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white placeholder:text-white/25 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500" />
                </div>
                {earlyError && <p className="mt-3 text-sm text-red-400">{earlyError}</p>}
                <button type="submit" disabled={earlyLoading} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-8 py-3.5 text-sm font-bold text-black hover:bg-orange-400 disabled:opacity-60 transition-all shadow-lg shadow-orange-500/25">
                  {earlyLoading ? 'Submitting…' : <><span>Request Early Access</span><ArrowRight size={14} /></>}
                </button>
                <p className="mt-3 text-xs text-white/25">No spam · Unsubscribe anytime · We read every submission</p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="border-t border-white/8 px-6 py-20 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-4xl font-extrabold tracking-tight md:text-5xl">Ready to replace<br />your agency?</h2>
          <p className="mx-auto mt-5 max-w-lg text-lg text-white/45">The demo is free, instant, and shows you exactly what your first week looks like — without signing up.</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link to={demoDashboardHref} className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-8 py-4 text-base font-bold text-black hover:bg-orange-400 transition-all shadow-lg shadow-orange-500/25 hover:shadow-orange-500/35 hover:scale-[1.02]">
              Try the live demo <ArrowRight size={16} />
            </Link>
            <Link to={registerHref} className="inline-flex rounded-xl border border-white/20 px-8 py-4 text-base font-medium text-white hover:border-white/35 hover:bg-white/5 transition-all">
              Create free account
            </Link>
          </div>
          <p className="mt-4 text-sm text-white/20">No credit card · No agency briefing · Live in 2 minutes</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/8 px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 grid gap-8 md:grid-cols-4">
            <div>
              <Link to="/" className="flex items-center gap-2 mb-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
                <span className="text-sm font-bold">Digital CMO AI</span>
              </Link>
              <p className="text-xs text-white/30 leading-relaxed">Your AI Chief Marketing Officer. Strategy, execution, and reporting — unified.</p>
            </div>
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/25">Product</p>
              <div className="space-y-2 text-sm text-white/45">
                <div><a href="#how-it-works" className="hover:text-white transition-colors">How it works</a></div>
                <div><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></div>
                <div><Link to={demoDashboardHref} className="hover:text-white transition-colors">Live demo</Link></div>
              </div>
            </div>
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/25">Resources</p>
              <div className="space-y-2 text-sm text-white/45">
                <div><Link to="/use-cases" className="hover:text-white transition-colors">Use Cases</Link></div>
                <div><Link to="/white-paper" className="hover:text-white transition-colors">White Paper</Link></div>
              </div>
            </div>
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/25">Account</p>
              <div className="space-y-2 text-sm text-white/45">
                <div><Link to="/login" className="hover:text-white transition-colors">Sign in</Link></div>
                <div><Link to={registerHref} className="hover:text-white transition-colors">Register</Link></div>
              </div>
            </div>
          </div>
          <div className="border-t border-white/8 pt-6 flex flex-col items-center justify-between gap-3 md:flex-row">
            <p className="text-xs text-white/20">© 2026 Digital CMO AI. All rights reserved.</p>
            <p className="text-xs text-white/20">Built for growth teams who move fast.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
