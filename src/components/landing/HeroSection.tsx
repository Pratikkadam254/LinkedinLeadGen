import { Link } from 'react-router-dom'
import { Check, ArrowRight } from 'lucide-react'
import DashboardPreview from './DashboardPreview'
import './HeroSection.css'

function HeroSection() {
    return (
        <section className="hero" aria-labelledby="hero-heading">
            <div className="container">
                <div className="hero-content">
                    <div className="hero-text">
                        <h1 id="hero-heading">
                            Transform LinkedIn Connections Into{' '}
                            <span className="text-primary">Qualified Leads</span>
                        </h1>
                        <p className="hero-subtitle">
                            AI-powered lead generation that feels human. Build meaningful
                            relationships at scale without losing authenticity.
                        </p>
                        <div className="hero-cta">
                            <Link to="/signup" className="btn btn-primary btn-lg">
                                Start Free Trial
                                <ArrowRight size={18} className="arrow" aria-hidden="true" />
                            </Link>
                            <a href="#features" className="btn btn-secondary btn-lg">
                                See How It Works
                            </a>
                        </div>
                        <div className="trust-badges" aria-label="Benefits">
                            <span>
                                <Check size={16} aria-hidden="true" />
                                7-day free trial
                            </span>
                            <span>
                                <Check size={16} aria-hidden="true" />
                                No credit card required
                            </span>
                            <span>
                                <Check size={16} aria-hidden="true" />
                                Setup in 5 minutes
                            </span>
                        </div>
                    </div>
                    <div className="hero-image" aria-hidden="true">
                        <DashboardPreview />
                    </div>
                </div>
            </div>
        </section>
    )
}

export default HeroSection
