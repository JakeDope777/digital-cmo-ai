import { useEffect, useRef, useState } from "react";
import { Brain, Zap, ChevronRight, PlayCircle, BarChart3, Search, PenTool, Mail, Share2, Target, Megaphone, TrendingUp, Users, Check, Star, ArrowRight, Shield, Globe, Activity, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link } from "wouter";

const AGENTS = [
  { icon: Brain,       name: "Orchestrator",    desc: "Central intelligence coordinating all 9 specialists with unified brand memory." },
  { icon: Search,      name: "SEO Agent",        desc: "Keyword clustering, content briefs, technical audits and rank tracking." },
  { icon: PenTool,     name: "Content Agent",    desc: "Long-form thought leadership, case studies and SEO-optimized drafts." },
  { icon: Target,      name: "Creative Agent",   desc: "Ad copy, A/B variants, landing page optimization and visual briefs." },
  { icon: Mail,        name: "Email/CRM Agent",  desc: "Abandoned cart, loyalty and win-back flows — all personalised." },
  { icon: Share2,      name: "Social Agent",     desc: "Content calendar, LinkedIn carousels, scheduling and engagement." },
  { icon: BarChart3,   name: "Analytics Agent",  desc: "Anomaly detection, root-cause analysis and automated KPI reports." },
  { icon: Megaphone,   name: "Paid Ads Agent",   desc: "Automated bid optimisation toward ROAS targets and creative testing." },
  { icon: Users,       name: "PR & Media Agent", desc: "Journalist matching, media placements and analyst relations." },
  { icon: TrendingUp,  name: "Growth Agent",     desc: "Referral growth, inbound pipeline and A/B testing with significance." },
];

const TESTIMONIALS = [
  { quote: "Digital CMO AI replaced three separate tools and two contractors. Campaign launch time dropped from 2 weeks to 2 days.", name: "Sarah Chen", role: "CMO · ScaleUp Inc.", stat: "↓ 78% cost" },
  { quote: "I went from managing 3 agencies and 6 tools to one platform that thinks like a CMO. My entire team got 10× more productive overnight.", name: "Marcus Rivera", role: "Head of Growth · Fast Growth SaaS", stat: "10× output" },
  { quote: "124% increase in marketing ROI within Q1. The analytics and SEO agents working together surfaced opportunities we'd missed for years.", name: "Priya Patel", role: "Growth Lead · B2B Platform", stat: "↑ 124% ROI" },
  { quote: "We were spending $22K/month on an agency. Switched to Digital CMO AI at $119/month and our lead quality actually improved.", name: "James O'Brien", role: "Founder & CEO · Venture-backed Startup", stat: "↑ 272% growth" },
  { quote: "We manage 22 clinic locations and used to need a separate agency per region. Now one strategist runs everything.", name: "Dr. Lisa Tran", role: "VP Marketing · Healthcare Group", stat: "−99% agency cost" },
  { quote: "Running 10 agents 24/7 now costs less than a single marketing hire. The economics are undeniable.", name: "Alex Thompson", role: "Agency Owner", stat: "↑ 43% Revenue" },
];

const INTEGRATIONS = [
  { name: "Salesforce", color: "#00a1e0" }, { name: "HubSpot", color: "#ff7a59" },
  { name: "Marketo", color: "#5c4de2" }, { name: "Google Analytics", color: "#e37400" },
  { name: "Stripe", color: "#6772e5" }, { name: "Shopify", color: "#96bf48" },
  { name: "Slack", color: "#4a154b" }, { name: "Notion", color: "#ffffff" },
  { name: "Webflow", color: "#4353ff" }, { name: "Google Ads", color: "#4285f4" },
  { name: "Meta Ads", color: "#1877f2" }, { name: "LinkedIn", color: "#0077b5" },
  { name: "Mailchimp", color: "#ffe01b" }, { name: "Intercom", color: "#1f8ded" },
  { name: "Zapier", color: "#ff4f00" }, { name: "API", color: "#6366f1" },
];

const PUBLICATIONS = [
  { name: "HubSpot" }, { name: "G2" }, { name: "Capterra" },
  { name: "VentureBeat" }, { name: "TechCrunch" }, { name: "Forbes" },
  { name: "WIRED" }, { name: "Y Combinator" }, { name: "Product Hunt" },
];

