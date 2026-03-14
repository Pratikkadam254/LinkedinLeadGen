import { useState } from 'react'
import { ArrowLeft, Search, Loader2, CheckCircle2 } from 'lucide-react'
import { unipileService } from '../../lib/unipile'
import './LinkedInSearchForm.css'

interface LinkedInSearchFormProps {
    onBack: () => void
}

function LinkedInSearchForm({ onBack }: LinkedInSearchFormProps) {
    const [title, setTitle] = useState('')
    const [industry, setIndustry] = useState('')
    const [location, setLocation] = useState('')
    const [loading, setLoading] = useState(false)
    const [resultCount, setResultCount] = useState<number | null>(null)

    const canSearch = title.trim().length > 0 || industry.trim().length > 0

    const handleSearch = async () => {
        if (!canSearch) return
        setLoading(true)
        try {
            const results = await unipileService.searchProfiles({
                title: title.trim(),
                industry: industry.trim(),
                location: location.trim(),
            })
            setResultCount(results.data?.length ?? 0)
        } catch {
            setResultCount(0)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="search-form-container">
            <button className="search-back-btn" onClick={onBack}>
                <ArrowLeft size={16} /> Back to options
            </button>

            <h3 className="search-form-title">Search for Prospects</h3>
            <p className="search-form-desc">Describe your ideal prospect and we'll find matches on LinkedIn.</p>

            <div className="search-form-fields">
                <div className="search-field">
                    <label>Job Title</label>
                    <input
                        type="text"
                        placeholder="e.g. Marketing Director"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                    />
                </div>
                <div className="search-field">
                    <label>Industry</label>
                    <input
                        type="text"
                        placeholder="e.g. SaaS, Healthcare"
                        value={industry}
                        onChange={e => setIndustry(e.target.value)}
                    />
                </div>
                <div className="search-field">
                    <label>Location (optional)</label>
                    <input
                        type="text"
                        placeholder="e.g. New York, Remote"
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                    />
                </div>
            </div>

            {resultCount !== null ? (
                <div className="search-success">
                    <CheckCircle2 size={20} />
                    <span>Found and imported {resultCount} matching prospects!</span>
                </div>
            ) : (
                <button
                    className="search-submit-btn"
                    onClick={handleSearch}
                    disabled={!canSearch || loading}
                >
                    {loading ? (
                        <><Loader2 size={16} className="spinning" /> Searching LinkedIn...</>
                    ) : (
                        <><Search size={16} /> Find Prospects</>
                    )}
                </button>
            )}
        </div>
    )
}

export default LinkedInSearchForm
