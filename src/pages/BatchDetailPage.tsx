import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { ArrowLeft, Clock, CheckCircle, PaperPlaneTilt, WarningCircle, UsersThree, ChatCircle } from '@phosphor-icons/react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'
import MetricCards from '../components/dashboard/MetricCards'
import BatchProgress from '../components/dashboard/BatchProgress'
import PageHeader from '../components/layout/PageHeader'

type LeadStatus = 'all' | 'pending' | 'sent' | 'accepted' | 'replied' | 'error' | 'already_connected'

const STATUS_FILTERS: { key: LeadStatus; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'sent', label: 'Sent' },
    { key: 'accepted', label: 'Accepted' },
    { key: 'replied', label: 'Replied' },
    { key: 'error', label: 'Errors' },
    { key: 'already_connected', label: 'Already Connected' },
]

function BatchDetailPage() {
    const { id } = useParams()
    const [filter, setFilter] = useState<LeadStatus>('all')

    const batch = useQuery(api.batches.get, id ? { batchId: id as Id<"batches"> } : 'skip')
    const leads = useQuery(api.leads.listByBatch, id ? { batchId: id as Id<"batches"> } : 'skip')

    if (!id) return <div style={{ padding: 'var(--space-xl)' }}>Invalid batch ID</div>
    if (batch === undefined || leads === undefined) {
        return (
            <div style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                Loading...
            </div>
        )
    }
    if (batch === null) {
        return (
            <div style={{ padding: 'var(--space-xl)', textAlign: 'center' }}>
                <h2>Batch not found</h2>
                <Link to="/dashboard" className="btn btn-primary" style={{ marginTop: 'var(--space-md)' }}>
                    Back to Dashboard
                </Link>
            </div>
        )
    }

    const filteredLeads = filter === 'all' ? leads : leads.filter(l => l.status === filter)

    const tierLabel = batch.rateTier === 'conservative' ? 'Conservative'
        : batch.rateTier === 'normal' ? 'Normal' : 'Aggressive'

    const statusColor: Record<string, { bg: string; color: string }> = {
        draft: { bg: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)' },
        running: { bg: 'var(--color-info-light)', color: 'var(--color-info)' },
        paused: { bg: 'var(--color-warning-light)', color: 'var(--color-warning)' },
        completed: { bg: 'var(--color-success-light)', color: 'var(--color-success)' },
        cancelled: { bg: 'var(--color-error-light)', color: 'var(--color-error)' },
        daily_limit_reached: { bg: 'var(--color-warning-light)', color: 'var(--color-warning)' },
        weekly_limit_reached: { bg: 'var(--color-warning-light)', color: 'var(--color-warning)' },
        error_disconnected: { bg: 'var(--color-error-light)', color: 'var(--color-error)' },
    }

    const batchStatusStyle = statusColor[batch.status] || statusColor.draft
    const isActive = ['running', 'paused', 'daily_limit_reached', 'weekly_limit_reached', 'error_disconnected'].includes(batch.status)

    return (
        <div style={{ padding: 'var(--space-xl)' }}>
            <PageHeader
                title={batch.fileName}
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Batch Details' },
                ]}
                actions={
                    <Link to="/dashboard" className="btn btn-secondary btn-sm">
                        <ArrowLeft size={16} /> Back to Dashboard
                    </Link>
                }
            />

            {/* Batch info header */}
            <div style={{
                display: 'flex',
                gap: 'var(--space-lg)',
                alignItems: 'center',
                flexWrap: 'wrap',
                marginBottom: 'var(--space-xl)',
            }}>
                <span style={{
                    padding: '4px 12px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    background: batchStatusStyle.bg,
                    color: batchStatusStyle.color,
                }}>
                    {batch.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                    Rate: {tierLabel}
                </span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                    Created: {new Date(batch.createdAt).toLocaleDateString()}
                </span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                    {batch.totalLeads} leads
                </span>
            </div>

            {/* BatchProgress if active */}
            {isActive && <BatchProgress batch={batch} />}

            {/* MetricCards */}
            <MetricCards stats={batch.stats} total={batch.totalLeads} />

            {/* Filter buttons */}
            <div style={{
                display: 'flex',
                gap: 'var(--space-sm)',
                marginBottom: 'var(--space-lg)',
                flexWrap: 'wrap',
            }}>
                {STATUS_FILTERS.map(f => (
                    <button
                        key={f.key}
                        onClick={() => setFilter(f.key)}
                        className={filter === f.key ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
                    >
                        {f.label}
                        {f.key !== 'all' && (
                            <span style={{ marginLeft: 4, opacity: 0.7 }}>
                                ({leads.filter(l => l.status === f.key).length})
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Leads table */}
            <div style={{
                background: 'var(--color-bg-primary)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-card)',
                overflow: 'hidden',
            }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                                <th style={thStyle}>LinkedIn URL</th>
                                <th style={thStyle}>Name</th>
                                <th style={thStyle}>Status</th>
                                <th style={thStyle}>Error Detail</th>
                                <th style={thStyle}>Sent Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLeads.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
                                        No leads matching this filter
                                    </td>
                                </tr>
                            ) : (
                                filteredLeads.map((lead) => {
                                    const name = [lead.firstName, lead.lastName].filter(Boolean).join(' ') || '--'
                                    return (
                                        <tr key={lead._id} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                                            <td style={tdStyle}>
                                                <a
                                                    href={lead.linkedinUrl.startsWith('http') ? lead.linkedinUrl : `https://${lead.linkedinUrl}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}
                                                >
                                                    {lead.linkedinUrl.replace(/https?:\/\/(www\.)?linkedin\.com\/in\//, '').replace(/\/$/, '')}
                                                </a>
                                            </td>
                                            <td style={tdStyle}>{name}</td>
                                            <td style={tdStyle}>
                                                <LeadStatusBadge status={lead.status} />
                                            </td>
                                            <td style={tdStyle}>
                                                <span style={{ color: 'var(--color-text-tertiary)' }}>
                                                    {lead.errorDetail || '--'}
                                                </span>
                                            </td>
                                            <td style={tdStyle}>
                                                <span className="tabular-nums" style={{ color: 'var(--color-text-secondary)' }}>
                                                    {lead.sentAt ? new Date(lead.sentAt).toLocaleString() : '--'}
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

const thStyle: React.CSSProperties = {
    padding: '10px 14px',
    textAlign: 'left',
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
}

const tdStyle: React.CSSProperties = {
    padding: '10px 14px',
    color: 'var(--color-text-primary)',
}

function LeadStatusBadge({ status }: { status: string }) {
    const config: Record<string, { icon: React.ReactNode; bg: string; color: string; label: string }> = {
        pending: { icon: <Clock size={14} />, bg: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)', label: 'Pending' },
        sent: { icon: <PaperPlaneTilt size={14} />, bg: 'var(--color-info-light)', color: 'var(--color-info)', label: 'Sent' },
        accepted: { icon: <CheckCircle size={14} />, bg: 'var(--color-success-light)', color: 'var(--color-success)', label: 'Accepted' },
        replied: { icon: <ChatCircle size={14} />, bg: '#F0ECFF', color: '#7C5CFC', label: 'Replied' },
        already_connected: { icon: <UsersThree size={14} />, bg: 'var(--color-warning-light)', color: 'var(--color-warning)', label: 'Already Connected' },
        error: { icon: <WarningCircle size={14} />, bg: 'var(--color-error-light)', color: 'var(--color-error)', label: 'Error' },
        cancelled: { icon: <WarningCircle size={14} />, bg: 'var(--color-bg-tertiary)', color: 'var(--color-text-tertiary)', label: 'Cancelled' },
    }
    const c = config[status] || config.pending
    return (
        <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.75rem',
            fontWeight: 600,
            background: c.bg,
            color: c.color,
        }}>
            {c.icon} {c.label}
        </span>
    )
}

export default BatchDetailPage
