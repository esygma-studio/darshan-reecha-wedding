import { groom, bride } from '@/data/wedding'
import { SectionDivider } from '@/components/decor/SectionDivider'
import { Reveal } from '@/components/decor/Reveal'
import photo from '@/assets/couple-photo.jpg'

function HeartIcon() {
  return (
    <svg width="22" height="20" viewBox="0 0 22 20" fill="none" aria-hidden="true">
      <path
        d="M11 19C11 19 1 12.6 1 6.4C1 3.4 3.4 1 6.4 1C8.3 1 10 2 11 3.6C12 2 13.7 1 15.6 1C18.6 1 21 3.4 21 6.4C21 12.6 11 19 11 19Z"
        fill="#C0392B"
        stroke="#C0392B"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function Intro({
  title,
  titleColor,
  name,
  relation,
  parents,
}: {
  title: string
  titleColor: string
  name: string
  relation: string
  parents?: string
}) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <p className="font-body text-xs uppercase tracking-[0.3em]" style={{ color: titleColor }}>
        {title}
      </p>
      <h3 className="font-display text-4xl text-[var(--gold-deep)] sm:text-5xl">{name}</h3>
      {parents && (
        <p className="max-w-xs font-heading text-base text-[var(--ink-soft)]">
          {relation} {parents}
        </p>
      )}
    </div>
  )
}

export function CoupleIntro() {
  return (
    <section className="floral-section flex flex-col items-center gap-8 px-6 py-16 sm:py-24">
      <Reveal className="w-full max-w-2xl">
        <div className="overflow-hidden rounded-sm border border-[var(--gold)]/40 shadow-[0_25px_50px_-20px_rgba(46,32,24,0.5)]">
          <img src={photo} alt="Darshan and Reecha" className="block h-auto w-full" />
        </div>
      </Reveal>

      <Reveal delay={200} className="flex w-full max-w-md flex-col items-center gap-8">
        <Intro
          title="The Groom"
          titleColor="var(--purple)"
          name={groom.name}
          relation="Son of"
          parents={groom.parents}
        />
        <HeartIcon />
        <Intro
          title="The Bride"
          titleColor="var(--gold-deep)"
          name={bride.name}
          relation="Daughter of"
          parents={bride.parents}
        />
      </Reveal>

      <SectionDivider color="var(--color-purple)" />
    </section>
  )
}
