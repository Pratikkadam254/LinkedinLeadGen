import { UploadSimple, Crosshair, PencilSimpleLine, MagnifyingGlass, Rocket, ChartBar } from '@phosphor-icons/react'
import './FeaturesSection.css'

const features = [
    {
        icon: UploadSimple,
        title: 'Easy Import',
        description: 'Upload CSV, Excel, or connect Google Sheets. Your leads are parsed and organized automatically.'
    },
    {
        icon: Crosshair,
        title: 'Smart Scoring',
        description: 'AI analyzes company size, influence, activity, and more to rank your best prospects.'
    },
    {
        icon: PencilSimpleLine,
        title: 'Personalized Messages',
        description: 'AI crafts unique connection requests based on recent posts and activity.'
    },
    {
        icon: MagnifyingGlass,
        title: 'Post Scraping',
        description: 'Automatically gather recent LinkedIn posts to inform message personalization.'
    },
    {
        icon: Rocket,
        title: 'Safe Automation',
        description: 'Send connection requests automatically with built-in rate limiting and safety features.'
    },
    {
        icon: ChartBar,
        title: 'Real-Time Dashboard',
        description: 'Track acceptance rates, message performance, and outreach metrics in real-time.'
    }
]

function FeaturesSection() {
    return (
        <section id="features" className="features" aria-labelledby="features-heading">
            <div className="container">
                <header className="section-header">
                    <span className="section-badge">Features</span>
                    <h2 id="features-heading">Everything You Need to Generate Leads</h2>
                    <p>Powered by AI, perfected by human insight</p>
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
