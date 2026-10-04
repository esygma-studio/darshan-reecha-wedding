import { useMemo } from 'react'

const COLORS = [
  'var(--color-gold)',
  'var(--color-gold-light)',
  'var(--color-purple)',
  'var(--color-purple-light)',
  'var(--color-gold-deep)',
  'var(--color-plum)',
]

/** One-shot celebratory burst, mounted imperatively and removed after it plays. */
export function ConfettiBurst({ count = 28 }: { count?: number }) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4
        const distance = 60 + Math.random() * 90
        return {
          id: i,
          color: COLORS[i % COLORS.length],
          cx: Math.cos(angle) * distance,
          cy: Math.sin(angle) * distance - 20,
          crot: Math.round(Math.random() * 540 - 270),
          cdur: 700 + Math.random() * 500,
          size: 5 + Math.random() * 5,
          shape: i % 3 === 0 ? '9999px' : '2px',
        }
      }),
    [count],
  )

  return (
    <div className="pointer-events-none absolute inset-0 overflow-visible" aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className="confetti-particle"
          style={{
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: p.shape,
            // @ts-expect-error custom properties for the confetti-burst keyframe
            '--cx': `${p.cx}px`,
            '--cy': `${p.cy}px`,
            '--crot': `${p.crot}deg`,
            '--cdur': `${p.cdur}ms`,
          }}
        />
      ))}
    </div>
  )
}
