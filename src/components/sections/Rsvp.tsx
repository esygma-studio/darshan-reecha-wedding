import { useState, type FormEvent, type ReactNode } from 'react'
import { visibleEvents as events, RSVP_ENDPOINT, featured, inviteLabel } from '@/data/wedding'
import { SectionDivider } from '@/components/decor/SectionDivider'
import { Reveal } from '@/components/decor/Reveal'

// Structure, questions, and options mirror thanmayee-hari-wedding.vercel.app's
// "Celebrate With Us" section verbatim, except the event-specific options
// (mapped to our own three functions) and the merged "share a wish" field,
// which folds in what used to be the separate BestWishes section/sheet tab.
// Palette/typography stay entirely on this site's own tokens — the section
// borrows the reference's form structure, not its color theme.
const ATTENDING_OPTIONS = ['Joyfully Accept 🎊', 'Regrettably Decline 😢']
const GUEST_COUNT_OPTIONS = ['Just Me 🙋', '+1 👫', '+2 👨‍👩‍👦', '+3 👨‍👩‍👧‍👦', '+4 🎊', '+5 or more 🥳']
const ROOTING_OPTIONS = ['Team Bride 👰', 'Team Groom 🤵', "Can't Choose 🥰"]
const EXCITEMENT_OPTIONS = ['Hell YESSSS 🎉', 'Already Dancing 💃', 'Waiting for the Food 🍛']
const EVENT_EMOJI: Record<string, string> = { sangeet: '🎶', wedding: '💍', reception: '🥂' }

// The two "which event(s)" questions only make sense when there's more
// than one event to choose between — on the reception-only invite variant
// (see visibleEvents in data/wedding.ts) they'd just be a single-option
// question with an obvious answer, so they're dropped entirely and the
// single event is recorded automatically instead of asked.
const hasMultipleEvents = events.length > 1

function OptionButton({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className="rounded-[var(--radius-md)] border px-4 py-4 font-body text-sm uppercase tracking-[0.12em] transition-colors sm:px-5 sm:py-5 sm:text-base"
      style={{
        borderColor: selected ? 'var(--gold)' : 'var(--border)',
        background: selected ? 'rgba(201,162,74,0.14)' : 'var(--cream-card)',
        color: selected ? 'var(--gold-deep)' : 'var(--ink)',
      }}
    >
      {label}
    </button>
  )
}

function QuestionGroup({
  label,
  hint,
  columns = 1,
  error,
  children,
}: {
  label: string
  hint?: string
  columns?: 1 | 2 | 3
  error?: boolean
  children: ReactNode
}) {
  const colClass = columns === 3 ? 'sm:grid-cols-3' : columns === 2 ? 'sm:grid-cols-2' : ''
  return (
    <div className="flex flex-col gap-3">
      <label className="font-body text-sm uppercase tracking-[0.3em] text-[var(--gold-deep)] sm:text-base">
        {label}
      </label>
      {hint && <p className="font-heading text-base italic text-[var(--ink-soft)]">{hint}</p>}
      <div className={`grid grid-cols-1 gap-3 ${colClass}`}>{children}</div>
      {error && <p className="font-heading text-sm text-[var(--destructive)]">Please make a choice.</p>}
    </div>
  )
}

