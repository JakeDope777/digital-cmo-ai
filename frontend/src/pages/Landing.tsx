import React, { useRef } from "react";
import { CpuChipIcon, BoltIcon, ChevronRightIcon, PlayCircleIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { Link } from "wouter";
import { motion, useInView } from "framer-motion";

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25,0.1,0.25,1] } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

const COMPANIES = ["Stripe", "Notion", "Figma", "Linear", "Vercel"];

const FEATURES = [
  { emoji: "🧠", title: "AI Chat CMO", desc: "Ask anything. Get expert marketing strategy instantly." },
  { emoji: "🚀", title: "Campaign Builder", desc: "Launch campaigns across channels in minutes, not weeks." },
  { emoji: "📊", title: "Analytics Intelligence", desc: "Know which campaigns make money. Cut the rest." },
  { emoji: "✍️", title: "Content Factory", desc: "Blog posts, emails, ads — all in your brand voice." },
  { emoji: "🔗", title: "CRM Integration", desc: "HubSpot, Salesforce, Mailchimp — all connected." },
  { emoji: "🔍", title: "SEO Intelligence", desc: "Outrank your competitors with AI-powered SEO strategy." },
];

const PLANS = [
  {
    name: "Free", price: "$0", period: "/mo", popular: false,
    desc: "Try it risk-free. No credit card needed.",
    features: ["10 AI queries/day", "1 active campaign", "Basic analytics", "Email support"],
    cta: "Get Started Free", plan: "free",
  },
  {
    name: "Pro", price: "$99", period: "/mo", popular: true,
    desc: "The full AI CMO for scaling teams.",
    features: ["Unlimited AI queries", "10 campaigns", "All integrations", "Priority support", "Advanced analytics", "Content Factory"],
    cta: "Start Free Trial", plan: "pro",
  },
  {
    name: "Enterprise", price: "$499", period: "/mo", popular: false,
    desc: "Custom power for large marketing orgs.",
    features: ["Everything in Pro", "Dedicated CSM", "White-label options", "SSO + advanced security", "Custom integrations", "SLA guarantee"],
    cta: "Contact Sales", plan: "enterprise",
  },
];

function Section({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <section id={id} ref={ref} className={className}>
      <motion.div variants={stagger} initial="hidden" animate={inView ? "show" : "hidden"}>
        {children}
      </motion.div>
    </section>
  );
}

