import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { RSVP_ENDPOINT, groom, bride } from '@/data/wedding'

// Client-side gate only — good enough to keep this away from casual guests
// clicking around the site, not real security (the PIN and this whole
// dashboard ship in the public JS bundle like everything else on a static
// site). Don't put anything here you wouldn't want a determined visitor to
// see.
const ADMIN_PIN = 'D&R2026'
const SESSION_KEY = 'dr-admin-unlocked'

interface RsvpRow {
  Timestamp?: string
  Name?: string
  Phone?: string
  Attending?: string
  'Guest Count'?: string
  'Rooting For'?: string
  Excitement?: string
  'Most Excited Event'?: string
  'Attending Events'?: string
  Wish?: string
  'Invited To'?: string
}

function parseGuestCount(label?: string): number {
  if (!label) return 0
  if (/just me/i.test(label)) return 1
  const m = label.match(/\+(\d+)/)
  if (m) return parseInt(m[1], 10) + 1
  return 1
}

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col gap-1 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--cream-card)] px-5 py-4">
      <span className="font-body text-[0.65rem] uppercase tracking-[0.25em] text-[var(--gold-deep)]">{label}</span>
      <span className="font-heading text-2xl text-[var(--ink)] sm:text-3xl">{value}</span>
    </div>
  )
}

function AdminLogin({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (pin === ADMIN_PIN) {
      sessionStorage.setItem(SESSION_KEY, '1')
      onUnlock()
    } else {
      setError(true)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-6">
      <form onSubmit={handleSubmit} className="flex w-full max-w-xs flex-col gap-4 text-center">
        <p className="font-body text-xs uppercase tracking-[0.3em] text-[var(--gold-deep)]">Admin Access</p>
        <h1 className="font-display text-4xl text-[var(--purple)]">Enter PIN</h1>
        <input
          type="password"
          autoFocus
          value={pin}
          onChange={(e) => {
            setPin(e.target.value)
            setError(false)
          }}
          className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--cream-card)] px-4 py-3 text-center font-heading text-lg tracking-[0.3em] text-[var(--ink)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--purple)]"
          placeholder="••••••••"
        />
        {error && <p className="font-heading text-sm text-[var(--destructive)]">Incorrect PIN — try again.</p>}
        <button
          type="submit"
          className="rounded-full py-3 font-body text-sm uppercase tracking-[0.3em] text-[var(--cream-card)]"
          style={{ background: 'linear-gradient(135deg, var(--gold), var(--gold-deep))' }}
        >
          Unlock
        </button>
      </form>
    </div>
  )
}

// Google Sheets has no push/websocket mechanism, so "instant" here means
// polling frequently while the tab is actually visible — cheap enough at
// wedding-guest volumes, and it stops the moment the admin tabs away so it
// doesn't run up Apps Script's daily execution quota for no reason.
const POLL_INTERVAL_MS = 8000

