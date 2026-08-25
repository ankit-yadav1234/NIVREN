"use client";

import * as React from "react";
import { Room, RoomEvent, Track, type RemoteTrack } from "livekit-client";
import { getLiveKitToken } from "@/lib/api/livekit";

export type VoiceStatus = "idle" | "connecting" | "connected" | "error";

export type VoiceAgentAction =
  | { type: "navigate"; path: string }
  | { type: "scroll"; sectionId: string }
  | { type: "consultation_requested"; data: { name: string; phone: string; serviceOrSpecialty?: string } };

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
export function useVoiceSession(onAction: (action: VoiceAgentAction) => void, route: string) {
  const [status, setStatus] = React.useState<VoiceStatus>("idle");
  const [agentSpeaking, setAgentSpeaking] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  // True when the browser's autoplay policy blocked the agent's audio
  // element (track.attach() calls .play() internally, but by the time the
  // remote track subscribes after WebRTC negotiation, it's no longer inside
  // the click's user-gesture window in most browsers — Chrome in
  // particular). Silent agent audio with no error otherwise looks exactly
  // like the agent doing nothing, so this needs to surface as its own state.
  const [audioBlocked, setAudioBlocked] = React.useState(false);
  const [muted, setMuted] = React.useState(false);
  const roomRef = React.useRef<Room | null>(null);
  const audioElRef = React.useRef<HTMLAudioElement | null>(null);
  const onActionRef = React.useRef(onAction);
  onActionRef.current = onAction;
  const routeRef = React.useRef(route);
  routeRef.current = route;

  /** Tears down the room/audio element cleanly */
  const cleanup = React.useCallback(async () => {
    const room = roomRef.current;
    roomRef.current = null;
    if (audioElRef.current) {
      try {
        audioElRef.current.pause();
        audioElRef.current.srcObject = null;
        audioElRef.current.remove();
      } catch (_) {}
      audioElRef.current = null;
    }
    try {
      await room?.disconnect();
    } catch (_) {}
    setAgentSpeaking(false);
    setAudioBlocked(false);
    setMuted(false);
    setStatus("idle");
  }, []);

  /** Retries playback from inside a real click — the browser's fix for autoplay-blocked audio. */
  const enableAudio = React.useCallback(async () => {
    if (audioElRef.current) {
      audioElRef.current.play().catch(() => {});
    }
    await roomRef.current?.startAudio();
  }, []);

  const toggleMute = React.useCallback(async () => {
    setMuted((prev) => {
      const nextMuted = !prev;
      if (roomRef.current?.localParticipant) {
        roomRef.current.localParticipant.setMicrophoneEnabled(!nextMuted).catch(() => {});
      }
      if (audioElRef.current) {
        audioElRef.current.muted = nextMuted;
      }
      return nextMuted;
    });
  }, []);

  const stop = React.useCallback(async () => {
    await cleanup();
  }, [cleanup]);

  const start = React.useCallback(async () => {
    if (roomRef.current) return;
    setStatus("connecting");
    setError(null);
    try {
      const identity = `user-${crypto.randomUUID()}`;
      const roomName = `voice-${crypto.randomUUID()}`;
      const { token, url } = await getLiveKitToken(roomName, identity);

      const room = new Room();
      roomRef.current = room;

      room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack) => {
        if (track.kind === Track.Kind.Audio) {
          const el = track.attach();
          el.autoplay = true;
          document.body.appendChild(el);
          audioElRef.current = el;
          el.play().catch((err) => {
            console.warn("Audio autoplay blocked by browser:", err);
            setAudioBlocked(true);
          });
        }
      });

      room.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
        setAgentSpeaking(speakers.some((p) => !p.isLocal));
      });

      // Fires when the browser's autoplay policy blocks (or later unblocks)
      // the agent's audio element — the concrete signal for "the agent
      // spoke but nothing came out." See enableAudio() for the fix.
      room.on(RoomEvent.AudioPlaybackStatusChanged, () => {
        setAudioBlocked(!room.canPlaybackAudio);
      });

      room.on(RoomEvent.DataReceived, (payload, _participant, _kind, topic) => {
        if (topic !== "agent-action") return;
        try {
          const action = JSON.parse(new TextDecoder().decode(payload)) as VoiceAgentAction;
          onActionRef.current(action);
        } catch {
          // ignore malformed payloads
        }
      });

      // Only reflects an unexpected drop (e.g. server-side); a deliberate
      // stop() already sets "idle" itself, and a failed start() sets "error"
      // itself — this must not clobber either.
      room.on(RoomEvent.Disconnected, () => {
        if (roomRef.current !== room) return;
        roomRef.current = null;
        setStatus("idle");
        setAgentSpeaking(false);
      });

      await room.connect(url, token);
      // Best-effort: still inside the click's async chain, so this can
      // succeed in browsers that allow it — cheap no-op otherwise, the
      // AudioPlaybackStatusChanged listener above is the real fallback.
      await room.startAudio().catch(() => {});
      setAudioBlocked(!room.canPlaybackAudio);
      // Best-effort: lets the agent look up in-page sections, but voice chat
      // itself must keep working even if this is ever rejected (e.g. token
      // missing canUpdateOwnMetadata) — never let it take down the session.
      await room.localParticipant.setAttributes({ route: routeRef.current }).catch((err) => {
        console.error("Could not sync current route to the agent:", err);
      });
      await room.localParticipant.setMicrophoneEnabled(true);
      setStatus("connected");
    } catch (err) {
      console.error("Voice session error:", err);
      await cleanup();
      setError("Could not start the voice session. Please try again.");
      setStatus("error");
    }
  }, [cleanup]);

  // Keeps the agent's page knowledge in sync when the route changes mid-call
  // — whether from an agent-triggered navigate or the user clicking a
  // normal site link while still connected.
  React.useEffect(() => {
    if (status === "connected") {
      roomRef.current?.localParticipant.setAttributes({ route }).catch((err) => {
        console.error("Could not sync current route to the agent:", err);
      });
    }
  }, [route, status]);

  React.useEffect(() => {
    return () => {
      roomRef.current?.disconnect();
    };
  }, []);

  return { status, agentSpeaking, audioBlocked, muted, error, start, stop, enableAudio, toggleMute };
}
