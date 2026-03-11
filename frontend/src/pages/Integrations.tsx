import { memo, useMemo, useState } from "react";
import { useIntegrations, useConnectIntegration } from "@/hooks/use-api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import {
  CheckCircleIcon, XCircleIcon, ClockIcon, BoltIcon, ArrowPathIcon,
  PlusIcon, ArrowTopRightOnSquareIcon, MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { fadeUp, stagger } from "@/lib/motion";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";

const INTEGRATION_CATALOG = [
  { id: "hubspot",    name: "HubSpot",          category: "crm",       desc: "Sync contacts, deals, and marketing campaigns bidirectionally.",       color: "#ff7a59", status: "connected",    lastSync: new Date(Date.now() - 180000),   records: "12,840" },
  { id: "salesforce", name: "Salesforce",       category: "crm",       desc: "Push qualified leads and opportunity data from AI campaigns.",           color: "#00a1e0", status: "disconnected", lastSync: null,                              records: null },
  { id: "ga4",        name: "Google Analytics", category: "analytics", desc: "Pull traffic, conversions, and attribution data in real-time.",          color: "#e37400", status: "connected",    lastSync: new Date(Date.now() - 300000),   records: "847K events" },
  { id: "gads",       name: "Google Ads",       category: "ads",       desc: "Automate bidding optimisation and pull ROAS data.",                     color: "#4285f4", status: "connected",    lastSync: new Date(Date.now() - 900000),   records: "14 campaigns" },
  { id: "metaads",    name: "Meta Ads",         category: "ads",       desc: "Sync Facebook/Instagram campaigns and creative performance.",             color: "#1877f2", status: "error",        lastSync: new Date(Date.now() - 3600000), records: null },
  { id: "linkedin",   name: "LinkedIn Ads",     category: "ads",       desc: "B2B demand gen — sync lead gen forms and company targeting.",            color: "#0077b5", status: "disconnected", lastSync: null,                              records: null },
  { id: "stripe",     name: "Stripe",           category: "revenue",   desc: "Connect revenue data for full-funnel ROI attribution.",                  color: "#6772e5", status: "connected",    lastSync: new Date(Date.now() - 600000),   records: "$248K MRR" },
  { id: "mailchimp",  name: "Mailchimp",        category: "email",     desc: "Sync audiences and automate triggered email flows.",                     color: "#ffe01b", status: "disconnected", lastSync: null,                              records: null },
  { id: "slack",      name: "Slack",            category: "alerts",    desc: "Receive AI CMO alerts, campaign reports, and anomaly notifications.",    color: "#4a154b", status: "connected",    lastSync: new Date(Date.now() - 60000),    records: "Live" },
  { id: "shopify",    name: "Shopify",          category: "ecomm",     desc: "Connect storefront revenue, product data and ad attribution.",           color: "#96bf48", status: "disconnected", lastSync: null,                              records: null },
  { id: "notion",     name: "Notion",           category: "docs",      desc: "Export campaign briefs, reports and strategies to Notion.",              color: "#ffffff", status: "disconnected", lastSync: null,                              records: null },
  { id: "zapier",     name: "Zapier",           category: "automation",desc: "Build custom automation workflows with 5,000+ apps.",                   color: "#ff4f00", status: "connected",    lastSync: new Date(Date.now() - 1800000), records: "12 zaps" },
];

const TABS = [
  { value: "all",        label: "All" },
  { value: "crm",        label: "CRM" },
  { value: "analytics",  label: "Analytics" },
  { value: "ads",        label: "Ads" },
  { value: "revenue",    label: "Revenue" },
  { value: "email",      label: "Email" },
  { value: "alerts",     label: "Alerts" },
  { value: "automation", label: "Automation" },
];

function StatusBadge({ status }: { status: string }) {
  if (status === "connected") return (
    <Badge className="bg-emerald-500/10 text-emerald-400 border-0 text-xs flex items-center gap-1 h-6">
      <CheckCircleIcon className="w-3 h-3" />Connected
    </Badge>
  );
  if (status === "error") return (
    <Badge className="bg-rose-500/10 text-rose-400 border-0 text-xs flex items-center gap-1 h-6">
      <XCircleIcon className="w-3 h-3" />Error
    </Badge>
  );
  return (
    <Badge className="bg-slate-800 text-slate-400 border-0 text-xs flex items-center gap-1 h-6">
      <ClockIcon className="w-3 h-3" />Not connected
    </Badge>
  );
}

