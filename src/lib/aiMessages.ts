// AI Message Generation - Fallback templates
// Primary generation now happens server-side via Claude API in convex/actions/generateMessages.ts

export interface LeadContext {
    firstName: string;
    lastName: string;
    company: string;
    title: string;
    linkedInUrl: string;
    score: number;
    scoreTier: 'hot' | 'warm' | 'cold';
    postContent?: string;
    mutualConnections?: number;
    companySize?: number;
}

export interface UserContext {
    firstName?: string;
    lastName?: string;
    company?: string;
    title?: string;
    primaryGoal?: string;
    messageTone?: string;
}

export type MessageTone = 'professional' | 'friendly' | 'casual' | 'bold';

export interface GeneratedMessage {
    message: string;
    charCount: number;
    tone: MessageTone;
    personalizationScore: number;
    hooks: string[];
}

// Fallback template-based generation (used when Claude API is unavailable)
export function generateFallbackMessage(
    lead: LeadContext,
    tone: MessageTone = 'professional'
): GeneratedMessage {
    const templates: Record<MessageTone, string[]> = {
        professional: [
            `Hi ${lead.firstName}, your work as ${lead.title} at ${lead.company} aligns well with what we're building. I'd love to exchange ideas on how ${lead.company} approaches growth in the current market.`,
            `${lead.firstName}, impressive trajectory at ${lead.company}. I work in a similar space and believe there's strong potential for mutual value. Would love to connect.`,
            `Hi ${lead.firstName}, ${lead.company}'s direction caught my attention. As someone focused on B2B growth, I think we'd have a lot to discuss. Looking forward to connecting.`,
        ],
        friendly: [
            `Hey ${lead.firstName}! Love what ${lead.company} is doing. Always great to connect with fellow ${lead.title.split(' ')[0]}s. Would love to chat!`,
            `Hi ${lead.firstName}! Your background at ${lead.company} is really interesting. I'm always looking to learn from people doing great work in the space. Hope to connect!`,
        ],
        casual: [
            `Hey ${lead.firstName} — saw you're at ${lead.company} and thought it'd be cool to connect. Always enjoy meeting people doing interesting work as ${lead.title}. Cheers!`,
            `Hi ${lead.firstName}, your role at ${lead.company} sounds fascinating. I'd enjoy swapping notes sometime. No pitch, just genuine connection.`,
        ],
        bold: [
            `${lead.firstName}, I'll be direct: ${lead.company} is doing something special, and as a ${lead.title}, you're driving that. I have ideas that could accelerate what you're building. Let's talk.`,
            `${lead.firstName}, most connection requests are generic. This one isn't. I've studied ${lead.company}'s growth and have specific thoughts. Worth a conversation?`,
        ],
    };

    const toneTemplates = templates[tone] || templates.professional;
    const message = toneTemplates[Math.floor(Math.random() * toneTemplates.length)];

    return {
        message,
        charCount: message.length,
        tone,
        personalizationScore: 5,
        hooks: ['Company mention', 'First name'],
    };
}
