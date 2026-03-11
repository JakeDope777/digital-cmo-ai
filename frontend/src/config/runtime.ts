const configuredApiUrl = (import.meta.env.VITE_API_URL || '').trim();

export const API_BASE_URL = configuredApiUrl || (import.meta.env.DEV ? 'http://localhost:8000' : '');

export function assertApiBaseConfigured() {
  if (!API_BASE_URL) {
    throw new Error('VITE_API_URL is not configured for this deployment.');
  }
}
