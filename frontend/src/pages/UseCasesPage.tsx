import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { trackEvent } from '../services/analytics';

const USE_CASES = [
  {
    icon: '🏢',
    title: 'Replace your content agency',
    problem: 'Spending $8K+ per month on content that takes 3 weeks to deliver and still needs heavy revisions.',
    steps: [
      'Brief your AI CMO on brand voice, audience, and goals in one session',
      'Generate a full month of on-brand blog posts, social captions, and email sequences',
      'Iterate with natural language — "make it punchier" or "add more data points"',
    ],
    outcome: 'Save $6–12K/month. Content ready in hours, not weeks.',
    tag: 'Content',
  },
  {
    icon: '🚀',
    title: 'Launch a campaign in 48 hours',
    problem: 'Your agency needs a 3-week briefing cycle just to start. You need to move faster than that.',
    steps: [
      'Describe the campaign goal: "Drive 200 signups for our new feature launch"',
      'AI generates a campaign brief, channel strategy, ad copy, and targeting recommendations',
      'Publish directly to Google Ads, Meta, and LinkedIn from one interface',
    ],
    outcome: 'Campaign live in 48 hours. No briefing meetings. No back-and-forth.',
    tag: 'Campaign',
  },
  {
    icon: '📉',
    title: 'Reduce CAC by 30%',
    problem: "You're spending across 5 channels but can't tell which one is actually driving revenue.",
    steps: [
      'Connect your ad platforms, CRM, and analytics stack in minutes',
      'AI runs a full attribution analysis and identifies your highest-ROI channels',
      'Get a budget reallocation plan with projected CAC impact before you commit',
    ],
    outcome: 'Avg. 31% CAC reduction within 60 days of reallocation.',
    tag: 'Growth',
  },
  {
    icon: '⚡',
    title: 'Run a full SWOT in 10 minutes',
    problem: 'Competitive intelligence used to mean a consultant, a slide deck, and 3 weeks of waiting.',
    steps: [
      'Enter your company name, target market, and 3 competitors',
      'AI pulls live data: pricing, positioning, reviews, job postings, and ad spend signals',
      'Receive a structured SWOT with actionable recommendations you can act on today',
    ],
    outcome: 'Full competitive brief in under 10 minutes. Updated on demand.',
    tag: 'Analysis',
  },
  {
    icon: '📊',
    title: 'Automate your weekly KPI report',
    problem: 'Every Monday, someone spends 4–6 hours pulling numbers from 6 different tools into a slide deck.',
    steps: [
      'Connect your marketing stack once (Google Ads, Meta, HubSpot, GA4, Stripe)',
      'Set your KPI targets and reporting cadence',
      'AI generates a formatted report every Monday — delivered to Slack or email',
    ],
    outcome: 'Reclaim 200+ hours per year. Reports that actually tell a story.',
    tag: 'Reporting',
  },
  {
    icon: '🧪',
    title: 'A/B test at scale — no developers needed',
    problem: 'Your engineering team queues A/B tests behind product work. Ideas die waiting.',
    steps: [
      'Describe what you want to test: "Subject line variations for our onboarding email"',
      'AI generates 10 statistically distinct variants with predicted impact',
      'Run tests via your email/ad platform, AI tracks significance and declares a winner',
    ],
    outcome: 'Ship tests in hours. Statistical significance calculated automatically.',
    tag: 'Testing',
  },
  {
    icon: '🔥',
    title: 'Recover a failing campaign — before you notice',
    problem: 'By the time you spot a CTR drop in your weekly report, you\'ve already burned $4K on bad spend.',
    steps: [
      'AI monitors your live campaign metrics 24/7 against your targets',
      'When performance drops below threshold, you get an instant alert with root cause',
      'One-click apply the AI\'s reallocation plan or adjust and confirm',
    ],
    outcome: 'Catch underperformance in hours, not weeks. Projected $4,100 recovered per incident.',
    tag: 'Optimisation',
  },
  {
    icon: '🎯',
    title: 'Build buyer personas from your real CRM data',
    problem: 'Your personas are 2-year-old PowerPoint slides that don\'t reflect who actually buys from you.',
    steps: [
      'Connect your CRM and product analytics — AI ingests your actual customer data',
      'Get 3–5 data-driven personas with real attributes, behaviours, and objections',
      'Personas update automatically as new customers come in — always current',
    ],
    outcome: 'Campaigns built on real data convert 2–3× better than template personas.',
    tag: 'CRM',
  },
];

