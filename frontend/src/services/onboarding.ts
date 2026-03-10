import { isDomainId, isModuleId } from '../data/domainModuleCatalog';
import type { DomainId, ModuleId } from '../types/catalog';

const ONBOARDING_STATE_KEY = 'dcmo_onboarding_state_v1';
const ONBOARDING_STATE_EVENT = 'dcmo:onboarding-state-updated';

export type OnboardingStep =
  | 'landing_seen'
  | 'signup_started'
  | 'signup_completed'
  | 'verification_completed'
  | 'dashboard_viewed'
  | 'first_value_completed';

export interface OnboardingState {
  completed_steps: OnboardingStep[];
  timestamps: Partial<Record<OnboardingStep, string>>;
  first_seen_at: string;
  updated_at: string;
  selected_domain?: DomainId;
  selected_module?: ModuleId;
}

function createInitialState(): OnboardingState {
  const now = new Date().toISOString();
  return {
    completed_steps: [],
    timestamps: {},
    first_seen_at: now,
    updated_at: now,
  };
}

export function getOnboardingState(): OnboardingState {
  if (typeof window === 'undefined') return createInitialState();

  try {
    const raw = localStorage.getItem(ONBOARDING_STATE_KEY);
    if (!raw) return createInitialState();

    const parsed = JSON.parse(raw) as Partial<OnboardingState>;
    const completed = Array.isArray(parsed.completed_steps)
      ? parsed.completed_steps.filter(Boolean)
      : [];
    const now = new Date().toISOString();

    return {
      completed_steps: completed as OnboardingStep[],
      timestamps: parsed.timestamps ?? {},
      first_seen_at: parsed.first_seen_at ?? now,
      updated_at: parsed.updated_at ?? now,
      selected_domain: isDomainId(parsed.selected_domain) ? parsed.selected_domain : undefined,
      selected_module: isModuleId(parsed.selected_module) ? parsed.selected_module : undefined,
    };
  } catch {
    return createInitialState();
  }
}

function setOnboardingState(state: OnboardingState) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ONBOARDING_STATE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event(ONBOARDING_STATE_EVENT));
}

export function hasCompletedOnboardingStep(step: OnboardingStep): boolean {
  return getOnboardingState().completed_steps.includes(step);
}

export function completeOnboardingStep(step: OnboardingStep): boolean {
  const state = getOnboardingState();
  if (state.completed_steps.includes(step)) return false;

  const now = new Date().toISOString();
  const next: OnboardingState = {
    ...state,
    completed_steps: [...state.completed_steps, step],
    timestamps: {
      ...state.timestamps,
      [step]: now,
    },
    updated_at: now,
  };
  setOnboardingState(next);
  return true;
}

export function setSelectedDomain(domain?: DomainId): boolean {
  const state = getOnboardingState();
  if (state.selected_domain === domain) return false;
  const next: OnboardingState = {
    ...state,
    selected_domain: domain,
    updated_at: new Date().toISOString(),
  };
  setOnboardingState(next);
  return true;
}

export function setSelectedModule(moduleId?: ModuleId): boolean {
  const state = getOnboardingState();
  if (state.selected_module === moduleId) return false;
  const next: OnboardingState = {
    ...state,
    selected_module: moduleId,
    updated_at: new Date().toISOString(),
  };
  setOnboardingState(next);
  return true;
}

export function subscribeOnboardingState(listener: () => void) {
  if (typeof window === 'undefined') return () => undefined;
  window.addEventListener(ONBOARDING_STATE_EVENT, listener);
  return () => window.removeEventListener(ONBOARDING_STATE_EVENT, listener);
}

export function resetOnboardingState() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ONBOARDING_STATE_KEY);
  window.dispatchEvent(new Event(ONBOARDING_STATE_EVENT));
}
