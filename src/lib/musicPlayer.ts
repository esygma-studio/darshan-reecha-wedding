// Hidden YouTube IFrame background-music player with a custom loop segment
// (YouTube's own loop param only supports looping the whole video, not a
// specific in/out point) — plays 0:06–1:06 of the track, fades out at the
// boundary, then seeks back to 0:06 and fades back in.
//
// Mobile note: creating the player and calling playVideo() only once the
// user taps (inside an async function) reliably gets blocked by mobile
// Safari/Chrome's autoplay policy, because the actual play() call ends up
// happening after an await (script load + player init), by which point the
// browser no longer considers it tied to the original tap. The fix used
// here is the standard mobile-safe pattern: create the player as early as
// possible (preloadMusicPlayer, called on app mount) with autoplay+mute so
// it starts silently right away — muted autoplay is always allowed — then
// on the user's tap, synchronously unmute + set volume on the
// already-playing player. Unmuting an already-playing video during a
// genuine user gesture is allowed everywhere, including iOS Safari.
//
// On slower devices (seen on iPad) the YouTube iframe can still be mid-load
// when the very first tap happens, so that first unmute attempt falls back
// to an async path that's no longer gesture-linked and silently fails —
// the tell-tale symptom was music only starting after manually toggling it
// off and on again later. attachGlobalUnlockListeners() is the fix: it
// keeps retrying the unmute (using the player's own isMuted() as ground
// truth, not a locally-assumed flag) on the user's next tap/keypress
// anywhere on the page, so the retry that used to require finding the
// music button now happens automatically and invisibly.

const VIDEO_ID = '3qpxJEp4Ec4'
const LOOP_START = 6
const LOOP_END = 66
const TARGET_VOLUME = 55
const FADE_STEPS = 12
const FADE_OUT_MS = 700
const FADE_IN_MS = 500

// Minimal shape of the bits of the YT.Player API this module actually uses.
interface YTPlayer {
  playVideo(): void
  pauseVideo(): void
  seekTo(seconds: number, allowSeekAhead: boolean): void
  setVolume(volume: number): void
  getVolume(): number
  getCurrentTime(): number
  mute(): void
  unMute(): void
  isMuted(): boolean
}

declare global {
  interface Window {
    YT?: {
      Player: new (
        el: HTMLElement,
        opts: {
          videoId: string
          playerVars: Record<string, number>
          events: { onReady: () => void }
        },
      ) => YTPlayer
    }
    onYouTubeIframeAPIReady?: () => void
  }
}

let player: YTPlayer | null = null
let playerPromise: Promise<YTPlayer> | null = null
let watchdogId: number | null = null
let fading = false
let userPaused = false
let isPlaying = false
let unlocked = false

type Listener = (state: { isPlaying: boolean; userPaused: boolean }) => void
const listeners = new Set<Listener>()

function notify() {
  listeners.forEach((fn) => fn({ isPlaying, userPaused }))
}

export function subscribeMusicState(fn: Listener): () => void {
  listeners.add(fn)
  fn({ isPlaying, userPaused })
  return () => listeners.delete(fn)
}

function loadYouTubeApi(): Promise<void> {
  return new Promise((resolve) => {
    if (window.YT?.Player) {
      resolve()
      return
    }
    const previous = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      previous?.()
      resolve()
    }
    if (!document.getElementById('youtube-iframe-api')) {
      const tag = document.createElement('script')
      tag.id = 'youtube-iframe-api'
      tag.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(tag)
    }
  })
}

function ensurePlayer(): Promise<YTPlayer> {
  if (playerPromise) return playerPromise
  playerPromise = loadYouTubeApi().then(
    () =>
      new Promise<YTPlayer>((resolve) => {
        const host = document.createElement('div')
        host.style.position = 'fixed'
        host.style.width = '0'
        host.style.height = '0'
        host.style.overflow = 'hidden'
        host.style.pointerEvents = 'none'
        document.body.appendChild(host)

        const instance = new window.YT!.Player(host, {
          videoId: VIDEO_ID,
          // autoplay + mute so this starts silently the moment it's ready,
          // well before the user taps anything — muted autoplay is never
          // blocked. playsinline keeps iOS from forcing fullscreen.
          playerVars: { autoplay: 1, mute: 1, controls: 0, disablekb: 1, playsinline: 1, start: LOOP_START },
          events: {
            onReady: () => {
              player = instance
              instance.playVideo()
              resolve(instance)
            },
          },
        })
      }),
  )
  return playerPromise
}

