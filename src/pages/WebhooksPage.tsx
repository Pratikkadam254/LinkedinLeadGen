import { useState } from 'react'
import { Link } from 'react-router-dom'
import { UserButton as ClerkUserButton } from '@clerk/clerk-react'
import { useQuery, useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import Logo from '../components/ui/Logo'
import { useSyncedUser } from '../hooks'
import './WebhooksPage.css'

const WEBHOOK_EVENTS = [
    { value: "lead.imported" as const, label: "Lead Imported" },
    { value: "extraction.started" as const, label: "Extraction Started" },
    { value: "extraction.completed" as const, label: "Extraction Completed" },
    { value: "credits.low" as const, label: "Credits Low" },
]

function WebhooksPage() {
    const syncedUser = useSyncedUser()
    const webhooks = useQuery(api.webhooks.list)
    const registerWebhook = useMutation(api.webhooks.register)
    const removeWebhook = useMutation(api.webhooks.remove)
    const toggleActive = useMutation(api.webhooks.toggleActive)
    const clerkConfigured = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

    const [name, setName] = useState('')
    const [url, setUrl] = useState('')
    const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set())
    const [isSubmitting, setIsSubmitting] = useState(false)

    const isLoading = syncedUser.isSignedIn && webhooks === undefined

    const handleEventToggle = (event: string) => {
        const next = new Set(selectedEvents)
        if (next.has(event)) {
            next.delete(event)
        } else {
            next.add(event)
        }
        setSelectedEvents(next)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name || !url || selectedEvents.size === 0) return

        setIsSubmitting(true)
        try {
            await registerWebhook({
                name,
                url,
                events: Array.from(selectedEvents) as Array<"lead.imported" | "extraction.started" | "extraction.completed" | "credits.low">,
            })
            setName('')
            setUrl('')
            setSelectedEvents(new Set())
        } catch (err) {
            console.error('Failed to register webhook:', err)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleRemove = async (id: string) => {
        try {
            await removeWebhook({ id: id as any })
        } catch (err) {
            console.error('Failed to remove webhook:', err)
        }
    }

    const handleToggle = async (id: string) => {
        try {
            await toggleActive({ id: id as any })
        } catch (err) {
            console.error('Failed to toggle webhook:', err)
        }
    }

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    return (
        <div className="webhooks-page">
            <header className="dashboard-header">
                <div className="dashboard-header-left">
                    <Link to="/" className="dashboard-logo">
                        <Logo />
                        <span>LeadFlow AI</span>
                    </Link>
                </div>
                <nav className="dashboard-nav">
                    <Link to="/dashboard" className="nav-link">Dashboard</Link>
                    <Link to="/dashboard/leads" className="nav-link">Leads</Link>
                    <Link to="/dashboard/extractions" className="nav-link">Extractions</Link>
                    <Link to="/dashboard/connect" className="nav-link">Connect</Link>
                </nav>
                <div className="dashboard-header-right">
                    {clerkConfigured ? (
                        <ClerkUserButton afterSignOutUrl="/" />
                    ) : (
                        <div className="user-avatar">U</div>
                    )}
                </div>
            </header>

            <main className="dashboard-main">
                <div className="container">
                    <div className="webhooks-page-header">
                        <h1>Webhooks</h1>
                        <p>Receive real-time notifications when events happen in your account.</p>
                    </div>

                    {/* Add Webhook Form */}
                    <div className="webhook-form-card">
                        <h2>Add New Webhook</h2>
                        <form onSubmit={handleSubmit} className="webhook-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="webhook-name">Name</label>
                                    <input
                                        id="webhook-name"
                                        type="text"
                                        placeholder="My Webhook"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="webhook-url">URL</label>
                                    <input
                                        id="webhook-url"
                                        type="url"
                                        placeholder="https://example.com/webhook"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Events</label>
                                <div className="event-checkboxes">
                                    {WEBHOOK_EVENTS.map((evt) => (
                                        <label key={evt.value} className="event-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={selectedEvents.has(evt.value)}
                                                onChange={() => handleEventToggle(evt.value)}
                                            />
                                            <span>{evt.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={isSubmitting || !name || !url || selectedEvents.size === 0}
                            >
                                {isSubmitting ? 'Adding...' : 'Add Webhook'}
                            </button>
                        </form>
                    </div>

                    {/* Webhook List */}
                    {isLoading && (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Loading webhooks...</p>
                        </div>
                    )}

                    {!isLoading && webhooks && webhooks.length > 0 && (
                        <div className="webhooks-list">
                            <h2>Your Webhooks</h2>
                            {webhooks.map((webhook) => (
                                <div key={webhook._id} className={`webhook-card ${!webhook.isActive ? 'inactive' : ''}`}>
                                    <div className="webhook-info">
                                        <div className="webhook-header-row">
                                            <h3>{webhook.name}</h3>
                                            <span className={`webhook-status-badge ${webhook.isActive ? 'active' : 'inactive'}`}>
                                                {webhook.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <p className="webhook-url">{webhook.url}</p>
                                        <div className="webhook-meta">
                                            <span className="webhook-events">
                                                {webhook.events.join(', ')}
                                            </span>
                                            {webhook.lastFiredAt && (
                                                <span className="webhook-last-fired">
                                                    Last fired: {formatDate(webhook.lastFiredAt)}
                                                </span>
                                            )}
                                            {webhook.failureCount > 0 && (
                                                <span className="webhook-failures">
                                                    Failures: {webhook.failureCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="webhook-actions">
                                        <button
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => handleToggle(webhook._id)}
                                        >
                                            {webhook.isActive ? 'Disable' : 'Enable'}
                                        </button>
                                        <button
                                            className="btn btn-text btn-sm btn-danger"
                                            onClick={() => handleRemove(webhook._id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!isLoading && (!webhooks || webhooks.length === 0) && (
                        <div className="empty-webhooks">
                            <p>No webhooks configured yet. Add one above to get started.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

export default WebhooksPage
