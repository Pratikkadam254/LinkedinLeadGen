import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { X, ExternalLink, RefreshCw, Linkedin, Sparkles, AlertCircle } from 'lucide-react'
import { type Lead } from '../../data/mockLeads'
import { calculateLeadScore, type ScoringResult } from '../../lib/scoring'
import AIMessageGenerator from './AIMessageGenerator'
import { unipileService } from '../../lib/unipile'
import { useToast } from '../ui/Toast'
import './LeadDetailPanel.css'

interface LeadDetailPanelProps {
    lead: Lead
    onClose: () => void
    onStatusChange?: (leadId: string, status: Lead['outreachStatus']) => void
}

function LeadDetailPanel({ lead, onClose, onStatusChange }: LeadDetailPanelProps) {
    const { showToast } = useToast()


    const isConnected = unipileService.isConnected()

    // Calculate lead score
    const scoringResult: ScoringResult = useMemo(() => {
        return calculateLeadScore({
            firstName: lead.firstName,
            lastName: lead.lastName,
            company: lead.company,
            title: lead.title,
            companySize: 100 + Math.floor(Math.random() * 200),
            followers: 1000 + Math.floor(Math.random() * 4000),
            lastPostDays: lead.postScraped ? Math.floor(Math.random() * 14) : 30,
            postContent: lead.postScraped
                ? 'Excited to share that we just closed our Series B! Looking forward to scaling...'
                : undefined,
            mutualConnections: Math.floor(Math.random() * 12),
        })
    }, [lead])

    const handleSendMessage = async (message: string) => {
        if (!isConnected) {
            showToast('error', 'Please connect your LinkedIn account first')
            return
        }

        try {
            const result = await unipileService.sendConnectionRequest({
                recipientUrl: lead.linkedInUrl,
                message: message.slice(0, 300),
            })

            if (result.success) {
                showToast('success', `Connection request sent to ${lead.firstName}!`)
                onStatusChange?.(lead.id, 'sent')
            } else {
                showToast('error', result.error?.message || 'Failed to send message')
            }
        } catch {
            showToast('error', 'An error occurred while sending')
        }
    }

    const getTierColor = (tier: string) => {
        switch (tier) {
            case 'hot': return '#22C55E'
            case 'warm': return '#F59E0B'
            case 'cold': return '#6B7280'
            default: return '#6B7280'
        }
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
                    {/* Profile Section */}
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
                                View LinkedIn Profile
                                <ExternalLink size={12} />
                            </a>
                        </div>
                        <div className="overall-score">
                            <div
                                className="score-circle"
                                style={{
                                    background: `linear-gradient(135deg, ${getTierColor(scoringResult.tier)}, ${getTierColor(scoringResult.tier)}99)`
                                }}
                            >
                                <span className="score-number">{scoringResult.totalScore}</span>
                            </div>
                            <span
                                className="score-tier"
                                style={{ color: getTierColor(scoringResult.tier) }}
                            >
                                {scoringResult.tier.toUpperCase()}
                            </span>
                        </div>
                    </div>

                    {/* AI Recommendation */}
                    <div className="ai-recommendation">
                        <Sparkles size={14} />
                        <span>{scoringResult.recommendation}</span>
                    </div>

                    {/* Score Breakdown */}
                    <div className="section">
                        <h4>Score Breakdown</h4>
                        <div className="score-breakdown">
                            {scoringResult.breakdown.map((item, index) => (
                                <div key={index} className="breakdown-row">
                                    <div className="breakdown-header">
                                        <span className="breakdown-label">{item.label}</span>
                                        <span className="breakdown-value">{item.score}/{item.maxScore}</span>
                                    </div>
                                    <div className="breakdown-bar">
                                        <div
                                            className="breakdown-fill"
                                            style={{ width: `${(item.score / item.maxScore) * 100}%` }}
                                        ></div>
                                    </div>
                                    <span className="breakdown-reason">{item.reason}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Filter Mismatch Reasons */}
                    {lead.filterMismatchReasons && lead.filterMismatchReasons.length > 0 && (
                        <div className="section">
                            <h4>Filter Mismatch Reasons</h4>
                            <ul className="mismatch-reasons-list">
                                {lead.filterMismatchReasons.map((reason, index) => (
                                    <li key={index} className="mismatch-reason">
                                        {reason}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Recent Posts */}
                    <div className="section">
                        <h4>Recent Posts</h4>
                        {lead.postScraped ? (
                            <div className="post-card">
                                <p>"Excited to share that we've just closed our Series B! Looking forward to scaling our team and impact in 2026..."</p>
                                <div className="post-meta">
                                    <span>📅 3 days ago</span>
                                    <span>❤️ 234</span>
                                    <span>💬 45</span>
                                </div>
                            </div>
                        ) : (
                            <div className="empty-posts">
                                <p>Posts not yet scraped</p>
                                <button className="btn btn-secondary btn-sm">
                                    <RefreshCw size={14} />
                                    Scrape Posts
                                </button>
                            </div>
                        )}
                    </div>

                    {/* AI Message Generator (Gemini-powered) */}
                    <div className="section">
                        <AIMessageGenerator
                            lead={{
                                firstName: lead.firstName,
                                lastName: lead.lastName,
                                company: lead.company,
                                title: lead.title,
                                linkedInUrl: lead.linkedInUrl,
                                score: scoringResult.totalScore,
                                postContent: lead.postScraped
                                    ? 'Excited to share that we just closed our Series B! Looking forward to scaling our team and impact in 2026...'
                                    : undefined,
                            }}
                            onSend={handleSendMessage}
                        />
                    </div>

                    {/* Status Info */}
                    <div className="section status-section">
                        <div className="status-row">
                            <span className="status-label">Message Status:</span>
                            <span className={`status-value ${lead.messageStatus === 'ready' ? 'ready' : 'draft'}`}>
                                {lead.messageStatus === 'ready' ? '✓ Ready to Send' : '⟳ Draft'}
                            </span>
                        </div>
                        <div className="status-row">
                            <span className="status-label">Outreach Status:</span>
                            <span className={`status-value outreach ${lead.outreachStatus}`}>
                                {lead.outreachStatus.charAt(0).toUpperCase() + lead.outreachStatus.slice(1)}
                            </span>
                        </div>
                        <div className="status-row">
                            <span className="status-label">Unipile:</span>
                            {isConnected ? (
                                <span className="status-value connected">🟢 Connected</span>
                            ) : (
                                <Link to="/dashboard/connect" className="status-link">
                                    <AlertCircle size={12} />
                                    Connect LinkedIn
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* Panel Footer */}
                <div className="panel-footer">
                    <div className="footer-status">
                        <span className={`outreach-badge ${lead.outreachStatus}`}>
                            {lead.outreachStatus.charAt(0).toUpperCase() + lead.outreachStatus.slice(1)}
                        </span>
                        {isConnected ? (
                            <span className="connected-badge">🟢 LinkedIn Connected</span>
                        ) : (
                            <Link to="/dashboard/connect" className="btn btn-secondary btn-sm">
                                Connect LinkedIn
                            </Link>
                        )}
                    </div>
                    <button className="btn btn-text" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}

export default LeadDetailPanel

