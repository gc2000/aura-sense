import type { AgentConfig, PersonalMemory, ConversationMessage } from '@/types'

export const mockAuraConfig: AgentConfig = {
  id: 'aura-main',
  userId: 'demo',
  agentType: 'manager',
  name: 'Aura',
  description: 'Manager Agent, orchestrator',
  icon: 'bot',
  systemInstruction:
    'You are Aura, a helpful visual assistant. You handle general requests and route specialized tasks to subagents.',
  linkedMemoryCategoryIds: [],
  visualFocusDirective: 'Focus on understanding user intent and the immediate environment.',
  voiceModel: 'Zephyr',
  voiceStyle: 'gentle_reassuring',
  internetSearchEnabled: true,
  enabledTools: ['vision', 'memory', 'search'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

export const mockSubAgents: AgentConfig[] = [
  {
    id: 'find-items',
    userId: 'demo',
    agentType: 'find_items',
    name: 'Find Items',
    description: 'Specialized in locating common items.',
    icon: 'search',
    systemInstruction: 'You help users find misplaced items using visual analysis and memory.',
    linkedMemoryCategoryIds: [],
    visualFocusDirective: 'Scan the environment for the target item.',
    voiceModel: 'Kore',
    voiceStyle: 'brief_direct',
    internetSearchEnabled: false,
    enabledTools: ['vision', 'memory'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'home-assistant',
    userId: 'demo',
    agentType: 'home',
    name: 'Home Assistant',
    description: 'Specialized in home environment and appliances.',
    icon: 'home',
    systemInstruction: 'You assist users in navigating their home and identifying objects.',
    linkedMemoryCategoryIds: [],
    visualFocusDirective: 'Identify household objects, labels and controls.',
    voiceModel: 'Puck',
    voiceStyle: 'detailed',
    internetSearchEnabled: false,
    enabledTools: ['vision', 'memory'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'medication',
    userId: 'demo',
    agentType: 'medication',
    name: 'Medication Helper',
    description: 'Specialized in medicine identification and pill-box tracking.',
    icon: 'health',
    systemInstruction: 'You assist users with medical capsule identification, prescription directions, and pill tracking.',
    linkedMemoryCategoryIds: [],
    visualFocusDirective: 'Inspect medicine bottles, tablet codes and labels.',
    voiceModel: 'Charon',
    voiceStyle: 'high_safety',
    internetSearchEnabled: true,
    enabledTools: ['vision', 'memory', 'search'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export const mockMemoryCategories: PersonalMemory[] = [
  {
    id: 'mem-1', userId: 'demo', name: 'Leave Home checklist', description: '',
    memoryType: 'SafetyNote', key: 'leave home', value: 'pole, glasses, wallet',
    assignedAgentIds: [], createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(), lastUsedAt: null,
  },
  {
    id: 'mem-2', userId: 'demo', name: 'Location', description: '',
    memoryType: 'Place', key: 'Library', value: '3rd floor of Punggol One',
    assignedAgentIds: [], createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(), lastUsedAt: null,
  },
]

export const mockMessages: ConversationMessage[] = [
  {
    id: 'm1', conversationId: 'c1', role: 'user',
    content: 'Aura, what can you see through the lens?',
    language: 'en', modality: 'voice', relatedMemoryIds: [],
    timestamp: new Date(Date.now() - 60000).toISOString(),
  },
  {
    id: 'm2', conversationId: 'c1', role: 'assistant',
    content: 'I see a dynamic workspace. If you hold up any items or show me home appliances, I can help you analyze them or route specialized requests to my team of sub-agents!',
    language: 'en', modality: 'voice', relatedMemoryIds: [],
    timestamp: new Date().toISOString(),
  },
]
