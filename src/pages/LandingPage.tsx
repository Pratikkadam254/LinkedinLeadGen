import Header from '../components/landing/Header'
import HeroSection from '../components/landing/HeroSection'
import FeaturesSection from '../components/landing/FeaturesSection'
import HowItWorksSection from '../components/landing/HowItWorksSection'
import StatsSection from '../components/landing/StatsSection'
import TestimonialSection from '../components/landing/TestimonialSection'
import PricingSection from '../components/landing/PricingSection'
import FAQSection from '../components/landing/FAQSection'
import CTASection from '../components/landing/CTASection'
import Footer from '../components/landing/Footer'
import { useScrollReveal } from '../hooks/useScrollReveal'
import './LandingPage.css'

function LandingPage() {
    useScrollReveal()

    return (
        <div className="landing-page">
            <a href="#main-content" className="skip-to-main">
                Skip to main content
            </a>

            <Header />

            <main id="main-content">
                <HeroSection />
                <StatsSection />
                <FeaturesSection />
                <HowItWorksSection />
                <TestimonialSection />
                <PricingSection />
                <FAQSection />
                <CTASection />
            </main>

            <Footer />
        </div>
    )
}

export default LandingPage
