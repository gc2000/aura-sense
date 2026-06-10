import type { MessageRole } from '@/types'

interface MessageBubbleProps {
  role: MessageRole
  content: string
  timestamp?: string
}

export default function MessageBubble({ role, content }: MessageBubbleProps) {
  const isUser = role === 'user'
  const isSystem = role === 'system'

  if (!content?.trim()) return null

  if (isSystem) {
    return (
      <div className="flex justify-center py-1 animate-fade-in">
        <span className="text-[10px] text-aura-text-muted tracking-wide px-2">{content}</span>
      </div>
    )
  }

  return (
    <div className={`flex py-1 animate-fade-in ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] px-3 py-2 rounded-2xl text-xs leading-relaxed break-words ${
          isUser
            ? 'bg-aura-accent/20 text-aura-text rounded-br-sm'
            : 'bg-aura-surface text-aura-text rounded-bl-sm'
        }`}
      >
        {content}
      </div>
    </div>
  )
}
