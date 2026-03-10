import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { trackEvent } from '../services/analytics';
import { resolveDomainId } from '../data/domainModuleCatalog';
import { setSelectedDomain } from '../services/onboarding';
import type { DomainId } from '../types/catalog';

const DEMO_MODE_KEY = 'demo_mode';
const DEMO_MODE_STATE_KEY = 'dcmo_demo_mode_state_v1';

export interface DemoModeState {
  enabled: boolean;
  source: 'query' | 'manual' | 'stored' | null;
  domain?: DomainId;
  enabled_at?: string;
}

interface DemoModeContextValue {
  demoMode: DemoModeState;
  isDemoMode: boolean;
  enableDemoMode: (source?: 'query' | 'manual', domain?: DomainId) => void;
  disableDemoMode: () => void;
}

const DemoModeContext = createContext<DemoModeContextValue | null>(null);

function readStoredState(): DemoModeState {
  if (typeof window === 'undefined') {
    return { enabled: false, source: null };
  }

  // Check URL param synchronously so ProtectedRoute sees demo mode on first render
  const search = new URLSearchParams(window.location.search);
  const queryDomain = resolveDomainId(search.get('domain'));
  if (search.get('demo') === '1') {
    const state: DemoModeState = {
      enabled: true,
      source: 'query',
      domain: queryDomain,
      enabled_at: new Date().toISOString(),
    };
    persistState(state);
    return state;
  }

  try {
    const raw = localStorage.getItem(DEMO_MODE_STATE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DemoModeState;
      if (parsed && typeof parsed.enabled === 'boolean') {
        return {
          enabled: parsed.enabled,
          source: parsed.source ?? null,
          domain: resolveDomainId(parsed.domain),
          enabled_at: parsed.enabled_at,
        };
      }
    }
  } catch {
    // ignore malformed local state and rebuild below
  }

  return localStorage.getItem(DEMO_MODE_KEY) === '1'
    ? { enabled: true, source: 'stored', domain: queryDomain }
    : { enabled: false, source: null };
}

function persistState(state: DemoModeState) {
  if (typeof window === 'undefined') return;
  if (state.enabled) localStorage.setItem(DEMO_MODE_KEY, '1');
  else localStorage.removeItem(DEMO_MODE_KEY);
  localStorage.setItem(DEMO_MODE_STATE_KEY, JSON.stringify(state));
}

export function DemoModeProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [demoMode, setDemoMode] = useState<DemoModeState>(() => readStoredState());

  const enableDemoMode = useCallback((source: 'query' | 'manual' = 'manual', domain?: DomainId) => {
    setDemoMode((prev) => {
      if (prev.enabled && prev.source === source && prev.domain === domain) return prev;
      const next: DemoModeState = {
        enabled: true,
        source,
        domain: domain ?? prev.domain,
        enabled_at: prev.enabled_at ?? new Date().toISOString(),
      };
      persistState(next);
      if (next.domain) {
        setSelectedDomain(next.domain);
      }
      void trackEvent('demo_mode_enabled', { source, domain: next.domain });
      return next;
    });
  }, []);

  const disableDemoMode = useCallback(() => {
    setDemoMode((prev) => {
      if (!prev.enabled) return prev;
      const next: DemoModeState = { enabled: false, source: null, domain: prev.domain };
      persistState(next);
      void trackEvent('demo_mode_disabled');
      return next;
    });
  }, []);

  useEffect(() => {
    const search = new URLSearchParams(location.search);
    if (search.get('demo') === '1') {
      const domain = resolveDomainId(search.get('domain'));
      if (domain) {
        setSelectedDomain(domain);
      }
      enableDemoMode('query', domain);
    }
  }, [location.search, enableDemoMode]);

  useEffect(() => {
    if (demoMode.domain) {
      setSelectedDomain(demoMode.domain);
    }
  }, [demoMode.domain]);

  const value = useMemo<DemoModeContextValue>(
    () => ({
      demoMode,
      isDemoMode: demoMode.enabled,
      enableDemoMode,
      disableDemoMode,
    }),
    [demoMode, enableDemoMode, disableDemoMode],
  );

  return <DemoModeContext.Provider value={value}>{children}</DemoModeContext.Provider>;
}

export function useDemoMode() {
  const context = useContext(DemoModeContext);
  if (!context) {
    throw new Error('useDemoMode must be used inside DemoModeProvider.');
  }
  return context;
}
