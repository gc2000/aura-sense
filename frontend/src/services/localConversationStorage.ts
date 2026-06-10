import type { Conversation } from '@/types'

export const CONVERSATION_STORAGE_KEY = 'aura_conversations'
const MAX_STORED = 50

export function loadConversationsFromStorage(): Conversation[] {
  try {
    const raw = localStorage.getItem(CONVERSATION_STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as Conversation[]
  } catch {
    return []
  }
}

export function saveConversationsToStorage(conversations: Conversation[]): void {
  try {
    // Keep only the most recent MAX_STORED conversations
    const trimmed = conversations.slice(0, MAX_STORED)
    localStorage.setItem(CONVERSATION_STORAGE_KEY, JSON.stringify(trimmed))
  } catch {
    // storage unavailable — ignore
  }
}
