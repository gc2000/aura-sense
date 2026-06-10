import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import StatusBar from '@/components/chat/StatusBar'

describe('StatusBar', () => {
  it('shows Disconnected text when disconnected', () => {
    render(<StatusBar status="disconnected" />)
    expect(screen.getByRole('status')).toHaveTextContent('Disconnected')
  })

  it('shows active mode text when connected', () => {
    render(<StatusBar status="connected" agentName="Aura" />)
    expect(screen.getByRole('status')).toHaveTextContent('Active Mode: Aura (Orchestrator)')
  })

  it('shows Listening text when listening', () => {
    render(<StatusBar status="listening" />)
    expect(screen.getByRole('status')).toHaveTextContent('Listening...')
  })

  it('shows Processing text when processing', () => {
    render(<StatusBar status="processing" />)
    expect(screen.getByRole('status')).toHaveTextContent('Processing...')
  })

  it('shows error text when errored', () => {
    render(<StatusBar status="error" />)
    expect(screen.getByRole('status')).toHaveTextContent('Connection Error')
  })

  it('has aria-live polite for screen readers', () => {
    render(<StatusBar status="disconnected" />)
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite')
  })
})
