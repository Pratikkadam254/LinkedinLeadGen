# LeadFlow AI — System Design & Architecture
## Exact Evaboot Clone (Production Blueprint)

> **Status**: Architecture v1.0 | March 2026
> **Scope**: 100% Evaboot feature parity (minus email verification)
> **Stack**: WXT Chrome Extension + Convex Backend + React Dashboard

---

## 1. HIGH-LEVEL ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CHROME EXTENSION (MV3)                       │
│                                                                     │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │  Popup    │  │Content Script │  │  Background  │  │  Injected  │ │
│  │  (React)  │  │ (Orchestrator│  │  Service     │  │  Main World│ │
│  │           │  │  + UI Inject)│  │  Worker      │  │  (Voyager  │ │
│  │ - Auth    │  │              │  │              │  │   Intercept)│ │
│  │ - Credits │  │ - DOM Scraper│  │ - Convex IPC │  │            │ │
│  │ - Status  │  │ - Auto Scroll│  │ - Batch Queue│  │ - fetch()  │ │
│  │ - Export  │  │ - Anti-Detect│  │ - Credit Mgr │  │   patch    │ │
│  │           │  │ - CSV Export │  │ - Auth Refresh│  │ - XHR      │ │
│  │           │  │ - Filter     │  │              │  │   patch    │ │
│  │           │  │   Validator  │  │              │  │            │ │
│  └─────┬─────┘  └──────┬───────┘  └──────┬───────┘  └─────┬──────┘ │
│        │               │                 │                │        │
│        └───────────────┼─── chrome.runtime.sendMessage ───┘        │
│                        │                 │                          │
└────────────────────────┼─────────────────┼──────────────────────────┘
                         │                 │
                         │    ConvexHttpClient (HTTPS)
                         │                 │
┌────────────────────────┼─────────────────┼──────────────────────────┐
│                        │   CONVEX BACKEND│                          │
│                        ▼                 ▼                          │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    MUTATIONS / QUERIES                       │   │
│  │                                                             │   │
│  │  extensions.ts    leads.ts    credits.ts    webhooks.ts     │   │
│  │  ┌─────────────┐ ┌─────────┐ ┌──────────┐ ┌─────────────┐ │   │
│  │  │importFrom   │ │create   │ │getBalance│ │fireWebhook  │ │   │
│  │  │Extension    │ │bulkCreate│ │deduct    │ │registerHook │ │   │
│  │  │createExtract│ │update   │ │enforce   │ │listHooks    │ │   │
│  │  │updateProgress│ │filter  │ │resetMonth│ │deleteHook   │ │   │
│  │  │complete     │ │getStats │ │getHistory│ │             │ │   │
│  │  │validateFilter│ │        │ │          │ │             │ │   │
│  │  └─────────────┘ └─────────┘ └──────────┘ └─────────────┘ │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                      ACTIONS (Server-side)                  │   │
│  │                                                             │   │
│  │  strategy.ts (Gemini AI)    autopilot.ts    webhook-fire.ts │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                      CRON JOBS                               │   │
│  │                                                             │   │
│  │  Monthly credit reset    Stale extraction cleanup            │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                      DATABASE (10+ tables)                  │   │
│  │                                                             │   │
│  │  users | leads | leadEnrichments | credits | creditTxns     │   │
│  │  extractions | activities | strategies | campaigns          │   │
│  │  webhookEndpoints | filterMatchResults                      │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│                    CLERK AUTH (JWT validation)                       │
└─────────────────────────────────────────────────────────────────────┘
                         │
                         │ Clerk + Convex Auth
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      REACT WEB DASHBOARD                            │
│                                                                     │
│  Landing | Auth | Onboarding | Dashboard | Leads | Extractions     │
│  Strategy | Campaigns | Settings | Webhooks                        │
│                                                                     │
│  Vite + React + TailwindCSS + Convex React Client                 │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. COMPONENT ARCHITECTURE

### 2.1 Chrome Extension (WXT + MV3)

