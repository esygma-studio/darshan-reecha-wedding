import { Reveal } from '@/components/decor/Reveal'

/** The one deliberately loud, full-bleed moment on the page — everything else stays quieter around it. */
export function CelebrationBand() {
  return (
    <div className="bg-[var(--plum)] px-6 py-8 text-center">
      <Reveal>
        <p className="font-display text-3xl text-[var(--gold-light)] sm:text-4xl">
          Awaiting your presence with joy
        </p>
      </Reveal>
    </div>
  )
}
