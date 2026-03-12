import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, Clock, TrendingUp, Target, ArrowRight, Zap, ChevronRight } from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(n: number, decimals = 0) {
  return n.toLocaleString('en-US', { maximumFractionDigits: decimals });
}

function fmtDollar(n: number) {
  if (n >= 1000) return `$${fmt(Math.round(n / 100) * 100)}`;
  return `$${fmt(n)}`;
}

// ── Slider ───────────────────────────────────────────────────────────────────
interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}

function Slider({ label, value, min, max, step, format, onChange }: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.65)' }}>{label}</label>
        <span className="text-sm font-bold" style={{ color: '#3c91ed' }}>{format(value)}</span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #3c91ed ${pct}%, rgba(255,255,255,0.1) ${pct}%)`,
            WebkitAppearance: 'none',
          }}
        />
      </div>
      <div className="mt-1 flex justify-between text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  );
}

// ── Case Study Card ───────────────────────────────────────────────────────────
interface CaseStudy {
  company: string;
  desc: string;
  metric: string;
  metricLabel: string;
  gradient: string;
  initials: string;
}

const CASE_STUDIES: CaseStudy[] = [
  {
    company: 'Velour Commerce',
    desc: 'Replaced $12K/mo agency. 47 hours/week saved. Campaign output tripled with two-person team.',
    metric: '+340%',
    metricLabel: 'ROAS improvement',
    gradient: 'from-blue-500 to-violet-600',
    initials: 'VC',
  },
  {
    company: 'Crux Digital Agency',
    desc: '12 new clients onboarded without new hires. White-label reports shipped in minutes, not days.',
    metric: '3.2×',
    metricLabel: 'Revenue per employee',
    gradient: 'from-violet-500 to-pink-600',
    initials: 'CD',
  },
  {
    company: 'ClearPath Health',
    desc: 'Patient acquisition cost dropped 34% in 90 days. HIPAA-compliant copy shipped in hours.',
    metric: '$89K',
    metricLabel: 'Saved in Q1',
    gradient: 'from-sky-500 to-blue-600',
    initials: 'CP',
  },
];

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ROICalculatorPage() {
  const [agencySpend, setAgencySpend] = useState(15000);
  const [teamSize, setTeamSize] = useState(8);
  const [hoursPerWeek, setHoursPerWeek] = useState(25);
  const [hourlyRate, setHourlyRate] = useState(150);

  useEffect(() => {
    document.title = 'ROI Calculator — Digital CMO AI';
    return () => { document.title = 'Digital CMO AI'; };
  }, []);

  const results = useMemo(() => {
    const agencySavings = agencySpend * 0.65;
    const timeSavingsMonthly = hoursPerWeek * 0.7 * hourlyRate * 4;
    const totalSavings = agencySavings + timeSavingsMonthly;
    const PLAN_COST = 299;
    const roi = ((totalSavings - PLAN_COST) / PLAN_COST) * 100;
    const payback = PLAN_COST / (totalSavings / 30);
    const hoursSaved = hoursPerWeek * 0.7;
    return { agencySavings, timeSavingsMonthly, totalSavings, roi, payback, hoursSaved };
  }, [agencySpend, hoursPerWeek, hourlyRate]);

  return (
    <div className="min-h-screen text-white" style={{ background: 'oklch(9% .008 255)' }}>
      {/* Slider track styles */}
      <style>{`
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px; height: 18px;
          border-radius: 50%;
          background: #3c91ed;
          box-shadow: 0 0 8px #3c91ed80;
          cursor: pointer;
          border: 2px solid white;
        }
        input[type=range]::-moz-range-thumb {
          width: 18px; height: 18px;
          border-radius: 50%;
          background: #3c91ed;
          box-shadow: 0 0 8px #3c91ed80;
          cursor: pointer;
          border: 2px solid white;
        }
      `}</style>

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 border-b backdrop-blur-xl" style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'oklch(9% .008 255 / 0.85)' }}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: 'oklch(65% .16 253)', boxShadow: '0 0 16px #3c91ed4d' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-sm font-bold tracking-tight text-white">Digital CMO AI</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <Link to="/use-cases" className="hover:text-white transition-colors">Use Cases</Link>
            <Link to="/roi-calculator" className="font-semibold" style={{ color: '#3c91ed' }}>ROI Calculator</Link>
            <Link to="/whitepaper" className="hover:text-white transition-colors">White Paper</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm transition-colors px-3 py-2" style={{ color: 'rgba(255,255,255,0.55)' }}>Sign in</Link>
            <Link to="/register" className="rounded-lg px-4 py-2 text-sm font-bold text-white transition-all hover:scale-[1.02]" style={{ background: 'oklch(65% .16 253)', boxShadow: '0 0 16px #3c91ed30' }}>
              Register free →
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden px-6 py-20 text-center border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 -top-20 h-[400px] w-[700px] -translate-x-1/2 rounded-full opacity-20 blur-[100px]" style={{ background: '#3c91ed' }} />
          <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle,#3c91ed0d 1px,#0000 1px)', backgroundSize: '28px 28px' }} />
        </div>
        <div className="relative mx-auto max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold" style={{ borderColor: '#3c91ed40', background: '#3c91ed10', color: '#3c91ed' }}>
            <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: '#3c91ed' }} />
            Live ROI Calculator
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight md:text-6xl">
            Calculate your savings<br />
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #3c91ed 0%, #7c3aed 100%)' }}>
              vs. hiring a CMO or agency
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Move the sliders to see how much Digital CMO AI saves your team — in real dollars and real hours.
          </p>
        </div>
      </section>

      {/* ── Calculator ── */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left: Inputs */}
          <div className="rounded-2xl p-8 space-y-8" style={{ background: 'oklch(13% .008 255)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Your current marketing spend</h2>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Drag the sliders to match your situation.</p>
            </div>

            <Slider
              label="Current monthly agency spend"
              value={agencySpend}
              min={0}
              max={50000}
              step={500}
              format={v => `$${fmt(v)}`}
              onChange={setAgencySpend}
            />
            <Slider
              label="Team size"
              value={teamSize}
              min={1}
              max={50}
              step={1}
              format={v => `${v} people`}
              onChange={setTeamSize}
            />
            <Slider
              label="Hours/week on marketing ops"
              value={hoursPerWeek}
              min={1}
              max={80}
              step={1}
              format={v => `${v} hrs/wk`}
              onChange={setHoursPerWeek}
            />
            <Slider
              label="Your average hourly rate"
              value={hourlyRate}
              min={50}
              max={500}
              step={10}
              format={v => `$${v}/hr`}
              onChange={setHourlyRate}
            />

            <div className="rounded-xl p-4 text-sm" style={{ background: 'rgba(60,145,237,0.08)', border: '1px solid rgba(60,145,237,0.2)' }}>
              <p style={{ color: 'rgba(255,255,255,0.6)' }}>
                Based on <strong style={{ color: 'white' }}>Growth plan at $299/mo</strong>. AI replaces ~65% of agency work and saves ~70% of marketing ops time.
              </p>
            </div>
          </div>

          {/* Right: Results */}
          <div className="rounded-2xl p-8 flex flex-col justify-between" style={{ background: 'oklch(13% .008 255)', border: '1px solid #3c91ed40', boxShadow: '0 0 40px #3c91ed18' }}>
            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color: '#3c91ed' }}>Your projected results</div>
              <h2 className="text-xl font-bold text-white mb-6">With Digital CMO AI</h2>

              {/* Big savings number */}
              <div className="mb-8 text-center py-6 rounded-xl" style={{ background: 'rgba(60,145,237,0.08)', border: '1px solid rgba(60,145,237,0.2)' }}>
                <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Monthly savings</div>
                <div className="text-6xl font-extrabold" style={{ color: '#3c91ed' }}>
                  {fmtDollar(results.totalSavings)}
                </div>
                <div className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>per month</div>
              </div>

              {/* Metrics grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  {
                    icon: <Clock size={18} />,
                    label: 'Hours saved',
                    value: `${fmt(results.hoursSaved, 1)} hrs/wk`,
                    color: '#a78bfa',
                  },
                  {
                    icon: <TrendingUp size={18} />,
                    label: 'ROI on $299/mo',
                    value: `${fmt(results.roi, 0)}×`,
                    color: '#34d399',
                  },
                  {
                    icon: <Target size={18} />,
                    label: 'Payback period',
                    value: `${fmt(results.payback, 1)} days`,
                    color: '#fb923c',
                  },
                  {
                    icon: <DollarSign size={18} />,
                    label: 'Annual savings',
                    value: fmtDollar(results.totalSavings * 12),
                    color: '#f472b6',
                  },
                ].map((m) => (
                  <div key={m.label} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="flex items-center gap-2 mb-1" style={{ color: m.color }}>
                      {m.icon}
                      <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.45)' }}>{m.label}</span>
                    </div>
                    <div className="text-xl font-extrabold text-white">{m.value}</div>
                  </div>
                ))}
              </div>

              {/* Breakdown */}
              <div className="space-y-2 text-sm mb-6">
                <div className="flex justify-between" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  <span>Agency spend replaced (65%)</span>
                  <span className="font-semibold text-white">{fmtDollar(results.agencySavings)}/mo</span>
                </div>
                <div className="flex justify-between" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  <span>Time savings ({fmt(results.hoursSaved, 1)} hrs/wk × {fmt(hoursPerWeek * 4)} hrs/mo)</span>
                  <span className="font-semibold text-white">{fmtDollar(results.timeSavingsMonthly)}/mo</span>
                </div>
                <div className="flex justify-between border-t pt-2" style={{ borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}>
                  <span>Digital CMO AI Growth plan</span>
                  <span className="font-semibold" style={{ color: '#f87171' }}>−$299/mo</span>
                </div>
              </div>
            </div>

            {/* CTA */}
            <Link
              to="/register"
              className="block w-full rounded-xl py-4 text-center text-base font-bold text-white transition-all hover:scale-[1.02]"
              style={{ background: 'oklch(65% .16 253)', boxShadow: '0 0 24px #3c91ed30' }}
            >
              Start saving {fmtDollar(results.totalSavings)}/month today →
              <span className="block text-xs font-normal mt-0.5 opacity-80">Try free for 14 days · No credit card</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA Banner ── */}
      <section className="mx-auto max-w-4xl px-6 pb-8">
        <div className="rounded-2xl p-8 text-center" style={{ background: 'oklch(13% .008 255)', border: '1px solid rgba(60,145,237,0.25)', boxShadow: '0 0 40px #3c91ed12' }}>
          <Zap size={24} className="mx-auto mb-3" style={{ color: '#3c91ed' }} />
          <h2 className="text-2xl font-extrabold mb-2">
            Start saving {fmtDollar(results.totalSavings)}/month today
          </h2>
          <p className="mb-6 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Try free for 14 days. No credit card. No agency briefing. Live in 15 minutes.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register" className="inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-bold text-white transition-all hover:scale-[1.03]" style={{ background: 'oklch(65% .16 253)', boxShadow: '0 0 20px #3c91ed30' }}>
              <Zap size={15} fill="currentColor" /> Try free for 14 days
            </Link>
            <Link to="/demo" className="inline-flex items-center gap-2 rounded-xl border px-8 py-3.5 text-sm font-medium text-white hover:bg-white/5 transition-all" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
              See live demo <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Case Studies ── */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="mb-10 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color: '#3c91ed' }}>Real results</p>
          <h2 className="text-3xl font-extrabold">Teams already saving at scale</h2>
          <p className="mt-3 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>These numbers are from real customers, not projections.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {CASE_STUDIES.map((cs) => (
            <div
              key={cs.company}
              className="rounded-2xl p-7 flex flex-col transition-all hover:-translate-y-1"
              style={{ background: 'oklch(13% .008 255)', border: '1px solid rgba(60,145,237,0.15)', boxShadow: '0 0 0 1px rgba(60,145,237,0.08)' }}
            >
              {/* Avatar + company */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${cs.gradient} text-xs font-bold text-white`}>
                  {cs.initials}
                </div>
                <div>
                  <div className="font-bold text-white">{cs.company}</div>
                  <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Verified customer</div>
                </div>
              </div>

              <p className="flex-1 text-sm leading-relaxed mb-5" style={{ color: 'rgba(255,255,255,0.65)' }}>{cs.desc}</p>

              {/* Metric */}
              <div className="flex items-center justify-between border-t pt-4" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                <div>
                  <div className="text-2xl font-extrabold" style={{ color: '#3c91ed' }}>{cs.metric}</div>
                  <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{cs.metricLabel}</div>
                </div>
                <Link to="/demo" className="flex items-center gap-1 text-xs font-medium transition-colors hover:text-white" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  See how <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t px-6 py-10" style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'oklch(7% .006 255)' }}>
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: 'oklch(65% .16 253)' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-sm font-bold">Digital CMO AI</span>
          </div>
          <div className="flex flex-wrap items-center gap-5 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <Link to="/use-cases" className="hover:text-white transition-colors">Use Cases</Link>
            <Link to="/roi-calculator" className="hover:text-white transition-colors">ROI Calculator</Link>
            <Link to="/whitepaper" className="hover:text-white transition-colors">White Paper</Link>
            <Link to="/login" className="hover:text-white transition-colors">Sign in</Link>
            <Link to="/register" className="hover:text-white transition-colors">Register</Link>
          </div>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>© 2026 Digital CMO AI</p>
        </div>
      </footer>
    </div>
  );
}
