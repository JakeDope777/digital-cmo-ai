import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  BarChart2,
  Loader2,
  RefreshCw,
  Sparkles,
  X,
  ChevronRight,
  Zap,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { analyticsService, growthService } from '../services/api';
import type { ChartData, DashboardMetrics } from '../types';
import { trackOnboardingStep } from '../services/analytics';
import { useDemoMode } from '../context/DemoModeContext';

const defaults: DashboardMetrics = {
  total_leads: 342,
  new_leads_period: 47,
  total_spend: 12450.0,
  conversions: 28,
  conversion_rate: 4.2,
  cac: 125.5,
  ltv: 1250.0,
  roas: 5.3,
  ctr: 3.1,
  impressions: 125000,
  clicks: 3875,
  email_open_rate: 24.5,
  email_click_rate: 4.8,
};

const DEMO_SPEND: { date: string; spend: number }[] = [
  { date: 'Oct', spend: 7200 },
  { date: 'Nov', spend: 8900 },
  { date: 'Dec', spend: 9400 },
  { date: 'Jan', spend: 13100 },
  { date: 'Feb', spend: 17800 },
  { date: 'Mar', spend: 22400 },
];

const DEMO_FUNNEL_STEPS = [
  { name: 'visitors', count: 18420 },
  { name: 'signups', count: 1284 },
  { name: 'verified', count: 876 },
  { name: 'first_value', count: 312 },
  { name: 'returning', count: 198 },
];

const AI_INSIGHTS = [
  {
    id: 'ctr_drop',
    text: "Google Ads CTR dropped 0.8% this week. I've prepared A/B variants for 3 ad sets. Reallocating $1,200 is projected to recover",
    highlight: '+$4,100 revenue',
    suffix: ' this month.',
    action: 'Apply Reallocation',
    secondary: 'View Analysis',
    actionHref: '/app/analysis',
  },
  {
    id: 'email_open',
    text: 'Email open rate is 6% below your segment benchmark. Subject line variant B shows',
    highlight: '+23% lift',
    suffix: ' in A/B test — ready to promote.',
    action: 'Promote Variant B',
    secondary: 'View Test',
    actionHref: '/app/creative',
  },
  {
    id: 'cac_improve',
    text: 'CAC improved 12.4% this month. Meta spend efficiency is the primary driver —',
    highlight: '$14K headroom',
    suffix: ' before margin compression.',
    action: 'Scale Meta Budget',
    secondary: 'See Breakdown',
    actionHref: '/app/analysis',
  },
];

const QUICK_ACTIONS = [
  {
    href: '/app/chat',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    title: 'Ask your AI CMO',
    cta: 'Open Chat →',
    accent: 'text-orange-400',
  },
  {
    href: '/app/analysis',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
      </svg>
    ),
    title: 'Run Analysis',
    cta: 'Analyse →',
    accent: 'text-blue-400',
  },
  {
    href: '/app/creative',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
      </svg>
    ),
    title: 'Generate Copy',
    cta: 'Create →',
    accent: 'text-violet-400',
  },
];

// Custom dark tooltip for recharts
function DarkTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm shadow-xl">
      <p className="text-slate-400">{label}</p>
      <p className="mt-0.5 font-semibold text-orange-400">${(payload[0].value / 1000).toFixed(1)}K</p>
    </div>
  );
}

