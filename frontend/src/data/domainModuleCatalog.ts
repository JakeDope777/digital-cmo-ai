import {
  DOMAIN_IDS,
  MODULE_IDS,
  type DomainDefinition,
  type DomainId,
  type ModuleDefinition,
  type ModuleId,
} from '../types/catalog';

export const SUPPORTED_DOMAINS: DomainDefinition[] = [
  { id: 'ecommerce', name: 'E-commerce & DTC', shortName: 'E-commerce' },
  { id: 'saas', name: 'B2B SaaS', shortName: 'SaaS' },
  { id: 'fintech', name: 'Fintech', shortName: 'Fintech' },
  { id: 'igaming', name: 'iGaming & Betting', shortName: 'iGaming' },
  { id: 'healthtech', name: 'Health & MedTech', shortName: 'HealthTech' },
  { id: 'proptech', name: 'Real Estate & PropTech', shortName: 'PropTech' },
  { id: 'edtech', name: 'EdTech & Online Education', shortName: 'EdTech' },
  { id: 'agency', name: 'Marketing Agency', shortName: 'Agency' },
];

const DOMAIN_BY_ID: Record<DomainId, DomainDefinition> = Object.fromEntries(
  SUPPORTED_DOMAINS.map((domain) => [domain.id, domain]),
) as Record<DomainId, DomainDefinition>;

function buildDomainOverrides(template: (domain: DomainDefinition) => string): Record<DomainId, string> {
  return Object.fromEntries(
    SUPPORTED_DOMAINS.map((domain) => [domain.id, template(domain)]),
  ) as Record<DomainId, string>;
}

export const MODULE_CATALOG: Record<ModuleId, ModuleDefinition> = {
  dashboard: {
    id: 'dashboard',
    title: 'Dashboard',
    badge: 'Core',
    route: '/app/dashboard',
    description: 'Unified KPI command center with proactive alerts and execution-ready next actions.',
    features: [
      'Cross-channel KPI snapshots with trend deltas',
      'Automated anomalies and risk flags before budget waste',
      'Executive-ready summary blocks for weekly reviews',
      'One-click drilldowns into root-cause analysis',
    ],
    demoCopy: 'Explore a live-style command center without connecting your stack first.',
    domain_overrides: buildDomainOverrides((domain) =>
      `${domain.shortName} KPI stack prioritized for daily standups and weekly planning.`,
    ),
  },
  chat: {
    id: 'chat',
    title: 'Chat',
    badge: 'Assistant',
    route: '/app/chat',
    description: 'Natural-language control surface to trigger strategy, execution, and reporting workflows.',
    features: [
      'Plain-English prompts mapped to specialized workflows',
      'Persistent context across goals, constraints, and decisions',
      'Structured outputs you can act on immediately',
      'Fast follow-up loops for iterate-and-refine execution',
    ],
    demoCopy: 'Run realistic assistant workflows with deterministic demo responses.',
    domain_overrides: buildDomainOverrides((domain) =>
      `Prompt packs tuned for ${domain.shortName} acquisition, retention, and revenue motions.`,
    ),
  },
  analysis: {
    id: 'analysis',
    title: 'Analysis',
    badge: 'Strategy',
    route: '/app/analysis',
    description: 'Framework-based market and competitor intelligence for strategic decision support.',
    features: [
      'SWOT, PESTEL, and competitor mapping in one workspace',
      'Market sizing and trend signal synthesis',
      'Persona generation linked to channel implications',
      'Decision briefs with clear tradeoff framing',
    ],
    demoCopy: 'Test full strategy workflows with domain-specific sample data.',
    domain_overrides: buildDomainOverrides((domain) =>
      `Research prompts and benchmark framing aligned to ${domain.shortName} dynamics.`,
    ),
  },
  creative: {
    id: 'creative',
    title: 'Creative',
    badge: 'Creative',
    route: '/app/creative',
    description: 'Generate copy systems, image prompts, and experiment variants that preserve brand voice.',
    features: [
      'Channel-ready copy for paid, lifecycle, and social',
      'Brand-consistent prompt templates for visual generation',
      'Variant packs for controlled A/B experimentation',
      'Faster iteration with reusable creative scaffolds',
    ],
    demoCopy: 'Generate production-style creative outputs instantly in demo mode.',
    domain_overrides: buildDomainOverrides((domain) =>
      `Creative suggestions tuned to ${domain.shortName} funnel stages and compliance tone.`,
    ),
  },
  crm: {
    id: 'crm',
    title: 'CRM',
    badge: 'Execution',
    route: '/app/crm',
    description: 'Lead and campaign orchestration layer with scoring, journeys, and compliance controls.',
    features: [
      'Lead scoring with explainable routing signals',
      'Lifecycle campaign orchestration by segment and stage',
      'Built-in compliance checks for outbound messaging',
      'Operational visibility into campaign and lead health',
    ],
    demoCopy: 'Walk through realistic pipeline and campaign states without auth blockers.',
    domain_overrides: buildDomainOverrides((domain) =>
      `Lifecycle journeys optimized for typical ${domain.shortName} conversion bottlenecks.`,
    ),
  },
  growth: {
    id: 'growth',
    title: 'Growth',
    badge: 'Funnel',
    route: '/app/growth',
    description: 'Funnel conversion and UTM attribution visibility to reduce time to first value.',
    features: [
      'Step-level funnel drop-off visualization',
      'UTM performance and source-level conversion context',
      'Top event velocity tracking for activation monitoring',
      'Fast diagnosis of onboarding and retention friction',
    ],
    demoCopy: 'Inspect demo funnel telemetry and attribution breakdowns immediately.',
    domain_overrides: buildDomainOverrides((domain) =>
      `Activation milestones mapped to high-value outcomes for ${domain.shortName} teams.`,
    ),
  },
  integrations: {
    id: 'integrations',
    title: 'Integrations',
    badge: 'Connectors',
    route: '/app/integrations',
    description: 'Native and marketplace connectors with deterministic fallback for demos and offline conditions.',
    features: [
      'Native connector status with live/demo transparency',
      'Marketplace catalog filtering by provider and category',
      'Deterministic fallback behavior when backend is unavailable',
      'Operational run summaries for sync confidence',
    ],
    demoCopy: 'Use marketplace and sync scenarios with repeatable, deterministic outcomes.',
    domain_overrides: buildDomainOverrides((domain) =>
      `Connector defaults and mapping assumptions pre-biased for ${domain.shortName} workflows.`,
    ),
  },
  billing: {
    id: 'billing',
    title: 'Billing',
    badge: 'Revenue',
    route: '/app/billing',
    description: 'Plan visibility and conversion handoff to live billing with safe demo guardrails.',
    features: [
      'Plan comparison with clear value progression',
      'Checkout and portal handoff protection in demo mode',
      'Invoice and subscription state visibility',
      'Upgrade intent instrumentation for funnel analysis',
    ],
    demoCopy: 'Preview pricing and billing UX safely before switching to live mode.',
    domain_overrides: buildDomainOverrides((domain) =>
      `Plan messaging framed around ROI expectations common in ${domain.shortName} organizations.`,
    ),
  },
  profile: {
    id: 'profile',
    title: 'Profile',
    badge: 'Workspace',
    route: '/app/profile',
    description: 'Workspace identity settings that personalize onboarding, analytics, and module behavior.',
    features: [
      'Profile fields used across onboarding and analytics context',
      'Team identity and company details for tailored outputs',
      'Editable preferences persisted across sessions',
      'Foundation for account-level personalization',
    ],
    demoCopy: 'See how workspace identity settings shape output quality and context.',
    domain_overrides: buildDomainOverrides((domain) =>
      `Profile defaults suggest fields most relevant for ${domain.shortName} go-to-market operations.`,
    ),
  },
  settings: {
    id: 'settings',
    title: 'Settings',
    badge: 'Admin',
    route: '/app/settings',
    description: 'Operational controls for environment, behavior defaults, and account safety settings.',
    features: [
      'Environment-level controls and app preferences',
      'Safety and access configuration entrypoints',
      'Consistent operational defaults across modules',
      'Support-ready diagnostics context for troubleshooting',
    ],
    demoCopy: 'Validate configuration UX and fallback behavior without production risk.',
    domain_overrides: buildDomainOverrides((domain) =>
      `Settings guidance highlights operational guardrails common in ${domain.shortName} environments.`,
    ),
  },
};

