# PIV Framework: LinkedIn Lead Gen SaaS Development Plan

**Framework Reference:** Cole Medin's PIV Loop (Planning → Implementation → Validation)  
**Project:** B2B LinkedIn Lead Generation AI Agent  
**Brand Name:** LeadFlow AI  
**Date Created:** February 9, 2026  
**Last Updated:** February 9, 2026  
**Status:** Planning Phase

**Key Documents:**
- Brand Identity: `docs/BRAND_IDENTITY.md`
- Content Strategy: `docs/CONTENT_STRATEGY.md`
- Design System: `docs/DESIGN_SYSTEM.md`
- Scope of Work: `docs/SCOPE_OF_WORK.md`

---

## 🎯 PIV Framework Overview

The PIV (Plan-Implement-Validate) framework is a systematic approach to agentic AI coding that ensures:
- **Clarity before coding** (no assumptions)
- **Structured delegation to AI assistants**
- **Continuous validation at every step**

This document applies the PIV methodology to build our LinkedIn Lead Gen SaaS from scratch.

---

# 📋 PHASE 1: PLANNING

## 1.1 Product Definition & Context Engineering

### Project Vision
Build an autonomous AI agent system that:
1. Identifies high-quality B2B prospects on LinkedIn
2. Enriches profiles with multi-source data
3. Scores leads using intelligent algorithms
4. Generates personalized, non-generic outreach messages
5. Automates connection requests with human approval workflow
6. Tracks engagement and refines scoring over time

### Core Problem Statement
**Current State:** Manual LinkedIn prospecting takes 10-20 minutes per prospect  
**Target State:** AI agent handles research, scoring, and message drafting in <30 seconds per prospect  
**Success Metric:** 40x time savings while maintaining or improving message quality

---

## 1.2 Technical Architecture Plan

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                    LEADFLOW AI - LINKEDIN LEAD GEN SAAS          │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│  DATA INGESTION  │
├──────────────────┤
│ • Evaboot CSV Export (Sales Navigator → Excel/CSV)
│ • PhantomBuster Integration (profile enrichment)
│ • Manual CSV Upload (fallback)
│ • LinkedIn Sales Navigator API (optional)
└──────────┬───────┘
           │
           ▼
┌──────────────────┐
│  ENRICHMENT      │
├──────────────────┤
│ • Profile Data Scraper (followers, connections, experience)
│ • Activity Scraper (last 10 posts)
│ • Company Data (from LinkedIn Company Pages)
│ • Event/Conference Signal Detection
└──────────┬───────┘
           │
           ▼
┌──────────────────┐
│  DATA STORAGE    │
├──────────────────┤
│ • Convex Database (real-time, serverless)
│ • Tables: companies, people, campaigns, posts, activities
│ • Real-time sync with React frontend
└──────────┬───────┘
           │
           ▼
┌──────────────────┐
│  SCORING ENGINE  │
├──────────────────┤
│ • Multi-factor scoring (company size, followers, activity, events)
│ • Hard filters (geography, title, industry)
│ • Tier classification (A/B/C)
│ • Convex queries with computed fields
└──────────┬───────┘
           │
           ▼
┌──────────────────┐
│  AI MESSAGE GEN  │
├──────────────────┤
│ • OpenAI GPT-4 / Claude
│ • Personalization based on recent posts
│ • Event/conference hooks
│ • Tone customization per campaign
└──────────┬───────┘
           │
           ▼
┌──────────────────┐
│  APPROVAL FLOW   │
├──────────────────┤
│ • Dashboard for reviewing generated messages
│ • Approve/Reject/Edit workflow
│ • Batch approval capabilities
└──────────┬───────┘
           │
           ▼
┌──────────────────┐
│  AUTOMATION      │
├──────────────────┤
│ • n8n workflows for orchestration
│ • Throttled sending (1-3 connections/hour)
│ • PhantomBuster Network Booster integration
└──────────┬───────┘
           │
           ▼
