"use client";

import * as React from "react";
import { Room, RoomEvent, Track, createLocalAudioTrack, type RemoteTrack } from "livekit-client";
import { getLiveKitToken } from "@/lib/api/livekit";
import { trackEvent } from "@/lib/analytics";

export type VoiceStatus = "idle" | "connecting" | "connected" | "error";

export type ConsultationField = "name" | "phone" | "email" | "service" | "message";

export interface ConversationTelemetry {
  topic: string | null;
  subtopic: string | null;
  currentIntent: string | null;
  generationId: number;
  turnId: number;
  activeToolId: string | null;
  activeToolName: string | null;
  agentState: string;
  lastUserMessage: string | null;
  lastAgentMessage: string | null;
  lastActionSummary: string | null;
  latency: {
    userToDetectionMs?: number;
    detectionToIntentMs?: number;
    intentToToolMs?: number;
    toolToBrowserMs?: number;
    userToFirstAudioMs?: number;
  };
}

export interface VoiceAgentAction {
  id?: string;
  generationId?: number;
  type:
    | "navigate"
    | "scroll"
    | "scroll_page"
    | "start_smooth_scroll"
    | "stop_scroll"
    | "set_theme"
    | "set_language"
    | "end_session"
    | "update_form"
    | "consultation_started"
    | "consultation_confirmed"
    | "consultation_cancelled"
    | "agent_speaking"
    | "consultation_requested"
    | "cancel_action"
    | "interrupt"
    | "conversation_state"
    | "highlight_element"
    | "show_roi_card"
    | "show_ehr_badge"
    | "show_benchmark"
    | "show_denial_card"
    | "show_health_score"
    | "dismiss_interactive_card";
  priority?: number;
  timestamp?: number;
  interruptible?: boolean;
  path?: string;
  sectionId?: string;
  selector?: string;
  label?: string;
  durationMs?: number;
  amount?: number;
  direction?: "down" | "up";
  speed?: "slow" | "normal" | "fast";
  theme?: "dark" | "light";
  locale?: "en" | "hi" | "ar";
  field?: ConsultationField;
  value?: string;
  isSpeaking?: boolean;
  text?: string;
  targetActionId?: string;
  conversationState?: ConversationTelemetry;
  roiData?: any;
  ehrData?: any;
  benchmarkData?: any;
  denialData?: any;
  healthData?: any;
  data?: { name: string; phone: string; email?: string; serviceOrSpecialty?: string; message?: string };
}

/**
 * Manages a LiveKit voice session with the NIVREN voice agent: mic capture,
 * agent audio playback, and "agent-action" data messages (the agent's
 * navigate/request_consultation/scroll_to_section tool calls — see
 * backend/src/voice-agent/agent.ts), forwarded via onAction since only the
 * caller (the page) knows how to route/scroll.
 *
 * `route` is published as a participant attribute so the agent — which has
 * no per-turn pageContext like text chat does — can look up what page the
 * user is currently on (see getCurrentRoute() in the agent).
 */
// Global singleton state so page navigation and locale changes never drop active voice sessions
interface GlobalVoiceState {
  status: VoiceStatus;
  agentSpeaking: boolean;
  latestAgentText: string;
  error: string | null;
  audioBlocked: boolean;
  userMicMuted: boolean;
  isVoiceOpen: boolean;
  conversationState: ConversationTelemetry | null;
}

let activeRoom: Room | null = null;
let activeAudioEl: HTMLAudioElement | null = null;
let globalState: GlobalVoiceState = {
  status: "idle",
  agentSpeaking: false,
  latestAgentText: "",
  error: null,
  audioBlocked: false,
  userMicMuted: false,
  isVoiceOpen: false,
  conversationState: null,
};
const stateListeners = new Set<(state: GlobalVoiceState) => void>();
let globalActionHandler: ((action: VoiceAgentAction) => void) | null = null;

// Idempotent action cache to guarantee zero duplicate action execution
const processedActionIds = new Set<string>();
const MAX_PROCESSED_ACTIONS = 200;

function markActionProcessed(id: string): boolean {
  if (processedActionIds.has(id)) return false; // Already executed!
  processedActionIds.add(id);
  if (processedActionIds.size > MAX_PROCESSED_ACTIONS) {
    const oldest = processedActionIds.values().next().value;
    if (oldest) processedActionIds.delete(oldest);
  }
  return true; // First time processing
}

