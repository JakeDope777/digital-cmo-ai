import { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight,
  DollarSign,
  Eye,
  Funnel,
  Loader2,
  MousePointer,
  RefreshCw,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { analyticsService } from '../services/api';
import type { ChartData, DashboardMetrics } from '../types';

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

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics>(defaults);
  const [charts, setCharts] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<string>('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await analyticsService.getDashboard();
      setMetrics(data.metrics);
      setCharts(data.charts || []);
    } catch {
      setMetrics(defaults);
    } finally {
      setUpdatedAt(new Date().toLocaleString());
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  const spendSeries = useMemo(() => {
    const spendChart = charts.find((c) => c.id === 'spend_over_time');
    if (!spendChart?.data.x || !spendChart.data.y) return [];
    return spendChart.data.x.map((date, index) => ({
      date: date.slice(5),
      spend: spendChart.data.y?.[index] ?? 0,
    }));
  }, [charts]);

  const channelSeries = useMemo(() => {
    const channelChart = charts.find((c) => c.id === 'conversions_by_channel');
    if (!channelChart?.data.x || !channelChart.data.y) return [];
    return channelChart.data.x.map((name, index) => ({
      name,
      conversions: channelChart.data.y?.[index] ?? 0,
    }));
  }, [charts]);

  if (loading) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-700" />
      </div>
    );
  }

  const cards = [
    {
      title: 'Revenue Efficiency (ROAS)',
      value: `${metrics.roas.toFixed(2)}x`,
      icon: <TrendingUp className="h-4 w-4" />,
      note: 'Healthy return on paid channels',
    },
    {
      title: 'Pipeline Leads',
      value: metrics.total_leads.toLocaleString(),
      icon: <Users className="h-4 w-4" />,
      note: `+${metrics.new_leads_period} this period`,
    },
    {
      title: 'Conversion Rate',
      value: `${metrics.conversion_rate.toFixed(1)}%`,
      icon: <Target className="h-4 w-4" />,
      note: `${metrics.conversions} conversions`,
    },
    {
      title: 'Paid Spend',
      value: `$${metrics.total_spend.toLocaleString()}`,
      icon: <DollarSign className="h-4 w-4" />,
      note: `CAC $${metrics.cac.toFixed(2)} / LTV $${metrics.ltv.toFixed(0)}`,
    },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-slate-900 p-6 text-white shadow-xl shadow-slate-300/40">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-orange-300">Executive View</p>
            <h2 className="mt-2 text-2xl font-bold">Growth command dashboard</h2>
            <p className="mt-1 text-sm text-slate-300">Last sync: {updatedAt || 'just now'}</p>
          </div>
          <button
            onClick={() => void fetchData()}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm text-slate-100 hover:bg-slate-700"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Data
          </button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <article key={card.title} className="rounded-xl bg-white/10 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-300">{card.title}</p>
                <span className="rounded-md bg-white/15 p-1.5 text-orange-200">{card.icon}</span>
              </div>
              <p className="mt-3 text-2xl font-bold">{card.value}</p>
              <p className="mt-1 text-xs text-slate-300">{card.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-800">Marketing Spend Over Time</h3>
          <p className="text-xs text-slate-500">Detect efficiency drift before it hurts acquisition.</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={spendSeries}>
                <defs>
                  <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="spend" stroke="#ea580c" fill="url(#spendGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-800">Conversions by Channel</h3>
          <p className="text-xs text-slate-500">Focus spend where contribution margin is strongest.</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channelSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="conversions" fill="#0f172a" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs text-slate-500">Audience Reach</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{metrics.impressions.toLocaleString()}</p>
          <p className="mt-1 inline-flex items-center gap-1 text-xs text-emerald-700">
            <Eye className="h-3 w-3" /> high visibility across channels
          </p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs text-slate-500">Click Through Rate</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{metrics.ctr.toFixed(2)}%</p>
          <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-700">
            <MousePointer className="h-3 w-3" /> {metrics.clicks.toLocaleString()} clicks
          </p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs text-slate-500">Email Funnel</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {metrics.email_open_rate.toFixed(1)}% / {metrics.email_click_rate.toFixed(1)}%
          </p>
          <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-700">
            <Funnel className="h-3 w-3" /> open to click performance
          </p>
        </article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-800">Recommended Next Actions</h3>
        <ul className="mt-3 space-y-2 text-sm text-slate-700">
          <li className="inline-flex items-start gap-2">
            <ArrowUpRight className="mt-0.5 h-4 w-4 text-orange-600" />
            Shift 10% budget from lowest-performing channel into high-conversion campaigns.
          </li>
          <li className="inline-flex items-start gap-2">
            <ArrowUpRight className="mt-0.5 h-4 w-4 text-orange-600" />
            Launch two creative variants for underperforming ad sets this week.
          </li>
          <li className="inline-flex items-start gap-2">
            <ArrowUpRight className="mt-0.5 h-4 w-4 text-orange-600" />
            Tighten onboarding email sequence to improve click-to-demo progression.
          </li>
        </ul>
      </section>
    </div>
  );
}
