import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { getDomainDefinition } from '../../data/domainModuleCatalog';
import { getOnboardingState, subscribeOnboardingState } from '../../services/onboarding';
import type { DomainId } from '../../types/catalog';

export default function DemoDataBadge({ className = '' }: { className?: string }) {
  const [selectedDomain, setSelectedDomain] = useState<DomainId | undefined>(
    getOnboardingState().selected_domain,
  );

  useEffect(
    () =>
      subscribeOnboardingState(() => {
        setSelectedDomain(getOnboardingState().selected_domain);
      }),
    [],
  );

  const domainLabel = getDomainDefinition(selectedDomain)?.shortName;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 ${className}`.trim()}
    >
      <Sparkles className="h-3 w-3" />
      {domainLabel ? `Demo data · ${domainLabel}` : 'Demo data'}
    </span>
  );
}
