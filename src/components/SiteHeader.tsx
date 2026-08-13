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
  return (
    <header className="site-header">
      <h1 className="site-header__title" aria-label="Elyse Lin">
        Elyse Lin
      </h1>

      <nav className="site-header__nav" aria-label="Page sections">
        <ul className="site-header__nav-list">
          {NAV_ITEMS.map(({ id, label }) => (
            <li key={id}>
              <button
                type="button"
                className="site-header__nav-link"
                onClick={() => scrollToSection(id)}
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
