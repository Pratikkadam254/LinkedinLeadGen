import { useState } from 'react'
import { CaretDown } from '@phosphor-icons/react'
import './FAQSection.css'

const faqs = [
    {
        q: 'What counts as a qualified lead?',
        a: 'A qualified lead is someone who matches your ICP, has expressed genuine interest, and is open to a conversation. If they don\'t show, aren\'t a fit, or the engagement ends early, we replace them at no extra cost.',
    },
    {
        q: 'How long until I see results?',
        a: 'Most clients start seeing qualified leads within the first 2 weeks. By week 4, you should have a predictable flow of booked meetings landing on your calendar.',
    },
    {
        q: 'Do I need to commit to a long-term contract?',
        a: 'No. You can pause or cancel anytime — there\'s no long-term lock-in. We earn your business every month by delivering results.',
    },
    {
        q: 'How is this different from hiring a sales team?',
        a: 'LeadFlow AI combines AI-powered personalization with automated outreach at a fraction of the cost. No salaries, no training, no management overhead — just results.',
    },
    {
        q: 'What tools do you integrate with?',
        a: 'We integrate with LinkedIn, major CRMs (Salesforce, HubSpot), email providers, Slack, and most calendar tools. Custom integrations are available on request.',
    },
    {
        q: 'Can I see a demo before signing up?',
        a: 'Absolutely! Book a free demo call and we\'ll walk you through the platform, show real results from similar clients, and create a custom strategy for your business.',
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
                    <p>Quick answers to common questions about LeadFlow AI.</p>
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
