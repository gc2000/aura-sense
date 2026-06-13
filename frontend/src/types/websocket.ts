// WebSocket message protocol (mirrors backend/src/types/websocket.ts)

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
  | { type: 'audio'; data: string }
  | { type: 'video_frame'; data: string; mimeType: string }
  | { type: 'text'; content: string }
  | { type: 'disconnect' }

// Server → Client
export type ServerMessage =
  | { type: 'connected' }
  | { type: 'disconnected' }
  | { type: 'interrupted' }
  | { type: 'audio'; data: string }
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
