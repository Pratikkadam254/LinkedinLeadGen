import { ShieldCheck, TrendingUp, Users, Zap } from 'lucide-react'
import './StatsSection.css'

const stats = [
    { value: '40×', label: 'Time Savings' },
    { value: '52%', label: 'Avg Accept Rate' },
    { value: '10K+', label: 'Leads Scored' },
    { value: '95%', label: 'Client Satisfaction' },
]

const valueProps = [
    {
        icon: ShieldCheck,
        title: 'Qualified or it doesn\'t count',
        description: 'If they don\'t show, aren\'t a fit, or the call ends early — you don\'t pay for that appointment.',
    },
    {
        icon: TrendingUp,
        title: 'Scale beyond referrals',
        description: 'Replace "referral roulette" with a system that consistently brings new opportunities every week.',
    },
]

const audiences = [
    { icon: Users, label: 'Agency Owners' },
    { icon: Zap, label: 'Consultants' },
    { icon: TrendingUp, label: 'B2B SaaS Teams' },
]

function StatsSection() {
    return (
        <section id="built-for" className="built-for-section" aria-labelledby="built-heading">
            <div className="container">
                <header className="section-header">
                    <h2 id="built-heading">Built for predictable growth</h2>
                    <p>Designed for high-ticket agency owners, coaches, consultants, and B2B SaaS teams.</p>
                </header>

                {/* Stats row */}
                <div className="stats-grid" role="list">
                    {stats.map((stat, index) => (
                        <div key={index} className="stat-item" role="listitem">
                            <div className="stat-value">{stat.value}</div>
                            <div className="stat-label">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Value propositions */}
                <div className="value-props">
                    {valueProps.map((prop, i) => (
                        <div key={i} className="value-card">
                            <div className="value-icon">
                                <prop.icon size={24} strokeWidth={1.75} />
                            </div>
                            <h3>{prop.title}</h3>
                            <p>{prop.description}</p>
                        </div>
                    ))}
                </div>

                {/* Audience badges */}
                <div className="audience-row">
                    {audiences.map((a, i) => (
                        <div key={i} className="audience-badge">
                            <a.icon size={16} />
                            <span>{a.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default StatsSection
