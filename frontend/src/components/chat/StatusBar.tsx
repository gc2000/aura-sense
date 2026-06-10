import type { ConnectionStatus } from '@/types'

interface StatusBarProps {
  status: ConnectionStatus
  agentName?: string
}

const statusText: Record<ConnectionStatus, string> = {
  disconnected: 'Disconnected',
  connecting: 'Connecting...',
  connected: 'Active Mode: Aura (Orchestrator)',
  listening: 'Listening...',
  processing: 'Processing...',
  responding: 'Responding...',
  reconnecting: 'Reconnecting...',
  error: 'Connection Error',
}

const statusColor: Record<ConnectionStatus, string> = {
  disconnected: 'text-aura-text-muted',
  connecting: 'text-aura-amber animate-pulse',
  connected: 'text-aura-cyan',
  listening: 'text-aura-green animate-pulse',
  processing: 'text-aura-amber animate-pulse',
  responding: 'text-aura-accent animate-pulse',
  reconnecting: 'text-aura-amber animate-pulse',
  error: 'text-aura-red',
}

export default function StatusBar({ status, agentName }: StatusBarProps) {
  const label = agentName && status === 'connected'
    ? `Active Mode: ${agentName} (Orchestrator)`
    : statusText[status]

  return (
    <div
      className="px-4 py-1.5 bg-black/40 backdrop-blur-sm"
      role="status"
      aria-live="polite"
      aria-label="Connection status"
    >
      <p className={`text-[11px] tracking-widest uppercase font-medium ${statusColor[status]}`}>
        {label}
      </p>
    </div>
  )
}
