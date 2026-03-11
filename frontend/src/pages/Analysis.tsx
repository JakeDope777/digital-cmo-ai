import { useMarketAnalysis, useCompetitors } from "@/hooks/use-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import {
  CursorArrowRaysIcon, ArrowTrendingUpIcon, ExclamationTriangleIcon,
  LightBulbIcon, GlobeAltIcon, UsersIcon, ArrowUpRightIcon, ArrowDownRightIcon,
  ArrowTopRightOnSquareIcon, ChartBarIcon, MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { fadeUp, stagger } from "@/lib/motion";

const KEYWORD_DATA = [
  { keyword: "AI marketing automation", vol: "18.1K", diff: 62, rank: 14, change: +4, opp: "high" },
  { keyword: "digital marketing AI tools", vol: "12.4K", diff: 48, rank: 7, change: +2, opp: "high" },
  { keyword: "marketing analytics platform", vol: "9.8K", diff: 71, rank: 23, change: -3, opp: "med" },
  { keyword: "automated campaign management", vol: "7.2K", diff: 55, rank: 11, change: +6, opp: "high" },
  { keyword: "AI CMO software", vol: "4.1K", diff: 39, rank: 3, change: +1, opp: "low" },
  { keyword: "marketing orchestration tool", vol: "3.6K", diff: 44, rank: 18, change: +8, opp: "high" },
  { keyword: "SaaS marketing automation", vol: "22.5K", diff: 79, rank: 31, change: -2, opp: "med" },
  { keyword: "B2B growth platform", vol: "6.3K", diff: 51, rank: 9, change: +3, opp: "med" },
];

const TREND_CHART_POINTS = [40, 42, 38, 45, 50, 55, 52, 60, 65, 62, 70, 75, 78, 72, 80, 85, 88, 84, 90, 95];