┌──────────────────┐
│  ANALYTICS       │
├──────────────────┤
│ • Connection acceptance rate
│ • Response rate tracking
│ • Score refinement feedback loop
│ • Campaign performance metrics
└──────────────────┘
```

---

## 1.3 Technology Stack Specification

### Frontend
| Component | Technology | Justification |
|-----------|-----------|---------------|
| **Framework** | React 18 + TypeScript | Type safety, modern hooks, ecosystem |
| **Styling** | Tailwind CSS + Custom Design System | Premium dark-first aesthetic, glassmorphism |
| **Design System** | See `docs/DESIGN_SYSTEM.md` | Comprehensive component library, brand tokens |
| **Typography** | Inter + Outfit (Google Fonts) | Modern, professional, highly legible |
| **Colors** | Brand Blue (#2563EB) + Gradients | Premium dark theme optimized |
| **State Management** | Convex React hooks | Real-time data sync, no Redux needed |
| **Auth** | Clerk | Simple, secure, multi-provider |
| **Routing** | React Router v6 | Standard, well-documented |
| **Build Tool** | Vite | Fast dev server, modern bundling |
| **Icons** | Lucide Icons or Heroicons | Consistent 2px stroke, rounded style |

### Backend
| Component | Technology | Justification |
|-----------|-----------|---------------|
| **Database** | Convex | Real-time, serverless, TypeScript-native |
| **Functions** | Convex mutations/queries | Type-safe, auto-generated hooks |
| **File Storage** | Convex storage | Integrated with DB |
| **Cron Jobs** | Convex scheduled functions | Built-in scheduling |
| **HTTP Endpoints** | Convex HTTP actions | Webhooks, external integrations |

### AI & Automation
| Component | Technology | Justification |
|-----------|-----------|---------------|
| **LLM** | OpenAI GPT-4o | Best for personalization |
| **Vector Search** | Convex vector search | Semantic similarity for post analysis |
| **Workflow Engine** | n8n (self-hosted) | Visual automation, LinkedIn integrations |
| **Scraping** | PhantomBuster | LinkedIn-safe, managed limits |

### Infrastructure
| Component | Technology | Justification |
|-----------|-----------|---------------|
| **Hosting** | Vercel (frontend) | Zero-config React deployment |
| **Backend** | Convex Cloud | Managed, auto-scaling |
| **Monitoring** | Sentry | Error tracking |
| **Analytics** | PostHog | Product analytics |

---

## 1.4 Database Schema Plan

### Core Tables

#### `companies`
```typescript
{
  _id: Id<"companies">,
  name: string,
  linkedinUrl: string,
  industry: string,
  size: string, // "51-200", "201-500", etc.
  location: string,
  website?: string,
  employees?: number,
  createdAt: number,
  updatedAt: number
}
```

#### `people`
```typescript
{
  _id: Id<"people">,
  companyId: Id<"companies">,
  campaignId?: Id<"campaigns">,
  
  // Basic Info
  firstName: string,
  lastName: string,
  linkedinUrl: string,
  headline: string,
  title: string,
  location: string,
  
  // Enrichment Data
  followersCount: number,
  connectionsCount: number,
  mutualConnections: number,
  connectionDegree: "1st" | "2nd" | "3rd+",
  yearsInCurrentRole?: number,
  totalYearsExperience?: number,
  
  // Activity Metrics
  postsLast90Days: number,
  lastPostDate?: number,
  avgEngagementPerPost?: number,
  eventKeywordPosts: number,
  eventSpeakerPosts: number,
  
  // Scoring
  eligibilityPassed: boolean,
  scoreTotal: number,
  scoreBreakdown: {
    companySize: number,
    followers: number,
    activity: number,
    events: number,
    mutualConnections: number,
    title: number
  },
  tier: "A" | "B" | "C" | null,
  
  // Outreach
  messageDraft?: string,
  status: "pending" | "approved" | "rejected" | "sent" | "connected",
  sentAt?: number,
  connectedAt?: number,
  
  createdAt: number,
  updatedAt: number
}
```

#### `posts`
```typescript
{
  _id: Id<"posts">,
  personId: Id<"people">,
  linkedinPostUrl: string,
  content: string,
  postedAt: number,
  likes: number,
  comments: number,
  shares?: number,
  
  // AI Analysis
  hasEventKeyword: boolean,
  isSpeakerPost: boolean,
  extractedEvents: string[], // ["Summit 2024", "Tech Conference"]
  sentiment?: "positive" | "neutral" | "negative",
  
  createdAt: number
}
```

#### `campaigns`
```typescript
{
  _id: Id<"campaigns">,
  userId: Id<"users">,
  name: string,
  description?: string,
  
  // Targeting Criteria
  targetIndustries: string[],
  targetTitles: string[],
  targetLocations: string[],
  companyMinSize: number,
  companyMaxSize?: number,
  
  // Message Template
  messageTemplate: string,
  messageStyle: "professional" | "casual" | "direct",
  
  // Limits
  dailyConnectionLimit: number,
  hourlyConnectionLimit: number,
  
  status: "draft" | "active" | "paused" | "completed",
  
  createdAt: number,
  updatedAt: number
}
```

#### `activities`
```typescript
{
  _id: Id<"activities">,
  personId: Id<"people">,
  campaignId?: Id<"campaigns">,
  type: "connection_sent" | "connection_accepted" | "message_sent" | "reply_received",
  metadata?: Record<string, any>,
  timestamp: number
}
```

#### `users` (via Clerk)
```typescript
{
  _id: Id<"users">,
  clerkId: string,
  email: string,
  name: string,
  role: "admin" | "user",
  linkedinAccount?: {
    profileUrl: string,
    connectedAt: number
  },
  createdAt: number
}
```

---

## 1.5 Feature Breakdown (Granular Tasks)

### MVP Features (Phase 1)

#### Feature 1: Data Ingestion
**User Story:** As a user, I want to upload a CSV of LinkedIn profiles so the system can enrich them.

**Tasks:**
- [ ] 1.1.1 Create CSV upload component with drag-drop
- [ ] 1.1.2 Validate CSV format (required columns)
- [ ] 1.1.3 Parse CSV and insert into `people` table
- [ ] 1.1.4 Display upload progress and errors
- [ ] 1.1.5 Show preview of imported leads

**Acceptance Criteria:**
- CSV with 100+ rows uploads in <5 seconds
- Invalid rows are flagged with clear error messages
- User sees confirmation with count of imported leads

---

#### Feature 2: Profile Enrichment
**User Story:** As the system, I want to automatically enrich LinkedIn profiles with followers, posts, and company data.

**Tasks:**
- [ ] 1.2.1 Integrate PhantomBuster API for profile scraping
- [ ] 1.2.2 Create Convex action to trigger enrichment
- [ ] 1.2.3 Scrape follower count, connections, mutual connections
- [ ] 1.2.4 Scrape last 10 posts (text, date, engagement)
- [ ] 1.2.5 Extract company data from LinkedIn company page
- [ ] 1.2.6 Store enriched data in `people` and `posts` tables
- [ ] 1.2.7 Handle rate limits with queue system

**Acceptance Criteria:**
- Enrichment completes for 100 profiles in <10 minutes
- 95%+ success rate on active profiles
- Rate limits respected (no account bans)

---

#### Feature 3: Scoring Engine
**User Story:** As a user, I want leads automatically scored and ranked so I can prioritize outreach.

**Tasks:**
- [ ] 1.3.1 Implement hard filter logic (geography, title, company size)
- [ ] 1.3.2 Create scoring algorithm in Convex function
- [ ] 1.3.3 Calculate company size score
- [ ] 1.3.4 Calculate follower influence score
- [ ] 1.3.5 Calculate activity recency score
- [ ] 1.3.6 Calculate event/conference signal score
- [ ] 1.3.7 Calculate mutual connection score
- [ ] 1.3.8 Calculate title relevance score
- [ ] 1.3.9 Assign tier (A/B/C) based on total score
- [ ] 1.3.10 Store breakdown in `scoreBreakdown` field

**Acceptance Criteria:**
- Scoring runs in <100ms per lead
- Score breakdown visible in UI
- Tiers accurately reflect priority

---

#### Feature 4: AI Message Generation
**User Story:** As a user, I want personalized messages auto-generated based on each prospect's recent activity.

**Tasks:**
- [ ] 1.4.1 Set up OpenAI API integration in Convex
- [ ] 1.4.2 Create prompt template with variables (name, post summary, event mentions)
- [ ] 1.4.3 Detect event keywords in posts using regex/AI
- [ ] 1.4.4 Generate message for each Tier A lead
- [ ] 1.4.5 Store draft in `messageDraft` field
- [ ] 1.4.6 Add "Regenerate" button in UI
- [ ] 1.4.7 Implement tone customization (professional/casual/direct)

**Acceptance Criteria:**
- Messages reference specific post content (not generic)
- Event mentions included when detected
- Messages <300 characters (LinkedIn limit)
- Generation time <3 seconds per message

---

#### Feature 5: Approval Dashboard
**User Story:** As a user, I want to review and approve/reject generated messages before sending.

**Tasks:**
- [ ] 1.5.1 Create leads table UI with filters (tier, status)
- [ ] 1.5.2 Display lead profile summary (title, company, score)
- [ ] 1.5.3 Show generated message in editable text area
- [ ] 1.5.4 Add Approve/Reject/Edit actions
- [ ] 1.5.5 Implement bulk approve for Tier A leads
- [ ] 1.5.6 Add "View LinkedIn Profile" link
- [ ] 1.5.7 Show recent posts preview

**Acceptance Criteria:**
- UI loads 1000+ leads without lag
- Filters update table in real-time
- Edits persist immediately (Convex reactivity)

---

#### Feature 6: LinkedIn Automation
**User Story:** As a user, I want approved messages sent automatically at a safe rate.

**Tasks:**
- [ ] 1.6.1 Create n8n workflow for connection requests
- [ ] 1.6.2 Integrate PhantomBuster Network Booster
- [ ] 1.6.3 Implement hourly rate limiting (1-3 per hour)
- [ ] 1.6.4 Add random delays between sends (human-like behavior)
- [ ] 1.6.5 Update `status` and `sentAt` in database
- [ ] 1.6.6 Log activities in `activities` table
- [ ] 1.6.7 Handle errors (profile not found, request limit hit)

**Acceptance Criteria:**
- Sends respect hourly/daily limits
- No LinkedIn account restrictions
- All sends logged in activity table

---

### Advanced Features (Phase 2)

#### Feature 7: Analytics Dashboard
- [ ] 1.7.1 Connection acceptance rate chart
- [ ] 1.7.2 Response rate tracking
- [ ] 1.7.3 Score distribution histogram
- [ ] 1.7.4 Campaign performance comparison
- [ ] 1.7.5 Export reports to CSV

---

#### Feature 8: Feedback Loop
- [ ] 1.8.1 Track which score ranges convert best
- [ ] 1.8.2 A/B test message styles
- [ ] 1.8.3 Automatically adjust scoring weights
- [ ] 1.8.4 Suggest new keywords for event detection

---

#### Feature 9: Multi-Campaign Support
- [ ] 1.9.1 Create campaign builder UI
- [ ] 1.9.2 Assign leads to specific campaigns
- [ ] 1.9.3 Campaign-specific message templates
- [ ] 1.9.4 Per-campaign rate limits

---

## 1.6 User Flow Diagrams

### Primary User Flow: Lead Enrichment → Outreach

```
┌─────────────────────────────────────────────────────────────────┐
│                      USER JOURNEY                                │
└─────────────────────────────────────────────────────────────────┘

