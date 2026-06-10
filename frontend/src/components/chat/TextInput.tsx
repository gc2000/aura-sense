import { useState, useRef, type KeyboardEvent } from 'react'

interface TextInputProps {
  onSend: (text: string) => void
  disabled?: boolean
  placeholder?: string
}

export function TextInput({ onSend, disabled = false, placeholder = 'Type a message…' }: TextInputProps) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSend = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
    inputRef.current?.focus()
  }

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex items-center gap-2 px-4 pb-4 pt-2">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKey}
        disabled={disabled}
        placeholder={disabled ? 'Connect to start typing' : placeholder}
        aria-label="Text message input"
        className={[
          'flex-1 rounded-full px-4 py-2 text-sm',
          'bg-aura-card border border-white/10 text-aura-text placeholder-aura-text/30',
          'focus:outline-none focus:border-aura-accent/60',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          'transition-colors',
        ].join(' ')}
      />
      <button
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        aria-label="Send message"
        className={[
          'w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0',
          'bg-aura-accent disabled:opacity-30 disabled:cursor-not-allowed',
          'hover:bg-aura-accent/80 active:scale-95 transition-all',
        ].join(' ')}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M14 8L2 2l2.5 6L2 14l12-6z" fill="white" />
        </svg>
      </button>
    </div>
  )
}
