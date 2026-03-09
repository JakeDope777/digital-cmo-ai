import { useEffect, useState } from 'react';
import { BarChart2, Loader2, TrendingUp, RefreshCw, ArrowRight, MousePointerClick } from 'lucide-react';
import { growthService } from '../services/api';

type Days = 7 | 14 | 30 | 90;

interface FunnelData {
  steps: Array<{ name: string; count: number }>;
  conversion_signup_from_visitor: number;
  conversion_verified_from_signup: number;
  conversion_first_value_from_verified: number;
  conversion_return_from_first_value: number;
}

interface UtmData {
  rows: Array<{
    utm_source: string | null;
    utm_medium: string | null;
    utm_campaign: string | null;
    signups: number;
    value_actions: number;
  }>;
  top_events: Array<{ event_name: string; count: number }>;
}

// Demo data shown while backend data loads or is unavailable
const DEMO_FUNNEL: FunnelData = {
  steps: [
    { name: 'visitor', count: 4280 },
    { name: 'signup_completed', count: 312 },
    { name: 'verified', count: 218 },
    { name: 'first_value_action', count: 97 },
    { name: 'return_session', count: 61 },
  ],
  conversion_signup_from_visitor: 7.29,
  conversion_verified_from_signup: 69.87,
  conversion_first_value_from_verified: 44.5,
  conversion_return_from_first_value: 62.89,
};

const DEMO_UTM: UtmData = {
  rows: [
    { utm_source: 'google', utm_medium: 'cpc', utm_campaign: 'brand', signups: 87, value_actions: 142 },
    { utm_source: 'linkedin', utm_medium: 'social', utm_campaign: 'growth_oct', signups: 64, value_actions: 98 },
    { utm_source: '(direct)', utm_medium: null, utm_campaign: null, signups: 58, value_actions: 76 },
    { utm_source: 'email', utm_medium: 'newsletter', utm_campaign: 'product_launch', signups: 43, value_actions: 67 },
    { utm_source: 'referral', utm_medium: null, utm_campaign: null, signups: 29, value_actions: 44 },
  ],
  top_events: [
    { event_name: 'dashboard_viewed', count: 892 },
    { event_name: 'chat_message_sent', count: 641 },
    { event_name: 'analysis_run', count: 318 },
    { event_name: 'signup_completed', count: 312 },
    { event_name: 'login_completed', count: 278 },
    { event_name: 'creative_generated', count: 194 },
    { event_name: 'landing_view', count: 4280 },
    { event_name: 'verification_completed', count: 218 },
  ],
};

const STEP_LABELS: Record<string, string> = {
  visitor: 'Visitor',
  signup_completed: 'Signup',
  verified: 'Verified',
  first_value_action: 'First Value',
  return_session: 'Return Session',
};

const STEP_COLORS = [
  'bg-orange-500',
  'bg-orange-400',
  'bg-orange-300',
  'bg-orange-200',
  'bg-orange-100',
];

function pct(n: number, d: number) {
  if (!d) return '—';
  return ((n / d) * 100).toFixed(1) + '%';
}

