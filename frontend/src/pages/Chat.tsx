import { useState, useRef, useEffect, memo, useMemo } from "react";
import { Bot, Send, Sparkles, TrendingUp, Search, PenTool, BarChart3, Target, Zap, ChevronRight, Users, Briefcase, Plus, MessageSquare, Clock } from "lucide-react";
import { useChatHistory, useSendChatMessage } from "@/hooks/use-api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const PROMPT_SUGGESTIONS = [
  { icon: TrendingUp, label: "Grow organic traffic",   prompt: "Analyze our current organic traffic and give me a 90-day SEO plan to grow it by 40%." },
  { icon: Target,     label: "Launch a paid campaign",  prompt: "Design a Google Ads campaign for our SaaS product targeting mid-market CFOs. Budget $5K/mo." },
  { icon: PenTool,    label: "Write email sequence",    prompt: "Write a 5-email onboarding sequence for trial users who haven't set up their first integration." },
  { icon: BarChart3,  label: "Revenue attribution",     prompt: "Which marketing channels are driving the most revenue? Break down our attribution model." },
  { icon: Search,     label: "Competitor analysis",     prompt: "Compare us against our top 3 competitors on positioning, pricing, and content strategy." },
  { icon: Sparkles,   label: "Content strategy",        prompt: "Build a Q2 content calendar targeting decision-makers in B2B SaaS. Include SEO clusters." },
];

const KNOWLEDGE_SOURCES = [
  { label: "HubSpot CRM",   color: "text-orange-400" },
  { label: "GA4 Analytics", color: "text-yellow-400" },
  { label: "Stripe Revenue",color: "text-violet-400" },
  { label: "Brand Memory",  color: "text-indigo-400" },
];

const HISTORY_SESSIONS = [
  { id: "1", title: "Q2 SEO growth strategy",            time: "2h ago",    active: true },
  { id: "2", title: "Google Ads campaign brief",          time: "Yesterday",  active: false },
  { id: "3", title: "Competitor content gap analysis",    time: "2 days ago", active: false },
  { id: "4", title: "Onboarding email sequence",          time: "3 days ago", active: false },
  { id: "5", title: "LinkedIn thought leadership posts",  time: "1 week ago", active: false },
];

