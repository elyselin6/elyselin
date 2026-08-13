import PortfolioGallery from './PortfolioGallery'
import './PortfolioSection.css'

export default function PortfolioSection() {
  return (
    <div className="portfolio-section">
      <h2 className="section-heading portfolio-section__heading">Portfolio</h2>
      <PortfolioGallery />
    </div>
  )
}