1. USER UPLOADS CSV
   └─> System validates format
   └─> Shows import preview
   └─> User confirms import
   
2. SYSTEM ENRICHES PROFILES (Background)
   └─> Scrapes LinkedIn profiles
   └─> Scrapes recent posts
   └─> Extracts company data
   └─> Updates database
   
3. SYSTEM SCORES LEADS
   └─> Applies hard filters
   └─> Calculates multi-factor score
   └─> Assigns tiers
   
4. SYSTEM GENERATES MESSAGES
   └─> Analyzes recent posts
   └─> Detects event mentions
   └─> Creates personalized draft
   
5. USER REVIEWS DASHBOARD
   └─> Filters by Tier A
   └─> Reviews top 20 leads
   └─> Edits messages if needed
   └─> Bulk approves
   
6. SYSTEM AUTOMATES OUTREACH
   └─> Queues approved leads
   └─> Sends 1-3 per hour
   └─> Logs activities
   
7. USER MONITORS ANALYTICS
   └─> Checks connection acceptance rate
   └─> Reviews which messages perform best
   └─> Adjusts scoring weights
```

---

## 1.7 Integration Requirements

### Third-Party APIs

#### PhantomBuster
- **Purpose:** LinkedIn scraping (safe, managed)
- **Endpoints Needed:**
  - Profile data export
  - Post scraping
  - Network booster (connection requests)
- **Rate Limits:** 100 profiles/day (free tier)
- **Cost:** $30/month (starter plan)

#### OpenAI API
- **Purpose:** Message personalization
- **Model:** GPT-4o (better reasoning for personalization)
- **Estimated Cost:** $0.01 per message (100 messages = $1)

#### LinkedIn Sales Navigator (Optional)
- **Purpose:** Advanced search filters
- **Cost:** $99/month
- **Alternative:** Manual CSV export

#### **Evaboot** (Recommended Primary Method)
- **Purpose:** Extract leads from LinkedIn Sales Navigator into Excel/CSV
- **Key Features:**
  - Clean, validated data (email verification included)
  - Removes duplicates automatically
  - Exports to Excel/CSV format
  - Works directly with Sales Navigator search results
  - Faster and more reliable than scraping
- **Workflow:**
  1. User performs targeted search in Sales Navigator
  2. Evaboot Chrome extension extracts results
  3. Export to CSV with enriched data
  4. Import CSV into LeadFlow AI via upload feature
  5. System enriches further with PhantomBuster (posts, activity)
- **Cost:** $49-$99/month (depending on volume)
- **Advantages over scraping:**
  - No risk of LinkedIn account restrictions
  - Cleaner, more structured data
  - Includes email validation
  - Faster extraction (1000+ leads in minutes)

---

## 1.7.5 Brand & Content Strategy Integration

### Brand Identity (See `docs/BRAND_IDENTITY.md`)

**Brand Name:** LeadFlow AI

**Visual Identity:**
- **Primary Colors:** Electric Blue (#2563EB), Gradient to Cyan (#06B6D4)
- **Typography:** Inter (body), Outfit (display/headlines)
- **Design Style:** Premium dark-first, glassmorphism, micro-interactions
- **Voice:** Intelligent, empowering, professional, modern, human

**Key Brand Principles:**
1. **Clarity Over Cleverness** - Intuitive, user-friendly design
2. **Data-Driven Aesthetics** - Beautiful visualizations that tell stories
3. **Intelligent Minimalism** - Every element serves a purpose
4. **Premium Dark-First** - Optimized for professionals working long hours
5. **Micro-interactions Matter** - Subtle animations provide delight

### Content Strategy (See `docs/CONTENT_STRATEGY.md`)

**Content Pillars:**
1. LinkedIn Strategy & Best Practices (30%)
2. Sales Automation & Efficiency (25%)
3. Data & Analytics (20%)
4. Customer Success Stories (15%)
5. Industry Insights & Trends (10%)

**Publishing Rhythm:**
- **LinkedIn Posts:** 20-25/month (mix of long-form, carousels, quick tips)
- **Blog Posts:** 8-10/month (SEO-optimized, educational)
- **Videos:** 4-6/month (tutorials, customer stories)
- **Email Newsletter:** Weekly (LeadFlow Weekly)

**Target Personas:**
- "Strategic Sarah" - Sales Leader (VP Sales, Director)
- "Growth-Hacking Gary" - Marketing Leader (Head of Growth)
- "Solo Steve" - Independent Consultant/Founder

### Design System (See `docs/DESIGN_SYSTEM.md`)

**Component Library:**
- Glassmorphic cards with backdrop blur
- Gradient buttons with hover glow effects
- Data tables with real-time updates
- Interactive charts (Chart.js with custom theme)
- Micro-animations (fade-in-up, pulse, shimmer loading)

**Layout System:**
- 12-column grid, max-width 1280px
- 8px spacing scale (4px, 8px, 16px, 24px, 32px...)
- Border radius: 8px (small), 12px (medium), 16px (large), 24px (hero)

**Responsive Breakpoints:**
- Mobile: 640px
- Tablet: 768px
- Desktop: 1024px
- Wide: 1280px

---

## 1.7.6 Available Skills & Resources

### Global AI Skills (From Anthropic/Claude Ecosystem)

While specific global skills directories weren't found in the current environment, the following skill categories are commonly available and should be referenced when needed:

**Design & Branding Skills:**
- UI/UX design patterns
- Brand identity development
- Design system creation
- Visual asset generation
- Color theory and accessibility

**Development Skills:**
- React/TypeScript best practices
- Database schema design
- API integration patterns
- Authentication flows
- Real-time data sync

**Content & Marketing Skills:**
- SEO optimization
- Content strategy development
- Social media marketing
- Email campaign design
- Analytics and tracking

### Local Project Skills (In Repository)

**Workflows:** `.agents/workflows/`
- `piv-implementation.md` - Step-by-step PIV implementation
- `react-convex-clerk.md` - React + Convex + Clerk setup guide

**Documentation:** `docs/`
- `BRAND_IDENTITY.md` - Complete brand guide
- `CONTENT_STRATEGY.md` - Marketing and content plan
- `DESIGN_SYSTEM.md` - UI components and visual storyboard
- `PIV_FRAMEWORK_PLAN.md` - This comprehensive planning document
- `SCOPE_OF_WORK.md` - Project scope and requirements

### How to Use Skills

**For AI Agent:**
1. Reference skill files before implementing features
2. Follow established patterns from skills
3. Use brand tokens from `BRAND_IDENTITY.md`
4. Apply component styles from `DESIGN_SYSTEM.md`
5. Align messaging with `CONTENT_STRATEGY.md`

**For Development:**
- Import design tokens as CSS variables
- Use component templates from design system
- Follow code patterns from workflow guides
- Maintain consistency with brand voice



---

## 1.8 Security & Compliance Plan

### Data Privacy
- [ ] Store only public LinkedIn data
- [ ] Add privacy policy link
- [ ] GDPR-compliant delete endpoint
- [ ] Encrypt API keys in environment variables

### Authentication
- [ ] Clerk email/password auth
- [ ] Social login (Google, LinkedIn)
- [ ] Role-based access control (admin/user)

### Rate Limiting
- [ ] Respect LinkedIn scraping limits
- [ ] Throttle connection requests
- [ ] Add circuit breaker for API failures

---

## 1.9 Testing Plan

### Unit Tests
- [ ] Scoring algorithm accuracy
- [ ] CSV parsing edge cases
- [ ] Message generation quality

### Integration Tests
- [ ] PhantomBuster API connection
- [ ] OpenAI API reliability
- [ ] Convex database mutations

### End-to-End Tests
- [ ] Upload CSV → View enriched leads
- [ ] Approve message → Verify sent status
- [ ] Check analytics after 10 connections

---

## 1.10 Deployment Plan

### Development Environment
```bash
# Frontend: http://localhost:5173
npm run dev

