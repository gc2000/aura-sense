import { useState } from 'react'
import GeneralTab from './tabs/GeneralTab'
import AuraConfigTab from './tabs/AuraConfigTab'
import SubAgentsTab from './tabs/SubAgentsTab'
import PersonalMemoryTab from './tabs/PersonalMemoryTab'
import type { AgentConfig, PersonalMemory } from '@/types'
import type { TriggerConfig } from '@/services/triggerConfig'

type TabId = 'general' | 'aura' | 'subagents' | 'memory'

const TABS: { id: TabId; label: string }[] = [
  { id: 'general', label: 'General' },
  { id: 'aura', label: 'Aura' },
  { id: 'subagents', label: 'Sub-Agents' },
  { id: 'memory', label: 'Memory' },
]

interface ConfigPanelProps {
  isOpen: boolean
  onClose: () => void
  auraConfig: AgentConfig
  subAgents: AgentConfig[]
  memoryCategories: PersonalMemory[]
  onSaveAura: (config: AgentConfig) => void
  onSaveSubAgent: (agent: AgentConfig) => void
  onDeleteSubAgent: (id: string) => void
  onAddSubAgent: () => void
  onAddMemoryItem: (categoryId: string, key: string, value: string) => void
  onEditMemoryItem: (itemId: string, key: string, value: string) => void
  onDeleteMemoryItem: (id: string) => void
  onDeleteMemoryCategory: (id: string) => void
  onAddMemoryCategory: (name: string) => void
  triggerConfig: TriggerConfig
  onUpdateTriggerConfig: (config: TriggerConfig) => void
}

export default function ConfigPanel({
  isOpen,
  onClose,
  auraConfig,
  subAgents,
  memoryCategories,
  onSaveAura,
  onSaveSubAgent,
  onDeleteSubAgent,
  onAddSubAgent,
  onAddMemoryItem,
  onEditMemoryItem,
  onDeleteMemoryItem,
  onDeleteMemoryCategory,
  onAddMemoryCategory,
  triggerConfig,
  onUpdateTriggerConfig,
}: ConfigPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>('general')

  if (!isOpen) return null

  const grouped = groupMemories(memoryCategories)

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-aura-bg"
      role="dialog"
      aria-modal="true"
      aria-label="Aura Config Panel"
    >
      {/* Header — compact on mobile */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-aura-border flex-shrink-0 safe-top">
        <div className="w-8 h-8 rounded-xl bg-aura-accent/20 border border-aura-accent/40 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-aura-accent">A</span>
        </div>
        <h2 className="flex-1 text-sm font-bold tracking-widest uppercase text-aura-text truncate">
          Config Panel
        </h2>
        <button
          onClick={onClose}
          aria-label="Close config panel"
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl border border-aura-border text-aura-text-dim hover:text-aura-text hover:border-aura-accent/40 transition-all"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </header>

      {/* Tabs — scrollable, equal width on mobile */}
      <div className="flex border-b border-aura-border flex-shrink-0 overflow-x-auto scrollbar-hide">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            role="tab"
            aria-selected={activeTab === tab.id}
            className={[
              'flex-1 min-w-0 px-2 py-3 text-[11px] font-medium tracking-widest uppercase transition-all duration-200 border-b-2 whitespace-nowrap',
              activeTab === tab.id
                ? 'border-aura-accent text-aura-accent'
                : 'border-transparent text-aura-text-dim',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content — fills remaining height, scrolls inside */}
      <div className="min-h-0 flex-1">
        {activeTab === 'general' && <GeneralTab />}
        {activeTab === 'aura' && (
          <AuraConfigTab
            config={auraConfig}
            memoryCategories={memoryCategories}
            onSave={onSaveAura}
          />
        )}
        {activeTab === 'subagents' && (
          <SubAgentsTab
            agents={subAgents}
            memoryCategories={memoryCategories}
            onAdd={onAddSubAgent}
            onSave={onSaveSubAgent}
            onDelete={onDeleteSubAgent}
          />
        )}
        {activeTab === 'memory' && (
          <PersonalMemoryTab
            categories={grouped}
            triggerConfig={triggerConfig}
            onAddItem={onAddMemoryItem}
            onEditItem={onEditMemoryItem}
            onDeleteItem={onDeleteMemoryItem}
            onDeleteCategory={onDeleteMemoryCategory}
            onAddCategory={onAddMemoryCategory}
            onUpdateTriggerConfig={onUpdateTriggerConfig}
          />
        )}
      </div>
    </div>
  )
}

function groupMemories(memories: PersonalMemory[]) {
  const map = new Map<string, { id: string; name: string; items: PersonalMemory[] }>()
  for (const mem of memories) {
    if (!map.has(mem.name)) {
      map.set(mem.name, { id: mem.id, name: mem.name, items: [] })
    }
    map.get(mem.name)!.items.push(mem)
  }
  return Array.from(map.values())
}
