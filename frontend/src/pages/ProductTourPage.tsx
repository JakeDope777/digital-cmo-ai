import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  Brain, BarChart2, Palette, Search, Share2, Megaphone, BarChart,
  Users, ShoppingCart, Rocket, Zap, ArrowRight, Check, CheckCircle2,
  Loader2, ChevronRight,
} from 'lucide-react';

// ── Design tokens ─────────────────────────────────────────────────────────────
const BG = 'oklch(9% .008 255)';
const BG2 = 'oklch(7% .006 255)';
const CARD = 'oklch(13% .008 255)';
const BORDER = 'oklch(24% .008 255)';
const PRIMARY = '#3c91ed';

// ── Shared CTA between sections ───────────────────────────────────────────────
function SectionCTA() {
  return (
    <div className="flex justify-center py-6">
      <Link
        to="/demo"
        className="group inline-flex items-center gap-2 rounded-full border px-6 py-2.5 text-sm font-semibold text-white transition-all hover:scale-[1.03]"
        style={{ borderColor: `${PRIMARY}50`, background: `${PRIMARY}12`, color: PRIMARY }}
      >
        See this live <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
}

// ── Section 0: Hero ───────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section
      className="relative flex min-h-[50vh] flex-col items-center justify-center overflow-hidden px-6 py-24 text-center"
      style={{ background: BG }}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full opacity-20 blur-[120px]" style={{ background: PRIMARY }} />
      </div>
      <div className="relative">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-widest" style={{ borderColor: `${PRIMARY}40`, background: `${PRIMARY}10`, color: PRIMARY }}>
          Interactive Product Tour
        </div>
        <h1 className="mt-4 text-5xl font-extrabold tracking-tight lg:text-6xl">
          See Digital CMO AI <br />
          <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${PRIMARY} 0%, #7c3aed 100%)` }}>
            in action
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-white/50">
          Follow along as 10 AI agents plan your entire Q2 growth strategy in under a minute.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3 text-xs text-white/30">
          {['Step 1: Goals', 'Step 2: Agents run', 'Step 3: Review', 'Step 4: Execute', 'Step 5: Results'].map((s, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: `${PRIMARY}70` }} />
              {s}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Section 1: Agent Network ──────────────────────────────────────────────────
const AGENT_NODES = [
  { id: 'brain', label: 'Brain', icon: Brain, color: '#3c91ed', angle: 0, r: 0, isCenter: true },
  { id: 'market', label: 'Market Intel', icon: BarChart2, color: '#8b5cf6', angle: 0, r: 160 },
  { id: 'creative', label: 'Creative', icon: Palette, color: '#f43f5e', angle: 40, r: 160 },
  { id: 'seo', label: 'SEO', icon: Search, color: '#10b981', angle: 80, r: 160 },
  { id: 'social', label: 'Social', icon: Share2, color: '#38bdf8', angle: 120, r: 160 },
  { id: 'pr', label: 'PR & Comms', icon: Megaphone, color: '#f59e0b', angle: 160, r: 160 },
  { id: 'analytics', label: 'Analytics', icon: BarChart, color: '#6366f1', angle: 200, r: 160 },
  { id: 'crm', label: 'CRM', icon: Users, color: '#14b8a6', angle: 240, r: 160 },
  { id: 'ecom', label: 'E-commerce', icon: ShoppingCart, color: '#f97316', angle: 280, r: 160 },
  { id: 'growth', label: 'Growth', icon: Rocket, color: '#ec4899', angle: 320, r: 160 },
];

function AgentNetwork() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const t = setInterval(() => setPulse(p => (p + 1) % 10), 400);
    return () => clearInterval(t);
  }, [inView]);

  const cx = 220, cy = 220;

  return (
    <section
      ref={ref}
      className="flex min-h-screen flex-col items-center justify-center border-t border-white/8 px-6 py-24"
      style={{ background: BG2 }}
    >
      <div className="mx-auto max-w-5xl w-full">
        <div className="mb-12 text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest" style={{ color: PRIMARY }}>Meet your AI CMO</p>
          <h2 className="text-4xl font-extrabold tracking-tight">10 specialists. One unified brain.</h2>
          <p className="mx-auto mt-3 max-w-lg text-white/45">
            The Brain Orchestrator coordinates all agents simultaneously — sharing context, memory, and your brand voice in real time.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-12">
          {/* SVG Network */}
          <div className="relative flex-shrink-0">
            <svg width="440" height="440" viewBox="0 0 440 440">
              {/* Lines from center to each node */}
              {AGENT_NODES.filter(n => !n.isCenter).map((node) => {
                const rad = (node.angle * Math.PI) / 180;
                const nx = cx + node.r * Math.cos(rad);
                const ny = cy + node.r * Math.sin(rad);
                const active = inView;
                return (
                  <motion.line
                    key={node.id}
                    x1={cx} y1={cy} x2={nx} y2={ny}
                    stroke={node.color}
                    strokeWidth="1.5"
                    strokeOpacity={0.35}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={active ? { pathLength: 1, opacity: 1 } : {}}
                    transition={{ duration: 0.8, delay: 0.2 + AGENT_NODES.indexOf(node) * 0.07 }}
                  />
                );
              })}

              {/* Outer nodes */}
              {AGENT_NODES.filter(n => !n.isCenter).map((node, i) => {
                const rad = (node.angle * Math.PI) / 180;
                const nx = cx + node.r * Math.cos(rad);
                const ny = cy + node.r * Math.sin(rad);
                const Icon = node.icon;
                const isActive = inView && pulse === i;
                return (
                  <motion.g
                    key={node.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={inView ? { scale: 1, opacity: 1 } : {}}
                    transition={{ duration: 0.4, delay: 0.4 + i * 0.07 }}
                    style={{ transformOrigin: `${nx}px ${ny}px` }}
                  >
                    <circle
                      cx={nx} cy={ny} r={28}
                      fill={`${node.color}18`}
                      stroke={node.color}
                      strokeWidth={isActive ? 2 : 1}
                      strokeOpacity={isActive ? 1 : 0.4}
                    />
                    {isActive && (
                      <circle cx={nx} cy={ny} r={34} fill="none" stroke={node.color} strokeWidth="1" strokeOpacity="0.3">
                        <animate attributeName="r" from="28" to="40" dur="0.8s" fill="freeze" />
                        <animate attributeName="stroke-opacity" from="0.5" to="0" dur="0.8s" fill="freeze" />
                      </circle>
                    )}
                    <foreignObject x={nx - 12} y={ny - 12} width={24} height={24} style={{ overflow: 'visible' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, color: node.color }}>
                        <Icon size={14} />
                      </div>
                    </foreignObject>
                    {/* Label */}
                    <text
                      x={nx}
                      y={ny + 42}
                      textAnchor="middle"
                      fill={node.color}
                      fontSize="9"
                      fontWeight="600"
                      opacity="0.7"
                    >
                      {node.label}
                    </text>
                  </motion.g>
                );
              })}

              {/* Center: Brain Orchestrator */}
              <motion.g
                initial={{ scale: 0, opacity: 0 }}
                animate={inView ? { scale: 1, opacity: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.1 }}
                style={{ transformOrigin: `${cx}px ${cy}px` }}
              >
                {/* Pulse rings */}
                {[50, 42, 36].map((r, ri) => (
                  <circle
                    key={ri}
                    cx={cx} cy={cy} r={r}
                    fill="none"
                    stroke={PRIMARY}
                    strokeWidth="1"
                    strokeOpacity={0.08 + ri * 0.04}
                  >
                    <animateTransform
                      attributeName="transform"
                      type="scale"
                      from="1"
                      to="1.15"
                      dur={`${2 + ri * 0.4}s`}
                      repeatCount="indefinite"
                      additive="sum"
                      calcMode="spline"
                      keySplines="0.4 0 0.6 1"
                      values="1;1.15;1"
                      keyTimes="0;0.5;1"
                    />
                  </circle>
                ))}
                <circle cx={cx} cy={cy} r={32} fill={`${PRIMARY}20`} stroke={PRIMARY} strokeWidth="2" />
                <foreignObject x={cx - 16} y={cy - 16} width={32} height={32}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, color: PRIMARY }}>
                    <Brain size={20} />
                  </div>
                </foreignObject>
                <text x={cx} y={cy + 50} textAnchor="middle" fill={PRIMARY} fontSize="10" fontWeight="700">
                  Brain Orchestrator
                </text>
              </motion.g>
            </svg>
          </div>

          {/* Feature list */}
          <div className="space-y-4 max-w-xs">
            {[
              { label: 'Shared memory', desc: 'Every agent knows your brand, goals, and history' },
              { label: 'Real-time coordination', desc: 'Agents hand off context seamlessly — no dropped state' },
              { label: 'Parallel execution', desc: 'All 10 agents can work simultaneously on your goals' },
              { label: 'Adaptive routing', desc: 'Brain decides which agents activate and in what order' },
            ].map((f, i) => (
              <motion.div
                key={f.label}
                className="flex gap-3 rounded-xl p-4"
                style={{ background: CARD, border: `1px solid ${BORDER}` }}
                initial={{ opacity: 0, x: 20 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.6 + i * 0.1 }}
              >
                <div className="mt-0.5 flex-shrink-0">
                  <CheckCircle2 size={16} style={{ color: PRIMARY }} />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{f.label}</div>
                  <div className="mt-0.5 text-xs text-white/45">{f.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <SectionCTA />
    </section>
  );
}

// ── Section 2: Chat UI ────────────────────────────────────────────────────────
const CHAT_MESSAGES = [
  { role: 'user', text: 'I want to grow B2B pipeline by 40% in Q2' },
  { role: 'ai', text: `Got it. Here's your Q2 B2B Growth Strategy:

**Objective:** +40% pipeline growth by June 30

**Channel mix I'm recommending:**
• LinkedIn demand gen (40% budget) — target VP/Director ICPs at Series A–C SaaS
• SEO content cluster (25%) — 12 bottom-funnel articles, avg. intent score 82
• Outbound sequences (20%) — 3-touch cadence, 156 accounts identified
• Retargeting (15%) — website visitors + G2 in-market signals

**Q2 milestones:**
• April: ICP refinement + content production (8 articles)
• May: Campaign launch + A/B testing
• June: Scale winning channels, final optimization push

**Projected outcome:** 847 MQLs → 168 SQLs → 42 closed deals (at 25% close rate)

Shall I activate all agents and begin execution?` },
];

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map(i => (
        <span key={i} className="h-1.5 w-1.5 rounded-full animate-bounce" style={{ background: PRIMARY, animationDelay: `${i * 0.15}s` }} />
      ))}
    </div>
  );
}

function ChatSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const timers = [
      setTimeout(() => setStep(1), 600),
      setTimeout(() => setStep(2), 1800),
      setTimeout(() => setStep(3), 2800),
    ];
    return () => timers.forEach(clearTimeout);
  }, [inView]);

  const aiText = CHAT_MESSAGES[1].text;

  return (
    <section
      ref={ref}
      className="flex min-h-screen flex-col items-center justify-center border-t border-white/8 px-6 py-24"
      style={{ background: BG }}
    >
      <div className="mx-auto max-w-4xl w-full">
        <div className="mb-12 text-center">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest" style={{ background: `${PRIMARY}15`, color: PRIMARY, border: `1px solid ${PRIMARY}40` }}>
            Step 1
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight">Tell it your goals</h2>
          <p className="mt-3 text-white/45">Just type what you want. No forms, no templates, no complexity.</p>
        </div>

        {/* Chat window */}
        <div className="rounded-2xl overflow-hidden" style={{ background: CARD, border: `1px solid ${BORDER}`, boxShadow: `0 0 40px ${PRIMARY}18` }}>
          {/* Title bar */}
          <div className="flex items-center gap-2 border-b px-5 py-3.5" style={{ borderColor: BORDER }}>
            <div className="h-3 w-3 rounded-full bg-red-500/70" />
            <div className="h-3 w-3 rounded-full bg-amber-500/70" />
            <div className="h-3 w-3 rounded-full bg-green-500/70" />
            <span className="ml-2 text-xs text-white/30">Digital CMO AI · Chat</span>
          </div>

          {/* Messages */}
          <div className="min-h-[380px] space-y-4 p-6">
            <AnimatePresence>
              {step >= 1 && (
                <motion.div
                  key="user"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-end"
                >
                  <div
                    className="max-w-sm rounded-2xl rounded-tr-sm px-5 py-3.5 text-sm font-medium text-white"
                    style={{ background: PRIMARY }}
                  >
                    {CHAT_MESSAGES[0].text}
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="typing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full" style={{ background: `${PRIMARY}20`, border: `1px solid ${PRIMARY}40` }}>
                      <Brain size={14} style={{ color: PRIMARY }} />
                    </div>
                    <div className="rounded-2xl rounded-tl-sm" style={{ background: 'oklch(15% .008 255)', border: `1px solid ${BORDER}` }}>
                      <TypingIndicator />
                    </div>
                  </div>
                </motion.div>
              )}

              {step >= 3 && (
                <motion.div
                  key="ai"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="flex items-start gap-3"
                >
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full" style={{ background: `${PRIMARY}20`, border: `1px solid ${PRIMARY}40` }}>
                    <Brain size={14} style={{ color: PRIMARY }} />
                  </div>
                  <div className="max-w-xl rounded-2xl rounded-tl-sm px-5 py-4" style={{ background: 'oklch(15% .008 255)', border: `1px solid ${BORDER}` }}>
                    <div className="text-sm leading-relaxed text-white/80 whitespace-pre-wrap">
                      {aiText.split('**').map((part, i) =>
                        i % 2 === 1
                          ? <strong key={i} className="text-white font-bold">{part}</strong>
                          : <span key={i}>{part}</span>
                      )}
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button className="rounded-lg px-4 py-2 text-xs font-bold text-white" style={{ background: PRIMARY }}>
                        ✓ Activate all agents
                      </button>
                      <button className="rounded-lg border px-4 py-2 text-xs text-white/50" style={{ borderColor: BORDER }}>
                        Adjust strategy
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Input bar */}
          <div className="border-t p-4" style={{ borderColor: BORDER }}>
            <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: 'oklch(15% .008 255)', border: `1px solid ${BORDER}` }}>
              <span className="flex-1 text-sm text-white/20">Ask your AI CMO anything…</span>
              <div className="rounded-lg p-1.5" style={{ background: PRIMARY }}>
                <ArrowRight size={14} className="text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <SectionCTA />
    </section>
  );
}

