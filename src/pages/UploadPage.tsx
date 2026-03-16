import { useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { UploadSimple, FileXls, CheckCircle, X, SpinnerGap, FileText, Table, Check, CaretRight } from '@phosphor-icons/react'
import { useToast } from '../components/ui/Toast'
import { useSyncedUser, useLeadMutations } from '../hooks'
import { parseCSV, validateFile, readFileAsText, type ParseResult } from '../lib/csvParser'
import { scoreLead } from '../lib/leadScoring'
import PageHeader from '../components/layout/PageHeader'
import Card from '../components/ui/Card'
import StatusBadge from '../components/ui/StatusBadge'
import './UploadPage.css'

type UploadStep = 'upload' | 'preview' | 'importing' | 'complete'

const STEPS = [
    { key: 'upload', label: 'Upload', number: 1 },
    { key: 'preview', label: 'Preview', number: 2 },
    { key: 'complete', label: 'Import', number: 3 },
] as const

function getStepState(stepKey: string, currentStep: UploadStep) {
    const order = ['upload', 'preview', 'importing', 'complete']
    const currentIdx = order.indexOf(currentStep)
    const stepIdx = stepKey === 'complete' ? 3 : order.indexOf(stepKey)
    if (currentIdx > stepIdx) return 'completed'
    if (currentIdx === stepIdx || (stepKey === 'complete' && currentStep === 'importing')) return 'active'
    return 'pending'
}

function UploadPage() {
    const [step, setStep] = useState<UploadStep>('upload')
    const [file, setFile] = useState<File | null>(null)
    const [parseResult, setParseResult] = useState<ParseResult | null>(null)
    const [importProgress, setImportProgress] = useState(0)
    const [importResult, setImportResult] = useState<{ imported: number; skipped: number } | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { showToast } = useToast()

    const syncedUser = useSyncedUser()
    const { bulkCreateLeads } = useLeadMutations()

    // Handle file selection
    const handleFile = useCallback(async (selectedFile: File) => {
        const validation = validateFile(selectedFile)
        if (!validation.valid) {
            showToast('error', validation.error || 'Invalid file')
            return
        }

        setFile(selectedFile)

        try {
            const text = await readFileAsText(selectedFile)
            const result = parseCSV(text)

            if (result.leads.length === 0) {
                showToast('error', 'No valid leads found in file. Check column headers.')
                return
            }

            setParseResult(result)
            setStep('preview')
            showToast('success', `Found ${result.leads.length} leads in ${selectedFile.name}`)
        } catch {
            showToast('error', 'Failed to parse CSV file')
        }
    }, [showToast])

    // Drag & drop handlers
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

    // Import leads to Convex
    const handleImport = async () => {
        if (!parseResult || !syncedUser.convexId) {
            showToast('error', 'Please sign in to import leads')
            return
        }

        setStep('importing')
        setImportProgress(0)

        try {
            // Score each lead before importing
            const scoredLeads = parseResult.leads.map(lead => {
                const scoreResult = scoreLead({ title: lead.title })
                return { ...lead, score: scoreResult.score }
            })

            // Batch import
            const batchSize = 50
            let totalImported = 0
            let totalSkipped = 0

            for (let i = 0; i < scoredLeads.length; i += batchSize) {
                const batch = scoredLeads.slice(i, i + batchSize)

                const result = await bulkCreateLeads({
                    userId: syncedUser.convexId,
                    leads: batch.map(l => ({
                        firstName: l.firstName,
                        lastName: l.lastName,
                        company: l.company,
                        title: l.title,
                        linkedInUrl: l.linkedInUrl,
                        email: l.email,
                    })),
                    source: 'csv',
                })

                totalImported += result.imported
                totalSkipped += result.skipped
                setImportProgress(Math.round(((i + batch.length) / scoredLeads.length) * 100))
            }

            setImportResult({ imported: totalImported, skipped: totalSkipped })
            setStep('complete')
            showToast('success', `Successfully imported ${totalImported} leads!`)
        } catch (error) {
            console.error('Import failed:', error)
            showToast('error', 'Failed to import leads. Please try again.')
            setStep('preview')
        }
    }

    // Demo import (when not signed in)
    const handleDemoImport = () => {
        if (!parseResult) return

        setStep('importing')
        let progress = 0
        const interval = setInterval(() => {
            progress += 15
            setImportProgress(Math.min(progress, 100))
            if (progress >= 100) {
                clearInterval(interval)
                setImportResult({ imported: parseResult.leads.length, skipped: parseResult.skippedRows })
                setStep('complete')
                showToast('success', `Demo: ${parseResult.leads.length} leads ready!`)
            }
        }, 300)
    }

    const handleReset = () => {
        setFile(null)
        setParseResult(null)
        setStep('upload')
        setImportProgress(0)
        setImportResult(null)
    }

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B'
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    }

    const getFileIcon = (name: string) => {
        if (name.endsWith('.csv')) return <FileText size={24} />
        if (name.endsWith('.xlsx') || name.endsWith('.xls')) return <FileXls size={24} />
        return <Table size={24} />
    }

    return (
        <div className="upload-page">
            <PageHeader
                title="Import Leads"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Import' },
                ]}
            />

            <div className="upload-body">
                <div className="upload-container">
                    {/* Step indicator */}
                    <div className="step-indicator">
                        {STEPS.map((s, idx) => {
                            const state = getStepState(s.key, step)
                            return (
                                <div className="step-indicator__group" key={s.key}>
                                    {idx > 0 && (
                                        <div className={`step-line step-line--${state === 'pending' ? 'pending' : 'completed'}`} />
                                    )}
                                    <div className="step-item-wrapper">
                                        <div className={`step-circle step-circle--${state}`}>
                                            {state === 'completed' ? <Check size={16} /> : s.number}
                                        </div>
                                        <span className={`step-label step-label--${state}`}>{s.label}</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Upload Step */}
                    {step === 'upload' && (
                        <div className="upload-content animate-fade-in-up">
                            <Card variant="default" padding="lg">
                                <div
                                    className={`dropzone ${isDragging ? 'dropzone--active' : ''}`}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <div className="dropzone__icon">
                                        <UploadSimple size={48} weight="duotone" />
                                    </div>
                                    <h3 className="dropzone__title">Drop your file here</h3>
                                    <p className="dropzone__subtitle">or click to browse</p>
                                    <button
                                        type="button"
                                        className="btn btn-secondary btn-pill dropzone__browse-btn"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            fileInputRef.current?.click()
                                        }}
                                    >
                                        Choose File
                                    </button>
                                    <span className="dropzone__formats">Supports: CSV, TSV, TXT — Max 10MB</span>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".csv,.txt,.tsv"
                                    onChange={handleFileInput}
                                    className="file-input"
                                />
                            </Card>

                            <div className="upload-column-info">
                                <h3>Expected Columns</h3>
                                <div className="column-list">
                                    <span className="column-tag column-tag--required">First Name</span>
                                    <span className="column-tag column-tag--required">Last Name</span>
                                    <span className="column-tag column-tag--required">Company</span>
                                    <span className="column-tag column-tag--required">Title</span>
                                    <span className="column-tag column-tag--required">LinkedIn URL</span>
                                    <span className="column-tag column-tag--optional">Email (optional)</span>
                                </div>
                                <p className="format-note">Column names are flexible — we auto-match "First Name", "firstname", "Name", etc.</p>
                            </div>
                        </div>
                    )}

                    {/* Preview Step */}
                    {step === 'preview' && parseResult && (
                        <div className="preview-content animate-fade-in-up">
                            <div className="preview-header">
                                <div className="preview-header__info">
                                    <div className="preview-file-info">
                                        {file && getFileIcon(file.name)}
                                        <span>{file?.name} — {formatFileSize(file?.size || 0)}</span>
                                    </div>
                                </div>
                                <button className="btn btn-text btn-sm" onClick={handleReset}>
                                    <X size={16} /> Cancel
                                </button>
                            </div>

                            {/* Stats */}
                            <div className="preview-stats">
                                <StatusBadge status="success" label={`${parseResult.leads.length} valid leads`} />
                                {parseResult.skippedRows > 0 && (
                                    <StatusBadge status="warning" label={`${parseResult.skippedRows} rows skipped`} />
                                )}
                                {parseResult.errors.length > 0 && (
                                    <StatusBadge status="error" label={`${parseResult.errors.length} warnings`} />
                                )}
                            </div>

                            {/* Preview table */}
                            <Card variant="default" padding="none">
                                <div className="preview-table-wrapper">
                                    <table className="preview-table">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Name</th>
                                                <th>Company</th>
                                                <th>Title</th>
                                                <th>LinkedIn</th>
                                                <th>Email</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {parseResult.leads.slice(0, 20).map((lead, idx) => (
                                                <tr key={idx}>
                                                    <td className="row-num">{idx + 1}</td>
                                                    <td>{lead.firstName} {lead.lastName}</td>
                                                    <td>{lead.company}</td>
                                                    <td>{lead.title}</td>
                                                    <td className="url-cell">{lead.linkedInUrl ? '✓' : '—'}</td>
                                                    <td className="url-cell">{lead.email || '—'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {parseResult.leads.length > 20 && (
                                        <p className="more-rows">...and {parseResult.leads.length - 20} more leads</p>
                                    )}
                                </div>
                            </Card>

                            {/* Errors */}
                            {parseResult.errors.length > 0 && (
                                <details className="errors-panel">
                                    <summary>View {parseResult.errors.length} warnings</summary>
                                    <ul>
                                        {parseResult.errors.slice(0, 10).map((err, idx) => (
                                            <li key={idx}>Row {err.row}: {err.message} ({err.field})</li>
                                        ))}
                                    </ul>
                                </details>
                            )}

                            {/* Import button */}
                            <button
                                className="btn btn-primary btn-lg btn-import-full"
                                onClick={syncedUser.convexId ? handleImport : handleDemoImport}
                            >
                                Import {parseResult.leads.length} Leads
                                <CaretRight size={18} />
                            </button>

                            <div className="preview-secondary-action">
                                <button className="btn btn-text" onClick={handleReset}>
                                    Choose Different File
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Importing Step */}
                    {step === 'importing' && (
                        <div className="importing-content animate-fade-in-up">
                            <Card variant="default" padding="lg">
                                <div className="importing-inner">
                                    <SpinnerGap size={48} className="spin-icon" />
                                    <h2>Importing Leads...</h2>
                                    <p>Scoring and importing your leads into LeadFlow AI</p>
                                    <div className="progress-bar">
                                        <div className="progress-fill" style={{ width: `${importProgress}%` }}></div>
                                    </div>
                                    <span className="progress-text">{importProgress}%</span>
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* Complete Step */}
                    {step === 'complete' && importResult && (
                        <div className="complete-content animate-fade-in-up">
                            <Card variant="default" padding="lg">
                                <div className="complete-inner">
                                    <div className="complete-icon">
                                        <CheckCircle size={48} weight="duotone" />
                                    </div>
                                    <h2>Import Complete!</h2>
                                    <p>{importResult.imported} leads imported and scored successfully</p>
                                    {importResult.skipped > 0 && (
                                        <p className="skipped-note">{importResult.skipped} duplicates skipped</p>
                                    )}
                                    <div className="complete-actions">
                                        <Link to="/dashboard/leads" className="btn btn-primary btn-lg btn-pill">
                                            View Leads
                                            <CaretRight size={18} />
                                        </Link>
                                        <button className="btn btn-secondary btn-pill" onClick={handleReset}>
                                            Import More
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default UploadPage