const TAG_COLORS: Record<string, string> = {
  Content: 'bg-violet-500/15 text-violet-300',
  Campaign: 'bg-orange-500/15 text-orange-300',
  Growth: 'bg-emerald-500/15 text-emerald-300',
  Analysis: 'bg-blue-500/15 text-blue-300',
  Reporting: 'bg-amber-500/15 text-amber-300',
  Testing: 'bg-cyan-500/15 text-cyan-300',
  Optimisation: 'bg-rose-500/15 text-rose-300',
  CRM: 'bg-pink-500/15 text-pink-300',
};

export default function UseCasesPage() {
  useEffect(() => {
    void trackEvent('use_cases_view', {});
    document.title = 'Use Cases — Digital CMO AI';
    return () => {
      document.title = 'Digital CMO AI — Your AI Chief Marketing Officer';
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* ── Nav ── */}
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
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <Link to="/use-cases" className="text-white">Use Cases</Link>
            <Link to="/white-paper" className="hover:text-white transition-colors">White Paper</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/demo" className="hidden sm:inline-flex rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white hover:border-white/40 hover:bg-white/5 transition-colors">
              Try demo
            </Link>
            <Link to="/register" className="inline-flex rounded-lg bg-orange-500 px-4 py-2 text-sm font-bold text-black hover:bg-orange-400 transition-colors">
              Start free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-white/8 px-6 py-20 text-center">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-64 w-96 -translate-x-1/2 rounded-full bg-orange-500/8 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/60">
            8 proven workflows · Usable from day one
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight md:text-6xl">
            Real workflows.{' '}
            <span className="text-orange-500">Real results.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-white/60">
            Not hypothetical features. These are prompts you can run on your first session — each one replacing hours of manual work or thousands in agency fees.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/demo"
              className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-bold text-black hover:bg-orange-400 transition-colors"
            >
              Try any workflow in the demo
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
            <Link
              to="/register"
              className="inline-flex rounded-xl border border-white/20 px-6 py-3 text-sm font-medium text-white hover:border-white/40 hover:bg-white/5 transition-colors"
            >
              Create free account
            </Link>
          </div>
        </div>
      </section>

      {/* ── Use Cases Grid ── */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-6 md:grid-cols-2">
          {USE_CASES.map((uc) => (
            <div
              key={uc.title}
              className="group relative rounded-2xl border border-white/10 bg-[#111111] p-8 transition-all duration-300 hover:border-white/20 hover:bg-[#161616]"
            >
              {/* Tag */}
              <span className={`mb-4 inline-block rounded-full px-3 py-1 text-xs font-semibold ${TAG_COLORS[uc.tag]}`}>
                {uc.tag}
              </span>

              {/* Icon + Title */}
              <div className="mb-3 flex items-start gap-3">
                <span className="text-3xl leading-none">{uc.icon}</span>
                <h2 className="text-xl font-bold text-white leading-tight">{uc.title}</h2>
              </div>

              {/* Problem */}
              <p className="mb-5 text-sm text-white/50 italic">"{uc.problem}"</p>

              {/* Steps */}
              <ol className="mb-6 space-y-2.5">
                {uc.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-white/70">
                    <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white/60">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>

              {/* Outcome */}
              <div className="flex items-center justify-between border-t border-white/8 pt-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-orange-400">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                    <polyline points="16 7 22 7 22 13" />
                  </svg>
                  {uc.outcome}
                </div>
                <Link
                  to="/demo"
                  className="text-xs font-medium text-white/40 hover:text-orange-400 transition-colors"
                >
                  Try it →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="border-t border-white/8 px-6 py-20 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-3xl font-extrabold md:text-4xl">
            Which workflow will you run first?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-lg text-white/60">
            All 8 workflows are available in the free demo — no login required, no credit card, no setup. Just results.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/demo"
              className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-8 py-4 text-base font-bold text-black hover:bg-orange-400 transition-colors shadow-lg shadow-orange-500/20"
            >
              Open the live demo
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
            <Link
              to="/register"
              className="inline-flex rounded-xl border border-white/20 px-8 py-4 text-base font-medium text-white hover:border-white/40 hover:bg-white/5 transition-colors"
            >
              Create free account
            </Link>
          </div>
          <p className="mt-5 text-sm text-white/30">No credit card · Live in under 2 minutes · Cancel anytime</p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/8 px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-sm font-bold">Digital CMO AI</span>
          </div>
          <div className="flex flex-wrap items-center gap-5 text-sm text-white/40">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <Link to="/use-cases" className="hover:text-white transition-colors">Use Cases</Link>
            <Link to="/white-paper" className="hover:text-white transition-colors">White Paper</Link>
            <Link to="/login" className="hover:text-white transition-colors">Sign in</Link>
            <Link to="/register" className="hover:text-white transition-colors">Register</Link>
          </div>
          <p className="text-xs text-white/20">© 2026 Digital CMO AI</p>
        </div>
      </footer>
    </div>
  );
}