const CONTEXT_CHIPS = [
  { label: "All 10 agents",   color: "text-indigo-400",  bg: "bg-indigo-600/10  border-indigo-500/20" },
  { label: "Memory synced",   color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  { label: "Live data",       color: "text-sky-400",     bg: "bg-sky-500/10     border-sky-500/20" },
];

export const Chat = memo(function Chat() {
  const { data: initialHistory } = useChatHistory();
  const sendMutation = useSendChatMessage();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialHistory && messages.length === 0) {
      setMessages(initialHistory);
    }
  }, [initialHistory]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sendMutation.isPending]);

  const handleSend = async (e?: React.FormEvent, overrideInput?: string) => {
    e?.preventDefault();
    const text = overrideInput || input;
    if (!text.trim() || sendMutation.isPending) return;

    const userMsg = { id: Date.now().toString(), role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    try {
      const res = await sendMutation.mutateAsync(text);
      setMessages(prev => [...prev, { id: res.id, role: "assistant", content: res.response }]);
    } catch (err) {
      console.error(err);
    }
  };

  const isEmpty = messages.length === 0 && !sendMutation.isPending;

  return (
    <div className="flex h-[calc(100vh-5rem)] -m-6 lg:-m-8 overflow-hidden animate-in fade-in">

      {/* History Sidebar */}
      <div className="hidden lg:flex w-60 xl:w-64 flex-col bg-[#111827] border-r border-slate-800 flex-shrink-0">
        <div className="h-14 flex items-center justify-between px-4 border-b border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Chat History</span>
          <button className="w-7 h-7 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/20 flex items-center justify-center transition-colors">
            <Plus className="w-3.5 h-3.5 text-indigo-400" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {HISTORY_SESSIONS.map((session) => (
            <button
              key={session.id}
              className={`w-full flex items-start gap-2.5 p-3 rounded-xl transition-all text-left group ${session.active ? "bg-indigo-600/15 border border-indigo-500/25" : "hover:bg-slate-800/60 border border-transparent"}`}
            >
              <MessageSquare className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${session.active ? "text-indigo-400" : "text-slate-500"}`} />
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium truncate ${session.active ? "text-slate-200" : "text-slate-400 group-hover:text-slate-200"}`}>{session.title}</p>
                <p className="text-[10px] text-slate-600 flex items-center gap-1 mt-0.5"><Clock className="w-2.5 h-2.5" />{session.time}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0a0f1e] relative overflow-hidden">

        {/* Chat Header */}
        <div className="h-14 border-b border-slate-800 flex items-center justify-between px-5 bg-[#111827] backdrop-blur-md z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-500/25">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#111827]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-sm text-slate-100">AI CMO</h1>
                <Badge className="bg-emerald-500/10 text-emerald-400 border-0 text-[10px] h-4 px-1.5">Online</Badge>
              </div>
              <p className="text-[10px] text-slate-500">GPT-4o · 10 agents active · Memory synced</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {CONTEXT_CHIPS.map((chip) => (
              <span key={chip.label} className={`hidden md:flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border ${chip.bg} ${chip.color}`}>
                {chip.label}
              </span>
            ))}
          </div>
        </div>

        {/* Context chips strip */}
        <div className="px-5 py-2 border-b border-slate-800/60 flex items-center gap-2 shrink-0 bg-[#111827]/50">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 shrink-0">Context:</span>
          <div className="flex flex-wrap gap-1.5">
            {KNOWLEDGE_SOURCES.map((s) => (
              <span key={s.label} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/5 border border-white/8 ${s.color}`}>
                {s.label}
              </span>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto scroll-smooth pb-36">

          {isEmpty && (
            <div className="flex flex-col items-center justify-center h-full px-6 py-10">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-600/25 to-blue-600/15 rounded-2xl border border-indigo-500/20 flex items-center justify-center mb-5">
                <Bot className="w-7 h-7 text-indigo-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-100 mb-2">Your AI CMO is ready</h2>
              <p className="text-slate-400 text-center max-w-md mb-8 text-sm leading-relaxed">
                Ask anything about strategy, campaigns, content, or data. I have full context of your brand, analytics, and competitors.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-3xl">
                {PROMPT_SUGGESTIONS.map((s) => (
                  <button
                    key={s.label}
                    onClick={() => handleSend(undefined, s.prompt)}
                    className="flex items-start gap-3 text-left p-4 rounded-2xl border border-slate-800 bg-[#111827] hover:border-indigo-500/30 hover:bg-indigo-600/5 transition-all group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-indigo-600/15 border border-indigo-500/20 flex items-center justify-center shrink-0 group-hover:bg-indigo-600/25 transition-colors">
                      <s.icon className="w-3.5 h-3.5 text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-200">{s.label}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{s.prompt}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 shrink-0 mt-0.5 group-hover:text-indigo-400 transition-colors ml-auto" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {!isEmpty && (
            <div className="p-5 space-y-5 max-w-3xl mx-auto">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shrink-0 mt-1 shadow-md shadow-indigo-500/25">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[82%] px-4 py-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white rounded-tr-sm"
                      : "bg-[#111827] border border-slate-800 text-slate-200 rounded-tl-sm"
                  }`}>
                    <div dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, "<br/>") }} />
                    {msg.role === "assistant" && (
                      <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-slate-800">
                        <span className="text-[10px] text-slate-500">AI CMO · {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <Avatar className="w-8 h-8 shrink-0 mt-1 border border-slate-700">
                      <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {sendMutation.isPending && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shrink-0 mt-1 shadow-md shadow-indigo-500/25">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="px-4 py-3.5 rounded-2xl rounded-tl-sm bg-[#111827] border border-slate-800 flex items-center gap-2">
                    <span className="text-xs text-slate-500 mr-1">Thinking</span>
                    {[0, 150, 300].map((delay) => (
                      <div key={delay} className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0a0f1e] via-[#0a0f1e]/95 to-transparent pt-8 px-5 pb-5">
          <form onSubmit={handleSend} className="max-w-3xl mx-auto">
            <div className="bg-[#111827] border border-slate-700 rounded-2xl shadow-2xl shadow-black/30 focus-within:border-indigo-500/60 focus-within:ring-1 focus-within:ring-indigo-500/20 transition-all flex items-end p-2">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Ask your AI CMO anything — strategy, campaigns, copy, data analysis..."
                className="w-full bg-transparent resize-none px-3 py-2.5 text-sm text-slate-200 outline-none min-h-[48px] max-h-[200px] placeholder:text-slate-500"
                rows={1}
              />
              <button
                type="submit"
                disabled={!input.trim() || sendMutation.isPending}
                className="p-2.5 m-1 rounded-xl flex items-center justify-center transition-all bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/30 shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-center text-[10px] text-slate-600 mt-2">Shift+Enter for new line · Enter to send</p>
          </form>
        </div>
      </div>
    </div>
  );
});
