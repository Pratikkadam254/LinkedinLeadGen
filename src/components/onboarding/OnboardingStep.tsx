import { useRef, useEffect, useState, type ReactNode } from 'react'
import './OnboardingStep.css'

interface OnboardingStepProps {
    stepIndex: number
    children: ReactNode
}

function OnboardingStep({ stepIndex, children }: OnboardingStepProps) {
    const [animClass, setAnimClass] = useState('step-active')
    const prevStep = useRef(stepIndex)

    useEffect(() => {
        if (stepIndex === prevStep.current) return

        const direction = stepIndex > prevStep.current ? 'forward' : 'backward'
        prevStep.current = stepIndex

        // Start exit animation
        setAnimClass(direction === 'forward' ? 'step-exit-left' : 'step-exit-right')

        // After exit, enter from opposite side
        const timer = setTimeout(() => {
            setAnimClass(direction === 'forward' ? 'step-enter-right' : 'step-enter-left')
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setAnimClass('step-active')
                })
            })
        }, 250)

        return () => clearTimeout(timer)
    }, [stepIndex])

    return (
        <div className={`onboarding-step ${animClass}`}>
            {children}
        </div>
    )
}

export default OnboardingStep
