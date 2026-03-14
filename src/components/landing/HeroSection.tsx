import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import './HeroSection.css'

function HeroSection() {
    return (
        <section className="hero" aria-labelledby="hero-heading">
            <div className="hero-container">
                <h1 id="hero-heading" className="hero-headline">
                    LinkedIn outreach that actually works.
                </h1>
                <p className="hero-subtitle">
                    Upload your leads. AI writes personalized messages. You approve and send. That simple.
                </p>
                <div className="hero-cta">
                    <Link to="/onboarding" className="hero-cta-primary">
                        Get Started Free
                    </Link>
                    <a href="#how-it-works" className="hero-cta-secondary">
                        See how it works
                    </a>
                </div>
                <div className="hero-trust" aria-label="Benefits">
                    <span className="hero-trust-item">
                        <Check size={16} aria-hidden="true" />
                        No free trial needed
                    </span>
                    <span className="hero-trust-divider" aria-hidden="true">|</span>
                    <span className="hero-trust-item">
                        <Check size={16} aria-hidden="true" />
                        Cancel anytime
                    </span>
                    <span className="hero-trust-divider" aria-hidden="true">|</span>
                    <span className="hero-trust-item">
                        <Check size={16} aria-hidden="true" />
                        Setup in 5 minutes
                    </span>
                </div>
            </div>
        </section>
    )
}

export default HeroSection
