import { useState, memo } from "react";
import { useGenerateCreative } from "@/hooks/use-api";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Copy, Sparkles, CheckCircle2, Zap, TrendingUp, Star, Clock, PenTool, Bot } from "lucide-react";

const TEMPLATES = [
  { name: "SaaS Trial Email",       channel: "email",  tone: "professional", goal: "Drive free trial signups for our AI marketing platform targeting growth-stage SaaS companies",           badge: "🔥 Popular" },
  { name: "LinkedIn Thought Leader", channel: "social", tone: "bold",         goal: "Position our CEO as an AI marketing expert by sharing insights on replacing traditional marketing agencies", badge: "✨ High CTR" },
  { name: "Google Ads — ROAS",      channel: "ads",    tone: "urgent",       goal: "Drive demo bookings for our AI CMO platform targeting marketing directors with $50K+ budgets",            badge: "💰 High Conv." },
  { name: "Investor Outreach",       channel: "email",  tone: "professional", goal: "Introduce our $8M Series A and 2,400+ customer traction to potential Series B investors",                badge: "📈 New" },
  { name: "Churn Recovery",         channel: "email",  tone: "casual",       goal: "Re-engage churned customers with new features and a 30-day free comeback offer",                         badge: "🔄 Retention" },
  { name: "Product Hunt Launch",    channel: "social", tone: "bold",         goal: "Launch our AI CMO product on Product Hunt — drive upvotes and trial signups in first 24 hours",          badge: "🚀 Launch" },
];

const RECENT_CREATIVES = [
  { headline: "Stop paying $180K/year for an agency that barely moves the needle", channel: "LinkedIn", score: 94, time: "2h ago",    accent: "bg-blue-500" },
  { headline: "Your marketing team is 3 hires away from being replaced by AI",      channel: "Meta Ad",  score: 87, time: "Yesterday",  accent: "bg-rose-500" },
  { headline: "Re: Your 14-day trial — have you had a chance to connect HubSpot?",  channel: "Email",    score: 91, time: "2 days ago", accent: "bg-emerald-500" },
];

const VARIANT_ACCENTS = ["bg-indigo-500", "bg-violet-500", "bg-emerald-500"];

