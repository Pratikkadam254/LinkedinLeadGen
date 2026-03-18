import { Link } from 'react-router-dom'
import { ArrowRight } from '@phosphor-icons/react'
import './PricingSection.css'

function PricingSection() {
    return (
        <section id="pricing" className="pricing-section" aria-labelledby="pricing-heading">
            <div className="container">
                <header className="section-header">
                    <h2 id="pricing-heading">Pricing Coming Soon</h2>
                    <p>QuickConnect is free while in early access. Start connecting today.</p>
                </header>

                <div className="pricing-card-wrapper">
                    <div className="pricing-card">
                        <div className="pricing-badge">Early Access</div>
                        <div className="pricing-plan">Free</div>
                        <div className="pricing-model">While in beta</div>

                        <Link to="/signup" className="btn btn-primary btn-pill btn-lg pricing-cta">
                            Get Started Free
                            <ArrowRight size={18} className="arrow" />
                        </Link>

                        <div className="pricing-note">
                            No credit card required. Upgrade options coming soon.
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default PricingSection
