import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ConnectButton from '@/components/chat/ConnectButton'

describe('ConnectButton', () => {
  it('shows Go Live button when disconnected', () => {
    render(<ConnectButton status="disconnected" onConnect={vi.fn()} onDisconnect={vi.fn()} />)
    expect(screen.getByRole('button', { name: /connect to aura/i })).toBeInTheDocument()
    expect(screen.getByText('Go Live')).toBeInTheDocument()
  })

  it('shows Disconnect button when connected', () => {
    render(<ConnectButton status="connected" onConnect={vi.fn()} onDisconnect={vi.fn()} />)
    expect(screen.getByRole('button', { name: /disconnect from aura/i })).toBeInTheDocument()
    expect(screen.getByText('Disconnect')).toBeInTheDocument()
  })

  it('shows Connecting text and disables button during connection', () => {
    render(<ConnectButton status="connecting" onConnect={vi.fn()} onDisconnect={vi.fn()} />)
    expect(screen.getByText('Connecting...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /connect to aura/i })).toBeDisabled()
  })

  it('calls onConnect when Go Live clicked', () => {
    const onConnect = vi.fn()
    render(<ConnectButton status="disconnected" onConnect={onConnect} onDisconnect={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /connect to aura/i }))
    expect(onConnect).toHaveBeenCalledOnce()
  })

  it('calls onDisconnect when Disconnect clicked', () => {
    const onDisconnect = vi.fn()
    render(<ConnectButton status="connected" onConnect={vi.fn()} onDisconnect={onDisconnect} />)
    fireEvent.click(screen.getByRole('button', { name: /disconnect from aura/i }))
    expect(onDisconnect).toHaveBeenCalledOnce()
  })
})
