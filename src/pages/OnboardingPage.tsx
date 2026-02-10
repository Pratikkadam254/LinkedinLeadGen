import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '../components/ui/Logo'
import OnboardingProgress from '../components/onboarding/OnboardingProgress'
import OnboardingQuestion from '../components/onboarding/OnboardingQuestion'
import { onboardingQuestions, type OnboardingAnswers } from '../data/onboardingQuestions'
import './OnboardingPage.css'

function OnboardingPage() {
    const navigate = useNavigate()
    const [currentStep, setCurrentStep] = useState(0)
    const [answers, setAnswers] = useState<OnboardingAnswers>({})

    const totalSteps = onboardingQuestions.length
    const currentQuestion = onboardingQuestions[currentStep]

    const handleAnswer = (questionId: string, value: string | string[]) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }))
    }

    const handleNext = () => {
        if (currentStep < totalSteps - 1) {
            setCurrentStep(prev => prev + 1)
        } else {
            // Onboarding complete - save answers and go to dashboard
            console.log('Onboarding answers:', answers)
            // TODO: Save to Convex
            navigate('/dashboard')
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
                    Skip & Upload Leads →
                </button>
            </header>

            <main className="onboarding-main">
                <div className="onboarding-container">
                    <div className="onboarding-intro">
                        <h1>Let's personalize your experience</h1>
                        <p>Answer a few questions to customize your lead generation workflow.</p>
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
                                ← Back
                            </button>
                            <button
                                onClick={handleNext}
                                className="btn btn-primary btn-lg"
                                disabled={!canContinue}
                            >
                                {isLastStep ? 'Complete Setup →' : 'Continue →'}
                            </button>
                        </div>
                    </div>

                    <p className="onboarding-tip">
                        💡 You can always change these settings later in your preferences.
                    </p>
                </div>
            </main>
        </div>
    )
}

export default OnboardingPage
