import { memo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { fadeUp, stagger } from "@/lib/motion";
import {
  DocumentChartBarIcon, ArrowDownTrayIcon, CalendarDaysIcon,
  ChartBarIcon, ArrowTrendingUpIcon, UsersIcon, CursorArrowRaysIcon,
  BoltIcon, PlusIcon, ClockIcon, CheckCircleIcon, EyeIcon,
  EnvelopeIcon, MagnifyingGlassIcon, MegaphoneIcon, ShareIcon,
} from "@heroicons/react/24/outline";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const REPORTS = [
  {
    id: 1, name: "Q1 2026 Campaign Summary",  type: "quarterly",  date: "Mar 11, 2026",
    size: "4.2 MB", status: "ready", pages: 28, channels: ["SEO","Ads","Email","Social"],
    highlights: ["↑ 124% overall ROI", "↑ 43% organic traffic", "↓ 34% CPA"],
    icon: DocumentChartBarIcon, color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20",
  },
  {
    id: 2, name: "SEO Performance — March",    type: "monthly",    date: "Mar 11, 2026",
    size: "2.1 MB", status: "ready", pages: 14, channels: ["SEO"],
    highlights: ["Avg position: 8.4 → 6.1", "+23 new backlinks", "138% YoY growth"],
    icon: MagnifyingGlassIcon, color: "text-sky-400", bg: "bg-sky-500/10 border-sky-500/20",
  },
  {
    id: 3, name: "Paid Ads Weekly Digest",     type: "weekly",     date: "Mar 10, 2026",
    size: "1.4 MB", status: "ready", pages: 8,  channels: ["Ads"],
    highlights: ["ROAS: 4.2×", "CTR up 18%", "$2,840 spend → $11,928 revenue"],
    icon: MegaphoneIcon, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20",
  },
  {
    id: 4, name: "Email Campaign Deep-dive",   type: "campaign",   date: "Mar 9, 2026",
    size: "1.8 MB", status: "ready", pages: 12, channels: ["Email"],
    highlights: ["68% open rate", "24% click rate", "842 trial conversions"],
    icon: EnvelopeIcon, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20",
  },
  {
    id: 5, name: "Social Media Performance",   type: "monthly",    date: "Mar 8, 2026",
    size: "2.6 MB", status: "ready", pages: 16, channels: ["Social"],
    highlights: ["+1,240 followers", "3.8% avg engagement", "Top post: 48K reach"],
    icon: ShareIcon, color: "text-pink-400", bg: "bg-pink-500/10 border-pink-500/20",
  },
  {
    id: 6, name: "Content ROI Analysis",       type: "custom",     date: "Mar 6, 2026",
    size: "3.1 MB", status: "ready", pages: 20, channels: ["SEO","Social","Email"],
    highlights: ["$0.12 cost per engaged user", "Top 5 posts drove 62% of leads", "Blog → 340 demo sign-ups"],
    icon: ChartBarIcon, color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20",
  },
  {
    id: 7, name: "April Full-Funnel Forecast", type: "forecast",   date: "Generating…",
    size: "—", status: "generating", pages: null, channels: ["All"],
    highlights: [], icon: BoltIcon, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20",
  },
];

const TREND_DATA = [
  { month: "Sep",  roi: 68,  leads: 420, spend: 8200  },
  { month: "Oct",  roi: 79,  leads: 510, spend: 9100  },
  { month: "Nov",  roi: 88,  leads: 590, spend: 9800  },
  { month: "Dec",  roi: 95,  leads: 640, spend: 10200 },
  { month: "Jan",  roi: 108, leads: 780, spend: 11400 },
  { month: "Feb",  roi: 116, leads: 890, spend: 12100 },
  { month: "Mar",  roi: 124, leads: 1020,spend: 13800 },
];

const KPI_CARDS = [
  { label: "Reports Generated",  value: "38",     sub: "This quarter",      icon: DocumentChartBarIcon, color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20" },
  { label: "Avg. Marketing ROI", value: "124%",   sub: "↑ from 95% last Q", icon: ArrowTrendingUpIcon,  color: "text-emerald-400",bg: "bg-emerald-500/10 border-emerald-500/20" },
  { label: "Leads Attributed",   value: "1,020",  sub: "March 2026",        icon: UsersIcon,            color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
  { label: "Revenue Attributed", value: "$84.2K", sub: "↑ 43% vs last mo.", icon: CursorArrowRaysIcon,  color: "text-amber-400",  bg: "bg-amber-500/10 border-amber-500/20" },
];

const typeConfig: Record<string, string> = {
  quarterly:  "bg-indigo-600/20 text-indigo-300",
  monthly:    "bg-violet-600/20 text-violet-300",
  weekly:     "bg-sky-600/20 text-sky-300",
  campaign:   "bg-emerald-600/20 text-emerald-300",
  custom:     "bg-slate-700 text-slate-400",
  forecast:   "bg-amber-600/20 text-amber-300",
};

export const Reports = memo(function Reports() {
  const [downloading, setDownloading] = useState<number | null>(null);

  const handleDownload = (id: number) => {
    setDownloading(id);
    setTimeout(() => setDownloading(null), 1800);
  };

  return (
    <motion.div className="max-w-7xl mx-auto px-4 py-6 space-y-6" variants={stagger} initial="hidden" animate="show">

      {/* Header */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Reports</h1>
          <p className="text-sm text-slate-500 mt-0.5">AI-generated campaign reports · export · schedule</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 rounded-xl gap-2">
            <CalendarDaysIcon className="w-4 h-4" /> Schedule Report
          </Button>
          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2">
            <PlusIcon className="w-4 h-4" /> Generate Report
          </Button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={stagger} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_CARDS.map(({ label, value, sub, icon: Icon, color, bg }) => (
          <motion.div key={label} variants={fadeUp}>
            <Card className="bg-[#111827] border-slate-800 rounded-2xl">
              <CardContent className="p-5">
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center mb-3 ${bg}`}>
                  <Icon className={`w-4.5 h-4.5 ${color}`} style={{ width: 18, height: 18 }} />
                </div>
                <div className="text-2xl font-bold text-slate-100 mb-0.5">{value}</div>
                <div className="text-xs text-slate-500">{label}</div>
                <div className="text-[11px] text-slate-600 mt-1">{sub}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* ROI Trend Chart */}
      <motion.div variants={fadeUp}>
        <Card className="bg-[#111827] border-slate-800 rounded-2xl">
          <CardHeader className="border-b border-slate-800 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base text-slate-100 flex items-center gap-2">
                <ArrowTrendingUpIcon className="w-4.5 h-4.5 text-indigo-400" style={{ width: 18, height: 18 }} />
                Marketing ROI — Rolling 7 Months
              </CardTitle>
              <span className="text-xs text-slate-500">Sep 2025 → Mar 2026</span>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={TREND_DATA} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="roiGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                <Tooltip
                  contentStyle={{ background: "#1e2a3a", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 10, fontSize: 12 }}
                  itemStyle={{ color: "#c7d2fe" }}
                  labelStyle={{ color: "#94a3b8", marginBottom: 4 }}
                  formatter={(v: number) => [`${v}%`, "ROI"]}
                />
                <Area type="monotone" dataKey="roi" stroke="#6366f1" strokeWidth={2.5} fill="url(#roiGrad)" dot={false} activeDot={{ r: 5, fill: "#6366f1" }} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Reports List */}
      <motion.div variants={fadeUp}>
        <Card className="bg-[#111827] border-slate-800 rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-slate-800 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base text-slate-100 flex items-center gap-2">
                <DocumentChartBarIcon className="w-4.5 h-4.5 text-indigo-400" style={{ width: 18, height: 18 }} />
                All Reports
              </CardTitle>
              <span className="text-xs text-slate-500">{REPORTS.filter(r => r.status === "ready").length} ready to download</span>
            </div>
          </CardHeader>
          <div className="divide-y divide-slate-800/60">
            {REPORTS.map((report, i) => (
              <motion.div key={report.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 px-5 py-4 hover:bg-slate-800/20 transition-colors">
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${report.bg}`}>
                  <report.icon className={`w-5 h-5 ${report.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2 mb-1">
                    <span className="font-semibold text-slate-200 text-sm">{report.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${typeConfig[report.type]}`}>{report.type}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                    <span className="flex items-center gap-1"><ClockIcon className="w-3 h-3" />{report.date}</span>
                    {report.pages && <span>{report.pages} pages</span>}
                    {report.size !== "—" && <span>{report.size}</span>}
                    <span className="flex gap-1">{report.channels.map(c => (
                      <span key={c} className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-500 font-medium">{c}</span>
                    ))}</span>
                  </div>
                  {report.highlights.length > 0 && (
                    <div className="flex gap-3 mt-1.5">
                      {report.highlights.map(h => (
                        <span key={h} className="text-[11px] text-emerald-400 font-medium">{h}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {report.status === "generating" ? (
                    <div className="flex items-center gap-2 text-xs text-amber-400">
                      <BoltIcon className="w-4 h-4 animate-pulse" /> Generating…
                    </div>
                  ) : (
                    <>
                      <Button variant="outline" size="sm" className="border-slate-700 text-slate-400 hover:text-slate-200 rounded-xl gap-1.5 text-xs">
                        <EyeIcon className="w-3.5 h-3.5" /> Preview
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleDownload(report.id)}
                        className={`rounded-xl gap-1.5 text-xs transition-all ${downloading === report.id ? "bg-emerald-600 hover:bg-emerald-700" : "bg-indigo-600 hover:bg-indigo-700"} text-white`}
                      >
                        {downloading === report.id
                          ? <><CheckCircleIcon className="w-3.5 h-3.5" /> Downloaded!</>
                          : <><ArrowDownTrayIcon className="w-3.5 h-3.5" /> Download</>}
                      </Button>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Scheduled Reports */}
      <motion.div variants={fadeUp}>
        <Card className="bg-[#111827] border-slate-800 rounded-2xl">
          <CardHeader className="border-b border-slate-800 pb-4">
            <CardTitle className="text-base text-slate-100 flex items-center gap-2">
              <CalendarDaysIcon className="w-4.5 h-4.5 text-indigo-400" style={{ width: 18, height: 18 }} />
              Scheduled Auto-Reports
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {[
              { name: "Weekly Performance Digest",   freq: "Every Monday, 7:00 AM",    next: "Mar 18",  recipients: 3, status: "active" },
              { name: "Monthly Exec Summary",        freq: "1st of month, 8:00 AM",    next: "Apr 1",   recipients: 5, status: "active" },
              { name: "Paid Ads Daily Briefing",     freq: "Daily, 9:00 AM",           next: "Mar 12",  recipients: 2, status: "active" },
              { name: "SEO Ranking Alert",           freq: "When position changes ≥3", next: "On trigger", recipients: 4, status: "active" },
            ].map((s, i) => (
              <div key={s.name} className={`flex items-center justify-between px-5 py-4 ${i < 3 ? "border-b border-slate-800/60" : ""}`}>
                <div>
                  <p className="text-sm font-semibold text-slate-200 mb-0.5">{s.name}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><ClockIcon className="w-3 h-3" />{s.freq}</span>
                    <span>Next: {s.next}</span>
                    <span className="flex items-center gap-1"><UsersIcon className="w-3 h-3" />{s.recipients} recipients</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                    <CheckCircleIcon className="w-3.5 h-3.5" /> Active
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

    </motion.div>
  );
});
