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

// ── Launch Readiness Types ─────────────────────────────────

export type PilotState = 'live' | 'setup_in_progress' | 'demo_only';
export type LaunchSetupState = 'ready' | 'setup_in_progress';
export type AnalyticsState = 'observable' | 'setup_in_progress';

export interface PublicLaunchStatus {
  pilot_state: PilotState;
  billing_state: LaunchSetupState;
  email_state: LaunchSetupState;
  analytics_state: AnalyticsState;
  headline: string;
  summary: string;
  cta_label: string;
}

export interface LaunchReadinessConnector {
  key: string;
  workspace_level: boolean;
  configured: boolean;
  ready_for_live: boolean;
  demo_fallback: boolean;
  authenticated: boolean;
  status: string;
  owner_scope?: string;
  auth_mode?: string;
  last_tested_at?: string | null;
  capability?: string;
  mode_label?: string;
}

export interface LaunchReadiness {
  status: string;
  ready: boolean;
  frontend_base_url: string;
  checks: Record<string, boolean>;
  smtp: {
    configured: boolean;
    host_configured?: boolean;
    port?: number | null;
    username_configured?: boolean;
    sender_email?: string | null;
    support_email?: string | null;
  };
  stripe: {
    ready: boolean;
    stripe_secret_configured?: boolean;
    stripe_webhook_secret_configured?: boolean;
    stripe_prices_configured?: boolean;
  };
  pilot_connectors: {
    connectors: LaunchReadinessConnector[];
    total: number;
    live_ready: number;
    demo_fallback: number;
  };
  growth: {
    status: string;
    posthog_configured?: boolean;
    recent_events_24h: number;
    last_event_at?: string | null;
    waitlist_leads_total?: number;
  };
  public_status: PublicLaunchStatus;
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
