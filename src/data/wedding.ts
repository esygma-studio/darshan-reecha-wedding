export const groom = {
  name: 'Darshan',
  parents: '',
}

export const bride = {
  name: 'Reecha',
  parents: '',
}

// The main ceremony — powers Countdown and ScratchReveal, same role
// "sumuhurtham" played on the reference build.
export const wedding = {
  name: 'Wedding',
  dateLabel: 'Wednesday, 9th December 2026',
  day: 'Wednesday',
  date: '9th December',
  year: '2026',
  // Wentworthville, NSW is on AEDT (UTC+11) in December.
  isoDateTime: '2026-12-09T17:30:00+11:00',
  timeLabel: '5:30 PM',
  venue: {
    line1: 'Pro Regal Pavilion',
    line2: '82 Station St, Wentworthville NSW 2145',
  },
}

// Shape mirrors `wedding` above — powers Countdown/ScratchReveal on the
// reception-only invite variant (see eventScope below), so those sections
// count down to / reveal the reception's own date rather than the main
// ceremony's.
export const reception = {
  name: 'Reception',
  dateLabel: 'Friday, 11th December 2026',
  day: 'Friday',
  date: '11th December',
  year: '2026',
  isoDateTime: '2026-12-11T18:00:00+11:00',
  timeLabel: '6:00 PM onwards',
  venue: wedding.venue,
}

// Same venue for every function. Components treat an empty mapsUrl as
// "show a TBA label instead" — no longer relevant now that this is set,
// but the fallback stays in place in case it's ever cleared again.
export const mapsUrl = 'https://share.google/wo0DVtGZes38xmHYS'

// Placeholder deadline — update once the couple sets a firm RSVP cutoff.
export const rsvpByLabel = 'a date to be confirmed'

// Paste the deployed Google Apps Script web app URL here (ends in /exec).
// See google-apps-script/rsvp.gs for the script + deployment steps. Until
// this is filled in, RSVP/Best Wishes fall back to local-only confirmation.
export const RSVP_ENDPOINT =
  'https://script.google.com/macros/s/AKfycbxsvr9CZdmnx4nABzgTXqW36BD4LQMMaOb1gbQIK1nz09nLmAea38go4grS5xB2I0ty/exec'

export interface WeddingEvent {
  id: string
  name: string
  dateLabel: string
  timeLabel: string
  dressCode: string
  description: string
}

// All three functions are at the same venue (Pro Regal Pavilion) — see
// mapsUrl/wedding.venue above.
export const events: WeddingEvent[] = [
  {
    id: 'sangeet',
    name: 'Sangeet Night',
    dateLabel: 'Saturday, 5th December 2026',
    timeLabel: '6:00 PM',
    dressCode: 'Bling & glam attire',
    description: 'An evening of music, dance, and celebration as our families come together.',
  },
  {
    id: 'wedding',
    name: wedding.name,
    dateLabel: wedding.dateLabel,
    timeLabel: wedding.timeLabel,
    dressCode: 'Formal traditional wedding attire',
    description: 'The most joyous moment of all, as we begin our forever together.',
  },
  {
    id: 'reception',
    name: 'Reception',
    dateLabel: 'Friday, 11th December 2026',
    timeLabel: '6:00 PM onwards',
    dressCode: 'Evening formal attire',
    description: 'An elegant evening of dinner and dancing to celebrate our new beginning.',
  },
]

// Build-time toggle for the reception-only invite variant — a separate
// Vercel deployment (own URL) for guests only invited to the reception, not
// the full wedding. Set via VITE_EVENT_SCOPE=reception at build time;
// unset/anything else builds the full site with all three functions.
export const eventScope: 'all' | 'reception' =
  import.meta.env.VITE_EVENT_SCOPE === 'reception' ? 'reception' : 'all'

export const visibleEvents: WeddingEvent[] =
  eventScope === 'reception' ? events.filter((event) => event.id === 'reception') : events

// What Countdown/ScratchReveal count down to and reveal — the full
// ceremony on the main site, the reception itself on the reception-only
// variant.
export const featured = eventScope === 'reception' ? reception : wedding

// Both site variants POST to and read from the same Apps Script/Sheet (see
// google-apps-script/rsvp.gs) — this tags each RSVP with which link it came
// from, written to a "Invited To" column, so the couple can tell the two
// apart in one unified dashboard/sheet rather than needing separate tabs.
export const inviteLabel = eventScope === 'reception' ? 'Reception Only' : 'Full Wedding'
