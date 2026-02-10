import { ChevronUp, ChevronDown, ExternalLink, Check, X, Clock, FileText } from 'lucide-react'
import { type Lead } from '../../data/mockLeads'
import './LeadsTable.css'

type SortField = 'name' | 'company' | 'score' | 'messageStatus' | 'outreachStatus'
type SortDirection = 'asc' | 'desc'

interface LeadsTableProps {
    leads: Lead[]
    selectedIds: Set<string>
    allSelected: boolean
    sortField: SortField
    sortDirection: SortDirection
    onSelectAll: () => void
    onSelectOne: (id: string) => void
    onSort: (field: SortField) => void
    onRowClick: (lead: Lead) => void
}

function LeadsTable({
    leads,
    selectedIds,
    allSelected,
    sortField,
    sortDirection,
    onSelectAll,
    onSelectOne,
    onSort,
    onRowClick,
}: LeadsTableProps) {

    const renderSortIcon = (field: SortField) => {
        if (sortField !== field) return null
        return sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
    }

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'excellent'
        if (score >= 75) return 'good'
        if (score >= 60) return 'fair'
        return 'low'
    }

    const getMessageIcon = (status: Lead['messageStatus']) => {
        switch (status) {
            case 'ready': return <Check size={14} />
            case 'draft': return <Clock size={14} />
            case 'sent': return <Check size={14} />
            case 'empty': return <X size={14} />
        }
    }

    const getOutreachBadge = (status: Lead['outreachStatus']) => {
        return (
            <span className={`outreach-badge ${status}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        )
    }

    return (
        <div className="leads-table-wrapper">
            <table className="leads-table">
                <thead>
                    <tr>
                        <th className="col-select">
                            <label className="checkbox">
                                <input
                                    type="checkbox"
                                    checked={allSelected}
                                    onChange={onSelectAll}
                                />
                                <span className="checkmark"></span>
                            </label>
                        </th>
                        <th className="col-name sortable" onClick={() => onSort('name')}>
                            Name {renderSortIcon('name')}
                        </th>
                        <th className="col-company sortable" onClick={() => onSort('company')}>
                            Company {renderSortIcon('company')}
                        </th>
                        <th className="col-title">Title</th>
                        <th className="col-score sortable" onClick={() => onSort('score')}>
                            Score {renderSortIcon('score')}
                        </th>
                        <th className="col-message sortable" onClick={() => onSort('messageStatus')}>
                            Message {renderSortIcon('messageStatus')}
                        </th>
                        <th className="col-status sortable" onClick={() => onSort('outreachStatus')}>
                            Status {renderSortIcon('outreachStatus')}
                        </th>
                        <th className="col-post">Post</th>
                        <th className="col-actions"></th>
                    </tr>
                </thead>
                <tbody>
                    {leads.map((lead) => (
                        <tr
                            key={lead.id}
                            className={selectedIds.has(lead.id) ? 'selected' : ''}
                            onClick={() => onRowClick(lead)}
                        >
                            <td className="col-select" onClick={(e) => e.stopPropagation()}>
                                <label className="checkbox">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.has(lead.id)}
                                        onChange={() => onSelectOne(lead.id)}
                                    />
                                    <span className="checkmark"></span>
                                </label>
                            </td>
                            <td className="col-name">
                                <div className="lead-name-cell">
                                    <div className="lead-avatar">
                                        {lead.firstName[0]}{lead.lastName[0]}
                                    </div>
                                    <span className="lead-fullname">
                                        {lead.firstName} {lead.lastName}
                                    </span>
                                </div>
                            </td>
                            <td className="col-company">{lead.company}</td>
                            <td className="col-title">{lead.title}</td>
                            <td className="col-score">
                                <div className="score-cell">
                                    <div className={`score-bar ${getScoreColor(lead.score)}`}>
                                        <div className="score-fill" style={{ width: `${lead.score}%` }}></div>
                                    </div>
                                    <span className="score-value">{lead.score}</span>
                                </div>
                            </td>
                            <td className="col-message">
                                <span className={`message-status ${lead.messageStatus}`}>
                                    {getMessageIcon(lead.messageStatus)}
                                    <span>{lead.messageStatus === 'empty' ? 'Empty' :
                                        lead.messageStatus === 'draft' ? 'Draft' :
                                            lead.messageStatus === 'ready' ? 'Ready' : 'Sent'}</span>
                                </span>
                            </td>
                            <td className="col-status">
                                {getOutreachBadge(lead.outreachStatus)}
                            </td>
                            <td className="col-post">
                                {lead.postScraped ? (
                                    <span className="post-status scraped">
                                        <FileText size={14} />
                                    </span>
                                ) : (
                                    <span className="post-status pending">—</span>
                                )}
                            </td>
                            <td className="col-actions" onClick={(e) => e.stopPropagation()}>
                                <a
                                    href={lead.linkedInUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="action-link"
                                >
                                    <ExternalLink size={14} />
                                </a>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {leads.length === 0 && (
                <div className="empty-state">
                    <p>No leads found</p>
                </div>
            )}
        </div>
    )
}

export default LeadsTable
