import { Quotes } from '@phosphor-icons/react'
import './TestimonialSection.css'

function TestimonialSection() {
    return (
        <section className="testimonial-section" aria-label="Customer testimonial">
            <div className="container">
                <div className="testimonial-card">
                    <Quotes size={32} weight="duotone" className="testimonial-icon" aria-hidden="true" />
                    <blockquote className="testimonial-quote">
                        "We used to spend hours manually sending LinkedIn connection requests. With QuickConnect,
                        we uploaded our Sales Navigator list and had{' '}
                        <strong>200+ new connections in a week.</strong> The dashboard makes it easy to track everything."
                    </blockquote>
                    <div className="testimonial-author">
                        <div className="testimonial-avatar">SM</div>
                        <div>
                            <div className="testimonial-name">Sarah Mitchell</div>
                            <div className="testimonial-role">Head of Sales, Apex Consulting</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default TestimonialSection
