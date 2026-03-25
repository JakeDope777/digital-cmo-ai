import { useLaunchReadiness } from '../../hooks/useLaunchReadiness';

type PanelTone = 'dark' | 'light';
type PanelVariant = 'default' | 'compact';

interface LaunchReadinessPanelProps {
  title?: string;
  tone?: PanelTone;
  variant?: PanelVariant;
  showModeLegend?: boolean;
  className?: string;
}

const MODE_LEGEND = [
  'Live via managed workspace connection',
  'Demo fallback',
  'Self-serve OAuth coming soon',
];

function joinClasses(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

function pilotLabel(state: 'live' | 'setup_in_progress' | 'demo_only') {
  if (state === 'live') return 'Managed live pilot connectors';
  if (state === 'demo_only') return 'Demo fallback available';
  return 'Workspace setup in progress';
}

function readinessPillClass(
  tone: PanelTone,
  state: 'positive' | 'pending' | 'neutral',
) {
  if (tone === 'dark') {
    if (state === 'positive') return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300';
    if (state === 'pending') return 'border-amber-500/20 bg-amber-500/10 text-amber-300';
    return 'border-white/10 bg-white/5 text-white/65';
  }
  if (state === 'positive') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  if (state === 'pending') return 'border-amber-200 bg-amber-50 text-amber-700';
  return 'border-slate-200 bg-slate-100 text-slate-600';
}

function pilotBadgeState(state: 'live' | 'setup_in_progress' | 'demo_only') {
  if (state === 'live') return 'positive';
  if (state === 'demo_only') return 'neutral';
  return 'pending';
}

export default function LaunchReadinessPanel({
  title = 'Pilot workspace status',
  tone = 'dark',
  variant = 'default',
  showModeLegend = false,
  className,
}: LaunchReadinessPanelProps) {
  const { publicStatus, loading, error } = useLaunchReadiness();
  const compact = variant === 'compact';
  const shellClass = tone === 'dark'
    ? 'border-white/10 bg-white/5 text-white'
    : 'border-slate-200 bg-white text-slate-900';
  const eyebrowClass = tone === 'dark' ? 'text-white/35' : 'text-slate-500';
  const headlineClass = tone === 'dark' ? 'text-white' : 'text-slate-900';
  const summaryClass = tone === 'dark' ? 'text-white/60' : 'text-slate-600';
  const footerClass = tone === 'dark' ? 'text-white/35' : 'text-slate-500';
  const syncLabel = loading
    ? 'Syncing live pilot status'
    : error
      ? 'Using pilot-safe defaults while status syncs'
      : 'Backend-driven pilot status';

  return (
    <div className={joinClasses(
      'rounded-2xl border p-4',
      compact ? 'space-y-3' : 'space-y-4',
      shellClass,
      className,
    )}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className={joinClasses('text-[11px] font-semibold uppercase tracking-[0.18em]', eyebrowClass)}>
            {title}
          </p>
          <h3 className={joinClasses(compact ? 'mt-1 text-base font-semibold' : 'mt-1 text-lg font-semibold', headlineClass)}>
            {publicStatus.headline}
          </h3>
        </div>
        <span className={joinClasses(
          'inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium',
          readinessPillClass(tone, pilotBadgeState(publicStatus.pilot_state)),
        )}>
          {pilotLabel(publicStatus.pilot_state)}
        </span>
      </div>

      <p className={joinClasses(compact ? 'text-sm leading-relaxed' : 'text-sm leading-relaxed', summaryClass)}>
        {publicStatus.summary}
      </p>

      <div className={joinClasses(
        'grid gap-2',
        compact ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4',
      )}>
        <span className={joinClasses(
          'rounded-xl border px-3 py-2 text-xs font-medium',
          readinessPillClass(tone, publicStatus.pilot_state === 'live' ? 'positive' : publicStatus.pilot_state === 'demo_only' ? 'neutral' : 'pending'),
        )}>
          {pilotLabel(publicStatus.pilot_state)}
        </span>
        <span className={joinClasses(
          'rounded-xl border px-3 py-2 text-xs font-medium',
          readinessPillClass(tone, publicStatus.billing_state === 'ready' ? 'positive' : 'pending'),
        )}>
          {publicStatus.billing_state === 'ready' ? 'Billing ready' : 'Billing setup in progress'}
        </span>
        <span className={joinClasses(
          'rounded-xl border px-3 py-2 text-xs font-medium',
          readinessPillClass(tone, publicStatus.email_state === 'ready' ? 'positive' : 'pending'),
        )}>
          {publicStatus.email_state === 'ready' ? 'Email ready' : 'Email setup in progress'}
        </span>
        <span className={joinClasses(
          'rounded-xl border px-3 py-2 text-xs font-medium',
          readinessPillClass(tone, publicStatus.analytics_state === 'observable' ? 'positive' : 'pending'),
        )}>
          {publicStatus.analytics_state === 'observable' ? 'Analytics observable' : 'Analytics setup in progress'}
        </span>
      </div>

      {showModeLegend && (
        <div className="flex flex-wrap gap-2">
          {MODE_LEGEND.map((label) => (
            <span
              key={label}
              className={joinClasses(
                'rounded-full border px-2.5 py-1 text-[11px]',
                tone === 'dark'
                  ? 'border-white/10 bg-white/5 text-white/70'
                  : 'border-slate-200 bg-slate-50 text-slate-600',
              )}
            >
              {label}
            </span>
          ))}
        </div>
      )}

      <p className={joinClasses('text-xs', footerClass)}>
        {syncLabel} · Next step: {publicStatus.cta_label}
      </p>
    </div>
  );
}

