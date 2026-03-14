# LeadFlow AI

**Upload leads. AI writes messages. You approve and send.**

Simple LinkedIn outreach for founders and sales teams. No complex workflows, no multi-tool setups -- just upload a CSV, let Claude write personalized connection messages, review them, and send via LinkedIn.

**Pro** $59/mo | **Elite** $249/mo

---

## System Architecture

```
                          +------------------+
                          |   Clerk Auth     |
                          |  (SSO / Email)   |
                          +--------+---------+
                                   |
                    +--------------+--------------+
                    |                             |
           +-------v--------+          +---------v---------+
           |  React / Vite  |          |   Convex Backend   |
           |   Frontend     |<-------->|  (Serverless DB +  |
           |                |  realtime|   Functions)       |
           +----------------+  queries +---------+---------+
                                       |         |         |
                              +--------+    +----+----+    +---------+
                              |             |         |              |
                      +-------v---+  +------v--+  +--v--------+  +--v--------+
                      | Claude API|  | Stripe  |  | Unipile   |  | Convex DB |
                      | (Messages)|  | (Billing)|  | (LinkedIn)|  | (Storage) |
                      +-----------+  +---------+  +-----------+  +-----------+
```

## User Flow

```
Sign Up (Clerk)
    |
    v
Onboarding (4 ICP questions)
    |  - Target industries
    |  - Target titles
    |  - Company size
    |  - Message tone
    v
Upload CSV
    |
    v
AI Scores Leads (weighted multi-factor)
    |  - Title match, company size, activity
    |  - Hot (80+) / Warm (60-79) / Cold (<60)
    v
Generate Messages (Claude claude-sonnet-4-20250514)
    |  - Personalized per lead
    |  - Uses ICP preferences + lead data
    v
Review & Approve (batch approval UI)
    |  - Edit individual messages
    |  - Bulk approve / reject
    v
Send via Unipile (LinkedIn API)
    |  - Connection requests with message
    |  - Rate-limited, mock mode available
    v
Track on Dashboard
    - Total leads, messages generated, outreach sent
    - Response rates, acceptance tracking
    - Activity feed
```

## Data Model

```
users
  |-- clerkId, email, name
  |-- preferences (ICP: industries, titles, company size, tone)
  |-- plan (free | pro | elite), stripeCustomerId
  |-- unipileConnected, unipileAccountId
  |-- currentMonthUsage { leadsUploaded, outreachSent, resetAt }
  |
  +--< leads
  |     |-- firstName, lastName, company, title, linkedInUrl
  |     |-- score (0-100), scoreTier (hot | warm | cold)
  |     |-- messageStatus (empty | draft | approved | ready | sent)
  |     |-- outreachStatus (pending | sent | accepted | replied)
  |     |-- generatedMessage, messageTone
  |     +-- source (csv | manual), importedAt
  |
  +--< activities
  |     |-- type (lead_imported | message_generated | connection_sent | ...)
  |     +-- metadata, createdAt
  |
  +--< strategies
  |     |-- name, rawInputs, icpDocument, offerDocument
  |     +-- isActive
  |
  +--< campaigns
        |-- name, status (active | paused | completed)
        |-- schedule { timezone, days, hours }
        +-- stats { sent, replied, booked, revenue }
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite 6 |
| Routing | React Router v7 |
| Backend | Convex (serverless DB + functions) |
| Auth | Clerk |
| AI | Claude API (claude-sonnet-4-20250514) |
| Payments | Stripe (Checkout + Customer Portal + Webhooks) |
| LinkedIn | Unipile API (connection requests, messaging) |
| Icons | Lucide React |
| Styling | Custom CSS with CSS variables (Notion-inspired light theme) |

## Features

1. **CSV Lead Import** -- Upload a CSV with name, company, title, LinkedIn URL. Duplicate detection by URL. Preview before import.

2. **AI Lead Scoring** -- Multi-factor weighted algorithm scores leads 0-100. Considers title match, company size, follower influence, recent activity, mutual connections.

3. **AI Message Generation** -- Claude writes personalized outreach messages using your ICP preferences and each lead's profile data. Batch generation for multiple leads.

4. **Batch Approval Workflow** -- Review AI-generated messages in a card-based UI. Edit individual messages, bulk approve, or regenerate. Messages flow: empty -> draft -> approved -> sent.

5. **LinkedIn Automation** -- Send connection requests with personalized messages via Unipile API. Webhook-driven status tracking (sent, accepted, replied). Mock mode when Unipile isn't configured.

6. **Subscription Billing** -- Stripe-powered with two tiers. Pro ($59/mo): 500 leads, 200 outreach/month. Elite ($249/mo): 2,000 leads, 800 outreach/month. Usage tracking with monthly resets.

## Pricing

| | Pro | Elite |
|---|---|---|
| Price | $59/mo | $249/mo |
| Leads/month | 500 | 2,000 |
| Outreach/month | 200 | 800 |
| LinkedIn accounts | 1 | 3 |
| Autopilot mode | -- | Yes |

## Quick Start

```bash
# 1. Clone and install
git clone <repo-url>
cd LinkedinLeadGen
npm install

