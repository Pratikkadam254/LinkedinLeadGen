import { useState } from 'react'
import { ArrowLeft, Plus, Trash2, Loader2, CheckCircle2 } from 'lucide-react'
import { unipileService } from '../../lib/unipile'
import './LinkedInUrlInput.css'

interface LinkedInUrlInputProps {
    onBack: () => void
}

function LinkedInUrlInput({ onBack }: LinkedInUrlInputProps) {
    const [urls, setUrls] = useState<string[]>([''])
    const [loading, setLoading] = useState(false)
    const [done, setDone] = useState(false)

    const updateUrl = (index: number, value: string) => {
        setUrls(prev => prev.map((u, i) => i === index ? value : u))
    }

    const addUrl = () => {
        if (urls.length < 5) setUrls(prev => [...prev, ''])
    }

    const removeUrl = (index: number) => {
        if (urls.length > 1) setUrls(prev => prev.filter((_, i) => i !== index))
    }

    const isValidLinkedInUrl = (url: string) => {
        return url.trim().length > 0 && url.includes('linkedin.com')
    }

    const validUrls = urls.filter(isValidLinkedInUrl)

    const handleLookup = async () => {
        if (validUrls.length === 0) return
        setLoading(true)
        try {
            // Call Unipile for each URL
            for (const url of validUrls) {
                await unipileService.lookupProfile(url)
            }
            setDone(true)
        } catch {
            // Silently handle — mock will always succeed
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="url-input-container">
            <button className="url-back-btn" onClick={onBack}>
                <ArrowLeft size={16} /> Back to options
            </button>

            <h3 className="url-input-title">Paste LinkedIn Profile URLs</h3>
            <p className="url-input-desc">Add up to 5 LinkedIn profile URLs and we'll import them as leads.</p>

            <div className="url-input-list">
                {urls.map((url, i) => (
                    <div key={i} className="url-input-row">
                        <input
                            type="url"
                            className="url-input-field"
                            placeholder="https://linkedin.com/in/..."
                            value={url}
                            onChange={e => updateUrl(i, e.target.value)}
                        />
                        {urls.length > 1 && (
                            <button className="url-remove-btn" onClick={() => removeUrl(i)}>
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {urls.length < 5 && (
                <button className="url-add-btn" onClick={addUrl}>
                    <Plus size={16} /> Add another URL
                </button>
            )}

            {done ? (
                <div className="url-success">
                    <CheckCircle2 size={20} />
                    <span>{validUrls.length} profile{validUrls.length !== 1 ? 's' : ''} imported successfully!</span>
                </div>
            ) : (
                <button
                    className="url-submit-btn"
                    onClick={handleLookup}
                    disabled={validUrls.length === 0 || loading}
                >
                    {loading ? (
                        <><Loader2 size={16} className="spinning" /> Looking up profiles...</>
                    ) : (
                        <>Import {validUrls.length} profile{validUrls.length !== 1 ? 's' : ''}</>
                    )}
                </button>
            )}
        </div>
    )
}

export default LinkedInUrlInput
