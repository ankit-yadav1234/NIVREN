import { NextResponse } from "next/server";
import { GoogleGenAI, type FunctionDeclaration } from "@google/genai";

const KNOWLEDGE_BASE = [
  {
    id: "rcm-clean-claims",
    category: "rcm",
    text: "NIVREN delivers a 98% first-pass clean claim rate using automated electronic scrubbing and certified coder review.",
  },
  {
    id: "rcm-denials",
    category: "rcm",
    text: "NIVREN achieves a 35% reduction in payer denials with dedicated root-cause appeals and dispute resolution.",
  },
  {
    id: "rcm-ar-recovery",
    category: "rcm",
    text: "Average 28 days in Accounts Receivable (AR) compared to industry average 45-60 days.",
  },
  {
    id: "rcm-services",
    category: "rcm",
    text: "Services include Medical Billing, AAPC/AHIMA Certified Coding (ICD-10, CPT, HCPCS), Denial Management, AR Follow-up, Provider Credentialing (CAQH), and Practice Analytics.",
  },
  {
    id: "rcm-audit",
    category: "rcm",
    text: "NIVREN offers a 100% Free Revenue Cycle Assessment and Claims Audit for physician clinics, specialty practices, and hospitals.",
  },
  {
    id: "contact-info",
    category: "general",
    text: "Phone: +1 (800) 555-0199 | Emergency: +1 (800) 555-0911 | Email: care@nivren.com | Address: 12 Wellness Avenue, Mumbai, Maharashtra 400001.",
  },
];

const TOOLS: FunctionDeclaration[] = [
  {
    name: "navigate",
    description: "Navigate to a specific page on the website. Valid routes: /rcm, /contact, /case-studies, /who-we-serve, /departments, /services, /about, /faq",
    parameters: {
      type: "OBJECT" as any,
      properties: {
        path: { type: "STRING" as any, description: "The destination path, e.g. /contact or /rcm" },
      },
      required: ["path"],
    },
  },
  {
    name: "request_consultation",
    description: "Book an appointment or request a free RCM assessment.",
    parameters: {
      type: "OBJECT" as any,
      properties: {
        name: { type: "STRING" as any, description: "User or provider full name" },
        phone: { type: "STRING" as any, description: "Contact phone number" },
      },
      required: ["name"],
    },
  },
];

function fallbackSearch(query: string) {
  const q = query.toLowerCase();
  const found = KNOWLEDGE_BASE.filter((k) => q.split(" ").some((w) => w.length > 2 && k.text.toLowerCase().includes(w)));
  return found.length > 0 ? found.map((f) => f.text).join("\n") : KNOWLEDGE_BASE.map((k) => k.text).join("\n");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, history } = body;

    if (!message) {
      return NextResponse.json({ error: "Missing message" }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      // Offline smart fallback
      return NextResponse.json({
        reply: fallbackSearch(message).split("\n")[0] || "NIVREN provides 98% clean claim medical billing and RCM services.",
        actions: [],
      });
    }

    const client = new GoogleGenAI({ apiKey });
    const contents = (history ?? []).map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));
    contents.push({ role: "user", parts: [{ text: message }] });

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction:
          "You are Dr. Dylan, the AI Healthcare Revenue Cycle Management (RCM) consultant for NIVREN. " +
          "NIVREN delivers 98% clean claim rates, certified medical coding, denial management, and AR recovery for healthcare practices. " +
          "Be direct, articulate, professional, and helpful.",
        tools: [{ functionDeclarations: TOOLS }],
      },
    });

    const actions: any[] = [];
    const calls = response.functionCalls ?? [];
    for (const call of calls) {
      if (call.name === "navigate" && call.args?.path) {
        actions.push({ type: "navigate", path: call.args.path });
      } else if (call.name === "request_consultation") {
        actions.push({ type: "navigate", path: "/contact" });
      }
    }

    const replyText =
      actions.length > 0
        ? actions[0].path === "/contact"
          ? "Taking you to the contact and assessment page now."
          : `Navigating to ${actions[0].path} now.`
        : response.text || "I am Dr. Dylan from NIVREN RCM. How can I assist your practice?";

    return NextResponse.json({ reply: replyText, actions });
  } catch (err: any) {
    console.warn("Vercel AI route fallback:", err?.message);
    return NextResponse.json({
      reply: "NIVREN delivers 98% clean claim rate, certified coding, denial management, and accelerated cash flow for healthcare practices.",
      actions: [],
    });
  }
}
