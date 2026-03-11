import { useDashboardMetrics } from "@/hooks/use-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatNumber } from "@/lib/utils";
import {
  ArrowUpRight, ArrowDownRight, Sparkles, CheckCircle2, AlertCircle, Loader2,
  Brain, Search, PenTool, Target, Mail, Share2, BarChart3, Megaphone, Users, TrendingUp,
  Zap, ChevronRight,
} from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, BarChart, Bar, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const AGENT_ACTIVITY = [
  { icon: Search,    name: "SEO Agent",        status: "active", action: "847 keywords clustered · 12 briefs ready", color: "text-sky-400" },
  { icon: Target,    name: "Creative Agent",    status: "active", action: "12 ad variants written · A/B test live", color: "text-violet-400" },
  { icon: Mail,      name: "Email/CRM Agent",   status: "active", action: "47 leads re-engaged · 3 flows running", color: "text-emerald-400" },
  { icon: BarChart3, name: "Analytics Agent",   status: "active", action: "13 KPIs tracked · anomaly alert sent", color: "text-primary" },
  { icon: Megaphone, name: "Paid Ads Agent",    status: "active", action: "Reallocating $1,200 → Google Ads", color: "text-orange-400" },
  { icon: Share2,    name: "Social Agent",      status: "idle",   action: "Next post scheduled in 2h 14m", color: "text-pink-400" },
  { icon: PenTool,   name: "Content Agent",     status: "active", action: "3 long-form drafts in progress", color: "text-amber-400" },
  { icon: TrendingUp,name: "Growth Agent",      status: "idle",   action: "A/B test significance reached", color: "text-teal-400" },
  { icon: Users,     name: "PR & Media Agent",  status: "idle",   action: "2 journalist matches queued", color: "text-rose-400" },
  { icon: Brain,     name: "Orchestrator",      status: "active", action: "Coordinating 5 agents · memory synced", color: "text-primary" },
];

const WEEK_SPEND = [
  { day: "Mon", spend: 820, revenue: 4100 },
  { day: "Tue", spend: 940, revenue: 4800 },
  { day: "Wed", spend: 880, revenue: 5200 },
  { day: "Thu", spend: 1020, revenue: 6100 },
  { day: "Fri", spend: 960, revenue: 5700 },
  { day: "Sat", spend: 740, revenue: 3900 },
  { day: "Sun", spend: 680, revenue: 3600 },
];

