const LINK_STYLE = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'rgba(192, 192, 192, 0.55)',
  transition: 'color 200ms ease, opacity 200ms ease',
} as const

function handleEnter(e: React.MouseEvent<HTMLAnchorElement>) {
  e.currentTarget.style.color = 'rgba(192, 192, 192, 0.85)'
}

function handleLeave(e: React.MouseEvent<HTMLAnchorElement>) {
  e.currentTarget.style.color = 'rgba(192, 192, 192, 0.55)'
}

export default function SocialLinks({ compact = false }: { compact?: boolean }) {
  return (
    <div
      style={{
        position: 'fixed',
        right: compact ? 16 : 28,
        top: compact ? 16 : undefined,
        bottom: compact ? undefined : 28,
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        gap: compact ? 14 : 18,
      }}
    >
      <a
        href="https://www.linkedin.com/in/elyse-lin6/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="LinkedIn"
        style={LINK_STYLE}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.062 2.062 0 0 1 2.063-2.064 2.062 2.062 0 0 1 2.064 2.064 2.062 2.062 0 0 1-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      </a>

      <a
        href="https://elyselin.substack.com/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Substack"
        style={LINK_STYLE}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M22.539 8.242H1.46V5.406h21.079v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z" />
        </svg>
      </a>
    </div>
  )
}
