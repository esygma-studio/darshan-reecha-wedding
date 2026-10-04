import type { WeddingEvent } from '@/data/wedding'
import { mapsUrl, wedding } from '@/data/wedding'

/**
 * A single vertical flip card: front shows the themed illustration with the
 * event name bottom-aligned over a scrim; back is a plain cream face with
 * timing/dress-code/description and a Get Directions link. Purely
 * presentational — the carousel that positions/scales/animates these lives
 * in EventsCarousel.tsx.
 */
export function EventFlipCard({
  event,
  bgImage,
  flipped,
  onClick,
  interactive = true,
}: {
  event: WeddingEvent
  bgImage: string
  flipped: boolean
  onClick: () => void
  interactive?: boolean
}) {
  return (
    <div
      role="button"
      tabIndex={interactive ? 0 : -1}
      onClick={onClick}
      onKeyDown={(e) => {
        if (interactive && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onClick()
        }
      }}
      aria-pressed={flipped}
      aria-label={
        interactive ? `Tap to reveal details for ${event.name}` : `Show ${event.name} details`
      }
      className="group h-full w-full cursor-pointer [perspective:1400px] focus-visible:outline-none"
    >
      <div
        className="relative h-full w-full transition-transform duration-[650ms] ease-[cubic-bezier(0.4,0,0.2,1)] [transform-style:preserve-3d]"
        style={{ transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
      >
        {/* Front */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl border-2 border-[var(--gold)]/60 shadow-[0_20px_45px_-15px_rgba(61,36,24,0.45)] [backface-visibility:hidden] group-focus-visible:ring-2 group-focus-visible:ring-[var(--ring)]">
          <img
            src={bgImage}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to top, rgba(61,42,56,0.96) 0%, rgba(61,42,56,0.62) 42%, rgba(61,42,56,0.15) 72%, transparent 100%)',
            }}
          />
          <div className="absolute inset-3 rounded-xl border border-[var(--gold-light)]/50" />
          <div className="relative flex h-full flex-col items-center justify-end gap-1.5 p-6 pb-10 text-center sm:p-8 sm:pb-12">
            <p className="font-body text-[0.65rem] uppercase tracking-[0.3em] text-[var(--gold-light)] sm:text-xs">
              {event.dateLabel}
            </p>
            <h3
              className={`font-display leading-tight text-[var(--cream-card)] drop-shadow-sm ${
                event.name.length > 18 ? 'text-2xl sm:text-4xl' : 'text-3xl sm:text-5xl'
              }`}
            >
              {event.name}
            </h3>
          </div>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 rounded-2xl border-2 border-[var(--gold)]/60 bg-[var(--cream-card)] p-6 text-center shadow-[0_20px_45px_-15px_rgba(61,36,24,0.45)] [backface-visibility:hidden] sm:p-8"
          style={{ transform: 'rotateY(180deg)' }}
        >
          <div className="absolute inset-3 rounded-xl border border-[var(--gold)]/35" />
          <h3
            className={`font-display leading-tight text-[var(--gold-deep)] ${
              event.name.length > 18 ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl'
            }`}
          >
            {event.name}
          </h3>
          <div className="h-px w-12 bg-[var(--gold)]/50" />
          <p className="font-heading text-sm text-[var(--ink)] sm:text-base">
            {event.dateLabel} &middot; {event.timeLabel}
          </p>
          <p className="font-heading text-sm text-[var(--ink-soft)] sm:text-base">{event.dressCode}</p>
          <p className="max-w-[15rem] font-heading text-xs italic text-[var(--ink-soft)] sm:text-sm">
            {event.description}
          </p>
          {mapsUrl ? (
            <>
              <p className="font-heading text-sm font-semibold text-[var(--ink)] sm:text-base">
                {wedding.venue.line1}
              </p>
              <p className="max-w-[15rem] font-heading text-xs text-[var(--ink-soft)] sm:text-sm">
                {wedding.venue.line2}
              </p>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="mt-2 rounded-full bg-[var(--gold)] px-5 py-1.5 font-body text-xs uppercase tracking-[0.25em] text-[var(--ink)] transition-colors hover:bg-[var(--gold-light)]"
              >
                Get Directions
              </a>
            </>
          ) : (
            <p className="mt-2 rounded-full border border-[var(--gold)]/50 px-5 py-1.5 font-body text-xs uppercase tracking-[0.25em] text-[var(--ink-soft)]">
              Venue to be announced
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
