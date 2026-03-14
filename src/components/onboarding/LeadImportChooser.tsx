import { useState } from 'react'
import { Link2, Search, FileUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import LinkedInUrlInput from './LinkedInUrlInput'
import LinkedInSearchForm from './LinkedInSearchForm'
import './LeadImportChooser.css'

type ImportMethod = 'urls' | 'search' | 'csv' | null

function LeadImportChooser() {
    const [method, setMethod] = useState<ImportMethod>(null)
    const navigate = useNavigate()

    const handleSkip = () => {
        navigate('/dashboard')
    }

    return (
        <div className="import-chooser">
            <h2 className="import-chooser-title">Add your first leads</h2>
            <p className="import-chooser-subtitle">
                Choose how you'd like to import prospects. You can always add more later.
            </p>

            {!method && (
                <div className="import-methods">
                    <button className="import-method-card" onClick={() => setMethod('urls')}>
                        <Link2 size={28} />
                        <h3>Paste LinkedIn URLs</h3>
                        <p>Drop 1–5 profile URLs and we'll pull the details</p>
                    </button>

                    <button className="import-method-card" onClick={() => setMethod('search')}>
                        <Search size={28} />
                        <h3>Search by Criteria</h3>
                        <p>Describe your ideal prospect and we'll find matches</p>
                    </button>

                    <button className="import-method-card" onClick={() => navigate('/dashboard/upload')}>
                        <FileUp size={28} />
                        <h3>Upload CSV</h3>
                        <p>Import a spreadsheet of prospects you already have</p>
                    </button>
                </div>
            )}

            {method === 'urls' && (
                <LinkedInUrlInput onBack={() => setMethod(null)} />
            )}

            {method === 'search' && (
                <LinkedInSearchForm onBack={() => setMethod(null)} />
            )}

            <button className="import-skip-btn" onClick={handleSkip}>
                Skip for now — I'll add leads later
            </button>
        </div>
    )
}

export default LeadImportChooser
