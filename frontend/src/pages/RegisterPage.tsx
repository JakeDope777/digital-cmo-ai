import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { useAuth } from '../context/AuthContext';
import { trackOnboardingStep } from '../services/analytics';

const BENEFITS = [
  'AI chat, analysis & creative studio — free',
  'Realistic demo data — no integrations needed to start',
  'No credit card required',
];

const SOCIAL_PROOF = [
  { initial: 'S', name: 'Sarah K.', role: 'Head of Growth · B2B SaaS', quote: 'Replaced our agency retainer in week one.' },
  { initial: 'M', name: 'Marcus T.', role: 'Founder · D2C Brand', quote: 'Reports that took 6 hours now take 20 minutes.' },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loading) return;
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    await trackOnboardingStep('signup_started', { method: 'email' });
    setLoading(true);
    try {
      await signup(email.trim(), password);
      await trackOnboardingStep('signup_completed', { method: 'email' });
      navigate('/verify-email?pending=1');
    } catch (err) {
      if (isAxiosError(err)) {
        const detail = (err.response?.data as { detail?: string } | undefined)?.detail;
        if (detail) {
          setError(detail);
          return;
        }
      }
      setError('Signup failed. This email may already have an account, or the service is temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* ── Left panel — value prop (desktop only) ── */}
      <div className="hidden lg:flex lg:w-[46%] flex-col justify-between p-12 bg-slate-950 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 top-10 h-80 w-80 rounded-full bg-orange-500/15 blur-3xl" />
          <div className="absolute right-0 bottom-0 h-60 w-60 rounded-full bg-violet-600/10 blur-3xl" />
        </div>

        <div className="relative flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 border border-white/15">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-sm font-bold text-white">Digital CMO AI</span>
        </div>

        <div className="relative">
          <h2 className="text-4xl font-extrabold tracking-tight text-white leading-[1.1]">
            Your AI CMO<br />
            <span className="bg-gradient-to-r from-orange-400 to-rose-400 bg-clip-text text-transparent">starts today.</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-400">
            Strategy, execution, and reporting — through a single conversational interface. Replace agency retainers with AI that knows your brand.
          </p>

          <ul className="mt-8 space-y-3">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-center gap-3 text-sm text-slate-300">
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-orange-500/20 text-orange-400">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                {b}
              </li>
            ))}
          </ul>

          <div className="mt-10 space-y-3">
            {SOCIAL_PROOF.map((p) => (
              <div key={p.name} className="flex items-start gap-3 rounded-xl border border-white/8 bg-white/4 p-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-700 text-xs font-bold text-white">
                  {p.initial}
                </div>
                <div>
                  <p className="text-xs italic text-slate-300">"{p.quote}"</p>
                  <p className="mt-1 text-[10px] text-slate-500">{p.name} · {p.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-slate-600">Trusted by 80+ growth teams · SOC 2 roadmap Q3 2026</p>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-sm font-bold text-slate-900">Digital CMO AI</span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900">Create your free account</h1>
          <p className="mt-1 text-sm text-slate-500">No credit card · Start with demo data · Upgrade anytime</p>

          <form className="mt-7 space-y-4" onSubmit={onSubmit}>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Work email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@company.com"
                autoComplete="email"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="At least 8 characters"
                autoComplete="new-password"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Confirm password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field"
                placeholder="Repeat password"
                autoComplete="new-password"
                required
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200 hover:bg-orange-600 disabled:opacity-60 transition-colors"
            >
              {loading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account…
                </>
              ) : (
                'Create free account →'
              )}
            </button>
          </form>

          <p className="mt-5 text-xs text-center text-slate-400">
            By creating an account you agree to our{' '}
            <a href="#" className="underline hover:text-slate-600">Terms</a>
            {' '}and{' '}
            <a href="#" className="underline hover:text-slate-600">Privacy Policy</a>.
          </p>

          <div className="mt-5 text-center">
            <span className="text-sm text-slate-600">Already have an account? </span>
            <Link to="/login" className="text-sm font-semibold text-orange-600 hover:text-orange-700">Sign in</Link>
          </div>

          <div className="mt-8 flex items-center justify-center gap-5 border-t border-slate-100 pt-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Encrypted at rest
            </span>
            <span className="flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              GDPR compliant
            </span>
            <span className="flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Live in &lt; 2 min
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
