import { useState } from "react";
import { Link } from "wouter";
import { Brain, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useLogin } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";

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
    } catch (err) {
      toast({ title: "Error", description: "Invalid credentials", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 selection:bg-primary/30">
      <Link href="/" className="flex items-center gap-3 mb-10 group">
        <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
          <Brain className="w-7 h-7 text-white" />
        </div>
        <span className="font-display font-bold text-3xl tracking-tight text-foreground">Digital CMO</span>
      </Link>

      <Card className="w-full max-w-md bg-card/80 backdrop-blur-xl border-border/50 shadow-2xl rounded-3xl overflow-hidden">
        <CardContent className="p-8 md:p-10">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-display font-bold text-foreground">Welcome back</h1>
            <p className="text-muted-foreground mt-2">Enter your credentials to access your AI CMO.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Work Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@company.com" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="h-12 bg-background border-border/50 focus:border-primary focus:ring-primary/20 rounded-xl"
                required 
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
              </div>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="h-12 bg-background border-border/50 focus:border-primary focus:ring-primary/20 rounded-xl"
                required 
              />
            </div>
            
            <Button type="submit" disabled={login.isPending} className="w-full h-12 rounded-xl text-base font-semibold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 transition-all">
              {login.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            Don't have an account? <Link href="/register" className="text-primary font-semibold hover:underline">Start your free trial</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