# 2. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Clerk and Convex keys

# 3. Start Convex backend (in a separate terminal)
npx convex dev

# 4. Start frontend
npm run dev

# 5. Open http://localhost:5173
```

## Environment Variables

### Frontend (.env.local)

| Variable | Description |
|----------|-------------|
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk publishable key from [dashboard.clerk.com](https://dashboard.clerk.com) |
| `VITE_CONVEX_URL` | Convex deployment URL from [dashboard.convex.dev](https://dashboard.convex.dev) |

### Backend (Convex Dashboard > Settings > Environment Variables)

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Claude API key from [console.anthropic.com](https://console.anthropic.com) |
| `STRIPE_SECRET_KEY` | Stripe secret key (use `sk_test_` for development) |
| `STRIPE_PRO_PRICE_ID` | Stripe Price ID for Pro plan |
| `STRIPE_ELITE_PRICE_ID` | Stripe Price ID for Elite plan |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret (`whsec_...`) |
| `UNIPILE_DSN` | Unipile DSN (e.g. `api1.unipile.com:13337`) |
| `UNIPILE_API_KEY` | Unipile API access token |
| `APP_URL` | Your app's public URL (e.g. `http://localhost:5173`) |

## Project Structure

```
src/
  pages/
    LandingPage.tsx          # Marketing page with hero, pricing, FAQ
    SignInPage.tsx            # Clerk sign-in
    SignUpPage.tsx            # Clerk sign-up
    OnboardingPage.tsx        # 4-question ICP setup wizard
    DashboardPage.tsx         # Stats overview + activity feed
    UploadPage.tsx            # CSV upload with preview + step indicator
    LeadsPage.tsx             # Lead table with search, sort, filter
    ApprovalPage.tsx          # Batch message approval workflow
    SettingsPage.tsx          # Account, ICP, billing, LinkedIn connection
  components/
    landing/                  # HeroSection, PricingSection, FAQSection, etc.
    dashboard/                # DashboardLayout, LeadsTable, LeadDetailPanel
    onboarding/               # OnboardingProgress, OnboardingQuestion
    ui/                       # Toast, Logo
  hooks/                      # useSyncedUser, useLeads, useActivities
  contexts/                   # UnipileContext
  lib/
    csvParser.ts              # CSV parsing + validation
    leadScoring.ts            # Multi-factor scoring algorithm
    aiMessages.ts             # Claude prompt templates
    unipile.ts                # Unipile type definitions
    convex.tsx                # Convex client setup

convex/
  schema.ts                   # Database schema (users, leads, activities, ...)
  users.ts                    # User CRUD, subscription management
  leads.ts                    # Lead CRUD, scoring, message status
  activities.ts               # Activity log queries
  campaigns.ts                # Campaign management
  strategies.ts               # Strategy/ICP document management
  stripe.ts                   # Checkout session + portal creation
  http.ts                     # Stripe webhook + Unipile webhook handlers
  actions/
    generateMessages.ts       # Claude API calls for message generation
    sendOutreach.ts           # Unipile API calls for LinkedIn outreach
    unipileConnect.ts         # Unipile hosted auth link generation
```

## API Integrations

### Claude API
- Model: `claude-sonnet-4-20250514`
- Used for: Generating personalized LinkedIn outreach messages
- Called from: `convex/actions/generateMessages.ts`
- Auth: `x-api-key` header with `ANTHROPIC_API_KEY`

### Stripe
- Checkout Sessions for subscription signup
- Customer Portal for billing management
- Webhooks: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
- Webhook signature verification: HMAC-SHA256 via Web Crypto API
- Called from: `convex/stripe.ts` (actions) and `convex/http.ts` (webhook handler)

### Unipile
- Base URL: `https://{UNIPILE_DSN}/api/v1/`
- Auth: `X-API-KEY` header (not Bearer token)
- Endpoints used:
  - `POST /users/invite` -- Send LinkedIn connection request
  - `POST /hosted/accounts/link` -- Generate hosted auth link for account connection
  - `GET /accounts/{id}` -- Check account connection status
- Webhooks: `connection.accepted`, `message.delivered`, `message.received`
- Mock mode: When `UNIPILE_DSN` is not set, outreach is simulated locally

## Deployment

**Frontend**: Deploy to Vercel
```bash
npm run build    # outputs to dist/
```

**Backend**: Deploy Convex
```bash
npx convex deploy
```

Set all environment variables in both Vercel (frontend vars) and Convex Dashboard (backend vars).

## License

Private -- All rights reserved.
