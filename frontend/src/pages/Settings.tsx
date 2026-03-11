import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-api";
import { Save, Bell, Shield, Brain, Users, Palette, Globe, ChevronRight, Check } from "lucide-react";

const BRAND_TONE_OPTIONS = ["Professional", "Bold & Direct", "Friendly", "Technical", "Casual", "Luxury"];
const COMPETITOR_URLS = ["hubspot.com", "marketo.com", "activecampaign.com"];

export function Settings() {
  const { user } = useAuth();
  const [selectedTone, setSelectedTone] = useState("Bold & Direct");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto pb-10">
      <div>
        <h2 className="text-3xl font-display font-bold">Settings</h2>
        <p className="text-muted-foreground mt-1">Configure your workspace, AI preferences, and brand voice.</p>
      </div>

      {/* Profile */}
      <Card className="bg-card border-border/50 rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-border/50 pb-4 flex flex-row items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          <CardTitle className="text-base m-0">Profile & Workspace</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-5">
          <div className="flex items-center gap-4 pb-5 border-b border-border/30">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/20">
              {user?.name?.substring(0, 2) ?? "JD"}
            </div>
            <div>
              <p className="font-bold text-lg text-foreground">{user?.name ?? "Jake Davis"}</p>
              <p className="text-sm text-muted-foreground">{user?.email ?? "jake@company.com"}</p>
              <Badge className="mt-1 bg-primary/10 text-primary border-0 text-xs">{user?.plan ?? "Growth Plan"}</Badge>
            </div>
            <Button variant="outline" size="sm" className="ml-auto bg-background text-xs">Change Avatar</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { label: "Full Name", val: user?.name ?? "Jake Davis" },
              { label: "Work Email", val: user?.email ?? "jake@company.com", disabled: true },
              { label: "Company Name", val: "Acme Corp" },
              { label: "Industry / Vertical", val: user?.industry ?? "B2B SaaS" },
              { label: "Website URL", val: "https://acmecorp.com" },
              { label: "Timezone", val: "America/New_York" },
            ].map((f) => (
              <div key={f.label} className="space-y-1.5">
                <Label className="text-xs font-semibold">{f.label}</Label>
                <Input
                  defaultValue={f.val}
                  disabled={f.disabled}
                  className={`bg-background rounded-xl h-10 text-sm ${f.disabled ? "opacity-50" : ""}`}
                />
              </div>
            ))}
          </div>
          <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/20 h-9 text-sm">
            {saved ? <><Check className="w-4 h-4 mr-2 text-emerald-300" />Saved!</> : <><Save className="w-4 h-4 mr-2" />Save Changes</>}
          </Button>
        </CardContent>
      </Card>

      {/* Brand Voice */}
      <Card className="bg-card border-border/50 rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-border/50 pb-4 flex flex-row items-center gap-2">
          <Palette className="w-4 h-4 text-primary" />
          <CardTitle className="text-base m-0">Brand Voice & Memory</CardTitle>
          <Badge className="ml-auto bg-emerald-500/10 text-emerald-400 border-0 text-xs">AI Learns Over Time</Badge>
        </CardHeader>
        <CardContent className="p-6 space-y-5">
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Brand Tone of Voice</Label>
            <div className="flex flex-wrap gap-2">
              {BRAND_TONE_OPTIONS.map((tone) => (
                <button
                  key={tone}
                  onClick={() => setSelectedTone(tone)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${selectedTone === tone ? "bg-primary text-white border-primary shadow-lg shadow-primary/25" : "bg-background border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground"}`}
                >
                  {tone}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Brand Description</Label>
            <textarea
              className="w-full bg-background border border-border/50 rounded-xl p-3 text-sm text-foreground min-h-[80px] resize-none focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
              defaultValue="Digital CMO AI is an enterprise AI marketing platform that replaces traditional agency workflows. Bold, data-driven, ROI-obsessed. We speak to CMOs and growth leaders, not generalists."
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Key Differentiators</Label>
            <Input defaultValue="10 AI agents, unified memory, $119/mo, beats agencies 10x faster" className="bg-background rounded-xl h-10 text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Competitor URLs to Track</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {COMPETITOR_URLS.map((url) => (
                <Badge key={url} variant="outline" className="bg-background text-xs gap-1">
                  {url}
                  <button className="text-muted-foreground hover:text-foreground ml-1">×</button>
                </Badge>
              ))}
            </div>
            <Input placeholder="Add competitor URL..." className="bg-background rounded-xl h-9 text-sm" />
          </div>
        </CardContent>
      </Card>

      {/* AI Model Config */}
      <Card className="bg-card border-border/50 rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-border/50 pb-4 flex flex-row items-center gap-2">
          <Brain className="w-4 h-4 text-primary" />
          <CardTitle className="text-base m-0">AI Model & Behaviour</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Primary Language Model</Label>
              <select className="flex h-10 w-full items-center justify-between rounded-xl border border-border/50 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50">
                <option>GPT-4o (Recommended)</option>
                <option>Claude 3.5 Sonnet</option>
                <option>GPT-4 Turbo</option>
              </select>
              <p className="text-[11px] text-muted-foreground">GPT-4o is fastest for marketing tasks and creative generation.</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Response Language</Label>
              <select className="flex h-10 w-full items-center justify-between rounded-xl border border-border/50 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option>English (US)</option>
                <option>English (UK)</option>
                <option>German</option>
                <option>French</option>
                <option>Spanish</option>
              </select>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { label: "Proactive AI Alerts", desc: "Get notified when AI detects budget waste or revenue opportunities", on: true },
              { label: "Auto-Apply Optimisations", desc: "Allow AI to automatically adjust bids and reallocate budgets within set limits", on: false },
              { label: "Weekly CMO Brief", desc: "Receive an AI-generated executive summary every Monday morning", on: true },
            ].map((setting) => (
              <div key={setting.label} className="flex items-center justify-between p-3 bg-background rounded-xl border border-border/40">
                <div>
                  <p className="text-sm font-semibold text-foreground">{setting.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{setting.desc}</p>
                </div>
                <div className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all ${setting.on ? "bg-primary" : "bg-muted"}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${setting.on ? "translate-x-4" : "translate-x-0"}`} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="bg-card border-border/50 rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-border/50 pb-4 flex flex-row items-center gap-2">
          <Bell className="w-4 h-4 text-primary" />
          <CardTitle className="text-base m-0">Notifications</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            {[
              { label: "Campaign Performance Alerts", on: true },
              { label: "Budget Anomaly Warnings", on: true },
              { label: "Weekly Analytics Reports", on: true },
              { label: "New Feature Announcements", on: false },
              { label: "A/B Test Results Ready", on: true },
            ].map((n) => (
              <div key={n.label} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
                <span className="text-sm text-foreground">{n.label}</span>
                <div className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent ${n.on ? "bg-primary" : "bg-muted"}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${n.on ? "translate-x-4" : "translate-x-0"}`} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-rose-500/5 border-rose-500/20 rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-rose-500/10 pb-4 flex flex-row items-center gap-2">
          <Shield className="w-4 h-4 text-rose-400" />
          <CardTitle className="text-base m-0 text-rose-400">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between p-4 bg-rose-500/5 border border-rose-500/15 rounded-xl">
            <div>
              <p className="font-semibold text-sm text-foreground">Delete Workspace</p>
              <p className="text-xs text-muted-foreground mt-0.5">Permanently delete all campaigns, data, and AI memory. Cannot be undone.</p>
            </div>
            <Button variant="destructive" size="sm" className="shrink-0 ml-4 text-xs">Delete</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