```
extension/src/
├── entrypoints/
│   ├── background.ts          # Service worker: message routing, batch queue, auth
│   ├── content.ts             # Content script: orchestration, lifecycle management
│   └── popup/
│       ├── App.tsx            # Popup UI: auth, credits, progress, export
│       └── index.html
│
├── core/                      # Pure business logic (no browser APIs)
│   ├── voyager-interceptor.ts # Patches fetch/XHR in main world to capture Voyager API
│   ├── data-parser.ts         # Name/title/company cleaning, dedup, email guessing
│   ├── dom-scraper.ts         # Fallback: extract leads from visible DOM elements
│   ├── auto-scroller.ts       # Paginate through search results with human-like scrolling
│   ├── csv-exporter.ts        # Generate CSV with Evaboot-compatible columns
│   └── filter-validator.ts    # [NEW] Compare leads against search filters → MATCH/NO_MATCH
│
├── anti-detection/            # 4-layer defense system
│   ├── fingerprint-guard.ts   # Shadow DOM, zero web_accessible_resources, probe detection
│   ├── behavior-simulator.ts  # Mouse jitter, scroll curves, reading pauses
│   ├── request-scheduler.ts   # Rate limiting, time-of-day throttling, gaussian jitter
│   └── detection-monitor.ts   # Threat scoring, safe mode, auto-cooldown (15 min)
│
├── services/                  # External integrations
│   ├── convex-client.ts       # ConvexHttpClient with retry, auth, batch mutations
│   ├── credit-manager.ts      # Client-side credit tracking (server enforces)
│   └── storage.ts             # chrome.storage.local abstraction
│
├── content/
│   └── injector.ts            # Injects "Extract with LeadFlow" button + progress overlay
│
└── shared/
    ├── types.ts               # Shared TypeScript interfaces
    └── constants.ts           # All magic numbers centralized
```

#### Key Data Flows

**Extraction Flow (Happy Path)**:
```
User clicks "Extract with LeadFlow"
    │
    ├─→ content.ts: START_EXTRACTION → background.ts
    │       │
    │       └─→ createExtraction() → Convex (creates extraction record)
    │
    ├─→ auto-scroller.ts: navigate pages
    │       │
    │       ├─→ voyager-interceptor.ts: capture API response (primary)
    │       │       │
    │       │       └─→ data-parser.ts: clean + normalize → ExtractedLead[]
    │       │
    │       └─→ dom-scraper.ts: extract from DOM (fallback)
    │               │
    │               └─→ data-parser.ts: clean + normalize → ExtractedLead[]
    │
    ├─→ filter-validator.ts: compare each lead to original search filters
    │       │
    │       └─→ Mark as MATCH or NO_MATCH with reasons
    │
    ├─→ content.ts: LEADS_EXTRACTED → background.ts (batch of 50)
    │       │
    │       └─→ importLeads() → Convex (with retry + backoff)
    │               │
    │               ├─→ Deduplicate by LinkedIn URL
    │               ├─→ Insert leads + enrichment data
    │               ├─→ Deduct credits (SERVER-SIDE enforcement)
    │               ├─→ Log activity
    │               └─→ Fire webhooks (if configured)
    │
    ├─→ content.ts: EXTRACTION_COMPLETE → background.ts
    │       │
    │       └─→ completeExtraction() → Convex
    │
    └─→ injector.ts: show summary panel
            │
            ├─→ "Export to CSV" button
            ├─→ "View in Dashboard" button
            └─→ Stats: X leads, Y matched, Z credits used
```

### 2.2 Convex Backend

```
convex/
├── _generated/                # Auto-generated (npx convex dev)
│   ├── api.d.ts
│   └── api.js
│
├── schema.ts                  # Database schema (12 tables)
│
├── auth.config.ts             # Clerk auth provider config
│
├── extensions.ts              # Chrome extension mutations
│   ├── importFromExtension    # Batch import with credit enforcement + webhook fire
│   ├── createExtraction       # Start extraction record
│   ├── updateExtractionProgress
│   ├── completeExtraction
│   └── validateFilterMatch    # [NEW] Server-side filter validation
│
├── leads.ts                   # Lead CRUD + scoring
│   ├── create / bulkCreate
│   ├── updateScore
│   ├── updateMessage / approveMessage
│   ├── markAsSent / updateOutreachStatus
│   ├── getStats               # Dashboard aggregates
│   └── exportLeads            # [NEW] Server-side CSV generation
│
├── credits.ts                 # Credit system (server-enforced)
│   ├── getBalance
│   ├── deductCredits          # [NEW] Atomic deduction with validation
│   ├── initializeCredits
│   ├── getTransactions
│   └── enforceLimit           # [NEW] Reject if insufficient
│
├── webhooks.ts                # [NEW] Webhook management
│   ├── register               # Add webhook endpoint
│   ├── list                   # Get user's webhooks
│   ├── delete                 # Remove webhook
│   └── test                   # Send test payload
│
├── users.ts                   # User management
├── activities.ts              # Activity log
├── campaigns.ts               # Campaign management
├── strategies.ts              # AI strategy queries
│
├── actions/
│   ├── strategy.ts            # Gemini AI for ICP/offer generation
│   ├── autopilot.ts           # Campaign automation
│   └── webhook-fire.ts        # [NEW] HTTP POST to registered webhooks
│
├── crons.ts                   # Scheduled jobs
│   ├── monthlyCreditsReset    # Reset balances on billing cycle
│   └── cleanupStaleExtractions # Mark abandoned extractions as failed
│
└── http.ts                    # [NEW] HTTP endpoints for external access
    └── POST /api/webhooks/test
```

