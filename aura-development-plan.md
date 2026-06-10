# Aura Development Plan

## Overview

This document outlines the phased development plan for the **Aura Personalized Visual Assistant** — a PWA mobile app for blind and visually impaired users. Development is broken into 12 phases, each building on the previous, following the MVP scope defined in the PRD.

**Tech Stack:** React + Tailwind CSS (Frontend) · TypeScript/Node.js (Backend) · Google Gemini Live API · Google ADK · Firebase Authentication · WebSocket

---

## Phase 1: Project Foundation & Environment Setup

**Goal:** Establish the project skeleton, tooling, and environment configuration.

### Tasks
- Initialize monorepo structure (frontend + backend)
- Configure TypeScript for both frontend and backend
- Set up React + Tailwind CSS + Vite (or CRA) for PWA
- Configure PWA manifest (`manifest.json`, service worker)
- Set up `.env` file structure — all API keys and credentials via environment variables (no hardcoding)
- Configure ESLint + Prettier for code quality
- Set up unit test framework (Jest / Vitest)
- Set up Git repository and branching strategy
- Configure deployment pipeline (Google Agent Platform, Singapore region)

### Deliverables
- Runnable "Hello World" PWA on mobile browser
- `.env.example` with all required variables documented
- CI/CD pipeline skeleton

---

## Phase 2: Authentication — Firebase

**Goal:** Implement secure user authentication.

### Tasks
- Integrate Firebase Authentication SDK
- Implement Google Sign-in flow
- Implement username + password sign-in / registration
- Implement sign-out
- Implement auth state persistence (stay logged in after refresh)
- Create protected route wrapper for authenticated pages
- Store `userId` for use in all subsequent data models
- Write unit tests for auth flows

### Deliverables
- Working login/register/logout screens
- Auth state available globally (React context or state manager)
- All auth flows tested

---

## Phase 3: Core UI Foundation — Dark Theme & Breathing Design

**Goal:** Build the visual framework all future screens will use.

### Tasks
- Implement global dark theme with Tailwind CSS custom palette
- Design and implement the **"breathing" animation concept**:
  - Pulsing glow effect on the main voice button (idle / listening / processing states)
  - Subtle animated background ambient light
- Mobile-first vertical layout (9:16), safe area insets handled
- Build core UI components:
  - `BreathingButton` — primary voice action button
  - `StatusIndicator` — connection status chip
  - `MessageBubble` — conversation message display
  - `BottomNavBar` — navigation between main sections
  - `TopBar` — screen title + settings access
- Implement screen navigation/routing (React Router)
- Implement basic accessibility attributes (`aria-label`, `role`) on all interactive elements
- UI language set to English throughout
- Write component-level tests

### Screens to scaffold (empty shells)
| Screen | Description |
|---|---|
| Home / Chat | Main voice interaction screen |
| Memory | Personal Memory list and management |
| History | Conversation history list |
| Settings | General configuration |
| Agent Config | Agent management |

### Deliverables
- Full dark-theme UI shell with breathing animation
- Navigable screen structure
- Reusable component library established

---

## Phase 4: Gemini Live API — Voice & Text Interaction

**Goal:** Connect to Gemini Live API for real-time voice and text conversation.

### Tasks
- Implement WebSocket client (backend proxy to Gemini Live API)
- Implement backend session management (create/close Live API sessions)
- Implement microphone access and audio streaming from browser
- Implement real-time voice input → Gemini Live API → voice output
- Implement text input as fallback (for users who prefer or need it)
- Implement multi-turn conversation loop
- Implement connection state machine:

```
DISCONNECTED → CONNECTING → CONNECTED → LISTENING → PROCESSING → RESPONDING
```

- Voice announcements for connection state changes:
  - "Connecting..."
  - "Connected."
  - "Connection lost. Trying to reconnect."
  - "Reconnected successfully."
  - "Unable to connect. Please try again later."
- Implement **auto-reconnect** logic with exponential backoff
- Avoid repeated voice announcements during reconnect loops
- Display conversation on screen (togglable via settings)
- Write integration tests for WebSocket session lifecycle

### Deliverables
- User can have a real-time voice conversation with Gemini
- Connection state announced via voice
- Auto-reconnect working
- Text conversation also functional

---

