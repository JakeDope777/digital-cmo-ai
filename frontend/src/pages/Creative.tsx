import { useState } from "react";
import { useGenerateCreative } from "@/hooks/use-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Copy, Sparkles, CheckCircle2 } from "lucide-react";

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

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="animate-in fade-in duration-500 flex flex-col h-full space-y-6">
      <div>
        <h2 className="text-3xl font-display font-bold">Creative Studio</h2>
        <p className="text-muted-foreground mt-1">Generate high-converting copy tailored to your brand.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Generator Form */}
        <Card className="lg:col-span-4 bg-card border-border/50 shadow-xl rounded-2xl overflow-hidden sticky top-0">
          <CardHeader className="bg-card/50 border-b border-border/50">
            <CardTitle className="text-lg flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary"/> Campaign Brief</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleGenerate} className="space-y-5">
              <div className="space-y-2">
                <Label>Campaign Goal</Label>
                <Textarea 
                  placeholder="e.g. Drive signups for our new AI feature..." 
                  value={goal} onChange={e => setGoal(e.target.value)}
                  className="bg-background rounded-xl min-h-[100px]" required
                />
              </div>
              <div className="space-y-2">
                <Label>Channel</Label>
                <Select value={channel} onValueChange={setChannel}>
                  <SelectTrigger className="bg-background rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Cold Email</SelectItem>
                    <SelectItem value="social">LinkedIn Post</SelectItem>
                    <SelectItem value="ads">Meta Ad</SelectItem>
                    <SelectItem value="landing_page">Landing Page</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tone of Voice</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger className="bg-background rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="casual">Casual & Conversational</SelectItem>
                    <SelectItem value="urgent">Urgent / FOMO</SelectItem>
                    <SelectItem value="bold">Bold & Disruptive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={generateMutation.isPending || !goal} className="w-full rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 h-12 mt-4">
                {generateMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Generate 3 Variants"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results Area */}
        <div className="lg:col-span-8 space-y-6">
          {generateMutation.isPending && (
             <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-border/50 rounded-2xl bg-card/20">
               <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
               <p className="text-muted-foreground font-medium">Analyzing market data & generating variants...</p>
             </div>
          )}

          {!generateMutation.isPending && generateMutation.data && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Generated Variants</h3>
                <Badge className="bg-emerald-500/10 text-emerald-400 border-0">A/B Ready</Badge>
              </div>
              
              {generateMutation.data.variants.map((v: any, i: number) => (
                <Card key={v.id} className="bg-card border-border/50 shadow-md hover:border-primary/30 transition-colors">
                  <CardHeader className="pb-2 flex flex-row items-start justify-between">
                    <div>
                      <Badge variant="outline" className="mb-2">Variant {String.fromCharCode(65 + i)}</Badge>
                      <CardTitle className="text-lg leading-tight">{v.headline}</CardTitle>
                    </div>
                    <Button 
                      variant="ghost" size="icon" 
                      onClick={() => copyToClipboard(v.id, `${v.headline}\n\n${v.body}\n\n${v.cta}`)}
                      className="text-muted-foreground hover:text-foreground hover:bg-background"
                    >
                      {copiedId === v.id ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed mb-4">{v.body}</p>
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-primary text-sm bg-primary/10 px-3 py-1.5 rounded-lg inline-block">{v.cta}</div>
                      <div className="flex gap-3 text-xs font-medium text-muted-foreground">
                        <span className="flex items-center"><Sparkles className="w-3 h-3 mr-1 text-amber-400"/> Score: {v.score}</span>
                        <span>{v.wordCount} words</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!generateMutation.isPending && !generateMutation.data && (
            <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-border/50 rounded-2xl text-muted-foreground">
              <Sparkles className="w-10 h-10 mb-4 opacity-50" />
              <p>Fill out the brief to generate marketing copy.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
