import { useEffect, useRef, useState } from 'react'
import { type LocationData } from '../data/locations'

interface InfoCardProps {
  location: LocationData | null
  onClose: () => void
  embedded?: boolean
  isMobile?: boolean
}

function getTitleFontSize(name: string, maxWidth = 268): number {
  const maxSize = 26
  const minSize = 15
  const charWidthFactor = 0.58

  for (let size = maxSize; size >= minSize; size--) {
    if (name.length * size * charWidthFactor <= maxWidth) {
      return size
    }
  }

  return minSize
}

const PHOTO_REEL_INTERVAL_MS = 3500
const PHOTO_CROSSFADE_MS = 800

function PhotoReel({
  photos,
  photoPositions,
  alt,
  isActive,
}: {
  photos: string[]
  photoPositions?: string[]
  alt: string
  isActive: boolean
}) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [prevIndex, setPrevIndex] = useState<number | null>(null)
  const [isCrossfading, setIsCrossfading] = useState(false)

  useEffect(() => {
    setActiveIndex(0)
    setPrevIndex(null)
    setIsCrossfading(false)
  }, [photos])

  useEffect(() => {
    if (photos.length <= 1 || !isActive) return

    const interval = setInterval(() => {
      setActiveIndex((current) => {
        setPrevIndex(current)
        setIsCrossfading(true)
        return (current + 1) % photos.length
      })
    }, PHOTO_REEL_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [photos, isActive])

  useEffect(() => {
    if (!isCrossfading) return

    const timer = setTimeout(() => {
      setPrevIndex(null)
      setIsCrossfading(false)
    }, PHOTO_CROSSFADE_MS)

    return () => clearTimeout(timer)
  }, [isCrossfading, activeIndex])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {photos.map((src, index) => {
        const isCurrent = index === activeIndex
        const isPrevious = index === prevIndex && isCrossfading
        const isVisible = isCurrent || isPrevious

        return (
          <img
            key={src}
            src={src}
            alt={alt}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: photoPositions?.[index] ?? 'center center',
              opacity: isVisible ? (isCurrent ? 1 : 0) : 0,
              transition: `opacity ${PHOTO_CROSSFADE_MS}ms ease`,
              zIndex: isCurrent ? 2 : 1,
            }}
          />
        )
      })}

      {photos.length > 1 && (
        <div
          style={{
            position: 'absolute',
            bottom: 10,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 6,
            zIndex: 3,
          }}
        >
          {photos.map((src, index) => (
            <span
              key={src}
              style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: index === activeIndex ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.35)',
                transition: 'background 300ms ease',
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function InfoCard({ location, onClose, embedded = false, isMobile = false }: InfoCardProps) {
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

  const titleFontSize = getTitleFontSize(showLocation.name)

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

  const mobileEmbedded = embedded && isMobile

  return (
    <div
      className="info-card"
      style={{
        position: mobileEmbedded ? 'relative' : embedded ? 'relative' : 'fixed',
        right: mobileEmbedded ? undefined : embedded ? undefined : 0,
        top: mobileEmbedded ? undefined : embedded ? undefined : '50%',
        bottom: mobileEmbedded ? 0 : undefined,
        left: mobileEmbedded ? 0 : undefined,
        transform: mobileEmbedded
          ? isActive
            ? 'translateY(0)'
            : 'translateY(100%)'
          : embedded
            ? isActive
              ? 'translateX(0)'
              : 'translateX(100%)'
            : `translateY(-50%) ${isActive ? 'translateX(0)' : 'translateX(100%)'}`,
        width: mobileEmbedded ? '100%' : '360px',
        maxHeight: mobileEmbedded ? '58dvh' : '580px',
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(10, 10, 10, 0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderLeft: mobileEmbedded ? 'none' : '1px solid rgba(192, 192, 192, 0.15)',
        borderTop: mobileEmbedded ? '1px solid rgba(192, 192, 192, 0.15)' : undefined,
        padding: 0,
        overflow: 'hidden',
        opacity: isActive ? 1 : 0,
        transition: mobileEmbedded
          ? 'transform 600ms cubic-bezier(0.16, 1, 0.3, 1), opacity 400ms ease'
          : 'transform 600ms cubic-bezier(0.16, 1, 0.3, 1), opacity 400ms ease',
        zIndex: 20,
        borderRadius: mobileEmbedded ? '12px 12px 0 0' : '4px 0 0 4px',
        flex: mobileEmbedded ? 1 : undefined,
        minHeight: mobileEmbedded ? 0 : undefined,
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
          height: isMobile ? 160 : 200,
          flexShrink: 0,
          overflow: 'hidden',
          opacity: isActive ? 1 : 0,
          transform: isActive ? 'scale(1)' : 'scale(1.05)',
          transition: 'opacity 500ms ease 200ms, transform 600ms ease 200ms',
        }}
      >
        {showLocation.photos && showLocation.photos.length > 0 ? (
          <PhotoReel
            photos={showLocation.photos}
            photoPositions={showLocation.photoPositions}
            alt={showLocation.name}
            isActive={isActive}
          />
        ) : (
          <img
            src={showLocation.photo}
            alt={showLocation.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: showLocation.photoPositions?.[0] ?? 'center center',
              transform: showLocation.photoScale ? `scale(${showLocation.photoScale})` : undefined,
              transformOrigin: showLocation.photoPositions?.[0] ?? 'center center',
            }}
          />
        )}
      </div>

      {/* Content */}
      <div
        style={{
          padding: isMobile ? '20px 20px 24px' : '24px 28px 28px',
          overflowY: 'auto',
          flex: 1,
          minHeight: 0,
          paddingBottom: isMobile ? 'max(24px, env(safe-area-inset-bottom))' : undefined,
        }}
      >
        {/* Title with character animation */}
        <h2
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 600,
            fontSize: titleFontSize,
            color: '#C0C0C0',
            margin: 0,
            paddingRight: 36,
            lineHeight: 1.2,
            whiteSpace: showLocation.name.length > 24 ? 'normal' : 'nowrap',
          }}
        >
          {titleChars}
        </h2>

        {showLocation.subheading && (
          <span
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 400,
              fontSize: 10,
              color: '#808080',
              letterSpacing: '0.15em',
              display: 'block',
              marginTop: 8,
            }}
          >
            {showLocation.subheading}
          </span>
        )}

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
        {showLocation.period && (
          <span
            style={{
              fontFamily: "'Cormorant Garamond', serif",
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
        )}

        {/* Description */}
        {showLocation.description && (
          showLocation.description.startsWith('http') ? (
            <a
              href={showLocation.description}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 300,
                fontSize: 14,
                lineHeight: 1.7,
                color: '#A0A0A0',
                margin: '0 0 16px 0',
                display: 'block',
                textDecoration: 'underline',
                textUnderlineOffset: 3,
              }}
            >
              {showLocation.description}
            </a>
          ) : (
            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 300,
                fontSize: 14,
                lineHeight: 1.7,
                color: '#A0A0A0',
                margin: '0 0 16px 0',
              }}
            >
              {showLocation.description}
            </p>
          )
        )}

        {/* Coordinates */}
        <span
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 400,
            fontSize: 10,
            color: '#606060',
            letterSpacing: '0.03em',
            lineHeight: 1.5,
            display: 'block',
          }}
        >
          {showLocation.coordinates}
        </span>
      </div>
    </div>
  )
}
