// AI Message Generation - Creates personalized LinkedIn connection messages
// Uses templates + dynamic personalization based on lead data

export interface MessageContext {
    lead: {
        firstName: string
        lastName: string
        company: string
        title: string
    }
    user: {
        firstName: string
        company?: string
        valueProposition?: string
    }
    recentPost?: {
        content: string
        engagement: number
    }
    mutualConnections?: string[]
    tone: 'professional' | 'friendly' | 'direct' | 'conversational'
}

export interface GeneratedMessage {
    subject?: string
    body: string
    hook: string
    personalization: string[]
    characterCount: number
    wordCount: number
}

// Message templates by tone
const messageTemplates = {
    professional: [
        `Hi {firstName},

I came across your profile and was impressed by your work as {title} at {company}. {hook}

{valueProposition}

Would you be open to connecting?

Best regards,
{senderName}`,
        `Hello {firstName},

Your role at {company} caught my attention. {hook}

{valueProposition}

I'd value the opportunity to connect and exchange insights.

Regards,
{senderName}`,
    ],
    friendly: [
        `Hey {firstName}! 👋

{hook} Really impressed by what you're building at {company}!

{valueProposition}

Would love to connect and share ideas!

Cheers,
{senderName}`,
        `Hi {firstName},

{hook} I've been following {company}'s journey and it's inspiring!

{valueProposition}

Let's connect?

{senderName}`,
    ],
    direct: [
        `{firstName},

{hook}

{valueProposition}

Worth a quick chat?

{senderName}`,
        `Hi {firstName} - {hook}

{valueProposition}

Open to connecting?

{senderName}`,
    ],
    conversational: [
        `Hi {firstName}!

I noticed we're both in the {industry} space. {hook}

{valueProposition}

Would be great to connect and swap notes sometime!

{senderName}`,
        `Hey {firstName},

{hook} Always great to see fellow professionals crushing it at {company}!

{valueProposition}

Let's stay in touch?

{senderName}`,
    ],
}

// Hook generators based on available data
function generateHook(context: MessageContext): string {
    const { lead, recentPost, mutualConnections } = context

    // Priority 1: Recent post reference
    if (recentPost?.content) {
        const postSnippet = recentPost.content.slice(0, 50)
        const postHooks = [
            `Loved your recent post about "${postSnippet}..."`,
            `Your post on "${postSnippet}..." really resonated with me.`,
            `Just saw your update about "${postSnippet}..." - great insights!`,
            `Your thoughts on "${postSnippet}..." caught my attention.`,
        ]
        return postHooks[Math.floor(Math.random() * postHooks.length)]
    }

    // Priority 2: Mutual connections
    if (mutualConnections && mutualConnections.length > 0) {
        const connection = mutualConnections[0]
        return `I noticed we're both connected with ${connection} - small world!`
    }

    // Priority 3: Title/role based
    const titleHooks = [
        `I admire how you're leading as ${lead.title} at ${lead.company}.`,
        `Your experience as ${lead.title} is really impressive.`,
        `It's great to see the work you're doing at ${lead.company}.`,
        `Your journey as ${lead.title} is inspiring.`,
    ]
    return titleHooks[Math.floor(Math.random() * titleHooks.length)]
}

// Value proposition templates
function generateValueProp(context: MessageContext): string {
    const { user } = context

    if (user.valueProposition) {
        return user.valueProposition
    }

    const defaultProps = [
        `I help companies like yours streamline lead generation with AI-powered insights.`,
        `I work with ${user.company || 'startups'} on scaling their B2B outreach efficiently.`,
        `I specialize in helping leaders like yourself save time on prospecting.`,
        `I'm passionate about helping teams achieve more with less manual work.`,
    ]

    return defaultProps[Math.floor(Math.random() * defaultProps.length)]
}

