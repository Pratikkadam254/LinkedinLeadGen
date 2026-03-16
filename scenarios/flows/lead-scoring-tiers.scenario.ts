// Behavioral Scenario: User wants to know which leads to contact first
//
// User story:
//   A sales rep imports 50 leads and needs to prioritize their outreach.
//   The app should surface senior decision-makers as "hot" and
//   rank junior contacts as "cold" — so the rep contacts the right people first.
//   The scoring must be consistent: running it twice on the same data gives the same result.
//
// What this IS testing:
//   - Does a CEO actually score higher than a Marketing Coordinator?
//   - Does batch scoring preserve all leads without dropping any?
//   - Is the scoring deterministic (same input → same output)?
//   - Does the score stay within sane bounds (0–100)?

import { describe, it, expect } from 'vitest'
import { scoreLead, scoreLeads } from '../../src/lib/leadScoring'
import { seniorLead, juniorLead, midLevelLead } from '../fixtures/mock-lead-profiles'

describe('Lead prioritization — senior decision-makers surface first', () => {

    it('classifies a CEO at an active mid-size company as hot', () => {
        const result = scoreLead(seniorLead)

        expect(result.tier).toBe('hot')
        expect(result.score).toBeGreaterThanOrEqual(75)
    })

    it('classifies a Marketing Coordinator at a small inactive company as cold', () => {
        const result = scoreLead(juniorLead)

        expect(result.tier).toBe('cold')
        expect(result.score).toBeLessThan(50)
    })

    it('scores a CEO higher than a Marketing Coordinator', () => {
        const seniorResult = scoreLead(seniorLead)
        const juniorResult = scoreLead(juniorLead)

        expect(seniorResult.score).toBeGreaterThan(juniorResult.score)
    })

    it('keeps the score within 0–100 (never overflows)', () => {
        // Even a maximally-weighted lead should not exceed 100
        const result = scoreLead(seniorLead)

        expect(result.score).toBeGreaterThanOrEqual(0)
        expect(result.score).toBeLessThanOrEqual(100)
    })

    it('is deterministic — scoring the same lead twice gives the same result', () => {
        const first = scoreLead(midLevelLead)
        const second = scoreLead(midLevelLead)

        expect(first.score).toBe(second.score)
        expect(first.tier).toBe(second.tier)
    })

    it('provides insights for a high-scoring lead so the rep knows why it is hot', () => {
        const result = scoreLead(seniorLead)

        // The rep needs to understand why this lead is worth contacting
        expect(result.insights.length).toBeGreaterThan(0)
    })

    it('includes a score breakdown across all dimensions', () => {
        const result = scoreLead(seniorLead)

        // Every dimension must be present — no missing data
        expect(result.breakdown).toHaveProperty('titleMatch')
        expect(result.breakdown).toHaveProperty('recentActivity')
        expect(result.breakdown).toHaveProperty('companySize')
        expect(result.breakdown).toHaveProperty('followerInfluence')
        expect(result.breakdown).toHaveProperty('mutualConnections')
        expect(result.breakdown).toHaveProperty('eventKeywords')
    })
})

describe('Batch scoring — importing 50 leads at once', () => {

    it('returns one result per lead (no leads silently dropped)', () => {
        const leads = [seniorLead, juniorLead, midLevelLead]
        const results = scoreLeads(leads)

        expect(results).toHaveLength(leads.length)
    })

    it('preserves the order of leads in batch output', () => {
        const leads = [seniorLead, juniorLead, midLevelLead]
        const results = scoreLeads(leads)

        // First lead in = first result out
        const individual = scoreLead(seniorLead)
        expect(results[0].score).toBe(individual.score)
    })

    it('handles an empty import without crashing', () => {
        const results = scoreLeads([])

        expect(results).toHaveLength(0)
    })
})