export function Analysis() {
  const { data: analysis, isLoading: loadingAnalysis } = useMarketAnalysis();
  const { data: competitors, isLoading: loadingComps } = useCompetitors();

  if (loadingAnalysis || loadingComps || !analysis || !competitors) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">AI agents analysing your market...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold">Market Intelligence</h2>
          <p className="text-muted-foreground mt-1">Real-time analysis powered by your Analytics Agent + Market Intel Agent.</p>
        </div>
        <div className="flex gap-3">
          {[
            { label: "TAM", val: analysis.marketSize, color: "text-primary" },
            { label: "CAGR", val: analysis.growthRate, color: "text-emerald-400" },
          ].map((s) => (
            <div key={s.label} className="px-5 py-3 bg-card border border-border/50 rounded-2xl text-center">
              <p className="text-xs text-muted-foreground mb-0.5">{s.label}</p>
              <p className={`text-xl font-bold font-mono ${s.color}`}>{s.val}</p>
            </div>
          ))}
          <div className="px-5 py-3 bg-card border border-border/50 rounded-2xl text-center">
            <p className="text-xs text-muted-foreground mb-0.5">Market Stage</p>
            <p className="text-xl font-bold text-amber-400">Growth</p>
          </div>
        </div>
      </div>

      {/* Market Trend Chart */}
      <Card className="bg-card border-border/50 rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-border/50 pb-4 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Market Interest Trend</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Search interest over 20 weeks — AI Marketing category</p>
          </div>
          <Badge className="bg-emerald-500/10 text-emerald-400 border-0">
            <ArrowTrendingUpIcon className="w-3 h-3 mr-1" />+138% YoY
          </Badge>
        </CardHeader>
        <CardContent className="p-6">
          <div className="relative h-32">
            <svg viewBox={`0 0 ${TREND_CHART_POINTS.length * 30} 110`} className="w-full h-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                </linearGradient>
              </defs>
              {(() => {
                const pts = TREND_CHART_POINTS;
                const maxY = Math.max(...pts);
                const minY = Math.min(...pts);
                const scaleY = (v: number) => 100 - ((v - minY) / (maxY - minY)) * 90;
                const scaleX = (i: number) => i * 30 + 10;
                const line = pts.map((v, i) => `${i === 0 ? "M" : "L"}${scaleX(i)},${scaleY(v)}`).join(" ");
                const area = line + ` L${scaleX(pts.length - 1)},110 L${scaleX(0)},110 Z`;
                return (
                  <>
                    <path d={area} fill="url(#trendGrad)" />
                    <path d={line} stroke="hsl(var(--primary))" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    {pts.map((v, i) => i === pts.length - 1 ? (
                      <circle key={i} cx={scaleX(i)} cy={scaleY(v)} r="4" fill="hsl(var(--primary))" stroke="hsl(var(--background))" strokeWidth="2" />
                    ) : null)}
                  </>
                );
              })()}
            </svg>
            <div className="absolute top-0 right-0 text-xs text-primary font-bold">+138%</div>
          </div>
        </CardContent>
      </Card>

      {/* SWOT */}
      <div>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <CursorArrowRaysIcon className="w-5 h-5 text-primary" />
          SWOT Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: "Strengths",     items: analysis.swot?.strengths,     icon: ArrowTrendingUpIcon,  textColor: "text-emerald-400", accent: "bg-emerald-500", dot: "bg-emerald-400" },
            { title: "Weaknesses",    items: analysis.swot?.weaknesses,    icon: ExclamationTriangleIcon, textColor: "text-rose-400",    accent: "bg-rose-500",    dot: "bg-rose-400" },
            { title: "Opportunities", items: analysis.swot?.opportunities, icon: LightBulbIcon,   textColor: "text-sky-400",    accent: "bg-sky-500",     dot: "bg-sky-400" },
            { title: "Threats",       items: analysis.swot?.threats,       icon: ExclamationTriangleIcon, textColor: "text-amber-400",  accent: "bg-amber-500",   dot: "bg-amber-400" },
          ].map((q) => (
            <div key={q.title} className="bg-card border border-border/60 rounded-2xl overflow-hidden flex">
              <div className={`w-1 shrink-0 ${q.accent} opacity-70`} />
              <div className="flex-1 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <q.icon className={`w-4 h-4 ${q.textColor}`} />
                  <h4 className={`font-semibold text-sm ${q.textColor}`}>{q.title}</h4>
                </div>
                <ul className="space-y-2.5">
                  {q.items?.map((s: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <div className={`w-1.5 h-1.5 rounded-full ${q.dot} mt-1.5 shrink-0`} />
                      <span className="text-foreground/80">{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Keyword Tracker */}
      <Card className="bg-card border-border/50 rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-border/50 pb-4 flex flex-row items-center gap-3">
          <MagnifyingGlassIcon className="w-5 h-5 text-primary" />
          <div>
            <CardTitle className="text-base">Keyword Opportunity Tracker</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">847 keywords tracked · 23 high-opportunity clusters identified</p>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-card/50 border-b border-border/50">
              <tr className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3.5 text-left">Keyword</th>
                <th className="px-5 py-3.5 text-right">Volume</th>
                <th className="px-5 py-3.5 text-center">Difficulty</th>
                <th className="px-5 py-3.5 text-center">Rank</th>
                <th className="px-5 py-3.5 text-center">Change</th>
                <th className="px-5 py-3.5 text-center">Opportunity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {KEYWORD_DATA.map((kw) => (
                <tr key={kw.keyword} className="hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-foreground">{kw.keyword}</td>
                  <td className="px-5 py-3.5 text-right font-mono text-sm text-muted-foreground">{kw.vol}</td>
                  <td className="px-5 py-3.5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${kw.diff > 65 ? "bg-rose-400" : kw.diff > 50 ? "bg-amber-400" : "bg-emerald-400"}`} style={{ width: `${kw.diff}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground">{kw.diff}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span className={`font-bold font-mono text-sm ${kw.rank <= 10 ? "text-emerald-400" : kw.rank <= 20 ? "text-amber-400" : "text-muted-foreground"}`}>#{kw.rank}</span>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span className={`flex items-center justify-center gap-0.5 text-xs font-semibold ${kw.change > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {kw.change > 0 ? <ArrowUpRightIcon className="w-3 h-3" /> : <ArrowDownRightIcon className="w-3 h-3" />}
                      {Math.abs(kw.change)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <Badge className={`text-[10px] ${kw.opp === "high" ? "bg-emerald-500/10 text-emerald-400" : kw.opp === "med" ? "bg-amber-500/10 text-amber-400" : "bg-muted text-muted-foreground"} border-0`}>
                      {kw.opp}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Competitors */}
      <div>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <ChartBarIcon className="w-5 h-5 text-primary" />
          Competitive Landscape
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {competitors.map((comp: any, i: number) => (
            <Card key={i} className="bg-card border-border/50 hover:border-primary/20 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-sm text-primary">
                        {comp.name.substring(0, 1)}
                      </div>
                      <CardTitle className="text-base">{comp.name}</CardTitle>
                    </div>
                    <a href={comp.website} className="text-xs text-primary hover:underline flex items-center gap-1">
                      {comp.website} <ArrowTopRightOnSquareIcon className="w-2.5 h-2.5" />
                    </a>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="bg-background text-xs">{comp.estimatedRevenue}</Badge>
                    <div className="flex items-center gap-1 mt-2 justify-end">
                      {["SEO", "Paid", "Content", "Social"].map((ch, ci) => (
                        <div key={ch} className={`w-5 h-5 rounded text-[9px] flex items-center justify-center font-bold ${ci <= i ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>{ch[0]}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground italic mb-4 border-l-2 border-primary/20 pl-3">"{comp.positioning}"</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-2">Strengths</div>
                    <ul className="space-y-1">
                      {comp.strengths?.map((s: string, j: number) => (
                        <li key={j} className="flex items-start gap-1.5 text-xs text-foreground/70">
                          <div className="w-1 h-1 rounded-full bg-emerald-400 mt-1.5 shrink-0" />{s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-rose-400 mb-2">Weaknesses</div>
                    <ul className="space-y-1">
                      {comp.weaknesses?.map((w: string, j: number) => (
                        <li key={j} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                          <div className="w-1 h-1 rounded-full bg-rose-400 mt-1.5 shrink-0" />{w}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Personas */}
      <div>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <UsersIcon className="w-5 h-5 text-primary" />
          Target Personas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: "The Growth CMO", company: "Series B SaaS", pain: "Managing 5+ tools with no unified view of marketing ROI", goal: "Reduce CAC by 30% while scaling pipeline $2M+/qtr", channels: ["LinkedIn", "G2", "Webinars"], budget: "$50K+/mo" },
            { name: "The Scaling Founder", company: "Seed-stage startup", pain: "No marketing team, spending 10hrs/week on campaigns manually", goal: "Launch and run marketing 24/7 without a hire", channels: ["Search", "Cold Email", "Product Hunt"], budget: "$5–15K/mo" },
            { name: "The Agency Owner", company: "Digital Agency", pain: "Account managers spending 70% of time on reporting", goal: "Automate client reporting and campaign execution", channels: ["Referral", "Conferences", "SEO"], budget: "$20K+/mo" },
          ].map((p) => (
            <Card key={p.name} className="bg-card border-border/50">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                    {p.name.split(" ")[1][0]}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.company}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-rose-400 mb-1">Pain Point</p>
                    <p className="text-xs text-foreground/70">{p.pain}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-1">Goal</p>
                    <p className="text-xs text-foreground/70">{p.goal}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Top Channels</p>
                    <div className="flex flex-wrap gap-1">
                      {p.channels.map((ch) => (
                        <Badge key={ch} variant="outline" className="text-[10px] bg-background">{ch}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border/30">
                    <span className="text-[10px] text-muted-foreground">Ad Budget</span>
                    <span className="text-xs font-bold text-primary">{p.budget}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

    </div>
  );
}
