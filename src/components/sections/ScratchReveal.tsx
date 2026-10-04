import { useRef, useState } from 'react'
import { featured } from '@/data/wedding'
import { ScratchCard } from '@/components/decor/ScratchCard'
import { PartyPoppers } from '@/components/decor/PartyPoppers'
import { SectionDivider } from '@/components/decor/SectionDivider'
import { Reveal } from '@/components/decor/Reveal'

function Coin({ revealText, label, onRevealed }: { revealText: string; label: string; onRevealed?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <ScratchCard revealText={revealText} onRevealed={onRevealed} />
      <p className="font-body text-[0.65rem] uppercase tracking-[0.3em] text-[var(--gold-deep)]">{label}</p>
    </div>
  )
}

export function ScratchReveal() {
  const revealedCount = useRef(0)
  const [celebrate, setCelebrate] = useState(false)

  function handleRevealed() {
    revealedCount.current += 1
    if (revealedCount.current === 3) {
      setCelebrate(true)
      setTimeout(() => setCelebrate(false), 1800)
    }
  }

  return (
    <section className="flex flex-col items-center gap-6 px-6 py-20 text-center sm:py-28">
      <Reveal>
        <p className="font-body text-xs uppercase tracking-[0.3em] text-[var(--gold-deep)]/80">The Date</p>
      </Reveal>
      <Reveal delay={120}>
        <h2 className="font-display text-5xl text-[var(--purple)] sm:text-6xl">Scratch to Reveal</h2>
      </Reveal>
      <Reveal delay={240}>
        <p className="max-w-md font-heading text-lg italic text-[var(--ink-soft)]">
          Scratch the gold seals below to uncover our {featured.name.toLowerCase()} date
        </p>
      </Reveal>

      <div className="mt-4 flex items-start justify-center gap-8 sm:gap-12">
        <Reveal delay={360}>
          <Coin revealText={featured.day} label="Day" onRevealed={handleRevealed} />
        </Reveal>
        <Reveal delay={460}>
          <Coin revealText={featured.date} label="Date" onRevealed={handleRevealed} />
        </Reveal>
        <Reveal delay={560}>
          <Coin revealText={featured.year} label="Year" onRevealed={handleRevealed} />
        </Reveal>
      </div>

      {celebrate && <PartyPoppers />}

      <SectionDivider color="var(--color-purple)" />
    </section>
  )
}
