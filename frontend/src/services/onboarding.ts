const ONBOARDING_STATE_KEY = 'dcmo_onboarding_state_v1';

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
    };
  } catch {
    return createInitialState();
  }
}

function setOnboardingState(state: OnboardingState) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ONBOARDING_STATE_KEY, JSON.stringify(state));
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

export function resetOnboardingState() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ONBOARDING_STATE_KEY);
}
