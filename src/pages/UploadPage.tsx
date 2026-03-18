import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { UploadSimple, FileText, X, WarningCircle, CheckCircle, SpinnerGap } from '@phosphor-icons/react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useSyncedUser } from '../hooks/useSyncedUser'
import { parseCSV, validateFile, readFileAsText, type ParseResult } from '../lib/csvParser'
import PageHeader from '../components/layout/PageHeader'

type RateTier = 'conservative' | 'normal' | 'aggressive'

function UploadPage() {
    const navigate = useNavigate()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const { convexId, unipileConnected } = useSyncedUser()
    const createBatch = useMutation(api.batches.create)
    const bulkCreateLeads = useMutation(api.leads.bulkCreate)
    const startBatch = useMutation(api.batches.start)

    const [file, setFile] = useState<File | null>(null)
    const [parseResult, setParseResult] = useState<ParseResult | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [globalMessage, setGlobalMessage] = useState('')
    const [rateTier, setRateTier] = useState<RateTier>('normal')
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleFile = useCallback(async (selectedFile: File) => {
        setError(null)
        const validation = validateFile(selectedFile)
        if (!validation.valid) {
            setError(validation.error || 'Invalid file')
            return
        }

        try {
            const text = await readFileAsText(selectedFile)
            const result = parseCSV(text)

            if (result.leads.length === 0) {
                setError('No valid leads found. Make sure your CSV has a LinkedIn URL column.')
                return
            }

            setFile(selectedFile)
            setParseResult(result)
        } catch {
            setError('Failed to parse CSV file')
        }
    }, [])

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }
    const handleDragLeave = () => setIsDragging(false)
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        const droppedFile = e.dataTransfer.files[0]
        if (droppedFile) handleFile(droppedFile)
    }
    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) handleFile(selectedFile)
    }
    const handleReset = () => {
        setFile(null)
        setParseResult(null)
        setGlobalMessage('')
        setError(null)
    }

    // Validation checks
    const needsGlobalMessage = parseResult && !parseResult.hasMessageColumn
    const hasMessageErrors = parseResult && parseResult.messageTooLong.length > 0
    const globalMessageTooLong = globalMessage.length > 300
    const globalMessageMissing = needsGlobalMessage && globalMessage.trim().length === 0

    const canSubmit = parseResult &&
        parseResult.leads.length > 0 &&
        !globalMessageTooLong &&
        !globalMessageMissing &&
        !hasMessageErrors &&
        !submitting

    const handleSubmit = async () => {
        if (!canSubmit || !convexId || !file || !parseResult) return

        if (!unipileConnected) {
            setError('Please connect LinkedIn first before sending connection requests.')
            return
        }

        setSubmitting(true)
        setError(null)

        try {
            // Create batch
            const batchId = await createBatch({
                userId: convexId,
                fileName: file.name,
                totalLeads: parseResult.leads.length,
                globalMessage: needsGlobalMessage ? globalMessage : undefined,
                rateTier,
            })

            // Create leads
            const leadsToCreate = parseResult.leads.map(lead => ({
                linkedinUrl: lead.linkedinUrl,
                firstName: lead.firstName,
                lastName: lead.lastName,
                company: lead.company,
                title: lead.title,
                message: lead.message || globalMessage,
            }))

            await bulkCreateLeads({
                batchId,
                userId: convexId,
                leads: leadsToCreate,
            })

            // Start batch
            await startBatch({ batchId })

            navigate('/dashboard')
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to create batch'
            setError(message)
            setSubmitting(false)
        }
    }

    return (
        <div style={{ padding: 'var(--space-xl)' }}>
            <PageHeader
                title="Upload CSV"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Upload' },
                ]}
            />

            <div style={{ maxWidth: 800, margin: '0 auto' }}>
                {/* Error banner */}
                {error && (
                    <div style={{
                        background: 'var(--color-error-light)',
                        color: 'var(--color-error)',
                        padding: 'var(--space-md)',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: 'var(--space-lg)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-sm)',
                        fontSize: '0.875rem',
                    }}>
                        <WarningCircle size={18} weight="bold" />
                        {error}
                        {!unipileConnected && error.includes('LinkedIn') && (
                            <a href="/onboarding" style={{ color: 'var(--color-error)', fontWeight: 600, marginLeft: 4 }}>
                                Go to Onboarding
                            </a>
                        )}
                    </div>
                )}

                {/* Drop zone (shown when no file parsed yet) */}
                {!parseResult && (
                    <div
                        className="animate-fade-in-up"
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                            background: isDragging ? 'var(--color-primary-lighter)' : 'var(--color-bg-primary)',
                            border: `2px dashed ${isDragging ? 'var(--color-primary)' : 'var(--color-border-medium)'}`,
                            borderRadius: 'var(--radius-lg)',
                            padding: 'var(--space-3xl) var(--space-xl)',
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'all var(--transition-base)',
                        }}
                    >
                        <UploadSimple size={48} weight="duotone" style={{ color: 'var(--color-primary)', marginBottom: 'var(--space-md)' }} />
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--space-xs)' }}>
                            Drop your CSV file here
                        </h3>
                        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-md)' }}>
                            or click to browse
                        </p>
                        <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-tertiary)' }}>
                            CSV with a LinkedIn URL column. Name, company, and message columns are optional.
                        </span>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv,.txt,.tsv"
                            onChange={handleFileInput}
                            style={{ display: 'none' }}
                        />
                    </div>
                )}

                {/* CSV Preview */}
                {parseResult && file && (
                    <div className="animate-fade-in-up">
                        {/* File info + reset */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 'var(--space-lg)',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                                <FileText size={20} style={{ color: 'var(--color-primary)' }} />
                                <span style={{ fontWeight: 600 }}>{file.name}</span>
                            </div>
                            <button className="btn btn-text btn-sm" onClick={handleReset}>
                                <X size={16} /> Change File
                            </button>
                        </div>

                        {/* Stats */}
                        <div style={{
                            display: 'flex',
                            gap: 'var(--space-md)',
                            marginBottom: 'var(--space-lg)',
                            flexWrap: 'wrap',
                        }}>
                            <StatPill label="leads found" value={parseResult.leads.length} color="var(--color-success)" bg="var(--color-success-light)" />
                            {parseResult.duplicatesRemoved > 0 && (
                                <StatPill label="duplicates removed" value={parseResult.duplicatesRemoved} color="var(--color-warning)" bg="var(--color-warning-light)" />
                            )}
                            {parseResult.skippedRows > 0 && (
                                <StatPill label="invalid rows" value={parseResult.skippedRows} color="var(--color-error)" bg="var(--color-error-light)" />
                            )}
                        </div>

                        {/* Preview table */}
                        <div style={{
                            background: 'var(--color-bg-primary)',
                            borderRadius: 'var(--radius-md)',
                            boxShadow: 'var(--shadow-card)',
                            overflow: 'hidden',
                            marginBottom: 'var(--space-lg)',
                        }}>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                                            <th style={thStyle}>LinkedIn URL</th>
                                            <th style={thStyle}>Name</th>
                                            <th style={thStyle}>Company</th>
                                            <th style={thStyle}>Message</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {parseResult.leads.slice(0, 10).map((lead, idx) => {
                                            const name = [lead.firstName, lead.lastName].filter(Boolean).join(' ') || '--'
                                            const msgTooLong = lead.message && lead.message.length > 300
                                            return (
                                                <tr key={idx} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                                                    <td style={tdStyle}>
                                                        <span style={{ color: 'var(--color-primary)', maxWidth: 200, display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {lead.linkedinUrl}
                                                        </span>
                                                    </td>
                                                    <td style={tdStyle}>{name}</td>
                                                    <td style={tdStyle}>{lead.company || '--'}</td>
                                                    <td style={tdStyle}>
                                                        {lead.message ? (
                                                            <span style={{ color: msgTooLong ? 'var(--color-error)' : 'var(--color-text-secondary)' }}>
                                                                {lead.message.substring(0, 50)}{lead.message.length > 50 ? '...' : ''}
                                                                {msgTooLong && ` (${lead.message.length}/300)`}
                                                            </span>
                                                        ) : (
                                                            <span style={{ color: 'var(--color-text-tertiary)' }}>--</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            {parseResult.leads.length > 10 && (
                                <div style={{ padding: 'var(--space-sm) var(--space-md)', fontSize: '0.8125rem', color: 'var(--color-text-tertiary)', textAlign: 'center' }}>
                                    ...and {parseResult.leads.length - 10} more leads
                                </div>
                            )}
                        </div>

                        {/* Message too long warnings */}
                        {hasMessageErrors && (
                            <div style={{
                                background: 'var(--color-error-light)',
                                padding: 'var(--space-md)',
                                borderRadius: 'var(--radius-md)',
                                marginBottom: 'var(--space-lg)',
                                fontSize: '0.8125rem',
                            }}>
                                <div style={{ fontWeight: 600, color: 'var(--color-error)', marginBottom: 'var(--space-xs)' }}>
                                    <WarningCircle size={16} weight="bold" style={{ verticalAlign: 'middle', marginRight: 4 }} />
                                    {parseResult.messageTooLong.length} message(s) exceed 300 characters
                                </div>
                                {parseResult.messageTooLong.slice(0, 5).map((err, i) => (
                                    <div key={i} style={{ color: 'var(--color-error)', marginLeft: 'var(--space-lg)' }}>
                                        Row {err.row}: {err.message}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Global message (if CSV has no message column) */}
                        {needsGlobalMessage && (
                            <div style={{
                                background: 'var(--color-bg-primary)',
                                borderRadius: 'var(--radius-md)',
                                boxShadow: 'var(--shadow-card)',
                                padding: 'var(--space-lg)',
                                marginBottom: 'var(--space-lg)',
                            }}>
                                <label style={{ display: 'block', fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
                                    Connection Message
                                </label>
                                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-md)' }}>
                                    Your CSV has no message column. Write a message to send with all connection requests.
                                </p>
                                <textarea
                                    value={globalMessage}
                                    onChange={(e) => setGlobalMessage(e.target.value)}
                                    placeholder="Hi {firstName}, I'd love to connect and learn more about what you're building at {company}."
                                    maxLength={300}
                                    rows={4}
                                    style={{
                                        width: '100%',
                                        resize: 'vertical',
                                        borderColor: globalMessageTooLong ? 'var(--color-error)' : undefined,
                                    }}
                                />
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    marginTop: 'var(--space-xs)',
                                    fontSize: '0.75rem',
                                    color: globalMessageTooLong ? 'var(--color-error)' : 'var(--color-text-tertiary)',
                                }}>
                                    {globalMessage.length}/300
                                </div>
                            </div>
                        )}

                        {/* Rate tier selector */}
                        <div style={{
                            background: 'var(--color-bg-primary)',
                            borderRadius: 'var(--radius-md)',
                            boxShadow: 'var(--shadow-card)',
                            padding: 'var(--space-lg)',
                            marginBottom: 'var(--space-xl)',
                        }}>
                            <label style={{ display: 'block', fontWeight: 600, marginBottom: 'var(--space-md)' }}>
                                Sending Speed
                            </label>
                            <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
                                <RateTierOption
                                    tier="conservative"
                                    label="Conservative"
                                    desc="15-20/day, safest"
                                    selected={rateTier === 'conservative'}
                                    onSelect={() => setRateTier('conservative')}
                                />
                                <RateTierOption
                                    tier="normal"
                                    label="Normal"
                                    desc="30-40/day"
                                    selected={rateTier === 'normal'}
                                    onSelect={() => setRateTier('normal')}
                                />
                                <RateTierOption
                                    tier="aggressive"
                                    label="Aggressive"
                                    desc="60-80/day, risky"
                                    selected={rateTier === 'aggressive'}
                                    onSelect={() => setRateTier('aggressive')}
                                />
                            </div>
                        </div>

                        {/* Submit button */}
                        <button
                            className="btn btn-lg"
                            disabled={!canSubmit}
                            onClick={handleSubmit}
                            style={{
                                width: '100%',
                                height: 52,
                                fontSize: '1rem',
                                fontWeight: 700,
                                borderRadius: 'var(--radius-md)',
                                background: canSubmit ? 'var(--color-success)' : 'var(--color-bg-tertiary)',
                                color: canSubmit ? '#fff' : 'var(--color-text-tertiary)',
                                cursor: canSubmit ? 'pointer' : 'not-allowed',
                                transition: 'all var(--transition-base)',
                            }}
                        >
                            {submitting ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                                    <SpinnerGap size={20} className="spin-icon" /> Creating batch...
                                </span>
                            ) : (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                                    <CheckCircle size={20} weight="bold" />
                                    Should we start connecting?
                                </span>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

// --- Sub-components ---

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

function StatPill({ label, value, color, bg }: { label: string; value: number; color: string; bg: string }) {
    return (
        <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 12px',
            borderRadius: 'var(--radius-full)',
            background: bg,
            color,
            fontSize: '0.8125rem',
            fontWeight: 600,
        }}>
            {value} {label}
        </span>
    )
}

function RateTierOption({ label, desc, selected, onSelect }: {
    tier: string
    label: string
    desc: string
    selected: boolean
    onSelect: () => void
}) {
    return (
        <button
            onClick={onSelect}
            style={{
                flex: '1 1 0',
                minWidth: 140,
                padding: 'var(--space-md)',
                borderRadius: 'var(--radius-md)',
                border: `2px solid ${selected ? 'var(--color-primary)' : 'var(--color-border-light)'}`,
                background: selected ? 'var(--color-primary-lighter)' : 'var(--color-bg-primary)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all var(--transition-base)',
            }}
        >
            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>{label}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: 2 }}>{desc}</div>
        </button>
    )
}

export default UploadPage
