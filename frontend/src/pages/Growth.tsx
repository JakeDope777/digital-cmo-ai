import { useState, useMemo } from "react";
import { useGrowthData } from "@/hooks/use-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import {
  ArrowTrendingUpIcon, UsersIcon, CursorArrowRaysIcon, BoltIcon,
  ArrowUpRightIcon, ArrowDownRightIcon, BeakerIcon, TrophyIcon, ChartBarIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { fadeUp, stagger } from "@/lib/motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, ReferenceLine, CartesianGrid } from "recharts";

const FUNNEL_STAGES = [
  { stage: "Website Visitors", count: 48200, prev: 41500, rate: null,   color: "#6366f1" },
  { stage: "Free Sign-ups",    count: 3840,  prev: 3200,  rate: "8.0%", color: "#818cf8" },
  { stage: "Activated Users",  count: 2112,  prev: 1760,  rate: "55%",  color: "#a5b4fc" },
  { stage: "Trial → Paid",     count: 528,   prev: 440,   rate: "25%",  color: "#10b981" },
  { stage: "Expansion MRR",    count: 211,   prev: 158,   rate: "40%",  color: "#34d399" },
];

const CHANNELS = [
  { name: "Organic Search", signups: 1240, cac: 32,  color: "#6366f1" },
  { name: "LinkedIn Ads",   signups: 680,  cac: 148, color: "#818cf8" },
  { name: "Email Referral", signups: 520,  cac: 18,  color: "#10b981" },
  { name: "Product Hunt",   signups: 340,  cac: 0,   color: "#f59e0b" },
  { name: "Cold Outbound",  signups: 280,  cac: 92,  color: "#ec4899" },
];

const PERIODS = ["7D", "30D", "90D", "12M"] as const;

const GROWTH_CHART: Record<string, { week: string; actual?: number; forecast?: number }[]> = {
  "7D":  [
    { week: "Mon", actual: 42 }, { week: "Tue", actual: 58 }, { week: "Wed", actual: 51 },
    { week: "Thu", actual: 67 }, { week: "Fri", actual: 74 }, { week: "Sat", actual: 74, forecast: 82 },
    { week: "Sun", forecast: 90 },
  ],
  "30D": [
    { week: "W1", actual: 180 }, { week: "W2", actual: 210 }, { week: "W3", actual: 195 },
    { week: "W4", actual: 240 }, { week: "W5", actual: 285 }, { week: "W6", actual: 260 },
    { week: "W7", actual: 310 }, { week: "W8", actual: 348, forecast: 348 },
    { week: "W9", forecast: 390 }, { week: "W10", forecast: 430 },
  ],
  "90D": [
    { week: "Jan", actual: 720 }, { week: "Feb", actual: 810 }, { week: "Mar", actual: 780 },
    { week: "Apr", actual: 940 }, { week: "May", actual: 1100 }, { week: "Jun", actual: 1040 },
    { week: "Jul", actual: 1240 }, { week: "Aug", actual: 1390, forecast: 1390 },
    { week: "Sep", forecast: 1560 }, { week: "Oct", forecast: 1720 },
  ],
  "12M": [
    { week: "Q1 '24", actual: 2100 }, { week: "Q2 '24", actual: 2800 }, { week: "Q3 '24", actual: 3500 },
    { week: "Q4 '24", actual: 4200 }, { week: "Q1 '25", actual: 5100, forecast: 5100 },
    { week: "Q2 '25", forecast: 6200 }, { week: "Q3 '25", forecast: 7400 },
  ],
};

const TOOLTIP_STYLE = {
  contentStyle: { backgroundColor: "#111827", border: "1px solid #1e293b", borderRadius: "8px", fontSize: "12px" },
  itemStyle: { color: "#f1f5f9" },
};