export const Creative = memo(function Creative() {
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
    <div className="flex h-[calc(100vh-5rem)] -m-6 lg:-m-8 overflow-hidden animate-in fade-in">

      {/* Left Panel — Input (40%) */}
      <div className="w-full lg:w-[40%] xl:w-[38%] flex-shrink-0 border-r border-slate-800 flex flex-col bg-[#111827] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <PenTool className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-100">Creative Studio</h2>
              <p className="text-xs text-slate-400">Brand voice active</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="p-5 border-b border-slate-800">
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-300">Campaign Goal</Label>
              <Textarea
                placeholder="e.g. Drive signups for our new AI feature targeting growth-stage SaaS companies..."
                value={goal}
                onChange={e => setGoal(e.target.value)}
                className="bg-slate-900 border-slate-700 text-slate-200 placeholder:text-slate-500 rounded-xl min-h-[100px] text-sm resize-none focus:border-indigo-500"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-300">Channel</Label>
                <Select value={channel} onValueChange={setChannel}>
                  <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-200 rounded-xl h-9 text-sm focus:border-indigo-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700">
                    <SelectItem value="email">Cold Email</SelectItem>
                    <SelectItem value="social">LinkedIn Post</SelectItem>
                    <SelectItem value="ads">Meta / Google Ad</SelectItem>
                    <SelectItem value="landing_page">Landing Page</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-300">Tone</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-200 rounded-xl h-9 text-sm focus:border-indigo-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700">
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="urgent">Urgent / FOMO</SelectItem>
                    <SelectItem value="bold">Bold & Disruptive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              type="submit"
              disabled={generateMutation.isPending || !goal}
              className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white h-10 text-sm font-semibold shadow-lg shadow-indigo-600/25 disabled:opacity-50"
            >
              {generateMutation.isPending
                ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Generating...</>
                : <><Sparkles className="w-4 h-4 mr-2" />Generate 3 Variants</>}
            </Button>
          </form>
        </div>

        {/* Quick Templates */}
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-3 px-1">Quick Templates</p>
          <div className="space-y-1">
            {TEMPLATES.map((t) => (
              <button
                key={t.name}
                onClick={() => useTemplate(t)}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/60 transition-colors text-left group border border-transparent hover:border-slate-700"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-300 group-hover:text-slate-100 transition-colors truncate">{t.name}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 capitalize">{t.channel} · {t.tone}</p>
                </div>
                <span className="text-[10px] shrink-0 ml-2">{t.badge}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Output (60%) */}
      <div className="flex-1 flex flex-col bg-[#0a0f1e] overflow-y-auto">
        {/* Output Header */}
        <div className="h-14 border-b border-slate-800 flex items-center justify-between px-6 bg-[#111827] shrink-0">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-semibold text-slate-200">Generated Output</span>
          </div>
          {generateMutation.data && (
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-500/10 text-emerald-400 border-0 text-xs">A/B Ready</Badge>
              <Button variant="ghost" size="sm" className="h-7 text-xs text-slate-400 hover:text-slate-200" onClick={() => generateMutation.reset()}>
                Generate New
              </Button>
            </div>
          )}
        </div>

        <div className="flex-1 p-6">
          {/* Empty / Recent */}
          {!generateMutation.data && !generateMutation.isPending && (
            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />Recently Generated
                </p>
                <div className="space-y-2.5">
                  {RECENT_CREATIVES.map((c) => (
                    <div
                      key={c.headline}
                      className="flex items-center overflow-hidden rounded-xl bg-[#111827] border border-slate-800 hover:border-slate-700 transition-colors group cursor-pointer"
                    >
                      <div className={`w-1 h-full self-stretch shrink-0 ${c.accent} opacity-70`} />
                      <div className="flex-1 min-w-0 px-4 py-3">
                        <p className="text-sm font-medium text-slate-200 truncate">{c.headline}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[10px] py-0 h-4 bg-transparent border-slate-700 text-slate-400">{c.channel}</Badge>
                          <span className="text-[10px] text-slate-500">{c.time}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 pr-4">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="text-xs font-bold text-amber-400">{c.score}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-indigo-400" />
                </div>
                <p className="text-slate-300 font-medium">Ready to generate</p>
                <p className="text-sm text-slate-500 mt-1">Fill in a campaign goal and click Generate</p>
              </div>
            </div>
          )}

          {/* Loading */}
          {generateMutation.isPending && (
            <div className="h-64 flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600/15 border border-indigo-500/20 flex items-center justify-center mb-5">
                <Loader2 className="w-7 h-7 text-indigo-400 animate-spin" />
              </div>
              <p className="text-base font-semibold text-slate-200">Crafting your variants...</p>
              <p className="text-sm text-slate-400 mt-1.5">Analysing brand voice, audience & channel best practices</p>
            </div>
          )}

          {/* Results */}
          {generateMutation.data && !generateMutation.isPending && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-100">Generated Variants</h3>
              {generateMutation.data.variants.map((v: any, i: number) => (
                <div
                  key={v.id}
                  className="bg-[#111827] border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden flex transition-all"
                >
                  <div className={`w-1 shrink-0 ${VARIANT_ACCENTS[i % VARIANT_ACCENTS.length]} opacity-70`} />
                  <div className="flex-1 p-5 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="border-slate-700 text-slate-400 bg-transparent text-xs">
                          Variant {String.fromCharCode(65 + i)}
                        </Badge>
                        {i === 0 && (
                          <Badge className="bg-indigo-600/20 text-indigo-400 border-0 text-xs">Top Performer</Badge>
                        )}
                      </div>
                      <button
                        onClick={() => copyToClipboard(v.id, `${v.headline}\n\n${v.body}\n\n${v.cta}`)}
                        className="shrink-0 w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-600 flex items-center justify-center transition-colors"
                      >
                        {copiedId === v.id
                          ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          : <Copy className="w-4 h-4 text-slate-400" />}
                      </button>
                    </div>
                    <h4 className="text-base font-semibold text-slate-100 leading-snug mb-3">{v.headline}</h4>
                    <p className="text-sm text-slate-400 whitespace-pre-wrap leading-relaxed mb-4">{v.body}</p>
                    <div className="flex items-center justify-between flex-wrap gap-3 pt-3 border-t border-slate-800">
                      <div className="font-semibold text-sm text-indigo-400 bg-indigo-600/10 px-3 py-1.5 rounded-lg">
                        {v.cta}
                      </div>
                      <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          Score: <span className="text-amber-400 font-bold">{v.score}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-emerald-400" />
                          Est. CTR: {(v.score * 0.04).toFixed(1)}%
                        </span>
                        <span>{v.wordCount}w</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
