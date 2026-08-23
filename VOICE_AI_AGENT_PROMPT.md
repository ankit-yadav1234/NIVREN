# Voice AI Agent — Implementation Spec

> **Purpose of this file:** This document holds the full implementation prompt for adding a
> production-ready LiveKit-based voice + chat AI agent (with full-page understanding and
> UI control) to this project. It is **not yet implemented** — this is a saved spec.
>
> **How to use it:** When you (or any AI coding tool — Claude, another Claude session, etc.)
> are asked to build or modify this feature, read this file first for full context: goals,
> phased implementation order, architecture, security rules, and the final deliverable
> checklist. Paste/reference the prompt below as the instructions for that work.

---

## Implementation Prompt

Build a Production-Ready Full-Page AI Voice + Chat Agent

You are working inside my existing project. Do NOT unnecessarily rewrite, restructure, or replace the existing application. First inspect the entire codebase and understand the current architecture, framework, routes, components, state management, styling system, API layer, authentication, and build setup.

My goal is to add a production-quality AI assistant that can understand my entire webpage/application, explain what is currently visible, answer questions about the project, interact with the UI, and work through both voice and text chat.

The assistant should feel like an intelligent agent embedded inside the application, not just a basic chatbot.

### PHASE 0 — Inspect Before Changing Anything

First:

1. Inspect the complete repository structure.
2. Identify:
   - frontend framework
   - backend/server architecture
   - package manager
   - existing API routes
   - authentication
   - environment variable strategy
   - database/vector database if present
   - state management
   - UI component system
   - existing AI integrations
3. Find the application entry points.
4. Understand how pages/routes/components communicate.
5. Determine the safest integration architecture.

Do NOT start implementing before understanding the project.

After inspection, explain:

- current architecture
- recommended architecture for the AI agent
- files that need modification
- files that should be created
- dependencies required
- environment variables required

Then proceed with implementation.

### PHASE 1 — Google AI API Setup FIRST

Set up Google AI/Gemini as the initial LLM provider.
Use the current official Google AI SDK/API approach compatible with this project.

Requirements:

- Google API key must ONLY exist on the server.
- Never expose the API key to the browser.
- Create a clean server-side AI abstraction.
- Keep the LLM provider replaceable so LiveKit/OpenAI/other providers can be added later without rewriting the application.
- Use environment variables.
- Add `.env.example`.
- Never hardcode secrets.

Create a provider abstraction similar to:

```
AI Provider
→ Gemini implementation
→ future providers can plug in here
```

The AI layer should support:

- text generation
- streaming responses where appropriate
- structured/tool calls
- system instructions
- conversation history
- context injection
- RAG context
- tool execution

Use the best currently supported Gemini model for the use case after checking the current Google documentation/package compatibility.
Do not blindly install outdated packages.

### PHASE 2 — LiveKit Voice Agent

After Google AI setup is working, integrate LiveKit.

The architecture should support:

```
Browser
↓
LiveKit room
↓
Voice Agent
↓
LLM / Gemini
↓
Tools / MCP / RAG / Application state
↓
Browser UI
```

The voice agent must support:

- microphone input
- speech-to-text
- LLM reasoning
- text-to-speech
- interruption/barge-in
- natural conversational turn-taking
- streaming responses
- low latency
- reconnect handling
- mute/unmute
- microphone permission handling
- graceful failure states
- room connection state
- agent speaking/listening indicators

Use LiveKit's current recommended architecture and SDKs rather than deprecated APIs.
Keep LiveKit credentials server-side.
Do not expose LiveKit API secrets in frontend code.
Create a dedicated agent/service layer so the voice agent is not tightly coupled to UI components.

### PHASE 3 — FULL PAGE UNDERSTANDING

The assistant must understand the current application/page.

Build a context system that can provide the AI with:

**Page Context**

- current URL
- route
- page title
- visible sections
- headings
- buttons
- links
- forms
- inputs
- tables
- cards
- important UI elements
- currently selected item
- active tab
- modal/dialog state
- relevant application state

Do NOT blindly send the entire DOM on every request.
Create a smart page-context extraction system.
Prefer semantic application state and structured metadata over raw DOM whenever possible.

Create a mechanism such as: `PageContext` containing structured information about the current page.

Example conceptual structure:

```ts
{
  route,
  title,
  description,
  sections,
  interactiveElements,
  forms,
  selectedState,
  relevantData,
  permissions,
  userIntentContext
}
```

The implementation should be optimized to avoid huge token usage.

### PHASE 4 — AI → UI INTERACTION

The AI should not only answer questions. It should be able to interact with the application through safe tools.

Examples:

- navigate to a page
- open a menu
- open a modal
- click a supported button
- select an item
- switch tabs
- fill a form
- search application data
- filter a table
- highlight an element
- scroll to a section
- explain a component
- read relevant page information
- trigger supported application actions

DO NOT allow the LLM to execute arbitrary JavaScript.
Create a controlled tool/action registry.

For example:

```
navigate
open_modal
close_modal
click_element
select_option
fill_field
search
filter
highlight
scroll_to
get_page_context
get_component_details
```

