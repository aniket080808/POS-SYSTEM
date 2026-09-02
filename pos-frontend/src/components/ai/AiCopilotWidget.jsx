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

const PROMPT_CHIPS = [
  { label: "📊 Today's Sales Snapshot", query: "What are our total sales and orders today?" },
  { label: "🚨 Stock Reorder Alert", query: "Which items are low in stock and need reordering?" },
  { label: "🔥 Top 5 Best Sellers", query: "Which are the top 5 revenue generating products?" },
  { label: "💡 Profit Margin Strategy", query: "How can we optimize gross margins this week?" },
];

const AiCopilotWidget = () => {
  const dispatch = useDispatch();
  const { copilotHistory = [], copilotLoading } = useSelector((state) => state.ai || {});
  const { userProfile } = useSelector((state) => state.user || {});
  const { store } = useSelector((state) => state.store || {});

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
      {/* Floating Trigger Pill */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-full font-bold text-xs shadow-2xl transition-all duration-200 cursor-pointer ${isOpen
              ? "bg-[#262422] text-[#C9A227] border border-[#C9A227]/40 ring-4 ring-[#C9A227]/20"
              : "bg-linear-to-r from-[#262422] to-[#383532] text-white hover:border-[#C9A227] border border-border/80 hover:shadow-[#C9A227]/10"
            }`}
        >
          <div className="relative">
            <Sparkles className="w-4 h-4 text-[#C9A227] animate-pulse" />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
          </div>
          <span className="font-semibold tracking-wide">Gemini Copilot</span>
          <Badge variant="secondary" className="text-[9px] font-mono px-1 py-0 bg-white/10 text-[#C9A227] border-0">
            AI
          </Badge>
        </button>
      </div>

      {/* Slide-out Drawer Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-5 z-50 w-96 sm:w-[420px] h-[560px] max-h-[85vh] bg-card border border-border/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-lg animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="p-3.5 bg-[#262422] text-white flex items-center justify-between border-b border-[#383532]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-2xl bg-linear-to-br from-[#C9A227] to-[#8C6D14] text-[#262422] shadow-xs">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-xs text-white">Copilot</h3>
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[9px] font-bold">
                    ONLINE
                  </span>
                </div>
                <p className="text-[10px] text-[#A8A29E] font-mono truncate max-w-[200px]">
                  {store?.storeName || "Supermarket AI Assistant"}
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
            {PROMPT_CHIPS.map((chip, idx) => (
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
                    <div className="w-6 h-6 rounded-full bg-[#262422] text-[#C9A227] flex items-center justify-center shrink-0 mt-0.5 border border-[#383532]">
                      <Bot className="w-3.5 h-3.5" />
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
                <div className="w-6 h-6 rounded-full bg-[#262422] text-[#C9A227] flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-secondary border border-border">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#B8860B]" />
                  <span>Gemini is analyzing retail data...</span>
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
