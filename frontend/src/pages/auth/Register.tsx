import { useState } from "react";
import { Link } from "wouter";
import { Brain, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useLogin } from "@/hooks/use-api";

export function Register() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", industry: "" });
  const register = useLogin(); // Reusing login logic for demo

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await register.mutateAsync(formData);
    window.location.href = "/dashboard";
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
            <h1 className="text-2xl font-display font-bold text-foreground">Create your account</h1>
            <p className="text-muted-foreground mt-2">14-day free trial. No credit card required.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input 
                placeholder="Jake Davis" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="h-12 bg-background rounded-xl" required 
              />
            </div>
            <div className="space-y-2">
              <Label>Work Email</Label>
              <Input 
                type="email" placeholder="name@company.com" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="h-12 bg-background rounded-xl" required 
              />
            </div>
            <div className="space-y-2">
              <Label>Industry</Label>
              <Select onValueChange={v => setFormData({...formData, industry: v})}>
                <SelectTrigger className="h-12 bg-background rounded-xl">
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ecommerce">Ecommerce</SelectItem>
                  <SelectItem value="saas">SaaS</SelectItem>
                  <SelectItem value="fintech">Fintech</SelectItem>
                  <SelectItem value="igaming">iGaming</SelectItem>
                  <SelectItem value="healthtech">Healthtech</SelectItem>
                  <SelectItem value="agency">Agency</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input 
                type="password" 
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                className="h-12 bg-background rounded-xl" required 
              />
            </div>
            
            <Button type="submit" disabled={register.isPending} className="w-full h-12 mt-4 rounded-xl text-base font-semibold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 transition-all">
              {register.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Start Free Trial"}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account? <Link href="/login" className="text-primary font-semibold hover:underline">Log in</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
