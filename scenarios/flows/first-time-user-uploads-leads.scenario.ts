// Behavioral Scenario: First-time user uploads a CSV
//
// User story:
//   A sales rep finds the app at 11pm on a Saturday.
//   They export their LinkedIn connections as a CSV and drag it in.
//   The file has inconsistent column names — LinkedIn's export format, not our format.
//   They expect all valid leads to appear, and clear feedback on anything skipped.
//
// What this is NOT testing:
//   - The exact internal behavior of header mapping
//   - Whether any specific function was called
//   - Implementation details
//
// What this IS testing:
//   - Did the user's leads make it through?
//   - Did messy headers get handled gracefully?
//   - Did bad rows get reported, not silently swallowed?

import { describe, it, expect } from 'vitest'
import { parseCSV } from '../../src/lib/csvParser'

describe('First-time user uploads a messy CSV', () => {

    it('parses a LinkedIn-style export with spaced column names', () => {
        // LinkedIn exports use "First Name", "Last Name", "Job Title" etc.
        const csv = [
            'First Name,Last Name,Job Title,Company,LinkedIn URL',
            'Sarah,Chen,VP of Sales,Acme SaaS,https://linkedin.com/in/sarah-chen',
            'Marcus,Thompson,CTO,BuildCo,https://linkedin.com/in/marcus-t',
        ].join('\n')

        const result = parseCSV(csv)

        expect(result.leads).toHaveLength(2)
        expect(result.leads[0].firstName).toBe('Sarah')
        expect(result.leads[0].title).toBe('VP of Sales')
        expect(result.leads[1].company).toBe('BuildCo')
    })

    it('handles a "Name" column by splitting it into first and last name', () => {
        // Some CSV exports have a single "name" column
        const csv = [
            'name,title,company,linkedin',
            'Jane Smith,Director of Marketing,GrowthCo,https://linkedin.com/in/jane-smith',
        ].join('\n')

        const result = parseCSV(csv)

        expect(result.leads).toHaveLength(1)
        expect(result.leads[0].firstName).toBe('Jane')
        expect(result.leads[0].lastName).toBe('Smith')
    })

    it('skips rows with no name rather than importing corrupted data', () => {
        // A blank row or row missing the name field should be excluded
        const csv = [
            'First Name,Last Name,Title,Company',
            'Alice,Park,CEO,StartupXYZ',
            ',,Engineer,TechCorp',   // no name — should be skipped
            'Bob,Lee,Manager,BigCo',
        ].join('\n')

        const result = parseCSV(csv)

        // User gets the 2 valid leads, not 3 corrupted ones
        expect(result.leads).toHaveLength(2)
        expect(result.skippedRows).toBeGreaterThan(0)
    })

    it('reports missing company as an error but still includes the lead', () => {
        // A lead without a company is still a lead — the user can fill it in later
        const csv = [
            'First Name,Last Name,Title,Company',
            'Tom,Bauer,Head of Growth,',
        ].join('\n')

        const result = parseCSV(csv)

        // The lead is included (not skipped)
        expect(result.leads).toHaveLength(1)
        expect(result.leads[0].firstName).toBe('Tom')
        // But an error is reported so the user knows something is incomplete
        expect(result.errors.some(e => e.field === 'company')).toBe(true)
    })

    it('auto-generates a LinkedIn URL when not provided', () => {
        // The user forgot to include the LinkedIn column but we can still derive a URL
        const csv = [
            'First Name,Last Name,Title,Company',
            'Priya,Patel,CTO,InnovateTech',
        ].join('\n')

        const result = parseCSV(csv)

        expect(result.leads[0].linkedInUrl).toMatch(/linkedin\.com\/in\/priya/)
    })

    it('handles a semicolon-delimited file from European Excel exports', () => {
        const csv = [
            'First Name;Last Name;Title;Company',
            'Hans;Mueller;VP Engineering;AutomateGmbH',
        ].join('\n')

        const result = parseCSV(csv)

        expect(result.leads).toHaveLength(1)
        expect(result.leads[0].company).toBe('AutomateGmbH')
    })

    it('skips empty rows without crashing or inflating the lead count', () => {
        const csv = [
            'First Name,Last Name,Title,Company',
            'Elena,Voss,Founder,CloudStart',
            '',
            '   ',
            'Jin,Park,Director,SaaSCo',
        ].join('\n')

        const result = parseCSV(csv)

        // Blank lines are filtered out before counting — the user gets 2 valid leads
        expect(result.leads).toHaveLength(2)
        // totalRows reflects the non-empty data rows (blanks are stripped before parsing)
        expect(result.totalRows).toBe(2)
    })
})
