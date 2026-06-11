# Aura Sense4 — Deployment Architecture

## Overview

Aura Sense4 uses a split deployment model:
- **Frontend (PWA)** → Firebase Hosting
- **Backend (Node.js + WebSocket)** → Google Cloud Run

Both services run under the Google Cloud project **`gen-lang-client-0775423738`** (display name: *aura*).

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│  User's Mobile Browser                                           │
│  https://aurasense3.web.app                                      │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │  HTTPS / WSS
                 │
       ┌─────────▼──────────────────────────────────────────────┐
       │     Firebase Hosting (project: aurasense3)              │
       │  • Serves static PWA files (HTML/JS/CSS)               │
       │  • CDN-cached globally                                  │
       │  • URL: https://aurasense3.web.app                      │
       └─────────────────────────────────────────────────────────┘
                 │
                 │ Firebase Auth SDK (signInWithPopup)
                 ▼
       ┌─────────────────────────────────────────────────────────┐
       │         Firebase Authentication                         │
       │  Project: gen-lang-client-0775423738                    │
       │  Providers: Google Sign-in, Email/Password              │
       │  → Issues Firebase ID Token (JWT) to browser           │
       └─────────────────────────────────────────────────────────┘
                 │
                 │ WebSocket (wss://) + Bearer Token
                 ▼
       ┌─────────────────────────────────────────────────────────┐
       │         Google Cloud Run — aura-backend                 │
       │  Project:  gen-lang-client-0775423738                   │
       │  Region:   asia-southeast1                              │
       │  URL:      https://aura-backend-430124522662            │
       │            .asia-southeast1.run.app                     │
       │                                                         │
       │  ┌──────────────────────────────────────────────────┐  │
       │  │  Node.js + Express + ws (WebSocket)              │  │
       │  │                                                  │  │
       │  │  1. Verify Firebase ID Token (Admin SDK)         │  │
       │  │  2. Open Gemini Live API session                 │  │
       │  │  3. Proxy audio/video/text ↔ Gemini             │  │
       │  └──────────────────────────────────────────────────┘  │
       └──────────────┬──────────────────────────────────────────┘
                      │
                      │ HTTPS (Gemini Live API v1alpha)
                      ▼
       ┌─────────────────────────────────────────────────────────┐
       │         Google Gemini Live API                          │
       │  Model:  gemini-3.1-flash-live-preview                  │
       │  API:    v1alpha                                        │
       │  Input:  PCM16 audio @ 16kHz + video frames             │
       │  Output: PCM16 audio @ 24kHz + input transcripts       │
       │  VAD:    START_SENSITIVITY_HIGH / END_SENSITIVITY_LOW   │
       └─────────────────────────────────────────────────────────┘
```

---

## Component Details

### Frontend — Firebase Hosting

| Property | Value |
|----------|-------|
| Hosting URL | https://aurasense3.web.app |
| Firebase Hosting Project | aurasense3 (separate from GCP project) |
| GCP / Auth / Firestore Project | gen-lang-client-0775423738 |
| Build tool | Vite + React 18 + TypeScript |
| Build output | `frontend/dist/` |
| Deploy via | GitHub Actions CI/CD (git push to master) or manually via Google Cloud Shell |
| Google Sign-in | `signInWithPopup` with `Cross-Origin-Opener-Policy: same-origin-allow-popups` header |

**Key environment variables (build-time, `frontend/.env.production`):**

```env
VITE_FIREBASE_API_KEY=AIzaSyD3HQ23eEQD5dqV0BRmx6DKQUphZ57T1f8
VITE_FIREBASE_AUTH_DOMAIN=gen-lang-client-0775423738.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=gen-lang-client-0775423738
VITE_FIREBASE_STORAGE_BUCKET=gen-lang-client-0775423738.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=430124522662
VITE_FIREBASE_APP_ID=1:430124522662:web:b7d7cbf749d96f5d0e6867
VITE_API_URL=https://aura-backend-430124522662.asia-southeast1.run.app
```

**Local dev override (`frontend/.env.local`, not committed):**

```env
VITE_API_URL=http://localhost:3001
```

---

### Backend — Google Cloud Run

| Property | Value |
|----------|-------|
| Service name | `aura-backend` |
| GCP Project | gen-lang-client-0775423738 |
| Region | asia-southeast1 |
| Primary URL | https://aura-backend-430124522662.asia-southeast1.run.app |
| Latest revision | aura-backend-00015-7mr |
| Container image | Artifact Registry → `cloud-run-source-deploy/aura-backend` |
| Port | 8080 |
| Authentication | `--allow-unauthenticated` (Cloud Run layer open; Firebase token validated by backend code) |

**Runtime environment variables (set in Cloud Run):**

```env
NODE_ENV=production
FIREBASE_PROJECT_ID=gen-lang-client-0775423738
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@gen-lang-client-0775423738.iam.gserviceaccount.com
GEMINI_API_KEY=<AIzaSy... key from Google AI Studio (39 chars)>
FRONTEND_URL=https://aurasense3.web.app
FIREBASE_PRIVATE_KEY=<from Secret Manager: firebase-private-key>
ARIZE_API_KEY=<JWT token from Arize dashboard>
ARIZE_SPACE_ID=<space ID from Arize dashboard>
```

---

### Gemini Live API Configuration

```typescript
model: 'gemini-3.1-flash-live-preview'
httpOptions: { apiVersion: 'v1alpha' }

config: {
  responseModalities: [Modality.AUDIO],          // AUDIO only — TEXT not supported by this model
  inputAudioTranscription: {},                    // Enables user speech → text transcript
  realtimeInputConfig: {
    automaticActivityDetection: {
      startOfSpeechSensitivity: StartSensitivity.START_SENSITIVITY_HIGH,
      endOfSpeechSensitivity:   EndSensitivity.END_SENSITIVITY_LOW,
    },
  },
}
```

**Important notes:**
- API version must be `v1alpha` — `v1beta` returns 1008 "not found"
- `responseModalities` must be `[Modality.AUDIO]` only — combined AUDIO+TEXT returns 1007 error
- GEMINI_API_KEY must be from [Google AI Studio](https://aistudio.google.com) (starts with `AIzaSy`, 39 chars) — NOT a Vertex AI key

---

### Secret Management

Firebase private key is stored in **Google Cloud Secret Manager** (not in env vars directly):

```
Secret name: firebase-private-key
Project:     gen-lang-client-0775423738
Accessed by: 430124522662-compute@developer.gserviceaccount.com
             (roles/secretmanager.secretAccessor)
```

---

## Deployment Flow

### Automatic (CI/CD) — Recommended

Every `git push` to `master` automatically deploys both services via GitHub Actions (`.github/workflows/deploy.yml`):

```
git push origin master
  └─ GitHub Actions triggered
       ├─ Frontend job → npm ci → npm run build → firebase deploy (aurasense3)
       └─ Backend job  → gcloud run deploy --source backend (asia-southeast1)
```

**GitHub Secrets required:**

| Secret | Purpose |
|--------|---------|
| `FIREBASE_SERVICE_ACCOUNT_AURASENSE3` | Firebase Hosting deployment |
| `GCP_SA_KEY` | Cloud Run deployment (service account JSON) |
| `VITE_FIREBASE_API_KEY` … `VITE_API_URL` | Frontend build-time env vars (7 secrets) |
| `ARIZE_API_KEY` | Arize observability (injected via `--update-env-vars`) |
| `ARIZE_SPACE_ID` | Arize observability (injected via `--update-env-vars`) |

---

### Manual Deploy Backend (fallback)

```bash
# From Cloud Shell
gcloud run deploy aura-backend \
  --source backend \
  --region asia-southeast1 \
  --project gen-lang-client-0775423738 \
  --allow-unauthenticated
```

Cloud Build automatically:
1. Runs `npm ci` and `tsc` (TypeScript compile)
2. Builds container image and pushes to Artifact Registry
3. Deploys new Cloud Run revision

### Manual Deploy Frontend (fallback)

> **Note:** Use Google Cloud Shell — corporate Zscaler proxy blocks local Firebase CLI auth.

```bash
# 1. Local machine (Windows) — build fresh dist
cd c:\myProject\aura\aura-sense4\frontend
npm run build

# 2. Upload frontend/dist folder to Cloud Shell via Cloud Shell UI (Upload button)
#    Files land at ~/dist

# 3. Cloud Shell — replace old dist and deploy
rm -rf ~/aura-deploy/dist
mv ~/dist ~/aura-deploy/dist

firebase use aurasense3          # IMPORTANT: switch to the hosting project
cd ~/aura-deploy
firebase deploy --only hosting
```

The `firebase.json` in `~/aura-deploy` must NOT contain a `"site"` field — the project switch via `firebase use aurasense3` handles targeting.

---

## WebSocket Connection Flow

```
Browser                    Cloud Run Backend           Gemini Live API
   │                             │                           │
   │──── WSS connect + token ───►│                           │
   │                             │── verify Firebase token   │
   │                             │── ai.live.connect() ─────►│
   │◄─── { type: 'connected' } ──│◄── onopen ────────────────│
   │  (mic + heartbeat start)    │                           │
   │──── { type: 'audio', ... } ►│── sendRealtimeInput ─────►│  (VAD detects speech)
   │◄─── { type: 'audio', ... } ─│◄── onmessage ─────────────│
   │◄─── { type: 'transcript' } ─│◄── inputTranscription ────│  (user speech → text)
   │                             │                           │
   │◄─── { type: 'heartbeat' } ──│  (every 30s)              │  (connection health)
   │  frontend checks every 15s  │                           │
   │  reconnects if >75s silent  │                           │
   │                             │                           │
   │──── { type: 'disconnect' } ►│── session.close() ───────►│
```

**Connection health (heartbeat):**
- Backend sends `{ type: 'heartbeat' }` every 30 seconds after Gemini connects
- Frontend checks every 15 seconds; if no heartbeat for >75 seconds, shows "Connection lost. Reconnecting…" and auto-reconnects
- Auto-reconnect uses exponential backoff: 1s, 2s, 4s … up to 30s, max 8 attempts

---

## Infrastructure Summary

```
Google Cloud Project: gen-lang-client-0775423738
├── Cloud Run
│   └── aura-backend (asia-southeast1) — revision aura-backend-00015-7mr
├── Artifact Registry
│   └── cloud-run-source-deploy/aura-backend
├── Secret Manager
│   └── firebase-private-key
├── Firestore
│   └── Database ID: "aura" (region: asia-southeast1)
│       Collections: agent_configs, trigger_configs, conversations, memories
└── Firebase (linked)
    └── Authentication (Google signInWithPopup + Email/Password)

Firebase Hosting Project: aurasense3
└── Hosting → https://aurasense3.web.app
    └── firebase.json: public=frontend/dist, SPA rewrite, COOP header
```

---

## Observability — Arize

The backend emits OpenTelemetry traces to Arize cloud (`https://otlp.arize.com/v1/traces`).

**Spans captured:**

| Span | Attributes |
|------|-----------|
| `aura.websocket.session` | `user.id`, connect/disconnect events, errors |
| `aura.gemini.connect` | `gemini.model`, `gemini.voice`, `gemini.internet_search`, `gemini.sub_agents_count`, `gemini.search_grounding` |

Tracing is non-blocking — if `ARIZE_API_KEY` / `ARIZE_SPACE_ID` are unset or Arize is unreachable, the backend runs normally and spans are silently dropped.

**Dashboard:** https://app.arize.com (Space: `guchao1000`)

---

## Firebase Project Files

| File | Location | Content |
|------|----------|---------|
| `.firebaserc` | Cloud Shell `~/aura-deploy/` | `{ "projects": { "default": "gen-lang-client-0775423738" } }` — run `firebase use aurasense3` before deploying hosting |
| `firebase.json` | Cloud Shell `~/aura-deploy/` | `public: frontend/dist`, SPA rewrite, `sw.js` no-cache header, `Cross-Origin-Opener-Policy: same-origin-allow-popups` for Google Sign-in popup |
| `firebase.json` | Local `c:\myProject\aura\aura-sense4\` | Same as above — keep in sync with Cloud Shell copy |
