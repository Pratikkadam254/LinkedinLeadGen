---
name: sales-navigator-selectors
description: Update and maintain Sales Navigator DOM selectors when LinkedIn changes their page structure. Use when extraction breaks or after a LinkedIn UI update.
user-invocable: true
allowed-tools: Bash, Read, Glob, Grep, Edit, Write
---

## Update Sales Navigator Selectors

When LinkedIn changes their DOM structure:

1. Use Browser MCP or Playwright MCP to navigate to Sales Navigator
2. Inspect the current DOM structure for lead search results
3. Find stable selectors using this priority:
   - `data-anonymize` attributes (most stable - LinkedIn uses these for privacy compliance)
   - `aria-label` and `role` attributes (stable - LinkedIn maintains for a11y)
   - `data-*` custom attributes
   - Structural selectors (parent-child relationships) as last resort
   - NEVER use dynamic class names (e.g., `artdeco-*`, hashed classes)
4. Update selectors in `extension/src/shared/constants.ts`
5. Test with the `chrome-extension-test` skill
6. Document what changed and when in the selector file comments

Current selectors: !`cat extension/src/shared/constants.ts 2>/dev/null || echo 'not yet created'`
