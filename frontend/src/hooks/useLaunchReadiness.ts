import { useEffect, useState } from 'react';
import type { LaunchReadiness, PublicLaunchStatus } from '../types';
import { healthService } from '../services/api';

const CACHE_TTL_MS = 30_000;

export const FALLBACK_PUBLIC_LAUNCH_STATUS: PublicLaunchStatus = {
  pilot_state: 'setup_in_progress',
  billing_state: 'setup_in_progress',
  email_state: 'setup_in_progress',
  analytics_state: 'observable',
  headline: 'Managed live pilot connectors are rolling out',
  summary:
    'HubSpot, GA4, and Stripe are being enabled through managed workspace setup. Demo fallback is available immediately while the live pilot finishes configuration.',
  cta_label: 'Start with demo mode',
};

let launchReadinessCache: LaunchReadiness | null = null;
let launchReadinessFetchedAt = 0;
let launchReadinessRequest: Promise<LaunchReadiness> | null = null;

function cacheFresh() {
  return (
    launchReadinessCache !== null &&
    Date.now() - launchReadinessFetchedAt < CACHE_TTL_MS
  );
}

async function fetchLaunchReadiness(force = false) {
  if (!force && cacheFresh()) {
    return launchReadinessCache as LaunchReadiness;
  }
  if (!launchReadinessRequest) {
    launchReadinessRequest = healthService
      .getLaunchReadiness()
      .then((data) => {
        launchReadinessCache = data;
        launchReadinessFetchedAt = Date.now();
        return data;
      })
      .finally(() => {
        launchReadinessRequest = null;
      });
  }
  return launchReadinessRequest;
}

export function useLaunchReadiness() {
  const [readiness, setReadiness] = useState<LaunchReadiness | null>(() =>
    cacheFresh() ? launchReadinessCache : null,
  );
  const [loading, setLoading] = useState(() => !cacheFresh());
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;

    if (cacheFresh()) {
      setReadiness(launchReadinessCache);
      setLoading(false);
      return () => {
        active = false;
      };
    }

    setLoading(true);
    void fetchLaunchReadiness()
      .then((data) => {
        if (!active) return;
        setReadiness(data);
        setError(null);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(err instanceof Error ? err : new Error('Unable to load launch readiness.'));
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return {
    readiness,
    publicStatus: readiness?.public_status ?? FALLBACK_PUBLIC_LAUNCH_STATUS,
    loading,
    error,
  };
}

