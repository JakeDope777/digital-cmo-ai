import { useEffect, useMemo, useState } from 'react';
import { getDomainDefinition, MODULE_CATALOG } from '../../data/domainModuleCatalog';
import { useDemoMode } from '../../context/DemoModeContext';
import { getOnboardingState, subscribeOnboardingState } from '../../services/onboarding';
import type { DomainId, ModuleId } from '../../types/catalog';
import DemoDataBadge from './DemoDataBadge';

export default function ModuleHighlightsPanel({ moduleId }: { moduleId: ModuleId }) {
  const [selectedDomain, setSelectedDomainState] = useState<DomainId | undefined>(
    getOnboardingState().selected_domain,
  );
  const { isDemoMode } = useDemoMode();
  const moduleDefinition = MODULE_CATALOG[moduleId];

  useEffect(() => subscribeOnboardingState(() => {
    setSelectedDomainState(getOnboardingState().selected_domain);
  }), []);

  const domainName = useMemo(
    () => getDomainDefinition(selectedDomain)?.shortName,
    [selectedDomain],
  );

  return (
    <section className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">
          {moduleDefinition.badge}
        </span>
        <h3 className="text-sm font-semibold text-slate-900">{moduleDefinition.title} Highlights</h3>
        {isDemoMode && <DemoDataBadge className="ml-auto" />}
      </div>
      <p className="mt-2 text-xs text-slate-500">
        {selectedDomain
          ? `${moduleDefinition.domain_overrides[selectedDomain]}`
          : 'Select a domain from landing or an industry page to personalize this module guidance.'}
      </p>
      <ul className="mt-3 grid gap-1.5 text-xs text-slate-700 sm:grid-cols-2">
        {moduleDefinition.features.map((feature) => (
          <li key={feature} className="rounded-lg bg-slate-50 px-2.5 py-1.5">
            {feature}
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[11px] text-slate-400">
        {domainName ? `Domain context: ${domainName}` : 'Domain context not set'}
      </p>
    </section>
  );
}
