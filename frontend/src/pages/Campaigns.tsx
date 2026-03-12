import { memo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { fadeUp, stagger } from "@/lib/motion";
import {
  MegaphoneIcon, PlusIcon, PauseIcon, PlayIcon, EyeIcon, PencilIcon,
  ArrowTrendingUpIcon, CursorArrowRaysIcon, BanknotesIcon, UsersIcon,
  MagnifyingGlassIcon, FunnelIcon, ShareIcon, EnvelopeIcon,
  ChartBarIcon, GlobeAltIcon, SparklesIcon, CheckCircleIcon,
  XMarkIcon, ChevronRightIcon, BoltIcon,
} from "@heroicons/react/24/outline";

type Status = "active" | "paused" | "draft" | "complete";
type Channel = "google" | "meta" | "linkedin" | "email" | "seo" | "content" | "social";

interface Campaign {
  id: number; name: string; status: Status; channels: Channel[];
  goal: string; spend: number; revenue: number; leads: number; roas: number;
  start: string; end: string | null; budget: number; progress: number;
}

const CHANNEL_META: Record<Channel, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  google:   { label: "Google Ads",  color: "text-blue-400",    bg: "bg-blue-500/15 border-blue-500/30",    icon: MagnifyingGlassIcon },
  meta:     { label: "Meta Ads",    color: "text-indigo-400",  bg: "bg-indigo-500/15 border-indigo-500/30",icon: ShareIcon },
  linkedin: { label: "LinkedIn",    color: "text-sky-400",     bg: "bg-sky-500/15 border-sky-500/30",      icon: GlobeAltIcon },
  email:    { label: "Email",       color: "text-emerald-400", bg: "bg-emerald-500/15 border-emerald-500/30",icon: EnvelopeIcon },
  seo:      { label: "SEO",         color: "text-violet-400",  bg: "bg-violet-500/15 border-violet-500/30",icon: ChartBarIcon },
  content:  { label: "Content",     color: "text-amber-400",   bg: "bg-amber-500/15 border-amber-500/30",  icon: SparklesIcon },
  social:   { label: "Social",      color: "text-pink-400",    bg: "bg-pink-500/15 border-pink-500/30",    icon: ShareIcon },
};

const STATUS_CONFIG: Record<Status, { label: string; color: string; bg: string; dot: string }> = {
  active:   { label: "Active",    color: "text-emerald-400", bg: "bg-emerald-600/15 border-emerald-500/30", dot: "bg-emerald-400" },
  paused:   { label: "Paused",    color: "text-amber-400",   bg: "bg-amber-600/15 border-amber-500/30",    dot: "bg-amber-400"   },
  draft:    { label: "Draft",     color: "text-slate-400",   bg: "bg-slate-700/40 border-slate-700",       dot: "bg-slate-500"   },
  complete: { label: "Complete",  color: "text-sky-400",     bg: "bg-sky-600/15 border-sky-500/30",        dot: "bg-sky-400"     },
};

const CAMPAIGNS: Campaign[] = [
  { id: 1, name: "Q2 SaaS Lead Gen", status: "active", channels: ["google","email","linkedin"],
    goal: "Lead Generation", spend: 14800, revenue: 62200, leads: 847, roas: 4.2,
    start: "Mar 1", end: "May 31", budget: 45000, progress: 33 },
  { id: 2, name: "Agency Replacement — Paid Social", status: "active", channels: ["meta","linkedin"],
    goal: "Brand Awareness", spend: 8200, revenue: 29600, leads: 312, roas: 3.6,
    start: "Feb 15", end: "Apr 15", budget: 24000, progress: 62 },
  { id: 3, name: "SEO Content Blitz — Organic", status: "active", channels: ["seo","content"],
    goal: "Organic Growth", spend: 3100, revenue: 18900, leads: 524, roas: 6.1,
    start: "Jan 1", end: null, budget: 12000, progress: 26 },
  { id: 4, name: "Onboarding Email Nurture", status: "active", channels: ["email"],
    goal: "Activation", spend: 420, revenue: 11200, leads: 843, roas: 26.7,
    start: "Mar 3", end: null, budget: 1800, progress: 23 },
  { id: 5, name: "LinkedIn Thought Leadership", status: "paused", channels: ["linkedin","content","social"],
    goal: "Brand Awareness", spend: 2800, revenue: 6100, leads: 88, roas: 2.2,
    start: "Feb 1", end: "Mar 31", budget: 8000, progress: 35 },
  { id: 6, name: "Google Ads — Retargeting", status: "paused", channels: ["google"],
    goal: "Conversion", spend: 1900, revenue: 5700, leads: 44, roas: 3.0,
    start: "Mar 5", end: "Mar 19", budget: 6000, progress: 32 },
  { id: 7, name: "Product Hunt Launch Blitz", status: "draft", channels: ["social","email","content"],
    goal: "User Acquisition", spend: 0, revenue: 0, leads: 0, roas: 0,
    start: "Apr 1", end: "Apr 7", budget: 5000, progress: 0 },
  { id: 8, name: "Q1 Brand Awareness — Meta", status: "complete", channels: ["meta","social"],
    goal: "Brand Awareness", spend: 18400, revenue: 54000, leads: 620, roas: 2.9,
    start: "Jan 1", end: "Mar 31", budget: 18000, progress: 100 },
];

