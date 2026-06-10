interface TopBarProps {
  isConnected: boolean
  onMenuClick: () => void
  onHistoryClick: () => void
}

export default function TopBar({ isConnected, onMenuClick, onHistoryClick }: TopBarProps) {
  return (
    <header className="flex items-center justify-between px-4 h-14 flex-shrink-0 z-10 bg-black/40 backdrop-blur-sm">
      {/* Brand */}
      <div className="flex items-center gap-2">
        <span
          className={[
            'w-2 h-2 rounded-full transition-colors duration-500',
            isConnected ? 'bg-aura-green shadow-glow-green animate-pulse' : 'bg-aura-text-muted',
          ].join(' ')}
          aria-hidden
        />
        <span className="text-sm font-bold tracking-[0.25em] uppercase text-aura-text">Aura</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <IconButton onClick={onHistoryClick} aria-label="Conversation history">
          <HistoryIcon />
        </IconButton>
        <IconButton onClick={onMenuClick} aria-label="Open settings">
          <MenuIcon />
        </IconButton>
      </div>
    </header>
  )
}

function IconButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className="w-9 h-9 flex items-center justify-center rounded-xl text-aura-text-dim hover:text-aura-text hover:bg-white/5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aura-accent/60"
      {...props}
    >
      {children}
    </button>
  )
}

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M2 4.5h14M2 9h14M2 13.5h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function HistoryIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 5.5V9l2.5 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
