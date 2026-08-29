# Dr. Dylan Real-Time Voice Agent — 44-Point Audit

**Scope note:** most of this architecture (Conversation Controller, generation IDs,
priority system, abortable scroll, stale-action rejection) was already built and
committed (`105d872 feat(voice-agent): real-time interruptible Dr. Dylan
architecture...`) earlier in this project. This pass **re-inspected every file
end-to-end, verified each point against the actual code, and fixed the real gaps
found** — it is not a from-scratch rebuild. Every checkbox below reflects what was
actually read in the source, not an assumption.

Key files: [`agent.ts`](../backend/src/voice-agent/agent.ts) ·
[`conversationController.ts`](../backend/src/ai/conversationController.ts) ·
[`prompt.ts`](../backend/src/ai/prompt.ts) · [`rag.ts`](../backend/src/ai/rag.ts) ·
[`tools.ts`](../backend/src/ai/tools.ts) ·
[`useVoiceSession.ts`](../frontend/src/hooks/useVoiceSession.ts) ·
[`AssistantWidget.tsx`](../frontend/src/components/layout/AssistantWidget.tsx) ·
[`VoiceAgentPanel.tsx`](../frontend/src/components/layout/VoiceAgentPanel.tsx)

Legend: ✅ verified working · ⚠️ partially there (explained) · ❌ genuinely not
done, explained why · 🔧 fixed in this pass · — context/example, not a checkbox.

---

### 1–3. Stack / Problem / Required Experience
— Context sections from the brief. The gaps listed in §2 map to the checkboxes
below; the example flows in §3 are what §4–§20 implement.

### 4. LATEST USER INTENT WINS
✅ `ConversationController.onUserSpeechStart()` bumps `generationId` the instant
the user starts talking while the agent is speaking/executing, marks the old tool
`null`, and the frontend rejects any in-flight action whose `generationId` is
behind the newest observed one (see §20).

### 5. CENTRAL CONVERSATION CONTROLLER
✅ `conversationController.ts` is the single source of truth — topic, subtopic,
intent, generationId, turnId, activeTool, agentState, latency — held in one
instance per call, not duplicated across components. The frontend only holds a
read-only mirror (`ConversationTelemetry`) pushed over the data channel.

### 6. GENERATION VERSIONING
✅ Every `AgentAction` carries `generationId`. `useVoiceSession.ts` tracks
`maxObservedGenerationId` and discards any action whose `generationId` is behind
it (unless priority ≥ 100 — control commands always win). Applies to navigate,
scroll, theme, language, consultation actions. RAG is excluded because it's not
in the voice path at all (see §26) — nothing to version there.

