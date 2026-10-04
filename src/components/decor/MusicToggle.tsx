import { useEffect, useState } from 'react'
import { subscribeMusicState, toggleMusic } from '@/lib/musicPlayer'

/**
 * Fixed bottom-right toggle. Sits at a lower z-index than the envelope
 * gate, so it's naturally invisible/unclickable while the gate is up and
 * simply appears once the gate unmounts — no coordination needed between
 * the two components.
 */
export function MusicToggle() {
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => subscribeMusicState((s) => setIsPlaying(s.isPlaying)), [])

  return (
    <button
      type="button"
      onClick={toggleMusic}
      aria-label={isPlaying ? 'Mute background music' : 'Play background music'}
      aria-pressed={isPlaying}
      className="fixed bottom-5 right-5 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-[var(--gold)]/50 bg-[var(--cream-card)]/90 text-[var(--gold-deep)] shadow-[0_8px_20px_-8px_rgba(46,32,24,0.4)] backdrop-blur transition-transform duration-200 hover:scale-105 active:scale-95"
    >
      {isPlaying ? (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path d="M2 6.5V11.5H5.5L10 15V3L5.5 6.5H2Z" fill="currentColor" />
          <path
            d="M12.5 5.5C13.6 6.4 14.2 7.6 14.2 9C14.2 10.4 13.6 11.6 12.5 12.5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <path
            d="M14.3 3C16 4.4 17 6.6 17 9C17 11.4 16 13.6 14.3 15"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path d="M2 6.5V11.5H5.5L10 15V3L5.5 6.5H2Z" fill="currentColor" />
          <path
            d="M12.5 6.5L16.5 10.5M16.5 6.5L12.5 10.5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      )}
    </button>
  )
}
