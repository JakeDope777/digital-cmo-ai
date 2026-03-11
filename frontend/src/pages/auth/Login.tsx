import { useState } from "react";
import { Link } from "wouter";
import { Bot, ArrowRight, Loader2, Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";

const SOCIAL_PROOF = [
  { name: "Sarah K.", role: "CMO @ Clasp", text: "Replaced our $20K/mo agency in 2 weeks." },
  { name: "Marco R.", role: "Founder @ Vectify", text: "5.3× ROAS in 30 days. Nothing comes close." },
  { name: "Priya M.", role: "Head of Growth", text: "Like having a VP of Marketing on demand." },
];

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const login = useLogin();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login.mutateAsync({ email, password });
      window.location.href = "/dashboard";
    } catch {
      toast({ title: "Invalid credentials", description: "Try demo@digitalcmo.ai / password", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex overflow-hidden">

      {/* Left panel — branding */}
      <div className="hidden lg:flex w-[480px] flex-shrink-0 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border-r border-white/5 flex-col justify-between p-12 relative overflow-hidden">
        {/* Decorative glow */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-14">
            <div className="w-11 h-11 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-primary/30">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-white tracking-tight">Digital CMO</span>
          </div>

          <h2 className="text-4xl font-display font-bold text-white leading-tight mb-4">
            Your AI Chief<br />Marketing Officer<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">Always On.</span>
          </h2>
          <p className="text-white/50 text-sm leading-relaxed max-w-xs">
            10 AI agents working 24/7 on your marketing. Strategy, execution, analytics, and creative — all automated.
          </p>

          <div className="mt-10 space-y-2">
            {[
              "5.3× average ROAS improvement",
              "Replaces $180K/yr agency cost",
              "Live in under 10 minutes",
            ].map((f) => (
              <div key={f} className="flex items-center gap-2.5 text-sm text-white/70">
                <div className="w-4 h-4 rounded-full bg-emerald-400/15 flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5 text-emerald-400" />
                </div>
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="relative z-10 space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-4">Trusted by 2,400+ Teams</p>
          {SOCIAL_PROOF.map((t) => (
            <div key={t.name} className="bg-white/5 border border-white/8 rounded-xl p-3.5">
              <div className="flex mb-2">
                {[1,2,3,4,5].map(s => <Star key={s} className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />)}
              </div>
              <p className="text-xs text-white/70 mb-2">"{t.text}"</p>
              <p className="text-[10px] font-semibold text-white/40">{t.name} · {t.role}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-primary/30">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-white">Digital CMO</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-display font-bold text-white">Welcome back</h1>
            <p className="text-white/50 mt-2 text-sm">Sign in to your AI CMO dashboard.</p>
          </div>

          {/* Demo hint */}
          <div className="mb-6 p-3.5 bg-primary/10 border border-primary/20 rounded-xl text-xs text-primary/80">
            <span className="font-semibold text-primary">Demo credentials:</span> demo@digitalcmo.ai / password
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-white/60">Work Email</Label>
              <Input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-primary/50 focus:ring-primary/20 rounded-xl"
                required
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-semibold text-white/60">Password</Label>
                <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
              </div>
              <Input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-primary/50 rounded-xl"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={login.isPending}
              className="w-full h-11 rounded-xl text-sm font-bold bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/30 transition-all"
            >
              {login.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Sign In <ArrowRight className="w-4 h-4 ml-2" /></>}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-white/30">
            No account?{" "}
            <Link href="/register" className="text-primary font-semibold hover:underline">Start your free 14-day trial</Link>
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {["AES-256 Encrypted", "GDPR Compliant", "SOC 2 Ready", "99.99% Uptime"].map((t) => (
              <span key={t} className="text-[10px] text-white/20 flex items-center gap-1">
                <Check className="w-2.5 h-2.5 text-emerald-400/50" />{t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
