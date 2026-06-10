interface CrosshairOverlayProps {
  isConnected: boolean
}

export default function CrosshairOverlay({ isConnected }: CrosshairOverlayProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden>
      {/* Corner brackets */}
      <div className="relative w-48 h-48">
        {/* Top-left */}
        <Corner position="top-left" />
        {/* Top-right */}
        <Corner position="top-right" />
        {/* Bottom-left */}
        <Corner position="bottom-left" />
        {/* Bottom-right */}
        <Corner position="bottom-right" />

        {/* Center crosshair */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {/* Horizontal line */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-px w-6 h-px bg-aura-accent/60" />
            {/* Vertical line */}
            <div className="absolute top-1/2 left-1/2 -translate-x-px -translate-y-1/2 w-px h-6 bg-aura-accent/60" />
          </div>
        </div>
      </div>

      {/* Scan line animation when connected */}
      {isConnected && (
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-aura-accent/40 to-transparent animate-[slideDown_3s_linear_infinite]" />
      )}
    </div>
  )
}

function Corner({ position }: { position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }) {
  const posClass = {
    'top-left': 'top-0 left-0',
    'top-right': 'top-0 right-0 rotate-90',
    'bottom-left': 'bottom-0 left-0 -rotate-90',
    'bottom-right': 'bottom-0 right-0 rotate-180',
  }[position]

  return (
    <div className={`absolute ${posClass} w-5 h-5`}>
      <div className="absolute top-0 left-0 w-full h-px bg-aura-accent/70" />
      <div className="absolute top-0 left-0 w-px h-full bg-aura-accent/70" />
    </div>
  )
}