export function Dashboard() {
  const { data: metrics, isLoading } = useDashboardMetrics();

  if (isLoading || !metrics) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-display font-bold">Dashboard</h2>
          <p className="text-muted-foreground mt-1">Your marketing performance — all 10 agents active.</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          AI CMO Active
        </div>
      </div>

      {/* AI Insight Banner */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 border border-primary/20">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-primary uppercase tracking-wide">AI CMO · Insight · just now</span>
            </div>
            <p className="text-sm text-foreground leading-relaxed">
              Google Ads CTR dropped 0.8% this week. Reallocating{" "}
              <strong className="text-foreground">$1,200</strong> from Meta to Google projects{" "}
              <span className="text-emerald-400 font-semibold">+$4,100 additional revenue</span> this month.
            </p>
            <div className="flex gap-2 mt-3">
              <Button size="sm" className="h-7 px-3 text-xs bg-primary hover:bg-primary/90 text-white">Apply Reallocation</Button>
              <Button size="sm" variant="outline" className="h-7 px-3 text-xs">View Analysis</Button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Pipeline Revenue" value="$248K" trend={18} />
        <KpiCard title="ROAS" value="5.3×" trend={32} suffix="vs 4.0× target" />
        <KpiCard title="CAC" value="$125" trend={-12.4} invertTrend />
        <KpiCard title="Active Campaigns" value="14" note="3 optimising" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Chart */}
        <Card className="lg:col-span-2 bg-card border-border/50 shadow-xl shadow-black/10 rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-border/50 pb-4 bg-card/50">
            <CardTitle className="text-base">Pipeline Generation (90 Days)</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[260px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.chartData} margin={{ top: 10, right: 16, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" hide />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                    itemStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2.5} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* AI Recommendations */}
        <Card className="bg-card border-border/50 shadow-xl shadow-black/10 rounded-2xl flex flex-col">
          <CardHeader className="border-b border-border/50 pb-4 flex flex-row items-center gap-2 bg-primary/5">
            <Sparkles className="w-4 h-4 text-primary" />
            <CardTitle className="text-base m-0">AI Insights</CardTitle>
          </CardHeader>
          <CardContent className="p-4 flex-1 flex flex-col gap-3">
            {[
              { title: "Increase LinkedIn Budget", body: "CPA is 15% lower than target. Reallocating from Meta will improve overall efficiency.", cta: "Apply Change" },
              { title: "A/B Test Email Subjects", body: "Recent onboarding sequence has 4% drop in open rates vs historical average.", cta: "Draft Variants" },
              { title: "Publish 2 SEO Articles", body: "3 high-opportunity clusters identified. Publishing now captures Q2 search intent.", cta: "Review Briefs" },
            ].map((ins) => (
              <div key={ins.title} className="bg-background rounded-xl p-4 border border-border">
                <h4 className="font-semibold text-sm mb-1 text-foreground">{ins.title}</h4>
                <p className="text-xs text-muted-foreground mb-3">{ins.body}</p>
                <Button size="sm" className="w-full text-xs h-7 bg-primary/10 text-primary hover:bg-primary/20">{ins.cta}</Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Spend vs Revenue Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-card border-border/50 rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle className="text-base">Spend vs Revenue — This Week</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[220px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={WEEK_SPEND} margin={{ top: 0, right: 16, left: -20, bottom: 0 }}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                    itemStyle={{ color: "hsl(var(--foreground))" }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
                  />
                  <Bar dataKey="spend"   fill="hsl(var(--primary) / 0.3)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))"       radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Campaigns */}
        <Card className="bg-card border-border/50 rounded-2xl">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle className="text-base">Top Campaigns</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {(metrics.topCampaigns ?? []).slice(0, 4).map((camp, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-background border border-border/50">
                <div>
                  <p className="text-xs font-semibold text-foreground truncate max-w-[130px]">{camp.name}</p>
                  <Badge variant="outline" className="mt-1 text-[10px] py-0 h-4 bg-transparent">{camp.channel}</Badge>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-emerald-400">{formatCurrency(camp.revenue ?? 0)}</p>
                  <p className="text-[10px] text-muted-foreground">{formatNumber(camp.leads ?? 0)} leads</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Agent Activity */}
      <Card className="bg-card border-border/50 rounded-2xl">
        <CardHeader className="border-b border-border/50 pb-4 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary" />
            <CardTitle className="text-base m-0">Agent Activity</CardTitle>
          </div>
          <span className="text-xs text-muted-foreground">7 active · 3 idle</span>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {AGENT_ACTIVITY.map((agent) => (
              <div key={agent.name} className="flex items-center gap-3 p-3 rounded-xl bg-background border border-border/50 hover:border-border transition-colors">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 ${agent.color}`}>
                  <agent.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-foreground">{agent.name}</span>
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${agent.status === "active" ? "bg-emerald-400/15 text-emerald-400" : "bg-muted text-muted-foreground"}`}>
                      {agent.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate mt-0.5">{agent.action}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Health + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-card border-border/50 rounded-2xl">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle className="text-base">System Health</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {(metrics.integrationHealth ?? []).map((int, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-background border border-border/50">
                <span className="font-medium text-sm">{int.name}</span>
                {int.status === "connected" ? (
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-0 text-xs">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Connected
                  </Badge>
                ) : (
                  <Badge className="bg-amber-500/10 text-amber-400 border-0 text-xs">
                    <AlertCircle className="w-3 h-3 mr-1" /> Warning
                  </Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 bg-card border-border/50 rounded-2xl">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-4 grid grid-cols-2 gap-3">
            {[
              { label: "Run SEO audit",         href: "/analysis",    color: "text-sky-400" },
              { label: "Write blog post",        href: "/creative",    color: "text-violet-400" },
              { label: "Launch email campaign",  href: "/crm",         color: "text-emerald-400" },
              { label: "Analyze paid ads",       href: "/growth",      color: "text-orange-400" },
              { label: "Schedule social posts",  href: "/creative",    color: "text-pink-400" },
              { label: "Ask AI CMO anything",    href: "/chat",        color: "text-primary" },
            ].map((action) => (
              <Link key={action.label} href={action.href}
                className="flex items-center justify-between p-3 rounded-xl bg-background border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all group">
                <span className={`text-xs font-semibold ${action.color}`}>{action.label}</span>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}

function KpiCard({
  title, value, trend, invertTrend = false, note, suffix,
}: {
  title: string; value: string; trend?: number; invertTrend?: boolean; note?: string; suffix?: string;
}) {
  const isPositive = trend !== undefined && (invertTrend ? trend < 0 : trend > 0);

  return (
    <Card className="bg-card border-border/50 shadow-lg shadow-black/5 rounded-2xl hover:border-primary/30 transition-all duration-300">
      <CardContent className="p-5">
        <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">{title}</p>
        <div className="flex items-end justify-between gap-2">
          <h3 className="text-2xl font-display font-bold text-foreground">{value}</h3>
          {trend !== undefined && (
            <div className={`flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-md shrink-0 ${isPositive ? "text-emerald-400 bg-emerald-400/10" : "text-rose-400 bg-rose-400/10"}`}>
              {(invertTrend ? trend < 0 : trend > 0) ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        {(note || suffix) && (
          <p className="text-[11px] text-muted-foreground mt-1">{note || suffix}</p>
        )}
      </CardContent>
    </Card>
  );
}