## Phase 5: Gemini Live API — Video & Visual Analysis

**Goal:** Add camera input and video frame analysis capability.

### Tasks
- Implement camera access (rear camera preferred, front camera fallback)
- Implement video frame capture at **1 FPS** (configurable sampling rate)
- Implement video frame upload to Gemini Live API
- Implement manual snapshot trigger (user taps button to capture)
- Distinguish between:
  - Real-time Live conversation (ongoing voice/video stream)
  - Manual snapshot analysis (single frame on demand)
- Implement `VideoUploadConfig` data model:
  - `mode`: manual / auto
  - `samplingRate`: default 1 FPS
- Save user video upload preference to backend
- Enforce **safe language** for all visual analysis responses:
  - Never state visual observations as absolute fact
  - Always express uncertainty (e.g., "I can see what looks like...")
  - For high-risk scenes (steps, vehicles, crossings): prompt user to stop and use white cane
- Write tests for frame sampling logic

### Deliverables
- Camera input integrated into conversation flow
- 1 FPS auto-sampling working when enabled
- Manual snapshot on demand working
- Safe language enforced in visual responses

---

## Phase 6: Personal Memory — Data Layer & CRUD ✅

**Goal:** Build the Personal Memory system — the core personalization engine.

### Tasks
- Design and implement `PersonalMemory` data model:
  - `id`, `userId`, `name`, `description`, `memoryType`, `key`, `value`
  - `assignedAgentIds`, `createdAt`, `updatedAt`, `lastUsedAt`
- Implement backend CRUD API endpoints for memory:
  - `POST /memories` — create
  - `GET /memories` — list (filter by type, agent)
  - `PUT /memories/:id` — update
  - `DELETE /memories/:id` — delete
- Support 7 memory types:
  - `ItemLocation` — common item storage locations
  - `LastSeen` — last confirmed visual location of an item
  - `HouseholdLabel` — custom labels for household objects
  - `Medication` — medication info
  - `UserPreference` — language, speech speed, response style
  - `Place` — home zones, frequent locations
  - `SafetyNote` — user-defined safety reminders
- Implement Memory UI screen (list, add, edit, delete)
- Implement memory assignment to specific agents
- Write unit + integration tests for all CRUD operations

### Deliverables
- Full Memory CRUD via UI ✅
- All 7 memory types supported ✅ (data model)
- Memory persisted per user in browser (`localStorage`) ✅

### Implementation Notes
- **Backend API** (`backend/src/routes/memories.ts`): Full CRUD built and tested, ready for Cloud Run deployment
- **Frontend persistence**: Uses `localStorage` via `src/services/localMemoryStorage.ts` — works on all devices without backend dependency
- **Config Panel**: Redesigned for mobile portrait (9:16), iOS safe area insets, 44px touch targets
- **Voice announcer**: Fixed repeated "Aura is ready" on every turn-complete — now deduplicates consecutive identical status announcements
- **To upgrade to cloud persistence**: Deploy backend to Cloud Run, update Firestore security rules, switch `HomePage.tsx` to use `src/services/firestoreMemory.ts`

---

## Phase 7: Voice Memory — Add & Query Memory by Voice

**Goal:** Allow users to manage Personal Memory entirely through voice.

### Tasks
- Implement voice intent detection for memory operations within Aura Manager Agent:
  - "Remember that my keys are in the basket by the door." → create `ItemLocation` memory
  - "Where are my keys?" → query `ItemLocation` memory
  - "Update — my keys are now in the drawer." → update memory
  - "Forget where my keys are." → delete memory
- Implement confirmation voice response after saving:
  - "Got it. I will remember that your keys are usually kept in the basket near the entrance."
- Implement **LastSeen** memory flow:
  - After visual analysis identifies an item, offer: "Would you like me to save this as its last seen location?"
  - Capture: `itemName`, `locationDescription`, `timestamp`, `confidence`, `source`, `userConfirmed`
- Implement **stale memory warning**:
  - If memory > 7 days old: "This location hasn't been confirmed in over 7 days. Would you like me to scan nearby?"
- Distinguish saved memory from real-time fact in all responses (safety principle)
- Write tests for voice intent → memory action pipeline

### Deliverables
- Full voice-driven memory management working end-to-end
- LastSeen recording flow working
- Stale memory detection and warning working

