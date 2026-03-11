export const DEMO_USER = {
  id: "usr_demo123",
  email: "jake@acmecorp.com",
  name: "Jake Davis",
  industry: "SaaS",
  plan: "Growth",
  aiCallsUsed: 12450,
  aiCallsLimit: 50000,
  createdAt: new Date().toISOString()
};

export const DEMO_DASHBOARD = {
  mql: 1247,
  mqlTrend: 23.4,
  cac: 42,
  cacTrend: -8.2,
  pipeline: 847000,
  pipelineTrend: 31.5,
  conversionRate: 4.2,
  conversionTrend: 0.8,
  chartData: Array.from({ length: 14 }).map((_, i) => ({
    date: `Oct ${i * 2 + 1}`,
    value: Math.floor(Math.random() * 40000) + 10000,
    leads: Math.floor(Math.random() * 100) + 20
  })),
  topCampaigns: [
    { id: "1", name: "Q4 B2B SaaS Reach", status: "active", channel: "LinkedIn", leads: 847, conversions: 35, revenue: 142000, startDate: new Date().toISOString() },
    { id: "2", name: "Retargeting Cart", status: "active", channel: "Meta", leads: 412, conversions: 89, revenue: 84000, startDate: new Date().toISOString() },
    { id: "3", name: "Cold Email Seq", status: "draft", channel: "Email", leads: 0, conversions: 0, revenue: 0, startDate: new Date().toISOString() },
    { id: "4", name: "Brand Search", status: "active", channel: "Google", leads: 1205, conversions: 112, revenue: 215000, startDate: new Date().toISOString() }
  ] as any[],
  integrationHealth: [
    { name: "HubSpot", status: "connected", lastSync: "2 mins ago" },
    { name: "Google Analytics", status: "connected", lastSync: "Live" },
    { name: "Stripe", status: "warning", lastSync: "Needs Auth" }
  ] as any[]
};

export const DEMO_CHAT_HISTORY = [
  { id: "1", role: "user", content: "What's our best performing channel this month?", createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: "2", role: "assistant", content: "Based on the current month's data, **LinkedIn** is significantly outperforming other channels in both volume and quality of leads for our SaaS offering.\n\nI recommend reallocating $5,000 from the Google Ads budget to LinkedIn Sponsored Content for the remainder of the month to maximize our lower CAC pipeline.", createdAt: new Date(Date.now() - 3590000).toISOString() },
  { id: "3", role: "user", content: "Create a 30-day LinkedIn campaign plan targeting enterprise CTOs.", createdAt: new Date(Date.now() - 120000).toISOString() }
] as any[];

export const DEMO_MARKET_ANALYSIS = {
  marketSize: "$14.2 Billion",
  growthRate: "18.5% YoY",
  opportunities: ["Shift to AI automation", "Consolidation of tooling", "Enterprise compliance needs"],
  threats: ["Lower barrier to entry for competitors", "Budget tightening in Q3"],
  personas: [
    { name: "Growth Gary", role: "VP of Marketing", painPoints: ["Scattered data", "High CAC"], goals: ["Scale pipeline 3x", "Prove ROI"] },
    { name: "Technical Tina", role: "CTO", painPoints: ["Security risks", "Integration hell"], goals: ["SOC2 Compliance", "Reliability"] }
  ],
  swot: {
    strengths: ["Superior AI model", "Deep integrations", "Agile team"],
    weaknesses: ["Brand awareness", "Limited enterprise features"],
    opportunities: ["New market in EU", "Agency partnerships"],
    threats: ["Incumbents adding AI features"]
  }
};

export const DEMO_COMPETITORS = [
  { name: "MarketFlow", website: "marketflow.com", positioning: "All-in-one legacy CRM", strengths: ["Huge market share", "Brand trust"], weaknesses: ["Slow UI", "Expensive"], estimatedRevenue: "$250M" },
  { name: "AutoLead", website: "autolead.io", positioning: "Cheap email automation", strengths: ["Price", "Easy setup"], weaknesses: ["No multi-channel", "High churn"], estimatedRevenue: "$15M" }
];

export const DEMO_LEADS = [
  { id: "1", name: "Sarah Chen", email: "sarah@acmecorp.com", company: "Acme Corp", source: "LinkedIn", stage: "qualified", value: 12000, lastContact: new Date().toISOString(), aiSuggestion: "Schedule discovery call. Acme Corp recently expanded operations." },
  { id: "2", name: "James Wilson", email: "j.wilson@techflow.io", company: "TechFlow", source: "Organic", stage: "proposal", value: 45000, lastContact: new Date(Date.now() - 86400000).toISOString(), aiSuggestion: "Follow up on the proposal sent yesterday. High intent." },
  { id: "3", name: "Maria Santos", email: "maria@healthco.net", company: "HealthCo", source: "Google Ads", stage: "new", value: 8500, lastContact: new Date().toISOString(), aiSuggestion: "Send healthtech case study." },
  { id: "4", name: "David Kim", email: "dkim@retailedge.com", company: "RetailEdge", source: "Referral", stage: "closed", value: 28000, lastContact: new Date(Date.now() - 259200000).toISOString(), aiSuggestion: "Send onboarding sequence." }
];

export const DEMO_GROWTH = {
  funnel: [
    { stage: "Website Visitors", count: 45200, rate: 100 },
    { stage: "MQLs", count: 1247, rate: 2.7 },
    { stage: "SQLs", count: 412, rate: 33.0 },
    { stage: "Opportunities", count: 185, rate: 44.9 },
    { stage: "Closed Won", count: 42, rate: 22.7 }
  ],
  abTests: [
    { id: "1", name: "Hero Headline Test", variantA: "Your AI CMO", variantB: "Automate Marketing", winnerConversionA: 4.2, winnerConversionB: 3.1, status: "completed" },
    { id: "2", name: "Pricing Page CTA", variantA: "Start Trial", variantB: "Get Started", winnerConversionA: 2.1, winnerConversionB: 2.4, status: "running" }
  ],
  forecast: Array.from({ length: 6 }).map((_, i) => ({
    date: `Month ${i+1}`,
    value: Math.floor(80000 + (i * 15000)),
    leads: 0
  }))
};

export const DEMO_INTEGRATIONS = [
  { id: "1", name: "HubSpot", category: "crm", status: "connected", lastSync: new Date().toISOString(), icon: "HubSpot", description: "Two-way sync for leads and deals." },
  { id: "2", name: "Google Analytics", category: "analytics", status: "connected", lastSync: new Date().toISOString(), icon: "Google", description: "Traffic and conversion tracking." },
  { id: "3", name: "Salesforce", category: "crm", status: "disconnected", lastSync: undefined, icon: "Salesforce", description: "Enterprise CRM sync." },
  { id: "4", name: "Stripe", category: "payments", status: "error", lastSync: new Date(Date.now() - 86400000).toISOString(), icon: "Stripe", description: "Revenue and subscription metrics." },
  { id: "5", name: "Meta Ads", category: "ads", status: "disconnected", lastSync: undefined, icon: "Meta", description: "Ad spend and ROAS tracking." }
];
