const configuredApiUrl = (import.meta.env.VITE_API_URL || '').trim();
const configuredAppUrl = (import.meta.env.VITE_APP_URL || '').trim();
const configuredSupportEmail = (import.meta.env.VITE_SUPPORT_EMAIL || '').trim();

export const API_BASE_URL = configuredApiUrl || (import.meta.env.DEV ? 'http://localhost:8000' : '');
export const APP_BASE_URL = configuredAppUrl || (typeof window !== 'undefined' ? window.location.origin : '');
export const SUPPORT_EMAIL = configuredSupportEmail || 'hello@digitalcmo.ai';

export function assertApiBaseConfigured() {
  if (!API_BASE_URL) {
    throw new Error('VITE_API_URL is not configured for this deployment.');
  }
}

export function assertAppBaseConfigured() {
  if (!APP_BASE_URL) {
    throw new Error('VITE_APP_URL is not configured for this deployment.');
  }
}
