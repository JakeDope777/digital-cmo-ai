import { useEffect, useState } from 'react';
import { CreditCard, ExternalLink, Loader2, Receipt, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { billingService } from '../services/api';
import { trackEvent } from '../services/analytics';
import { useDemoMode } from '../context/DemoModeContext';
import DemoDataBadge from '../components/common/DemoDataBadge';

const BG = 'oklch(9% .008 255)';
const CARD = 'oklch(13% .008 255)';
const BORDER = 'oklch(24% .008 255)';
const TEXT = 'oklch(93% .005 80)';
const MUTED = 'oklch(58% .015 255)';

interface Subscription {
  tier: string;
  status: string;
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end?: boolean;
  demo?: boolean;
}

interface InvoiceItem {
  id: string;
  amount_due: number;
  amount_paid: number;
  currency: string;
  status: string;
  hosted_invoice_url?: string;
  invoice_pdf?: string;
  created_at?: string;
  period_start?: string;
  period_end?: string;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    active: { bg: '#34d39918', color: '#34d399' },
    trialing: { bg: '#3c91ed18', color: '#3c91ed' },
    past_due: { bg: '#fbbf2418', color: '#fbbf24' },
    canceled: { bg: '#fb718518', color: '#fb7185' },
    unpaid: { bg: '#fb718518', color: '#fb7185' },
    inactive: { bg: 'oklch(20% .008 255)', color: MUTED },
  };
  const s = map[status] ?? { bg: 'oklch(20% .008 255)', color: MUTED };
  return (
    <span
      className="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}30` }}
    >
      {status}
    </span>
  );
}

function InvoiceStatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    paid: { bg: '#34d39918', color: '#34d399' },
    open: { bg: '#fbbf2418', color: '#fbbf24' },
    draft: { bg: 'oklch(20% .008 255)', color: MUTED },
    void: { bg: 'oklch(20% .008 255)', color: MUTED },
    uncollectible: { bg: '#fb718518', color: '#fb7185' },
  };
  const s = map[status] ?? { bg: 'oklch(20% .008 255)', color: MUTED };
  return (
    <span
      className="inline-block rounded px-2 py-0.5 text-xs font-medium capitalize"
      style={{ background: s.bg, color: s.color }}
    >
      {status}
    </span>
  );
}

const PRO_FEATURES = [
  'Unlimited AI CMO conversations',
  'Full marketing analysis suite',
  'Creative studio & copy generation',
  'Campaign planning & reporting',
  'Priority support',
];

const FREE_FEATURES = [
  'AI chat (50 messages/month)',
  'Demo data exploration',
  'Basic analysis',
];

const DEMO_SUBSCRIPTION: Subscription = {
  tier: 'Growth',
  status: 'active',
  current_period_start: '2026-03-01T00:00:00Z',
  current_period_end: '2026-04-01T00:00:00Z',
  cancel_at_period_end: false,
  demo: true,
};

const DEMO_INVOICES: InvoiceItem[] = [
  {
    id: 'in_demo_20260201',
    amount_due: 29900,
    amount_paid: 29900,
    currency: 'usd',
    status: 'paid',
    created_at: '2026-02-01T08:00:00Z',
    hosted_invoice_url: undefined,
  },
  {
    id: 'in_demo_20260301',
    amount_due: 29900,
    amount_paid: 29900,
    currency: 'usd',
    status: 'paid',
    created_at: '2026-03-01T08:00:00Z',
    hosted_invoice_url: undefined,
  },
];