/** Call as early as possible (app mount) so the muted player is already
 * playing by the time the user taps to unmute it. */
export function preloadMusicPlayer() {
  ensurePlayer()
}

function fadeTo(target: number, durationMs: number, onDone?: () => void) {
  if (!player) return
  const from = player.getVolume()
  let step = 0
  const stepMs = durationMs / FADE_STEPS
  const interval = window.setInterval(() => {
    step++
    const v = from + ((target - from) * step) / FADE_STEPS
    player?.setVolume(Math.max(0, Math.min(100, v)))
    if (step >= FADE_STEPS) {
      window.clearInterval(interval)
      onDone?.()
    }
  }, stepMs)
}

function loopBack() {
  if (!player || fading) return
  fading = true
  fadeTo(0, FADE_OUT_MS, () => {
    if (!player) return
    player.seekTo(LOOP_START, true)
    fadeTo(TARGET_VOLUME, FADE_IN_MS, () => {
      fading = false
    })
  })
}

function startWatchdog() {
  if (watchdogId != null) return
  watchdogId = window.setInterval(() => {
    if (!player || userPaused || fading) return
    const t = player.getCurrentTime()
    if (t >= LOOP_END) loopBack()
  }, 250)
}

/** Actually unmutes + plays — only re-seeks if the player is genuinely
 * still muted, so a retry never disrupts playback that's already working. */
function unmuteAndPlay(p: YTPlayer) {
  p.seekTo(LOOP_START, true)
  p.unMute()
  p.setVolume(TARGET_VOLUME)
  p.playVideo()
  isPlaying = true
  notify()
  startWatchdog()
}

function tryEnsureAudible() {
  if (userPaused) return

  if (player) {
    if (!player.isMuted()) return // already confirmed unmuted — nothing to do
    unmuteAndPlay(player)
    return
  }

  // Player hasn't finished initializing yet — fall back to the async path.
  // Won't be gesture-linked on mobile, so it may silently fail; that's what
  // attachGlobalUnlockListeners() below is the safety net for.
  ensurePlayer().then((p) => {
    if (!unlocked || userPaused || !p.isMuted()) return
    unmuteAndPlay(p)
  })
}

/** Must be called synchronously inside a real user-gesture handler (click/
 * tap) — that's what makes unmuting reliable on mobile. */
export function startMusic() {
  if (userPaused) return
  unlocked = true
  tryEnsureAudible()
}

// One-time-per-load safety net: keeps retrying the unmute on the user's
// *next* tap/key anywhere on the page, using the player's own isMuted() as
// ground truth, until it's genuinely confirmed unmuted — then stops.
let globalUnlockAttached = false
export function attachGlobalUnlockListeners() {
  if (globalUnlockAttached) return
  globalUnlockAttached = true

  const handler = () => {
    if (player && !player.isMuted()) {
      cleanup()
      return
    }
    tryEnsureAudible()
  }
  function cleanup() {
    document.removeEventListener('click', handler, true)
    document.removeEventListener('touchstart', handler, true)
    document.removeEventListener('keydown', handler, true)
  }

  document.addEventListener('click', handler, true)
  document.addEventListener('touchstart', handler, true)
  document.addEventListener('keydown', handler, true)
}

export function pauseMusic() {
  userPaused = true
  player?.pauseVideo()
  isPlaying = false
  notify()
}

export function resumeMusic() {
  if (!player) return
  userPaused = false
  player.unMute()
  player.playVideo()
  isPlaying = true
  notify()
}

export function toggleMusic() {
  if (isPlaying) pauseMusic()
  else resumeMusic()
}
