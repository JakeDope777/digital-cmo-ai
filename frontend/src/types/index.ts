// ── Chat Types ──────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  module_used?: string;
  tokens_used?: number;
}

export interface ChatRequest {
  message: string;
  conversation_id?: string;
  context?: Record<string, unknown>;
}

export interface ChatResponse {
  reply: string;
  conversation_id: string;
  module_used?: string;
  tokens_used?: number;
}

// ── Auth Types ──────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  role: string;
  created_at?: string;
  full_name?: string | null;
  company?: string | null;
  timezone?: string | null;
  is_email_verified?: boolean;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

// ── Dashboard Types ─────────────────────────────────────────

export interface DashboardMetrics {
  total_leads: number;
  new_leads_period: number;
  total_spend: number;
  conversions: number;
  conversion_rate: number;
  cac: number;
  ltv: number;
  roas: number;
  ctr: number;
  impressions: number;
  clicks: number;
  email_open_rate: number;
  email_click_rate: number;
}

export interface ChartData {
  id: string;
  type: 'line' | 'bar' | 'funnel';
  title: string;
  data: {
    x?: string[];
    y?: number[];
    labels?: string[];
    values?: number[];
  };
  layout?: Record<string, string>;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  charts: ChartData[];
}

// ── Analysis Types ──────────────────────────────────────────

export interface AnalysisResponse {
  insights?: Array<Record<string, unknown>>;
  analysis?: Record<string, unknown>;
  personas?: Array<Record<string, unknown>>;
  sources?: string[];
}

// ── Creative Types ──────────────────────────────────────────

export interface CreativeResponse {
  content?: string;
  alternatives?: string[];
  image_url?: string;
  schedule?: Array<Record<string, unknown>>;
}

// ── CRM Types ───────────────────────────────────────────────

export interface Lead {
  id: string;
  name?: string;
  email?: string;
  status?: string;
  created_at?: string;
}

export interface Campaign {
  id: string;
  name: string;
  channel: string;
  status: string;
  created_at?: string;
}

// ── Navigation ──────────────────────────────────────────────

export interface NavItem {
  label: string;
  path: string;
  icon: string;
}

// ── Restaurant Ops Types ────────────────────────────────────

export interface RestaurantIngestResponse {
  status: string;
  venue_id?: string;
  rows_ingested?: number;
  recipes_upserted?: number;
  date_range?: { from?: string; to?: string };
  totals?: Record<string, number>;
}

export interface RestaurantControlTowerResponse {
  date: string;
  venue_id: string;
  kpis: {
    revenue: number;
    forecast_revenue: number;
    revenue_vs_forecast_pct: number;
    covers: number;
    avg_check: number;
    labor_cost: number;
    labor_cost_pct: number;
    food_cost: number;
    food_cost_pct: number;
    review_sentiment: number;
  };
  anomalies: Array<{
    category: string;
    severity: string;
    title: string;
    why: string;
    metric: number;
  }>;
  stock_alerts: Array<{
    category: string;
    severity: string;
    title: string;
    why: string;
    metric: number;
    next_action: string;
  }>;
}

export interface RestaurantMarginItem {
  menu_item: string;
  quantity: number;
  revenue: number;
  estimated_cogs: number;
  gross_margin: number;
  margin_pct: number;
}

export interface RestaurantFinanceMarginResponse {
  date_range: { from: string; to: string };
  venue_id: string;
  summary: {
    revenue: number;
    estimated_cogs: number;
    gross_margin: number;
    gross_margin_pct: number;
    break_even_revenue: number;
    break_even_progress_pct: number;
  };
  items: RestaurantMarginItem[];
  channel_sales: Array<{ channel: string; revenue: number }>;
}

export interface RestaurantInventoryAlertsResponse {
  date: string;
  venue_id: string;
  alerts: Array<{
    category: string;
    severity: string;
    title: string;
    why: string;
    metric: number;
    next_action: string;
  }>;
  summary: {
    alert_count: number;
    estimated_waste_qty: number;
    estimated_waste_cost: number;
  };
}

export interface RestaurantRecommendationsResponse {
  date: string;
  venue_id: string;
  recommendations: Array<{
    category: string;
    title: string;
    warning: string;
    why: string;
    next_action: string;
    automatable: boolean;
  }>;
  kpi_snapshot: Record<string, number>;
}
