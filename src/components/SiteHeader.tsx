import { useEffect, useState } from 'react'
import './SiteHeader.css'

const NAV_ITEMS = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'services', label: 'Services' },
  { id: 'apply', label: 'Apply' },
] as const

function scrollToSection(id: string) {
  const section = document.getElementById(id)
  section?.scrollIntoView({ behavior: 'smooth' })
}

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (!menuOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [menuOpen])

  function handleNavigate(id: string) {
    scrollToSection(id)
    setMenuOpen(false)
  }

  return (
    <header className={`site-header${menuOpen ? ' site-header--menu-open' : ''}`}>
      <div className="site-header__bar">
        <h1 className="site-header__title" aria-label="Elyse Lin">
          Elyse Lin
        </h1>

        <button
          type="button"
          className="site-header__menu-toggle"
          aria-expanded={menuOpen}
          aria-controls="site-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="site-header__menu-toggle-label">{menuOpen ? 'Close' : 'Menu'}</span>
          <span className="site-header__menu-icon" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>
      </div>

      {menuOpen && (
        <button
          type="button"
          className="site-header__menu-backdrop"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <nav
        id="site-navigation"
        className={`site-header__nav${menuOpen ? ' site-header__nav--open' : ''}`}
        aria-label="Page sections"
      >
        <ul className="site-header__nav-list">
          {NAV_ITEMS.map(({ id, label }) => (
            <li key={id}>
              <button
                type="button"
                className="site-header__nav-link"
                onClick={() => handleNavigate(id)}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
