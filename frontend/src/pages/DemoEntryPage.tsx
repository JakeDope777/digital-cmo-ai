/**
 * Public demo entry point — enables demo mode and redirects into the app.
 * Visiting /demo (no auth required) lands here and instantly activates demo mode.
 */
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDemoMode } from '../context/DemoModeContext';
import { resolveDomainId, withDomainQuery } from '../data/domainModuleCatalog';
import { setSelectedDomain } from '../services/onboarding';
import LaunchReadinessPanel from '../components/common/LaunchReadinessPanel';

export default function DemoEntryPage() {
  const { enableDemoMode } = useDemoMode();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const domain = resolveDomainId(params.get('domain'));
    if (domain) {
      setSelectedDomain(domain);
    }
    enableDemoMode('manual', domain);
    const timeout = window.setTimeout(() => {
      navigate(withDomainQuery('/app/dashboard', domain), { replace: true });
    }, 900);
    return () => window.clearTimeout(timeout);
  }, [enableDemoMode, navigate, location.search]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/5 p-8 text-white shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full border-2 border-white/20 border-t-orange-500 animate-spin" />
          <div>
            <h1 className="text-xl font-semibold">Opening demo workspace</h1>
            <p className="mt-1 text-sm text-white/55">
              Demo mode is available immediately while managed live pilot connectors finish setup.
            </p>
          </div>
        </div>
        <LaunchReadinessPanel
          title="What happens next"
          tone="dark"
          variant="compact"
          className="mt-6"
        />
      </div>
    </div>
  );
}
