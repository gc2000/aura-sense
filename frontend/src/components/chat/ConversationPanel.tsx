import { useEffect, useRef } from 'react'
import type { ConversationMessage } from '@/types'
import MessageBubble from './MessageBubble'

interface ConversationPanelProps {
  messages: ConversationMessage[]
  agentName?: string
}

export default function ConversationPanel({ messages, agentName = 'Aura' }: ConversationPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div
      className="flex flex-col h-40 overflow-y-auto px-4 py-2 gap-0.5 bg-black/40 backdrop-blur-sm"
      role="log"
      aria-label="Conversation"
      aria-live="polite"
    >
      {messages.length === 0 ? (
        <p className="text-xs text-aura-text-muted text-center py-4 tracking-widest uppercase">
          {agentName} is ready
        </p>
      ) : (
        messages.map(msg => (
          <MessageBubble
            key={msg.id}
            role={msg.role}
            content={msg.content}
          />
        ))
      )}
      <div ref={bottomRef} />
    </div>
  )
}