---

## Phase 8: Multi-Agent Architecture — Manager Agent (Aura)

**Goal:** Build the Aura Manager Agent using Google ADK as the Orchestrator.

### Tasks
- Set up Google ADK project and agent configuration
- Implement **Aura Manager Agent**:
  - System instruction defining its role as general visual assistant + orchestrator
  - Intent classification: identify which subagent (if any) should handle the request
  - Task decomposition: break user request into sub-tasks
  - Inject relevant Personal Memory as context into subagent calls
  - Aggregate subagent results and return coherent response to user
  - Handle fallback: respond directly if no subagent is needed
- Implement `AgentConfig` data model:
  - `id`, `userId`, `agentType`, `name`, `description`, `systemInstruction`
  - `personalMemoryIds`, `visualFocusDetective`, `voiceModel`, `voiceTone`, `phraseStyle`
  - `enabledTools`, `createdAt`, `updatedAt`
- Wire Manager Agent into the Gemini Live API conversation session
- Implement **safe expression enforcement** in Manager Agent system instruction:
  - Conservative language for uncertainty
  - Hard stop + white cane reminder for high-risk scenarios
- Write integration tests for intent routing

### Deliverables
- Aura Manager Agent live and handling conversations
- Intent routing logic working
- Personal Memory injected into agent context
- Safe language enforced at agent level

---

## Phase 9: Specialized Subagents — Find Items Agent (MVP)

**Goal:** Build the first specialized subagent required for MVP.

### Tasks
- Implement **Find Items Subagent** using Google ADK:
  - System instruction focused on item-finding assistance
  - Accepts: item name, relevant memories (usual location, last seen location)
  - Uses visual analysis (video frame) to scan environment
  - Returns structured result to Manager Agent
- Implement Manager Agent → Find Items Subagent routing when intent is item-finding
- Full flow example:
  1. User: "Where are my keys?"
  2. Manager Agent detects Find Items intent
  3. Queries `ItemLocation` and `LastSeen` memories for "keys"
  4. Calls Find Items Subagent with memory context
  5. Subagent guides user to scan with camera
  6. Returns: "I can see a basket near the entrance, but I cannot confirm the keys are inside. Please move closer."
- Implement **Household Label** recognition:
  - If user previously labeled an object, use that label in responses
  - "This looks like the laundry detergent you previously registered — please confirm."
- Scaffold remaining subagents (stub only, for future phases):
  - `MedicationAgent`, `ShoppingAgent`, `HospitalSupportAgent`, `MobilityAgent`, `HomeAssistantAgent`
- Allow user to create custom subagents via Agent Config UI
- Write tests for subagent routing and response structure

### Deliverables
- Find Items Subagent fully working end-to-end
- Household Label recognition working
- Remaining subagents stubbed and ready for future phases
- Custom subagent creation working

---

## Phase 10: Conversation History — Persistence & Review

**Goal:** Persist all conversations and allow users to review them.

### Tasks
- Implement `Conversation` data model:
  - `id`, `userId`, `agentId`, `subagentId`, `title`, `messages`, `createdAt`, `updatedAt`
- Implement `ConversationMessage` data model:
  - `id`, `conversationId`, `role`, `content`, `language`, `modality`
  - `relatedMemoryIds`, `timestamp`
- Implement `ConnectionEvent` data model:
  - `id`, `conversationId`, `status`, `message`, `timestamp`
- Implement backend API:
  - Save all messages in real-time during conversation
  - `GET /conversations` — list conversations
  - `GET /conversations/:id` — full conversation with messages
  - `DELETE /conversations/:id` — delete single
  - `DELETE /conversations` — clear all
  - `GET /conversations/search?q=` — search conversations
- Implement Conversation History UI screen:
  - List view with date, title, agent used
  - Detail view showing full message thread
  - Show which memories were used in each conversation
  - Search bar
  - Delete / clear all options
- Write tests for persistence and retrieval

### Deliverables
- All conversations auto-saved
- History screen fully functional
- Search, delete, clear all working
- Memory usage visible per conversation

---

## Phase 11: Configuration — Agent & General Settings

**Goal:** Allow users to configure Aura and their subagents, plus general app preferences.

### Tasks

