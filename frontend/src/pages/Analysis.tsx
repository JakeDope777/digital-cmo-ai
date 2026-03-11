import { useMarketAnalysis, useCompetitors } from "@/hooks/use-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Target, TrendingUp, AlertTriangle, Lightbulb } from "lucide-react";

export function Analysis() {
  const { data: analysis, isLoading: loadingAnalysis } = useMarketAnalysis();
  const { data: competitors, isLoading: loadingComps } = useCompetitors();

  if (loadingAnalysis || loadingComps || !analysis || !competitors) {
    return <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-display font-bold">Market Analysis</h2>
          <p className="text-muted-foreground mt-1">Real-time intelligence on your industry and competitors.</p>
        </div>
        <div className="flex gap-4">
          <Card className="bg-card px-6 py-3 border-border/50">
            <div className="text-sm text-muted-foreground font-medium">Market Size</div>
            <div className="text-2xl font-bold text-foreground mt-1">{analysis.marketSize}</div>
          </Card>
          <Card className="bg-card px-6 py-3 border-border/50">
            <div className="text-sm text-muted-foreground font-medium">Growth Rate</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{analysis.growthRate}</div>
          </Card>
        </div>
      </div>

      {/* SWOT Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-primary/5 border-primary/20 shadow-lg shadow-primary/5">
          <CardHeader className="pb-2 flex flex-row items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Strengths</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {analysis.swot?.strengths?.map((s, i) => (
                <li key={i} className="flex items-center text-sm font-medium"><div className="w-1.5 h-1.5 rounded-full bg-primary mr-3" />{s}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
        
        <Card className="bg-rose-500/5 border-rose-500/20 shadow-lg shadow-rose-500/5">
          <CardHeader className="pb-2 flex flex-row items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            <CardTitle className="text-lg">Weaknesses</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {analysis.swot?.weaknesses?.map((w, i) => (
                <li key={i} className="flex items-center text-sm font-medium"><div className="w-1.5 h-1.5 rounded-full bg-rose-400 mr-3" />{w}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-emerald-500/5 border-emerald-500/20 shadow-lg shadow-emerald-500/5">
          <CardHeader className="pb-2 flex flex-row items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <CardTitle className="text-lg">Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {analysis.swot?.opportunities?.map((o, i) => (
                <li key={i} className="flex items-center text-sm font-medium"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-3" />{o}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-amber-500/5 border-amber-500/20 shadow-lg shadow-amber-500/5">
          <CardHeader className="pb-2 flex flex-row items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-400" />
            <CardTitle className="text-lg">Threats</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {analysis.swot?.threats?.map((t, i) => (
                <li key={i} className="flex items-center text-sm font-medium"><div className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-3" />{t}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <h3 className="text-2xl font-display font-bold mt-12">Top Competitors</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {competitors.map((comp, i) => (
          <Card key={i} className="bg-card border-border/50">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{comp.name}</CardTitle>
                  <p className="text-sm text-primary mt-1">{comp.website}</p>
                </div>
                <Badge variant="outline" className="bg-background">{comp.estimatedRevenue}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground italic mb-4">"{comp.positioning}"</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-2">Strengths</div>
                  <ul className="space-y-1 text-sm">
                    {comp.strengths?.map((s, j) => <li key={j}>• {s}</li>)}
                  </ul>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-rose-400 mb-2">Weaknesses</div>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {comp.weaknesses?.map((w, j) => <li key={j}>• {w}</li>)}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
