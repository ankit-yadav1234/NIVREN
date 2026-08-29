import { NextResponse } from "next/server";

const DID_API_URL = "https://api.d-id.com";

const AVATARS = {
  female: {
    name: "Dr. Diana (Lady Specialist)",
    imageUrl: "https://clips-presenters.d-id.com/v2/diana_purple_shirt_1_hospital/0ICbk6FDig/FeSFT2_fSH/image.png",
    voiceId: "en-US-JennyNeural",
  },
  male: {
    name: "Dr. Dylan (Chief Specialist)",
    imageUrl: "https://clips-presenters.d-id.com/v2/dylan_grey_suite_lobby/veRJGS_iOD/9mMps_xg_q/image.png",
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
    const { gender = "male", imageUrl } = body;
    const avatar = AVATARS[gender as "female" | "male"] || AVATARS.male;
    const sourceUrl = imageUrl || avatar.imageUrl;
    const auth = getAuthHeader();

    const response = await fetch(`${DID_API_URL}/talks/streams`, {
      method: "POST",
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source_url: sourceUrl,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("D-ID create stream error:", data);
      return NextResponse.json({ error: data }, { status: response.status });
    }

    return NextResponse.json({
      ...data,
      avatarInfo: avatar,
    });
  } catch (err: any) {
    console.error("D-ID createStream route error:", err);
    return NextResponse.json({ error: err.message || "Failed to create D-ID stream" }, { status: 500 });
  }
}
