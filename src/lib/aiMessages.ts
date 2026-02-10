// AI Message Generation Service using Google Gemini
// Generates personalized LinkedIn connection request messages

import { GoogleGenerativeAI } from '@google/generative-ai';

// Types
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

export interface GenerateMessageOptions {
    lead: LeadContext;
    user: UserContext;
    tone: MessageTone;
    includeCompliment: boolean;
    includeQuestion: boolean;
    maxLength?: number;
}

export interface GeneratedMessage {
    message: string;
    charCount: number;
    tone: MessageTone;
    personalizationScore: number; // 1-10
    hooks: string[]; // Identified personalization hooks used
}

// Tone prompts mapping
const TONE_INSTRUCTIONS: Record<MessageTone, string> = {
    professional: `Write in a professional, business-oriented tone. Be polite, direct, and focused on mutual value. Avoid slang or overly casual language.`,
    friendly: `Write in a warm, friendly tone. Be approachable and genuine. Show authentic interest in the person. Use a conversational but respectful style.`,
    casual: `Write in a casual, relaxed tone. Be natural and personable, like you're reaching out to someone you'd enjoy grabbing coffee with. Keep it light but genuine.`,
    bold: `Write in a confident, bold tone. Be direct about the value you bring. Show strong conviction and enthusiasm. Stand out from generic messages.`,
};

class AIMessageService {
    private genAI: GoogleGenerativeAI | null = null;
    private model: any = null;

    initialize() {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (apiKey) {
            this.genAI = new GoogleGenerativeAI(apiKey);
            this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
            console.log('[AI] Gemini initialized');
        } else {
            console.warn('[AI] Gemini API key not configured');
        }
    }

    isConfigured(): boolean {
        return !!this.model;
    }

