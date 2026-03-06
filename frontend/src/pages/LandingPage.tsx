import { ArrowRight, BarChart3, Bot, CreditCard, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  {
    icon: Bot,
    title: 'AI Campaign Operator',
    description: 'Generate channel-ready strategy, copy, and execution plans in minutes.',
  },
  {
    icon: BarChart3,
    title: 'Live Performance View',
    description: 'Track spend, conversion efficiency, and funnel velocity from one dashboard.',
  },
  {
    icon: CreditCard,
    title: 'Built-in Billing Control',
    description: 'Manage plan, invoices, and payment method without leaving the platform.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Team Access',
    description: 'Role-based account and profile settings for operators and leadership.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#fed7aa,_transparent_45%),radial-gradient(circle_at_bottom_left,_#fde68a,_transparent_35%),linear-gradient(180deg,_#ffffff,_#f8fafc)]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-orange-300/50">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">CMO AI Buddy</p>
            <p className="text-xs text-slate-500">Digital CMO OS</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/login" className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-white/70">
            Login
          </Link>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-slate-400/30"
          >
            Start Free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-16 pt-8">
        <section className="grid items-center gap-10 md:grid-cols-2">
          <div className="space-y-6">
            <p className="inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
              Built for founders, operators, and growth teams
            </p>
            <h1 className="text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
              Launch and scale marketing with an AI CMO partner.
            </h1>
            <p className="text-base text-slate-600 md:text-lg">
              From strategy to execution and reporting, CMO AI Buddy helps your team move faster with
              less overhead and better visibility.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-300/60 transition hover:bg-orange-600"
              >
                Create Workspace
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/login" className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Open Dashboard
              </Link>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-900 p-6 text-white shadow-2xl shadow-slate-400/30">
            <p className="text-xs uppercase tracking-[0.2em] text-orange-300">Live Snapshot</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-white/10 p-4">
                <p className="text-xs text-slate-300">Pipeline Revenue</p>
                <p className="mt-2 text-2xl font-bold">$248,000</p>
              </div>
              <div className="rounded-xl bg-white/10 p-4">
                <p className="text-xs text-slate-300">CAC Trend</p>
                <p className="mt-2 text-2xl font-bold">-12.4%</p>
              </div>
              <div className="rounded-xl bg-white/10 p-4">
                <p className="text-xs text-slate-300">Campaigns Running</p>
                <p className="mt-2 text-2xl font-bold">14</p>
              </div>
              <div className="rounded-xl bg-white/10 p-4">
                <p className="text-xs text-slate-300">SQL This Month</p>
                <p className="mt-2 text-2xl font-bold">87</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16 grid gap-4 sm:grid-cols-2">
          {features.map(({ icon: Icon, title, description }) => (
            <article key={title} className="rounded-2xl border border-slate-200 bg-white/85 p-6 shadow-sm">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm text-slate-600">{description}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