### 2.3 Web Dashboard (React)

```
src/
├── pages/
│   ├── LandingPage.tsx        # Marketing site
│   ├── SignInPage.tsx          # Clerk sign-in
│   ├── SignUpPage.tsx          # Clerk sign-up
│   ├── OnboardingPage.tsx     # Preference wizard
│   ├── DashboardPage.tsx      # Main hub: stats, activity feed, quick actions
│   ├── LeadsPage.tsx          # Lead table with filtering, sorting, bulk actions
│   ├── ExtractionsPage.tsx    # [NEW] Extraction history with filter match stats
│   ├── CampaignsPage.tsx      # Outreach campaigns
│   ├── StrategyPage.tsx       # ICP & messaging strategy (Gemini AI)
│   ├── WebhooksPage.tsx       # [NEW] Manage webhook endpoints
│   ├── SettingsPage.tsx       # Account settings, preferences
│   └── UploadPage.tsx         # CSV import
│
├── components/
│   ├── dashboard/
│   │   ├── LeadsTable.tsx     # Sortable, filterable lead table
│   │   ├── LeadDetailPanel.tsx # Side panel: full lead profile
│   │   ├── FilterMatchBadge.tsx # [NEW] MATCH/NO_MATCH indicator
│   │   └── ExtractionCard.tsx  # [NEW] Extraction summary card
│   │
│   ├── ai/
│   │   └── AIMessageGenerator.tsx # AI-powered personalized messages
│   │
│   └── shared/
│       ├── Layout.tsx
│       ├── Sidebar.tsx
│       └── ErrorBoundary.tsx
│
├── hooks/
│   ├── useLeads.ts
│   ├── useCredits.ts
│   ├── useExtractions.ts      # [NEW]
│   └── useWebhooks.ts         # [NEW]
│
└── lib/
    ├── convex.ts              # Convex client setup
    └── clerk.ts               # Clerk auth setup
```

---

## 3. DETAILED COMPONENT DESIGNS

### 3.1 Filter Match Validation (Evaboot's Key Feature)

**What it does**: Compares each extracted lead against the original Sales Navigator search filters and marks them as MATCH or NO_MATCH with specific reasons. Evaboot reports that 20-30% of Sales Navigator results DON'T actually match the filters.

**File**: `extension/src/core/filter-validator.ts`

```typescript
// Types
interface FilterMatchResult {
  isMatch: boolean;
  confidence: number;        // 0-100
  mismatches: FilterMismatch[];
}

interface FilterMismatch {
  field: string;             // e.g., "title", "company_headcount", "geography"
  filter: string;            // What the user searched for
  actual: string;            // What was found on the lead
  reason: string;            // Human-readable explanation
}

interface SearchFilters {
  // Parsed from Sales Navigator URL parameters + Voyager API
  titles?: string[];         // Job title keywords
  seniorityLevels?: string[]; // VP, Director, C-Suite, etc.
  companyHeadcount?: { min: number; max: number }[];
  industries?: string[];
  geographies?: string[];
  companyNames?: string[];
  yearsInPosition?: { min: number; max: number };
  yearsInCompany?: { min: number; max: number };
}
```

**How it works**:
1. When extraction starts, parse the Sales Navigator URL to extract search filters
2. Also capture the Voyager API request payload which contains the full filter object
3. For each extracted lead, compare against each active filter:
   - **Title match**: Fuzzy match lead.title against filter title keywords
   - **Seniority match**: Map title to seniority level, compare
   - **Headcount match**: Check company headcount falls in filter range
   - **Industry match**: Compare company industry against filter industries
   - **Geography match**: Compare lead location against filter geographies
4. If ANY filter doesn't match → mark as NO_MATCH with specific reasons
5. Store results alongside the lead data

