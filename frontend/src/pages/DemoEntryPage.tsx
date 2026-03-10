/**
 * Public demo entry point — enables demo mode and redirects into the app.
 * Visiting /demo (no auth required) lands here and instantly activates demo mode.
 */
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDemoMode } from '../context/DemoModeContext';
import { resolveDomainId, withDomainQuery } from '../data/domainModuleCatalog';
import { setSelectedDomain } from '../services/onboarding';

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
    navigate(withDomainQuery('/app/dashboard', domain), { replace: true });
  }, [enableDemoMode, navigate, location.search]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="h-8 w-8 rounded-full border-2 border-slate-600 border-t-orange-500 animate-spin" />
    </div>
  );
}
