import { NextResponse } from "next/server";

const DID_API_URL = "https://api.d-id.com";

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
    const { streamId, sessionId } = body;
    if (!streamId || !sessionId) {
      return NextResponse.json({ error: "Missing streamId or sessionId" }, { status: 400 });
    }

    const auth = getAuthHeader();
    const response = await fetch(`${DID_API_URL}/talks/streams/${streamId}`, {
      method: "DELETE",
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session_id: sessionId,
      }),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (err: any) {
    console.error("D-ID closeStream route error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
