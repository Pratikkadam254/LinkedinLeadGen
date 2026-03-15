import { Link } from 'react-router-dom'
import { UserButton as ClerkUserButton } from '@clerk/clerk-react'
import { useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"
import Logo from '../components/ui/Logo'
import { useSyncedUser } from '../hooks'
import './ExtractionsPage.css'

function ExtractionsPage() {
    const syncedUser = useSyncedUser()
    const extractions = useQuery(api.extensions.getExtractions)
    const clerkConfigured = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

    const isLoading = syncedUser.isSignedIn && extractions === undefined

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp)
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const getStatusBadge = (status: string) => {
        const colorMap: Record<string, string> = {
            in_progress: 'blue',
            completed: 'green',
            failed: 'red',
            paused: 'yellow',
            cancelled: 'red',
        }
        const color = colorMap[status] || 'gray'
        const label = status.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())
        return <span className={`extraction-status-badge ${color}`}>{label}</span>
    }

    const getQualifiedPercent = (extraction: { matchCount?: number; leadsExtracted: number }) => {
        if (extraction.matchCount !== undefined && extraction.leadsExtracted > 0) {
            return Math.round((extraction.matchCount / extraction.leadsExtracted) * 100) + '%'
        }
        return '—'
    }

    return (
        <div className="extractions-page">
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
                    <Link to="/dashboard/extractions" className="nav-link active">Extractions</Link>
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
                    <div className="extractions-page-header">
                        <h1>Extraction History</h1>
                        <span className="extractions-count">
                            {isLoading ? 'Loading...' : `${extractions?.length || 0} extractions`}
                        </span>
                    </div>

                    {isLoading && (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Loading extractions...</p>
                        </div>
                    )}

                    {!isLoading && (!extractions || extractions.length === 0) && (
                        <div className="empty-state">
                            <div className="empty-icon">📦</div>
                            <h3>No extractions yet</h3>
                            <p>Use the Chrome extension to extract leads from Sales Navigator.</p>
                        </div>
                    )}

                    {!isLoading && extractions && extractions.length > 0 && (
                        <div className="extractions-table-wrapper">
                            <table className="extractions-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                        <th>Leads</th>
                                        <th>Qualified %</th>
                                        <th>Credits Used</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {extractions.map((extraction) => (
                                        <tr key={extraction._id}>
                                            <td className="col-name">
                                                {extraction.name || 'Untitled Extraction'}
                                            </td>
                                            <td className="col-date">
                                                {formatDate(extraction.startedAt)}
                                            </td>
                                            <td className="col-status">
                                                {getStatusBadge(extraction.status)}
                                            </td>
                                            <td className="col-leads">
                                                {extraction.leadsExtracted}
                                                {extraction.leadsFound > 0 && extraction.leadsFound !== extraction.leadsExtracted && (
                                                    <span className="leads-found"> / {extraction.leadsFound} found</span>
                                                )}
                                            </td>
                                            <td className="col-qualified">
                                                {getQualifiedPercent(extraction)}
                                            </td>
                                            <td className="col-credits">
                                                {extraction.creditsUsed}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

export default ExtractionsPage
