import { Link } from 'react-router-dom'
import { CheckCircle, ArrowRight } from '@phosphor-icons/react'
import DashboardPreview from './DashboardPreview'
import './HeroSection.css'

function HeroSection() {
    return (
        <section className="hero" aria-labelledby="hero-heading">
            <div className="container">
                <div className="hero-content">
                    <h1 id="hero-heading" className="reveal">
                        Turn LinkedIn Into Your{' '}
                        <span className="hero-highlight">Top Revenue Channel</span>
                    </h1>
                    <p className="hero-subtitle reveal stagger-1">
                        AI-powered lead generation that feels human. Build meaningful
                        relationships at scale without losing authenticity.
                    </p>
                    <div className="hero-cta reveal stagger-2">
                        <Link to="/signup" className="btn btn-primary btn-pill btn-lg">
                            Start Free Trial
                            <ArrowRight size={18} className="arrow" aria-hidden="true" />
                        </Link>
                        <a href="#features" className="btn btn-text btn-lg">
                            See How It Works
                        </a>
                    </div>
                    <div className="trust-badges reveal stagger-3" aria-label="Benefits">
                        <span>
                            <CheckCircle size={16} aria-hidden="true" />
                            7-day free trial
                        </span>
                        <span>
                            <CheckCircle size={16} aria-hidden="true" />
                            No credit card required
                        </span>
                        <span>
                            <CheckCircle size={16} aria-hidden="true" />
                            Setup in 5 minutes
                        </span>
                    </div>
                </div>
                <div className="hero-preview reveal-scale stagger-4" aria-hidden="true">
                    <DashboardPreview />
                </div>
            </div>
        </section>
    )
}

export default HeroSection