**Parsing Sales Navigator URL filters**:
```
URL pattern: /sales/search/people?query=...&titleIncluded=...&companySize=...
Voyager API: POST body contains full BooleanExpression filter tree
```

**Why this matters**: This is what makes Evaboot honest and trustworthy. Users pay for leads that MATCH their criteria. Flagging non-matches builds trust and helps users refine their searches.

---

### 3.2 Credit System (Server-Side Enforcement)

**Current problem**: Credits are enforced client-side only. The server trusts whatever the client reports.

**New design**: Server-side atomic enforcement.

```
┌──────────┐     ┌──────────┐     ┌──────────────┐
│Extension │────►│ Convex   │────►│ credits      │
│ sends    │     │ mutation │     │ table        │
│ batch    │     │          │     │              │
│ of 50    │     │ 1. Check │     │ balance: 150 │
│ leads    │     │    balance│     │ plan: free   │
│          │     │ 2. If OK │     │              │
│          │     │    insert │     │              │
│          │     │ 3. Deduct│     │              │
│          │     │ 4. Log   │     │              │
│          │     │ 5. Return│     │              │
└──────────┘     └──────────┘     └──────────────┘
```

**Key rules**:
- 1 credit = 1 lead extracted (simplified from Evaboot's 2-credit model since we skip email verification)
- Server REJECTS the entire batch if insufficient credits
- Atomic: deduction happens in same transaction as insert
- Overage: returns partial result (imports what credits allow, returns remainder count)
- Monthly reset via Convex cron job

**Credit enforcement in `importFromExtension`**:
```typescript
// Before inserting ANY leads:
const availableCredits = creditRecord.balance;
const leadsToImport = Math.min(args.leads.length, availableCredits);

if (leadsToImport === 0) {
  throw new Error("INSUFFICIENT_CREDITS");
}

// Only process leadsToImport leads (not the full batch)
const batch = args.leads.slice(0, leadsToImport);
// ... insert leads, deduct credits atomically
```

---

### 3.3 Webhook System

**File**: `convex/webhooks.ts` + `convex/actions/webhook-fire.ts`

**Schema addition**:
```typescript
webhookEndpoints: defineTable({
  userId: v.id("users"),
  url: v.string(),              // https://hooks.zapier.com/...
  events: v.array(v.string()),  // ["lead.imported", "extraction.completed"]
  secret: v.string(),           // HMAC signing key
  isActive: v.boolean(),
  lastFiredAt: v.optional(v.number()),
  failureCount: v.number(),     // Disable after 10 consecutive failures
  createdAt: v.number(),
})
```

**Webhook events**:
| Event | Trigger | Payload |
|-------|---------|---------|
| `lead.imported` | Each batch import | `{ leads: [...], extractionId, count }` |
| `extraction.started` | User starts extraction | `{ extractionId, searchUrl, filters }` |
| `extraction.completed` | Extraction finishes | `{ extractionId, totalLeads, duration, matchRate }` |
| `credits.low` | Balance < 10% of allocation | `{ balance, plan, resetDate }` |

**Webhook payload format** (Zapier/Make compatible):
```json
{
  "event": "lead.imported",
  "timestamp": 1710489600000,
  "data": {
    "leads": [
      {
        "firstName": "John",
        "lastName": "Doe",
        "title": "VP Engineering",
        "company": "Acme Corp",
        "linkedInUrl": "https://linkedin.com/in/johndoe",
        "filterMatch": true
      }
    ]
  },
  "signature": "sha256=abc123..."
}
```

**Security**: HMAC-SHA256 signature using user's webhook secret. Recipients verify with `X-LeadFlow-Signature` header.

---

### 3.4 Anti-Detection System (4 Layers)

```
┌─────────────────────────────────────────────────────────────────┐
│                    ANTI-DETECTION STACK                          │
│                                                                 │
│  Layer 4: DETECTION MONITOR                                     │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Threat Scoring Engine                                     │  │
│  │ - Watches for 429, 403, CAPTCHA, DOM probes               │  │
│  │ - Scores: low(1) medium(3) high(5) critical(10)          │  │
│  │ - Safe mode at score >= 8 in 5-minute window              │  │
│  │ - 15-minute cooldown (configurable)                       │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Layer 3: REQUEST SCHEDULER                                     │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Rate Limiting with Human Patterns                         │  │
│  │ - 2,500 leads/day hard cap                                │  │
│  │ - Time-of-day multipliers:                                │  │
│  │   9am-5pm: 1.0x | 7-9am,5-8pm: 1.5x | 8pm-7am: 3.0x   │  │
│  │ - Gaussian jitter (±30% standard deviation)               │  │
│  │ - 10-30s pause every 100 leads                            │  │
│  │ - 45-minute max session duration                          │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Layer 2: BEHAVIOR SIMULATOR                                    │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Human-like Interaction Patterns                           │  │
│  │ - Mouse: bezier curves, random jitter, 5s intervals       │  │
│  │ - Scroll: ease-in-out curves, variable speed              │  │
│  │ - Dwell: 400-1200ms per result (reading time)             │  │
│  │ - Pause: 2-5s every 3-7 results (thinking time)           │  │
│  │ - Page visibility: pause when tab not focused              │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Layer 1: FINGERPRINT GUARD                                     │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Extension Detection Prevention                            │  │
│  │ - Zero web_accessible_resources in manifest               │  │
│  │ - All UI in closed Shadow DOM (invisible to page JS)      │  │
│  │ - Cleanup data-lf-* on navigation                         │  │
│  │ - PerformanceObserver for resource timing probes           │  │
│  │ - No detectable globals or prototype modifications         │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 3.5 Data Cleaning Pipeline

```
Raw Voyager API Data
        │
        ▼
┌─────────────────┐
│   NAME CLEANING  │
│                  │
│ 1. Strip emojis  │  "🚀 JOHN DOE" → "John Doe"
│ 2. Strip special │  "John (CEO)" → "John"
│ 3. Fix casing    │  "JOHN DOE" → "John Doe"
│ 4. Trim spaces   │  " John  Doe " → "John Doe"
└────────┬─────────┘
         │
         ▼
┌─────────────────┐
│  TITLE CLEANING  │
│                  │
│ 1. Remove "at X" │  "CEO at Acme" → "CEO"
│ 2. Remove pipe   │  "CEO | Acme" → "CEO"
│ 3. Strip emojis  │
│ 4. Fix casing    │
│ 5. Standardize*  │  "VP Eng" → "VP Engineering"
└────────┬─────────┘
         │
         ▼
┌─────────────────┐
│COMPANY CLEANING  │
│                  │
│ 1. Remove legal  │  "Acme Inc." → "Acme"
│    suffixes      │  "Tech GmbH" → "Tech"
│ 2. Strip emojis  │
│ 3. Fix casing    │
│ 4. Extract domain│  linkedin.com/company/acme → acme.com
└────────┬─────────┘
         │
         ▼
┌─────────────────┐
│ DEDUPLICATION    │
│                  │
│ Primary key:     │  LinkedIn URL (exact match)
│ Fallback key:    │  normalize(first+last+company)
│                  │  Case-insensitive
└────────┬─────────┘
         │
         ▼
┌─────────────────┐
│ FILTER MATCH     │  [NEW - Evaboot's key feature]
│                  │
│ Compare vs search│
│ filters:         │
│ - Title keywords │  "VP" in title?
│ - Seniority      │  Correct level?
│ - Headcount      │  In range?
│ - Industry       │  Matches filter?
│ - Geography      │  Correct region?
│                  │
│ Output: MATCH or │
│ NO_MATCH + reasons│
└────────┬─────────┘
         │
         ▼
    Clean Lead Data
    Ready for Import
```

---

### 3.6 CSV Export Format (Evaboot-Compatible)

```csv
First Name,Last Name,Title,Company,LinkedIn URL,Location,Company Headcount,Company Industry,Company HQ,Company LinkedIn URL,Company Type,Connection Degree,Shared Connections,Followers,Filter Match,Mismatch Reasons
John,Doe,VP Engineering,Acme Corp,https://linkedin.com/in/johndoe,San Francisco Bay Area,500,Software,San Francisco CA,https://linkedin.com/company/acme,Public,2,5,1200,MATCH,
Jane,Smith,Marketing Manager,Small Co,https://linkedin.com/in/janesmith,New York,50,Marketing,New York NY,https://linkedin.com/company/smallco,Private,3,0,300,NO_MATCH,Title mismatch: searched for VP+ seniority
```

**16 columns** (matches Evaboot's export format minus email columns since we skip verification).

---

## 4. DATABASE SCHEMA (Complete)

### New Tables

```typescript
// Add to convex/schema.ts:

// Webhook endpoints for Zapier/Make/n8n integration
webhookEndpoints: defineTable({
  userId: v.id("users"),
  url: v.string(),
  name: v.string(),
  events: v.array(v.union(
    v.literal("lead.imported"),
    v.literal("extraction.started"),
    v.literal("extraction.completed"),
    v.literal("credits.low"),
  )),
  secret: v.string(),
  isActive: v.boolean(),
  lastFiredAt: v.optional(v.number()),
  failureCount: v.number(),
  createdAt: v.number(),
})
  .index("by_user", ["userId"])
  .index("by_event", ["events"]),

// Filter match results for each lead in an extraction
filterMatchResults: defineTable({
  leadId: v.id("leads"),
  extractionId: v.id("extractions"),
  isMatch: v.boolean(),
  confidence: v.number(),
  mismatches: v.array(v.object({
    field: v.string(),
    filter: v.string(),
    actual: v.string(),
    reason: v.string(),
  })),
  createdAt: v.number(),
})
  .index("by_lead", ["leadId"])
  .index("by_extraction", ["extractionId"])
  .index("by_extraction_match", ["extractionId", "isMatch"]),
```

### Schema Modifications to Existing Tables

```typescript
// leads table — add:
filterMatch: v.optional(v.boolean()),        // Quick access: MATCH or NO_MATCH
filterMismatchCount: v.optional(v.number()), // Number of filter mismatches

// extractions table — add:
matchCount: v.optional(v.number()),    // Leads matching all filters
noMatchCount: v.optional(v.number()),  // Leads with filter mismatches
webhooksFired: v.optional(v.number()), // Count of webhooks triggered

// credits table — add:
lastEnforcedAt: v.optional(v.number()),  // Timestamp of last server-side check
```

---

## 5. SECURITY HARDENING

### 5.1 Server-Side Credit Enforcement

```
BEFORE (insecure):
  Extension says "I extracted 50 leads" → Server trusts and deducts 50

AFTER (secure):
  Extension sends 50 leads → Server:
    1. Counts actual new (non-duplicate) leads
    2. Checks credit balance >= count
    3. If insufficient: imports only what credits allow, returns partial result
    4. Deducts ACTUAL imported count (not client-reported)
    5. Logs transaction with extraction ID for audit
```

### 5.2 Extraction ID Validation

```typescript
// In importFromExtension:
const extraction = await ctx.db.get(args.extractionId);
if (!extraction) throw new Error("Invalid extraction ID");
if (extraction.userId !== user._id) throw new Error("Unauthorized");
if (extraction.status === "completed") throw new Error("Extraction already completed");
```

### 5.3 Rate Limiting on Mutations

```typescript
// In importFromExtension:
const recentImports = await ctx.db
  .query("creditTransactions")
  .withIndex("by_user_and_type", q => q.eq("userId", user._id).eq("type", "extraction"))
  .filter(q => q.gte(q.field("createdAt"), Date.now() - 60_000)) // Last minute
  .collect();

if (recentImports.length > 10) {
  throw new Error("RATE_LIMIT: Too many imports. Please slow down.");
}
```

### 5.4 Input Validation

Every mutation validates:
- String lengths (firstName max 100, title max 500, URL max 2000)
- URL format for linkedInUrl (must match `linkedin.com/in/`)
- Numeric ranges (headcount > 0, followers >= 0)
- Array sizes (batch max 100 leads, webhook events max 4)

---

## 6. TESTING STRATEGY

### 6.1 Unit Tests (Vitest)

**Extension tests** (`extension/src/__tests__/`):
```
data-parser.test.ts
├── cleanName: emojis, ALL CAPS, special chars, whitespace
├── cleanTitle: "at Company", pipe, emojis, casing
├── cleanCompanyName: legal suffixes, emojis, casing
├── deduplicateLeads: URL match, fallback match, case sensitivity
├── parseConnectionDegree: numeric, string formats, edge cases
└── guessEmail: valid inputs, missing data, special chars

filter-validator.test.ts
├── title matching: exact, partial, fuzzy
├── headcount range: in range, out of range, missing data
├── geography matching: exact city, region, country
└── multi-filter: all match, some match, none match

request-scheduler.test.ts
├── calculateDelay: different times of day
├── canExtract: within limits, at limit, over limit
└── gaussian jitter: distribution within expected range

credit-manager.test.ts
├── hasCredits: positive balance, zero, negative
└── estimateCreditsNeeded: various lead counts
```

**Backend tests** (`convex/__tests__/`):
```
extensions.test.ts
├── importFromExtension: happy path, insufficient credits, duplicates
├── createExtraction: valid, missing fields
└── completeExtraction: valid ID, invalid ID, wrong user

credits.test.ts
├── getBalance: existing user, new user (auto-init)
├── deductCredits: sufficient, insufficient, partial
└── monthlyReset: correct reset, preserves transactions

webhooks.test.ts
├── register: valid URL, invalid URL, duplicate
├── fire: successful delivery, retry on failure, disable after 10 failures
└── delete: own webhook, other user's webhook (should fail)
```

### 6.2 Integration Tests

```
extension-to-convex.test.ts
├── Full extraction flow: start → extract → batch import → complete
├── Credit deduction across multiple batches
├── Duplicate handling across extractions
└── Error recovery: network failure mid-extraction

filter-match-pipeline.test.ts
├── Parse Sales Navigator URL into filter object
├── Run filter validation on sample leads
└── Verify match/mismatch counts in extraction record
```

### 6.3 E2E Test Plan (Manual + Playwright)

```
1. Load extension in Chrome
2. Navigate to Sales Navigator search
3. Verify "Extract with LeadFlow" button appears
4. Click extract, set 25 leads
5. Verify progress overlay shows
6. Verify leads appear in dashboard
7. Verify CSV export downloads with correct data
8. Verify filter match column populated
9. Verify credit balance decreased
10. Verify webhook fires (if configured)
```

---

## 7. ERROR HANDLING ARCHITECTURE

### 7.1 Error Types

```typescript
// extension/src/shared/errors.ts

export class LeadFlowError extends Error {
  constructor(
    message: string,
    public code: ErrorCode,
    public isRetryable: boolean = false,
    public userMessage?: string,
  ) {
    super(message);
  }
}

export enum ErrorCode {
  // Auth errors
  AUTH_EXPIRED = 'AUTH_EXPIRED',
  AUTH_INVALID = 'AUTH_INVALID',

  // Credit errors
  INSUFFICIENT_CREDITS = 'INSUFFICIENT_CREDITS',
  CREDITS_RATE_LIMITED = 'CREDITS_RATE_LIMITED',

  // Extraction errors
  EXTRACTION_NOT_FOUND = 'EXTRACTION_NOT_FOUND',
  EXTRACTION_ALREADY_COMPLETE = 'EXTRACTION_ALREADY_COMPLETE',
  EXTRACTION_RATE_LIMITED = 'EXTRACTION_RATE_LIMITED',

  // LinkedIn errors
  LINKEDIN_RATE_LIMITED = 'LINKEDIN_RATE_LIMITED',
  LINKEDIN_CAPTCHA = 'LINKEDIN_CAPTCHA',
  LINKEDIN_FORBIDDEN = 'LINKEDIN_FORBIDDEN',
  LINKEDIN_PAGE_CHANGED = 'LINKEDIN_PAGE_CHANGED',

  // Network errors
  NETWORK_TIMEOUT = 'NETWORK_TIMEOUT',
  CONVEX_UNAVAILABLE = 'CONVEX_UNAVAILABLE',

  // Data errors
  PARSE_FAILED = 'PARSE_FAILED',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
}
```

### 7.2 Error Flow

```
Error occurs in extension
        │
        ▼
┌─────────────────┐
│ Is it retryable? │
│                  │
│ YES: Retry with  │──► Success → continue
│ exponential      │
│ backoff (3x max) │──► Still fails → escalate
│                  │
│ NO: Escalate     │
└────────┬─────────┘
         │
         ▼
┌─────────────────┐
│ Is it fatal?     │
│                  │
│ FATAL:           │──► Stop extraction
│ CAPTCHA,         │    Show error in popup
│ AUTH_EXPIRED     │    Log to Convex
│                  │
│ NON-FATAL:       │──► Skip lead, continue
│ PARSE_FAILED,    │    Log warning
│ VALIDATION_FAILED│    Increment error count
└──────────────────┘
```

---

## 8. IMPLEMENTATION PRIORITY ORDER

### Phase 1: Core Evaboot Parity (Week 1-2)
| # | Task | Files | Confidence |
|---|------|-------|------------|
| 1 | Filter Match Validation | `extension/src/core/filter-validator.ts` (NEW) | 85% |
| 2 | Server-side credit enforcement | `convex/extensions.ts`, `convex/credits.ts` | 95% |
| 3 | Extraction ID validation | `convex/extensions.ts` | 98% |
| 4 | Enhanced CSV with filter match columns | `extension/src/core/csv-exporter.ts` | 95% |
| 5 | Case-insensitive deduplication | `extension/src/core/data-parser.ts` | 98% |

### Phase 2: Robustness (Week 2-3)
| # | Task | Files | Confidence |
|---|------|-------|------------|
| 6 | Structured error types | `extension/src/shared/errors.ts` (NEW) | 95% |
| 7 | Mutation rate limiting | `convex/extensions.ts` | 90% |
| 8 | Unit tests (data cleaning) | `extension/src/__tests__/` (NEW) | 95% |
| 9 | Unit tests (credit system) | `convex/__tests__/` (NEW) | 90% |
| 10 | Page visibility awareness | `extension/src/anti-detection/behavior-simulator.ts` | 92% |

### Phase 3: Integrations (Week 3-4)
| # | Task | Files | Confidence |
|---|------|-------|------------|
| 11 | Webhook system | `convex/webhooks.ts` (NEW), `convex/actions/webhook-fire.ts` (NEW) | 88% |
| 12 | Webhook management UI | `src/pages/WebhooksPage.tsx` (NEW) | 85% |
| 13 | Monthly credit reset cron | `convex/crons.ts` | 95% |
| 14 | Extraction history page | `src/pages/ExtractionsPage.tsx` (NEW) | 90% |

### Phase 4: Polish (Week 4-5)
| # | Task | Files | Confidence |
|---|------|-------|------------|
| 15 | Title standardization | `extension/src/core/data-parser.ts` | 80% |
| 16 | Stale extraction cleanup cron | `convex/crons.ts` | 95% |
| 17 | Integration tests | Multiple | 85% |
| 18 | E2E test setup (Playwright) | `e2e/` (NEW) | 75% |

---

## 9. CONFIDENCE SCORES EXPLAINED

| Score | Meaning |
|-------|---------|
| 95-100% | Straightforward implementation, well-understood patterns, low risk |
| 85-94% | Clear path but some complexity or external dependencies |
| 75-84% | Requires research, complex logic, or external API knowledge |
| 60-74% | Significant unknowns, may need iteration |
| <60% | High risk, experimental, may need architectural changes |

### Current Overall System Confidence: **82%**

**What brings it down**:
- Filter validation accuracy depends on parsing Sales Navigator's undocumented URL format (75%)
- Webhook delivery reliability at scale is hard to guarantee (80%)
- Anti-detection is arms race — LinkedIn may change detection methods any time (70% long-term)

**What keeps it high**:
- Core extraction pipeline is proven and working (95%)
- Convex backend handles all the hard parts (transactions, real-time, auth) (95%)
- Data cleaning is well-tested in production LinkedIn tools (90%)
- Credit system is simple math with atomic operations (98%)

---

## 10. TECHNOLOGY DECISIONS

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Extension framework | **WXT** | File-based routing, hot reload, MV3-native, Vite-powered |
| Backend | **Convex** | Real-time, serverless, typed, built-in auth + cron |
| Auth | **Clerk** | Handles OAuth, JWT, integrates with Convex natively |
| AI | **Gemini** (Google) | Free tier generous, good for ICP/message generation |
| CSS | **TailwindCSS** | Already configured, utility-first, fast iteration |
| Testing | **Vitest** | Fast, Vite-native, TypeScript-first, compatible with both projects |
| CSV | **Custom** | Simple format, no library needed, keeps bundle small |
| Webhooks | **Convex Actions** | Server-side HTTP calls, retry built-in |

---

## APPENDIX A: Evaboot Feature Parity Checklist

| Feature | Evaboot | LeadFlow | Status |
|---------|---------|----------|--------|
| Extract from Sales Navigator search | Yes | Yes | DONE |
| Extract from saved lists | Yes | Partial | TODO |
| Name cleaning (emojis, casing) | Yes | Yes | DONE |
| Title cleaning | Yes | Yes | DONE |
| Company cleaning (legal suffixes) | Yes | Yes | DONE |
| Email finding | Yes | SKIPPED | User decision |
| Email verification (SMTP) | Yes | SKIPPED | User decision |
| Filter match validation | Yes | No | PRIORITY 1 |
| CSV export | Yes | Yes | DONE |
| Credit system | Yes | Partial | PRIORITY 2 |
| Anti-detection | Yes | Yes | DONE |
| Daily extraction limit (2,500) | Yes | Yes | DONE |
| Webhook integrations | Yes | No | PRIORITY 3 |
| HubSpot integration | Yes | No | FUTURE |
| Zapier/Make support | Yes | No | Via webhooks |
| Extraction history | Yes | Partial | PRIORITY 4 |
| Chrome Web Store listing | Yes | No | FUTURE |
