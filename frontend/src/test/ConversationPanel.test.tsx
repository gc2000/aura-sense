import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ConversationPanel from '@/components/chat/ConversationPanel'
import type { ConversationMessage } from '@/types'

function makeMsg(role: ConversationMessage['role'], content: string, id = Math.random().toString()): ConversationMessage {
  return {
    id,
    conversationId: 'test',
    role,
    content,
    language: 'en',
    modality: 'voice',
    relatedMemoryIds: [],
    timestamp: new Date().toISOString(),
  }
}

describe('ConversationPanel', () => {
  it('shows ready placeholder when messages array is empty', () => {
    render(<ConversationPanel messages={[]} />)
    expect(screen.getByText(/aura is ready/i)).toBeInTheDocument()
  })

  it('shows custom agent name in placeholder', () => {
    render(<ConversationPanel messages={[]} agentName="Zephyr" />)
    expect(screen.getByText(/zephyr is ready/i)).toBeInTheDocument()
  })

  it('renders user and assistant messages', () => {
    const messages = [
      makeMsg('user', 'Where are my keys?'),
      makeMsg('assistant', 'Your keys are on the hook.'),
    ]
    render(<ConversationPanel messages={messages} />)
    expect(screen.getByText('Where are my keys?')).toBeInTheDocument()
    expect(screen.getByText('Your keys are on the hook.')).toBeInTheDocument()
  })

  it('renders system messages', () => {
    const messages = [makeMsg('system', 'Microphone access denied.')]
    render(<ConversationPanel messages={messages} />)
    expect(screen.getByText('Microphone access denied.')).toBeInTheDocument()
  })

  it('omits bubbles for empty-content messages', () => {
    const messages = [makeMsg('assistant', '')]
    render(<ConversationPanel messages={messages} />)
    // Empty content → MessageBubble returns null; placeholder NOT shown because array is not empty
    expect(screen.queryByText(/aura is ready/i)).not.toBeInTheDocument()
  })

  it('has accessible role="log" and aria-live', () => {
    render(<ConversationPanel messages={[]} />)
    const log = screen.getByRole('log')
    expect(log).toHaveAttribute('aria-live', 'polite')
  })
})
