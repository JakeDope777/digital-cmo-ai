import { memo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { fadeUp, stagger } from "@/lib/motion";
import {
  ChevronLeftIcon, ChevronRightIcon, PlusIcon,
  PencilSquareIcon, ShareIcon, EnvelopeIcon,
  MagnifyingGlassIcon, MegaphoneIcon, DocumentTextIcon,
  BoltIcon, CheckCircleIcon,
} from "@heroicons/react/24/outline";

const CHANNEL_CONFIG: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
  blog:    { color: "text-violet-400",  bg: "bg-violet-500/20 border-violet-500/30",  icon: DocumentTextIcon },
  social:  { color: "text-pink-400",   bg: "bg-pink-500/20 border-pink-500/30",       icon: ShareIcon },
  email:   { color: "text-emerald-400",bg: "bg-emerald-500/20 border-emerald-500/30", icon: EnvelopeIcon },
  ads:     { color: "text-orange-400", bg: "bg-orange-500/20 border-orange-500/30",   icon: MegaphoneIcon },
  seo:     { color: "text-sky-400",    bg: "bg-sky-500/20 border-sky-500/30",          icon: MagnifyingGlassIcon },
  creative:{ color: "text-amber-400",  bg: "bg-amber-500/20 border-amber-500/30",     icon: PencilSquareIcon },
};

interface ContentItem {
  id: number; day: number; title: string; channel: keyof typeof CHANNEL_CONFIG;
  status: "published" | "scheduled" | "draft"; time?: string;
}

const CONTENT: ContentItem[] = [
  { id: 1,  day: 3,  title: "AI CMO Q1 Roundup Blog Post",           channel: "blog",    status: "published", time: "9:00" },
  { id: 2,  day: 3,  title: "LinkedIn: Agency vs AI thread",          channel: "social",  status: "published", time: "11:00" },
  { id: 3,  day: 5,  title: "Email: March newsletter (2,840 list)",   channel: "email",   status: "published", time: "8:00" },
  { id: 4,  day: 7,  title: "Google Ads new creative set live",       channel: "ads",     status: "published", time: "10:00" },
  { id: 5,  day: 10, title: "SEO: Publish 'Replace Your Agency' guide",channel: "seo",    status: "published", time: "9:30" },
  { id: 6,  day: 11, title: "X/Twitter: AI marketing tips thread",    channel: "social",  status: "published", time: "12:00" },
  { id: 7,  day: 12, title: "Email: Re-engagement flow batch 1",      channel: "email",   status: "scheduled", time: "8:00" },
  { id: 8,  day: 14, title: "Blog: 10 AI Automation Case Studies",    channel: "blog",    status: "scheduled", time: "9:00" },
  { id: 9,  day: 14, title: "Meta Ads: New lookalike audience test",  channel: "ads",     status: "scheduled", time: "10:00" },
  { id: 10, day: 17, title: "LinkedIn: Founder story carousel",       channel: "social",  status: "scheduled", time: "11:30" },
  { id: 11, day: 18, title: "SEO: Long-form AI marketing guide",      channel: "blog",    status: "scheduled", time: "9:00" },
  { id: 12, day: 19, title: "Email: Product update — new integrations", channel: "email", status: "scheduled", time: "8:00" },
  { id: 13, day: 21, title: "Google Ads: Retargeting campaign",       channel: "ads",     status: "draft",    time: "TBD" },
  { id: 14, day: 24, title: "Blog: AI vs Human CMO comparison",       channel: "blog",    status: "draft",    time: "TBD" },
  { id: 15, day: 24, title: "Social: Product Hunt launch campaign",   channel: "social",  status: "draft",    time: "TBD" },
  { id: 16, day: 26, title: "Email: Re-engagement flow batch 2",      channel: "email",   status: "draft",    time: "TBD" },
  { id: 17, day: 28, title: "SEO: Technical audit fixes published",   channel: "seo",     status: "draft",    time: "TBD" },
  { id: 18, day: 31, title: "Monthly performance creative recap",     channel: "creative",status: "draft",    time: "TBD" },
];

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_START_DAY = 6; // March 2026 starts on Saturday (index 6)
const DAYS_IN_MONTH = 31;
const TODAY = 11;

