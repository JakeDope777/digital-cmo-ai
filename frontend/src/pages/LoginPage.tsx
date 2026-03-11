import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { useAuth } from '../context/AuthContext';
import { resolveDomainId, withDomainQuery } from '../data/domainModuleCatalog';
import { trackEvent } from '../services/analytics';
import { setSelectedDomain } from '../services/onboarding';
import LaunchReadinessPanel from '../components/common/LaunchReadinessPanel';

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const selectedDomain = resolveDomainId(new URLSearchParams(location.search).get('domain'));

  useEffect(() => {
    if (selectedDomain) {
      setSelectedDomain(selectedDomain);
    }
  }, [selectedDomain]);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);

    try {
      await login(email.trim(), password);
      await trackEvent('login_completed', { method: 'password' });
      navigate(withDomainQuery('/app/dashboard', selectedDomain));
    } catch (err) {
      if (isAxiosError(err)) {
        const detail = (err.response?.data as { detail?: string } | undefined)?.detail;
        if (detail) {
          setError(detail);
          return;
        }
      }
      setError('Login failed. Please check your credentials or try again in a minute.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-80 w-96 -translate-x-1/2 rounded-full bg-orange-500/6 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <Link to="/" className="mb-10 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 shadow-lg shadow-orange-500/20">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-sm font-bold text-white">Digital CMO AI</span>
        </Link>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-[#111111] p-8">
          <h1 className="text-2xl font-extrabold text-white">Welcome back</h1>
          <p className="mt-1.5 text-sm text-white/50">Sign in to your AI Chief Marketing Officer.</p>

          <LaunchReadinessPanel
            title="Pilot launch status"
            tone="dark"
            variant="compact"
            className="mt-6"
          />

          <form className="mt-7 space-y-4" onSubmit={onSubmit}>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/70">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="you@company.com"
                autoComplete="email"
                required
              />
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-sm font-medium text-white/70">Password</label>
                <Link to={withDomainQuery('/forgot-password', selectedDomain)} className="text-xs font-medium text-orange-500 hover:text-orange-400 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                {error}
                {error.toLowerCase().includes('verif') && (
                  <span className="block mt-1">
                    <Link to={withDomainQuery('/verify-email', selectedDomain)} className="font-semibold underline hover:text-red-300">Resend verification email →</Link>
                  </span>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-black hover:bg-orange-400 disabled:opacity-60 transition-colors"
            >
              {loading ? <><Spinner /> Signing in…</> : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-white/50">
            Don't have an account?{' '}
            <Link to={withDomainQuery('/register', selectedDomain)} className="font-semibold text-orange-500 hover:text-orange-400 transition-colors">
              Start for free →
            </Link>
          </p>
          <p className="mt-3 text-center">
            <Link to={withDomainQuery('/verify-email', selectedDomain)} className="text-xs text-white/30 hover:text-white/60 underline transition-colors">
              Resend verification email
            </Link>
          </p>
        </div>

        {/* Demo option */}
        <p className="mt-6 text-center text-sm text-white/30">
          Not ready to sign in?{' '}
          <Link to={withDomainQuery('/demo', selectedDomain)} className="text-white/60 hover:text-white underline transition-colors">
            Try the demo first
          </Link>
        </p>
      </div>
    </div>
  );
}
