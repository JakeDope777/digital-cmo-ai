import { useState, useRef, useEffect } from "react";
import { Bot, Send, Zap, Briefcase, TrendingUp } from "lucide-react";
import { useChatHistory, useSendChatMessage } from "@/hooks/use-api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

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

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || sendMutation.isPending) return;

    const userMsg = { id: Date.now().toString(), role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    try {
      const res = await sendMutation.mutateAsync(input);
      setMessages(prev => [...prev, { id: res.id, role: "assistant", content: res.response }]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] -m-6 lg:-m-8 bg-background relative animate-in fade-in">
      {/* Chat Header */}
      <div className="h-16 border-b border-border/50 flex items-center justify-between px-6 bg-card/30 backdrop-blur-md z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-semibold text-lg">AI CMO</h1>
          <Badge className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-0 ml-2">Online</Badge>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-background border-border text-muted-foreground"><Briefcase className="w-3 h-3 mr-1"/> SaaS</Badge>
          <Badge variant="outline" className="bg-background border-border text-muted-foreground"><TrendingUp className="w-3 h-3 mr-1"/> Growth Mode</Badge>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth pb-32">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-4 max-w-4xl mx-auto ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 mt-1 shadow-md shadow-primary/20">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
            
            <div className={`px-6 py-4 rounded-2xl shadow-sm ${
              msg.role === 'user' 
                ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                : 'bg-card border border-border text-foreground rounded-tl-sm'
            }`}>
              <div className="prose prose-invert max-w-none text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br/>') }} />
            </div>

            {msg.role === 'user' && (
              <Avatar className="w-8 h-8 shrink-0 mt-1 border border-border">
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
        
        {sendMutation.isPending && (
          <div className="flex gap-4 max-w-4xl mx-auto justify-start">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 mt-1">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="px-6 py-4 rounded-2xl rounded-tl-sm bg-card border border-border flex items-center gap-1.5 h-[52px]">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background to-transparent p-6">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto relative group">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
          <div className="relative bg-card border border-border rounded-2xl shadow-2xl focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 transition-all flex items-end p-2">
            <textarea 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Ask your CMO to analyze data, create campaigns, or draft copy..."
              className="w-full bg-transparent border-0 resize-none px-4 py-3 text-sm text-foreground outline-none min-h-[52px] max-h-[200px]"
              rows={1}
            />
            <button 
              type="submit"
              disabled={!input.trim() || sendMutation.isPending}
              className="p-3 m-1 rounded-xl flex items-center justify-center transition-all bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
