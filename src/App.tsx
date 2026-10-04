import { useEffect } from 'react'
import { EnvelopeGate } from '@/components/decor/EnvelopeGate'
import { MusicToggle } from '@/components/decor/MusicToggle'
import { Hero } from '@/components/sections/Hero'
import { ScratchReveal } from '@/components/sections/ScratchReveal'
import { Countdown } from '@/components/sections/Countdown'
import { CoupleIntro } from '@/components/sections/CoupleIntro'
import { CelebrationBand } from '@/components/sections/CelebrationBand'
import { EventsCarousel } from '@/components/sections/EventsCarousel'
import { Rsvp } from '@/components/sections/Rsvp'
import { Footer } from '@/components/sections/Footer'
import { Admin } from '@/pages/Admin'
import { preloadMusicPlayer, attachGlobalUnlockListeners } from '@/lib/musicPlayer'

function WeddingSite() {
  // Fires as soon as the site mounts, well before the envelope is tapped —
  // see musicPlayer.ts for why the player needs a head start on mobile, and
  // why the global listeners are the safety net for slower devices.
  useEffect(() => {
    preloadMusicPlayer()
    attachGlobalUnlockListeners()
  }, [])

  return (
    <>
      <EnvelopeGate />
      <MusicToggle />
      <main className="min-h-screen bg-[var(--background)]">
        <Hero />
        <ScratchReveal />
        <Countdown />
        <CoupleIntro />
        <CelebrationBand />
        <EventsCarousel />
        <Rsvp />
        <Footer />
      </main>
    </>
  )
}

function App() {
  const isAdmin = window.location.pathname.startsWith('/admin')
  return isAdmin ? <Admin /> : <WeddingSite />
}

export default App
