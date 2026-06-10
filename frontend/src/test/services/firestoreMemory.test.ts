import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { PersonalMemory } from '@/types'

// Mock firebase/firestore module
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  getDocs: vi.fn(),
  addDoc: vi.fn(),
  deleteDoc: vi.fn(),
  doc: vi.fn(),
}))

// Mock the firebase service so db is just a stub
vi.mock('@/services/firebase', () => ({
  db: {},
  auth: {},
}))

import * as firestore from 'firebase/firestore'
import {
  fetchMemoriesFromFirestore,
  createMemoryInFirestore,
  deleteMemoryFromFirestore,
} from '@/services/firestoreMemory'

const SAMPLE: PersonalMemory = {
  id: 'doc-1',
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

describe('fetchMemoriesFromFirestore', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns mapped documents', async () => {
    const { id: _omit, ...data } = SAMPLE
    vi.mocked(firestore.getDocs).mockResolvedValue({
      docs: [{ id: 'doc-1', data: () => data }],
    } as never)

    const result = await fetchMemoriesFromFirestore('user-1')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('doc-1')
    expect(result[0].key).toBe('glasses')
  })

  it('returns empty array when no documents', async () => {
    vi.mocked(firestore.getDocs).mockResolvedValue({ docs: [] } as never)
    const result = await fetchMemoriesFromFirestore('user-1')
    expect(result).toEqual([])
  })
})

describe('createMemoryInFirestore', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns new memory with generated id', async () => {
    vi.mocked(firestore.addDoc).mockResolvedValue({ id: 'new-id' } as never)

    const result = await createMemoryInFirestore('user-1', {
      name: 'Kitchen',
      memoryType: 'ItemLocation',
      key: 'glasses',
      value: 'on the shelf',
    })

    expect(result.id).toBe('new-id')
    expect(result.userId).toBe('user-1')
    expect(result.name).toBe('Kitchen')
    expect(result.key).toBe('glasses')
    expect(result.value).toBe('on the shelf')
    expect(result.lastUsedAt).toBeNull()
  })
})

describe('deleteMemoryFromFirestore', () => {
  beforeEach(() => vi.clearAllMocks())

  it('calls deleteDoc with the correct ref', async () => {
    const mockRef = { id: 'doc-1' }
    vi.mocked(firestore.doc).mockReturnValue(mockRef as never)
    vi.mocked(firestore.deleteDoc).mockResolvedValue(undefined)

    await deleteMemoryFromFirestore('doc-1')
    expect(firestore.deleteDoc).toHaveBeenCalledWith(mockRef)
  })
})
