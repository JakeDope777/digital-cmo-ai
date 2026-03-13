import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Brain, Zap, Plus, Clock, MessageSquare } from 'lucide-react';
import { chatService } from '../services/api';
import type { ChatMessage } from '../types';
import { trackEvent, trackOnboardingStep } from '../services/analytics';
import { useDemoMode } from '../context/DemoModeContext';

// ── Demo Mode: Rich scripted AI CMO responses ─────────────────────────────────
const DEMO_QA: Array<{ keywords: string[]; response: string; module: string }> = [
  {
    keywords: ['google ads', 'google ad', 'gads', 'adwords', 'ppc', 'search ads', 'analyse my google'],
    response: `Your Google Ads account is showing a **3.1% CTR** across 8 active campaigns — that's 0.8pts below your industry benchmark of 3.9%. The top opportunity I'm seeing is in your "Brand Awareness" campaign, which is burning **$1,200/week** at a ROAS of 1.8× while your "Competitor Keyword" campaign is delivering 6.4× ROAS on a fraction of the budget.

I recommend reallocating $800/week from Brand Awareness into Competitor Keywords and creating 3 RSA ad variants targeting high-intent long-tail terms. Based on your historical conversion data, this should recover approximately **$4,100 in monthly revenue** within 3 weeks.

Your Quality Scores for non-brand terms average 5.2/10. Improving landing page relevance for your top 10 keywords to a QS of 7+ would reduce your average CPC by an estimated **18–22%**.`,
    module: 'Google Ads Analyser',
  },
  {
    keywords: ['linkedin', 'campaign brief', 'linkedin campaign', 'linkedin ads', 'b2b campaign'],
    response: `**LinkedIn Campaign Brief — Q2 Pipeline Push**

**Objective:** Generate 40 qualified MQL demos over 4 weeks
**Target Audience:** VP Marketing / CMO / Head of Growth at SaaS companies, 51–500 employees, Series A–C
**Budget:** $6,000 total ($1,500/week)
**Ad Formats:** Sponsored Content (single image) + Conversation Ads for retargeting

**Messaging Framework:**
- Hook: "Your marketing agency bills $25K/mo. This AI does more for $149."
- Proof: 47% average CAC reduction from pilot cohort
- CTA: "See your marketing data in 2 minutes" → gated demo landing page

**Creative Recommendations:** Use dark-background mockup screenshots of the dashboard, not stock photos. Pilot users report 3.2× higher CTR with product-first creative vs lifestyle imagery.

**KPI Targets:** CPL < $95, CTR > 0.55%, Demo-to-Opportunity rate ≥ 22%.`,
    module: 'Campaign Brief Generator',
  },
  {
    keywords: ['best performing channel', 'best channel', 'top channel', 'which channel', 'channel performance', 'top performing'],
    response: `Based on your last 90 days of attribution data, here's your channel performance ranked by **Revenue-Attributed ROAS**:

1. 🥇 **LinkedIn Ads** — 8.2× ROAS, $32K attributed revenue, CPL $87
2. 🥈 **Email (Nurture)** — 6.9× ROAS, $28K attributed, CPC effectively $0.12
3. 🥉 **Google Search (Brand)** — 6.4× ROAS, $21K attributed, CTR 5.8%
4. **Meta Ads** — 4.1× ROAS, $19K attributed, CPM rising ($22 last 30d)
5. **Organic SEO** — 3.7× ROAS, $14K attributed, growing +24% MoM

The standout insight: your **Email Nurture** sequence is dramatically underinvested relative to its ROI. You're running one sequence for all leads. Segmenting by ICP fit score and adding 3 conditional branches could unlock an estimated **$11K–18K in additional monthly pipeline** with zero incremental ad spend.`,
    module: 'Channel Attribution Analyser',
  },
  {
    keywords: ['email open rate', 'email open', 'improve email', 'email marketing', 'email campaign', 'open rate', 'subject line'],
    response: `Your current email open rate of **24.5%** is 6 points below the SaaS industry median of 30.4%. Here are the three highest-leverage fixes I can implement right now:

**1. Subject line personalisation** — Your last 12 campaigns used generic subjects. Adding first-name + company-specific signal (e.g. "Jake, your Q1 pipeline gap is showing") lifts open rates by an average of 18–26% based on 847 A/B tests in our dataset. I've drafted 5 variants ready for your next campaign.

**2. Send-time optimisation** — You're currently batch-sending at 9am Tuesdays. Your audience's peak engagement window is **10:30am–12pm on Wednesdays** (based on your historical click data). Shifting send time alone is projected to add +3.2pts to open rate.

**3. List hygiene** — 14.3% of your list hasn't opened an email in 90+ days. Running a re-engagement sequence before suppression typically recovers 8–12% of dormant subscribers and improves deliverability for everyone else.

Want me to generate the re-engagement sequence copy now?`,
    module: 'Email Optimiser',
  },
  {
    keywords: ['growth tactic', 'growth hack', 'growth strateg', 'tactics for this month', '3 growth', 'three growth', 'growth ideas'],
    response: `Here are your 3 highest-ROI growth tactics for this month, ranked by estimated revenue impact:

**🚀 Tactic 1: Referral Loop Activation** (Est. +$18K MRR, 6 weeks)
You have 198 "returning" users but zero referral mechanics. Adding a structured referral program with a 2-week time-boxed incentive ($50 credit for referrer + referred) typically yields a K-factor of 0.3–0.6 for your user profile. Implementation: 2 days engineering, 1 day copy.

**⚡ Tactic 2: Demo-to-Paid Conversion Squeeze** (Est. +$9K MRR, 2 weeks)
Your demo→paid conversion is sitting at 8.2%. The SaaS median for self-serve products at your ACV is 14–17%. Adding a single "book onboarding call" step at day 3 of the trial — not day 1 — recovers approximately 34% of churned trials. I've identified 47 active demo users right now who are on day 2–4.

**📧 Tactic 3: Champion-Led Expansion Email** (Est. +$6K MRR, 1 week)
Target your 28 paying customers with >1 seat and send a personalised "your team is missing out" expansion email with a team dashboard screenshot. Average seat expansion from this playbook: 1.7 seats per customer reached. I can generate the email now.`,
    module: 'Growth Strategy Engine',
  },
  {
    keywords: ['roi', 'return on investment', 'return on ad spend', 'roas', 'profitability', 'margin'],
    response: `Your blended marketing ROI across all paid channels is currently **4.6×** — meaning every $1 spent returns $4.60 in attributed revenue. Here's the breakdown that matters for investor reporting:

**Paid ROI by Channel (last 30 days):**
- Google Ads: $12,450 spend → $66,000 revenue → **5.3× ROAS**
- LinkedIn Ads: $4,200 spend → $34,400 revenue → **8.2× ROAS**
- Meta Ads: $3,100 spend → $12,700 revenue → **4.1× ROAS**

Your **LTV:CAC ratio is 9.9×** ($1,250 LTV ÷ $126 blended CAC), which is exceptionally strong — top-quartile SaaS benchmarks sit at 4–6×. This means you have significant room to increase CAC payback period and invest more aggressively in acquisition.

At current unit economics, I calculate you can safely increase monthly ad spend by **$8,400** before hitting margin compression. Want me to model the growth trajectory?`,
    module: 'ROI Analyser',
  },
  {
    keywords: ['competitor', 'competition', 'competitive analysis', 'competitor analysis', 'market positioning'],
    response: `**Competitive Intelligence Report — Digital CMO AI vs Market**

I've analysed 4 direct competitors across 12 positioning dimensions. Here's what stands out:

**Your strongest moat:** Persistent brand memory + multi-module orchestration. No competitor offers both in a single workspace. Jasper is content-only, HubSpot AI is CRM-first with no creative layer, and generic ChatGPT wrappers have zero brand context.

**Pricing gap you can exploit:** Your closest competitor (Jasper) charges $149/seat for content-only. You offer 10 modules at the same price point. In demos, leading with the "10 tools for the price of 1" angle converts 34% better than leading with AI angle (based on your own A/B data).

**Vulnerability to address:** Your onboarding is currently 7 steps vs competitors' 2-3. Time-to-first-value is 6.2 minutes — industry leaders are under 90 seconds. I recommend collapsing steps 3–5 into a single brand-voice capture screen. This is your biggest churn risk in the first session.

Want me to generate a full SWOT or competitive battle card?`,
    module: 'Competitive Intelligence',
  },
  {
    keywords: ['budget', 'budget allocation', 'ad budget', 'spend allocation', 'where should i spend', 'marketing budget'],
    response: `Based on your current performance data and growth targets, here's my recommended budget reallocation for next month:

**Current monthly spend: $19,750 → Recommended: $28,150 (+43%)**

| Channel | Current | Recommended | Rationale |
|---|---|---|---|
| Google Search | $12,450 | $14,200 | Solid ROAS, increase branded |
| LinkedIn Ads | $4,200 | $8,400 | Best ROAS, underinvested |
| Meta Ads | $3,100 | $2,800 | Rising CPMs, trim non-retargeting |
| Email tools | $0 | $950 | Segmentation & automation stack |
| New: YouTube | $0 | $1,800 | Retargeting existing demo visitors |

The LinkedIn increase is the clearest ROI move — you're at 8.2× ROAS with a budget cap that's artificially limiting reach. At $8,400/mo you'll still be below LinkedIn's algorithm's "learning phase" ceiling for your audience size.

This reallocation projects **$34K in incremental monthly revenue** at current conversion rates. Shall I draft the change orders for each platform?`,
    module: 'Budget Allocation Engine',
  },
  {
    keywords: ['lead gen', 'lead generation', 'generate leads', 'leads', 'pipeline', 'prospects', 'outbound'],
    response: `Your current lead generation engine is producing **47 new leads/week** at a blended CPL of $87. Here's how to scale to 120+ leads/week within 30 days without doubling spend:

**Lever 1: Content-Qualified Lead (CQL) Flow**
Your white paper funnel has a 31% conversion rate from download to email — that's excellent. But you're only driving 340 visitors/mo to it. Increasing content distribution via LinkedIn newsletter (easy to launch, avg 2,200 subscribers in 60 days for your ICP) could add 60–80 CQLs/month at near-zero cost.

**Lever 2: Webinar → Demo Pipeline**
B2B SaaS companies running monthly 30-min webinars on ICP pain points see 22–28% demo conversion from attendees. Your topic "How AI is replacing agency retainers" has pre-validated search demand: 8,900 monthly searches, low-competition. I can write the landing page, email sequence, and follow-up cadence.

**Lever 3: Integration Marketplace Listings**
You integrate with HubSpot. Getting listed on the HubSpot App Marketplace drives an average of 34 inbound leads/month for tools in your category — and it's free distribution. I've drafted your listing copy if you want to review it.`,
    module: 'Lead Gen Strategist',
  },
  {
    keywords: ['content strategy', 'content plan', 'content calendar', 'content marketing', 'blog', 'seo content'],
    response: `Here's your **Q2 Content Strategy** optimised for organic pipeline generation:

**3 Content Pillars (based on your ICP search behaviour):**
1. **"Replace the agency"** — Bottom-funnel comparison content (e.g. "Digital CMO AI vs HubSpot Agency", "AI vs $25K retainer"). Target: decision-makers ready to switch. Est. CPL via SEO: $12.
2. **"CMO Playbooks"** — Middle-funnel authority content (e.g. "How to reduce CAC by 30% in 90 days"). Target: growth-stage founders doing research. Builds brand trust.
3. **"AI Marketing How-Tos"** — Top-funnel traffic (e.g. "How to write Google Ads with AI", "Best AI tools for email marketing"). Drives volume, intern-able.

**Monthly Output Target:** 4 long-form posts (1,500+ words) + 12 LinkedIn repurposes + 8 email editions.

**Time Investment with AI:** ~6 hours/month with Digital CMO AI vs ~80 hours without. I've already identified 24 keyword opportunities with a combined search volume of 47,400/month and keyword difficulty under 35. Shall I build the full 3-month content calendar?`,
    module: 'Content Strategy Module',
  },
];

