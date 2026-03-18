# QuickConnect — Progress Tracker

## Project Summary

**What:** Simple LinkedIn connection automation micro-SaaS. Upload CSV → Send connection requests via Unipile → Track results.

**Pivoted from:** LeadFlow AI (complex AI-powered lead gen platform with strategies, scoring, message generation, n8n, PhantomBuster)

**Pivoted to:** QuickConnect (dead-simple: CSV upload → connect → track)

**Date started:** 2026-03-18

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Convex (serverless, real-time) |
| Auth | Clerk |
| LinkedIn API | Unipile |
| Icons | Phosphor Icons |
| Testing | Playwright (E2E) |

---

## What Was Removed

- All AI/strategy/scoring/campaign code
- `@google/generative-ai` dependency
- All Evaboot, n8n, PhantomBuster references
- 8-step onboarding questionnaire
- Lead scoring engine
- AI message generation (Gemini)
- Mock data / demo mode
- Strategy builder
- Campaign management
- 30+ files deleted, ~5,500 lines removed

---

## What Was Built (17 commits)

### Backend (Convex)

| File | Purpose |
|------|---------|
| `convex/schema.ts` | 5 tables: users, batches, leads, messages, activities |
| `convex/users.ts` | User CRUD, Unipile connection, internal queries |
| `convex/batches.ts` | Batch CRUD, start/pause/resume/cancel, stats, rate limit tracking |
| `convex/leads.ts` | Batch-based leads, bulk create with dedup, internal mutations |
| `convex/messages.ts` | Reply message tracking with dedup |
| `convex/activities.ts` | Activity logging (14 event types) |
| `convex/actions/unipile.ts` | Unipile API: sendInvite, resolveProviderId, fetchRelations, fetchChats, healthCheck |
| `convex/actions/outreach.ts` | Core sending engine (replaces n8n workflow) — inlines HTTP calls |
| `convex/actions/monitoring.ts` | checkConnections, detectReplies, healthCheckAll, autoResume, resetCounts |
| `convex/crons.ts` | 7 cron jobs (outreach 2min, connections 10min, replies 15min, health 30min, auto-resume 5min, daily reset midnight, weekly reset Monday) |

### Frontend (React)

| File | Purpose |
|------|---------|
| `src/pages/DashboardPage.tsx` | Main dashboard: status banners, batch progress, metric cards, activity feed, batch history |
| `src/pages/UploadPage.tsx` | CSV upload: drop zone, preview, message input, rate tier selector, "Start Connecting?" |
| `src/pages/BatchDetailPage.tsx` | Individual batch view: stats, leads table with status filters |
| `src/pages/OnboardingPage.tsx` | 2-step: Connect LinkedIn → Upload first CSV |
| `src/pages/LandingPage.tsx` | Rebranded for QuickConnect |
| `src/components/dashboard/MetricCards.tsx` | 6 cards: Sent, Accepted, Replies, Already Connected, Errors, Pending |
| `src/components/dashboard/BatchProgress.tsx` | Progress bar, ETA, rate tier, weekly limit, pause/resume/cancel |
| `src/components/dashboard/ActivityFeed.tsx` | Recent activities with icons and timestamps |
| `src/components/dashboard/BatchHistory.tsx` | Past batches table, clickable to detail |
| `src/components/dashboard/StatusBanner.tsx` | Warning banners (disconnected, rate limited, complete) |
| `src/components/layout/Sidebar.tsx` | Simplified: Dashboard, Import Leads, Settings |
| `src/lib/csvParser.ts` | Only LinkedIn URL required, message column detection, 300-char validation |
| `src/hooks/useBatches.ts` | Convex queries for batches |
| `src/hooks/usePolling.ts` | 30-second auto-refresh |

### Landing Page Updates

All components rebranded: HeroSection, FeaturesSection, HowItWorksSection, PricingSection, FAQSection, TestimonialSection, Header, Footer, Logo → "QuickConnect"

---

## Core User Flow

```
Landing Page → Sign Up (Clerk) → Onboarding Step 1: Connect LinkedIn (Unipile)
→ Onboarding Step 2: Upload First CSV → Dashboard

Dashboard:
  → Upload CSV → Parse & Preview → Write message (if no message column)
  → Choose rate tier → "Should we start connecting?" → Yes
  → Check Unipile connected → Create batch + leads → Start batch
  → Dashboard shows: progress bar, metrics, activity feed
  → Pause / Resume / Cancel controls
  → Batch completes → View in batch history
```

---

## Unipile API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/users/{identifier}` | GET | Resolve LinkedIn URL → provider_id |
| `/api/v1/users/invite` | POST | Send connection request (provider_id, account_id, message) |
| `/api/v1/users/relations` | GET | Check accepted connections (paginated) |
| `/api/v1/chats` | GET | Fetch conversations for reply detection |
| `/api/v1/chats/{id}/messages` | GET | Get messages in a chat |
| `/api/v1/accounts/{id}` | GET | Health check |

