import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  MessageSquare,
  BarChart2,
  Sparkles,
  Users,
  TrendingUp,
  Megaphone,
  Plug,
  CreditCard,
  Settings,
  LogOut,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { memo } from "react";

const NAV_ITEMS = [
  { name: "Dashboard",    href: "/app/dashboard",    icon: LayoutDashboard },
  { name: "AI Chat",      href: "/app/chat",          icon: MessageSquare },
  { name: "Analysis",     href: "/app/analysis",      icon: BarChart2 },
  { name: "Creative",     href: "/app/creative",      icon: Sparkles },
  { name: "CRM",          href: "/app/crm",           icon: Users },
  { name: "Growth",       href: "/app/growth",        icon: TrendingUp },
  { name: "Campaigns",    href: "/app/campaigns",     icon: Megaphone },
  { name: "Integrations", href: "/app/integrations",  icon: Plug },
];

const BOTTOM_ITEMS = [
  { name: "Billing",  href: "/app/billing",   icon: CreditCard },
  { name: "Settings", href: "/app/settings",  icon: Settings },
];

function NavLink({
  item,
  isActive,
  onClick,
}: {
  item: { name: string; href: string; icon: React.ComponentType<{ className?: string }> };
  isActive: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      to={item.href}
      onClick={onClick}
      className={`
        relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer group
        transition-colors duration-150
        ${isActive
          ? "bg-blue-600/15 text-blue-400 border-l-2 border-blue-500"
          : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border-l-2 border-transparent"
        }
      `}
    >
      <item.icon
        className={`w-[18px] h-[18px] shrink-0 transition-colors duration-150 ${
          isActive ? "text-blue-400" : "text-slate-400 group-hover:text-slate-200"
        }`}
      />
      <span
        className={`font-medium text-sm tracking-tight transition-colors duration-150 ${
          isActive ? "text-blue-400" : "text-slate-400 group-hover:text-slate-200"
        }`}
      >
        {item.name}
      </span>
    </Link>
  );
}

export const Sidebar = memo(function Sidebar({
  mobileOpen,
  onClose,
}: {
  mobileOpen?: boolean;
  onClose?: () => void;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const userInitials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <>
      {/* Mobile overlay backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 bg-black/60 z-30 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <aside
        className={`
          w-[220px] flex flex-col flex-shrink-0 relative z-40
          bg-[oklch(11%_.008_255)] border-r border-white/[0.06]
          md:static md:translate-x-0
          fixed inset-y-0 left-0 transition-transform duration-300
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="h-[72px] flex items-center px-5 border-b border-white/[0.06]">
          <Link
            to="/app/dashboard"
            className="flex items-center gap-3 cursor-pointer group"
            onClick={onClose}
          >
            <motion.div
              className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30 relative overflow-hidden"
              whileHover={{ scale: 1.05, rotate: -3 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <Zap className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <h1 className="font-bold text-[15px] text-slate-100 tracking-tight leading-none">
                Digital CMO
              </h1>
              <span className="inline-block text-[9px] font-bold text-blue-400 bg-blue-500/15 border border-blue-500/30 rounded px-1.5 py-0.5 uppercase tracking-widest mt-0.5">
                AI
              </span>
            </div>
          </Link>
        </div>

        {/* Agents Active Badge */}
        <div className="px-4 pt-3 pb-1">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/8 border border-emerald-500/20">
            <motion.span
              className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-[10px] font-semibold text-emerald-400">
              10 Agents Active
            </span>
            <span className="ml-auto text-[9px] text-slate-600 font-mono">live</span>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 py-4 px-3 overflow-y-auto scrollbar-none">
          <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-2 px-2">
            Main Menu
          </p>
          <div className="space-y-0.5">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.name}
                item={item}
                isActive={location.pathname === item.href}
                onClick={onClose}
              />
            ))}
          </div>

          <div className="pt-4 mt-4 border-t border-white/[0.06] space-y-0.5">
            <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-2 px-2">
              Account
            </p>
            {BOTTOM_ITEMS.map((item) => (
              <NavLink
                key={item.name}
                item={item}
                isActive={location.pathname === item.href}
                onClick={onClose}
              />
            ))}
          </div>
        </div>

        {/* User */}
        <div className="p-3 border-t border-white/[0.06]">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
            <Avatar className="w-8 h-8 border border-white/10 group-hover:border-blue-500/40 transition-colors flex-shrink-0">
              <AvatarImage
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || "user"}`}
              />
              <AvatarFallback className="bg-blue-600/20 text-blue-400 font-bold text-xs">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-[13px] font-semibold text-slate-200 truncate leading-tight">
                {user?.name || "User"}
              </span>
              <span className="text-[10px] text-blue-400 font-medium truncate">
                {(user as { plan?: string })?.plan || "Starter Plan"}
              </span>
            </div>
            <motion.button
              onClick={handleLogout}
              className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors flex-shrink-0"
              aria-label="Logout"
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
            >
              <LogOut className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        </div>
      </aside>
    </>
  );
});
