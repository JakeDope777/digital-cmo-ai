import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowUpRight,
  ArrowDownRight,
  BarChart2,
  Loader2,
  RefreshCw,
  Sparkles,
  Zap,
  Brain,
  TrendingUp,
  Mail,
  DollarSign,
  Users,
  Target,
  FileText,
  Search,
  PenTool,
  Megaphone,
  CheckCircle,
  AlertTriangle,
  Activity,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  LineChart,
  Line,
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

// Sparkline data for KPI cards
const SPARKLINES = {
  leads: [280, 295, 310, 298, 320, 335, 342],
  spend: [9400, 10200, 11000, 11800, 12100, 12450, 12450],
  roas: [4.1, 4.4, 4.8, 4.6, 5.0, 5.2, 5.3],
  email: [21.2, 22.1, 23.4, 22.8, 24.0, 23.9, 24.5],
};

const AGENTS = [
  {
    name: 'Brain Orchestrator',
    status: 'active',
    action: 'Coordinating Q2 campaign strategy',
    time: '2m ago',
    icon: '🧠',
  },
  {
    name: 'Market Intel',
    status: 'active',
    action: 'Scanning competitor pricing changes',
    time: '5m ago',
    icon: '🔍',
  },
  {
    name: 'Creative Studio',
    status: 'processing',
    action: 'Generating 3 ad copy variants',
    time: '8m ago',
    icon: '🎨',
  },
  {
    name: 'SEO Engine',
    status: 'active',
    action: 'Analysing 24 keyword opportunities',
    time: '12m ago',
    icon: '📈',
  },
  {
    name: 'Social Media',
    status: 'processing',
    action: 'Scheduling LinkedIn posts (7 queued)',
    time: '15m ago',
    icon: '📱',
  },
  {
    name: 'Analytics',
    status: 'active',
    action: 'Processing conversion attribution data',
    time: '18m ago',
    icon: '📊',
  },
  {
    name: 'Email Optimiser',
    status: 'active',
    action: 'A/B testing 5 subject line variants',
    time: '22m ago',
    icon: '📧',
  },
  {
    name: 'Bid Manager',
    status: 'processing',
    action: 'Auto-adjusting Google Ads bids',
    time: '25m ago',
    icon: '💰',
  },
  {
    name: 'Content Planner',
    status: 'active',
    action: 'Building Q2 content calendar',
    time: '31m ago',
    icon: '📝',
  },
  {
    name: 'CRM Sync',
    status: 'active',
    action: 'Syncing 47 new leads to HubSpot',
    time: '34m ago',
    icon: '🔗',
  },
];

const AI_INSIGHTS = [
  {
    id: 'ctr_drop',
    borderColor: 'border-blue-500',
    bgColor: 'bg-blue-500/5',
    iconBg: 'bg-blue-500/15',
    iconColor: 'text-blue-400',
    icon: TrendingUp,
    badge: 'Revenue Recovery',
    badgeColor: 'text-blue-400 bg-blue-500/10',
    text: 'Google Ads CTR dropped 0.8% this week. I\'ve prepared A/B variants for 3 ad sets. Reallocating $1,200 is projected to recover',
    highlight: '+$4,100 revenue',
    highlightColor: 'text-emerald-400',
    suffix: ' this month.',
    action: 'Apply Reallocation',
    actionStyle: 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20',
    secondary: 'View Analysis',
    actionHref: '/app/analysis',
  },
  {
    id: 'email_open',
    borderColor: 'border-amber-500',
    bgColor: 'bg-amber-500/5',
    iconBg: 'bg-amber-500/15',
    iconColor: 'text-amber-400',
    icon: Mail,
    badge: 'Email Optimisation',
    badgeColor: 'text-amber-400 bg-amber-500/10',
    text: 'Email open rate is 6% below your segment benchmark. Subject line variant B shows',
    highlight: '+23% lift',
    highlightColor: 'text-emerald-400',
    suffix: ' in A/B test — ready to promote.',
    action: 'Promote Variant B',
    actionStyle: 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-500/20',
    secondary: 'View Test',
    actionHref: '/app/creative',
  },
  {
    id: 'cac_improve',
    borderColor: 'border-emerald-500',
    bgColor: 'bg-emerald-500/5',
    iconBg: 'bg-emerald-500/15',
    iconColor: 'text-emerald-400',
    icon: DollarSign,
    badge: 'Scaling Opportunity',
    badgeColor: 'text-emerald-400 bg-emerald-500/10',
    text: 'CAC improved 12.4% this month. Meta spend efficiency is the primary driver —',
    highlight: '$14K headroom',
    highlightColor: 'text-emerald-400',
    suffix: ' before margin compression.',
    action: 'Scale Meta Budget',
    actionStyle: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20',
    secondary: 'See Breakdown',
    actionHref: '/app/analysis',
  },
];

