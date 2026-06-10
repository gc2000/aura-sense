import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import TopBar from '@/components/layout/TopBar'

describe('TopBar', () => {
  it('renders AURA brand name', () => {
    render(<TopBar isConnected={false} onMenuClick={vi.fn()} onHistoryClick={vi.fn()} />)
    expect(screen.getByText('Aura')).toBeInTheDocument()
  })

  it('shows dimmed status dot when disconnected', () => {
    const { container } = render(<TopBar isConnected={false} onMenuClick={vi.fn()} onHistoryClick={vi.fn()} />)
    const dot = container.querySelector('[aria-hidden]')
    expect(dot).toHaveClass('bg-aura-text-muted')
  })

  it('shows green pulsing dot when connected', () => {
    const { container } = render(<TopBar isConnected={true} onMenuClick={vi.fn()} onHistoryClick={vi.fn()} />)
    const dot = container.querySelector('[aria-hidden]')
    expect(dot).toHaveClass('bg-aura-green')
  })

  it('calls onMenuClick when settings button clicked', () => {
    const onMenuClick = vi.fn()
    render(<TopBar isConnected={false} onMenuClick={onMenuClick} onHistoryClick={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /open settings/i }))
    expect(onMenuClick).toHaveBeenCalledOnce()
  })

  it('calls onHistoryClick when history button clicked', () => {
    const onHistoryClick = vi.fn()
    render(<TopBar isConnected={false} onMenuClick={vi.fn()} onHistoryClick={onHistoryClick} />)
    fireEvent.click(screen.getByRole('button', { name: /conversation history/i }))
    expect(onHistoryClick).toHaveBeenCalledOnce()
  })
})
