import { useCallback, useEffect, useState } from 'react'
import './PortfolioGallery.css'

type PortfolioDetailSection = {
  heading: string
  body: string
}

type PortfolioImage = {
  id: number
  src: string
  alt: string
  title?: string
  href?: string
  modalCover?: string
  detail?: PortfolioDetailSection[]
}

const PORTFOLIO_IMAGES: PortfolioImage[] = [
  {
    id: 1,
    src: '/portfolio/armada-ventures-home.png',
    alt: 'Armada Ventures website — pre-obvious infrastructure',
    title: 'Armada Ventures',
    detail: [
      {
        heading: 'The Brief',
        body:
          'A newly launched venture fund needed a digital presence that could speak credibly to two very ' +
          'different audiences simultaneously: seasoned investors evaluating the fund, and early-stage ' +
          'founders deciding whether to apply. The site needed to do both without compromising either.',
      },
      {
        heading: 'The Approach',
        body:
          'The founder had already built a skeletal site using AI as a starting point — a rough framework ' +
          'with the bones of a vision. I took that foundation and rebuilt it into something fully realized: ' +
          'introducing motion graphics to bring the identity to life, refining the visual language for ' +
          'consistency and polish, and tightening the copy to sharpen the fund\'s voice and point of view. ' +
          'Every design decision was made with both audiences in mind.',
      },
      {
        heading: 'The Outcome',
        body:
          'A polished, conversion-ready digital presence that positioned the fund with credibility and intention.',
      },
    ],
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
  {
    id: 5,
    src: '/portfolio/the-wealthy-way.png',
    alt: 'The Wealthy Way — The Millionaire Mom Next Door',
    title: 'The Wealthy Way',
    detail: [
      {
        heading: 'The Brief',
        body:
          'Nicole had prepared a keynote presentation she knew was good — but felt it could go further. ' +
          'She came with a clear vision and strong content, and while she had a color direction in mind, ' +
          'she wanted a theme that better reflected the premium quality of her brand.',
      },
      {
        heading: 'The Approach',
        body:
          'We developed a refined wood, gold, and silver marble palette that elevated the visual tone to ' +
          'match her brand positioning. From there, we refined the typography for legibility and cohesion, ' +
          'rearranged graphics and photography for better flow, and restructured the slide sequence to build ' +
          'a more compelling narrative arc from open to close.',
      },
      {
        heading: 'The Outcome',
        body:
          'Nicole walked on stage with a deck that was polished, cohesive, and could do her ideas justice.',
      },
    ],
  },
]

function PortfolioItem({
  image,
  onOpenDetail,
}: {
  image: PortfolioImage
  onOpenDetail: (image: PortfolioImage) => void
}) {
  const content = (
    <img src={image.src} alt={image.alt} loading="lazy" draggable={false} />
  )

  if (image.href) {
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

  if (image.detail) {
    return (
      <button
        type="button"
        className="portfolio-gallery__item portfolio-gallery__item--interactive"
        aria-label={`${image.alt} — view project details`}
        onClick={() => onOpenDetail(image)}
      >
        {content}
      </button>
    )
  }

  return <div className="portfolio-gallery__item">{content}</div>
}

export default function PortfolioGallery() {
  const images = [...PORTFOLIO_IMAGES, ...PORTFOLIO_IMAGES]
  const [activeImage, setActiveImage] = useState<PortfolioImage | null>(null)

  const closeModal = useCallback(() => {
    setActiveImage(null)
  }, [])

  useEffect(() => {
    if (!activeImage) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeModal()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeImage, closeModal])

  return (
    <>
      <div className={`portfolio-gallery${activeImage ? ' portfolio-gallery--paused' : ''}`}>
        <div className="portfolio-gallery__track">
          {images.map((image, index) => (
            <PortfolioItem
              key={`${image.id}-${index}`}
              image={image}
              onOpenDetail={setActiveImage}
            />
          ))}
        </div>
      </div>

      {activeImage && (
        <div className="portfolio-modal" role="presentation">
          <button
            type="button"
            className="portfolio-modal__backdrop"
            aria-label="Close project details"
            onClick={closeModal}
          />

          <div
            className={`portfolio-modal__panel${activeImage.modalCover ? '' : ' portfolio-modal__panel--text-only'}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`portfolio-title-${activeImage.id}`}
          >
            <button
              type="button"
              className="portfolio-modal__close"
              aria-label="Close"
              onClick={closeModal}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path
                  d="M1 1L13 13M13 1L1 13"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            {activeImage.modalCover && (
              <div className="portfolio-modal__media">
                <img src={activeImage.modalCover} alt="" draggable={false} />
              </div>
            )}

            <div className="portfolio-modal__body">
              <h3 className="portfolio-modal__title" id={`portfolio-title-${activeImage.id}`}>
                {activeImage.title ?? activeImage.alt}
              </h3>
              {activeImage.detail?.map((section) => (
                <div key={section.heading} className="portfolio-modal__section">
                  <h4 className="portfolio-modal__section-heading">{section.heading}</h4>
                  <p className="portfolio-modal__section-body">{section.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
