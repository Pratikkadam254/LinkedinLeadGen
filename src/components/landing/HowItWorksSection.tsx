import { Target, Upload, Sparkles } from 'lucide-react'
import './HowItWorksSection.css'

const steps = [
    {
        icon: Target,
        title: 'Define your ICP',
        description: 'Tell us who you want to reach. Industry, company size, job titles.',
    },
    {
        icon: Upload,
        title: 'Upload your leads',
        description: 'Drop a CSV file. AI scores each lead against your ICP instantly.',
    },
    {
        icon: Sparkles,
        title: 'AI writes, you send',
        description: 'Review AI-generated messages. Edit if you want. Approve and send.',
    },
]

function HowItWorksSection() {
    return (
        <section id="how-it-works" className="how-it-works" aria-labelledby="how-heading">
            <div className="how-container">
                <h2 id="how-heading" className="how-title">How It Works</h2>

                <div className="how-steps">
                    {steps.map((step, i) => (
                        <div key={i} className="how-step-card">
                            <div className="how-step-icon">
                                <step.icon size={28} aria-hidden="true" />
                            </div>
                            <div className="how-step-number">Step {i + 1}</div>
                            <h3 className="how-step-title">{step.title}</h3>
                            <p className="how-step-desc">{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default HowItWorksSection
