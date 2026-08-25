"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { MessageCircle, X, Send, Loader2, Sparkles } from "lucide-react";
import { sendAIMessage, type AIMessage, type AIClientAction } from "@/lib/api/ai";
import { useVoiceSession } from "@/hooks/useVoiceSession";
import { VoiceAgentPanel } from "./VoiceAgentPanel";
import { AVATAR_CONFIG } from "@/config/avatar";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

interface ChatEntry extends AIMessage {
  id: string;
}

function withLocale(path: string, pathname: string): string {
  const locale = pathname.split("/")[1] || "en";
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

export function AssistantWidget() {
  const [open, setOpen] = React.useState(false);
  const [voiceOpen, setVoiceOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatEntry[]>([]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const listRef = React.useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  const runClientAction = React.useCallback(
    (action: any) => {
      if (action.type === "navigate") {
        router.push(withLocale(action.path, pathname));
      } else if (action.type === "scroll") {
        document.getElementById(action.sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (action.type === "consultation_requested") {
        fetch("http://localhost:5000/api/appointments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: action.data.name,
            phone: action.data.phone,
            departmentId: action.data.serviceOrSpecialty || "general",
            date: new Date().toISOString().split("T")[0],
            time: "10:00 AM",
            reason: `Voice AI Appointment (${action.data.serviceOrSpecialty || "General"})`,
          }),
        }).catch((err) => console.error("Voice appointment booking error:", err));
      }
    },
    [router, pathname]
  );

  // LiveKit WebRTC Voice Session connected to Backend RAG & MCP tools
  const voice = useVoiceSession(runClientAction, pathname);

  const defaultAvatar =
    AVATAR_CONFIG.avatars[AVATAR_CONFIG.defaultGender as keyof typeof AVATAR_CONFIG.avatars] ||
    AVATAR_CONFIG.avatars.female;

  const openVoice = () => {
    setOpen(false);
    setVoiceOpen(true);
    if (voice.status === "idle") voice.start();
  };

  const closeVoice = () => {
    setVoiceOpen(false);
    if (voice.status === "connected" || voice.status === "connecting") voice.stop();
  };

  React.useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const userEntry: ChatEntry = { id: crypto.randomUUID(), role: "user", content: text };
    const history = messages.map(({ role, content }) => ({ role, content }));
    setMessages((prev) => [...prev, userEntry]);
    setInput("");
    setLoading(true);
    setError(false);

    try {
      const result = await sendAIMessage(text, history, {
        route: pathname,
        title: typeof document !== "undefined" ? document.title : "",
      });

      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: result.reply || "Done." },
      ]);

      for (const action of result.actions) {
        runClientAction(action);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* 1. Upper Floating Button: AI Voice Agent Avatar */}
      <button
        type="button"
        aria-label={voiceOpen ? "Close AI Voice Agent" : "Open AI Voice Agent"}
        aria-pressed={voiceOpen}
        onClick={() => (voiceOpen ? closeVoice() : openVoice())}
        className="fixed bottom-24 end-5 z-40 h-14 w-14 rounded-full transition-transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
      >
        <span
          aria-hidden
          className={cn(
            "absolute -inset-1.5 rounded-full bg-gradient-to-br from-cyan-400 via-primary to-blue-600 blur-md transition-opacity",
            voice.status === "connected" ? "animate-pulse opacity-90" : "opacity-60"
          )}
        />
        <span
          className="relative z-10 block h-14 w-14 overflow-hidden rounded-full bg-cover bg-center shadow-lg ring-2 ring-white/90"
          style={{ backgroundImage: `url(${defaultAvatar.imageUrl})` }}
        >
          {voiceOpen && (
            <span className="absolute inset-0 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs">
              <X className="h-6 w-6 text-white" aria-hidden />
            </span>
          )}
        </span>
      </button>

      {/* 2. Lower Floating Button: Text Chat Bot */}
      <button
        type="button"
        aria-label={open ? "Close chat assistant" : "Open chat assistant"}
        onClick={() => {
          if (voiceOpen) closeVoice();
          setOpen((v) => !v);
        }}
        className="fixed bottom-5 end-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl transition-transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {open ? <X className="h-6 w-6" aria-hidden /> : <MessageCircle className="h-6 w-6" aria-hidden />}
      </button>

      {/* Voice Agent Panel Modal */}
      {voiceOpen && <VoiceAgentPanel voice={voice} onClose={closeVoice} />}

      {/* Text Chat Bot Dialog */}
      {open && (
        <div
          role="dialog"
          aria-label="NIVREN Chat Assistant"
          className="fixed bottom-24 end-5 z-40 flex h-[min(600px,70vh)] w-[min(380px,90vw)] flex-col overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card text-card-foreground shadow-2xl"
        >
          <div className="flex items-center gap-2 border-b border-border bg-primary px-4 py-3 text-primary-foreground">
            <Sparkles className="h-4 w-4" aria-hidden />
            <span className="flex-1 text-sm font-semibold">NIVREN Assistant</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-primary-foreground/80 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Ask me about departments, RCM services, or say things like &ldquo;open the services
                page&rdquo; or &ldquo;book an appointment&rdquo;. Or tap the avatar button above to talk via voice!
              </p>
            )}
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "max-w-[85%] rounded-[var(--radius-md)] px-3 py-2 text-sm leading-relaxed",
                  m.role === "user"
                    ? "ms-auto bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                )}
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Thinking…
              </div>
            )}
            {error && (
              <p className="text-sm text-destructive">
                Something went wrong. Please try again.
              </p>
            )}
          </div>

          <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-border p-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question…"
              className="h-10 flex-1 rounded-[var(--radius-md)] border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              disabled={loading}
            />
            <Button type="submit" size="icon" disabled={loading || !input.trim()} aria-label="Send message">
              <Send className="h-4 w-4" aria-hidden />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
