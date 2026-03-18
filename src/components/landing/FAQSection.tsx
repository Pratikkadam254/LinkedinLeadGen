import { useState } from 'react'
import { CaretDown } from '@phosphor-icons/react'
import './FAQSection.css'

const faqs = [
    {
        q: 'Is this safe for my LinkedIn account?',
        a: 'Yes. We use human-like delays and respect LinkedIn\'s daily limits. You choose your sending speed: Conservative (15-20/day), Normal (30-40/day), or Aggressive (60-80/day).',
    },
    {
        q: 'What CSV format do I need?',
        a: 'Just a CSV with a LinkedIn URL column. Name, company, and message columns are optional. We auto-detect column names so most Sales Navigator exports work out of the box.',
    },
    {
        q: 'How many requests can I send per day?',
        a: 'You choose: Conservative (15-20/day), Normal (30-40/day), or Aggressive (60-80/day). We recommend starting with Conservative and increasing once you\'re comfortable.',
    },
    {
        q: 'Can I include a custom message?',
        a: 'Yes. You can add a "message" column in your CSV for per-lead messages, or write one global message that goes to everyone. Messages are limited to 300 characters (LinkedIn\'s limit).',
    },
    {
        q: 'What happens if something goes wrong?',
        a: 'You can pause or cancel a batch anytime from your dashboard. If LinkedIn rate-limits your account, we automatically pause and resume the next day.',
    },
]

function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(null)

    const toggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index)
    }

    return (
        <section id="faq" className="faq-section" aria-labelledby="faq-heading">
            <div className="container">
                <header className="section-header">
                    <h2 id="faq-heading">Frequently Asked Questions</h2>
                    <p>Quick answers to common questions about QuickConnect.</p>
                </header>

                <div className="faq-list">
                    {faqs.map((faq, i) => (
                        <div
                            key={i}
                            className={`faq-item ${openIndex === i ? 'open' : ''}`}
                        >
                            <button
                                className="faq-question"
                                onClick={() => toggle(i)}
                                aria-expanded={openIndex === i}
                            >
                                <span>{faq.q}</span>
                                <CaretDown size={20} className="faq-chevron" />
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
