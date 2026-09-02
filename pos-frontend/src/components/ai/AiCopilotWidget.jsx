import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { queryCopilot } from "@/Redux Toolkit/features/ai/aiThunks";
import { addUserCopilotMessage, clearCopilotHistory } from "@/Redux Toolkit/features/ai/aiSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Send,
  Mic,
  MicOff,
  Trash2,
  X,
  Bot,
  User,
  Loader2,
  TrendingUp,
  Package,
  AlertTriangle,
  Zap,
} from "lucide-react";

// Lightweight zero-dependency markdown formatter
const SimpleMarkdown = ({ content }) => {
  if (!content) return null;

  const lines = content.split("\n");
  return (
    <div className="space-y-1 text-xs leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (trimmed.startsWith("### ")) {
          return (
            <h4 key={idx} className="font-bold text-[13px] text-foreground mt-2 mb-1">
              {trimmed.replace(/^###\s+/, "")}
            </h4>
          );
        }
        if (trimmed.startsWith("## ")) {
          return (
            <h3 key={idx} className="font-bold text-sm text-foreground mt-2 mb-1">
              {trimmed.replace(/^##\s+/, "")}
            </h3>
          );
        }
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          const text = trimmed.substring(2);
          return (
            <div key={idx} className="flex items-start gap-1.5 ml-1">
              <span className="text-[#C9A227] font-bold">•</span>
              <span dangerouslySetInnerHTML={{ __html: formatInline(text) }} />
            </div>
          );
        }
        if (/^\d+\.\s/.test(trimmed)) {
          return (
            <div key={idx} className="flex items-start gap-1.5 ml-1">
              <span className="text-[#C9A227] font-bold font-mono text-[10px]">
                {trimmed.match(/^\d+\./)[0]}
              </span>
              <span
                dangerouslySetInnerHTML={{
                  __html: formatInline(trimmed.replace(/^\d+\.\s+/, "")),
                }}
              />
            </div>
          );
        }
        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }
        return (
          <p key={idx} dangerouslySetInnerHTML={{ __html: formatInline(line) }} />
        );
      })}
    </div>
  );
};

const formatInline = (text) => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-foreground">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-muted font-mono text-[10px] text-[#B8860B]">$1</code>');
};

const getRolePromptChips = (role) => {
  switch (role) {
    case "ROLE_ADMIN":
      return [
        { label: "🌐 Platform Overview", query: "What is the overall platform GMV and active merchant count?" },
        { label: "🏪 Stores & Branches", query: "Give me an overview of all onboarded stores and branches." },
        { label: "👥 Platform Users", query: "How many total staff and cashier accounts are registered?" },
        { label: "📈 System Health", query: "What is the status of database connections and API uptime?" },
      ];
    case "ROLE_BRANCH_CASHIER":
      return [
        { label: "💰 My Billed Amount", query: "How many orders have I billed today and what is my total collection?" },
        { label: "🎯 Counter Upsell Tips", query: "Give me a quick 1-line customer pitch to upsell cold drinks or impulse snacks." },
        { label: "⚡ Fast Billing Advice", query: "Tips to scan faster and clear counter queues during rush hours." },
        { label: "💳 My Payment Split", query: "How much cash vs UPI have I collected in my till today?" },
      ];
    case "ROLE_BRANCH_ADMIN":
    case "ROLE_BRANCH_MANAGER":
      return [
        { label: "🏪 Branch Sales Today", query: "What is this branch's total completed sales and order volume today?" },
        { label: "⚡ Counter Queue Pace", query: "How can we optimize counter checkout queues during peak rush?" },
        { label: "📦 Branch Low Stock", query: "Which products in this branch need replenishment?" },
        { label: "👥 Cashier Performance", query: "How are cashiers performing on this branch today?" },
      ];
    case "ROLE_STORE_MANAGER":
      return [
        { label: "📋 Store Shift Orders", query: "How are today's completed orders pacing against target?" },
        { label: "📦 Inventory Urgency", query: "Which fast-moving grocery items are nearing critical safety threshold?" },
        { label: "👥 Cashier Shift Pace", query: "How is our cashier checkout pace and attendance today?" },
        { label: "💡 Store Operations", query: "Suggest 3 tips to streamline stock movements between branches." },
      ];
    case "ROLE_STORE_ADMIN":
    default:
      return [
        { label: "📊 Today's Store Revenue", query: "What are our total sales and completed orders today across branches?" },
        { label: "🚨 Stock Reorder Alert", query: "Which items are low in stock and need urgent supplier purchase orders?" },
        { label: "💰 Profit & Margins", query: "Suggest 3 actionable strategies to boost store gross profit margins." },
        { label: "💳 Cash vs Digital Sales", query: "Show our payment collection breakdown for today." },
      ];
  }
};

