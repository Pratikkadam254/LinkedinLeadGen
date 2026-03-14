import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Upload, CheckSquare, Users, MessageSquare, Send, UserCheck, FileUp } from 'lucide-react'
import { useSyncedUser, useLeadsStats } from '../hooks'
import DashboardLayout from '../components/dashboard/DashboardLayout'
import './DashboardPage.css'

function DashboardPage() {
    const navigate = useNavigate()
    const user = useSyncedUser()
    const stats = useLeadsStats(user.convexId || undefined)

    useEffect(() => {
        if (user.convexId && !user.onboardingCompleted) {
            navigate('/onboarding')
        }
    }, [user.convexId, user.onboardingCompleted, navigate])

    const total = stats?.total ?? 0
    const sent = stats?.sent ?? 0
    const accepted = stats?.accepted ?? 0
    const replied = stats?.replied ?? 0

    const messagesGenerated = stats?.messagesGenerated ?? 0
    const outreachSent = sent + accepted + replied
    const connectionsAccepted = accepted + replied

    return (
        <DashboardLayout>
            <div className="dash-container">
                {/* Plan banner */}
                {!user.plan && (
                    <div className="dash-banner">
                        <span>Choose a plan to start sending outreach</span>
                        <Link to="/dashboard/settings" className="dash-banner-link">
                            View Plans
                        </Link>
                    </div>
                )}

                {/* Greeting */}
                <h1 className="dash-greeting">
                    Welcome back, {user.firstName || 'there'}
                </h1>

                {/* Empty state */}
                {total === 0 ? (
                    <div className="dash-empty">
                        <FileUp size={48} strokeWidth={1.5} />
                        <h2>No leads yet</h2>
                        <p>Upload your first CSV to get started.</p>
                        <Link to="/dashboard/upload" className="dash-empty-cta">
                            Upload Leads
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Stat cards */}
                        <div className="dash-stats">
                            <div className="dash-stat-card">
                                <Users size={20} />
                                <span className="dash-stat-value">{total}</span>
                                <span className="dash-stat-label">Total Leads</span>
                            </div>
                            <div className="dash-stat-card">
                                <MessageSquare size={20} />
                                <span className="dash-stat-value">{messagesGenerated}</span>
                                <span className="dash-stat-label">Messages Generated</span>
                            </div>
                            <div className="dash-stat-card">
                                <Send size={20} />
                                <span className="dash-stat-value">{outreachSent}</span>
                                <span className="dash-stat-label">Outreach Sent</span>
                            </div>
                            <div className="dash-stat-card">
                                <UserCheck size={20} />
                                <span className="dash-stat-value">{connectionsAccepted}</span>
                                <span className="dash-stat-label">Connections Accepted</span>
                            </div>
                        </div>

                        {/* Quick actions */}
                        <div className="dash-actions">
                            <Link to="/dashboard/upload" className="dash-action-card">
                                <Upload size={24} />
                                <h3>Upload Leads</h3>
                                <p>Import a CSV of new prospects</p>
                            </Link>
                            <Link to="/dashboard/approve" className="dash-action-card">
                                <CheckSquare size={24} />
                                <h3>Review Messages</h3>
                                <p>Approve or edit generated outreach</p>
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </DashboardLayout>
    )
}

export default DashboardPage
