import { memo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { fadeUp, stagger } from "@/lib/motion";
import {
  MagnifyingGlassIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon,
  ArrowUpRightIcon, ExclamationTriangleIcon, CheckCircleIcon,
  DocumentTextIcon, GlobeAltIcon, LinkIcon, BoltIcon,
  ChartBarIcon, ArrowPathIcon, PlusIcon, MinusIcon,
} from "@heroicons/react/24/outline";

const KEYWORDS = [
  { kw: "AI marketing software",      pos: 8,  prev: 14, vol: 22400, diff: 68, intent: "commercial", change: +6 },
  { kw: "AI CMO platform",            pos: 3,  prev: 5,  vol: 8800,  diff: 42, intent: "commercial", change: +2 },
  { kw: "marketing automation AI",    pos: 11, prev: 9,  vol: 33100, diff: 75, intent: "commercial", change: -2 },
  { kw: "replace marketing agency",   pos: 5,  prev: 12, vol: 5400,  diff: 55, intent: "commercial", change: +7 },
  { kw: "AI content marketing tool",  pos: 15, prev: 18, vol: 18200, diff: 61, intent: "informational", change: +3 },
  { kw: "marketing agent AI",         pos: 2,  prev: 2,  vol: 4100,  diff: 38, intent: "navigational", change: 0 },
  { kw: "automated SEO platform",     pos: 19, prev: 24, vol: 9700,  diff: 72, intent: "commercial", change: +5 },
  { kw: "AI for B2B marketing",       pos: 7,  prev: 6,  vol: 12300, diff: 58, intent: "commercial", change: -1 },
  { kw: "AI ad copy generator",       pos: 4,  prev: 8,  vol: 27600, diff: 49, intent: "commercial", change: +4 },
  { kw: "marketing AI agents",        pos: 1,  prev: 1,  vol: 6200,  diff: 33, intent: "navigational", change: 0 },
  { kw: "automated paid ads tool",    pos: 22, prev: 31, vol: 14100, diff: 64, intent: "commercial", change: +9 },
  { kw: "SaaS marketing platform AI", pos: 12, prev: 10, vol: 7800,  diff: 57, intent: "commercial", change: -2 },
];

const AUDIT_ISSUES = [
  { severity: "critical", title: "4 pages with duplicate meta descriptions", desc: "Duplicate descriptions reduce click-through rates and can hurt rankings.", fix: "Update meta descriptions for /pricing, /features, /blog/ai-marketing, /case-studies" },
  { severity: "critical", title: "Core Web Vitals: LCP 4.2s (poor)", desc: "Largest Contentful Paint is above the 2.5s threshold on mobile.", fix: "Optimise hero image, enable lazy loading, and defer non-critical JS" },
  { severity: "warning", title: "13 images missing alt text", desc: "Missing alt text harms accessibility and image indexing.", fix: "Add descriptive alt attributes to all product screenshots and diagrams" },
  { severity: "warning", title: "Crawl budget waste: 3 redirect chains", desc: "Multi-hop redirects slow crawling and dilute link equity.", fix: "Update links to point directly to final destination URLs" },
  { severity: "info", title: "Internal linking: 7 orphan pages", desc: "Pages with no internal links receive less PageRank distribution.", fix: "Add contextual links from relevant blog posts and feature pages" },
  { severity: "info", title: "Structured data: missing FAQ schema", desc: "FAQ schema can unlock rich snippets in search results.", fix: "Add JSON-LD FAQ markup to your pricing and features pages" },
];

const BRIEFS = [
  { title: "How AI is Replacing Marketing Agencies in 2026", kw: "AI replacing marketing agencies", vol: 8200, status: "ready", words: 2400 },
  { title: "The Complete Guide to AI Marketing Automation", kw: "AI marketing automation guide", vol: 14100, status: "ready", words: 3800 },
  { title: "10 Signs You Need an AI CMO Platform",         kw: "AI CMO platform benefits",     vol: 3600, status: "draft", words: 1900 },
  { title: "AI vs Traditional Marketing Agency: Full Cost Breakdown", kw: "AI vs marketing agency cost", vol: 5900, status: "in_review", words: 2700 },
];

const BACKLINKS = [
  { domain: "techcrunch.com",    da: 93, type: "dofollow", anchor: "Digital CMO AI",     date: "Mar 8" },
  { domain: "hubspot.com",       da: 91, type: "dofollow", anchor: "AI marketing tools",  date: "Mar 5" },
  { domain: "producthunt.com",   da: 87, type: "dofollow", anchor: "Digital CMO AI",     date: "Mar 2" },
  { domain: "g2.com",            da: 85, type: "dofollow", anchor: "AI CMO platform",    date: "Feb 28" },
  { domain: "marketingprofs.com",da: 72, type: "nofollow", anchor: "replace your agency",date: "Feb 21" },
  { domain: "indiehackers.com",  da: 68, type: "dofollow", anchor: "Digital CMO AI",     date: "Feb 18" },
];

const severityConfig = {
  critical: { color: "text-rose-400",  bg: "bg-rose-500/10 border-rose-500/20",  badge: "bg-rose-600/20 text-rose-300",  label: "Critical" },
  warning:  { color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20",badge: "bg-amber-600/20 text-amber-300", label: "Warning"  },
  info:     { color: "text-sky-400",   bg: "bg-sky-500/10 border-sky-500/20",    badge: "bg-sky-600/20 text-sky-300",     label: "Info"     },
};

export const Seo = memo(function Seo() {
  const [tab, setTab] = useState<"keywords" | "audit" | "briefs" | "backlinks">("keywords");
  const [searchKw, setSearchKw] = useState("");

  const filteredKws = KEYWORDS.filter(k => k.kw.toLowerCase().includes(searchKw.toLowerCase()));
  const criticalCount = AUDIT_ISSUES.filter(i => i.severity === "critical").length;
  const warningCount  = AUDIT_ISSUES.filter(i => i.severity === "warning").length;
  const auditScore = 84;

  return (
    <motion.div className="max-w-7xl mx-auto px-4 py-6 space-y-6" variants={stagger} initial="hidden" animate="show">

      {/* Header */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">SEO Intelligence</h1>
          <p className="text-sm text-slate-500 mt-0.5">Keyword tracking · site audit · content briefs · backlinks</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:bg-slate-800 rounded-xl gap-2">
            <ArrowPathIcon className="w-4 h-4" /> Refresh
          </Button>
          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2">
            <BoltIcon className="w-4 h-4" /> Run Full Audit
          </Button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={stagger} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Keywords Tracked", value: KEYWORDS.length, sub: "+3 this week",        icon: MagnifyingGlassIcon, color: "text-indigo-400",  bg: "bg-indigo-500/10 border-indigo-500/20" },
          { label: "Avg. Position",    value: "8.4",            sub: "↑ from 11.2 last mo", icon: ChartBarIcon,        color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
          { label: "Site Audit Score", value: `${auditScore}/100`, sub: `${criticalCount} critical · ${warningCount} warnings`, icon: GlobeAltIcon, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
          { label: "Backlinks",        value: "1,847",          sub: "+23 new this month",  icon: LinkIcon,            color: "text-sky-400",     bg: "bg-sky-500/10 border-sky-500/20" },
        ].map(({ label, value, sub, icon: Icon, color, bg }) => (
          <motion.div key={label} variants={fadeUp}>
            <Card className="bg-[#111827] border-slate-800 rounded-2xl">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${bg}`}>
                    <Icon className={`w-4.5 h-4.5 ${color}`} style={{ width: 18, height: 18 }} />
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-100 mb-0.5">{value}</div>
                <div className="text-xs text-slate-500">{label}</div>
                <div className="text-[11px] text-slate-600 mt-1">{sub}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Tabs */}
      <motion.div variants={fadeUp} className="flex gap-1 p-1 bg-slate-900/60 rounded-xl border border-slate-800 w-fit">
        {([["keywords","Keywords"],["audit","Site Audit"],["briefs","Content Briefs"],["backlinks","Backlinks"]] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${tab === id ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-slate-400 hover:text-slate-200"}`}
          >
            {label}
          </button>
        ))}
      </motion.div>

      {/* Tab: Keywords */}
      {tab === "keywords" && (
        <motion.div variants={fadeUp} initial="hidden" animate="show">
          <Card className="bg-[#111827] border-slate-800 rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-800 pb-4">
              <div className="flex items-center justify-between gap-4">
                <CardTitle className="text-base text-slate-100 flex items-center gap-2">
                  <MagnifyingGlassIcon className="w-4.5 h-4.5 text-indigo-400" style={{ width: 18, height: 18 }} /> Keyword Rankings
                </CardTitle>
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 gap-2 w-56">
                    <MagnifyingGlassIcon className="w-3.5 h-3.5 text-slate-500" />
                    <input value={searchKw} onChange={e => setSearchKw(e.target.value)} placeholder="Filter keywords..." className="bg-transparent text-xs text-slate-200 placeholder:text-slate-600 outline-none w-full" />
                  </div>
                  <Button variant="outline" size="sm" className="border-slate-700 text-slate-400 rounded-xl gap-1.5 text-xs">
                    <PlusIcon className="w-3.5 h-3.5" /> Add Keyword
                  </Button>
                </div>
              </div>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800">
                    {["Keyword","Position","Change","Volume","Difficulty","Intent"].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredKws.map((k, i) => (
                    <motion.tr key={k.kw} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                      className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                      <td className="px-5 py-3.5 text-slate-200 font-medium">{k.kw}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-lg font-bold tabular-nums ${k.pos <= 3 ? "text-emerald-400" : k.pos <= 10 ? "text-indigo-400" : "text-slate-400"}`}>{k.pos}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`flex items-center gap-1 text-xs font-semibold w-fit px-2 py-0.5 rounded-full ${k.change > 0 ? "text-emerald-400 bg-emerald-500/10" : k.change < 0 ? "text-rose-400 bg-rose-500/10" : "text-slate-500 bg-slate-800"}`}>
                          {k.change > 0 ? <ArrowTrendingUpIcon className="w-3 h-3" /> : k.change < 0 ? <ArrowTrendingDownIcon className="w-3 h-3" /> : null}
                          {k.change === 0 ? "—" : `${k.change > 0 ? "+" : ""}${k.change}`}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-400 text-sm tabular-nums">{k.vol.toLocaleString()}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${k.diff >= 70 ? "bg-rose-500" : k.diff >= 50 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${k.diff}%` }} />
                          </div>
                          <span className="text-xs text-slate-500">{k.diff}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                          k.intent === "commercial" ? "bg-indigo-600/20 text-indigo-300" :
                          k.intent === "informational" ? "bg-sky-600/20 text-sky-300" :
                          "bg-slate-700 text-slate-400"}`}>
                          {k.intent}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Tab: Audit */}
      {tab === "audit" && (
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
          <motion.div variants={fadeUp} className="grid grid-cols-3 gap-4">
            <Card className="bg-[#111827] border-slate-800 rounded-2xl col-span-3 lg:col-span-1">
              <CardContent className="p-6 text-center">
                <div className="relative w-28 h-28 mx-auto mb-4">
                  <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="rgb(30,41,59)" strokeWidth="10" />
                    <circle cx="60" cy="60" r="50" fill="none" stroke="rgb(99,102,241)" strokeWidth="10"
                      strokeDasharray={`${(auditScore / 100) * 314} 314`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-slate-100">{auditScore}</span>
                    <span className="text-xs text-slate-500">/ 100</span>
                  </div>
                </div>
                <p className="font-semibold text-slate-200 mb-1">Audit Score</p>
                <p className="text-xs text-slate-500">Last run: 5 hours ago</p>
                <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                  <div><div className="text-lg font-bold text-rose-400">{criticalCount}</div><div className="text-[10px] text-slate-600">Critical</div></div>
                  <div><div className="text-lg font-bold text-amber-400">{warningCount}</div><div className="text-[10px] text-slate-600">Warnings</div></div>
                  <div><div className="text-lg font-bold text-sky-400">2</div><div className="text-[10px] text-slate-600">Info</div></div>
                </div>
              </CardContent>
            </Card>
            <div className="col-span-3 lg:col-span-2 space-y-3">
              {AUDIT_ISSUES.map((issue, i) => {
                const cfg = severityConfig[issue.severity as keyof typeof severityConfig];
                return (
                  <motion.div key={i} variants={fadeUp}>
                    <Card className={`bg-[#111827] border-slate-800 rounded-2xl border-l-2 ${issue.severity === "critical" ? "border-l-rose-500" : issue.severity === "warning" ? "border-l-amber-500" : "border-l-sky-500"}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${cfg.bg}`}>
                            <ExclamationTriangleIcon className={`w-4 h-4 ${cfg.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${cfg.badge}`}>{cfg.label}</span>
                              <span className="text-sm font-semibold text-slate-200">{issue.title}</span>
                            </div>
                            <p className="text-xs text-slate-500 mb-2">{issue.desc}</p>
                            <div className="flex items-start gap-1.5 text-xs text-slate-400 bg-slate-800/50 rounded-lg px-3 py-2">
                              <BoltIcon className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                              <span>{issue.fix}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Tab: Briefs */}
      {tab === "briefs" && (
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
          <motion.div variants={fadeUp} className="flex justify-between items-center">
            <p className="text-sm text-slate-500">AI-generated content briefs optimised for your top keyword opportunities</p>
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2">
              <PlusIcon className="w-4 h-4" /> New Brief
            </Button>
          </motion.div>
          {BRIEFS.map((b, i) => (
            <motion.div key={b.title} variants={fadeUp}>
              <Card className="bg-[#111827] border-slate-800 rounded-2xl hover:border-slate-700 transition-colors">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                    <DocumentTextIcon className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-slate-100 text-sm">{b.title}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${b.status === "ready" ? "bg-emerald-600/20 text-emerald-300" : b.status === "in_review" ? "bg-amber-600/20 text-amber-300" : "bg-slate-700 text-slate-400"}`}>
                        {b.status === "in_review" ? "In Review" : b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>Target: <span className="text-slate-400">{b.kw}</span></span>
                      <span>{b.words.toLocaleString()} words</span>
                      <span>{b.vol.toLocaleString()} mo/vol</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="border-slate-700 text-slate-400 hover:text-slate-200 rounded-xl shrink-0 gap-2">
                    <ArrowUpRightIcon className="w-3.5 h-3.5" /> Open
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Tab: Backlinks */}
      {tab === "backlinks" && (
        <motion.div variants={fadeUp} initial="hidden" animate="show">
          <Card className="bg-[#111827] border-slate-800 rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-800 pb-4">
              <CardTitle className="text-base text-slate-100 flex items-center gap-2">
                <LinkIcon className="w-4.5 h-4.5 text-indigo-400" style={{ width: 18, height: 18 }} /> Recent Backlinks
              </CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800">
                    {["Domain","DA","Type","Anchor Text","Date"].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {BACKLINKS.map((b, i) => (
                    <motion.tr key={b.domain} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                      className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <GlobeAltIcon className="w-3.5 h-3.5 text-slate-500" />
                          <span className="text-slate-200 font-medium">{b.domain}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`font-bold tabular-nums ${b.da >= 85 ? "text-emerald-400" : b.da >= 70 ? "text-indigo-400" : "text-slate-400"}`}>{b.da}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${b.type === "dofollow" ? "bg-emerald-600/20 text-emerald-300" : "bg-slate-700 text-slate-400"}`}>{b.type}</span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-400 text-sm">{b.anchor}</td>
                      <td className="px-5 py-3.5 text-slate-500 text-xs">{b.date}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      )}

    </motion.div>
  );
});
