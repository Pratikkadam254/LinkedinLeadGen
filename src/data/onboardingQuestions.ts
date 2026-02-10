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
        id: 'primaryGoal',
        title: "What's your primary goal with LeadFlow AI?",
        description: 'Choose the goal that matters most to you right now.',
        type: 'single',
        required: true,
        options: [
            { value: 'generate_leads', label: 'Generate more qualified leads', icon: '🎯' },
            { value: 'scale_outreach', label: 'Scale my LinkedIn outreach', icon: '📈' },
            { value: 'improve_acceptance', label: 'Improve connection acceptance rate', icon: '✅' },
            { value: 'automate_followup', label: 'Automate follow-up messages', icon: '🔄' },
            { value: 'build_brand', label: 'Build my personal brand', icon: '⭐' },
        ],
    },
    {
        id: 'targetIndustry',
        title: 'Which industries do you target?',
        description: 'Select all that apply to your ideal customer profile.',
        type: 'multi',
        required: true,
        options: [
            { value: 'technology', label: 'Technology / SaaS', icon: '💻' },
            { value: 'finance', label: 'Finance / Banking', icon: '🏦' },
            { value: 'healthcare', label: 'Healthcare', icon: '🏥' },
            { value: 'consulting', label: 'Consulting / Professional Services', icon: '💼' },
            { value: 'manufacturing', label: 'Manufacturing', icon: '🏭' },
            { value: 'retail', label: 'Retail / E-commerce', icon: '🛒' },
            { value: 'other', label: 'Other', icon: '📦' },
        ],
    },
    {
        id: 'companySize',
        title: 'What company size do you prefer to target?',
        description: 'This helps us optimize lead scoring for your ICP.',
        type: 'single',
        required: true,
        options: [
            { value: '1-10', label: '1-10 employees (Startup)', icon: '🚀' },
            { value: '11-50', label: '11-50 employees (Small)', icon: '🏢' },
            { value: '51-200', label: '51-200 employees (Mid-size)', icon: '🏬' },
            { value: '201-1000', label: '201-1000 employees (Large)', icon: '🏙️' },
            { value: '1000+', label: '1000+ employees (Enterprise)', icon: '🌆' },
        ],
    },
    {
        id: 'targetTitles',
        title: 'Which job titles do you typically target?',
        description: 'Select all titles that match your ideal prospects.',
        type: 'multi',
        required: true,
        options: [
            { value: 'c-suite', label: 'C-Suite (CEO, CTO, CFO)', icon: '👔' },
            { value: 'vp', label: 'VP / Vice President', icon: '📊' },
            { value: 'director', label: 'Director', icon: '📈' },
            { value: 'manager', label: 'Manager', icon: '👥' },
            { value: 'founder', label: 'Founder / Owner', icon: '💡' },
            { value: 'other', label: 'Other', icon: '🎯' },
        ],
    },
    {
        id: 'weeklyVolume',
        title: 'How many connections do you want to send weekly?',
        description: 'We\'ll help you stay within LinkedIn\'s safe limits.',
        type: 'single',
        required: true,
        options: [
            { value: '10-20', label: '10-20 per week (Conservative)', icon: '🐢' },
            { value: '20-50', label: '20-50 per week (Moderate)', icon: '🚶' },
            { value: '50-100', label: '50-100 per week (Active)', icon: '🏃' },
            { value: '100+', label: '100+ per week (Aggressive)', icon: '⚡' },
        ],
    },
    {
        id: 'messageTone',
        title: 'What tone do you prefer for your messages?',
        description: 'This helps our AI match your communication style.',
        type: 'single',
        required: true,
        options: [
            { value: 'professional', label: 'Professional & Formal', icon: '🎩' },
            { value: 'friendly', label: 'Friendly & Approachable', icon: '😊' },
            { value: 'direct', label: 'Direct & To-the-point', icon: '🎯' },
            { value: 'conversational', label: 'Conversational & Casual', icon: '💬' },
        ],
    },
    {
        id: 'hasExistingLeads',
        title: 'Do you have existing leads to import?',
        description: 'You can upload CSV, Excel, or connect Google Sheets.',
        type: 'single',
        required: true,
        options: [
            { value: 'yes_now', label: 'Yes, I\'ll upload them now', icon: '📤' },
            { value: 'yes_later', label: 'Yes, but I\'ll do it later', icon: '⏰' },
            { value: 'no', label: 'No, I\'ll find leads manually', icon: '🔍' },
        ],
    },
    {
        id: 'linkedInReady',
        title: 'Are you ready to connect your LinkedIn account?',
        description: 'We use Unipile for secure, LinkedIn-safe automation.',
        type: 'single',
        required: false,
        options: [
            { value: 'yes', label: 'Yes, let\'s connect now', icon: '🔗' },
            { value: 'later', label: 'I\'ll do this later', icon: '⏳' },
            { value: 'learn_more', label: 'I want to learn more first', icon: '📚' },
        ],
    },
]