export const Calendar = memo(function Calendar() {
  const [month] = useState("March 2026");
  const [selectedDay, setSelectedDay] = useState<number | null>(TODAY);

  const itemsByDay: Record<number, ContentItem[]> = {};
  CONTENT.forEach(item => {
    if (!itemsByDay[item.day]) itemsByDay[item.day] = [];
    itemsByDay[item.day].push(item);
  });

  const totalCells = Math.ceil((MONTH_START_DAY + DAYS_IN_MONTH) / 7) * 7;
  const selectedItems = selectedDay ? (itemsByDay[selectedDay] || []) : [];

  const publishedCount = CONTENT.filter(c => c.status === "published").length;
  const scheduledCount = CONTENT.filter(c => c.status === "scheduled").length;
  const draftCount = CONTENT.filter(c => c.status === "draft").length;

  return (
    <motion.div className="max-w-7xl mx-auto px-4 py-6 space-y-6" variants={stagger} initial="hidden" animate="show">

      {/* Header */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Content Calendar</h1>
          <p className="text-sm text-slate-500 mt-0.5">Plan, schedule and publish across every channel</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 rounded-xl gap-2">
            <BoltIcon className="w-4 h-4 text-indigo-400" /> AI Plan Month
          </Button>
          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2">
            <PlusIcon className="w-4 h-4" /> Add Content
          </Button>
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div variants={fadeUp} className="grid grid-cols-3 gap-4">
        {[
          { label: "Published",  count: publishedCount,  color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
          { label: "Scheduled",  count: scheduledCount,  color: "text-indigo-400",  bg: "bg-indigo-500/10 border-indigo-500/20" },
          { label: "Drafts",     count: draftCount,      color: "text-slate-400",   bg: "bg-slate-700/30 border-slate-700" },
        ].map(s => (
          <Card key={s.label} className={`${s.bg} border rounded-2xl`}>
            <CardContent className="p-4 text-center">
              <div className={`text-3xl font-bold ${s.color} mb-0.5`}>{s.count}</div>
              <div className="text-xs text-slate-500">{s.label} this month</div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">

        {/* Calendar Grid */}
        <motion.div variants={fadeUp}>
          <Card className="bg-[#111827] border-slate-800 rounded-2xl overflow-hidden">
            {/* Month nav */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
              <button className="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors">
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              <h2 className="text-base font-semibold text-slate-100">{month}</h2>
              <button className="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors">
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-slate-800">
              {DAYS_OF_WEEK.map(d => (
                <div key={d} className="py-2 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-600">{d}</div>
              ))}
            </div>

            {/* Cells */}
            <div className="grid grid-cols-7">
              {Array.from({ length: totalCells }).map((_, i) => {
                const day = i - MONTH_START_DAY + 1;
                const isValid = day >= 1 && day <= DAYS_IN_MONTH;
                const items = isValid ? (itemsByDay[day] || []) : [];
                const isToday = day === TODAY;
                const isSelected = day === selectedDay;

                return (
                  <div
                    key={i}
                    onClick={() => isValid && setSelectedDay(day === selectedDay ? null : day)}
                    className={`min-h-[90px] p-2 border-b border-r border-slate-800/60 transition-colors cursor-pointer ${
                      !isValid ? "bg-slate-900/30" : isSelected ? "bg-indigo-600/10" : "hover:bg-slate-800/20"
                    }`}
                  >
                    {isValid && (
                      <>
                        <div className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-semibold mb-1.5 ${
                          isToday ? "bg-indigo-600 text-white" : isSelected ? "text-indigo-300" : "text-slate-400"
                        }`}>
                          {day}
                        </div>
                        <div className="space-y-0.5">
                          {items.slice(0, 3).map(item => {
                            const cfg = CHANNEL_CONFIG[item.channel];
                            return (
                              <div key={item.id} className={`text-[9px] px-1.5 py-0.5 rounded border truncate font-medium ${cfg.bg} ${cfg.color}`}>
                                {item.title}
                              </div>
                            );
                          })}
                          {items.length > 3 && (
                            <div className="text-[9px] text-slate-600 px-1">+{items.length - 3} more</div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>

        {/* Day Detail Panel */}
        <motion.div variants={fadeUp} className="space-y-4">
          {/* Channel legend */}
          <Card className="bg-[#111827] border-slate-800 rounded-2xl">
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Channels</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(CHANNEL_CONFIG).map(([ch, cfg]) => (
                  <span key={ch} className={`text-[11px] px-2.5 py-1 rounded-full border font-medium flex items-center gap-1.5 ${cfg.bg} ${cfg.color}`}>
                    <cfg.icon className="w-3 h-3" /> {ch.charAt(0).toUpperCase() + ch.slice(1)}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Selected day content */}
          <Card className="bg-[#111827] border-slate-800 rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-slate-200">
                  {selectedDay ? `March ${selectedDay}` : "Select a day"}
                </p>
                {selectedItems.length > 0 && (
                  <span className="text-xs text-slate-500">{selectedItems.length} item{selectedItems.length > 1 ? "s" : ""}</span>
                )}
              </div>

              {selectedItems.length === 0 && (
                <div className="text-center py-8 text-slate-600">
                  <DocumentTextIcon className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-xs">{selectedDay ? "Nothing scheduled" : "Click a day to see content"}</p>
                </div>
              )}

              <div className="space-y-2.5">
                {selectedItems.map(item => {
                  const cfg = CHANNEL_CONFIG[item.channel];
                  return (
                    <motion.div key={item.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-3 p-3 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
                      <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${cfg.bg}`}>
                        <cfg.icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-200 leading-tight mb-1">{item.title}</p>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                            item.status === "published" ? "bg-emerald-600/20 text-emerald-300" :
                            item.status === "scheduled" ? "bg-indigo-600/20 text-indigo-300" :
                            "bg-slate-700 text-slate-400"}`}>
                            {item.status}
                          </span>
                          {item.time && <span className="text-[10px] text-slate-600">{item.time}</span>}
                        </div>
                      </div>
                      {item.status === "published" && <CheckCircleIcon className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
                    </motion.div>
                  );
                })}
              </div>

              {selectedDay && (
                <button className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-slate-700 text-xs text-slate-500 hover:border-indigo-500/50 hover:text-indigo-400 transition-colors">
                  <PlusIcon className="w-3.5 h-3.5" /> Add content to this day
                </button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
});
