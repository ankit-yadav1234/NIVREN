import { apiFetch } from "./client";

export interface LiveKitTokenResult {
  token: string;
  url: string;
  room?: string;
  identity?: string;
}

/** Pre-warms backend connection if needed */
export async function prewarmVoiceToken(): Promise<void> {
  // No-op or health check ping to avoid creating empty rooms in LiveKit
  try {
    await apiFetch("/api/health", { method: "GET" }).catch(() => {});
  } catch (_) {}
}

/** Requests a short-lived LiveKit room-join token for a voice session. */
export async function getLiveKitToken(
  room?: string,
  identity?: string
): Promise<{ token: string; url: string; room: string; identity: string }> {
  const targetIdentity = identity || `user-${crypto.randomUUID()}`;
  const targetRoom = room || `voice-${crypto.randomUUID()}`;

  const res = await apiFetch<LiveKitTokenResult>("/api/livekit/token", {
    method: "POST",
    body: JSON.stringify({ room: targetRoom, identity: targetIdentity }),
  });

  return {
    ...res,
    room: targetRoom,
    identity: targetIdentity,
  };
}
