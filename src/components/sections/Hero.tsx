import { useEffect, useRef } from 'react'
import { groom, bride } from '@/data/wedding'
import { FallingPetals } from '@/components/decor/FallingPetals'
import { Reveal } from '@/components/decor/Reveal'
import heroVideo from '@/assets/header-video.mp4'
import heroPoster from '@/assets/header-poster.jpg'

/**
 * Full-bleed hero. Names sit low-third rather than dead-center so the
 * video has room to breathe. Just the couple's names here — event date/
 * time lives in ScratchReveal/Countdown below, so the hero stays a clean,
 * uncluttered title moment. Video is the couple's own footage, muted for
 * autoplay/loop (a real audio track will be added later, per instruction).
 *
 * This video sits fully hidden behind the opaque EnvelopeGate for the
 * whole opening sequence — WebKit (iOS/macOS Safari) suspends the
 * `autoplay` attribute's own attempt for video that's occluded rather than
 * actually rendered, leaving it paused with a "tap to play" affordance once
 * later revealed. EnvelopeGate dispatches 'envelope-gate-dismissing' the
 * moment it starts fading out, so this re-triggers .play() explicitly right
 * as the video actually becomes visible — still muted, so no gesture is
 * required for it to succeed.
 */
export function Hero({
  videoSrc = heroVideo,
  posterSrc = heroPoster,
}: {
  videoSrc?: string
  posterSrc?: string
}) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    function tryPlay() {
      const v = videoRef.current
      if (v?.paused) v.play().catch(() => {})
    }

    window.addEventListener('envelope-gate-dismissing', tryPlay)

    // Safety net matching musicPlayer.ts's approach: if that explicit
    // retrigger still didn't take, retry on the guest's next tap/click
    // anywhere, using the video's own `paused` state as ground truth so it
    // stops the moment it's genuinely playing rather than guessing.
    function globalRetry() {
      const v = videoRef.current
      if (!v || !v.paused) {
        cleanupGlobal()
        return
      }
      tryPlay()
    }
    function cleanupGlobal() {
      document.removeEventListener('click', globalRetry, true)
      document.removeEventListener('touchstart', globalRetry, true)
    }
    document.addEventListener('click', globalRetry, true)
    document.addEventListener('touchstart', globalRetry, true)

    return () => {
      window.removeEventListener('envelope-gate-dismissing', tryPlay)
      cleanupGlobal()
    }
  }, [])

  return (
    <section className="relative flex min-h-[100svh] w-full flex-col justify-end overflow-hidden">
      <div className="absolute inset-0">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          src={videoSrc}
          poster={posterSrc}
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--purple-deep)]/60 via-[var(--purple-deep)]/10 to-transparent" />
      </div>

      <FallingPetals />

      <div className="relative z-10 flex flex-col items-center gap-4 px-6 pb-20 text-center sm:pb-28">
        <Reveal>
          <h1 className="font-heading text-5xl leading-[1.3] font-medium text-[var(--cream-card)] drop-shadow-sm sm:text-8xl">
            <span className="block sm:inline">{groom.name.split(' ')[0]}</span>
            <span className="mx-3 inline-block align-middle text-4xl italic text-[var(--gold-light)] sm:text-6xl">
              &amp;
            </span>
            <span className="block sm:inline">{bride.name}</span>
          </h1>
        </Reveal>

        <Reveal delay={150}>
          <div className="mt-2 h-8 w-px bg-[var(--gold-light)]/60" />
        </Reveal>

        <Reveal delay={300}>
          <div className="mt-3 flex flex-col items-center gap-1.5 text-[var(--cream-card)]/75">
            <span className="font-body text-[10px] uppercase tracking-[0.35em]">Scroll to view RSVP</span>
            <svg
              className="scroll-hint-arrow"
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden="true"
            >
              <path d="M2 5L7 10L12 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
