import { Quote } from 'lucide-react'
import './TestimonialSection.css'

function TestimonialSection() {
    return (
        <section className="testimonial-section" aria-label="Customer testimonial">
            <div className="container">
                <div className="testimonial-card">
                    <Quote size={32} className="testimonial-icon" aria-hidden="true" />
                    <blockquote className="testimonial-quote">
                        "Before LeadFlow AI we averaged 2–3 sales calls per week. Within 30 days we were consistently
                        at 10–12 qualified calls per week, and in 6 weeks we closed 4 new clients—about{' '}
                        <strong>$78k in added revenue.</strong>"
                    </blockquote>
                    <div className="testimonial-author">
                        <div className="testimonial-avatar">JR</div>
                        <div>
                            <div className="testimonial-name">James Rodriguez</div>
                            <div className="testimonial-role">Founder, Represent Agency</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default TestimonialSection
