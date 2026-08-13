import StarfieldBackground from './components/StarfieldBackground'
import SiteHeader from './components/SiteHeader'
import AboutSection from './components/AboutSection'
import PortfolioSection from './components/PortfolioSection'
import ServicesSection from './components/ServicesSection'
import ContactSection from './components/ContactSection'
import SocialLinks from './components/SocialLinks'
import './App.css'

export default function App() {
  return (
    <div className="app-root">
      <StarfieldBackground />
      <SiteHeader />
      <SocialLinks />

      <main className="scroll-container">
        <section id="home" className="page-section page-section--hero" aria-label="Introduction">
          <p className="hero-tagline">storytelling through design.</p>
        </section>

        <section id="about" className="page-section page-section--about" aria-label="About">
          <AboutSection />
        </section>

        <section id="portfolio" className="page-section page-section--portfolio" aria-label="Portfolio">
          <PortfolioSection />
        </section>

        <section id="services" className="page-section page-section--services" aria-label="Services">
          <ServicesSection />
        </section>

        <section id="apply" className="page-section page-section--contact" aria-label="Apply">
          <ContactSection />
        </section>
      </main>
    </div>
  )
}
