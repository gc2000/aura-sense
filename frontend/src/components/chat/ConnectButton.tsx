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

  return (
    <div className="px-4 py-3 flex justify-center">
      <button
        onClick={onConnect}
        disabled={isTransitioning}
        aria-label="Connect to Aura"
        className="relative flex items-center gap-2 px-8 py-2.5 rounded-2xl bg-aura-accent/15 border border-aura-accent/40 text-aura-accent text-xs font-semibold tracking-widest uppercase hover:bg-aura-accent/25 transition-all duration-200 shadow-glow-accent disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
      >
        {/* Breathing ring when transitioning */}
        {isTransitioning && (
          <span className="absolute inset-0 rounded-2xl border border-aura-accent/40 animate-[pulseRing_1.5s_ease-out_infinite]" aria-hidden />
        )}
        <span
          className={[
            'w-2 h-2 rounded-full',
            isTransitioning ? 'bg-aura-amber animate-pulse' : 'bg-aura-accent',
          ].join(' ')}
          aria-hidden
        />
        {isTransitioning ? 'Connecting...' : 'Go Live'}
      </button>
    </div>
  )
}
