"use client";

import * as React from "react";
import { Volume2, VolumeX, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { useVoiceSession, ConsultationField } from "@/hooks/useVoiceSession";
import { useDidAvatar } from "@/hooks/useDidAvatar";
import { ThreeDoctorAvatar } from "@/components/healthcare/ThreeDoctorAvatar";
import { AVATAR_CONFIG } from "@/config/avatar";
import { usePathname } from "next/navigation";

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
  const pathname = usePathname();
  const filledFields = FORM_FIELD_ORDER.filter((f) => form?.[f]);
  const did = useDidAvatar(pathname);

  React.useEffect(() => {
    if (voice.status === "idle") {
      voice.start();
    }
  }, [voice]);

  // Connect D-ID video stream if available
  React.useEffect(() => {
    if (voice.status === "connected" || voice.status === "connecting") {
      did.startStream("male").catch(() => {});
    }
    return () => {
      did.stopStream();
    };
  }, [voice.status]);

  const speaking = voice.status === "connected" && voice.agentSpeaking && !voice.audioBlocked;
  const isConnecting = voice.status === "connecting";

  // Trigger D-ID lip sync animation when LiveKit agent speaks
  const lastSpokenTextRef = React.useRef<string>("");
  React.useEffect(() => {
    if (speaking) {
      const text = voice.latestAgentText || "I am analyzing your practice revenue cycle.";
      if (text !== lastSpokenTextRef.current) {
        lastSpokenTextRef.current = text;
        did.triggerLipSync(text, "male").catch(() => {});
      }
    }
  }, [speaking, voice.latestAgentText, did]);

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
              speaking ? "scale-105 ring-4 ring-cyan-400/60" : "scale-100"
            )}
          >
            {/* 3D WebGL Live Interactive Doctor Avatar (Dr. Dylan) */}
            <div className="relative h-full w-full overflow-hidden bg-radial from-slate-900 via-slate-950 to-black">
              <ThreeDoctorAvatar
                speaking={speaking}
                audioLevel={speaking ? 0.8 : 0}
                avatarGender="male"
                className="h-full w-full"
              />

              {/* D-ID Live WebRTC Video Stream overlay if available */}
              {did.hasVideoStream && (
                <video
                  ref={did.videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-500 opacity-100"
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
              onClick={(e) => {
                e.stopPropagation();
                voice.toggleMute();
              }}
              aria-label={voice.muted ? "Unmute microphone" : "Mute microphone"}
              className={cn(
                "absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex h-11 w-11 items-center justify-center rounded-full backdrop-blur-md transition-transform hover:scale-110 active:scale-95 shadow-xl cursor-pointer",
                voice.muted
                  ? "bg-red-600 text-white ring-2 ring-white"
                  : "bg-black/70 text-white ring-2 ring-white/50 hover:bg-black/90"
              )}
            >
              {voice.muted ? <VolumeX className="h-5 w-5 text-white" /> : <Volume2 className="h-5 w-5 text-white" />}
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
