import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import './CTASection.css'

function CTASection() {
    return (
        <section className="final-cta" aria-labelledby="cta-heading">
            <div className="final-cta-inner">
                <h2 id="cta-heading">Make pipeline predictable.</h2>
                <Link to="/signup" className="btn btn-cta btn-lg">
                    Book a Demo
                    <ArrowRight size={18} className="arrow" aria-hidden="true" />
                </Link>
            </div>
        </section>
    )
}

export default CTASection