const QUICK_ACTIONS = [
  {
    href: '/app/chat',
    icon: FileText,
    label: 'Generate Campaign Brief',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20 hover:border-blue-500/40',
  },
  {
    href: '/app/analysis',
    icon: Search,
    label: 'Analyse Competitors',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10 hover:bg-violet-500/20 border-violet-500/20 hover:border-violet-500/40',
  },
  {
    href: '/app/chat',
    icon: Mail,
    label: 'Write Email Sequence',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/20 hover:border-amber-500/40',
  },
  {
    href: '/app/creative',
    icon: PenTool,
    label: 'Create Ad Copy',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20 hover:border-emerald-500/40',
  },
];

function SparklineChart({ data, color }: { data: number[]; color: string }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const chartData = data.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width="100%" height={36}>
      <LineChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
        <Line
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
        <YAxis domain={[min * 0.95, max * 1.05]} hide />
      </LineChart>
    </ResponsiveContainer>
  );
}

function DarkTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl border px-3 py-2 text-sm shadow-2xl"
      style={{
        background: 'oklch(13% .008 255)',
        borderColor: 'oklch(24% .008 255)',
      }}
    >
      <p className="text-slate-400 text-xs">{label}</p>
      <p className="mt-0.5 font-bold text-blue-400">${(payload[0].value / 1000).toFixed(1)}K</p>
    </div>
  );
}

