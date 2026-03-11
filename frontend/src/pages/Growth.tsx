import { useGrowthData } from "@/hooks/use-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatNumber } from "@/lib/utils";
import { Loader2, ArrowRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export function Growth() {
  const { data, isLoading } = useGrowthData();

  if (isLoading || !data) {
    return <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-display font-bold">Growth & Funnel</h2>
        <p className="text-muted-foreground mt-1">Optimize conversion rates across your entire customer journey.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Funnel Chart */}
        <Card className="bg-card border-border/50 shadow-xl rounded-2xl">
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.funnel} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="stage" type="category" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--foreground))', fontSize: 12}} width={120} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={32}>
                    {data.funnel.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={`hsl(var(--primary) / ${1 - index * 0.15})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* A/B Tests */}
        <Card className="bg-card border-border/50 shadow-xl rounded-2xl">
          <CardHeader>
            <CardTitle>Active A/B Tests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {data.abTests?.map((test: any) => (
              <div key={test.id} className="bg-background rounded-xl p-5 border border-border">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-foreground">{test.name}</h4>
                  <Badge className={test.status === 'running' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}>
                    {test.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-card p-3 rounded-lg border border-border/50">
                    <div className="text-xs text-muted-foreground mb-1">Variant A (Control)</div>
                    <div className="font-medium text-sm">"{test.variantA}"</div>
                    <div className="mt-2 text-lg font-bold text-foreground">{test.winnerConversionA}%</div>
                  </div>
                  <div className={`bg-card p-3 rounded-lg border ${test.winnerConversionB > test.winnerConversionA ? 'border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'border-border/50'}`}>
                    <div className="text-xs text-muted-foreground mb-1 flex justify-between">
                      Variant B {test.winnerConversionB > test.winnerConversionA && <span className="text-emerald-400 font-bold">Winner</span>}
                    </div>
                    <div className="font-medium text-sm">"{test.variantB}"</div>
                    <div className="mt-2 text-lg font-bold text-emerald-400">{test.winnerConversionB}%</div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
