import './SegmentedProgressBar.css'

interface SegmentedProgressBarProps {
    currentStep: number
    totalSteps: number
}

function SegmentedProgressBar({ currentStep, totalSteps }: SegmentedProgressBarProps) {
    return (
        <div className="segmented-progress">
            <div className="segmented-progress-bar">
                {Array.from({ length: totalSteps }, (_, i) => (
                    <div
                        key={i}
                        className={`segmented-progress-segment ${
                            i < currentStep ? 'completed' : ''
                        } ${i === currentStep ? 'current' : ''}`}
                    >
                        <div className="segmented-progress-fill" />
                    </div>
                ))}
            </div>
            <span className="segmented-progress-label">
                {currentStep + 1} of {totalSteps}
            </span>
        </div>
    )
}

export default SegmentedProgressBar
