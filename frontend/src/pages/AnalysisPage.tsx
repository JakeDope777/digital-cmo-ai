import { useState } from 'react';
import {
  Search,
  Loader2,
  BarChart2,
  Swords,
  Globe,
  Users,
  Layers,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { analysisService } from '../services/api';
import ReactMarkdown from 'react-markdown';
import { trackEvent, trackOnboardingStep } from '../services/analytics';
import { useDemoMode } from '../context/DemoModeContext';
import DemoDataBadge from '../components/common/DemoDataBadge';

type AnalysisType = 'market' | 'swot' | 'pestel' | 'competitor' | 'persona';

const DS = {
  page: 'oklch(9% .008 255)',
  card: 'oklch(13% .008 255)',
  cardHover: 'oklch(15% .008 255)',
  border: 'oklch(24% .008 255)',
  primary: 'oklch(65% .16 253)',
  textPrimary: 'oklch(93% .005 80)',
  textSecondary: 'oklch(58% .015 255)',
};

const ANALYSIS_TYPES: {
  key: AnalysisType;
  label: string;
  icon: React.ElementType;
  placeholder: string;
  accent: string;
  description: string;
}[] = [
  { key: 'market', label: 'Market Research', icon: BarChart2, placeholder: 'e.g. SaaS market in Europe 2026', accent: '#fbbf24', description: 'Market size, trends, and growth opportunities' },
  { key: 'swot', label: 'SWOT Analysis', icon: Layers, placeholder: 'e.g. Our new product launch', accent: '#3c91ed', description: 'Strengths, Weaknesses, Opportunities, Threats' },
  { key: 'pestel', label: 'PESTEL Analysis', icon: Globe, placeholder: 'e.g. European tech market', accent: '#34d399', description: 'Political, Economic, Social, Technical factors' },
  { key: 'competitor', label: 'Competitor Intel', icon: Swords, placeholder: 'e.g. Salesforce, HubSpot, Pipedrive', accent: '#fb7185', description: 'Positioning, pricing, and differentiation gaps' },
  { key: 'persona', label: 'Buyer Personas', icon: Users, placeholder: 'e.g. B2B SaaS decision makers', accent: '#a78bfa', description: 'ICP deep-dives with pain points & motivations' },
];

const DEMO_RESULTS: Record<AnalysisType, string> = {
  market: `## SaaS Market — Europe 2026

**Market Size:** €48.2B total addressable market, growing at 19.4% CAGR.

### Key Trends
- AI-native products claiming 31% of new deal flow in enterprise segment
- Usage-based pricing adoption up 2.4× since 2023 — flat seat fees declining
- Compliance (GDPR, AI Act) driving demand for audit-ready SaaS platforms

### Top Opportunity Segments
| Segment | Size | Growth |
|---------|------|--------|
| Revenue Intelligence | €3.1B | +28% |
| Customer Data Platforms | €2.7B | +24% |
| Marketing Automation | €4.4B | +18% |

### Strategic Recommendation
Enter mid-market (50–500 seats) with a vertical-specific AI product. GTM motion: product-led trials with sales-assist at $10k+ ACV threshold.`,

  swot: `## SWOT Analysis

### ✅ Strengths
- AI-first architecture — zero legacy technical debt
- Proprietary training data from pilot customers showing 23% engagement lift
- Founding team with prior exits in marketing tech

### ⚠️ Weaknesses
- Brand recognition near zero vs. incumbents
- Single-tenant infrastructure creates scaling cost pressure
- Churn risk during onboarding if time-to-value > 14 days

### 🚀 Opportunities
- CMOs under pressure to justify spend — ROI proof tools in high demand
- Open-source LLMs reducing inference cost 60% YoY
- Post-cookie world creating measurement gap competitors haven't solved

### 🔴 Threats
- HubSpot, Salesforce shipping AI features inside existing workflows
- Talent market for ML engineers extremely competitive
- Macro environment slowing discretionary SaaS spend`,

  pestel: `## PESTEL Analysis — European Tech Market

**Political:** AI Act enforcement beginning 2026 — high-risk AI classification creates compliance overhead for generative tools. GDPR enforcement intensifying (avg fine €4.2M in 2025).

**Economic:** ECB rate stabilisation improving SaaS deal cycles. €2.1B in EU digital transformation grants targeting SMEs through 2027.

**Social:** Remote-first work normalised — platform spend shifting from travel/facilities to productivity SaaS. Decision-makers younger (avg CMO age dropped from 48 → 43).

**Technology:** Multimodal models commoditised by Q3 2025. Edge inference viable for real-time marketing signals. Browser-based auth (passkeys) eliminating password friction.

**Environmental:** Scope 3 SaaS emissions reporting mandated for EU companies >250 employees from 2027 — creates green-stack differentiation angle.

**Legal:** DSA platform obligations affecting paid social distribution. ePrivacy Regulation still pending — creates uncertainty in cookie-less tracking strategies.`,

  competitor: `## Competitor Intelligence Report

### HubSpot
- **Positioning:** All-in-one platform, SMB-first, freemium GTM
- **Weakness:** AI features bolted on, not native — users report "feels like an add-on"
- **Pricing:** $800–$3,200/mo for Marketing Hub Pro
- **Gap to exploit:** No real-time campaign intelligence or autonomous execution

### Salesforce Marketing Cloud
- **Positioning:** Enterprise, data cloud integration, high configurability
- **Weakness:** 6–18 month implementation cycles, high TCO
- **Pricing:** $1,250–$15,000/mo, plus consulting fees
- **Gap to exploit:** SMB and mid-market completely underserved

### Klaviyo (E-commerce focus)
- **Positioning:** Email + SMS for DTC brands
- **Weakness:** Limited to e-commerce, no B2B use case
- **Gap to exploit:** B2B buyers growing rapidly, no Klaviyo equivalent

### Your Differentiation
Autonomous AI that **plans, executes and analyses** — not just reports. Faster time-to-insight, no integration tax, vertical-specific models.`,

  persona: `## Buyer Persona Report

---

### Persona 1 — "The Stretched CMO"
**Name:** Sarah, VP Marketing, Series B SaaS
**Age:** 38 · **Company:** 80–300 employees · **Budget:** $150k–$500k/yr

**Core Pain:** Expected to 3× pipeline with the same team size after last round of layoffs. Drowning in dashboards, starved for decisions.

**What they want:** One place that tells them what to do next, not just what happened.
**Buying trigger:** Board meeting where they couldn't explain why paid CAC jumped 40%.
**Key objection:** "We already have too many tools."
**Message that wins:** *"Replace 4 reporting tools with one that acts."*

---

### Persona 2 — "The Performance Lead"
**Name:** Marcos, Head of Growth, PLG startup
**Age:** 31 · **Company:** 20–80 employees · **Budget:** $30k–$80k/yr

**Core Pain:** Manually pulling channel data every Monday morning. Experiments running with no statistical significance framework.

**What they want:** Auto-detected experiment winners with confidence intervals, pushed to Slack.
**Buying trigger:** Lost a key hire to a competitor with better tooling.
**Key objection:** "Can it integrate with our data warehouse?"
**Message that wins:** *"From raw events to recommended budget shift in under 60 seconds."*`,
};

export default function AnalysisPage() {
  const { isDemoMode } = useDemoMode();
  const [selectedType, setSelectedType] = useState<AnalysisType>('market');
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDemo, setIsDemo] = useState(false);

  const runAnalysis = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);
    setIsDemo(false);

    if (isDemoMode) {
      setResult(DEMO_RESULTS[selectedType]);
      setIsDemo(true);
      await trackEvent('analysis_run', { analysis_type: selectedType });
      await trackOnboardingStep('first_value_completed', { entrypoint: 'analysis' });
      setLoading(false);
      return;
    }

    try {
      await trackEvent('analysis_run', { analysis_type: selectedType });
      let response;
      switch (selectedType) {
        case 'market': response = await analysisService.marketResearch(query); break;
        case 'swot': response = await analysisService.swotAnalysis(query); break;
        case 'pestel': response = await analysisService.pestelAnalysis(query); break;
        case 'competitor': response = await analysisService.competitorAnalysis(query.split(',').map((s) => s.trim())); break;
        case 'persona': response = await analysisService.createPersonas(query); break;
      }
      const text = typeof response === 'string' ? response
        : response?.analysis ? JSON.stringify(response.analysis, null, 2)
        : response?.insights ? JSON.stringify(response.insights, null, 2)
        : JSON.stringify(response, null, 2);
      setResult(text);
      void trackOnboardingStep('first_value_completed', { entrypoint: 'analysis' });
    } catch {
      setResult(DEMO_RESULTS[selectedType]);
      setIsDemo(true);
    } finally {
      setLoading(false);
    }
  };

  const current = ANALYSIS_TYPES.find((t) => t.key === selectedType)!;

  return (
    <div className="space-y-6" style={{ color: DS.textPrimary }}>
      {/* Header */}
      <section className="rounded-2xl p-5" style={{ background: DS.card, border: `1px solid ${DS.border}` }}>
        <p className="text-xs uppercase tracking-[0.2em] font-medium" style={{ color: DS.primary }}>Intelligence Engine</p>
        <h2 className="mt-1 text-2xl font-bold" style={{ color: DS.textPrimary }}>Business Analysis</h2>
        <p className="text-sm mt-1" style={{ color: DS.textSecondary }}>AI-powered strategic analyses — market research, competitive intel, buyer personas and more.</p>
      </section>

      {/* Type selector */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {ANALYSIS_TYPES.map((type) => {
          const Icon = type.icon;
          const isActive = selectedType === type.key;
          return (
            <button
              key={type.key}
              onClick={() => setSelectedType(type.key)}
              className="flex flex-col items-start gap-2 rounded-xl p-4 text-left transition-all"
              style={{
                background: isActive ? `${type.accent}18` : DS.card,
                border: `1px solid ${isActive ? type.accent : DS.border}`,
                boxShadow: isActive ? `0 0 18px ${type.accent}22` : 'none',
              }}
            >
              <Icon className="h-5 w-5" style={{ color: isActive ? type.accent : DS.textSecondary }} />
              <div>
                <p className="text-sm font-semibold" style={{ color: isActive ? type.accent : DS.textPrimary }}>{type.label}</p>
                <p className="mt-0.5 text-xs leading-relaxed" style={{ color: DS.textSecondary }}>{type.description}</p>
              </div>
            </button>
          );
        })}
      </section>

      {/* Input */}
      <section className="rounded-2xl p-5" style={{ background: DS.card, border: `1px solid ${DS.border}` }}>
        <label className="block text-sm font-semibold mb-2" style={{ color: DS.textPrimary }}>{current.label}</label>
        <div className="flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && void runAnalysis()}
            placeholder={current.placeholder}
            className="flex-1 rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
            style={{
              background: DS.page,
              border: `1px solid ${DS.border}`,
              color: DS.textPrimary,
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = DS.primary; e.currentTarget.style.boxShadow = `0 0 0 2px ${DS.primary}22`; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = DS.border; e.currentTarget.style.boxShadow = 'none'; }}
          />
          <button
            onClick={() => void runAnalysis()}
            disabled={loading || !query.trim()}
            className="inline-flex items-center gap-2 px-5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all disabled:opacity-50"
            style={{ background: DS.primary, color: '#fff', boxShadow: `0 0 24px #3c91ed2e` }}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            {loading ? 'Analysing…' : 'Analyse'}
          </button>
        </div>

        {/* Quick suggestions */}
        <div className="mt-3 flex flex-wrap gap-2">
          {[current.placeholder, 'AI startups in DACH region', 'SaaS pricing strategy 2026'].map((s, i) => (
            <button
              key={i}
              onClick={() => setQuery(s)}
              className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs transition-colors"
              style={{ border: `1px solid ${DS.border}`, color: DS.textSecondary }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = DS.primary; e.currentTarget.style.color = DS.primary; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = DS.border; e.currentTarget.style.color = DS.textSecondary; }}
            >
              <ChevronRight className="h-3 w-3" />{s}
            </button>
          ))}
        </div>
      </section>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center rounded-2xl p-12" style={{ background: DS.card, border: `1px solid ${DS.border}` }}>
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin" style={{ color: DS.primary }} />
            <p className="mt-3 text-sm" style={{ color: DS.textSecondary }}>Running {current.label}…</p>
          </div>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <section className="rounded-2xl p-5" style={{ background: DS.card, border: `1px solid ${DS.border}` }}>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-4 w-4" style={{ color: current.accent }} />
            <h3 className="text-sm font-semibold" style={{ color: DS.textPrimary }}>{current.label} Results</h3>
            {isDemo && <DemoDataBadge className="ml-auto" />}
          </div>
          <div
            className="prose prose-sm max-w-none"
            style={{ '--tw-prose-body': DS.textSecondary, '--tw-prose-headings': DS.primary, '--tw-prose-bold': DS.textPrimary, '--tw-prose-code': '#34d399', '--tw-prose-hr': DS.border } as React.CSSProperties}
          >
            <style>{`
              .analysis-md h1, .analysis-md h2, .analysis-md h3 { color: ${DS.primary}; font-weight: 700; margin-top: 1.25em; }
              .analysis-md p { color: ${DS.textSecondary}; }
              .analysis-md li { color: ${DS.textSecondary}; }
              .analysis-md strong { color: ${DS.textPrimary}; }
              .analysis-md table { width: 100%; border-collapse: collapse; margin-top: 1em; }
              .analysis-md th { color: ${DS.textPrimary}; border-bottom: 1px solid ${DS.border}; padding: 6px 12px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; }
              .analysis-md td { color: ${DS.textSecondary}; border-bottom: 1px solid ${DS.border}; padding: 8px 12px; font-size: 13px; }
              .analysis-md hr { border-color: ${DS.border}; margin: 1.5em 0; }
              .analysis-md code { color: #34d399; background: #34d39918; padding: 2px 6px; border-radius: 4px; font-size: 12px; }
            `}</style>
            <div className="analysis-md">
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
