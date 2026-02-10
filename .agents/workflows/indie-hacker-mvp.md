---
description: Indie hacker MVP shipping workflow - fast validation, lean development
---

# Indie Hacker MVP Workflow

Use this when building new features or MVPs.

## Before Coding
// turbo-all
1. Define the ONE core problem being solved
2. Identify the minimum feature set (1-3 features max)
3. Set a 2-week deadline for v1

## Development Sprint
// turbo
1. Day 1-2: Implement core feature
2. Day 3-4: Basic functional UI (not beautiful)
3. Day 5: Integration and basic testing
4. Day 6-7: Polish critical user flows
5. Day 8: Deploy to production
6. Day 9-10: Share with 10 users, collect feedback

## Decision Framework
When unsure about a feature, ask:
1. "Will this help me get 10 paying users?"
2. "Can I validate this manually first?"
3. "What's the simplest version?"

If answer to #1 is "no" → don't build it yet.

## Anti-Patterns to Avoid
- ❌ Building features no one asked for
- ❌ Premature optimization
- ❌ Perfect code before product-market fit
- ❌ Building for imaginary scale

## Use Existing Tools
// turbo
- Auth: Use Clerk (5-minute setup)
- Backend: Use Convex (zero-config)
- UI: Use Shadcn/ui (copy-paste)
- Deploy: Use Vercel (git push)