### 7. ABORTABLE TOOL EXECUTION
⚠️ The **scroll** tool uses a real `AbortController` (§8). The other backend
tools (`navigate`, consultation fields, etc.) rely on LiveKit Agents'
`ToolFlag.CANCELLABLE`, which is the framework's own in-flight-call cancellation
mechanism rather than a hand-rolled `AbortController` per tool. Functionally
equivalent for these tools (they're fire-and-forget `publishData` calls with
nothing left running afterward), but it's not the literal `{controller,
signal}` shape from the brief for every tool — only where there's actually an
ongoing loop to cancel (scroll).

### 8. SCROLL FULLY INTERRUPTIBLE
✅ `AssistantWidget.tsx`: `startContinuousScroll` uses a real `AbortController` +
`requestAnimationFrame` loop that checks `signal.aborted` every frame. Stops on
`interrupt`, `stop_scroll`, navigation, session end, and on the user's own wheel/
touch input. No `setInterval` anywhere in the loop.

### 9. ACTION PRIORITY SYSTEM
✅ Implemented — `stop_scroll`/`end_session`/`interrupt` = 100,
`consultation_requested` = 95, `navigate` = 90, `language` = 85, `theme` = 80,
`confirm_consultation` = 80, `start_consultation`/`update_form` = 70,
`scroll`/`start_smooth_scroll` = 60, `scroll_page` = 50, `agent_speaking` = 10.
Exact numbers differ slightly from the brief's suggested scale, but the
*relative ordering* — control > navigation > theme/language > scroll > talk — is
what actually matters for the stale-action filter, and that ordering is correct.

### 10. FAST CONTROL COMMAND PATH
✅ `onUserTranscript` regex-matches control words (`stop`, `ruko`, `cancel`,
`bas`, `wait`, `no`, `skip`, …) as step 2 of intent classification — before any
navigation/scroll/topic logic — and the `stop_scroll` tool is priority 100.
`toolResponseScheduling: FunctionResponseScheduling.INTERRUPT` also makes the
Gemini session interrupt its own speech the instant a tool call fires.

### 11. INTERRUPTIBLE SPEECH
✅ Two independent triggers, both zero-added-latency: (a) backend
`UserStateChanged` → `onUserSpeechStart()` → generation bump + `interrupt`
action; (b) frontend `RoomEvent.ActiveSpeakersChanged` independently flips
`agentSpeaking: false` the instant it sees the user as an active speaker,
without waiting for the backend round-trip. Belt-and-suspenders — whichever
signal arrives first wins.

### 12. BACKCHANNEL DETECTION
✅ Explicit regex list (`haan`, `hmm`, `yes`, `okay`, `theek hai`, `acha`, …)
checked first in `onUserTranscript`, tagged `BACKCHANNEL`, topic left untouched,
logged as `(topic preserved)`.

### 13. TOPIC CONTINUITY
✅ `topic`/`subtopic` live in `ConversationState` and persist across turns unless
explicitly changed. `FOLLOW_UP` intent detection (`benefit`, `kyu`, `kaise`,
`explain`, …) is logged with the *current* topic attached.

### 14. TOPIC SWITCHING
✅ The `NAVIGATION` branch of `onUserTranscript` re-maps topic/subtopic based on
keywords (`rcm`→RCM Services, `case stud`→Case Studies, `contact`→Contact &
Consultation, etc.) the moment a navigation-shaped utterance is seen.

### 15. CONVERSATION INTENT ROUTER
✅ `onUserTranscript` classifies into exactly the category list from the brief
(CONTROL, NAVIGATION, SCROLL, THEME, LANGUAGE, FOLLOW_UP, BACKCHANNEL,
NORMAL_CONVERSATION, …) using plain regex — no extra LLM call, so it costs
effectively 0ms.

### 16. ACTION COMMANDS MUST BE FAST
✅ Voice has **zero** RAG/embedding tools registered at all (confirmed by
reading the full tool list in `agent.ts`) — facts are baked into the system
prompt instead (see §26), so there's no possible RAG detour for any action.

### 17. TOOL REGISTRY DESIGN
⚠️ Priority + interruptible flags live on the *action payload* each tool
publishes, not on a formal `{name, priority, interruptible, execute, cancel}`
object on the tool definition itself. Outcome is the same (every action the
frontend receives is correctly tagged), but it's a payload-level convention
rather than a registry-level one.

### 18. DATA CHANNEL ACTION PROTOCOL
✅ Matches the brief closely: `{id, generationId, type, priority, interruptible,
timestamp, ...payload}`. `cancel_action`/`targetActionId` fields exist in the
type but aren't currently emitted by any tool — action *supersession* is
currently handled purely through generation-ID comparison rather than explicit
per-action cancel messages, which is a simpler and sufficient mechanism given
every action already carries its generation.

### 19. FRONTEND ACTION MANAGER
✅ `runClientAction` in `AssistantWidget.tsx` is the single place that executes
navigate/scroll/stopScroll/theme/language/consultation/close — no component
independently reacts to `agent-action` messages.

### 20. NAVIGATION RACE CONDITION PROTECTION
✅ `useVoiceSession.ts` tracks `maxObservedGenerationId` + `lastActionTimestamp`
and drops any action that's behind either one (unless priority ≥ 100), before
it ever reaches the Action Manager. A late-arriving stale `navigate` cannot
overwrite a newer one.

### 21. GEMINI REALTIME CONFIGURATION
✅ Reviewed and left as a **single, consistent** turn-detection source: Gemini's
own `automaticActivityDetection` (HIGH start/end sensitivity, 450ms silence) —
no competing LiveKit-side turn detector layered on top. `toolBehavior:
NON_BLOCKING` + `toolResponseScheduling: INTERRUPT` + `turnCoverage:
TURN_INCLUDES_ONLY_ACTIVITY` are all tuned for immediate barge-in.

### 22. PREEMPTIVE GENERATION
❌ Not implemented. Speculative/preemptive generation isn't exposed as a
configurable option in the installed `@livekit/agents-plugin-google` /
`@google/genai` SDK versions for the Live API — there's no client-side knob for
it here. Flagging honestly rather than fabricating a fake option.

### 23. ENDPOINTING
✅ Tuned to `silenceDurationMs: 450` with HIGH start/end sensitivity — a
reasoned middle ground (fast without being jumpy). **Caveat:** genuinely
confirming this is optimal for real multi-clause Hindi/English utterances
requires a live call with real speech, which isn't something I can execute in
this environment — this is a configuration choice, not something benchmarked
end-to-end here.

### 24. LATENCY BUDGET
⚠️ Partially instrumented: `userToDetectionMs`, `intentToToolMs`, and
`userToFirstAudioMs` are captured in `ConversationController` and shown live in
the dev-only debug panel. Not every sub-metric from the brief (VAD-detected vs.
speech-start as separate events, `toolCallEnd`, `actionReceived` vs.
`actionExecuted`) is separately tracked — a meaningful subset is, not the full
exhaustive list.

### 25. TARGET PERCEIVED EXPERIENCE
— Outcome of §4–§24 combined, not a separate checkbox.

### 26. RAG OPTIMIZATION
✅ Confirmed by reading the full tool array in `agent.ts`: **no `search_knowledge`
tool is registered for voice at all.** RCM facts are embedded directly in
`buildVoiceInstructions()` (see `prompt.ts`), so there's no RAG/embedding call
possible in the voice path, for any intent. RAG (`rag.ts`) is only reachable
from the text-chat backend.

### 27. RAG FAILURE FALLBACK
✅ `rag.ts` has a keyword-scoring fallback (`fallbackKeywordSearch`) that fires
on embedding-API failure — used by text chat only, since voice never calls RAG
to begin with (§26).

### 28. CONSULTATION FLOW — INTERRUPTIBLE
🔧 **Fixed this pass.** There was no way to explicitly abandon an in-progress
consultation — added a new `cancel_consultation` tool
([agent.ts](../backend/src/voice-agent/agent.ts)) that clears the in-memory
consultation object and publishes a `consultation_cancelled` action; the
frontend now clears the live-filled form UI on that action
([AssistantWidget.tsx](../frontend/src/components/layout/AssistantWidget.tsx)).
Prompt updated with an explicit rule 10 telling the model to call it the moment
the user backs out ("actually skip this", "never mind", "cancel that"). Never
submits without `confirm_consultation` succeeding first — unchanged, already
enforced server-side.

### 29. SESSION MANAGEMENT
✅ `terminateSession()` clears both timers, publishes `end_session`, and
disconnects the room; `ctx.room.on("disconnected", …)` also clears timers as a
backstop. No orphaned `setTimeout` survives past termination.

### 30. AVATAR SYNCHRONIZATION
⚠️ The important behavior works — `agentSpeaking` (and therefore lip-sync/
equalizer visuals in `VoiceAgentPanel.tsx`) flips to `false` immediately on
`interrupt`, not waiting for the sentence to finish. The full 8-state enum
(IDLE/LISTENING/PROCESSING/SPEAKING/INTERRUPTED/EXECUTING/SUCCESS/ERROR) exists
in `ConversationController`, but the avatar UI itself only visually
distinguishes speaking / not-speaking / connecting — it doesn't render 8
distinct visual states.

### 31. MOUSE PARALLAX
✅ Confirmed 60fps `requestAnimationFrame` + lerp loop using refs for the raw
target/current position (`targetMouseRef`/`currentMouseRef`), with only the
smoothed value going through `setState` — no per-mousemove re-render, no
calculation inside JSX render.

### 32. D-ID
✅ Confirmed by grepping the entire live voice path (`agent.ts`,
`VoiceAgentPanel.tsx`, `useVoiceSession.ts`, `AssistantWidget.tsx`) —
**zero references** to `didService`/`useDidAvatar`/`/api/did/*`. D-ID is fully
decoupled; the live avatar is a static image + CSS 3D parallax, not a D-ID
stream.

### 33–37. Architecture diagrams / flows / design principles
— Illustrative in the brief; realized by §4–§32 above.

### 38. OBSERVABILITY
🔧 **Fixed this pass.** Structured `[INTENT]`/`[TOOL_START]`/`[TOOL_END]`/
`[INTERRUPTION]`/`[CANCEL]` logs already existed, but 3 of them were logging
the user's **raw transcript text** to the server console
(`text="${clean}"`/`target="${clean}"`/`direction="${clean}"`) — a real privacy
issue given users speak phone numbers, names, and emails during consultation
intake. Replaced with length-only/topic-only logging; no verbatim user speech
reaches the server console anymore.

### 39. DEBUG PANEL
🔧 **Fixed this pass.** The telemetry inspector (topic/intent/generation/active
tool/latency) existed but was reachable in **production** too — anyone could
tap the toggle. Now gated behind `process.env.NODE_ENV !== "production"` in
`VoiceAgentPanel.tsx`, both the toggle button and the panel itself.

### 40. TEST MATRIX
❌ No automated tests exist for these scenarios. Meaningfully exercising
interruption/backchannel/race-condition behavior requires a live LiveKit room
with real microphone audio — not something that can be faithfully simulated or
run inside this coding session. Flagging as a genuine gap rather than claiming
coverage that doesn't exist.

### 41. SUCCESS CRITERIA
— Judgment call based on §4–§40; see summary below.

### 42–43. Inspect-first / implement-don't-just-explain
✅ Full read-through of every listed file happened before any edit this pass
(agent.ts, conversationController.ts, useVoiceSession.ts, VoiceAgentPanel.tsx,
AssistantWidget.tsx, prompt.ts, rag.ts, tools.ts, didService.ts) — real edits
were made, typechecked, and built (see below), not pseudocode.

### 44. Final principle + the two extra asks
✅ **Auto-disconnect grace period** — already 10s in both places (backend
`DISCONNECT_GRACE_PERIOD_MS`, frontend `end_session` handler's `setTimeout`),
not 5s. Verified, not changed.
🔧 **Model** — was `gemini-2.5-flash-native-audio-preview-12-2025`, changed to
`gemini-3.1-flash-live-preview` (verified as the real, current model ID via a
live web search against Google's own docs — see sources below — not guessed).
⚠️ **"No action should take >10ms to navigate"** — our own code adds no
artificial delay anywhere between intent and firing the action (no sleeps, no
blocking waits) — that part is effectively instant. But the full round trip
necessarily includes a real WebRTC data-channel transmission plus a browser
route change, and no amount of application code can bound real network + paint
time to under 10ms — that part isn't something I can honestly claim as
"guaranteed," only that nothing *we control* adds delay.
✅ **No hardcoded prompts** — verified `prompt.ts` is the single source of
truth for both voice and text-chat instructions; no ad-hoc prompt strings
scattered elsewhere.
✅ **File structure maintained** — every change was an in-place edit to an
existing file; nothing renamed or moved.
✅ **Security check** — no hardcoded API keys/secrets found anywhere in
`backend/src` or `frontend/src`; the PII-in-logs issue (§38) was the one real
finding, now fixed.

---

## Sources for the model ID
- https://ai.google.dev/gemini-api/docs/models/gemini-3.1-flash-live-preview
- https://docs.livekit.io/agents/models/realtime/plugins/gemini/
- https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-1-flash-live/

## What changed in this pass
1. `backend/src/voice-agent/agent.ts` — model → `gemini-3.1-flash-live-preview`;
   added `cancel_consultation` tool + `consultation_cancelled` action type.
2. `backend/src/ai/conversationController.ts` — removed raw user-text from 3
   `console.log` calls (security fix).
3. `backend/src/ai/prompt.ts` — added rule 10 for consultation cancellation.
4. `frontend/src/hooks/useVoiceSession.ts` — added `consultation_cancelled` to
   the action type union.
5. `frontend/src/components/layout/AssistantWidget.tsx` — handle
   `consultation_cancelled` by clearing the live form.
6. `frontend/src/lib/analytics.ts` — added `consultation_cancelled` event type.
7. `frontend/src/components/layout/VoiceAgentPanel.tsx` — gated the debug
   telemetry panel (and its toggle button) behind dev-only.

Backend (`tsc`, `npm run build`) and frontend (`tsc`, `npm run build`) both
verified clean after every change above.
