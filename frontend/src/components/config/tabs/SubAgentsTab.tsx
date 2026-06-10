import { useState } from 'react'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import Toggle from '@/components/ui/Toggle'
import type { AgentConfig, PersonalMemory } from '@/types'

interface SubAgentsTabProps {
  agents: AgentConfig[]
  memoryCategories: PersonalMemory[]
  onAdd: () => void
  onSave: (agent: AgentConfig) => void
  onDelete: (id: string) => void
}

const AGENT_ICONS: Record<string, React.ReactNode> = {
  search: <SearchIcon />,
  home: <HomeIcon />,
  health: <HealthIcon />,
  shopping: <ShoppingIcon />,
  default: <BotIcon />,
}

export default function SubAgentsTab({ agents, memoryCategories, onAdd, onSave, onDelete }: SubAgentsTabProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<AgentConfig | null>(null)

  function startEdit(agent: AgentConfig) {
    setEditingId(agent.id)
    setEditForm({ ...agent })
  }

  function cancelEdit() {
    setEditingId(null)
    setEditForm(null)
  }

  function updateForm<K extends keyof AgentConfig>(key: K, value: AgentConfig[K]) {
    setEditForm(prev => prev ? { ...prev, [key]: value } : null)
  }

  function toggleMemory(categoryName: string) {
    if (!editForm) return
    const ids = editForm.linkedMemoryCategoryIds
    updateForm('linkedMemoryCategoryIds', ids.includes(categoryName) ? ids.filter(i => i !== categoryName) : [...ids, categoryName])
  }

  // Group flat memory items into unique categories by name
  const categoryGroups = memoryCategories.reduce<{ name: string; count: number }[]>((acc, mem) => {
    const existing = acc.find(g => g.name === mem.name)
    if (existing) { existing.count++ } else { acc.push({ name: mem.name, count: 1 }) }
    return acc
  }, [])

  function handleSave() {
    if (editForm) { onSave(editForm); cancelEdit() }
  }

  return (
    <div className="h-full flex flex-col gap-4 px-4 py-4 overflow-y-auto pb-safe">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-aura-text-muted tracking-widest uppercase">
          Sub-Agent Management
        </p>
        <Button size="sm" onClick={onAdd}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Add Agent
        </Button>
      </div>

      {/* Agent list */}
      {agents.map(agent => (
        <div key={agent.id} className="flex flex-col">
          {/* Agent card */}
          <button
            onClick={() => editingId === agent.id ? cancelEdit() : startEdit(agent)}
            className={[
              'glass-card p-4 flex items-center gap-3 text-left transition-all duration-200',
              editingId === agent.id ? 'border-aura-accent/40 bg-aura-accent/5' : 'hover:border-aura-accent/20',
            ].join(' ')}
            aria-expanded={editingId === agent.id}
          >
            <div className="w-10 h-10 rounded-xl bg-aura-surface border border-aura-border flex items-center justify-center flex-shrink-0 text-aura-text-dim">
              {AGENT_ICONS[agent.icon] ?? AGENT_ICONS.default}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-aura-text">{agent.name}</p>
              <p className="text-xs text-aura-text-dim italic truncate">&ldquo;{agent.description}&rdquo;</p>
            </div>
            <svg
              width="14" height="14" viewBox="0 0 14 14" fill="none"
              className={`text-aura-text-muted transition-transform duration-200 flex-shrink-0 ${editingId === agent.id ? 'rotate-180' : ''}`}
              aria-hidden
            >
              <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Inline edit */}
          {editingId === agent.id && editForm && (
            <div className="mt-1 glass-card p-4 flex flex-col gap-4 animate-slide-up border-aura-accent/20">
              <p className="text-[10px] text-aura-accent tracking-widest uppercase">
                Configuring: &ldquo;{editForm.name}&rdquo;
              </p>
              <Input label="Name" value={editForm.name} onChange={e => updateForm('name', e.target.value)} />
              <Textarea label="System Instructions" value={editForm.systemInstruction} rows={3} onChange={e => updateForm('systemInstruction', e.target.value)} />
              <Input label="Visual Focus Directive" value={editForm.visualFocusDirective} onChange={e => updateForm('visualFocusDirective', e.target.value)} />

              {/* Linked Memory */}
              <div>
                <p className="text-xs text-aura-text-dim tracking-widest uppercase mb-2">Linked Personal Memory</p>
                <div className="flex flex-col gap-2">
                  {categoryGroups.length === 0 ? (
                    <p className="text-xs text-aura-text-muted">No memory categories yet</p>
                  ) : categoryGroups.map(cat => (
                    <label key={cat.name} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editForm.linkedMemoryCategoryIds.includes(cat.name)}
                        onChange={() => toggleMemory(cat.name)}
                        className="w-4 h-4 rounded border-aura-border bg-aura-surface accent-aura-accent"
                      />
                      <span className="text-sm text-aura-text">
                        {cat.name}
                        <span className="text-[10px] text-aura-text-muted ml-2 tracking-widest uppercase">
                          ({cat.count})
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <Toggle
                checked={editForm.internetSearchEnabled}
                onChange={val => updateForm('internetSearchEnabled', val)}
                label="Enable Internet Search"
              />

              {/* Actions */}
              <div className="flex gap-2">
                <Button fullWidth onClick={handleSave}>Save</Button>
                <Button variant="ghost" onClick={cancelEdit}>Cancel</Button>
                <Button variant="danger" size="sm" onClick={() => { onDelete(agent.id); cancelEdit() }} aria-label={`Delete ${agent.name}`}>
                  <TrashIcon />
                </Button>
              </div>
            </div>
          )}
        </div>
      ))}

      {agents.length === 0 && (
        <p className="text-xs text-aura-text-muted text-center py-8">
          No sub-agents yet. Tap &ldquo;Add Agent&rdquo; to create one.
        </p>
      )}
    </div>
  )
}

function SearchIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.3"/><path d="M10.5 10.5l3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
}
function HomeIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 7.5L8 2l6 5.5V14H10v-3H6v3H2V7.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>
}
function HealthIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8h3l2-4 2 8 2-4h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
function ShoppingIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 3h10l-1.5 7H4.5L3 3Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><circle cx="6" cy="13" r="1" fill="currentColor"/><circle cx="11" cy="13" r="1" fill="currentColor"/></svg>
}
function BotIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="3" y="6" width="10" height="7" rx="2" stroke="currentColor" strokeWidth="1.3"/><circle cx="6" cy="9.5" r="1" fill="currentColor"/><circle cx="10" cy="9.5" r="1" fill="currentColor"/><path d="M8 3v3M5.5 3.5h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
}
function TrashIcon() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 3.5h10M5.5 3.5V2.5h3v1M5 3.5l.5 8h3l.5-8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
