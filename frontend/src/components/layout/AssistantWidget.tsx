"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { MessageCircle, X, Send, Loader2, Sparkles, Mic, MicOff } from "lucide-react";
import { sendAIMessage, type AIMessage, type AIClientAction } from "@/lib/api/ai";
import { useVoiceSession } from "@/hooks/useVoiceSession";
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
 * Floating site-wide AI assistant. Understands the current page (route +
 * title, sent with every request) and can act on the user's behalf through
 * a small whitelisted set of tools (navigate, book_appointment) — never
 * arbitrary code. Mounted once in the root layout so it's available on
 * every page.
 */
export function AssistantWidget() {
  const [open, setOpen] = React.useState(false);
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
        aria-label={open ? "Close assistant" : "Open assistant"}
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 end-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
      >
        {open ? <X className="h-6 w-6" aria-hidden /> : <MessageCircle className="h-6 w-6" aria-hidden />}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="NIVREN Assistant"
          className="fixed bottom-24 end-5 z-40 flex h-[min(600px,70vh)] w-[min(380px,90vw)] flex-col overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card text-card-foreground shadow-2xl"
        >
          <div className="flex items-center gap-2 border-b border-border bg-primary px-4 py-3 text-primary-foreground">
            <Sparkles className="h-4 w-4" aria-hidden />
            <span className="flex-1 text-sm font-semibold">NIVREN Assistant</span>
            <button
              type="button"
              aria-label={voice.status === "connected" ? "Stop voice session" : "Start voice session"}
              aria-pressed={voice.status === "connected"}
              onClick={() => (voice.status === "connected" || voice.status === "connecting" ? voice.stop() : voice.start())}
              className={cn(
                "inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                voice.status === "connected"
                  ? "bg-primary-foreground text-primary"
                  : "text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground",
              )}
            >
              {voice.status === "connecting" ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : voice.status === "connected" ? (
                <Mic className="h-4 w-4" aria-hidden />
              ) : (
                <MicOff className="h-4 w-4" aria-hidden />
              )}
            </button>
          </div>

          {voice.status !== "idle" && (
            <div className="flex items-center gap-2 border-b border-border bg-muted px-4 py-2 text-xs text-muted-foreground">
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  voice.status === "connecting" && "animate-pulse bg-amber-500",
                  voice.status === "connected" && (voice.agentSpeaking ? "animate-pulse bg-primary" : "bg-emerald-500"),
                  voice.status === "error" && "bg-destructive",
                )}
                aria-hidden
              />
              {voice.status === "connecting" && "Connecting…"}
              {voice.status === "connected" && !voice.audioBlocked && (voice.agentSpeaking ? "Agent speaking…" : "Listening…")}
              {voice.status === "connected" && voice.audioBlocked && "Audio blocked by the browser"}
              {voice.status === "error" && (voice.error ?? "Voice session error.")}
            </div>
          )}

          {voice.status === "connected" && voice.audioBlocked && (
            <button
              type="button"
              onClick={() => voice.enableAudio()}
              className="border-b border-border bg-amber-500/10 px-4 py-2 text-left text-xs font-medium text-amber-600 hover:bg-amber-500/20 dark:text-amber-400"
            >
              🔊 Tap to enable the agent&rsquo;s voice — your browser blocked autoplay
            </button>
          )}

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Ask me about departments, RCM services, or say things like &ldquo;open the services
                page&rdquo; or &ldquo;book an appointment&rdquo;. Tap the mic to talk instead.
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
