import { useDashboardMetrics } from "@/hooks/use-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatNumber } from "@/lib/utils";
import {
  ArrowUpRightIcon, ArrowDownRightIcon, ChevronRightIcon,
} from "@heroicons/react/24/outline";
import {
  SparklesIcon, CheckCircleIcon, ExclamationCircleIcon,
  CpuChipIcon, MagnifyingGlassIcon, PencilSquareIcon, CursorArrowRaysIcon,
  EnvelopeIcon, ShareIcon, ChartBarIcon, MegaphoneIcon, UsersIcon,
  ArrowTrendingUpIcon, BoltIcon,
} from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, BarChart, Bar, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { fadeUp, stagger, pageVariants, cardHover } from "@/lib/motion";
import { useEffect, useRef, useState } from "react";

const AGENT_ACTIVITY = [
  { icon: MagnifyingGlassIcon, name: "SEO Agent",       status: "active", action: "847 keywords clustered · 12 briefs ready",   color: "text-sky-400",    bg: "bg-sky-500/10" },
  { icon: CursorArrowRaysIcon, name: "Creative Agent",  status: "active", action: "12 ad variants written · A/B test live",      color: "text-violet-400", bg: "bg-violet-500/10" },
  { icon: EnvelopeIcon,        name: "Email/CRM Agent", status: "active", action: "47 leads re-engaged · 3 flows running",        color: "text-emerald-400",bg: "bg-emerald-500/10" },
  { icon: ChartBarIcon,        name: "Analytics Agent", status: "active", action: "13 KPIs tracked · anomaly alert sent",         color: "text-indigo-400", bg: "bg-indigo-500/10" },
  { icon: MegaphoneIcon,       name: "Paid Ads Agent",  status: "active", action: "Reallocating $1,200 → Google Ads",             color: "text-orange-400", bg: "bg-orange-500/10" },
  { icon: ShareIcon,           name: "Social Agent",    status: "idle",   action: "Next post scheduled in 2h 14m",                color: "text-pink-400",   bg: "bg-pink-500/10" },
  { icon: PencilSquareIcon,    name: "Content Agent",   status: "active", action: "3 long-form drafts in progress",               color: "text-amber-400",  bg: "bg-amber-500/10" },
  { icon: ArrowTrendingUpIcon, name: "Growth Agent",    status: "idle",   action: "A/B test significance reached",                color: "text-teal-400",   bg: "bg-teal-500/10" },
  { icon: UsersIcon,           name: "PR & Media Agent",status: "idle",   action: "2 journalist matches queued",                  color: "text-rose-400",   bg: "bg-rose-500/10" },
  { icon: CpuChipIcon,         name: "Orchestrator",    status: "active", action: "Coordinating 5 agents · memory synced",        color: "text-indigo-400", bg: "bg-indigo-500/10" },
];

const WEEK_SPEND = [
  { day: "Mon", spend: 820,  revenue: 4100 },
  { day: "Tue", spend: 940,  revenue: 4800 },
  { day: "Wed", spend: 880,  revenue: 5200 },
  { day: "Thu", spend: 1020, revenue: 6100 },
  { day: "Fri", spend: 960,  revenue: 5700 },
  { day: "Sat", spend: 740,  revenue: 3900 },
  { day: "Sun", spend: 680,  revenue: 3600 },
];

function useCountUp(target: number, inView: boolean, decimals = 0, duration = 1400) {
  const [count, setCount] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;
    const start = performance.now();
    function step(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(parseFloat((eased * target).toFixed(decimals)));
      if (progress < 1) requestAnimationFrame(step);
      else setCount(target);
    }
    requestAnimationFrame(step);
  }, [inView, target, decimals, duration]);
  return count;
}

