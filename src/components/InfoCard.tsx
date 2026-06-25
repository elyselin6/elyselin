import { useEffect, useRef, useState } from 'react'
import { type LocationData } from '../data/locations'

interface InfoCardProps {
  location: LocationData | null
  onClose: () => void
}

export default function InfoCard({ location, onClose }: InfoCardProps) {
  const [isActive, setIsActive] = useState(false)
  const [displayLocation, setDisplayLocation] = useState<LocationData | null>(null)
  const prevLocationRef = useRef<LocationData | null>(null)

  useEffect(() => {
    if (location) {
      setDisplayLocation(location)
      prevLocationRef.current = location
      // Small delay to allow DOM update before activating
      requestAnimationFrame(() => {
        setIsActive(true)
      })
    } else {
      setIsActive(false)
      // Clear display after animation completes
      const timer = setTimeout(() => {
        setDisplayLocation(null)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [location])

  // Use previous location for display during exit animation
  const showLocation = displayLocation || prevLocationRef.current

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isActive) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isActive, onClose])

  if (!showLocation) return null

  // Split title into characters for animation
  const titleChars = showLocation.name.split('').map((char, i) => (
    <span
      key={`${showLocation.id}-${i}`}
      style={{
        display: 'inline-block',
        opacity: isActive ? 1 : 0,
        transform: isActive ? 'translateY(0)' : 'translateY(10px)',
        transition: `opacity 300ms cubic-bezier(0.16, 1, 0.3, 1) ${i * 20}ms, transform 300ms cubic-bezier(0.16, 1, 0.3, 1) ${i * 20}ms`,
      }}
    >
      {char === ' ' ? '\u00A0' : char}
    </span>
  ))

  return (
    <div
      className="info-card"
      style={{
        position: 'fixed',
        right: 0,
        top: '50%',
        transform: `translateY(-50%) ${isActive ? 'translateX(0)' : 'translateX(100%)'}`,
        width: '360px',
        maxHeight: '520px',
        background: 'rgba(10, 10, 10, 0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderLeft: '1px solid rgba(192, 192, 192, 0.15)',
        padding: 0,
        overflow: 'hidden',
        opacity: isActive ? 1 : 0,
        transition: 'transform 600ms cubic-bezier(0.16, 1, 0.3, 1), opacity 400ms ease',
        zIndex: 20,
        borderRadius: '4px 0 0 4px',
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          width: 32,
          height: 32,
          background: 'rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(192, 192, 192, 0.2)',
          borderRadius: '50%',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 300ms ease, background 200ms ease',
          zIndex: 2,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'rotate(90deg)'
          e.currentTarget.style.background = 'rgba(192, 192, 192, 0.1)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'rotate(0deg)'
          e.currentTarget.style.background = 'rgba(0, 0, 0, 0.5)'
        }}
        aria-label="Close info card"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M1 1L13 13M13 1L1 13" stroke="#C0C0C0" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {/* Image */}
      <div
        style={{
          width: '100%',
          height: 200,
          overflow: 'hidden',
          opacity: isActive ? 1 : 0,
          transform: isActive ? 'scale(1)' : 'scale(1.05)',
          transition: 'opacity 500ms ease 200ms, transform 600ms ease 200ms',
        }}
      >
        <img
          src={showLocation.photo}
          alt={showLocation.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>

      {/* Content */}
      <div style={{ padding: '24px 28px 28px' }}>
        {/* Title with character animation */}
        <h2
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            fontSize: 26,
            color: '#C0C0C0',
            margin: 0,
            lineHeight: 1.2,
            wordBreak: 'keep-all',
          }}
        >
          {titleChars}
        </h2>

        {/* Divider */}
        <div
          style={{
            width: 40,
            height: 1,
            background: 'rgba(192, 192, 192, 0.2)',
            margin: '12px 0',
          }}
        />

        {/* Period */}
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 400,
            fontSize: 11,
            color: '#808080',
            letterSpacing: '0.05em',
            display: 'block',
            marginBottom: 12,
          }}
        >
          {showLocation.period}
        </span>

        {/* Description */}
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 300,
            fontSize: 14,
            lineHeight: 1.7,
            color: '#A0A0A0',
            margin: '0 0 16px 0',
          }}
        >
          {showLocation.description}
        </p>

        {/* Coordinates */}
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 400,
            fontSize: 11,
            color: '#606060',
            letterSpacing: '0.05em',
            display: 'block',
          }}
        >
          {showLocation.coordinates}
        </span>
      </div>
    </div>
  )
}