const SUGGESTED_QUESTIONS = [
  'Analyse my Google Ads performance',
  'Write a campaign brief for LinkedIn',
  "What's my best performing channel?",
  'How do I improve my email open rate?',
  'Give me 3 growth tactics for this month',
  'Analyse my competitors',
  'Optimise my marketing budget',
];

const DEMO_CONVERSATIONS = [
  { id: 'c1', title: 'Google Ads audit & reallocation', time: '2h ago', preview: 'Your CTR dropped 0.8%...' },
  { id: 'c2', title: 'Q2 LinkedIn campaign brief', time: 'Yesterday', preview: 'LinkedIn Campaign Brief...' },
  { id: 'c3', title: 'Email open rate optimisation', time: '2 days ago', preview: 'Your current open rate...' },
  { id: 'c4', title: 'Channel performance analysis', time: '3 days ago', preview: 'Based on 90 days of data...' },
  { id: 'c5', title: 'Budget reallocation model', time: 'Last week', preview: 'Current spend $19,750...' },
];

function getDemoResponse(input: string): { content: string; module_used: string } {
  const lower = input.toLowerCase();
  for (const qa of DEMO_QA) {
    if (qa.keywords.some((kw) => lower.includes(kw))) {
      return { content: qa.response, module_used: qa.module };
    }
  }
  return {
    content: `Great question. Based on your current marketing data, I can see several high-impact opportunities across your acquisition funnel. Your blended ROAS of **5.3×** is above industry average, but your signup-to-verified conversion of **68.2%** has room to improve — closing that gap to 80%+ would add an estimated **$14K in monthly pipeline** without increasing ad spend.

For your specific question, I'd recommend starting with a channel attribution audit to identify where your highest-LTV customers are actually coming from (not just last-click). In most SaaS companies at your stage, 60–70% of revenue is attributable to just 2 channels — and one of them is usually underinvested.

Try asking me about a specific area: Google Ads performance, email open rates, budget allocation, lead generation, or competitive analysis — and I'll give you a data-driven action plan.`,
    module_used: 'Brain Orchestrator',
  };
}

