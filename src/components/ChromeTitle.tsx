import './ChromeTitle.css'

export default function ChromeTitle() {
  return (
    <header className="chrome-title-header">
      <h1 className="chrome-title" aria-label="Elyse Lin">
        <span className="chrome-title-text">elyse lin</span>
        <span className="chrome-title-shimmer" aria-hidden="true">
          elyse lin
        </span>
      </h1>
    </header>
  )
}
