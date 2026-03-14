import { useState, useMemo } from 'react'
import { useAction } from 'convex/react'
import { CheckSquare, Send, RefreshCw, Edit3, Loader2, MessageSquare, AlertCircle } from 'lucide-react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'
import DashboardLayout from '../components/dashboard/DashboardLayout'
import { useSyncedUser, useLeadsByMessageStatus, useLeadMutations } from '../hooks'
import { useToast } from '../components/ui/Toast'
import './ApprovalPage.css'

function getScoreTierColor(scoreTier: string | undefined) {
    switch (scoreTier) {
        case 'hot': return { bg: '#FEE2E2', text: '#DC2626' }
        case 'warm': return { bg: '#FEF3C7', text: '#D97706' }
        case 'cold': return { bg: '#DBEAFE', text: '#3B82F6' }
        default: return { bg: '#F3F4F6', text: '#6B7280' }
    }
}

export default function ApprovalPage() {
    const syncedUser = useSyncedUser()
    const userId = syncedUser.convexId as Id<"users"> | undefined
    const drafts = useLeadsByMessageStatus(userId, "draft")
    const approved = useLeadsByMessageStatus(userId, "approved")
    const { updateMessage, bulkApprove, approveMessage } = useLeadMutations()
    const generateForLeads = useAction(api.actions.generateMessages.generateForLeads)
    const sendApproved = useAction(api.actions.sendOutreach.sendApproved)
    const { showToast } = useToast()

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [editingMessages, setEditingMessages] = useState<Record<string, string>>({})
    const [regeneratingIds, setRegeneratingIds] = useState<Set<string>>(new Set())
    const [isSending, setIsSending] = useState(false)
    const [isBulkApproving, setIsBulkApproving] = useState(false)

    const isLoading = syncedUser.isSignedIn && (drafts === undefined || approved === undefined)
    const draftList = drafts ?? []
    const approvedList = approved ?? []
    const totalCount = draftList.length + approvedList.length

    const allDraftIds = useMemo(() => draftList.map((l: { _id: string }) => l._id), [draftList])

    // Selection handlers
    const toggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    const toggleSelectAll = () => {
        if (selectedIds.size === draftList.length) {
            setSelectedIds(new Set())
        } else {
            setSelectedIds(new Set(draftList.map((l: { _id: string }) => l._id)))
        }
    }

    // Edit handlers
    const startEditing = (id: string, currentMessage: string) => {
        setEditingMessages(prev => ({ ...prev, [id]: currentMessage }))
    }

    const cancelEditing = (id: string) => {
        setEditingMessages(prev => {
            const next = { ...prev }
            delete next[id]
            return next
        })
    }

    const saveEdit = async (id: string) => {
        const message = editingMessages[id]
        if (message === undefined) return
        try {
            await updateMessage({ id: id as Id<"leads">, message, status: "draft" })
            cancelEditing(id)
            showToast('success', 'Message updated')
        } catch {
            showToast('error', 'Failed to update message')
        }
    }

    // Approve handlers
    const handleApproveOne = async (id: string) => {
        try {
            await approveMessage({ id: id as Id<"leads"> })
            setSelectedIds(prev => {
                const next = new Set(prev)
                next.delete(id)
                return next
            })
            showToast('success', 'Message approved')
        } catch {
            showToast('error', 'Failed to approve message')
        }
    }

    const handleApproveSelected = async () => {
        if (selectedIds.size === 0) return
        setIsBulkApproving(true)
        try {
            await bulkApprove({ ids: Array.from(selectedIds) as Id<"leads">[] })
            setSelectedIds(new Set())
            showToast('success', `${selectedIds.size} messages approved`)
        } catch {
            showToast('error', 'Failed to approve messages')
        } finally {
            setIsBulkApproving(false)
        }
    }

    const handleApproveAll = async () => {
        if (allDraftIds.length === 0) return
        setIsBulkApproving(true)
        try {
            await bulkApprove({ ids: allDraftIds as Id<"leads">[] })
            setSelectedIds(new Set())
            showToast('success', `${allDraftIds.length} messages approved`)
        } catch {
            showToast('error', 'Failed to approve messages')
        } finally {
            setIsBulkApproving(false)
        }
    }

    // Undo approval
    const handleUndoApproval = async (id: string, message: string) => {
        try {
            await updateMessage({ id: id as Id<"leads">, message, status: "draft" })
            showToast('success', 'Moved back to drafts')
        } catch {
            showToast('error', 'Failed to undo approval')
        }
    }

    // Regenerate
    const handleRegenerate = async (id: string, tone?: string) => {
        if (!userId) return
        setRegeneratingIds(prev => new Set(prev).add(id))
        try {
            await generateForLeads({ userId, leadIds: [id as Id<"leads">], tone: tone ?? "professional" })
            showToast('success', 'Message regenerated')
        } catch {
            showToast('error', 'Failed to regenerate message')
        } finally {
            setRegeneratingIds(prev => {
                const next = new Set(prev)
                next.delete(id)
                return next
            })
        }
    }

    // Send approved
    const handleSendApproved = async () => {
        if (!userId || approvedList.length === 0) return
        setIsSending(true)
        try {
            const approvedIds = approvedList.map((l: { _id: string }) => l._id) as Id<"leads">[]
            await sendApproved({ userId, leadIds: approvedIds })
            showToast('success', `${approvedIds.length} messages sent successfully`)
        } catch {
            showToast('error', 'Failed to send messages')
        } finally {
            setIsSending(false)
        }
    }

    return (
        <DashboardLayout>
            <div className="approval-page">
                {/* Page Header */}
                <div className="approval-header">
                    <div className="approval-header-text">
                        <h1>Review Messages</h1>
                        <p className="approval-subtitle">
                            {isLoading
                                ? 'Loading...'
                                : `${totalCount} message${totalCount !== 1 ? 's' : ''} to review`
                            }
                        </p>
                    </div>
                </div>

                {/* Toolbar */}
                {draftList.length > 0 && (
                    <div className="approval-toolbar">
                        <label className="select-all-checkbox">
                            <input
                                type="checkbox"
                                checked={draftList.length > 0 && selectedIds.size === draftList.length}
                                onChange={toggleSelectAll}
                            />
                            <span>Select All ({draftList.length})</span>
                        </label>
                        <div className="toolbar-actions">
                            <button
                                className="btn btn-secondary"
                                onClick={handleApproveSelected}
                                disabled={selectedIds.size === 0 || isBulkApproving}
                            >
                                {isBulkApproving ? <Loader2 size={16} className="spin" /> : <CheckSquare size={16} />}
                                Approve Selected ({selectedIds.size})
                            </button>
                            <button
                                className="btn btn-secondary"
                                onClick={handleApproveAll}
                                disabled={draftList.length === 0 || isBulkApproving}
                            >
                                <CheckSquare size={16} />
                                Approve All
                            </button>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {isLoading && (
                    <div className="approval-empty">
                        <Loader2 size={32} className="spin" />
                        <p>Loading messages...</p>
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && totalCount === 0 && (
                    <div className="approval-empty">
                        <MessageSquare size={48} />
                        <h3>No messages to review</h3>
                        <p>Generate messages from your leads page to see them here for approval.</p>
                    </div>
                )}

                {/* Draft Cards */}
                {draftList.length > 0 && (
                    <div className="approval-section">
                        <h2 className="section-label">Drafts ({draftList.length})</h2>
                        <div className="message-cards">
                            {draftList.map((lead: any) => {
                                const isEditing = editingMessages[lead._id] !== undefined
                                const isRegenerating = regeneratingIds.has(lead._id)
                                const tierColor = getScoreTierColor(lead.scoreTier)
                                const currentMessage = isEditing
                                    ? editingMessages[lead._id]
                                    : (lead.generatedMessage ?? '')

                                return (
                                    <div key={lead._id} className="message-card">
                                        <div className="card-left">
                                            <label className="card-checkbox">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.has(lead._id)}
                                                    onChange={() => toggleSelect(lead._id)}
                                                />
                                            </label>
                                            <div className="lead-info">
                                                <div className="lead-name">
                                                    {lead.firstName} {lead.lastName}
                                                </div>
                                                <div className="lead-detail">
                                                    {lead.title} @ {lead.company}
                                                </div>
                                                <span
                                                    className="score-badge"
                                                    style={{ background: tierColor.bg, color: tierColor.text }}
                                                >
                                                    {lead.scoreTier ?? 'unscored'} ({lead.score ?? 0})
                                                </span>
                                            </div>
                                        </div>

                                        <div className="card-center">
                                            {isEditing ? (
                                                <>
                                                    <textarea
                                                        className="message-textarea"
                                                        value={currentMessage}
                                                        onChange={e =>
                                                            setEditingMessages(prev => ({
                                                                ...prev,
                                                                [lead._id]: e.target.value,
                                                            }))
                                                        }
                                                        maxLength={300}
                                                        rows={4}
                                                    />
                                                    <div className="textarea-footer">
                                                        <span className="char-count">
                                                            {currentMessage.length}/300
                                                        </span>
                                                        <div className="edit-actions">
                                                            <button
                                                                className="btn btn-text btn-sm"
                                                                onClick={() => cancelEditing(lead._id)}
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                className="btn btn-primary btn-sm"
                                                                onClick={() => saveEdit(lead._id)}
                                                            >
                                                                Save
                                                            </button>
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <div
                                                    className="message-preview"
                                                    onClick={() => startEditing(lead._id, lead.generatedMessage ?? '')}
                                                >
                                                    {lead.generatedMessage || (
                                                        <span className="no-message">
                                                            <AlertCircle size={14} /> No message generated
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="card-right">
                                            <button
                                                className="btn btn-primary btn-sm"
                                                onClick={() => handleApproveOne(lead._id)}
                                                title="Approve"
                                            >
                                                <CheckSquare size={16} />
                                                Approve
                                            </button>
                                            <button
                                                className="btn btn-text btn-sm"
                                                onClick={() => !isEditing && startEditing(lead._id, lead.generatedMessage ?? '')}
                                                title="Edit"
                                                disabled={isEditing}
                                            >
                                                <Edit3 size={16} />
                                            </button>
                                            <button
                                                className="btn btn-text btn-sm"
                                                onClick={() => handleRegenerate(lead._id, lead.messageTone)}
                                                disabled={isRegenerating}
                                                title="Regenerate"
                                            >
                                                {isRegenerating
                                                    ? <Loader2 size={16} className="spin" />
                                                    : <RefreshCw size={16} />
                                                }
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Approved Cards */}
                {approvedList.length > 0 && (
                    <div className="approval-section">
                        <h2 className="section-label approved-label">Approved ({approvedList.length})</h2>
                        <div className="message-cards">
                            {approvedList.map((lead: any) => {
                                const tierColor = getScoreTierColor(lead.scoreTier)
                                return (
                                    <div key={lead._id} className="message-card approved">
                                        <div className="card-left">
                                            <div className="lead-info">
                                                <div className="lead-name">
                                                    {lead.firstName} {lead.lastName}
                                                </div>
                                                <div className="lead-detail">
                                                    {lead.title} @ {lead.company}
                                                </div>
                                                <span
                                                    className="score-badge"
                                                    style={{ background: tierColor.bg, color: tierColor.text }}
                                                >
                                                    {lead.scoreTier ?? 'unscored'} ({lead.score ?? 0})
                                                </span>
                                            </div>
                                        </div>
                                        <div className="card-center">
                                            <div className="message-preview approved-message">
                                                {lead.generatedMessage}
                                            </div>
                                            <span className="approved-badge">Approved</span>
                                        </div>
                                        <div className="card-right">
                                            <button
                                                className="btn btn-text btn-sm"
                                                onClick={() => handleUndoApproval(lead._id, lead.generatedMessage ?? '')}
                                            >
                                                Undo
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Footer Send Bar */}
                {approvedList.length > 0 && (
                    <div className="approval-footer">
                        <button
                            className="btn btn-primary btn-send"
                            onClick={handleSendApproved}
                            disabled={isSending}
                        >
                            {isSending
                                ? <Loader2 size={18} className="spin" />
                                : <Send size={18} />
                            }
                            Send Approved ({approvedList.length})
                        </button>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}