// ── Section 3: Agents at work ─────────────────────────────────────────────────
const ACTIVITY_FEED = [
  { agent: 'Market Intelligence', status: 'Running SWOT analysis…', color: '#8b5cf6', done: false },
  { agent: 'SEO Engine', status: 'Scanning 1,240 keywords…', color: '#10b981', done: false },
  { agent: 'Creative Studio', status: 'Generating 3 LinkedIn variants…', color: '#f43f5e', done: false },
  { agent: 'CRM & Pipeline', status: 'Scoring 847 contacts…', color: '#14b8a6', done: true },
  { agent: 'Analytics', status: 'Pulling GA4 + HubSpot data…', color: '#6366f1', done: false },
];

const OUTPUTS = [
  {
    label: 'SWOT — B2B SaaS Q2',
    color: '#8b5cf6',
    content: 'Strengths: Strong product-market fit (NPS 62), low churn (3.2%)\nWeaknesses: Limited brand awareness outside direct network\nOpportunities: AI marketing wave — category creation moment\nThreats: 3 well-funded competitors launching Q2',
  },
  {
    label: 'SEO Cluster — AI Marketing',
    color: '#10b981',
    content: '"ai marketing software" — 18.1K/mo vol, $12.40 CPC\n"ai cmo tools" — 4.2K/mo vol, $18.90 CPC\n"marketing automation ai" — 22.4K/mo vol, $9.80 CPC\nGap: We rank #0 for all 3 → high-priority content sprint',
  },
  {
    label: 'LinkedIn Post — Variant A',
    color: '#f43f5e',
    content: '🚀 We just replaced our $8K/month agency retainer with AI.\n\nWeek 1 results:\n→ 12 pieces of content published\n→ Pipeline up 23%\n→ Zero extra headcount\n\nThe CMO role is changing. Fast.',
  },
];

