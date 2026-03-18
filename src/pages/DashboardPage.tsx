import { useUser } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import { Users, PaperPlaneTilt, TrendUp, ChatCenteredDots, UploadSimple, GearSix, LinkSimple, Check, Clock, UserPlus, Envelope, ArrowRight } from '@phosphor-icons/react'
import { useSyncedUser, useLeadsStats, useActivitySummary } from '../hooks'
import { mockLeads } from '../data/mockLeads'
import PageHeader from '../components/layout/PageHeader'
import Card from '../components/ui/Card'
import './DashboardPage.css'

function DashboardPage() {
    const clerkLoaded = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

    if (clerkLoaded) {
        return <DashboardWithClerk />
    }

    // Demo mode without Clerk
    return <DashboardDemo />
}

function DashboardDemo() {
    const total = mockLeads.length
    const sent = mockLeads.filter(l => l.messageStatus === 'sent').length
    const acceptRate = Math.round(mockLeads.filter(l => l.outreachStatus === 'accepted' || l.outreachStatus === 'replied').length / mockLeads.length * 100)
    const replied = mockLeads.filter(l => l.outreachStatus === 'replied').length

    return (
        <div className="dashboard-content">
            <PageHeader
                title="Dashboard"
                subtitle="Here's your pipeline at a glance."
            />

            <div className="dashboard-onboarding animate-fade-in-up">
                <Card className="onboarding-card">
                    <div className="onboarding-card-inner">
                        <span className="onboarding-icon">
                            <GearSix size={18} />
                        </span>
                        <p>You're in demo mode. Add your Clerk key to enable authentication.</p>
                    </div>
                </Card>
            </div>

            <StatCards total={total} sent={sent} acceptRate={acceptRate} replied={replied} />

            <div className="dashboard-grid animate-fade-in-up animation-delay-2">
                <RecentActivity />
                <QuickActions />
            </div>
        </div>
    )
}

function DashboardWithClerk() {
    const { user } = useUser()
    const syncedUser = useSyncedUser()

    // Get real stats from Convex (falls back to undefined if not connected)
    const stats = useLeadsStats(syncedUser.convexId || undefined)
    const activitySummary = useActivitySummary(syncedUser.convexId || undefined, 7)

    // Compute stats - use Convex data if available, fall back to mock
    const displayStats = stats || {
        total: mockLeads.length,
        pending: mockLeads.filter(l => l.outreachStatus === 'pending').length,
        sent: mockLeads.filter(l => l.messageStatus === 'sent').length,
        accepted: mockLeads.filter(l => l.outreachStatus === 'accepted').length,
        replied: mockLeads.filter(l => l.outreachStatus === 'replied').length,
    }

    const acceptRate = displayStats.total > 0
        ? Math.round((displayStats.accepted + displayStats.replied) / displayStats.total * 100)
        : 0

    return (
        <div className="dashboard-content">
            <PageHeader
                title={`Welcome back, ${user?.firstName || 'there'}!`}
                subtitle="Here's your pipeline at a glance."
            />

            {!syncedUser.onboardingCompleted && (
                <div className="dashboard-onboarding animate-fade-in-up">
                    <Card className="onboarding-card">
                        <div className="onboarding-card-inner">
                            <span className="onboarding-icon">
                                <TrendUp size={18} />
                            </span>
                            <p>Complete your setup to get personalized recommendations.</p>
                            <Link to="/onboarding" className="btn btn-primary btn-sm">Complete Setup</Link>
                        </div>
                    </Card>
                </div>
            )}

            <StatCards
                total={displayStats.total}
                sent={displayStats.sent}
                acceptRate={acceptRate}
                replied={displayStats.replied}
                activitySummary={activitySummary}
            />

            <div className="dashboard-grid animate-fade-in-up animation-delay-2">
                <RecentActivity activitySummary={activitySummary} />
                <QuickActions unipileConnected={syncedUser.unipileConnected} />
            </div>
        </div>
    )
}

interface StatCardsProps {
    total: number
    sent: number
    acceptRate: number
    replied: number
    activitySummary?: { leadsImported: number; connectionsSent: number; connectionsAccepted: number; repliesReceived: number } | null
}

