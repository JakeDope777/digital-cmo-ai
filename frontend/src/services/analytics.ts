import { growthService } from './api';
import { completeOnboardingStep, getOnboardingState, type OnboardingStep } from './onboarding';
import type { DomainId, ModuleId } from '../types/catalog';

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
    __utmCaptured?: boolean;
  }
}

export interface AnalyticsEventMap {
  landing_view: WithContext<{ source?: string }>;
  signup_started: WithContext<{ method?: 'email' }>;
  signup_completed: WithContext<{ method?: 'email' }>;
  verification_completed: WithContext<{ method?: 'token_link' }>;
  dashboard_viewed: WithContext<{ source?: 'app' }>;
  first_value_completed: WithContext<{ entrypoint?: 'chat' | 'analysis' | 'creative' }>;
  onboarding_completed: WithContext<{ source?: 'frontend' }>;
  login_completed: WithContext<{ method?: 'password' }>;
  chat_message_sent: WithContext<{ length: number }>;
  analysis_run: WithContext<{ analysis_type: string }>;
  creative_generated: WithContext<{ mode: string; tone?: string; demo?: boolean }>;
  billing_viewed: WithContext;
  checkout_started: WithContext<{ plan: string }>;
  checkout_completed: WithContext;
  waitlist_joined: WithContext<{ company?: string; industry?: string; source?: string }>;
  verification_email_resent: WithContext;
  profile_updated: WithContext;
  industry_page_view: WithContext<{ industry: string }>;
  demo_mode_enabled: WithContext<{ source: 'query' | 'manual' }>;
  demo_mode_disabled: WithContext;
  module_card_viewed: WithContext<{ module_id: ModuleId; location: 'landing' | 'investor_demo' | 'app' }>;
  module_card_clicked: WithContext<{ module_id: ModuleId; location: 'landing' | 'investor_demo' | 'app' }>;
  use_cases_view: WithContext<Record<string, never>>;
  white_paper_view: WithContext<Record<string, never>>;
  white_paper_download: WithContext<{ email: string }>;
}

export type AnalyticsEventName = keyof AnalyticsEventMap;
type EventContext = { domain?: DomainId; module_id?: ModuleId };
type WithContext<T extends Record<string, unknown> = Record<string, never>> = T & EventContext;

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;
const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
const POSTHOG_HOST = (import.meta.env.VITE_POSTHOG_HOST as string | undefined) || 'https://app.posthog.com';

const ONBOARDING_EVENT_BY_STEP: Record<OnboardingStep, AnalyticsEventName> = {
  landing_seen: 'landing_view',
  signup_started: 'signup_started',
  signup_completed: 'signup_completed',
  verification_completed: 'verification_completed',
  dashboard_viewed: 'dashboard_viewed',
  first_value_completed: 'first_value_completed',
};

export function initAnalytics() {
  captureUtmParams();
  if (GA_ID) loadGa(GA_ID);
  if (POSTHOG_KEY) loadPosthog(POSTHOG_KEY, POSTHOG_HOST);
}

export async function trackEvent<E extends AnalyticsEventName>(
  eventName: E,
  properties?: AnalyticsEventMap[E],
) {
  const merged = { ...getStoredUtm(), ...getOnboardingContext(), ...(properties ?? {}) };
  if (window.gtag && GA_ID) {
    window.gtag('event', eventName, merged);
  }
  try {
    await growthService.trackEvent(eventName, merged, 'web');
  } catch {
    // best-effort analytics should not break UX
  }
}

export async function trackOnboardingStep(
  step: OnboardingStep,
  properties?: AnalyticsEventMap[AnalyticsEventName],
) {
  const changed = completeOnboardingStep(step);
  if (!changed) return false;

  const eventName = ONBOARDING_EVENT_BY_STEP[step];
  await trackEvent(eventName, properties as AnalyticsEventMap[typeof eventName]);

  if (step === 'first_value_completed') {
    await trackEvent('onboarding_completed', { source: 'frontend' });
  }
  return true;
}

function getOnboardingContext(): EventContext {
  const state = getOnboardingState();
  return {
    domain: state.selected_domain,
    module_id: state.selected_module,
  };
}

function captureUtmParams() {
  if (window.__utmCaptured) return;
  const params = new URLSearchParams(window.location.search);
  const utmSource = params.get('utm_source');
  const utmMedium = params.get('utm_medium');
  const utmCampaign = params.get('utm_campaign');
  if (utmSource) localStorage.setItem('utm_source', utmSource);
  if (utmMedium) localStorage.setItem('utm_medium', utmMedium);
  if (utmCampaign) localStorage.setItem('utm_campaign', utmCampaign);
  window.__utmCaptured = true;
}

export function getStoredUtm() {
  return {
    utm_source: localStorage.getItem('utm_source') || undefined,
    utm_medium: localStorage.getItem('utm_medium') || undefined,
    utm_campaign: localStorage.getItem('utm_campaign') || undefined,
  };
}

function loadGa(measurementId: string) {
  if (document.getElementById('ga-script')) return;
  const script = document.createElement('script');
  script.async = true;
  script.id = 'ga-script';
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = (...args: unknown[]) => {
    window.dataLayer?.push(args as unknown as Record<string, unknown>);
  };
  window.gtag('js', new Date());
  window.gtag('config', measurementId);
}

function loadPosthog(apiKey: string, host: string) {
  if (document.getElementById('posthog-script')) return;
  const script = document.createElement('script');
  script.id = 'posthog-script';
  script.async = true;
  script.src = `${host.replace(/\/+$/, '')}/static/array.js`;
  document.head.appendChild(script);
  // Primary capture still routes via backend /growth/track for consistency.
  void apiKey;
}
