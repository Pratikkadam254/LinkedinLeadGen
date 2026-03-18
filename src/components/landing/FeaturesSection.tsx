import { UploadSimple, Rocket, ChartBar } from '@phosphor-icons/react'
import './FeaturesSection.css'

const features = [
    {
        icon: UploadSimple,
        title: 'Upload Your CSV',
        description: 'Drop in a Sales Navigator export with LinkedIn URLs. We handle the rest.'
    },
    {
        icon: Rocket,
        title: 'Auto-Send Connections',
        description: 'We send personalized connection requests at safe, human-like intervals.'
    },
    {
        icon: ChartBar,
        title: 'Track Everything',
        description: 'Real-time dashboard shows sent, accepted, replies, and errors.'
    }
]

function FeaturesSection() {
    return (
        <section id="features" className="features" aria-labelledby="features-heading">
            <div className="container">
                <header className="section-header">
                    <span className="section-badge">Features</span>
                    <h2 id="features-heading">Everything You Need to Grow Your Network</h2>
                    <p>Simple tools, real results</p>
                </header>
                <div className="features-grid" role="list">
                    {features.map((feature, index) => (
                        <article
                            key={index}
                            className="feature-card"
                            role="listitem"
                        >
                            <div className="feature-icon" aria-hidden="true">
                                <feature.icon size={22} weight="duotone" />
                            </div>
                            <h3>{feature.title}</h3>
                            <p>{feature.description}</p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default FeaturesSection
