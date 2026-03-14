import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import './FAQSection.css'

const faqs = [
    {
        q: 'How is this different from GoJiBerry / other tools?',
        a: 'We focus on simplicity. No complex campaign builders or strategy layers. Upload leads, AI writes messages, you approve. Done.',
    },
    {
        q: 'Do I need to give you my LinkedIn password?',
        a: 'No. We use Unipile, a secure API integration. Your credentials are never stored by us.',
    },
    {
        q: 'What happens if I hit my monthly limit?',
        a: "You can upgrade your plan anytime from your settings. Unused messages don't roll over.",
    },
    {
        q: 'Can I cancel anytime?',
        a: 'Yes. No contracts, no lock-in. Cancel from your settings page.',
    },
    {
        q: 'How does AI message generation work?',
        a: 'We use Claude AI to analyze each lead\'s profile data and craft a personalized connection request under 300 characters that sounds human, not robotic.',
    },
]

function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(null)

    const toggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index)
    }

    return (
        <section className="faq" aria-labelledby="faq-heading">
            <div className="faq-container">
                <h2 id="faq-heading" className="faq-title">Frequently Asked Questions</h2>

                <div className="faq-list">
                    {faqs.map((faq, i) => (
                        <div
                            key={i}
                            className={`faq-item ${openIndex === i ? 'faq-item-open' : ''}`}
                        >
                            <button
                                className="faq-question"
                                onClick={() => toggle(i)}
                                aria-expanded={openIndex === i}
                            >
                                <span>{faq.q}</span>
                                <ChevronDown size={20} className="faq-chevron" aria-hidden="true" />
                            </button>
                            <div className="faq-answer">
                                <p>{faq.a}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default FAQSection
