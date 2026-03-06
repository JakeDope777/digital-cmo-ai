import { useState } from 'react';
import { X } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { navItems } from './Sidebar';
import clsx from 'clsx';

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-b from-orange-50 via-amber-50 to-slate-100">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header onMenuClick={() => setMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            aria-label="Close menu backdrop"
            onClick={() => setMobileMenuOpen(false)}
            className="absolute inset-0 bg-slate-900/30"
          />
          <aside className="absolute left-0 top-0 h-full w-72 bg-white border-r border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between px-4 py-4 border-b border-slate-200">
              <p className="text-sm font-semibold text-slate-900">Navigation</p>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md p-2 text-slate-600 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="space-y-1 px-3 py-4">
              {navItems.map(({ label, path, icon: Icon }) => (
                <NavLink
                  key={path}
                  to={path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
                      isActive ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100',
                    )
                  }
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </NavLink>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </div>
  );
}
