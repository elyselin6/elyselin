import { useState, useCallback, type FormEvent } from 'react'
import Globe from './Globe'
import InfoCard from './InfoCard'
import { type LocationData } from '../data/locations'
import { useIsMobile } from '../hooks/useMediaQuery'
import './ContactSection.css'

const CONTACT_EMAIL =
  import.meta.env.VITE_CONTACT_EMAIL || 'elyselin@wharton.upenn.edu'

function CoordinatesLabel({
  location,
  isMobile,
  cardOpen,
}: {
  location: LocationData | null
  isMobile: boolean
  cardOpen: boolean
}) {
  const displayText = location
    ? `${location.coordinates} · ${location.name.toUpperCase()}`
    : 'EXPLORE THE WORLD'

  return (
    <div
      className={`contact-coordinates${isMobile && cardOpen ? ' contact-coordinates--hidden' : ''}`}
    >
      {displayText}
    </div>
  )
}

export default function ContactSection() {
  const isMobile = useIsMobile()
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [activeLocations, setActiveLocations] = useState<LocationData[]>([])
  const [activeCardIndex, setActiveCardIndex] = useState(0)
  const [hoveredLocation, setHoveredLocation] = useState<LocationData | null>(null)
  const [hintVisible, setHintVisible] = useState(true)

  const handleDotClick = useCallback((locations: LocationData[]) => {
    setActiveLocations(locations)
    setActiveCardIndex(0)
    setHintVisible(false)
  }, [])

  const handleDotHover = useCallback((location: LocationData | null) => {
    setHoveredLocation(location)
  }, [])

  const handleCloseCards = useCallback(() => {
    setActiveLocations([])
    setActiveCardIndex(0)
    setHintVisible(true)
  }, [])

  const currentLocation = activeLocations[activeCardIndex] ?? null
  const hasMultipleCards = activeLocations.length > 1
  const cardOpen = currentLocation !== null

  const goToNextCard = useCallback(() => {
    setActiveCardIndex((index) => (index + 1) % activeLocations.length)
  }, [activeLocations.length])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!CONTACT_EMAIL) {
      setStatus('error')
      return
    }

    setStatus('submitting')
    const form = event.currentTarget
    const formData = new FormData(form)

    try {
      const response = await fetch(`https://formsubmit.co/ajax/${CONTACT_EMAIL}`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.get('name'),
          email: formData.get('email'),
          message: formData.get('message'),
          _subject: 'New message from elyse-lin.com',
        }),
      })

      if (!response.ok) throw new Error('Submission failed')

      setStatus('success')
      form.reset()
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="contact-section">
      <div className="contact-section__form-wrap">
        <h2 className="section-heading contact-section__heading">Contact Me</h2>

        <form className="contact-form" onSubmit={handleSubmit}>
          <label className="contact-form__field">
            <span>Name</span>
            <input type="text" name="name" required autoComplete="name" placeholder="Your name" />
          </label>

          <label className="contact-form__field">
            <span>Email</span>
            <input type="email" name="email" required autoComplete="email" placeholder="you@example.com" />
          </label>

          <label className="contact-form__field">
            <span>Message</span>
            <textarea name="message" required rows={5} placeholder="Describe your dream project" />
          </label>

          <button type="submit" className="contact-form__submit" disabled={status === 'submitting'}>
            {status === 'submitting' ? 'Sending...' : 'Send Message'}
          </button>

          {status === 'success' && (
            <p className="contact-form__feedback contact-form__feedback--success">
              Message sent — I&apos;ll get back to you soon.
            </p>
          )}
          {status === 'error' && (
            <p className="contact-form__feedback contact-form__feedback--error">
              Something went wrong. Please try again.
            </p>
          )}
        </form>
      </div>

      <div className={`contact-section__globe-wrap${cardOpen && !isMobile ? ' contact-section__globe-wrap--card-open' : ''}`}>
        <div className="contact-section__globe-box">
          <Globe
            onDotClick={handleDotClick}
            onDotHover={handleDotHover}
            activeLocationId={currentLocation?.id ?? null}
            isMobile={isMobile}
          />

          <CoordinatesLabel
            location={hoveredLocation || currentLocation}
            isMobile={isMobile}
            cardOpen={cardOpen}
          />

          <div className="contact-hint" style={{ opacity: hintVisible && activeLocations.length === 0 ? 1 : 0 }}>
            {isMobile ? 'TAP A DOT TO EXPLORE' : 'CLICK A DOT TO EXPLORE'}
          </div>
        </div>

        {currentLocation && (
          <>
            {isMobile && (
              <button
                type="button"
                className="contact-info-card__backdrop"
                aria-label="Close location card"
                onClick={handleCloseCards}
              />
            )}

            <div className={`contact-info-card${isMobile ? ' contact-info-card--mobile' : ''}`}>
              {hasMultipleCards && (
                <button
                  type="button"
                  onClick={goToNextCard}
                  aria-label="Next location card"
                  className={`contact-info-card__next${isMobile ? ' contact-info-card__next--mobile' : ''}`}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M5 2L10 7L5 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}

              <InfoCard
                key={currentLocation.id}
                location={currentLocation}
                onClose={handleCloseCards}
                embedded
                isMobile={isMobile}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