function notifyListeners() {
  for (const listener of stateListeners) {
    listener({ ...globalState });
  }
}

function updateGlobalState(patch: Partial<GlobalVoiceState>) {
  globalState = { ...globalState, ...patch };
  notifyListeners();
}

/**
 * Resilient Multi-Tier Microphone Acquisition.
 * Prevents microphone failure on older Windows 10 machines, legacy Realtek audio drivers,
 * or USB/Bluetooth devices that fail with OverconstrainedError on strict DSP constraints.
 */
async function acquireRobustLocalAudioTrack() {
  // Tier 1: Full Professional DSP (Noise Suppression + Echo Cancellation + AGC)
  try {
    return await createLocalAudioTrack({
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    });
  } catch (err1) {
    console.warn("[VOICE_MIC] Tier 1 full DSP constraints failed, attempting Tier 2 (AEC only)...", err1);
  }

  // Tier 2: Basic Echo Cancellation only (fixes Realtek HD Audio / legacy Windows 10 driver crashes)
  try {
    return await createLocalAudioTrack({
      echoCancellation: true,
      noiseSuppression: false,
      autoGainControl: false,
    });
  } catch (err2) {
    console.warn("[VOICE_MIC] Tier 2 relaxed constraints failed, attempting Tier 3 (raw device)...", err2);
  }

  // Tier 3: Bare minimum constraints (Universal fallback guaranteed to capture audio on any soundcard)
  try {
    return await createLocalAudioTrack({});
  } catch (err3) {
    console.error("[VOICE_MIC] All microphone capture attempts failed:", err3);
    return null;
  }
}

const INSTANT_GREETING_TEXT: Record<string, string> = {
  en: "Hi! I'm Dr. Dylan, your senior Revenue Cycle consultant at NIVREN. How can I help your healthcare practice today?",
  hi: "Namaste! Main Dr. Dylan hoon, NIVREN Healthcare ka senior consultant. Aaj main aapki revenue cycle me kis tarah madad kar sakta hoon?",
  ar: "مرحباً! أنا د. ديلان، كبير مستشاري إدارة دورة الإيرادات في نيفيرين. كيف يمكنني مساعدتك اليوم؟",
};

export function stopInstantGreeting() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (_) {}
  }
}

export function playInstantGreeting(locale: "en" | "hi" | "ar", onEnd?: () => void) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    onEnd?.();
    return;
  }
  try {
    window.speechSynthesis.cancel();
    const text = INSTANT_GREETING_TEXT[locale] || INSTANT_GREETING_TEXT.en;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = locale === "hi" ? "hi-IN" : locale === "ar" ? "ar-SA" : "en-US";
    utterance.rate = 1.05;
    utterance.pitch = 0.95;

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) =>
        (locale === "en" && (v.name.includes("David") || v.name.includes("Male") || v.name.includes("Google US English") || v.name.includes("Natural"))) ||
        (locale === "hi" && (v.lang.startsWith("hi") || v.name.includes("Hindi"))) ||
        (locale === "ar" && (v.lang.startsWith("ar") || v.name.includes("Arabic")))
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onend = () => {
      onEnd?.();
    };
    utterance.onerror = () => {
      onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn("Instant greeting synthesis error:", err);
    onEnd?.();
  }
}