function AgentsAtWork() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const [visibleOutputs, setVisibleOutputs] = useState(0);
  const [doneItems, setDoneItems] = useState<number[]>([]);

  useEffect(() => {
    if (!inView) return;
    const timers = [
      setTimeout(() => setDoneItems([3]), 800),
      setTimeout(() => { setVisibleOutputs(1); setDoneItems([3, 0]); }, 1600),
      setTimeout(() => { setVisibleOutputs(2); setDoneItems([3, 0, 1]); }, 2600),
      setTimeout(() => { setVisibleOutputs(3); setDoneItems([3, 0, 1, 2]); }, 3400),
    ];
    return () => timers.forEach(clearTimeout);
  }, [inView]);

  return (
    <section
      ref={ref}
      className="flex min-h-screen flex-col items-center justify-center border-t border-white/8 px-6 py-24"
      style={{ background: BG2 }}
    >
      <div className="mx-auto max-w-5xl w-full">
        <div className="mb-12 text-center">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest" style={{ background: `${PRIMARY}15`, color: PRIMARY, border: `1px solid ${PRIMARY}40` }}>
            Step 2
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight">Agents get to work</h2>
          <p className="mt-3 text-white/45">All 10 agents activate in parallel. Watch outputs appear in real time.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Activity feed */}
          <div className="rounded-2xl overflow-hidden" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
            <div className="border-b px-5 py-3.5 flex items-center gap-2" style={{ borderColor: BORDER }}>
              <span className="h-2 w-2 rounded-full animate-pulse" style={{ background: '#10b981' }} />
              <span className="text-xs font-semibold text-white/50">Agent Activity Feed</span>
            </div>
            <div className="p-4 space-y-2.5">
              {ACTIVITY_FEED.map((item, i) => {
                const isDone = doneItems.includes(i);
                return (
                  <motion.div
                    key={item.agent}
                    className="flex items-center gap-3 rounded-xl px-4 py-3"
                    style={{ background: 'oklch(10% .008 255)', border: `1px solid ${isDone ? item.color + '40' : BORDER}` }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.1 + i * 0.12 }}
                  >
                    <div
                      className="h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: `${item.color}20`, color: item.color }}
                    >
                      {isDone
                        ? <Check size={12} />
                        : <Loader2 size={12} className="animate-spin" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-white/80">{item.agent}</div>
                      <div className="text-[10px] text-white/35 truncate">{isDone ? 'Complete ✓' : item.status}</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Outputs */}
          <div className="space-y-4">
            {OUTPUTS.slice(0, visibleOutputs).map((output) => (
              <motion.div
                key={output.label}
                className="rounded-2xl p-4"
                style={{ background: CARD, border: `1px solid ${output.color}30` }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: output.color }} />
                  <span className="text-xs font-bold" style={{ color: output.color }}>{output.label}</span>
                </div>
                <pre className="text-[11px] leading-relaxed text-white/55 whitespace-pre-wrap font-sans">{output.content}</pre>
              </motion.div>
            ))}
            {visibleOutputs === 0 && (
              <div className="flex h-[200px] items-center justify-center rounded-2xl text-white/20 text-sm" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
                Outputs will appear here…
              </div>
            )}
          </div>
        </div>
      </div>
      <SectionCTA />
    </section>
  );
}

