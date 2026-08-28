"use client";

import * as React from "react";
import { Room, RoomEvent, Track, type RemoteTrack } from "livekit-client";
import { getLiveKitToken } from "@/lib/api/livekit";
import { trackEvent } from "@/lib/analytics";

export type VoiceStatus = "idle" | "connecting" | "connected" | "error";

export type ConsultationField = "name" | "phone" | "email" | "service" | "message";

export type VoiceAgentAction =
  | { type: "navigate"; path: string }
  | { type: "scroll"; sectionId: string }
  | { type: "scroll_page"; amount: number; direction: "down" | "up" }
  | { type: "set_theme"; theme: "dark" | "light" }
  | { type: "set_language"; locale: "en" | "hi" | "ar" }
  | { type: "end_session" }
  | { type: "update_form"; field: ConsultationField; value: string }
  | { type: "consultation_started" }
  | { type: "consultation_confirmed" }
  | {
      type: "consultation_requested";
      data: { name: string; phone: string; email?: string; serviceOrSpecialty?: string; message?: string };
    };

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
  error: string | null;
  audioBlocked: boolean;
  muted: boolean;
  isVoiceOpen: boolean;
}

let activeRoom: Room | null = null;
let activeAudioEl: HTMLAudioElement | null = null;
let globalState: GlobalVoiceState = {
  status: "idle",
  agentSpeaking: false,
  error: null,
  audioBlocked: false,
  muted: false,
  isVoiceOpen: false,
};
const stateListeners = new Set<(state: GlobalVoiceState) => void>();
let globalActionHandler: ((action: VoiceAgentAction) => void) | null = null;

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
      muted: false,
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

  const toggleMute = React.useCallback(async () => {
    const nextMuted = !globalState.muted;
    if (activeRoom?.localParticipant) {
      activeRoom.localParticipant.setMicrophoneEnabled(!nextMuted).catch(() => {});
    }
    if (activeAudioEl) {
      activeAudioEl.muted = nextMuted;
    }
    updateGlobalState({ muted: nextMuted });
  }, []);

  const stop = React.useCallback(async () => {
    await cleanup();
  }, [cleanup]);

  const start = React.useCallback(async () => {
    if (activeRoom) {
      updateGlobalState({ isVoiceOpen: true });
      return;
    }
    updateGlobalState({ status: "connecting", error: null, isVoiceOpen: true });
    try {
      const identity = `user-${crypto.randomUUID()}`;
      const roomName = `voice-${crypto.randomUUID()}`;
      const { token, url } = await getLiveKitToken(roomName, identity);

      const room = new Room();
      activeRoom = room;

      room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack) => {
        if (track.kind === Track.Kind.Audio) {
          const el = track.attach();
          el.autoplay = true;
          document.body.appendChild(el);
          activeAudioEl = el;
          el.play().catch((err) => {
            console.warn("Audio autoplay blocked by browser:", err);
            updateGlobalState({ audioBlocked: true });
          });
        }
      });

      room.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
        updateGlobalState({ agentSpeaking: speakers.some((p) => !p.isLocal) });
      });

      room.on(RoomEvent.AudioPlaybackStatusChanged, () => {
        updateGlobalState({ audioBlocked: !room.canPlaybackAudio });
      });

      room.on(RoomEvent.DataReceived, (payload, _participant, _kind, topic) => {
        if (topic !== "agent-action") return;
        try {
          const action = JSON.parse(new TextDecoder().decode(payload)) as VoiceAgentAction;
          globalActionHandler?.(action);
        } catch {
          // ignore malformed payloads
        }
      });

      room.on(RoomEvent.Disconnected, () => {
        if (activeRoom !== room) return;
        activeRoom = null;
        updateGlobalState({ status: "idle", agentSpeaking: false, isVoiceOpen: false });
      });

      await room.connect(url, token);
      await room.startAudio().catch(() => {});
      updateGlobalState({ audioBlocked: !room.canPlaybackAudio });
      
      await room.localParticipant.setAttributes({ route: routeRef.current }).catch((err) => {
        console.error("Could not sync current route to the agent:", err);
      });
      await room.localParticipant.setMicrophoneEnabled(true);
      updateGlobalState({ status: "connected" });
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
    audioBlocked: state.audioBlocked,
    muted: state.muted,
    error: state.error,
    isVoiceOpen: state.isVoiceOpen,
    start,
    stop,
    enableAudio,
    toggleMute,
  };
}
