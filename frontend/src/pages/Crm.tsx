import { useState } from "react";
import { useLeads, useCreateLead } from "@/hooks/use-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { Search, Plus, Filter, MoreHorizontal, Mail, Phone, Loader2, Zap } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function Crm() {
  const { data: leads, isLoading } = useLeads();
  const createLead = useCreateLead();
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [newLeadName, setNewLeadName] = useState("");

  if (isLoading || !leads) {
    return <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createLead.mutateAsync({ name: newLeadName, company: "New Co", value: 5000 });
    setNewLeadName("");
  };

  const getStageColor = (stage: string) => {
    const map: Record<string, string> = {
      'new': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      'qualified': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      'proposal': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      'closed': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    };
    return map[stage] || 'bg-border text-foreground';
  };

  return (
    <div className="animate-in fade-in duration-500 flex h-[calc(100vh-10rem)] gap-6">
      {/* Main Table Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${selectedLead ? 'hidden lg:flex' : 'flex'}`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-display font-bold">CRM & Leads</h2>
            <p className="text-muted-foreground mt-1">Manage your pipeline and AI-driven outreach.</p>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-md">
                <Plus className="w-4 h-4 mr-2" /> Add Lead
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border sm:max-w-md">
              <DialogHeader><DialogTitle>Add New Lead</DialogTitle></DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 pt-4">
                <Input placeholder="Lead Name" value={newLeadName} onChange={e => setNewLeadName(e.target.value)} className="bg-background" required />
                <Button type="submit" disabled={createLead.isPending} className="w-full bg-primary">{createLead.isPending ? "Adding..." : "Add Lead"}</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="flex-1 bg-card border-border/50 shadow-xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border/50 flex gap-4 bg-card/50">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              <Input placeholder="Search leads..." className="pl-9 bg-background border-border/50" />
            </div>
            <Button variant="outline" className="bg-background border-border/50"><Filter className="w-4 h-4 mr-2"/> Filters</Button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-card/50 text-muted-foreground sticky top-0 backdrop-blur-md">
                <tr>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Company</th>
                  <th className="px-6 py-4 font-medium">Stage</th>
                  <th className="px-6 py-4 font-medium text-right">Value</th>
                  <th className="px-6 py-4 font-medium text-right">Last Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {leads.map((lead: any) => (
                  <tr key={lead.id} 
                      onClick={() => setSelectedLead(lead)}
                      className={`cursor-pointer transition-colors ${selectedLead?.id === lead.id ? 'bg-primary/5 border-l-2 border-l-primary' : 'hover:bg-muted/20 border-l-2 border-l-transparent'}`}>
                    <td className="px-6 py-4 font-medium text-foreground">{lead.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">{lead.company}</td>
                    <td className="px-6 py-4"><Badge className={`border ${getStageColor(lead.stage)} capitalize px-2.5 py-0.5`}>{lead.stage}</Badge></td>
                    <td className="px-6 py-4 text-right font-medium">{formatCurrency(lead.value)}</td>
                    <td className="px-6 py-4 text-right text-muted-foreground">{format(new Date(lead.lastContact), 'MMM d, yyyy')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Side Panel */}
      {selectedLead && (
        <Card className="w-full lg:w-[400px] flex-shrink-0 bg-card border-border/50 shadow-2xl flex flex-col h-full animate-in slide-in-from-right-8 duration-300">
          <CardHeader className="border-b border-border/50 pb-4 relative">
            <button onClick={() => setSelectedLead(null)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground lg:hidden">✕</button>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-lg">
                {selectedLead.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <CardTitle className="text-xl">{selectedLead.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{selectedLead.company}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="flex gap-2">
              <Button className="flex-1 bg-primary text-white hover:bg-primary/90"><Mail className="w-4 h-4 mr-2"/> Email</Button>
              <Button variant="outline" className="flex-1 bg-background border-border/50"><Phone className="w-4 h-4 mr-2"/> Call</Button>
              <Button variant="outline" size="icon" className="bg-background border-border/50"><MoreHorizontal className="w-4 h-4"/></Button>
            </div>

            <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
              <div className="flex items-center gap-2 text-primary font-semibold mb-2">
                <Zap className="w-4 h-4" /> AI Suggestion
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed mb-4">{selectedLead.aiSuggestion}</p>
              <Button size="sm" className="w-full bg-primary hover:bg-primary/90">Execute Suggestion</Button>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Contact Details</h4>
              <div>
                <div className="text-xs text-muted-foreground">Email</div>
                <div className="text-sm font-medium">{selectedLead.email || 'N/A'}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Source</div>
                <div className="text-sm font-medium">{selectedLead.source}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Deal Value</div>
                <div className="text-sm font-medium text-emerald-400">{formatCurrency(selectedLead.value)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