# Backend: Convex dev deployment
npx convex dev

# n8n: http://localhost:5678
docker-compose up n8n
```

### Production Environment
```bash
# Frontend: Vercel
vercel deploy --prod

# Backend: Convex production
npx convex deploy --prod

# n8n: Railway / DigitalOcean
```

---

# 🛠️ PHASE 2: IMPLEMENTATION

## 2.1 Implementation Roadmap

### Week 1: Foundation Setup
**Goal:** Project scaffolding, auth, database schema

- [ ] Day 1-2: Initialize React + Vite + TypeScript project
  - [ ] Set up file structure
  - [ ] Configure Tailwind CSS + shadcn/ui
  - [ ] Install dependencies
  
- [ ] Day 3-4: Convex backend setup
  - [ ] Initialize Convex
  - [ ] Define database schema
  - [ ] Create initial mutations/queries
  
- [ ] Day 5-6: Clerk authentication
  - [ ] Set up Clerk project
  - [ ] Add sign-in/sign-up pages
  - [ ] Protect routes
  
- [x] Day 7: Testing & Documentation
  - [x] Test auth flow
  - [x] Document setup process

### Backend: Strategy & Campaigns (Phase 2 Start)
- [x] `convex/schema.ts`: Added strategies and campaigns tables
- [x] `convex/actions/strategy.ts`: AI Agents for ICP & Offer
- [x] `convex/strategies.ts`: CRUD for Strategies
- [x] `convex/campaigns.ts`: CRUD for Campaigns

---

### Week 2: Data Layer
**Goal:** CSV upload, data storage, enrichment pipeline

- [ ] Day 8-9: CSV upload feature
  - [ ] File upload component
  - [ ] CSV parsing with Papa Parse
  - [ ] Validation and error handling
  
- [ ] Day 10-12: PhantomBuster integration
  - [ ] API authentication
  - [ ] Profile enrichment function
  - [ ] Post scraping function
  - [ ] Queue management
  
- [ ] Day 13-14: Database operations
  - [ ] CRUD operations for all tables
  - [ ] Real-time subscriptions
  - [ ] Data relationships

---

### Week 3: Scoring & AI
**Goal:** Lead scoring algorithm, message generation

- [ ] Day 15-16: Scoring engine
  - [ ] Hard filter implementation
  - [ ] Multi-factor scoring algorithm
  - [ ] Tier classification
  - [ ] Score breakdown storage
  
- [ ] Day 17-19: AI message generation
  - [ ] OpenAI API setup
  - [ ] Prompt engineering
  - [ ] Event keyword detection
  - [ ] Message customization
  
- [ ] Day 20-21: Testing & refinement
  - [ ] Test scoring accuracy
  - [ ] Validate message quality

---

### Week 4: UI & Automation
**Goal:** Dashboard, approval workflow, automation

- [ ] Day 22-24: Approval dashboard
  - [ ] Leads table with filters
  - [ ] Profile preview cards
  - [ ] Approve/reject actions
  - [ ] Bulk operations
  
- [ ] Day 25-27: n8n automation
  - [ ] n8n workflow setup
  - [ ] PhantomBuster connection request automation
  - [ ] Rate limiting logic
  - [ ] Activity logging
  
- [ ] Day 28: Final testing & polish
  - [ ] End-to-end testing
  - [ ] UI polish
  - [ ] Bug fixes

---

## 2.2 Code Organization

### File Structure
```
d:/LeadGenSaaS/
├── convex/                    # Backend (Convex)
│   ├── schema.ts             # Database schema
│   ├── companies.ts          # Company CRUD
│   ├── people.ts             # People CRUD
│   ├── campaigns.ts          # Campaign CRUD
│   ├── posts.ts              # Posts CRUD
│   ├── scoring.ts            # Scoring algorithm
│   ├── enrichment.ts         # PhantomBuster integration
│   ├── messageGeneration.ts  # OpenAI integration
│   ├── automation.ts         # n8n webhook handlers
│   └── http.ts               # HTTP endpoints
│
├── src/                      # Frontend (React)
│   ├── components/
│   │   ├── auth/             # Authentication
│   │   ├── dashboard/        # Main dashboard
│   │   ├── leads/            # Lead management
│   │   ├── campaigns/        # Campaign builder
│   │   ├── analytics/        # Analytics charts
│   │   └── ui/               # shadcn/ui components
│   │
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utilities
│   ├── pages/                # Route pages
│   └── main.tsx              # Entry point
│
├── n8n/                      # n8n workflows
│   └── linkedin-automation.json
│
├── docs/                     # Documentation
│   ├── SCOPE_OF_WORK.md
│   ├── PIV_FRAMEWORK_PLAN.md (this file)
│   ├── DATABASE_SCHEMA.md
│   └── API_DOCUMENTATION.md
│
└── .env.example              # Environment variables template
```

---

## 2.3 AI Coding Assistant Instructions

### Context for AI Assistant

**When implementing features, always:**
1. Read the relevant section in this PIV plan first
2. Check the database schema in `convex/schema.ts`
3. Follow TypeScript strict mode (no `any` types)
4. Use Convex mutations for writes, queries for reads
5. Implement error handling with try/catch
6. Add loading states for async operations
7. Write descriptive comments for complex logic
8. Update this PIV plan if requirements change

**Code Style:**
- Use functional components with hooks
- Prefer `const` over `let`
- Use arrow functions
- Destructure props
- Use Tailwind classes (avoid custom CSS)
- Follow shadcn/ui patterns

**Testing Strategy:**
- Write unit tests for pure functions (scoring, parsing)
- Manual testing for UI components
- Integration tests for API calls

---

# ✅ PHASE 3: VALIDATION

## 3.1 Validation Checkpoints

### After Each Feature Implementation

#### Feature Validation Template
```markdown
## Feature: [Feature Name]

