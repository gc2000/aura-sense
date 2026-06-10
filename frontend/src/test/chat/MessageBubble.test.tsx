import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import MessageBubble from '@/components/chat/MessageBubble'

describe('MessageBubble', () => {
  it('renders nothing for empty or whitespace content', () => {
    const { container } = render(<MessageBubble role="assistant" content="   " />)
    expect(container.firstChild).toBeNull()
  })

  it('renders user message right-aligned', () => {
    render(<MessageBubble role="user" content="Hello Aura" />)
    expect(screen.getByText('Hello Aura')).toBeInTheDocument()
    expect(screen.getByText('Hello Aura').parentElement).toHaveClass('justify-end')
  })

  it('renders assistant message left-aligned', () => {
    render(<MessageBubble role="assistant" content="Hello! How can I help?" />)
    expect(screen.getByText('Hello! How can I help?').parentElement).toHaveClass('justify-start')
  })

  it('renders system message as centered span', () => {
    render(<MessageBubble role="system" content="Connected" />)
    expect(screen.getByText('Connected').tagName).toBe('SPAN')
  })

  it('user bubble has right-side rounded corner class', () => {
    render(<MessageBubble role="user" content="Test" />)
    expect(screen.getByText('Test')).toHaveClass('rounded-br-sm')
  })

  it('assistant bubble has left-side rounded corner class', () => {
    render(<MessageBubble role="assistant" content="Test" />)
    expect(screen.getByText('Test')).toHaveClass('rounded-bl-sm')
  })
})
