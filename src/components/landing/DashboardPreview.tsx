import './DashboardPreview.css'

const leads = [
    { name: 'John Smith', title: 'CEO at Acme Inc', score: 95, status: 'Ready' },
    { name: 'Sarah Jones', title: 'VP Sales at TechCo', score: 82, status: 'Ready' },
    { name: 'Mike Brown', title: 'Founder at StartupX', score: 71, status: 'Ready' },
]

function DashboardPreview() {
    return (
        <div className="dashboard-preview" role="img" aria-label="Dashboard preview showing lead scoring">
            <div className="preview-header">
                <div className="preview-dot" aria-hidden="true"></div>
                <div className="preview-dot" aria-hidden="true"></div>
                <div className="preview-dot" aria-hidden="true"></div>
            </div>
            <div className="preview-content">
                {leads.map((lead, index) => (
                    <div key={index} className="preview-row">
                        <div className="preview-avatar" aria-hidden="true">
                            {lead.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="preview-info">
                            <div className="preview-name">{lead.name}</div>
                            <div className="preview-title">{lead.title}</div>
                        </div>
                        <div
                            className="preview-score"
                            role="progressbar"
                            aria-valuenow={lead.score}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label={`Lead score: ${lead.score}%`}
                        >
                            <div
                                className="preview-score-fill"
                                style={{ width: `${lead.score}%` }}
                            ></div>
                        </div>
                        <div className="preview-status">{lead.status}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default DashboardPreview
