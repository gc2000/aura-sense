// ─── User ───────────────────────────────────────────────────────────────────

export interface User {
  id: string
  email: string
  displayName: string | null
  photoURL: string | null
}

// ─── Personal Memory ─────────────────────────────────────────────────────────

export type MemoryType =
  | 'ItemLocation'
  | 'LastSeen'
  | 'HouseholdLabel'
  | 'Medication'
  | 'UserPreference'
  | 'Place'
  | 'SafetyNote'

export interface PersonalMemory {
  id: string
  userId: string
  name: string
  description: string
  memoryType: MemoryType
  key: string
  value: string
  assignedAgentIds: string[]
  createdAt: string
  updatedAt: string
  lastUsedAt: string | null
}

// ─── Agent ───────────────────────────────────────────────────────────────────

export type VoiceModel = 'Zephyr' | 'Kore' | 'Puck' | 'Charon' | 'Fenrir'

// Voice Style shown in UI (maps to tone + phrase combinations)
export type VoiceStyle =
  | 'brief_direct'
  | 'gentle_reassuring'
  | 'detailed'
  | 'high_safety'
  | 'bilingual'
  | 'chinese_only'
  | 'english_only'

export type AgentType =
  | 'manager'
  | 'find_items'
  | 'medication'
  | 'shopping'
  | 'hospital'
  | 'mobility'
  | 'home'
  | 'custom'

// Both Aura (manager) and every subagent share this config shape.
// Each agent has its own systemInstruction and can link to 1+ Personal Memory categories.
export interface AgentConfig {
  id: string
  userId: string
  agentType: AgentType
  name: string
  description: string
  icon: string
  systemInstruction: string
  // IDs of PersonalMemory categories linked to this agent
  linkedMemoryCategoryIds: string[]
  visualFocusDirective: string
  voiceModel: VoiceModel
  voiceStyle: VoiceStyle
  internetSearchEnabled: boolean
  enabledTools: string[]
  createdAt: string
  updatedAt: string
}

// ─── Conversation ─────────────────────────────────────────────────────────────

export type MessageRole = 'user' | 'assistant' | 'system'
export type MessageModality = 'voice' | 'text' | 'image' | 'video_frame'

export interface ConversationMessage {
  id: string
  conversationId: string
  role: MessageRole
  content: string
  language: string
  modality: MessageModality
  relatedMemoryIds: string[]
  timestamp: string
}

export interface Conversation {
  id: string
  userId: string
  agentId: string
  subagentId: string | null
  title: string
  messages: ConversationMessage[]
  createdAt: string
  updatedAt: string
}

// ─── Connection ───────────────────────────────────────────────────────────────

export type ConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'listening'
  | 'processing'
  | 'responding'
  | 'reconnecting'
  | 'error'

// ─── General Config ───────────────────────────────────────────────────────────

export interface GeneralConfig {
  timezone: string
  country: string
  city: string
  home: string
  preferredLanguage: string
  displayConversation: boolean
  voiceOutput: boolean
  vibrationFeedback: boolean
  internetSearchPermission: boolean
}

// ─── Video Config ─────────────────────────────────────────────────────────────

export type VideoUploadMode = 'manual' | 'auto'

export interface VideoUploadConfig {
  id: string
  userId: string
  mode: VideoUploadMode
  samplingRate: number
  createdAt: string
  updatedAt: string
}
