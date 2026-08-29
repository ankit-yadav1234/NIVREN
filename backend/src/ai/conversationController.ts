/**
 * Central Conversation Controller for Dr. Dylan Voice Agent
 * Single Source of Truth for:
 * - Active topic & subtopic continuity
 * - Turn ID & Generation versioning
 * - Active tool tracking & cancellation
 * - Agent State Machine: IDLE | LISTENING | PROCESSING | SPEAKING | EXECUTING | INTERRUPTED
 * - Backchannel detection & Topic switching
 * - Latency & telemetry instrumentation
 */

export type AgentState =
  | "IDLE"
  | "LISTENING"
  | "PROCESSING"
  | "SPEAKING"
  | "EXECUTING"
  | "INTERRUPTED";

export type UserIntent =
  | "CONTROL"
  | "NAVIGATION"
  | "SCROLL"
  | "THEME"
  | "LANGUAGE"
  | "CONSULTATION"
  | "KNOWLEDGE"
  | "FOLLOW_UP"
  | "BACKCHANNEL"
  | "GREETING"
  | "TOPIC_SWITCH"
  | "CANCEL"
  | "END_SESSION"
  | "NORMAL_CONVERSATION";

export interface LatencyBreakdown {
  userToDetectionMs?: number;
  detectionToIntentMs?: number;
  intentToToolMs?: number;
  toolToBrowserMs?: number;
  userToFirstAudioMs?: number;
}

export interface ConversationState {
  topic: string | null;
  subtopic: string | null;
  currentIntent: UserIntent | null;
  generationId: number;
  turnId: number;
  activeToolId: string | null;
  activeToolName: string | null;
  agentState: AgentState;
  pendingAction: string | null;
  lastUserMessage: string | null;
  lastAgentMessage: string | null;
  lastActionSummary: string | null;
  latency: LatencyBreakdown;
}

export class ConversationController {
  private state: ConversationState;
  private speechStartTime: number = 0;
  private vadDetectionTime: number = 0;
  private intentTime: number = 0;
  private onStateChange?: (state: ConversationState) => void;

  constructor(onStateChange?: (state: ConversationState) => void) {
    this.onStateChange = onStateChange;
    this.state = {
      topic: "Healthcare Revenue Cycle Management",
      subtopic: "Overview & Practice Assessment",
      currentIntent: "GREETING",
      generationId: 1,
      turnId: 1,
      activeToolId: null,
      activeToolName: null,
      agentState: "IDLE",
      pendingAction: null,
      lastUserMessage: null,
      lastAgentMessage: null,
      lastActionSummary: null,
      latency: {},
    };
  }

  public getState(): ConversationState {
    return { ...this.state };
  }

  public getGenerationId(): number {
    return this.state.generationId;
  }

  /** Called the instant user begins speaking (VAD / Speech Start) */
  public onUserSpeechStart(): { isInterruption: boolean; newGenerationId: number } {
    const now = Date.now();
    this.speechStartTime = now;
    this.vadDetectionTime = now;

    const wasSpeaking = this.state.agentState === "SPEAKING" || this.state.agentState === "EXECUTING";
    this.state.generationId++;
    this.state.turnId++;

    if (wasSpeaking) {
      this.state.agentState = "INTERRUPTED";
      console.log(`[INTERRUPTION] previousGen=${this.state.generationId - 1} newGen=${this.state.generationId} turnId=${this.state.turnId}`);
      if (this.state.activeToolName) {
        console.log(`[CANCEL] tool=${this.state.activeToolName} reason=user_interrupt`);
      }
      this.state.activeToolId = null;
      this.state.activeToolName = null;
    } else {
      this.state.agentState = "LISTENING";
    }

    this.state.latency.userToDetectionMs = Math.max(1, Date.now() - this.speechStartTime);
    this.notify();

    return {
      isInterruption: wasSpeaking,
      newGenerationId: this.state.generationId,
    };
  }