### Error Detection
- `"already_invited"` in error text → mark as "already_connected"
- HTTP 422 → rate limited → pause batch, auto-resume in 1 hour
- Other errors → mark lead as "error" with detail

---

## Rate Limiting

| Tier | Delay Between Sends | Daily Limit | Best For |
|------|---------------------|-------------|----------|
| Conservative | 45-90 min | ~16/day | New/free accounts |
| Normal | 20-40 min | ~36/day | Active paid accounts |
| Aggressive | 10-20 min | ~72/day | Premium accounts (risky) |

- **Weekly limit**: 200 invitations/week (auto-pause at 200, warning at 180)
- **Daily counts reset**: midnight (cron)
- **Weekly counts reset**: Monday midnight (cron)

---

## Key Design Decisions

1. **One batch at a time** — can't run multiple CSVs simultaneously
2. **Unipile model** — one master API key (our account), per-user account_id
3. **No AI** — user provides their own messages in CSV or types a global message
4. **No email notifications** — dashboard banners only
5. **Inline HTTP calls in outreach engine** — avoids Convex action-calling-action issues
6. **30-second polling** — dashboard auto-refreshes (could switch to Convex real-time later)
7. **Dedup** — within batch (CSV parse) + cross-batch (DB lookup by LinkedIn URL)
8. **Message safety net** — truncate to 300 chars before sending even if frontend validation missed it

---

## Environment Variables

| Variable | Where Set | Status |
|----------|-----------|--------|
| `CONVEX_DEPLOYMENT` | `.env.local` | ✅ Configured |
| `VITE_CONVEX_URL` | `.env.local` | ✅ Configured |
| `VITE_CLERK_PUBLISHABLE_KEY` | `.env.local` | ✅ Configured |
| `CLERK_SECRET_KEY` | `.env.local` | ✅ Configured |
| `UNIPILE_BASE_URL` | Convex env vars | ❌ Needs Unipile account |
| `UNIPILE_API_KEY` | Convex env vars | ❌ Needs Unipile account |

---

## Current Status: BLOCKED ON USER

### What's done ✅
- [x] All backend code (schema, functions, actions, crons)
- [x] All frontend code (dashboard, upload, onboarding, landing page)
- [x] Branding (LeadFlow AI → QuickConnect everywhere)
- [x] Build passes (zero TypeScript errors)
- [x] E2E tests pass (43 passed, 9 skipped)
- [x] Old docs archived to `docs/archive/`
- [x] README rewritten
- [x] .env.example updated
- [x] Convex dev deployment running
- [x] Dev server running at http://localhost:5174/

### What's blocked on Pratik ❌
- [ ] **Sign up at unipile.com** — create account
- [ ] **Connect LinkedIn inside Unipile dashboard** — get account_id
- [ ] **Share credentials** — API Key, Base URL, Account ID
- [ ] **Test the UI** at http://localhost:5174/ — report any issues

### What I'll do once unblocked
- [ ] Set Convex env vars (UNIPILE_BASE_URL, UNIPILE_API_KEY)
- [ ] Wire up real Unipile OAuth in onboarding (replace simulated "Connect LinkedIn")
- [ ] Test real connection request sending
- [ ] Deploy to production (Convex + Vercel)
- [ ] Set up monetization (TBD)

---

## Commit History

```
ac67aa4 chore: final polish - update package name, readme, types, archive old docs
59e3101 chore: clean up dead imports, delete orphaned files, fix E2E tests
04aeb90 feat: rebrand landing page to QuickConnect, remove AI messaging
9e66d6d feat: 2-step onboarding (connect LinkedIn + upload first CSV)
7daf258 feat: simplify upload page and add batch detail view
9631f72 feat: rebuild dashboard with metric cards, batch progress, activity feed
2618362 feat: update routing and sidebar for QuickConnect
73b15f3 feat: simplify CSV parser - only LinkedIn URL required
52c06fd feat: add monitoring crons (connections, replies, health) and auto-resume
7487c42 feat: add outreach processing engine (replaces n8n workflow)
9ce554e feat: add Unipile API actions (send invite, relations, chats, health check)
092a44b feat: add messages table for reply tracking and update activity types
c143e09 feat: rewrite leads for batch-based model with dedup and internal mutations
7f26f05 feat: add batch CRUD with start/pause/resume/cancel and stats
606787f feat: simplify user functions for QuickConnect
e083e79 feat: rewrite schema for QuickConnect (users, batches, leads, messages, activities)
d9b3690 chore: remove AI, strategy, campaign, and mock code for QuickConnect pivot
```

---

## Reference Code

| Source | Location | What it provides |
|--------|----------|-----------------|
| Unipile edge functions | `D:\LeadGenSaaS\context\edgefunctions\` | check-connections, detect-replies, enrich-profiles, health-check (ported to Convex) |
| n8n sending workflow | `D:\LeadGenSaaS\backend-n8n-workflowusedwithdashbaord.json` | Exact API calls for sending invites (replaced by outreach.ts) |
| Reference dashboard | `https://github.com/Realine-support/andrew-linkedin-dashboard.git` | Supabase + React monitoring app (inspiration for dashboard design) |
