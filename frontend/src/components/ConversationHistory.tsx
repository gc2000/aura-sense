import { useState } from 'react'
import type { Conversation, ConversationMessage } from '@/types'

interface ConversationHistoryProps {
  isOpen: boolean
  onClose: () => void
  conversations: Conversation[]
  onDelete: (id: string) => void
  onClearAll: () => void
}

export default function ConversationHistory({
  isOpen,
  onClose,
  conversations,
  onDelete,
  onClearAll,
}: ConversationHistoryProps) {
  const [search, setSearch] = useState('')
  const [confirmClear, setConfirmClear] = useState(false)

  if (!isOpen) return null

  const filtered = search.trim()
    ? conversations.filter(conv =>
        conv.messages.some(m =>
          m.content.toLowerCase().includes(search.toLowerCase())
        )
      )
    : conversations

  function handleClearAll() {
    if (confirmClear) {
      onClearAll()
      setConfirmClear(false)
    } else {
      setConfirmClear(true)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-aura-bg animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Conversation History"
    >
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-aura-border flex-shrink-0 safe-top">
        <h2 className="flex-1 text-sm font-bold tracking-widest uppercase text-aura-text">
          History
        </h2>
        {conversations.length > 0 && (
          <button
            onClick={handleClearAll}
            className={`text-xs tracking-widest uppercase px-3 py-1.5 rounded-lg border transition-all min-h-[36px] ${
              confirmClear
                ? 'border-aura-red text-aura-red hover:bg-aura-red/10'
                : 'border-aura-border text-aura-text-dim hover:text-aura-text hover:border-aura-border/60'
            }`}
          >
            {confirmClear ? 'Confirm Clear' : 'Clear All'}
          </button>
        )}
        <button
          onClick={() => { onClose(); setConfirmClear(false) }}
          aria-label="Close history"
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl border border-aura-border text-aura-text-dim hover:text-aura-text hover:border-aura-accent/40 transition-all"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </header>

      {/* Search */}
      {conversations.length > 0 && (
        <div className="px-4 py-3 border-b border-aura-border/40 flex-shrink-0">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-aura-text-muted"
              width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden
            >
              <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M9.5 9.5l3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search conversations…"
              className="w-full bg-aura-surface border border-aura-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-aura-text placeholder-aura-text-muted focus:outline-none focus:border-aura-accent/60 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-aura-text-muted hover:text-aura-text"
                aria-label="Clear search"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                  <path d="M2 2l8 8M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 pb-safe">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center flex-1 py-16">
            <p className="text-xs text-aura-text-muted tracking-widest uppercase">
              {search ? 'No matching conversations' : 'No conversations yet'}
            </p>
          </div>
        ) : (
          filtered.map(conv => (
            <ConversationCard
              key={conv.id}
              conversation={conv}
              searchTerm={search}
              onDelete={() => onDelete(conv.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}

// ─── Conversation Card ────────────────────────────────────────────────────────

function ConversationCard({
  conversation,
  searchTerm,
  onDelete,
}: {
  conversation: Conversation
  searchTerm: string
  onDelete: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const nonSystem = conversation.messages.filter(m => m.role !== 'system')
  if (nonSystem.length === 0) return null

  const preview = nonSystem[0]
  const msgCount = nonSystem.length
  const date = new Date(conversation.createdAt)

  return (
    <div className="glass-card overflow-hidden">
      {/* Card header — tap to expand */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-white/3 transition-all"
        aria-expanded={expanded}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] text-aura-text-muted tracking-widest">
              {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="text-[10px] text-aura-text-muted">·</span>
            <span className="text-[10px] text-aura-text-muted tracking-widest">
              {msgCount} {msgCount === 1 ? 'message' : 'messages'}
            </span>
          </div>
          <p className="text-xs text-aura-text-dim truncate italic">
            &ldquo;{preview.content}&rdquo;
          </p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
          <svg
            width="12" height="12" viewBox="0 0 12 12" fill="none"
            className={`text-aura-text-muted transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
            aria-hidden
          >
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </button>

      {/* Expanded messages */}
      {expanded && (
        <div className="border-t border-aura-border/30">
          <div className="px-3 py-3 flex flex-col gap-1.5 max-h-64 overflow-y-auto">
            {nonSystem.map(msg => (
              <HistoryBubble key={msg.id} message={msg} searchTerm={searchTerm} />
            ))}
          </div>
          <div className="px-4 py-2 border-t border-aura-border/20 flex justify-end">
            <button
              onClick={onDelete}
              aria-label="Delete this conversation"
              className="flex items-center gap-1.5 text-[10px] text-aura-text-muted hover:text-aura-red tracking-widest uppercase transition-colors py-1 px-2 rounded-lg hover:bg-aura-red/5"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                <path d="M1.5 3h9M4.5 3V2h3v1M4 3l.5 7h3L8 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Message Bubble ───────────────────────────────────────────────────────────

function HistoryBubble({
  message,
  searchTerm,
}: {
  message: ConversationMessage
  searchTerm: string
}) {
  const isUser = message.role === 'user'
  const content = searchTerm
    ? highlightMatch(message.content, searchTerm)
    : message.content

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] px-3 py-2 rounded-2xl text-xs leading-relaxed break-words ${
          isUser
            ? 'bg-aura-accent/20 text-aura-text rounded-br-sm'
            : 'bg-aura-surface text-aura-text rounded-bl-sm'
        }`}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  )
}

function highlightMatch(text: string, term: string): string {
  if (!term.trim()) return escapeHtml(text)
  const escaped = escapeHtml(text)
  const escapedTerm = escapeHtml(term).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return escaped.replace(
    new RegExp(`(${escapedTerm})`, 'gi'),
    '<mark class="bg-aura-accent/30 text-aura-text rounded px-0.5">$1</mark>',
  )
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
