import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { UserButton } from '@clerk/clerk-react'
import Logo from '../components/ui/Logo'
import { Play, Pause, Plus, DotsThree, CalendarBlank, Lightning } from '@phosphor-icons/react'
import './CampaignsPage.css'

export default function CampaignsPage() {
    const campaigns = useQuery(api.campaigns.list)
    const strategies = useQuery(api.strategies.list)
    const createCampaign = useMutation(api.campaigns.create)
    const updateStatus = useMutation(api.campaigns.updateStatus)

    const [isCreating, setIsCreating] = useState(false)
    const [newCampaignName, setNewCampaignName] = useState('')
    const [selectedStrategyId, setSelectedStrategyId] = useState('')

    const handleCreate = async () => {
        if (!newCampaignName || !selectedStrategyId) return;

        await createCampaign({
            name: newCampaignName,
            strategyId: selectedStrategyId as any, // ID type casting
            autoPilot: false,
            schedule: {
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
                hours: { start: "09:00", end: "17:00" }
            }
        })
        setIsCreating(false)
        setNewCampaignName('')
    }

    const handleToggleStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'paused' : 'active'
        await updateStatus({ id: id as any, status: newStatus as any })
    }

    return (
        <div className="campaigns-page">
            <header className="dashboard-header">
                <div className="dashboard-header-left">
                    <Link to="/dashboard" className="dashboard-logo">
                        <Logo />
                        <span>LeadFlow AI</span>
                    </Link>
                </div>
                <nav className="dashboard-nav">
                    <Link to="/dashboard" className="nav-link">Dashboard</Link>
                    <Link to="/dashboard/leads" className="nav-link">Leads</Link>
                    <Link to="/dashboard/strategy" className="nav-link">Strategy</Link>
                    <Link to="/dashboard/campaigns" className="nav-link active">Campaigns</Link>
                    <Link to="/dashboard/connect" className="nav-link">Connect</Link>
                </nav>
                <div className="dashboard-header-right">
                    <UserButton afterSignOutUrl="/" />
                </div>
            </header>

            <main className="dashboard-main">
                <div className="container">
                    <div className="page-header">
                        <div>
                            <h1>Campaigns</h1>
                            <p>Manage your automated outreach sequences.</p>
                        </div>
                        <button className="btn btn-primary" onClick={() => setIsCreating(true)}>
                            <Plus size={18} /> New Campaign
                        </button>
                    </div>

                    {isCreating && (
                        <div className="create-modal">
                            <div className="modal-content">
                                <h2>Create New Campaign</h2>
                                <div className="form-group">
                                    <label>Campaign Name</label>
                                    <input
                                        value={newCampaignName}
                                        onChange={e => setNewCampaignName(e.target.value)}
                                        placeholder="e.g. CEO Outreach"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Strategy</label>
                                    <select
                                        value={selectedStrategyId}
                                        onChange={e => setSelectedStrategyId(e.target.value)}
                                    >
                                        <option value="">Select a Strategy...</option>
                                        {strategies?.map((s: any) => (
                                            <option key={s._id} value={s._id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="modal-actions">
                                    <button className="btn btn-secondary" onClick={() => setIsCreating(false)}>Cancel</button>
                                    <button className="btn btn-primary" onClick={handleCreate}>Create</button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="campaigns-grid">
                        {campaigns?.map((campaign: any) => (
                            <div key={campaign._id} className="campaign-card">
                                <div className="campaign-header">
                                    <div className="campaign-title">
                                        <h3>{campaign.name}</h3>
                                        <span className={`status-badge ${campaign.status}`}>{campaign.status}</span>
                                    </div>
                                    <div className="campaign-actions">
                                        <button
                                            className="btn-icon"
                                            onClick={() => handleToggleStatus(campaign._id, campaign.status)}
                                        >
                                            {campaign.status === 'active' ? <Pause size={16} /> : <Play size={16} />}
                                        </button>
                                        <button className="btn-icon">
                                            <DotsThree size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="campaign-stats">
                                    <div className="stat">
                                        <label>Sent</label>
                                        <span>{campaign.stats.sent}</span>
                                    </div>
                                    <div className="stat">
                                        <label>Replied</label>
                                        <span>{campaign.stats.replied}</span>
                                    </div>
                                    <div className="stat">
                                        <label>Booked</label>
                                        <span>{campaign.stats.booked}</span>
                                    </div>
                                </div>

                                <div className="campaign-footer">
                                    <div className="schedule-info">
                                        <CalendarBlank size={14} />
                                        <span>{campaign.schedule.hours.start} - {campaign.schedule.hours.end}</span>
                                    </div>
                                    <div className="autopilot-info">
                                        <Lightning size={14} className={campaign.autoPilot ? "text-yellow" : "text-muted"} />
                                        <span>{campaign.autoPilot ? "Autopilot On" : "Manual"}</span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {campaigns?.length === 0 && !isCreating && (
                            <div className="empty-state">
                                <p>No campaigns yet. Create one to start outreach.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
