import { useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BuildingOffice2Icon, UsersIcon, TrophyIcon, GlobeAltIcon,
  CpuChipIcon, BoltIcon, CheckCircleIcon, XMarkIcon,
  ChevronRightIcon, SparklesIcon, RocketLaunchIcon,
  MagnifyingGlassIcon, PencilSquareIcon, EnvelopeIcon,
  MegaphoneIcon, ChartBarIcon, ShareIcon, ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";

const INDUSTRIES = [
  "B2B SaaS","E-commerce","Agency / Consultancy","FinTech","HealthTech",
  "MarTech","EdTech","Developer Tools","Enterprise Software","Other",
];

const GOALS = [
  { icon: MagnifyingGlassIcon, label: "Grow organic traffic",    color: "text-sky-400",     bg: "bg-sky-500/10 border-sky-500/30"     },
  { icon: UsersIcon,           label: "Generate more leads",     color: "text-violet-400",  bg: "bg-violet-500/10 border-violet-500/30"},
  { icon: TrophyIcon,          label: "Increase revenue",        color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30"},
  { icon: ArrowTrendingUpIcon, label: "Build brand awareness",   color: "text-indigo-400",  bg: "bg-indigo-500/10 border-indigo-500/30"},
  { icon: MegaphoneIcon,       label: "Launch a product",        color: "text-primary-500",  bg: "bg-primary-600/10 border-primary-600/30"},
  { icon: SparklesIcon,        label: "Replace my agency",       color: "text-pink-400",    bg: "bg-pink-500/10 border-pink-500/30"   },
];

const AGENTS = [
  { icon: MagnifyingGlassIcon, name: "SEO Agent",         color: "text-sky-400",     delay: 0 },
  { icon: PencilSquareIcon,    name: "Creative Agent",    color: "text-violet-400",  delay: 0.3 },
  { icon: EnvelopeIcon,        name: "Email Agent",       color: "text-emerald-400", delay: 0.6 },
  { icon: MegaphoneIcon,       name: "Paid Ads Agent",    color: "text-primary-500",  delay: 0.9 },
  { icon: ChartBarIcon,        name: "Analytics Agent",   color: "text-indigo-400",  delay: 1.2 },
  { icon: ShareIcon,           name: "Social Agent",      color: "text-pink-400",    delay: 1.5 },
  { icon: UsersIcon,           name: "CRM Agent",         color: "text-teal-400",    delay: 1.8 },
  { icon: CpuChipIcon,         name: "Orchestrator",      color: "text-amber-400",   delay: 2.1 },
];

interface OnboardingModalProps {
  onComplete: () => void;
}

export const OnboardingModal = memo(function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [selectedGoals, setSelectedGoals] = useState<Set<string>>(new Set());
  const [launching, setLaunching] = useState(false);
  const [launched, setLaunched] = useState(false);
  const TOTAL = 4;

  const toggleGoal = (g: string) => setSelectedGoals(s => {
    const n = new Set(s);
    n.has(g) ? n.delete(g) : n.add(g);
    return n;
  });

  const handleLaunch = () => {
    setLaunching(true);
    setTimeout(() => setLaunched(true), 2400);
    setTimeout(() => onComplete(), 4000);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div className="absolute inset-0 bg-black/70 backdrop-blur-md"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} />

      <motion.div className="relative w-full max-w-2xl bg-[#0f1929] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden"
        initial={{ opacity: 0, scale: 0.94, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}>

        {/* Gradient top bar */}
        <div className="h-1 bg-gradient-to-r from-indigo-600 via-violet-500 to-blue-500" />

        {/* Skip button */}
        {!launching && (
          <button onClick={onComplete}
            className="absolute top-4 right-4 text-slate-600 hover:text-slate-400 transition-colors p-1.5 rounded-lg hover:bg-slate-800/50 z-10">
            <XMarkIcon className="w-4 h-4" />
          </button>
        )}

        <AnimatePresence mode="wait">

          {/* STEP 1: Brand Setup */}
          {step === 1 && !launching && (
            <motion.div key="step1" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
              className="p-8 space-y-6">
              <div className="text-center mb-2">
                <motion.div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-600/30"
                  animate={{ rotate: [0, -3, 3, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
                  <CpuChipIcon className="w-8 h-8 text-white" />
                </motion.div>
                <h2 className="text-2xl font-bold text-slate-100 mb-1">Welcome to Digital CMO AI</h2>
                <p className="text-sm text-slate-500">Let's set up your AI marketing team in 2 minutes.</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Company Name</label>
                  <input className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/40 transition-all" placeholder="Acme Corp" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Website</label>
                  <input className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/40 transition-all" placeholder="https://acme.com" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Monthly Marketing Budget</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["< $5K","$5K–$20K","$20K–$50K","$50K–$100K","$100K+","Not sure"].map(b => (
                      <button key={b} className="px-3 py-2 rounded-xl border border-slate-700 text-xs text-slate-400 hover:border-indigo-500/50 hover:text-indigo-400 hover:bg-indigo-600/10 transition-all">{b}</button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Industry */}
          {step === 2 && !launching && (
            <motion.div key="step2" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
              className="p-8 space-y-5">
              <div>
                <h2 className="text-xl font-bold text-slate-100 mb-1">What's your industry?</h2>
                <p className="text-sm text-slate-500">Your AI team will specialise their knowledge and tactics for your sector.</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {INDUSTRIES.map(ind => (
                  <button key={ind} onClick={() => setSelectedIndustry(ind)}
                    className={`px-4 py-3 rounded-xl border text-sm font-medium text-left transition-all ${
                      selectedIndustry === ind
                        ? "border-indigo-500 bg-indigo-600/15 text-indigo-300"
                        : "border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200"
                    }`}>
                    {ind}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 3: Goals */}
          {step === 3 && !launching && (
            <motion.div key="step3" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
              className="p-8 space-y-5">
              <div>
                <h2 className="text-xl font-bold text-slate-100 mb-1">What are your main goals?</h2>
                <p className="text-sm text-slate-500">Select all that apply — your AI CMO will prioritise accordingly.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {GOALS.map(g => {
                  const active = selectedGoals.has(g.label);
                  return (
                    <button key={g.label} onClick={() => toggleGoal(g.label)}
                      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border text-sm font-medium text-left transition-all ${
                        active ? `${g.bg} ${g.color} border-current` : "border-slate-700 text-slate-400 hover:border-slate-600"
                      }`}>
                      <g.icon className={`w-4.5 h-4.5 shrink-0 ${active ? g.color : "text-slate-600"}`} style={{ width: 18, height: 18 }} />
                      {g.label}
                      {active && <CheckCircleIcon className="w-4 h-4 ml-auto shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 4: Competitors */}
          {step === 4 && !launching && (
            <motion.div key="step4" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
              className="p-8 space-y-5">
              <div>
                <h2 className="text-xl font-bold text-slate-100 mb-1">Who are your competitors?</h2>
                <p className="text-sm text-slate-500">Your AI team will analyse their strategy, content, ads, and SEO to find your edge.</p>
              </div>
              <div className="space-y-3">
                {[1, 2, 3].map(n => (
                  <div key={n}>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Competitor {n} {n > 1 ? "(optional)" : ""}</label>
                    <input className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/40 transition-all" placeholder={`https://competitor${n}.com`} />
                  </div>
                ))}
              </div>
              <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-xl px-4 py-3 flex items-start gap-3">
                <BoltIcon className="w-4.5 h-4.5 text-indigo-400 shrink-0 mt-0.5" style={{ width: 18, height: 18 }} />
                <p className="text-xs text-slate-400 leading-relaxed">Your AI team will run a full competitor intelligence scan — content gaps, ad copy, backlinks, and keyword opportunities — within the first 24 hours.</p>
              </div>
            </motion.div>
          )}

          {/* LAUNCHING */}
          {launching && (
            <motion.div key="launching" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="p-10 text-center">
              <AnimatePresence mode="wait">
                {!launched ? (
                  <motion.div key="deploying" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <motion.div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-600/30"
                      animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                      <CpuChipIcon className="w-10 h-10 text-white" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-slate-100 mb-2">Deploying your AI team…</h3>
                    <p className="text-sm text-slate-500 mb-8">Setting up 8 AI agents with your brand context.</p>
                    <div className="grid grid-cols-4 gap-3">
                      {AGENTS.map((agent, i) => (
                        <motion.div key={agent.name} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: agent.delay }}
                          className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-slate-800/60 border border-slate-700">
                          <agent.icon className={`w-5 h-5 ${agent.color}`} />
                          <span className="text-[10px] text-slate-500 text-center leading-tight">{agent.name}</span>
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: agent.delay + 0.2 }}>
                            <CheckCircleIcon className={`w-3.5 h-3.5 ${agent.color}`} />
                          </motion.div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                    <motion.div className="w-20 h-20 mx-auto mb-6 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl flex items-center justify-center"
                      initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                      <RocketLaunchIcon className="w-10 h-10 text-emerald-400" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-slate-100 mb-2">Your AI CMO is live! 🚀</h3>
                    <p className="text-sm text-slate-500">8 agents are already working on your marketing. Taking you to your dashboard…</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        {!launching && (
          <div className="flex items-center justify-between px-8 py-5 border-t border-slate-800">
            <div className="flex gap-1.5">
              {Array.from({ length: TOTAL }).map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i + 1 === step ? "w-6 bg-indigo-500" : i + 1 < step ? "w-3 bg-indigo-700" : "w-3 bg-slate-700"}`} />
              ))}
            </div>
            <div className="flex gap-2">
              {step > 1 && (
                <button onClick={() => setStep(s => s - 1)} className="text-sm text-slate-500 hover:text-slate-300 transition-colors px-4 py-2">← Back</button>
              )}
              <motion.button
                onClick={() => step < TOTAL ? setStep(s => s + 1) : handleLaunch()}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/25 transition-all">
                {step === TOTAL
                  ? <><RocketLaunchIcon className="w-4 h-4" /> Launch my AI CMO</>
                  : <>Continue <ChevronRightIcon className="w-4 h-4" /></>}
              </motion.button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
});
