import { useEffect, useState } from 'react'
import { featured } from '@/data/wedding'
import { SectionDivider } from '@/components/decor/SectionDivider'
import { Reveal } from '@/components/decor/Reveal'

function getRemaining(target: number) {
  const diff = Math.max(0, target - Date.now())
  const totalSeconds = Math.floor(diff / 1000)
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    done: diff === 0,
  }
}

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="font-body text-3xl font-semibold tabular-nums text-[var(--ink)] sm:text-5xl">
        {String(value).padStart(2, '0')}
      </span>
      <span className="font-body text-[0.6rem] uppercase tracking-[0.25em] text-[var(--ink-soft)] sm:text-xs">
        {label}
      </span>
    </div>
  )
}

export function Countdown() {
  const target = new Date(featured.isoDateTime).getTime()
  const [remaining, setRemaining] = useState(() => getRemaining(target))

  useEffect(() => {
    const id = setInterval(() => setRemaining(getRemaining(target)), 1000)
    return () => clearInterval(id)
  }, [target])

  return (
    <section className="flex flex-col items-center gap-6 px-6 py-16 text-center sm:py-24">
      <Reveal>
        <p className="font-body text-xs font-medium uppercase tracking-[0.35em] text-[var(--gold-deep)]">
          Counting down to our {featured.name}
        </p>
      </Reveal>
      <Reveal delay={150}>
        <div className="flex items-center gap-4 sm:gap-8">
          <Unit value={remaining.days} label="Days" />
          <span className="pb-4 font-heading text-2xl text-[var(--purple)] sm:text-3xl">:</span>
          <Unit value={remaining.hours} label="Hours" />
          <span className="pb-4 font-heading text-2xl text-[var(--purple)] sm:text-3xl">:</span>
          <Unit value={remaining.minutes} label="Mins" />
          <span className="pb-4 font-heading text-2xl text-[var(--purple)] sm:text-3xl">:</span>
          <Unit value={remaining.seconds} label="Secs" />
        </div>
      </Reveal>
      <SectionDivider color="var(--color-gold)" />
    </section>
  )
}