const TABS: { id: Status | "all"; label: string }[] = [
  { id: "all",      label: "All" },
  { id: "active",   label: "Active" },
  { id: "paused",   label: "Paused" },
  { id: "draft",    label: "Drafts" },
  { id: "complete", label: "Complete" },
];

const KPI_CARDS = [
  { label: "Active Campaigns",    value: "4",       sub: "+2 vs last quarter",   icon: MegaphoneIcon,        color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20" },
  { label: "Total Ad Spend",      value: "$26.5K",  sub: "March 2026",           icon: BanknotesIcon,        color: "text-amber-400",  bg: "bg-amber-500/10 border-amber-500/20" },
  { label: "Total Revenue",       value: "$121.9K", sub: "↑ 43% vs last month",  icon: ArrowTrendingUpIcon,  color: "text-emerald-400",bg: "bg-emerald-500/10 border-emerald-500/20" },
  { label: "Blended ROAS",        value: "4.6×",    sub: "↑ from 3.8× last mo.", icon: CursorArrowRaysIcon,  color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
];

function NewCampaignModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const TOTAL = 3;

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div className="relative w-full max-w-xl bg-[#111827] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
        initial={{ scale: 0.96, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 8 }}
        transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-slate-100 text-lg">New Campaign</h3>
            <p className="text-xs text-slate-500 mt-0.5">Step {step} of {TOTAL}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 p-1.5 rounded-lg hover:bg-slate-800 transition-colors">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-slate-800">
          <motion.div className="h-full bg-indigo-600 rounded-full" animate={{ width: `${(step / TOTAL) * 100}%` }} transition={{ duration: 0.3 }} />
        </div>

        {/* Steps */}
        <div className="p-6 space-y-4 min-h-[280px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Campaign Name</label>
                  <input className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/40 transition-all" placeholder="e.g. Q2 Lead Gen — LinkedIn" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Primary Goal</label>
                  <div className="grid grid-cols-2 gap-2">
                    {["Lead Generation","Brand Awareness","Conversion","Organic Growth","Activation","User Acquisition"].map(g => (
                      <button key={g} className="px-3 py-2.5 rounded-xl border border-slate-700 text-xs text-slate-400 hover:border-indigo-500/50 hover:text-indigo-400 hover:bg-indigo-600/10 transition-all text-left">{g}</button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Channels</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.entries(CHANNEL_META) as [Channel, typeof CHANNEL_META[Channel]][]).map(([key, cfg]) => (
                      <button key={key} className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${cfg.bg} ${cfg.color} hover:opacity-80`}>
                        <cfg.icon className="w-3.5 h-3.5" />{cfg.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Monthly Budget</label>
                    <input className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all" placeholder="$0.00" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Target ROAS</label>
                    <input className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all" placeholder="4×" />
                  </div>
                </div>
              </motion.div>
            )}
            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div className="text-center py-4">
                  <motion.div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center"
                    animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                    <BoltIcon className="w-8 h-8 text-indigo-400" />
                  </motion.div>
                  <h4 className="font-bold text-slate-100 text-lg mb-2">Ready to launch!</h4>
                  <p className="text-sm text-slate-500">Your AI agents will automatically set up targeting, write copy, and optimise performance from day one.</p>
                </div>
                <div className="space-y-2">
                  {["SEO Agent will research keywords and competitors","Creative Agent will write 6 ad copy variants","Analytics Agent will set up conversion tracking","Paid Ads Agent will optimise bids automatically"].map((item, i) => (
                    <motion.div key={item} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                      className="flex items-center gap-2.5 text-sm text-slate-400">
                      <CheckCircleIcon className="w-4 h-4 text-indigo-400 shrink-0" />
                      {item}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800">
          <Button variant="outline" size="sm" className="border-slate-700 text-slate-400 rounded-xl"
            onClick={() => step > 1 ? setStep(s => s - 1) : onClose()}>
            {step === 1 ? "Cancel" : "← Back"}
          </Button>
          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 gap-2"
            onClick={() => step < TOTAL ? setStep(s => s + 1) : onClose()}>
            {step === TOTAL ? <><SparklesIcon className="w-4 h-4" /> Launch Campaign</> : <>Next <ChevronRightIcon className="w-3.5 h-3.5" /></>}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export const Campaigns = memo(function Campaigns() {
  const [tab, setTab] = useState<Status | "all">("all");
  const [creating, setCreating] = useState(false);
  const [paused, setPaused] = useState<Set<number>>(new Set());

  const visible = tab === "all" ? CAMPAIGNS : CAMPAIGNS.filter(c => c.status === tab);

  const togglePause = (id: number) => setPaused(s => {
    const next = new Set(s);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  return (
    <motion.div className="max-w-7xl mx-auto px-4 py-6 space-y-6" variants={stagger} initial="hidden" animate="show">

      {/* Header */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Campaigns</h1>
          <p className="text-sm text-slate-500 mt-0.5">AI-managed campaigns across all your marketing channels</p>
        </div>
        <Button onClick={() => setCreating(true)} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2">
          <PlusIcon className="w-4 h-4" /> New Campaign
        </Button>
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

      {/* Filter Tabs */}
      <motion.div variants={fadeUp} className="flex gap-1 p-1 bg-slate-900/60 rounded-xl border border-slate-800 w-fit">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${tab === t.id ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-slate-400 hover:text-slate-200"}`}>
            {t.label}
            <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${tab === t.id ? "bg-indigo-500/40" : "bg-slate-800"}`}>
              {t.id === "all" ? CAMPAIGNS.length : CAMPAIGNS.filter(c => c.status === t.id).length}
            </span>
          </button>
        ))}
      </motion.div>

      {/* Campaign Cards */}
      <motion.div variants={stagger} className="space-y-3">
        <AnimatePresence mode="popLayout">
          {visible.map((c, i) => {
            const isPaused = paused.has(c.id);
            const effectiveStatus: Status = isPaused ? "paused" : c.status;
            const scfg = STATUS_CONFIG[effectiveStatus];
            return (
              <motion.div key={c.id} variants={fadeUp}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}
                transition={{ delay: i * 0.04 }}>
                <Card className="bg-[#111827] border-slate-800 rounded-2xl hover:border-slate-700 transition-all duration-200 group">
                  <CardContent className="p-5">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* Left: info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="font-semibold text-slate-100 text-sm">{c.name}</h3>
                          <span className={`flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-full border font-medium ${scfg.bg} ${scfg.color}`}>
                            <motion.span className={`w-1.5 h-1.5 rounded-full ${scfg.dot}`}
                              animate={effectiveStatus === "active" ? { opacity: [1, 0.3, 1] } : {}}
                              transition={{ duration: 2, repeat: Infinity }} />
                            {scfg.label}
                          </span>
                          <span className="text-[11px] text-slate-600">{c.goal}</span>
                        </div>

                        {/* Channels */}
                        <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                          {c.channels.map(ch => {
                            const cfg = CHANNEL_META[ch];
                            return (
                              <span key={ch} className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-medium ${cfg.bg} ${cfg.color}`}>
                                <cfg.icon className="w-2.5 h-2.5" style={{ width: 10, height: 10 }} />{cfg.label}
                              </span>
                            );
                          })}
                        </div>

                        {/* Budget progress */}
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <motion.div className="h-full bg-indigo-600 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${c.progress}%` }}
                              transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.05 }} />
                          </div>
                          <span className="text-[10px] text-slate-500 shrink-0">{c.progress}% of ${(c.budget / 1000).toFixed(0)}K budget</span>
                        </div>

                        <div className="text-[10px] text-slate-600 mt-1">
                          {c.start} {c.end ? `→ ${c.end}` : "→ ongoing"}
                        </div>
                      </div>

                      {/* Metrics */}
                      <div className="grid grid-cols-4 gap-4 lg:gap-6 flex-shrink-0">
                        {[
                          { label: "Spend",   value: c.spend > 0 ? `$${(c.spend / 1000).toFixed(1)}K` : "—",   color: "text-slate-200" },
                          { label: "Revenue", value: c.revenue > 0 ? `$${(c.revenue / 1000).toFixed(1)}K` : "—", color: "text-emerald-400" },
                          { label: "Leads",   value: c.leads > 0 ? c.leads.toLocaleString() : "—",               color: "text-violet-400" },
                          { label: "ROAS",    value: c.roas > 0 ? `${c.roas}×` : "—",                            color: c.roas >= 4 ? "text-emerald-400" : c.roas >= 2 ? "text-amber-400" : "text-slate-400" },
                        ].map(m => (
                          <div key={m.label} className="text-center">
                            <div className={`text-base font-bold tabular-nums ${m.color}`}>{m.value}</div>
                            <div className="text-[10px] text-slate-600">{m.label}</div>
                          </div>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        {(c.status === "active" || c.status === "paused") && (
                          <Button variant="outline" size="sm" onClick={() => togglePause(c.id)}
                            className="border-slate-700 text-slate-400 hover:text-slate-200 rounded-xl gap-1.5 text-xs">
                            {isPaused ? <><PlayIcon className="w-3.5 h-3.5" /> Resume</> : <><PauseIcon className="w-3.5 h-3.5" /> Pause</>}
                          </Button>
                        )}
                        <Button variant="outline" size="sm"
                          className="border-slate-700 text-slate-400 hover:text-slate-200 rounded-xl gap-1.5 text-xs">
                          <EyeIcon className="w-3.5 h-3.5" /> View
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* New Campaign Modal */}
      <AnimatePresence>
        {creating && <NewCampaignModal onClose={() => setCreating(false)} />}
      </AnimatePresence>

    </motion.div>
  );
});
