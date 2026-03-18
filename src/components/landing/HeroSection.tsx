import { Link } from 'react-router-dom'
import { CheckCircle, ArrowRight } from '@phosphor-icons/react'
import DashboardPreview from './DashboardPreview'
import './HeroSection.css'

function HeroSection() {
    return (
        <section className="hero" aria-labelledby="hero-heading">
            <div className="container">
                <div className="hero-content">
                    <h1 id="hero-heading" className="animate-fade-in-up">
                        Automate LinkedIn Connection Requests{' '}
                        <span className="hero-highlight">in Minutes</span>
                    </h1>
                    <p className="hero-subtitle animate-fade-in-up animation-delay-1">
                        Upload a CSV, click start, and watch your network grow.
                        No AI fluff, no complex setup.
                    </p>
                    <div className="hero-cta animate-fade-in-up animation-delay-2">
                        <Link to="/signup" className="btn btn-primary btn-pill btn-lg">
                            Start Connecting Free
                            <ArrowRight size={18} className="arrow" aria-hidden="true" />
                        </Link>
                        <a href="#how-it-works" className="btn btn-text btn-lg">
                            See How It Works
                        </a>
                    </div>
                    <div className="trust-badges animate-fade-in-up animation-delay-3" aria-label="Benefits">
                        <span>
                            <CheckCircle size={16} aria-hidden="true" />
                            Free to start
                        </span>
                        <span>
                            <CheckCircle size={16} aria-hidden="true" />
                            No credit card required
                        </span>
                        <span>
                            <CheckCircle size={16} aria-hidden="true" />
                            Setup in 2 minutes
                        </span>
                    </div>
                </div>
                <div className="hero-preview animate-fade-in-up animation-delay-4" aria-hidden="true">
                    <DashboardPreview />
                </div>
            </div>
        </section>
    )
}

export default HeroSection
