"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { MessageCircle, X, Send, Loader2, Sparkles } from "lucide-react";
import { sendAIMessage, type AIMessage, type AIClientAction } from "@/lib/api/ai";
import { useVoiceSession, type ConsultationField } from "@/hooks/useVoiceSession";
import { VoiceAgentPanel } from "./VoiceAgentPanel";
import { AVATAR_CONFIG } from "@/config/avatar";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import { useTheme } from "@/hooks/useTheme";
import { useLocale } from "@/hooks/useLocale";
import { apiFetch } from "@/lib/api/client";
import { trackEvent } from "@/lib/analytics";
import type { AppointmentResult } from "@/types";

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
  const { setTheme } = useTheme();
  const { dict } = useLocale();
  const t = dict.assistant;
  // Live-filled consultation form the voice agent updates field-by-field via
  // update_form actions, so the user can watch the AI actually fill it in —
  // see runClientAction below and the form card in VoiceAgentPanel.
  const [voiceForm, setVoiceForm] = React.useState<Partial<Record<ConsultationField, string>>>({});
  const [voiceFormSubmitted, setVoiceFormSubmitted] = React.useState(false);

  const switchLanguage = React.useCallback(
    (locale: "en" | "hi" | "ar") => {
      const segments = pathname.split("/");
      segments[1] = locale; // first segment after the leading slash is the locale
      router.push(segments.join("/") || "/");
    },
    [pathname, router]
  );

  const runClientAction = React.useCallback(
    (action: any) => {
      if (action.type === "navigate") {
        router.push(withLocale(action.path, pathname));
      } else if (action.type === "scroll") {
        document.getElementById(action.sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (action.type === "set_theme") {
        setTheme(action.theme);
        trackEvent({ name: "theme_change", theme: action.theme });
      } else if (action.type === "set_language") {
        switchLanguage(action.locale);
        trackEvent({ name: "language_change", locale: action.locale });
      } else if (action.type === "consultation_started") {
        trackEvent({ name: "consultation_start", source: "voice" });
      } else if (action.type === "consultation_confirmed") {
        trackEvent({ name: "consultation_confirmation" });
      } else if (action.type === "update_form") {
        setVoiceFormSubmitted(false);
        setVoiceForm((prev) => ({ ...prev, [action.field]: action.value }));
        trackEvent({ name: "consultation_field_completed", field: action.field });
      } else if (action.type === "consultation_requested") {
        setVoiceFormSubmitted(true);
        trackEvent({ name: "consultation_submit" });
        apiFetch<AppointmentResult>("/api/appointments", {
          method: "POST",
          body: JSON.stringify({
            name: action.data.name,
            phone: action.data.phone,
            email: action.data.email,
            departmentId: action.data.serviceOrSpecialty || "general",
            date: new Date().toISOString().split("T")[0],
            time: "10:00 AM",
            reason: action.data.message || `Voice AI Appointment (${action.data.serviceOrSpecialty || "General"})`,
          }),
        })
          .then(() => trackEvent({ name: "consultation_submit_success" }))
          .catch((err) => {
            trackEvent({ name: "consultation_submit_failure" });
            console.error("Voice appointment booking error:", err);
          });
      }
    },
    [router, pathname, setTheme, switchLanguage]
  );

  // LiveKit WebRTC Voice Session connected to Backend RAG & MCP tools
  const voice = useVoiceSession(runClientAction, pathname);

  const defaultAvatar =
    AVATAR_CONFIG.avatars[AVATAR_CONFIG.defaultGender as keyof typeof AVATAR_CONFIG.avatars] ||
    AVATAR_CONFIG.avatars.female;

  const openVoice = () => {
    setOpen(false);
    setVoiceOpen(true);
    trackEvent({ name: "voice_assistant_open" });
    if (voice.status === "idle") voice.start();
  };

  const closeVoice = () => {
    setVoiceOpen(false);
    if (voice.status === "connected" || voice.status === "connecting") voice.stop();
    setVoiceForm({});
    setVoiceFormSubmitted(false);
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
        { id: crypto.randomUUID(), role: "assistant", content: result.reply || t.doneFallback },
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
        aria-label={voiceOpen ? t.closeVoice : t.openVoice}
        aria-pressed={voiceOpen}
        onClick={(e) => {
          e.stopPropagation();
          if (voiceOpen) {
            closeVoice();
          } else {
            openVoice();
          }
        }}
        className={cn(
          "fixed bottom-24 end-5 h-14 w-14 rounded-full transition-transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 cursor-pointer",
          voiceOpen ? "z-60" : "z-40"
        )}
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
            <span className="absolute inset-0 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs">
              <X className="h-7 w-7 text-white" aria-hidden />
            </span>
          )}
        </span>
      </button>

      {/* 2. Lower Floating Button: Text Chat Bot */}
      <button
        type="button"
        aria-label={open ? t.closeChat : t.openChat}
        onClick={() => {
          if (voiceOpen) closeVoice();
          setOpen((v) => !v);
        }}
        className="fixed bottom-5 end-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl transition-transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {open ? <X className="h-6 w-6" aria-hidden /> : <MessageCircle className="h-6 w-6" aria-hidden />}
      </button>

      {/* Voice Agent Panel Modal */}
      {voiceOpen && (
        <VoiceAgentPanel voice={voice} onClose={closeVoice} form={voiceForm} formSubmitted={voiceFormSubmitted} />
      )}

      {/* Text Chat Bot Dialog */}
      {open && (
        <div
          role="dialog"
          aria-label={t.dialogLabel}
          className="fixed bottom-24 end-5 z-40 flex h-[min(600px,70vh)] w-[min(380px,90vw)] flex-col overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card text-card-foreground shadow-2xl"
        >
          <div className="flex items-center gap-2 border-b border-border bg-primary px-4 py-3 text-primary-foreground">
            <Sparkles className="h-4 w-4" aria-hidden />
            <span className="flex-1 text-sm font-semibold">{t.title}</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-primary-foreground/80 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 && <p className="text-sm text-muted-foreground">{t.emptyHint}</p>}
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
                {t.thinking}
              </div>
            )}
            {error && <p className="text-sm text-destructive">{t.errorMessage}</p>}
          </div>

          <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-border p-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.inputPlaceholder}
              className="h-10 flex-1 rounded-[var(--radius-md)] border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              disabled={loading}
            />
            <Button type="submit" size="icon" disabled={loading || !input.trim()} aria-label={t.sendLabel}>
              <Send className="h-4 w-4" aria-hidden />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
