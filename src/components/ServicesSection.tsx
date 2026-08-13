import { useCallback, useEffect, useState } from 'react'
import './ServicesSection.css'

type Service = {
  id: string
  title: string
  cover: string
  modalCover?: string
  coverPosition?: string
  modalCoverPosition?: string
  summary: string
  description: string
  caseStudy?: string
}

const SERVICES: Service[] = [
  {
    id: 'sharpen',
    title: 'Sharpen',
    cover: '/services/sharpen-cover.png',
    modalCover: '/services/sharpen-modal-cover.png',
    coverPosition: 'center center',
    modalCoverPosition: 'center center',
    summary: 'Refine your existing deck and materials into something unforgettable.',
    description:
      'You have a deck, but it isn\'t working as hard as you are. Sharpen is a focused refresh of your ' +
      'existing pitch deck or investor materials — tightening the narrative, elevating the design, and ' +
      'making sure every slide earns its place. For founders and firms who know what they want to say and ' +
      'need help saying it more beautifully.',
    caseStudy:
      'Case Study: When Nicole came to me with a presentation she had prepared for a keynote speaking ' +
      'event, she knew it was good, but could be better. We refined the font family and color scheme for ' +
      'legibility, rearranged the graphics and photos, and reorganized the slide flow to tell a more ' +
      'cohesive story. She was able to walk on stage with a deck that did her ideas justice.',
  },
  {
    id: 'reimagine',
    title: 'Reimagine',
    cover: '/services/reimagine-cover.png',
    coverPosition: 'center center',
    summary: 'Rebuild the story behind the brand from the ground up.',
    description:
      'Reimagine is a full brand overhaul — website, deck, and supporting materials rebuilt from scratch ' +
      'with a unified visual identity and a clear point of view. The result is a brand presence that walks ' +
      'into the room before you do.',
    caseStudy:
      'May include: creating media kits, revising investor documents, website creation, creating pitch ' +
      'deck templates',
  },
  {
    id: 'launch',
    title: 'Launch',
    cover: '/services/launch-cover.png',
    coverPosition: 'top center',
    summary: 'Take your vision live with a custom website built to command attention.',
    description:
      'Your website is your first impression, your 24/7 pitch, and your proof of legitimacy. ' +
      'Custom build your website that commands attention and converts interest into trust.',
    caseStudy:
      'Case Study: A newly launched venture fund needed a website that could speak credibly to two ' +
      'different audiences: seasoned investors and early-stage founders. Starting from an initial brand ' +
      'vision, I rebuilt the site from the ground up — introducing motion graphics, refining the visuals, ' +
      'and tightening the copy to match the fund\'s voice. The result: a polished digital presence ready ' +
      'for its first investor conversations.',
  },
]

export default function ServicesSection() {
  const [activeService, setActiveService] = useState<Service | null>(null)

  const closeModal = useCallback(() => {
    setActiveService(null)
  }, [])

  useEffect(() => {
    if (!activeService) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeModal()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeService, closeModal])

  return (
    <div className="services-section">
      <h2 className="section-heading services-section__heading">Services</h2>

      <div className="services-section__grid">
        {SERVICES.map((service) => (
          <button
            key={service.id}
            type="button"
            className="services-card"
            onClick={() => setActiveService(service)}
            aria-haspopup="dialog"
          >
            <img
              src={service.cover}
              alt=""
              className="services-card__cover"
              style={service.coverPosition ? { objectPosition: service.coverPosition } : undefined}
              loading="lazy"
              draggable={false}
            />
            <div className="services-card__overlay" aria-hidden="true" />
            <div className="services-card__content">
              <h3 className="services-card__title">{service.title}</h3>
              <p className="services-card__summary">{service.summary}</p>
            </div>
          </button>
        ))}
      </div>

      {activeService && (
        <div className="services-modal" role="presentation">
          <button
            type="button"
            className="services-modal__backdrop"
            aria-label="Close service details"
            onClick={closeModal}
          />

          <div
            className="services-modal__panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`service-title-${activeService.id}`}
          >
            <button
              type="button"
              className="services-modal__close"
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

            <div className="services-modal__media">
              <img
                src={activeService.modalCover ?? activeService.cover}
                alt=""
                draggable={false}
                style={
                  activeService.modalCoverPosition || activeService.coverPosition
                    ? {
                        objectPosition:
                          activeService.modalCoverPosition ?? activeService.coverPosition,
                      }
                    : undefined
                }
              />
            </div>

            <div className="services-modal__body">
              <h3 className="services-modal__title" id={`service-title-${activeService.id}`}>
                {activeService.title}
              </h3>
              <p className="services-modal__description">{activeService.description}</p>
              {activeService.caseStudy && (
                <p className="services-modal__case-study">{activeService.caseStudy}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
