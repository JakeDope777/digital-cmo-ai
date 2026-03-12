import { Sidebar } from "./Sidebar";
import { CommandPalette } from "@/components/CommandPalette";
import { NotificationsPanel } from "@/components/NotificationsPanel";
import { OnboardingModal } from "@/components/OnboardingModal";
import { Bell, Search, Plus, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, memo, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useDemoMode } from "@/context/DemoModeContext";
import { motion, AnimatePresence } from "framer-motion";
import { pageVariants } from "@/lib/motion";

const PAGE_TITLES: Record<string, string> = {
  "/app/dashboard":    "Dashboard",
  "/app/chat":         "AI Chat",
  "/app/analysis":     "Analysis",
  "/app/creative":     "Creative Studio",
  "/app/crm":          "CRM",
  "/app/growth":       "Growth",
  "/app/campaigns":    "Campaigns",
  "/app/seo":          "SEO Intelligence",
  "/app/calendar":     "Content Calendar",
  "/app/reports":      "Reports",
  "/app/integrations": "Integrations",
  "/app/billing":      "Billing",
  "/app/settings":     "Settings",
};

const UNREAD_COUNT = 3;

export const AppLayout = memo(function AppLayout({
  children,
  noPadding = false,
}: {
  children: React.ReactNode;
  noPadding?: boolean;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isDemoMode, disableDemoMode } = useDemoMode();
  const [cmdOpen, setCmdOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [demoBannerDismissed, setDemoBannerDismissed] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem("dcmo_onboarded");
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Global ⌘K / Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen((o) => !o);
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

  const pageTitle = PAGE_TITLES[location.pathname] || "";

  const showDemoBanner = isDemoMode && !demoBannerDismissed;

  return (
    <div
      className="flex h-screen text-slate-200 overflow-hidden font-sans selection:bg-blue-600/30"
      style={{ background: "oklch(9% .008 255)" }}
    >
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">

        {/* Demo Mode Banner */}
        <AnimatePresence>
          {showDemoBanner && (
            <motion.div
              className="flex items-center justify-between px-4 py-2.5 text-sm font-medium text-white shrink-0"
              style={{ background: "oklch(65% .16 253)" }}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <span>
                🎭 Demo Mode — exploring with sample data.{" "}
                <button
                  className="underline font-semibold hover:opacity-80 transition-opacity"
                  onClick={() => navigate("/register")}
                >
                  Sign up to connect your real accounts →
                </button>
              </span>
              <button
                className="ml-4 p-1 rounded-lg hover:bg-white/20 transition-colors shrink-0"
                onClick={() => {
                  setDemoBannerDismissed(true);
                  disableDemoMode();
                }}
                aria-label="Dismiss demo banner"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Glass Top Header */}
        <header
          className="h-[72px] flex items-center justify-between px-4 md:px-6 border-b border-white/[0.06] backdrop-blur-2xl z-10 flex-shrink-0"
          style={{ background: "oklch(11% .008 255 / 0.7)" }}
        >
          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 mr-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Page title on mobile, search on desktop */}
          <div className="flex items-center gap-3 flex-1">
            {pageTitle && (
              <span className="hidden md:block text-sm font-semibold text-slate-400 mr-2">
                {pageTitle}
              </span>
            )}
            <button
              onClick={() => setCmdOpen(true)}
              className="flex items-center bg-white/5 border border-white/[0.08] rounded-xl px-4 py-2 w-72 xl:w-96 hover:border-white/[0.14] hover:bg-white/8 focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/40 transition-all duration-200 gap-3 text-left"
            >
              <Search className="w-4 h-4 text-slate-500 shrink-0" />
              <span className="text-sm text-slate-500 flex-1 text-left">Search or ask AI…</span>
              <div className="hidden xl:flex items-center gap-0.5 ml-auto shrink-0">
                <kbd className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold text-slate-600 bg-white/5 border border-white/10">
                  ⌘K
                </kbd>
              </div>
            </button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Notifications Bell */}
            <motion.button
              onClick={() => setNotifOpen((o) => !o)}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-white/[0.08] bg-white/5 hover:bg-white/10 text-slate-500 hover:text-slate-300 transition-all relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Bell className="w-[18px] h-[18px]" />
              {UNREAD_COUNT > 0 && (
                <motion.span
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 rounded-full border-2 border-[oklch(9%_.008_255)] flex items-center justify-center text-[8px] font-bold text-white"
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                >
                  {UNREAD_COUNT}
                </motion.span>
              )}
            </motion.button>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                className="font-semibold shadow-lg transition-all rounded-xl px-5 h-9 text-sm text-white"
                style={{
                  background: "oklch(65% .16 253)",
                  boxShadow: "0 4px 24px oklch(65% .16 253 / 0.25)",
                }}
              >
                <Plus className="w-4 h-4 mr-1.5" />
                New Campaign
              </Button>
            </motion.div>
          </div>
        </header>

        {/* Content Area with Page Transition */}
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
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
