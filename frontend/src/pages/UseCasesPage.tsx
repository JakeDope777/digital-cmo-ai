import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Rocket,
  BarChart2,
  Users,
  ShieldCheck,
  ShoppingBag,
  Layers,
  FileBarChart,
  ArrowRight,
} from 'lucide-react';
import { trackEvent } from '../services/analytics';

interface UseCase {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  problem: string;
  solution: string;
  metric: string;
  metricColor: string;
}

const USE_CASES: UseCase[] = [
  {
    icon: <Building2 size={22} />,
    iconBg: 'oklch(45% .18 253)',
    title: 'Replace Your Content Agency',
    problem: 'Burning $8K+/mo on an agency that takes 3 weeks to deliver and still needs heavy revisions.',
    solution: 'Full month of on-brand content — blogs, social, emails — generated in hours with your brand voice locked in.',
    metric: 'Save $8K/mo',
    metricColor: '#22c55e',
  },
  {
    icon: <Rocket size={22} />,
    iconBg: 'oklch(45% .18 280)',
    title: 'Launch Campaigns in 48 Hours',
    problem: 'Your agency needs a 3-week briefing cycle just to start. Competitors move while you wait.',
    solution: 'Describe the goal, get a complete campaign — copy, targeting, channel strategy — and publish directly from one interface.',
    metric: '48h vs 3 weeks',
    metricColor: '#3c91ed',
  },
  {
    icon: <BarChart2 size={22} />,
    iconBg: 'oklch(45% .18 320)',
    title: 'Always-On Competitive Intel',
    problem: "Competitive analysis is expensive, slow, and instantly outdated the moment it's delivered.",
    solution: 'Weekly SWOT auto-generated with live competitor data — pricing, positioning, job signals, ad spend — no consultants needed.',
    metric: 'Weekly auto-SWOT',
    metricColor: '#a855f7',
  },
  {
    icon: <Users size={22} />,
    iconBg: 'oklch(45% .16 200)',
    title: 'Scale 10 Clients, 0 New Hires',
    problem: 'Growing your agency means hiring — more account managers, more creatives, more overhead.',
    solution: 'White-label the AI CMO for each client. One operator manages 10 accounts with full brand separation and custom reporting.',
    metric: '3× output',
    metricColor: '#f59e0b',
  },
  {
    icon: <ShieldCheck size={22} />,
    iconBg: 'oklch(40% .14 160)',
    title: 'HIPAA Health Marketing',
    problem: "Healthcare marketing is a compliance minefield — one wrong claim and you're facing regulatory action.",
    solution: 'Compliance-aware copy generation with HIPAA guardrails built in. Legal-safe messaging reviewed and flagged automatically.',
    metric: '0 compliance flags',
    metricColor: '#22c55e',
  },
  {
    icon: <ShoppingBag size={22} />,
    iconBg: 'oklch(45% .18 30)',
    title: 'E-Commerce Seasonal Campaigns',
    problem: "BFCM prep takes months of agency coordination. By the time it's ready, the window has shrunk.",
    solution: 'Auto-generate BFCM, holiday, and seasonal campaign suites — ads, emails, landing pages — in days, not months.',
    metric: '$2.4M revenue tracked',
    metricColor: '#f97316',
  },
  {
    icon: <Layers size={22} />,
    iconBg: 'oklch(45% .16 253)',
    title: 'SaaS Onboarding Sequences',
    problem: 'Generic onboarding emails ignore user segment, activation milestone, and churn risk signals.',
    solution: 'Cohort-personalized onboarding sequences that adapt to user behavior — feature adoption, engagement, and intent signals.',
    metric: '+38% activation rate',
    metricColor: '#3c91ed',
  },
  {
    icon: <FileBarChart size={22} />,
    iconBg: 'oklch(42% .14 340)',
    title: 'Board-Ready Exec Reports',
    problem: 'Compiling the monthly CMO report takes 2 days of pulling data, formatting slides, and writing commentary.',
    solution: 'Auto-generated exec reports with narrative, charts, and recommendations — ready in 15 minutes, not 2 days.',
    metric: '15 min not 2 days',
    metricColor: '#ec4899',
  },
];

