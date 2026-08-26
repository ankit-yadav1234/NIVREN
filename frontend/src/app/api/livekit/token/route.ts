import { NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { room, identity } = body;

    const apiKey = process.env.LIVEKIT_API_KEY?.trim();
    const apiSecret = process.env.LIVEKIT_API_SECRET?.trim();
    const wsUrl = process.env.LIVEKIT_URL?.trim();

    if (!apiKey || !apiSecret || !wsUrl) {
      return NextResponse.json(
        { error: "LiveKit environment variables (LIVEKIT_API_KEY, LIVEKIT_API_SECRET, LIVEKIT_URL) not configured." },
        { status: 500 }
      );
    }

    if (!room || !identity) {
      return NextResponse.json({ error: "Missing required fields: room, identity" }, { status: 400 });
    }

    const at = new AccessToken(apiKey, apiSecret, { identity, ttl: "15m" });
    at.addGrant({
      room,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canUpdateOwnMetadata: true,
    });

    const token = await at.toJwt();

    return NextResponse.json({ token, url: wsUrl });
  } catch (err: any) {
    console.error("LiveKit token route error:", err);
    return NextResponse.json({ error: err.message || "Failed to create LiveKit token" }, { status: 500 });
  }
}