export function useVoiceSession(onAction: (action: VoiceAgentAction) => void, route: string) {
  const [state, setState] = React.useState<GlobalVoiceState>(() => ({ ...globalState }));
  const routeRef = React.useRef(route);
  routeRef.current = route;

  React.useEffect(() => {
    globalActionHandler = onAction;
  }, [onAction]);

  React.useEffect(() => {
    const listener = (newState: GlobalVoiceState) => setState(newState);
    stateListeners.add(listener);
    return () => {
      stateListeners.delete(listener);
    };
  }, []);

  /** Tears down the room/audio element cleanly */
  const cleanup = React.useCallback(async () => {
    stopInstantGreeting();
    const room = activeRoom;
    activeRoom = null;
    if (activeAudioEl) {
      try {
        activeAudioEl.pause();
        activeAudioEl.srcObject = null;
        activeAudioEl.remove();
      } catch (_) {}
      activeAudioEl = null;
    }
    try {
      await room?.disconnect();
    } catch (_) {}
    updateGlobalState({
      status: "idle",
      agentSpeaking: false,
      audioBlocked: false,
      userMicMuted: false,
      isVoiceOpen: false,
    });
  }, []);

  /** Retries playback from inside a real click — the browser's fix for autoplay-blocked audio. */
  const enableAudio = React.useCallback(async () => {
    if (activeAudioEl) {
      activeAudioEl.play().catch(() => {});
    }
    await activeRoom?.startAudio();
  }, []);

  // Mute/Unmute user's microphone so background noise doesn't interrupt agent
  const toggleMute = React.useCallback(async () => {
    const nextMuted = !globalState.userMicMuted;
    if (activeRoom?.localParticipant) {
      await activeRoom.localParticipant.setMicrophoneEnabled(!nextMuted).catch(() => {});
    }
    updateGlobalState({ userMicMuted: nextMuted });
  }, []);

  const stop = React.useCallback(async () => {
    await cleanup();
  }, [cleanup]);

  const start = React.useCallback(async () => {
    if (activeRoom) {
      updateGlobalState({ isVoiceOpen: true });
      return;
    }

    // Determine current active locale from route
    const currentPath = routeRef.current || "/";
    const activeLocale: "en" | "hi" | "ar" = currentPath.startsWith("/hi") ? "hi" : currentPath.startsWith("/ar") ? "ar" : "en";
    const greetingText = INSTANT_GREETING_TEXT[activeLocale] || INSTANT_GREETING_TEXT.en;

    // 1. INSTANT 0ms UI & GREETING LAUNCH (Starts speaking in <20ms within direct click frame)
    updateGlobalState({
      status: "connecting",
      agentSpeaking: true,
      latestAgentText: greetingText,
      error: null,
      isVoiceOpen: true,
      userMicMuted: false,
    });

    playInstantGreeting(activeLocale, () => {
      // Once instant greeting finishes, reset speaking state if agent is not currently talking
      updateGlobalState({ agentSpeaking: false });
    });

    // Pre-unlock AudioContext on direct click interaction
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const dummyCtx = new AudioCtx();
        if (dummyCtx.state === "suspended") {
          dummyCtx.resume().catch(() => {});
        }
      }
    } catch (_) {}

    try {
      const { token, url } = await getLiveKitToken();

      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
        audioCaptureDefaults: {
          autoGainControl: true,
          echoCancellation: true,
          noiseSuppression: true,
        },
        publishDefaults: {
          dtx: true,
        },
      });
      activeRoom = room;

      room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack) => {
        if (track.kind === Track.Kind.Audio) {
          try {
            let el = document.getElementById("livekit-remote-audio") as HTMLAudioElement;
            if (!el) {
              el = track.attach();
              el.id = "livekit-remote-audio";
              el.autoplay = true;
              el.setAttribute("playsinline", "true");
              el.setAttribute("webkit-playsinline", "true");
              if (document.body) {
                document.body.appendChild(el);
              }
            } else {
              track.attach(el);
            }
            activeAudioEl = el;
            el.muted = false;
            el.volume = 1.0;
            const playPromise = el.play();
            if (playPromise !== undefined) {
              playPromise.catch((err) => {
                console.warn("Audio autoplay blocked by browser policy:", err);
                updateGlobalState({ audioBlocked: true });
              });
            }
          } catch (e) {
            console.warn("Could not attach remote audio track:", e);
          }
        }
      });

      let maxObservedGenerationId = 0;
      let lastActionTimestamp = 0;

      room.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
        const isAgentSpeaking = speakers.some((p) => !p.isLocal);
        const isUserSpeaking = speakers.some((p) => p.isLocal);
        // Instant Barge-In: If user speaks, immediately silence the audio element to eliminate mic echo
        if (isUserSpeaking && !globalState.userMicMuted) {
          if (activeAudioEl) {
            activeAudioEl.volume = 0;
          }
          updateGlobalState({ agentSpeaking: false });
          globalActionHandler?.({
            type: "interrupt",
            priority: 100,
            timestamp: Date.now(),
          });
        } else {
          if (activeAudioEl && !isUserSpeaking && isAgentSpeaking) {
            activeAudioEl.volume = 1;
          }
          updateGlobalState({ agentSpeaking: isAgentSpeaking });
        }
      });

      room.on(RoomEvent.AudioPlaybackStatusChanged, () => {
        updateGlobalState({ audioBlocked: !room.canPlaybackAudio });
      });

      room.on(RoomEvent.DataReceived, (payload, _participant, _kind, topic) => {
        if (topic !== "agent-action") return;
        try {
          const action = JSON.parse(new TextDecoder().decode(payload)) as VoiceAgentAction;

          // 1. Idempotency Check: Drop duplicate action if already processed
          if (action.id && !markActionProcessed(action.id)) {
            return;
          }
          
          // 2. Stale action rejection using generationId and timestamp
          if (action.generationId !== undefined) {
            if (action.generationId < maxObservedGenerationId && (action.priority ?? 0) < 100) {
              return; // Discard stale action from an earlier turn/prompt
            }
            if (action.generationId > maxObservedGenerationId) {
              maxObservedGenerationId = action.generationId;
            }
          }

          if (action.timestamp && action.timestamp < lastActionTimestamp && (action.priority ?? 0) < 100) {
            return; // Discard out-of-order stale action
          }
          if (action.timestamp) {
            lastActionTimestamp = action.timestamp;
          }

          if (action.type === "agent_speaking") {
            if (action.isSpeaking && activeAudioEl) {
              activeAudioEl.volume = 1;
            }
            updateGlobalState({
              agentSpeaking: action.isSpeaking ?? false,
              ...(action.text ? { latestAgentText: action.text } : {}),
            });
          } else if (action.type === "interrupt") {
            if (activeAudioEl) {
              activeAudioEl.volume = 0;
            }
            updateGlobalState({ agentSpeaking: false });
          } else if (action.type === "conversation_state" && action.conversationState) {
            updateGlobalState({ conversationState: action.conversationState });
          }

          globalActionHandler?.(action);
        } catch {
          // ignore malformed payloads
        }
      });

      room.on(RoomEvent.Disconnected, () => {
        if (activeRoom !== room) return;
        activeRoom = null;
        updateGlobalState({
          status: "idle",
          agentSpeaking: false,
          latestAgentText: "",
          isVoiceOpen: false,
          conversationState: null,
        });
      });

      // Connect to SFU and pre-initialize microphone with multi-tier fallback in parallel
      const connectPromise = room.connect(url, token, { autoSubscribe: true });
      const micPromise = acquireRobustLocalAudioTrack();

      const [, localAudioTrack] = await Promise.all([connectPromise, micPromise]);
      await room.startAudio().catch(() => {});
      updateGlobalState({ audioBlocked: !room.canPlaybackAudio });

      if (localAudioTrack) {
        await room.localParticipant.publishTrack(localAudioTrack).catch(async (pubErr) => {
          console.warn("[VOICE_MIC] Failed to publish pre-created audio track, falling back to setMicrophoneEnabled:", pubErr);
          await room.localParticipant.setMicrophoneEnabled(true).catch(() => {});
        });
      } else {
        await room.localParticipant.setMicrophoneEnabled(true).catch((micErr) => {
          console.warn("[VOICE_MIC] setMicrophoneEnabled fallback failed:", micErr);
        });
      }

      room.localParticipant.setAttributes({ route: routeRef.current, client_greeted: "true" }).catch(() => {});
      updateGlobalState({ status: "connected", userMicMuted: false });
      trackEvent({ name: "voice_conversation_start" });
    } catch (err) {
      console.error("Voice session error:", err);
      await cleanup();
      updateGlobalState({
        status: "error",
        error: "Could not start the voice session. Please try again.",
      });
    }
  }, [cleanup]);

  // Sync current route to active room on route change without dropping the session
  React.useEffect(() => {
    if (activeRoom && state.status === "connected") {
      activeRoom.localParticipant.setAttributes({ route }).catch((err) => {
        console.error("Could not sync current route to the agent:", err);
      });
    }
  }, [route, state.status]);

  return {
    status: state.status,
    agentSpeaking: state.agentSpeaking,
    latestAgentText: state.latestAgentText,
    conversationState: state.conversationState,
    audioBlocked: state.audioBlocked,
    muted: state.userMicMuted,
    userMicMuted: state.userMicMuted,
    error: state.error,
    isVoiceOpen: state.isVoiceOpen,
    start,
    stop,
    enableAudio,
    toggleMute,
  };
}
