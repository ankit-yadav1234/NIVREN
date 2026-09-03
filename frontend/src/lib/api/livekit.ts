import { apiFetch } from "./client";

export interface LiveKitTokenResult {
  token: string;
  url: string;
  room?: string;
  identity?: string;
}

interface CachedToken extends LiveKitTokenResult {
  room: string;
  identity: string;
  timestamp: number;
}

let prefetchedToken: CachedToken | null = null;
let prefetchPromise: Promise<CachedToken | null> | null = null;

const TOKEN_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes cache validity

/** Pre-warms backend and prefetches a LiveKit token in the background for zero-latency start */
export async function prewarmVoiceToken(): Promise<CachedToken | null> {
  if (typeof window === "undefined") return null;
  if (prefetchedToken && Date.now() - prefetchedToken.timestamp < TOKEN_EXPIRY_MS) {
    return prefetchedToken;
  }
  if (prefetchPromise) return prefetchPromise;

  prefetchPromise = (async () => {
    try {
      const identity = `user-${crypto.randomUUID()}`;
      const room = `voice-${crypto.randomUUID()}`;
      const result = await apiFetch<LiveKitTokenResult>("/api/livekit/token", {
        method: "POST",
        body: JSON.stringify({ room, identity }),
      });
      if (result && result.token && result.url) {
        prefetchedToken = {
          ...result,
          room,
          identity,
          timestamp: Date.now(),
        };
        return prefetchedToken;
      }
      return null;
    } catch (e) {
      console.warn("Background voice token prewarm skipped:", e);
      return null;
    } finally {
      prefetchPromise = null;
    }
  })();

  return prefetchPromise;
}

/** Requests a short-lived LiveKit room-join token for a voice session (or uses pre-warmed token if available). */
export async function getLiveKitToken(
  room?: string,
  identity?: string
): Promise<{ token: string; url: string; room: string; identity: string }> {
  // Use pre-warmed token if available and specific room was not requested
  if (!room && !identity && prefetchedToken && Date.now() - prefetchedToken.timestamp < TOKEN_EXPIRY_MS) {
    const cached = prefetchedToken;
    prefetchedToken = null; // consume token
    // Start warming next token in background for future sessions
    setTimeout(() => {
      prewarmVoiceToken().catch(() => {});
    }, 2000);
    return cached;
  }

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
