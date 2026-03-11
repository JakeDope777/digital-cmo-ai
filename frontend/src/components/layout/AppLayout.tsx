import { Sidebar } from "./Sidebar";
import { Bell, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useEffect, memo } from "react";
import { useAuth } from "@/hooks/use-api";

export const AppLayout = memo(function AppLayout({ children, noPadding = false }: { children: React.ReactNode; noPadding?: boolean }) {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen bg-[#0a0f1e] text-slate-200 overflow-hidden font-sans selection:bg-indigo-600/30">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Header */}
        <header className="h-[72px] flex items-center justify-between px-6 border-b border-slate-800 bg-[#111827]/80 backdrop-blur-xl z-10 flex-shrink-0">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 w-80 xl:w-96 focus-within:ring-1 focus-within:ring-indigo-500/50 focus-within:border-indigo-500/50 transition-all gap-3">
            <Search className="w-4 h-4 text-slate-500 shrink-0" />
            <input
              type="text"
              placeholder="Search campaigns, leads, or ask AI..."
              className="bg-transparent border-none outline-none text-sm w-full text-slate-200 placeholder:text-slate-500"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-all relative">
              <Bell className="w-4.5 h-4.5" size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#111827]" />
            </button>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/35 transition-all rounded-xl px-5 h-9 text-sm">
              <Plus className="w-4 h-4 mr-1.5" />
              New Campaign
            </Button>
          </div>
        </header>

        {/* Content Area */}
        <div
          className={`flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-800 hover:scrollbar-thumb-slate-700 ${
            noPadding ? "" : "p-6 lg:p-8"
          }`}
        >
          {children}
        </div>
      </main>
    </div>
  );
});
