---
name: credit-system-manage
description: Manage the credit-based billing system for the extension. Use when implementing, debugging, or modifying credit logic.
user-invocable: true
allowed-tools: Bash, Read, Glob, Grep, Edit, Write
---

## Credit System Management

The credit system follows Evaboot's model:
- 1 credit per lead extracted
- Credits tracked in Convex `credits` table
- Transactions logged in `creditTransactions` table
- Server-side enforcement (never trust the client)

Key files:
- `convex/credits.ts` - Balance queries, deduction mutations
- `convex/extensions.ts` - Import mutation with credit check
- `extension/src/services/credit-manager.ts` - Client-side tracking

When modifying:
1. Always check credits BEFORE extraction starts (query)
2. Deduct atomically with lead insertion (single mutation)
3. Log every transaction with type and description
4. Handle race conditions (concurrent extractions from same user)
5. Monthly reset via Convex cron job

Credit plans:
- Free: 100 leads/month
- Starter: 500 leads/month
- Pro: 2,500 leads/month
- Enterprise: 10,000 leads/month
