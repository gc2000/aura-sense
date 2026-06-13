import { useEffect, useRef } from 'react'

interface Props {
  audioLevelRef: React.MutableRefObject<number>
  active: boolean
}

const BAR_COUNT = 7
const BASE_HEIGHTS = [0.25, 0.45, 0.65, 1.0, 0.65, 0.45, 0.25]
const PHASE_OFFSETS = [0, 0.9, 1.8, 2.7, 3.6, 4.5, 5.4]
const MAX_BAR_PX = 28

export default function VoiceIndicator({ audioLevelRef, active }: Props) {
  const barsRef = useRef<(HTMLDivElement | null)[]>([])
  const frameRef = useRef<number>(0)
  const phaseRef = useRef<number[]>([...PHASE_OFFSETS])
  const smoothRef = useRef<number>(0)

  useEffect(() => {
    if (!active) {
      smoothRef.current = 0
      barsRef.current.forEach((bar, i) => {
        if (bar) bar.style.height = `${BASE_HEIGHTS[i] * MAX_BAR_PX * 0.2}px`
      })
      return
    }

    let last = performance.now()

    function animate(now: number) {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now

      const raw = audioLevelRef.current
      // Exponential smoothing: attack fast, decay slower
      smoothRef.current = raw > smoothRef.current
        ? smoothRef.current * 0.4 + raw * 0.6
        : smoothRef.current * 0.85 + raw * 0.15

      const level = smoothRef.current

      barsRef.current.forEach((bar, i) => {
        if (!bar) return
        phaseRef.current[i] += dt * (2.5 + i * 0.3)
        const idle = 0.15 + 0.1 * Math.sin(phaseRef.current[i])
        const active = level * BASE_HEIGHTS[i] * (0.9 + Math.random() * 0.2)
        const h = Math.max(idle, active) * MAX_BAR_PX
        bar.style.height = `${Math.min(MAX_BAR_PX, h)}px`
      })

      frameRef.current = requestAnimationFrame(animate)
    }

    frameRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameRef.current)
  }, [active, audioLevelRef])

  return (
    <div className="flex items-center justify-center py-3">
      <div
        className={`flex items-end justify-center gap-[3px] px-5 py-3 rounded-full transition-all duration-500 ${
          active
            ? 'bg-aura-accent/10 border border-aura-accent/30 shadow-[0_0_20px_rgba(99,102,241,0.15)]'
            : 'bg-white/5 border border-white/10'
        }`}
      >
        {Array.from({ length: BAR_COUNT }).map((_, i) => (
          <div
            key={i}
            ref={el => { barsRef.current[i] = el }}
            className="w-[3px] rounded-full transition-colors duration-300"
            style={{
              height: `${BASE_HEIGHTS[i] * MAX_BAR_PX * 0.2}px`,
              background: active
                ? `rgba(99,102,241,${0.5 + BASE_HEIGHTS[i] * 0.5})`
                : 'rgba(255,255,255,0.2)',
              boxShadow: active && i === 3
                ? '0 0 6px rgba(99,102,241,0.8)'
                : 'none',
            }}
          />
        ))}
      </div>
    </div>
  )
}
