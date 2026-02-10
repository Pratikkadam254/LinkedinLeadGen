import { type OnboardingQuestion as QuestionType } from '../../data/onboardingQuestions'
import './OnboardingQuestion.css'

interface OnboardingQuestionProps {
    question: QuestionType
    value: string | string[] | undefined
    onChange: (value: string | string[]) => void
}

function OnboardingQuestion({ question, value, onChange }: OnboardingQuestionProps) {
    const handleSingleSelect = (optionValue: string) => {
        onChange(optionValue)
    }

    const handleMultiSelect = (optionValue: string) => {
        const currentValues = (value as string[]) || []
        if (currentValues.includes(optionValue)) {
            onChange(currentValues.filter(v => v !== optionValue))
        } else {
            onChange([...currentValues, optionValue])
        }
    }

    const isSelected = (optionValue: string): boolean => {
        if (question.type === 'multi') {
            return ((value as string[]) || []).includes(optionValue)
        }
        return value === optionValue
    }

    return (
        <div className="question-container">
            <h2 className="question-title">{question.title}</h2>
            {question.description && (
                <p className="question-description">{question.description}</p>
            )}

            <div className={`question-options ${question.type === 'multi' ? 'multi' : 'single'}`}>
                {question.options?.map((option) => (
                    <button
                        key={option.value}
                        type="button"
                        className={`option-btn ${isSelected(option.value) ? 'selected' : ''}`}
                        onClick={() =>
                            question.type === 'multi'
                                ? handleMultiSelect(option.value)
                                : handleSingleSelect(option.value)
                        }
                    >
                        {option.icon && <span className="option-icon">{option.icon}</span>}
                        <span className="option-label">{option.label}</span>
                        {question.type === 'multi' && (
                            <span className="option-check">
                                {isSelected(option.value) ? '✓' : ''}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {question.type === 'multi' && (
                <p className="selection-hint">
                    {((value as string[]) || []).length} selected
                </p>
            )}
        </div>
    )
}

export default OnboardingQuestion