export default function BillingPage() {
  const { isDemoMode } = useDemoMode();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [isDemo, setIsDemo] = useState(false);

  const refresh = async () => {
    setLoading(true);
    setError('');
    if (isDemoMode) {
      setSubscription(DEMO_SUBSCRIPTION);
      setInvoices(DEMO_INVOICES);
      setIsDemo(true);
      setLoading(false);
      return;
    }

    try {
      const [subData, invoiceData] = await Promise.all([
        billingService.getSubscription(),
        billingService.getInvoices(),
      ]);
      setSubscription(subData);
      setInvoices(invoiceData.invoices || []);
      setIsDemo(false);
    } catch {
      setSubscription(DEMO_SUBSCRIPTION);
      setInvoices(DEMO_INVOICES);
      setIsDemo(true);
      setError('Unable to load live billing data right now. Showing demo billing data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void trackEvent('billing_viewed');
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout') === 'success') {
      void trackEvent('checkout_completed');
    }
    void refresh();
  }, [isDemoMode]); // eslint-disable-line react-hooks/exhaustive-deps

  const startCheckout = async () => {
    if (isDemoMode) {
      setError('Switch to live mode to open Stripe checkout.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await trackEvent('checkout_started', { plan: 'pro' });
      const data = await billingService.createCheckoutSession('pro');
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
        return;
      }
      setError('Could not create checkout session.');
    } catch {
      setError('Checkout is temporarily unavailable.');
    } finally {
      setBusy(false);
    }
  };

  const openPortal = async () => {
    if (isDemoMode) {
      setError('Switch to live mode to open the billing portal.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const data = await billingService.createPortalSession();
      if (data.portal_url) {
        window.location.href = data.portal_url;
        return;
      }
      setError('Could not create billing portal session.');
    } catch {
      setError('Billing portal is temporarily unavailable.');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center" style={{ background: BG }}>
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#3c91ed' }} />
      </div>
    );
  }

  const isActive = subscription?.status === 'active' || subscription?.status === 'trialing';
  const isPro = subscription?.tier === 'pro' || subscription?.tier === 'Growth';
  const isPastDue = subscription?.status === 'past_due';
  const isCanceled = subscription?.status === 'canceled';
  const cancelAtEnd = subscription?.cancel_at_period_end;
  const periodEnd = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  // Demo usage stats
  const tokenUsed = 3240;
  const tokenTotal = 100000;
  const tokenPct = (tokenUsed / tokenTotal) * 100;
  const campaignsUsed = 4;
  const campaignsTotal = 10;
  const campaignsPct = (campaignsUsed / campaignsTotal) * 100;

  return (
    <div style={{ background: BG, minHeight: '100vh', color: TEXT }}>
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-6">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: TEXT }}>Billing</h2>
          <p className="text-sm" style={{ color: MUTED }}>Manage your plan, payments, and invoices.</p>
          {isDemo && <DemoDataBadge className="mt-2" />}
        </div>

        {error && (
          <div
            className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm"
            style={{ background: '#fb718518', border: '1px solid #fb718540', color: '#fb7185' }}
          >
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Past-due warning */}
        {isPastDue && (
          <div
            className="flex items-start gap-3 rounded-xl px-4 py-3"
            style={{ background: '#fbbf2415', border: '1px solid #fbbf2440' }}
          >
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" style={{ color: '#fbbf24' }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: '#fbbf24' }}>Payment past due</p>
              <p className="mt-0.5 text-sm" style={{ color: MUTED }}>
                We couldn't collect your last payment. Update your card in the billing portal to restore full access.
              </p>
            </div>
          </div>
        )}

        {/* Cancellation warning */}
        {cancelAtEnd && periodEnd && (
          <div
            className="flex items-start gap-3 rounded-xl px-4 py-3"
            style={{ background: '#fbbf2415', border: '1px solid #fbbf2440' }}
          >
            <Clock className="mt-0.5 h-5 w-5 flex-shrink-0" style={{ color: '#fbbf24' }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: '#fbbf24' }}>Subscription cancels on {periodEnd}</p>
              <p className="mt-0.5 text-sm" style={{ color: MUTED }}>
                You'll retain Pro access until then. Reactivate any time in the billing portal.
              </p>
            </div>
          </div>
        )}

        <section className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          {/* Plan card — blue glow */}
          <article
            className="rounded-2xl p-6"
            style={{
              background: CARD,
              border: '1px solid #3c91ed',
              boxShadow: '0 0 0 1px #3c91ed, 0 0 24px #3c91ed20',
            }}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide" style={{ color: MUTED }}>Current Plan</p>
              {subscription?.demo && (
                <span
                  className="rounded px-2 py-0.5 text-xs font-medium"
                  style={{ background: '#fbbf2418', color: '#fbbf24', border: '1px solid #fbbf2430' }}
                >
                  Demo mode
                </span>
              )}
            </div>

            <div className="mt-2 flex items-center gap-3">
              <h3 className="text-2xl font-bold capitalize" style={{ color: TEXT }}>{subscription?.tier || 'Free'}</h3>
              <StatusBadge status={subscription?.status || 'inactive'} />
            </div>

            {periodEnd && (
              <p className="mt-1 text-xs" style={{ color: MUTED }}>
                {cancelAtEnd ? 'Cancels' : isCanceled ? 'Expired' : 'Renews'}{' '}
                <span className="font-medium" style={{ color: TEXT }}>{periodEnd}</span>
              </p>
            )}

            {/* Usage meters (demo) */}
            {isDemo && (
              <div className="mt-5 space-y-3">
                <div>
                  <div className="mb-1 flex justify-between text-xs" style={{ color: MUTED }}>
                    <span>AI Tokens</span>
                    <span style={{ color: TEXT }}>{tokenUsed.toLocaleString()} / {tokenTotal.toLocaleString()}</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'oklch(20% .008 255)' }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${tokenPct}%`, background: '#34d399' }}
                    />
                  </div>
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-xs" style={{ color: MUTED }}>
                    <span>Campaigns</span>
                    <span style={{ color: TEXT }}>{campaignsUsed} / {campaignsTotal}</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'oklch(20% .008 255)' }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${campaignsPct}%`, background: campaignsPct > 70 ? '#fbbf24' : '#34d399' }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="mt-5 flex flex-wrap gap-3">
              {isActive && isPro ? (
                <button
                  onClick={openPortal}
                  disabled={busy}
                  className="rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60"
                  style={{ background: BORDER, color: TEXT, border: `1px solid ${BORDER}` }}
                >
                  {busy ? <Loader2 className="inline h-4 w-4 animate-spin" /> : 'Manage Subscription'}
                </button>
              ) : (
                <>
                  <button
                    onClick={startCheckout}
                    disabled={busy}
                    className="rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 transition-all hover:scale-[1.02]"
                    style={{
                      background: 'linear-gradient(135deg, #3c91ed, #2563eb)',
                      boxShadow: '0 0 16px #3c91ed40',
                    }}
                  >
                    {busy ? <Loader2 className="inline h-4 w-4 animate-spin" /> : 'Upgrade to Pro →'}
                  </button>
                  {(isPro || isCanceled) && (
                    <button
                      onClick={openPortal}
                      disabled={busy}
                      className="rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60"
                      style={{ background: BORDER, color: TEXT, border: `1px solid ${BORDER}` }}
                    >
                      Billing Portal
                    </button>
                  )}
                </>
              )}
            </div>
          </article>

          {/* Plan features card */}
          <article
            className="rounded-2xl p-6"
            style={{ background: CARD, border: `1px solid ${BORDER}` }}
          >
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="h-4 w-4" style={{ color: MUTED }} />
              <h3 className="text-sm font-semibold" style={{ color: TEXT }}>{isPro ? 'Pro includes' : 'Free includes'}</h3>
            </div>
            <ul className="space-y-2">
              {(isPro ? PRO_FEATURES : FREE_FEATURES).map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm" style={{ color: MUTED }}>
                  <CheckCircle2
                    className="h-4 w-4 flex-shrink-0"
                    style={{ color: isPro ? '#34d399' : MUTED }}
                  />
                  {f}
                </li>
              ))}
            </ul>
            {!isPro && (
              <p className="mt-4 text-xs" style={{ color: MUTED }}>
                Pro unlocks everything — starting at $49/mo.
              </p>
            )}
          </article>
        </section>

        {/* Invoice history */}
        <section
          className="rounded-2xl p-6"
          style={{ background: CARD, border: `1px solid ${BORDER}` }}
        >
          <div className="mb-4 flex items-center gap-2">
            <Receipt className="h-5 w-5" style={{ color: MUTED }} />
            <h3 className="text-sm font-semibold" style={{ color: TEXT }}>Invoice History</h3>
          </div>
          {invoices.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <Receipt className="mb-3 h-9 w-9" style={{ color: BORDER }} />
              <p className="text-sm font-medium" style={{ color: MUTED }}>No invoices yet</p>
              <p className="mt-1 text-xs" style={{ color: MUTED }}>
                Your invoices will appear here after your first billing cycle.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr
                    className="text-xs uppercase tracking-wide"
                    style={{ borderBottom: `1px solid ${BORDER}`, color: MUTED }}
                  >
                    <th className="pb-2 pt-1 font-medium">Invoice</th>
                    <th className="pb-2 pt-1 font-medium">Amount</th>
                    <th className="pb-2 pt-1 font-medium">Status</th>
                    <th className="pb-2 pt-1 font-medium">Date</th>
                    <th className="pb-2 pt-1 font-medium">Link</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      style={{ borderBottom: `1px solid ${BORDER}` }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'oklch(11% .008 255)'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                    >
                      <td className="py-3 font-mono text-xs" style={{ color: MUTED }}>{invoice.id.slice(-12)}</td>
                      <td className="py-3 font-medium" style={{ color: TEXT }}>
                        {(invoice.amount_paid / 100).toFixed(2)}{' '}
                        <span className="text-xs" style={{ color: MUTED }}>{invoice.currency.toUpperCase()}</span>
                      </td>
                      <td className="py-3">
                        <InvoiceStatusBadge status={invoice.status} />
                      </td>
                      <td className="py-3" style={{ color: MUTED }}>
                        {invoice.created_at
                          ? new Date(invoice.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : '-'}
                      </td>
                      <td className="py-3">
                        {invoice.hosted_invoice_url ? (
                          <a
                            className="inline-flex items-center gap-1 text-xs font-medium"
                            style={{ color: '#3c91ed' }}
                            href={invoice.hosted_invoice_url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            View <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span style={{ color: BORDER }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