const getRoleSubtitle = (role, store, userProfile) => {
  switch (role) {
    case "ROLE_ADMIN":
      return "Super Admin Platform Intelligence";
    case "ROLE_BRANCH_CASHIER":
      return `Counter Coach • ${userProfile?.fullName || "Cashier Till"}`;
    case "ROLE_BRANCH_ADMIN":
    case "ROLE_BRANCH_MANAGER":
      return `Branch Operations • ${userProfile?.branch?.name || "Local Branch"}`;
    case "ROLE_STORE_MANAGER":
      return `Store Operations • ${store?.brand || store?.storeName || "Store"}`;
    case "ROLE_STORE_ADMIN":
    default:
      return `Business Partner • ${store?.brand || store?.storeName || "Swapnil Mega Mart"}`;
  }
};

const AiCopilotWidget = () => {
  const dispatch = useDispatch();
  const { copilotHistory = [], copilotLoading } = useSelector((state) => state.ai || {});
  const { userProfile } = useSelector((state) => state.user || {});
  const { store } = useSelector((state) => state.store || {});

  const promptChips = getRolePromptChips(userProfile?.role);

  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [copilotHistory, isOpen]);

  // Speech to Text Setup
  const handleVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript;
      setInputQuery(speechResult);
      setIsListening(false);
    };

    recognition.onerror = (err) => {
      console.warn("Speech recognition error:", err);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleSend = (textToSend) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || copilotLoading) return;

    dispatch(addUserCopilotMessage(query));
    setInputQuery("");

    dispatch(
      queryCopilot({
        query,
        storeId: store?.id || userProfile?.storeId,
        branchId: userProfile?.branchId,
      })
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating 3D AI Robot Trigger (Pure Avatar Icon) */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          title="NexPOS AI Copilot"
          aria-label="Toggle AI Copilot"
          className={`relative w-14 h-14 rounded-full p-0.5 shadow-2xl transition-all duration-300 cursor-pointer flex items-center justify-center group ${
            isOpen
              ? "ring-4 ring-[#C9A227] shadow-[0_0_30px_rgba(201,162,39,0.6)] scale-110"
              : "ring-2 ring-[#C9A227]/70 hover:ring-[#C9A227] hover:shadow-[0_0_25px_rgba(201,162,39,0.5)] hover:scale-110 active:scale-95"
          } bg-linear-to-br from-[#262422] to-[#121110]`}
        >
          {/* 3D Robot Avatar */}
          <div className="w-full h-full rounded-full overflow-hidden relative bg-black/40">
            <img
              src="/ai-avatar.jpg"
              alt="NexPOS AI Robot"
              className="w-full h-full object-cover object-top scale-115 group-hover:scale-125 transition-transform duration-300"
            />
          </div>

          {/* Live Online Pulse Dot */}
          <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-[#1c1a18] shadow-xs">
            <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75"></span>
          </span>
        </button>
      </div>

      {/* Slide-out Drawer Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-5 z-50 w-96 sm:w-[420px] h-[560px] max-h-[85vh] bg-card border border-border/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-lg animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="p-3.5 bg-[#262422] text-white flex items-center justify-between border-b border-[#383532]">
            <div className="flex items-center gap-2.5">
              <div className="relative w-9 h-9 rounded-2xl overflow-hidden ring-2 ring-[#C9A227]/60 shadow-md shrink-0 bg-black/40">
                <img
                  src="/ai-avatar.jpg"
                  alt="NexPOS AI Robot"
                  className="w-full h-full object-cover object-top scale-110"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#262422]"></span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-xs text-white">NexPOS AI Copilot</h3>
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[9px] font-bold">
                    ⚡ GROQ LPU
                  </span>
                </div>
                <p className="text-[10px] text-[#A8A29E] font-mono truncate max-w-[200px]">
                  {getRoleSubtitle(userProfile?.role, store, userProfile)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => dispatch(clearCopilotHistory())}
                className="p-1.5 rounded-xl hover:bg-[#33302D] text-[#A8A29E] hover:text-white transition-colors cursor-pointer"
                title="Clear Conversation"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl hover:bg-[#33302D] text-[#A8A29E] hover:text-white transition-colors cursor-pointer"
                title="Close Drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Prompt Chips */}
          <div className="p-2.5 bg-secondary/40 border-b border-border/60 overflow-x-auto flex items-center gap-1.5 no-scrollbar">
            {promptChips.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(chip.query)}
                className="px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-card border border-border/80 hover:border-[#C9A227] text-muted-foreground hover:text-foreground whitespace-nowrap transition-colors cursor-pointer shadow-2xs"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
            {copilotHistory.map((msg, index) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={index}
                  className={`flex gap-2 ${isUser ? "justify-end" : "justify-start"}`}
                >
                  {!isUser && (
                    <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 mt-0.5 ring-1 ring-[#C9A227]/50 shadow-xs bg-black/40">
                      <img src="/ai-avatar.jpg" alt="AI" className="w-full h-full object-cover object-top scale-110" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${isUser
                        ? "bg-[#262422] text-white rounded-br-xs shadow-xs"
                        : msg.isError
                          ? "bg-destructive/10 border border-destructive/30 text-destructive rounded-bl-xs"
                          : "bg-secondary/70 text-foreground border border-border/60 rounded-bl-xs shadow-2xs prose prose-invert prose-xs"
                      }`}
                  >
                    {isUser ? (
                      <p className="font-medium">{msg.content}</p>
                    ) : (
                      <div className="space-y-2">
                        <div className="max-w-none text-xs">
                          <SimpleMarkdown content={msg.content} />
                        </div>

                        {/* Suggested follow ups */}
                        {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                          <div className="pt-2 border-t border-border/60 space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                              Suggested Questions:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {msg.suggestedFollowUps.map((f, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => handleSend(f)}
                                  className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-card border border-border text-[#B8860B] hover:bg-[#B8860B]/10 cursor-pointer text-left truncate max-w-full"
                                >
                                  ↳ {f}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {isUser && (
                    <div className="w-6 h-6 rounded-full bg-[#C9A227] text-[#262422] flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}

            {copilotLoading && (
              <div className="flex gap-2 justify-start items-center p-2 text-xs text-muted-foreground">
                <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 ring-1 ring-[#C9A227]/50 shadow-xs bg-black/40">
                  <img src="/ai-avatar.jpg" alt="AI" className="w-full h-full object-cover object-top scale-110" />
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-secondary border border-border">
                  <Sparkles className="w-3.5 h-3.5 text-[#C9A227] animate-spin" />
                  <span>Groq AI is analyzing retail data...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-card border-t border-border/80 shrink-0">
            <div className="relative flex items-center gap-1.5">
              <Input
                type="text"
                placeholder={isListening ? "Listening to your voice..." : "Ask Copilot anything..."}
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={copilotLoading}
                className="pr-20 text-xs h-10 rounded-2xl bg-background border-border shadow-2xs focus-visible:ring-[#C9A227]"
              />

              <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleVoiceInput}
                  className={`p-1.5 rounded-xl transition-colors cursor-pointer ${isListening
                      ? "bg-red-500 text-white animate-pulse"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`}
                  title="Voice Input (Speech to text)"
                >
                  {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                </button>

                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleSend()}
                  disabled={!inputQuery.trim() || copilotLoading}
                  className="h-7 w-7 p-0 rounded-xl bg-[#C9A227] hover:bg-[#B08B1B] text-[#262422] cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AiCopilotWidget;