export default function UseCasesPage() {
  useEffect(() => {
    void trackEvent('use_cases_view', {});
    document.title = 'Use Cases — Digital CMO AI';
    return () => {
      document.title = 'Digital CMO AI — Your AI-Powered Chief Marketing Officer';
    };
  }, []);

  return (
    <div style={{ background: 'oklch(9% .008 255)', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      {/* Hero */}
      <section className="relative overflow-hidden px-6 py-24 text-center">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{ backgroundImage: 'radial-gradient(circle,#3c91ed0f 1px,#0000 1px)', backgroundSize: '28px 28px' }}
        />
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full opacity-20 blur-[120px]" style={{ background: '#3c91ed' }} />
        </div>
        <div className="relative mx-auto max-w-3xl">
          <span
            className="mb-6 inline-block rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest"
            style={{ background: 'oklch(20% .016 253)', color: '#3c91ed', border: '1px solid oklch(30% .016 253)' }}
          >
            8 proven use cases
          </span>
          <h1
            className="mb-5 text-4xl font-extrabold leading-tight text-white lg:text-5xl"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            What Will You Build<br />with Your AI CMO?
          </h1>
          <p className="mx-auto max-w-xl text-lg text-white/55">
            Real workflows. Real savings. Real results — across industries from SaaS to healthcare to e-commerce.
          </p>
        </div>
      </section>

      {/* Use case cards */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-6">
          {USE_CASES.map((uc, i) => (
            <div
              key={i}
              className="group relative flex flex-col rounded-2xl p-6 transition-all hover:-translate-y-1"
              style={{
                background: 'oklch(13% .008 255)',
                border: '1px solid oklch(24% .008 255)',
              }}
            >
              {/* Icon badge + metric */}
              <div className="flex items-start justify-between mb-4">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl text-white"
                  style={{ background: uc.iconBg }}
                >
                  {uc.icon}
                </div>
                <span
                  className="rounded-full px-3 py-1 text-xs font-bold"
                  style={{ background: `${uc.metricColor}18`, color: uc.metricColor, border: `1px solid ${uc.metricColor}30` }}
                >
                  {uc.metric}
                </span>
              </div>

              {/* Title */}
              <h3 className="mb-4 text-lg font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {uc.title}
              </h3>

              {/* Problem */}
              <div className="mb-3 rounded-lg px-4 py-3" style={{ background: 'oklch(16% .012 20)', border: '1px solid oklch(24% .016 20)' }}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#f87171' }}>Problem</p>
                <p className="text-sm text-white/60">{uc.problem}</p>
              </div>

              {/* Solution */}
              <div className="mb-5 rounded-lg px-4 py-3" style={{ background: 'oklch(14% .012 155)', border: '1px solid oklch(24% .016 155)' }}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#4ade80' }}>Solution</p>
                <p className="text-sm text-white/80">{uc.solution}</p>
              </div>

              {/* CTA */}
              <div className="mt-auto">
                <Link
                  to="/demo"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors hover:gap-2.5"
                  style={{ color: '#3c91ed' }}
                >
                  Try this <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-6 pb-28 text-center">
        <div
          className="mx-auto max-w-2xl rounded-2xl px-8 py-12"
          style={{ background: 'oklch(13% .008 255)', border: '1px solid oklch(24% .008 255)' }}
        >
          <h2 className="mb-3 text-3xl font-extrabold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Which fits you?
          </h2>
          <p className="mb-8 text-white/55">
            Pick a use case and see it in action — no signup required.
          </p>
          <Link
            to="/demo"
            className="inline-flex items-center gap-2 rounded-xl px-8 py-4 text-base font-bold text-white transition-all hover:scale-[1.03]"
            style={{ background: 'oklch(65% .16 253)', boxShadow: '0 0 24px #3c91ed40' }}
          >
            Try demo <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
