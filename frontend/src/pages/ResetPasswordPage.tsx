import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authService } from '../services/api';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const cardContent = () => {
    if (!token) {
      return (
        <>
          <h1 className="text-2xl font-extrabold text-white">Reset password</h1>
          <p className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            This link is missing a reset token. Use the link from your email.
          </p>
          <p className="mt-4 text-sm text-white/50">
            <Link to="/forgot-password" className="font-semibold text-orange-500 hover:text-orange-400 transition-colors">
              Request a new reset link →
            </Link>
          </p>
        </>
      );
    }

    const submit = async (event: React.FormEvent) => {
      event.preventDefault();
      if (loading) return;
      if (password.length < 8) {
        setIsError(true);
        setMessage('Password must be at least 8 characters.');
        return;
      }
      if (password !== confirm) {
        setIsError(true);
        setMessage('Passwords do not match.');
        return;
      }
      setLoading(true);
      setMessage('');
      setIsError(false);
      try {
        const response = await authService.resetPassword(token, password);
        setSuccess(true);
        setMessage(response.message || 'Password updated. You can now log in.');
      } catch (err: unknown) {
        setIsError(true);
        const detail =
          (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? '';
        if (detail.toLowerCase().includes('expired')) {
          setMessage('This reset link has expired. Please request a new one.');
        } else if (detail.toLowerCase().includes('invalid')) {
          setMessage('This reset link is invalid. Please request a new one.');
        } else {
          setMessage('Could not reset password. The link may have already been used or expired.');
        }
      } finally {
        setLoading(false);
      }
    };

    return (
      <>
        <h1 className="text-2xl font-extrabold text-white">Reset password</h1>

        {!success ? (
          <form className="mt-7 space-y-4" onSubmit={submit}>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/70">New password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="Min. 8 characters"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/70">Confirm password</label>
              <input
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="Repeat password"
              />
            </div>
            {message && (
              <p className={`rounded-lg px-3 py-2 text-sm ${isError ? 'border border-red-500/20 bg-red-500/10 text-red-400' : 'border border-white/10 bg-white/5 text-white/70'}`}>
                {message}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-black hover:bg-orange-400 disabled:opacity-60 transition-colors"
            >
              {loading ? 'Updating…' : 'Update password'}
            </button>
          </form>
        ) : (
          <p className="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
            {message}
          </p>
        )}

        {isError && message.includes('expired') && (
          <p className="mt-3 text-sm text-white/50">
            <Link to="/forgot-password" className="font-semibold text-orange-500 hover:text-orange-400 transition-colors">
              Request a new reset link →
            </Link>
          </p>
        )}

        <p className="mt-4 text-sm text-white/50">
          {success ? (
            <Link to="/login" className="font-semibold text-orange-500 hover:text-orange-400 transition-colors">
              Sign in →
            </Link>
          ) : (
            <>Back to{' '}
              <Link to="/login" className="font-semibold text-orange-500 hover:text-orange-400 transition-colors">
                sign in
              </Link>
            </>
          )}
        </p>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-80 w-96 -translate-x-1/2 rounded-full bg-orange-500/6 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        <Link to="/" className="mb-10 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 shadow-lg shadow-orange-500/20">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-sm font-bold text-white">Digital CMO AI</span>
        </Link>
        <div className="rounded-2xl border border-white/10 bg-[#111111] p-8">
          {cardContent()}
        </div>
      </div>
    </div>
  );
}
