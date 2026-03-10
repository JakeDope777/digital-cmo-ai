import { NavLink } from 'react-router-dom';
import {
  MessageSquare,
  LayoutDashboard,
  Search,
  Palette,
  Users,
  CreditCard,
  Settings,
  Brain,
  UserCircle2,
  Plug,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';
import clsx from 'clsx';
import { MODULE_CATALOG, MODULE_ORDER } from '../../data/domainModuleCatalog';
import type { ModuleId } from '../../types/catalog';

const ICON_BY_MODULE: Record<ModuleId, LucideIcon> = {
  dashboard: LayoutDashboard,
  chat: MessageSquare,
  analysis: Search,
  creative: Palette,
  crm: Users,
  growth: TrendingUp,
  integrations: Plug,
  billing: CreditCard,
  profile: UserCircle2,
  settings: Settings,
};

export const navItems = MODULE_ORDER.map((moduleId) => ({
  id: moduleId,
  label: MODULE_CATALOG[moduleId].title,
  path: MODULE_CATALOG[moduleId].route,
  icon: ICON_BY_MODULE[moduleId],
}));

interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export default function Sidebar({ className, onNavigate }: SidebarProps) {
  return (
    <aside className={clsx('w-64 bg-slate-900 border-r border-slate-800 flex-col hidden lg:flex', className)}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-800">
        <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
          <Brain className="w-4.5 h-4.5 text-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-white leading-tight">Digital CMO AI</h1>
          <p className="text-xs text-slate-500">AI Chief Marketing Officer</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            onClick={onNavigate}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-500 hover:bg-slate-800/60 hover:text-slate-200'
              )
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-slate-800">
        <p className="text-xs text-slate-600">v0.2.0 · MVP Track</p>
      </div>
    </aside>
  );
}
