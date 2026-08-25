"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { MessageCircle, X, Send, Loader2, Sparkles } from "lucide-react";
import { sendAIMessage, type AIMessage, type AIClientAction } from "@/lib/api/ai";
import { useVoiceSession } from "@/hooks/useVoiceSession";
import { VoiceAgentPanel, VOICE_AVATAR_URL } from "./VoiceAgentPanel";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

interface ChatEntry extends AIMessage {
  id: string;
}

/**
 * The AI's navigate actions carry bare paths (e.g. "/services") from the
 * shared, locale-agnostic NAVIGABLE_ROUTES whitelist. router.push() with a
 * bare path relies on middleware to redirect to the locale-prefixed route
 * during client-side navigation, which doesn't reliably land on the real
 * page — so we prefix the current locale ourselves, the same way every
 * other link on the site is already built (e.g. href="/en/about").
 */
function withLocale(path: string, pathname: string): string {
  const locale = pathname.split("/")[1] || "en";
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

/**
 * Floating site-wide AI assistant — two independent widgets sharing one
 * action pipeline: a text chat bubble, and a separate voice-agent avatar
 * (see VoiceAgentPanel) opened from its own floating button. Understands
 * the current page (route + title, sent with every request) and can act on
 * the user's behalf through a small whitelisted set of tools (navigate,
 * book_appointment, scroll_to_section) — never arbitrary code. Mounted
 * once in the root layout so it's available on every page.
 */
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

  /** Shared by text chat and voice — both surfaces execute the same action shape. */
  const runClientAction = React.useCallback(
    (action: AIClientAction) => {
      if (action.type === "navigate") {
        router.push(withLocale(action.path, pathname));
      } else if (action.type === "scroll") {
        document.getElementById(action.sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
    [router, pathname],
  );

  const voice = useVoiceSession(runClientAction, pathname);

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
      <button
        type="button"
        aria-label={voiceOpen ? "Close voice agent" : "Open voice agent"}
        aria-pressed={voiceOpen}
        onClick={() => (voiceOpen ? closeVoice() : openVoice())}
        className="fixed bottom-24 end-5 z-40 h-14 w-14 rounded-full transition-transform hover:scale-105 active:scale-95"
      >
        <span
          aria-hidden
          className={cn(
            "absolute -inset-1.5 rounded-full bg-gradient-to-br from-primary to-secondary blur-md transition-opacity",
            voice.status === "connected" ? "animate-pulse opacity-90" : "opacity-50",
          )}
        />
        <span
          className="relative z-10 block h-14 w-14 overflow-hidden rounded-full bg-cover bg-center shadow-lg ring-2 ring-white/80"
          style={{ backgroundImage: `url(${VOICE_AVATAR_URL})` }}
        >
          {voiceOpen && (
            <span className="absolute inset-0 flex items-center justify-center bg-slate-950/60">
              <X className="h-6 w-6 text-white" aria-hidden />
            </span>
          )}
        </span>
      </button>

      <button
        type="button"
        aria-label={open ? "Close assistant" : "Open assistant"}
        onClick={() => {
          setVoiceOpen(false);
          setOpen((v) => !v);
        }}
        className="fixed bottom-5 end-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
      >
        {open ? <X className="h-6 w-6" aria-hidden /> : <MessageCircle className="h-6 w-6" aria-hidden />}
      </button>

      {voiceOpen && <VoiceAgentPanel voice={voice} onClose={closeVoice} />}

      {open && (
        <div
          role="dialog"
          aria-label="NIVREN Assistant"
          className="fixed bottom-24 end-5 z-40 flex h-[min(600px,70vh)] w-[min(380px,90vw)] flex-col overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card text-card-foreground shadow-2xl"
        >
          <div className="flex items-center gap-2 border-b border-border bg-primary px-4 py-3 text-primary-foreground">
            <Sparkles className="h-4 w-4" aria-hidden />
            <span className="flex-1 text-sm font-semibold">NIVREN Assistant</span>
          </div>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Ask me about departments, RCM services, or say things like &ldquo;open the services
                page&rdquo; or &ldquo;book an appointment&rdquo;. Or tap the other button to talk instead.
              </p>
            )}
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "max-w-[85%] rounded-[var(--radius-md)] px-3 py-2 text-sm leading-relaxed",
                  m.role === "user"
                    ? "ms-auto bg-primary text-primary-foreground"
                    : "bg-muted text-foreground",
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
