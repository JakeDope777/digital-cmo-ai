import { useEffect, useState } from 'react';
import { CreditCard, ExternalLink, Loader2, Receipt, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { billingService } from '../services/api';
import { trackEvent } from '../services/analytics';

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
  const map: Record<string, string> = {
    active: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    trialing: 'bg-blue-50 text-blue-700 border border-blue-200',
    past_due: 'bg-amber-50 text-amber-700 border border-amber-200',
    canceled: 'bg-red-50 text-red-700 border border-red-200',
    unpaid: 'bg-red-50 text-red-700 border border-red-200',
    inactive: 'bg-slate-100 text-slate-500 border border-slate-200',
  };
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${map[status] ?? 'bg-slate-100 text-slate-500'}`}>
      {status}
    </span>
  );
}

function InvoiceStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    paid: 'bg-emerald-50 text-emerald-700',
    open: 'bg-amber-50 text-amber-700',
    draft: 'bg-slate-100 text-slate-500',
    void: 'bg-slate-100 text-slate-500',
    uncollectible: 'bg-red-50 text-red-700',
  };
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium capitalize ${map[status] ?? 'bg-slate-100 text-slate-500'}`}>
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

export default function BillingPage() {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);

  const refresh = async () => {
    setLoading(true);
    setError('');
    try {
      const [subData, invoiceData] = await Promise.all([
        billingService.getSubscription(),
        billingService.getInvoices(),
      ]);
      setSubscription(subData);
      setInvoices(invoiceData.invoices || []);
    } catch {
      setError('Unable to load billing data right now.');
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
  }, []);

  const startCheckout = async () => {
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
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-700" />
      </div>
    );
  }

  const isActive = subscription?.status === 'active' || subscription?.status === 'trialing';
  const isPro = subscription?.tier === 'pro';
  const isPastDue = subscription?.status === 'past_due';
  const isCanceled = subscription?.status === 'canceled';
  const cancelAtEnd = subscription?.cancel_at_period_end;
  const periodEnd = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Billing</h2>
        <p className="text-sm text-slate-500">Manage your plan, payments, and invoices.</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Past-due warning */}
      {isPastDue && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Payment past due</p>
            <p className="mt-0.5 text-sm text-amber-700">
              We couldn't collect your last payment. Update your card in the billing portal to restore full access.
            </p>
          </div>
        </div>
      )}

      {/* Cancellation warning */}
      {cancelAtEnd && periodEnd && (
        <div className="flex items-start gap-3 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3">
          <Clock className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-600" />
          <div>
            <p className="text-sm font-semibold text-orange-800">Subscription cancels on {periodEnd}</p>
            <p className="mt-0.5 text-sm text-orange-700">
              You'll retain Pro access until then. Reactivate any time in the billing portal.
            </p>
          </div>
        </div>
      )}

      <section className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        {/* Plan card */}
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Current Plan</p>
            {subscription?.demo && (
              <span className="rounded bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 border border-amber-200">
                Test mode
              </span>
            )}
          </div>

          <div className="mt-2 flex items-center gap-3">
            <h3 className="text-2xl font-bold text-slate-900 capitalize">{subscription?.tier || 'Free'}</h3>
            <StatusBadge status={subscription?.status || 'inactive'} />
          </div>

          {periodEnd && (
            <p className="mt-1 text-xs text-slate-500">
              {cancelAtEnd ? 'Cancels' : isCanceled ? 'Expired' : 'Renews'}{' '}
              <span className="font-medium text-slate-700">{periodEnd}</span>
            </p>
          )}

          <div className="mt-5 flex flex-wrap gap-3">
            {isActive && isPro ? (
              <button
                onClick={openPortal}
                disabled={busy}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60 transition-colors"
              >
                {busy ? <Loader2 className="inline h-4 w-4 animate-spin" /> : 'Manage Subscription'}
              </button>
            ) : (
              <>
                <button
                  onClick={startCheckout}
                  disabled={busy}
                  className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60 transition-colors shadow-sm shadow-orange-200"
                >
                  {busy ? <Loader2 className="inline h-4 w-4 animate-spin" /> : 'Upgrade to Pro →'}
                </button>
                {(isPro || isCanceled) && (
                  <button
                    onClick={openPortal}
                    disabled={busy}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60 transition-colors"
                  >
                    Billing Portal
                  </button>
                )}
              </>
            )}
          </div>
        </article>

        {/* Plan features card */}
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="h-4 w-4 text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-700">{isPro ? 'Pro includes' : 'Free includes'}</h3>
          </div>
          <ul className="space-y-2">
            {(isPro ? PRO_FEATURES : FREE_FEATURES).map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                <CheckCircle2 className={`h-4 w-4 flex-shrink-0 ${isPro ? 'text-emerald-500' : 'text-slate-400'}`} />
                {f}
              </li>
            ))}
          </ul>
          {!isPro && (
            <p className="mt-4 text-xs text-slate-400">
              Pro unlocks everything — starting at $49/mo.
            </p>
          )}
        </article>
      </section>

      {/* Invoice history */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Receipt className="h-5 w-5 text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-800">Invoice History</h3>
        </div>
        {invoices.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-center">
            <Receipt className="mb-3 h-9 w-9 text-slate-300" />
            <p className="text-sm font-medium text-slate-500">No invoices yet</p>
            <p className="mt-1 text-xs text-slate-400">
              Your invoices will appear here after your first billing cycle.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                  <th className="pb-2 pt-1 font-medium">Invoice</th>
                  <th className="pb-2 pt-1 font-medium">Amount</th>
                  <th className="pb-2 pt-1 font-medium">Status</th>
                  <th className="pb-2 pt-1 font-medium">Date</th>
                  <th className="pb-2 pt-1 font-medium">Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="py-3 font-mono text-xs text-slate-600">{invoice.id.slice(-12)}</td>
                    <td className="py-3 font-medium text-slate-800">
                      {(invoice.amount_paid / 100).toFixed(2)}{' '}
                      <span className="text-xs text-slate-400">{invoice.currency.toUpperCase()}</span>
                    </td>
                    <td className="py-3">
                      <InvoiceStatusBadge status={invoice.status} />
                    </td>
                    <td className="py-3 text-slate-500">
                      {invoice.created_at
                        ? new Date(invoice.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : '-'}
                    </td>
                    <td className="py-3">
                      {invoice.hosted_invoice_url ? (
                        <a
                          className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-700 text-xs font-medium"
                          href={invoice.hosted_invoice_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-slate-300">—</span>
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
  );
}