// ── Section 4: Review & Approve ───────────────────────────────────────────────
function ReviewSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const [approved, setApproved] = useState(false);

  return (
    <section
      ref={ref}
      className="flex min-h-screen flex-col items-center justify-center border-t border-white/8 px-6 py-24"
      style={{ background: BG }}
    >
      <div className="mx-auto max-w-2xl w-full">
        <div className="mb-12 text-center">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest" style={{ background: `${PRIMARY}15`, color: PRIMARY, border: `1px solid ${PRIMARY}40` }}>
            Step 3
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight">Review & approve</h2>
          <p className="mt-3 text-white/45">You're always in control. Review every brief before it executes.</p>
        </div>

        <motion.div
          className="rounded-2xl overflow-hidden"
          style={{ background: CARD, border: `1px solid ${approved ? '#10b98150' : BORDER}`, boxShadow: approved ? '0 0 40px #10b98118' : 'none' }}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="border-b px-6 py-4 flex items-center justify-between" style={{ borderColor: BORDER }}>
            <div>
              <div className="text-xs text-white/30 font-medium">Campaign Brief</div>
              <div className="text-base font-bold text-white mt-0.5">Q2 B2B Pipeline Growth — Full Stack</div>
            </div>
            {approved
              ? <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: '#10b98120', color: '#10b981', border: '1px solid #10b98140' }}>✓ Approved</span>
              : <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: `${PRIMARY}15`, color: PRIMARY, border: `1px solid ${PRIMARY}40` }}>Awaiting review</span>
            }
          </div>

          {/* Brief content */}
          <div className="p-6 space-y-4">
            {[
              { label: 'Objective', value: '+40% pipeline growth by June 30 (Q2 2026)' },
              { label: 'Budget', value: '$24,000 total · $8K/mo allocation' },
              { label: 'ICP', value: 'VP/Director of Marketing at B2B SaaS, Series A–C, 50–500 employees' },
              { label: 'Channels', value: 'LinkedIn Ads (40%) · SEO Content (25%) · Outbound (20%) · Retargeting (15%)' },
              { label: 'KPIs', value: 'MQLs, SQLs, Pipeline $, CAC, MQL→SQL rate' },
              { label: 'Timeline', value: 'April 1 – June 30 (13 weeks)' },
              { label: 'Agents assigned', value: 'Market Intel · Creative Studio · SEO Engine · CRM & Pipeline · Analytics' },
            ].map((item) => (
              <div key={item.label} className="flex gap-4">
                <div className="w-32 flex-shrink-0 text-xs font-semibold text-white/30 pt-0.5">{item.label}</div>
                <div className="text-sm text-white/75">{item.value}</div>
              </div>
            ))}
          </div>

          {/* Actions */}
          {!approved ? (
            <div className="border-t px-6 py-4 flex items-center gap-3" style={{ borderColor: BORDER }}>
              <button
                onClick={() => setApproved(true)}
                className="rounded-xl px-6 py-2.5 text-sm font-bold text-white transition-all hover:scale-[1.02]"
                style={{ background: '#10b981', boxShadow: '0 0 16px #10b98130' }}
              >
                ✓ Approve & Execute
              </button>
              <button className="rounded-xl border px-6 py-2.5 text-sm font-medium text-white/50 transition-all hover:text-white" style={{ borderColor: BORDER }}>
                Request changes
              </button>
            </div>
          ) : (
            <motion.div
              className="border-t px-6 py-4"
              style={{ borderColor: BORDER }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="text-sm font-semibold" style={{ color: '#10b981' }}>
                ✓ Campaign approved. Agents are now executing across all channels.
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
      <SectionCTA />
    </section>
  );
}

// ── Section 5: Execution / Integrations ──────────────────────────────────────
const INTEGRATIONS = [
  { name: 'HubSpot', status: 'syncing', color: '#ff7a59', desc: 'Creating 3 workflows + 847 contact segments' },
  { name: 'Google Ads', status: 'syncing', color: '#4285F4', desc: 'Launching retargeting campaign · $9,600 budget' },
  { name: 'LinkedIn Ads', status: 'syncing', color: '#0077B5', desc: 'Uploading audience lists · 4 ad variants' },
  { name: 'Google Analytics 4', status: 'syncing', color: '#E37400', desc: 'Configuring conversion events + custom dashboards' },
  { name: 'SendGrid', status: 'syncing', color: '#1A82E2', desc: 'Scheduling 5-touch outbound sequence' },
];

function ExecutionSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const [published, setPublished] = useState<number[]>([]);

  useEffect(() => {
    if (!inView) return;
    const timers = [0, 1, 2, 3, 4].map((i) =>
      setTimeout(() => setPublished(p => [...p, i]), 1000 + i * 800)
    );
    return () => timers.forEach(clearTimeout);
  }, [inView]);

  return (
    <section
      ref={ref}
      className="flex min-h-screen flex-col items-center justify-center border-t border-white/8 px-6 py-24"
      style={{ background: BG2 }}
    >
      <div className="mx-auto max-w-2xl w-full">
        <div className="mb-12 text-center">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest" style={{ background: `${PRIMARY}15`, color: PRIMARY, border: `1px solid ${PRIMARY}40` }}>
            Step 4
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight">Execution across every channel</h2>
          <p className="mt-3 text-white/45">One click. All integrations fire simultaneously. No manual setup.</p>
        </div>

        <div className="space-y-3">
          {INTEGRATIONS.map((int, i) => {
            const isDone = published.includes(i);
            const isSyncing = inView && !isDone;
            return (
              <motion.div
                key={int.name}
                className="flex items-center gap-4 rounded-2xl px-5 py-4"
                style={{ background: CARD, border: `1px solid ${isDone ? int.color + '40' : BORDER}` }}
                initial={{ opacity: 0, x: -20 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.1 + i * 0.1 }}
              >
                <div className="h-9 w-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: `${int.color}18`, color: int.color }}>
                  {int.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white">{int.name}</div>
                  <div className="text-[11px] text-white/35 truncate">{int.desc}</div>
                </div>
                <div className="flex-shrink-0">
                  {isDone ? (
                    <motion.span
                      className="rounded-full px-3 py-1 text-xs font-bold"
                      style={{ background: '#10b98120', color: '#10b981', border: '1px solid #10b98140' }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      ✓ Published
                    </motion.span>
                  ) : isSyncing ? (
                    <span className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold" style={{ background: `${PRIMARY}15`, color: PRIMARY, border: `1px solid ${PRIMARY}40` }}>
                      <Loader2 size={10} className="animate-spin" />
                      Syncing…
                    </span>
                  ) : (
                    <span className="rounded-full px-3 py-1 text-xs text-white/20" style={{ border: `1px solid ${BORDER}` }}>Queued</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
      <SectionCTA />
    </section>
  );
}

// ── Section 6: Results ────────────────────────────────────────────────────────
const METRICS = [
  { label: 'Pipeline Generated', before: '$0', after: '$2.4M', delta: '+∞', color: '#10b981' },
  { label: 'MQLs Created', before: '41/mo', after: '156/mo', delta: '+280%', color: '#3c91ed' },
  { label: 'CAC', before: '$2,800', after: '$890', delta: '−68%', color: '#8b5cf6' },
  { label: 'Content Published', before: '3/mo', after: '48/mo', delta: '+1,500%', color: '#f43f5e' },
  { label: 'Time Saved', before: '0h', after: '112h/mo', delta: 'Reclaimed', color: '#f59e0b' },
];

function ResultsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  return (
    <section
      ref={ref}
      className="flex min-h-screen flex-col items-center justify-center border-t border-white/8 px-6 py-24"
      style={{ background: BG }}
    >
      <div className="mx-auto max-w-4xl w-full">
        <div className="mb-12 text-center">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest" style={{ background: `${PRIMARY}15`, color: PRIMARY, border: `1px solid ${PRIMARY}40` }}>
            Step 5
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight">Results that speak for themselves</h2>
          <p className="mt-3 text-white/45">Real outcomes from teams using Digital CMO AI across Q1 2026.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          {METRICS.map((metric, i) => (
            <motion.div
              key={metric.label}
              className="rounded-2xl p-5"
              style={{ background: CARD, border: `1px solid ${metric.color}25` }}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 + i * 0.1 }}
            >
              <div className="mb-3 text-xs font-semibold text-white/35">{metric.label}</div>
              <div className="flex items-end gap-3">
                <div>
                  <div className="text-xs text-white/20 line-through mb-0.5">{metric.before}</div>
                  <div className="text-2xl font-extrabold text-white">{metric.after}</div>
                </div>
                <div className="mb-0.5 rounded-full px-2.5 py-0.5 text-xs font-bold" style={{ background: `${metric.color}20`, color: metric.color }}>
                  {metric.delta}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Final CTA */}
        <motion.div
          className="rounded-2xl p-8 text-center"
          style={{ background: CARD, border: `1px solid ${PRIMARY}25`, boxShadow: `0 0 60px ${PRIMARY}15` }}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-2xl font-extrabold text-white mb-3">Ready to see your results?</h3>
          <p className="text-white/45 mb-6">Setup takes under 15 minutes. No credit card required.</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/demo"
              className="inline-flex items-center gap-2 rounded-xl px-8 py-4 text-base font-bold text-white transition-all hover:scale-[1.03]"
              style={{ background: PRIMARY, boxShadow: `0 0 24px ${PRIMARY}30` }}
            >
              <Zap size={16} fill="currentColor" />
              Start free demo
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-8 py-4 text-base font-medium text-white hover:border-white/35 transition-all"
            >
              Create free account <ChevronRight size={16} />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ProductTourPage() {
  return (
    <div className="min-h-screen text-white" style={{ background: BG }}>
      {/* Simple nav */}
      <nav className="sticky top-0 z-50 border-b border-white/8 backdrop-blur-xl" style={{ background: `${BG}dd` }}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: PRIMARY, boxShadow: `0 0 16px ${PRIMARY}4d` }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-sm font-bold text-white">Digital CMO AI</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/agents" className="text-sm text-white/50 hover:text-white transition-colors">AI Agents</Link>
            <Link to="/demo" className="rounded-lg px-4 py-2 text-sm font-bold text-white" style={{ background: PRIMARY }}>Try live →</Link>
          </div>
        </div>
      </nav>

      <HeroSection />
      <AgentNetwork />
      <ChatSection />
      <AgentsAtWork />
      <ReviewSection />
      <ExecutionSection />
      <ResultsSection />
    </div>
  );
}
