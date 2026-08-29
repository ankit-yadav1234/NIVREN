"use client";

import * as React from "react";
import { Mic, MicOff, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { useVoiceSession, ConsultationField } from "@/hooks/useVoiceSession";
import { ThreeDoctorAvatar } from "@/components/healthcare/ThreeDoctorAvatar";

type VoiceSession = ReturnType<typeof useVoiceSession>;

const FORM_FIELD_LABELS: Record<ConsultationField, string> = {
  name: "Name",
  phone: "Phone",
  email: "Email",
  service: "Service",
  message: "Message",
};
const FORM_FIELD_ORDER: ConsultationField[] = ["name", "phone", "email", "service", "message"];

export function VoiceAgentPanel({
  voice,
  onClose,
  form,
  formSubmitted,
}: {
  voice: VoiceSession;
  onClose: () => void;
  form?: Partial<Record<ConsultationField, string>>;
  formSubmitted?: boolean;
}) {
  const filledFields = FORM_FIELD_ORDER.filter((f) => form?.[f]);

  React.useEffect(() => {
    if (voice.status === "idle") {
      voice.start();
    }
  }, [voice]);

  const speaking = voice.status === "connected" && voice.agentSpeaking && !voice.audioBlocked;
  const isConnecting = voice.status === "connecting";

  return (
    <div
      role="dialog"
      aria-label="NIVREN Voice Assistant"
      className="fixed bottom-24 end-5 z-50 flex h-[min(580px,80vh)] w-[min(360px,92vw)] flex-col items-center justify-between p-4 text-white"
    >
      {/* Center Circular Avatar Container with 3D Head Tracking */}
      <div className="relative flex flex-col items-center justify-end mt-auto mb-4">
        <div className="relative flex h-72 w-72 items-center justify-center sm:h-80 sm:w-80">
          {/* Soft Luminous Glow (Light & Aesthetic Aura) */}
          <span
            aria-hidden
            className={cn(
              "absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-400/30 via-teal-300/25 to-blue-500/25 blur-3xl transition-[transform,opacity] duration-500 pointer-events-none",
              speaking ? "scale-110 opacity-95 animate-pulse" : "scale-100 opacity-40"
            )}
          />

          {/* 3D Circular Avatar Frame */}
          <div
            className={cn(
              "relative h-68 w-68 sm:h-76 sm:w-76 overflow-hidden rounded-full border-4 border-white/90 bg-gradient-to-b from-slate-900 to-slate-950 shadow-[0_15px_45px_rgba(0,0,0,0.6)] transition-all duration-300",
              speaking && "ring-4 ring-cyan-400/60"
            )}
          >
            {/* Real-Time Three.js 3D Doctor Avatar (Dr. Dylan) with Blendshape Lip-Sync & Eye/Head Cursor Tracking */}
            <div className="relative h-full w-full overflow-hidden">
              <ThreeDoctorAvatar
                speaking={speaking}
                avatarGender="male"
                className="h-full w-full"
              />
            </div>

            {/* Connecting Spinner Overlay */}
            {isConnecting && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/70 backdrop-blur-xs">
                <Loader2 className="h-9 w-9 animate-spin text-cyan-400" />
                <span className="mt-2 text-[10px] font-semibold uppercase tracking-widest text-white/80">Connecting LiveKit…</span>
              </div>
            )}

            {/* User Microphone Mute / Unmute Control Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                voice.toggleMute();
              }}
              title={voice.muted ? "Unmute your microphone" : "Mute your microphone (Agent will speak uninterrupted)"}
              aria-label={voice.muted ? "Unmute microphone" : "Mute microphone"}
              className={cn(
                "absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex h-11 w-11 items-center justify-center rounded-full backdrop-blur-md transition-all duration-200 hover:scale-110 active:scale-95 shadow-xl cursor-pointer",
                voice.muted
                  ? "bg-rose-600 text-white ring-2 ring-white shadow-rose-600/50"
                  : "bg-slate-900/85 text-cyan-300 ring-2 ring-cyan-400/50 hover:bg-slate-800"
              )}
            >
              {voice.muted ? <MicOff className="h-5 w-5 text-white" /> : <Mic className="h-5 w-5 text-cyan-300" />}
            </button>

            {/* 2px Height Sequential Wave Equalizer Bars */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5">
              {/* Bar 1 - Sequential Wave */}
              <span
                className={cn(
                  "h-[2px] w-8 rounded-full transition-all duration-300",
                  speaking
                    ? "bg-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-pulse"
                    : "bg-white/40"
                )}
              />
              {/* Bar 2 - Center Sequential Wave */}
              <span
                className={cn(
                  "h-[2px] w-14 rounded-full transition-all duration-300",
                  speaking
                    ? "bg-cyan-100 shadow-[0_0_10px_rgba(255,255,255,0.9)] animate-[pulse_0.4s_ease-in-out_infinite_150ms]"
                    : "bg-white/70"
                )}
              />
              {/* Bar 3 - Sequential Wave */}
              <span
                className={cn(
                  "h-[2px] w-8 rounded-full transition-all duration-300",
                  speaking
                    ? "bg-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-pulse [animation-delay:300ms]"
                    : "bg-white/40"
                )}
              />
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

      {/* Live consultation form — fills in as the agent collects each field via voice */}
      {filledFields.length > 0 && (
        <div className="mb-3 w-full max-w-xs rounded-2xl border border-white/15 bg-slate-900/85 p-4 shadow-xl backdrop-blur-md">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/60">Consultation Request</span>
            {formSubmitted && (
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                Submitted
              </span>
            )}
          </div>
          <dl className="space-y-1.5">
            {filledFields.map((field) => (
              <div key={field} className="flex items-baseline gap-2 text-sm">
                <dt className="w-16 shrink-0 text-white/50">{FORM_FIELD_LABELS[field]}</dt>
                <dd className="truncate font-medium text-white">{form?.[field]}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {/* Bottom SKIP Button */}
      <div className="w-full flex justify-center pb-2 z-30">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            voice.stop();
            onClose();
          }}
          className="rounded-full bg-slate-900/90 px-9 py-2.5 text-xs font-bold uppercase tracking-[0.22em] text-white shadow-xl backdrop-blur-md transition-all hover:bg-slate-800 hover:scale-105 active:scale-95 border border-white/20 cursor-pointer"
        >
          SKIP
        </button>
      </div>
    </div>
  );
}
