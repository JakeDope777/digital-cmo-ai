import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Trash2, Bot, UserCircle } from 'lucide-react';
import { chatService } from '../services/api';
import type { ChatMessage } from '../types';
// react-markdown removed — using simple inline renderer to avoid extra dep
import { trackEvent, trackOnboardingStep } from '../services/analytics';
import { useDemoMode } from '../context/DemoModeContext';

// ── Demo Mode: Rich scripted AI CMO responses ─────────────────────────────────
const DEMO_QA: Array<{ keywords: string[]; response: string; module: string }> = [
  {
    keywords: ['google ads', 'google ad', 'gads', 'adwords', 'ppc', 'search ads', 'analyse my google'],
    response: `Your Google Ads account is showing a **3.1% CTR** across 8 active campaigns — that's 0.8pts below your industry benchmark of 3.9%. The top opportunity I'm seeing is in your "Brand Awareness" campaign, which is burning **$1,200/week** at a ROAS of 1.8× while your "Competitor Keyword" campaign is delivering 6.4× ROAS on a fraction of the budget.

I recommend reallocating $800/week from Brand Awareness into Competitor Keywords and creating 3 RSA ad variants targeting high-intent long-tail terms. Based on your historical conversion data, this should recover approximately **$4,100 in monthly revenue** within 3 weeks.

Your Quality Scores for non-brand terms average 5.2/10. Improving landing page relevance for your top 10 keywords to a QS of 7+ would reduce your average CPC by an estimated **18–22%**.`,
    module: 'Google Ads Analyser (demo)',
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
    module: 'Campaign Brief Generator (demo)',
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
    module: 'Channel Attribution Analyser (demo)',
  },
  {
    keywords: ['email open rate', 'email open', 'improve email', 'email marketing', 'email campaign', 'open rate', 'subject line'],
    response: `Your current email open rate of **24.5%** is 6 points below the SaaS industry median of 30.4%. Here are the three highest-leverage fixes I can implement right now:

**1. Subject line personalisation** — Your last 12 campaigns used generic subjects. Adding first-name + company-specific signal (e.g. "Jake, your Q1 pipeline gap is showing") lifts open rates by an average of 18–26% based on 847 A/B tests in our dataset. I've drafted 5 variants ready for your next campaign.

**2. Send-time optimisation** — You're currently batch-sending at 9am Tuesdays. Your audience's peak engagement window is **10:30am–12pm on Wednesdays** (based on your historical click data). Shifting send time alone is projected to add +3.2pts to open rate.

**3. List hygiene** — 14.3% of your list hasn't opened an email in 90+ days. Running a re-engagement sequence before suppression typically recovers 8–12% of dormant subscribers and improves deliverability for everyone else.

Want me to generate the re-engagement sequence copy now?`,
    module: 'Email Optimiser (demo)',
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
    module: 'Growth Strategy Engine (demo)',
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
    module: 'ROI Analyser (demo)',
  },
  {
    keywords: ['competitor', 'competition', 'competitive analysis', 'competitor analysis', 'market positioning'],
    response: `**Competitive Intelligence Report — Digital CMO AI vs Market**

I've analysed 4 direct competitors across 12 positioning dimensions. Here's what stands out:

**Your strongest moat:** Persistent brand memory + multi-module orchestration. No competitor offers both in a single workspace. Jasper is content-only, HubSpot AI is CRM-first with no creative layer, and generic ChatGPT wrappers have zero brand context.

**Pricing gap you can exploit:** Your closest competitor (Jasper) charges $149/seat for content-only. You offer 10 modules at the same price point. In demos, leading with the "10 tools for the price of 1" angle converts 34% better than leading with AI angle (based on your own A/B data).

**Vulnerability to address:** Your onboarding is currently 7 steps vs competitors' 2-3. Time-to-first-value is 6.2 minutes — industry leaders are under 90 seconds. I recommend collapsing steps 3–5 into a single brand-voice capture screen. This is your biggest churn risk in the first session.

Want me to generate a full SWOT or competitive battle card?`,
    module: 'Competitive Intelligence (demo)',
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
    module: 'Budget Allocation Engine (demo)',
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
    module: 'Lead Gen Strategist (demo)',
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
    module: 'Content Strategy Module (demo)',
  },
];

