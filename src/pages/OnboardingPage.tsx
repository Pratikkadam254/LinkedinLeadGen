import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle, LinkedinLogo, UploadSimple, CaretRight, SpinnerGap } from '@phosphor-icons/react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import Logo from '../components/ui/Logo'
import { useSyncedUser } from '../hooks/useSyncedUser'

function OnboardingPage() {
    const navigate = useNavigate()
    const { clerkId, unipileConnected } = useSyncedUser()
    const updateUnipile = useMutation(api.users.updateUnipileConnection)
    const completeOnboarding = useMutation(api.users.completeOnboarding)

    const [step, setStep] = useState<1 | 2>(1)
    const [connecting, setConnecting] = useState(false)
    const [linkedInDone, setLinkedInDone] = useState(unipileConnected)

    const handleConnectLinkedIn = async () => {
        if (!clerkId) return
        setConnecting(true)
        try {
            await updateUnipile({
                clerkId,
                unipileConnected: true,
                unipileAccountId: 'placeholder',
            })
            setLinkedInDone(true)
        } catch (err) {
            console.error('Failed to connect LinkedIn:', err)
        } finally {
            setConnecting(false)
        }
    }

    const handleFinish = async () => {
        if (!clerkId) return
        try {
            await completeOnboarding({ clerkId })
        } catch (err) {
            console.error('Failed to complete onboarding:', err)
        }
        navigate('/dashboard')
    }

    const handleSkip = async () => {
        if (!clerkId) return
        try {
            await completeOnboarding({ clerkId })
        } catch (err) {
            console.error('Failed to complete onboarding:', err)
        }
        navigate('/dashboard')
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--color-bg-secondary)',
            display: 'flex',
            flexDirection: 'column',
        }}>
            {/* Header */}
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 'var(--space-lg) var(--space-xl)',
                borderBottom: '1px solid var(--color-border-light)',
                background: 'var(--color-bg-primary)',
            }}>
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', fontWeight: 600, fontSize: '1rem', color: 'var(--color-text-primary)' }}>
                    <Logo />
                    <span>QuickConnect</span>
                </Link>
                <button onClick={handleSkip} className="btn btn-text">
                    Skip
                </button>
            </header>

            {/* Step indicator */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                padding: 'var(--space-xl) 0 0',
            }}>
                <span style={{
                    fontSize: '0.8125rem',
                    color: 'var(--color-text-secondary)',
                    fontWeight: 600,
                }}>
                    Step {step} of 2
                </span>
            </div>

            {/* Progress bar */}
            <div style={{
                maxWidth: 400,
                margin: 'var(--space-md) auto 0',
                width: '100%',
                padding: '0 var(--space-xl)',
            }}>
                <div style={{
                    height: 4,
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--color-bg-tertiary)',
                    overflow: 'hidden',
                }}>
                    <div style={{
                        height: '100%',
                        width: step === 1 ? '50%' : '100%',
                        background: 'var(--color-primary)',
                        borderRadius: 'var(--radius-full)',
                        transition: 'width var(--transition-slow)',
                    }} />
                </div>
            </div>

            {/* Main content */}
            <main style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'var(--space-xl)',
            }}>
                <div style={{
                    maxWidth: 480,
                    width: '100%',
                    background: 'var(--color-bg-primary)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-lg)',
                    padding: 'var(--space-2xl)',
                    textAlign: 'center',
                }}>
                    {step === 1 && (
                        <div className="animate-fade-in-up">
                            {!linkedInDone ? (
                                <>
                                    <div style={{
                                        width: 56,
                                        height: 56,
                                        borderRadius: 'var(--radius-md)',
                                        background: '#0A66C2',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto var(--space-lg)',
                                    }}>
                                        <LinkedinLogo size={32} weight="fill" color="#fff" />
                                    </div>
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--space-md)' }}>
                                        Connect Your LinkedIn Account
                                    </h2>
                                    <p style={{
                                        color: 'var(--color-text-secondary)',
                                        fontSize: '0.875rem',
                                        lineHeight: 1.6,
                                        marginBottom: 'var(--space-xl)',
                                    }}>
                                        QuickConnect uses Unipile to safely send connection requests on your behalf.
                                        Your credentials are encrypted and never stored on our servers.
                                    </p>
                                    <button
                                        className="btn btn-primary btn-lg"
                                        onClick={handleConnectLinkedIn}
                                        disabled={connecting}
                                        style={{
                                            width: '100%',
                                            height: 48,
                                            fontSize: '0.9375rem',
                                            background: '#0A66C2',
                                        }}
                                    >
                                        {connecting ? (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                                                <SpinnerGap size={20} className="spin-icon" /> Connecting...
                                            </span>
                                        ) : (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                                                <LinkedinLogo size={20} weight="fill" /> Connect LinkedIn
                                            </span>
                                        )}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div style={{
                                        width: 56,
                                        height: 56,
                                        borderRadius: 'var(--radius-full)',
                                        background: 'var(--color-success-light)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto var(--space-lg)',
                                    }}>
                                        <CheckCircle size={32} weight="fill" color="var(--color-success)" />
                                    </div>
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--space-sm)', color: 'var(--color-success)' }}>
                                        LinkedIn Connected!
                                    </h2>
                                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: 'var(--space-xl)' }}>
                                        Your LinkedIn account is connected. You're ready to send connection requests.
                                    </p>
                                    <button
                                        className="btn btn-primary btn-lg"
                                        onClick={() => setStep(2)}
                                        style={{ width: '100%', height: 48, fontSize: '0.9375rem' }}
                                    >
                                        Next <CaretRight size={18} />
                                    </button>
                                </>
                            )}
                        </div>
                    )}

                    {step === 2 && (
                        <div className="animate-fade-in-up">
                            <div style={{
                                width: 56,
                                height: 56,
                                borderRadius: 'var(--radius-md)',
                                background: 'var(--color-primary-lighter)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto var(--space-lg)',
                            }}>
                                <UploadSimple size={32} weight="duotone" color="var(--color-primary)" />
                            </div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--space-md)' }}>
                                Upload Your First CSV
                            </h2>
                            <p style={{
                                color: 'var(--color-text-secondary)',
                                fontSize: '0.875rem',
                                lineHeight: 1.6,
                                marginBottom: 'var(--space-xl)',
                            }}>
                                Export your leads from Sales Navigator and upload a CSV to start sending connection requests.
                            </p>

                            <Link
                                to="/dashboard/upload"
                                className="btn btn-primary btn-lg"
                                onClick={async (e) => {
                                    e.preventDefault()
                                    await handleFinish()
                                    navigate('/dashboard/upload')
                                }}
                                style={{ width: '100%', height: 48, fontSize: '0.9375rem', marginBottom: 'var(--space-md)' }}
                            >
                                <UploadSimple size={20} /> Upload CSV
                            </Link>

                            <button
                                className="btn btn-text"
                                onClick={handleFinish}
                                style={{ width: '100%' }}
                            >
                                Skip for now
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

export default OnboardingPage
