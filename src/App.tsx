import { useState, useCallback, useEffect, useRef } from 'react'
import StarfieldBackground from './components/StarfieldBackground'
import ChromeTitle from './components/ChromeTitle'
import Globe from './components/Globe'
import InfoCard from './components/InfoCard'
import { type LocationData } from './data/locations'

function CoordinatesLabel({ location }: { location: LocationData | null }) {
  const [displayText, setDisplayText] = useState('EXPLORE THE WORLD')
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    const newText = location
      ? `${location.coordinates} · ${location.name.toUpperCase()}`
      : 'EXPLORE THE WORLD'

    // Small delay for flicker effect
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
  const [activeLocation, setActiveLocation] = useState<LocationData | null>(null)
  const [hoveredLocation, setHoveredLocation] = useState<LocationData | null>(null)
  const [hintVisible, setHintVisible] = useState(true)

  const handleDotClick = useCallback((location: LocationData) => {
    setActiveLocation(location)
    setHintVisible(false)
  }, [])

  const handleDotHover = useCallback((location: LocationData | null) => {
    setHoveredLocation(location)
  }, [])

  const handleCloseCard = useCallback(() => {
    setActiveLocation(null)
    setHintVisible(true)
  }, [])

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: '#050505',
        position: 'relative',
      }}
    >
      {/* Starfield background layer */}
      <StarfieldBackground />

      {/* Chrome bubble title */}
      <ChromeTitle />

      {/* Three.js Globe layer */}
      <Globe
        onDotClick={handleDotClick}
        onDotHover={handleDotHover}
        activeLocationId={activeLocation?.id || null}
      />

      {/* UI Overlay layer */}
      <CoordinatesLabel location={hoveredLocation || activeLocation} />
      <HintText visible={hintVisible && !activeLocation} />

      {/* Info Card */}
      <InfoCard location={activeLocation} onClose={handleCloseCard} />
    </div>
  )
}
