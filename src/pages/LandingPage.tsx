import Header from '../components/landing/Header'
import HeroSection from '../components/landing/HeroSection'
import FeaturesSection from '../components/landing/FeaturesSection'
import StatsSection from '../components/landing/StatsSection'
import CTASection from '../components/landing/CTASection'
import Footer from '../components/landing/Footer'
import './LandingPage.css'

function LandingPage() {
    return (
        <div className="landing-page">
            {/* Skip to main content link for accessibility */}
            <a href="#main-content" className="skip-to-main">
                Skip to main content
            </a>

            <Header />

            <main id="main-content">
                <HeroSection />
                <FeaturesSection />
                <StatsSection />
                <CTASection />
            </main>

            <Footer />
        </div>
    )
}

export default LandingPage