export default function DashboardPage() {
  const { isDemoMode } = useDemoMode();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<DashboardMetrics>(defaults);
  const [charts, setCharts] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<string>('');
  const [appliedInsights, setAppliedInsights] = useState<Set<string>>(new Set());

  const bg = { background: 'oklch(9% .008 255)' };
  const cardBg = { background: 'oklch(13% .008 255)', borderColor: 'oklch(24% .008 255)' };

  const fetchData = async () => {
    setLoading(true);
    if (isDemoMode) {
      setMetrics(defaults);
      setUpdatedAt(new Date().toLocaleString());
      setLoading(false);
      return;
    }
    try {
      const data = await analyticsService.getDashboard();
      setMetrics(data?.metrics ?? defaults);
      setCharts(data?.charts || []);
    } catch {
      setMetrics(defaults);
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

  const kpiCards = [
    {
      label: 'Total Leads',
      value: metrics.total_leads.toLocaleString(),
      trend: '+12% this month',
      trendUp: true,
      sub: `${metrics.new_leads_period} new this period`,
      icon: Users,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/10',
      sparkData: SPARKLINES.leads,
      sparkColor: '#60a5fa',
    },
    {
      label: 'Ad Spend',
      value: `$${metrics.total_spend.toLocaleString()}`,
      trend: '+8% vs last mo',
      trendUp: null,
      sub: 'across all channels',
      icon: DollarSign,
      iconColor: 'text-violet-400',
      iconBg: 'bg-violet-500/10',
      sparkData: SPARKLINES.spend,
      sparkColor: '#a78bfa',
    },
    {
      label: 'ROAS',
      value: `${metrics.roas.toFixed(1)}×`,
      trend: '+0.8 vs last mo',
      trendUp: true,
      sub: 'above 4.0× target',
      icon: Target,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10',
      sparkData: SPARKLINES.roas,
      sparkColor: '#34d399',
    },
    {
      label: 'Email Open Rate',
      value: `${metrics.email_open_rate.toFixed(1)}%`,
      trend: '-1.2% this week',
      trendUp: false,
      sub: 'industry avg: 30.4%',
      icon: Mail,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/10',
      sparkData: SPARKLINES.email,
      sparkColor: '#fbbf24',
    },
  ];

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center -m-6"
        style={bg}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Brain className="h-10 w-10 text-blue-400" />
            <Loader2 className="absolute -top-1 -right-1 h-5 w-5 animate-spin text-blue-400" />
          </div>
          <p className="text-sm text-slate-400">AI agents loading your dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 min-h-screen -m-6 p-6" style={bg}>

      {/* ── Hero Banner ── */}
      <section
        className="relative overflow-hidden rounded-2xl p-6"
        style={{
          background: 'linear-gradient(135deg, oklch(25% .06 155) 0%, oklch(18% .04 253) 50%, oklch(15% .08 253) 100%)',
          border: '1px solid oklch(35% .08 155 / 0.4)',
          boxShadow: '0 0 60px oklch(55% .18 155 / 0.15), 0 0 24px #3c91ed1a',
        }}
      >
        {/* Glow orbs */}
        <div
          className="pointer-events-none absolute -top-20 -left-20 h-64 w-64 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #34d399, transparent 70%)' }}
        />
        <div
          className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #3c91ed, transparent 70%)' }}
        />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-5">
            <div
              className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl text-2xl"
              style={{ background: 'oklch(35% .1 155 / 0.3)', border: '1px solid oklch(50% .1 155 / 0.3)' }}
            >
              💰
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">AI Savings vs Hiring a CMO</span>
              </div>
              <p className="text-4xl font-extrabold tracking-tight text-white leading-tight">
                $47,200{' '}
                <span className="text-xl font-semibold text-emerald-300">saved this month</span>
              </p>
              <p className="mt-1.5 text-sm text-slate-400">
                vs.{' '}
                <span className="font-semibold text-slate-200">$25K/mo agency retainer</span>
                {' '}+{' '}
                <span className="font-semibold text-slate-200">$300K/yr CMO salary</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div
              className="flex items-center gap-2.5 rounded-xl px-5 py-3"
              style={{
                background: 'oklch(35% .12 155 / 0.25)',
                border: '1px solid oklch(50% .12 155 / 0.4)',
                boxShadow: '0 0 20px oklch(55% .18 155 / 0.2)',
              }}
            >
              <ArrowUpRight className="h-5 w-5 text-emerald-400" />
              <div>
                <p className="text-sm font-bold text-emerald-300">317× ROI</p>
                <p className="text-xs text-emerald-500/70">on $149/mo subscription</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-slate-400">10 AI agents working right now</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── KPI Grid ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <article
              key={card.label}
              className="rounded-2xl border p-5 transition-all hover:scale-[1.01]"
              style={{
                ...cardBg,
                boxShadow: '0 0 0 0 transparent',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 0 24px #3c91ed2e';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 0 transparent';
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{card.label}</p>
                  <p className="mt-2 text-3xl font-extrabold text-white tracking-tight">{card.value}</p>
                </div>
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${card.iconBg}`}>
                  <Icon className={`h-4 w-4 ${card.iconColor}`} />
                </div>
              </div>

              {/* Sparkline */}
              <div className="mb-3 -mx-1">
                <SparklineChart data={card.sparkData} color={card.sparkColor} />
              </div>

              <div className="flex items-center gap-1.5">
                {card.trendUp === true && <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" />}
                {card.trendUp === false && <ArrowDownRight className="h-3.5 w-3.5 text-rose-400" />}
                <span
                  className={`text-xs font-semibold ${
                    card.trendUp === true
                      ? 'text-emerald-400'
                      : card.trendUp === false
                      ? 'text-rose-400'
                      : 'text-slate-400'
                  }`}
                >
                  {card.trend}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-600">{card.sub}</p>
            </article>
          );
        })}
      </div>

      {/* ── Main content: Chart + Agent sidebar ── */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">

          {/* Spend Trend Chart */}
          <article className="rounded-2xl border p-6" style={cardBg}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">Marketing Spend · Oct–Mar</p>
                <p className="mt-1 text-2xl font-bold text-white">
                  ${(spendSeries.reduce((s, d) => s + d.spend, 0) / 1000).toFixed(0)}K{' '}
                  <span className="text-sm font-normal text-emerald-400">↑ 211% growth</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => void fetchData()}
                  className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                  style={{ borderColor: 'oklch(24% .008 255)' }}
                >
                  <RefreshCw className="h-3 w-3" />
                  Sync
                </button>
                <BarChart2 className="h-5 w-5 text-slate-600" />
              </div>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={spendSeries} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3c91ed" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3c91ed" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(18% .008 255)" vertical={false} />
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
                    width={44}
                  />
                  <Tooltip content={<DarkTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="spend"
                    stroke="#3c91ed"
                    fill="url(#spendGrad)"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5, fill: '#3c91ed', stroke: 'oklch(9% .008 255)', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </article>

          {/* AI Insights */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/15">
                <Sparkles className="h-3.5 w-3.5 text-blue-400" />
              </div>
              <span className="text-sm font-bold text-white">AI Insights</span>
              <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-xs font-semibold text-blue-400">3 actions</span>
            </div>
            <div className="space-y-3">
              {AI_INSIGHTS.map((insight) => {
                const Icon = insight.icon;
                const applied = appliedInsights.has(insight.id);
                return (
                  <article
                    key={insight.id}
                    className={`rounded-2xl border-l-2 border p-5 transition-all ${insight.borderColor} ${insight.bgColor}`}
                    style={{ borderLeftWidth: '3px', borderColor: 'oklch(24% .008 255)', background: 'oklch(13% .008 255)' }}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${insight.iconBg}`}>
                        <Icon className={`h-4 w-4 ${insight.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${insight.badgeColor}`}>
                            {insight.badge}
                          </span>
                          <span className="text-xs text-slate-600">Brain Orchestrator · just now</span>
                        </div>
                        <p className="text-sm leading-relaxed text-slate-300">
                          {insight.text}{' '}
                          <span className={`font-bold ${insight.highlightColor}`}>{insight.highlight}</span>
                          {insight.suffix}
                        </p>
                        <div className="mt-3 flex gap-2">
                          {applied ? (
                            <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400">
                              <CheckCircle className="h-3.5 w-3.5" />
                              Applied — tracking impact
                            </div>
                          ) : (
                            <button
                              onClick={() => setAppliedInsights((prev) => new Set([...prev, insight.id]))}
                              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all shadow-lg ${insight.actionStyle}`}
                            >
                              {insight.action}
                            </button>
                          )}
                          <button
                            onClick={() => navigate(insight.actionHref)}
                            className="rounded-lg border px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
                            style={{ borderColor: 'oklch(24% .008 255)' }}
                          >
                            {insight.secondary}
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500 mb-3">Quick Actions</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.label}
                    to={action.href}
                    className={`group flex flex-col items-center gap-2.5 rounded-xl border p-4 text-center transition-all hover:scale-[1.02] ${action.bg}`}
                  >
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${action.bg.split(' ')[0]}`}>
                      <Icon className={`h-4 w-4 ${action.color}`} />
                    </div>
                    <span className="text-xs font-semibold text-slate-300 group-hover:text-white leading-tight">{action.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Agent Activity Sidebar ── */}
        <aside className="space-y-4">
          <article className="rounded-2xl border p-5 sticky top-6" style={cardBg}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-bold text-white">Agent Activity</span>
              </div>
              <div
                className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
                style={{ background: 'oklch(20% .06 155)', border: '1px solid oklch(35% .08 155 / 0.4)' }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400">10 active</span>
              </div>
            </div>

            <div className="space-y-3">
              {AGENTS.map((agent) => (
                <div
                  key={agent.name}
                  className="flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-white/[0.02]"
                >
                  <div className="relative flex-shrink-0 mt-0.5">
                    <span className="text-lg leading-none">{agent.icon}</span>
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-[oklch(13%_.008_255)] ${
                        agent.status === 'active' ? 'bg-emerald-400' : 'bg-blue-400'
                      } ${agent.status === 'active' ? 'animate-pulse' : ''}`}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-200 truncate">{agent.name}</p>
                    <p className="text-xs text-slate-500 leading-tight mt-0.5 line-clamp-2">{agent.action}</p>
                  </div>
                  <span className="text-xs text-slate-600 flex-shrink-0">{agent.time}</span>
                </div>
              ))}
            </div>

            <div
              className="mt-4 rounded-xl p-3"
              style={{ background: 'oklch(10% .008 255)', border: '1px solid oklch(20% .008 255)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-3.5 w-3.5 text-blue-400" />
                <span className="text-xs font-semibold text-slate-400">System Status</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600">Tasks completed today</span>
                  <span className="text-xs font-bold text-slate-300">247</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600">Avg response time</span>
                  <span className="text-xs font-bold text-emerald-400">1.2s</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600">Cost saved vs agency</span>
                  <span className="text-xs font-bold text-emerald-400">$1,573 today</span>
                </div>
              </div>
            </div>
          </article>
        </aside>
      </div>

      {updatedAt && (
        <p className="text-center text-xs text-slate-700">Last sync {updatedAt}</p>
      )}
    </div>
  );
}
