"use client";

import * as React from "react";
import { Room, RoomEvent, Track, type RemoteTrack } from "livekit-client";
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
    | "conversation_state";
  priority?: number;
  timestamp?: number;
  interruptible?: boolean;
  path?: string;
  sectionId?: string;
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

    updateGlobalState({ status: "connecting", error: null, isVoiceOpen: true, userMicMuted: false });
    try {
      const identity = `user-${crypto.randomUUID()}`;
      const roomName = `voice-${crypto.randomUUID()}`;
      const { token, url } = await getLiveKitToken(roomName, identity);

      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
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
              if (document.body) {
                document.body.appendChild(el);
              }
            } else {
              track.attach(el);
            }
            activeAudioEl = el;
            el.play().catch((err) => {
              console.warn("Audio autoplay blocked by browser:", err);
              updateGlobalState({ audioBlocked: true });
            });
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

      await room.connect(url, token, { autoSubscribe: true });
      await room.startAudio().catch(() => {});
      updateGlobalState({ audioBlocked: !room.canPlaybackAudio });
      
      await room.localParticipant.setAttributes({ route: routeRef.current }).catch((err) => {
        console.error("Could not sync current route to the agent:", err);
      });
      await room.localParticipant.setMicrophoneEnabled(true);
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
