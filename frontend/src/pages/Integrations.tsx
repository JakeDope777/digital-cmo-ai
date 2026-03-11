import { useIntegrations, useConnectIntegration } from "@/hooks/use-api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, Clock, Zap, RefreshCw, Plus, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

const INTEGRATION_CATALOG = [
  { id: "hubspot",    name: "HubSpot",          category: "CRM",       desc: "Sync contacts, deals, and marketing campaigns bidirectionally.", color: "#ff7a59", status: "connected", lastSync: new Date(Date.now() - 180000), records: "12,840" },
  { id: "ga4",        name: "Google Analytics", category: "Analytics", desc: "Pull traffic, conversions, and attribution data in real-time.", color: "#e37400", status: "connected", lastSync: new Date(Date.now() - 300000), records: "847K events" },
  { id: "stripe",     name: "Stripe",           category: "Revenue",   desc: "Connect revenue data for full-funnel ROI attribution.", color: "#6772e5", status: "connected", lastSync: new Date(Date.now() - 600000), records: "$248K MRR" },
  { id: "gads",       name: "Google Ads",       category: "Ads",       desc: "Automate bidding optimisation and pull ROAS data.", color: "#4285f4", status: "connected", lastSync: new Date(Date.now() - 900000), records: "14 campaigns" },
  { id: "metaads",    name: "Meta Ads",         category: "Ads",       desc: "Sync Facebook/Instagram campaigns and creative performance.", color: "#1877f2", status: "error",     lastSync: new Date(Date.now() - 3600000), records: null },
  { id: "salesforce", name: "Salesforce",       category: "CRM",       desc: "Push qualified leads and opportunity data from AI campaigns.", color: "#00a1e0", status: "disconnected", lastSync: null, records: null },
  { id: "linkedin",   name: "LinkedIn Ads",     category: "Ads",       desc: "B2B demand gen — sync lead gen forms and company targeting.", color: "#0077b5", status: "disconnected", lastSync: null, records: null },
  { id: "mailchimp",  name: "Mailchimp",        category: "Email",     desc: "Sync audiences and automate triggered email flows.", color: "#ffe01b", status: "disconnected", lastSync: null, records: null },
  { id: "slack",      name: "Slack",            category: "Alerts",    desc: "Receive AI CMO alerts, campaign reports, and anomaly notifications.", color: "#4a154b", status: "connected", lastSync: new Date(Date.now() - 60000), records: "Live" },
  { id: "shopify",    name: "Shopify",          category: "eComm",     desc: "Connect storefront revenue, product data and ad attribution.", color: "#96bf48", status: "disconnected", lastSync: null, records: null },
  { id: "notion",     name: "Notion",           category: "Docs",      desc: "Export campaign briefs, reports and strategies to Notion.", color: "#ffffff", status: "disconnected", lastSync: null, records: null },
  { id: "zapier",     name: "Zapier",           category: "Automation",desc: "Build custom automation workflows with 5,000+ apps.", color: "#ff4f00", status: "connected", lastSync: new Date(Date.now() - 1800000), records: "12 zaps" },
];

const CATEGORIES = ["All", "CRM", "Analytics", "Ads", "Revenue", "Email", "Alerts", "eComm", "Automation", "Docs"];

export function Integrations() {
  const { data: integrations, isLoading } = useIntegrations();
  const connectMut = useConnectIntegration();
  const [filter, setFilter] = useState("All");

  if (isLoading || !integrations) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading your integrations...</p>
      </div>
    );
  }

  const filtered = filter === "All" ? INTEGRATION_CATALOG : INTEGRATION_CATALOG.filter(i => i.category === filter);
  const connected = INTEGRATION_CATALOG.filter(i => i.status === "connected").length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold">Integrations Hub</h2>
          <p className="text-muted-foreground mt-1">Connect your entire marketing stack for unified AI analysis.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-center px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <p className="text-[10px] text-emerald-400 font-semibold uppercase">Connected</p>
            <p className="text-2xl font-bold text-emerald-400">{connected}</p>
          </div>
          <div className="text-center px-4 py-2 bg-card border border-border/50 rounded-xl">
            <p className="text-[10px] text-muted-foreground font-semibold uppercase">Available</p>
            <p className="text-2xl font-bold text-foreground">{INTEGRATION_CATALOG.length}</p>
          </div>
        </div>
      </div>

      {/* Data flow banner */}
      <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4 flex items-center gap-4">
        <Zap className="w-5 h-5 text-primary shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">Unified Data Pipeline Active</p>
          <p className="text-xs text-muted-foreground mt-0.5">HubSpot + GA4 + Stripe are syncing in real-time. AI agents are using this data for live campaign optimisation.</p>
        </div>
        <Button size="sm" variant="outline" className="shrink-0 h-7 text-xs gap-1.5">
          <RefreshCw className="w-3 h-3" />Force Sync
        </Button>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filter === cat ? "bg-primary text-white shadow-lg shadow-primary/25" : "bg-card border border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground"}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Integration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((int) => (
          <div key={int.id} className="bg-card border border-border/50 rounded-2xl p-5 hover:border-primary/25 hover:shadow-lg hover:shadow-black/10 transition-all group flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base text-background shadow-sm"
                  style={{ backgroundColor: int.color }}
                >
                  {int.name[0]}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">{int.name}</h3>
                  <Badge variant="outline" className="text-[10px] py-0 h-4 bg-transparent mt-0.5">{int.category}</Badge>
                </div>
              </div>
              <div>
                {int.status === "connected" && (
                  <div className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-[10px] font-bold">Live</span>
                  </div>
                )}
                {int.status === "error" && (
                  <div className="flex items-center gap-1 text-rose-400">
                    <XCircle className="w-4 h-4" />
                    <span className="text-[10px] font-bold">Error</span>
                  </div>
                )}
                {int.status === "disconnected" && (
                  <div className="flex items-center gap-1 text-muted-foreground/50">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                    <span className="text-[10px]">Off</span>
                  </div>
                )}
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed flex-1 mb-4">{int.desc}</p>

            {int.records && (
              <div className="mb-3 text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1.5 rounded-lg inline-block">{int.records} synced</div>
            )}

            <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/30">
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                {int.lastSync ? (
                  <><Clock className="w-2.5 h-2.5" />Synced {format(int.lastSync, "HH:mm")}</>
                ) : (
                  "Never synced"
                )}
              </span>
              {int.status === "disconnected" && (
                <Button
                  size="sm"
                  onClick={() => connectMut.mutate(int.id)}
                  disabled={connectMut.isPending}
                  className="h-7 px-3 text-xs bg-primary hover:bg-primary/90 text-white"
                >
                  {connectMut.isPending && connectMut.variables === int.id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <><Plus className="w-3 h-3 mr-1" />Connect</>
                  )}
                </Button>
              )}
              {int.status === "error" && (
                <Button size="sm" variant="destructive" className="h-7 px-3 text-xs">
                  Reconnect
                </Button>
              )}
              {int.status === "connected" && (
                <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground">
                  Manage <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-muted-foreground/50">200+ integrations available · Custom webhook & API connector available on Scale plan</p>
    </div>
  );
}
