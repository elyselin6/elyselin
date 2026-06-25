import { useState, useCallback, useEffect, useRef } from 'react'
import StarfieldBackground from './components/StarfieldBackground'
import ChromeTitle from './components/ChromeTitle'
import Globe from './components/Globe'
import InfoCard from './components/InfoCard'
import SocialLinks from './components/SocialLinks'
import { type LocationData } from './data/locations'

function CoordinatesLabel({ location }: { location: LocationData | null }) {
  const [displayText, setDisplayText] = useState('EXPLORE THE WORLD')
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    const newText = location
      ? `${location.coordinates} · ${location.name.toUpperCase()}`
      : 'EXPLORE THE WORLD'

    timeoutRef.current = setTimeout(() => {
      setDisplayText(newText)
    }, location ? 30 : 100)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [location])

  return (
    <div
      style={{
        position: 'fixed',
        left: 28,
        bottom: 28,
        zIndex: 10,
        fontFamily: "'JetBrains Mono', monospace",
        fontWeight: 400,
        fontSize: 11,
        color: '#808080',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      {displayText}
    </div>
  )
}

function HintText({ visible }: { visible: boolean }) {
  return (
    <div
      style={{
        position: 'fixed',
        left: '50%',
        bottom: 28,
        transform: 'translateX(-50%)',
        zIndex: 10,
        fontFamily: "'JetBrains Mono', monospace",
        fontWeight: 400,
        fontSize: 10,
        color: '#404040',
        textTransform: 'uppercase',
        letterSpacing: '0.15em',
        pointerEvents: 'none',
        userSelect: 'none',
        opacity: visible ? 1 : 0,
        transition: 'opacity 600ms ease',
      }}
    >
      CLICK A DOT TO EXPLORE
    </div>
  )
}

export default function App() {
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
  const canGoPrev = activeCardIndex > 0
  const canGoNext = activeCardIndex < activeLocations.length - 1

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: '#000000',
        position: 'relative',
      }}
    >
      <StarfieldBackground />
      <ChromeTitle />

      <Globe
        onDotClick={handleDotClick}
        onDotHover={handleDotHover}
        activeLocationId={currentLocation?.id ?? null}
      />

      <CoordinatesLabel location={hoveredLocation || currentLocation} />
      <HintText visible={hintVisible && activeLocations.length === 0} />
      <SocialLinks />

      {currentLocation && (
        <div
          style={{
            position: 'fixed',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 20,
            width: 360,
          }}
        >
          {canGoPrev && (
            <button
              type="button"
              onClick={() => setActiveCardIndex((index) => index - 1)}
              aria-label="Previous location card"
              style={{
                position: 'absolute',
                left: -44,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 32,
                height: 32,
                borderRadius: '50%',
                border: '1px solid rgba(192, 192, 192, 0.25)',
                background: 'rgba(0, 0, 0, 0.55)',
                color: '#C0C0C0',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 200ms ease, border-color 200ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(192, 192, 192, 0.12)'
                e.currentTarget.style.borderColor = 'rgba(192, 192, 192, 0.45)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.55)'
                e.currentTarget.style.borderColor = 'rgba(192, 192, 192, 0.25)'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}

          <InfoCard key={currentLocation.id} location={currentLocation} onClose={handleCloseCards} embedded />

          {canGoNext && (
            <button
              type="button"
              onClick={() => setActiveCardIndex((index) => index + 1)}
              aria-label="Next location card"
              style={{
                position: 'absolute',
                left: -44,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 32,
                height: 32,
                borderRadius: '50%',
                border: '1px solid rgba(192, 192, 192, 0.25)',
                background: 'rgba(0, 0, 0, 0.55)',
                color: '#C0C0C0',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 200ms ease, border-color 200ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(192, 192, 192, 0.12)'
                e.currentTarget.style.borderColor = 'rgba(192, 192, 192, 0.45)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.55)'
                e.currentTarget.style.borderColor = 'rgba(192, 192, 192, 0.25)'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M5 2L10 7L5 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
