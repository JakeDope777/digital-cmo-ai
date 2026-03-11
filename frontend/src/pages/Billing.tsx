import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-api";
import { Download, Check } from "lucide-react";

export function Billing() {
  const { user } = useAuth();
  
  if (!user) return null;

  const usagePercent = Math.min(100, Math.round((user.aiCallsUsed / user.aiCallsLimit) * 100));

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl font-display font-bold">Billing & Usage</h2>
        <p className="text-muted-foreground mt-1">Manage your subscription and AI token limits.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="bg-card border-border/50 shadow-xl rounded-2xl">
          <CardHeader className="pb-4">
            <div className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">Current Plan</div>
            <CardTitle className="text-3xl text-primary">{user.plan}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-baseline text-4xl font-extrabold">
              $299<span className="text-lg text-muted-foreground font-medium ml-1">/mo</span>
            </div>
            <ul className="space-y-3">
              <li className="flex items-center text-sm"><Check className="w-4 h-4 text-emerald-400 mr-2"/> 3 Projects/Brands</li>
              <li className="flex items-center text-sm"><Check className="w-4 h-4 text-emerald-400 mr-2"/> Autonomous Execution</li>
              <li className="flex items-center text-sm"><Check className="w-4 h-4 text-emerald-400 mr-2"/> Priority Support</li>
            </ul>
            <div className="flex gap-3 pt-4">
              <Button className="flex-1 bg-primary text-white">Upgrade Plan</Button>
              <Button variant="outline" className="bg-background">Cancel</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50 shadow-xl rounded-2xl flex flex-col justify-between">
          <CardHeader>
            <CardTitle>AI Token Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm mb-2 font-medium">
              <span>{user.aiCallsUsed.toLocaleString()} calls</span>
              <span className="text-muted-foreground">{user.aiCallsLimit.toLocaleString()} limit</span>
            </div>
            <Progress value={usagePercent} className="h-3 bg-background [&>div]:bg-primary" />
            <p className="text-xs text-muted-foreground mt-4">
              Your usage resets on Nov 1st. If you exceed your limit, campaigns will pause automatically unless auto-scale is enabled.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border/50 shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle>Invoice History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border/50">
            {[
              { id: "INV-2023-10", date: "Oct 1, 2023", amount: "$299.00", status: "Paid" },
              { id: "INV-2023-09", date: "Sep 1, 2023", amount: "$299.00", status: "Paid" },
              { id: "INV-2023-08", date: "Aug 1, 2023", amount: "$299.00", status: "Paid" }
            ].map(inv => (
              <div key={inv.id} className="py-4 flex items-center justify-between">
                <div>
                  <div className="font-medium text-foreground">{inv.date}</div>
                  <div className="text-sm text-muted-foreground">{inv.id}</div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="font-medium">{inv.amount}</div>
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-0">{inv.status}</Badge>
                  <Button variant="ghost" size="icon" className="text-muted-foreground"><Download className="w-4 h-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
