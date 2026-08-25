import { NextResponse } from "next/server";
import { GoogleGenAI, type FunctionDeclaration } from "@google/genai";

const KNOWLEDGE_BASE = [
  {
    id: "rcm-clean-claims",
    keywords: ["clean claim", "claims", "rate", "percentage", "accuracy", "billing rate"],
    text: "NIVREN delivers a 98% first-pass clean claim rate using automated electronic scrubbing and certified coder review.",
  },
  {
    id: "rcm-denials",
    keywords: ["denial", "rejections", "appeal", "denials"],
    text: "NIVREN achieves a 35% reduction in payer denials with dedicated root-cause appeals and dispute resolution.",
  },
  {
    id: "rcm-ar-recovery",
    keywords: ["ar", "accounts receivable", "days", "cash flow", "aging"],
    text: "Average 28 days in Accounts Receivable (AR) compared to the industry average of 45-60 days.",
  },
  {
    id: "rcm-services",
    keywords: ["services", "coding", "billing", "icd", "cpt", "credentialing", "what do you do"],
    text: "Our core RCM services include Medical Billing, AAPC/AHIMA Certified Coding (ICD-10, CPT, HCPCS), Denial Management, AR Follow-up, Provider Credentialing (CAQH), and Practice Analytics.",
  },
  {
    id: "rcm-audit",
    keywords: ["audit", "assessment", "free", "consultation", "book", "appointment"],
    text: "NIVREN offers a 100% Free Revenue Cycle Assessment and Claims Audit for physician clinics, specialty practices, and hospitals.",
  },
  {
    id: "about-info",
    keywords: ["about", "story", "team", "who are you", "leadership", "mission"],
    text: "NIVREN is a premier Healthcare Revenue Cycle Management partner committed to accelerating provider cash flow, eliminating claim denials, and maximizing practice revenue.",
  },
  {
    id: "contact-info",
    keywords: ["contact", "phone", "email", "address", "location", "support", "call"],
    text: "Phone: +1 (800) 555-0199 | Email: care@nivren.com | Emergency: +1 (800) 555-0911 | Address: 12 Wellness Avenue, Mumbai, Maharashtra 400001.",
  },
];

const TOOLS: FunctionDeclaration[] = [
  {
    name: "navigate",
    description: "Navigate to a specific page on the website. Valid paths: /rcm, /contact, /about, /case-studies, /who-we-serve, /departments, /services, /doctors, /locations, /faq",
    parameters: {
      type: "OBJECT" as any,
      properties: {
        path: { type: "STRING" as any, description: "The destination path, e.g. /about or /contact or /rcm" },
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

function smartKeywordMatch(message: string): { reply: string; actions: Array<{ type: "navigate"; path: string }> } {
  const m = message.toLowerCase();
  const actions: Array<{ type: "navigate"; path: string }> = [];

  if (m.includes("about") || m.includes("story") || m.includes("mission") || m.includes("leadership")) {
    actions.push({ type: "navigate", path: "/about" });
    return { reply: "Opening the About NIVREN & Our Story page for you.", actions };
  }
  if (m.includes("home") || m.includes("main page")) {
    actions.push({ type: "navigate", path: "/" });
    return { reply: "Taking you back to the home page.", actions };
  }
  if (m.includes("contact") || m.includes("reach") || m.includes("call") || m.includes("email") || m.includes("audit") || m.includes("assessment")) {
    actions.push({ type: "navigate", path: "/contact" });
    return { reply: "Opening the Contact & Free RCM Assessment page.", actions };
  }
  if (m.includes("service") || m.includes("billing") || m.includes("coding") || m.includes("rcm")) {
    actions.push({ type: "navigate", path: "/rcm" });
    return { reply: "Navigating to our full Revenue Cycle Management & Medical Billing services.", actions };
  }
  if (m.includes("case") || m.includes("study") || m.includes("result") || m.includes("success")) {
    actions.push({ type: "navigate", path: "/case-studies" });
    return { reply: "Taking you to our Client Case Studies & Proven Results.", actions };
  }
  if (m.includes("who we serve") || m.includes("hospital") || m.includes("practice") || m.includes("clinic")) {
    actions.push({ type: "navigate", path: "/who-we-serve" });
    return { reply: "Opening the Who We Serve page for health systems, clinics, and billing companies.", actions };
  }
  if (m.includes("faq") || m.includes("question") || m.includes("help")) {
    actions.push({ type: "navigate", path: "/faq" });
    return { reply: "Opening the Frequently Asked Questions (FAQ) page.", actions };
  }

  // General Q&A match
  const matched = KNOWLEDGE_BASE.find((k) => k.keywords.some((w) => m.includes(w)));
  if (matched) {
    return { reply: matched.text, actions: [] };
  }

  return {
    reply: "Hello! I am Dr. Dylan, your NIVREN RCM consultant. I can answer questions about our 98% clean claim rate, certified coding, and denial management, or navigate you to any page. What would you like to explore?",
    actions: [],
  };
}

export async function POST(req: Request) {
  let userMessage = "";
  try {
    const body = await req.json();
    const { message, history } = body;
    userMessage = typeof message === "string" ? message : "";

    if (!userMessage) {
      return NextResponse.json({ error: "Missing message" }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      const match = smartKeywordMatch(message);
      return NextResponse.json(match);
    }

    const client = new GoogleGenAI({ apiKey });
    const contents = (history ?? []).map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));
    contents.push({ role: "user", parts: [{ text: message }] });

    const response = await client.models.generateContent({
      model: "gemini-3.6-flash",
      contents,
      config: {
        systemInstruction:
          "You are Dr. Dylan, the executive AI Healthcare Revenue Cycle Management (RCM) consultant for NIVREN. " +
          "NIVREN delivers 98% clean claim rates, certified medical coding (ICD-10, CPT), 35% fewer denials, and 28 average days in AR. " +
          "When the user asks to open, go to, or view a page (e.g. About, Contact, RCM, Case Studies, Services, FAQ, Who We Serve), ALWAYS use the navigate tool. " +
          "For general questions or greetings (like 'hello' or 'hi'), greet them warmly as Dr. Dylan from NIVREN and ask how you can help optimize their practice revenue cycle.",
        tools: [{ functionDeclarations: TOOLS }],
      },
    });

    const actions: any[] = [];
    const calls = response.functionCalls ?? [];
    for (const call of calls) {
      if (call.name === "navigate" && call.args?.path) {
        actions.push({ type: "navigate", path: String(call.args.path) });
      } else if (call.name === "request_consultation") {
        actions.push({ type: "navigate", path: "/contact" });
      }
    }

    let replyText = response.text;
    if (!replyText || replyText.trim() === "") {
      if (actions.length > 0) {
        const dest = actions[0].path;
        replyText =
          dest === "/contact"
            ? "Opening the contact and consultation request page for you."
            : dest === "/about"
            ? "Opening the About NIVREN & Our Story page."
            : `Taking you to ${dest} now.`;
      } else {
        replyText = "Hello! I am Dr. Dylan from NIVREN. How can I assist your practice with revenue cycle management today?";
      }
    }

    return NextResponse.json({ reply: replyText, actions });
  } catch (err: any) {
    console.warn("Gemini API fallback to smart matcher:", err?.message);
    const fallback = smartKeywordMatch(userMessage);
    return NextResponse.json(fallback);
  }
}
