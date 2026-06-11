import { useState, useRef, useEffect, useCallback, type RefObject } from 'react'
import TopBar from '@/components/layout/TopBar'
import CameraView from '@/components/camera/CameraView'
import ConversationPanel from '@/components/chat/ConversationPanel'
import StatusBar from '@/components/chat/StatusBar'
import ConnectButton from '@/components/chat/ConnectButton'
import ConfigPanel from '@/components/config/ConfigPanel'
import ConversationHistory from '@/components/ConversationHistory'
import { useAuraSession } from '@/hooks/useAuraSession'
import { useAuth } from '@/context/AuthContext'
import type { AgentConfig, Conversation, PersonalMemory } from '@/types'
import { mockAuraConfig, mockSubAgents } from '@/data/mockData'
import { type TriggerConfig, DEFAULT_TRIGGER_CONFIG } from '@/services/triggerConfig'
import { useMemoryTrigger } from '@/hooks/useMemoryTrigger'
import {
  fetchMemoriesFromFirestore,
  setMemoryInFirestore,
  updateMemoryInFirestore,
  deleteMemoryFromFirestore,
} from '@/services/firestoreMemory'
import {
  loadAgentConfigFromFirestore,
  saveAgentConfigToFirestore,
  loadTriggerConfigFromFirestore,
  saveTriggerConfigToFirestore,
  loadConversationsFromFirestore,
  saveConversationToFirestore,
  deleteConversationFromFirestore,
  clearAllConversationsFromFirestore,
} from '@/services/firestoreUserData'

