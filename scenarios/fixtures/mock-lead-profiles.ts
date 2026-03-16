// Behavioral scenario fixtures
// These are realistic lead profiles used across scenario files.
// They represent real people a sales rep would encounter, not abstract test data.

import type { ScoringInput } from '../../src/lib/leadScoring'
import type { LeadContext, UserContext } from '../../src/lib/aiMessages'

// A senior decision-maker — exactly who the app is designed to surface
export const seniorLead: ScoringInput = {
    title: 'CEO',
    companySize: 200,
    followers: 8000,
    lastPostDays: 4,
    postContent: 'Excited to announce we are hiring and expanding into new markets. Big growth ahead for the team.',
    mutualConnections: 12,
    targetTitles: ['CEO', 'CTO', 'VP'],
    targetCompanySize: '51-200',
}

// A junior contact — lower priority, should score cold
export const juniorLead: ScoringInput = {
    title: 'Marketing Coordinator',
    companySize: 8,
    followers: 150,
    lastPostDays: 90,
    mutualConnections: 0,
}

// A mid-level lead — borderline warm
export const midLevelLead: ScoringInput = {
    title: 'Senior Manager',
    companySize: 500,
    followers: 1200,
    lastPostDays: 20,
    mutualConnections: 5,
}

// Lead context for AI message generation (requires full profile)
export const vpSalesLead: LeadContext = {
    firstName: 'Sarah',
    lastName: 'Chen',
    company: 'Acme SaaS',
    title: 'VP of Sales',
    linkedInUrl: 'https://linkedin.com/in/sarah-chen',
    score: 82,
    scoreTier: 'hot',
    mutualConnections: 7,
}

// The sender — the sales rep using the app
export const salesRepUser: UserContext = {
    firstName: 'Alex',
    lastName: 'Rivera',
    company: 'LeadFlow',
    title: 'Founder',
    primaryGoal: 'Connect with sales leaders to discuss pipeline automation',
}
