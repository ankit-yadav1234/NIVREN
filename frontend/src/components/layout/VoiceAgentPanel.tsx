"use client";

import { Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { useVoiceSession } from "@/hooks/useVoiceSession";

/** Placeholder avatar face for the voice-agent trigger/panel — swap for a real photorealistic (Tavus/D-ID/HeyGen) avatar once that's wired up. */
export const VOICE_AVATAR_URL =
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&h=240&q=80";

type VoiceSession = ReturnType<typeof useVoiceSession>;

/**
 * Full-panel voice agent UI, separate from the text chat panel — an
 * animated "avatar" orb (CSS-only, reacts live to the agent speaking) plus
 * Skip and Mute controls, styled after HeyGen/D-ID/Tavus-style avatar
 * widgets. This is a stand-in for a real photorealistic avatar: swapping in
 * an actual talking-face video (Tavus, D-ID, HeyGen) is a separate feature
 * that needs a paid third-party API account — not implemented here.
 */
export function VoiceAgentPanel({ voice, onClose }: { voice: VoiceSession; onClose: () => void }) {
  const speaking = voice.status === "connected" && voice.agentSpeaking && !voice.audioBlocked;
  const listening = voice.status === "connected" && !voice.agentSpeaking && !voice.audioBlocked;

  return (
    <div
      role="dialog"
      aria-label="NIVREN Voice Agent"
      className="fixed bottom-24 end-5 z-40 flex h-[min(560px,75vh)] w-[min(340px,90vw)] flex-col overflow-hidden rounded-[28px] bg-[linear-gradient(160deg,#0b1220_0%,#0f2942_60%,#0b1220_100%)] text-white shadow-2xl"
    >
      <div className="flex items-center justify-between px-4 pt-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-white/50">NIVREN Assistant</span>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          Skip
        </button>
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center gap-6 px-6">
        <div className="relative flex h-44 w-44 items-center justify-center">
          {/* Outer glow: soft continuous breathing at rest, bigger/brighter pulse while speaking */}
          <span
            aria-hidden
            className={cn(
              "absolute inset-0 rounded-full bg-primary/40 blur-2xl transition-[transform,opacity] duration-700",
              speaking ? "scale-125 opacity-90 animate-pulse" : "scale-100 opacity-50 animate-[pulse_3s_ease-in-out_infinite]",
            )}
          />
          {/* Voice rings: expand outward only while the agent is actually speaking */}
          <span
            aria-hidden
            className={cn(
              "absolute inset-2 rounded-full border-2 border-primary/40 transition-all duration-700",
              speaking ? "scale-125 opacity-0" : "scale-100 opacity-0",
            )}
            style={speaking ? { animation: "voiceRing 1.6s ease-out infinite" } : undefined}
          />
          <span
            aria-hidden
            className={cn("absolute inset-2 rounded-full border-2 border-primary/40 opacity-0")}
            style={speaking ? { animation: "voiceRing 1.6s ease-out infinite 0.5s" } : undefined}
          />
          <span
            aria-hidden
            className={cn(
              "absolute inset-6 rounded-full ring-2 ring-white/20 transition-transform duration-500",
              speaking && "scale-105",
            )}
          />
          <div
            className={cn(
              "relative h-28 w-28 overflow-hidden rounded-full bg-cover bg-center shadow-[0_0_50px_rgba(59,130,246,0.55)] ring-4 ring-white/90 transition-transform duration-300",
              speaking
                ? "scale-105"
                : listening
                  ? "scale-100 animate-[pulse_2.5s_ease-in-out_infinite]"
                  : "scale-95 opacity-90",
            )}
            style={{ backgroundImage: `url(${VOICE_AVATAR_URL})` }}
          />
        </div>

        <p className="text-center text-sm text-white/70">
          {voice.status === "idle" && "Starting…"}
          {voice.status === "connecting" && "Connecting…"}
          {voice.status === "connected" && voice.audioBlocked && "Tap below to enable audio"}
          {voice.status === "connected" && !voice.audioBlocked && speaking && "Speaking…"}
          {voice.status === "connected" && !voice.audioBlocked && listening && (voice.muted ? "Muted" : "Listening…")}
          {voice.status === "error" && (voice.error ?? "Something went wrong.")}
        </p>

        {voice.status === "connected" && voice.audioBlocked && (
          <button
            type="button"
            onClick={() => voice.enableAudio()}
            className="rounded-full bg-amber-500/20 px-4 py-2 text-xs font-medium text-amber-300 hover:bg-amber-500/30"
          >
            🔊 Enable audio
          </button>
        )}
      </div>

      <div className="flex items-center justify-center pb-6">
        <button
          type="button"
          aria-label={voice.muted ? "Unmute microphone" : "Mute microphone"}
          aria-pressed={voice.muted}
          onClick={() => voice.toggleMute()}
          disabled={voice.status !== "connected"}
          className={cn(
            "inline-flex h-12 w-12 items-center justify-center rounded-full transition-colors disabled:opacity-40",
            voice.muted ? "bg-destructive text-destructive-foreground" : "bg-white/10 text-white hover:bg-white/20",
          )}
        >
          {voice.muted ? <MicOff className="h-5 w-5" aria-hidden /> : <Mic className="h-5 w-5" aria-hidden />}
        </button>
      </div>
    </div>
  );
}
