import { UploadSimple, Play, ChartBar } from '@phosphor-icons/react'
import './HowItWorksSection.css'

const steps = [
    {
        id: 'upload',
        icon: UploadSimple,
        title: 'Upload CSV',
        summary: 'Export from Sales Navigator and upload your leads CSV.',
        details: [
            'Export your leads from LinkedIn Sales Navigator',
            'Upload the CSV file to QuickConnect',
            'We auto-detect LinkedIn URLs, names, and companies',
            'Review the parsed leads before proceeding',
        ],
    },
    {
        id: 'start',
        icon: Play,
        title: 'Click Start',
        summary: 'Choose your sending speed and hit go.',
        details: [
            'Write a connection message or use per-lead messages from your CSV',
            'Pick your rate: Conservative, Normal, or Aggressive',
            'Click start and QuickConnect handles the rest',
            'Requests are sent at human-like intervals',
        ],
    },
    {
        id: 'results',
        icon: ChartBar,
        title: 'Watch Results',
        summary: 'Track accepts and replies in real-time.',
        details: [
            'See sent, accepted, and replied counts update live',
            'Monitor errors and already-connected leads',
            'Pause or cancel anytime from your dashboard',
            'Download results when your batch completes',
        ],
    },
]

function HowItWorksSection() {
    return (
        <section id="how-it-works" className="how-it-works" aria-labelledby="how-heading">
            <div className="container">
                <header className="section-header">
                    <h2 id="how-heading">How QuickConnect Works</h2>
                    <p>Three simple steps to grow your LinkedIn network.</p>
                </header>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    gap: 'var(--space-xl)',
                    marginTop: 'var(--space-2xl)',
                }}>
                    {steps.map((step, i) => (
                        <div key={step.id} style={{
                            background: 'var(--color-bg-primary)',
                            borderRadius: 'var(--radius-lg)',
                            padding: 'var(--space-xl)',
                            boxShadow: 'var(--shadow-card)',
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-md)',
                                marginBottom: 'var(--space-lg)',
                            }}>
                                <div style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 'var(--radius-md)',
                                    background: 'var(--color-primary-lighter)',
                                    color: 'var(--color-primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                }}>
                                    {i + 1}
                                </div>
                                <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{step.title}</h3>
                            </div>
                            <p style={{
                                color: 'var(--color-text-secondary)',
                                fontSize: '0.875rem',
                                lineHeight: 1.6,
                                marginBottom: 'var(--space-md)',
                            }}>
                                {step.summary}
                            </p>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {step.details.map((detail, j) => (
                                    <li key={j} style={{
                                        fontSize: '0.8125rem',
                                        color: 'var(--color-text-secondary)',
                                        padding: '4px 0',
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: 'var(--space-sm)',
                                    }}>
                                        <span style={{ color: 'var(--color-success)', fontWeight: 700, flexShrink: 0 }}>&#10003;</span>
                                        {detail}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default HowItWorksSection
