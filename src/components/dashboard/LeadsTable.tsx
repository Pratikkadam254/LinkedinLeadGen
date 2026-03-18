import { CaretUp, CaretDown, ArrowSquareOut, Check, X, Clock, FileText } from '@phosphor-icons/react'
import { type Lead } from '../../data/mockLeads'
import StatusBadge from '../ui/StatusBadge'
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

const AVATAR_COLORS = [
    { bg: '#EEF1FE', color: '#4F6BED' },
    { bg: '#E8F8F0', color: '#2D9D6F' },
    { bg: '#F3EEFE', color: '#7C5CFC' },
    { bg: '#FFF8E6', color: '#E5A320' },
    { bg: '#FEF0F0', color: '#E04545' },
    { bg: '#E6F7F9', color: '#1DA1B8' },
]

function getAvatarColor(name: string) {
    const charCode = name.charCodeAt(0) + (name.charCodeAt(1) || 0)
    return AVATAR_COLORS[charCode % AVATAR_COLORS.length]
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
        return sortDirection === 'asc' ? <CaretUp size={14} /> : <CaretDown size={14} />
    }

    const getMessageIcon = (status: Lead['messageStatus']) => {
        switch (status) {
            case 'ready': return <Check size={14} />
            case 'draft': return <Clock size={14} />
            case 'sent': return <Check size={14} />
            case 'empty': return <X size={14} />
        }
    }

    return (
        <div className="leads-table-wrapper">
            <table className="leads-table">
                <thead>
                    <tr>
                        <th className="col-select">
                            <input
                                type="checkbox"
                                checked={allSelected}
                                onChange={onSelectAll}
                                className="table-checkbox"
                            />
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
                    {leads.map((lead) => {
                        const avatarColor = getAvatarColor(lead.firstName + lead.lastName)
                        return (
                            <tr
                                key={lead.id}
                                className={selectedIds.has(lead.id) ? 'selected' : ''}
                                onClick={() => onRowClick(lead)}
                            >
                                <td className="col-select" onClick={(e) => e.stopPropagation()}>
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.has(lead.id)}
                                        onChange={() => onSelectOne(lead.id)}
                                        className="table-checkbox"
                                    />
                                </td>
                                <td className="col-name">
                                    <div className="lead-name-cell">
                                        <div
                                            className="lead-avatar"
                                            style={{ background: avatarColor.bg, color: avatarColor.color }}
                                        >
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
                                        <div className="score-bar-track">
                                            <div
                                                className="score-bar-fill"
                                                style={{ width: `${lead.score}%` }}
                                            />
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
                                    <StatusBadge
                                        status={lead.outreachStatus as 'pending' | 'sent' | 'accepted' | 'replied'}
                                        size="sm"
                                    />
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
                                        <ArrowSquareOut size={14} />
                                    </a>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>

            {leads.length === 0 && (
                <div className="table-empty-state">
                    <p>No leads found</p>
                </div>
            )}
        </div>
    )
}

export default LeadsTable
