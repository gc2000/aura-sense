import { useEffect, useRef } from 'react'

interface Props {
  audioLevelRef: React.MutableRefObject<number>
  active: boolean
}

const H = 32
const CYCLES = 2.5
const PHASE_OFFSETS = [0, Math.PI * 0.6, Math.PI * 1.2]
const OPACITIES = [0.9, 0.55, 0.3]

export default function VoiceIndicator({ audioLevelRef, active }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const pathRefs = useRef<(SVGPathElement | null)[]>([null, null, null])
  const frameRef = useRef<number>(0)
  const phaseRef = useRef<number>(0)
  const smoothRef = useRef<number>(0)
  const breathRef = useRef<number>(0)

  useEffect(() => {
    function buildPath(W: number, amplitude: number, phase: number, phaseOffset: number): string {
      const steps = 80
      const cy = H / 2
      const parts: string[] = []
      for (let i = 0; i <= steps; i++) {
        const x = (i / steps) * W
        const y = cy + amplitude * Math.sin((i / steps) * Math.PI * 2 * CYCLES + phase + phaseOffset)
        parts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`)
      }
      return parts.join(' ')
    }

    let last = performance.now()

    function animate(now: number) {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now

      const W = svgRef.current?.clientWidth ?? 200

      const raw = active ? audioLevelRef.current : 0
      smoothRef.current = raw > smoothRef.current
        ? smoothRef.current * 0.25 + raw * 0.75
        : smoothRef.current * 0.94 + raw * 0.06

      const level = smoothRef.current

      breathRef.current += dt * (active ? 0.9 : 0.5)
      const breathAmp = 2.5 + 1.2 * Math.sin(breathRef.current)

      const speed = active ? 1.8 + level * 4 : 0.7
      phaseRef.current -= dt * speed

      const amplitude = breathAmp + level * 10

      pathRefs.current.forEach((path, i) => {
        if (!path) return
        const d = buildPath(W, amplitude, phaseRef.current, PHASE_OFFSETS[i])
        path.setAttribute('d', d)
        const opacity = active
          ? OPACITIES[i] * (0.7 + level * 0.3)
          : OPACITIES[i] * 0.4
        path.setAttribute('stroke-opacity', opacity.toFixed(2))
      })

      frameRef.current = requestAnimationFrame(animate)
    }

    frameRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameRef.current)
  }, [active, audioLevelRef])

  return (
    <div className="flex items-center justify-center px-8 py-1">
      <svg ref={svgRef} width="100%" height={H} className="overflow-visible">
        {PHASE_OFFSETS.map((_, i) => (
          <path
            key={i}
            ref={el => { pathRefs.current[i] = el }}
            fill="none"
            stroke="rgb(99,102,241)"
            strokeWidth={i === 0 ? '1.5' : '1'}
            strokeLinecap="round"
          />
        ))}
      </svg>
    </div>
  )
}
