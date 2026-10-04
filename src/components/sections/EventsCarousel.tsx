import { useState } from 'react'
import { visibleEvents as events } from '@/data/wedding'
import { EventFlipCard } from '@/components/decor/EventFlipCard'
import { SectionDivider } from '@/components/decor/SectionDivider'
import { Reveal } from '@/components/decor/Reveal'

import sangeetBg from '@/assets/event-sangeet-bg.jpg'
import weddingBg from '@/assets/event-wedding-bg.jpg'
import receptionBg from '@/assets/event-reception-bg.jpg'

const IMAGES: Record<string, string> = {
  sangeet: sangeetBg,
  wedding: weddingBg,
  reception: receptionBg,
}

function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d={direction === 'left' ? 'M10 3L5 8l5 5' : 'M6 3l5 5-5 5'}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function EventsCarousel() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const hasMultiple = events.length > 1

  function goTo(index: number) {
    const next = (index + events.length) % events.length
    setActiveIndex(next)
    setFlipped(false)
  }

  function handleCardClick(index: number) {
    if (index === activeIndex) {
      setFlipped((f) => !f)
    } else {
      goTo(index)
    }
  }

  return (
    <section className="flex flex-col items-center gap-6 px-6 py-20 text-center sm:py-28">
      <Reveal>
        <p className="font-body text-xs uppercase tracking-[0.3em] text-[var(--plum)]">
          Our Wedding Events
        </p>
      </Reveal>
      <Reveal delay={120}>
        <h2 className="font-display text-5xl text-[var(--purple)] sm:text-6xl">The Celebrations</h2>
      </Reveal>
      <Reveal delay={240}>
        <p className="max-w-md font-heading text-lg italic text-[var(--ink-soft)]">
          {hasMultiple
            ? 'Tap a card to bring it forward, tap the centered card to flip it'
            : 'Tap the card to flip it'}
        </p>
      </Reveal>

      <Reveal delay={360} className="w-full">
        <div className="flex items-center justify-center gap-3 sm:gap-6">
          {hasMultiple && (
            <button
              type="button"
              onClick={() => goTo(activeIndex - 1)}
              aria-label="Previous event"
              className="relative z-20 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--gold)]/50 bg-[var(--background)] text-[var(--gold-deep)] transition-colors hover:bg-[var(--gold)]/10"
            >
              <ChevronIcon direction="left" />
            </button>
          )}

          <div className="relative h-[28rem] w-64 sm:h-[32rem] sm:w-72">
            {events.map((event, i) => {
              // Circular (shortest-path) distance, not a plain linear index
              // difference — so the fan wraps continuously in both
              // directions instead of only ever going right-to-left.
              const n = events.length
              let diff = i - activeIndex
              if (diff > n / 2) diff -= n
              if (diff < -n / 2) diff += n
              const abs = Math.abs(diff)
              const visible = abs <= 2
              const isActive = diff === 0
              return (
                <div
                  key={event.id}
                  className="absolute left-1/2 top-0 h-full w-full"
                  style={{
                    transform: `translateX(-50%) translateX(${diff * 62}%) scale(${Math.max(1 - abs * 0.13, 0.6)})`,
                    opacity: visible ? (isActive ? 1 : abs === 1 ? 0.7 : 0.35) : 0,
                    zIndex: 10 - abs,
                    pointerEvents: visible ? 'auto' : 'none',
                    transition: 'transform 550ms cubic-bezier(0.4,0,0.2,1), opacity 550ms ease',
                  }}
                >
                  <EventFlipCard
                    event={event}
                    bgImage={IMAGES[event.id]}
                    flipped={isActive && flipped}
                    onClick={() => handleCardClick(i)}
                    interactive={isActive}
                  />
                </div>
              )
            })}
          </div>

          {hasMultiple && (
            <button
              type="button"
              onClick={() => goTo(activeIndex + 1)}
              aria-label="Next event"
              className="relative z-20 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--gold)]/50 bg-[var(--background)] text-[var(--gold-deep)] transition-colors hover:bg-[var(--gold)]/10"
            >
              <ChevronIcon direction="right" />
            </button>
          )}
        </div>
      </Reveal>

      {hasMultiple && (
        <div className="mt-2 flex items-center gap-2">
          {events.map((event, i) => (
            <button
              key={event.id}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Show ${event.name}`}
              aria-current={i === activeIndex}
              className="h-2 rounded-full transition-all"
              style={{
                width: i === activeIndex ? '22px' : '8px',
                backgroundColor: i === activeIndex ? 'var(--gold-deep)' : 'var(--gold-light)',
              }}
            />
          ))}
        </div>
      )}

      <SectionDivider color="var(--color-plum)" />
    </section>
  )
}
