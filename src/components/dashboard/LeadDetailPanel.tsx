import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { X, ExternalLink, RefreshCw, Linkedin, Sparkles, AlertCircle } from 'lucide-react'
import { type Lead } from '../../data/mockLeads'
import { calculateLeadScore, type ScoringResult } from '../../lib/scoring'
import StatusBadge from '../ui/StatusBadge'
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

    return (
        <div className="panel-overlay" onClick={onClose}>
            <div className="lead-panel" onClick={(e) => e.stopPropagation()}>
                {/* Close Button */}
                <button className="panel-close-btn" onClick={onClose}>
                    <X size={20} />
                </button>

                <div className="panel-content">
                    {/* Profile Section */}
                    <div className="panel-profile">
                        <div className="panel-profile-avatar">
                            {lead.firstName[0]}{lead.lastName[0]}
                        </div>
                        <div className="panel-profile-info">
                            <h2 className="panel-profile-name">{lead.firstName} {lead.lastName}</h2>
                            <p className="panel-profile-title">{lead.title}</p>
                            <p className="panel-profile-company">{lead.company}</p>
                            <a
                                href={lead.linkedInUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="panel-linkedin-link"
                            >
                                <Linkedin size={14} />
                                View LinkedIn
                                <ExternalLink size={12} />
                            </a>
                        </div>
                    </div>

                    {/* Score Section */}
                    <div className="panel-section panel-score-section">
                        <div className="panel-score-header">
                            <h4>Lead Score</h4>
                            <span className="panel-score-number">{scoringResult.totalScore}</span>
                        </div>
                        <div className="panel-score-bar-track">
                            <div
                                className="panel-score-bar-fill"
                                style={{ width: `${scoringResult.totalScore}%` }}
                            />
                        </div>
                        <span className={`panel-score-tier panel-score-tier--${scoringResult.tier}`}>
                            {scoringResult.tier.toUpperCase()} LEAD
                        </span>
                    </div>

                    {/* AI Recommendation */}
                    <div className="panel-recommendation">
                        <Sparkles size={14} />
                        <span>{scoringResult.recommendation}</span>
                    </div>

                    {/* Score Breakdown */}
                    <div className="panel-section">
                        <h4>Score Breakdown</h4>
                        <div className="panel-breakdown">
                            {scoringResult.breakdown.map((item, index) => (
                                <div key={index} className="panel-breakdown-row">
                                    <div className="panel-breakdown-header">
                                        <span className="panel-breakdown-label">{item.label}</span>
                                        <span className="panel-breakdown-value">{item.score}/{item.maxScore}</span>
                                    </div>
                                    <div className="panel-breakdown-bar">
                                        <div
                                            className="panel-breakdown-fill"
                                            style={{ width: `${(item.score / item.maxScore) * 100}%` }}
                                        />
                                    </div>
                                    <span className="panel-breakdown-reason">{item.reason}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Posts */}
                    <div className="panel-section">
                        <h4>Recent Posts</h4>
                        {lead.postScraped ? (
                            <div className="panel-post-card">
                                <p>"Excited to share that we've just closed our Series B! Looking forward to scaling our team and impact in 2026..."</p>
                                <div className="panel-post-meta">
                                    <span>3 days ago</span>
                                    <span>234 likes</span>
                                    <span>45 comments</span>
                                </div>
                            </div>
                        ) : (
                            <div className="panel-empty-posts">
                                <p>Posts not yet scraped</p>
                                <button className="btn btn-secondary btn-sm">
                                    <RefreshCw size={14} />
                                    Scrape Posts
                                </button>
                            </div>
                        )}
                    </div>

                    {/* AI Message Generator */}
                    <div className="panel-section">
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

                    {/* Status Section */}
                    <div className="panel-section panel-status-section">
                        <div className="panel-status-row">
                            <span className="panel-status-label">Message</span>
                            <StatusBadge
                                status={lead.messageStatus === 'ready' ? 'success' : lead.messageStatus === 'sent' ? 'sent' : 'warning'}
                                label={lead.messageStatus === 'ready' ? 'Ready' : lead.messageStatus === 'sent' ? 'Sent' : lead.messageStatus === 'draft' ? 'Draft' : 'Empty'}
                                size="sm"
                            />
                        </div>
                        <div className="panel-status-row">
                            <span className="panel-status-label">Outreach</span>
                            <StatusBadge
                                status={lead.outreachStatus as 'pending' | 'sent' | 'accepted' | 'replied'}
                                size="sm"
                            />
                        </div>
                        <div className="panel-status-row">
                            <span className="panel-status-label">LinkedIn</span>
                            {isConnected ? (
                                <StatusBadge status="success" label="Connected" size="sm" />
                            ) : (
                                <Link to="/dashboard/connect" className="panel-connect-link">
                                    <AlertCircle size={12} />
                                    Connect
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* Panel Footer */}
                <div className="panel-footer">
                    <div className="panel-footer-status">
                        <StatusBadge
                            status={lead.outreachStatus as 'pending' | 'sent' | 'accepted' | 'replied'}
                        />
                        {isConnected ? (
                            <StatusBadge status="success" label="LinkedIn Connected" showDot />
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
