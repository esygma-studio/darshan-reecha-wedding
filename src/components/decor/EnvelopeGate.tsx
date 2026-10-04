import { useEffect, useMemo, useRef, useState } from 'react'
import envelopeMobile from '@/assets/envelope-mobile.jpg'
import envelopeDesktop from '@/assets/envelope-desktop.jpg'
import introVideo from '@/assets/intro-video.mp4'
import { coverMapPoint, coverScale } from '@/lib/coverMap'
import { startMusic } from '@/lib/musicPlayer'

interface EnvelopeConfig {
  src: string
  imgW: number
  imgH: number
  /** Wax seal center, as a fraction of the source image's own dimensions. */
  apex: [number, number]
  /** Seal diameter as a fraction of the source image's width. */
  sealDiameter: number
}

const CONFIGS: Record<'mobile' | 'desktop', EnvelopeConfig> = {
  mobile: { src: envelopeMobile, imgW: 928, imgH: 1152, apex: [0.5, 0.505], sealDiameter: 0.161 },
  desktop: { src: envelopeDesktop, imgW: 928, imgH: 1152, apex: [0.502, 0.556], sealDiameter: 0.152 },
}

type Stage = 'closed' | 'playing' | 'flashing' | 'dismissing' | 'gone'

const prefersReducedMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

const FLASH_MS = prefersReducedMotion ? 1 : 350
const HOLD_MS = prefersReducedMotion ? 1 : 150
const REVEAL_MS = prefersReducedMotion ? 200 : 900

/**
 * Full-screen entrance gate: the wax-sealed envelope photo with an
 * invisible tap target over the seal, "Tap to Open" set directly in the
 * seal's center. Tapping cross-fades into the couple's own intro video
 * (muted — its own audio is replaced by the synced background-music
 * track) and starts the music in the same gesture. When the video ends, a
 * bright flash "blinds" the screen and then dissolves + pushes in to
 * reveal the site.
 */
export function EnvelopeGate() {
  const [stage, setStage] = useState<Stage>('closed')
  const [variant, setVariant] = useState<'mobile' | 'desktop'>('mobile')
  const [box, setBox] = useState({ w: 0, h: 0 })
  const rootRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const mql = window.matchMedia('(min-width: 640px)')
    const update = () => setVariant(mql.matches ? 'desktop' : 'mobile')
    update()
    mql.addEventListener('change', update)
    return () => mql.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      const { width, height } = entry.contentRect
      setBox({ w: width, h: height })
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    document.body.style.overflow = stage === 'gone' ? '' : 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [stage])

  useEffect(() => {
    if (stage !== 'playing') return
    const video = videoRef.current
    if (!video) return
    // If autoplay-with-sound is ever blocked, don't strand the guest on a
    // frozen frame — just proceed straight to the reveal.
    video.play().catch(() => handleVideoEnded())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage])

  const config = CONFIGS[variant]

  const geometry = useMemo(() => {
    const { w, h } = box
    if (w === 0 || h === 0) return null
    const ap = coverMapPoint(config.imgW, config.imgH, w, h, config.apex[0], config.apex[1])
    const scale = coverScale(config.imgW, config.imgH, w, h)
    const sealDiameterPx = config.sealDiameter * config.imgW * scale
    return { ap, sealDiameterPx }
  }, [box, config])

  function handleOpen() {
    if (stage !== 'closed') return
    setStage('playing')
    startMusic()
  }

  function handleVideoEnded() {
    setStage((s) => (s === 'playing' ? 'flashing' : s))
    setTimeout(() => {
      setStage((s) => (s === 'flashing' ? 'dismissing' : s))
      // Hero's own <video autoPlay> attempt fired while fully hidden behind
      // this opaque gate — WebKit (iOS/macOS Safari) suspends autoplay for
      // video that's occluded rather than actually rendered, which is why
      // it was showing a "tap to play" affordance once revealed. Firing
      // this the moment the fade-out begins gives Hero's explicit .play()
      // a head start so the video is already rolling by the time the gate
      // fully dissolves.
      window.dispatchEvent(new Event('envelope-gate-dismissing'))
    }, FLASH_MS + HOLD_MS)
    setTimeout(() => setStage('gone'), FLASH_MS + HOLD_MS + REVEAL_MS)
  }

  if (stage === 'gone') return null

  if (!geometry) {
    return <div ref={rootRef} className="fixed inset-0 z-[100]" style={{ background: 'var(--cream-beige)' }} />
  }

  const { ap, sealDiameterPx } = geometry
  const apX = ap[0] * 100
  const apY = ap[1] * 100

  const isDismissing = stage === 'dismissing'
  const isFlashing = stage === 'flashing' || stage === 'dismissing'

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[100] overflow-hidden bg-black"
      style={{
        opacity: isDismissing ? 0 : 1,
        transform: isDismissing ? 'scale(1.12)' : 'scale(1)',
        transition: `opacity ${REVEAL_MS}ms ease, transform ${REVEAL_MS}ms cubic-bezier(0.16,1,0.3,1)`,
        pointerEvents: isDismissing ? 'none' : 'auto',
      }}
    >
      {/* Envelope, visible until tapped */}
      <img
        src={config.src}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ opacity: stage === 'closed' ? 1 : 0, transition: 'opacity 500ms ease' }}
      />

      {/* Intro video — mounted from the start so it's pre-buffering behind
          the envelope; only starts once tapped. Muted: its own audio track
          is replaced by the synced background-music track (see
          musicPlayer.ts), started in the same tap handler. */}
      <video
        ref={videoRef}
        src={introVideo}
        playsInline
        muted
        preload="auto"
        onEnded={handleVideoEnded}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ opacity: stage === 'closed' ? 0 : 1, transition: 'opacity 700ms ease' }}
      />

      {stage === 'closed' && (
        <button
          type="button"
          onClick={handleOpen}
          aria-label="Tap to open — plays the intro video"
          className="absolute flex flex-col items-center justify-center gap-0.5 rounded-full bg-transparent p-0 outline-none"
          style={{
            left: `${apX}%`,
            top: `${apY}%`,
            width: sealDiameterPx,
            height: sealDiameterPx,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <span
            className="font-body leading-tight uppercase tracking-[0.14em]"
            style={{
              fontSize: sealDiameterPx * 0.1,
              color: '#4A2F0F',
              textShadow: '0 1px 0 rgba(255,214,140,0.5), 0 -1px 1px rgba(0,0,0,0.4)',
            }}
          >
            Tap to
          </span>
          <span
            className="font-body leading-tight uppercase tracking-[0.14em]"
            style={{
              fontSize: sealDiameterPx * 0.1,
              color: '#4A2F0F',
              textShadow: '0 1px 0 rgba(255,214,140,0.5), 0 -1px 1px rgba(0,0,0,0.4)',
            }}
          >
            Open
          </span>
        </button>
      )}

      {/* Blinding flash once the video ends — stays lit through the
          dismiss fade so the light itself is what dissolves into the site. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: '#FFFDF6',
          opacity: isFlashing ? 1 : 0,
          transition: `opacity ${FLASH_MS}ms ease`,
        }}
      />
    </div>
  )
}
