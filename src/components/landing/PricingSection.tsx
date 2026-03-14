import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import './PricingSection.css'

const proFeatures = [
    '500 leads/month',
    '200 outreach messages/month',
    '1 LinkedIn account',
    'AI message generation',
    'Manual approval required',
]

const eliteFeatures = [
    '2,000 leads/month',
    '800 outreach messages/month',
    '3 LinkedIn accounts',
    'AI message generation',
    'Autopilot mode',
    'Priority support',
    'Analytics dashboard',
]

function PricingSection() {
    return (
        <section id="pricing" className="pricing" aria-labelledby="pricing-heading">
            <div className="pricing-container">
                <h2 id="pricing-heading" className="pricing-title">Simple, transparent pricing</h2>

                <div className="pricing-cards">
                    <div className="pricing-card">
                        <div className="pricing-card-header">
                            <h3 className="pricing-plan-name">Pro</h3>
                            <div className="pricing-amount">
                                <span className="pricing-dollar">$59</span>
                                <span className="pricing-period">/mo</span>
                            </div>
                        </div>
                        <ul className="pricing-features">
                            {proFeatures.map((feature, i) => (
                                <li key={i}>
                                    <Check size={16} className="pricing-check" aria-hidden="true" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                        <Link to="/signup" className="pricing-cta">Get Started</Link>
                    </div>

                    <div className="pricing-card pricing-card-highlighted">
                        <div className="pricing-badge">Recommended</div>
                        <div className="pricing-card-header">
                            <h3 className="pricing-plan-name">Elite</h3>
                            <div className="pricing-amount">
                                <span className="pricing-dollar">$249</span>
                                <span className="pricing-period">/mo</span>
                            </div>
                        </div>
                        <ul className="pricing-features">
                            {eliteFeatures.map((feature, i) => (
                                <li key={i}>
                                    <Check size={16} className="pricing-check" aria-hidden="true" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                        <Link to="/signup" className="pricing-cta pricing-cta-highlighted">Get Started</Link>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default PricingSection