export const MODULE_ORDER: ModuleId[] = [...MODULE_IDS];

export function isDomainId(value: string | null | undefined): value is DomainId {
  if (!value) return false;
  return (DOMAIN_IDS as readonly string[]).includes(value);
}

export function isModuleId(value: string | null | undefined): value is ModuleId {
  if (!value) return false;
  return (MODULE_IDS as readonly string[]).includes(value);
}

export function resolveDomainId(value: string | null | undefined): DomainId | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  return isDomainId(normalized) ? normalized : undefined;
}

export function getDomainDefinition(domain: DomainId | undefined) {
  if (!domain) return undefined;
  return DOMAIN_BY_ID[domain];
}

export function withDomainQuery(path: string, domain?: DomainId, extra?: Record<string, string>) {
  const [pathname, query = ''] = path.split('?');
  const params = new URLSearchParams(query);
  if (domain) params.set('domain', domain);
  if (extra) {
    Object.entries(extra).forEach(([key, value]) => params.set(key, value));
  }
  const serialized = params.toString();
  return serialized ? `${pathname}?${serialized}` : pathname;
}

export function resolveModuleIdFromPath(pathname: string): ModuleId | undefined {
  if (pathname === '/app' || pathname === '/app/') return 'dashboard';
  const matched = MODULE_ORDER.find((id) => pathname.startsWith(MODULE_CATALOG[id].route));
  return matched;
}

function validateCatalog() {
  const moduleIds = Object.keys(MODULE_CATALOG) as ModuleId[];
  if (moduleIds.length !== 10) {
    throw new Error(`Expected exactly 10 modules, received ${moduleIds.length}.`);
  }

  const routeSet = new Set<string>();
  moduleIds.forEach((moduleId) => {
    const definition = MODULE_CATALOG[moduleId];
    routeSet.add(definition.route);
    if (definition.features.length < 4) {
      throw new Error(`Module ${moduleId} must define at least 4 features.`);
    }
    DOMAIN_IDS.forEach((domain) => {
      if (!definition.domain_overrides[domain]) {
        throw new Error(`Module ${moduleId} missing domain override for ${domain}.`);
      }
    });
  });

  if (routeSet.size !== moduleIds.length) {
    throw new Error('Each module route must be unique.');
  }
}

validateCatalog();
