import { useEffect, useState, useRef } from 'react';
import {
  Globe,
  Loader2,
  Search,
  X,
  Zap,
  BarChart3,
  Mail,
  Users,
  ShoppingCart,
  Megaphone,
  Share2,
  Workflow,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { integrationsService } from '../services/api';
import { useDemoMode } from '../context/DemoModeContext';
import DemoDataBadge from '../components/common/DemoDataBadge';

/* ── Types ─────────────────────────────────────────────── */
interface Connector {
  key: string;
  name: string;
  provider: string;
  category: string;
  auth_type?: string;
  status?: string;
}

interface CatalogItem {
  name: string;
  status: string;
  demo_mode: boolean;
  authenticated: boolean;
  owner_scope?: string;
  auth_mode?: string;
  configured?: boolean;
  ready_for_live?: boolean;
  demo_fallback?: boolean;
  last_tested_at?: string | null;
  capability?: string;
  mode_label?: string;
}

interface ConnectionMeta {
  id?: string;
  owner_id?: string;
  owner_scope?: string;
  auth_mode?: string;
  configured?: boolean;
  ready_for_live?: boolean;
  demo_fallback?: boolean;
  last_tested_at?: string | null;
  capability?: string;
  mode_label?: string;
}

interface ConnectorDetail {
  key: string;
  display_name: string;
  category?: string;
  providers_available: string[];
  suggested_actions: string[];
  variants: unknown[];
  capability?: string;
  mode_label?: string;
  connection?: ConnectionMeta;
}

/* ── Category config ───────────────────────────────────── */
const CATEGORIES = ['', 'crm', 'ads', 'analytics', 'commerce', 'automation', 'email', 'social'];

interface CategoryMeta {
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  ring: string;
  description: string;
}

const CATEGORY_META: Record<string, CategoryMeta> = {
  ads: { label: 'Advertising', icon: Megaphone, color: 'text-orange-600', bg: 'bg-orange-50', ring: 'ring-orange-200', description: 'Paid media & performance' },
  crm: { label: 'CRM', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', ring: 'ring-blue-200', description: 'Customer relationships' },
  analytics: { label: 'Analytics', icon: BarChart3, color: 'text-violet-600', bg: 'bg-violet-50', ring: 'ring-violet-200', description: 'Data & insights' },
  commerce: { label: 'Commerce', icon: ShoppingCart, color: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'ring-emerald-200', description: 'Payments & storefronts' },
  email: { label: 'Email', icon: Mail, color: 'text-rose-600', bg: 'bg-rose-50', ring: 'ring-rose-200', description: 'Email marketing' },
  social: { label: 'Social', icon: Share2, color: 'text-cyan-600', bg: 'bg-cyan-50', ring: 'ring-cyan-200', description: 'Social media' },
  automation: { label: 'Automation', icon: Workflow, color: 'text-amber-600', bg: 'bg-amber-50', ring: 'ring-amber-200', description: 'Workflow & orchestration' },
};

/* ── Connector brand colors (initials + color) ─────────── */
const CONNECTOR_BRAND: Record<string, { initials: string; gradient: string }> = {
  'google-ads': { initials: 'G', gradient: 'from-blue-500 to-green-400' },
  'meta-ads': { initials: 'M', gradient: 'from-blue-600 to-indigo-500' },
  hubspot: { initials: 'H', gradient: 'from-orange-500 to-red-400' },
  salesforce: { initials: 'SF', gradient: 'from-sky-500 to-blue-600' },
  mailchimp: { initials: 'Mc', gradient: 'from-yellow-400 to-amber-500' },
  klaviyo: { initials: 'K', gradient: 'from-emerald-500 to-green-600' },
  ga4: { initials: 'GA', gradient: 'from-amber-500 to-orange-500' },
  mixpanel: { initials: 'Mp', gradient: 'from-violet-500 to-purple-600' },
  shopify: { initials: 'S', gradient: 'from-green-500 to-emerald-600' },
  stripe: { initials: 'St', gradient: 'from-indigo-500 to-violet-600' },
  'linkedin-ads': { initials: 'Li', gradient: 'from-blue-700 to-blue-500' },
  'tiktok-ads': { initials: 'Tk', gradient: 'from-pink-500 to-rose-500' },
  zapier: { initials: 'Z', gradient: 'from-orange-500 to-amber-400' },
  make: { initials: 'Mk', gradient: 'from-violet-600 to-fuchsia-500' },
  'twitter-x': { initials: 'X', gradient: 'from-slate-800 to-slate-600' },
  instagram: { initials: 'Ig', gradient: 'from-pink-500 via-purple-500 to-indigo-500' },
  pipedrive: { initials: 'Pd', gradient: 'from-emerald-600 to-teal-500' },
  intercom: { initials: 'Ic', gradient: 'from-blue-500 to-sky-400' },
  sendgrid: { initials: 'Sg', gradient: 'from-sky-500 to-blue-500' },
  segment: { initials: 'Se', gradient: 'from-green-600 to-emerald-500' },
  'facebook-ads': { initials: 'Fb', gradient: 'from-blue-600 to-blue-500' },
  marketo: { initials: 'Mk', gradient: 'from-purple-600 to-violet-500' },
  'google-sheets': { initials: 'Gs', gradient: 'from-green-500 to-emerald-400' },
  slack: { initials: 'Sl', gradient: 'from-purple-500 to-pink-400' },
  notion: { initials: 'N', gradient: 'from-slate-700 to-slate-500' },
  airtable: { initials: 'At', gradient: 'from-blue-500 to-cyan-400' },
};

/* ── Demo data ─────────────────────────────────────────── */
const DEMO_CONNECTORS: Connector[] = [
  { key: 'google-ads', name: 'Google Ads', provider: 'native', category: 'ads' },
  { key: 'meta-ads', name: 'Meta Ads', provider: 'native', category: 'ads' },
  { key: 'hubspot', name: 'HubSpot', provider: 'native', category: 'crm' },
  { key: 'salesforce', name: 'Salesforce', provider: 'native', category: 'crm' },
  { key: 'mailchimp', name: 'Mailchimp', provider: 'native', category: 'email' },
  { key: 'klaviyo', name: 'Klaviyo', provider: 'native', category: 'email' },
  { key: 'ga4', name: 'Google Analytics 4', provider: 'native', category: 'analytics' },
  { key: 'mixpanel', name: 'Mixpanel', provider: 'native', category: 'analytics' },
  { key: 'shopify', name: 'Shopify', provider: 'native', category: 'commerce' },
  { key: 'stripe', name: 'Stripe', provider: 'native', category: 'commerce' },
  { key: 'linkedin-ads', name: 'LinkedIn Ads', provider: 'native', category: 'ads' },
  { key: 'tiktok-ads', name: 'TikTok Ads', provider: 'native', category: 'ads' },
  { key: 'zapier', name: 'Zapier', provider: 'n8n', category: 'automation' },
  { key: 'make', name: 'Make (Integromat)', provider: 'n8n', category: 'automation' },
  { key: 'twitter-x', name: 'X / Twitter', provider: 'native', category: 'social' },
  { key: 'instagram', name: 'Instagram', provider: 'native', category: 'social' },
  { key: 'pipedrive', name: 'Pipedrive', provider: 'native', category: 'crm' },
  { key: 'intercom', name: 'Intercom', provider: 'native', category: 'crm' },
  { key: 'sendgrid', name: 'SendGrid', provider: 'native', category: 'email' },
  { key: 'segment', name: 'Segment', provider: 'native', category: 'analytics' },
];

const FEATURED_KEYS = ['google-ads', 'hubspot', 'shopify', 'ga4', 'meta-ads', 'stripe'];
const CONNECTOR_KEY_ALIASES: Record<string, string> = {
  'google-ads': 'google_ads',
  'meta-ads': 'meta_ads',
  'tiktok-ads': 'tiktok_ads',
  'linkedin-ads': 'linkedin',
  'twitter-x': 'twitter',
  ga4: 'google_analytics',
};

/* ── Component ─────────────────────────────────────────── */
function ConnectorIcon({ connectorKey, size = 'md' }: { connectorKey: string; size?: 'sm' | 'md' | 'lg' }) {
  const brand = CONNECTOR_BRAND[connectorKey];
  const sizeClass = size === 'lg' ? 'w-12 h-12 text-base' : size === 'md' ? 'w-10 h-10 text-sm' : 'w-8 h-8 text-xs';
  if (brand) {
    return (
      <div className={`${sizeClass} rounded-xl bg-gradient-to-br ${brand.gradient} flex items-center justify-center text-white font-bold shadow-sm`}>
        {brand.initials}
      </div>
    );
  }
  return (
    <div className={`${sizeClass} rounded-xl bg-slate-100 flex items-center justify-center text-slate-400`}>
      <Globe className="w-4 h-4" />
    </div>
  );
}

export default function IntegrationsPage() {
  const { isDemoMode } = useDemoMode();
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [catalog, setCatalog] = useState<Record<string, CatalogItem>>({});
  const [stats, setStats] = useState<{ total_connectors: number; snapshot_connectors: number; source_total_connectors: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [detail, setDetail] = useState<ConnectorDetail | null>(null);
  const [detailKey, setDetailKey] = useState('');
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionResult, setActionResult] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const PAGE_SIZE = 60;

  const fetchConnectors = async (reset = true) => {
    if (reset) { setLoading(true); setOffset(0); } else { setLoadingMore(true); }

    if (isDemoMode) {
      const filtered = DEMO_CONNECTORS.filter((c) => {
        if (category && c.category !== category) return false;
        if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      });
      setConnectors(filtered);
      setTotal(filtered.length);
      setHasMore(false);
      setStats({ total_connectors: 200, snapshot_connectors: 180, source_total_connectors: 420 });
      setIsDemo(true);
      setLoading(false);
      setLoadingMore(false);
      return;
    }

    try {
      const currentOffset = reset ? 0 : offset;
      const [marketData, statsData, catalogData] = await Promise.all([
        integrationsService.getMarketplace({
          provider: undefined,
          category: category || undefined,
          search: search || undefined,
          limit: PAGE_SIZE,
          offset: currentOffset,
        }),
        stats === null ? integrationsService.getMarketplaceStats() : Promise.resolve(stats),
        Object.keys(catalog).length === 0 ? integrationsService.getCatalog() : Promise.resolve({ integrations: [] }),
      ]);

      const connectorList: Connector[] = Array.isArray(marketData?.connectors) ? marketData.connectors : DEMO_CONNECTORS;
      if (reset) { setConnectors(connectorList); } else { setConnectors((prev) => [...prev, ...connectorList]); }
      setTotal(marketData?.total || connectorList.length);
      setHasMore(marketData?.has_more || false);
      setOffset(currentOffset + PAGE_SIZE);
      if (statsData) setStats(statsData as typeof stats);
      const integrations = catalogData?.integrations;
      if (Array.isArray(integrations) && integrations.length > 0) {
        const map: Record<string, CatalogItem> = {};
        integrations.forEach((item) => { map[item.name] = item; });
        setCatalog(map);
      }
      setIsDemo(false);
    } catch {
      if (reset) setConnectors(DEMO_CONNECTORS);
      setTotal(DEMO_CONNECTORS.length);
      setIsDemo(true);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => { void fetchConnectors(true); }, [category, isDemoMode]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => { void fetchConnectors(true); }, 350);
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  const openDetail = async (key: string, prov: string) => {
    if (detailKey === key) { setDetail(null); setDetailKey(''); setActionResult(null); return; }
    setDetailKey(key); setDetail(null); setActionResult(null); setDetailLoading(true);
    try { const d = await integrationsService.getConnectorDetail(key, prov); setDetail(d); } catch { setDetail(null); } finally { setDetailLoading(false); }
  };

  const runDemoAction = async (key: string, action: string) => {
    setActionLoading(true); setActionResult(null);
    try { const result = await integrationsService.triggerAction(key, action, { demo: true }); setActionResult(JSON.stringify(result, null, 2)); }
    catch (e) { setActionResult(`Error: ${e instanceof Error ? e.message : String(e)}`); }
    finally { setActionLoading(false); }
  };

  const resolveCatalogKey = (key: string) => CONNECTOR_KEY_ALIASES[key] || key.replace(/-/g, '_');

  const connectorItem = (key: string) => catalog[resolveCatalogKey(key)] || catalog[key];

  const connectorStatus = (key: string): string => {
    const item = connectorItem(key);
    if (!item) return '';
    if (item.ready_for_live) return 'live';
    if (item.demo_fallback || item.demo_mode) return 'demo';
    return 'ready';
  };

  const connectorModeLabel = (key: string, provider?: string): string => {
    const item = connectorItem(key);
    if (item?.mode_label) return item.mode_label;
    if (provider === 'n8n') return 'Demo fallback';
    return 'Self-serve OAuth coming soon';
  };

  const formatLastTestedAt = (value?: string | null) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toLocaleString();
  };

  const featured = DEMO_CONNECTORS.filter((c) => FEATURED_KEYS.includes(c.key));
  const categoryCounts = DEMO_CONNECTORS.reduce((acc, c) => { acc[c.category] = (acc[c.category] || 0) + 1; return acc; }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 p-8 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-violet-500/10" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-orange-400" />
            <p className="text-xs uppercase tracking-[0.2em] text-orange-300 font-medium">Integration Hub</p>
            {isDemo && <DemoDataBadge className="border-orange-500/30 bg-orange-500/20 text-orange-200" />}
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Connect your stack</h2>
          <p className="mt-2 max-w-lg text-base text-slate-300">
            HubSpot, GA4, and Stripe run live via managed workspace connections during the pilot.
            {` ${stats ? `${stats.total_connectors}+ additional connectors` : '200+ additional connectors'} stay available with demo fallback or future self-serve OAuth.`}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {[
              'Live via managed workspace connection',
              'Demo fallback',
              'Self-serve OAuth coming soon',
            ].map((label) => (
              <span key={label} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-slate-200">
                {label}
              </span>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-6 flex flex-wrap gap-6">
            {[
              { val: stats?.total_connectors ?? 200, label: 'Connectors' },
              { val: '7', label: 'Categories' },
              { val: '3', label: 'Managed live pilot connectors' },
              { val: '200+', label: 'Demo-backed or roadmap connectors' },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-bold text-white">{s.val}</p>
                <p className="text-xs text-slate-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Category browser ── */}
      <section>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Browse by category</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(CATEGORY_META).map(([key, meta]) => {
            const Icon = meta.icon;
            const count = categoryCounts[key] || 0;
            const isActive = category === key;
            return (
              <button
                key={key}
                onClick={() => setCategory(isActive ? '' : key)}
                className={`group flex items-center gap-3.5 rounded-2xl border p-4 text-left transition-all ${
                  isActive
                    ? `${meta.bg} border-transparent ring-2 ${meta.ring}`
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${meta.bg} ${meta.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{meta.label}</p>
                  <p className="text-xs text-slate-500">{meta.description} · {count}+</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Featured connectors ── */}
      {!category && !search && (
        <section>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Popular integrations</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((c) => {
              const meta = CATEGORY_META[c.category];
              const st = connectorStatus(c.key);
              return (
                <button
                  key={c.key}
                  onClick={() => void openDetail(c.key, c.provider)}
                  className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left transition-all hover:border-slate-300 hover:shadow-md"
                >
                  <ConnectorIcon connectorKey={c.key} size="lg" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-slate-900">{c.name}</h4>
                      {st === 'live' && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">{meta?.description || c.category}</p>
                    <p className="mt-2 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700">
                      {connectorModeLabel(c.key, c.provider)}
                    </p>
                    <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      Connect <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Search + all connectors ── */}
      <section>
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <h3 className="text-lg font-semibold text-slate-900">
            {category ? CATEGORY_META[category]?.label || category : 'All connectors'}
          </h3>
          <div className="relative ml-auto">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search connectors…"
              className="h-9 w-60 rounded-full border border-slate-200 bg-white/80 pl-9 pr-4 text-sm text-slate-800 shadow-sm backdrop-blur focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-300"
            />
          </div>
          {(search || category) && (
            <button
              onClick={() => { setSearch(''); setCategory(''); }}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
            >
              <X className="h-3 w-3" /> Clear
            </button>
          )}
          <span className="text-xs text-slate-500">{connectors.length} connectors</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {connectors.map((c) => {
            const meta = CATEGORY_META[c.category];
            const st = connectorStatus(c.key);
            const isActive = detailKey === c.key;
            return (
              <button
                key={`${c.key}-${c.provider}`}
                onClick={() => void openDetail(c.key, c.provider)}
                className={`group flex items-center gap-3.5 rounded-2xl border p-4 text-left transition-all ${
                  isActive
                    ? 'border-orange-300 bg-orange-50/50 shadow-sm ring-1 ring-orange-200'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                <ConnectorIcon connectorKey={c.key} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900 truncate">{c.name}</p>
                  <p className="text-xs text-slate-500 truncate">{meta?.label || c.category}</p>
                  <p className="mt-1 text-[11px] text-slate-600 truncate">{connectorModeLabel(c.key, c.provider)}</p>
                </div>
                {st === 'live' ? (
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-500" />
                ) : (
                  <ExternalLink className="h-3.5 w-3.5 flex-shrink-0 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </button>
            );
          })}
        </div>

        {connectors.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Globe className="h-10 w-10 text-slate-300 mb-3" />
            <p className="text-sm text-slate-500">No connectors match your search.</p>
            <button onClick={() => { setSearch(''); setCategory(''); }} className="mt-2 text-xs text-orange-600 hover:underline">Clear filters</button>
          </div>
        )}

        {hasMore && (
          <div className="flex justify-center mt-6">
            <button
              onClick={() => void fetchConnectors(false)}
              disabled={loadingMore}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
            >
              {loadingMore ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Load more connectors
            </button>
          </div>
        )}
      </section>

      {/* ── Connector detail drawer ── */}
      {(detailLoading || detail) && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
          {detailLoading ? (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading connector details…
            </div>
          ) : detail ? (
            <>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <ConnectorIcon connectorKey={detail.key} size="lg" />
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{detail.display_name || detail.key}</h3>
                    <p className="text-xs text-slate-500">{detail.category ? `${detail.category} · ` : ''}Key: {detail.key}</p>
                  </div>
                </div>
                <button onClick={() => { setDetail(null); setDetailKey(''); setActionResult(null); }} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {detail.providers_available.map((p) => (
                  <span key={p} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{p}</span>
                ))}
                <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700">
                  {detail.connection?.mode_label || detail.mode_label || 'Demo fallback'}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">{Array.isArray(detail.variants) ? detail.variants.length : 0} variant(s)</span>
              </div>

              {detail.connection && (
                <div className="mt-4 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 sm:grid-cols-2">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Connection mode</p>
                    <p className="mt-1 font-medium text-slate-900">{detail.connection.mode_label}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Owner scope</p>
                    <p className="mt-1 font-medium text-slate-900 capitalize">{detail.connection.owner_scope || 'workspace'}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Auth mode</p>
                    <p className="mt-1 font-medium text-slate-900">{detail.connection.auth_mode || 'managed'}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Last tested</p>
                    <p className="mt-1 font-medium text-slate-900">{formatLastTestedAt(detail.connection.last_tested_at) || 'Not tested yet'}</p>
                  </div>
                </div>
              )}

              {detail.suggested_actions.length > 0 && (
                <div className="mt-5">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Quick actions</p>
                  <div className="flex flex-wrap gap-2">
                    {detail.suggested_actions.map((action) => (
                      <button
                        key={action}
                        onClick={() => void runDemoAction(detail.key, action)}
                        disabled={actionLoading}
                        className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-60"
                      >
                        <Zap className="h-3 w-3" /> {action}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {actionLoading && <div className="mt-3 flex items-center gap-2 text-xs text-slate-500"><Loader2 className="h-3 w-3 animate-spin" /> Running…</div>}
              {actionResult && <pre className="mt-3 max-h-48 overflow-auto rounded-xl bg-slate-50 p-4 text-xs text-slate-700 ring-1 ring-slate-200">{actionResult}</pre>}
            </>
          ) : null}
        </section>
      )}

      {/* ── Bottom CTA ── */}
      <section className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 to-orange-50/40 p-8 text-center">
        <h3 className="text-lg font-semibold text-slate-900">Need a custom connector?</h3>
        <p className="mt-1 text-sm text-slate-600 max-w-md mx-auto">
          We can onboard managed workspace connectors for pilot accounts now, while broader self-serve OAuth stays on the MVP 2.0 roadmap.
        </p>
        <button className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-slate-800 transition-colors">
          Request integration <ArrowRight className="h-4 w-4" />
        </button>
      </section>
    </div>
  );
}
