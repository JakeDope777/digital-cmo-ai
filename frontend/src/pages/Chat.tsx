import { useState, useRef, useEffect } from "react";
import { Bot, Send, Sparkles, TrendingUp, Search, PenTool, BarChart3, Target, Zap, ChevronRight, Users, Briefcase } from "lucide-react";
import { useChatHistory, useSendChatMessage } from "@/hooks/use-api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const PROMPT_SUGGESTIONS = [
  { icon: TrendingUp,  label: "Grow organic traffic",    prompt: "Analyze our current organic traffic and give me a 90-day SEO plan to grow it by 40%." },
  { icon: Target,      label: "Launch a paid campaign",   prompt: "Design a Google Ads campaign for our SaaS product targeting mid-market CFOs. Budget $5K/mo." },
  { icon: PenTool,     label: "Write email sequence",     prompt: "Write a 5-email onboarding sequence for trial users who haven't set up their first integration." },
  { icon: BarChart3,   label: "Revenue attribution",      prompt: "Which marketing channels are driving the most revenue? Break down our attribution model." },
  { icon: Search,      label: "Competitor analysis",      prompt: "Compare us against our top 3 competitors on positioning, pricing, and content strategy." },
  { icon: Sparkles,    label: "Content strategy",         prompt: "Build a Q2 content calendar targeting decision-makers in B2B SaaS. Include SEO clusters." },
];

const KNOWLEDGE_SOURCES = [
  { label: "HubSpot CRM", color: "text-orange-400" },
  { label: "GA4 Analytics", color: "text-yellow-400" },
  { label: "Stripe Revenue", color: "text-violet-400" },
  { label: "Brand Memory", color: "text-primary" },
];

export function Chat() {
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
    <div className="flex flex-col h-[calc(100vh-5rem)] -m-6 lg:-m-8 bg-background relative animate-in fade-in">

      {/* Chat Header */}
      <div className="h-16 border-b border-border/50 flex items-center justify-between px-6 bg-card/30 backdrop-blur-md z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-background" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base">AI CMO</h1>
              <Badge className="bg-emerald-500/10 text-emerald-400 border-0 text-[10px] h-4 px-1.5">Online</Badge>
            </div>
            <p className="text-[10px] text-muted-foreground">GPT-4o · 10 agents active · Memory synced</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground/70 bg-card/50 border border-border/50 rounded-full px-3 py-1.5">
            <Zap className="w-3 h-3 text-primary" />
            <span>Knows your brand, data & history</span>
          </div>
          <Badge variant="outline" className="bg-background border-border text-muted-foreground text-xs">
            <Briefcase className="w-3 h-3 mr-1" /> SaaS
          </Badge>
        </div>
      </div>

      {/* Knowledge sources banner */}
      <div className="px-6 py-2.5 border-b border-border/30 bg-card/10 flex items-center gap-3 shrink-0">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">Connected context:</span>
        <div className="flex flex-wrap gap-1.5">
          {KNOWLEDGE_SOURCES.map((s) => (
            <span key={s.label} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/5 border border-white/8 ${s.color}`}>{s.label}</span>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scroll-smooth pb-40">

        {/* Empty state with prompt suggestions */}
        {isEmpty && (
          <div className="flex flex-col items-center justify-center h-full px-6 py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-blue-600/20 rounded-2xl border border-primary/20 flex items-center justify-center mb-6">
              <Bot className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Your AI CMO is ready</h2>
            <p className="text-muted-foreground text-center max-w-md mb-10">
              Ask anything about your marketing strategy, campaigns, content, or data. I have full context of your brand, analytics, and competitors.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-3xl">
              {PROMPT_SUGGESTIONS.map((s) => (
                <button
                  key={s.label}
                  onClick={() => handleSend(undefined, s.prompt)}
                  className="flex items-start gap-3 text-left p-4 rounded-2xl border border-border/50 bg-card/50 hover:border-primary/30 hover:bg-primary/5 transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <s.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{s.label}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{s.prompt}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/50 shrink-0 mt-0.5 group-hover:text-primary transition-colors ml-auto" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Thread */}
        {!isEmpty && (
          <div className="p-6 space-y-6 max-w-4xl mx-auto">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shrink-0 mt-1 shadow-md shadow-primary/20">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className={`max-w-[80%] px-5 py-4 rounded-2xl shadow-sm ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-card border border-border/50 text-foreground rounded-tl-sm"
                }`}>
                  <div
                    className="text-sm leading-relaxed prose prose-invert max-w-none prose-p:my-1 prose-ul:my-2"
                    dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, "<br/>") }}
                  />
                  {msg.role === "assistant" && (
                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/30">
                      <span className="text-[10px] text-muted-foreground">AI CMO · {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  )}
                </div>
                {msg.role === "user" && (
                  <Avatar className="w-9 h-9 shrink-0 mt-1 border-2 border-border">
                    <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {sendMutation.isPending && (
              <div className="flex gap-4 justify-start">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shrink-0 mt-1 shadow-md shadow-primary/20">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="px-5 py-4 rounded-2xl rounded-tl-sm bg-card border border-border/50 flex items-center gap-2 h-14">
                  <span className="text-xs text-muted-foreground mr-1">Thinking</span>
                  {[0, 150, 300].map((delay) => (
                    <div key={delay} className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/95 to-transparent pt-8 px-6 pb-6">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto relative group">
          <div className="absolute -inset-1 bg-primary/10 blur-xl rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
          <div className="relative bg-card border border-border/50 rounded-2xl shadow-2xl shadow-black/20 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/30 transition-all flex items-end p-2">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Ask your AI CMO anything — strategy, campaigns, copy, data analysis..."
              className="w-full bg-transparent resize-none px-4 py-3 text-sm text-foreground outline-none min-h-[52px] max-h-[200px] placeholder:text-muted-foreground/50"
              rows={1}
            />
            <button
              type="submit"
              disabled={!input.trim() || sendMutation.isPending}
              className="p-3 m-1 rounded-xl flex items-center justify-center transition-all bg-primary text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 shadow-lg shadow-primary/25 shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-center text-[10px] text-muted-foreground/40 mt-2">Shift+Enter for new line · Enter to send</p>
        </form>
      </div>
    </div>
  );
}
