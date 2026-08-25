"use client";

import * as React from "react";
import { Volume2, VolumeX, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { useVoiceSession } from "@/hooks/useVoiceSession";
import { AVATAR_CONFIG } from "@/config/avatar";

type VoiceSession = ReturnType<typeof useVoiceSession>;

export function VoiceAgentPanel({
  voice,
  onClose,
}: {
  voice: VoiceSession;
  onClose: () => void;
}) {
  React.useEffect(() => {
    if (voice.status === "idle") {
      voice.start();
    }
  }, [voice]);

  const speaking = voice.status === "connected" && voice.agentSpeaking && !voice.audioBlocked;
  const isConnecting = voice.status === "connecting";

  const defaultAvatar =
    AVATAR_CONFIG.avatars[AVATAR_CONFIG.defaultGender as keyof typeof AVATAR_CONFIG.avatars] ||
    AVATAR_CONFIG.avatars.male;

  return (
    <div
      role="dialog"
      aria-label="NIVREN Voice Assistant"
      className="fixed bottom-24 end-5 z-50 flex h-[min(580px,80vh)] w-[min(360px,92vw)] flex-col items-center justify-between p-4 text-white"
    >
      {/* Center Circular Avatar Container with LiveKit Real-Time Audio Waves */}
      <div className="relative flex flex-col items-center justify-end mt-auto mb-4">
        <div className="relative flex h-72 w-72 items-center justify-center sm:h-80 sm:w-80">
          {/* Outer Pulsing Glow while speaking */}
          <span
            aria-hidden
            className={cn(
              "absolute inset-0 rounded-full bg-cyan-500/25 blur-3xl transition-[transform,opacity] duration-500",
              speaking ? "scale-110 opacity-90 animate-pulse" : "scale-100 opacity-20"
            )}
          />

          {/* Big Circular Avatar Frame */}
          <div
            className={cn(
              "relative h-68 w-68 sm:h-76 sm:w-76 overflow-hidden rounded-full border-4 border-white/90 bg-slate-950 shadow-[0_15px_50px_rgba(0,0,0,0.8)] transition-transform duration-300",
              speaking ? "scale-105 ring-4 ring-cyan-400/50" : "scale-100"
            )}
          >
            {/* Photorealistic Avatar Image */}
            <div
              className={cn(
                "relative h-full w-full overflow-hidden transition-transform duration-200",
                speaking && "animate-[pulse_0.4s_ease-in-out_infinite] scale-[1.03]"
              )}
            >
              <img
                src={defaultAvatar.imageUrl}
                alt={defaultAvatar.name}
                className="h-full w-full object-cover object-center"
              />

              {/* Dynamic Lip-Sync Motion Layer */}
              {speaking && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute bottom-[26%] left-1/2 -translate-x-1/2 h-8 w-14 rounded-full bg-rose-950/20 blur-[1px] animate-[ping_0.5s_cubic-bezier(0,0,0.2,1)_infinite]"
                />
              )}
            </div>

            {/* Connecting Spinner Overlay */}
            {isConnecting && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/70 backdrop-blur-xs">
                <Loader2 className="h-9 w-9 animate-spin text-cyan-400" />
                <span className="mt-2 text-[10px] font-semibold uppercase tracking-widest text-white/80">Connecting LiveKit…</span>
              </div>
            )}

            {/* Mute/Speaker Toggle Button (Embedded directly on image at bottom center) */}
            <button
              type="button"
              onClick={voice.toggleMute}
              disabled={voice.status !== "connected"}
              aria-label={voice.muted ? "Unmute microphone" : "Mute microphone"}
              className={cn(
                "absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex h-11 w-11 items-center justify-center rounded-full backdrop-blur-md transition-transform hover:scale-110 active:scale-95 shadow-lg disabled:opacity-40",
                voice.muted
                  ? "bg-red-500/85 text-white ring-2 ring-white/70"
                  : "bg-black/60 text-white ring-1 ring-white/35 hover:bg-black/80"
              )}
            >
              {voice.muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>

            {/* Dynamic Audio Visualizer Waves inside the Avatar */}
            <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5">
              <span className={cn("h-1 w-9 rounded-full bg-white/45 transition-all duration-150", speaking && "h-2.5 bg-cyan-300 animate-pulse")} />
              <span className={cn("h-1.5 w-14 rounded-full bg-white/80 transition-all duration-150", speaking && "h-3.5 bg-cyan-200 animate-[pulse_0.4s_ease-in-out_infinite]")} />
              <span className={cn("h-1 w-9 rounded-full bg-white/45 transition-all duration-150", speaking && "h-2.5 bg-cyan-300 animate-pulse")} />
            </div>
          </div>
        </div>

        {/* Audio blocked notification if browser blocked autoplay */}
        {voice.status === "connected" && voice.audioBlocked && (
          <button
            type="button"
            onClick={() => voice.enableAudio()}
            className="mt-3 rounded-full bg-cyan-500 px-5 py-1.5 text-xs font-bold text-slate-950 shadow-lg animate-bounce"
          >
            🔊 Tap to Enable Audio
          </button>
        )}
      </div>

      {/* Bottom SKIP Button */}
      <div className="w-full flex justify-center pb-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-full bg-slate-900/80 px-9 py-2.5 text-xs font-bold uppercase tracking-[0.22em] text-white/90 shadow-xl backdrop-blur-md transition-all hover:bg-slate-800 hover:scale-105 active:scale-95 border border-white/10"
        >
          SKIP
        </button>
      </div>
    </div>
  );
}
