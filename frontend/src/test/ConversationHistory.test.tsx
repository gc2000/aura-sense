import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ConversationHistory from '@/components/ConversationHistory'
import type { Conversation } from '@/types'

const mockConversations: Conversation[] = [
  {
    id: 'c1',
    userId: 'u1',
    agentId: 'aura',
    subagentId: null,
    title: 'Session 1',
    createdAt: new Date('2026-06-08T10:00:00').toISOString(),
    updatedAt: new Date('2026-06-08T10:05:00').toISOString(),
    messages: [
      { id: 'm1', conversationId: 'c1', role: 'user', content: 'What is in front of me?', language: 'en', modality: 'voice', relatedMemoryIds: [], timestamp: new Date().toISOString() },
      { id: 'm2', conversationId: 'c1', role: 'assistant', content: 'There is a clear path ahead.', language: 'en', modality: 'voice', relatedMemoryIds: [], timestamp: new Date().toISOString() },
    ],
  },
]

const DEFAULT_PROPS = {
  isOpen: true,
  onClose: vi.fn(),
  onDelete: vi.fn(),
  onClearAll: vi.fn(),
}

describe('ConversationHistory', () => {
  it('does not render when closed', () => {
    render(<ConversationHistory {...DEFAULT_PROPS} isOpen={false} conversations={[]} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders when open', () => {
    render(<ConversationHistory {...DEFAULT_PROPS} conversations={[]} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByLabelText('Conversation History')).toBeInTheDocument()
  })

  it('shows empty state when no conversations', () => {
    render(<ConversationHistory {...DEFAULT_PROPS} conversations={[]} />)
    expect(screen.getByText(/no conversations yet/i)).toBeInTheDocument()
  })

  it('shows conversation preview and message count', () => {
    render(<ConversationHistory {...DEFAULT_PROPS} conversations={mockConversations} />)
    expect(screen.getByText(/What is in front of me/)).toBeInTheDocument()
    expect(screen.getByText(/2 messages/i)).toBeInTheDocument()
  })

  it('expands conversation on card click to show messages', () => {
    render(<ConversationHistory {...DEFAULT_PROPS} conversations={mockConversations} />)
    fireEvent.click(screen.getByRole('button', { expanded: false }))
    expect(screen.getByText('What is in front of me?')).toBeInTheDocument()
    expect(screen.getByText('There is a clear path ahead.')).toBeInTheDocument()
  })

  it('calls onDelete when Delete button clicked', () => {
    const onDelete = vi.fn()
    render(<ConversationHistory {...DEFAULT_PROPS} conversations={mockConversations} onDelete={onDelete} />)
    // Expand first
    fireEvent.click(screen.getByRole('button', { expanded: false }))
    fireEvent.click(screen.getByRole('button', { name: /delete this conversation/i }))
    expect(onDelete).toHaveBeenCalledWith('c1')
  })

  it('shows Clear All button when conversations exist', () => {
    render(<ConversationHistory {...DEFAULT_PROPS} conversations={mockConversations} />)
    expect(screen.getByRole('button', { name: /clear all/i })).toBeInTheDocument()
  })

  it('requires confirmation before clearing all', () => {
    const onClearAll = vi.fn()
    render(<ConversationHistory {...DEFAULT_PROPS} conversations={mockConversations} onClearAll={onClearAll} />)
    fireEvent.click(screen.getByRole('button', { name: /clear all/i }))
    expect(screen.getByRole('button', { name: /confirm clear/i })).toBeInTheDocument()
    expect(onClearAll).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: /confirm clear/i }))
    expect(onClearAll).toHaveBeenCalledOnce()
  })

  it('filters conversations by search term', () => {
    const convs: Conversation[] = [
      { ...mockConversations[0], id: 'c1', messages: [{ id: 'm1', conversationId: 'c1', role: 'user', content: 'find my glasses', language: 'en', modality: 'voice', relatedMemoryIds: [], timestamp: '' }] },
      { ...mockConversations[0], id: 'c2', messages: [{ id: 'm2', conversationId: 'c2', role: 'user', content: 'what time is it', language: 'en', modality: 'voice', relatedMemoryIds: [], timestamp: '' }] },
    ]
    render(<ConversationHistory {...DEFAULT_PROPS} conversations={convs} />)
    fireEvent.change(screen.getByPlaceholderText(/search conversations/i), { target: { value: 'glasses' } })
    expect(screen.getByText(/find my glasses/)).toBeInTheDocument()
    expect(screen.queryByText(/what time is it/)).not.toBeInTheDocument()
  })

  it('shows no-match message when search finds nothing', () => {
    render(<ConversationHistory {...DEFAULT_PROPS} conversations={mockConversations} />)
    fireEvent.change(screen.getByPlaceholderText(/search conversations/i), { target: { value: 'zzznomatch' } })
    expect(screen.getByText(/no matching conversations/i)).toBeInTheDocument()
  })

  it('calls onClose when close button clicked', () => {
    const onClose = vi.fn()
    render(<ConversationHistory {...DEFAULT_PROPS} onClose={onClose} conversations={[]} />)
    fireEvent.click(screen.getByRole('button', { name: /close history/i }))
    expect(onClose).toHaveBeenCalledOnce()
  })
})
