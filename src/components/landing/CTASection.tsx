import { Link } from 'react-router-dom'
import { ArrowRight } from '@phosphor-icons/react'
import './CTASection.css'

function CTASection() {
    return (
        <section id="cta" className="cta-section" aria-labelledby="cta-heading">
            <div className="container">
                <div className="cta-card reveal-scale">
                    <div className="cta-content">
                        <h2 id="cta-heading">Ready to Fill Your Calendar with Qualified Meetings?</h2>
                        <p>
                            Join hundreds of B2B professionals using LeadFlow AI
                            to build meaningful connections at scale.
                        </p>
                        <Link to="/signup" className="btn btn-primary btn-pill btn-lg">
                            Start Free Trial
                            <ArrowRight size={18} className="arrow" aria-hidden="true" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default CTASection
