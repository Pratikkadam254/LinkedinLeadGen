import { Link } from 'react-router-dom'
import { Check, ArrowRight } from 'lucide-react'
import './PricingSection.css'

const features = [
    'AI-personalized outbound messaging',
    'Lead sourcing + list building (ICP-matched)',
    'Lead enrichment + data validation',
    'Multi-touch follow-up sequences',
    'AI reply handling (triage + routing)',
    'Calendar booking + handoff to your closer',
    'Weekly optimization (targeting + messaging)',
    'Performance reports (replies, bookings, quality)',
    'Dedicated support channel',
    'Pause/cancel anytime (no long-term lock-in)',
]

function PricingSection() {
    return (
        <section id="pricing" className="pricing-section" aria-labelledby="pricing-heading">
            <div className="container">
                <header className="section-header">
                    <h2 id="pricing-heading">Simple, performance-based pricing</h2>
                    <p>Pay only after qualified leads are delivered. Zero upfront risk.</p>
                </header>

                <div className="pricing-card-wrapper">
                    <div className="pricing-card">
                        <div className="pricing-badge">Popular</div>
                        <div className="pricing-plan">Growth</div>
                        <div className="pricing-model">Pay Per Qualified Lead</div>

                        <Link to="/signup" className="btn btn-primary btn-lg pricing-cta">
                            Get Started
                            <ArrowRight size={18} className="arrow" />
                        </Link>

                        <ul className="pricing-features">
                            {features.map((feature, i) => (
                                <li key={i}>
                                    <Check size={16} className="pricing-check" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="pricing-note">
                            Replacements for any non-qualified / no-show leads
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default PricingSection