    async generateMessage(options: GenerateMessageOptions): Promise<GeneratedMessage> {
        const { lead, user, tone, includeCompliment, includeQuestion, maxLength = 280 } = options;

        // Build the prompt
        const prompt = this.buildPrompt(lead, user, tone, includeCompliment, includeQuestion, maxLength);

        // If Gemini is configured, use it
        if (this.model) {
            try {
                const result = await this.model.generateContent(prompt);
                const response = result.response;
                let message = response.text().trim();

                // Clean up the message - remove quotes if wrapped
                message = message.replace(/^["']|["']$/g, '').trim();

                // Ensure it's within LinkedIn's character limit
                if (message.length > 300) {
                    message = message.substring(0, 297) + '...';
                }

                const hooks = this.identifyHooks(message, lead);

                return {
                    message,
                    charCount: message.length,
                    tone,
                    personalizationScore: this.calculatePersonalizationScore(message, lead),
                    hooks,
                };
            } catch (error) {
                console.error('[AI] Gemini generation failed, using fallback:', error);
                return this.generateFallbackMessage(options);
            }
        }

        // Fallback to template-based generation
        return this.generateFallbackMessage(options);
    }

    async regenerateMessage(
        options: GenerateMessageOptions,
        previousMessage: string
    ): Promise<GeneratedMessage> {
        const { lead, user, tone, includeCompliment, includeQuestion, maxLength = 280 } = options;

        const prompt = `${this.buildPrompt(lead, user, tone, includeCompliment, includeQuestion, maxLength)}

IMPORTANT: Generate a DIFFERENT message from this previous one. Do NOT repeat it:
"${previousMessage}"

Write a completely fresh message with a different opening and angle.`;

        if (this.model) {
            try {
                const result = await this.model.generateContent(prompt);
                let message = result.response.text().trim();
                message = message.replace(/^["']|["']$/g, '').trim();

                if (message.length > 300) {
                    message = message.substring(0, 297) + '...';
                }

                const hooks = this.identifyHooks(message, lead);

                return {
                    message,
                    charCount: message.length,
                    tone,
                    personalizationScore: this.calculatePersonalizationScore(message, lead),
                    hooks,
                };
            } catch (error) {
                console.error('[AI] Regeneration failed:', error);
                return this.generateFallbackMessage(options);
            }
        }

        return this.generateFallbackMessage(options);
    }

    private buildPrompt(
        lead: LeadContext,
        user: UserContext,
        tone: MessageTone,
        includeCompliment: boolean,
        includeQuestion: boolean,
        maxLength: number
    ): string {
        const parts: string[] = [];

        parts.push(`You are an expert at writing highly personalized LinkedIn connection request messages that get accepted.`);
        parts.push(`\nTONE: ${TONE_INSTRUCTIONS[tone]}`);

        parts.push(`\nRECIPIENT INFORMATION:`);
        parts.push(`- Name: ${lead.firstName} ${lead.lastName}`);
        parts.push(`- Title: ${lead.title}`);
        parts.push(`- Company: ${lead.company}`);
        if (lead.postContent) {
            parts.push(`- Recent LinkedIn Post: "${lead.postContent}"`);
        }
        if (lead.mutualConnections && lead.mutualConnections > 0) {
            parts.push(`- Mutual Connections: ${lead.mutualConnections}`);
        }

        parts.push(`\nSENDER INFORMATION:`);
        if (user.firstName) parts.push(`- Name: ${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`);
        if (user.title) parts.push(`- Title: ${user.title}`);
        if (user.company) parts.push(`- Company: ${user.company}`);
        if (user.primaryGoal) parts.push(`- Goal: ${user.primaryGoal}`);

        parts.push(`\nRULES:`);
        parts.push(`1. Maximum ${maxLength} characters (STRICT - LinkedIn limit is 300).`);
        parts.push(`2. DO NOT use generic openings like "I came across your profile" or "I noticed you work at".`);
        parts.push(`3. Be specific and reference something unique about the recipient.`);
        if (includeCompliment) {
            parts.push(`4. Include a genuine, specific compliment about their work or company.`);
        }
        if (includeQuestion) {
            parts.push(`5. End with a soft, engaging question that invites a response.`);
        }
        parts.push(`6. NO hashtags, NO emojis, NO "let's connect" clichés.`);
        parts.push(`7. Sound like a real human, not a sales bot.`);
        parts.push(`8. Output ONLY the message text. No explanations, no options, no quotation marks.`);

        if (lead.postContent) {
            parts.push(`\nPersonalization hook: Reference their recent post about "${lead.postContent.substring(0, 100)}"`);
        }

        return parts.join('\n');
    }

    private generateFallbackMessage(options: GenerateMessageOptions): GeneratedMessage {
        const { lead, user, tone } = options;
        const userName = user.firstName || 'there';

        // Template-based messages by tone
        const templates: Record<MessageTone, string[]> = {
            professional: [
                `Hi ${lead.firstName}, your work as ${lead.title} at ${lead.company} aligns well with what we're building. I'd love to exchange ideas on how ${lead.company} approaches growth in the current market.`,
                `${lead.firstName}, impressive trajectory at ${lead.company}. I work in a similar space and believe there's strong potential for mutual value. Would love to connect.`,
                `Hi ${lead.firstName}, ${lead.company}'s direction caught my attention. As someone focused on B2B growth, I think we'd have a lot to discuss. Looking forward to connecting.`,
            ],
            friendly: [
                `Hey ${lead.firstName}! Love what ${lead.company} is doing. I'm ${userName} and work in a similar space — always great to connect with fellow ${lead.title.split(' ')[0]}s. Would love to chat!`,
                `Hi ${lead.firstName}! Your background at ${lead.company} is really interesting. I'm always looking to learn from people doing great work in the space. Hope to connect!`,
                `${lead.firstName}, really dig what you're doing at ${lead.company}. I'm ${userName}, and I think we'd have some great conversations. Let's connect!`,
            ],
            casual: [
                `Hey ${lead.firstName} — saw you're at ${lead.company} and thought it'd be cool to connect. Always enjoy meeting people who are doing interesting work as ${lead.title}. Cheers!`,
                `${lead.firstName}! ${lead.company} is doing some cool stuff. I'm in a similar world and figured we should know each other. Let's connect?`,
                `Hi ${lead.firstName}, your role at ${lead.company} sounds fascinating. I'd enjoy swapping notes sometime. No pitch, just genuine connection.`,
            ],
            bold: [
                `${lead.firstName}, I'll be direct: ${lead.company} is doing something special, and as a ${lead.title}, you're driving that. I have ideas that could accelerate what you're building. Let's talk.`,
                `${lead.firstName}, most connection requests are generic. This one isn't. I've studied ${lead.company}'s growth and have specific thoughts on your next move. Worth a conversation?`,
                `Hi ${lead.firstName} — I don't send random requests. Your work at ${lead.company} stood out, and I think a conversation between us could be genuinely valuable. Let's connect.`,
            ],
        };

        const toneTemplates = templates[tone] || templates.professional;
        const message = toneTemplates[Math.floor(Math.random() * toneTemplates.length)];
        const hooks = this.identifyHooks(message, lead);

        return {
            message,
            charCount: message.length,
            tone,
            personalizationScore: this.calculatePersonalizationScore(message, lead),
            hooks,
        };
    }

    private identifyHooks(message: string, lead: LeadContext): string[] {
        const hooks: string[] = [];
        const lowerMessage = message.toLowerCase();

        if (lowerMessage.includes(lead.company.toLowerCase())) hooks.push('Company mention');
        if (lowerMessage.includes(lead.title.toLowerCase().split(' ')[0])) hooks.push('Title reference');
        if (lowerMessage.includes(lead.firstName.toLowerCase())) hooks.push('First name');
        if (lead.postContent && lowerMessage.includes(lead.postContent.substring(0, 20).toLowerCase())) {
            hooks.push('Post reference');
        }
        if (message.includes('?')) hooks.push('Question hook');

        return hooks;
    }

    private calculatePersonalizationScore(message: string, lead: LeadContext): number {
        let score = 3; // Base score
        const lowerMessage = message.toLowerCase();

        // Check for personalization elements
        if (lowerMessage.includes(lead.firstName.toLowerCase())) score += 1;
        if (lowerMessage.includes(lead.company.toLowerCase())) score += 2;
        if (lowerMessage.includes(lead.title.toLowerCase().split(' ')[0])) score += 1;
        if (lead.postContent && lowerMessage.includes(lead.postContent.substring(0, 15).toLowerCase())) score += 2;
        if (message.includes('?')) score += 1;

        return Math.min(score, 10);
    }
}

// Export singleton
export const aiMessageService = new AIMessageService();
