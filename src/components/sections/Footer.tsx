import { groom, bride, featured } from '@/data/wedding'
import { Reveal } from '@/components/decor/Reveal'

export function Footer() {
  return (
    <footer className="flex flex-col items-center gap-2 bg-[var(--ink)] px-6 py-10 text-center">
      <Reveal>
        <p className="font-display text-3xl text-[var(--gold-light)]">
          {groom.name.split(' ')[0]} &amp; {bride.name}
        </p>
        <p className="font-body text-xs uppercase tracking-[0.3em] text-[var(--cream-card)]/70">
          {featured.dateLabel}
        </p>
        <p className="mt-2 font-body text-xs text-[var(--cream-card)]/50">With love, from both families</p>
      </Reveal>
    </footer>
  )
}
