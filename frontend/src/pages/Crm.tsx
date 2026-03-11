import { useState } from "react";
import { useLeads, useCreateLead } from "@/hooks/use-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import {
  MagnifyingGlassIcon, PlusIcon, FunnelIcon, EnvelopeIcon, PhoneIcon,
  BoltIcon, UsersIcon, ArrowTrendingUpIcon, CurrencyDollarIcon,
  ListBulletIcon, ViewColumnsIcon, ArrowRightIcon, StarIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { fadeUp, stagger } from "@/lib/motion";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const PIPELINE_STAGES = ["new", "qualified", "proposal", "closed"];
const STAGE_LABELS: Record<string, string> = { new: "New Leads", qualified: "Qualified", proposal: "Proposal Sent", closed: "Closed Won" };
const STAGE_COLORS: Record<string, string> = {
  new: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  qualified: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  proposal: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  closed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};
const STAGE_DOT: Record<string, string> = { new: "bg-blue-400", qualified: "bg-amber-400", proposal: "bg-violet-400", closed: "bg-emerald-400" };
const LEAD_SCORES: Record<string, number> = {};

function scoreColor(score: number) {
  if (score >= 80) return "text-emerald-400";
  if (score >= 60) return "text-amber-400";
  return "text-rose-400";
}

