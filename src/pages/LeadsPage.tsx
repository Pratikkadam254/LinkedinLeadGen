import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Filter, Upload, Check, Sparkles, Loader2 } from 'lucide-react'
import { useAction } from 'convex/react'
import { api } from '../../convex/_generated/api'
import DashboardLayout from '../components/dashboard/DashboardLayout'
import LeadsTable from '../components/dashboard/LeadsTable'
import LeadDetailPanel from '../components/dashboard/LeadDetailPanel'
import { useSyncedUser, useLeads } from '../hooks'
import { useToast } from '../components/ui/Toast'
import type { Lead } from '../data/mockLeads'
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
    const [isGenerating, setIsGenerating] = useState(false)

    const syncedUser = useSyncedUser()
    const convexLeads = useLeads(syncedUser.convexId || undefined)
    const generateMessages = useAction(api.actions.generateMessages.generateForLeads)
    const { showToast } = useToast()
    const navigate = useNavigate()

    const leads: Lead[] = useMemo(() => {
        if (convexLeads && convexLeads.length > 0) {
            return convexLeads.map((lead: typeof convexLeads[number]) => ({
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
        return []
    }, [convexLeads])

    const filteredLeads = useMemo(() => {
        let result = [...leads]
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            result = result.filter(lead =>
                lead.firstName.toLowerCase().includes(query) ||
                lead.lastName.toLowerCase().includes(query) ||
                lead.company.toLowerCase().includes(query) ||
                lead.title.toLowerCase().includes(query)
            )
        }
        if (filterStatus !== 'all') {
            result = result.filter(lead => lead.outreachStatus === filterStatus)
        }
        result.sort((a, b) => {
            let aVal: string | number = ''
            let bVal: string | number = ''
            switch (sortField) {
                case 'name': aVal = `${a.firstName} ${a.lastName}`; bVal = `${b.firstName} ${b.lastName}`; break
                case 'company': aVal = a.company; bVal = b.company; break
                case 'score': aVal = a.score; bVal = b.score; break
                case 'messageStatus': aVal = a.messageStatus; bVal = b.messageStatus; break
                case 'outreachStatus': aVal = a.outreachStatus; bVal = b.outreachStatus; break
            }
            return sortDirection === 'asc' ? (aVal < bVal ? -1 : 1) : (aVal > bVal ? -1 : 1)
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
        if (newSelected.has(id)) newSelected.delete(id)
        else newSelected.add(id)
        setSelectedIds(newSelected)
    }

    const handleSort = (field: SortField) => {
        if (sortField === field) setSortDirection(d => d === 'asc' ? 'desc' : 'asc')
        else { setSortField(field); setSortDirection('desc') }
    }

    const handleGenerateMessages = async () => {
        if (!syncedUser.convexId) return

        const ids = selectedIds.size > 0
            ? Array.from(selectedIds)
            : filteredLeads.filter(l => l.messageStatus === 'empty').map(l => l.id)

        if (ids.length === 0) {
            showToast('error', 'No leads without messages to generate for')
            return
        }

        setIsGenerating(true)
        try {
            await generateMessages({
                userId: syncedUser.convexId,
                leadIds: ids as any,
                tone: syncedUser.preferences?.messageTone || 'professional',
            })
            showToast('success', `Generated messages for ${ids.length} leads!`)
            navigate('/dashboard/approve')
        } catch (error) {
            showToast('error', 'Failed to generate messages. Check your API key.')
        } finally {
            setIsGenerating(false)
        }
    }

    const allSelected = filteredLeads.length > 0 && selectedIds.size === filteredLeads.length
    const someSelected = selectedIds.size > 0
    const isLoading = syncedUser.isSignedIn && convexLeads === undefined
    const emptyLeadCount = leads.filter(l => l.messageStatus === 'empty').length

    return (
        <DashboardLayout>
            <div className="leads-container">
                <div className="leads-page-header">
                    <div className="leads-title">
                        <h1>Leads</h1>
                        <span className="leads-count">
                            {isLoading ? 'Loading...' : `${filteredLeads.length} leads`}
                        </span>
                    </div>
                    <div className="leads-actions">
                        <Link to="/dashboard/upload" className="btn btn-secondary">
                            <Upload size={16} /> Import
                        </Link>
                        {emptyLeadCount > 0 && (
                            <button
                                className="btn btn-primary"
                                onClick={handleGenerateMessages}
                                disabled={isGenerating}
                            >
                                {isGenerating ? (
                                    <><Loader2 size={16} className="spin-icon" /> Generating...</>
                                ) : (
                                    <><Sparkles size={16} /> Generate All Messages ({emptyLeadCount})</>
                                )}
                            </button>
                        )}
                    </div>
                </div>

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
                            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
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
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={handleGenerateMessages}
                                disabled={isGenerating}
                            >
                                {isGenerating ? <Loader2 size={14} className="spin-icon" /> : <Sparkles size={14} />}
                                Generate Messages
                            </button>
                            <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => navigate('/dashboard/approve')}
                            >
                                <Check size={14} /> Review & Approve
                            </button>
                        </div>
                    )}
                </div>

                {isLoading && (
                    <div className="empty-state">
                        <Loader2 size={32} className="spin-icon" />
                        <p>Loading leads...</p>
                    </div>
                )}

                {!isLoading && filteredLeads.length === 0 && (
                    <div className="empty-state">
                        <h3>No leads yet</h3>
                        <p>Import your first leads to get started with AI-powered outreach.</p>
                        <Link to="/dashboard/upload" className="btn btn-primary">
                            <Upload size={16} /> Import Leads
                        </Link>
                    </div>
                )}

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
                        onRowClick={(lead) => setSelectedLead(lead)}
                    />
                )}
            </div>

            {selectedLead && (
                <LeadDetailPanel lead={selectedLead} onClose={() => setSelectedLead(null)} />
            )}
        </DashboardLayout>
    )
}

export default LeadsPage
