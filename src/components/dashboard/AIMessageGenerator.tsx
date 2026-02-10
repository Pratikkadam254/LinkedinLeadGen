import { useState, useCallback } from 'react'
import { Sparkles, RefreshCw, Copy, Check, Send, ChevronDown } from 'lucide-react'
import { aiMessageService, type MessageTone, type GeneratedMessage, type LeadContext, type UserContext } from '../../lib/aiMessages'
import { useToast } from '../ui/Toast'
import './AIMessageGenerator.css'

interface AIMessageGeneratorProps {
    lead: {
        firstName: string
        lastName: string
        company: string
        title: string
        linkedInUrl: string
        score: number
        postContent?: string
    }
    user?: {
        firstName?: string
        lastName?: string
        company?: string
        title?: string
    }
    onSend?: (message: string) => void
}

const TONE_OPTIONS: { value: MessageTone; label: string; emoji: string }[] = [
    { value: 'professional', label: 'Professional', emoji: '💼' },
    { value: 'friendly', label: 'Friendly', emoji: '😊' },
    { value: 'casual', label: 'Casual', emoji: '☕' },
    { value: 'bold', label: 'Bold', emoji: '🔥' },
]

function AIMessageGenerator({ lead, user, onSend }: AIMessageGeneratorProps) {
    const [tone, setTone] = useState<MessageTone>('professional')
    const [includeCompliment, setIncludeCompliment] = useState(true)
    const [includeQuestion, setIncludeQuestion] = useState(true)
    const [isGenerating, setIsGenerating] = useState(false)
    const [generatedMessage, setGeneratedMessage] = useState<GeneratedMessage | null>(null)
    const [editedMessage, setEditedMessage] = useState('')
    const [copied, setCopied] = useState(false)
    const [showOptions, setShowOptions] = useState(false)
    const { showToast } = useToast()

    // Initialize AI service if not already done
    if (!aiMessageService.isConfigured()) {
        aiMessageService.initialize()
    }

    const scoreTier = lead.score >= 75 ? 'hot' : lead.score >= 50 ? 'warm' : 'cold'

    const getLeadContext = (): LeadContext => ({
        firstName: lead.firstName,
        lastName: lead.lastName,
        company: lead.company,
        title: lead.title,
        linkedInUrl: lead.linkedInUrl,
        score: lead.score,
        scoreTier,
        postContent: lead.postContent,
    })

    const getUserContext = (): UserContext => ({
        firstName: user?.firstName,
        lastName: user?.lastName,
        company: user?.company,
        title: user?.title,
    })

    const handleGenerate = useCallback(async () => {
        setIsGenerating(true)
        try {
            const result = await aiMessageService.generateMessage({
                lead: getLeadContext(),
                user: getUserContext(),
                tone,
                includeCompliment,
                includeQuestion,
            })
            setGeneratedMessage(result)
            setEditedMessage(result.message)
        } catch (error) {
            console.error('Generation failed:', error)
            showToast('error', 'Failed to generate message. Try again.')
        } finally {
            setIsGenerating(false)
        }
    }, [tone, includeCompliment, includeQuestion, lead, user])

    const handleRegenerate = useCallback(async () => {
        if (!generatedMessage) return
        setIsGenerating(true)
        try {
            const result = await aiMessageService.regenerateMessage(
                {
                    lead: getLeadContext(),
                    user: getUserContext(),
                    tone,
                    includeCompliment,
                    includeQuestion,
                },
                generatedMessage.message
            )
            setGeneratedMessage(result)
            setEditedMessage(result.message)
        } catch (error) {
            console.error('Regeneration failed:', error)
            showToast('error', 'Failed to regenerate. Try again.')
        } finally {
            setIsGenerating(false)
        }
    }, [generatedMessage, tone, includeCompliment, includeQuestion, lead, user])

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(editedMessage)
            setCopied(true)
            showToast('success', 'Message copied to clipboard')
            setTimeout(() => setCopied(false), 2000)
        } catch {
            showToast('error', 'Failed to copy')
        }
    }

    const handleSend = () => {
        if (onSend && editedMessage) {
            onSend(editedMessage)
            showToast('success', `Connection request sent to ${lead.firstName}`)
        }
    }

    const charCount = editedMessage.length
    const isOverLimit = charCount > 300

    return (
        <div className="ai-message-gen">
            <div className="ai-gen-header">
                <div className="ai-gen-title">
                    <Sparkles size={18} />
                    <h3>AI Message Generator</h3>
                </div>
                <button
                    className="options-toggle"
                    onClick={() => setShowOptions(!showOptions)}
                >
                    Options <ChevronDown size={14} className={showOptions ? 'rotated' : ''} />
                </button>
            </div>

            {/* Options Panel */}
            {showOptions && (
                <div className="ai-gen-options">
                    <div className="option-group">
                        <label>Tone</label>
                        <div className="tone-selector">
                            {TONE_OPTIONS.map(opt => (
                                <button
                                    key={opt.value}
                                    className={`tone-btn ${tone === opt.value ? 'active' : ''}`}
                                    onClick={() => setTone(opt.value)}
                                >
                                    <span className="tone-emoji">{opt.emoji}</span>
                                    <span>{opt.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="option-toggles">
                        <label className="toggle-option">
                            <input
                                type="checkbox"
                                checked={includeCompliment}
                                onChange={(e) => setIncludeCompliment(e.target.checked)}
                            />
                            <span>Include compliment</span>
                        </label>
                        <label className="toggle-option">
                            <input
                                type="checkbox"
                                checked={includeQuestion}
                                onChange={(e) => setIncludeQuestion(e.target.checked)}
                            />
                            <span>End with question</span>
                        </label>
                    </div>
                </div>
            )}

            {/* Generate Button */}
            {!generatedMessage && (
                <button
                    className="btn btn-primary generate-btn"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                >
                    {isGenerating ? (
                        <>
                            <RefreshCw size={16} className="spin-icon" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <Sparkles size={16} />
                            Generate Message for {lead.firstName}
                        </>
                    )}
                </button>
            )}

            {/* Generated Message */}
            {generatedMessage && (
                <div className="generated-result">
                    <div className="message-meta">
                        <div className="meta-badges">
                            <span className={`score-badge p-${generatedMessage.personalizationScore >= 7 ? 'high' : generatedMessage.personalizationScore >= 4 ? 'mid' : 'low'}`}>
                                ✨ {generatedMessage.personalizationScore}/10 personalization
                            </span>
                            <span className="char-badge">{charCount}/300 chars</span>
                        </div>
                        {generatedMessage.hooks.length > 0 && (
                            <div className="hooks-list">
                                {generatedMessage.hooks.map((hook, idx) => (
                                    <span key={idx} className="hook-tag">{hook}</span>
                                ))}
                            </div>
                        )}
                    </div>

                    <textarea
                        className={`message-editor ${isOverLimit ? 'over-limit' : ''}`}
                        value={editedMessage}
                        onChange={(e) => setEditedMessage(e.target.value)}
                        rows={5}
                    />

                    {isOverLimit && (
                        <p className="limit-warning">⚠️ LinkedIn connection requests are limited to 300 characters</p>
                    )}

                    <div className="message-actions">
                        <button
                            className="btn btn-text"
                            onClick={handleRegenerate}
                            disabled={isGenerating}
                        >
                            <RefreshCw size={14} className={isGenerating ? 'spin-icon' : ''} />
                            Regenerate
                        </button>

                        <div className="action-group">
                            <button className="btn btn-secondary" onClick={handleCopy}>
                                {copied ? <Check size={14} /> : <Copy size={14} />}
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                            {onSend && (
                                <button
                                    className="btn btn-primary"
                                    onClick={handleSend}
                                    disabled={isOverLimit || !editedMessage}
                                >
                                    <Send size={14} />
                                    Send Request
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AIMessageGenerator