export default function DashboardPage() {
  const { isDemoMode } = useDemoMode();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<DashboardMetrics>(defaults);
  const [charts, setCharts] = useState<ChartData[]>([]);
  const [funnel, setFunnel] = useState<{
    steps: Array<{ name: string; count: number }>;
    conversion_signup_from_visitor: number;
    conversion_verified_from_signup: number;
    conversion_first_value_from_verified: number;
    conversion_return_from_first_value: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<string>('');
  const [insightIdx, setInsightIdx] = useState(0);
  const [showWelcome, setShowWelcome] = useState(!localStorage.getItem('dcmo_welcome_dismissed'));
  const [appliedInsight, setAppliedInsight] = useState(false);

  const DEMO_FUNNEL = {
    steps: DEMO_FUNNEL_STEPS,
    conversion_signup_from_visitor: 6.97,
    conversion_verified_from_signup: 68.22,
    conversion_first_value_from_verified: 35.62,
    conversion_return_from_first_value: 63.46,
  };

  const fetchData = async () => {
    setLoading(true);
    if (isDemoMode) {
      setMetrics(defaults);
      setFunnel(DEMO_FUNNEL);
      setUpdatedAt(new Date().toLocaleString());
      setLoading(false);
      return;
    }
    try {
      const data = await analyticsService.getDashboard();
      setMetrics(data?.metrics ?? defaults);
      setCharts(data?.charts || []);
      try {
        const funnelData = await growthService.getFunnelSummary(14);
        setFunnel(Array.isArray(funnelData?.steps) ? funnelData : DEMO_FUNNEL);
      } catch {
        setFunnel(DEMO_FUNNEL);
      }
    } catch {
      setMetrics(defaults);
      setFunnel(DEMO_FUNNEL);
    } finally {
      setUpdatedAt(new Date().toLocaleString());
      setLoading(false);
    }
  };

  useEffect(() => {
    void trackOnboardingStep('dashboard_viewed', { source: 'app' });
    void fetchData();
  }, [isDemoMode]);

  const spendSeries = useMemo(() => {
    const spendChart = charts.find((c) => c.id === 'spend_over_time');
    if (!spendChart?.data.x || !spendChart.data.y) return DEMO_SPEND;
    return spendChart.data.x.map((date, i) => ({
      date: date.slice(5),
      spend: spendChart.data.y?.[i] ?? 0,
    }));
  }, [charts]);

  const dismissWelcome = () => {
    localStorage.setItem('dcmo_welcome_dismissed', '1');
    setShowWelcome(false);
  };

  const insight = AI_INSIGHTS[insightIdx];

  const kpiCards = [
    {
      label: 'Pipeline Rev.',
      value: '$248K',
      trend: '+18% MoM',
      up: true,
      sub: 'vs $210K last month',
    },
    {
      label: 'ROAS',
      value: `${metrics.roas.toFixed(1)}×`,
      trend: '↑ Target: 4.0×',
      up: true,
      sub: 'above benchmark',
    },
    {
      label: 'CAC',
      value: `$${Math.round(metrics.cac)}`,
      trend: '↓ -12.4%',
      up: true, // decreasing CAC is good
      sub: 'improving efficiency',
    },
    {
      label: 'Active Campaigns',
      value: '14',
      trend: '3 optimising',
      up: null,
      sub: 'AI auto-managing',
    },
  ] satisfies Array<{ label: string; value: string; trend: string; up: boolean | null; sub: string }>;

  if (loading) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-5 bg-slate-950 min-h-screen -m-6 p-6">

      {/* ── First-session welcome ── */}
      {showWelcome && isDemoMode && (
        <section className="relative rounded-2xl border border-orange-500/20 bg-orange-500/5 p-5">
          <button onClick={dismissWelcome} className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-500 hover:text-slate-300">
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/20">
              <Sparkles className="h-4 w-4 text-orange-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Welcome to Digital CMO AI</p>
              <p className="text-xs text-slate-400">Demo mode active — all data is synthetic. Try the quick-start actions below.</p>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            {QUICK_ACTIONS.map((a) => (
              <Link
                key={a.href}
                to={a.href}
                onClick={dismissWelcome}
                className="group flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 hover:border-slate-700 transition-colors"
              >
                <span className={`${a.accent}`}>{a.icon}</span>
                <span className="text-sm text-slate-300 group-hover:text-white">{a.title}</span>
                <span className={`ml-auto text-xs font-medium ${a.accent}`}>{a.cta}</span>
              </Link>
            ))}
          </div>
          <button onClick={dismissWelcome} className="mt-3 text-xs text-slate-600 hover:text-slate-400 underline">Dismiss</button>
        </section>
      )}

      {/* ── Header bar ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-500/80" />
            <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
          </div>
          <p className="text-sm text-slate-400">dashboard · {isDemoMode ? 'demo' : 'live'}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => void fetchData()}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-medium text-emerald-400">AI CMO Active</span>
          </div>
        </div>
      </div>

      {/* ── ROI Hero — AI Savings vs CMO ── */}
      {isDemoMode && (
        <article className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/60 to-slate-900 p-6 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-2xl">
                💰
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-emerald-500">AI Savings vs Hiring a CMO</p>
                <p className="mt-1 text-4xl font-extrabold tracking-tight text-white">
                  $47,200{' '}
                  <span className="text-lg font-semibold text-emerald-400">saved this month</span>
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  vs. <span className="font-semibold text-slate-300">$25K/mo agency retainer</span> + <span className="font-semibold text-slate-300">$300K/yr CMO salary</span>
                </p>
              </div>
            </div>
            <div className="flex flex-col items-start gap-2 sm:items-end">
              <div className="flex items-center gap-2 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-4 py-2">
                <ArrowUpRight className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-bold text-emerald-400">317× ROI on subscription</span>
              </div>
              <p className="text-xs text-slate-600">Digital CMO AI Pro: $149/mo</p>
            </div>
          </div>
        </article>
      )}

      {/* ── KPI cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((card) => (
          <article key={card.label} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{card.label}</p>
            <p className="mt-3 text-3xl font-bold text-white">{card.value}</p>
            <div className="mt-2 flex items-center gap-1.5">
              {card.up === true && <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" />}
              {card.up !== true && card.up !== null && <ArrowDownRight className="h-3.5 w-3.5 text-red-400" />}
              <span className={`text-xs font-medium ${card.up === true ? 'text-emerald-400' : card.up !== null ? 'text-red-400' : 'text-slate-400'}`}>
                {card.trend}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-600">{card.sub}</p>
          </article>
        ))}
      </div>

      {/* ── Spend chart ── */}
      <article className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Marketing Spend · 6 Months</p>
            <p className="mt-1 text-2xl font-bold text-white">
              ${(spendSeries.reduce((s, d) => s + d.spend, 0) / 1000).toFixed(0)}K{' '}
              <span className="text-sm font-normal text-emerald-400">↑ 24% vs prior period</span>
            </p>
          </div>
          <BarChart2 className="h-5 w-5 text-slate-600" />
        </div>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={spendSeries} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#475569' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#475569' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `$${v / 1000}K`}
                width={42}
              />
              <Tooltip content={<DarkTooltip />} />
              <Area
                type="monotone"
                dataKey="spend"
                stroke="#f97316"
                fill="url(#spendGrad)"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4, fill: '#f97316', stroke: '#0f172a', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </article>

      {/* ── AI CMO Insight + Funnel ── */}
      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">

        {/* Insight card */}
        <article className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500/15">
                <Zap className="h-3.5 w-3.5 text-orange-400" />
              </div>
              <span className="text-xs font-semibold text-orange-400">AI CMO</span>
              <span className="text-xs text-slate-600">·</span>
              <span className="text-xs text-slate-500">Insight</span>
              <span className="text-xs text-slate-600">·</span>
              <span className="text-xs text-slate-600">just now</span>
            </div>
            <div className="flex gap-1">
              {AI_INSIGHTS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setInsightIdx(i); setAppliedInsight(false); }}
                  className={`h-1.5 rounded-full transition-all ${i === insightIdx ? 'w-5 bg-orange-500' : 'w-1.5 bg-slate-700 hover:bg-slate-600'}`}
                />
              ))}
            </div>
          </div>

          <p className="text-sm leading-relaxed text-slate-300">
            {insight.text}{' '}
            <span className="font-semibold text-emerald-400">{insight.highlight}</span>
            {insight.suffix}
          </p>

          <div className="mt-5 flex gap-3">
            {appliedInsight ? (
              <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-4 py-2 text-sm text-emerald-400">
                <CheckCircle className="h-4 w-4" />
                Applied — tracking impact
              </div>
            ) : (
              <button
                onClick={() => setAppliedInsight(true)}
                className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition-colors shadow-md shadow-orange-500/20"
              >
                {insight.action}
              </button>
            )}
            <button
              onClick={() => navigate(insight.actionHref)}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:border-slate-600 hover:text-white transition-colors"
            >
              {insight.secondary}
            </button>
          </div>

          {/* More insights */}
          <div className="mt-5 space-y-2">
            {AI_INSIGHTS.filter((_, i) => i !== insightIdx).map((alt, i) => (
              <button
                key={alt.id}
                onClick={() => { setInsightIdx(AI_INSIGHTS.indexOf(alt)); setAppliedInsight(false); }}
                className="flex w-full items-center gap-2 rounded-lg border border-slate-800 px-3 py-2 text-left text-xs text-slate-500 hover:border-slate-700 hover:text-slate-400 transition-colors"
              >
                <ArrowUpRight className="h-3 w-3 flex-shrink-0 text-slate-600" />
                <span className="line-clamp-1">{alt.text.slice(0, 60)}…</span>
                <ChevronRight className="ml-auto h-3 w-3 flex-shrink-0" />
              </button>
            ))}
          </div>
        </article>

        {/* Funnel mini */}
        {funnel && (
          <article className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Acquisition Funnel</p>
            <div className="space-y-3">
              {funnel.steps.map((step, i) => {
                const maxCount = Math.max(...funnel.steps.map((s) => s.count));
                const pct = Math.round((step.count / maxCount) * 100);
                const opacities = ['opacity-100', 'opacity-80', 'opacity-60', 'opacity-40', 'opacity-25'];
                return (
                  <div key={step.name}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400 capitalize">{step.name.replace(/_/g, ' ')}</span>
                      <span className="font-semibold text-white">{step.count.toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-orange-500 ${opacities[i] ?? 'opacity-20'} transition-all`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <p className="text-slate-600">Visit→Signup <span className="text-slate-300 font-medium">{funnel.conversion_signup_from_visitor.toFixed(1)}%</span></p>
              <p className="text-slate-600">Signup→Verified <span className="text-slate-300 font-medium">{funnel.conversion_verified_from_signup.toFixed(1)}%</span></p>
              <p className="text-slate-600">Verified→Value <span className="text-slate-300 font-medium">{funnel.conversion_first_value_from_verified.toFixed(1)}%</span></p>
              <p className="text-slate-600">Value→Return <span className="text-slate-300 font-medium">{funnel.conversion_return_from_first_value.toFixed(1)}%</span></p>
            </div>
            <Link
              to="/app/growth"
              className="mt-4 flex items-center gap-1 text-xs font-medium text-orange-500 hover:text-orange-400"
            >
              Full funnel dashboard <ChevronRight className="h-3 w-3" />
            </Link>
          </article>
        )}
      </div>

      {/* ── Quick stats strip ── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wide">CTR</p>
          <p className="mt-2 text-2xl font-bold text-white">{metrics.ctr.toFixed(2)}%</p>
          <p className="mt-1 text-xs text-slate-600">{metrics.clicks.toLocaleString()} clicks · {metrics.impressions.toLocaleString()} impr.</p>
        </article>
        <article className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Email Opens / Clicks</p>
          <p className="mt-2 text-2xl font-bold text-white">{metrics.email_open_rate.toFixed(1)}% <span className="text-lg text-slate-600">/</span> {metrics.email_click_rate.toFixed(1)}%</p>
          <p className="mt-1 text-xs text-slate-600">open rate → click rate</p>
        </article>
        <article className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wide">LTV / CAC Ratio</p>
          <p className="mt-2 text-2xl font-bold text-white">{(metrics.ltv / metrics.cac).toFixed(1)}×</p>
          <p className="mt-1 text-xs text-emerald-600">healthy (&gt;3× target)</p>
        </article>
      </div>

      {updatedAt && (
        <p className="text-center text-xs text-slate-700">Last sync {updatedAt}</p>
      )}
    </div>
  );
}
