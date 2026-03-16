// Behavioral Scenario: LinkedIn connection request validation
//
// User story:
//   A sales rep tries to send connection requests through the app.
//   The system must protect them from two things:
//   1. Accidentally sending when LinkedIn isn't connected yet
//   2. Submitting a message that exceeds LinkedIn's 300-character hard limit
//      (which would get rejected silently or cause the connection to fail)
//
//   The daily limits display must also be trustworthy —
//   "77 remaining" should mean exactly that.
//
// What this IS testing:
//   - Does an unconnected send fail gracefully with a clear error code?
//   - Does an overlength message get caught before hitting LinkedIn's API?
//   - Does the limits display report honest, consistent numbers?

import { describe, it, expect, vi, beforeAll } from 'vitest'
import { unipileService } from '../../src/lib/unipile'

// Initialize with a fake API key so the service is configured for all tests
beforeAll(() => {
    unipileService.initialize({ apiKey: 'test-api-key' })
})

describe('Sending a connection request when LinkedIn is not connected', () => {

    it('returns a NOT_CONNECTED error, not a crash', async () => {
        // The service starts in disconnected state (no account set up)
        const result = await unipileService.sendConnectionRequest({
            recipientUrl: 'https://linkedin.com/in/sarah-chen',
            message: 'Hi Sarah, would love to connect.',
        })

        expect(result.success).toBe(false)
        expect(result.error?.code).toBe('NOT_CONNECTED')
    })

    it('provides a human-readable error message the UI can display', async () => {
        const result = await unipileService.sendConnectionRequest({
            recipientUrl: 'https://linkedin.com/in/sarah-chen',
        })

        expect(result.error?.message).toBeTruthy()
        expect(typeof result.error?.message).toBe('string')
    })
})

describe('Message length enforcement (LinkedIn hard limit: 300 chars)', () => {

    it('rejects a 301-character message before it reaches LinkedIn (connected account)', async () => {
        // Connect the service using fake timers to skip the 1.5s OAuth delay
        vi.useFakeTimers()
        const connectPromise = unipileService.handleOAuthCallback('fake-code')
        await vi.runAllTimersAsync()
        const account = await connectPromise
        vi.useRealTimers()

        expect(account.status).toBe('connected')

        const tooLong = 'A'.repeat(301)
        const result = await unipileService.sendConnectionRequest({
            recipientUrl: 'https://linkedin.com/in/sarah-chen',
            message: tooLong,
        })

        expect(result.success).toBe(false)
        expect(result.error?.code).toBe('MESSAGE_TOO_LONG')
    })

    it('does not flag a 300-character message as too long', async () => {
        // The service should still be connected from the previous test
        // Edge case: 300 chars is exactly on LinkedIn's limit — must not be rejected
        const exactly300 = 'A'.repeat(300)

        // Use fake timers to skip the 1s send delay
        vi.useFakeTimers()
        const sendPromise = unipileService.sendConnectionRequest({
            recipientUrl: 'https://linkedin.com/in/sarah-chen',
            message: exactly300,
        })
        await vi.runAllTimersAsync()
        const result = await sendPromise
        vi.useRealTimers()

        expect(result.error?.code).not.toBe('MESSAGE_TOO_LONG')
    })
})

describe('Daily limits display — numbers the rep can trust', () => {

    it('returns limits with the required fields', () => {
        const limits = unipileService.getDailyLimits()

        expect(limits.connectionRequests).toHaveProperty('limit')
        expect(limits.connectionRequests).toHaveProperty('used')
        expect(limits.connectionRequests).toHaveProperty('remaining')
    })

    it('shows remaining = limit - used (no phantom capacity)', () => {
        const limits = unipileService.getDailyLimits()
        const { limit, used, remaining } = limits.connectionRequests

        expect(remaining).toBe(limit - used)
    })

    it('daily connection limit is set to LinkedIn-safe threshold (≤100)', () => {
        const limits = unipileService.getDailyLimits()

        // LinkedIn's unofficial safe limit is ~100/day — we must not exceed this
        expect(limits.connectionRequests.limit).toBeLessThanOrEqual(100)
    })

    it('message limit is tracked separately from connection requests', () => {
        const limits = unipileService.getDailyLimits()

        expect(limits.messages).toHaveProperty('limit')
        expect(limits.messages).toHaveProperty('used')
        expect(limits.messages).toHaveProperty('remaining')
    })
})
