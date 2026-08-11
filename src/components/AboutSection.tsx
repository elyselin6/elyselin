import { useState, useCallback } from 'react'
import Globe from './Globe'
import InfoCard from './InfoCard'
import { type LocationData } from '../data/locations'
import { useIsMobile } from '../hooks/useMediaQuery'
import './AboutSection.css'

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
      className={`about-coordinates${isMobile && cardOpen ? ' about-coordinates--hidden' : ''}`}
    >
      {displayText}
    </div>
  )
}

export default function AboutSection() {
  const isMobile = useIsMobile()
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

  return (
    <div className="about-section">
      <div className="about-section__text">
        <h2 className="section-heading">About Me</h2>
        <p className="about-section__body">
          Elyse is a Penn undergraduate studying Business and International Studies in the Huntsman
          Program with experience spanning venture capital, corporate strategy, and real estate across
          four countries. She builds websites, pitch decks, and brand identities for finance firms
          and entrepreneurs that want their brand to match their ambition.
        </p>
        <p className="about-section__body">
          Outside of work, she&apos;s usually in the water, on a trail, or on a plane. She&apos;s an
          avid reader with a deep curiosity for agriculture, hospitality, and art.
        </p>

        <div className="about-section__reads">
          <p className="about-section__reads-heading">On My Nightstand</p>
          <ul className="about-section__reads-list">
            <li>
              <em>The Art of War</em> by Sun Tzu
            </li>
            <li>
              <em>Drive Your Plow Over The Bones of The Dead</em> by Olga{'\u00A0'}Tokarczuk
            </li>
            <li>
              <em>Range</em> by David Epstein
            </li>
          </ul>
        </div>
      </div>

      <div className={`about-section__globe-wrap${cardOpen && !isMobile ? ' about-section__globe-wrap--card-open' : ''}`}>
        <div className="about-section__globe-box">
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

          <div className="about-hint" style={{ opacity: hintVisible && activeLocations.length === 0 ? 1 : 0 }}>
            {isMobile ? 'TAP A DOT TO EXPLORE' : 'CLICK A DOT TO EXPLORE'}
          </div>
        </div>

        {currentLocation && (
          <>
            {isMobile && (
              <button
                type="button"
                className="about-info-card__backdrop"
                aria-label="Close location card"
                onClick={handleCloseCards}
              />
            )}

            <div className={`about-info-card${isMobile ? ' about-info-card--mobile' : ''}`}>
            {hasMultipleCards && (
              <button
                type="button"
                onClick={goToNextCard}
                aria-label="Next location card"
                className={`about-info-card__next${isMobile ? ' about-info-card__next--mobile' : ''}`}
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
