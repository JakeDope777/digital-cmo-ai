import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { useAuth } from '../context/AuthContext';
import { resolveDomainId, withDomainQuery } from '../data/domainModuleCatalog';
import { trackOnboardingStep } from '../services/analytics';
import { setSelectedDomain } from '../services/onboarding';

const BENEFITS = [
  'AI chat, analysis & creative studio — free to start',
  'Realistic demo data — no integrations needed on day one',
  'No credit card required · Cancel anytime',
];

const SOCIAL_PROOF = [
  { initial: 'S', name: 'Sarah K.', role: 'Head of Growth · B2B SaaS', quote: 'Replaced our agency retainer in week one.' },
  { initial: 'M', name: 'Marcus T.', role: 'Founder · D2C Brand', quote: 'Reports that took 6 hours now take 20 minutes.' },
];

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signup } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
      navigate(withDomainQuery('/verify-email?pending=1', selectedDomain));
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
    <div className="min-h-screen bg-black text-white">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-20 top-0 h-80 w-80 rounded-full bg-orange-500/8 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-80 w-80 rounded-full bg-orange-500/4 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen flex-col lg:flex-row">
        {/* ── Left panel — value prop ── */}
        <div className="flex flex-col justify-between border-b border-white/8 px-8 py-10 lg:w-[44%] lg:border-b-0 lg:border-r lg:px-12 lg:py-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 shadow-lg shadow-orange-500/20">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-sm font-bold text-white">Digital CMO AI</span>
          </Link>

          <div className="mt-10 lg:mt-0">
            <h2 className="text-4xl font-extrabold tracking-tight leading-[1.1] lg:text-5xl">
              Your AI CMO<br />
              <span className="text-orange-500">starts today.</span>
            </h2>
            <p className="mt-5 text-base leading-relaxed text-white/60">
              Strategy, execution, and reporting — through a single conversational interface. Replace agency retainers with AI that knows your brand.
            </p>

            <ul className="mt-8 space-y-3">
              {BENEFITS.map((b) => (
                <li key={b} className="flex items-center gap-3 text-sm text-white/70">
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-orange-500/20">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
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
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#222222] text-xs font-bold text-white">
                    {p.initial}
                  </div>
                  <div>
                    <p className="text-xs italic text-white/60">"{p.quote}"</p>
                    <p className="mt-1 text-[10px] text-white/30">{p.name} · {p.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-10 text-xs text-white/20 lg:mt-0">Trusted by 80+ growth teams · SOC 2 roadmap Q3 2026</p>
        </div>

        {/* ── Right panel — form ── */}
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <h1 className="text-2xl font-extrabold text-white">Create your free account</h1>
            <p className="mt-1.5 text-sm text-white/50">No credit card · Start with demo data · Upgrade anytime</p>

            <form className="mt-7 space-y-4" onSubmit={onSubmit}>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-white/70">Work email</label>
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
                <label className="mb-1.5 block text-sm font-medium text-white/70">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-white/70">Confirm password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  placeholder="Repeat password"
                  autoComplete="new-password"
                  required
                />
              </div>

              {error && (
                <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-black hover:bg-orange-400 disabled:opacity-60 transition-colors shadow-lg shadow-orange-500/20"
              >
                {loading ? <><Spinner /> Creating account…</> : 'Create free account →'}
              </button>
            </form>

            <p className="mt-5 text-center text-xs text-white/30">
              By creating an account you agree to our{' '}
              <a href="#" className="underline hover:text-white/60">Terms</a>
              {' '}and{' '}
              <a href="#" className="underline hover:text-white/60">Privacy Policy</a>.
            </p>

            <div className="mt-5 text-center">
              <span className="text-sm text-white/50">Already have an account? </span>
              <Link to={withDomainQuery('/login', selectedDomain)} className="text-sm font-semibold text-orange-500 hover:text-orange-400 transition-colors">Sign in</Link>
            </div>

            <div className="mt-8 flex items-center justify-center gap-5 border-t border-white/8 pt-6 text-xs text-white/30">
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
    </div>
  );
}
