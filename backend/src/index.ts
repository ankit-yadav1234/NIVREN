import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getAIProvider } from './ai/geminiProvider';
import type { AIMessage } from './ai/types';
import { AccessToken } from 'livekit-server-sdk';
import { retrieveContext, warmIndex } from './ai/rag';
import { toolDeclarations, toClientAction, type ClientAction } from './ai/tools';
import { sectionsForRoute } from './ai/pageSections';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Pre-build the RAG embedding index at boot so the first real chat request
// (text or voice) doesn't pay the embedding cold-start cost.
warmIndex();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// In-Memory Appointment Storage (Simulation of Secure Patient DB)
// Field names match the frontend's AppointmentInput contract exactly
// (frontend/src/types/appointment.ts) so requests never silently 400.
interface AppointmentRecord {
  id: string;
  name: string;
  email?: string;
  phone: string;
  departmentId: string;
  doctorId?: string;
  date: string;
  time: string;
  reason?: string;
  status: 'confirmed' | 'pending';
  createdAt: string;
  confirmationCode: string;
}

const appointmentsDatabase: AppointmentRecord[] = [];

// API Endpoints
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    system: 'NIVREN Healthcare API',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.post('/api/appointments', (req: Request, res: Response) => {
  const { name, email, phone, departmentId, doctorId, date, time, reason } = req.body;

  // Required fields match the frontend's zod schema exactly — email is
  // intentionally optional there (a phone confirmation call is enough).
  if (!name || !phone || !departmentId || !date || !time) {
    res.status(400).json({ error: 'Missing required fields: name, phone, departmentId, date, time' });
    return;
  }

  const confirmationCode = `NIV-${Math.floor(100000 + Math.random() * 900000)}`;

  const newAppointment: AppointmentRecord = {
    id: `apt-${Date.now()}`,
    name,
    email,
    phone,
    departmentId,
    doctorId,
    date,
    time,
    reason,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
    confirmationCode
  };

  appointmentsDatabase.push(newAppointment);

  console.log(`🏥 New Appointment Booked: ${name} (${confirmationCode}) for ${date}`);

  // Shape matches the frontend's AppointmentResult contract exactly.
  res.status(201).json({
    success: true,
    referenceId: confirmationCode,
    message: 'Appointment request received.',
  });
});

app.get('/api/appointments', (req: Request, res: Response) => {
  res.json({
    totalCount: appointmentsDatabase.length,
    appointments: appointmentsDatabase
  });
});

// In-Memory Contact Message Storage
interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  createdAt: string;
}

const contactMessages: ContactMessage[] = [];

app.post('/api/contact', (req: Request, res: Response) => {
  const { name, email, phone, message } = req.body;

  if (!name || !email || !message) {
    res.status(400).json({ error: 'Missing required fields: name, email, message' });
    return;
  }

  const newMessage: ContactMessage = {
    id: `msg-${Date.now()}`,
    name,
    email,
    phone,
    message,
    createdAt: new Date().toISOString(),
  };

  contactMessages.push(newMessage);

  console.log(`📩 New Contact Message from ${name} (${email})`);

  res.status(201).json({
    success: true,
    message: 'Your message has been received.',
  });
});

// ---------------------------------------------------------------------
// AI Assistant — Gemini + RAG (site knowledge) + a small, whitelisted tool
// registry (navigate / request_consultation / search_knowledge). See
// VOICE_AI_AGENT_PROMPT.md for the full roadmap (voice pipeline is next).
// ---------------------------------------------------------------------
function buildSystemInstruction(pageContext?: { route?: string; title?: string }): string {
  const route = pageContext?.route || "/";
  const sections = sectionsForRoute(route);
  return (
    "You are Dr. Dylan, the AI Healthcare & Revenue Cycle Management (RCM) specialist for NIVREN. " +
    "NIVREN is a specialized technology-driven Healthcare Revenue Cycle Management partner — providing end-to-end " +
    "medical billing, certified coding, denial management, AR recovery, provider credentialing, and revenue analytics for hospitals, clinics, and physician practices.\n\n" +
    "Rules:\n" +
    "- Use the search_knowledge tool before answering specific factual questions about NIVREN.\n" +
    "- Use the navigate tool when the user explicitly asks to go to a different page.\n" +
    "- Use the request_consultation tool whenever the user wants to get started, book an appointment, or request a free RCM assessment.\n" +
    "- Use the scroll_to_section tool when the user asks to jump to a specific part of the CURRENT page.\n" +
    "- Be concise, helpful, and professional." +
    (pageContext?.route ? `\nThe user is currently on: ${pageContext.route}${pageContext.title ? ` ("${pageContext.title}")` : ""}.` : "") +
    (sections.length
      ? `\nSections available on this page:\n${sections.map((s) => `- ${s.id}: ${s.label}`).join("\n")}`
      : "")
  );
}

interface AIChatRequestBody {
  message?: string;
  history?: AIMessage[];
  pageContext?: { route?: string; title?: string };
}