export function Crm() {
  const { data: leads, isLoading } = useLeads();
  const createLead = useCreateLead();
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [newLeadName, setNewLeadName] = useState("");
  const [view, setView] = useState<"table" | "kanban">("table");
  const [search, setSearch] = useState("");

  if (isLoading || !leads) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">CRM Agent loading your pipeline...</p>
      </div>
    );
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createLead.mutateAsync({ name: newLeadName, company: "New Co", value: 5000 });
    setNewLeadName("");
  };

  const filtered = leads.filter((l: any) =>
    l.name.toLowerCase().includes(search.toLowerCase()) || l.company.toLowerCase().includes(search.toLowerCase())
  );

  const totalPipeline = leads.reduce((s: number, l: any) => s + l.value, 0);
  const closedRevenue = leads.filter((l: any) => l.stage === "closed").reduce((s: number, l: any) => s + l.value, 0);
  const newLeads = leads.filter((l: any) => l.stage === "new").length;

  const getScore = (lead: any) => LEAD_SCORES[lead.id] ?? (lead.id.charCodeAt(0) % 40) + 55;

  return (
    <div className="animate-in fade-in duration-500 flex flex-col h-full gap-6 min-h-0">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3 shrink-0">
        <div>
          <h2 className="text-3xl font-display font-bold">CRM & Pipeline</h2>
          <p className="text-muted-foreground mt-1">AI-scored leads and autonomous outreach management.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-card border border-border/50 rounded-xl overflow-hidden">
            {(["table", "kanban"] as const).map((v) => (
              <button key={v} onClick={() => setView(v)} className={`px-3 py-2 flex items-center gap-1.5 text-xs font-semibold transition-colors ${view === v ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"}`}>
                {v === "table" ? <ListBulletIcon className="w-3.5 h-3.5" /> : <ViewColumnsIcon className="w-3.5 h-3.5" />}
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-md h-9 text-sm">
                <PlusIcon className="w-4 h-4 mr-1.5" />Add Lead
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader><DialogTitle>Add New Lead</DialogTitle></DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 pt-4">
                <Input placeholder="Lead Name" value={newLeadName} onChange={e => setNewLeadName(e.target.value)} className="bg-background" required />
                <Button type="submit" disabled={createLead.isPending} className="w-full bg-primary">{createLead.isPending ? "Adding..." : "Add Lead"}</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
        {[
          { label: "Total Pipeline", val: formatCurrency(totalPipeline), icon: DollarSign, color: "text-primary" },
          { label: "Closed Revenue",  val: formatCurrency(closedRevenue),  icon: TrendingUp, color: "text-emerald-400" },
          { label: "Total Leads",     val: leads.length,                   icon: Users,      color: "text-sky-400" },
          { label: "New This Week",   val: newLeads,                       icon: Star,       color: "text-amber-400" },
        ].map((k) => (
          <div key={k.label} className="bg-card border border-border/50 rounded-2xl p-4 flex items-center gap-3 hover:border-primary/20 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-muted/50 flex items-center justify-center shrink-0">
              <k.icon className={`w-4 h-4 ${k.color}`} />
            </div>
            <div>
              <p className="text-lg font-bold font-mono text-foreground">{k.val}</p>
              <p className="text-[10px] text-muted-foreground">{k.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="flex gap-5 flex-1 min-h-0">

        {/* Table / Kanban */}
        <div className={`flex-1 min-w-0 flex flex-col transition-all ${selectedLead ? "hidden lg:flex" : "flex"}`}>

          {/* Search bar */}
          <div className="mb-4 flex gap-3 shrink-0">
            <div className="relative flex-1 max-w-sm">
              <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search leads..." className="pl-9 bg-card border-border/50 h-9 text-sm" />
            </div>
            <Button variant="outline" className="bg-background border-border/50 h-9 text-xs"><FunnelIcon className="w-3.5 h-3.5 mr-1.5" />Filters</Button>
          </div>

          {view === "table" && (
            <Card className="flex-1 bg-card border-border/50 shadow-xl overflow-hidden flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-card/80 text-muted-foreground sticky top-0 backdrop-blur-md border-b border-border/50">
                    <tr>
                      {["Lead", "Company", "Score", "Stage", "Value", "Last Contact"].map((h) => (
                        <th key={h} className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {filtered.map((lead: any) => {
                      const score = getScore(lead);
                      return (
                        <tr
                          key={lead.id}
                          onClick={() => setSelectedLead(lead)}
                          className={`cursor-pointer transition-colors ${selectedLead?.id === lead.id ? "bg-primary/5 border-l-2 border-l-primary" : "hover:bg-muted/20 border-l-2 border-l-transparent"}`}
                        >
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                                {lead.name.substring(0, 2).toUpperCase()}
                              </div>
                              <span className="font-semibold text-foreground">{lead.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-muted-foreground">{lead.company}</td>
                          <td className="px-5 py-3.5">
                            <span className={`font-bold font-mono text-sm ${scoreColor(score)}`}>{score}</span>
                          </td>
                          <td className="px-5 py-3.5">
                            <Badge className={`border ${STAGE_COLORS[lead.stage]} capitalize px-2 py-0.5 text-xs`}>{lead.stage}</Badge>
                          </td>
                          <td className="px-5 py-3.5 font-mono font-semibold text-foreground">{formatCurrency(lead.value)}</td>
                          <td className="px-5 py-3.5 text-muted-foreground text-xs">{format(new Date(lead.lastContact), "MMM d, yyyy")}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {view === "kanban" && (
            <div className="flex gap-4 flex-1 min-h-0 overflow-x-auto pb-2">
              {PIPELINE_STAGES.map((stage) => {
                const stageLeads = filtered.filter((l: any) => l.stage === stage);
                const stageValue = stageLeads.reduce((s: number, l: any) => s + l.value, 0);
                return (
                  <div key={stage} className="min-w-[220px] flex-1 flex flex-col gap-3">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${STAGE_DOT[stage]}`} />
                        <span className="text-xs font-semibold text-foreground">{STAGE_LABELS[stage]}</span>
                        <span className="text-[10px] text-muted-foreground bg-muted rounded-full px-1.5">{stageLeads.length}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono">{formatCurrency(stageValue)}</span>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                      {stageLeads.map((lead: any) => (
                        <div
                          key={lead.id}
                          onClick={() => setSelectedLead(lead)}
                          className={`bg-card border rounded-xl p-3.5 cursor-pointer transition-all hover:border-primary/30 hover:shadow-md ${selectedLead?.id === lead.id ? "border-primary/50 bg-primary/5" : "border-border/50"}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-foreground">{lead.name}</span>
                            <span className={`text-[10px] font-bold font-mono ${scoreColor(getScore(lead))}`}>{getScore(lead)}</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground mb-2">{lead.company}</p>
                          <p className="text-xs font-bold text-primary font-mono">{formatCurrency(lead.value)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Side Panel */}
        {selectedLead && (
          <Card className="w-full lg:w-[360px] flex-shrink-0 bg-card border-border/50 shadow-2xl flex flex-col h-full animate-in slide-in-from-right-8 duration-300 min-h-0">
            <CardHeader className="border-b border-border/50 pb-4 relative shrink-0">
              <button onClick={() => setSelectedLead(null)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground lg:hidden">✕</button>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-primary/15 text-primary flex items-center justify-center font-bold text-base">
                  {selectedLead.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <CardTitle className="text-base">{selectedLead.name}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">{selectedLead.company}</p>
                </div>
              </div>
              <div className="flex gap-1.5 mt-3 flex-wrap">
                <Badge className={`border ${STAGE_COLORS[selectedLead.stage]} capitalize text-xs`}>{selectedLead.stage}</Badge>
                <Badge variant="outline" className="bg-background text-xs">{selectedLead.source}</Badge>
                <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded border bg-background ${scoreColor(getScore(selectedLead))} border-current/20`}>
                  Score: {getScore(selectedLead)}
                </span>
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-5 space-y-5">
              <div className="flex gap-2">
                <Button size="sm" className="flex-1 bg-primary text-white hover:bg-primary/90 h-8 text-xs">
                  <EnvelopeIcon className="w-3.5 h-3.5 mr-1.5" />Email
                </Button>
                <Button size="sm" variant="outline" className="flex-1 bg-background border-border/50 h-8 text-xs">
                  <PhoneIcon className="w-3.5 h-3.5 mr-1.5" />Call
                </Button>
              </div>

              {/* AI Suggestion */}
              <div className="bg-primary/8 border border-primary/20 rounded-xl p-4">
                <div className="flex items-center gap-2 text-primary font-semibold text-xs mb-2">
                  <BoltIcon className="w-3.5 h-3.5" />AI Recommendation
                </div>
                <p className="text-xs text-foreground/80 leading-relaxed mb-3">{selectedLead.aiSuggestion}</p>
                <Button size="sm" className="w-full bg-primary hover:bg-primary/90 h-7 text-xs">
                  Execute <ArrowRightIcon className="w-3 h-3 ml-1" />
                </Button>
              </div>

              {/* Details */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Contact Details</p>
                {[
                  { label: "Email", val: selectedLead.email || "N/A" },
                  { label: "Source", val: selectedLead.source },
                  { label: "Deal Value", val: formatCurrency(selectedLead.value), class: "text-emerald-400 font-mono font-bold" },
                  { label: "Last Contact", val: format(new Date(selectedLead.lastContact), "MMM d, yyyy") },
                ].map((d) => (
                  <div key={d.label} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
                    <span className="text-xs text-muted-foreground">{d.label}</span>
                    <span className={`text-xs font-semibold ${d.class || "text-foreground"}`}>{d.val}</span>
                  </div>
                ))}
              </div>

              {/* Activity Timeline */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Activity</p>
                <div className="space-y-3 relative pl-4 before:absolute before:left-1.5 before:top-1 before:bottom-1 before:w-px before:bg-border/50">
                  {[
                    { action: "AI sent follow-up email", time: "2h ago", icon: Mail },
                    { action: "Opened proposal PDF", time: "Yesterday", icon: TrendingUp },
                    { action: "Demo call booked", time: "3 days ago", icon: Phone },
                  ].map((a, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-3 h-3 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0 mt-0.5 relative z-10">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-foreground">{a.action}</p>
                        <p className="text-[10px] text-muted-foreground">{a.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
