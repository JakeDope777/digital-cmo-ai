/**
 * Billing page — real Stripe integration.
 *
 * "Upgrade" buttons call POST /billing/checkout and redirect the browser to
 * the Stripe-hosted checkout URL.
 * "Manage Subscription" calls POST /billing/portal and redirects to the
 * Stripe billing portal.
 *
 * Current plan is inferred from the subscription API response and displayed
 * prominently on the page.
 */

import { memo, useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { billingService } from "@/services/api";
import {
  ArrowDownTrayIcon,
  CheckIcon,
  ArrowTrendingUpIcon,
  BoltIcon,
  CreditCardIcon,
  UsersIcon,
  CpuChipIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  EnvelopeIcon,
  ShareIcon,
  ChartBarIcon,
  MegaphoneIcon,
  ArrowUpRightIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

// ---------------------------------------------------------------------------
// Static data
// ---------------------------------------------------------------------------

const AGENT_USAGE = [
  { name: "Orchestrator",     calls: 12500, icon: CpuChipIcon,         color: "bg-indigo-500",  pct: 100 },
  { name: "SEO Agent",        calls: 2840,  icon: MagnifyingGlassIcon, color: "bg-sky-500",     pct: 94  },
  { name: "Analytics Agent",  calls: 2210,  icon: ChartBarIcon,        color: "bg-violet-500",  pct: 74  },
  { name: "Creative Agent",   calls: 1840,  icon: PencilSquareIcon,    color: "bg-purple-500",  pct: 61  },
  { name: "Email/CRM Agent",  calls: 1560,  icon: EnvelopeIcon,        color: "bg-emerald-500", pct: 52  },
  { name: "Paid Ads Agent",   calls: 1200,  icon: MegaphoneIcon,       color: "bg-orange-500",  pct: 40  },
  { name: "Social Agent",     calls: 980,   icon: ShareIcon,           color: "bg-pink-500",    pct: 33  },
  { name: "Content Agent",    calls: 840,   icon: PencilSquareIcon,    color: "bg-amber-500",   pct: 28  },
  { name: "Growth Agent",     calls: 720,   icon: ArrowTrendingUpIcon,  color: "bg-teal-500",    pct: 24  },
  { name: "PR & Media Agent", calls: 540,   icon: UsersIcon,            color: "bg-rose-500",    pct: 18  },
];

interface PlanCard {
  id: "free" | "pro" | "enterprise";
  name: string;
  price: string;
  period: string;
  stripePlan: string;
  features: string[];
  highlight: boolean;
}

const PLANS: PlanCard[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "/mo",
    stripePlan: "free",
    features: [
      "3 AI agents",
      "1 workspace",
      "10K AI calls/mo",
      "Basic analytics",
      "Community support",
    ],
    highlight: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$99",
    period: "/mo",
    stripePlan: "pro",
    features: [
      "All 10 agents",
      "3 workspaces",
      "100K AI calls/mo",
      "Advanced analytics",
      "Priority support",
      "Unlimited integrations",
    ],
    highlight: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "$499",
    period: "/mo",
    stripePlan: "enterprise",
    features: [
      "All 10 agents",
      "Unlimited workspaces",
      "1M AI calls/mo",
      "Custom agent config",
      "Dedicated CSM",
      "White-label",
      "SLA guarantee",
    ],
    highlight: false,
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const Billing = memo(function Billing() {
  const { user } = useAuth();

  // ── Subscription state ────────────────────────────────────────────
  const [subscription, setSubscription] = useState<{
    tier: string;
    status: string;
    stripe_subscription_id?: string;
    current_period_end?: string;
    cancel_at_period_end?: boolean;
    demo?: boolean;
  } | null>(null);
  const [invoices, setInvoices] = useState<Array<{
    id: string;
    amount_due: number;
    amount_paid: number;
    currency: string;
    status: string;
    hosted_invoice_url?: string;
    invoice_pdf?: string;
    period_start?: string;
    period_end?: string;
    created_at?: string;
  }>>([]);
  const [subLoading, setSubLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null); // plan id
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Load subscription + invoices on mount ────────────────────────
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [sub, inv] = await Promise.all([
          billingService.getSubscription(),
          billingService.getInvoices(),
        ]);
        if (!cancelled) {
          setSubscription(sub);
          setInvoices(inv.invoices ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to load billing data:", err);
        }
      } finally {
        if (!cancelled) setSubLoading(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, []);

  // ── Checkout — redirect to Stripe hosted page ─────────────────────
  const handleUpgrade = useCallback(async (plan: string) => {
    setCheckoutLoading(plan);
    setError(null);
    try {
      const result = await billingService.createCheckoutSession(plan);
      const url = result.checkout_url;
      if (url) {
        window.location.href = url;
      } else {
        setError("Checkout session returned no URL. Please try again.");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setError("Failed to start checkout. Please try again or contact support.");
    } finally {
      setCheckoutLoading(null);
    }
  }, []);

  // ── Portal — redirect to Stripe billing portal ────────────────────
  const handlePortal = useCallback(async () => {
    setPortalLoading(true);
    setError(null);
    try {
      const result = await billingService.createPortalSession();
      const url = result.portal_url;
      if (url) {
        window.location.href = url;
      } else {
        setError("Portal session returned no URL. Please try again.");
      }
    } catch (err) {
      console.error("Portal error:", err);
      setError("Failed to open billing portal. Please try again or contact support.");
    } finally {
      setPortalLoading(false);
    }
  }, []);

  if (!user) return null;

  const currentPlan = (subscription?.tier ?? "free") as "free" | "pro" | "enterprise";
  const isActive = subscription?.status === "active" || subscription?.status === "trialing";
  const cancelAtPeriodEnd = subscription?.cancel_at_period_end ?? false;

  // Usage — fall back to zeros if not available on user object
  const aiCallsUsed = (user as any).aiCallsUsed ?? 0;
  const aiCallsLimit = (user as any).aiCallsLimit ?? 10000;
  const usagePercent = Math.min(100, aiCallsLimit > 0 ? Math.round((aiCallsUsed / aiCallsLimit) * 100) : 0);

  const agencySavings = 180_000;
  const annualCost = (currentPlan === "enterprise" ? 499 : currentPlan === "pro" ? 99 : 0) * 12;
  const savings = agencySavings - annualCost;

  const currentPlanCard = PLANS.find((p) => p.id === currentPlan) ?? PLANS[0];

  // Format period end date
  let renewsLabel = "";
  if (subscription?.current_period_end) {
    try {
      renewsLabel = `Renews ${new Date(subscription.current_period_end).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`;
    } catch {
      renewsLabel = "";
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto pb-10">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-100">Billing & Usage</h2>
        <p className="text-slate-400 mt-1">Manage your subscription, monitor AI usage, and track your ROI.</p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-5 py-3 text-sm text-rose-300">
          <ExclamationCircleIcon className="w-5 h-5 shrink-0" />
          <span>{error}</span>
          <button
            className="ml-auto text-rose-400 hover:text-rose-200 transition-colors"
            onClick={() => setError(null)}
          >
            ✕
          </button>
        </div>
      )}

      {/* Hero Plan Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600/30 via-[#111827] to-blue-900/20 border border-indigo-500/30 p-8">
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
          <CpuChipIcon className="w-48 h-48 text-indigo-400" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Badge className="bg-indigo-600 text-white border-0 text-xs px-3 py-1 font-semibold uppercase tracking-wide">
                Current Plan
              </Badge>
              {cancelAtPeriodEnd && (
                <Badge className="bg-amber-600/20 text-amber-400 border border-amber-500/30 text-xs px-2 py-1">
                  Cancels at period end
                </Badge>
              )}
              {renewsLabel && !cancelAtPeriodEnd && (
                <span className="text-xs text-slate-400">{renewsLabel}</span>
              )}
            </div>
            <h3 className="text-4xl font-bold text-slate-100">
              {currentPlanCard.name} Plan
              <span className="ml-3 text-2xl text-indigo-400 font-bold">{currentPlanCard.price}</span>
              <span className="text-base font-normal text-slate-400">{currentPlanCard.period}</span>
            </h3>
            <p className="text-slate-400 mt-2 text-sm">
              {currentPlanCard.features.slice(0, 3).join(" · ")}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            {isActive && (
              <Button
                variant="outline"
                className="border-slate-600 text-slate-300 bg-transparent hover:bg-slate-800 text-sm"
                onClick={handlePortal}
                disabled={portalLoading}
              >
                <CreditCardIcon className="w-4 h-4 mr-2" />
                {portalLoading ? "Loading…" : "Manage Billing"}
              </Button>
            )}
            {currentPlan !== "enterprise" && (
              <Button
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm shadow-lg shadow-indigo-600/25"
                onClick={() => handleUpgrade(currentPlan === "free" ? "pro" : "enterprise")}
                disabled={!!checkoutLoading}
              >
                <BoltIcon className="w-4 h-4 mr-2" />
                {checkoutLoading
                  ? "Loading…"
                  : currentPlan === "free"
                  ? "Upgrade to Pro"
                  : "Upgrade to Enterprise"}
              </Button>
            )}
          </div>
        </div>

        {/* Usage */}
        <div className="relative z-10 mt-6 pt-6 border-t border-white/10">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-slate-300 font-medium">AI Calls This Month</span>
            <span className="text-slate-400 tabular-nums">
              {aiCallsUsed.toLocaleString()} / {aiCallsLimit.toLocaleString()}
            </span>
          </div>
          <div className="h-2.5 bg-slate-800/80 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-700"
              style={{ width: `${usagePercent}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-1.5">{usagePercent}% used</p>
        </div>
      </div>

      {/* ROI Calculator */}
      {annualCost > 0 && (
        <Card className="bg-[#111827] border-slate-800 rounded-2xl">
          <CardHeader className="border-b border-slate-800 pb-4 flex flex-row items-center gap-2">
            <ArrowTrendingUpIcon className="w-4 h-4 text-emerald-400" />
            <CardTitle className="text-base text-slate-100 m-0">ROI vs. Traditional Agency</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Agency Cost (annual)", val: `$${(agencySavings / 1000).toFixed(0)}K`, color: "text-rose-400",    desc: "CMO + team equivalent" },
                { label: "Digital CMO (annual)", val: `$${(annualCost  / 1000).toFixed(0)}K`, color: "text-indigo-400",  desc: "All 10 agents included" },
                { label: "Annual Savings",       val: `$${(savings     / 1000).toFixed(0)}K`, color: "text-emerald-400", desc: `${Math.round((savings / agencySavings) * 100)}% cost reduction` },
              ].map((item) => (
                <div key={item.label} className="bg-slate-900 rounded-2xl p-5 text-center border border-slate-800">
                  <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider font-medium">{item.label}</p>
                  <p className={`text-3xl font-bold ${item.color}`}>{item.val}</p>
                  <div className={`flex items-center justify-center gap-1 mt-2 text-xs ${item.color}`}>
                    <ArrowUpRightIcon className="w-3 h-3" />{item.desc}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Agent Usage */}
      <Card className="bg-[#111827] border-slate-800 rounded-2xl">
        <CardHeader className="border-b border-slate-800 pb-4">
          <CardTitle className="text-base text-slate-100">Agent Usage Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-3">
          {AGENT_USAGE.map((agent) => (
            <div key={agent.name} className="flex items-center gap-4">
              <div className="flex items-center gap-2.5 w-44 shrink-0">
                <div className={`w-6 h-6 rounded-lg ${agent.color} bg-opacity-20 flex items-center justify-center flex-shrink-0`}>
                  <agent.icon className="w-3.5 h-3.5 text-slate-200" />
                </div>
                <span className="text-sm font-medium text-slate-300 truncate">{agent.name}</span>
              </div>
              <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${agent.color} transition-all duration-700`}
                  style={{ width: `${agent.pct}%`, opacity: 0.7 }}
                />
              </div>
              <span className="text-xs font-medium text-slate-400 w-16 text-right tabular-nums">
                {agent.calls.toLocaleString()}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Plan Comparison */}
      <div>
        <h3 className="text-xl font-bold text-slate-100 mb-4">Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PLANS.map((plan) => {
            const isCurrent = plan.id === currentPlan;
            const isLoadingThis = checkoutLoading === plan.stripePlan;
            const canUpgrade = !isCurrent && plan.id !== "free";

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border p-6 flex flex-col transition-all ${
                  plan.highlight && !isCurrent
                    ? "border-indigo-500/40 bg-[#111827] shadow-lg shadow-indigo-500/10"
                    : isCurrent
                    ? "border-indigo-500/60 bg-[#111827] shadow-xl shadow-indigo-500/10"
                    : "border-slate-800 bg-slate-900/40 hover:border-slate-700"
                }`}
              >
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-indigo-600 text-white border-0 px-3 shadow-md shadow-indigo-600/30">
                      Current Plan
                    </Badge>
                  </div>
                )}
                {plan.highlight && !isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-emerald-600 text-white border-0 px-3 shadow-md shadow-emerald-600/30">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <div className="mb-4">
                  <h4 className="font-bold text-lg text-slate-100">{plan.name}</h4>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className={`text-3xl font-bold ${isCurrent ? "text-indigo-400" : "text-slate-200"}`}>
                      {plan.price}
                    </span>
                    <span className="text-sm text-slate-400">{plan.period}</span>
                  </div>
                </div>

                <Separator className="bg-slate-800 mb-4" />

                <ul className="space-y-2.5 flex-1 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckIcon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <Button
                    className="bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 border-0 cursor-default"
                    disabled
                  >
                    Current Plan
                  </Button>
                ) : canUpgrade ? (
                  <Button
                    className="bg-indigo-600 hover:bg-indigo-700 text-white border-0"
                    onClick={() => handleUpgrade(plan.stripePlan)}
                    disabled={!!checkoutLoading}
                  >
                    {isLoadingThis ? "Redirecting…" : `Upgrade to ${plan.name}`}
                  </Button>
                ) : (
                  <Button
                    className="bg-slate-800 text-slate-400 hover:bg-slate-700 border-0"
                    disabled
                  >
                    Free Plan
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Invoices */}
      <Card className="bg-[#111827] border-slate-800 rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-slate-800 pb-4">
          <CardTitle className="text-base text-slate-100">Billing History</CardTitle>
        </CardHeader>
        {subLoading ? (
          <div className="p-8 text-center text-slate-500 text-sm">Loading invoices…</div>
        ) : invoices.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">No invoices yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-900/80 border-b border-slate-800">
                <tr className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3.5 text-left">Invoice</th>
                  <th className="px-5 py-3.5 text-left">Date</th>
                  <th className="px-5 py-3.5 text-right">Amount</th>
                  <th className="px-5 py-3.5 text-center">Status</th>
                  <th className="px-5 py-3.5 text-center">Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {invoices.map((inv) => {
                  const dateStr = inv.created_at
                    ? new Date(inv.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                    : "—";
                  const amountStr = inv.amount_paid > 0
                    ? `$${(inv.amount_paid / 100).toFixed(2)}`
                    : `$${(inv.amount_due / 100).toFixed(2)}`;
                  const isPaid = inv.status === "paid";

                  return (
                    <tr key={inv.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-4 font-medium text-slate-200 font-mono text-xs">
                        {inv.id.slice(0, 16)}…
                      </td>
                      <td className="px-5 py-4 text-slate-400">{dateStr}</td>
                      <td className="px-5 py-4 text-right font-semibold text-slate-200 tabular-nums">{amountStr}</td>
                      <td className="px-5 py-4 text-center">
                        <Badge className={`border-0 text-xs ${isPaid ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                          {isPaid && <CheckIcon className="w-3 h-3 mr-1" />}
                          {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-center">
                        {inv.invoice_pdf || inv.hosted_invoice_url ? (
                          <a
                            href={inv.invoice_pdf ?? inv.hosted_invoice_url ?? "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center mx-auto transition-colors"
                          >
                            <ArrowDownTrayIcon className="w-3.5 h-3.5 text-slate-400" />
                          </a>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
});