function AdminDashboard() {
  const [rows, setRows] = useState<RsvpRow[] | null>(null)
  const [loadError, setLoadError] = useState<'none' | 'no-endpoint' | 'fetch-failed'>('none')
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [search, setSearch] = useState('')

  async function load(silent = false) {
    if (!RSVP_ENDPOINT) {
      setLoadError('no-endpoint')
      return
    }
    if (!silent) setLoading(true)
    try {
      const res = await fetch(RSVP_ENDPOINT)
      if (!res.ok) throw new Error(String(res.status))
      const data = await res.json()
      setRows(Array.isArray(data.rows) ? data.rows : [])
      setLoadError('none')
      setLastUpdated(new Date())
    } catch {
      // A transient failure during a silent background poll shouldn't
      // blow away rows already on screen — only surface the error state
      // for an explicit (non-silent) load.
      if (!silent) setLoadError('fetch-failed')
    } finally {
      if (!silent) setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') load(true)
    }, POLL_INTERVAL_MS)
    return () => window.clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const stats = useMemo(() => {
    const list = rows ?? []
    const accepting = list.filter((r) => /accept/i.test(r.Attending ?? '')).length
    const declining = list.filter((r) => /decline/i.test(r.Attending ?? '')).length
    const totalGuests = list.reduce(
      (sum, r) => sum + (/accept/i.test(r.Attending ?? '') ? parseGuestCount(r['Guest Count']) : 0),
      0,
    )
    const eventCounts: Record<string, number> = {}
    list.forEach((r) => {
      ;(r['Attending Events'] ?? '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((name) => {
          eventCounts[name] = (eventCounts[name] ?? 0) + 1
        })
    })
    const inviteCounts: Record<string, number> = {}
    list.forEach((r) => {
      const label = r['Invited To']?.trim() || 'Full Wedding'
      inviteCounts[label] = (inviteCounts[label] ?? 0) + 1
    })
    return { total: list.length, accepting, declining, totalGuests, eventCounts, inviteCounts }
  }, [rows])

  const filtered = useMemo(() => {
    const list = rows ?? []
    if (!search.trim()) return list
    const q = search.toLowerCase()
    return list.filter(
      (r) => (r.Name ?? '').toLowerCase().includes(q) || (r.Phone ?? '').toLowerCase().includes(q),
    )
  }, [rows, search])

  const sorted = useMemo(
    () =>
      [...filtered].sort(
        (a, b) => new Date(b.Timestamp ?? 0).getTime() - new Date(a.Timestamp ?? 0).getTime(),
      ),
    [filtered],
  )

  function lock() {
    sessionStorage.removeItem(SESSION_KEY)
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-[var(--background)] px-4 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <p className="font-body text-xs uppercase tracking-[0.3em] text-[var(--gold-deep)]">
              {groom.name} &amp; {bride.name}
            </p>
            <h1 className="font-display text-4xl leading-[1.3] text-[var(--purple)] sm:text-5xl">RSVP Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            {rows && (
              <span className="flex items-center gap-1.5 font-body text-[0.65rem] uppercase tracking-[0.15em] text-[var(--ink-soft)]">
                <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
                Live
                {lastUpdated && <span className="normal-case tracking-normal">· updated {lastUpdated.toLocaleTimeString()}</span>}
              </span>
            )}
            <button
              type="button"
              onClick={() => load()}
              className="rounded-full border border-[var(--gold)] px-4 py-2 font-body text-xs uppercase tracking-[0.2em] text-[var(--gold-deep)] transition-colors hover:bg-[var(--gold)]/10"
            >
              {loading ? 'Refreshing…' : 'Refresh'}
            </button>
            <button
              type="button"
              onClick={lock}
              className="rounded-full border border-[var(--border)] px-4 py-2 font-body text-xs uppercase tracking-[0.2em] text-[var(--ink-soft)] transition-colors hover:bg-[var(--cream-beige)]"
            >
              Lock
            </button>
          </div>
        </div>

        {loadError === 'no-endpoint' && (
          <p className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--cream-card)] px-5 py-4 font-heading text-base text-[var(--ink-soft)]">
            No RSVP endpoint is configured yet — set <code>RSVP_ENDPOINT</code> in{' '}
            <code>src/data/wedding.ts</code> once your Google Sheet is live, and responses will show up
            here.
          </p>
        )}
        {loadError === 'fetch-failed' && (
          <p className="rounded-[var(--radius-md)] border border-[var(--destructive)]/40 bg-[var(--cream-card)] px-5 py-4 font-heading text-base text-[var(--destructive)]">
            Couldn&rsquo;t load responses — check that the Apps Script is deployed with a{' '}
            <code>doGet</code> handler and &ldquo;Anyone&rdquo; access, then hit Refresh.
          </p>
        )}

        {rows && (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatTile label="Total Responses" value={stats.total} />
              <StatTile label="Joyfully Accepting" value={stats.accepting} />
              <StatTile label="Regrettably Declining" value={stats.declining} />
              <StatTile label="Guests Expected" value={stats.totalGuests} />
            </div>

            {Object.keys(stats.eventCounts).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {Object.entries(stats.eventCounts).map(([name, count]) => (
                  <span
                    key={name}
                    className="rounded-full border border-[var(--gold)]/40 bg-[var(--cream-card)] px-4 py-2 font-body text-xs uppercase tracking-[0.15em] text-[var(--gold-deep)]"
                  >
                    {name}: {count}
                  </span>
                ))}
              </div>
            )}

            {Object.keys(stats.inviteCounts).length > 1 && (
              <div className="flex flex-wrap gap-2">
                {Object.entries(stats.inviteCounts).map(([label, count]) => (
                  <span
                    key={label}
                    className="rounded-full border border-[var(--purple)]/40 bg-[var(--cream-card)] px-4 py-2 font-body text-xs uppercase tracking-[0.15em] text-[var(--purple)]"
                  >
                    {label}: {count}
                  </span>
                ))}
              </div>
            )}

            <input
              type="text"
              placeholder="Search by name or phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--cream-card)] px-4 py-3 font-heading text-base text-[var(--ink)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--purple)]"
            />

            {sorted.length === 0 ? (
              <p className="font-heading text-base text-[var(--ink-soft)]">No responses yet.</p>
            ) : (
              <div className="overflow-x-auto rounded-[var(--radius-md)] border border-[var(--border)]">
                <table className="w-full min-w-[960px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-[var(--cream-beige)]">
                      {['When', 'Invited To', 'Name', 'Phone', 'Attending', 'Guests', 'Team', 'Mood', 'Most Excited', 'Events', 'Wish'].map(
                        (h) => (
                          <th
                            key={h}
                            className="px-3 py-2.5 font-body text-[0.65rem] uppercase tracking-[0.15em] text-[var(--gold-deep)]"
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((r, i) => (
                      <tr key={i} className="border-b border-[var(--border)] last:border-0 even:bg-[var(--cream-card)]/50">
                        <td className="px-3 py-2.5 font-heading text-sm whitespace-nowrap text-[var(--ink-soft)]">
                          {r.Timestamp ? new Date(r.Timestamp).toLocaleString() : '—'}
                        </td>
                        <td className="px-3 py-2.5 font-heading text-sm whitespace-nowrap text-[var(--ink)]">
                          <span
                            className="rounded-full px-2.5 py-0.5 text-xs"
                            style={{
                              background: r['Invited To'] === 'Reception Only' ? 'rgba(92,75,110,0.12)' : 'rgba(201,162,74,0.14)',
                              color: r['Invited To'] === 'Reception Only' ? 'var(--purple)' : 'var(--gold-deep)',
                            }}
                          >
                            {r['Invited To'] || 'Full Wedding'}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 font-heading text-sm text-[var(--ink)]">{r.Name || '—'}</td>
                        <td className="px-3 py-2.5 font-heading text-sm text-[var(--ink)]">{r.Phone || '—'}</td>
                        <td className="px-3 py-2.5 font-heading text-sm text-[var(--ink)]">{r.Attending || '—'}</td>
                        <td className="px-3 py-2.5 font-heading text-sm text-[var(--ink)]">{r['Guest Count'] || '—'}</td>
                        <td className="px-3 py-2.5 font-heading text-sm text-[var(--ink)]">{r['Rooting For'] || '—'}</td>
                        <td className="px-3 py-2.5 font-heading text-sm text-[var(--ink)]">{r.Excitement || '—'}</td>
                        <td className="px-3 py-2.5 font-heading text-sm text-[var(--ink)]">
                          {r['Most Excited Event'] || '—'}
                        </td>
                        <td className="px-3 py-2.5 font-heading text-sm text-[var(--ink)]">
                          {r['Attending Events'] || '—'}
                        </td>
                        <td className="max-w-[220px] px-3 py-2.5 font-heading text-sm text-[var(--ink-soft)] italic">
                          {r.Wish || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export function Admin() {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(SESSION_KEY) === '1')
  if (!unlocked) return <AdminLogin onUnlock={() => setUnlocked(true)} />
  return <AdminDashboard />
}