### Functionality Tests
- [ ] Happy path works (expected input → expected output)
- [ ] Edge cases handled (empty data, invalid input)
- [ ] Error messages are clear and actionable
- [ ] Loading states display correctly

### Performance Tests
- [ ] Feature loads in <2 seconds
- [ ] No console errors
- [ ] Database queries optimized
- [ ] API calls batched when possible

### UX Tests
- [ ] UI is intuitive (no instructions needed)
- [ ] Responsive design (mobile + desktop)
- [ ] Accessibility (keyboard navigation, ARIA labels)
- [ ] Matches design system (Tailwind classes consistent)

### Integration Tests
- [ ] Works with existing features (no regressions)
- [ ] Data flows correctly between components
- [ ] Real-time updates work (Convex reactivity)
```

---

## 3.2 MVP Success Criteria

### Quantitative Metrics
- [ ] Upload and enrich 100 leads in <15 minutes
- [ ] Scoring accuracy: 90%+ of Tier A leads meet manual review standards
- [ ] Message quality: 80%+ of generated messages require no edits
- [ ] Connection request success: No LinkedIn account restrictions after 100 sends
- [ ] System uptime: 99%+ (Convex + Vercel)

### Qualitative Metrics
- [ ] User can complete full workflow without documentation
- [ ] Dashboard feels responsive and polished
- [ ] Error messages help users fix issues
- [ ] System feels "intelligent" (not robotic)

---

## 3.3 User Acceptance Testing (UAT)

### Test Script for End Users

**Test Scenario 1: Upload Leads**
1. Export CSV from LinkedIn Sales Navigator
2. Upload to system
3. Verify all rows imported correctly
4. Check for error messages on invalid rows

**Test Scenario 2: Review Enriched Leads**
1. Wait for enrichment to complete
2. Open dashboard
3. Filter by Tier A
4. Verify follower counts, post data visible
5. Check scoring breakdown makes sense

**Test Scenario 3: Approve Messages**
1. Review top 10 Tier A leads
2. Read generated messages
3. Edit 2-3 messages
4. Bulk approve remaining
5. Verify status changes to "Approved"

**Test Scenario 4: Monitor Automation**
1. Check activities table for sent connections
2. Verify 1-3 per hour rate limit
3. Confirm LinkedIn account not restricted
4. View analytics dashboard

---

## 3.4 Post-Deployment Monitoring

### Metrics to Track (Week 1)
- [ ] Error rate (Sentry)
- [ ] API latency (Convex dashboard)
- [ ] User retention (PostHog)
- [ ] Connection acceptance rate
- [ ] Message edit rate (% of generated messages edited before sending)

### Iteration Plan
- [ ] Daily review of error logs
- [ ] Weekly scoring algorithm refinement based on conversion data
- [ ] Bi-weekly user feedback sessions
- [ ] Monthly feature prioritization based on usage data

---

## 3.5 Known Risks & Mitigation

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| LinkedIn blocks PhantomBuster | Medium | High | Use proxy rotation, respect rate limits, have backup manual flow |
| OpenAI API downtime | Low | Medium | Cache generated messages, implement retry logic |
| Convex scaling issues | Low | Low | Convex auto-scales, monitor dashboard |
| CSV format changes | High | Low | Robust parsing with error handling |

### Business Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Spam complaints | Low | High | Require human approval, personalize messages |
| User finds messages too generic | Medium | Medium | Iterate on prompt engineering, A/B test |
| Low connection acceptance rate | Medium | Medium | Refine scoring, improve message quality |

---

# 📊 Appendix: PIV Loop in Practice

## How to Use This Plan with AI Coding Assistants

### 1. Planning Phase (This Document)
- **Read** the entire PIV plan before writing code
- **Clarify** any ambiguous requirements with the user
- **Break down** features into atomic tasks
- **Document** assumptions and decisions

### 2. Implementation Phase
- **Reference** this plan for context
- **Implement** one feature at a time (don't try to do everything at once)
- **Test** after each feature
- **Update** this plan if requirements change

### 3. Validation Phase
- **Check** against success criteria
- **Test** all edge cases
- **Measure** performance metrics
- **Get** user feedback before moving to next feature

---

## Next Steps

### Immediate Actions (Today)
1. ✅ Review this PIV plan
2. [ ] Set up development environment:
   ```bash
   npm create vite@latest linkedin-leadgen -- --template react-ts
   cd linkedin-leadgen
   npm install
   npx convex dev
   ```
3. [ ] Create Clerk account and get API keys
4. [ ] Create PhantomBuster account
5. [ ] Create OpenAI account and get API key

### Tomorrow
6. [ ] Initialize Convex schema (copy from Section 1.4)
7. [ ] Set up Clerk authentication
8. [ ] Create basic React app structure

### This Week
9. [ ] Implement Feature 1: Data Ingestion
10. [ ] Implement Feature 2: Profile Enrichment
11. [ ] Validate and test

---

## Document Change Log

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2026-02-09 | 1.0 | Initial PIV plan created | AI Assistant |

---

**Framework Credit:** Cole Medin's PIV Loop  
**Resources:**
- [Cole Medin YouTube](https://www.youtube.com/@ColeMedin)
- [Dynamis Agentic Coding Course](https://www.dynamis.so)
- [PIV Framework Overview](https://gitnation.com/)
