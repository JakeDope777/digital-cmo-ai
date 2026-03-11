import { useIntegrations, useConnectIntegration } from "@/hooks/use-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowRight } from "lucide-react";
import { format } from "date-fns";

export function Integrations() {
  const { data: integrations, isLoading } = useIntegrations();
  const connectMut = useConnectIntegration();

  if (isLoading || !integrations) {
    return <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-display font-bold">Integrations</h2>
        <p className="text-muted-foreground mt-1">Connect your data sources for AI analysis.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((int: any) => (
          <Card key={int.id} className="bg-card border-border/50 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 rounded-2xl flex flex-col">
            <CardContent className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-background border border-border rounded-xl flex items-center justify-center font-bold text-lg text-primary shadow-sm">
                  {int.icon.substring(0, 1)}
                </div>
                {int.status === 'connected' ? (
                  <Badge className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-0">Connected</Badge>
                ) : int.status === 'error' ? (
                  <Badge className="bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border-0">Needs Auth</Badge>
                ) : (
                  <Badge variant="outline" className="bg-background text-muted-foreground">Not Connected</Badge>
                )}
              </div>
              
              <h3 className="font-bold text-lg text-foreground mb-2">{int.name}</h3>
              <p className="text-sm text-muted-foreground flex-1 mb-6">{int.description}</p>
              
              <div className="flex items-center justify-between mt-auto">
                <span className="text-xs text-muted-foreground">
                  {int.lastSync ? `Last sync: ${format(new Date(int.lastSync), 'MMM d, HH:mm')}` : 'Never synced'}
                </span>
                {int.status !== 'connected' && (
                  <Button 
                    size="sm" 
                    onClick={() => connectMut.mutate(int.id)}
                    disabled={connectMut.isPending}
                    className="bg-primary/10 text-primary hover:bg-primary/20"
                  >
                    {connectMut.isPending && connectMut.variables === int.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Connect'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