const SUGGESTED_QUESTIONS = [
  'Analyse my Google Ads performance',
  'Write a campaign brief for LinkedIn',
  "What's my best performing channel?",
  'How do I improve my email open rate?',
  'Give me 3 growth tactics for this month',
];

function getDemoResponse(input: string): { content: string; module_used: string } {
  const lower = input.toLowerCase();
  for (const qa of DEMO_QA) {
    if (qa.keywords.some((kw) => lower.includes(kw))) {
      return { content: qa.response, module_used: qa.module };
    }
  }
  // Fallback generic response
  return {
    content: `Great question. Based on your current marketing data, I can see several high-impact opportunities across your acquisition funnel. Your blended ROAS of **5.3×** is above industry average, but your signup-to-verified conversion of **68.2%** has room to improve — closing that gap to 80%+ would add an estimated **$14K in monthly pipeline** without increasing ad spend.

For your specific question, I'd recommend starting with a channel attribution audit to identify where your highest-LTV customers are actually coming from (not just last-click). In most SaaS companies at your stage, 60–70% of revenue is attributable to just 2 channels — and one of them is usually underinvested.

Try asking me about a specific area: Google Ads performance, email open rates, budget allocation, lead generation, or competitive analysis — and I'll give you a data-driven action plan.`,
    module_used: 'AI Brain Orchestrator (demo)',
  };
}

export default function ChatPage() {
  const { isDemoMode } = useDemoMode();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      await trackEvent('chat_message_sent', { length: text.length });

      if (isDemoMode) {
        // Simulate realistic AI thinking delay (800ms–1.6s)
        await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 800));
        const { content, module_used } = getDemoResponse(text);
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
        message: text,
        conversation_id: conversationId,
      });
      setConversationId(response.conversation_id);

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
  };

  const clearChat = () => {
    if (conversationId) {
      chatService.clearConversation(conversationId).catch(() => {});
    }
    setMessages([]);
    setConversationId(undefined);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">AI Marketing Assistant</h2>
          <p className="text-sm text-gray-500">
            Ask about market research, campaigns, analytics, creative content, and more.
          </p>
        </div>
        {messages.length > 0 && (
          <button onClick={clearChat} className="btn-secondary flex items-center gap-2 text-sm">
            <Trash2 className="w-4 h-4" /> Clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
            <Bot className="w-16 h-16 mb-4 text-primary-300" />
            <p className="text-lg font-medium text-gray-600">How can I help with your marketing today?</p>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
              {[
                'Do a SWOT analysis for our SaaS product',
                'Write a LinkedIn post about AI trends',
                'Show me dashboard metrics',
                'Create a welcome email campaign',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="text-left px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-primary-300 hover:bg-primary-50 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`chat-message-enter flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-primary-600" />
              </div>
            )}
            <div
              className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-primary-600 text-white rounded-br-md'
                  : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md'
              }`}
            >
              {msg.role === 'assistant' ? (
                <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                  {msg.content}
                </div>
              ) : (
                msg.content
              )}
              {msg.module_used && (
                <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-400">
                  Module: {msg.module_used}
                  {msg.tokens_used ? ` · ${msg.tokens_used} tokens` : ''}
                </div>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                <UserCircle className="w-4 h-4 text-gray-600" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 chat-message-enter">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-primary-600" />
            </div>
            <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-bl-md">
              <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            rows={1}
            className="input-field resize-none"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="btn-primary flex items-center gap-2 px-5"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        {/* Suggested question chips */}
        {isDemoMode && (
          <div className="mt-3 flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => setInput(q)}
                className="rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700 hover:border-primary-400 hover:bg-primary-100 transition-colors whitespace-nowrap"
              >
                {q}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
