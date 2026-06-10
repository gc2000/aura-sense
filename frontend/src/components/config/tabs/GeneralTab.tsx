import { useState } from 'react'

const PFS_OPTIONS = [
  { value: '1', label: 'Every 1s', fps: '1.00 FPS' },
  { value: '2', label: 'Every 2s', fps: '0.50 FPS' },
  { value: '3', label: 'Every 3s', fps: '0.33 FPS' },
]

export default function GeneralTab() {
  const [pfs, setPfs] = useState('1')
  const now = new Date()
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

  return (
    <div className="h-full flex flex-col gap-5 px-4 py-4 overflow-y-auto pb-safe">
      {/* General Settings */}
      <section>
        <SectionHeader title="General Settings" subtitle="Companion System Preferences" />
        <div className="glass-card p-4 flex items-center justify-between mt-3">
          <div>
            <p className="text-xs text-aura-text-dim tracking-widest uppercase">Auto-Detect</p>
            <p className="text-sm text-aura-text font-medium mt-0.5">System Time</p>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-aura-accent/10 border border-aura-accent/30 text-aura-accent text-xs tracking-wide hover:bg-aura-accent/20 transition-all">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
              <path d="M6 1v2M6 9v2M1 6h2M9 6h2M2.4 2.4l1.4 1.4M8.2 8.2l1.4 1.4M2.4 9.6l1.4-1.4M8.2 3.8l1.4-1.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            Auto-Detect
          </button>
        </div>
      </section>

      {/* Timezone */}
      <div className="glass-card p-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-aura-accent/10 flex items-center justify-center flex-shrink-0">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
            <circle cx="9" cy="9" r="7.5" stroke="#6c63ff" strokeWidth="1.2"/>
            <path d="M9 1.5C9 1.5 6 5.5 6 9s3 7.5 3 7.5M9 1.5C9 1.5 12 5.5 12 9s-3 7.5-3 7.5M1.5 9h15" stroke="#6c63ff" strokeWidth="1.2"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-aura-text-muted tracking-widest uppercase">Current Active Timezone</p>
          <p className="text-sm font-semibold text-aura-text truncate">{timezone}</p>
          <p className="text-xs text-aura-text-dim">
            Current Time: {now.toLocaleTimeString()}
          </p>
        </div>
      </div>

      {/* PFS */}
      <section>
        <div className="glass-card p-4">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-aura-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <rect x="1" y="3" width="12" height="8" rx="1.5" stroke="#6c63ff" strokeWidth="1.2"/>
                <path d="M5 3V2M9 3V2" stroke="#6c63ff" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-aura-text">PFS</p>
                <span className="text-[10px] text-aura-accent bg-aura-accent/10 px-2 py-0.5 rounded-full border border-aura-accent/20">
                  {PFS_OPTIONS.find(o => o.value === pfs)?.fps}
                </span>
              </div>
              <p className="text-[10px] text-aura-text-muted mt-0.5 leading-relaxed">
                Picture Frequency Setting — adjusts camera frame sampling rate
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {PFS_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setPfs(opt.value)}
                className={[
                  'flex flex-col items-center py-2.5 rounded-xl border text-xs font-medium transition-all duration-200',
                  pfs === opt.value
                    ? 'bg-aura-accent/15 border-aura-accent/50 text-aura-accent'
                    : 'bg-aura-surface border-aura-border text-aura-text-dim hover:border-aura-accent/30',
                ].join(' ')}
                aria-pressed={pfs === opt.value}
              >
                <span className="font-semibold">{opt.label}</span>
                <span className="text-[10px] opacity-70 mt-0.5">{opt.fps}</span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-1 h-4 rounded-full bg-aura-accent" aria-hidden />
      <div>
        <h3 className="text-xs font-bold tracking-widest uppercase text-aura-text">{title}</h3>
        {subtitle && <p className="text-[10px] text-aura-text-muted tracking-wider uppercase">{subtitle}</p>}
      </div>
    </div>
  )
}
