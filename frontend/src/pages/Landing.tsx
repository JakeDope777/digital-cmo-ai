import { Brain, Zap, ChevronRight, PlayCircle, BarChart3, Search, PenTool, Mail, Share2, Target, Megaphone, TrendingUp, Users, Check, Star, ArrowRight, Shield, Globe, Activity } from "lucide-react";
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
      <section className="relative pt-32 pb-40 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 relative z-10 text-center mt-12">
          {/* Badge */}
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

          {/* Trust row */}
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

          {/* Hero Dashboard Mockup */}
          <div className="relative mx-auto rounded-2xl border border-border/50 bg-card/40 shadow-2xl backdrop-blur-xl overflow-hidden p-2 transform rotate-1 hover:rotate-0 transition-transform duration-500">
            <div className="rounded-xl bg-background border border-border overflow-hidden shadow-2xl">
              <div className="h-12 bg-card border-b border-border flex items-center px-4 gap-2">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="ml-3 text-xs text-muted-foreground font-mono">digital-cmo · 10 agents running</span>
                <span className="ml-auto text-xs text-emerald-400 font-mono flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  All 10 AI agents active
                </span>
              </div>
              <div className="p-8 grid grid-cols-12 gap-8 h-[400px]">
                <div className="col-span-3 border-r border-border/50 space-y-4 pr-6">
                  <div className="h-10 bg-card rounded-lg w-full" />
                  <div className="h-10 bg-card/50 rounded-lg w-3/4" />
                  <div className="h-10 bg-card/50 rounded-lg w-5/6" />
                  <div className="h-10 bg-card/50 rounded-lg w-full mt-12" />
                </div>
                <div className="col-span-9 space-y-8">
                  <div className="flex justify-between items-center">
                    <div className="h-8 bg-card rounded-lg w-64" />
                    <div className="h-10 bg-primary/20 rounded-lg w-40" />
                  </div>
                  <div className="grid grid-cols-3 gap-6">
                    {[["bg-primary","$4.2M MRR"],["bg-emerald-500/80","↑ 124% ROI"],["bg-blue-500/80","2,400+ teams"]].map(([col, label]) => (
                      <div key={label} className="h-32 bg-card rounded-xl border border-border/50 p-5 flex flex-col justify-end">
                        <div className="h-4 bg-muted rounded w-1/2 mb-2 text-xs">{label}</div>
                        <div className={`h-8 ${col} rounded w-3/4`} />
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {["SEO Agent — 847 keywords clustered","Creative Agent — 12 ad variants written","Email Agent — 47 leads re-engaged","Analytics Agent — 13 KPIs live"].map((item) => (
                      <div key={item} className="h-10 bg-card/50 rounded-lg border border-border/30 px-3 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                        <span className="text-xs text-muted-foreground truncate">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────────── */}
      <section className="py-16 border-y border-white/5 bg-card/20">
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

      {/* ── 10 Agents ─────────────────────────────────────────────────── */}
      <section id="agents" className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-semibold text-primary mb-6">
              10-Agent Architecture · Series A ($8M)
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">10 agents. One brain.</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              One orchestrator. Nine specialist agents. Unified memory.
              <br />10 AI agents working for you — 24/7, no downtime, no agency fees.
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

      {/* ── Before/After ──────────────────────────────────────────────── */}
      <section className="py-20 bg-black/40 border-y border-white/5">
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
                      : <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                    {item}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────────────── */}
      <section id="proof" className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
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
      <section id="pricing" className="py-32 bg-black/40 border-y border-white/5 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
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
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Enterprise-grade security.</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Shield,   title: "AES-256 Encryption",  desc: "All data encrypted at rest and in transit with TLS 1.3. Keys managed in AWS KMS." },
              { icon: Globe,    title: "GDPR Compliant",       desc: "Full compliance with EU data protection regulation. DPAs available for enterprise." },
              { icon: Activity, title: "99.99% Uptime SLA",    desc: "Deployed across multiple AWS regions with automated failover and zero-downtime deploys." },
            ].map((item) => (
              <div key={item.title} className="flex gap-4 p-6 rounded-2xl border border-border/40 bg-card">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────── */}
      <section className="py-32 bg-black/40 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-8 leading-[1.1]">
            Start your 14-day free trial.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-400 to-blue-400">
              Deploy all 10 AI agents today.
            </span>
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-xl mx-auto">
            Connect your first integration and your 10 agents are live in under 48 hours.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="inline-flex items-center justify-center h-14 px-10 rounded-full text-lg font-semibold bg-primary hover:bg-primary/90 text-white shadow-[0_0_40px_-10px_rgba(99,102,241,0.6)] transition-all hover:-translate-y-1">
              Start Free Trial — No credit card
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
          <p className="text-sm text-muted-foreground mt-6">14-day free trial · Cancel anytime · Setup in 5 minutes</p>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="py-12 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-blue-600">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm text-muted-foreground">© 2025 Digital CMO AI. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              All systems operational
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
