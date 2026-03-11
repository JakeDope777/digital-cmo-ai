import { Sidebar } from "./Sidebar";
import {
  BellIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  CommandLineIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useEffect, memo } from "react";
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
  "/integrations": "Integrations",
  "/billing":      "Billing",
  "/settings":     "Settings",
};

export const AppLayout = memo(function AppLayout({
  children,
  noPadding = false,
}: {
  children: React.ReactNode;
  noPadding?: boolean;
}) {
  const [location, navigate] = useLocation();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen bg-[#0a0f1e] text-slate-200 overflow-hidden font-sans selection:bg-indigo-600/30">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">

        {/* Glass Top Header */}
        <header className="h-[72px] flex items-center justify-between px-6 border-b border-slate-800/80 bg-[#111827]/70 backdrop-blur-2xl z-10 flex-shrink-0">
          {/* Search */}
          <div className="flex items-center bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-2 w-80 xl:w-96 focus-within:ring-1 focus-within:ring-indigo-500/50 focus-within:border-indigo-500/40 transition-all duration-200 gap-3 group">
            <MagnifyingGlassIcon className="w-4 h-4 text-slate-500 shrink-0" />
            <input
              type="text"
              placeholder="Search or ask AI..."
              className="bg-transparent border-none outline-none text-sm w-full text-slate-200 placeholder:text-slate-500"
            />
            <div className="hidden xl:flex items-center gap-0.5 ml-auto shrink-0">
              <kbd className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold text-slate-600 bg-slate-800 border border-slate-700">⌘K</kbd>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <motion.button
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-all relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <BellIcon className="w-[18px] h-[18px]" />
              <motion.span
                className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#111827]"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              />
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
    </div>
  );
});
