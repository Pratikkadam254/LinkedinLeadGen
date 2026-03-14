import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth, SignUp } from '@clerk/clerk-react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import Logo from '../components/ui/Logo'
import SegmentedProgressBar from '../components/onboarding/SegmentedProgressBar'
import OnboardingStep from '../components/onboarding/OnboardingStep'
import OnboardingQuestion from '../components/onboarding/OnboardingQuestion'
import AhaMomentScreen from '../components/onboarding/AhaMomentScreen'
import LeadImportChooser from '../components/onboarding/LeadImportChooser'
import { onboardingQuestions } from '../data/onboardingQuestions'
import { onboardingScreens, TOTAL_SCREENS, SIGNUP_SCREEN_INDEX, POST_SIGNUP_START_INDEX } from '../data/onboardingFlow'
import { useOnboardingStorage, type OnboardingData } from '../hooks/useOnboardingStorage'
import { useSyncedUser } from '../hooks/useSyncedUser'
import { useToast } from '../components/ui/Toast'
import './OnboardingFlowPage.css'

/** Map question IDs to localStorage field names */
const questionToStorageKey: Record<string, keyof OnboardingData> = {
    primaryGoal: 'primaryGoal',
    role: 'role',
    targetIndustry: 'targetIndustry',
    companySize: 'companySize',
    targetTitles: 'targetTitles',
    messageTone: 'messageTone',
}

function OnboardingFlowPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { isSignedIn } = useAuth()
    const syncedUser = useSyncedUser()
    const updatePreferences = useMutation(api.users.updatePreferences)
    const { showToast } = useToast()
    const { data: storageData, updateField, getAll, clear } = useOnboardingStorage()

    // Determine starting step
    const isPostSignup = searchParams.get('step') === 'post-signup'
    const [currentStep, setCurrentStep] = useState(() => {
        if (isPostSignup && isSignedIn) return POST_SIGNUP_START_INDEX
        return 0
    })
    const [migrated, setMigrated] = useState(false)

    // Migrate localStorage to Convex after signup
    useEffect(() => {
        if (!isPostSignup || !isSignedIn || !syncedUser.clerkId || migrated) return

        const migrateData = async () => {
            try {
                const all = getAll()
                await updatePreferences({
                    clerkId: syncedUser.clerkId,
                    preferences: {
                        primaryGoal: all.primaryGoal || undefined,
                        role: all.role || undefined,
                        targetIndustries: all.targetIndustry.length > 0 ? all.targetIndustry : undefined,
                        targetCompanySize: all.companySize || undefined,
                        targetTitles: all.targetTitles.length > 0 ? all.targetTitles : undefined,
                        messageTone: all.messageTone || undefined,
                    },
                })
                clear()
                setMigrated(true)
                showToast('success', 'Your profile is set up! Now add some leads.')
            } catch {
                showToast('error', 'Failed to save preferences. Please try again.')
            }
        }

        migrateData()
    }, [isPostSignup, isSignedIn, syncedUser.clerkId, migrated, getAll, updatePreferences, clear, showToast])

    const screen = onboardingScreens[currentStep]
    const question = screen?.questionId
        ? onboardingQuestions.find(q => q.id === screen.questionId)
        : null

    // Get current answer from localStorage
    const storageKey = screen?.questionId ? questionToStorageKey[screen.questionId] : null
    const currentAnswer = storageKey ? storageData[storageKey] : undefined

    const canContinue = (() => {
        if (screen?.type !== 'question' || !question) return true
        if (!question.required) return true
        if (Array.isArray(currentAnswer)) return currentAnswer.length > 0
        return !!currentAnswer
    })()

    const handleAnswer = (value: string | string[]) => {
        if (!storageKey) return
        updateField(storageKey, value)
    }

    const handleNext = () => {
        if (currentStep < TOTAL_SCREENS - 1) {
            setCurrentStep(prev => prev + 1)
        }
    }

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1)
        }
    }

    const handleSkip = () => {
        if (isSignedIn) {
            navigate('/dashboard')
        } else {
            // Jump to signup
            setCurrentStep(SIGNUP_SCREEN_INDEX)
        }
    }

    // If signed in user already completed onboarding, redirect to dashboard
    useEffect(() => {
        if (syncedUser.onboardingCompleted && !isPostSignup) {
            navigate('/dashboard', { replace: true })
        }
    }, [syncedUser.onboardingCompleted, isPostSignup, navigate])

    return (
        <div className="flow-page">
            <header className="flow-header">
                <Link to="/" className="flow-logo">
                    <Logo />
                    <span>LeadFlow AI</span>
                </Link>
                <button onClick={handleSkip} className="flow-skip-btn">
                    Skip for now
                </button>
            </header>

            <main className="flow-main">
                <div className="flow-container">
                    <SegmentedProgressBar
                        currentStep={currentStep}
                        totalSteps={TOTAL_SCREENS}
                    />

                    <div className="flow-content">
                        <OnboardingStep stepIndex={currentStep}>
                            {/* Question screens */}
                            {screen?.type === 'question' && question && (
                                <OnboardingQuestion
                                    question={question}
                                    value={currentAnswer as string | string[] | undefined}
                                    onChange={handleAnswer}
                                />
                            )}

                            {/* Aha moment screen */}
                            {screen?.type === 'aha' && (
                                <AhaMomentScreen data={storageData} />
                            )}

                            {/* Signup screen */}
                            {screen?.type === 'signup' && (
                                <div className="flow-signup-screen">
                                    <h2>Create your free account</h2>
                                    <p>Save your profile and start reaching out to prospects.</p>
                                    <div className="flow-clerk-wrapper">
                                        <SignUp
                                            routing="path"
                                            path="/onboarding"
                                            signInUrl="/signin"
                                            afterSignUpUrl="/onboarding?step=post-signup"
                                            appearance={{
                                                elements: {
                                                    rootBox: 'clerk-root',
                                                    card: 'clerk-card',
                                                    headerTitle: 'clerk-title',
                                                    headerSubtitle: 'clerk-subtitle',
                                                    socialButtonsBlockButton: 'clerk-social-btn',
                                                    formButtonPrimary: 'clerk-primary-btn',
                                                    footerAction: 'clerk-footer',
                                                },
                                                variables: {
                                                    colorPrimary: '#0A66C2',
                                                    colorBackground: '#FFFFFF',
                                                    colorText: '#191919',
                                                    colorTextSecondary: '#666666',
                                                    borderRadius: '8px',
                                                    fontFamily: 'Inter, sans-serif',
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Lead import screen (post-signup) */}
                            {screen?.type === 'import' && (
                                <LeadImportChooser />
                            )}
                        </OnboardingStep>
                    </div>

                    {/* Navigation buttons for question and aha screens */}
                    {(screen?.type === 'question' || screen?.type === 'aha') && (
                        <div className="flow-actions">
                            <button
                                onClick={handleBack}
                                className="flow-btn flow-btn-back"
                                disabled={currentStep === 0}
                            >
                                Back
                            </button>
                            <button
                                onClick={handleNext}
                                className="flow-btn flow-btn-next"
                                disabled={!canContinue}
                            >
                                {screen?.type === 'aha' ? 'Create Account' : 'Continue'}
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

export default OnboardingFlowPage
