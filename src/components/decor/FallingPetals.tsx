import { useMemo } from 'react'

const COLORS = [
  'var(--color-gold)',
  'var(--color-purple-light)',
  'var(--cream-card)',
  'var(--color-gold-light)',
]

function PetalShape({ color }: { color: string }) {
  return (
    <svg width="14" height="18" viewBox="0 0 14 18" fill="none">
      <path
        d="M7 0C7 0 14 6 14 11C14 14.866 10.866 18 7 18C3.134 18 0 14.866 0 11C0 6 7 0 7 0Z"
        fill={color}
        fillOpacity="0.9"
      />
    </svg>
  )
}

/** Ambient falling petals, restrained density so it reads as atmosphere, not confetti. */
export function FallingPetals({ count = 14 }: { count?: number }) {
  const petals = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        duration: 9 + Math.random() * 7,
        delay: -(Math.random() * 16),
        drift: Math.round((Math.random() - 0.5) * 160),
        rotate: Math.round(180 + Math.random() * 360),
        swayDuration: 2.5 + Math.random() * 2,
        color: COLORS[i % COLORS.length],
        scale: 0.7 + Math.random() * 0.6,
      })),
    [count],
  )

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {petals.map((p) => (
        <div
          key={p.id}
          className="petal"
          style={{
            left: `${p.left}%`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            // @ts-expect-error custom properties for the petal-fall keyframe
            '--drift': `${p.drift}px`,
            '--rotate': `${p.rotate}deg`,
            transform: `scale(${p.scale})`,
          }}
        >
          <span style={{ animationDuration: `${p.swayDuration}s` }}>
            <PetalShape color={p.color} />
          </span>
        </div>
      ))}
    </div>
  )
}
