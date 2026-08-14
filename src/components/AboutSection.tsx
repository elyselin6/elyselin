import './AboutSection.css'

export default function AboutSection() {
  return (
    <div className="about-section">
      <div className="about-section__text">
        <h2 className="section-heading">About Me</h2>
        <p className="about-section__body">
          Elyse brings experience working in venture capital, corporate strategy, and real estate
          across four countries. With a background in Business and International Studies from
          Penn&apos;s Huntsman Program, she combines industry fluency and creative vision. She builds
          websites, pitch decks, and brand identities for finance firms and entrepreneurs that want
          their brand to match their ambition.
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

      <div className="about-section__photo-wrap">
        <img
          src="/elyse-lin-about.png"
          alt="Elyse Lin"
          className="about-section__photo"
          loading="lazy"
        />
      </div>
    </div>
  )
}
