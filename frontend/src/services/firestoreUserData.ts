import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  deleteDoc,
  query,
  where,
  limit,
  writeBatch,
} from 'firebase/firestore'
import { db } from './firebase'
import type { AgentConfig, Conversation } from '@/types'
import { type TriggerConfig, DEFAULT_TRIGGER_CONFIG } from './triggerConfig'
import { mockAuraConfig } from '@/data/mockData'

const MAX_CONVERSATIONS = 50

// ─── Agent Config ─────────────────────────────────────────────────────────────

export async function loadAgentConfigFromFirestore(userId: string): Promise<AgentConfig> {
  try {
    const snap = await getDoc(doc(db, 'agent_configs', userId))
    if (!snap.exists()) return { ...mockAuraConfig, userId }
    return { ...mockAuraConfig, ...(snap.data() as Partial<AgentConfig>), userId }
  } catch {
    return { ...mockAuraConfig, userId }
  }
}

export async function saveAgentConfigToFirestore(userId: string, config: AgentConfig): Promise<void> {
  await setDoc(doc(db, 'agent_configs', userId), config)
}

// ─── Trigger Config ──────────────────────────────────────────────────────────

export async function loadTriggerConfigFromFirestore(userId: string): Promise<TriggerConfig> {
  try {
    const snap = await getDoc(doc(db, 'trigger_configs', userId))
    if (!snap.exists()) return { ...DEFAULT_TRIGGER_CONFIG }
    const data = snap.data() as Partial<TriggerConfig>
    return {
      enabled: data.enabled ?? DEFAULT_TRIGGER_CONFIG.enabled,
      addPhrases: data.addPhrases ?? DEFAULT_TRIGGER_CONFIG.addPhrases,
    }
  } catch {
    return { ...DEFAULT_TRIGGER_CONFIG }
  }
}

export async function saveTriggerConfigToFirestore(userId: string, config: TriggerConfig): Promise<void> {
  await setDoc(doc(db, 'trigger_configs', userId), config)
}

// ─── Conversations ───────────────────────────────────────────────────────────

export async function loadConversationsFromFirestore(userId: string): Promise<Conversation[]> {
  try {
    const q = query(
      collection(db, 'conversations'),
      where('userId', '==', userId),
      limit(MAX_CONVERSATIONS),
    )
    const snap = await getDocs(q)
    const docs = snap.docs.map(d => ({ ...d.data(), id: d.id } as Conversation))
    return docs.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  } catch {
    return []
  }
}

export async function saveConversationToFirestore(conv: Conversation): Promise<void> {
  await setDoc(doc(db, 'conversations', conv.id), conv)
}

export async function deleteConversationFromFirestore(id: string): Promise<void> {
  await deleteDoc(doc(db, 'conversations', id))
}

export async function clearAllConversationsFromFirestore(userId: string): Promise<void> {
  const q = query(collection(db, 'conversations'), where('userId', '==', userId))
  const snap = await getDocs(q)
  const batch = writeBatch(db)
  snap.docs.forEach(d => batch.delete(d.ref))
  await batch.commit()
}
