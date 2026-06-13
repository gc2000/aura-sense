import { useEffect, useRef } from 'react'

interface Props {
  audioLevelRef: React.MutableRefObject<number>
  active: boolean
}

const BAR_COUNT = 7
const BASE_HEIGHTS = [0.25, 0.45, 0.65, 1.0, 0.65, 0.45, 0.25]
const PHASE_OFFSETS = [0, 0.9, 1.8, 2.7, 3.6, 4.5, 5.4]
const BAR_HEIGHT_PX = 28

export default function VoiceIndicator({ audioLevelRef, active }: Props) {
  const barsRef = useRef<(HTMLDivElement | null)[]>([])
  const frameRef = useRef<number>(0)
  const phaseRef = useRef<number[]>([...PHASE_OFFSETS])
  const smoothRef = useRef<number>(0)

  useEffect(() => {
    if (!active) {
      smoothRef.current = 0
      barsRef.current.forEach((bar, i) => {
        if (bar) bar.style.transform = `scaleY(${BASE_HEIGHTS[i] * 0.15})`
      })
      return
    }

    let last = performance.now()

    function animate(now: number) {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now

      const raw = audioLevelRef.current
      smoothRef.current = raw > smoothRef.current
        ? smoothRef.current * 0.4 + raw * 0.6
        : smoothRef.current * 0.85 + raw * 0.15

      const level = smoothRef.current

      barsRef.current.forEach((bar, i) => {
        if (!bar) return
        phaseRef.current[i] += dt * (2.5 + i * 0.3)
        const idle = BASE_HEIGHTS[i] * (0.12 + 0.06 * Math.sin(phaseRef.current[i]))
        const voiced = level * BASE_HEIGHTS[i] * (0.9 + Math.random() * 0.2)
        const scale = Math.min(1, Math.max(idle, voiced))
        bar.style.transform = `scaleY(${scale})`
      })

      frameRef.current = requestAnimationFrame(animate)
    }

    frameRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameRef.current)
  }, [active, audioLevelRef])

  return (
    <div className="flex items-center justify-center py-2">
      <div
        className={`flex items-end justify-center gap-[3px] px-5 transition-all duration-500 rounded-full ${
          active
            ? 'bg-aura-accent/10 border border-aura-accent/30 shadow-[0_0_20px_rgba(99,102,241,0.15)]'
            : 'bg-white/5 border border-white/10'
        }`}
        style={{ height: `${BAR_HEIGHT_PX + 20}px` }}
      >
        {Array.from({ length: BAR_COUNT }).map((_, i) => (
          <div
            key={i}
            ref={el => { barsRef.current[i] = el }}
            className="w-[3px] rounded-full"
            style={{
              height: `${BAR_HEIGHT_PX}px`,
              transformOrigin: 'bottom',
              transform: `scaleY(${BASE_HEIGHTS[i] * 0.15})`,
              background: active
                ? `rgba(99,102,241,${0.4 + BASE_HEIGHTS[i] * 0.6})`
                : 'rgba(255,255,255,0.2)',
              boxShadow: active && i === 3 ? '0 0 6px rgba(99,102,241,0.7)' : 'none',
              transition: 'background 0.3s, box-shadow 0.3s',
            }}
          />
        ))}
      </div>
    </div>
  )
}
