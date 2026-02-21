import { useState } from 'react'
import { Brain, Search, Rocket, TrendingUp } from 'lucide-react'
import './HowItWorksSection.css'

const steps = [
    {
        id: 'onboarding',
        icon: Brain,
        title: 'AI Onboarding',
        summary: 'Chat with our AI to lock in your ICP and tighten your offer before we launch.',
        details: [
            'Define your Ideal Customer Profile with AI guidance',
            'Craft an irresistible offer that resonates',
            'Set targeting criteria and messaging tone',
            'Review and approve your strategy document',
        ],
    },
    {
        id: 'source',
        icon: Search,
        title: 'Source the right leads',
        summary: 'We find leads from unique sources and filter them to match your ICP.',
        details: [
            'Scrape leads from LinkedIn, databases, and directories',
            'Enrich contact data with company intel',
            'Score and rank by ICP fit',
            'Filter out bad-fit prospects automatically',
        ],
    },
    {
        id: 'launch',
        icon: Rocket,
        title: 'Personalize + Launch',
        summary: 'Hyper-personalized messages so you get buyers, not browsers.',
        details: [
            'AI crafts unique messages for each prospect',
            'Multi-touch sequences across channels',
            'Smart follow-up timing based on engagement',
            'A/B test messaging for maximum response',
        ],
    },
    {
        id: 'scale',
        icon: TrendingUp,
        title: 'Scale what works',
        summary: 'We monitor replies, booking rate, and meeting quality — then tighten targeting.',
        details: [
            'Track reply rates, booking rates, and quality',
            'Weekly optimization of targeting + messaging',
            'Scale winning campaigns automatically',
            'Performance reports delivered to your inbox',
        ],
    },
]

function HowItWorksSection() {
    const [activeStep, setActiveStep] = useState(0)
    const currentStep = steps[activeStep]

    return (
        <section id="how-it-works" className="how-it-works" aria-labelledby="how-heading">
            <div className="container">
                <header className="section-header">
                    <h2 id="how-heading">How LeadFlow AI works</h2>
                    <p>A simple proven process that turns targeting + messaging into booked meetings.</p>
                </header>

                {/* Step tabs */}
                <div className="step-tabs" role="tablist">
                    {steps.map((step, i) => (
                        <button
                            key={step.id}
                            role="tab"
                            aria-selected={activeStep === i}
                            className={`step-tab ${activeStep === i ? 'active' : ''}`}
                            onClick={() => setActiveStep(i)}
                        >
                            <step.icon size={18} />
                            <span>{step.title}</span>
                        </button>
                    ))}
                </div>

                {/* Step content */}
                <div className="step-content" role="tabpanel" key={currentStep.id}>
                    <div className="step-text">
                        <div className="step-number">Step {activeStep + 1}</div>
                        <h3>{currentStep.title}</h3>
                        <p>{currentStep.summary}</p>
                        <ul className="step-details">
                            {currentStep.details.map((detail, i) => (
                                <li key={i}>
                                    <span className="check-icon">✓</span>
                                    {detail}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="step-visual">
                        <div className="step-illustration">
                            <currentStep.icon size={64} strokeWidth={1} />
                            <span className="step-label">{currentStep.title}</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default HowItWorksSection
