import { Link } from 'react-router-dom'
import { ArrowRight } from '@phosphor-icons/react'
import './CTASection.css'

function CTASection() {
    return (
        <section id="cta" className="cta-section" aria-labelledby="cta-heading">
            <div className="container">
                <div className="cta-card">
                    <div className="cta-content">
                        <h2 id="cta-heading">Ready to Grow Your LinkedIn Network?</h2>
                        <p>
                            Upload your CSV and start sending connection requests in minutes.
                        </p>
                        <Link to="/signup" className="btn btn-primary btn-pill btn-lg">
                            Start Connecting Free
                            <ArrowRight size={18} className="arrow" aria-hidden="true" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default CTASection
