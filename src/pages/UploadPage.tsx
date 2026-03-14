import { useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, X, ArrowLeft, Loader2, FileText, Table } from 'lucide-react'
import Logo from '../components/ui/Logo'
import { useToast } from '../components/ui/Toast'
import { useSyncedUser, useLeadMutations } from '../hooks'
import { parseCSV, validateFile, readFileAsText, type ParseResult } from '../lib/csvParser'
import { scoreLead } from '../lib/leadScoring'
import './UploadPage.css'

type UploadStep = 'upload' | 'preview' | 'importing' | 'complete'

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
            // Score each lead before importing using ICP preferences
            const scoredLeads = parseResult.leads.map(lead => {
                const scoreResult = scoreLead({
                    title: lead.title,
                    targetTitles: syncedUser.preferences?.targetTitles,
                    targetIndustries: syncedUser.preferences?.targetIndustries,
                    targetCompanySize: syncedUser.preferences?.targetCompanySize,
                })
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
                        score: l.score,
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
        if (name.endsWith('.xlsx') || name.endsWith('.xls')) return <FileSpreadsheet size={24} />
        return <Table size={24} />
    }

    return (
        <div className="upload-page">
            <header className="upload-header">
                <div className="upload-header-left">
                    <Link to="/dashboard" className="upload-logo">
                        <Logo />
                        <span>LeadFlow AI</span>
                    </Link>
                </div>
                <div className="upload-header-right">
                    <Link to="/dashboard" className="btn btn-text">
                        <ArrowLeft size={16} />
                        Back to Dashboard
                    </Link>
                </div>
            </header>

            <main className="upload-main">
                <div className="upload-container">
                    {/* Step indicator */}
                    <div className="step-indicator">
                        <div className={`step-item ${step === 'upload' ? 'active' : 'done'}`}>
                            <div className="step-circle">1</div>
                            <span>Upload</span>
                        </div>
                        <div className="step-line"></div>
                        <div className={`step-item ${step === 'preview' ? 'active' : step === 'importing' || step === 'complete' ? 'done' : ''}`}>
                            <div className="step-circle">2</div>
                            <span>Preview</span>
                        </div>
                        <div className="step-line"></div>
                        <div className={`step-item ${step === 'complete' ? 'active done' : ''}`}>
                            <div className="step-circle">3</div>
                            <span>Import</span>
                        </div>
                    </div>

                    {/* Upload Step */}
                    {step === 'upload' && (
                        <div className="upload-content">
                            <div className="upload-intro">
                                <h1>Import Your Leads</h1>
                                <p>Upload a CSV file with your leads. We'll auto-detect columns and score each lead with AI.</p>
                            </div>

                            <div
                                className={`dropzone ${isDragging ? 'active' : ''}`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="dropzone-content">
                                    <div className="dropzone-icon">
                                        <Upload size={48} />
                                    </div>
                                    <h3>Drop your file here</h3>
                                    <p>or click to browse</p>
                                    <span className="supported-formats">Supports: CSV, TSV, TXT — Max 10MB</span>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".csv,.txt,.tsv"
                                    onChange={handleFileInput}
                                    className="file-input"
                                />
                            </div>

                            <div className="upload-options">
                                <div className="option-divider"><span>or</span></div>
                                <div className="option-cards">
                                    <button className="option-card" disabled>
                                        <div className="option-icon">📊</div>
                                        <h4>Connect Google Sheets</h4>
                                        <p>Sync directly from your spreadsheet</p>
                                        <span className="coming-soon">Coming Soon</span>
                                    </button>
                                    <a href="/template.csv" download className="option-card">
                                        <div className="option-icon">📥</div>
                                        <h4>Download Template</h4>
                                        <p>Get our CSV template with required columns</p>
                                    </a>
                                </div>
                            </div>

                            <div className="column-info">
                                <h3>Expected Columns</h3>
                                <div className="column-list">
                                    <span className="column-tag required">First Name</span>
                                    <span className="column-tag required">Last Name</span>
                                    <span className="column-tag required">Company</span>
                                    <span className="column-tag required">Title</span>
                                    <span className="column-tag required">LinkedIn URL</span>
                                    <span className="column-tag optional">Email (optional)</span>
                                </div>
                                <p className="format-note">Column names are flexible — we auto-match "First Name", "firstname", "Name", etc.</p>
                            </div>
                        </div>
                    )}

                    {/* Preview Step */}
                    {step === 'preview' && parseResult && (
                        <div className="preview-content">
                            <div className="preview-header">
                                <div>
                                    <h1>Preview Import</h1>
                                    <p className="upload-subtitle">
                                        {file && getFileIcon(file.name)}
                                        {file?.name} — {formatFileSize(file?.size || 0)} — {parseResult.leads.length} leads found
                                    </p>
                                </div>
                                <button className="btn btn-text" onClick={handleReset}>
                                    <X size={16} /> Cancel
                                </button>
                            </div>

                            {/* Stats */}
                            <div className="preview-stats">
                                <div className="preview-stat success">
                                    <CheckCircle2 size={20} />
                                    <span>{parseResult.leads.length} valid leads</span>
                                </div>
                                {parseResult.skippedRows > 0 && (
                                    <div className="preview-stat warning">
                                        <AlertCircle size={20} />
                                        <span>{parseResult.skippedRows} rows skipped</span>
                                    </div>
                                )}
                                {parseResult.errors.length > 0 && (
                                    <div className="preview-stat error">
                                        <AlertCircle size={20} />
                                        <span>{parseResult.errors.length} warnings</span>
                                    </div>
                                )}
                            </div>

                            {/* Preview table */}
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
                            <div className="preview-actions">
                                <button className="btn btn-text" onClick={handleReset}>
                                    Choose Different File
                                </button>
                                <button
                                    className="btn btn-primary btn-lg"
                                    onClick={syncedUser.convexId ? handleImport : handleDemoImport}
                                >
                                    Import {parseResult.leads.length} Leads
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Importing Step */}
                    {step === 'importing' && (
                        <div className="importing-content">
                            <Loader2 size={48} className="spin-icon" />
                            <h2>Importing Leads...</h2>
                            <p>Scoring and importing your leads into LeadFlow AI</p>
                            <div className="progress-bar">
                                <div className="progress-fill" style={{ width: `${importProgress}%` }}></div>
                            </div>
                            <span className="progress-text">{importProgress}%</span>
                        </div>
                    )}

                    {/* Complete Step */}
                    {step === 'complete' && importResult && (
                        <div className="complete-content">
                            <div className="complete-icon">
                                <CheckCircle2 size={64} />
                            </div>
                            <h2>Import Complete!</h2>
                            <p>{importResult.imported} leads imported and scored successfully</p>
                            {importResult.skipped > 0 && (
                                <p className="skipped-note">{importResult.skipped} duplicates skipped</p>
                            )}
                            <div className="complete-actions">
                                <Link to="/dashboard/leads" className="btn btn-primary btn-lg">
                                    View Leads →
                                </Link>
                                <button className="btn btn-secondary" onClick={handleReset}>
                                    Import More
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

export default UploadPage
