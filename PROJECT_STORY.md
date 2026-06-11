# Project Story — Aura

**Project Name:** Aura

**Headline:** A voice and vision AI companion that sees the world for people who can't.

---

## Inspiration

Over 2.2 billion people worldwide live with a vision impairment, yet most AI assistants are designed for sighted users — requiring them to read screens, tap menus, and navigate visual interfaces. We asked ourselves: what would an AI companion look like if it were built from the ground up for blind and severely visually impaired users?

The answer is Aura. Inspired by the idea that technology should remove barriers rather than create them, Aura gives users a hands-free, eyes-free way to understand the world around them — through natural conversation, live camera vision, and a personalized memory that grows with them over time.

---

## What it does

Aura is a mobile Progressive Web App (PWA) that works like a knowledgeable companion always by your side:

- **Talks and listens in real time** — using Google Gemini Live API's bidirectional audio streaming, Aura holds natural, low-latency voice conversations.
- **Sees through your camera** — Aura streams live video frames to Gemini's multimodal understanding, letting it identify objects, read labels and medicines, describe environments, and locate misplaced items.
- **Remembers what matters to you** — a personal memory system lets users store and retrieve context (their medication routine, where they keep their keys, their home layout) that Aura weaves into every response. Blind users can add or update memory items entirely by voice — no screen interaction required.
- **Deploys specialized sub-agents** — a Manager Agent (Aura) orchestrates a team of purpose-built sub-agents: a Find Items agent, a Medication Helper that cross-references pill codes, and a Home Assistant that understands appliances and room layouts.
- **Searches the internet for up-to-date information** — when enabled, Aura uses Google Search grounding to answer questions about current events, opening hours, transport schedules, and live information beyond its training data.
- **Speaks your language** — Aura responds in the user's language automatically, supporting multilingual conversations without any configuration.
- **Works on any phone, no install required** — delivered as a PWA, Aura runs in the browser with offline-ready service workers and is accessible from any mobile device.

### Common Use Cases

| Scenario | How Aura helps |
|----------|---------------|
| **Fridge inventory** | Point the camera at the fridge and ask "What food do I have?" — Aura identifies items and suggests what can be cooked. |
| **Food label reading** | Hold up a food package and ask Aura to read the ingredient list. If the user has allergies stored in Personal Memory, Aura flags any matching ingredients automatically. |
| **Finding misplaced items** | "Aura, help me find my keys" — the Find Items sub-agent uses live camera vision and memory of usual storage spots to guide the user. |
| **Leave-home checklist** | "Aura, run my leave-home checklist" — Aura reads out the user's saved checklist (e.g. phone, wallet, keys, medication) item by item. |
| **Environment description** | "Describe what's around me" — Aura narrates the surrounding environment, identifying furniture, signage, people, and obstacles. |
| **Personal health check** | For female blind users, Aura can help identify visual cues such as checking toilet paper for signs of menstruation — a private, dignified task that is otherwise difficult without sight. |

These are just a starting point. With a live camera, real-time voice conversation, personal memory, environment understanding, and a team of specialized sub-agents working together, users will naturally discover their own use cases — ones we haven't imagined yet. That open-ended capability is central to Aura's design.

---

## How we plan to build it

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Tailwind CSS, Vite, PWA (Workbox) |
| Realtime transport | WebSocket (custom protocol) with heartbeat health monitoring and auto-reconnect |
| AI backbone | Google Gemini Live API (gemini-3.1-flash-live-preview) with Google Search grounding |
| Multi-agent orchestration | Custom Manager Agent + Subagents via System instructions |
| Backend | Node.js + Express, deployed on Google Cloud Run |
| Persistence | Firestore (named database "aura") — conversations, memories, agent configs |
| Hosting | Firebase Hosting (aurasense3.web.app) |
| CI/CD | GitHub Actions — auto-deploy on git push to master |
| Observability | Arize (OpenTelemetry) — WebSocket session and Gemini connect tracing |

The architecture separates concerns cleanly: the frontend handles UI, audio capture, and camera streaming; the Cloud Run backend acts as a secure proxy between the browser and the Gemini Live API, verifying Firebase ID tokens and managing session lifecycle.

---
## Constrain

- **Video sampling rate and motion safety** — the camera pipeline is capped at 1 fps. This makes Aura unsuitable for dynamic scenarios like walking or moving through traffic, where the scene can change significantly between frames. Combined with cloud round-trip latency, a delayed or stale visual response could give the user false confidence in a hazardous situation. We address this by having Aura explicitly warn users to stop moving before acting on any visual guidance, and by positioning the app as a stationary-use assistant rather than a real-time navigation aid.

---
## Challenges we expect to run into


- **Battery drain from continuous camera use** — keeping the camera active and continuously uploading video frames consumes significant power. For users who rely on Aura throughout the day, rapid battery drain is a real usability concern, especially since many visually impaired users may not easily notice a low battery warning.

---

## Accomplishments that we're aiming for

- A working, deployable PWA that a blind user can pick up and use independently or with limited assistance
- Auto-connects on launch and greets the user immediately — zero button presses required
- Real internet search grounding via Google Search, so Aura can answer questions about current events, opening hours, and live information
- A persistent, growing personal memory that makes every conversation more useful than the last
- A multi-agent architecture where Aura seamlessly hands off tasks to the right specialist (Medication Helper, Find Items, Home Assistant) without the user needing to know which agent is active
- Reliable connection on mobile networks, staying live through background tabs and flaky Wi-Fi, with automatic reconnection
- Production-grade observability via Arize — every session is traced end-to-end

---

## What we hope to learn

- How far multimodal real-time AI has come — and where it still falls short for accessibility use cases
- The practical limits of Gemini Live API in production: latency, reliability, and cost at scale
- How to design voice-first UX that is genuinely usable without any visual feedback
- What personal memory patterns matter most to visually impaired users — what they want Aura to remember, and what feels intrusive
- Whether a PWA can realistically replace a native app for a real-time audio/video AI companion on mobile

---

## What's next

- **Expanded sub-agent library** — add specialist agents for hospital navigation, public transport, grocery shopping, and reading printed documents
- **Optimised video upload strategy** — reduce battery drain by sending frames only when the scene changes meaningfully, pausing uploads during audio-only conversations, and giving users control over camera-on/off to extend session life
- **On-device processing** — as edge AI models improve, move lightweight tasks (object detection, OCR) to the device to reduce latency and cost