export function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">

      {/* ── Nav ── */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-slate-950/90 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between" style={{ height: 68 }}>
          <div className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <CpuChipIcon className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-400 rounded-full flex items-center justify-center">
                <BoltIcon className="w-1.5 h-1.5 text-amber-900" />
              </span>
            </div>
            <span className="font-bold text-base tracking-tight">Digital CMO AI</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden sm:block text-sm text-slate-400 hover:text-white transition-colors">Log in</Link>
            <Link href="/register">
              <motion.button
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 transition-colors"
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              >
                Start Free Trial
              </motion.button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-40 pb-20 overflow-hidden text-center">
        {/* Animated gradient background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[800px] h-[500px]">
            <motion.div
              className="absolute inset-0 rounded-full bg-indigo-600/20 blur-[120px]"
              animate={{ scale: [1, 1.1, 1], opacity: [0.6, 0.9, 0.6] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute top-20 right-0 w-[350px] h-[300px] rounded-full bg-violet-600/15 blur-[100px]"
              animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            />
          </div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-400/10 border border-indigo-400/25 text-sm font-semibold text-indigo-400 mb-8"
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          >
            <motion.span className="w-2 h-2 rounded-full bg-indigo-400" animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }} transition={{ duration: 2, repeat: Infinity }} />
            AI-powered marketing — starting at $0/mo
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.08] mb-6"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          >
            Your AI Chief Marketing Officer{" "}
            <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-blue-400">
              On Demand
            </span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          >
            Replace your $20K/mo agency. Get agency-quality campaigns, content, and analytics —{" "}
            <span className="text-slate-200">powered by AI, delivered in seconds.</span>
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link href="/register">
              <motion.button
                className="h-14 px-8 rounded-full text-lg font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_50px_-10px_rgba(99,102,241,0.7)] transition-colors flex items-center gap-2"
                whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
              >
                Start Free Trial <ChevronRightIcon className="w-5 h-5" />
              </motion.button>
            </Link>
            <a href="#features">
              <motion.button
                className="h-14 px-8 rounded-full text-lg font-semibold border border-slate-700 bg-slate-900/50 text-slate-300 hover:bg-slate-800 transition-colors flex items-center gap-2"
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              >
                <PlayCircleIcon className="w-5 h-5" /> See it in action
              </motion.button>
            </a>
          </motion.div>

          <motion.p
            className="mt-5 text-sm text-slate-500"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          >
            14-day free trial · No credit card required · Setup in 5 minutes
          </motion.p>
        </div>
      </section>

      {/* ── Social Proof Bar ── */}
      <section className="py-10 border-y border-white/5 bg-slate-900/60">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-slate-500 mb-7">
            Trusted by 500+ marketing teams at companies like
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {COMPANIES.map((name) => (
              <div key={name} className="flex items-center justify-center px-6 py-2.5 rounded-lg border border-slate-700/60 bg-slate-800/40 min-w-[100px]">
                <span className="text-sm font-semibold text-slate-400 tracking-wide">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <Section id="features" className="py-24 max-w-6xl mx-auto px-6">
        <motion.div className="text-center mb-14" variants={fadeUp}>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Platform</p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Everything your CMO does — automated</h2>
          <p className="text-lg text-slate-400 max-w-xl mx-auto">Six specialized AI agents working in parallel, 24/7, for less than a single hire.</p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <motion.div
              key={f.title}
              variants={fadeUp}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 hover:border-indigo-500/40 hover:bg-slate-900 transition-all duration-300 group"
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <div className="text-3xl mb-4">{f.emoji}</div>
              <h3 className="font-bold text-base text-white mb-2">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ── Pricing ── */}
      <Section id="pricing" className="py-24 border-t border-white/5 bg-slate-900/40">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div className="text-center mb-14" variants={fadeUp}>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Pricing</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Less than one marketing hire</h2>
            <p className="text-lg text-slate-400 max-w-xl mx-auto">Start free. Upgrade when you're ready. No contracts, cancel anytime.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
            {PLANS.map((plan) => (
              <motion.div
                key={plan.name}
                variants={fadeUp}
                className={`relative rounded-2xl border p-7 ${
                  plan.popular
                    ? "border-indigo-500/60 bg-indigo-500/5 shadow-2xl shadow-indigo-500/10"
                    : "border-slate-800 bg-slate-900/60"
                }`}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-indigo-600 text-white text-[11px] font-bold uppercase tracking-wider whitespace-nowrap">
                    Most Popular
                  </div>
                )}
                <p className="font-bold text-sm text-slate-400 mb-1">{plan.name}</p>
                <div className="flex items-end gap-1 mb-2">
                  <span className="text-4xl font-black text-white">{plan.price}</span>
                  <span className="text-slate-400 mb-1">{plan.period}</span>
                </div>
                <p className="text-sm text-slate-400 mb-6">{plan.desc}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm">
                      <CheckCircleIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-slate-300">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href={`/register?plan=${plan.plan}`}>
                  <button className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    plan.popular
                      ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25"
                      : "border border-slate-700 bg-transparent hover:bg-slate-800 text-white"
                  }`}>
                    {plan.cta}
                  </button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── CTA Banner ── */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-violet-900/20 to-slate-950" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-600/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Your AI CMO is ready.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Are you?</span>
            </h2>
            <p className="text-lg text-slate-400 mb-8">Join 500+ teams that replaced their agencies. Free for 14 days.</p>
            <Link href="/register">
              <motion.button
                className="h-14 px-10 rounded-full text-lg font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_60px_-10px_rgba(99,102,241,0.8)]"
                whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.98 }}
              >
                Start Free Trial — No Card Needed
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-10 bg-slate-950">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
              <CpuChipIcon className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm text-slate-400">Digital CMO AI</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-slate-500">
            <a href="#" className="hover:text-slate-300 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Terms</a>
            <a href="mailto:hello@digitalcmo.ai" className="hover:text-slate-300 transition-colors">Contact</a>
          </div>
          <p className="text-xs text-slate-600">© 2026 Digital CMO AI. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
