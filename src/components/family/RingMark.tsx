import { cn } from '@/lib/cn'

type Props = {
  className?: string
  /** Draws itself in and turns slowly (CSS only; still for reduced motion). */
  animated?: boolean
}

const rings = [180, 140, 100, 60]
// Written out in full so Tailwind sees each class: the draw-in is staggered ring by ring.
const steps = ['[--ring-step:0]', '[--ring-step:1]', '[--ring-step:2]', '[--ring-step:3]']

/**
 * The family mark shared by EthicAI and Selma: concentric rings around a person at the centre,
 * with two orbiting points. Decorative, and drawn in `currentColor`.
 */
export function RingMark({ className, animated = false }: Props) {
  return (
    <svg
      viewBox="0 0 400 400"
      aria-hidden="true"
      focusable="false"
      className={cn(animated && 'rings-animated', className)}
    >
      <g fill="none" stroke="currentColor" strokeWidth="1.25">
        {rings.map((r, i) => (
          <circle
            key={r}
            className={cn('ring', steps[i])}
            cx="200"
            cy="200"
            r={r}
            pathLength={1}
            opacity={0.25 + i * 0.15}
          />
        ))}
        <path
          className="ring [--ring-step:4]"
          d="M20 200h360M200 20v360"
          pathLength={1}
          opacity="0.18"
        />
      </g>
      <circle cx="200" cy="200" r="10" fill="currentColor" />
      <g className="orbit">
        <circle cx="300" cy="130" r="6" fill="currentColor" opacity="0.75" />
      </g>
      <g className="orbit orbit-reverse">
        <circle cx="110" cy="290" r="6" fill="currentColor" opacity="0.75" />
      </g>
    </svg>
  )
}
