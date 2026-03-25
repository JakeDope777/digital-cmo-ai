import { useEffect, useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { NavLink, Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { navItems } from './Sidebar';
import clsx from 'clsx';
import { useDemoMode } from '../../context/DemoModeContext';
import ModuleHighlightsPanel from '../common/ModuleHighlightsPanel';
import {
  getDomainDefinition,
  MODULE_CATALOG,
  resolveModuleIdFromPath,
  withDomainQuery,
} from '../../data/domainModuleCatalog';
import {
  getOnboardingState,
  setSelectedModule,
  subscribeOnboardingState,
} from '../../services/onboarding';
import type { DomainId, ModuleId } from '../../types/catalog';

function DemoBanner({ moduleId }: { moduleId?: ModuleId }) {
  const [dismissed, setDismissed] = useState(false);
  const [selectedDomain, setSelectedDomainState] = useState<DomainId | undefined>(
    getOnboardingState().selected_domain,
  );
  const navigate = useNavigate();
  const { isDemoMode, disableDemoMode } = useDemoMode();

  useEffect(
    () =>
      subscribeOnboardingState(() => {
        setSelectedDomainState(getOnboardingState().selected_domain);
      }),
    [],
  );

  if (dismissed || !isDemoMode) return null;

  const switchToLiveMode = () => {
    disableDemoMode();
    navigate(withDomainQuery('/register', selectedDomain));
  };

  const domainLabel = getDomainDefinition(selectedDomain)?.shortName ?? 'General';
  const moduleLabel = moduleId ? MODULE_CATALOG[moduleId].title : 'App';

  return (
    <div className="flex items-center justify-between gap-4 bg-amber-500 px-4 py-2 text-sm text-white">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 flex-shrink-0" />
        <span className="font-medium">Demo mode</span>
        <span className="hidden sm:inline text-amber-100">
          {`— ${domainLabel} · ${moduleLabel}. Exploring with realistic sample data. Switch to live mode to connect your real account.`}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={switchToLiveMode}
          className="rounded-lg border border-white/40 bg-white/15 px-3 py-1 text-xs font-semibold hover:bg-white/25 transition-colors whitespace-nowrap"
        >
          Switch to live mode →
        </button>
        <Link
          to={withDomainQuery('/register', selectedDomain)}
          className="hidden rounded-lg border border-white/30 px-3 py-1 text-xs font-semibold hover:bg-white/10 transition-colors whitespace-nowrap sm:block"
        >
          Create account
        </Link>
        <button onClick={() => setDismissed(true)} className="rounded p-0.5 hover:bg-white/20">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const currentModuleId = resolveModuleIdFromPath(location.pathname);

  useEffect(() => {
    if (currentModuleId) {
      setSelectedModule(currentModuleId);
    }
  }, [currentModuleId]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <DemoBanner moduleId={currentModuleId} />
        <Header onMenuClick={() => setMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {currentModuleId && <ModuleHighlightsPanel moduleId={currentModuleId} />}
          <Outlet />
        </main>
      </div>
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            aria-label="Close menu backdrop"
            onClick={() => setMobileMenuOpen(false)}
            className="absolute inset-0 bg-slate-900/30"
          />
          <aside className="absolute left-0 top-0 h-full w-72 bg-white border-r border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between px-4 py-4 border-b border-slate-200">
              <p className="text-sm font-semibold text-slate-900">Navigation</p>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md p-2 text-slate-600 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="space-y-1 px-3 py-4">
              {navItems.map(({ label, path, icon: Icon }) => (
                <NavLink
                  key={path}
                  to={path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
                      isActive ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100',
                    )
                  }
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </NavLink>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </div>
  );
}
