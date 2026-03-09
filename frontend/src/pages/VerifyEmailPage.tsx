import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../services/api';
import { trackEvent, trackOnboardingStep } from '../services/analytics';
import { useAuth } from '../context/AuthContext';

type VerifyStatus = 'idle' | 'loading' | 'success' | 'error' | 'expired' | 'already_used';

function statusBg(s: VerifyStatus) {
  if (s === 'success') return 'bg-emerald-50 text-emerald-800 border border-emerald-200';
  if (s === 'error' || s === 'expired' || s === 'already_used')
    return 'bg-red-50 text-red-800 border border-red-200';
  return 'bg-slate-50 text-slate-700';
}

// ── What's next cards shown on the pending screen ──
const NEXT_STEPS = [
  { icon: '📧', text: 'Check your inbox — the link arrives in under a minute.' },
  { icon: '📁', text: 'Can\'t find it? Check your spam or promotions folder.' },
  { icon: '🚀', text: 'Once verified, your AI CMO is ready — no setup needed.' },
];

export default function VerifyEmailPage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);
  const pending = useMemo(() => searchParams.get('pending') === '1', [searchParams]);
  const initialEmail = useMemo(() => user?.email || '', [user?.email]);
  const [status, setStatus] = useState<VerifyStatus>('idle');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState(initialEmail);
  const [sending, setSending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    setEmail(initialEmail);
  }, [initialEmail]);

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        if (pending) {
          setStatus('idle');
          return;
        }
        setStatus('error');
        setMessage('No verification token found. Use the link from your email.');
        return;
      }
      setStatus('loading');
      try {
        const response = await authService.verifyEmail(token);
        setStatus('success');
        setMessage(response.message || 'Your email is verified. You can now log in.');
        await trackOnboardingStep('verification_completed', { method: 'token_link' });
        // Auto-redirect to dashboard after short delay
        setTimeout(() => navigate('/app/dashboard'), 2000);
      } catch (err: unknown) {
        const detail =
          (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? '';
        if (detail.toLowerCase().includes('expired')) {
          setStatus('expired');
          setMessage('This verification link has expired. Request a new one below.');
        } else if (detail.toLowerCase().includes('already used') || detail.toLowerCase().includes('already verified')) {
          setStatus('already_used');
          setMessage('This link has already been used. Your email may already be verified — try logging in.');
        } else {
          setStatus('error');
          setMessage('The verification link is invalid. Request a new one below.');
        }
      }
    };
    void verify();
  }, [pending, token, navigate]);

  const resendVerification = async () => {
    setSending(true);
    setResendSuccess(false);
    try {
      await (isAuthenticated
        ? authService.sendVerification()
        : authService.sendVerification(email));
      setResendSuccess(true);
      await trackEvent('verification_email_resent');
    } catch {
      setMessage('Could not send a verification email right now. Try again shortly.');
    } finally {
      setSending(false);
    }
  };

  const showResend = !token || status === 'expired' || status === 'error' || status === 'already_used';

  // ── Pending state: shown right after signup ──
  if (pending && !token) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">

          {/* Logo */}
          <div className="mb-8 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 border border-white/15">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-sm font-bold text-white">Digital CMO AI</span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/4 p-8">
            {/* Big icon */}
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/15 border border-orange-500/25 text-3xl mb-5">
              📬
            </div>

            <h1 className="text-2xl font-bold text-white">Check your inbox</h1>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              We sent a verification link to{' '}
              <span className="text-white font-medium">{initialEmail || 'your email'}</span>.
              Click it to activate your account.
            </p>

            <ul className="mt-6 space-y-3">
              {NEXT_STEPS.map((s) => (
                <li key={s.text} className="flex items-start gap-3 text-sm text-slate-300">
                  <span className="text-base leading-none mt-0.5">{s.icon}</span>
                  {s.text}
                </li>
              ))}
            </ul>

            {resendSuccess ? (
              <p className="mt-6 rounded-xl bg-emerald-500/15 border border-emerald-500/25 px-4 py-3 text-sm text-emerald-300">
                New email sent — check your inbox.
              </p>
            ) : (
              <div className="mt-7 space-y-3">
                {!isAuthenticated && (
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-white/6 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-orange-500/60 focus:outline-none"
                    placeholder="your@email.com"
                  />
                )}
                <button
                  type="button"
                  onClick={() => void resendVerification()}
                  disabled={sending || (!isAuthenticated && !email)}
                  className="w-full rounded-xl border border-white/15 bg-white/8 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-white/12 disabled:opacity-50 transition-colors"
                >
                  {sending ? 'Sending…' : 'Resend verification email'}
                </button>
              </div>
            )}

            <p className="mt-6 text-xs text-slate-500 text-center">
              Link not arriving?{' '}
              <a href="mailto:hello@digitalcmo.ai" className="text-orange-400 hover:text-orange-300">
                Contact support
              </a>
              {' · '}
              <Link to="/login" className="text-orange-400 hover:text-orange-300">
                Back to login
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Token verification flow ──
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg border border-slate-200">

        {/* Logo */}
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-sm font-bold text-slate-900">Digital CMO AI</span>
        </div>

        <h1 className="text-xl font-semibold text-slate-900">
          {status === 'success' ? 'Email verified!' : 'Verify email'}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          {status === 'loading'
            ? 'Confirming your verification link…'
            : status === 'success'
            ? 'Your account is active. Redirecting you to the dashboard…'
            : 'Enter your email to receive a new verification link.'}
        </p>

        {status === 'success' && (
          <div className="mt-4 flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">
            <span className="text-xl">🎉</span>
            <p className="text-sm text-emerald-800 font-medium">{message}</p>
          </div>
        )}

        {status === 'loading' && (
          <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">Verifying…</p>
        )}

        {(status === 'error' || status === 'expired' || status === 'already_used') && (
          <p className={`mt-4 rounded-lg px-3 py-2 text-sm ${statusBg(status)}`}>{message}</p>
        )}

        {resendSuccess && (
          <p className="mt-3 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-800">
            Sent! Check your inbox (and spam folder).
          </p>
        )}

        {showResend && !resendSuccess && (
          <div className="mt-5 space-y-3">
            {!isAuthenticated && (
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="you@company.com"
                  required
                />
              </div>
            )}
            <button
              type="button"
              onClick={() => void resendVerification()}
              disabled={sending || (!isAuthenticated && !email)}
              className="inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {sending ? 'Sending…' : 'Resend verification email'}
            </button>
          </div>
        )}

        <p className="mt-5 text-sm text-slate-600">
          {status === 'success' ? (
            <Link to="/app/dashboard" className="font-semibold text-orange-600 hover:text-orange-700">
              Go to dashboard →
            </Link>
          ) : (
            <>
              Back to{' '}
              <Link to="/login" className="font-semibold text-orange-600 hover:text-orange-700">
                login
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
