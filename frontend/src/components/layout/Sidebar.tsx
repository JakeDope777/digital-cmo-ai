import { Link, useLocation } from "wouter";
import { 
  Bot, LayoutDashboard, MessageSquare, BarChart3, 
  PenTool, Users, TrendingUp, Blocks, CreditCard, Settings, LogOut 
} from "lucide-react";
import { useAuth } from "@/hooks/use-api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { memo } from "react";

const NAV_ITEMS = [
  { name: "Dashboard",    href: "/dashboard",    icon: LayoutDashboard },
  { name: "AI Chat",      href: "/chat",          icon: MessageSquare },
  { name: "Analysis",     href: "/analysis",      icon: BarChart3 },
  { name: "Creative",     href: "/creative",      icon: PenTool },
  { name: "CRM",          href: "/crm",           icon: Users },
  { name: "Growth",       href: "/growth",        icon: TrendingUp },
  { name: "Integrations", href: "/integrations",  icon: Blocks },
];

const BOTTOM_ITEMS = [
  { name: "Billing",  href: "/billing",  icon: CreditCard },
  { name: "Settings", href: "/settings", icon: Settings },
];

function NavLink({ item, isActive }: { item: typeof NAV_ITEMS[0]; isActive: boolean }) {
  return (
    <Link
      href={item.href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 group ${
        isActive
          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25"
          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
      }`}
    >
      <item.icon className="w-4.5 h-4.5 shrink-0" size={18} />
      <span className="font-medium text-sm tracking-tight">{item.name}</span>
    </Link>
  );
}

export const Sidebar = memo(function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  return (
    <aside className="w-[220px] bg-[#111827] border-r border-slate-800 flex flex-col flex-shrink-0 relative z-20">
      {/* Logo */}
      <div className="h-[72px] flex items-center px-5 border-b border-slate-800">
        <Link href="/dashboard" className="flex items-center gap-3 cursor-pointer group">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-all duration-200">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-[15px] text-slate-100 tracking-tight leading-none">Digital CMO</h1>
            <p className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider mt-0.5">AI Engine</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-5 px-3 space-y-0.5 overflow-y-auto scrollbar-none">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">Main Menu</p>
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.name} item={item} isActive={location === item.href} />
        ))}

        <div className="pt-5 mt-5 border-t border-slate-800 space-y-0.5">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">System</p>
          {BOTTOM_ITEMS.map((item) => (
            <NavLink key={item.name} item={item} isActive={location === item.href} />
          ))}
        </div>
      </div>

      {/* User */}
      <div className="p-3 border-t border-slate-800">
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/60 transition-colors cursor-pointer group">
          <Avatar className="w-8 h-8 border border-slate-700 group-hover:border-indigo-500/50 transition-colors flex-shrink-0">
            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Felix'}`} />
            <AvatarFallback className="bg-indigo-600/20 text-indigo-400 font-bold text-xs">JD</AvatarFallback>
          </Avatar>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-[13px] font-semibold text-slate-200 truncate leading-tight">{user?.name || 'Jake Davis'}</span>
            <span className="text-[10px] text-indigo-400 font-medium truncate">{user?.plan || 'Growth Plan'}</span>
          </div>
          <button
            onClick={logout}
            className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors flex-shrink-0"
            aria-label="Logout"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
});
