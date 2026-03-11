import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-api";
import { Download, Check, TrendingUp, Zap, CreditCard, Users, Brain, Search, PenTool, Mail, Share2, BarChart3, Megaphone, Target, ArrowUpRight } from "lucide-react";

const INVOICES = [
  { id: "INV-2025-03", date: "Mar 1, 2025", amount: "$299.00", status: "Paid" },
  { id: "INV-2025-02", date: "Feb 1, 2025", amount: "$299.00", status: "Paid" },
  { id: "INV-2025-01", date: "Jan 1, 2025", amount: "$299.00", status: "Paid" },
  { id: "INV-2024-12", date: "Dec 1, 2024", amount: "$299.00", status: "Paid" },
];

const AGENT_USAGE = [
  { name: "SEO Agent",        calls: 2840, icon: Search,    color: "text-sky-400",     pct: 94 },
  { name: "Analytics Agent",  calls: 2210, icon: BarChart3, color: "text-primary",     pct: 74 },
  { name: "Creative Agent",   calls: 1840, icon: PenTool,   color: "text-violet-400",  pct: 61 },
  { name: "Email/CRM Agent",  calls: 1560, icon: Mail,      color: "text-emerald-400", pct: 52 },
  { name: "Paid Ads Agent",   calls: 1200, icon: Megaphone, color: "text-orange-400",  pct: 40 },
  { name: "Social Agent",     calls: 980,  icon: Share2,    color: "text-pink-400",    pct: 33 },
  { name: "Content Agent",    calls: 840,  icon: PenTool,   color: "text-amber-400",   pct: 28 },
  { name: "Growth Agent",     calls: 720,  icon: TrendingUp,color: "text-teal-400",    pct: 24 },
  { name: "PR & Media Agent", calls: 540,  icon: Users,     color: "text-rose-400",    pct: 18 },
  { name: "Orchestrator",     calls: 12500,icon: Brain,     color: "text-primary",     pct: 100 },
];

const PLANS = [
  {
    name: "Starter",
    price: "$119",
    features: ["5 AI agents", "1 workspace", "50K AI calls/mo", "Basic analytics", "Email support"],
    current: false,
  },
  {
    name: "Growth",
    price: "$299",
    features: ["All 10 agents", "3 workspaces", "300K AI calls/mo", "Advanced analytics", "Priority support", "Unlimited integrations"],
    current: true,
  },
  {
    name: "Scale",
    price: "$499",
    features: ["All 10 agents", "Unlimited workspaces", "1M AI calls/mo", "Custom agent config", "Dedicated CSM", "White-label"],
    current: false,
  },
];

