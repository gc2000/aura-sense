import { useState } from 'react'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Dropdown from '@/components/ui/Dropdown'
import Toggle from '@/components/ui/Toggle'
import Button from '@/components/ui/Button'
import type { AgentConfig, PersonalMemory } from '@/types'

interface AuraConfigTabProps {
  config: AgentConfig
  memoryCategories: PersonalMemory[]
  onSave: (config: AgentConfig) => void
}

const ICON_OPTIONS = [
  { value: 'bot', label: 'Bot' },
  { value: 'eye', label: 'Eye' },
  { value: 'star', label: 'Star' },
  { value: 'brain', label: 'Brain' },
]

const VOICE_STYLE_OPTIONS = [
  { value: 'brief_direct', label: 'Brief & Direct' },
  { value: 'gentle_reassuring', label: 'Gentle & Reassuring' },
  { value: 'detailed', label: 'Detailed Explanation' },
  { value: 'high_safety', label: 'High Safety Priority' },
  { value: 'bilingual', label: 'Bilingual (EN/ZH)' },
  { value: 'chinese_only', label: 'Chinese Only' },
  { value: 'english_only', label: 'English Only' },
]

const VOICE_MODEL_OPTIONS = [
  { value: 'Zephyr', label: 'Zephyr' },
  { value: 'Kore', label: 'Kore' },
  { value: 'Puck', label: 'Puck' },
  { value: 'Charon', label: 'Charon' },
  { value: 'Fenrir', label: 'Fenrir' },
]

export default function AuraConfigTab({ config, memoryCategories, onSave }: AuraConfigTabProps) {
  const [form, setForm] = useState<AgentConfig>(config)

  function update<K extends keyof AgentConfig>(key: K, value: AgentConfig[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function toggleMemory(categoryName: string) {
    const ids = form.linkedMemoryCategoryIds
    update(
      'linkedMemoryCategoryIds',
      ids.includes(categoryName) ? ids.filter(i => i !== categoryName) : [...ids, categoryName]
    )
  }

  // Group flat memory items into unique categories by name
  const categoryGroups = memoryCategories.reduce<{ name: string; count: number }[]>((acc, mem) => {
    const existing = acc.find(g => g.name === mem.name)
    if (existing) {
      existing.count++
    } else {
      acc.push({ name: mem.name, count: 1 })
    }
    return acc
  }, [])

  return (
    <div className="h-full flex flex-col gap-5 px-4 py-4 overflow-y-auto pb-safe">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xs font-bold tracking-widest uppercase text-aura-text">
            Aura Core Orchestrator
          </h3>
          <p className="text-[10px] text-aura-text-muted tracking-wider uppercase mt-0.5">
            Primary Agent Settings
          </p>
        </div>
        <button
          onClick={() => setForm(config)}
          className="flex items-center gap-1 text-[10px] text-aura-text-dim tracking-widest uppercase hover:text-aura-text transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
            <path d="M9 2A5 5 0 1 0 8 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            <path d="M9 2V5h-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Reset
        </button>
      </div>

      {/* Basic fields */}
      <div className="flex flex-col gap-3">
        <Input label="Agent Name" value={form.name} onChange={e => update('name', e.target.value)} />
        <Input label="Short Description" value={form.description} onChange={e => update('description', e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <Dropdown label="App Icon" value={form.icon} options={ICON_OPTIONS} onChange={e => update('icon', e.target.value)} />
          <Dropdown label="Voice Style" value={form.voiceStyle} options={VOICE_STYLE_OPTIONS} onChange={e => update('voiceStyle', e.target.value as AgentConfig['voiceStyle'])} />
        </div>
        <Dropdown label="Voice Model" value={form.voiceModel} options={VOICE_MODEL_OPTIONS} onChange={e => update('voiceModel', e.target.value as AgentConfig['voiceModel'])} />
      </div>

      <Divider />

      {/* Visual Focus Directive */}
      <Textarea
        label="Visual Focus Directive"
        value={form.visualFocusDirective}
        rows={2}
        onChange={e => update('visualFocusDirective', e.target.value)}
        placeholder="Describe what Aura should focus on visually..."
      />

      {/* Linked Personal Memory */}
      <div>
        <p className="text-xs text-aura-text-dim tracking-widest uppercase mb-2">
          Linked Personal Memory
        </p>
        <div className="glass-card p-3 flex flex-col gap-2">
          {categoryGroups.length === 0 ? (
            <p className="text-xs text-aura-text-muted text-center py-2">No memory categories yet</p>
          ) : (
            categoryGroups.map(cat => (
              <label key={cat.name} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={form.linkedMemoryCategoryIds.includes(cat.name)}
                  onChange={() => toggleMemory(cat.name)}
                  className="w-4 h-4 rounded border-aura-border bg-aura-surface accent-aura-accent"
                />
                <div>
                  <span className="text-sm text-aura-text group-hover:text-aura-accent transition-colors">
                    {cat.name}
                  </span>
                  <span className="text-[10px] text-aura-text-muted ml-2 tracking-widest uppercase">
                    {cat.count} {cat.count === 1 ? 'record' : 'records'}
                  </span>
                </div>
              </label>
            ))
          )}
        </div>
      </div>

      {/* System Instructions */}
      <Textarea
        label="System Instructions"
        value={form.systemInstruction}
        rows={4}
        onChange={e => update('systemInstruction', e.target.value)}
        placeholder="Define Aura's behavior and role..."
      />

      {/* Internet Search */}
      <div className="glass-card p-4">
        <Toggle
          checked={form.internetSearchEnabled}
          onChange={val => update('internetSearchEnabled', val)}
          label="Enable Internet Search"
          description="Allow Aura to search the web for up-to-date information"
        />
      </div>

      {/* Save */}
      <Button fullWidth onClick={() => onSave(form)}>
        Save Configuration
      </Button>
    </div>
  )
}

function Divider() {
  return <div className="h-px bg-aura-border/40" />
}