const IntegrationCard = memo(function IntegrationCard({
  item, onConnect,
}: { item: typeof INTEGRATION_CATALOG[0]; onConnect: (id: string) => void }) {
  return (
    <div className="bg-[#111827] border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col gap-4 transition-all group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold shadow-inner border border-slate-700 shrink-0"
            style={{ backgroundColor: `${item.color}18`, borderColor: `${item.color}30` }}
          >
            <span className="text-base font-bold" style={{ color: item.color }}>{item.name[0]}</span>
          </div>
          <div className="min-w-0">
            <h4 className="font-semibold text-sm text-slate-200">{item.name}</h4>
            <p className="text-[10px] text-slate-500 capitalize">{item.category}</p>
          </div>
        </div>
        <StatusBadge status={item.status} />
      </div>

      <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>

      {item.status === "connected" && (
        <div className="flex items-center justify-between text-[10px] text-slate-500 bg-slate-900 rounded-xl px-3 py-2 border border-slate-800">
          <span className="flex items-center gap-1">
            <ArrowPathIcon className="w-2.5 h-2.5" />
            {item.lastSync ? `Synced ${format(item.lastSync, "h:mm a")}` : "Never synced"}
          </span>
          {item.records && <span className="text-slate-400 font-medium">{item.records}</span>}
        </div>
      )}

      <div className="flex gap-2 mt-auto">
        {item.status === "connected" ? (
          <>
            <Button size="sm" variant="outline" className="flex-1 h-8 text-xs border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800">
              <ArrowPathIcon className="w-3 h-3 mr-1.5" />Sync
            </Button>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-slate-500 hover:text-slate-300">
              <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
            </Button>
          </>
        ) : item.status === "error" ? (
          <Button size="sm" className="flex-1 h-8 text-xs bg-rose-600/20 text-rose-400 hover:bg-rose-600/30 border-0">
            Reconnect
          </Button>
        ) : (
          <Button size="sm" className="flex-1 h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => onConnect(item.id)}>
            <PlusIcon className="w-3 h-3 mr-1.5" />Connect
          </Button>
        )}
      </div>
    </div>
  );
});

export const Integrations = memo(function Integrations() {
  const { data: integrations, isLoading } = useIntegrations();
  const connectMut = useConnectIntegration();
  const [search, setSearch] = useState("");

  const connected = useMemo(() => INTEGRATION_CATALOG.filter(i => i.status === "connected").length, []);
  const errorCount = useMemo(() => INTEGRATION_CATALOG.filter(i => i.status === "error").length, []);

  if (isLoading || !integrations) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-sm text-slate-400">Loading your integrations...</p>
      </div>
    );
  }

  const handleConnect = (id: string) => {
    connectMut.mutate(id);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-100">Integrations Hub</h2>
          <p className="text-slate-400 mt-1">Connect your entire marketing stack for unified AI analysis.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-[#111827] border border-slate-800 rounded-xl text-sm text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-semibold text-emerald-400">{connected}</span>
            <span className="text-slate-500">connected</span>
            {errorCount > 0 && <>
              <span className="text-slate-700">·</span>
              <span className="font-semibold text-rose-400">{errorCount}</span>
              <span className="text-slate-500">error</span>
            </>}
          </div>
        </div>
      </div>

      {/* AI Banner */}
      <div className="rounded-2xl border border-indigo-500/20 bg-indigo-600/5 p-5">
        <div className="flex items-start gap-4">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/15 border border-indigo-500/20 flex items-center justify-center shrink-0">
            <BoltIcon className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-200 mb-0.5">AI CMO Integration Recommendation</p>
            <p className="text-sm text-slate-400 leading-relaxed">
              Connecting <span className="text-slate-200 font-medium">LinkedIn Ads</span> and <span className="text-slate-200 font-medium">Salesforce</span> would give your agents{" "}
              <span className="text-emerald-400 font-semibold">full-funnel attribution</span>. Estimated +23% improvement in campaign ROI.
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <Input
          placeholder="Search integrations..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9 bg-[#111827] border-slate-800 text-slate-200 placeholder:text-slate-500 h-9 focus:border-indigo-500"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all">
        <TabsList className="bg-[#111827] border border-slate-800 h-9 p-1 gap-0.5 flex-wrap">
          {TABS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="text-xs font-medium px-3 h-7 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-none text-slate-400"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {TABS.map((tab) => {
          const items = tab.value === "all"
            ? INTEGRATION_CATALOG.filter(i => !search || i.name.toLowerCase().includes(search.toLowerCase()))
            : INTEGRATION_CATALOG.filter(i => i.category === tab.value && (!search || i.name.toLowerCase().includes(search.toLowerCase())));

          return (
            <TabsContent key={tab.value} value={tab.value} className="mt-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {items.map((item) => (
                  <IntegrationCard key={item.id} item={item} onConnect={handleConnect} />
                ))}
              </div>
              {items.length === 0 && (
                <div className="text-center py-16 text-slate-500">
                  <p className="font-medium">No integrations found</p>
                  <p className="text-sm mt-1">Try adjusting your search</p>
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>

      {/* CTA Banner */}
      <div className="rounded-2xl border border-slate-800 bg-[#111827] p-6 text-center">
        <h3 className="font-bold text-slate-200 mb-2">Need a custom integration?</h3>
        <p className="text-sm text-slate-400 mb-4">Our API supports any data source. Connect your internal tools, data warehouse, or custom platform.</p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm">View API Docs</Button>
          <Button variant="outline" className="border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 text-sm">Request Integration</Button>
        </div>
      </div>
    </div>
  );
});