export function Billing() {
  const { user } = useAuth();
  if (!user) return null;

  const usagePercent = Math.min(100, Math.round((user.aiCallsUsed / user.aiCallsLimit) * 100));
  const agencySavings = 180000;
  const annualCost = 299 * 12;
  const savings = agencySavings - annualCost;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto pb-10">
      <div>
        <h2 className="text-3xl font-display font-bold">Billing & Usage</h2>
        <p className="text-muted-foreground mt-1">Manage your subscription, usage, and invoices.</p>
      </div>

      {/* ROI Banner */}
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 flex items-center gap-5">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 flex items-center justify-center shrink-0">
          <TrendingUp className="w-6 h-6 text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-foreground">You're saving <span className="text-emerald-400">${savings.toLocaleString()}/year</span> vs. a traditional agency retainer</p>
          <p className="text-xs text-muted-foreground mt-1">Average agency cost: $180K/yr · Your cost: $3,588/yr · ROI: {Math.round((savings / annualCost) * 100)}%</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xl font-bold text-emerald-400 font-mono">{Math.round((savings / annualCost) * 100)}%</p>
          <p className="text-[10px] text-emerald-400">ROI</p>
        </div>
      </div>

      {/* Current Plan + Usage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card border-border/50 rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-border/50 pb-4 bg-primary/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Current Plan</p>
                <CardTitle className="text-2xl text-primary flex items-center gap-2">
                  {user.plan}
                  <Badge className="bg-primary/20 text-primary border-0 text-xs">Active</Badge>
                </CardTitle>
              </div>
              <CreditCard className="w-8 h-8 text-primary/30" />
            </div>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-extrabold font-mono text-foreground">$299</span>
              <span className="text-muted-foreground">/month</span>
              <Badge className="ml-2 bg-amber-500/10 text-amber-400 border-0 text-[10px]">Beta Lock-in</Badge>
            </div>
            <ul className="space-y-2">
              {["All 10 AI agents active", "3 brand workspaces", "Advanced analytics", "Priority support", "Unlimited integrations"].map((f) => (
                <li key={f} className="flex items-center text-sm gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-foreground/80">{f}</span>
                </li>
              ))}
            </ul>
            <div className="flex gap-2 pt-2">
              <Button className="flex-1 bg-primary text-white hover:bg-primary/90 h-9 text-sm">Upgrade to Scale</Button>
              <Button variant="outline" className="bg-background h-9 text-sm">Cancel</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50 rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-border/50 pb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <CardTitle className="text-base m-0">AI Calls This Month</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-3xl font-bold font-mono text-foreground">{user.aiCallsUsed.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">of {user.aiCallsLimit.toLocaleString()} calls</p>
              </div>
              <span className={`text-sm font-bold px-2 py-1 rounded-lg ${usagePercent > 80 ? "text-amber-400 bg-amber-400/10" : "text-emerald-400 bg-emerald-400/10"}`}>{usagePercent}%</span>
            </div>
            <Progress value={usagePercent} className="h-2.5 bg-muted [&>div]:bg-primary" />
            <p className="text-xs text-muted-foreground">Resets Nov 1st · Auto-scale enabled on Scale plan</p>

            <div className="pt-2 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">Usage by agent</p>
              {AGENT_USAGE.filter(a => a.name !== "Orchestrator").slice(0, 5).map((a) => (
                <div key={a.name} className="flex items-center gap-2">
                  <a.icon className={`w-3 h-3 shrink-0 ${a.color}`} />
                  <span className="text-[11px] text-foreground w-28 shrink-0">{a.name}</span>
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full`} style={{ width: `${a.pct}%`, backgroundColor: `hsl(var(--primary))` }} />
                  </div>
                  <span className="text-[10px] text-muted-foreground w-10 text-right font-mono">{(a.calls / 1000).toFixed(1)}K</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plan Comparison */}
      <div>
        <h3 className="text-xl font-bold mb-4">Plan Comparison</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map((plan) => (
            <Card key={plan.name} className={`rounded-2xl overflow-hidden ${plan.current ? "border-primary/40 bg-primary/5 shadow-lg shadow-primary/10" : "bg-card border-border/50"}`}>
              {plan.current && <div className="h-1 bg-gradient-to-r from-primary to-blue-400" />}
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className={`font-bold text-lg ${plan.current ? "text-primary" : "text-foreground"}`}>{plan.name}</h4>
                  {plan.current && <Badge className="bg-primary/20 text-primary border-0 text-xs">Current</Badge>}
                </div>
                <p className="text-3xl font-bold font-mono text-foreground mb-4">{plan.price}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                <ul className="space-y-2 mb-4">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs">
                      <Check className={`w-3.5 h-3.5 shrink-0 ${plan.current ? "text-primary" : "text-emerald-400"}`} />
                      <span className="text-foreground/70">{f}</span>
                    </li>
                  ))}
                </ul>
                {!plan.current && (
                  <Button className={`w-full h-8 text-xs font-semibold ${plan.name === "Scale" ? "bg-primary hover:bg-primary/90 text-white" : "bg-background border border-border hover:bg-border/50 text-foreground"}`}>
                    {plan.name === "Scale" ? "Upgrade" : "Downgrade"}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Invoices */}
      <Card className="bg-card border-border/50 rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-border/50 pb-4 flex flex-row items-center gap-2">
          <CreditCard className="w-4 h-4 text-primary" />
          <CardTitle className="text-base m-0">Invoice History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/40">
            {INVOICES.map((inv) => (
              <div key={inv.id} className="px-6 py-4 flex items-center justify-between hover:bg-muted/20 transition-colors">
                <div>
                  <p className="font-medium text-sm text-foreground">{inv.date}</p>
                  <p className="text-xs text-muted-foreground">{inv.id}</p>
                </div>
                <div className="flex items-center gap-5">
                  <span className="font-mono font-semibold text-foreground">{inv.amount}</span>
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-0 text-xs">{inv.status}</Badge>
                  <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-foreground">
                    <Download className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
