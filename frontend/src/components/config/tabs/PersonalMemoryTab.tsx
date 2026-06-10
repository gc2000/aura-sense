import { useState } from 'react'
import type { PersonalMemory } from '@/types'
import type { TriggerConfig } from '@/services/triggerConfig'
import Toggle from '@/components/ui/Toggle'

interface MemoryCategory {
  id: string
  name: string
  items: PersonalMemory[]
}

interface PersonalMemoryTabProps {
  categories: MemoryCategory[]
  triggerConfig: TriggerConfig
  onAddItem: (categoryId: string, key: string, value: string) => void
  onEditItem: (itemId: string, key: string, value: string) => void
  onDeleteItem: (itemId: string) => void
  onDeleteCategory: (categoryId: string) => void
  onAddCategory: (name: string) => void
  onUpdateTriggerConfig: (config: TriggerConfig) => void
}

export default function PersonalMemoryTab({
  categories,
  triggerConfig,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onDeleteCategory,
  onAddCategory,
  onUpdateTriggerConfig,
}: PersonalMemoryTabProps) {
  const [newCategoryName, setNewCategoryName] = useState('')
  const [showAddCategory, setShowAddCategory] = useState(false)

  function handleAddCategory() {
    if (newCategoryName.trim()) {
      onAddCategory(newCategoryName.trim())
      setNewCategoryName('')
      setShowAddCategory(false)
    }
  }

  return (
    <div className="h-full flex flex-col gap-4 px-4 py-4 overflow-y-auto pb-safe">
      {/* Memory Categories header */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="w-1 h-4 rounded-full bg-aura-accent" aria-hidden />
        <h3 className="text-xs font-bold tracking-widest uppercase text-aura-text">Memory Categories</h3>
      </div>

      {/* Category list */}
      {categories.map(cat => (
        <CategoryCard
          key={cat.id}
          category={cat}
          onAddItem={(key, value) => onAddItem(cat.name, key, value)}
          onEditItem={onEditItem}
          onDeleteItem={onDeleteItem}
          onDeleteCategory={() => onDeleteCategory(cat.id)}
        />
      ))}

      {/* Add new category */}
      {showAddCategory ? (
        <div className="glass-card p-4 flex flex-col gap-3 animate-slide-up flex-shrink-0">
          <p className="text-xs text-aura-text-dim tracking-widest uppercase">New Category</p>
          <input
            type="text"
            value={newCategoryName}
            onChange={e => setNewCategoryName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
            placeholder="Category name (e.g. Kitchen)"
            autoFocus
            className="w-full bg-aura-surface border border-aura-border rounded-xl px-4 py-3 text-sm text-aura-text placeholder-aura-text-muted focus:outline-none focus:border-aura-accent/60 transition-all min-h-[44px]"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddCategory}
              className="flex-1 py-3 rounded-xl bg-aura-accent text-white text-xs font-semibold tracking-widest uppercase hover:bg-aura-accent-dim transition-all min-h-[44px]"
            >
              Create
            </button>
            <button
              onClick={() => { setShowAddCategory(false); setNewCategoryName('') }}
              className="px-5 py-3 rounded-xl text-aura-text-dim text-xs hover:text-aura-text transition-colors min-h-[44px]"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAddCategory(true)}
          className="w-full py-3.5 rounded-xl border border-dashed border-aura-border text-aura-text-dim text-xs tracking-widest uppercase hover:border-aura-accent/40 hover:text-aura-accent transition-all duration-200 min-h-[44px] flex-shrink-0"
        >
          + Add Category
        </button>
      )}

      {/* Divider */}
      <div className="h-px bg-aura-border/40 flex-shrink-0" />

      {/* Trigger Words section */}
      <TriggerWordsPanel
        config={triggerConfig}
        onChange={onUpdateTriggerConfig}
      />

      <p className="text-[10px] text-aura-text-muted text-center tracking-widest uppercase pb-2 flex-shrink-0">
        Aura Sense Companion Platform V1.1.0
      </p>
    </div>
  )
}

// ─── Trigger Words Panel ──────────────────────────────────────────────────────

