import Header from '../components/landing/Header'
import HeroSection from '../components/landing/HeroSection'
import HowItWorksSection from '../components/landing/HowItWorksSection'
import PricingSection from '../components/landing/PricingSection'
import FAQSection from '../components/landing/FAQSection'
import Footer from '../components/landing/Footer'
import './LandingPage.css'

function LandingPage() {
    return (
        <div className="landing-page">
            <a href="#main-content" className="skip-to-main">
                Skip to main content
            </a>

            <Header />

            <main id="main-content">
                <HeroSection />
                <HowItWorksSection />
                <PricingSection />
                <FAQSection />
            </main>

            <Footer />
        </div>
    )
}

export default LandingPage
