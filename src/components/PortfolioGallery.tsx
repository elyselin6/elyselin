import './PortfolioGallery.css'

const PORTFOLIO_IMAGES = [
  {
    id: 1,
    src: '/portfolio/armada-ventures-home.png',
    alt: 'Armada Ventures website — pre-obvious infrastructure',
  },
  {
    id: 2,
    src: '/portfolio/armada-ventures-pitch.png',
    alt: 'Armada Ventures pitch deck — investing in financial infrastructure',
  },
  {
    id: 3,
    src: '/portfolio/narrative-advantage.png',
    alt: 'The Narrative Advantage — raising capital and attention',
  },
]

export default function PortfolioGallery() {
  const images = [...PORTFOLIO_IMAGES, ...PORTFOLIO_IMAGES]

  return (
    <div className="portfolio-gallery">
      <div className="portfolio-gallery__track">
        {images.map((image, index) => (
          <div key={`${image.id}-${index}`} className="portfolio-gallery__item">
            <img src={image.src} alt={image.alt} loading="lazy" draggable={false} />
          </div>
        ))}
      </div>
    </div>
  )
}
