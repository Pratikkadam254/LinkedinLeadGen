import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Logo from '../components/ui/Logo'
import OnboardingQuestion from '../components/onboarding/OnboardingQuestion'
import Card from '../components/ui/Card'
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

    const progressPercentage = ((currentStep + 1) / totalSteps) * 100

    return (
        <div className="onboarding-page">
            {/* Top progress bar */}
            <div className="onboarding-top-bar">
                <div
                    className="onboarding-top-bar__fill"
                    style={{ width: `${progressPercentage}%` }}
                />
            </div>

            {/* Header */}
            <header className="onboarding-header">
                <Link to="/" className="onboarding-logo">
                    <Logo />
                    <span>LeadFlow AI</span>
                </Link>
                <button onClick={handleSkip} className="btn btn-text onboarding-skip-btn">
                    Skip
                </button>
            </header>

            <main className="onboarding-main">
                <div className="onboarding-container">
                    {/* Step counter */}
                    <p className="onboarding-step-counter">
                        Step {currentStep + 1} of {totalSteps}
                    </p>

                    {/* Question card */}
                    <Card padding="lg" className="onboarding-card">
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
                                <ChevronLeft size={18} />
                                Back
                            </button>
                            <button
                                onClick={handleNext}
                                className="btn btn-primary btn-lg"
                                disabled={!canContinue}
                            >
                                {isLastStep ? 'Complete Setup' : 'Continue'}
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </Card>
                </div>
            </main>
        </div>
    )
}

export default OnboardingPage
