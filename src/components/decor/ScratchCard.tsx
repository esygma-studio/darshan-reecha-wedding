import { useEffect, useRef, useState } from 'react'
import { ConfettiBurst } from '@/components/decor/ConfettiBurst'

const REVEAL_THRESHOLD = 0.55

/**
 * Draws a polished, engine-turned gold coin: a richer metal gradient, a fine
 * radiating sunburst (guilloché-style spokes, alternating light/dark) for
 * that engraved/classy look, and crisp thin rims rather than plain flat
 * concentric outlines.
 */
function paintFoil(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const cx = width / 2
  const cy = height / 2
  const r = Math.max(width, height) / 2

  const base = ctx.createRadialGradient(cx - r * 0.25, cy - r * 0.3, r * 0.05, cx, cy, r)
  base.addColorStop(0, '#FBEFC7')
  base.addColorStop(0.35, '#EBC873')
  base.addColorStop(0.65, '#C89A44')
  base.addColorStop(0.85, '#9C7027')
  base.addColorStop(1, '#7A521A')
  ctx.fillStyle = base
  ctx.fillRect(0, 0, width, height)

  // Fine radiating spokes — an engine-turned/guilloché texture rather than
  // a graphic starburst, alternating a light and dark stroke per spoke so
  // it reads as engraved metal instead of printed lines.
  const spokes = 72
  ctx.save()
  ctx.translate(cx, cy)
  for (let i = 0; i < spokes; i++) {
    const angle = (i / spokes) * Math.PI * 2
    const x1 = Math.cos(angle) * r * 0.14
    const y1 = Math.sin(angle) * r * 0.14
    const x2 = Math.cos(angle) * r * 0.97
    const y2 = Math.sin(angle) * r * 0.97
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.strokeStyle = i % 2 === 0 ? 'rgba(255,247,220,0.22)' : 'rgba(84,54,14,0.16)'
    ctx.lineWidth = 0.75
    ctx.stroke()
  }
  ctx.restore()

  // Crisp raised-rim emboss rings, closer to a real struck coin's edge.
  ctx.lineWidth = 1
  ctx.strokeStyle = 'rgba(255,250,230,0.4)'
  ctx.beginPath()
  ctx.arc(cx, cy, r * 0.72, 0, Math.PI * 2)
  ctx.stroke()

  ctx.strokeStyle = 'rgba(255,250,230,0.3)'
  ctx.beginPath()
  ctx.arc(cx, cy, r * 0.92, 0, Math.PI * 2)
  ctx.stroke()

  ctx.strokeStyle = 'rgba(84,54,14,0.45)'
  ctx.lineWidth = 1.2
  ctx.beginPath()
  ctx.arc(cx, cy, r * 0.98, 0, Math.PI * 2)
  ctx.stroke()
}

/** Small, refined gold-foil scratch coin — reveals plain theme-color text only, no icon or label baked in. */
export function ScratchCard({
  revealText,
  onRevealed,
}: {
  revealText: string
  onRevealed?: () => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  const dprRef = useRef(1)
  const scratching = useRef(false)
  const revealed = useRef(false)
  const initialized = useRef(false)
  const [isRevealed, setIsRevealed] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  // Draw the scratch surface once the container has a real, non-zero size.
  // A ResizeObserver (rather than a one-shot getBoundingClientRect in an
  // effect) avoids racing the flex layout pass, which can still report 0
  // width on the very first paint.
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      const { width, height } = entry.contentRect
      if (initialized.current || width === 0 || height === 0) return
      initialized.current = true

      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      dprRef.current = dpr
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`

      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) return
      ctx.scale(dpr, dpr)
      ctxRef.current = ctx
      paintFoil(ctx, width, height)
    })

    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    function erase(x: number, y: number) {
      const ctx = ctxRef.current
      if (!ctx) return
      ctx.globalCompositeOperation = 'destination-out'
      ctx.beginPath()
      ctx.arc(x, y, 14, 0, Math.PI * 2)
      ctx.fill()
    }

    function checkRevealProgress() {
      const ctx = ctxRef.current
      if (!ctx || revealed.current) return
      const sample = ctx.getImageData(0, 0, canvas!.width, canvas!.height)
      let cleared = 0
      const step = 8 * dprRef.current
      let total = 0
      for (let i = 3; i < sample.data.length; i += step * 4) {
        total++
        if (sample.data[i] < 40) cleared++
      }
      if (total > 0 && cleared / total > REVEAL_THRESHOLD) {
        revealed.current = true
        canvas!.style.transition = 'opacity 500ms ease'
        canvas!.style.opacity = '0'
        setIsRevealed(true)
        setShowConfetti(true)
        onRevealed?.()
        setTimeout(() => setShowConfetti(false), 1200)
      }
    }

    function pos(e: PointerEvent) {
      const r = canvas!.getBoundingClientRect()
      return { x: e.clientX - r.left, y: e.clientY - r.top }
    }

    function onDown(e: PointerEvent) {
      scratching.current = true
      canvas!.setPointerCapture(e.pointerId)
      const { x, y } = pos(e)
      erase(x, y)
    }
    function onMove(e: PointerEvent) {
      if (!scratching.current) return
      const { x, y } = pos(e)
      erase(x, y)
      checkRevealProgress()
    }
    function onUp() {
      scratching.current = false
      checkRevealProgress()
    }

    canvas.addEventListener('pointerdown', onDown)
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerup', onUp)
    canvas.addEventListener('pointerleave', onUp)

    return () => {
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerup', onUp)
      canvas.removeEventListener('pointerleave', onUp)
    }
  }, [onRevealed])

  return (
    <div
      ref={containerRef}
      className="relative aspect-square w-24 shrink-0 overflow-hidden rounded-full shadow-[0_8px_18px_-6px_rgba(61,36,24,0.4)] ring-2 ring-[var(--cream-card)] sm:w-28"
    >
      <div
        className="absolute inset-0 flex items-center justify-center text-center"
        style={{ background: 'linear-gradient(160deg, var(--purple), var(--purple-deep))' }}
      >
        <p className="font-display text-xl text-[var(--cream-card)] sm:text-2xl">{revealText}</p>
      </div>

      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full touch-none"
        style={{ cursor: isRevealed ? 'default' : 'pointer' }}
      />

      {showConfetti && <ConfettiBurst count={14} />}
    </div>
  )
}
