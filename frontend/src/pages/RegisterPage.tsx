import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { useAuth } from '../context/AuthContext';
import { Zap, Mail, Lock, User, Building2, Eye, EyeOff, Loader2, Check } from 'lucide-react';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 'Free',
    desc: 'Perfect to get started',
    features: ['3 AI agents', 'Basic analytics', '5 campaigns/mo'],
  },
  {
    id: 'growth',
    name: 'Growth',
    price: '$49/mo',
    desc: 'For growing teams',
    features: ['10 AI agents', 'Advanced analytics', 'Unlimited campaigns'],
    popular: true,
  },
  {
    id: 'scale',
    name: 'Scale',
    price: '$149/mo',
    desc: 'Enterprise power',
    features: ['Unlimited agents', 'Custom integrations', 'Priority support'],
  },
] as const;

type PlanId = typeof PLANS[number]['id'];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('growth');
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

    setLoading(true);
    try {
      await signup(email.trim(), password);
      navigate('/app/dashboard');
    } catch (err) {
      if (isAxiosError(err)) {
        const detail = (err.response?.data as { detail?: string } | undefined)?.detail;
        if (detail) {
          setError(detail);
          return;
        }
      }
      setError('Signup failed. This email may already be in use, or the service is temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  };

  const inputBase = {
    background: 'oklch(9% .008 255)',
    borderColor: 'oklch(100% 0 0 / 0.1)',
  } as React.CSSProperties;

  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'oklch(65% .16 253)';
    e.currentTarget.style.boxShadow = '0 0 0 3px oklch(65% .16 253 / 0.15)';
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'oklch(100% 0 0 / 0.1)';
    e.currentTarget.style.boxShadow = 'none';
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 font-sans"
      style={{ background: 'oklch(9% .008 255)' }}
    >
      {/* Background glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute left-1/2 top-0 h-96 w-[600px] -translate-x-1/2 rounded-full blur-3xl opacity-20"
          style={{ background: 'oklch(65% .16 253)' }}
        />
        <div
          className="absolute -left-20 bottom-0 h-80 w-80 rounded-full blur-3xl opacity-10"
          style={{ background: 'oklch(65% .16 253)' }}
        />
      </div>

      <div className="relative w-full max-w-lg">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg mb-4"
            style={{ background: 'oklch(65% .16 253)', boxShadow: '0 8px 32px oklch(65% .16 253 / 0.4)' }}
          >
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Digital CMO AI</h1>
          <p className="mt-1.5 text-sm text-slate-400">
            Your AI Chief Marketing Officer — no credit card required
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl border border-white/[0.08] p-8 shadow-2xl"
          style={{ background: 'oklch(11% .008 255)' }}
        >
          <h2 className="text-xl font-bold text-white mb-1">Create your free account</h2>
          <p className="text-sm text-slate-400 mb-6">Start with demo data · Upgrade anytime</p>

          {/* Plan Selector */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Choose your plan
            </p>
            <div className="grid grid-cols-3 gap-2">
              {PLANS.map((plan) => {
                const isSelected = selectedPlan === plan.id;
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setSelectedPlan(plan.id)}
                    className="relative flex flex-col items-start p-3 rounded-xl border text-left transition-all"
                    style={{
                      borderColor: isSelected ? 'oklch(65% .16 253)' : 'oklch(100% 0 0 / 0.08)',
                      background: isSelected
                        ? 'oklch(65% .16 253 / 0.12)'
                        : 'oklch(9% .008 255)',
                    }}
                  >
                    {plan.popular && (
                      <span
                        className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-bold text-white px-2 py-0.5 rounded-full whitespace-nowrap"
                        style={{ background: 'oklch(65% .16 253)' }}
                      >
                        Popular
                      </span>
                    )}
                    <div className="flex items-center gap-1.5 mb-1">
                      {isSelected && (
                        <div
                          className="w-3.5 h-3.5 rounded-full flex items-center justify-center"
                          style={{ background: 'oklch(65% .16 253)' }}
                        >
                          <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                        </div>
                      )}
                      <span
                        className="text-xs font-bold"
                        style={{ color: isSelected ? 'oklch(65% .16 253)' : 'white' }}
                      >
                        {plan.name}
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-300">{plan.price}</span>
                    <span className="text-[9px] text-slate-500 mt-0.5 leading-tight">{plan.desc}</span>
                  </button>
                );
              })}
            </div>

            {/* Plan features */}
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {PLANS.find((p) => p.id === selectedPlan)?.features.map((f) => (
                <span
                  key={f}
                  className="text-[10px] font-medium text-slate-400 flex items-center gap-1"
                >
                  <Check className="w-2.5 h-2.5" style={{ color: 'oklch(65% .16 253)' }} strokeWidth={3} />
                  {f}
                </span>
              ))}
            </div>
          </div>

          <form className="space-y-4" onSubmit={onSubmit}>
            {/* Full name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Full name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-white placeholder:text-slate-500 transition-all outline-none"
                  style={inputBase}
                  onFocus={onFocus}
                  onBlur={onBlur}
                  placeholder="Jane Smith"
                  autoComplete="name"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Work email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-white placeholder:text-slate-500 transition-all outline-none"
                  style={inputBase}
                  onFocus={onFocus}
                  onBlur={onBlur}
                  placeholder="you@company.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm text-white placeholder:text-slate-500 transition-all outline-none"
                  style={inputBase}
                  onFocus={onFocus}
                  onBlur={onBlur}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
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

            {/* Company (optional) */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Company{' '}
                <span className="text-slate-600 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-white placeholder:text-slate-500 transition-all outline-none"
                  style={inputBase}
                  onFocus={onFocus}
                  onBlur={onBlur}
                  placeholder="Acme Corp"
                  autoComplete="organization"
                />
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
                  Creating account…
                </>
              ) : (
                'Start free — no credit card required'
              )}
            </button>
          </form>

          {/* Terms */}
          <p className="mt-4 text-center text-xs text-slate-600">
            By creating an account you agree to our{' '}
            <a href="#" className="underline hover:text-slate-400 transition-colors">
              Terms
            </a>{' '}
            and{' '}
            <a href="#" className="underline hover:text-slate-400 transition-colors">
              Privacy Policy
            </a>
            .
          </p>

          {/* Sign in link */}
          <p className="mt-4 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold transition-colors"
              style={{ color: 'oklch(65% .16 253)' }}
            >
              Sign in →
            </Link>
          </p>
        </div>

        {/* Trust signals */}
        <p className="mt-6 text-center text-xs text-slate-600">
          🔒 SOC2 compliant · 256-bit encryption · 14-day free trial · Cancel anytime
        </p>
      </div>
    </div>
  );
}