  /** Classifies user input into fast intent & maintains topic continuity */
  public onUserTranscript(text: string): { intent: UserIntent; isBackchannel: boolean } {
    this.intentTime = Date.now();
    this.state.lastUserMessage = text;
    this.state.agentState = "PROCESSING";

    const clean = text.trim().toLowerCase();

    // 1. Backchannel detection ('haan', 'hmm', 'yes', 'okay', 'right', 'theek hai', 'acha')
    const backchannelPatterns = /^(haan|hmm|hmmm|yes|okay|ok|right|yeah|yup|theek hai|thik hai|acha|achha|sahi hai|got it)$/i;
    if (backchannelPatterns.test(clean)) {
      this.state.currentIntent = "BACKCHANNEL";
      console.log(`[INTENT] intent=BACKCHANNEL topic=${this.state.topic} (topic preserved)`);
      this.notify();
      return { intent: "BACKCHANNEL", isBackchannel: true };
    }

    // 2. Control / Emergency Interrupt commands
    const controlPatterns = /^(stop|ruko|ruk jao|ruk|wait|cancel|don'?t|no|nahi|bas|close|exit|skip|chup|shant|hold on)/i;
    if (controlPatterns.test(clean)) {
      this.state.currentIntent = "CONTROL";
      console.log(`[INTENT] intent=CONTROL len=${clean.length} (priority=100)`);
      this.notify();
      return { intent: "CONTROL", isBackchannel: false };
    }

    // 3. Navigation Intent
    if (/navigate|open|go to|show|page|kholo|dikhao|le chalo/i.test(clean)) {
      this.state.currentIntent = "NAVIGATION";
      if (/rcm|billing|claim/i.test(clean)) this.updateTopic("RCM Services", "Medical Billing & Coding");
      else if (/case.?stud/i.test(clean)) this.updateTopic("Case Studies", "Client Success Results");
      else if (/who we serve|client/i.test(clean)) this.updateTopic("Who We Serve", "Physicians & Hospitals");
      else if (/contact|appointment|consultation/i.test(clean)) this.updateTopic("Contact & Consultation", "Booking Request");

      console.log(`[INTENT] intent=NAVIGATION topic=${this.state.topic}`);
      this.notify();
      return { intent: "NAVIGATION", isBackchannel: false };
    }

    // 4. Scroll Intent
    if (/scroll|neeche|upar|down|up/i.test(clean)) {
      this.state.currentIntent = "SCROLL";
      console.log(`[INTENT] intent=SCROLL len=${clean.length}`);
      this.notify();
      return { intent: "SCROLL", isBackchannel: false };
    }

    // 5. Theme / Language Intent
    if (/theme|dark|light|mode/i.test(clean)) {
      this.state.currentIntent = "THEME";
      this.notify();
      return { intent: "THEME", isBackchannel: false };
    }
    if (/language|hindi|english|arabic|bhasha/i.test(clean)) {
      this.state.currentIntent = "LANGUAGE";
      this.notify();
      return { intent: "LANGUAGE", isBackchannel: false };
    }

    // 6. Follow-up query (contextual to active topic)
    if (/benefit|kyu|kaise|how|why|detail|aur batao|explain|kya hai/i.test(clean)) {
      this.state.currentIntent = "FOLLOW_UP";
      console.log(`[INTENT] intent=FOLLOW_UP contextTopic="${this.state.topic}"`);
      this.notify();
      return { intent: "FOLLOW_UP", isBackchannel: false };
    }

    // Default conversational topic
    this.state.currentIntent = "NORMAL_CONVERSATION";
    this.notify();
    return { intent: "NORMAL_CONVERSATION", isBackchannel: false };
  }

  public onToolStart(toolName: string, toolId?: string) {
    this.state.agentState = "EXECUTING";
    this.state.activeToolName = toolName;
    this.state.activeToolId = toolId || `tool_${Date.now()}`;
    if (this.intentTime > 0) {
      this.state.latency.intentToToolMs = Math.max(1, Date.now() - this.intentTime);
    }
    console.log(`[TOOL_START] name=${toolName} id=${this.state.activeToolId} genId=${this.state.generationId}`);
    this.notify();
  }

  public onToolEnd(summary?: string) {
    console.log(`[TOOL_END] name=${this.state.activeToolName} genId=${this.state.generationId}`);
    if (summary) this.state.lastActionSummary = summary;
    this.state.activeToolId = null;
    this.state.activeToolName = null;
    this.notify();
  }

  public onAgentSpeaking(isSpeaking: boolean, text?: string) {
    if (isSpeaking) {
      this.state.agentState = "SPEAKING";
      if (text) this.state.lastAgentMessage = text;
      if (this.speechStartTime > 0) {
        this.state.latency.userToFirstAudioMs = Math.max(1, Date.now() - this.speechStartTime);
      }
    } else if (this.state.agentState === "SPEAKING") {
      this.state.agentState = "LISTENING";
    }
    this.notify();
  }

  public updateTopic(topic: string, subtopic?: string) {
    this.state.topic = topic;
    if (subtopic) this.state.subtopic = subtopic;
    this.notify();
  }

  private notify() {
    this.onStateChange?.(this.getState());
  }
}
