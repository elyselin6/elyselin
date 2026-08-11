import './PortfolioGallery.css'

const PORTFOLIO_IMAGES = [
  {
    id: 1,
    src: '/portfolio/armada-ventures-home.png',
    alt: 'Armada Ventures website — pre-obvious infrastructure',
    href: 'https://www.armada-ventures.com/',
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
  {
    id: 4,
    src: '/portfolio/ilona-money-memories.png',
    alt: 'Ilona — Money Memories | Bear and the Bull',
  },
] as const

type PortfolioImage = (typeof PORTFOLIO_IMAGES)[number]

function PortfolioItem({ image }: { image: PortfolioImage }) {
  const content = (
    <img src={image.src} alt={image.alt} loading="lazy" draggable={false} />
  )

  if ('href' in image && image.href) {
    return (
      <a
        href={image.href}
        target="_blank"
        rel="noopener noreferrer"
        className="portfolio-gallery__item portfolio-gallery__item--link"
        aria-label={`${image.alt} (opens in new tab)`}
      >
        {content}
      </a>
    )
  }

  return <div className="portfolio-gallery__item">{content}</div>
}

export default function PortfolioGallery() {
  const images = [...PORTFOLIO_IMAGES, ...PORTFOLIO_IMAGES]

  return (
    <div className="portfolio-gallery">
      <div className="portfolio-gallery__track">
        {images.map((image, index) => (
          <PortfolioItem key={`${image.id}-${index}`} image={image} />
        ))}
      </div>
    </div>
  )
}