export default function HomePage() {
  const { user } = useAuth()

  // Panel visibility
  const [configOpen, setConfigOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false)

  // Session refs
  const sessionStartRef = useRef(new Date().toISOString())
  const videoRef = useRef<HTMLVideoElement>(null) as RefObject<HTMLVideoElement>

  // App state — starts with defaults, overwritten once Firestore loads
  const [auraConfig, setAuraConfig] = useState<AgentConfig>(mockAuraConfig)
  const [subAgents, setSubAgents] = useState<AgentConfig[]>(mockSubAgents)
  const [memoryCategories, setMemoryCategories] = useState<PersonalMemory[]>([])
  const [triggerConfig, setTriggerConfig] = useState<TriggerConfig>(DEFAULT_TRIGGER_CONFIG)
  const [pastConversations, setPastConversations] = useState<Conversation[]>([])

  // ── Load all data from Firestore after user authenticates ─────────────────
  useEffect(() => {
    if (!user) return
    setDataLoaded(false)
    void Promise.all([
      loadAgentConfigFromFirestore(user.id),
      loadTriggerConfigFromFirestore(user.id),
      loadConversationsFromFirestore(user.id),
      fetchMemoriesFromFirestore(user.id),
    ]).then(([agentCfg, triggerCfg, conversations, memories]) => {
      setAuraConfig(agentCfg)
      setTriggerConfig(triggerCfg)
      setPastConversations(conversations)
      setMemoryCategories(memories)
      setDataLoaded(true)
    }).catch(() => setDataLoaded(true))
  }, [user?.id])

  // ── Debounced saves for configs ───────────────────────────────────────────
  const agentSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (!user || !dataLoaded) return
    if (agentSaveTimer.current) clearTimeout(agentSaveTimer.current)
    agentSaveTimer.current = setTimeout(() => {
      void saveAgentConfigToFirestore(user.id, auraConfig)
    }, 1000)
    return () => { if (agentSaveTimer.current) clearTimeout(agentSaveTimer.current) }
  }, [auraConfig, user, dataLoaded])

  const triggerSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (!user || !dataLoaded) return
    if (triggerSaveTimer.current) clearTimeout(triggerSaveTimer.current)
    triggerSaveTimer.current = setTimeout(() => {
      void saveTriggerConfigToFirestore(user.id, triggerConfig)
    }, 1000)
    return () => { if (triggerSaveTimer.current) clearTimeout(triggerSaveTimer.current) }
  }, [triggerConfig, user, dataLoaded])

  // ── Gemini Live session ───────────────────────────────────────────────────
  const { status, messages, connect, disconnect, clearMessages, resumeAudio } = useAuraSession({
    auraConfig,
    subAgents,
    memories: memoryCategories,
    videoRef,
  })

  // Unlock AudioContext on first user interaction (mobile autoplay policy)
  useEffect(() => {
    const unlock = () => resumeAudio()
    document.addEventListener('touchstart', unlock, { once: true })
    document.addEventListener('click', unlock, { once: true })
    return () => {
      document.removeEventListener('touchstart', unlock)
      document.removeEventListener('click', unlock)
    }
  }, [resumeAudio])

  // "Tap to Begin" overlay — shown until first user interaction unlocks AudioContext
  const [audioUnlocked, setAudioUnlocked] = useState(false)

  // Announce "Tap to Begin" via speechSynthesis once data is ready
  useEffect(() => {
    if (!dataLoaded || audioUnlocked) return
    const msg = new SpeechSynthesisUtterance('Tap anywhere to begin')
    msg.rate = 0.9
    window.speechSynthesis.speak(msg)
  }, [dataLoaded, audioUnlocked])

  function handleTapToBegin() {
    resumeAudio()
    setAudioUnlocked(true)
    void connect()
  }

  function handleDisconnect() {
    const nonSystem = messages.filter(m => m.role !== 'system')
    if (nonSystem.length > 0 && user) {
      const conv: Conversation = {
        id: `conv-${Date.now()}`,
        userId: user.id,
        agentId: auraConfig.id,
        subagentId: null,
        title: 'Session',
        messages,
        createdAt: sessionStartRef.current,
        updatedAt: new Date().toISOString(),
      }
      void saveConversationToFirestore(conv)
      setPastConversations(prev => [conv, ...prev])
    }
    sessionStartRef.current = new Date().toISOString()
    clearMessages()
    disconnect()
  }

  const isConnected =
    status === 'connected' ||
    status === 'listening' ||
    status === 'processing' ||
    status === 'responding'

  // ── Sub-agent handlers ────────────────────────────────────────────────────
  function handleAddSubAgent() {
    const newAgent: AgentConfig = {
      id: `agent-${Date.now()}`,
      userId: user?.id ?? '',
      agentType: 'custom',
      name: 'New Agent',
      description: 'Custom sub-agent',
      icon: 'default',
      systemInstruction: '',
      linkedMemoryCategoryIds: [],
      visualFocusDirective: '',
      voiceModel: 'Zephyr',
      voiceStyle: 'brief_direct',
      internetSearchEnabled: false,
      enabledTools: ['vision'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setSubAgents(prev => [...prev, newAgent])
  }

  function handleSaveSubAgent(agent: AgentConfig) {
    setSubAgents(prev => prev.map(a => (a.id === agent.id ? agent : a)))
  }

  function handleDeleteSubAgent(id: string) {
    setSubAgents(prev => prev.filter(a => a.id !== id))
  }

  // ── Memory handlers — write to Firestore + update local state ─────────────
  function handleAddMemoryItem(categoryName: string, key: string, value: string) {
    if (!user) return
    const mem: PersonalMemory = {
      id: `mem-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      userId: user.id,
      name: categoryName,
      description: '',
      memoryType: 'ItemLocation',
      key,
      value,
      assignedAgentIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastUsedAt: null,
    }
    void setMemoryInFirestore(mem)
    setMemoryCategories(prev => [...prev, mem])
  }

  function handleEditMemoryItem(itemId: string, key: string, value: string) {
    void updateMemoryInFirestore(itemId, key, value)
    setMemoryCategories(prev =>
      prev.map(m => m.id === itemId ? { ...m, key, value, updatedAt: new Date().toISOString() } : m),
    )
  }

  function handleDeleteMemoryItem(itemId: string) {
    void deleteMemoryFromFirestore(itemId)
    setMemoryCategories(prev => prev.filter(m => m.id !== itemId))
  }

  function handleDeleteMemoryCategory(categoryId: string) {
    const toDelete = memoryCategories.filter(m => m.id === categoryId || m.name === categoryId)
    toDelete.forEach(m => void deleteMemoryFromFirestore(m.id))
    setMemoryCategories(prev => prev.filter(m => m.id !== categoryId && m.name !== categoryId))
  }

  function handleAddMemoryCategory(name: string) {
    if (!user) return
    const mem: PersonalMemory = {
      id: `cat-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      userId: user.id,
      name,
      description: '',
      memoryType: 'ItemLocation',
      key: 'note',
      value: 'Add items below',
      assignedAgentIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastUsedAt: null,
    }
    void setMemoryInFirestore(mem)
    setMemoryCategories(prev => [...prev, mem])
  }

  // ── Conversation history handlers ─────────────────────────────────────────
  function handleDeleteConversation(id: string) {
    void deleteConversationFromFirestore(id)
    setPastConversations(prev => prev.filter(c => c.id !== id))
  }

  function handleClearAllConversations() {
    if (!user) return
    void clearAllConversationsFromFirestore(user.id)
    setPastConversations([])
  }

  // ── Auto-add memory from voice trigger ────────────────────────────────────
  const handleAutoAddMemory = useCallback(
    (categoryName: string, key: string, value: string) => {
      if (!user) return
      const hasCategory = memoryCategories.some(m => m.name === categoryName)
      if (!hasCategory) {
        const placeholder: PersonalMemory = {
          id: `cat-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          userId: user.id,
          name: categoryName,
          description: '',
          memoryType: 'ItemLocation',
          key: 'note',
          value: 'Auto-created by voice trigger',
          assignedAgentIds: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastUsedAt: null,
        }
        void setMemoryInFirestore(placeholder)
        setMemoryCategories(prev => [...prev, placeholder])
      }
      handleAddMemoryItem(categoryName, key, value)
    },
    [memoryCategories, user],
  )

  // ── Voice trigger ─────────────────────────────────────────────────────────
  const { processTranscript } = useMemoryTrigger({
    config: triggerConfig,
    onAddMemory: handleAutoAddMemory,
  })

  const lastProcessedRef = useRef<string>('')
  useEffect(() => {
    const userMessages = messages.filter(m => m.role === 'user')
    if (userMessages.length === 0) return
    const latest = userMessages[userMessages.length - 1]
    if (latest.id === lastProcessedRef.current) return
    lastProcessedRef.current = latest.id
    processTranscript(latest.content, 'user')
  }, [messages, processTranscript])

  // ── Loading state ─────────────────────────────────────────────────────────
  if (!dataLoaded) {
    return (
      <div className="h-full bg-aura-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-aura-accent/40 border-t-aura-accent rounded-full animate-spin" />
          <p className="text-xs text-aura-text-muted tracking-widest uppercase">Loading…</p>
        </div>
      </div>
    )
  }

  // "Tap to Begin" overlay — covers screen until user taps
  if (!audioUnlocked) {
    return (
      <button
        className="fixed inset-0 w-full h-full bg-aura-bg flex flex-col items-center justify-center gap-6 cursor-pointer"
        onClick={handleTapToBegin}
        aria-label="Touch or click anywhere to begin. Aura will connect and greet you."
        autoFocus
      >
        <div className="w-16 h-16 rounded-full bg-aura-accent/20 flex items-center justify-center animate-pulse">
          <div className="w-8 h-8 rounded-full bg-aura-accent" />
        </div>
        <p className="text-aura-text text-xl font-light tracking-widest uppercase">Touch to Begin</p>
        <p className="text-aura-text-muted text-sm">Aura will connect and greet you</p>
      </button>
    )
  }

  return (
    <div className="relative h-full bg-black overflow-hidden">
      <CameraView isConnected={isConnected} videoRef={videoRef} />

      <div className="absolute inset-0 flex flex-col pointer-events-none">
        <div className="pointer-events-auto">
          <TopBar
            isConnected={isConnected}
            onMenuClick={() => setConfigOpen(true)}
            onHistoryClick={() => setHistoryOpen(true)}
          />
        </div>

        <div className="flex-1" />

        <div className="pointer-events-auto">
          <ConversationPanel messages={messages} agentName={auraConfig.name} />
        </div>

        <div className="pointer-events-auto">
          <StatusBar status={status} agentName={auraConfig.name} />
        </div>

        <div className="pointer-events-auto">
          <ConnectButton
            status={status}
            onConnect={() => void connect()}
            onDisconnect={handleDisconnect}
          />
        </div>
      </div>

      <ConfigPanel
        isOpen={configOpen}
        onClose={() => setConfigOpen(false)}
        auraConfig={auraConfig}
        subAgents={subAgents}
        memoryCategories={memoryCategories}
        onSaveAura={setAuraConfig}
        onSaveSubAgent={handleSaveSubAgent}
        onDeleteSubAgent={handleDeleteSubAgent}
        onAddSubAgent={handleAddSubAgent}
        onAddMemoryItem={handleAddMemoryItem}
        onEditMemoryItem={handleEditMemoryItem}
        onDeleteMemoryItem={handleDeleteMemoryItem}
        onDeleteMemoryCategory={handleDeleteMemoryCategory}
        onAddMemoryCategory={handleAddMemoryCategory}
        triggerConfig={triggerConfig}
        onUpdateTriggerConfig={setTriggerConfig}
      />

      <ConversationHistory
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onDelete={handleDeleteConversation}
        onClearAll={handleClearAllConversations}
        conversations={[
          ...(messages.filter(m => m.role !== 'system').length > 0
            ? [{
                id: 'current',
                userId: user?.id ?? '',
                agentId: auraConfig.id,
                subagentId: null,
                title: 'Current Session',
                messages,
                createdAt: sessionStartRef.current,
                updatedAt: new Date().toISOString(),
              }]
            : []),
          ...pastConversations,
        ]}
      />
    </div>
  )
}
