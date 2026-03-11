import { useGrowthData } from "@/hooks/use-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/utils";
import { Loader2, TrendingUp, Users, Target, Zap, ArrowUpRight, ArrowDownRight, FlaskConical, Trophy, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, AreaChart, Area } from "recharts";

const FUNNEL_STAGES = [
  { stage: "Website Visitors",  count: 48200, prev: 41500, rate: null,  color: "#6366f1" },
  { stage: "Free Sign-ups",     count: 3840,  prev: 3200,  rate: "8.0%", color: "#818cf8" },
  { stage: "Activated Users",   count: 2112,  prev: 1760,  rate: "55%",  color: "#a5b4fc" },
  { stage: "Trial → Paid",      count: 528,   prev: 440,   rate: "25%",  color: "#10b981" },
  { stage: "Expansion MRR",     count: 211,   prev: 158,   rate: "40%",  color: "#34d399" },
];

const WEEKLY_SIGNUPS = [
  { week: "W1", signups: 180, paid: 35 },
  { week: "W2", signups: 210, paid: 42 },
  { week: "W3", signups: 195, paid: 38 },
  { week: "W4", signups: 240, paid: 55 },
  { week: "W5", signups: 285, paid: 62 },
  { week: "W6", signups: 260, paid: 58 },
  { week: "W7", signups: 310, paid: 72 },
  { week: "W8", signups: 348, paid: 84 },
];

const CHANNELS = [
  { name: "Organic Search", signups: 1240, cac: 32, color: "#6366f1" },
  { name: "LinkedIn Ads",   signups: 680,  cac: 148, color: "#818cf8" },
  { name: "Email Referral", signups: 520,  cac: 18,  color: "#10b981" },
  { name: "Product Hunt",   signups: 340,  cac: 0,   color: "#f59e0b" },
  { name: "Cold Outbound",  signups: 280,  cac: 92,  color: "#ec4899" },
];

