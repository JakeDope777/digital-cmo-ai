import { Link, useLocation } from "wouter";
import {
  Squares2X2Icon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  PencilSquareIcon,
  UsersIcon,
  ArrowTrendingUpIcon,
  PuzzlePieceIcon,
  CreditCardIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  CpuChipIcon,
  BoltIcon,
  MagnifyingGlassCircleIcon,
  CalendarDaysIcon,
  DocumentChartBarIcon,
  BriefcaseIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { memo } from "react";

const NAV_ITEMS = [
  { name: "Dashboard",    href: "/dashboard",    icon: Squares2X2Icon },
  { name: "AI Chat",      href: "/chat",          icon: ChatBubbleLeftRightIcon },
  { name: "Analysis",     href: "/analysis",      icon: ChartBarIcon },
  { name: "Creative",     href: "/creative",      icon: PencilSquareIcon },
  { name: "CRM",          href: "/crm",           icon: UsersIcon },
  { name: "Growth",       href: "/growth",        icon: ArrowTrendingUpIcon },
  { name: "Campaigns",    href: "/campaigns",     icon: BriefcaseIcon },
  { name: "SEO",          href: "/seo",           icon: MagnifyingGlassCircleIcon },
  { name: "Calendar",     href: "/calendar",      icon: CalendarDaysIcon },
  { name: "Reports",      href: "/reports",       icon: DocumentChartBarIcon },
  { name: "Integrations", href: "/integrations",  icon: PuzzlePieceIcon },
];

const BOTTOM_ITEMS = [
  { name: "Billing",  href: "/billing",  icon: CreditCardIcon },
  { name: "Settings", href: "/settings", icon: Cog6ToothIcon },
];

function NavLink({ item, isActive }: { item: typeof NAV_ITEMS[0]; isActive: boolean }) {
  return (
    <Link
      href={item.href}
      className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer group"
    >
      {isActive && (
        <motion.div
          layoutId="sidebar-active"
          className="absolute inset-0 rounded-xl bg-indigo-600 shadow-lg shadow-indigo-600/30"
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
        />
      )}
      <motion.div
        className="relative"
        whileHover={!isActive ? { scale: 1.1 } : {}}
        transition={{ duration: 0.15 }}
      >
        <item.icon
          className={`w-[18px] h-[18px] shrink-0 transition-colors duration-150 ${
            isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"
          }`}
        />
      </motion.div>
      <span
        className={`relative font-medium text-sm tracking-tight transition-colors duration-150 ${
          isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"
        }`}
      >
        {item.name}
      </span>
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
          <motion.div
            className="w-9 h-9 bg-gradient-to-br from-indigo-500 via-indigo-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 relative overflow-hidden"
            whileHover={{ scale: 1.05, rotate: -3 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <CpuChipIcon className="w-5 h-5 text-white" />
            <motion.div
              className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-amber-400 rounded-full flex items-center justify-center"
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <BoltIcon className="w-2 h-2 text-amber-900" />
            </motion.div>
          </motion.div>
          <div>
            <h1 className="font-bold text-[15px] text-slate-100 tracking-tight leading-none">Digital CMO</h1>
            <p className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider mt-0.5">AI Engine</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-5 px-3 overflow-y-auto scrollbar-none">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">Main Menu</p>
        <div className="space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.name} item={item} isActive={location === item.href} />
          ))}
        </div>

        <div className="pt-5 mt-5 border-t border-slate-800 space-y-0.5">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">System</p>
          {BOTTOM_ITEMS.map((item) => (
            <NavLink key={item.name} item={item} isActive={location === item.href} />
          ))}
        </div>
      </div>

      {/* Agent Status Chip */}
      <div className="px-4 pb-3">
        <motion.div
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/8 border border-emerald-500/15"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.span
            className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="text-[10px] font-semibold text-emerald-400">7 agents active</span>
          <span className="ml-auto text-[9px] text-slate-600 font-mono">live</span>
        </motion.div>
      </div>

      {/* User */}
      <div className="p-3 border-t border-slate-800">
        <motion.div
          className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/60 transition-colors cursor-pointer group"
          whileHover={{ x: 1 }}
          transition={{ duration: 0.15 }}
        >
          <Avatar className="w-8 h-8 border border-slate-700 group-hover:border-indigo-500/50 transition-colors flex-shrink-0">
            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Felix'}`} />
            <AvatarFallback className="bg-indigo-600/20 text-indigo-400 font-bold text-xs">JD</AvatarFallback>
          </Avatar>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-[13px] font-semibold text-slate-200 truncate leading-tight">{user?.name || 'Jake Davis'}</span>
            <span className="text-[10px] text-indigo-400 font-medium truncate">{user?.plan || 'Growth Plan'}</span>
          </div>
          <motion.button
            onClick={logout}
            className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors flex-shrink-0"
            aria-label="Logout"
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeftOnRectangleIcon className="w-3.5 h-3.5" />
          </motion.button>
        </motion.div>
      </div>
    </aside>
  );
});
