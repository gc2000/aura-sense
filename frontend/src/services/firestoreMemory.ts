import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { db } from './firebase'
import type { PersonalMemory, MemoryType } from '@/types'

const COLLECTION = 'memories'

export async function fetchMemoriesFromFirestore(userId: string): Promise<PersonalMemory[]> {
  const q = query(collection(db, COLLECTION), where('userId', '==', userId))
  const snapshot = await getDocs(q)
  const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as PersonalMemory))
  return docs.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

export async function createMemoryInFirestore(
  userId: string,
  data: { name: string; memoryType: string; key: string; value: string; description?: string },
): Promise<PersonalMemory> {
  const now = new Date().toISOString()
  const payload = {
    userId,
    name: data.name,
    description: data.description ?? '',
    memoryType: data.memoryType as MemoryType,
    key: data.key,
    value: data.value,
    assignedAgentIds: [] as string[],
    createdAt: now,
    updatedAt: now,
    lastUsedAt: null as string | null,
  }
  const ref = await addDoc(collection(db, COLLECTION), payload)
  return { id: ref.id, ...payload }
}

export async function setMemoryInFirestore(memory: PersonalMemory): Promise<void> {
  const { id, ...data } = memory
  await setDoc(doc(db, COLLECTION, id), data)
}

export async function updateMemoryInFirestore(id: string, key: string, value: string): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), { key, value, updatedAt: new Date().toISOString() })
}

export async function deleteMemoryFromFirestore(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id))
}
