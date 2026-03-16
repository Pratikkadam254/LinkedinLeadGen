import { useState, useCallback } from 'react'
import { Sparkle, ArrowsClockwise, Copy, Check, PaperPlaneTilt, CaretDown } from '@phosphor-icons/react'
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

const TONE_OPTIONS: { value: MessageTone; label: string }[] = [
    { value: 'professional', label: 'Professional' },
    { value: 'friendly', label: 'Friendly' },
    { value: 'casual', label: 'Casual' },
    { value: 'bold', label: 'Bold' },
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
                    <Sparkle size={18} />
                    <h3>AI Message Generator</h3>
                </div>
                <button
                    className="options-toggle"
                    onClick={() => setShowOptions(!showOptions)}
                >
                    Options <CaretDown size={14} className={showOptions ? 'rotated' : ''} />
                </button>
            </div>

            {/* Options Panel */}
            {showOptions && (
                <div className="ai-gen-options">
                    <div className="option-group">
                        <label>Tone</label>
                        <div className="tone-pill-group">
                            {TONE_OPTIONS.map(opt => (
                                <button
                                    key={opt.value}
                                    className={`tone-pill ${tone === opt.value ? 'active' : ''}`}
                                    onClick={() => setTone(opt.value)}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="option-toggles">
                        <label className="toggle-switch-label">
                            <span>Include compliment</span>
                            <div className={`toggle-switch ${includeCompliment ? 'active' : ''}`}
                                onClick={() => setIncludeCompliment(!includeCompliment)}>
                                <div className="toggle-switch-handle" />
                            </div>
                        </label>
                        <label className="toggle-switch-label">
                            <span>End with question</span>
                            <div className={`toggle-switch ${includeQuestion ? 'active' : ''}`}
                                onClick={() => setIncludeQuestion(!includeQuestion)}>
                                <div className="toggle-switch-handle" />
                            </div>
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
                            <ArrowsClockwise size={16} className="spin-icon" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <Sparkle size={16} />
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
                                {generatedMessage.personalizationScore}/10 personalization
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
                        <p className="limit-warning">LinkedIn connection requests are limited to 300 characters</p>
                    )}

                    <div className="message-actions">
                        <button
                            className="btn btn-text action-icon-btn"
                            onClick={handleRegenerate}
                            disabled={isGenerating}
                            title="Regenerate"
                        >
                            <ArrowsClockwise size={16} className={isGenerating ? 'spin-icon' : ''} />
                        </button>

                        <div className="action-group">
                            <button className="btn btn-text action-icon-btn" onClick={handleCopy} title="Copy">
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                            </button>
                            {onSend && (
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={handleSend}
                                    disabled={isOverLimit || !editedMessage}
                                >
                                    <PaperPlaneTilt size={14} />
                                    Send
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
