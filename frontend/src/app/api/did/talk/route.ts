import { NextResponse } from "next/server";

const DID_API_URL = "https://api.d-id.com";

const AVATARS = {
  female: {
    voiceId: "en-US-JennyNeural",
  },
  male: {
    voiceId: "en-US-GuyNeural",
  },
};

function getAuthHeader(): string {
  const apiKey = process.env.DID_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("DID_API_KEY is not configured in environment.");
  }
  return apiKey.startsWith("Basic ") ? apiKey : `Basic ${Buffer.from(apiKey).toString("base64")}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { streamId, sessionId, text, gender = "male" } = body;
    if (!streamId || !sessionId || !text) {
      return NextResponse.json({ error: "Missing streamId, sessionId, or text" }, { status: 400 });
    }

    const avatar = AVATARS[gender as "female" | "male"] || AVATARS.male;
    const auth = getAuthHeader();

    const response = await fetch(`${DID_API_URL}/talks/streams/${streamId}`, {
      method: "POST",
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        script: {
          type: "text",
          input: text,
          provider: {
            type: "microsoft",
            voice_id: avatar.voiceId,
          },
        },
        session_id: sessionId,
      }),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (err: any) {
    console.error("D-ID talk route error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
