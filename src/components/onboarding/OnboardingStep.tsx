import { type ReactNode } from 'react'
import './OnboardingStep.css'

interface OnboardingStepProps {
    children: ReactNode
}

function OnboardingStep({ children }: OnboardingStepProps) {
    return (
        <div className="onboarding-step step-slide-in">
            {children}
        </div>
    )
}

export default OnboardingStep
