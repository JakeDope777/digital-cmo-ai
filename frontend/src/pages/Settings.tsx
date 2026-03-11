import { useState, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-api";
import {
  Save, Bell, Shield, Brain, User, Palette, Check, CreditCard,
  KeyRound, Zap, BellRing, Volume2, Mail, Smartphone,
} from "lucide-react";

const BRAND_TONES = ["Professional", "Bold & Direct", "Friendly", "Technical", "Casual", "Luxury"];
const NAV_ITEMS = [
  { id: "profile",       label: "Profile",        icon: User },
  { id: "ai",            label: "AI Config",      icon: Brain },
  { id: "notifications", label: "Notifications",  icon: Bell },
  { id: "security",      label: "Security",       icon: Shield },
  { id: "billing",       label: "Billing",        icon: CreditCard },
] as const;

type TabId = typeof NAV_ITEMS[number]["id"];

export const Settings = memo(function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [selectedTone, setSelectedTone] = useState("Bold & Direct");
  const [aiModel, setAiModel] = useState("gpt4o");
  const [saved, setSaved] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true, slack: true, browser: false, weekly: true, anomaly: true,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500 pb-10">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-slate-100">Settings</h2>
        <p className="text-slate-400 mt-1">Configure your workspace, AI preferences, and brand voice.</p>
      </div>

      <div className="flex gap-6">
        {/* Left Nav */}
        <aside className="w-48 shrink-0">
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  activeTab === item.id
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 space-y-6 min-w-0">

          {/* ── Profile ── */}
          {activeTab === "profile" && (
            <>
              <Card className="bg-[#111827] border-slate-800 rounded-2xl">
                <CardHeader className="border-b border-slate-800 pb-4 flex flex-row items-center gap-2">
                  <User className="w-4 h-4 text-indigo-400" />
                  <CardTitle className="text-base text-slate-100 m-0">Profile & Workspace</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/25 flex-shrink-0">
                      {user?.name?.substring(0, 2) ?? "JD"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-lg text-slate-100">{user?.name ?? "Jake Davis"}</p>
                      <p className="text-sm text-slate-400">{user?.email ?? "jake@company.com"}</p>
                      <Badge className="mt-1 bg-indigo-600/20 text-indigo-400 border-0 text-xs">{user?.plan ?? "Growth Plan"}</Badge>
                    </div>
                    <Button variant="outline" size="sm" className="ml-auto text-xs border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800">Change Avatar</Button>
                  </div>

                  <Separator className="bg-slate-800" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {[
                      { label: "Full Name",          val: user?.name ?? "Jake Davis",            disabled: false },
                      { label: "Work Email",         val: user?.email ?? "jake@company.com",     disabled: true },
                      { label: "Company Name",       val: "Acme Corp",                           disabled: false },
                      { label: "Industry",           val: user?.industry ?? "B2B SaaS",          disabled: false },
                      { label: "Website URL",        val: "https://acmecorp.com",                disabled: false },
                    ].map((f) => (
                      <div key={f.label} className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-300">{f.label}</Label>
                        <Input
                          defaultValue={f.val}
                          disabled={f.disabled}
                          className="bg-slate-900 border-slate-700 text-slate-200 focus:border-indigo-500 disabled:opacity-50 text-sm h-9"
                        />
                      </div>
                    ))}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-300">Timezone</Label>
                      <Select defaultValue="america_new_york">
                        <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-200 h-9 text-sm focus:ring-indigo-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-700">
                          <SelectItem value="america_new_york">America/New_York</SelectItem>
                          <SelectItem value="america_los_angeles">America/Los_Angeles</SelectItem>
                          <SelectItem value="europe_london">Europe/London</SelectItem>
                          <SelectItem value="asia_singapore">Asia/Singapore</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator className="bg-slate-800" />

                  <div>
                    <Label className="text-xs font-semibold text-slate-300 mb-3 block">Brand Voice</Label>
                    <div className="flex flex-wrap gap-2">
                      {BRAND_TONES.map((tone) => (
                        <button
                          key={tone}
                          onClick={() => setSelectedTone(tone)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                            selectedTone === tone
                              ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20"
                              : "bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-slate-300"
                          }`}
                        >
                          {tone}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6">
                  {saved ? <><Check className="w-4 h-4 mr-2" />Saved!</> : <><Save className="w-4 h-4 mr-2" />Save Changes</>}
                </Button>
              </div>
            </>
          )}

          {/* ── AI Config ── */}
          {activeTab === "ai" && (
            <>
              <Card className="bg-[#111827] border-slate-800 rounded-2xl">
                <CardHeader className="border-b border-slate-800 pb-4 flex flex-row items-center gap-2">
                  <Brain className="w-4 h-4 text-indigo-400" />
                  <CardTitle className="text-base text-slate-100 m-0">AI Model & Preferences</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <Label className="text-xs font-semibold text-slate-300 mb-3 block">Primary AI Model</Label>
                    <RadioGroup value={aiModel} onValueChange={setAiModel} className="space-y-2.5">
                      {[
                        { val: "gpt4o",   label: "GPT-4o",        desc: "Best quality, slower. Recommended for strategy.", badge: "Recommended" },
                        { val: "gpt4o-mini", label: "GPT-4o Mini", desc: "Faster & cheaper. Good for drafts and quick tasks.", badge: "Fast" },
                        { val: "claude35", label: "Claude 3.5 Sonnet", desc: "Excellent for long-form content and nuanced writing.", badge: null },
                      ].map((opt) => (
                        <label key={opt.val} className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${aiModel === opt.val ? "border-indigo-500/60 bg-indigo-600/10" : "border-slate-800 bg-slate-900 hover:border-slate-700"}`}>
                          <RadioGroupItem value={opt.val} className="shrink-0" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-slate-200">{opt.label}</span>
                              {opt.badge && <Badge className="bg-indigo-600/20 text-indigo-400 border-0 text-[10px] h-4 px-1.5">{opt.badge}</Badge>}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
                          </div>
                        </label>
                      ))}
                    </RadioGroup>
                  </div>

                  <Separator className="bg-slate-800" />

                  <div className="space-y-4">
                    <Label className="text-xs font-semibold text-slate-300 block">Agent Capabilities</Label>
                    {[
                      { label: "Autonomous budget reallocation", desc: "Allow AI to shift ad spend without manual approval", defaultChecked: false },
                      { label: "Auto-publish content",           desc: "Publish approved content directly to connected platforms", defaultChecked: false },
                      { label: "Proactive anomaly alerts",       desc: "Send notifications when KPIs drop significantly", defaultChecked: true },
                      { label: "Competitive monitoring",        desc: "Track competitor content, pricing, and positioning changes", defaultChecked: true },
                    ].map((s) => (
                      <div key={s.label} className="flex items-start justify-between gap-4 py-3 border-b border-slate-800/60 last:border-0">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-200">{s.label}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{s.desc}</p>
                        </div>
                        <Switch defaultChecked={s.defaultChecked} className="shrink-0 mt-0.5" />
                      </div>
                    ))}
                  </div>

                  <Separator className="bg-slate-800" />

                  <div>
                    <Label className="text-xs font-semibold text-slate-300 mb-2 block">AI Memory & Context</Label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <div>
                          <p className="text-sm font-medium text-slate-200">Brand memory</p>
                          <p className="text-xs text-slate-500">14 documents · Last synced 2h ago</p>
                        </div>
                        <Button size="sm" variant="outline" className="text-xs border-slate-700 bg-transparent text-slate-300 h-8">Update</Button>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <div>
                          <p className="text-sm font-medium text-slate-200">Competitor profiles</p>
                          <p className="text-xs text-slate-500">3 competitors tracked</p>
                        </div>
                        <Button size="sm" variant="outline" className="text-xs border-slate-700 bg-transparent text-slate-300 h-8">Manage</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <div className="flex justify-end">
                <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6">
                  {saved ? <><Check className="w-4 h-4 mr-2" />Saved!</> : <><Save className="w-4 h-4 mr-2" />Save Changes</>}
                </Button>
              </div>
            </>
          )}

          {/* ── Notifications ── */}
          {activeTab === "notifications" && (
            <Card className="bg-[#111827] border-slate-800 rounded-2xl">
              <CardHeader className="border-b border-slate-800 pb-4 flex flex-row items-center gap-2">
                <BellRing className="w-4 h-4 text-indigo-400" />
                <CardTitle className="text-base text-slate-100 m-0">Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-2">
                {[
                  { key: "email",   icon: Mail,       label: "Email summaries",         desc: "Daily digest of agent activity and KPI changes" },
                  { key: "slack",   icon: Volume2,    label: "Slack notifications",      desc: "Real-time alerts pushed to your Slack workspace" },
                  { key: "browser", icon: Smartphone, label: "Browser push",             desc: "Push notifications in your browser" },
                  { key: "weekly",  icon: Bell,       label: "Weekly report",            desc: "Every Monday: performance summary and recommendations" },
                  { key: "anomaly", icon: Zap,        label: "Anomaly alerts",           desc: "Immediate alert when any KPI drops more than 15%" },
                ].map((n) => (
                  <div key={n.key} className="flex items-start justify-between gap-4 py-4 border-b border-slate-800/60 last:border-0">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <n.icon className="w-4 h-4 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-200">{n.label}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{n.desc}</p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications[n.key as keyof typeof notifications]}
                      onCheckedChange={(v) => setNotifications(prev => ({ ...prev, [n.key]: v }))}
                      className="shrink-0 mt-0.5"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* ── Security ── */}
          {activeTab === "security" && (
            <Card className="bg-[#111827] border-slate-800 rounded-2xl">
              <CardHeader className="border-b border-slate-800 pb-4 flex flex-row items-center gap-2">
                <KeyRound className="w-4 h-4 text-indigo-400" />
                <CardTitle className="text-base text-slate-100 m-0">Security & Authentication</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-3">
                  <Label className="text-xs font-semibold text-slate-300">Change Password</Label>
                  {["Current Password", "New Password", "Confirm Password"].map((f) => (
                    <div key={f} className="space-y-1.5">
                      <Label className="text-xs text-slate-400">{f}</Label>
                      <Input type="password" placeholder="••••••••" className="bg-slate-900 border-slate-700 text-slate-200 h-9 text-sm focus:border-indigo-500" />
                    </div>
                  ))}
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white mt-2">Update Password</Button>
                </div>

                <Separator className="bg-slate-800" />

                <div>
                  <Label className="text-xs font-semibold text-slate-300 mb-3 block">Two-Factor Authentication</Label>
                  <div className="flex items-center justify-between p-4 bg-slate-900 rounded-xl border border-slate-800">
                    <div>
                      <p className="text-sm font-medium text-slate-200">Authenticator App</p>
                      <p className="text-xs text-slate-500 mt-0.5">Use Google Authenticator or Authy</p>
                    </div>
                    <Button size="sm" className="bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border-0 text-xs">Enable</Button>
                  </div>
                </div>

                <Separator className="bg-slate-800" />

                <div>
                  <Label className="text-xs font-semibold text-slate-300 mb-3 block">Active Sessions</Label>
                  {[
                    { device: "MacBook Pro", location: "New York, USA", current: true },
                    { device: "iPhone 15",   location: "New York, USA", current: false },
                  ].map((s) => (
                    <div key={s.device} className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-slate-200">{s.device}</p>
                          {s.current && <Badge className="bg-emerald-500/10 text-emerald-400 border-0 text-[10px] h-4">Current</Badge>}
                        </div>
                        <p className="text-xs text-slate-500">{s.location}</p>
                      </div>
                      {!s.current && (
                        <Button size="sm" variant="ghost" className="text-rose-400 hover:text-rose-300 text-xs h-7">Revoke</Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Billing tab ── */}
          {activeTab === "billing" && (
            <Card className="bg-[#111827] border-slate-800 rounded-2xl">
              <CardHeader className="border-b border-slate-800 pb-4 flex flex-row items-center gap-2">
                <CreditCard className="w-4 h-4 text-indigo-400" />
                <CardTitle className="text-base text-slate-100 m-0">Billing Overview</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-indigo-600/20 to-blue-600/10 border border-indigo-500/30">
                  <div>
                    <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">Current Plan</p>
                    <p className="text-2xl font-bold text-slate-100 mt-0.5">Growth <span className="text-indigo-400">$299</span><span className="text-sm font-normal text-slate-400">/mo</span></p>
                    <p className="text-xs text-slate-400 mt-1">Next billing: April 1, 2026</p>
                  </div>
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm">Upgrade Plan</Button>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-slate-300 font-medium">AI Calls Used</span>
                    <span className="text-slate-400">{user?.aiCallsUsed?.toLocaleString() ?? "84,200"} / {user?.aiCallsLimit?.toLocaleString() ?? "300,000"}</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, ((user?.aiCallsUsed ?? 84200) / (user?.aiCallsLimit ?? 300000)) * 100)}%` }} />
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5">{Math.round(((user?.aiCallsUsed ?? 84200) / (user?.aiCallsLimit ?? 300000)) * 100)}% used this month</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
});
