import { Sidebar } from "./Sidebar";
import { CommandPalette } from "@/components/CommandPalette";
import { NotificationsPanel } from "@/components/NotificationsPanel";
import { OnboardingModal } from "@/components/OnboardingModal";
import {
  BellIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useEffect, memo, useState, useCallback } from "react";
import { useAuth } from "@/hooks/use-api";
import { motion, AnimatePresence } from "framer-motion";
import { pageVariants } from "@/lib/motion";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard":    "Dashboard",
  "/chat":         "AI Chat",
  "/analysis":     "Analysis",
  "/creative":     "Creative Studio",
  "/crm":          "CRM",
  "/growth":       "Growth",
  "/campaigns":    "Campaigns",
  "/seo":          "SEO Intelligence",
  "/calendar":     "Content Calendar",
  "/reports":      "Reports",
  "/integrations": "Integrations",
  "/billing":      "Billing",
  "/settings":     "Settings",
};

const UNREAD_COUNT = 3;

export const AppLayout = memo(function AppLayout({
  children,
  noPadding = false,
}: {
  children: React.ReactNode;
  noPadding?: boolean;
}) {
  const [location, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const [cmdOpen, setCmdOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem("dcmo_onboarded");
  });

  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
  }, [isAuthenticated, navigate]);

  // Global ⌘K / Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen(o => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const closeCmd = useCallback(() => setCmdOpen(false), []);
  const closeNotif = useCallback(() => setNotifOpen(false), []);
  const completeOnboarding = useCallback(() => {
    localStorage.setItem("dcmo_onboarded", "1");
    setShowOnboarding(false);
  }, []);

  if (!isAuthenticated) return null;

  const pageTitle = PAGE_TITLES[location] || "";

  return (
    <div className="flex h-screen bg-[#0a0f1e] text-slate-200 overflow-hidden font-sans selection:bg-indigo-600/30">
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">

        {/* Glass Top Header */}
        <header className="h-[72px] flex items-center justify-between px-4 md:px-6 border-b border-slate-800/80 bg-[#111827]/70 backdrop-blur-2xl z-10 flex-shrink-0">
          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 mr-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            onClick={() => setSidebarOpen(o => !o)}
            aria-label="Toggle menu"
          >
            <Bars3Icon className="w-5 h-5" />
          </button>
          {/* Search / ⌘K trigger */}
          <button
            onClick={() => setCmdOpen(true)}
            className="flex items-center bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-2 w-72 xl:w-96 hover:border-slate-700 hover:bg-slate-900 focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/40 transition-all duration-200 gap-3 group text-left"
          >
            <MagnifyingGlassIcon className="w-4 h-4 text-slate-500 shrink-0" />
            <span className="text-sm text-slate-500 flex-1 text-left">Search or ask AI…</span>
            <div className="hidden xl:flex items-center gap-0.5 ml-auto shrink-0">
              <kbd className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold text-slate-600 bg-slate-800 border border-slate-700">⌘K</kbd>
            </div>
          </button>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Notifications Bell */}
            <motion.button
              onClick={() => setNotifOpen(o => !o)}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-all relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <BellIcon className="w-[18px] h-[18px]" />
              {UNREAD_COUNT > 0 && (
                <motion.span
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 rounded-full border-2 border-[#111827] flex items-center justify-center text-[8px] font-bold text-white"
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                >
                  {UNREAD_COUNT}
                </motion.span>
              )}
            </motion.button>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 transition-all rounded-xl px-5 h-9 text-sm">
                <PlusIcon className="w-4 h-4 mr-1.5" />
                New Campaign
              </Button>
            </motion.div>
          </div>
        </header>

        {/* Content Area with Page Transition */}
        <AnimatePresence mode="wait">
          <motion.div
            key={location}
            variants={pageVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className={`flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-800 hover:scrollbar-thumb-slate-700 ${
              noPadding ? "" : "p-6 lg:p-8"
            }`}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Global Overlays */}
      <CommandPalette open={cmdOpen} onClose={closeCmd} />
      <NotificationsPanel open={notifOpen} onClose={closeNotif} />
      {showOnboarding && <OnboardingModal onComplete={completeOnboarding} />}
    </div>
  );
});