async function runAssistant(body: AIChatRequestBody): Promise<{ reply: string; actions: ClientAction[] }> {
  const { message, history, pageContext } = body;
  const provider = getAIProvider();
  const systemInstruction = buildSystemInstruction(pageContext);

  const first = await provider.generate({
    message: message!,
    history,
    systemInstruction,
    tools: [...toolDeclarations],
  });

  const actions: ClientAction[] = [];
  let ragContext: string | undefined;

  for (const call of first.toolCalls ?? []) {
    if (call.name === 'search_knowledge') {
      const query = String(call.args.query ?? message);
      const docs = await retrieveContext(query);
      ragContext = docs.map((d) => `[${d.category}] ${d.text} (see ${d.route})`).join('\n');
    } else {
      const action = toClientAction(call);
      if (action) actions.push(action);
    }
  }

  // If knowledge was requested, do a second pass with that context so the
  // model can turn it into a natural-language answer. This pass gets a
  // dedicated, tool-free instruction — reusing the tool-aware one here would
  // tell the model tools exist while none are actually offered, which makes
  // it try (and fail) to emit a function call instead of just answering.
  if (ragContext !== undefined) {
    const second = await provider.generate({
      message: message!,
      history,
      systemInstruction:
        "You are the NIVREN assistant. Answer the user's question using ONLY the context below. " +
        "Be concise and natural. If the context doesn't actually answer the question, say you don't have that information.",
      context: ragContext || 'No matching information was found in the knowledge base.',
    });
    return { reply: second.text, actions };
  }

  // No tool calls at all — the model answered directly (e.g. small talk).
  if (!first.toolCalls?.length) {
    return { reply: first.text, actions };
  }

  // Only navigate/request_consultation/scroll_to_section were called (no RAG) —
  // give a short natural confirmation instead of surfacing the model's
  // empty text.
  const confirmations: Record<string, string> = {
    navigate: "Sure, taking you there now.",
    request_consultation: "Opening the consultation request page for you.",
    scroll_to_section: "Sure, scrolling you there now.",
  };
  const confirmationText =
    actions.length > 0 ? confirmations[first.toolCalls[0].name] ?? 'Done.' : first.text;
  return { reply: confirmationText, actions };
}

app.post('/api/ai/chat', async (req: Request, res: Response) => {
  const { message } = req.body as AIChatRequestBody;
  if (!message || typeof message !== 'string') {
    res.status(400).json({ error: 'Missing required field: message' });
    return;
  }

  try {
    const result = await runAssistant(req.body as AIChatRequestBody);
    res.json({ reply: result.reply, actions: result.actions });
  } catch (err) {
    console.warn('AI chat primary provider error, using smart fallback:', (err as Error)?.message);
    const docs = await retrieveContext(message);
    const fallbackReply = docs.length > 0
      ? docs[0].text
      : "NIVREN is a specialized Revenue Cycle Management partner delivering 98% clean claim rate, certified medical coding, denial management, and AR recovery for healthcare practices.";
    res.json({ reply: fallbackReply, actions: [] });
  }
});

app.post('/api/ai/chat/stream', async (req: Request, res: Response) => {
  const { message, history } = req.body as AIChatRequestBody;
  if (!message || typeof message !== 'string') {
    res.status(400).json({ error: 'Missing required field: message' });
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
    const provider = getAIProvider();
    for await (const chunk of provider.generateStream({
      message,
      history,
      systemInstruction: buildSystemInstruction(),
    })) {
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
    }
    res.write('data: [DONE]\n\n');
  } catch (err) {
    console.error('AI chat stream error:', err);
    res.write(`data: ${JSON.stringify({ error: 'AI request failed.' })}\n\n`);
  } finally {
    res.end();
  }
});

// ---------------------------------------------------------------------
// LiveKit voice agent (Phase 2): room access tokens. LIVEKIT_API_SECRET
// never leaves this server — the frontend only ever receives a signed,
// short-lived JWT for one specific room.
// ---------------------------------------------------------------------
app.post('/api/livekit/token', async (req: Request, res: Response) => {
  const { room, identity } = req.body as { room?: string; identity?: string };
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const wsUrl = process.env.LIVEKIT_URL;

  if (!apiKey || !apiSecret || !wsUrl) {
    res.status(500).json({ error: 'LiveKit is not configured on the server.' });
    return;
  }
  if (!room || !identity) {
    res.status(400).json({ error: 'Missing required fields: room, identity' });
    return;
  }

  const at = new AccessToken(apiKey, apiSecret, { identity, ttl: '15m' });
  // canUpdateOwnMetadata: the browser publishes its current route as a
  // participant attribute (see useVoiceSession.ts) so the voice agent can
  // look up in-page sections for scroll_to_section — without this grant,
  // setAttributes() is rejected server-side with NOT_ALLOWED.
  at.addGrant({ room, roomJoin: true, canPublish: true, canSubscribe: true, canUpdateOwnMetadata: true });
  const token = await at.toJwt();

  res.json({ token, url: wsUrl });
});

// ---------------------------------------------------------------------
// D-ID Streaming Real-Time AI Avatar Endpoints (Disabled - Using LiveKit WebRTC)
// ---------------------------------------------------------------------
// import {
//   handleCreateStream,
//   handleStartSdp,
//   handleIceCandidate,
//   handleTalk,
//   handleCloseStream,
// } from './didService';
// app.post('/api/did/stream', handleCreateStream);
// app.post('/api/did/sdp', handleStartSdp);
// app.post('/api/did/ice', handleIceCandidate);
// app.post('/api/did/talk', handleTalk);
// app.post('/api/did/close', handleCloseStream);

app.listen(PORT, () => {
  console.log(`🚀 NIVREN Healthcare Express Backend running on http://localhost:${PORT}`);
});