// Render markdown-like bold **text** inline
function RenderMarkdown({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => {
        // Bold pattern **text**
        const parts = line.split(/\*\*(.+?)\*\*/g);
        return (
          <p key={i} className={`text-sm leading-relaxed ${line.startsWith('**') && line.endsWith('**') && parts.length === 3 ? 'font-semibold text-slate-100' : 'text-slate-300'}`}>
            {parts.map((part, j) =>
              j % 2 === 1 ? (
                <strong key={j} className="font-bold text-slate-100">
                  {part}
                </strong>
              ) : (
                part
              )
            )}
          </p>
        );
      })}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-1 py-0.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 rounded-full bg-blue-400"
          style={{
            animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default function ChatPage() {
  const { isDemoMode } = useDemoMode();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const cardBg = { background: 'oklch(13% .008 255)', borderColor: 'oklch(24% .008 255)' };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  const sendMessage = useCallback(async (text?: string) => {
    const msgText = (text ?? input).trim();
    if (!msgText || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: msgText,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setIsTyping(true);

    try {
      await trackEvent('chat_message_sent', { length: msgText.length });

      if (isDemoMode) {
        // Simulate realistic thinking delay
        const delay = 900 + Math.random() * 900;
        await new Promise((resolve) => setTimeout(resolve, delay));
        setIsTyping(false);

        const { content, module_used } = getDemoResponse(msgText);
        const assistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content,
          timestamp: new Date().toISOString(),
          module_used,
        };
        setMessages((prev) => [...prev, assistantMsg]);
        await trackOnboardingStep('first_value_completed', { entrypoint: 'chat' });
        return;
      }

      const response = await chatService.sendMessage({
        message: msgText,
        conversation_id: conversationId,
      });
      setConversationId(response.conversation_id);
      setIsTyping(false);

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.reply,
        timestamp: new Date().toISOString(),
        module_used: response.module_used,
        tokens_used: response.tokens_used,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      void trackOnboardingStep('first_value_completed', { entrypoint: 'chat' });
    } catch {
      setIsTyping(false);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please check that the backend is running and try again.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, isDemoMode, conversationId]);

  const newChat = () => {
    if (conversationId) {
      chatService.clearConversation(conversationId).catch(() => {});
    }
    setMessages([]);
    setConversationId(undefined);
    setActiveConvId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      void sendMessage();
    }
  };

  return (
    <div
      className="flex h-[calc(100vh-64px)] -m-6 overflow-hidden"
      style={{ background: 'oklch(9% .008 255)' }}
    >
      {/* ── Left Sidebar ── */}
      <aside
        className="hidden md:flex flex-col w-64 border-r flex-shrink-0"
        style={{ background: 'oklch(11% .008 255)', borderColor: 'oklch(18% .008 255)' }}
      >
        {/* New Chat button */}
        <div className="p-4 border-b" style={{ borderColor: 'oklch(18% .008 255)' }}>
          <button
            onClick={newChat}
            className="w-full flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all hover:scale-[1.01]"
            style={{
              background: '#3c91ed',
              boxShadow: '0 0 20px #3c91ed40',
            }}
          >
            <Plus className="h-4 w-4" />
            New Chat
          </button>
        </div>

        {/* Conversation history */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-600 px-2 mb-3">Recent Conversations</p>
          {DEMO_CONVERSATIONS.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setActiveConvId(conv.id)}
              className={`w-full text-left rounded-xl p-3 transition-all group ${
                activeConvId === conv.id
                  ? 'bg-blue-500/10 border border-blue-500/20'
                  : 'hover:bg-white/[0.03] border border-transparent'
              }`}
            >
              <div className="flex items-start gap-2">
                <MessageSquare className="h-3.5 w-3.5 text-slate-600 flex-shrink-0 mt-0.5 group-hover:text-slate-400" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-300 truncate leading-tight">{conv.title}</p>
                  <p className="text-xs text-slate-600 truncate mt-0.5">{conv.preview}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="h-2.5 w-2.5 text-slate-700" />
                    <span className="text-xs text-slate-700">{conv.time}</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Sidebar footer */}
        <div className="p-4 border-t" style={{ borderColor: 'oklch(18% .008 255)' }}>
          <div
            className="rounded-xl p-3"
            style={{ background: 'oklch(14% .008 255)', border: '1px solid oklch(20% .008 255)' }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-400">All agents online</span>
            </div>
            <p className="text-xs text-slate-600">10 AI agents ready · GPT-4 powered</p>
          </div>
        </div>
      </aside>

      {/* ── Main Chat Area ── */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Top bar */}
        <header
          className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
          style={{ background: 'oklch(11% .008 255)', borderColor: 'oklch(18% .008 255)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ background: '#3c91ed20', boxShadow: '0 0 16px #3c91ed30' }}
            >
              <Brain className="h-4.5 w-4.5 text-blue-400" style={{ width: '1.1rem', height: '1.1rem' }} />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white">AI CMO Chat</h1>
              <p className="text-xs text-slate-500">Ask about strategy, campaigns, analytics & more</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="hidden sm:flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold"
              style={{ background: 'oklch(16% .008 255)', border: '1px solid oklch(24% .008 255)' }}
            >
              <Zap className="h-3 w-3 text-blue-400" />
              <span className="text-slate-300">GPT-4 + 10 Agents</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400">Live</span>
            </div>
          </div>
        </header>

        {/* Messages area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 && !loading && isDemoMode && (
            <div className="flex flex-col items-center justify-center min-h-full text-center py-8">
              <style>{`
                @keyframes brainPulse {
                  0%, 100% { box-shadow: 0 0 24px #3c91ed40, 0 0 48px #3c91ed20; }
                  50% { box-shadow: 0 0 48px #3c91ed80, 0 0 96px #3c91ed40; }
                }
              `}</style>
              {/* Brain icon with pulse glow */}
              <div
                className="flex h-20 w-20 items-center justify-center rounded-3xl mb-6"
                style={{
                  background: 'linear-gradient(135deg, #3c91ed30, #3c91ed15)',
                  border: '1px solid #3c91ed50',
                  animation: 'brainPulse 2.5s ease-in-out infinite',
                }}
              >
                <Brain className="h-9 w-9 text-blue-400" />
              </div>
              <h1 className="text-3xl font-extrabold text-white mb-2">Hi, I'm your AI CMO 👋</h1>
              <p className="text-slate-400 text-sm mb-10 leading-relaxed max-w-sm">
                Running on 10 specialised agents. Ask me anything.
              </p>

              {/* 6 prompt cards in 2×3 grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-3xl w-full text-left">
                {[
                  { emoji: '🎯', title: 'Analyse my Google Ads performance', border: '#3c91ed', glow: '#3c91ed30' },
                  { emoji: '📧', title: 'Write a 5-email onboarding sequence', border: '#a78bfa', glow: '#a78bfa30' },
                  { emoji: '📊', title: 'Run a SWOT analysis on my business', border: '#34d399', glow: '#34d39930' },
                  { emoji: '💰', title: 'Allocate my $50K monthly ad budget', border: '#fbbf24', glow: '#fbbf2430' },
                  { emoji: '🔍', title: 'Find 10 SEO opportunities', border: '#fb7185', glow: '#fb718530' },
                  { emoji: '🚀', title: 'Create a Q2 marketing campaign brief', border: '#f97316', glow: '#f9731630' },
                ].map((card) => (
                  <button
                    key={card.title}
                    onClick={() => { setInput(card.title); void sendMessage(card.title); }}
                    className="flex items-start gap-3 rounded-2xl p-4 text-left transition-all cursor-pointer"
                    style={{
                      background: 'oklch(13% .008 255)',
                      border: `1px solid oklch(24% .008 255)`,
                      borderLeft: `3px solid ${card.border}`,
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow = `0 0 20px ${card.glow}`;
                      (e.currentTarget as HTMLElement).style.borderColor = `${card.border}50`;
                      (e.currentTarget as HTMLElement).style.borderLeftColor = card.border;
                      (e.currentTarget as HTMLElement).style.background = 'oklch(15% .008 255)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                      (e.currentTarget as HTMLElement).style.borderColor = 'oklch(24% .008 255)';
                      (e.currentTarget as HTMLElement).style.borderLeftColor = card.border;
                      (e.currentTarget as HTMLElement).style.background = 'oklch(13% .008 255)';
                    }}
                  >
                    <span className="text-2xl flex-shrink-0 mt-0.5">{card.emoji}</span>
                    <span className="text-sm font-semibold text-slate-200 leading-snug">{card.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.length === 0 && !loading && !isDemoMode && (
            <div className="flex flex-col items-center justify-center h-full text-center max-w-xl mx-auto">
              <div
                className="flex h-20 w-20 items-center justify-center rounded-3xl mb-6"
                style={{
                  background: 'linear-gradient(135deg, #3c91ed22, #3c91ed11)',
                  border: '1px solid #3c91ed30',
                  boxShadow: '0 0 40px #3c91ed20',
                }}
              >
                <Brain className="h-9 w-9 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Your AI CMO is ready</h2>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                Ask me anything about your marketing strategy, campaigns, analytics, or competitors. I have access to all your data and 10 specialist AI agents.
              </p>

              {/* Suggested questions */}
              <div className="flex flex-wrap gap-2 justify-center">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => void sendMessage(q)}
                    className="rounded-full border px-4 py-2 text-xs font-medium text-blue-300 transition-all hover:scale-[1.02]"
                    style={{
                      borderColor: '#3c91ed40',
                      background: '#3c91ed0a',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow = '0 0 16px #3c91ed30';
                      (e.currentTarget as HTMLElement).style.borderColor = '#3c91ed80';
                      (e.currentTarget as HTMLElement).style.background = '#3c91ed18';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                      (e.currentTarget as HTMLElement).style.borderColor = '#3c91ed40';
                      (e.currentTarget as HTMLElement).style.background = '#3c91ed0a';
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={msg.id}
              className="flex gap-4 animate-[fadeSlideUp_0.3s_ease_forwards]"
              style={{
                animation: 'fadeSlideUp 0.3s ease forwards',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              <style>{`
                @keyframes fadeSlideUp {
                  from { opacity: 0; transform: translateY(8px); }
                  to { opacity: 1; transform: translateY(0); }
                }
              `}</style>

              {msg.role === 'assistant' && (
                <div
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl mt-0.5"
                  style={{
                    background: '#3c91ed18',
                    border: '1px solid #3c91ed30',
                    boxShadow: '0 0 12px #3c91ed20',
                  }}
                >
                  <Brain className="h-4 w-4 text-blue-400" />
                </div>
              )}

              <div className={`max-w-[72%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1.5`}>
                {msg.role === 'assistant' && msg.module_used && (
                  <div className="flex items-center gap-2">
                    <span
                      className="rounded-full px-2.5 py-0.5 text-xs font-bold text-blue-300"
                      style={{ background: '#3c91ed15', border: '1px solid #3c91ed25' }}
                    >
                      🧠 Brain Orchestrator
                    </span>
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-medium text-slate-400"
                      style={{ background: 'oklch(16% .008 255)', border: '1px solid oklch(22% .008 255)' }}
                    >
                      via {msg.module_used}
                    </span>
                  </div>
                )}

                <div
                  className={`rounded-2xl px-5 py-4 ${
                    msg.role === 'user'
                      ? 'rounded-tr-sm'
                      : 'rounded-tl-sm border-l-2'
                  }`}
                  style={
                    msg.role === 'user'
                      ? {
                          background: '#3c91ed',
                          boxShadow: '0 0 20px #3c91ed30',
                        }
                      : {
                          background: 'oklch(14% .008 255)',
                          border: '1px solid oklch(22% .008 255)',
                          borderLeft: '2px solid #3c91ed50',
                          ...cardBg,
                        }
                  }
                >
                  {msg.role === 'user' ? (
                    <p className="text-sm text-white leading-relaxed">{msg.content}</p>
                  ) : (
                    <RenderMarkdown text={msg.content} />
                  )}

                  {msg.tokens_used && (
                    <p className="mt-2 text-xs text-slate-600">{msg.tokens_used} tokens</p>
                  )}
                </div>

                <p className="text-xs text-slate-700 px-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              {msg.role === 'user' && (
                <div
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl mt-0.5 text-xs font-bold text-white"
                  style={{
                    background: 'oklch(30% .1 253)',
                    border: '1px solid oklch(40% .1 253 / 0.5)',
                  }}
                >
                  You
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex gap-4" style={{ animation: 'fadeSlideUp 0.3s ease forwards' }}>
              <div
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl mt-0.5"
                style={{ background: '#3c91ed18', border: '1px solid #3c91ed30' }}
              >
                <Brain className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className="rounded-full px-2.5 py-0.5 text-xs font-bold text-blue-300"
                    style={{ background: '#3c91ed15', border: '1px solid #3c91ed25' }}
                  >
                    🧠 Brain Orchestrator
                  </span>
                  <span className="text-xs text-slate-600">thinking…</span>
                </div>
                <div
                  className="rounded-2xl rounded-tl-sm px-5 py-4"
                  style={{
                    background: 'oklch(14% .008 255)',
                    border: '1px solid oklch(22% .008 255)',
                    borderLeft: '2px solid #3c91ed50',
                  }}
                >
                  <TypingIndicator />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Input Area ── */}
        <div
          className="border-t p-4 flex-shrink-0"
          style={{ background: 'oklch(11% .008 255)', borderColor: 'oklch(18% .008 255)' }}
        >
          {/* Suggested chips (when there are messages) */}
          {messages.length > 0 && isDemoMode && (
            <div className="flex flex-wrap gap-2 mb-3">
              {SUGGESTED_QUESTIONS.slice(0, 4).map((q) => (
                <button
                  key={q}
                  onClick={() => void sendMessage(q)}
                  className="rounded-full border px-3 py-1.5 text-xs font-medium text-blue-300 transition-all hover:scale-[1.02] whitespace-nowrap"
                  style={{ borderColor: '#3c91ed30', background: '#3c91ed08' }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 0 12px #3c91ed28';
                    (e.currentTarget as HTMLElement).style.borderColor = '#3c91ed60';
                    (e.currentTarget as HTMLElement).style.background = '#3c91ed14';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                    (e.currentTarget as HTMLElement).style.borderColor = '#3c91ed30';
                    (e.currentTarget as HTMLElement).style.background = '#3c91ed08';
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <div
            className="flex gap-3 rounded-2xl p-1 transition-all"
            style={{
              background: 'oklch(14% .008 255)',
              border: '1px solid oklch(22% .008 255)',
            }}
            onFocusCapture={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = '0 0 24px #3c91ed2e';
              (e.currentTarget as HTMLElement).style.borderColor = '#3c91ed50';
            }}
            onBlurCapture={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              (e.currentTarget as HTMLElement).style.borderColor = 'oklch(22% .008 255)';
            }}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask your AI CMO anything…"
              rows={1}
              className="flex-1 resize-none bg-transparent px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none leading-relaxed"
              style={{ minHeight: '48px', maxHeight: '160px' }}
            />
            <div className="flex items-end p-1.5 gap-2">
              <span className="hidden sm:block text-xs text-slate-700 mb-2.5 whitespace-nowrap">⌘+Enter</span>
              <button
                onClick={() => void sendMessage()}
                disabled={!input.trim() || loading}
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-all disabled:opacity-40"
                style={{
                  background: input.trim() && !loading ? '#3c91ed' : 'oklch(20% .008 255)',
                  boxShadow: input.trim() && !loading ? '0 0 16px #3c91ed50' : 'none',
                }}
              >
                <Send className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>
          <p className="mt-2 text-center text-xs text-slate-700">
            AI CMO may make mistakes. Always verify important decisions with your data.
          </p>
        </div>
      </div>
    </div>
  );
}
