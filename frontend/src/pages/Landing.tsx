import { useEffect, useRef, useState, useCallback } from "react";
import {
  CpuChipIcon, BoltIcon, ChevronRightIcon, PlayCircleIcon,
  ChartBarIcon, MagnifyingGlassIcon, PencilSquareIcon, EnvelopeIcon,
  ShareIcon, CursorArrowRaysIcon, MegaphoneIcon, ArrowTrendingUpIcon,
  UsersIcon, CheckIcon, StarIcon, ArrowRightIcon, ShieldCheckIcon,
  GlobeAltIcon, SignalIcon, ChevronDownIcon, SparklesIcon, LockClosedIcon,
  ClockIcon, CircleStackIcon, RocketLaunchIcon, ChartPieIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { fadeUp, stagger } from "@/lib/motion";

const AGENTS = [
  { icon: CpuChipIcon,         name: "Orchestrator",    desc: "Central intelligence coordinating all specialists with unified brand memory.", color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20" },
  { icon: MagnifyingGlassIcon, name: "SEO Agent",        desc: "Keyword clustering, content briefs, technical audits and rank tracking.", color: "text-sky-400", bg: "bg-sky-500/10 border-sky-500/20" },
  { icon: PencilSquareIcon,    name: "Content Agent",    desc: "Long-form thought leadership, case studies and SEO-optimized drafts.", color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
  { icon: CursorArrowRaysIcon, name: "Creative Agent",   desc: "Ad copy, A/B variants, landing page optimization and visual briefs.", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
  { icon: EnvelopeIcon,        name: "Email/CRM Agent",  desc: "Abandoned cart, loyalty and win-back flows — all personalised.", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  { icon: ShareIcon,           name: "Social Agent",     desc: "Content calendar, LinkedIn carousels, scheduling and engagement.", color: "text-pink-400", bg: "bg-pink-500/10 border-pink-500/20" },
  { icon: ChartBarIcon,        name: "Analytics Agent",  desc: "Anomaly detection, root-cause analysis and automated KPI reports.", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  { icon: MegaphoneIcon,       name: "Paid Ads Agent",   desc: "Automated bid optimisation toward ROAS targets and creative testing.", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
  { icon: UsersIcon,           name: "PR & Media Agent", desc: "Journalist matching, media placements and analyst relations.", color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20" },
  { icon: ArrowTrendingUpIcon, name: "Growth Agent",     desc: "Referral growth, inbound pipeline and A/B testing with significance.", color: "text-teal-400", bg: "bg-teal-500/10 border-teal-500/20" },
];

const TESTIMONIALS = [
  { quote: "Digital CMO AI replaced three separate tools and two contractors. Campaign launch time dropped from 2 weeks to 2 days.", name: "Sarah Chen", role: "CMO · ScaleUp Inc.", stat: "↓ 78% cost", color: "text-emerald-400" },
  { quote: "I went from managing 3 agencies and 6 tools to one platform that thinks like a CMO. My entire team got 10× more productive overnight.", name: "Marcus Rivera", role: "Head of Growth · Fast Growth SaaS", stat: "10× output", color: "text-indigo-400" },
  { quote: "124% increase in marketing ROI within Q1. The analytics and SEO agents surfaced opportunities we'd missed for years.", name: "Priya Patel", role: "Growth Lead · B2B Platform", stat: "↑ 124% ROI", color: "text-violet-400" },
  { quote: "We were spending $22K/month on an agency. Switched to Digital CMO AI at $119/month and our lead quality actually improved.", name: "James O'Brien", role: "Founder & CEO · Venture-backed Startup", stat: "↑ 272% growth", color: "text-amber-400" },
  { quote: "We manage 22 clinic locations. Now one strategist runs everything with the AI CMO coordinating all channels.", name: "Dr. Lisa Tran", role: "VP Marketing · Healthcare Group", stat: "−99% agency cost", color: "text-rose-400" },
  { quote: "Running 10 agents 24/7 costs less than a single marketing hire. The economics are undeniable.", name: "Alex Thompson", role: "Agency Owner", stat: "↑ 43% Revenue", color: "text-sky-400" },
];

const INTEGRATIONS = [
  { name: "Salesforce", color: "#00a1e0" }, { name: "HubSpot", color: "#ff7a59" },
  { name: "Marketo", color: "#5c4de2" }, { name: "Google Analytics", color: "#e37400" },
  { name: "Stripe", color: "#6772e5" }, { name: "Shopify", color: "#96bf48" },
  { name: "Slack", color: "#4a154b" }, { name: "Notion", color: "#ffffff" },
  { name: "Webflow", color: "#4353ff" }, { name: "Google Ads", color: "#4285f4" },
  { name: "Meta Ads", color: "#1877f2" }, { name: "LinkedIn", color: "#0077b5" },
  { name: "Mailchimp", color: "#f4d03f" }, { name: "Intercom", color: "#1f8ded" },
  { name: "Zapier", color: "#ff4f00" }, { name: "API", color: "#6366f1" },
];

const PUBLICATIONS = [
  "HubSpot", "G2", "Capterra", "VentureBeat", "TechCrunch", "Forbes", "WIRED", "Y Combinator", "Product Hunt",
];

const FAQ_ITEMS = [
  { q: "How does the 14-day free trial work?", a: "You get full access to all features — no credit card required. After 14 days, you choose a plan or your workspace pauses. Everything you built stays saved." },
  { q: "Which integrations are supported?", a: "We connect with HubSpot, Salesforce, Marketo, GA4, Google Ads, Meta Ads, Stripe, Shopify, LinkedIn, Mailchimp, Intercom, Slack, Notion, Webflow, Zapier, and more. 200+ integrations total." },
  { q: "How is my data protected?", a: "All data is AES-256 encrypted at rest and in transit with TLS 1.3. Your brand memory, campaigns, and analytics are fully isolated per workspace. We never train shared models on your proprietary data. GDPR compliant, SOC 2 on roadmap for Q3 2026." },
  { q: "Can I switch plans later?", a: "Yes, upgrade or downgrade at any time. If you locked in beta pricing, that price is yours forever regardless of how the public pricing changes." },
  { q: "What does 'unified memory' mean?", a: "Every agent shares the same long-term memory of your brand voice, campaign history, competitor landscape, and audience insights. No more briefing each tool separately." },
  { q: "Do I need a marketing team to use this?", a: "No. Digital CMO AI is designed to replace or augment your marketing team. Solo founders, lean teams, and enterprise marketers all use it effectively." },
];

const STATS = [
  { val: 2400, prefix: "", suffix: "+", label: "Active paying teams" },
  { val: 4.2, prefix: "$", suffix: "M", label: "MRR — 18 months from zero" },
  { val: 8, prefix: "$", suffix: "M", label: "Series A · Sequoia Capital led" },
  { val: 94, prefix: "", suffix: "%", label: "Retention rate" },
];

function useCountUp(target: number, decimals = 0, inView = false) {
  const [count, setCount] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;
    const duration = 1800;
    const start = performance.now();
    function step(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(parseFloat((eased * target).toFixed(decimals)));
      if (progress < 1) requestAnimationFrame(step);
      else setCount(target);
    }
    requestAnimationFrame(step);
  }, [inView, target, decimals]);
  return count;
}

function AnimatedStat({ val, prefix, suffix, label, inView }: typeof STATS[0] & { inView: boolean }) {
  const isDecimal = val % 1 !== 0;
  const count = useCountUp(val, isDecimal ? 1 : 0, inView);
  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-bold font-mono text-foreground mb-1 tabular-nums">
        {prefix}{isDecimal ? count.toFixed(1) : Math.floor(count).toLocaleString()}{suffix}
      </div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/8 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left text-sm font-semibold text-white/80 hover:text-white transition-colors"
      >
        {q}
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDownIcon className="ml-4 shrink-0 w-4 h-4 text-white/30" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="pb-5 text-sm leading-relaxed text-white/50 overflow-hidden"
          >
            {a}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function HeroDashboard() {
  return (
    <motion.div
      className="relative mx-auto rounded-2xl border border-border/50 bg-card/40 shadow-2xl backdrop-blur-xl overflow-hidden p-2"
      initial={{ opacity: 0, y: 30, rotateX: 8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      style={{ perspective: 1000 }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
      <div className="rounded-xl bg-background border border-border overflow-hidden shadow-2xl">
        <div className="h-10 bg-card border-b border-border flex items-center px-4 gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <span className="ml-3 text-[10px] text-muted-foreground font-mono">digital-cmo · dashboard · live</span>
          <span className="ml-auto text-[10px] text-emerald-400 font-mono flex items-center gap-1.5">
            <motion.span
              className="w-1.5 h-1.5 rounded-full bg-emerald-400"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            AI CMO Active
          </span>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Pipeline Rev.", val: "$248K", note: "↑ 18% MoM", c: "text-emerald-400" },
              { label: "ROAS", val: "5.3×", note: "↑ Target: 4.0×", c: "text-emerald-400" },
              { label: "CAC", val: "$125", note: "↓ −12.4%", c: "text-emerald-400" },
              { label: "Campaigns", val: "14", note: "3 optimising", c: "text-white/30" },
            ].map((k, i) => (
              <motion.div
                key={k.label}
                className="rounded-xl bg-white/5 border border-white/8 p-3"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.08 }}
              >
                <p className="text-[10px] text-white/40">{k.label}</p>
                <p className="mt-1 text-lg font-bold text-white tabular-nums">{k.val}</p>
                <p className={`mt-0.5 text-[10px] ${k.c}`}>{k.note}</p>
              </motion.div>
            ))}
          </div>

          <div className="rounded-xl bg-white/3 border border-white/8 p-3">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-white/20">Marketing Spend · 6 months</p>
            <svg viewBox="0 0 360 60" className="w-full h-14" preserveAspectRatio="none">
              <defs>
                <linearGradient id="gradHero" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0,50 C40,45 80,32 120,25 C160,18 200,30 240,18 C280,6 320,12 360,4" stroke="#6366f1" strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M0,50 C40,45 80,32 120,25 C160,18 200,30 240,18 C280,6 320,12 360,4 L360,60 L0,60 Z" fill="url(#gradHero)" />
            </svg>
          </div>

          <motion.div
            className="rounded-xl border border-primary/25 bg-primary/8 p-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <p className="text-[10px] font-semibold text-primary mb-1">AI CMO · insight · just now</p>
            <p className="text-[11px] text-white/70 leading-relaxed">
              Google Ads CTR dropped 0.8% this week. Reallocating <span className="text-white font-semibold">$1,200</span> projects{" "}
              <span className="text-emerald-400 font-semibold">+$4,100 revenue</span> this month.
            </p>
            <div className="mt-2 flex gap-2">
              <span className="rounded-md bg-primary px-2 py-0.5 text-[10px] font-bold text-white cursor-default">Apply Reallocation</span>
              <span className="rounded-md border border-white/15 px-2 py-0.5 text-[10px] text-white/40 cursor-default">View Analysis</span>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-2">
            {[
              "SEO Agent — 847 keywords clustered",
              "Creative Agent — 12 ad variants written",
              "Email Agent — 47 leads re-engaged",
              "Analytics Agent — 13 KPIs live",
            ].map((item, i) => (
              <motion.div
                key={item}
                className="h-9 bg-card/50 rounded-lg border border-border/30 px-3 flex items-center gap-2"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + i * 0.07 }}
              >
                <motion.span
                  className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                />
                <span className="text-[10px] text-muted-foreground truncate">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function FeatureBento() {
  const features = [
    {
      icon: CircleStackIcon,
      title: "Unified Brand Memory",
      desc: "Every agent — SEO, ads, content, email — shares the same long-term memory. Brand voice, campaign history, audience insights. No more briefing each tool separately.",
      color: "from-indigo-500/20 to-indigo-500/5",
      border: "border-indigo-500/20",
      iconColor: "text-indigo-400",
      iconBg: "bg-indigo-500/15",
      tags: ["Always in context", "Cross-agent", "Persistent"],
    },
    {
      icon: RocketLaunchIcon,
      title: "10 Agents, One Platform",
      desc: "From SEO to paid ads, content to PR — all coordinated by a master Orchestrator that knows your goals, brand, and budget constraints.",
      color: "from-violet-500/20 to-violet-500/5",
      border: "border-violet-500/20",
      iconColor: "text-violet-400",
      iconBg: "bg-violet-500/15",
      tags: ["Parallel execution", "Auto-prioritised", "Zero context switching"],
    },
    {
      icon: ChartPieIcon,
      title: "Real-Time Intelligence",
      desc: "Anomaly detection fires before damage is done. Automated ROAS optimisation. Root-cause analysis that surfaces the why, not just the what.",
      color: "from-sky-500/20 to-sky-500/5",
      border: "border-sky-500/20",
      iconColor: "text-sky-400",
      iconBg: "bg-sky-500/15",
      tags: ["Live data", "Predictive", "Auto-alert"],
    },
  ];

  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-24 max-w-6xl mx-auto px-4">
      <motion.div
        className="text-center mb-14"
        variants={fadeUp} initial="hidden" animate={inView ? "show" : "hidden"}
      >
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-3">Why it works</p>
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Built different. Runs different.</h2>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Not another dashboard. An AI system that actually executes — from brief to published, from brief to paid, from anomaly to fix.
        </p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        variants={stagger} initial="hidden" animate={inView ? "show" : "hidden"}
      >
        {features.map((f) => (
          <motion.div
            key={f.title}
            variants={fadeUp}
            className={`relative rounded-2xl border ${f.border} bg-gradient-to-b ${f.color} p-6 overflow-hidden group hover:border-opacity-60 transition-all duration-300`}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none" />
            <div className={`w-10 h-10 rounded-xl ${f.iconBg} flex items-center justify-center mb-5`}>
              <f.icon className={`w-5 h-5 ${f.iconColor}`} />
            </div>
            <h3 className="font-bold text-lg mb-2 text-foreground">{f.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">{f.desc}</p>
            <div className="flex flex-wrap gap-1.5">
              {f.tags.map((tag) => (
                <span key={tag} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${f.border} ${f.iconColor} bg-transparent`}>
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

function IntegrationMarquee() {
  const doubled = [...INTEGRATIONS, ...INTEGRATIONS];
  return (
    <section className="border-y border-white/5 bg-card/10 py-6 overflow-hidden">
      <p className="mb-4 text-center text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/40">
        Connects with your entire stack — 200+ integrations
      </p>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 z-10 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 z-10 bg-gradient-to-l from-background to-transparent" />
        <div className="flex animate-marquee" style={{ width: "max-content" }}>
          {doubled.map((item, i) => (
            <div key={i} className="mx-2 flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-4 py-2 text-sm font-medium whitespace-nowrap">
              <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color, opacity: 0.9 }} />
              <span className="text-white/60">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProblemSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-20 border-y border-white/5 bg-black/25">
      <div className="max-w-5xl mx-auto px-6">
        <motion.p
          className="mb-10 text-center text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/40"
          variants={fadeUp} initial="hidden" animate={inView ? "show" : "hidden"}
        >
          Why marketing teams switch to AI
        </motion.p>
        <motion.div
          className="grid grid-cols-1 gap-6 md:grid-cols-3"
          variants={stagger} initial="hidden" animate={inView ? "show" : "hidden"}
        >
          {[
            { stat: "14 hrs", unit: "/week", desc: "lost to manual reporting per marketing FTE", color: "text-indigo-400", border: "border-indigo-500/20", bg: "bg-indigo-500/5" },
            { stat: "$180K", unit: "/year", desc: "average agency retainer for a mid-market team", color: "text-violet-400", border: "border-violet-500/20", bg: "bg-violet-500/5" },
            { stat: "63%", unit: " of campaigns", desc: "underperform because of stale data and slow iteration", color: "text-sky-400", border: "border-sky-500/20", bg: "bg-sky-500/5" },
          ].map((item) => (
            <motion.div
              key={item.stat}
              variants={fadeUp}
              className={`rounded-2xl border ${item.border} ${item.bg} p-8 text-center`}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <div className="flex items-end justify-center gap-1 mb-3">
                <span className={`text-4xl font-black font-mono ${item.color}`}>{item.stat}</span>
                <span className={`text-sm font-semibold mb-1 ${item.color} opacity-60`}>{item.unit}</span>
              </div>
              <p className="text-sm text-white/50 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function CoordinationDiagram() {
  const agents = [
    { name: "Market Intel", angle: 70 },
    { name: "Creative", angle: 20 },
    { name: "SEO", angle: -30 },
    { name: "Content", angle: -75 },
    { name: "Paid Media", angle: -120 },
    { name: "Email/CRM", angle: -160 },
    { name: "Social", angle: 160 },
    { name: "PR", angle: 120 },
    { name: "Analytics", angle: 100 },
  ];
  const cx = 300, cy = 240, r = 170, rc = 52;

  return (
    <div className="relative w-full overflow-hidden">
      <svg viewBox="0 10 600 420" className="w-full max-w-2xl mx-auto" style={{ minHeight: 280 }}>
        <defs>
          <radialGradient id="orchGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.05" />
          </radialGradient>
          <radialGradient id="agentGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1e2535" stopOpacity="1" />
            <stop offset="100%" stopColor="#111827" stopOpacity="1" />
          </radialGradient>
        </defs>
        {agents.map((a, i) => {
          const rad = (a.angle * Math.PI) / 180;
          const ax = cx + r * Math.cos(rad);
          const ay = cy + r * Math.sin(rad);
          const gx = cx + (r - rc - 6) * Math.cos(rad);
          const gy = cy + (r - rc - 6) * Math.sin(rad);
          return <line key={i} x1={gx} y1={gy} x2={ax} y2={ay} stroke="#6366f1" strokeWidth="1" strokeOpacity="0.25" />;
        })}
        <circle cx={cx} cy={cy} r={rc + 30} fill="url(#orchGrad)" />
        <circle cx={cx} cy={cy} r={rc} fill="#111827" stroke="#6366f1" strokeWidth="1.5" strokeOpacity="0.6" />
        <text x={cx} y={cy - 8} textAnchor="middle" fill="#6366f1" fontSize="11" fontWeight="bold" letterSpacing="2">ORCHESTRATOR</text>
        <text x={cx} y={cy + 8} textAnchor="middle" fill="#6366f1" fontSize="9" fillOpacity="0.5">Brain</text>
        {agents.map((a, i) => {
          const rad = (a.angle * Math.PI) / 180;
          const ax = cx + r * Math.cos(rad);
          const ay = cy + r * Math.sin(rad);
          return (
            <g key={i}>
              <circle cx={ax} cy={ay} r={36} fill="url(#agentGrad)" stroke="#6366f1" strokeWidth="1" strokeOpacity="0.3" />
              <text x={ax} y={ay + 4} textAnchor="middle" fill="white" fontSize="8.5" fillOpacity="0.75">{a.name}</text>
            </g>
          );
        })}
      </svg>
      <div className="mt-6 mx-auto max-w-lg rounded-xl border border-white/8 bg-white/3 px-6 py-4 text-center">
        <p className="text-sm text-white/50">
          <span className="text-white/80">Long-term brand memory</span>
          <span className="mx-3 text-white/20">·</span>
          <span className="text-white/80">Campaign history</span>
          <span className="mx-3 text-white/20">·</span>
          <span className="text-white/80">Competitive intelligence</span>
        </p>
      </div>
    </div>
  );
}

function PricingSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const plans = [
    {
      name: "Starter", price: "$49", period: "/mo", popular: false,
      desc: "For solo founders and early-stage teams.",
      features: ["3 AI agents", "10K AI credits/mo", "HubSpot + GA4 integrations", "Email & chat support", "Brand memory (30 days)"],
      cta: "Start Free Trial", href: "/register", variant: "outline",
    },
    {
      name: "Growth", price: "$119", period: "/mo", popular: true,
      desc: "The full AI CMO for scaling marketing teams.",
      features: ["All 10 AI agents", "100K AI credits/mo", "200+ integrations", "Priority support + Slack", "Unlimited brand memory", "Custom agent workflows", "Advanced analytics"],
      cta: "Start Free Trial", href: "/register", variant: "primary",
    },
    {
      name: "Scale", price: "$299", period: "/mo", popular: false,
      desc: "Enterprise-grade for large marketing orgs.",
      features: ["All 10 AI agents + custom", "Unlimited AI credits", "White-label options", "Dedicated success manager", "SSO + advanced security", "SLA + uptime guarantee", "API access"],
      cta: "Contact Sales", href: "/register", variant: "outline",
    },
  ];

  return (
    <section id="pricing" ref={ref} className="py-24">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          className="text-center mb-14"
          variants={fadeUp} initial="hidden" animate={inView ? "show" : "hidden"}
        >
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-3">Pricing</p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Less than one marketing hire</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Beta pricing locked forever. Upgrade anytime, no contracts.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start"
          variants={stagger} initial="hidden" animate={inView ? "show" : "hidden"}
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={fadeUp}
              className={`relative rounded-2xl border p-7 ${
                plan.popular
                  ? "border-primary/60 bg-primary/5 shadow-2xl shadow-primary/10"
                  : "border-border bg-card/30"
              }`}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-white text-[11px] font-bold uppercase tracking-wider">
                  Most Popular
                </div>
              )}
              <p className="font-bold text-sm text-muted-foreground mb-1">{plan.name}</p>
              <div className="flex items-end gap-1 mb-2">
                <span className="text-4xl font-black text-foreground">{plan.price}</span>
                <span className="text-muted-foreground mb-1">{plan.period}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">{plan.desc}</p>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm">
                    <CheckCircleIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-foreground/80">{f}</span>
                  </li>
                ))}
              </ul>
              <Link href={plan.href}>
                <button className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  plan.popular
                    ? "bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 hover:shadow-primary/40"
                    : "border border-border bg-transparent hover:bg-card text-foreground"
                }`}>
                  {plan.cta}
                </button>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export function LandingPage() {
  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true, margin: "-80px" });
  const agentsRef = useRef(null);
  const agentsInView = useInView(agentsRef, { once: true, margin: "-80px" });
  const testimonialsRef = useRef(null);
  const testimonialsInView = useInView(testimonialsRef, { once: true, margin: "-80px" });

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">

      {/* ── Nav ──────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-background/85 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between" style={{ height: 72 }}>
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-lg shadow-indigo-500/25">
              <CpuChipIcon className="w-5 h-5 text-white" />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-amber-400 rounded-full flex items-center justify-center">
                <BoltIcon className="w-1.5 h-1.5 text-amber-900" />
              </span>
            </div>
            <span className="font-bold text-xl tracking-tight">Digital CMO AI</span>
          </div>

          <div className="hidden md:flex items-center gap-7 text-sm font-medium text-muted-foreground">
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
            <a href="#agents" className="hover:text-foreground transition-colors">Platform</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <a href="#proof" className="hover:text-foreground transition-colors">Customers</a>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden sm:inline-flex text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Log in</Link>
            <Link href="/register">
              <motion.button
                className="inline-flex items-center justify-center px-5 py-2 rounded-xl text-sm font-semibold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 transition-colors"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Start Free Trial
              </motion.button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative pt-36 pb-16 overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[700px] h-[500px] pointer-events-none">
          <div className="animate-orb-1 absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[350px] bg-indigo-600/20 blur-[120px] rounded-full" />
          <div className="animate-orb-2 absolute top-20 right-0 w-[300px] h-[250px] bg-violet-600/15 blur-[100px] rounded-full" />
          <div className="animate-orb-3 absolute top-10 left-0 w-[250px] h-[200px] bg-blue-500/10 blur-[80px] rounded-full" />
        </div>

        <div className="max-w-5xl mx-auto px-4 relative z-10 text-center mt-8">
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/25 text-sm font-semibold text-amber-400 mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.span
              className="flex h-2 w-2 rounded-full bg-amber-400"
              animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            />
            Limited beta pricing — locks in forever
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl xl:text-8xl font-bold tracking-tight mb-8 leading-[1.08]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
          >
            Your AI Chief Marketing Officer,{" "}
            <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-blue-400">
              Always On.
            </span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-4 leading-relaxed"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            10 AI agents that plan, execute, and optimize every channel — SEO, paid ads, content, email, and more.
          </motion.p>

          <motion.p
            className="text-base text-muted-foreground/70 max-w-xl mx-auto mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Join 2,400+ marketing teams. Start free, see results in 48 hours, no credit card needed.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            <Link href="/register">
              <motion.button
                className="inline-flex items-center justify-center h-13 px-8 rounded-full text-lg font-semibold bg-primary hover:bg-primary/90 text-white shadow-[0_0_50px_-10px_rgba(99,102,241,0.7)] w-full sm:w-auto transition-colors"
                style={{ height: 52 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                Start Free Trial
                <ChevronRightIcon className="ml-2 w-5 h-5" />
              </motion.button>
            </Link>
            <motion.button
              className="h-13 px-8 rounded-full text-lg font-semibold border border-border bg-card/50 backdrop-blur hover:bg-border/50 text-foreground w-full sm:w-auto transition-colors flex items-center justify-center gap-2"
              style={{ height: 52 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <PlayCircleIcon className="w-5 h-5" />
              Watch Demo
            </motion.button>
          </motion.div>

          <motion.div
            className="flex flex-wrap justify-center gap-3 mb-3"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          >
            {["14-day free trial", "Cancel anytime", "Setup in 5 minutes"].map((t) => (
              <span key={t} className="flex items-center gap-1.5 text-sm text-muted-foreground px-3 py-1.5 rounded-full border border-border/30 bg-card/30">
                <CheckIcon className="w-3.5 h-3.5 text-emerald-400" /> {t}
              </span>
            ))}
          </motion.div>

          <motion.div
            className="flex flex-wrap justify-center gap-3 mb-16"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
          >
            {["G2 Leader Winter 2024", "4.9/5 on Capterra", "Teams in 68 countries"].map((t) => (
              <span key={t} className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/25 bg-card/20 text-sm text-muted-foreground/80">
                <StarIcon className="w-3 h-3 text-amber-400 fill-amber-400" style={{ fill: "rgb(251 191 36)" }} /> {t}
              </span>
            ))}
          </motion.div>

          <HeroDashboard />
        </div>
      </section>

      {/* ── Featured In ───────────────────────────────────────────────── */}
      <section className="py-10 border-y border-white/5 bg-black/20">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-center text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/40 mb-7">
            Featured in &amp; trusted by teams from
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {PUBLICATIONS.map((p) => (
              <span key={p} className="text-sm font-semibold text-white/22 hover:text-white/50 transition-colors tracking-wide cursor-default">
                {p}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Integration Marquee ───────────────────────────────────────── */}
      <IntegrationMarquee />

      {/* ── Animated Stats ─────────────────────────────────────────────── */}
      <section ref={statsRef} className="py-20 bg-card/15">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-10"
            variants={stagger} initial="hidden" animate={statsInView ? "show" : "hidden"}
          >
            {STATS.map((s) => (
              <motion.div key={s.label} variants={fadeUp}>
                <AnimatedStat {...s} inView={statsInView} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Problem Section ───────────────────────────────────────────── */}
      <ProblemSection />

      {/* ── Feature Bento ─────────────────────────────────────────────── */}
      <FeatureBento />

      {/* ── How It Works ──────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 border-y border-white/5 bg-black/20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-3">Architecture</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">10 agents. One orchestrator.</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Each agent is a specialist. The Orchestrator coordinates them with shared brand memory and unified campaign context.
            </p>
          </div>
          <CoordinationDiagram />
        </div>
      </section>

      {/* ── Agents Grid ───────────────────────────────────────────────── */}
      <section id="agents" ref={agentsRef} className="py-24 max-w-6xl mx-auto px-4">
        <motion.div
          className="text-center mb-14"
          variants={fadeUp} initial="hidden" animate={agentsInView ? "show" : "hidden"}
        >
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-3">The Platform</p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Meet your AI marketing team</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            10 purpose-built agents, each a specialist. All running in parallel. All sharing context.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3"
          variants={stagger} initial="hidden" animate={agentsInView ? "show" : "hidden"}
        >
          {AGENTS.map((agent) => (
            <motion.div
              key={agent.name}
              variants={fadeUp}
              className={`rounded-2xl border ${agent.bg} p-5 group transition-all duration-200`}
              whileHover={{ y: -4, transition: { duration: 0.18 } }}
            >
              <div className={`w-9 h-9 rounded-xl ${agent.bg} flex items-center justify-center mb-4`}>
                <agent.icon className={`w-4.5 h-4.5 ${agent.color}`} style={{ width: 18, height: 18 }} />
              </div>
              <h3 className="font-bold text-sm text-foreground mb-1.5">{agent.name}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{agent.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────────────── */}
      <section id="proof" ref={testimonialsRef} className="py-24 border-y border-white/5 bg-black/20">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            className="text-center mb-14"
            variants={fadeUp} initial="hidden" animate={testimonialsInView ? "show" : "hidden"}
          >
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-3">Customer Stories</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Teams replacing agencies, not people</h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            variants={stagger} initial="hidden" animate={testimonialsInView ? "show" : "hidden"}
          >
            {TESTIMONIALS.map((t) => (
              <motion.div
                key={t.name}
                variants={fadeUp}
                className="rounded-2xl border border-white/8 bg-white/3 p-6 flex flex-col group hover:border-white/14 transition-all"
                whileHover={{ y: -3, transition: { duration: 0.18 } }}
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className="w-3.5 h-3.5 text-amber-400" style={{ fill: "rgb(251 191 36)" }} />
                  ))}
                </div>
                <p className="text-sm text-white/70 leading-relaxed flex-1 mb-5">"{t.quote}"</p>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/8">
                  <div>
                    <p className="text-sm font-semibold text-white/90">{t.name}</p>
                    <p className="text-xs text-white/40">{t.role}</p>
                  </div>
                  <span className={`text-sm font-bold font-mono ${t.color}`}>{t.stat}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Security & Trust ──────────────────────────────────────────── */}
      <section className="py-20 max-w-5xl mx-auto px-6">
        <div className="rounded-2xl border border-white/8 bg-white/3 p-10">
          <div className="text-center mb-10">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-3">Security</p>
            <h2 className="text-2xl md:text-3xl font-bold">Enterprise-grade security, always</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: LockClosedIcon, label: "AES-256 Encryption", sub: "At rest & in transit" },
              { icon: ShieldCheckIcon, label: "GDPR Compliant", sub: "SOC 2 roadmap Q3 2026" },
              { icon: CircleStackIcon, label: "Isolated Workspaces", sub: "Per-tenant data isolation" },
              { icon: ClockIcon, label: "99.9% Uptime SLA", sub: "Scale plan & above" },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-3">
                  <item.icon className="w-5 h-5 text-white/60" />
                </div>
                <p className="text-sm font-semibold text-white/80">{item.label}</p>
                <p className="text-xs text-white/40 mt-0.5">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────────────────── */}
      <PricingSection />

      {/* ── FAQ ───────────────────────────────────────────────────────── */}
      <section className="py-20 border-t border-white/5 bg-black/20">
        <div className="max-w-2xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight">Frequently asked</h2>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/3 px-8 py-4">
            {FAQ_ITEMS.map((item) => (
              <FAQItem key={item.q} {...item} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="relative py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-violet-900/20 to-background" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            <SparklesIcon className="w-8 h-8 text-primary/60 mx-auto mb-5" />
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-[1.1]">
              Your AI CMO is ready.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
                Are you?
              </span>
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
              Join 2,400+ teams that stopped managing tools and started running AI. Free for 14 days.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <motion.button
                  className="inline-flex items-center justify-center h-14 px-10 rounded-full text-lg font-semibold bg-primary hover:bg-primary/90 text-white shadow-[0_0_60px_-10px_rgba(99,102,241,0.8)] w-full sm:w-auto"
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Start Free Trial — No Card Needed
                  <ArrowRightIcon className="ml-2.5 w-5 h-5" />
                </motion.button>
              </Link>
            </div>
            <p className="mt-5 text-sm text-muted-foreground/50">
              14-day trial · Cancel anytime · Setup in 5 minutes
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-12 bg-black/30">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
                <CpuChipIcon className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-sm text-white/70">Digital CMO AI</span>
            </div>
            <div className="flex items-center gap-6 text-xs text-white/30">
              <a href="#" className="hover:text-white/60 transition-colors">Privacy</a>
              <a href="#" className="hover:text-white/60 transition-colors">Terms</a>
              <a href="#" className="hover:text-white/60 transition-colors">Security</a>
              <a href="#" className="hover:text-white/60 transition-colors">Status</a>
            </div>
            <p className="text-xs text-white/25">© 2026 Digital CMO AI. All rights reserved.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
