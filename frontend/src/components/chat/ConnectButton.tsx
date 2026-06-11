import type { ConnectionStatus } from '@/types'

interface ConnectButtonProps {
  status: ConnectionStatus
  onConnect: () => void
  onDisconnect: () => void
}

export default function ConnectButton({ status, onConnect, onDisconnect }: ConnectButtonProps) {
  const isConnected = status === 'connected' || status === 'listening' || status === 'processing' || status === 'responding'
  const isTransitioning = status === 'connecting' || status === 'reconnecting'

  if (isConnected) {
    return (
      <div className="px-4 py-3 flex justify-center">
        <button
          onClick={onDisconnect}
          aria-label="Disconnect from Aura"
          className="flex items-center gap-2 px-8 py-2.5 rounded-2xl bg-aura-red/15 border border-aura-red/40 text-aura-red text-xs font-semibold tracking-widest uppercase hover:bg-aura-red/25 transition-all duration-200 shadow-glow-red active:scale-95"
        >
          <span className="w-2 h-2 rounded-full bg-aura-red animate-pulse" aria-hidden />
          Disconnect
        </button>
      </div>
    )
  }

  // While connecting for the first time (auto-connect), show a subtle status only
  if (isTransitioning) {
    return (
      <div className="px-4 py-3 flex justify-center">
        <div className="flex items-center gap-2 text-aura-text-muted text-xs tracking-widest uppercase">
          <span className="w-2 h-2 rounded-full bg-aura-amber animate-pulse" aria-hidden />
          Connecting…
        </div>
      </div>
    )
  }

  // Disconnected or error — show reconnect button so user can retry manually
  return (
    <div className="px-4 py-3 flex justify-center">
      <button
        onClick={onConnect}
        aria-label="Connect to Aura"
        className="relative flex items-center gap-2 px-8 py-2.5 rounded-2xl bg-aura-accent/15 border border-aura-accent/40 text-aura-accent text-xs font-semibold tracking-widest uppercase hover:bg-aura-accent/25 transition-all duration-200 shadow-glow-accent active:scale-95"
      >
        <span className="w-2 h-2 rounded-full bg-aura-accent" aria-hidden />
        Reconnect
      </button>
    </div>
  )
}
