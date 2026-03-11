import { Sidebar } from "./Sidebar";
import { Bell, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-api";

export function AppLayout({ children, noPadding = false }: { children: React.ReactNode, noPadding?: boolean }) {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans selection:bg-primary/30">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-gradient-to-br from-background to-card/30">
        {/* Top Header */}
        <header className="h-20 flex items-center justify-between px-8 border-b border-border/50 bg-background/80 backdrop-blur-xl z-10 flex-shrink-0">
          <div className="flex items-center bg-card/50 border border-border rounded-full px-4 py-2 w-96 focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary/50 transition-all">
            <Search className="w-4 h-4 text-muted-foreground mr-3" />
            <input 
              type="text" 
              placeholder="Search campaigns, leads, or ask AI..." 
              className="bg-transparent border-none outline-none text-sm w-full text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 flex items-center justify-center rounded-full border border-border bg-card hover:bg-border/50 text-muted-foreground hover:text-foreground transition-all relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-destructive rounded-full border-2 border-card"></span>
            </button>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all rounded-full px-6 h-10">
              <Plus className="w-4 h-4 mr-2" />
              New Campaign
            </Button>
          </div>
        </header>

        {/* Content Area */}
        <div className={`flex-1 overflow-y-auto ${noPadding ? '' : 'p-6 lg:p-8 space-y-8'}`}>
          {children}
        </div>
      </main>
    </div>
  );
}