Every action must have:

- strict schema
- validation
- permission/safety checks
- clear error handling
- confirmation when the action is destructive or consequential

For destructive actions such as delete, submit, send, purchase, publish, etc., require explicit user confirmation unless the application already has an appropriate trusted workflow.

### PHASE 5 — MCP ARCHITECTURE

Implement MCP-compatible tooling where it actually provides value. Do NOT add MCP just for marketing purposes.

Create a clean architecture where the AI can access:

1. Application tools
2. Documentation
3. Project knowledge
4. External integrations when needed

**Separate:**

**Read tools** — Safe operations such as:

- get page context
- search project
- search documentation
- retrieve records
- inspect application state

**Action tools** — Potentially mutating operations:

- create
- update
- delete
- submit
- publish
- send

Action tools must have stronger validation and confirmation.

If an MCP server is useful for the project, implement it according to the current MCP specification and SDK recommendations. Keep MCP tools modular so they can be added or removed without changing the core agent.

### PHASE 6 — RAG

Implement a proper RAG pipeline for project/application knowledge.

The assistant should be able to answer questions about:

- project documentation
- application features
- internal docs
- help content
- technical documentation
- product knowledge
- relevant database/application information

Pipeline:

```
Documents
↓
Parsing
↓
Chunking
↓
Metadata
↓
Embeddings
↓
Vector Store
↓
Semantic Search
↓
Reranking/filtering if useful
↓
Relevant Context
↓
Gemini
```

Do not send the entire knowledge base to the LLM.

Use metadata such as:

- source
- document
- route
- section
- category
- permissions
- updated_at

The RAG system should be replaceable. Create interfaces for:

```
EmbeddingProvider
VectorStore
Retriever
DocumentLoader
```

If the project already has a database/vector database, prefer integrating with it rather than introducing unnecessary infrastructure.

### PHASE 7 — TEXT CHAT

Add a chat interface alongside voice. The same underlying agent should power both:

```
Voice
  ↓
Shared Agent Core
  ↑
Chat
```

Do NOT create separate intelligence for voice and chat.

Chat should support:

- streaming responses
- conversation history
- markdown
- code blocks where appropriate
- tool/action results
- citations/source references for RAG answers
- loading state
- error state
- retry
- clear conversation
- interruption/cancellation if streaming

The assistant should understand the current page automatically.

Example:

> **User:** "Ye page kya karta hai?"
> **AI:** Explains the currently visible page based on PageContext + RAG.
>
> **User:** "Isme user kaise add karu?"
> **AI:** Explains the relevant UI and can guide/highlight it.
>
> **User:** "Add user button kholo."
> **AI:** Uses the controlled UI action tool.

### PHASE 8 — SHARED AGENT CORE

Create one central agent architecture. Conceptually:

```
                 ┌──────────────┐
                 │   Chat UI    │
                 └──────┬───────┘
                        │
                 ┌──────▼───────┐
                 │ Shared Agent │
                 │     Core     │
                 └──────┬───────┘
                        │
        ┌───────────────┼────────────────┐
        │               │                │
   Page Context        RAG           MCP/Tools
        │               │                │
        └───────────────┼────────────────┘
                        │
                    Gemini LLM
                        │
                 ┌──────▼───────┐
                 │ LiveKit Voice│
                 └──────────────┘
```

The shared agent should handle:

- system instructions
- conversation
- context
- tools
- RAG
- permissions
- action confirmation
- logging
- errors

### PHASE 9 — AGENT SYSTEM PROMPT

Create a dedicated system prompt for the application agent. The agent should behave like:

> "You are the intelligent assistant for this application. You understand the current page,
> application state, available tools, and project knowledge. Help the user understand and
> operate the application. Never invent UI elements, data, or capabilities. If you don't know
> something, say so. Prefer application tools and retrieved context over guessing."

Additional behavior:

- concise natural answers
- voice-friendly responses
- no unnecessary long explanations during voice interaction
- explain UI elements when asked
- reference actual visible elements
- ask clarification when needed
- never fabricate tool results
- never claim an action succeeded unless the tool confirms success
- confirm dangerous/destructive actions
- preserve user intent
- use RAG when project knowledge is required
- use page context for UI questions
- use tools when an actual application action is requested

For voice:

- speak naturally
- avoid excessive markdown-style formatting
- avoid reading long URLs
- give short actionable responses
- interrupt gracefully
- allow the user to change topic naturally

### PHASE 10 — UI/UX

Create a polished assistant UI.

**Floating Assistant** — A floating button available across the application. Clicking it opens:

- chat
- voice mode
- conversation history
- microphone controls

**Voice UI** — Show:

- connected/disconnected state
- listening
- thinking
- speaking
- muted
- microphone permission error
- reconnecting

Use a clean visual indicator for the agent's current state.

**Chat UI** — Include:

- messages
- streaming response
- tool activity
- sources/citations
- action confirmation
- input
- microphone button
- stop generation button

The UI should match the existing project's design system. Do NOT introduce an unrelated visual style.

