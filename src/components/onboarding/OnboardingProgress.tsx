import './OnboardingProgress.css'

interface OnboardingProgressProps {
    currentStep: number
    totalSteps: number
}

function OnboardingProgress({ currentStep, totalSteps }: OnboardingProgressProps) {
    const percentage = (currentStep / totalSteps) * 100

    return (
        <div className="onboarding-progress">
            <div className="progress-info">
                <span className="progress-label">
                    Question {currentStep} of {totalSteps}
                </span>
                <span className="progress-percentage">{Math.round(percentage)}%</span>
            </div>
            <div className="progress-bar">
                <div
                    className="progress-fill"
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <div className="progress-dots">
                {Array.from({ length: totalSteps }).map((_, index) => (
                    <div
                        key={index}
                        className={`progress-dot ${index < currentStep ? 'completed' :
                                index === currentStep - 1 ? 'current' : ''
                            }`}
                    />
                ))}
            </div>
        </div>
    )
}

export default OnboardingProgress