export function Rsvp() {
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(false)

  const [attending, setAttending] = useState('')
  const [guestCount, setGuestCount] = useState('')
  const [rootingFor, setRootingFor] = useState('')
  const [excitement, setExcitement] = useState('')
  const [mostExcited, setMostExcited] = useState('')
  const [attendingEvents, setAttendingEvents] = useState<string[]>([])
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({})

  const eventOptions = events.map((ev) => ({ id: ev.id, label: `${ev.name} ${EVENT_EMOJI[ev.id] ?? '✨'}` }))

  function toggleAttendingEvent(id: string) {
    setAttendingEvents((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(false)

    const nextErrors = {
      attending: !attending,
      guestCount: !guestCount,
      rootingFor: !rootingFor,
      excitement: !excitement,
      mostExcited: hasMultipleEvents && !mostExcited,
      attendingEvents: hasMultipleEvents && attendingEvents.length === 0,
    }
    setFieldErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return

    // Single-event variant (e.g. reception-only): nothing to ask, the one
    // visible event is the answer.
    const mostExcitedName = hasMultipleEvents
      ? events.find((ev) => ev.id === mostExcited)?.name || mostExcited
      : events[0]?.name || ''
    const attendingEventNames = hasMultipleEvents
      ? attendingEvents.map((id) => events.find((ev) => ev.id === id)?.name).filter(Boolean).join(', ')
      : events[0]?.name || ''

    const form = new FormData(e.currentTarget)
    const payload = {
      name: form.get('name'),
      phone: form.get('phone'),
      attending,
      guestCount,
      rootingFor,
      excitement,
      mostExcited: mostExcitedName,
      attendingEvents: attendingEventNames,
      wish: form.get('wish'),
      // Which link this came from — both variants share one Sheet/dashboard
      // (see data/wedding.ts), so this is how the couple tells them apart.
      inviteType: inviteLabel,
    }

    if (!RSVP_ENDPOINT) {
      setSent(true)
      return
    }

    setSending(true)
    try {
      await fetch(RSVP_ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
      })
      setSent(true)
    } catch {
      setError(true)
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="flex flex-col items-center gap-8 px-6 py-20 text-center sm:py-28">
      <Reveal>
        <p className="font-body text-xs uppercase tracking-[0.3em] text-[var(--gold-deep)]/80">Join the Fun</p>
      </Reveal>
      <Reveal delay={100}>
        <h2 className="font-display text-5xl text-[var(--purple)] sm:text-6xl">Celebrate With Us</h2>
      </Reveal>
      <Reveal delay={200}>
        <p className="max-w-md font-heading text-lg italic text-[var(--ink-soft)]">
          A few fun questions before the big day!
        </p>
      </Reveal>

      {sent ? (
        <p className="max-w-sm font-heading text-lg text-[var(--ink-soft)]">
          Thank you — we can&rsquo;t wait to celebrate with you!
        </p>
      ) : (
        <Reveal delay={300} className="mt-2 w-full max-w-md sm:max-w-2xl">
          <form onSubmit={handleSubmit} className="flex w-full flex-col gap-8 text-left">
            <div className="flex flex-col gap-3 sm:grid sm:grid-cols-2 sm:gap-4">
              <p className="font-body text-sm uppercase tracking-[0.3em] text-[var(--gold-deep)] sm:col-span-2 sm:text-base">
                Guest Details
              </p>
              <input
                required
                name="name"
                type="text"
                placeholder="Your Name"
                className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--cream-card)] px-4 py-4 font-heading text-base text-[var(--ink)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--purple)] sm:py-5 sm:text-lg"
              />
              <input
                name="phone"
                type="tel"
                placeholder="Phone Number"
                className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--cream-card)] px-4 py-4 font-heading text-base text-[var(--ink)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--purple)] sm:py-5 sm:text-lg"
              />
            </div>

            <QuestionGroup label="Will you be joining us?" columns={2} error={fieldErrors.attending}>
              {ATTENDING_OPTIONS.map((opt) => (
                <OptionButton key={opt} label={opt} selected={attending === opt} onClick={() => setAttending(opt)} />
              ))}
            </QuestionGroup>

            <QuestionGroup
              label="How many people are you bringing?"
              hint="Including yourself"
              columns={3}
              error={fieldErrors.guestCount}
            >
              {GUEST_COUNT_OPTIONS.map((opt) => (
                <OptionButton key={opt} label={opt} selected={guestCount === opt} onClick={() => setGuestCount(opt)} />
              ))}
            </QuestionGroup>

            <QuestionGroup label="Who are you rooting for?" columns={3} error={fieldErrors.rootingFor}>
              {ROOTING_OPTIONS.map((opt) => (
                <OptionButton key={opt} label={opt} selected={rootingFor === opt} onClick={() => setRootingFor(opt)} />
              ))}
            </QuestionGroup>

            <QuestionGroup
              label={`Are you excited for the ${featured.name.toLowerCase()}?`}
              columns={3}
              error={fieldErrors.excitement}
            >
              {EXCITEMENT_OPTIONS.map((opt) => (
                <OptionButton key={opt} label={opt} selected={excitement === opt} onClick={() => setExcitement(opt)} />
              ))}
            </QuestionGroup>

            {hasMultipleEvents && (
              <>
                <QuestionGroup
                  label="Which event are you most excited for?"
                  columns={3}
                  error={fieldErrors.mostExcited}
                >
                  {eventOptions.map((opt) => (
                    <OptionButton
                      key={opt.id}
                      label={opt.label}
                      selected={mostExcited === opt.id}
                      onClick={() => setMostExcited(opt.id)}
                    />
                  ))}
                </QuestionGroup>

                <QuestionGroup
                  label="Which events will you be attending?"
                  hint="Select all that apply"
                  columns={3}
                  error={fieldErrors.attendingEvents}
                >
                  {eventOptions.map((opt) => (
                    <OptionButton
                      key={opt.id}
                      label={opt.label}
                      selected={attendingEvents.includes(opt.id)}
                      onClick={() => toggleAttendingEvent(opt.id)}
                    />
                  ))}
                </QuestionGroup>
              </>
            )}

            <div className="flex flex-col gap-3">
              <label className="font-body text-sm uppercase tracking-[0.3em] text-[var(--gold-deep)] sm:text-base">
                Share a wish or memory.
              </label>
              <textarea
                required
                name="wish"
                rows={4}
                placeholder="Write your wishes here..."
                className="resize-none rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--cream-card)] px-4 py-4 font-heading text-base text-[var(--ink)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--purple)] sm:text-lg"
              />
              <p className="font-heading text-base text-[var(--ink-soft)]">
                🔥 This becomes a digital memory book.
              </p>
            </div>

            {error && (
              <p className="font-heading text-sm text-[var(--destructive)]">
                Something went wrong sending that — please try again.
              </p>
            )}

            <button
              type="submit"
              disabled={sending}
              className="mt-2 rounded-full py-4 font-body text-base uppercase tracking-[0.35em] text-[var(--cream-card)] transition-opacity hover:opacity-90 disabled:opacity-60 sm:py-5 sm:text-lg"
              style={{ background: 'linear-gradient(135deg, var(--gold), var(--gold-deep))' }}
            >
              {sending ? 'Sending…' : 'Send Love ❤️'}
            </button>
          </form>
        </Reveal>
      )}

      <SectionDivider color="var(--color-gold)" />
    </section>
  )
}
