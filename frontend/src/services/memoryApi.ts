import type { PersonalMemory, MemoryType } from '@/types'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

export interface CreateMemoryInput {
  name: string
  description?: string
  memoryType: MemoryType
  key: string
  value: string
  assignedAgentIds?: string[]
}

export interface UpdateMemoryInput {
  name?: string
  description?: string
  memoryType?: MemoryType
  key?: string
  value?: string
  assignedAgentIds?: string[]
  lastUsedAt?: string | null
}

function headers(token: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export async function fetchMemories(token: string): Promise<PersonalMemory[]> {
  const res = await fetch(`${API_URL}/api/memories`, { headers: headers(token) })
  return handleResponse<PersonalMemory[]>(res)
}

export async function createMemory(token: string, data: CreateMemoryInput): Promise<PersonalMemory> {
  const res = await fetch(`${API_URL}/api/memories`, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify(data),
  })
  return handleResponse<PersonalMemory>(res)
}

export async function updateMemory(token: string, id: string, data: UpdateMemoryInput): Promise<PersonalMemory> {
  const res = await fetch(`${API_URL}/api/memories/${id}`, {
    method: 'PUT',
    headers: headers(token),
    body: JSON.stringify(data),
  })
  return handleResponse<PersonalMemory>(res)
}

export async function deleteMemory(token: string, id: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/memories/${id}`, {
    method: 'DELETE',
    headers: headers(token),
  })
  return handleResponse<void>(res)
}
