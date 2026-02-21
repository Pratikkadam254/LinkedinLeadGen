import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { UserButton } from '@clerk/clerk-react'
import Logo from '../components/ui/Logo'
import { Sparkles, ArrowRight, Check, FileText } from 'lucide-react'
import './StrategyPage.css'

export default function StrategyPage() {
    const strategies = useQuery(api.strategies.list)
    const createStrategy = useMutation(api.strategies.create)
    const generateICP = useAction(api.actions.strategy.generateICP)
    const generateOffer = useAction(api.actions.strategy.generateOffer)

    const [isCreating, setIsCreating] = useState(false)
    const [step, setStep] = useState(1)

    // Form State
    const [businessDesc, setBusinessDesc] = useState('')
    const [audienceHints, setAudienceHints] = useState('')
    const [primaryOffer, setPrimaryOffer] = useState('')
    const [strategyName, setStrategyName] = useState('')

    // AI State
    const [isGenerating, setIsGenerating] = useState(false)
    const [generatedICP, setGeneratedICP] = useState('')
    const [generatedOffer, setGeneratedOffer] = useState('')

    const activeStrategy = strategies?.[0] // For now, just take the first one

    // Steps
    // 1. Inputs
    // 2. Generating ICP... -> Review ICP
    // 3. Generating Offer... -> Review Offer
    // 4. Finalize

    const handleGenerateICP = async () => {
        setIsGenerating(true)
        try {
            const result = await generateICP({
                businessDescription: businessDesc,
                targetAudienceHints: audienceHints
            })
            setGeneratedICP(result)
            setStep(2)
        } catch (e) {
            console.error(e)
            alert("Failed to generate ICP")
        } finally {
            setIsGenerating(false)
        }
    }

    const handleGenerateOffer = async () => {
        setIsGenerating(true)
        try {
            const result = await generateOffer({
                businessDescription: businessDesc,
                icpDocument: generatedICP,
                primaryOffer: primaryOffer
            })
            setGeneratedOffer(result)
            setStep(3)
        } catch (e) {
            console.error(e)
            alert("Failed to generate Offer")
        } finally {
            setIsGenerating(false)
        }
    }

    const handleSaveStrategy = async () => {
        setIsGenerating(true)
        try {
            await createStrategy({
                name: strategyName || "New Strategy",
                rawInputs: {
                    businessDescription: businessDesc,
                    targetAudienceHints: audienceHints,
                    primaryOffer: primaryOffer
                },
                icpDocument: generatedICP,
                offerDocument: generatedOffer
            })
            setIsCreating(false)
            setStep(1)
        } catch (e) {
            console.error(e)
            alert("Failed to save strategy")
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <div className="strategy-page">
            <header className="dashboard-header">
                <div className="dashboard-header-left">
                    <Link to="/dashboard" className="dashboard-logo">
                        <Logo />
                        <span>LeadFlow AI</span>
                    </Link>
                </div>
                <nav className="dashboard-nav">
                    <Link to="/dashboard" className="nav-link">Dashboard</Link>
                    <Link to="/dashboard/leads" className="nav-link">Leads</Link>
                    <Link to="/dashboard/strategy" className="nav-link active">Strategy</Link>
                    <Link to="/dashboard/connect" className="nav-link">Connect</Link>
                </nav>
                <div className="dashboard-header-right">
                    <UserButton afterSignOutUrl="/" />
                </div>
            </header>

            <main className="dashboard-main">
                <div className="container">
                    {!isCreating && !activeStrategy && (
                        <div className="empty-strategy-state">
                            <h1>Strategy Center</h1>
                            <p>Define your Ideal Customer Profile (ICP) and Irresistible Offer using AI.</p>
                            <button className="btn btn-primary" onClick={() => setIsCreating(true)}>
                                <Sparkles size={18} />
                                Create New Strategy
                            </button>
                        </div>
                    )}

                    {!isCreating && activeStrategy && (
                        <div className="strategy-view">
                            <div className="strategy-header">
                                <h1>{activeStrategy.name}</h1>
                                <span className="status-badge active">Active</span>
                            </div>

                            <div className="strategy-grid">
                                <div className="strategy-card">
                                    <h2><FileText size={18} /> Ideal Customer Profile (ICP)</h2>
                                    <div className="markdown-preview">
                                        <pre>{activeStrategy.icpDocument}</pre>
                                    </div>
                                </div>
                                <div className="strategy-card">
                                    <h2><Sparkles size={18} /> Grand Slam Offer</h2>
                                    <div className="markdown-preview">
                                        <pre>{activeStrategy.offerDocument}</pre>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {isCreating && (
                        <div className="wizard-container">
                            <div className="wizard-steps">
                                <div className={`step ${step >= 1 ? 'active' : ''}`}>1. Inputs</div>
                                <div className={`step ${step >= 2 ? 'active' : ''}`}>2. ICP</div>
                                <div className={`step ${step >= 3 ? 'active' : ''}`}>3. Offer</div>
                            </div>

                            {step === 1 && (
                                <div className="wizard-content">
                                    <h2>Let's understand your business</h2>

                                    <div className="form-group">
                                        <label>Strategy Name</label>
                                        <input
                                            value={strategyName}
                                            onChange={e => setStrategyName(e.target.value)}
                                            placeholder="e.g. Q1 Marketing Push"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>What do you sell?</label>
                                        <textarea
                                            value={businessDesc}
                                            onChange={e => setBusinessDesc(e.target.value)}
                                            placeholder="We provide SEO services for Dentists..."
                                            rows={3}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Who is your target audience? (Hints)</label>
                                        <textarea
                                            value={audienceHints}
                                            onChange={e => setAudienceHints(e.target.value)}
                                            placeholder="Private practice owners in the US, making $1M+..."
                                            rows={2}
                                        />
                                    </div>

                                    <button
                                        className="btn btn-primary"
                                        onClick={handleGenerateICP}
                                        disabled={isGenerating || !businessDesc}
                                    >
                                        {isGenerating ? 'Generating...' : 'Next: Generate ICP'} <ArrowRight size={16} />
                                    </button>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="wizard-content">
                                    <h2>Review your AI Generated ICP</h2>
                                    <textarea
                                        className="generated-preview"
                                        value={generatedICP}
                                        onChange={e => setGeneratedICP(e.target.value)}
                                        rows={15}
                                    />

                                    <div className="form-group">
                                        <label>What is your primary offer for them?</label>
                                        <input
                                            value={primaryOffer}
                                            onChange={e => setPrimaryOffer(e.target.value)}
                                            placeholder="e.g. 30 New Patients in 30 Days or you don't pay"
                                        />
                                    </div>

                                    <button
                                        className="btn btn-primary"
                                        onClick={handleGenerateOffer}
                                        disabled={isGenerating || !primaryOffer}
                                    >
                                        {isGenerating ? 'Generating...' : 'Next: Refine Offer'} <ArrowRight size={16} />
                                    </button>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="wizard-content">
                                    <h2>Review your Grand Slam Offer</h2>
                                    <textarea
                                        className="generated-preview"
                                        value={generatedOffer}
                                        onChange={e => setGeneratedOffer(e.target.value)}
                                        rows={15}
                                    />

                                    <button
                                        className="btn btn-success"
                                        onClick={handleSaveStrategy}
                                        disabled={isGenerating}
                                    >
                                        <Check size={16} /> Save Strategy
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

// Helper for Action hook since it might not be exported from convex/react directly in some versions
import { useAction } from 'convex/react'
