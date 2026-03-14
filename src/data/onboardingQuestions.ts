export interface OnboardingQuestion {
    id: string
    title: string
    description?: string
    type: 'single' | 'multi' | 'text'
    options?: { value: string; label: string; icon?: string }[]
    required: boolean
}

export interface OnboardingAnswers {
    [key: string]: string | string[]
}

export const onboardingQuestions: OnboardingQuestion[] = [
    {
        id: 'targetIndustry',
        title: 'Which industries do you target?',
        description: 'Select all that apply to your ideal customer profile.',
        type: 'multi',
        required: true,
        options: [
            { value: 'technology', label: 'Technology / SaaS' },
            { value: 'finance', label: 'Finance / Banking' },
            { value: 'healthcare', label: 'Healthcare' },
            { value: 'consulting', label: 'Consulting / Professional Services' },
            { value: 'manufacturing', label: 'Manufacturing' },
            { value: 'retail', label: 'Retail / E-commerce' },
            { value: 'real_estate', label: 'Real Estate' },
            { value: 'education', label: 'Education' },
            { value: 'other', label: 'Other' },
        ],
    },
    {
        id: 'companySize',
        title: 'What company size do you prefer to target?',
        description: 'This helps us score your leads more accurately.',
        type: 'single',
        required: true,
        options: [
            { value: '1-10', label: '1-10 employees (Startup)' },
            { value: '11-50', label: '11-50 employees (Small)' },
            { value: '51-200', label: '51-200 employees (Mid-size)' },
            { value: '201-1000', label: '201-1000 employees (Large)' },
            { value: '1000+', label: '1000+ employees (Enterprise)' },
        ],
    },
    {
        id: 'targetTitles',
        title: 'Which job titles do you typically target?',
        description: 'Select all titles that match your ideal prospects.',
        type: 'multi',
        required: true,
        options: [
            { value: 'c-suite', label: 'C-Suite (CEO, CTO, CFO)' },
            { value: 'vp', label: 'VP / Vice President' },
            { value: 'director', label: 'Director' },
            { value: 'manager', label: 'Manager' },
            { value: 'founder', label: 'Founder / Owner' },
            { value: 'other', label: 'Other' },
        ],
    },
    {
        id: 'messageTone',
        title: 'What tone do you prefer for your messages?',
        description: 'This helps our AI match your communication style.',
        type: 'single',
        required: true,
        options: [
            { value: 'professional', label: 'Professional & Formal' },
            { value: 'friendly', label: 'Friendly & Approachable' },
            { value: 'casual', label: 'Casual & Conversational' },
            { value: 'bold', label: 'Bold & Direct' },
        ],
    },
]
