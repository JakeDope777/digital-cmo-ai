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
} from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { label: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
  { label: 'Chat', path: '/app/chat', icon: MessageSquare },
  { label: 'Analysis', path: '/app/analysis', icon: Search },
  { label: 'Creative', path: '/app/creative', icon: Palette },
  { label: 'CRM', path: '/app/crm', icon: Users },
  { label: 'Billing', path: '/app/billing', icon: CreditCard },
  { label: 'Profile', path: '/app/profile', icon: UserCircle2 },
  { label: 'Settings', path: '/app/settings', icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="w-72 bg-white/95 border-r border-slate-200 flex-col hidden lg:flex">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-200">
        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg shadow-orange-400/20">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900 leading-tight">CMO Buddy</h1>
          <p className="text-xs text-slate-500">Revenue Operating System</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              )
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-slate-200">
        <p className="text-xs text-slate-500">Digital CMO AI v0.2.0</p>
      </div>
    </aside>
  );
}
