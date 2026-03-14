import { Link } from 'react-router-dom'
import { X, ExternalLink, Linkedin } from 'lucide-react'
import { type Lead } from '../../data/mockLeads'
import './LeadDetailPanel.css'

interface LeadDetailPanelProps {
    lead: Lead
    onClose: () => void
}

function LeadDetailPanel({ lead, onClose }: LeadDetailPanelProps) {
    const getTierColor = (score: number) => {
        if (score >= 75) return '#22C55E'
        if (score >= 50) return '#F59E0B'
        return '#6B7280'
    }

    const getTierLabel = (score: number) => {
        if (score >= 75) return 'HOT'
        if (score >= 50) return 'WARM'
        return 'COLD'
    }

    return (
        <div className="panel-overlay" onClick={onClose}>
            <div className="lead-panel" onClick={(e) => e.stopPropagation()}>
                <div className="panel-header">
                    <h2>Lead Details</h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="panel-content">
                    <div className="profile-section">
                        <div className="profile-avatar">
                            {lead.firstName[0]}{lead.lastName[0]}
                        </div>
                        <div className="profile-info">
                            <h3>{lead.firstName} {lead.lastName}</h3>
                            <p className="profile-title">{lead.title} at {lead.company}</p>
                            <a
                                href={lead.linkedInUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="linkedin-link"
                            >
                                <Linkedin size={14} />
                                View Profile
                                <ExternalLink size={12} />
                            </a>
                        </div>
                        <div className="overall-score">
                            <div
                                className="score-circle"
                                style={{ background: getTierColor(lead.score) }}
                            >
                                <span className="score-number">{lead.score}</span>
                            </div>
                            <span className="score-tier" style={{ color: getTierColor(lead.score) }}>
                                {getTierLabel(lead.score)}
                            </span>
                        </div>
                    </div>

                    {lead.email && (
                        <div className="section">
                            <h4>Contact</h4>
                            <p>{lead.email}</p>
                        </div>
                    )}

                    <div className="section status-section">
                        <div className="status-row">
                            <span className="status-label">Message:</span>
                            <span className={`status-value ${lead.messageStatus}`}>
                                {lead.messageStatus === 'approved' ? 'Approved' :
                                 lead.messageStatus === 'draft' ? 'Draft' :
                                 lead.messageStatus === 'sent' ? 'Sent' :
                                 lead.messageStatus === 'empty' ? 'No message' : lead.messageStatus}
                            </span>
                        </div>
                        <div className="status-row">
                            <span className="status-label">Outreach:</span>
                            <span className={`status-value outreach ${lead.outreachStatus}`}>
                                {lead.outreachStatus.charAt(0).toUpperCase() + lead.outreachStatus.slice(1)}
                            </span>
                        </div>
                    </div>

                    {lead.messageStatus !== 'empty' && (
                        <div className="section">
                            <h4>Actions</h4>
                            <Link to="/dashboard/approve" className="btn btn-primary" style={{ width: '100%', textAlign: 'center' }}>
                                Review & Approve Messages
                            </Link>
                        </div>
                    )}
                </div>

                <div className="panel-footer">
                    <span className={`outreach-badge ${lead.outreachStatus}`}>
                        {lead.outreachStatus.charAt(0).toUpperCase() + lead.outreachStatus.slice(1)}
                    </span>
                    <button className="btn btn-text" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    )
}

export default LeadDetailPanel
