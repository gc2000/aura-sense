import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TextInput } from '@/components/chat/TextInput'

describe('TextInput', () => {
  it('renders input and send button', () => {
    render(<TextInput onSend={vi.fn()} />)
    expect(screen.getByRole('textbox')).toBeDefined()
    expect(screen.getByRole('button', { name: /send/i })).toBeDefined()
  })

  it('calls onSend with trimmed text on button click', () => {
    const onSend = vi.fn()
    render(<TextInput onSend={onSend} />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: '  hello  ' } })
    fireEvent.click(screen.getByRole('button', { name: /send/i }))
    expect(onSend).toHaveBeenCalledWith('hello')
  })

  it('calls onSend on Enter key', () => {
    const onSend = vi.fn()
    render(<TextInput onSend={onSend} />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'test message' } })
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })
    expect(onSend).toHaveBeenCalledWith('test message')
  })

  it('clears input after send', () => {
    render(<TextInput onSend={vi.fn()} />)
    const input = screen.getByRole('textbox') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'hello' } })
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })
    expect(input.value).toBe('')
  })

  it('does not call onSend when disabled', () => {
    const onSend = vi.fn()
    render(<TextInput onSend={onSend} disabled />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'hello' } })
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })
    expect(onSend).not.toHaveBeenCalled()
  })

  it('does not call onSend for empty / whitespace-only input', () => {
    const onSend = vi.fn()
    render(<TextInput onSend={onSend} />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: '   ' } })
    fireEvent.click(screen.getByRole('button', { name: /send/i }))
    expect(onSend).not.toHaveBeenCalled()
  })

  it('shows disabled placeholder when disabled', () => {
    render(<TextInput onSend={vi.fn()} disabled />)
    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.placeholder).toBe('Connect to start typing')
  })
})
