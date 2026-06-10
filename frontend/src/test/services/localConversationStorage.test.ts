import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  loadConversationsFromStorage,
  saveConversationsToStorage,
  CONVERSATION_STORAGE_KEY,
} from '@/services/localConversationStorage'
import type { Conversation } from '@/types'

function makeConv(id: string, createdAt = '2024-01-01T00:00:00.000Z'): Conversation {
  return {
    id,
    userId: 'user-1',
    agentId: 'aura-main',
    subagentId: null,
    title: 'Session',
    messages: [
      {
        id: `msg-${id}`, conversationId: id, role: 'user',
        content: 'Hello', language: 'en', modality: 'voice',
        relatedMemoryIds: [], timestamp: createdAt,
      },
    ],
    createdAt,
    updatedAt: createdAt,
  }
}

describe('loadConversationsFromStorage', () => {
  beforeEach(() => localStorage.clear())

  it('returns empty array when storage is empty', () => {
    expect(loadConversationsFromStorage()).toEqual([])
  })

  it('returns parsed conversations from storage', () => {
    const conv = makeConv('c-1')
    localStorage.setItem(CONVERSATION_STORAGE_KEY, JSON.stringify([conv]))
    const result = loadConversationsFromStorage()
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('c-1')
  })

  it('returns empty array on invalid JSON', () => {
    localStorage.setItem(CONVERSATION_STORAGE_KEY, '{bad}')
    expect(loadConversationsFromStorage()).toEqual([])
  })
})

describe('saveConversationsToStorage', () => {
  beforeEach(() => localStorage.clear())

  it('persists conversations to localStorage', () => {
    const conv = makeConv('c-1')
    saveConversationsToStorage([conv])
    const raw = localStorage.getItem(CONVERSATION_STORAGE_KEY)
    expect(raw).not.toBeNull()
    const parsed = JSON.parse(raw!) as Conversation[]
    expect(parsed[0].id).toBe('c-1')
  })

  it('trims to MAX_STORED (50) conversations', () => {
    const many = Array.from({ length: 60 }, (_, i) => makeConv(`c-${i}`))
    saveConversationsToStorage(many)
    const result = loadConversationsFromStorage()
    expect(result).toHaveLength(50)
    expect(result[0].id).toBe('c-0')
  })

  it('saves empty array without error', () => {
    expect(() => saveConversationsToStorage([])).not.toThrow()
    expect(loadConversationsFromStorage()).toEqual([])
  })

  it('ignores storage errors silently', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
      throw new Error('QuotaExceededError')
    })
    expect(() => saveConversationsToStorage([makeConv('c-1')])).not.toThrow()
  })

  it('round-trips without data loss', () => {
    const convs = [makeConv('c-1'), makeConv('c-2')]
    saveConversationsToStorage(convs)
    expect(loadConversationsFromStorage()).toEqual(convs)
  })
})
