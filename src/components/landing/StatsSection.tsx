import './StatsSection.css'

const stats = [
    { value: '40×', label: 'Time Savings' },
    { value: '52%', label: 'Avg Accept Rate' },
    { value: '10K+', label: 'Leads Scored' },
    { value: '95%', label: 'User Satisfaction' },
]

function StatsSection() {
    return (
        <section id="stats" className="stats" aria-labelledby="stats-heading">
            <h2 id="stats-heading" className="sr-only">Our Results</h2>
            <div className="container">
                <div className="stats-grid" role="list">
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className="stat-item"
                            role="listitem"
                        >
                            <div className="stat-value" aria-label={`${stat.value} ${stat.label}`}>
                                {stat.value}
                            </div>
                            <div className="stat-label">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default StatsSection
