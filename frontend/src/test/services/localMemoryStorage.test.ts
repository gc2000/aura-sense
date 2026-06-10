import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  loadMemoriesFromStorage,
  saveMemoriesToStorage,
  MEMORY_STORAGE_KEY,
} from '@/services/localMemoryStorage'
import type { PersonalMemory } from '@/types'

const SAMPLE: PersonalMemory = {
  id: 'mem-1',
  userId: 'user-1',
  name: 'Kitchen',
  description: '',
  memoryType: 'ItemLocation',
  key: 'glasses',
  value: 'on the shelf',
  assignedAgentIds: [],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  lastUsedAt: null,
}

describe('loadMemoriesFromStorage', () => {
  beforeEach(() => localStorage.clear())

  it('returns empty array when storage is empty', () => {
    expect(loadMemoriesFromStorage()).toEqual([])
  })

  it('returns parsed memories from storage', () => {
    localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify([SAMPLE]))
    const result = loadMemoriesFromStorage()
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('mem-1')
    expect(result[0].key).toBe('glasses')
  })

  it('returns empty array when stored JSON is invalid', () => {
    localStorage.setItem(MEMORY_STORAGE_KEY, 'not-valid-json{{{')
    expect(loadMemoriesFromStorage()).toEqual([])
  })
})

describe('saveMemoriesToStorage', () => {
  beforeEach(() => localStorage.clear())

  it('serializes memories to localStorage', () => {
    saveMemoriesToStorage([SAMPLE])
    const raw = localStorage.getItem(MEMORY_STORAGE_KEY)
    expect(raw).not.toBeNull()
    const parsed = JSON.parse(raw!) as PersonalMemory[]
    expect(parsed[0].id).toBe('mem-1')
  })

  it('overwrites previous data on subsequent saves', () => {
    saveMemoriesToStorage([SAMPLE])
    const second = { ...SAMPLE, id: 'mem-2', key: 'keys' }
    saveMemoriesToStorage([second])
    const result = loadMemoriesFromStorage()
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('mem-2')
  })

  it('saves empty array without error', () => {
    expect(() => saveMemoriesToStorage([])).not.toThrow()
    expect(loadMemoriesFromStorage()).toEqual([])
  })

  it('ignores storage errors silently', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
      throw new Error('QuotaExceededError')
    })
    expect(() => saveMemoriesToStorage([SAMPLE])).not.toThrow()
  })
})

describe('round-trip', () => {
  beforeEach(() => localStorage.clear())

  it('save then load returns identical data', () => {
    const memories = [SAMPLE, { ...SAMPLE, id: 'mem-2', name: 'Bedroom' }]
    saveMemoriesToStorage(memories)
    expect(loadMemoriesFromStorage()).toEqual(memories)
  })
})