function StatCards({ total, sent, acceptRate, replied }: StatCardsProps) {
    const stats = [
        { icon: <Users size={20} />, value: total, label: 'Total Leads', color: 'blue' },
        { icon: <PaperPlaneTilt size={20} />, value: sent, label: 'Messages Sent', color: 'green' },
        { icon: <TrendUp size={20} />, value: `${acceptRate}%`, label: 'Accept Rate', color: 'purple' },
        { icon: <ChatCenteredDots size={20} />, value: replied, label: 'Replies', color: 'amber' },
    ]

    return (
        <div className="stat-cards-row animate-fade-in-up animation-delay-1">
            {stats.map((stat, index) => (
                <Card key={index} variant="default" padding="md" className="stat-card-new">
                    <div className={`stat-icon-circle stat-icon-${stat.color}`}>
                        {stat.icon}
                    </div>
                    <div className="stat-content">
                        <span className="stat-number-new">{stat.value}</span>
                        <span className="stat-label-new">{stat.label}</span>
                    </div>
                </Card>
            ))}
        </div>
    )
}

interface RecentActivityProps {
    activitySummary?: { leadsImported: number; connectionsSent: number; connectionsAccepted: number; repliesReceived: number } | null
}

function RecentActivity({ activitySummary }: RecentActivityProps) {
    const items = activitySummary ? [
        { icon: <UserPlus size={16} />, text: `${activitySummary.leadsImported} leads imported`, time: 'Last 7 days', color: 'blue' },
        { icon: <PaperPlaneTilt size={16} />, text: `${activitySummary.connectionsSent} connections sent`, time: 'Last 7 days', color: 'green' },
        { icon: <Check size={16} />, text: `${activitySummary.connectionsAccepted} accepted`, time: 'Last 7 days', color: 'purple' },
        { icon: <Envelope size={16} />, text: `${activitySummary.repliesReceived} replies received`, time: 'Last 7 days', color: 'amber' },
    ] : [
        { icon: <UserPlus size={16} />, text: `${mockLeads.length} leads in pipeline`, time: 'Current', color: 'blue' },
        { icon: <PaperPlaneTilt size={16} />, text: `${mockLeads.filter(l => l.messageStatus === 'sent').length} messages sent`, time: 'Current', color: 'green' },
        { icon: <Check size={16} />, text: `${mockLeads.filter(l => l.outreachStatus === 'accepted').length} accepted`, time: 'Current', color: 'purple' },
        { icon: <Clock size={16} />, text: `${mockLeads.filter(l => l.outreachStatus === 'pending').length} pending outreach`, time: 'Current', color: 'amber' },
    ]

    return (
        <Card padding="lg" className="activity-card">
            <div className="section-title">
                <h3>Recent Activity</h3>
                <Link to="/dashboard/leads" className="view-all-link">
                    View All <ArrowRight size={14} />
                </Link>
            </div>
            <div className="activity-timeline">
                {items.slice(0, 5).map((item, index) => (
                    <div key={index} className="timeline-item">
                        <div className={`timeline-icon timeline-icon-${item.color}`}>
                            {item.icon}
                        </div>
                        <div className="timeline-content">
                            <span className="timeline-text">{item.text}</span>
                            <span className="timeline-time">{item.time}</span>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    )
}

function QuickActions({ unipileConnected = false }: { unipileConnected?: boolean }) {
    const actions = [
        {
            icon: <UploadSimple size={20} />,
            title: 'Import Leads',
            desc: 'Upload CSV, Excel, or connect Google Sheets',
            to: '/dashboard/upload',
            color: 'blue',
        },
        {
            icon: <GearSix size={20} />,
            title: 'Setup Preferences',
            desc: 'Customize your lead scoring and messaging',
            to: '/onboarding',
            color: 'purple',
        },
        {
            icon: unipileConnected ? <Check size={20} /> : <LinkSimple size={20} />,
            title: unipileConnected ? 'LinkedIn Connected' : 'Connect LinkedIn',
            desc: unipileConnected ? 'Ready to send messages' : 'Link via Unipile for automation',
            to: '/dashboard/connect',
            color: unipileConnected ? 'green' : 'amber',
        },
    ]

    return (
        <Card padding="lg" className="quickactions-card">
            <h3 className="section-title">Quick Actions</h3>
            <div className="quickaction-list">
                {actions.map((action, index) => (
                    <Link key={index} to={action.to} className="quickaction-item">
                        <Card variant="interactive" padding="sm" className="quickaction-inner">
                            <div className={`quickaction-icon quickaction-icon-${action.color}`}>
                                {action.icon}
                            </div>
                            <div className="quickaction-text">
                                <span className="quickaction-title">{action.title}</span>
                                <span className="quickaction-desc">{action.desc}</span>
                            </div>
                        </Card>
                    </Link>
                ))}
            </div>
        </Card>
    )
}

export default DashboardPage
