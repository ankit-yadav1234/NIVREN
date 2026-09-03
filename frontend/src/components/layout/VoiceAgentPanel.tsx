"use client";

import * as React from "react";
import { Mic, MicOff, Loader2, CheckCircle2, Activity, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { useVoiceSession, ConsultationField } from "@/hooks/useVoiceSession";
import { AVATAR_CONFIG } from "@/config/avatar";

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
  // Telemetry inspector (section 39 of the real-time spec) — development-only,
  // never rendered in production regardless of user interaction.
  const isDev = process.env.NODE_ENV !== "production";
  const [showDebug, setShowDebug] = React.useState(false);
  const filledFields = FORM_FIELD_ORDER.filter((f) => form?.[f]);
  const defaultAvatar = AVATAR_CONFIG.avatars.male;

  // Real-time Smooth 3D Cursor Physics (Interpolated with Lerp for 60 FPS fluidity)
  const [mouse, setMouse] = React.useState({ x: 0, y: 0 });
  const targetMouseRef = React.useRef({ x: 0, y: 0 });
  const currentMouseRef = React.useRef({ x: 0, y: 0 });

  React.useEffect(() => {
    if (voice.status === "idle") {
      voice.start();
    }
  }, [voice]);

  // Global window cursor listener so Dr. Dylan looks at mouse anywhere on screen
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = -((e.clientY / window.innerHeight) * 2 - 1);
      targetMouseRef.current.x = Math.max(-1, Math.min(1, normX));
      targetMouseRef.current.y = Math.max(-1, Math.min(1, normY));
    };

    const handleMouseLeave = () => {
      targetMouseRef.current = { x: 0, y: 0 };
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave);

    // Smooth Lerp Animation Loop
    let animId: number;
    const updatePhysics = () => {
      currentMouseRef.current.x += (targetMouseRef.current.x - currentMouseRef.current.x) * 0.1;
      currentMouseRef.current.y += (targetMouseRef.current.y - currentMouseRef.current.y) * 0.1;

      setMouse({
        x: currentMouseRef.current.x,
        y: currentMouseRef.current.y,
      });

      animId = requestAnimationFrame(updatePhysics);
    };
    animId = requestAnimationFrame(updatePhysics);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  const speaking = voice.agentSpeaking && !voice.audioBlocked;
  const isConnecting = voice.status === "connecting" && !voice.agentSpeaking;

  // Calculate 3D transformation values for Photo Parallax mode
  const rotateY = mouse.x * 22; // Head turns left/right (-22deg to +22deg)
  const rotateX = -mouse.y * 19; // Head tilts up/down (-19deg to +19deg)
  const rotateZ = mouse.x * 5; // Subtle natural head roll
  const translateX = mouse.x * 18; // Parallax translation X
  const translateY = -mouse.y * 15; // Parallax translation Y

  // Dynamic light angle calculation
  const lightAngle = Math.atan2(-mouse.y, mouse.x) * (180 / Math.PI);

  return (
    <div
      role="dialog"
      aria-label="NIVREN Voice Assistant"
      className="fixed bottom-24 end-5 z-50 flex h-[min(580px,80vh)] w-[min(360px,92vw)] flex-col items-center justify-between p-4 text-white"
    >
      {/* Center Circular Avatar Container with 3D Head & Background Tracking */}
      <div className="relative flex flex-col items-center justify-end mt-auto mb-4">
        <div className="relative flex h-72 w-72 items-center justify-center sm:h-80 sm:w-80">

          {/* Outer Floating 3D Ambient Aura Layer 1 (Translates in 3D with cursor) */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-[-20%] rounded-full transition-transform duration-100 will-change-transform"
            style={{
              transform: `translate3d(${mouse.x * 32}px, ${-mouse.y * 26}px, 0)`,
            }}
          >
            {/* Soft Cyan & Blue Luminous Halo */}
            <span
              className={cn(
                "absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-500/35 via-teal-400/25 to-blue-600/30 blur-3xl transition-opacity duration-500",
                speaking ? "opacity-100" : "opacity-40"
              )}
            />
            {/* Floating Bokeh Light Orb Left */}
            <span
              className="absolute top-1/4 left-1/4 h-24 w-24 rounded-full bg-cyan-400/20 blur-2xl transition-transform duration-200"
              style={{
                transform: `translate3d(${-mouse.x * 20}px, ${mouse.y * 15}px, 0)`,
              }}
            />
            {/* Floating Bokeh Light Orb Right */}
            <span
              className="absolute bottom-1/4 right-1/4 h-28 w-28 rounded-full bg-teal-300/20 blur-2xl transition-transform duration-200"
              style={{
                transform: `translate3d(${mouse.x * 25}px, ${-mouse.y * 20}px, 0)`,
              }}
            />
          </div>

          {/* 3D Circular Avatar Portal Frame */}
          <div
            className={cn(
              "relative h-68 w-68 sm:h-76 sm:w-76 overflow-hidden rounded-full border-4 bg-slate-950 transition-all duration-500",
              speaking
                ? "border-cyan-300 ring-4 ring-cyan-400/80 shadow-[0_0_50px_rgba(34,211,238,0.75)]"
                : "border-white/90 shadow-[0_20px_60px_rgba(0,0,0,0.75)]"
            )}
            style={{ perspective: "1000px" }}
          >
            {/* Layer 1: Parallax Deep Medical Background (Moves dynamically opposite to doctor) */}
            <div
              className="absolute inset-[-15%] bg-gradient-to-br from-slate-900 via-slate-950 to-cyan-950/50 transition-transform duration-100 will-change-transform"
              style={{
                transform: `translate3d(${-mouse.x * 24}px, ${mouse.y * 18}px, 0) scale(1.18)`,
              }}
            >
              {/* Subtle Tech Grid / Matrix Depth Glow */}
              <div
                className="absolute inset-0 opacity-20 bg-[radial-gradient(#22d3ee_1px,transparent_1px)] [background-size:18px_18px]"
                style={{
                  transform: `translate3d(${-mouse.x * 12}px, ${mouse.y * 10}px, 0)`,
                }}
              />
              {/* Soft Center Backlight behind Doctor */}
              <div className="absolute inset-0 bg-radial from-cyan-500/20 via-transparent to-transparent" />
            </div>

            {/* Layer 2: 3D Interactive Doctor Dylan Photo with Real Head/Body Tilt */}
            <div
              className={cn(
                "relative h-full w-full will-change-transform origin-center",
                speaking && "animate-avatar-breath"
              )}
              style={{
                transform: `scale(1.18) rotateY(${rotateY}deg) rotateX(${rotateX}deg) rotateZ(${rotateZ}deg) translateX(${translateX}px) translateY(${translateY}px)`,
                transformStyle: "preserve-3d",
              }}
            >
              <img
                src={defaultAvatar.imageUrl}
                alt={defaultAvatar.name}
                className="h-full w-full object-cover object-center select-none pointer-events-none drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)]"
              />

              {/* Layer 3: Realistic Lip-Sync Motion Layer Positioned on Mouth */}
              {speaking && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute top-[51.8%] left-[50.1%] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                >
                  <span className="h-3.5 w-8 rounded-full bg-slate-950/75 blur-[1px] animate-avatar-lips" />
                  <span className="absolute h-1 w-5 rounded-full bg-rose-200/40 blur-[0.6px] animate-pulse" />
                </div>
              )}
            </div>

            {/* Layer 4: Volumetric 3D Light Shading & Specular Sheen (Reacts to cursor direction) */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-full mix-blend-overlay will-change-transform"
              style={{
                background: `radial-gradient(circle at ${50 + mouse.x * 45}% ${50 - mouse.y * 45}%, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.08) 45%, rgba(0,0,0,0.55) 100%)`,
              }}
            />

            {/* Layer 5: Dynamic Outer Lens Gloss Glare */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-full border border-white/25 shadow-inner"
              style={{
                boxShadow: `inset ${-mouse.x * 12}px ${mouse.y * 12}px 20px rgba(255,255,255,0.15)`,
              }}
            />

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

      {/* Real-time Telemetry & Debug Inspector Card (P0/P1 Observability) — dev-only */}
      {isDev && showDebug && (
        <div className="mb-3 w-full max-w-xs rounded-2xl border border-cyan-400/30 bg-slate-950/90 p-3 text-[11px] shadow-2xl backdrop-blur-lg">
          <div className="flex items-center justify-between pb-1.5 border-b border-white/10 font-mono">
            <span className="flex items-center gap-1 text-cyan-400 font-bold tracking-wider uppercase">
              <Activity className="h-3.5 w-3.5 animate-pulse text-cyan-400" />
              Agent Telemetry
            </span>
            <span className="px-1.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 font-bold text-[9px] border border-cyan-500/40">
              {voice.conversationState?.agentState || (speaking ? "SPEAKING" : "LISTENING")}
            </span>
          </div>

          <div className="mt-2 space-y-1 font-mono text-white/80">
            <div className="flex justify-between">
              <span className="text-white/50">Topic:</span>
              <span className="text-cyan-200 truncate max-w-[170px] text-right font-medium">
                {voice.conversationState?.topic || "Healthcare RCM"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Intent:</span>
              <span className="text-emerald-300 font-medium">
                {voice.conversationState?.currentIntent || "NORMAL_CONVERSATION"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Generation:</span>
              <span className="text-white/90">#{voice.conversationState?.generationId ?? 1} (Turn #{voice.conversationState?.turnId ?? 1})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Active Tool:</span>
              <span className="text-amber-300">{voice.conversationState?.activeToolName || "None"}</span>
            </div>
            <div className="pt-1.5 mt-1 border-t border-white/10 flex justify-between text-[10px] text-white/60">
              <span>Detection: <strong className="text-white">{voice.conversationState?.latency?.userToDetectionMs ?? 40}ms</strong></span>
              <span>Tool: <strong className="text-white">{voice.conversationState?.latency?.intentToToolMs ?? 25}ms</strong></span>
              <span>Audio: <strong className="text-white">{voice.conversationState?.latency?.userToFirstAudioMs ?? 380}ms</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Controls: SKIP Button + Toggle Debug Metrics (dev-only toggle) */}
      <div className="w-full flex items-center justify-between px-2 pb-2 z-30">
        {isDev ? (
          <button
            type="button"
            onClick={() => setShowDebug((prev) => !prev)}
            title="Toggle Real-Time Telemetry Inspector"
            className="flex items-center gap-1 rounded-full bg-slate-900/80 px-2.5 py-1.5 text-[10px] font-mono text-cyan-400/90 border border-white/10 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Activity className="h-3 w-3" />
            {showDebug ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
          </button>
        ) : (
          <div className="w-8" />
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            voice.stop();
            onClose();
          }}
          className="rounded-full bg-slate-900/90 px-8 py-2 text-xs font-bold uppercase tracking-[0.22em] text-white shadow-xl backdrop-blur-md transition-all hover:bg-slate-800 hover:scale-105 active:scale-95 border border-white/20 cursor-pointer"
        >
          SKIP
        </button>

        <div className="w-8" />
      </div>
    </div>
  );
}
