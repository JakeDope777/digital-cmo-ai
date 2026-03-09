import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { growthService } from '../services/api';
import { getStoredUtm, trackEvent } from '../services/analytics';

export default function WhitePaperPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void trackEvent('white_paper_view', {});
    document.title = 'The AI CMO Playbook — Digital CMO AI';
    return () => {
      document.title = 'Digital CMO AI — Your AI Chief Marketing Officer';
    };
  }, []);

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);
    try {
      const utm = getStoredUtm();
      await growthService.joinWaitlist({
        name: name.trim(),
        email: email.trim(),
        company: company.trim() || undefined,
        source: 'white_paper',
        ...utm,
      });
      void trackEvent('white_paper_download', { email: email.trim() });
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

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
            <Link to="/use-cases" className="hover:text-white transition-colors">Use Cases</Link>
            <Link to="/white-paper" className="text-white">White Paper</Link>
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

      {/* ── Hero / Cover ── */}
      <section className="relative overflow-hidden border-b border-white/8 px-6 py-16">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-orange-500/6 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/60">Research Report · March 2026</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/60">12 min read</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/60">Free Download</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight md:text-6xl leading-tight">
            The AI CMO Playbook
          </h1>
          <p className="mt-4 text-xl text-white/60 max-w-2xl">
            How modern growth teams are replacing agency retainers with AI — and what the first 90 days look like.
          </p>
          <p className="mt-3 text-sm text-white/40">By the Digital CMO AI Research Team · March 2026</p>

          <div className="mt-8 flex flex-wrap gap-4">
            <button
              onClick={scrollToForm}
              className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-bold text-black hover:bg-orange-400 transition-colors shadow-lg shadow-orange-500/20"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download the PDF
            </button>
            <Link to="/demo" className="inline-flex rounded-xl border border-white/20 px-6 py-3 text-sm font-medium text-white hover:border-white/40 hover:bg-white/5 transition-colors">
              Try the demo instead →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Content ── */}
      <div className="mx-auto max-w-4xl px-6 py-16 space-y-16">

        {/* Executive Summary */}
        <section>
          <div className="mb-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-white/10" />
            <span className="text-xs font-semibold uppercase tracking-widest text-white/30">Executive Summary</span>
            <span className="h-px flex-1 bg-white/10" />
          </div>
          <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-8">
            <p className="text-lg leading-relaxed text-white/80">
              The average B2B marketing team spends <span className="font-bold text-orange-400">$180,000 per year</span> on agency retainers and <span className="font-bold text-orange-400">14 hours per week</span> on manual reporting — and still can't tell which channel is actually driving revenue.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-white/80">
              A new category of AI-native marketing tools is changing this equation. In this playbook, we document how growth teams are replacing traditional agency models with persistent AI systems that know their brand, act on live data, and generate execution-ready plans in minutes instead of weeks.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-white/80">
              This is not a speculative report about AI's future in marketing. It's a practical guide, grounded in real implementation patterns, for teams ready to make the switch today.
            </p>
          </div>
        </section>

        {/* Chapter 1 */}
        <section>
          <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-orange-500">Chapter 1</div>
          <h2 className="mb-6 text-3xl font-extrabold">The Agency Problem</h2>

          <p className="text-lg leading-relaxed text-white/70">
            The traditional marketing agency model was designed for a slower world — one where campaigns took months to produce, data arrived in weekly reports, and "digital" meant a website and email newsletter.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-white/70">
            In 2026, that model is fundamentally broken. Markets move in days. Platforms update their algorithms weekly. And the data you need to make good decisions lives across 12 disconnected tools that don't talk to each other.
          </p>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {[
              { stat: '14 hrs/week', label: 'Lost to manual reporting', sub: 'Per marketing FTE, on average' },
              { stat: '$180K/yr', label: 'Average agency retainer', sub: 'For a mid-market growth team' },
              { stat: '63%', label: 'Campaigns underperform', sub: 'Due to stale data and slow iteration' },
            ].map((item) => (
              <div key={item.stat} className="rounded-xl border border-white/10 bg-[#111111] p-6 text-center">
                <div className="text-4xl font-extrabold text-orange-500">{item.stat}</div>
                <div className="mt-2 font-semibold text-white">{item.label}</div>
                <div className="mt-1 text-sm text-white/40">{item.sub}</div>
              </div>
            ))}
          </div>

          <p className="mt-8 text-lg leading-relaxed text-white/70">
            The agency model also has a fundamental misalignment of incentives. Agencies bill for hours, not outcomes. A campaign that takes longer costs more — even if the extra time produced worse results. The model optimises for billings, not for your revenue.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-white/70">
            AI doesn't have a billing rate. It doesn't have a minimum retainer. And it doesn't need three weeks to revise a brief because you changed your tone requirements.
          </p>
        </section>

        {/* PDF Download Form */}
        <div ref={formRef}>
          <div className="rounded-2xl border border-white/15 bg-[#111111] p-8">
            {submitted ? (
              <div className="text-center py-4">
                <div className="mb-4 text-4xl">📧</div>
                <h3 className="text-xl font-bold text-white">It's on its way.</h3>
                <p className="mt-2 text-white/60">
                  The AI CMO Playbook PDF is headed to <span className="font-semibold text-orange-400">{email}</span>. Check your inbox — it should arrive within 24 hours.
                </p>
                <p className="mt-6 text-sm text-white/40">While you wait —</p>
                <Link
                  to="/demo"
                  className="mt-3 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-bold text-black hover:bg-orange-400 transition-colors"
                >
                  Try the live demo →
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/15">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Download the full PDF</h3>
                      <p className="text-sm text-white/50">The AI CMO Playbook · Free · No spam</p>
                    </div>
                  </div>
                </div>
                <form onSubmit={handleDownload} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-white/70">Your name</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Alex Johnson"
                        className="w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-white/70">Work email</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        className="w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-white/70">Company <span className="text-white/30">(optional)</span></label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Acme Corp"
                      className="w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                  {error && (
                    <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-bold text-black hover:bg-orange-400 disabled:opacity-60 transition-colors"
                  >
                    {loading ? (
                      <><svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Sending…</>
                    ) : (
                      <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>Send me the PDF</>
                    )}
                  </button>
                  <p className="text-center text-xs text-white/30">No spam · Unsubscribe anytime · We read every reply</p>
                </form>
              </>
            )}
          </div>
        </div>

        {/* Chapter 2 */}
        <section>
          <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-orange-500">Chapter 2</div>
          <h2 className="mb-6 text-3xl font-extrabold">The AI CMO Framework</h2>

          <p className="text-lg leading-relaxed text-white/70">
            An effective AI CMO is more than a chatbot with marketing knowledge. It requires four foundational layers that work together to produce execution-ready plans — not just information.
          </p>

          <div className="mt-8 space-y-4">
            {[
              {
                n: '01',
                title: '4-Layer Persistent Memory',
                desc: 'Context window for active sessions, a structured folder store for brand assets and historical campaigns, vector embeddings for semantic search across past work, and a relational database for structured data. Together, they mean the AI never forgets your brand voice, your best-performing campaigns, or your goals.',
              },
              {
                n: '02',
                title: '6 Specialised Marketing Modules',
                desc: 'Rather than a single general model trying to do everything, the AI CMO routes requests to specialist modules: Business Analysis (SWOT, competitor intel), Creative Studio (copy, A/B variants), CRM & Campaigns (lead scoring, journey mapping), Analytics & Reporting (KPI dashboards, forecasting), Growth (funnel analysis, UTM attribution), and Integrations (200+ platform connectors).',
              },
              {
                n: '03',
                title: 'Live Data Access',
                desc: 'Native connectors to your ad platforms, CRM, analytics, and revenue data. The AI doesn\'t work from your last export — it works from what\'s happening right now. This means it can detect a CTR drop in real time and propose a reallocation before you even open your dashboard.',
              },
              {
                n: '04',
                title: 'Conversational Execution',
                desc: 'Strategy and execution happen in the same interface. You don\'t get a PDF with recommendations — you get a plan you can execute with one click. "Apply the budget reallocation" is a button, not a task for your team to action manually.',
              },
            ].map((item) => (
              <div key={item.n} className="flex gap-5 rounded-xl border border-white/10 bg-[#111111] p-6">
                <div className="flex-shrink-0 text-2xl font-extrabold text-orange-500/40">{item.n}</div>
                <div>
                  <h3 className="font-bold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Chapter 3 */}
        <section>
          <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-orange-500">Chapter 3</div>
          <h2 className="mb-6 text-3xl font-extrabold">5 Real-World Applications</h2>

          <p className="mb-8 text-lg leading-relaxed text-white/70">
            These examples are drawn from teams using Digital CMO AI in production. Metrics are illustrative of typical outcomes rather than guaranteed results.
          </p>

          <div className="space-y-6">
            {[
              {
                title: 'B2B SaaS — Eliminating the Agency Retainer',
                context: 'A 12-person SaaS team was spending $9,500/month on a content agency for blog posts, social media, and email campaigns.',
                action: 'Switched to Digital CMO AI for all content generation. Brand voice trained in one session. First month of content generated in 4 hours.',
                result: 'Saved $9,500/month. Content output increased 3×. Email open rates improved 18% due to better A/B testing cadence.',
              },
              {
                title: 'D2C Brand — 48-Hour Campaign Launch',
                context: 'A product launch was announced internally with 4 days\' notice. The agency needed 3 weeks minimum for a campaign brief.',
                action: 'Campaign brief, ad copy (12 variants), landing page copy, and email sequence generated in a single 2-hour session.',
                result: 'Campaign live in 48 hours. First-week ROAS of 4.2× against a 3.5× target. Zero agency involvement.',
              },
              {
                title: 'Growth-Stage Startup — CAC Reduction',
                context: 'Marketing spend was split evenly across Google, Meta, and LinkedIn. No clear attribution data to know which was working.',
                action: 'Connected all three platforms plus CRM. AI ran attribution analysis and identified LinkedIn as 6× more efficient per closed deal.',
                result: 'Reallocated 40% of budget to LinkedIn. CAC dropped 34% in 60 days. Revenue per marketing dollar increased 2.1×.',
              },
              {
                title: 'Agency — White-Label Delivery',
                context: 'A boutique marketing agency wanted to scale delivery without scaling headcount.',
                action: 'Deployed Digital CMO AI as a white-label tool for 6 clients. Each client gets their own memory, brand voice, and integration set.',
                result: 'Agency now serves 6 clients with the same team that previously served 3. Average client report time reduced from 6 hours to 25 minutes.',
              },
              {
                title: 'Enterprise — Automated KPI Reporting',
                context: 'Weekly board reporting required a team member to spend 8 hours pulling data from HubSpot, Google Ads, Meta, GA4, and Stripe.',
                action: 'Connected all five platforms. Configured a weekly report template. AI now generates the report every Sunday night.',
                result: '8 hours reclaimed per week. Report quality improved — AI consistently surfaces insights the manual process missed.',
              },
            ].map((item, i) => (
              <div key={i} className="rounded-xl border border-white/10 bg-[#111111] p-6">
                <h3 className="font-bold text-white">{item.title}</h3>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  {[
                    { label: 'Context', text: item.context },
                    { label: 'Action', text: item.action },
                    { label: 'Result', text: item.result },
                  ].map((col) => (
                    <div key={col.label}>
                      <div className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-white/30">{col.label}</div>
                      <p className="text-sm leading-relaxed text-white/70">{col.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Chapter 4 */}
        <section>
          <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-orange-500">Chapter 4</div>
          <h2 className="mb-6 text-3xl font-extrabold">Your 30-Day Implementation Roadmap</h2>

          <p className="mb-8 text-lg leading-relaxed text-white/70">
            Most teams are fully operational within 30 days. Here's the typical path from first login to full replacement of agency workflows.
          </p>

          <div className="space-y-4">
            {[
              {
                week: 'Week 1',
                title: 'Connect & Configure',
                tasks: [
                  'Connect your top 2–3 marketing platforms (takes 15 minutes each)',
                  'Train the AI on your brand voice: paste your best-performing content',
                  'Set your primary KPI targets and CAC/LTV benchmarks',
                  'Run your first SWOT analysis on your category',
                ],
              },
              {
                week: 'Week 2',
                title: 'First Production Output',
                tasks: [
                  'Generate your first month of social media content',
                  'Run a budget attribution analysis — identify your best channel',
                  'Create 5 A/B variants for your highest-traffic email',
                  'Set up your first automated KPI report',
                ],
              },
              {
                week: 'Week 3',
                title: 'Campaign Launch',
                tasks: [
                  'Brief and launch your first AI-generated campaign end-to-end',
                  'Enable real-time performance monitoring',
                  'Generate buyer personas from your CRM data',
                  'Begin winding down agency contracts for tasks now covered',
                ],
              },
              {
                week: 'Week 4',
                title: 'Optimise & Scale',
                tasks: [
                  'Review AI recommendations against actual outcomes',
                  'Expand integrations to cover your full stack',
                  'Document which agency workflows are fully replaced',
                  'Calculate month-one ROI and set 90-day targets',
                ],
              },
            ].map((week) => (
              <div key={week.week} className="flex gap-5 rounded-xl border border-white/10 bg-[#111111] p-6">
                <div className="flex-shrink-0">
                  <div className="inline-flex h-10 w-16 items-center justify-center rounded-lg bg-orange-500/10 text-xs font-bold text-orange-400">{week.week}</div>
                </div>
                <div>
                  <h3 className="font-bold text-white">{week.title}</h3>
                  <ul className="mt-3 space-y-2">
                    {week.tasks.map((task) => (
                      <li key={task} className="flex items-start gap-2 text-sm text-white/60">
                        <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        {task}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-10 text-center">
          <h2 className="text-3xl font-extrabold">Ready to start your 30-day transition?</h2>
          <p className="mx-auto mt-4 max-w-lg text-white/60">
            The demo is free, takes under 2 minutes to access, and gives you a full picture of every workflow in this playbook.
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
          <p className="mt-5 text-sm text-white/30">No credit card · No agency briefing · Live in 2 minutes</p>
        </section>
      </div>

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
