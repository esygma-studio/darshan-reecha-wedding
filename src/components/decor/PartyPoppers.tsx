import { useMemo } from 'react'

const COLORS = [
  'var(--color-gold)',
  'var(--color-gold-light)',
  'var(--color-purple)',
  'var(--color-purple-light)',
  'var(--color-gold-deep)',
  'var(--color-plum)',
]

const CORNERS = [
  { top: '-2%', left: '-2%', angleBase: -20 },
  { top: '-2%', right: '-2%', angleBase: 200 },
  { bottom: '-2%', left: '-2%', angleBase: 70 },
  { bottom: '-2%', right: '-2%', angleBase: 110 },
]

/**
 * Full-viewport celebration for the "all three scratched" moment — confetti
 * bursts inward from all four screen corners, like party poppers going off.
 * Mounted imperatively and unmounted after it finishes playing.
 */
export function PartyPoppers() {
  const bursts = useMemo(
    () =>
      CORNERS.flatMap((corner, cornerIndex) =>
        Array.from({ length: 16 }, (_, i) => {
          const spread = 70
          const angle = ((corner.angleBase + (Math.random() - 0.5) * spread) * Math.PI) / 180
          const distance = 220 + Math.random() * 260
          return {
            id: `${cornerIndex}-${i}`,
            corner,
            color: COLORS[(cornerIndex + i) % COLORS.length],
            cx: Math.cos(angle) * distance,
            cy: Math.sin(angle) * distance,
            crot: Math.round(Math.random() * 720 - 360),
            cdur: 1100 + Math.random() * 700,
            size: 6 + Math.random() * 7,
            shape: i % 3 === 0 ? '9999px' : '2px',
          }
        }),
      ),
    [],
  )

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      {bursts.map((p) => (
        <span
          key={p.id}
          className="confetti-particle"
          style={{
            position: 'absolute',
            top: p.corner.top,
            left: p.corner.left,
            right: p.corner.right,
            bottom: p.corner.bottom,
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
