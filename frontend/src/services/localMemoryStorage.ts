import type { PersonalMemory } from '@/types'

export const MEMORY_STORAGE_KEY = 'aura_memories'

export function loadMemoriesFromStorage(): PersonalMemory[] {
  try {
    const raw = localStorage.getItem(MEMORY_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as PersonalMemory[]) : []
  } catch {
    return []
  }
}

export function saveMemoriesToStorage(memories: PersonalMemory[]): void {
  try {
    localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(memories))
  } catch {
    // storage full or unavailable — ignore
  }
}
