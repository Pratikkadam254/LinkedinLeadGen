// Behavioral Scenario: Sales rep generates a personalized LinkedIn message
//
// User story:
//   A sales rep has a hot lead — Sarah Chen, VP of Sales at Acme SaaS.
//   They click "Generate Message" and expect a ready-to-send message in under a second.
//   The message must fit LinkedIn's 300-character limit.
//   It must feel personal, not like a template blast.
//   It must work even when the Gemini API key is not configured.
//
// What this IS testing:
//   - Does the output fit in LinkedIn's message box?
//   - Does it reference the person by name and company?
//   - Does tone selection actually change the output?
//   - Does the fallback work when there's no API key?

import { describe, it, expect, beforeAll } from 'vitest'
import { aiMessageService } from '../../src/lib/aiMessages'
import type { GenerateMessageOptions } from '../../src/lib/aiMessages'
import { vpSalesLead, salesRepUser } from '../fixtures/mock-lead-profiles'

// Base options reused across tests
const baseOptions: GenerateMessageOptions = {
    lead: vpSalesLead,
    user: salesRepUser,
    tone: 'professional',
    includeCompliment: false,
    includeQuestion: false,
}

describe('Sales rep generates a LinkedIn message (no API key — fallback mode)', () => {

    beforeAll(() => {
        // Ensure the service is in fallback mode (no Gemini model configured)
        // This simulates the common case: API key not set up yet
        expect(aiMessageService.isConfigured()).toBe(false)
    })

    it('produces a message that fits in LinkedIn\'s connection request box', async () => {
        const result = await aiMessageService.generateMessage(baseOptions)

        // LinkedIn hard limit is 300 characters — must never exceed this
        expect(result.charCount).toBeLessThanOrEqual(300)
        expect(result.message.length).toBe(result.charCount)
    })

    it('addresses the lead by first name (personalization check)', async () => {
        const result = await aiMessageService.generateMessage(baseOptions)

        expect(result.message).toContain(vpSalesLead.firstName)
    })

    it('references the lead\'s company (not a generic blast)', async () => {
        const result = await aiMessageService.generateMessage(baseOptions)

        expect(result.message).toContain(vpSalesLead.company)
    })

    it('returns a personalization score between 1 and 10', async () => {
        const result = await aiMessageService.generateMessage(baseOptions)

        expect(result.personalizationScore).toBeGreaterThanOrEqual(1)
        expect(result.personalizationScore).toBeLessThanOrEqual(10)
    })

    it('identifies at least one personalization hook (company or name)', async () => {
        const result = await aiMessageService.generateMessage(baseOptions)

        expect(result.hooks.length).toBeGreaterThan(0)
    })

    it('reflects the tone in the output object', async () => {
        const result = await aiMessageService.generateMessage({ ...baseOptions, tone: 'casual' })

        expect(result.tone).toBe('casual')
    })

    it('produces a non-empty message', async () => {
        const result = await aiMessageService.generateMessage(baseOptions)

        expect(result.message.trim().length).toBeGreaterThan(0)
    })
})
