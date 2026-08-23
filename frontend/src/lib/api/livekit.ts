import { apiFetch } from "./client";

export interface LiveKitTokenResult {
  token: string;
  url: string;
}

/** Requests a short-lived LiveKit room-join token for a voice session. */
export async function getLiveKitToken(room: string, identity: string): Promise<LiveKitTokenResult> {
  return apiFetch<LiveKitTokenResult>("/api/livekit/token", {
    method: "POST",
    body: JSON.stringify({ room, identity }),
  });
}
