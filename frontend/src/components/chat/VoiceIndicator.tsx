import { useEffect, useRef } from 'react'

interface Props {
  audioLevelRef: React.MutableRefObject<number>
  active: boolean
}

const H = 56
const CYCLES = 2.5

export default function VoiceIndicator({ audioLevelRef, active }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const glowRef = useRef<SVGPathElement>(null)
  const frameRef = useRef<number>(0)
  const phaseRef = useRef<number>(0)
  const smoothRef = useRef<number>(0)
  const breathRef = useRef<number>(0)

  useEffect(() => {
    function buildPath(W: number, amplitude: number, phase: number): string {
      const steps = 100
      const cy = H / 2
      const parts: string[] = []
      for (let i = 0; i <= steps; i++) {
        const x = (i / steps) * W
        const y = cy + amplitude * Math.sin((i / steps) * Math.PI * 2 * CYCLES + phase)
        parts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`)
      }
      return parts.join(' ')
    }

    let last = performance.now()

    function animate(now: number) {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now

      const W = svgRef.current?.clientWidth ?? 280

      // Smooth audio level: fast attack, slow decay
      const raw = active ? audioLevelRef.current : 0
      smoothRef.current = raw > smoothRef.current
        ? smoothRef.current * 0.25 + raw * 0.75
        : smoothRef.current * 0.94 + raw * 0.06

      const level = smoothRef.current

      // Breathing oscillation for idle
      breathRef.current += dt * (active ? 1.0 : 0.6)
      const breathAmp = active
        ? 5 + 2 * Math.sin(breathRef.current)
        : 3 + 2 * Math.sin(breathRef.current)

      // Wave speed and amplitude scale with voice
      const speed = active ? 2.0 + level * 5 : 0.8
      phaseRef.current -= dt * speed

      const amplitude = breathAmp + level * 22

      // Opacity and stroke weight scale with voice
      const opacity = active ? 0.75 + level * 0.25 : 0.35
      const strokeW = active ? 1.8 + level * 1.2 : 1.5
      const glowOpacity = active ? 0.2 + level * 0.3 : 0.08

      const d = buildPath(W, amplitude, phaseRef.current)

      if (pathRef.current) {
        pathRef.current.setAttribute('d', d)
        pathRef.current.setAttribute('stroke-opacity', opacity.toFixed(2))
        pathRef.current.setAttribute('stroke-width', strokeW.toFixed(1))
      }
      if (glowRef.current) {
        glowRef.current.setAttribute('d', d)
        glowRef.current.setAttribute('stroke-opacity', glowOpacity.toFixed(2))
      }

      frameRef.current = requestAnimationFrame(animate)
    }

    frameRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameRef.current)
  }, [active, audioLevelRef])

  return (
    <div className="flex items-center justify-center px-6 py-1">
      <svg
        ref={svgRef}
        width="100%"
        height={H}
        className="overflow-visible w-full"
      >
        <defs>
          <filter id="voice-glow" x="-20%" y="-80%" width="140%" height="260%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Glow layer */}
        <path
          ref={glowRef}
          fill="none"
          stroke="rgb(99,102,241)"
          strokeWidth="10"
          strokeLinecap="round"
          filter="url(#voice-glow)"
        />

        {/* Main wave */}
        <path
          ref={pathRef}
          fill="none"
          stroke="rgb(99,102,241)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}