export function Growth() {
  const { data, isLoading } = useGrowthData();
  const [period, setPeriod] = useState<typeof PERIODS[number]>("30D");

  const chartData = useMemo(() => GROWTH_CHART[period], [period]);
  const todayIdx = useMemo(() => {
    const idx = chartData.findLastIndex(d => d.actual != null);
    return idx >= 0 ? chartData[idx].week : undefined;
  }, [chartData]);

  if (isLoading || !data) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-sm text-slate-400">Growth Agent loading your funnel data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Growth & Funnel</h2>
          <p className="text-slate-400 mt-1">Full-funnel optimization powered by your Growth Agent.</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-600/20 h-9 text-sm">
          <BoltIcon className="w-4 h-4 mr-2" />Run Growth Audit
        </Button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Monthly Visitors", val: "48.2K", change: +16,  icon: Users,      color: "text-indigo-400" },
          { label: "Trial Signups",    val: "3,840", change: +20,  icon: TrendingUp,  color: "text-emerald-400" },
          { label: "Trial → Paid",     val: "13.7%", change: +2.4, icon: Target,      color: "text-sky-400" },
          { label: "Avg. ROAS",        val: "5.3×",  change: +32,  icon: BarChart3,   color: "text-violet-400" },
        ].map((k) => (
          <Card key={k.label} className="bg-[#111827] border-slate-800 rounded-2xl">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <k.icon className={`w-5 h-5 ${k.color}`} />
                <span className={`text-xs font-semibold flex items-center gap-0.5 px-1.5 py-0.5 rounded ${k.change > 0 ? "text-emerald-400 bg-emerald-400/10" : "text-rose-400 bg-rose-400/10"}`}>
                  {k.change > 0 ? <ArrowUpRightIcon className="w-3 h-3" /> : <ArrowDownRightIcon className="w-3 h-3" />}
                  {Math.abs(k.change)}%
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-100">{k.val}</p>
              <p className="text-xs text-slate-400 mt-1">{k.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Growth Chart with Forecast */}
      <Card className="bg-[#111827] border-slate-800 rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-slate-800 pb-4 flex flex-row items-center justify-between flex-wrap gap-3">
          <div>
            <CardTitle className="text-base text-slate-100">Signups + Forecast</CardTitle>
            <p className="text-xs text-slate-400 mt-0.5">Actual vs AI-projected growth trajectory</p>
          </div>
          <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl p-1 gap-1">
            {PERIODS.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${p === period ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"}`}
              >
                {p}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[260px] w-full pt-4 px-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 16, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                <Tooltip {...TOOLTIP_STYLE} />
                {todayIdx && (
                  <ReferenceLine x={todayIdx} stroke="#6366f1" strokeDasharray="4 4" strokeOpacity={0.5}
                    label={{ value: "Today", position: "insideTopRight", fill: "#818cf8", fontSize: 10 }} />
                )}
                <Area type="monotone" dataKey="actual" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#actualGrad)" connectNulls dot={false} name="Actual" />
                <Area type="monotone" dataKey="forecast" stroke="#10b981" strokeWidth={2} strokeDasharray="6 3" fillOpacity={1} fill="url(#forecastGrad)" connectNulls dot={false} name="Forecast" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-5 px-6 pb-4 pt-1">
            <div className="flex items-center gap-2"><div className="w-3 h-0.5 bg-indigo-500" /><span className="text-xs text-slate-400">Actual</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-0.5 bg-emerald-400 opacity-70" style={{ borderTop: "2px dashed #10b981" }} /><span className="text-xs text-slate-400">Forecast</span></div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Conversion Funnel */}
        <Card className="lg:col-span-2 bg-[#111827] border-slate-800 rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-slate-800 pb-4">
            <CardTitle className="text-base text-slate-100">Conversion Funnel</CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            {FUNNEL_STAGES.map((stage) => {
              const pct = (stage.count / FUNNEL_STAGES[0].count) * 100;
              const change = Math.round(((stage.count - stage.prev) / stage.prev) * 100);
              return (
                <div key={stage.stage}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-300">{stage.stage}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-200 tabular-nums">{formatNumber(stage.count)}</span>
                      {stage.rate && <span className="text-[10px] text-slate-500">→ {stage.rate}</span>}
                      <span className={`text-[10px] font-semibold ${change > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {change > 0 ? "+" : ""}{change}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
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

        {/* Channel Performance */}
        <Card className="lg:col-span-3 bg-[#111827] border-slate-800 rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-slate-800 pb-4">
            <CardTitle className="text-base text-slate-100">Channel Performance</CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            {CHANNELS.map((ch) => {
              const pct = (ch.signups / CHANNELS[0].signups) * 100;
              return (
                <div key={ch.name} className="flex items-center gap-3">
                  <div className="w-32 shrink-0">
                    <p className="text-xs font-semibold text-slate-200 truncate">{ch.name}</p>
                    <p className="text-[10px] text-slate-500">CAC: {ch.cac === 0 ? "Free" : `$${ch.cac}`}</p>
                  </div>
                  <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: ch.color }} />
                  </div>
                  <span className="text-xs font-bold text-slate-200 w-12 text-right tabular-nums">{formatNumber(ch.signups)}</span>
                </div>
              );
            })}
            <div className="mt-2 pt-3 border-t border-slate-800 bg-slate-900 rounded-xl p-3">
              <p className="text-xs font-semibold text-indigo-400 mb-1.5 flex items-center gap-1.5"><BoltIcon className="w-3 h-3" />AI Recommendation</p>
              <p className="text-xs text-slate-400 leading-relaxed">Email referral has the lowest CAC ($18). Investing $2K in a referral incentive program could generate ~111 additional trial signups at current rates.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* A/B Tests */}
      <Card className="bg-[#111827] border-slate-800 rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-slate-800 pb-4 flex flex-row items-center gap-2">
          <BeakerIcon className="w-4 h-4 text-indigo-400" />
          <CardTitle className="text-base text-slate-100 m-0">Active A/B Tests</CardTitle>
          <Badge className="ml-auto bg-amber-500/10 text-amber-400 border-0 text-xs">3 Running</Badge>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(data.abTests ?? []).map((test: any) => (
              <div key={test.id} className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-sm text-slate-200 truncate flex-1 mr-2">{test.name}</h4>
                  <Badge className={test.status === "running" ? "bg-amber-500/10 text-amber-400 border-0 text-xs shrink-0" : "bg-emerald-500/10 text-emerald-400 border-0 text-xs shrink-0"}>
                    {test.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-[#111827] p-3 rounded-lg border border-slate-800">
                    <p className="text-[10px] text-slate-500 mb-1">Control</p>
                    <p className="text-xs font-medium text-slate-300 truncate">"{test.variantA}"</p>
                    <p className="mt-1.5 text-lg font-bold text-slate-100">{test.winnerConversionA}%</p>
                    <div className="mt-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-500 rounded-full" style={{ width: `${test.winnerConversionA * 10}%` }} />
                    </div>
                  </div>
                  <div className={`bg-[#111827] p-3 rounded-lg border ${test.winnerConversionB > test.winnerConversionA ? "border-emerald-500/40" : "border-slate-800"}`}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[10px] text-slate-500">Variant</p>
                      {test.winnerConversionB > test.winnerConversionA && (
                        <span className="text-[9px] text-emerald-400 font-bold flex items-center gap-0.5"><TrophyIcon className="w-2.5 h-2.5" />Win</span>
                      )}
                    </div>
                    <p className="text-xs font-medium text-slate-300 truncate">"{test.variantB}"</p>
                    <p className={`mt-1.5 text-lg font-bold ${test.winnerConversionB > test.winnerConversionA ? "text-emerald-400" : "text-slate-100"}`}>{test.winnerConversionB}%</p>
                    <div className="mt-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${test.winnerConversionB > test.winnerConversionA ? "bg-emerald-400" : "bg-slate-500"}`} style={{ width: `${test.winnerConversionB * 10}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
