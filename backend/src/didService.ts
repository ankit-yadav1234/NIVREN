import { Request, Response } from 'express';

const DID_API_URL = 'https://api.d-id.com';

const AVATARS = {
  female: {
    name: 'Dr. Diana (Lady Specialist)',
    imageUrl: 'https://clips-presenters.d-id.com/v2/diana_purple_shirt_1_hospital/0ICbk6FDig/FeSFT2_fSH/image.png',
    voiceId: 'en-US-JennyNeural',
  },
  male: {
    name: 'Dr. Dylan (Chief Specialist)',
    imageUrl: 'https://clips-presenters.d-id.com/v2/dylan_grey_suite_lobby/veRJGS_iOD/9mMps_xg_q/image.png',
    voiceId: 'en-US-GuyNeural',
  },
};

function getAuthHeader(): string {
  const apiKey = process.env.DID_API_KEY;
  if (!apiKey) {
    throw new Error('DID_API_KEY is not configured in backend environment.');
  }
  return `Basic ${Buffer.from(apiKey).toString('base64')}`;
}

export async function handleCreateStream(req: Request, res: Response) {
  try {
    const { gender = 'female', imageUrl } = req.body as { gender?: 'female' | 'male'; imageUrl?: string };
    const avatar = AVATARS[gender as 'female' | 'male'] || AVATARS.female;
    const sourceUrl = imageUrl || avatar.imageUrl;
    const auth = getAuthHeader();

    const response = await fetch(`${DID_API_URL}/talks/streams`, {
      method: 'POST',
      headers: {
        Authorization: auth,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source_url: sourceUrl,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('D-ID create stream error:', data);
      res.status(response.status).json({ error: data });
      return;
    }

    res.json({
      ...data,
      avatarInfo: avatar,
    });
  } catch (err: any) {
    console.error('D-ID handleCreateStream error:', err);
    res.status(500).json({ error: err.message || 'Failed to create D-ID stream' });
  }
}

export async function handleStartSdp(req: Request, res: Response) {
  try {
    const { streamId, answer, sessionId } = req.body;
    if (!streamId || !answer || !sessionId) {
      res.status(400).json({ error: 'Missing streamId, answer, or sessionId' });
      return;
    }

    const auth = getAuthHeader();
    const response = await fetch(`${DID_API_URL}/talks/streams/${streamId}/sdp`, {
      method: 'POST',
      headers: {
        Authorization: auth,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        answer,
        session_id: sessionId,
      }),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err: any) {
    console.error('D-ID handleStartSdp error:', err);
    res.status(500).json({ error: err.message });
  }
}

export async function handleIceCandidate(req: Request, res: Response) {
  try {
    const { streamId, candidate, sdpMid, sdpMLineIndex, sessionId } = req.body;
    if (!streamId || !candidate || !sessionId) {
      res.status(400).json({ error: 'Missing required candidate fields' });
      return;
    }

    const auth = getAuthHeader();
    const response = await fetch(`${DID_API_URL}/talks/streams/${streamId}/ice`, {
      method: 'POST',
      headers: {
        Authorization: auth,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        candidate,
        sdpMid,
        sdpMLineIndex,
        session_id: sessionId,
      }),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err: any) {
    console.error('D-ID handleIceCandidate error:', err);
    res.status(500).json({ error: err.message });
  }
}

export async function handleTalk(req: Request, res: Response) {
  try {
    const { streamId, sessionId, text, gender = 'female' } = req.body;
    if (!streamId || !sessionId || !text) {
      res.status(400).json({ error: 'Missing streamId, sessionId, or text' });
      return;
    }

    const avatar = AVATARS[gender as 'female' | 'male'] || AVATARS.female;
    const auth = getAuthHeader();

    const response = await fetch(`${DID_API_URL}/talks/streams/${streamId}`, {
      method: 'POST',
      headers: {
        Authorization: auth,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        script: {
          type: 'text',
          input: text,
          provider: {
            type: 'microsoft',
            voice_id: avatar.voiceId,
          },
        },
        session_id: sessionId,
      }),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err: any) {
    console.error('D-ID handleTalk error:', err);
    res.status(500).json({ error: err.message });
  }
}

export async function handleCloseStream(req: Request, res: Response) {
  try {
    const { streamId, sessionId } = req.body;
    if (!streamId || !sessionId) {
      res.status(400).json({ error: 'Missing streamId or sessionId' });
      return;
    }

    const auth = getAuthHeader();
    const response = await fetch(`${DID_API_URL}/talks/streams/${streamId}`, {
      method: 'DELETE',
      headers: {
        Authorization: auth,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session_id: sessionId,
      }),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err: any) {
    console.error('D-ID handleCloseStream error:', err);
    res.status(500).json({ error: err.message });
  }
}
