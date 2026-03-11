import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  XMarkIcon,
  BoltIcon,
  ChartBarIcon,
  MagnifyingGlassCircleIcon,
  PencilSquareIcon,
  ChatBubbleLeftRightIcon,
  ArrowTrendingUpIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  BellIcon,
} from "@heroicons/react/24/outline";

const NOTIFICATIONS = [
  {
    id: 1, type: "success", icon: ArrowTrendingUpIcon, iconColor: "text-emerald-400", iconBg: "bg-emerald-500/10 border-emerald-500/20",
    title: "SEO rank improved",
    body: "\"AI marketing software\" moved from #14 → #8 on Google. Traffic up 34%.",
    time: "2 min ago", agent: "SEO Agent", unread: true,
  },
  {
    id: 2, type: "info", icon: PencilSquareIcon, iconColor: "text-violet-400", iconBg: "bg-violet-500/10 border-violet-500/20",
    title: "3 ad variants generated",
    body: "New A/B copy for your Google Ads campaign is ready for review.",
    time: "14 min ago", agent: "Creative Agent", unread: true,
  },
  {
    id: 3, type: "info", icon: ChartBarIcon, iconColor: "text-blue-400", iconBg: "bg-blue-500/10 border-blue-500/20",
    title: "Weekly report ready",
    body: "Campaign performance summary for the week of Mar 3–9 is ready to download.",
    time: "1 hr ago", agent: "Analytics Agent", unread: true,
  },
  {
    id: 4, type: "warning", icon: ExclamationTriangleIcon, iconColor: "text-amber-400", iconBg: "bg-amber-500/10 border-amber-500/20",
    title: "Paid ads budget pacing high",
    body: "Google Ads campaign is 23% over daily budget target. Review recommended.",
    time: "2 hr ago", agent: "Paid Ads Agent", unread: false,
  },
  {
    id: 5, type: "success", icon: EnvelopeIcon, iconColor: "text-emerald-400", iconBg: "bg-emerald-500/10 border-emerald-500/20",
    title: "Email sequence launched",
    body: "7-step onboarding flow deployed to 842 new trial users. Open rate: 68%.",
    time: "3 hr ago", agent: "Email Agent", unread: false,
  },
  {
    id: 6, type: "info", icon: MagnifyingGlassCircleIcon, iconColor: "text-sky-400", iconBg: "bg-sky-500/10 border-sky-500/20",
    title: "Site audit complete",
    body: "Found 4 critical issues and 12 opportunities. Overall score: 84/100.",
    time: "5 hr ago", agent: "SEO Agent", unread: false,
  },
  {
    id: 7, type: "success", icon: BoltIcon, iconColor: "text-indigo-400", iconBg: "bg-indigo-500/10 border-indigo-500/20",
    title: "Orchestrator sync complete",
    body: "All 10 agents synced brand memory. 3 new campaign strategies queued.",
    time: "Yesterday", agent: "Orchestrator", unread: false,
  },
  {
    id: 8, type: "info", icon: ChatBubbleLeftRightIcon, iconColor: "text-teal-400", iconBg: "bg-teal-500/10 border-teal-500/20",
    title: "New insight from AI Chat",
    body: "Your saved query returned: competitor \"MarketingOS\" dropped pricing by 20%.",
    time: "Yesterday", agent: "AI Chat", unread: false,
  },
];

interface NotificationsPanelProps {
  open: boolean;
  onClose: () => void;
}

export const NotificationsPanel = memo(function NotificationsPanel({ open, onClose }: NotificationsPanelProps) {
  const unreadCount = NOTIFICATIONS.filter(n => n.unread).length;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed right-4 top-[80px] z-50 w-[400px] max-h-[calc(100vh-100px)] flex flex-col"
            initial={{ opacity: 0, x: 16, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 16, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="bg-[#111827] border border-slate-700/80 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden flex flex-col max-h-[calc(100vh-100px)]">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 flex-shrink-0">
                <div className="flex items-center gap-2.5">
                  <BellIcon className="w-5 h-5 text-slate-300" />
                  <span className="font-semibold text-slate-100">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-bold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors p-1 rounded-lg hover:bg-slate-800">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {/* List */}
              <div className="overflow-y-auto flex-1">
                {NOTIFICATIONS.map((n, i) => (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className={`flex gap-3.5 px-5 py-4 border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors cursor-pointer relative ${n.unread ? "bg-indigo-600/[0.04]" : ""}`}
                  >
                    {n.unread && (
                      <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    )}
                    <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${n.iconBg}`}>
                      <n.icon className={`w-4.5 h-4.5 ${n.iconColor}`} style={{ width: 18, height: 18 }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className={`text-sm font-semibold leading-tight ${n.unread ? "text-slate-100" : "text-slate-300"}`}>{n.title}</span>
                        <span className="text-[10px] text-slate-600 shrink-0 mt-0.5">{n.time}</span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">{n.body}</p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="w-1 h-1 rounded-full bg-slate-700" />
                        <span className="text-[10px] text-slate-600 font-medium">{n.agent}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t border-slate-800 flex items-center justify-between flex-shrink-0">
                <button className="text-xs text-slate-500 hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                  <CheckCircleIcon className="w-3.5 h-3.5" /> Mark all read
                </button>
                <button className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium">View all activity →</button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});