function KpiCard({
  title, value, rawValue, trend, invertTrend = false, note, suffix,
}: {
  title: string; value: string; rawValue?: number; trend?: number;
  invertTrend?: boolean; note?: string; suffix?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const isPositive = trend !== undefined && (invertTrend ? trend < 0 : trend > 0);

  return (
    <motion.div ref={ref} variants={fadeUp} whileHover={{ y: -3, transition: { duration: 0.18 } }}>
      <Card className="bg-card border-border/50 shadow-lg shadow-black/5 rounded-2xl hover:border-primary/30 transition-colors duration-300 h-full">
        <CardContent className="p-5">
          <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">{title}</p>
          <div className="flex items-end justify-between gap-2">
            <h3 className="text-2xl font-bold text-foreground tabular-nums">{value}</h3>
            {trend !== undefined && (
              <div className={`flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-md shrink-0 ${isPositive ? "text-emerald-400 bg-emerald-400/10" : "text-rose-400 bg-rose-400/10"}`}>
                {isPositive ? <ArrowUpRightIcon className="w-3 h-3" /> : <ArrowDownRightIcon className="w-3 h-3" />}
                {Math.abs(trend)}%
              </div>
            )}
          </div>
          {(note || suffix) && (
            <p className="text-[11px] text-muted-foreground mt-1.5">{note || suffix}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

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
    <motion.div
      className="space-y-7"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold">Dashboard</h2>
          <p className="text-muted-foreground mt-1 text-sm">Your marketing performance — all 10 agents active.</p>
        </div>
        <motion.div
          className="flex items-center gap-2 text-sm font-semibold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-3 py-1.5 rounded-full"
          animate={{ opacity: [1, 0.7, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          AI CMO Active
        </motion.div>
      </motion.div>

      {/* AI Insight Banner */}
      <motion.div variants={fadeUp}>
        <div className="rounded-2xl border border-primary/25 bg-primary/5 p-5 hover:border-primary/40 transition-colors">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 border border-primary/20">
              <BoltIcon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">AI CMO · Insight · just now</span>
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
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={stagger} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Pipeline Revenue" value="$248K" trend={18} />
        <KpiCard title="ROAS" value="5.3×" trend={32} suffix="vs 4.0× target" />
        <KpiCard title="CAC" value="$125" trend={-12.4} invertTrend />
        <KpiCard title="Active Campaigns" value="14" note="3 optimising" />
      </motion.div>

      <motion.div variants={stagger} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Chart */}
        <motion.div variants={fadeUp} className="lg:col-span-2">
          <Card className="bg-card border-border/50 shadow-xl shadow-black/10 rounded-2xl overflow-hidden h-full">
            <CardHeader className="border-b border-border/50 pb-4 bg-card/50">
              <CardTitle className="text-sm font-semibold">Pipeline Generation (90 Days)</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[240px] w-full pt-4">
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
                    <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" isAnimationActive animationDuration={1200} animationEasing="ease-out" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Recommendations */}
        <motion.div variants={fadeUp}>
          <Card className="bg-card border-border/50 shadow-xl shadow-black/10 rounded-2xl flex flex-col h-full">
            <CardHeader className="border-b border-border/50 pb-4 flex flex-row items-center gap-2 bg-primary/5">
              <SparklesIcon className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm font-semibold m-0">AI Insights</CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex-1 flex flex-col gap-3">
              {[
                { title: "Increase LinkedIn Budget",  body: "CPA is 15% lower than target. Reallocating from Meta will improve overall efficiency.", cta: "Apply Change" },
                { title: "A/B Test Email Subjects",   body: "Recent onboarding sequence has 4% drop in open rates vs historical average.", cta: "Draft Variants" },
                { title: "Publish 2 SEO Articles",    body: "3 high-opportunity clusters identified. Publishing now captures Q2 search intent.", cta: "Review Briefs" },
              ].map((ins, i) => (
                <motion.div
                  key={ins.title}
                  className="bg-background rounded-xl p-4 border border-border hover:border-primary/30 transition-colors"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  <h4 className="font-semibold text-xs mb-1 text-foreground">{ins.title}</h4>
                  <p className="text-[11px] text-muted-foreground mb-3 leading-relaxed">{ins.body}</p>
                  <Button size="sm" className="w-full text-xs h-7 bg-primary/10 text-primary hover:bg-primary/20 border-0">{ins.cta}</Button>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Spend vs Revenue + Top Campaigns */}
      <motion.div variants={stagger} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={fadeUp} className="lg:col-span-2">
          <Card className="bg-card border-border/50 rounded-2xl overflow-hidden h-full">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="text-sm font-semibold">Spend vs Revenue — This Week</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[210px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={WEEK_SPEND} margin={{ top: 0, right: 16, left: -20, bottom: 0 }}>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                      itemStyle={{ color: "hsl(var(--foreground))" }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
                    />
                    <Bar dataKey="spend"   fill="hsl(var(--primary) / 0.25)" radius={[4, 4, 0, 0]} isAnimationActive animationDuration={1000} animationEasing="ease-out" />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))"        radius={[4, 4, 0, 0]} isAnimationActive animationDuration={1200} animationEasing="ease-out" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card className="bg-card border-border/50 rounded-2xl h-full">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="text-sm font-semibold">Top Campaigns</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {(metrics.topCampaigns ?? []).slice(0, 4).map((camp, i) => (
                <motion.div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-xl bg-background border border-border/50 hover:border-primary/25 transition-colors"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.07 }}
                >
                  <div>
                    <p className="text-xs font-semibold text-foreground truncate max-w-[130px]">{camp.name}</p>
                    <Badge variant="outline" className="mt-1 text-[10px] py-0 h-4 bg-transparent">{camp.channel}</Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-emerald-400">{formatCurrency(camp.revenue ?? 0)}</p>
                    <p className="text-[10px] text-muted-foreground">{formatNumber(camp.leads ?? 0)} leads</p>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Agent Activity */}
      <motion.div variants={fadeUp}>
        <Card className="bg-card border-border/50 rounded-2xl">
          <CardHeader className="border-b border-border/50 pb-4 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <CpuChipIcon className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm font-semibold m-0">Agent Activity</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <motion.span
                className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-xs text-muted-foreground">7 active · 3 idle</span>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-2"
              variants={stagger}
              initial="hidden"
              animate="show"
            >
              {AGENT_ACTIVITY.map((agent, i) => (
                <motion.div
                  key={agent.name}
                  variants={fadeUp}
                  className="flex items-center gap-3 p-3 rounded-xl bg-background border border-border/50 hover:border-border transition-colors group"
                  whileHover={{ x: 2, transition: { duration: 0.15 } }}
                >
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${agent.bg} ${agent.color}`}>
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
                </motion.div>
              ))}
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* System Health + Quick Actions */}
      <motion.div variants={stagger} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={fadeUp}>
          <Card className="bg-card border-border/50 rounded-2xl h-full">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="text-sm font-semibold">System Health</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {(metrics.integrationHealth ?? []).map((int, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-background border border-border/50">
                  <span className="font-medium text-sm">{int.name}</span>
                  {int.status === "connected" ? (
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-0 text-xs">
                      <CheckCircleIcon className="w-3 h-3 mr-1" /> Connected
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-500/10 text-amber-400 border-0 text-xs">
                      <ExclamationCircleIcon className="w-3 h-3 mr-1" /> Warning
                    </Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp} className="lg:col-span-2">
          <Card className="bg-card border-border/50 rounded-2xl h-full">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-4 grid grid-cols-2 gap-3">
              {[
                { label: "Run SEO audit",         href: "/analysis",  color: "text-sky-400",    border: "hover:border-sky-500/30    hover:bg-sky-500/5" },
                { label: "Write blog post",        href: "/creative",  color: "text-violet-400", border: "hover:border-violet-500/30 hover:bg-violet-500/5" },
                { label: "Launch email campaign",  href: "/crm",       color: "text-emerald-400",border: "hover:border-emerald-500/30 hover:bg-emerald-500/5" },
                { label: "Analyze paid ads",       href: "/growth",    color: "text-orange-400", border: "hover:border-orange-500/30 hover:bg-orange-500/5" },
                { label: "Schedule social posts",  href: "/creative",  color: "text-pink-400",   border: "hover:border-pink-500/30   hover:bg-pink-500/5" },
                { label: "Ask AI CMO anything",    href: "/chat",      color: "text-indigo-400", border: "hover:border-primary/30    hover:bg-primary/5" },
              ].map((action, i) => (
                <motion.div
                  key={action.label}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.06 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Link
                    href={action.href}
                    className={`flex items-center justify-between p-3 rounded-xl bg-background border border-border/50 ${action.border} transition-all group block`}
                  >
                    <span className={`text-xs font-semibold ${action.color}`}>{action.label}</span>
                    <ChevronRightIcon className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </Link>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
