import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { MagnifyingGlass, DownloadSimple, UploadSimple, DotsThree, Check } from '@phosphor-icons/react'
import LeadsTable from '../components/dashboard/LeadsTable'
import LeadDetailPanel from '../components/dashboard/LeadDetailPanel'
import PageHeader from '../components/layout/PageHeader'
import Card from '../components/ui/Card'
import StatusBadge from '../components/ui/StatusBadge'
import { useSyncedUser, useLeads } from '../hooks'
import { mockLeads, type Lead } from '../data/mockLeads'
import './LeadsPage.css'

type SortField = 'name' | 'company' | 'score' | 'messageStatus' | 'outreachStatus'
type SortDirection = 'asc' | 'desc'

function LeadsPage() {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [searchQuery, setSearchQuery] = useState('')
    const [sortField, setSortField] = useState<SortField>('score')
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
    const [filterStatus, setFilterStatus] = useState<string>('all')

    // Get user and leads from Convex
    const syncedUser = useSyncedUser()
    const convexLeads = useLeads(syncedUser.convexId || undefined)
    // Convert Convex leads to our Lead type, or use mock data
    const leads: Lead[] = useMemo(() => {
        if (convexLeads && convexLeads.length > 0) {
            return convexLeads.map(lead => ({
                id: lead._id,
                firstName: lead.firstName,
                lastName: lead.lastName,
                company: lead.company,
                title: lead.title,
                linkedInUrl: lead.linkedInUrl,
                email: lead.email,
                score: lead.score,
                messageStatus: lead.messageStatus,
                outreachStatus: lead.outreachStatus,
                postScraped: lead.postScraped,
                createdAt: new Date(lead.createdAt).toISOString(),
            }))
        }
        return mockLeads
    }, [convexLeads])

    // Filter and sort leads
    const filteredLeads = useMemo(() => {
        let result = [...leads]

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            result = result.filter(lead =>
                lead.firstName.toLowerCase().includes(query) ||
                lead.lastName.toLowerCase().includes(query) ||
                lead.company.toLowerCase().includes(query) ||
                lead.title.toLowerCase().includes(query)
            )
        }

        // Status filter
        if (filterStatus !== 'all') {
            result = result.filter(lead => lead.outreachStatus === filterStatus)
        }

        // Sort
        result.sort((a, b) => {
            let aVal: string | number = ''
            let bVal: string | number = ''

            switch (sortField) {
                case 'name':
                    aVal = `${a.firstName} ${a.lastName}`
                    bVal = `${b.firstName} ${b.lastName}`
                    break
                case 'company':
                    aVal = a.company
                    bVal = b.company
                    break
                case 'score':
                    aVal = a.score
                    bVal = b.score
                    break
                case 'messageStatus':
                    aVal = a.messageStatus
                    bVal = b.messageStatus
                    break
                case 'outreachStatus':
                    aVal = a.outreachStatus
                    bVal = b.outreachStatus
                    break
            }

            if (sortDirection === 'asc') {
                return aVal < bVal ? -1 : aVal > bVal ? 1 : 0
            } else {
                return aVal > bVal ? -1 : aVal < bVal ? 1 : 0
            }
        })

        return result
    }, [leads, searchQuery, filterStatus, sortField, sortDirection])

    const handleSelectAll = () => {
        if (selectedIds.size === filteredLeads.length) {
            setSelectedIds(new Set())
        } else {
            setSelectedIds(new Set(filteredLeads.map(l => l.id)))
        }
    }

    const handleSelectOne = (id: string) => {
        const newSelected = new Set(selectedIds)
        if (newSelected.has(id)) {
            newSelected.delete(id)
        } else {
            newSelected.add(id)
        }
        setSelectedIds(newSelected)
    }

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(d => d === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortDirection('desc')
        }
    }

    const handleRowClick = (lead: Lead) => {
        setSelectedLead(lead)
    }

    const handleClosePanel = () => {
        setSelectedLead(null)
    }

    const allSelected = filteredLeads.length > 0 && selectedIds.size === filteredLeads.length
    const someSelected = selectedIds.size > 0
    const isLoading = syncedUser.isSignedIn && convexLeads === undefined

    const leadCountPill = (
        <span className="leads-count-pill">
            {isLoading ? '...' : filteredLeads.length}
            {convexLeads && convexLeads.length > 0 && (
                <span className="data-source-dot live" />
            )}
        </span>
    )

    const headerActions = (
        <div className="leads-header-actions">
            {leadCountPill}
            <Link to="/dashboard/upload" className="btn btn-primary btn-sm">
                <UploadSimple size={16} />
                Import
            </Link>
            <button className="btn btn-secondary btn-sm">
                <DownloadSimple size={16} />
                Export
            </button>
        </div>
    )

    return (
        <div className="leads-page">
            <div className="leads-container">
                <PageHeader
                    title="Leads"
                    breadcrumbs={[
                        { label: 'Dashboard', href: '/dashboard' },
                        { label: 'Leads' },
                    ]}
                    actions={headerActions}
                />

                {/* Toolbar */}
                <Card padding="sm" className="leads-toolbar-card animate-fade-in-up animation-delay-1">
                    <div className="leads-toolbar-inner">
                        <div className="toolbar-left">
                            <div className="search-box">
                                <MagnifyingGlass size={18} />
                                <input
                                    type="text"
                                    placeholder="Search leads..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="filter-group">
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                >
                                    <option value="all">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="sent">Sent</option>
                                    <option value="accepted">Accepted</option>
                                    <option value="replied">Replied</option>
                                </select>
                            </div>
                        </div>

                        {someSelected && (
                            <div className="toolbar-right bulk-actions">
                                <span className="selected-count">{selectedIds.size} selected</span>
                                <button className="btn btn-primary btn-sm">
                                    Generate Messages
                                </button>
                                <button className="btn btn-secondary btn-sm">
                                    <Check size={14} />
                                    Approve All
                                </button>
                                <button className="btn btn-text btn-sm">
                                    <DotsThree size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Loading State */}
                {isLoading && (
                    <Card padding="lg" className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading leads...</p>
                    </Card>
                )}

                {/* Empty State */}
                {!isLoading && filteredLeads.length === 0 && (
                    <Card padding="lg" className="empty-state-card">
                        <div className="empty-state-icon">
                            <UploadSimple size={48} weight="duotone" />
                        </div>
                        <h3>No leads yet</h3>
                        <p>Import your first leads to get started with AI-powered outreach.</p>
                        <Link to="/dashboard/upload" className="btn btn-primary">
                            <UploadSimple size={16} />
                            Import Leads
                        </Link>
                    </Card>
                )}

                {/* Table */}
                {!isLoading && filteredLeads.length > 0 && (
                    <Card padding="none" className="leads-table-card animate-fade-in-up animation-delay-2">
                        <LeadsTable
                            leads={filteredLeads}
                            selectedIds={selectedIds}
                            allSelected={allSelected}
                            sortField={sortField}
                            sortDirection={sortDirection}
                            onSelectAll={handleSelectAll}
                            onSelectOne={handleSelectOne}
                            onSort={handleSort}
                            onRowClick={handleRowClick}
                        />
                    </Card>
                )}

                {/* Status Legend */}
                {filteredLeads.length > 0 && (
                    <div className="status-legend-bar animate-fade-in-up animation-delay-3">
                        <StatusBadge status="pending" showDot size="sm" />
                        <StatusBadge status="sent" showDot size="sm" />
                        <StatusBadge status="accepted" showDot size="sm" />
                        <StatusBadge status="replied" showDot size="sm" />
                    </div>
                )}
            </div>

            {/* Detail Panel */}
            {selectedLead && (
                <LeadDetailPanel lead={selectedLead} onClose={handleClosePanel} />
            )}
        </div>
    )
}

export default LeadsPage
