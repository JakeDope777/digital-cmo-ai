import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authService } from '../services/api';
import { trackEvent } from '../services/analytics';
import { useAuth } from '../context/AuthContext';

type VerifyStatus = 'idle' | 'loading' | 'success' | 'error' | 'expired' | 'already_used';

function statusBg(s: VerifyStatus) {
  if (s === 'success') return 'bg-emerald-50 text-emerald-800 border border-emerald-200';
  if (s === 'error' || s === 'expired' || s === 'already_used')
    return 'bg-red-50 text-red-800 border border-red-200';
  return 'bg-slate-50 text-slate-700';
}

export default function VerifyEmailPage() {
  const { isAuthenticated, user } = useAuth();
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
          setMessage('Check your inbox — we sent you a verification email.');
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
        await trackEvent('verification_completed');
      } catch (err: unknown) {
        const detail =
          (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? '';
        if (detail.toLowerCase().includes('expired')) {
          setStatus('expired');
          setMessage('This verification link has expired. Request a new one below.');
        } else if (detail.toLowerCase().includes('already used') || detail.toLowerCase().includes('already verified')) {
          setStatus('already_used');
          setMessage('This link has already been used. Your email may already be verified.');
        } else {
          setStatus('error');
          setMessage('The verification link is invalid. Request a new one below.');
        }
      }
    };
    void verify();
  }, [pending, token]);

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

  const showResend =
    !token || status === 'expired' || status === 'error' || status === 'already_used';

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-12">
      <div className="mx-auto max-w-md rounded-2xl bg-white p-8 shadow-lg border border-slate-200">
        <h1 className="text-xl font-semibold text-slate-900">Verify email</h1>
        <p className="mt-2 text-sm text-slate-600">
          {token && status === 'loading'
            ? 'Confirming your verification link…'
            : token && status === 'success'
            ? 'Your email address is now confirmed.'
            : 'Enter your email to receive a new verification link.'}
        </p>

        {(status !== 'idle' || message) && status !== 'loading' && (
          <p className={`mt-4 rounded-lg px-3 py-2 text-sm ${statusBg(status)}`}>
            {message}
          </p>
        )}
        {status === 'loading' && (
          <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
            Verifying…
          </p>
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
            <>
              <Link to="/login" className="font-semibold text-orange-600 hover:text-orange-700">
                Log in to your account →
              </Link>
            </>
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
