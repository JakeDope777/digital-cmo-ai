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

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-100 px-4 py-12">
        <div className="mx-auto max-w-md rounded-2xl bg-white p-8 shadow-lg border border-slate-200">
          <h1 className="text-xl font-semibold text-slate-900">Reset password</h1>
          <p className="mt-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-800">
            This link is missing a reset token. Use the link from your email.
          </p>
          <p className="mt-4 text-sm text-slate-600">
            <Link to="/forgot-password" className="font-semibold text-orange-600 hover:text-orange-700">
              Request a new reset link →
            </Link>
          </p>
        </div>
      </div>
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
    <div className="min-h-screen bg-slate-100 px-4 py-12">
      <div className="mx-auto max-w-md rounded-2xl bg-white p-8 shadow-lg border border-slate-200">
        <h1 className="text-xl font-semibold text-slate-900">Reset password</h1>

        {!success ? (
          <form className="mt-5 space-y-4" onSubmit={submit}>
            <div>
              <label className="mb-1 block text-sm text-slate-700">New password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Min. 8 characters"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-700">Confirm password</label>
              <input
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="input-field"
              />
            </div>
            {message && (
              <p
                className={`rounded-lg px-3 py-2 text-sm ${
                  isError
                    ? 'bg-red-50 border border-red-200 text-red-800'
                    : 'bg-slate-50 text-slate-700'
                }`}
              >
                {message}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {loading ? 'Updating…' : 'Update password'}
            </button>
          </form>
        ) : (
          <p className="mt-4 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-800">
            {message}
          </p>
        )}

        {isError && message.includes('expired') && (
          <p className="mt-3 text-sm text-slate-600">
            <Link to="/forgot-password" className="font-semibold text-orange-600 hover:text-orange-700">
              Request a new reset link →
            </Link>
          </p>
        )}

        <p className="mt-4 text-sm text-slate-600">
          {success ? (
            <Link to="/login" className="font-semibold text-orange-600 hover:text-orange-700">
              Log in →
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
