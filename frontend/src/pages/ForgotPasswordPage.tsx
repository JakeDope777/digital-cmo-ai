import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setMessage('');
    setIsError(false);
    try {
      const response = await authService.forgotPassword(email.trim());
      setMessage(response.message);
    } catch {
      setIsError(true);
      setMessage('Unable to send reset email right now.');
    } finally {
      setLoading(false);
    }
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
          <h1 className="text-2xl font-extrabold text-white">Forgot password</h1>
          <p className="mt-1.5 text-sm text-white/50">We'll send reset instructions to your email.</p>

          <form className="mt-7 space-y-4" onSubmit={submit}>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/70">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="you@company.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-black hover:bg-orange-400 disabled:opacity-60 transition-colors"
            >
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
          </form>

          {message && (
            <p className={`mt-4 rounded-lg px-3 py-2 text-sm ${isError ? 'border border-red-500/20 bg-red-500/10 text-red-400' : 'border border-white/10 bg-white/5 text-white/70'}`}>
              {message}
            </p>
          )}

          <p className="mt-5 text-sm text-white/50">
            Back to{' '}
            <Link to="/login" className="font-semibold text-orange-500 hover:text-orange-400 transition-colors">
              sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
