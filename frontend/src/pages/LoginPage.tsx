import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { useAuth } from '../context/AuthContext';
import { Zap, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);

    try {
      await login(email.trim(), password);
      navigate('/app/dashboard');
    } catch (err) {
      if (isAxiosError(err)) {
        const detail = (err.response?.data as { detail?: string } | undefined)?.detail;
        if (detail) {
          setError(detail);
          return;
        }
      }
      setError('Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 font-sans"
      style={{ background: 'oklch(9% .008 255)' }}
    >
      {/* Background glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute left-1/2 top-0 h-96 w-[600px] -translate-x-1/2 rounded-full blur-3xl opacity-30"
          style={{ background: 'oklch(65% .16 253)' }}
        />
        <div
          className="absolute right-0 bottom-0 h-80 w-80 rounded-full blur-3xl opacity-10"
          style={{ background: 'oklch(65% .16 253)' }}
        />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg mb-4"
            style={{ background: 'oklch(65% .16 253)', boxShadow: '0 8px 32px oklch(65% .16 253 / 0.4)' }}
          >
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Digital CMO AI</h1>
          <p className="mt-1.5 text-sm text-slate-400">Your AI Chief Marketing Officer</p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl border border-white/[0.08] p-8 shadow-2xl"
          style={{ background: 'oklch(11% .008 255)' }}
        >
          <h2 className="text-xl font-bold text-white mb-1">Welcome back</h2>
          <p className="text-sm text-slate-400 mb-6">Sign in to your account</p>

          <form className="space-y-4" onSubmit={onSubmit}>
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-white placeholder:text-slate-500 transition-all outline-none"
                  style={{
                    background: 'oklch(9% .008 255)',
                    borderColor: 'oklch(100% 0 0 / 0.1)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'oklch(65% .16 253)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px oklch(65% .16 253 / 0.15)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'oklch(100% 0 0 / 0.1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  placeholder="you@company.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-slate-300">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium transition-colors"
                  style={{ color: 'oklch(65% .16 253)' }}
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm text-white placeholder:text-slate-500 transition-all outline-none"
                  style={{
                    background: 'oklch(9% .008 255)',
                    borderColor: 'oklch(100% 0 0 / 0.1)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'oklch(65% .16 253)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px oklch(65% .16 253 / 0.15)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'oklch(100% 0 0 / 0.1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60 mt-2"
              style={{
                background: 'linear-gradient(135deg, oklch(65% .16 253), oklch(55% .16 253))',
                boxShadow: '0 4px 24px oklch(65% .16 253 / 0.3)',
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.boxShadow = '0 6px 32px oklch(65% .16 253 / 0.45)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 24px oklch(65% .16 253 / 0.3)';
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.08]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 text-slate-500" style={{ background: 'oklch(11% .008 255)' }}>
                Or continue with
              </span>
            </div>
          </div>

          {/* Google OAuth (placeholder) */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl border border-white/[0.08] bg-white/5 hover:bg-white/10 text-sm font-medium text-slate-200 transition-all"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* Sign up link */}
          <p className="mt-6 text-center text-sm text-slate-400">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold transition-colors"
              style={{ color: 'oklch(65% .16 253)' }}
            >
              Start free →
            </Link>
          </p>
        </div>

        {/* Trust signals */}
        <p className="mt-6 text-center text-xs text-slate-600">
          🔒 SOC2 compliant · 256-bit encryption · 14-day free trial
        </p>
      </div>
    </div>
  );
}
