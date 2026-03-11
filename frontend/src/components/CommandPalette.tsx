import { useState, useEffect, useRef, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import {
  MagnifyingGlassIcon,
  Squares2X2Icon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  PencilSquareIcon,
  UsersIcon,
  ArrowTrendingUpIcon,
  PuzzlePieceIcon,
  CreditCardIcon,
  Cog6ToothIcon,
  MagnifyingGlassCircleIcon,
  CalendarDaysIcon,
  DocumentChartBarIcon,
  BoltIcon,
  ArrowRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const PAGES = [
  { label: "Dashboard",       href: "/dashboard",    icon: Squares2X2Icon,          group: "Pages",   desc: "Overview of all campaigns and KPIs" },
  { label: "AI Chat",         href: "/chat",          icon: ChatBubbleLeftRightIcon,  group: "Pages",   desc: "Talk to your AI CMO directly" },
  { label: "Analysis",        href: "/analysis",      icon: ChartBarIcon,             group: "Pages",   desc: "Market research, SWOT, competitor analysis" },
  { label: "Creative Studio", href: "/creative",      icon: PencilSquareIcon,         group: "Pages",   desc: "Generate ad copy, emails, landing pages" },
  { label: "CRM",             href: "/crm",           icon: UsersIcon,                group: "Pages",   desc: "Contacts, pipeline and deal management" },
  { label: "Growth",          href: "/growth",        icon: ArrowTrendingUpIcon,      group: "Pages",   desc: "Funnel analysis and growth experiments" },
  { label: "SEO",             href: "/seo",           icon: MagnifyingGlassCircleIcon,group: "Pages",   desc: "Keyword rankings, content briefs, site audit" },
  { label: "Calendar",        href: "/calendar",      icon: CalendarDaysIcon,         group: "Pages",   desc: "Content calendar and publishing schedule" },
  { label: "Reports",         href: "/reports",       icon: DocumentChartBarIcon,     group: "Pages",   desc: "Campaign reports and performance downloads" },
  { label: "Integrations",    href: "/integrations",  icon: PuzzlePieceIcon,          group: "Pages",   desc: "Connect your tools and data sources" },
  { label: "Billing",         href: "/billing",       icon: CreditCardIcon,           group: "Pages",   desc: "Plans, usage and invoices" },
  { label: "Settings",        href: "/settings",      icon: Cog6ToothIcon,            group: "Pages",   desc: "Profile, AI config, notifications, security" },
];

const ACTIONS = [
  { label: "Run SEO audit",           icon: BoltIcon, group: "Quick Actions", desc: "Trigger a full site SEO scan now" },
  { label: "Generate weekly report",  icon: BoltIcon, group: "Quick Actions", desc: "Create a PDF performance summary" },
  { label: "Ask AI something",        icon: ChatBubbleLeftRightIcon, group: "Quick Actions", desc: "Open AI Chat with cursor ready", href: "/chat" },
  { label: "Schedule content",        icon: CalendarDaysIcon, group: "Quick Actions", desc: "Open the content calendar", href: "/calendar" },
];

const ALL_ITEMS = [...PAGES, ...ACTIONS];

function fuzzy(query: string, text: string) {
  const q = query.toLowerCase();
  return text.toLowerCase().includes(q);
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export const CommandPalette = memo(function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const [, navigate] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = query.trim()
    ? ALL_ITEMS.filter(i => fuzzy(query, i.label) || fuzzy(query, i.desc || ""))
    : ALL_ITEMS;

  const groups = Array.from(new Set(filtered.map(i => i.group)));

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const handleSelect = useCallback((item: typeof ALL_ITEMS[0]) => {
    if (item.href) navigate(item.href);
    onClose();
  }, [navigate, onClose]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") { e.preventDefault(); setSelected(s => Math.min(s + 1, filtered.length - 1)); }
      if (e.key === "ArrowUp")   { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
      if (e.key === "Enter")     { e.preventDefault(); if (filtered[selected]) handleSelect(filtered[selected]); }
      if (e.key === "Escape")    { onClose(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, filtered, selected, handleSelect, onClose]);

  useEffect(() => { setSelected(0); }, [query]);

  let idx = 0;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4 pointer-events-none">
            <motion.div
              className="w-full max-w-2xl pointer-events-auto"
              initial={{ opacity: 0, scale: 0.96, y: -12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -8 }}
              transition={{ duration: 0.18, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div className="bg-[#111827] border border-slate-700/80 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">
                {/* Input */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-800">
                  <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 shrink-0" />
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search pages, features, or ask AI..."
                    className="flex-1 bg-transparent text-slate-100 placeholder:text-slate-500 text-base outline-none"
                  />
                  {query && (
                    <button onClick={() => setQuery("")} className="text-slate-500 hover:text-slate-300 transition-colors">
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  )}
                  <kbd className="hidden sm:flex items-center px-2 py-1 rounded text-[10px] font-semibold text-slate-500 bg-slate-800 border border-slate-700">ESC</kbd>
                </div>

                {/* Results */}
                <div ref={listRef} className="max-h-[420px] overflow-y-auto py-2">
                  {filtered.length === 0 && (
                    <div className="text-center py-12 text-slate-500 text-sm">No results for "{query}"</div>
                  )}
                  {groups.map(group => (
                    <div key={group}>
                      <div className="px-5 py-2 text-[10px] font-semibold uppercase tracking-widest text-slate-600">{group}</div>
                      {filtered.filter(i => i.group === group).map(item => {
                        const isSelected = idx === selected;
                        const currentIdx = idx++;
                        return (
                          <button
                            key={item.label + item.group}
                            onMouseEnter={() => setSelected(currentIdx)}
                            onClick={() => handleSelect(item)}
                            className={`w-full flex items-center gap-4 px-4 mx-1 py-3 rounded-xl text-left transition-all duration-100 ${
                              isSelected ? "bg-indigo-600/20 text-slate-100" : "text-slate-300 hover:bg-slate-800/50"
                            }`}
                            style={{ width: "calc(100% - 8px)" }}
                          >
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? "bg-indigo-600/30 border border-indigo-500/40" : "bg-slate-800 border border-slate-700"}`}>
                              <item.icon className={`w-4.5 h-4.5 ${isSelected ? "text-indigo-400" : "text-slate-400"}`} style={{ width: 18, height: 18 }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold truncate">{item.label}</div>
                              {item.desc && <div className="text-xs text-slate-500 truncate mt-0.5">{item.desc}</div>}
                            </div>
                            {isSelected && <ArrowRightIcon className="w-4 h-4 text-indigo-400 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center gap-4 px-5 py-3 border-t border-slate-800 text-[10px] text-slate-600">
                  <span><kbd className="bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 mr-1 text-slate-500">↑↓</kbd>Navigate</span>
                  <span><kbd className="bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 mr-1 text-slate-500">↵</kbd>Open</span>
                  <span><kbd className="bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 mr-1 text-slate-500">ESC</kbd>Close</span>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
});
