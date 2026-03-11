import { useDashboardMetrics } from "@/hooks/use-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, Sparkles, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Button } from "@/components/ui/button";

export function Dashboard() {
  const { data: metrics, isLoading } = useDashboardMetrics();

  if (isLoading || !metrics) {
    return <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-display font-bold">Dashboard Overview</h2>
        <p className="text-muted-foreground mt-1">Your marketing performance at a glance.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title="MQL Count" value={formatNumber(metrics.mql)} trend={metrics.mqlTrend} />
        <KpiCard title="CAC" value={`$${metrics.cac}`} trend={metrics.cacTrend} invertTrend />
        <KpiCard title="Revenue Pipeline" value={formatCurrency(metrics.pipeline)} trend={metrics.pipelineTrend} />
        <KpiCard title="Conversion Rate" value={`${metrics.conversionRate}%`} trend={metrics.conversionTrend} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <Card className="lg:col-span-2 bg-card border-border/50 shadow-xl shadow-black/10 rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-border/50 pb-4 bg-card/50">
            <CardTitle className="text-lg">Pipeline Generation (90 Days)</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[300px] w-full pt-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* AI Recommendations */}
        <Card className="bg-card border-border/50 shadow-xl shadow-black/10 rounded-2xl flex flex-col">
          <CardHeader className="border-b border-border/50 pb-4 flex flex-row items-center gap-2 bg-primary/5">
            <Sparkles className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg m-0">AI Insights</CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex-1 flex flex-col gap-4">
            <div className="bg-background rounded-xl p-4 border border-border">
              <h4 className="font-semibold text-sm mb-1 text-foreground">Increase LinkedIn Budget</h4>
              <p className="text-xs text-muted-foreground mb-3">CPA is 15% lower than target. Reallocating from Meta will improve overall efficiency.</p>
              <Button size="sm" className="w-full text-xs bg-primary/10 text-primary hover:bg-primary/20">Apply Change</Button>
            </div>
            <div className="bg-background rounded-xl p-4 border border-border">
              <h4 className="font-semibold text-sm mb-1 text-foreground">A/B Test Email Subjects</h4>
              <p className="text-xs text-muted-foreground mb-3">Recent onboarding sequence has 4% drop in open rates vs historical average.</p>
              <Button size="sm" className="w-full text-xs bg-primary/10 text-primary hover:bg-primary/20">Draft Variants</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top Campaigns Table */}
        <Card className="lg:col-span-2 bg-card border-border/50 shadow-xl shadow-black/10 rounded-2xl">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle className="text-lg">Top Active Campaigns</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-card/50 text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-medium">Campaign</th>
                  <th className="px-6 py-4 font-medium">Channel</th>
                  <th className="px-6 py-4 font-medium text-right">Leads</th>
                  <th className="px-6 py-4 font-medium text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {metrics.topCampaigns?.map((camp, i) => (
                  <tr key={i} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">{camp.name}</td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="bg-background">{camp.channel}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right font-medium">{formatNumber(camp.leads || 0)}</td>
                    <td className="px-6 py-4 text-right text-emerald-400 font-semibold">{formatCurrency(camp.revenue || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Integration Health */}
        <Card className="bg-card border-border/50 shadow-xl shadow-black/10 rounded-2xl">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle className="text-lg">System Health</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {metrics.integrationHealth?.map((int, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-background border border-border">
                <span className="font-medium text-sm">{int.name}</span>
                {int.status === 'connected' ? (
                  <Badge className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-0"><CheckCircle2 className="w-3 h-3 mr-1" /> OK</Badge>
                ) : (
                  <Badge className="bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border-0"><AlertCircle className="w-3 h-3 mr-1" /> Error</Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KpiCard({ title, value, trend, invertTrend = false }: { title: string, value: string, trend?: number, invertTrend?: boolean }) {
  const isPositive = trend !== undefined && (invertTrend ? trend < 0 : trend > 0);
  
  return (
    <Card className="bg-card border-border/50 shadow-lg shadow-black/5 rounded-2xl hover:border-primary/30 transition-all duration-300">
      <CardContent className="p-6">
        <p className="text-sm font-medium text-muted-foreground mb-2">{title}</p>
        <div className="flex items-end justify-between">
          <h3 className="text-3xl font-display font-bold text-foreground">{value}</h3>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-md ${isPositive ? 'text-emerald-400 bg-emerald-400/10' : 'text-rose-400 bg-rose-400/10'}`}>
              {trend > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
