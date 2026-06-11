// ─── Shared WebSocket message protocol (frontend ↔ backend) ─────────────────

export interface SubAgentConfig {
  name: string
  description: string
  systemInstruction: string
  linkedMemorySummary?: string
  internetSearchEnabled?: boolean
}

export interface SessionConfig {
  systemInstruction: string
  voiceModel: string
  voiceStyle: string
  internetSearchEnabled: boolean
  linkedMemorySummary?: string
  subAgents?: SubAgentConfig[]
}

// Client → Server
export type ClientMessage =
  | { type: 'connect'; config: SessionConfig }
  | { type: 'audio'; data: string }                        // base64 PCM16 @ 16kHz mono
  | { type: 'video_frame'; data: string; mimeType: string } // base64 JPEG/PNG
  | { type: 'text'; content: string }
  | { type: 'disconnect' }

// Server → Client
export type ServerMessage =
  | { type: 'connected' }
  | { type: 'disconnected' }
  | { type: 'audio'; data: string }                        // base64 PCM16 @ 24kHz mono
  | { type: 'transcript'; content: string; role: 'user' | 'assistant' }
  | { type: 'transcript_delta'; content: string }
  | { type: 'status'; status: ConnectionStatusWire }
  | { type: 'error'; message: string }
  | { type: 'heartbeat' }

export type ConnectionStatusWire =
  | 'connecting'
  | 'connected'
  | 'listening'
  | 'processing'
  | 'responding'
  | 'reconnecting'
  | 'disconnected'
  | 'error'
