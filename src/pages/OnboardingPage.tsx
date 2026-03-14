import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import Logo from '../components/ui/Logo'
import OnboardingProgress from '../components/onboarding/OnboardingProgress'
import OnboardingQuestion from '../components/onboarding/OnboardingQuestion'
import { onboardingQuestions, type OnboardingAnswers } from '../data/onboardingQuestions'
import { useSyncedUser } from '../hooks'
import { useToast } from '../components/ui/Toast'
import './OnboardingPage.css'

function OnboardingPage() {
    const navigate = useNavigate()
    const [currentStep, setCurrentStep] = useState(0)
    const [answers, setAnswers] = useState<OnboardingAnswers>({})
    const [saving, setSaving] = useState(false)

    const syncedUser = useSyncedUser()
    const updatePreferences = useMutation(api.users.updatePreferences)
    const { showToast } = useToast()

    const totalSteps = onboardingQuestions.length
    const currentQuestion = onboardingQuestions[currentStep]

    const handleAnswer = (questionId: string, value: string | string[]) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }))
    }

    const handleNext = async () => {
        if (currentStep < totalSteps - 1) {
            setCurrentStep(prev => prev + 1)
        } else {
            // Save preferences to Convex
            if (!syncedUser.clerkId) {
                showToast('error', 'Please sign in to save preferences')
                return
            }

            setSaving(true)
            try {
                await updatePreferences({
                    clerkId: syncedUser.clerkId,
                    preferences: {
                        targetIndustries: answers.targetIndustry as string[] || [],
                        targetCompanySize: answers.companySize as string || '',
                        targetTitles: answers.targetTitles as string[] || [],
                        messageTone: answers.messageTone as string || 'professional',
                    },
                })
                showToast('success', 'ICP saved! Let\'s upload some leads.')
                navigate('/dashboard/upload')
            } catch {
                showToast('error', 'Failed to save preferences. Please try again.')
            } finally {
                setSaving(false)
            }
        }
    }

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1)
        }
    }

    const handleSkip = () => {
        navigate('/dashboard/upload')
    }

    const isLastStep = currentStep === totalSteps - 1
    const currentAnswer = answers[currentQuestion.id]
    const canContinue = currentQuestion.required
        ? (Array.isArray(currentAnswer) ? currentAnswer.length > 0 : !!currentAnswer)
        : true

    return (
        <div className="onboarding-page">
            <header className="onboarding-header">
                <Link to="/" className="onboarding-logo">
                    <Logo />
                    <span>LeadFlow AI</span>
                </Link>
                <button onClick={handleSkip} className="skip-btn">
                    Skip for now
                </button>
            </header>

            <main className="onboarding-main">
                <div className="onboarding-container">
                    <div className="onboarding-intro">
                        <h1>Define Your Ideal Customer</h1>
                        <p>Tell us who you want to reach. This helps AI score your leads and write better messages.</p>
                    </div>

                    <OnboardingProgress
                        currentStep={currentStep + 1}
                        totalSteps={totalSteps}
                    />

                    <div className="onboarding-card">
                        <OnboardingQuestion
                            question={currentQuestion}
                            value={currentAnswer}
                            onChange={(value) => handleAnswer(currentQuestion.id, value)}
                        />

                        <div className="onboarding-actions">
                            <button
                                onClick={handleBack}
                                className="btn btn-text"
                                disabled={currentStep === 0}
                            >
                                Back
                            </button>
                            <button
                                onClick={handleNext}
                                className="btn btn-primary btn-lg"
                                disabled={!canContinue || saving}
                            >
                                {saving ? 'Saving...' : isLastStep ? 'Complete Setup' : 'Continue'}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default OnboardingPage