export function Growth() {
  const { data, isLoading } = useGrowthData();

  if (isLoading || !data) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Growth Agent loading your funnel data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold">Growth & Funnel</h2>
          <p className="text-muted-foreground mt-1">Full-funnel optimization powered by your Growth Agent.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/20 h-9 text-sm">
          <Zap className="w-4 h-4 mr-2" />Run Growth Audit
        </Button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Monthly Visitors",  val: "48.2K", change: +16,   icon: Users,       color: "text-primary" },
          { label: "Trial Signups",     val: "3,840", change: +20,   icon: TrendingUp,  color: "text-emerald-400" },
          { label: "Trial → Paid",      val: "13.7%", change: +2.4,  icon: Target,      color: "text-sky-400" },
          { label: "Avg. ROAS",         val: "5.3×",  change: +32,   icon: BarChart3,   color: "text-violet-400" },
        ].map((k) => (
          <Card key={k.label} className="bg-card border-border/50 rounded-2xl hover:border-primary/20 transition-colors">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <k.icon className={`w-5 h-5 ${k.color}`} />
                <span className={`text-xs font-semibold flex items-center gap-0.5 px-1.5 py-0.5 rounded ${k.change > 0 ? "text-emerald-400 bg-emerald-400/10" : "text-rose-400 bg-rose-400/10"}`}>
                  {k.change > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}{Math.abs(k.change)}%
                </span>
              </div>
              <p className="text-2xl font-bold font-mono text-foreground">{k.val}</p>
              <p className="text-xs text-muted-foreground mt-1">{k.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Conversion Funnel */}
        <Card className="lg:col-span-2 bg-card border-border/50 rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle className="text-base">Conversion Funnel</CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            {FUNNEL_STAGES.map((stage, i) => {
              const pct = (stage.count / FUNNEL_STAGES[0].count) * 100;
              const change = Math.round(((stage.count - stage.prev) / stage.prev) * 100);
              return (
                <div key={stage.stage}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-foreground">{stage.stage}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground">{formatNumber(stage.count)}</span>
                      {stage.rate && <span className="text-[10px] text-muted-foreground">→ {stage.rate}</span>}
                      <span className={`text-[10px] font-bold ${change > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {change > 0 ? "+" : ""}{change}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: stage.color }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Weekly Signups Chart */}
        <Card className="lg:col-span-3 bg-card border-border/50 rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle className="text-base">Weekly Signups vs Paid Conversions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[260px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={WEEKLY_SIGNUPS} margin={{ top: 0, right: 16, left: -20, bottom: 0 }}>
                  <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                  <Bar dataKey="signups" fill="hsl(var(--primary) / 0.3)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="paid" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* A/B Tests */}
        <Card className="bg-card border-border/50 rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-border/50 pb-4 flex flex-row items-center gap-2">
            <FlaskConical className="w-4 h-4 text-primary" />
            <CardTitle className="text-base m-0">Active A/B Tests</CardTitle>
            <Badge className="ml-auto bg-amber-500/10 text-amber-400 border-0 text-xs">3 Running</Badge>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            {(data.abTests ?? []).map((test: any) => (
              <div key={test.id} className="bg-background rounded-xl p-4 border border-border/50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-sm text-foreground">{test.name}</h4>
                  <Badge className={test.status === "running" ? "bg-amber-500/10 text-amber-400 border-0 text-xs" : "bg-emerald-500/10 text-emerald-400 border-0 text-xs"}>
                    {test.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-card p-3 rounded-lg border border-border/40">
                    <p className="text-[10px] text-muted-foreground mb-1">Variant A (Control)</p>
                    <p className="text-xs font-medium text-foreground truncate">"{test.variantA}"</p>
                    <p className="mt-2 text-xl font-bold text-foreground">{test.winnerConversionA}%</p>
                    <div className="mt-1.5 h-1 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-muted-foreground rounded-full" style={{ width: `${test.winnerConversionA * 10}%` }} />
                    </div>
                  </div>
                  <div className={`bg-card p-3 rounded-lg border ${test.winnerConversionB > test.winnerConversionA ? "border-emerald-500/40 bg-emerald-500/5" : "border-border/40"}`}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[10px] text-muted-foreground">Variant B</p>
                      {test.winnerConversionB > test.winnerConversionA && (
                        <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5"><Trophy className="w-2.5 h-2.5" />Winner</span>
                      )}
                    </div>
                    <p className="text-xs font-medium text-foreground truncate">"{test.variantB}"</p>
                    <p className={`mt-2 text-xl font-bold ${test.winnerConversionB > test.winnerConversionA ? "text-emerald-400" : "text-foreground"}`}>{test.winnerConversionB}%</p>
                    <div className="mt-1.5 h-1 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${test.winnerConversionB > test.winnerConversionA ? "bg-emerald-400" : "bg-muted-foreground"}`} style={{ width: `${test.winnerConversionB * 10}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Channel Performance */}
        <Card className="bg-card border-border/50 rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle className="text-base">Channel Performance</CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            {CHANNELS.map((ch) => {
              const pct = (ch.signups / CHANNELS[0].signups) * 100;
              return (
                <div key={ch.name} className="flex items-center gap-3">
                  <div className="w-28 shrink-0">
                    <p className="text-xs font-semibold text-foreground truncate">{ch.name}</p>
                    <p className="text-[10px] text-muted-foreground">CAC: {ch.cac === 0 ? "Free" : `$${ch.cac}`}</p>
                  </div>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: ch.color }} />
                  </div>
                  <span className="text-xs font-bold text-foreground w-12 text-right font-mono">{formatNumber(ch.signups)}</span>
                </div>
              );
            })}

            <div className="mt-4 pt-4 border-t border-border/30 bg-background rounded-xl p-3">
              <p className="text-xs font-semibold text-primary mb-1.5 flex items-center gap-1.5"><Zap className="w-3 h-3" />AI Recommendation</p>
              <p className="text-xs text-foreground/70 leading-relaxed">Email referral has the lowest CAC ($18). Investing $2K in a referral incentive program could generate ~111 additional trial signups at current conversion rates.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
