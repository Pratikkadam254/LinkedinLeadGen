# Behavioral Scenarios — Holdout Set

## What this is

This directory contains **behavioral scenarios** — specs that check whether the app does what real users need.

This is **not** a unit test suite.

Unit tests ask: "does `parseCSV()` return the right value?"
Behavioral scenarios ask: "does a confused first-time user uploading a CSV at 11pm on a Saturday get their leads imported without losing data?"

The distinction matters. Unit tests verify implementation. Behavioral scenarios verify outcomes.

## Why scenarios live here, not in `src/`

This is a **holdout set**.

When AI assists in building features, it can inadvertently "teach to the test" if it sees the test files while writing the implementation. By keeping scenarios outside `src/`, they stay as an independent evaluation layer — the AI writes the implementation, the scenarios judge whether it actually worked for the user.

## How to run

```bash
npm run test:scenarios        # run once
npm run test:scenarios:watch  # re-run on file changes
```

## How to write a new scenario

1. Think of a real user, in a real moment, with a real need
2. Name the file after their situation: `[who]-[what]-[when].scenario.ts`
3. Write `describe()` blocks named after the user's goal, not the function being called
4. Assert outcomes, not implementation details

**Good:** `expect(result.leads).toHaveLength(3)` — the user got their 3 leads
**Bad:** `expect(mapHeaders).toHaveBeenCalledWith(...)` — testing internals

## Scenario index

| File | User story |
|------|-----------|
| `flows/first-time-user-uploads-leads.scenario.ts` | A confused first-time user uploads a messy CSV and expects all valid leads to be imported correctly |
| `flows/sales-rep-generates-message.scenario.ts` | A sales rep needs a personalized LinkedIn message within 30 seconds, without typing anything |
| `flows/lead-scoring-tiers.scenario.ts` | A user wants to know which leads to contact first — the scoring should surface senior decision-makers |
| `flows/linkedin-connection-validation.scenario.ts` | The system protects users from exceeding LinkedIn's limits and sending messages that are too long |
