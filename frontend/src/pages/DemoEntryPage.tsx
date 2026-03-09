/**
 * Public demo entry point — enables demo mode and redirects into the app.
 * Visiting /demo (no auth required) lands here and instantly activates demo mode.
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDemoMode } from '../context/DemoModeContext';

export default function DemoEntryPage() {
  const { enableDemoMode } = useDemoMode();
  const navigate = useNavigate();

  useEffect(() => {
    enableDemoMode('manual');
    navigate('/app/dashboard', { replace: true });
  }, [enableDemoMode, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="h-8 w-8 rounded-full border-2 border-slate-600 border-t-orange-500 animate-spin" />
    </div>
  );
}
