import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, Download, Upload, MoreHorizontal, Check } from 'lucide-react'
import { UserButton as ClerkUserButton } from '@clerk/clerk-react'
import Logo from '../components/ui/Logo'
import LeadsTable from '../components/dashboard/LeadsTable'
import LeadDetailPanel from '../components/dashboard/LeadDetailPanel'
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
    const clerkConfigured = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

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
                filterMatch: lead.filterMatch,
                filterMismatchReasons: lead.filterMismatchReasons,
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

    return (
        <div className="leads-page">
            <header className="leads-header">
                <div className="leads-header-left">
                    <Link to="/dashboard" className="leads-logo">
                        <Logo />
                        <span>LeadFlow AI</span>
                    </Link>
                </div>
                <nav className="leads-nav">
                    <Link to="/dashboard" className="nav-link">Dashboard</Link>
                    <Link to="/dashboard/leads" className="nav-link active">Leads</Link>
                    <Link to="/dashboard/connect" className="nav-link">Connect</Link>
                </nav>
                <div className="leads-header-right">
                    {clerkConfigured ? (
                        <ClerkUserButton afterSignOutUrl="/" />
                    ) : (
                        <div className="user-avatar">U</div>
                    )}
                </div>
            </header>

            <main className="leads-main">
                <div className="leads-container">
                    {/* Page Header */}
                    <div className="leads-page-header">
                        <div className="leads-title">
                            <h1>Leads</h1>
                            <span className="leads-count">
                                {isLoading ? 'Loading...' : `${filteredLeads.length} leads`}
                            </span>
                            {convexLeads && convexLeads.length > 0 && (
                                <span className="data-source live">● Live</span>
                            )}
                        </div>
                        <div className="leads-actions">
                            <Link to="/dashboard/upload" className="btn btn-secondary">
                                <Upload size={16} />
                                Import
                            </Link>
                            <button className="btn btn-text">
                                <Download size={16} />
                                Export
                            </button>
                        </div>
                    </div>

                    {/* Toolbar */}
                    <div className="leads-toolbar">
                        <div className="toolbar-left">
                            <div className="search-box">
                                <Search size={18} />
                                <input
                                    type="text"
                                    placeholder="Search leads..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="filter-group">
                                <Filter size={16} />
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
                                    <MoreHorizontal size={16} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Loading State */}
                    {isLoading && (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Loading leads...</p>
                        </div>
                    )}

                    {/* Empty State */}
                    {!isLoading && filteredLeads.length === 0 && (
                        <div className="empty-state">
                            <div className="empty-icon">📋</div>
                            <h3>No leads yet</h3>
                            <p>Import your first leads to get started with AI-powered outreach.</p>
                            <Link to="/dashboard/upload" className="btn btn-primary">
                                <Upload size={16} />
                                Import Leads
                            </Link>
                        </div>
                    )}

                    {/* Table */}
                    {!isLoading && filteredLeads.length > 0 && (
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
                    )}

                    {/* Status Legend */}
                    {filteredLeads.length > 0 && (
                        <div className="status-legend">
                            <span className="legend-item">
                                <span className="status-dot pending"></span> Pending
                            </span>
                            <span className="legend-item">
                                <span className="status-dot sent"></span> Sent
                            </span>
                            <span className="legend-item">
                                <span className="status-dot accepted"></span> Accepted
                            </span>
                            <span className="legend-item">
                                <span className="status-dot replied"></span> Replied
                            </span>
                        </div>
                    )}
                </div>
            </main>

            {/* Detail Panel */}
            {selectedLead && (
                <LeadDetailPanel lead={selectedLead} onClose={handleClosePanel} />
            )}
        </div>
    )
}

export default LeadsPage
