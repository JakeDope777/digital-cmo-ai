import { useState } from "react";
import { useGenerateCreative } from "@/hooks/use-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Copy, Sparkles, CheckCircle2, Zap, TrendingUp, Star, Clock } from "lucide-react";

const TEMPLATES = [
  { name: "SaaS Trial Email", channel: "email", tone: "professional", goal: "Drive free trial signups for our AI marketing platform targeting growth-stage SaaS companies", badge: "🔥 Popular" },
  { name: "LinkedIn Thought Leader", channel: "social", tone: "bold", goal: "Position our CEO as an AI marketing expert by sharing insights on replacing traditional marketing agencies", badge: "✨ High CTR" },
  { name: "Google Ads — ROAS", channel: "ads", tone: "urgent", goal: "Drive demo bookings for our AI CMO platform targeting marketing directors with $50K+ budgets", badge: "💰 High Conv." },
  { name: "Investor Outreach", channel: "email", tone: "professional", goal: "Introduce our $8M Series A and 2,400+ customer traction to potential Series B investors", badge: "📈 New" },
  { name: "Churn Recovery", channel: "email", tone: "casual", goal: "Re-engage churned customers with new features and a 30-day free comeback offer", badge: "🔄 Retention" },
  { name: "Product Hunt Launch", channel: "social", tone: "bold", goal: "Launch our AI CMO product on Product Hunt — drive upvotes and trial signups in first 24 hours", badge: "🚀 Launch" },
];

const RECENT_CREATIVES = [
  { headline: "Stop paying $180K/year for an agency that barely moves the needle", channel: "LinkedIn", score: 94, time: "2h ago" },
  { headline: "Your marketing team is 3 hires away from being replaced by AI", channel: "Meta Ad", score: 87, time: "Yesterday" },
  { headline: "Re: Your 14-day trial — have you had a chance to connect HubSpot?", channel: "Email", score: 91, time: "2 days ago" },
];

export function Creative() {
  const [goal, setGoal] = useState("");
  const [channel, setChannel] = useState("email");
  const [tone, setTone] = useState("professional");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const generateMutation = useGenerateCreative();

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    generateMutation.mutate({ goal, channel, tone });
  };

  const useTemplate = (t: typeof TEMPLATES[0]) => {
    setGoal(t.goal);
    setChannel(t.channel);
    setTone(t.tone);
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-display font-bold">Creative Studio</h2>
          <p className="text-muted-foreground mt-1">AI-generated copy tailored to your brand voice and audience.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-card border border-border/50 rounded-full px-3 py-1.5">
          <Sparkles className="w-3 h-3 text-amber-400" />
          Brand voice active · Space Grotesk tone applied
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Left: Form + Templates */}
        <div className="lg:col-span-4 space-y-5">
          <Card className="bg-card border-border/50 shadow-xl rounded-2xl overflow-hidden sticky top-6">
            <CardHeader className="bg-primary/5 border-b border-border/50">
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                Campaign Brief
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <form onSubmit={handleGenerate} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Campaign Goal</Label>
                  <Textarea
                    placeholder="e.g. Drive signups for our new AI feature..."
                    value={goal}
                    onChange={e => setGoal(e.target.value)}
                    className="bg-background rounded-xl min-h-[90px] text-sm resize-none"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Channel</Label>
                    <Select value={channel} onValueChange={setChannel}>
                      <SelectTrigger className="bg-background rounded-xl h-9 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Cold Email</SelectItem>
                        <SelectItem value="social">LinkedIn Post</SelectItem>
                        <SelectItem value="ads">Meta / Google Ad</SelectItem>
                        <SelectItem value="landing_page">Landing Page</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Tone</Label>
                    <Select value={tone} onValueChange={setTone}>
                      <SelectTrigger className="bg-background rounded-xl h-9 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="urgent">Urgent / FOMO</SelectItem>
                        <SelectItem value="bold">Bold & Disruptive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" disabled={generateMutation.isPending || !goal} className="w-full rounded-xl bg-primary hover:bg-primary/90 text-white h-10 text-sm font-semibold shadow-lg shadow-primary/20">
                  {generateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Sparkles className="w-4 h-4 mr-2" />Generate 3 Variants</>}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Quick Templates */}
          <Card className="bg-card border-border/50 rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-border/50 pb-3">
              <CardTitle className="text-sm text-muted-foreground">Quick Templates</CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-1.5">
              {TEMPLATES.map((t) => (
                <button
                  key={t.name}
                  onClick={() => useTemplate(t)}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-muted/30 transition-colors text-left group"
                >
                  <div>
                    <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">{t.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{t.channel} · {t.tone}</p>
                  </div>
                  <span className="text-[10px] shrink-0 ml-2">{t.badge}</span>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right: Results */}
        <div className="lg:col-span-8 space-y-6">

          {/* Recent */}
          {!generateMutation.data && !generateMutation.isPending && (
            <Card className="bg-card border-border/50 rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-border/50 pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  Recently Generated
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {RECENT_CREATIVES.map((c) => (
                  <div key={c.headline} className="flex items-center justify-between p-3 rounded-xl bg-background border border-border/50 hover:border-primary/20 transition-colors group cursor-pointer">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{c.headline}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[10px] py-0 h-4 bg-transparent">{c.channel}</Badge>
                        <span className="text-[10px] text-muted-foreground">{c.time}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 ml-3">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span className="text-xs font-bold text-amber-400">{c.score}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Loading */}
          {generateMutation.isPending && (
            <div className="h-72 flex flex-col items-center justify-center border-2 border-dashed border-primary/20 rounded-2xl bg-primary/3">
              <div className="relative mb-5">
                <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center">
                  <Loader2 className="w-7 h-7 text-primary animate-spin" />
                </div>
              </div>
              <p className="text-base font-semibold text-foreground">Crafting your variants...</p>
              <p className="text-sm text-muted-foreground mt-1">Analysing your brand voice, audience & channel best practices</p>
            </div>
          )}

          {/* Results */}
          {generateMutation.data && !generateMutation.isPending && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Generated Variants</h3>
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-0">A/B Ready</Badge>
                  <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => generateMutation.reset()}>Generate New</Button>
                </div>
              </div>

              {generateMutation.data.variants.map((v: any, i: number) => (
                <Card key={v.id} className={`bg-card border-border/50 hover:border-primary/30 transition-all ${i === 0 ? "ring-1 ring-primary/20 shadow-lg shadow-primary/10" : ""}`}>
                  <CardHeader className="pb-3 flex flex-row items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="bg-background text-xs">Variant {String.fromCharCode(65 + i)}</Badge>
                        {i === 0 && <Badge className="bg-primary/10 text-primary border-0 text-xs">Top Performer</Badge>}
                      </div>
                      <CardTitle className="text-base leading-snug text-foreground">{v.headline}</CardTitle>
                    </div>
                    <Button
                      variant="ghost" size="icon"
                      onClick={() => copyToClipboard(v.id, `${v.headline}\n\n${v.body}\n\n${v.cta}`)}
                      className="shrink-0 text-muted-foreground hover:text-foreground"
                    >
                      {copiedId === v.id ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed mb-4">{v.body}</p>
                    <div className="flex items-center justify-between flex-wrap gap-3 pt-3 border-t border-border/30">
                      <div className="font-semibold text-sm text-primary bg-primary/10 px-3 py-1.5 rounded-lg">{v.cta}</div>
                      <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          Score: <span className="text-amber-400 font-bold">{v.score}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-emerald-400" />
                          Est. CTR: {(v.score * 0.04).toFixed(1)}%
                        </span>
                        <span>{v.wordCount} words</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