const FAQ_ITEMS = [
  { q: "How does the 14-day free trial work?", a: "You get full access to all features — no credit card required. After 14 days, you choose a plan or your workspace pauses. Everything you built stays saved." },
  { q: "Which integrations are supported?", a: "We connect with HubSpot, Salesforce, Marketo, GA4, Google Ads, Meta Ads, Stripe, Shopify, LinkedIn, Mailchimp, Intercom, Slack, Notion, Webflow, Zapier, and more. 200+ integrations in total with new ones shipping weekly." },
  { q: "How is my data protected?", a: "All data is AES-256 encrypted at rest and in transit with TLS 1.3. Your brand memory, campaigns, and analytics are fully isolated per workspace. We never train shared models on your proprietary data. GDPR compliant, SOC 2 on roadmap for Q3 2026." },
  { q: "Can I switch plans later?", a: "Yes, upgrade or downgrade at any time. If you locked in beta pricing, that price is yours forever regardless of how the public pricing changes." },
  { q: "What does 'unified memory' mean?", a: "Every agent — SEO, paid ads, content, email — shares the same long-term memory of your brand voice, campaign history, competitor landscape, and audience insights. No more briefing each tool separately." },
  { q: "Do I need a marketing team to use this?", a: "No. Digital CMO AI is designed to replace or augment your marketing team. Solo founders, lean teams, and enterprise marketers all use it effectively. The AI CMO thinks strategically so you don't need to hire one." },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/8 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left text-sm font-semibold text-white/80 hover:text-white transition-colors"
      >
        {q}
        <ChevronDown className={`ml-4 shrink-0 w-4 h-4 text-white/30 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <p className="pb-5 text-sm leading-relaxed text-white/50">{a}</p>}
    </div>
  );
}

function HeroDashboard() {
  return (
    <div className="relative mx-auto rounded-2xl border border-border/50 bg-card/40 shadow-2xl backdrop-blur-xl overflow-hidden p-2 transform rotate-1 hover:rotate-0 transition-transform duration-500">
      <div className="rounded-xl bg-background border border-border overflow-hidden shadow-2xl">
        <div className="h-12 bg-card border-b border-border flex items-center px-4 gap-2">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <span className="ml-3 text-xs text-muted-foreground font-mono">digital-cmo · dashboard · live</span>
          <span className="ml-auto text-xs text-emerald-400 font-mono flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            AI CMO Active
          </span>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Pipeline Rev.", val: "$248K", note: "↑ 18% MoM", good: true },
              { label: "ROAS", val: "5.3×", note: "↑ Target: 4.0×", good: true },
              { label: "CAC", val: "$125", note: "↓ −12.4%", good: true },
              { label: "Campaigns", val: "14", note: "3 optimising", good: null },
            ].map((k) => (
              <div key={k.label} className="rounded-xl bg-white/5 border border-white/8 p-3">
                <p className="text-[10px] text-white/40">{k.label}</p>
                <p className="mt-1 text-lg font-bold text-white">{k.val}</p>
                <p className={`mt-0.5 text-[10px] ${k.good === true ? "text-emerald-400" : k.good === false ? "text-rose-400" : "text-white/30"}`}>{k.note}</p>
              </div>
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

          <div className="rounded-xl border border-primary/20 bg-primary/8 p-3">
            <p className="text-[10px] font-semibold text-primary mb-1">AI CMO · insight · just now</p>
            <p className="text-[11px] text-white/70 leading-relaxed">
              Google Ads CTR dropped 0.8% this week. Reallocating <span className="text-white font-semibold">$1,200</span> projects{" "}
              <span className="text-emerald-400 font-semibold">+$4,100 revenue</span> this month.
            </p>
            <div className="mt-2 flex gap-2">
              <span className="rounded-md bg-primary px-2 py-0.5 text-[10px] font-bold text-white cursor-default">Apply Reallocation</span>
              <span className="rounded-md border border-white/15 px-2 py-0.5 text-[10px] text-white/40 cursor-default">View Analysis</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {["SEO Agent — 847 keywords clustered", "Creative Agent — 12 ad variants written", "Email Agent — 47 leads re-engaged", "Analytics Agent — 13 KPIs live"].map((item) => (
              <div key={item} className="h-9 bg-card/50 rounded-lg border border-border/30 px-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="text-[10px] text-muted-foreground truncate">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
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
          return (
            <line key={i} x1={gx} y1={gy} x2={ax} y2={ay}
              stroke="#6366f1" strokeWidth="1" strokeOpacity="0.25" />
          );
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

function IntegrationMarquee() {
  const doubled = [...INTEGRATIONS, ...INTEGRATIONS];
  return (
    <section className="border-y border-white/5 bg-card/10 py-5 overflow-hidden">
      <p className="mb-4 text-center text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/40">
        Connects with your entire stack
      </p>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-20 z-10 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-20 z-10 bg-gradient-to-l from-background to-transparent" />
        <div className="flex animate-marquee" style={{ width: "max-content" }}>
          {doubled.map((item, i) => (
            <div key={i} className="mx-2 flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-4 py-2 text-sm font-medium whitespace-nowrap">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: item.color, opacity: 0.9 }} />
              <span className="text-white/60">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StackFlow() {
  const steps = [
    { label: "Your CRM", sub: "" },
    { label: "Memory Layer", sub: "" },
    { label: "Orchestrator", sub: "" },
    { label: "Agents", sub: "Content · Ads · Email" },
    { label: "Output", sub: "Campaigns · Reports" },
  ];
  return (
    <div className="relative rounded-2xl border border-white/8 bg-white/3 p-8 overflow-x-auto">
      <div className="flex items-center justify-center gap-1 min-w-max mx-auto">
        {steps.map((s, i) => (
          <div key={s.label} className="flex items-center gap-1">
            <div className={`flex flex-col items-center justify-center rounded-2xl border px-5 py-3 min-w-[110px] ${i === 2 ? "border-primary/60 bg-primary/10" : "border-white/12 bg-white/5"}`}>
              <span className={`text-sm font-semibold ${i === 2 ? "text-primary" : "text-white/80"}`}>{s.label}</span>
              {s.sub && <span className="text-[10px] text-white/35 mt-1">{s.sub}</span>}
            </div>
            {i < steps.length - 1 && (
              <svg width="28" height="16" viewBox="0 0 28 16" className="shrink-0">
                <path d="M2 8 L20 8 M15 3 L22 8 L15 13" stroke="#6366f1" strokeWidth="1.5" strokeOpacity="0.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">

      {/* ── Nav ──────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 shadow-lg shadow-primary/20">
              <Brain className="w-6 h-6 text-white" />
              <Zap className="w-3 h-3 text-yellow-300 absolute -bottom-1 -right-1" />
            </div>
            <span className="font-bold text-2xl tracking-tight">Digital CMO AI</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
            <a href="#agents"  className="hover:text-foreground transition-colors">Platform</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <a href="#proof"   className="hover:text-foreground transition-colors">Customers</a>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden sm:inline-flex text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Log in</Link>
            <Link href="/register" className="inline-flex items-center justify-center px-6 py-2.5 rounded-full text-sm font-semibold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 transition-all hover:scale-105">
              Start Free Trial
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-primary/15 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-500/8 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 relative z-10 text-center mt-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400/10 border border-amber-400/30 text-sm font-semibold text-amber-400 mb-8">
            <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            Limited beta pricing — locks in forever
          </div>

          <h1 className="text-5xl md:text-8xl font-bold tracking-tight mb-8 leading-[1.1]">
            Your AI Chief Marketing Officer,{" "}
            <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-400 to-blue-400">Always On.</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-4 leading-relaxed">
            10 AI agents that plan, execute, and optimize every channel — SEO, paid ads, content, email, and more.
          </p>
          <p className="text-base text-muted-foreground/80 max-w-xl mx-auto mb-10">
            Join 2,400+ marketing teams. Start free, see results in 48 hours, no credit card needed.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Link href="/register" className="inline-flex items-center justify-center h-14 px-8 rounded-full text-lg font-semibold bg-primary hover:bg-primary/90 text-white shadow-[0_0_40px_-10px_rgba(99,102,241,0.6)] w-full sm:w-auto transition-all hover:-translate-y-1">
              Start Free Trial
              <ChevronRight className="ml-2 w-5 h-5" />
            </Link>
            <Button size="lg" variant="outline" className="h-14 px-8 rounded-full text-lg font-semibold border-border bg-card/50 backdrop-blur hover:bg-border/50 text-foreground w-full sm:w-auto transition-all">
              <PlayCircle className="mr-2 w-5 h-5" />
              Watch Demo
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-4">
            {["14-day free trial", "Cancel anytime", "Setup in 5 minutes"].map((t) => (
              <span key={t} className="flex items-center gap-1.5 text-sm text-muted-foreground px-3 py-1.5 rounded-full border border-border/30 bg-card/30">
                <Check className="w-3.5 h-3.5 text-emerald-400" /> {t}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-3 mb-16">
            {["G2 Leader Winter 2024", "4.9/5 on Capterra", "Teams in 68 countries"].map((t) => (
              <span key={t} className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/25 bg-card/20 text-sm text-muted-foreground/80">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {t}
              </span>
            ))}
          </div>

          <HeroDashboard />
        </div>
      </section>

      {/* ── Featured In ───────────────────────────────────────────────── */}
      <section className="py-10 border-y border-white/5 bg-black/20">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-center text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/40 mb-8">
            Featured in &amp; trusted by teams from
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {PUBLICATIONS.map((p) => (
              <span key={p.name} className="text-sm font-semibold text-white/25 hover:text-white/50 transition-colors tracking-wide">
                {p.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Integration Marquee ───────────────────────────────────────── */}
      <IntegrationMarquee />

      {/* ── Stats ─────────────────────────────────────────────────────── */}
      <section className="py-16 bg-card/20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { val: "2,400+", label: "Active paying teams" },
              { val: "$4.2M", label: "MRR — 18 months from zero" },
              { val: "$8M", label: "Series A · Sequoia Capital led" },
              { val: "94%", label: "Retention rate" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-3xl md:text-4xl font-bold font-mono text-foreground mb-1">{s.val}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why switch — problem stats ─────────────────────────────────── */}
      <section className="py-20 border-y border-white/5 bg-black/30">
        <div className="max-w-5xl mx-auto px-6">
          <p className="mb-10 text-center text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/40">Why marketing teams switch to AI</p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              { stat: "14 hrs", unit: "/week", desc: "lost to manual reporting per marketing FTE", color: "text-primary" },
              { stat: "$180K", unit: "/year", desc: "average agency retainer for a mid-market team", color: "text-violet-400" },
              { stat: "63%", unit: " of campaigns", desc: "underperform because of stale data and slow iteration", color: "text-sky-400" },
            ].map((item, i) => (
              <div key={i} className="rounded-2xl border border-white/8 bg-white/3 p-8 text-center">
                <div className={`text-5xl font-extrabold tracking-tight ${item.color}`}>
                  {item.stat}<span className="text-2xl font-semibold text-white/30">{item.unit}</span>
                </div>
                <div className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="mb-14 text-center">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-primary">How it works</p>
            <h2 className="text-4xl font-bold tracking-tight">From zero to campaign in 3 steps.</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { step: "01", icon: Share2, color: "text-primary", title: "Connect your stack", desc: "Plug in HubSpot, GA4, Stripe, and 200+ more. No rip-and-replace. No API keys to manage. Full demo mode before you connect anything live." },
              { step: "02", icon: Brain,  color: "text-violet-400", title: "Ask your AI CMO anything", desc: "Describe a goal in plain English. The orchestrator routes to the right specialist agents and returns an execution-ready plan — not just text to copy-paste." },
              { step: "03", icon: TrendingUp, color: "text-emerald-400", title: "Execute, measure, iterate", desc: "Launch campaigns, track velocity, generate A/B variants, and receive proactive alerts before problems cost you budget." },
            ].map((item) => (
              <div key={item.step} className="rounded-2xl border border-white/10 bg-card p-8 hover:border-primary/30 transition-all hover:bg-card/80">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/6 border border-white/10">
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <span className="text-4xl font-extrabold text-white/6">{item.step}</span>
                </div>
                <h3 className="mb-3 text-lg font-bold text-foreground">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── The Coordination Layer ─────────────────────────────────────── */}
      <section className="py-24 border-y border-white/5 bg-black/30">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold tracking-tight mb-4">The coordination layer</h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">One orchestrator. Nine specialist agents. Unified memory.</p>
          </div>
          <CoordinationDiagram />
        </div>
      </section>

      {/* ── 10 Agents ─────────────────────────────────────────────────── */}
      <section id="agents" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-semibold text-primary mb-6">
              10-Agent Architecture · Series A ($8M)
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">10 agents. One brain.</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              10 AI agents working for you — 24/7, no downtime, no agency fees.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {AGENTS.map((agent) => (
              <Card key={agent.name} className="bg-card border-border hover:border-primary/30 transition-all duration-200 group">
                <CardContent className="p-5">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <agent.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">{agent.name}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{agent.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-muted-foreground text-sm">
              Agents share a <strong className="text-foreground">single long-term brand memory</strong> — campaign history, competitive intelligence, and your brand voice.
            </p>
          </div>
        </div>
      </section>

      {/* ── Connects To Your Entire Stack ─────────────────────────────── */}
      <section className="py-24 border-y border-white/5 bg-black/30">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold tracking-tight mb-4">Connects to your entire stack</h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">Drop in to your existing workflows. No rip-and-replace required.</p>
          </div>

          <StackFlow />

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {["Salesforce", "HubSpot", "Marketo", "Google Analytics", "Stripe", "Shopify", "Slack", "Notion", "Webflow", "Google Ads", "Meta Ads", "LinkedIn", "Mailchimp", "Intercom", "Zapier", "API"].map((name) => (
              <span key={name} className="px-4 py-2 rounded-full border border-white/10 bg-white/4 text-sm text-white/55 hover:text-white/80 hover:border-white/20 transition-colors cursor-default">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Before/After ──────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Digital CMO AI vs. the traditional stack</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { label: "Traditional Agency", items: ["2–4 week turnaround", "$180K/year in retainers", "Scattered strategy"], bad: true },
              { label: "In-house Team",      items: ["1–3 week cycles", "$500K+ in salaries", "3–5 person team needed"], bad: true },
              { label: "Digital CMO AI",     items: ["2 days end-to-end", "From $119/month", "10 AI agents in parallel"], bad: false },
            ].map((col) => (
              <div key={col.label} className={`p-6 rounded-2xl border ${col.bad ? "border-border/30 bg-card/30 opacity-60" : "border-primary/40 bg-primary/5 shadow-xl shadow-primary/10"}`}>
                <h3 className={`text-base font-semibold mb-4 ${col.bad ? "text-muted-foreground" : "text-primary"}`}>{col.label}</h3>
                {col.items.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    {col.bad
                      ? <span className="w-4 h-4 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-[10px]">✕</span>
                      : <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                    {item}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────────────── */}
      <section id="proof" className="py-24 border-y border-white/5 bg-black/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Teams that switched. Results that speak.</h2>
            <p className="text-xl text-muted-foreground">4.9 ★ average rating · 2,400+ active teams worldwide</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <Card key={t.name} className="bg-card border-border flex flex-col">
                <CardContent className="p-6 flex flex-col flex-1 gap-4">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">"{t.quote}"</p>
                  <div className="flex items-center justify-between pt-3 border-t border-border/30">
                    <div>
                      <div className="text-sm font-semibold text-foreground">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.role}</div>
                    </div>
                    <span className="text-xs font-mono font-semibold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-1 rounded-lg">{t.stat}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400/10 border border-amber-400/30 text-sm font-semibold text-amber-400 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Limited beta pricing — locks in forever
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Simple, transparent pricing</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Hire an elite AI marketing team for a fraction of the cost. $119–499/mo.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="bg-card border-border flex flex-col rounded-3xl overflow-hidden hover:border-primary/30 transition-colors duration-300">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-2xl">Starter</CardTitle>
                <CardDescription className="text-base mt-2">For solo marketers and small teams testing AI-powered growth.</CardDescription>
                <div className="mt-6 flex items-baseline text-6xl font-bold font-mono text-foreground">
                  $119<span className="ml-2 text-xl font-medium text-muted-foreground">/mo</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-8 pt-4 flex flex-col">
                <ul className="space-y-4 flex-1">
                  {["5 AI agents active", "1 brand workspace", "Basic analytics", "14-day free trial", "Email support"].map((f) => (
                    <li key={f} className="flex items-center text-muted-foreground font-medium">
                      <Check className="w-5 h-5 text-primary mr-3 shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className="mt-8 block text-center py-4 rounded-xl font-semibold bg-card border-2 border-border hover:bg-border/50 text-foreground transition-colors">Get Started</Link>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/50 flex flex-col relative transform md:-translate-y-4 shadow-2xl shadow-primary/20 rounded-3xl overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-blue-400" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1.5 rounded-b-xl text-xs font-bold uppercase tracking-widest shadow-md">Most Popular</div>
              <CardHeader className="p-8 pb-4 pt-10">
                <CardTitle className="text-2xl text-primary">Growth</CardTitle>
                <CardDescription className="text-base mt-2 text-foreground/80">For growing teams that need the full power of all 10 AI agents.</CardDescription>
                <div className="mt-6 flex items-baseline text-6xl font-bold font-mono text-foreground">
                  $299<span className="ml-2 text-xl font-medium text-muted-foreground">/mo</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-8 pt-4 flex flex-col">
                <ul className="space-y-4 flex-1">
                  {["All 10 AI agents active", "3 brand workspaces", "Advanced analytics + forecasting", "Priority support", "Unlimited integrations", "Custom brand guidelines"].map((f) => (
                    <li key={f} className="flex items-center text-foreground font-medium">
                      <Check className="w-5 h-5 text-primary mr-3 shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className="mt-8 block text-center py-4 rounded-xl font-semibold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 transition-all hover:scale-[1.02]">Start Free Trial</Link>
              </CardContent>
            </Card>

            <Card className="bg-card border-border flex flex-col rounded-3xl overflow-hidden hover:border-primary/30 transition-colors duration-300">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-2xl">Scale</CardTitle>
                <CardDescription className="text-base mt-2">Built for teams scaling from $1M to $100M ARR.</CardDescription>
                <div className="mt-6 flex items-baseline text-6xl font-bold font-mono text-foreground">
                  $499<span className="ml-2 text-xl font-medium text-muted-foreground">/mo</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-8 pt-4 flex flex-col">
                <ul className="space-y-4 flex-1">
                  {["All 10 AI agents active", "Unlimited workspaces", "Custom AI agent configuration", "SSO & enterprise security", "Dedicated success manager", "White-label reporting"].map((f) => (
                    <li key={f} className="flex items-center text-muted-foreground font-medium">
                      <Check className="w-5 h-5 text-primary mr-3 shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className="mt-8 block text-center py-4 rounded-xl font-semibold bg-card border-2 border-border hover:bg-border/50 text-foreground transition-colors">Talk to Our Team</Link>
              </CardContent>
            </Card>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Enterprise tier + white-label available ·{" "}
            <a href="mailto:hello@digitalcmo.ai" className="text-primary hover:underline">Contact us</a>
          </p>
        </div>
      </section>

      {/* ── Security ──────────────────────────────────────────────────── */}
      <section className="py-20 border-y border-white/5 bg-black/20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Enterprise-grade security.</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Shield,   title: "AES-256 Encryption",  desc: "All data encrypted at rest and in transit with TLS 1.3. Keys managed in AWS KMS." },
              { icon: Globe,    title: "GDPR Compliant",       desc: "Full data residency controls, right-to-erasure workflows, and DPA available on request." },
              { icon: Activity, title: "99.99% Uptime SLA",    desc: "Globally distributed infrastructure with automatic failover. Status page at status.digitalcmo.ai." },
            ].map((item) => (
              <Card key={item.title} className="bg-card border-border">
                <CardContent className="p-6">
                  <item.icon className="w-8 h-8 text-primary mb-4" />
                  <h3 className="text-base font-semibold mb-2 text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently asked questions</h2>
          <div className="rounded-2xl border border-white/8 bg-card/30 px-6">
            {FAQ_ITEMS.map((item) => (
              <FAQItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────── */}
      <section className="py-24 border-t border-white/5 bg-black/30 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to 10× your marketing output?</h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-xl mx-auto">
            Join 2,400+ teams. Start free, see results in 48 hours. No credit card, no setup, no agency fees.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="inline-flex items-center justify-center h-14 px-10 rounded-full text-lg font-semibold bg-primary hover:bg-primary/90 text-white shadow-[0_0_40px_-10px_rgba(99,102,241,0.7)] transition-all hover:-translate-y-1">
              Start Free Trial — 14 Days Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
          <p className="mt-4 text-sm text-muted-foreground/60">No credit card · Cancel anytime · Beta pricing locks in forever</p>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-blue-600">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight">Digital CMO AI</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="mailto:hello@digitalcmo.ai" className="hover:text-foreground transition-colors">Contact</a>
              <a href="https://status.digitalcmo.ai" className="hover:text-foreground transition-colors">Status</a>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground/50">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              All systems operational
            </div>
          </div>
          <p className="text-center text-xs text-muted-foreground/40 mt-8">© 2025 Digital CMO AI. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
