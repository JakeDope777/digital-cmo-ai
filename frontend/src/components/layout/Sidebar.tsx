import { Link, useLocation } from "wouter";
import { 
  Bot, LayoutDashboard, MessageSquare, BarChart3, 
  PenTool, Users, TrendingUp, Blocks, CreditCard, Settings, LogOut 
} from "lucide-react";
import { useAuth } from "@/hooks/use-api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "AI Chat", href: "/chat", icon: MessageSquare },
  { name: "Analysis", href: "/analysis", icon: BarChart3 },
  { name: "Creative", href: "/creative", icon: PenTool },
  { name: "CRM", href: "/crm", icon: Users },
  { name: "Growth", href: "/growth", icon: TrendingUp },
  { name: "Integrations", href: "/integrations", icon: Blocks },
];

const BOTTOM_ITEMS = [
  { name: "Billing", href: "/billing", icon: CreditCard },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  return (
    <aside className="w-[260px] bg-card border-r border-border flex flex-col flex-shrink-0 relative z-20">
      <div className="h-20 flex items-center px-6 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-3 cursor-pointer group">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all duration-300">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-foreground tracking-tight leading-tight">Digital CMO</h1>
            <p className="text-[10px] font-medium text-primary uppercase tracking-wider">AI Engine</p>
          </div>
        </Link>
      </div>
      
      <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">Main Menu</div>
        {NAV_ITEMS.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.name} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-border/50'}`}>
              <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'group-hover:text-foreground'}`} />
              <span className="font-medium text-sm">{item.name}</span>
            </Link>
          );
        })}
        
        <div className="pt-6 mt-6 border-t border-border">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">System</div>
          {BOTTOM_ITEMS.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-border/50'}`}>
                <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'group-hover:text-foreground'}`} />
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
      
      <div className="p-4 border-t border-border bg-card/50">
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-border/50 transition-colors cursor-pointer group">
          <Avatar className="w-9 h-9 border-2 border-border group-hover:border-primary/50 transition-colors">
            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Felix'}`} />
            <AvatarFallback className="bg-primary/20 text-primary font-bold">JD</AvatarFallback>
          </Avatar>
          <div className="flex flex-col flex-1 overflow-hidden">
            <span className="text-sm font-semibold text-foreground truncate">{user?.name || 'Jake Davis'}</span>
            <span className="text-xs text-primary font-medium truncate">{user?.plan || 'Growth Plan'}</span>
          </div>
          <button onClick={logout} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
