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

const ArrowRight = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);
const Check = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const ChevronDown = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const MODULE_ICON_EMOJI: Record<ModuleId, string> = {
  dashboard: '📊',
  chat: '💬',
  analysis: '🔎',
  creative: '🎨',
  crm: '🧭',
  growth: '📈',
  integrations: '🔌',
  billing: '💳',
  profile: '👤',
  settings: '⚙️',
};

function DashMockup() {
  return (
    <div className="relative">
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-orange-500/20 to-rose-500/10 blur-2xl" />
      <div className="relative rounded-2xl border border-white/10 bg-[#0e0e0e] shadow-2xl overflow-hidden">
        <div className="flex items-center gap-1.5 border-b border-white/8 px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-rose-400/80" />
          <span className="h-3 w-3 rounded-full bg-amber-400/80" />
          <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
          <span className="ml-3 font-mono text-[11px] text-white/30">dashboard · live</span>
          <span className="ml-auto flex items-center gap-1.5 text-[10px] text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            AI CMO Active
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

const faqs = [
  { q: 'Do I need technical skills to use Digital CMO AI?', a: 'Not at all. The entire product works through a conversational interface. Describe your goal in plain English — strategy, copy, analytics, or campaign briefs — and the AI handles the rest. No SQL, no dashboards to configure.' },
  { q: 'How is this different from ChatGPT or Jasper?', a: 'General AI tools have no memory of your brand, no access to your live data, and no ability to execute actions. Digital CMO AI connects to your actual marketing stack, remembers your history and goals across sessions, and returns execution-ready plans — not just text.' },
  { q: 'Which integrations are supported?', a: 'Natively: HubSpot, Salesforce, Google Ads, Meta Ads, GA4, Klaviyo, Shopify, Stripe, LinkedIn Ads, Mailchimp, and more. Through the connector marketplace you get 200+ additional templates via n8n and other providers.' },
  { q: 'Can I start with demo data before connecting my real accounts?', a: "Yes — every integration has a demo-mode fallback. You can experience the full product loop with realistic data and connect your live accounts when you're ready. No API keys required to get started." },
  { q: 'Is my data secure?', a: 'All data is encrypted at rest and in transit. We never train shared models on your proprietary data. Your memory store, brand voice, and campaign data are isolated per workspace. SOC 2 compliance is on the roadmap for Q3 2026.' },
  { q: 'What does the pilot programme include?', a: "Pilot users get full Pro-tier access, a personal onboarding session, a direct Slack channel with the founding team, and input on the roadmap. We read every piece of feedback and ship weekly." },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/8 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left text-sm font-semibold text-white/80 hover:text-white transition-colors"
      >
        {q}
        <span className={`ml-4 flex-shrink-0 text-white/30 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
          <ChevronDown />
        </span>
      </button>
      {open && <p className="pb-5 text-sm leading-relaxed text-white/50">{a}</p>}
    </div>
  );
}

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
  const selectedDomainLabel = getDomainDefinition(selectedDomain)?.shortName;
  const registerHref = withDomainQuery('/register', selectedDomain);
  const demoDashboardHref = withDomainQuery('/app/dashboard', selectedDomain, { demo: '1' });
  const supportedIndustries = industries.filter((ind) => isDomainId(ind.slug));

  useEffect(() => {
    if (selectedDomain) {
      setSelectedDomain(selectedDomain);
    }
    void trackOnboardingStep('landing_seen', { source: 'landing' });
    document.title = 'Digital CMO AI — Your AI Chief Marketing Officer';
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
      await growthService.joinWaitlist({
        name: earlyName.trim(),
        email: earlyEmail.trim(),
        company: earlyCompany.trim() || undefined,
        source: 'landing_early_access',
        ...utm,
      });
      await trackEvent('waitlist_joined', {
        company: earlyCompany.trim() || undefined,
        industry: selectedDomain,
        source: 'landing_early_access',
      });
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
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 shadow-lg shadow-orange-500/20">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-sm font-bold text-white">Digital CMO AI</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm text-white/60">
            <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
            <Link to="/use-cases" className="hover:text-white transition-colors">Use Cases</Link>
            <Link to="/white-paper" className="hover:text-white transition-colors">White Paper</Link>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="text-sm text-white/60 hover:text-white transition-colors px-3 py-2">Sign in</Link>
            <Link to={demoDashboardHref} className="rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white hover:border-white/40 hover:bg-white/5 transition-colors">Try demo</Link>
            <Link to={registerHref} className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-bold text-black hover:bg-orange-400 transition-colors">Start free</Link>
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
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 top-10 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl" />
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-orange-500/5 blur-3xl" />
        </div>
        <div className="relative mx-auto grid max-w-6xl gap-16 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/8 px-4 py-1.5 text-xs font-medium text-orange-400">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-pulse" />
              Now in Pilot — Limited Spots Available
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight leading-[1.05] lg:text-6xl xl:text-7xl">
              The AI that runs<br />
              <span className="text-orange-500">your marketing.</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-white/60 max-w-lg">
              Strategy, execution, and reporting — through a single conversational interface. Replace agency retainers with AI that knows your brand, acts on live data, and executes in minutes.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={demoDashboardHref} className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3.5 text-base font-bold text-black hover:bg-orange-400 transition-colors shadow-lg shadow-orange-500/20">
                Try the live demo <ArrowRight size={16} />
              </Link>
              <Link to={registerHref} className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-6 py-3.5 text-base font-medium text-white hover:border-white/40 hover:bg-white/5 transition-colors">
                Create free account
              </Link>
            </div>
            <p className="mt-4 text-xs text-white/30">No credit card · No setup required · Demo works instantly</p>
            <div className="mt-10 border-t border-white/8 pt-6">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/30">Trusted by growth teams at</p>
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-white/30">
                {['Revver', 'Stackd.io', 'GrowthLoop', 'Keel Labs', 'Meridian HQ'].map((name) => (
                  <span key={name}>{name}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="hidden lg:block"><DashMockup /></div>
        </div>
      </section>

      {/* PAIN STRIP */}
      <section className="border-y border-white/8 px-6 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 divide-white/8 md:grid-cols-3 md:divide-x">
            {[
              { stat: '14 hrs/week', desc: 'lost to manual reporting per marketing FTE' },
              { stat: '$180K/year', desc: 'average agency retainer for a mid-market team' },
              { stat: '63% of campaigns', desc: 'underperform because of stale data and slow iteration' },
            ].map((item, i) => (
              <div key={i} className="px-8 py-4 first:pl-0 last:pr-0 md:py-0">
                <div className="text-2xl font-extrabold text-orange-500">{item.stat}</div>
                <div className="mt-1 text-sm text-white/40">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DOMAIN + FIRST SESSION PATH */}
      <section className="border-b border-white/8 px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl border border-white/10 bg-[#111111] p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-orange-500">First 5 minutes</p>
            <h3 className="mt-2 text-2xl font-extrabold">Pick your domain and start path</h3>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <select
                value={selectedDomain ?? ''}
                onChange={(event) => {
                  const next = resolveDomainId(event.target.value);
                  setSelectedDomainState(next);
                  setSelectedDomain(next);
                }}
                className="min-w-[240px] rounded-lg border border-white/20 bg-black px-3 py-2 text-sm text-white"
              >
                <option value="">Select domain</option>
                {SUPPORTED_DOMAINS.map((domain) => (
                  <option key={domain.id} value={domain.id}>{domain.name}</option>
                ))}
              </select>
              <p className="text-xs text-white/40">
                {selectedDomainLabel
                  ? `Configured for ${selectedDomainLabel} across onboarding, demo fixtures, and module guidance.`
                  : 'Select a domain to personalize onboarding, module highlights, and demo scenarios.'}
              </p>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-black p-4">
                <p className="text-[11px] uppercase tracking-wide text-white/40">Primary path</p>
                <p className="mt-1 text-sm font-semibold text-white">Register → Verify → Dashboard</p>
                <p className="mt-1 text-xs text-white/40">Best for live onboarding telemetry and account setup.</p>
                <Link to={registerHref} className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-orange-500 hover:text-orange-400">
                  Create account <ArrowRight size={12} />
                </Link>
              </div>
              <div className="rounded-xl border border-white/10 bg-black p-4">
                <p className="text-[11px] uppercase tracking-wide text-white/40">Secondary path</p>
                <p className="mt-1 text-sm font-semibold text-white">Open demo → First value action</p>
                <p className="mt-1 text-xs text-white/40">No signup required. Deterministic domain demo data included.</p>
                <Link to={demoDashboardHref} className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-orange-500 hover:text-orange-400">
                  Open demo <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-orange-500">How it works</p>
            <h2 className="text-4xl font-extrabold">From zero to campaign in 3 steps.</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { step: '01', title: 'Connect your stack', desc: 'Link HubSpot, Google Ads, Meta, GA4, Stripe, and 200+ more in minutes. OAuth connections — no manual CSV exports, no webhook setup.' },
              { step: '02', title: 'Ask your AI CMO anything', desc: 'Describe a goal in plain English. The AI routes to the right module and returns an execution-ready plan — not just text to copy-paste.' },
              { step: '03', title: 'Execute, measure, iterate', desc: 'Launch campaigns, track velocity, generate A/B variants, and get proactive alerts before problems cost you budget.' },
            ].map((item) => (
              <div key={item.step} className="rounded-2xl border border-white/10 bg-[#111111] p-8">
                <div className="mb-4 text-4xl font-extrabold text-orange-500/30">{item.step}</div>
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
      <section className="border-t border-white/8 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-orange-500">Ten modules. One OS.</p>
            <h2 className="text-4xl font-extrabold">Everything your marketing team needs — unified.</h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-white/50">Each module has execution-grade features, and all 10 share the same domain-aware memory context.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-5">
            {MODULE_ORDER.map((moduleId) => {
              const module = MODULE_CATALOG[moduleId];
              const moduleDemoHref = withDomainQuery(module.route, selectedDomain, { demo: '1' });
              return (
              <div key={module.id} className="rounded-2xl border border-white/10 bg-[#111111] p-7 transition-all hover:border-white/20 hover:bg-[#161616]">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-2xl">{MODULE_ICON_EMOJI[module.id]}</span>
                  <span className="rounded-full bg-white/8 px-2.5 py-1 text-xs font-semibold text-white/50">{module.badge}</span>
                </div>
                <h3 className="mb-2 font-bold text-white">{module.title}</h3>
                <p className="mb-4 text-sm leading-relaxed text-white/50">{module.description}</p>
                <ul className="space-y-1.5">
                  {module.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-xs text-white/40">
                      <span className="text-white/20"><Check /></span>{feature}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 rounded-lg bg-white/5 px-2.5 py-2 text-[11px] text-white/50">
                  {selectedDomain
                    ? module.domain_overrides[selectedDomain]
                    : 'Select a domain to personalize this module.'}
                </p>
                <Link
                  to={moduleDemoHref}
                  onClick={() => {
                    setSelectedModule(module.id);
                    void trackEvent('module_card_clicked', { module_id: module.id, location: 'landing' });
                  }}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-orange-500 hover:text-orange-400"
                >
                  Open in demo <ArrowRight size={12} />
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
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-orange-500">The difference</p>
            <h2 className="text-4xl font-extrabold">Not a chatbot. A persistent AI co-founder for growth.</h2>
          </div>
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <div className="grid grid-cols-4 border-b border-white/8 bg-white/3 px-6 py-4 text-xs font-semibold uppercase tracking-widest">
              <div className="text-white/40">Capability</div>
              <div className="text-center text-white/30">Agency</div>
              <div className="text-center text-white/30">Generic AI</div>
              <div className="text-center text-orange-400">Digital CMO AI</div>
            </div>
            {['Persistent memory of your brand', 'Live data access', 'Multi-module orchestration', 'Brand voice lock', '200+ integrations', 'Marketing-specific skills', 'Demo mode (no setup)', 'Available 24/7'].map((row, i) => (
              <div key={row} className={`grid grid-cols-4 items-center px-6 py-3.5 text-sm ${i % 2 === 0 ? '' : 'bg-white/2'}`}>
                <div className="text-white/60">{row}</div>
                <div className="text-center text-white/20">✗</div>
                <div className="text-center text-white/20">✗</div>
                <div className="text-center text-orange-500">✓</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* USE CASES PREVIEW */}
      <section className="border-t border-white/8 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-orange-500">Real workflows</p>
              <h2 className="text-4xl font-extrabold">What teams use it for.</h2>
            </div>
            <Link to="/use-cases" className="inline-flex items-center gap-2 text-sm font-semibold text-white/60 hover:text-white transition-colors whitespace-nowrap">
              See all 8 workflows <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              { icon: '🏢', title: 'Replace your content agency', outcome: 'Save $6–12K/month', desc: 'Generate a full month of brand-consistent content — blog posts, social, and email — in a single 2-hour session.' },
              { icon: '📉', title: 'Reduce CAC by 30%', outcome: 'Avg. 31% CAC reduction', desc: 'AI identifies your highest-ROI channels, proposes a budget reallocation, and tracks the impact in real time.' },
              { icon: '🧪', title: 'A/B test without a developer', outcome: 'Ship tests in hours', desc: 'Generate 10 distinct variants for any campaign element. AI tracks significance and declares a winner automatically.' },
            ].map((uc) => (
              <Link to="/use-cases" key={uc.title} className="group rounded-2xl border border-white/10 bg-[#111111] p-7 transition-all hover:border-white/20 hover:bg-[#161616]">
                <div className="mb-4 text-3xl">{uc.icon}</div>
                <h3 className="mb-2 font-bold text-white">{uc.title}</h3>
                <p className="mb-4 text-sm leading-relaxed text-white/50">{uc.desc}</p>
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
      <section className="border-t border-white/8 px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <Link to="/white-paper" className="group flex flex-col items-start justify-between gap-6 rounded-2xl border border-white/10 bg-[#111111] p-8 transition-all hover:border-orange-500/30 hover:bg-[#161616] md:flex-row md:items-center">
            <div className="flex items-start gap-5">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-xl">📄</div>
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-orange-500">Free White Paper</p>
                <h3 className="text-xl font-bold text-white">The AI CMO Playbook</h3>
                <p className="mt-1 text-sm text-white/50">How modern growth teams are replacing agency retainers with AI — and what the first 90 days look like.</p>
              </div>
            </div>
            <div className="flex flex-shrink-0 items-center gap-2 rounded-xl border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition-all group-hover:border-orange-500 group-hover:text-orange-400">
              Download free <ArrowRight size={14} />
            </div>
          </Link>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="border-t border-white/8 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-orange-500">Social proof</p>
            <h2 className="text-4xl font-extrabold">What pilot users say.</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { quote: "We cut our weekly reporting time from 6 hours to 20 minutes. I don't know how we managed without it.", name: 'Sarah K.', role: 'Head of Growth, B2B SaaS' },
              { quote: 'It replaced our content agency retainer entirely. Saves $9K a month and the quality is better.', name: 'Marcus T.', role: 'Founder, D2C Brand' },
              { quote: "The memory system is the killer feature. It actually knows my brand. No more re-briefing an AI from scratch.", name: 'Priya M.', role: 'CMO, Growth Stage Startup' },
            ].map((t) => (
              <div key={t.name} className="rounded-2xl border border-white/10 bg-[#111111] p-7">
                <div className="mb-4 text-3xl text-white/15 font-serif">"</div>
                <p className="mb-6 text-base leading-relaxed text-white/70 italic">"{t.quote}"</p>
                <div>
                  <div className="font-semibold text-white">{t.name}</div>
                  <div className="text-sm text-white/40">{t.role}</div>
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
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-orange-500">Industry-specific</p>
            <h2 className="text-4xl font-extrabold">Tailored for how your industry works.</h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-white/50">Pre-loaded with industry-specific KPIs, workflows, compliance guardrails, and integration stacks.</p>
          </div>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {supportedIndustries.map((ind) => (
              <Link key={ind.slug} to={withDomainQuery(`/industries/${ind.slug}`, resolveDomainId(ind.slug))} className="group rounded-xl border border-white/10 bg-[#111111] p-5 text-center transition-all hover:border-white/20 hover:bg-[#161616]">
                <div className="mb-2 text-2xl">{ind.emoji}</div>
                <div className="text-sm font-semibold text-white/80 group-hover:text-white">{ind.shortName}</div>
                <div className="mt-1 text-xs text-white/30">{ind.tagline}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="border-t border-white/8 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-orange-500">Pricing</p>
            <h2 className="text-4xl font-extrabold">Start free. Scale as you grow.</h2>
            <p className="mx-auto mt-4 max-w-lg text-lg text-white/50">Transparent pricing, no hidden fees. Cancel or change plans anytime.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-[#111111] p-8">
              <div className="mb-6">
                <p className="text-sm font-semibold text-white/50">Starter</p>
                <div className="mt-2 flex items-end gap-1"><span className="text-4xl font-extrabold text-white">$0</span><span className="mb-1 text-white/40">/mo</span></div>
                <p className="mt-1 text-xs text-white/30">Free forever</p>
              </div>
              <ul className="mb-8 space-y-3 text-sm">
                {['AI Chat — 50 msg/month', 'Business Analysis (demo data)', 'Creative Studio — 10 gen/month', 'Dashboard & Reporting', 'Email support'].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-white/60"><span className="text-white/30"><Check /></span>{f}</li>
                ))}
              </ul>
              <Link to={demoDashboardHref} className="block w-full rounded-xl border border-white/15 py-3 text-center text-sm font-semibold text-white hover:border-white/30 hover:bg-white/5 transition-colors">Open demo</Link>
            </div>

            <div className="relative rounded-2xl border border-orange-500 bg-[#111111] p-8 shadow-lg shadow-orange-500/10">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-orange-500 px-4 py-1 text-xs font-bold text-black">Most Popular</div>
              <div className="mb-6">
                <p className="text-sm font-semibold text-orange-400">Pro</p>
                <div className="mt-2 flex items-end gap-1"><span className="text-4xl font-extrabold text-white">$149</span><span className="mb-1 text-white/40">/mo</span></div>
                <p className="mt-1 text-xs text-white/30">Billed monthly, cancel anytime</p>
              </div>
              <ul className="mb-8 space-y-3 text-sm">
                {['Unlimited AI Chat', 'Live integrations (5 connectors)', 'Unlimited Creative Generation', 'Full CRM & Campaign Orchestration', 'Advanced Analytics & Forecasting', 'A/B significance testing', 'Priority support'].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-white/70"><span className="text-orange-500"><Check /></span>{f}</li>
                ))}
              </ul>
              <Link to={registerHref} className="block w-full rounded-xl bg-orange-500 py-3 text-center text-sm font-bold text-black hover:bg-orange-400 transition-colors">Create account</Link>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#111111] p-8">
              <div className="mb-6">
                <p className="text-sm font-semibold text-white/50">Enterprise</p>
                <div className="mt-2"><span className="text-4xl font-extrabold text-white">Custom</span></div>
                <p className="mt-1 text-xs text-white/30">Tailored to your scale</p>
              </div>
              <ul className="mb-8 space-y-3 text-sm">
                {['Everything in Pro', 'Unlimited integrations', 'White-label option', 'Custom memory & brand voice', 'Dedicated onboarding + SLA', 'SSO + team management'].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-white/60"><span className="text-white/30"><Check /></span>{f}</li>
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
          <div className="mb-12 text-center"><h2 className="text-4xl font-extrabold">Common questions.</h2></div>
          {faqs.map((faq) => <FAQItem key={faq.q} q={faq.q} a={faq.a} />)}
        </div>
      </section>

      {/* EARLY ACCESS */}
      <section ref={earlyRef} className="border-t border-white/8 px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-white/10 bg-[#111111] p-10 text-center md:p-14">
            <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-orange-500">
              <span className="h-1 w-4 rounded-full bg-orange-500" />Limited early access<span className="h-1 w-4 rounded-full bg-orange-500" />
            </div>
            <h2 className="mt-4 text-3xl font-extrabold md:text-4xl">Get early access before public launch.</h2>
            <p className="mx-auto mt-4 max-w-lg text-white/50">We're onboarding a select group of founders and growth teams. We'll be in touch within 24 hours.</p>
            {earlySuccess ? (
              <div className="mt-8 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-6">
                <p className="font-semibold text-emerald-400">🎉 You're on the list.</p>
                <p className="mt-1 text-sm text-emerald-400/70">We'll reach out within 24 hours. In the meantime, try the demo.</p>
                <Link to={demoDashboardHref} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-bold text-black hover:bg-orange-400 transition-colors">
                  Open demo now <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              <form onSubmit={handleEarlyAccess} className="mt-8">
                <div className="grid gap-4 md:grid-cols-3">
                  <input type="text" required value={earlyName} onChange={(e) => setEarlyName(e.target.value)} placeholder="Your name" className="rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500" />
                  <input type="email" required value={earlyEmail} onChange={(e) => setEarlyEmail(e.target.value)} placeholder="Work email" className="rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500" />
                  <input type="text" value={earlyCompany} onChange={(e) => setEarlyCompany(e.target.value)} placeholder="Company (optional)" className="rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500" />
                </div>
                {earlyError && <p className="mt-3 text-sm text-red-400">{earlyError}</p>}
                <button type="submit" disabled={earlyLoading} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-8 py-3.5 text-sm font-bold text-black hover:bg-orange-400 disabled:opacity-60 transition-colors">
                  {earlyLoading ? 'Submitting…' : <><span>Request Early Access</span><ArrowRight size={14} /></>}
                </button>
                <p className="mt-3 text-xs text-white/30">No spam · Unsubscribe anytime · We read every submission</p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="border-t border-white/8 px-6 py-20 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-4xl font-extrabold md:text-5xl">Ready to replace<br />your agency?</h2>
          <p className="mx-auto mt-5 max-w-lg text-lg text-white/50">The demo is free, instant, and shows you exactly what your first week looks like — without signing up.</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link to={demoDashboardHref} className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-8 py-4 text-base font-bold text-black hover:bg-orange-400 transition-colors shadow-lg shadow-orange-500/20">
              Try the live demo <ArrowRight size={16} />
            </Link>
            <Link to={registerHref} className="inline-flex rounded-xl border border-white/20 px-8 py-4 text-base font-medium text-white hover:border-white/40 hover:bg-white/5 transition-colors">
              Create free account
            </Link>
          </div>
          <p className="mt-4 text-sm text-white/25">No credit card · No agency briefing · Live in 2 minutes</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/8 px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-sm font-bold">Digital CMO AI</span>
          </Link>
          <div className="flex flex-wrap items-center justify-center gap-5 text-sm text-white/40">
            <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
            <Link to="/use-cases" className="hover:text-white transition-colors">Use Cases</Link>
            <Link to="/white-paper" className="hover:text-white transition-colors">White Paper</Link>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <Link to="/login" className="hover:text-white transition-colors">Sign in</Link>
            <Link to={registerHref} className="hover:text-white transition-colors">Register</Link>
          </div>
          <p className="text-xs text-white/20">© 2026 Digital CMO AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