### PHASE 11 — SECURITY

Treat security as a first-class requirement.

Never expose:

- Google API keys
- LiveKit API secrets
- MCP secrets
- database credentials
- private backend credentials

Implement:

- server-side secret management
- authentication checks
- authorization for tools
- tool input validation
- rate limiting where appropriate
- origin validation
- safe logging
- no secret leakage into client logs
- protection against prompt injection from retrieved documents
- protection against malicious page content
- confirmation for sensitive actions

Never allow arbitrary shell commands or arbitrary code execution through an LLM tool.

### PHASE 12 — PERFORMANCE

Optimize for low latency. Especially optimize voice.

Use:

- streaming
- incremental context
- minimal page context
- cached embeddings/retrieval where appropriate
- connection reuse
- efficient tool calls
- short voice responses
- cancellation/interruption

Do not repeatedly send the full page DOM or entire conversation when unnecessary.

### PHASE 13 — OBSERVABILITY

Add useful development/debug logging.

Track:

- agent request
- latency
- LLM response
- tool calls
- tool errors
- RAG retrieval
- LiveKit connection events

Never log:

- API keys
- access tokens
- passwords
- sensitive user data unnecessarily

Make logs easy to disable or reduce in production.

### PHASE 14 — ENVIRONMENT

Create/update `.env.example`. Clearly separate:

**Google**

```
GOOGLE_API_KEY=
```

**LiveKit**

```
LIVEKIT_URL=
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=
```

**RAG** — Use only the variables actually required by the selected vector database/embedding provider.

**Application** — Use the existing project's environment conventions. Do not invent unnecessary environment variables.

### PHASE 15 — IMPLEMENTATION ORDER

Follow this exact order:

1. Inspect existing project.
2. Confirm architecture.
3. Install/update required dependencies.
4. Set up Google Gemini API.
5. Create server-side AI provider abstraction.
6. Test a basic Gemini request.
7. Set up LiveKit.
8. Create LiveKit agent.
9. Connect voice → agent → Gemini.
10. Test microphone → STT → Gemini → TTS.
11. Create shared Agent Core.
12. Implement PageContext.
13. Implement safe UI tools.
14. Implement MCP architecture where appropriate.
15. Implement RAG.
16. Connect RAG to Agent Core.
17. Build chat UI.
18. Connect chat and voice to the same Agent Core.
19. Add security/permissions.
20. Add loading/error/reconnect states.
21. Add observability.
22. Test complete end-to-end flow.
23. Fix TypeScript/lint/build errors.
24. Document setup and development commands.

Do not jump directly to the final UI before the backend/agent architecture works.

### PHASE 16 — TESTING

Create tests for:

- Gemini provider
- agent core
- page context generation
- tool schemas
- tool authorization
- tool execution
- RAG retrieval
- chat streaming
- LiveKit connection
- error handling
- destructive-action confirmation

Also perform an end-to-end manual test:

```
Open application
↓
Open assistant
↓
Ask text question about page
↓
Receive correct answer
↓
Ask voice question
↓
Voice response
↓
Ask agent to locate/open UI element
↓
Agent performs safe action
↓
Ask project knowledge question
↓
RAG retrieves correct information
↓
Switch between voice and chat
↓
Conversation remains coherent
```

---

## IMPORTANT DEVELOPMENT RULES

1. Work with the existing codebase instead of rebuilding it.
2. Prefer small, maintainable modules.
3. Use TypeScript types strictly where the project supports TypeScript.
4. Do not use deprecated SDK APIs.
5. Before installing a package, verify that it is current and compatible.
6. Do not expose secrets to the frontend.
7. Do not create fake/mock functionality unless explicitly necessary for development.
8. If a feature cannot be implemented with the current architecture, explain why and propose the smallest safe change.
9. Keep providers replaceable.
10. Keep LiveKit, Gemini, MCP, RAG, and application tools loosely coupled.
11. Do not create unnecessary infrastructure.
12. Reuse existing project dependencies when possible.
13. Do not break existing application functionality.
14. Preserve existing styling and UX conventions.
15. After every major phase, run the relevant tests/build/type checks.
16. Fix errors instead of leaving TODOs.
17. Never claim something works without testing it.

---

## FINAL DELIVERABLE

At the end provide:

1. Architecture summary.
2. Files created.
3. Files modified.
4. Dependencies added.
5. Environment variables required.
6. How to start the Gemini/AI backend.
7. How to start the LiveKit agent.
8. How to start the frontend.
9. How voice works.
10. How chat works.
11. How PageContext works.
12. How MCP tools work.
13. How RAG works.
14. Security considerations.
15. Testing performed.
16. Any remaining limitations.

---

Most importantly: **First inspect the project. Then implement Google API/Gemini. Then LiveKit
voice. Then shared Agent Core. Then PageContext + tools. Then MCP/RAG. Then chat UI. Finally
integrate everything and test the complete system.**

Do not ask unnecessary questions if the repository already contains enough information to make
a reasonable implementation decision. Make sensible engineering decisions, document them, and
continue.
