import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-api";
import { Save } from "lucide-react";

export function Settings() {
  const { user } = useAuth();

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto pb-10">
      <div>
        <h2 className="text-3xl font-display font-bold">Settings</h2>
        <p className="text-muted-foreground mt-1">Manage your account and AI preferences.</p>
      </div>

      <Card className="bg-card border-border/50 shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input defaultValue={user?.name} className="bg-background rounded-xl h-11" />
            </div>
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input defaultValue={user?.email} disabled className="bg-muted text-muted-foreground rounded-xl h-11" />
            </div>
            <div className="space-y-2">
              <Label>Industry / Vertical</Label>
              <Input defaultValue={user?.industry} className="bg-background rounded-xl h-11" />
            </div>
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Input defaultValue="America/New_York" className="bg-background rounded-xl h-11" />
            </div>
          </div>
          <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-md"><Save className="w-4 h-4 mr-2"/> Save Changes</Button>
        </CardContent>
      </Card>

      <Card className="bg-card border-border/50 shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle>AI Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2 max-w-md">
            <Label>Language Model</Label>
            <select className="flex h-11 w-full items-center justify-between rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring">
              <option>GPT-4o (Recommended)</option>
              <option>Claude 3.5 Sonnet</option>
              <option>GPT-4-Turbo</option>
            </select>
            <p className="text-xs text-muted-foreground mt-2">GPT-4o is the fastest and most capable model for marketing strategy.</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-rose-500/5 border-rose-500/20 shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-rose-500">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">Permanently delete your account and all associated data. This action cannot be undone.</p>
          <Button variant="destructive" className="rounded-xl">Delete Account</Button>
        </CardContent>
      </Card>
    </div>
  );
}
