export const DOMAIN_IDS = [
  'ecommerce',
  'saas',
  'fintech',
  'igaming',
  'healthtech',
  'proptech',
  'edtech',
  'agency',
] as const;

export type DomainId = (typeof DOMAIN_IDS)[number];

export const MODULE_IDS = [
  'dashboard',
  'chat',
  'analysis',
  'creative',
  'crm',
  'growth',
  'integrations',
  'billing',
  'profile',
  'settings',
] as const;

export type ModuleId = (typeof MODULE_IDS)[number];

export interface DomainDefinition {
  id: DomainId;
  name: string;
  shortName: string;
}

export interface ModuleDefinition {
  id: ModuleId;
  title: string;
  badge: string;
  route: string;
  description: string;
  features: string[];
  demoCopy: string;
  domain_overrides: Record<DomainId, string>;
}