// Detect industry from title/company
function detectIndustry(lead: MessageContext['lead']): string {
    const text = `${lead.title} ${lead.company}`.toLowerCase()

    if (text.includes('tech') || text.includes('software') || text.includes('saas')) {
        return 'technology'
    }
    if (text.includes('finance') || text.includes('bank') || text.includes('capital')) {
        return 'finance'
    }
    if (text.includes('health') || text.includes('medical') || text.includes('pharma')) {
        return 'healthcare'
    }
    if (text.includes('market') || text.includes('growth') || text.includes('brand')) {
        return 'marketing'
    }
    if (text.includes('sale') || text.includes('revenue') || text.includes('business')) {
        return 'sales'
    }

    return 'business'
}

// Main message generation function
export function generateMessage(context: MessageContext): GeneratedMessage {
    const templates = messageTemplates[context.tone]
    const template = templates[Math.floor(Math.random() * templates.length)]

    const hook = generateHook(context)
    const valueProposition = generateValueProp(context)
    const industry = detectIndustry(context.lead)

    // Track personalizations used
    const personalization: string[] = []

    if (context.recentPost) {
        personalization.push('Recent post reference')
    }
    if (context.mutualConnections?.length) {
        personalization.push('Mutual connection mention')
    }
    personalization.push('Role-specific hook')
    personalization.push('Company mention')

    // Build the message
    let body = template
        .replace(/{firstName}/g, context.lead.firstName)
        .replace(/{lastName}/g, context.lead.lastName)
        .replace(/{company}/g, context.lead.company)
        .replace(/{title}/g, context.lead.title)
        .replace(/{hook}/g, hook)
        .replace(/{valueProposition}/g, valueProposition)
        .replace(/{senderName}/g, context.user.firstName)
        .replace(/{industry}/g, industry)

    // Clean up any double spaces or extra newlines
    body = body.replace(/\n{3,}/g, '\n\n').trim()

    return {
        body,
        hook,
        personalization,
        characterCount: body.length,
        wordCount: body.split(/\s+/).length,
    }
}

// Quick generate with defaults
export function quickGenerateMessage(
    lead: { firstName: string; lastName: string; company: string; title: string },
    senderFirstName: string = 'Alex',
    tone: MessageContext['tone'] = 'friendly'
): GeneratedMessage {
    return generateMessage({
        lead,
        user: { firstName: senderFirstName },
        tone,
    })
}

// Generate multiple message variations
export function generateMessageVariations(
    context: MessageContext,
    count: number = 3
): GeneratedMessage[] {
    const variations: GeneratedMessage[] = []
    const tones: MessageContext['tone'][] = ['professional', 'friendly', 'direct', 'conversational']

    for (let i = 0; i < count; i++) {
        const toneToUse = i === 0 ? context.tone : tones[i % tones.length]
        variations.push(generateMessage({ ...context, tone: toneToUse }))
    }

    return variations
}

// Check if message meets LinkedIn limits
export function validateMessage(message: GeneratedMessage): {
    valid: boolean
    issues: string[]
} {
    const issues: string[] = []

    // LinkedIn connection message limit is 300 characters
    if (message.characterCount > 300) {
        issues.push(`Message is ${message.characterCount - 300} characters over the 300 character limit`)
    }

    // Check for placeholder remnants
    if (message.body.includes('{')) {
        issues.push('Message contains unresolved placeholders')
    }

    return {
        valid: issues.length === 0,
        issues,
    }
}

// Generate a shorter version for connection requests (under 300 chars)
export function generateShortMessage(context: MessageContext): GeneratedMessage {
    const { lead, user, recentPost } = context

    let body = ''
    const hook = recentPost
        ? `Loved your post on "${recentPost.content.slice(0, 30)}..."`
        : `Impressed by your work at ${lead.company}.`

    // Keep it very short
    body = `Hi ${lead.firstName}! ${hook} Would love to connect and share insights. - ${user.firstName}`

    // Ensure under 300 chars
    if (body.length > 300) {
        body = `Hi ${lead.firstName}! Great work at ${lead.company}. Let's connect? - ${user.firstName}`
    }

    return {
        body,
        hook,
        personalization: ['First name', 'Company'],
        characterCount: body.length,
        wordCount: body.split(/\s+/).length,
    }
}