function TriggerWordsPanel({
  config,
  onChange,
}: {
  config: TriggerConfig
  onChange: (c: TriggerConfig) => void
}) {
  const [newPhrase, setNewPhrase] = useState('')

  function addPhrase() {
    const phrase = newPhrase.trim().toLowerCase()
    if (!phrase || config.addPhrases.includes(phrase)) { setNewPhrase(''); return }
    onChange({ ...config, addPhrases: [...config.addPhrases, phrase] })
    setNewPhrase('')
  }

  function removePhrase(phrase: string) {
    onChange({ ...config, addPhrases: config.addPhrases.filter(p => p !== phrase) })
  }

  return (
    <div className="flex flex-col gap-3 flex-shrink-0">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-1 h-4 rounded-full bg-aura-cyan" aria-hidden />
        <h3 className="text-xs font-bold tracking-widest uppercase text-aura-text flex-1">
          Voice Memory Triggers
        </h3>
      </div>

      <p className="text-[11px] text-aura-text-dim leading-relaxed">
        When Aura hears these phrases in your speech, she will automatically save what follows into your{' '}
        <span className="text-aura-accent font-semibold">General</span> memory category.
      </p>

      {/* Enable toggle */}
      <div className="glass-card p-3">
        <Toggle
          checked={config.enabled}
          onChange={val => onChange({ ...config, enabled: val })}
          label="Auto-save from voice"
          description='e.g. "Aura, remember that my glasses are on the shelf"'
        />
      </div>

      {/* Phrase list */}
      <div className="glass-card overflow-hidden">
        <div className="px-4 py-2.5 border-b border-aura-border/30">
          <p className="text-[10px] text-aura-text-muted tracking-widest uppercase">Trigger Phrases</p>
        </div>
        <div className="flex flex-col">
          {config.addPhrases.map(phrase => (
            <div
              key={phrase}
              className="flex items-center gap-2 px-4 py-2.5 border-b border-aura-border/20"
            >
              <span className="flex-1 text-xs font-mono text-aura-cyan">"{phrase}"</span>
              <button
                onClick={() => removePhrase(phrase)}
                aria-label={`Remove trigger phrase: ${phrase}`}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center text-aura-text-muted hover:text-aura-red transition-colors rounded-lg flex-shrink-0"
              >
                <TrashIcon />
              </button>
            </div>
          ))}

          {/* Add phrase inline */}
          <div className="flex items-center gap-2 px-4 py-2.5">
            <input
              type="text"
              value={newPhrase}
              onChange={e => setNewPhrase(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addPhrase()}
              placeholder="Add trigger phrase..."
              className="flex-1 bg-aura-bg border border-aura-border rounded-xl px-3 py-2.5 text-sm text-aura-text placeholder-aura-text-muted focus:outline-none focus:border-aura-cyan/60 transition-all min-h-[44px]"
            />
            <button
              onClick={addPhrase}
              className="px-3 py-2.5 rounded-xl bg-aura-cyan/20 border border-aura-cyan/30 text-aura-cyan text-xs font-semibold hover:bg-aura-cyan/30 transition-all min-h-[44px] flex-shrink-0"
            >
              + Add
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Category Card ────────────────────────────────────────────────────────────

function CategoryCard({
  category,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onDeleteCategory,
}: {
  category: MemoryCategory
  onAddItem: (key: string, value: string) => void
  onEditItem: (id: string, key: string, value: string) => void
  onDeleteItem: (id: string) => void
  onDeleteCategory: () => void
}) {
  const [addKey, setAddKey] = useState('')
  const [addValue, setAddValue] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editKey, setEditKey] = useState('')
  const [editValue, setEditValue] = useState('')

  function handleAdd() {
    if (addKey.trim() && addValue.trim()) {
      onAddItem(addKey.trim(), addValue.trim())
      setAddKey('')
      setAddValue('')
      setShowForm(false)
    }
  }

  function startEdit(item: PersonalMemory) {
    setEditingId(item.id)
    setEditKey(item.key)
    setEditValue(item.value)
  }

  function handleEditSave() {
    if (editingId && editKey.trim() && editValue.trim()) {
      onEditItem(editingId, editKey.trim(), editValue.trim())
      setEditingId(null)
    }
  }

  function cancelEdit() {
    setEditingId(null)
    setEditKey('')
    setEditValue('')
  }

  const visibleItems = category.items.filter(
    item => item.key !== 'note' || (item.value !== 'Add items below' && item.value !== 'Auto-created by voice trigger'),
  )

  return (
    <div className="glass-card overflow-hidden flex-shrink-0">
      {/* Category header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-aura-border/30">
        <span className="text-sm font-semibold text-aura-text">{category.name}</span>
        <button
          onClick={onDeleteCategory}
          aria-label={`Delete ${category.name} category`}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center text-aura-text-muted hover:text-aura-red transition-colors rounded-lg"
        >
          <TrashIcon />
        </button>
      </div>

      <div className="flex flex-col">
        {visibleItems.map(item => (
          <div key={item.id} className="flex flex-col border-b border-aura-border/20">
            {editingId === item.id ? (
              /* Inline edit form */
              <div className="flex flex-col gap-2 px-4 py-3 animate-fade-in">
                <input
                  type="text"
                  value={editKey}
                  onChange={e => setEditKey(e.target.value)}
                  placeholder="Key"
                  autoFocus
                  className="w-full bg-aura-bg border border-aura-accent/40 rounded-xl px-3 py-2.5 text-sm text-aura-text placeholder-aura-text-muted focus:outline-none focus:border-aura-accent/60 transition-all min-h-[44px]"
                />
                <input
                  type="text"
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleEditSave()}
                  placeholder="Value"
                  className="w-full bg-aura-bg border border-aura-accent/40 rounded-xl px-3 py-2.5 text-sm text-aura-text placeholder-aura-text-muted focus:outline-none focus:border-aura-accent/60 transition-all min-h-[44px]"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleEditSave}
                    className="flex-1 py-2.5 rounded-xl bg-aura-accent text-white text-xs font-semibold tracking-widest uppercase hover:bg-aura-accent-dim transition-all min-h-[44px]"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="px-4 py-2.5 rounded-xl text-aura-text-dim text-xs hover:text-aura-text transition-colors min-h-[44px]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* Read-only row with edit + delete */
              <div className="flex items-center gap-1 px-4 py-3">
                <p className="flex-1 text-xs font-mono min-w-0">
                  <span className="text-aura-accent">{item.key}</span>
                  <span className="text-aura-text-muted">: </span>
                  <span className="text-aura-text">{item.value}</span>
                </p>
                <button
                  onClick={() => startEdit(item)}
                  aria-label={`Edit ${item.key}`}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center text-aura-text-muted hover:text-aura-accent transition-colors rounded-lg flex-shrink-0"
                >
                  <EditIcon />
                </button>
                <button
                  onClick={() => onDeleteItem(item.id)}
                  aria-label={`Delete ${item.key}`}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center text-aura-text-muted hover:text-aura-red transition-colors rounded-lg flex-shrink-0"
                >
                  <TrashIcon />
                </button>
              </div>
            )}
          </div>
        ))}

        {showForm && (
          <div className="flex flex-col gap-2 px-4 py-3 border-b border-aura-border/20 animate-fade-in">
            <input
              type="text"
              value={addKey}
              onChange={e => setAddKey(e.target.value)}
              placeholder="Key (e.g. glasses)"
              autoFocus
              className="w-full bg-aura-bg border border-aura-border rounded-xl px-3 py-2.5 text-sm text-aura-text placeholder-aura-text-muted focus:outline-none focus:border-aura-accent/60 transition-all min-h-[44px]"
            />
            <input
              type="text"
              value={addValue}
              onChange={e => setAddValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              placeholder="Value (e.g. on the nightstand)"
              className="w-full bg-aura-bg border border-aura-border rounded-xl px-3 py-2.5 text-sm text-aura-text placeholder-aura-text-muted focus:outline-none focus:border-aura-accent/60 transition-all min-h-[44px]"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                className="flex-1 py-2.5 rounded-xl bg-aura-accent text-white text-xs font-semibold tracking-widest uppercase hover:bg-aura-accent-dim transition-all min-h-[44px]"
              >
                Save
              </button>
              <button
                onClick={() => { setShowForm(false); setAddKey(''); setAddValue('') }}
                className="px-4 py-2.5 rounded-xl text-aura-text-dim text-xs hover:text-aura-text transition-colors min-h-[44px]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => setShowForm(v => !v)}
          className="w-full py-3 text-xs text-aura-accent tracking-widest uppercase hover:bg-aura-accent/5 transition-all duration-200 min-h-[44px]"
        >
          {showForm ? '— Cancel' : '+ Add New Data'}
        </button>
      </div>
    </div>
  )
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M2 3.5h10M5.5 3.5V2.5h3v1M5 3.5l.5 8h3l.5-8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
