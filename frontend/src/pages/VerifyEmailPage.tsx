import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authService } from '../services/api';
import { trackEvent } from '../services/analytics';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Missing verification token.');
        return;
      }
      setStatus('loading');
      try {
        const response = await authService.verifyEmail(token);
        setStatus('success');
        setMessage(response.message);
        await trackEvent('verification_completed');
      } catch {
        setStatus('error');
        setMessage('Invalid or expired verification token.');
      }
    };
    void verify();
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-12">
      <div className="mx-auto max-w-md rounded-2xl bg-white p-8 shadow-lg border border-slate-200">
        <h1 className="text-xl font-semibold text-slate-900">Verify email</h1>
        <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
          {status === 'loading' ? 'Verifying...' : message}
        </p>
        {(status === 'success' || status === 'error') && (
          <p className="mt-4 text-sm text-slate-600">
            Continue to{' '}
            <Link to="/login" className="font-semibold text-orange-600 hover:text-orange-700">
              login
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