export default function GrowthPage() {
  const [days, setDays] = useState<Days>(14);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [funnel, setFunnel] = useState<FunnelData>(DEMO_FUNNEL);
  const [utm, setUtm] = useState<UtmData>(DEMO_UTM);
  const [error, setError] = useState('');

  const load = async (d: Days) => {
    setLoading(true);
    setError('');
    try {
      const [funnelData, utmData] = await Promise.all([
        growthService.getFunnelSummary(d),
        growthService.getUtmBreakdown(d),
      ]);
      setFunnel(Array.isArray(funnelData?.steps) ? funnelData : DEMO_FUNNEL);
      setUtm(utmData?.rows !== undefined ? utmData : DEMO_UTM);
      setIsDemo(false);
    } catch {
      setFunnel(DEMO_FUNNEL);
      setUtm(DEMO_UTM);
      setIsDemo(true);
      setError('Live data unavailable — showing demo figures.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(days); }, [days]);

  const maxFunnel = Math.max(...funnel.steps.map((s) => s.count), 1);
  const maxUtmSignups = Math.max(...utm.rows.map((r) => r.signups), 1);
  const maxEvents = Math.max(...utm.top_events.map((e) => e.count), 1);

  const conversionPairs = [
    { label: 'Visitor → Signup', value: funnel.conversion_signup_from_visitor },
    { label: 'Signup → Verified', value: funnel.conversion_verified_from_signup },
    { label: 'Verified → First Value', value: funnel.conversion_first_value_from_verified },
    { label: 'First Value → Return', value: funnel.conversion_return_from_first_value },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Growth &amp; Funnel</h2>
          <p className="text-sm text-slate-500">
            UTM attribution, conversion rates, and product event volume.
            {isDemo && (
              <span className="ml-2 rounded bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 border border-amber-200">
                Demo data
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Day range selector */}
          {([7, 14, 30, 90] as Days[]).map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                days === d
                  ? 'bg-slate-900 text-white'
                  : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {d}d
            </button>
          ))}
          <button
            onClick={() => void load(days)}
            className="ml-1 rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      ) : (
        <>
          {/* Conversion rate KPI strip */}
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {conversionPairs.map((pair) => (
              <article key={pair.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs text-slate-400 leading-snug">{pair.label}</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{pair.value.toFixed(1)}%</p>
                <div className="mt-2 h-1.5 rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-orange-400 transition-all"
                    style={{ width: `${Math.min(pair.value, 100)}%` }}
                  />
                </div>
              </article>
            ))}
          </section>

          {/* Funnel bars */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              <h3 className="text-sm font-semibold text-slate-800">
                Acquisition Funnel — last {days} days
              </h3>
            </div>
            <div className="space-y-4">
              {funnel.steps.map((step, i) => {
                const widthPct = Math.round((step.count / maxFunnel) * 100);
                const dropPct =
                  i > 0
                    ? pct(step.count, funnel.steps[i - 1].count)
                    : null;
                return (
                  <div key={step.name}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">
                        {STEP_LABELS[step.name] ?? step.name.replace(/_/g, ' ')}
                      </span>
                      <div className="flex items-center gap-3">
                        {dropPct && (
                          <span className="flex items-center gap-1 text-xs text-slate-400">
                            <ArrowRight className="h-3 w-3" />
                            {dropPct} from prev
                          </span>
                        )}
                        <span className="font-bold text-slate-900">{step.count.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${STEP_COLORS[i] ?? 'bg-orange-100'}`}
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* UTM attribution + top events */}
          <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            {/* UTM table */}
            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <MousePointerClick className="h-5 w-5 text-slate-400" />
                <h3 className="text-sm font-semibold text-slate-800">UTM Attribution</h3>
              </div>
              {utm.rows.length === 0 ? (
                <p className="text-sm text-slate-400">No UTM data in this window yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                        <th className="pb-2 font-medium">Source</th>
                        <th className="pb-2 font-medium">Medium</th>
                        <th className="pb-2 font-medium text-right">Signups</th>
                        <th className="pb-2 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {utm.rows.map((row, i) => {
                        const barPct = Math.round((row.signups / maxUtmSignups) * 100);
                        return (
                          <tr key={i}>
                            <td className="py-2.5">
                              <div className="font-medium text-slate-800">{row.utm_source ?? '(direct)'}</div>
                              <div className="mt-1 h-1 rounded-full bg-slate-100">
                                <div
                                  className="h-full rounded-full bg-orange-400"
                                  style={{ width: `${barPct}%` }}
                                />
                              </div>
                            </td>
                            <td className="py-2.5 text-slate-500">{row.utm_medium ?? '—'}</td>
                            <td className="py-2.5 text-right font-semibold text-slate-900">{row.signups}</td>
                            <td className="py-2.5 text-right text-slate-600">{row.value_actions}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </article>

            {/* Top events */}
            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-slate-400" />
                <h3 className="text-sm font-semibold text-slate-800">Top Product Events</h3>
              </div>
              {utm.top_events.length === 0 ? (
                <p className="text-sm text-slate-400">No events tracked yet.</p>
              ) : (
                <ul className="space-y-3">
                  {utm.top_events.map((ev) => {
                    const barPct = Math.round((ev.count / maxEvents) * 100);
                    return (
                      <li key={ev.event_name}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="font-mono text-xs text-slate-600">{ev.event_name}</span>
                          <span className="font-semibold text-slate-900">{ev.count.toLocaleString()}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-slate-700 transition-all"
                            style={{ width: `${barPct}%` }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </article>
          </section>
        </>
      )}
    </div>
  );
}