**Agent Configuration:**
- Implement Agent Config UI:
  - Edit name, description, specialization
  - Edit system instruction
  - Assign Personal Memories to agent
  - Select voice model: Zephyr / Kore / Puck / Charon / Fenrir
  - Select voice tone & phrase style:
    - Brief and direct
    - Gentle and reassuring
    - Detailed explanation
    - High safety priority
    - Bilingual (Chinese + English)
    - Chinese only / English only
  - Toggle enabled tools
  - Enable/disable Visual Focus Detective
- Create / edit / delete custom subagents

**General Configuration:**
- Implement General Settings screen:
  - Location: country, city, home zone
  - Preferred language
  - Display conversation on screen: on/off
  - Voice output: on/off
  - Vibration feedback: on/off
  - Internet search permission: on/off
  - Timezone
- Implement `GeneralConfig` persistence per user
- Implement Video Upload Config:
  - Mode: manual / auto
  - Sampling rate (default 1 FPS)

**Internet Search:**
- Integrate search tool into relevant agents (when user permits)
- Mark search results with uncertainty indicator
- Apply strict safe-expression rules for medical/legal/financial results

- Write tests for all config CRUD operations

### Deliverables
- Full agent configuration working
- General settings saving and applying
- Internet search togglable and labelled correctly

---

## Phase 12: Accessibility, Vibration Feedback & Final Polish

**Goal:** Complete accessibility features, vibration patterns, and production readiness.

### Tasks

**Vibration Feedback:**
- Implement 5 vibration patterns:
  - Short pulse — button confirmation
  - Double short pulse — recognition complete
  - Long pulse — connection failure / attention needed
  - Continuous light pulses — processing in progress
  - Strong alert — potential risk / user must stop and confirm
- Vibration used alongside voice only (never as replacement)
- Respect vibration on/off setting from General Config

**Accessibility:**
- Audit all screens with screen reader (NVDA / VoiceOver)
- Ensure all interactive elements have correct `aria-label`
- Ensure focus order is logical on all screens
- Verify app is fully usable with voice only (no screen required for core flows)
- Test with screen off / voice only mode

**Final Safety Audit:**
- Audit all agent responses for safe expression compliance
- Confirm no memory is ever presented as real-time fact
- Confirm high-risk scenario prompts are always triggered

**Performance & PWA:**
- Lighthouse PWA audit — target score 90+
- Optimize audio/video streaming latency
- Offline fallback page for no-connection state
- App icon, splash screen, installable PWA

**Testing & QA:**
- Full end-to-end test suite
- All lint rules passing
- All unit and integration tests passing
- Load test WebSocket connection handling

**Deployment:**
- Deploy to Google Agent Platform (Singapore region)
- Environment variables verified in production
- Smoke test all core flows on production

### Deliverables
- All vibration patterns working
- Full accessibility audit passed
- App installable as PWA
- Production deployment live and smoke-tested

---

## Phase Summary

| Phase | Focus | Key Deliverable |
|---|---|---|
| 1 | Foundation & Setup | Runnable PWA skeleton, CI/CD |
| 2 | Authentication | Firebase login / logout working |
| 3 | Core UI | Dark theme, breathing design, screen shells |
| 4 | Gemini Live — Voice & Text | Real-time voice conversation + auto-reconnect |
| 5 | Gemini Live — Video | Camera input, 1 FPS sampling, safe language |
| 6 | Personal Memory — Data | Full Memory CRUD via UI |
| 7 | Personal Memory — Voice | Voice-driven memory add/query/update/delete |
| 8 | Manager Agent (Aura) | ADK Orchestrator live, intent routing |
| 9 | Find Items Subagent | First specialized subagent end-to-end |
| 10 | Conversation History | All chats saved and reviewable |
| 11 | Configuration | Agent config + general settings |
| 12 | Accessibility & Polish | Vibration, a11y audit, PWA, production deploy |

---

## Development Principles (from PRD)

- All code and comments in **English**
- No hardcoded API keys, passwords, or credentials — use `.env` only
- Type hints / strict TypeScript on all code
- Lint + unit tests required after **every phase**
- Robust error handling on all API calls
- Safe expression rules enforced at every agent response point
- Mobile-first, dark theme, breathing UI concept throughout
