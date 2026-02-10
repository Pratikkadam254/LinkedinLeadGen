# ⚡ LeadFlow AI

<div align="center">

**Intelligence Meets Opportunity**

Transform your LinkedIn connections into qualified leads with AI-powered intelligence that feels human.

[![Status](https://img.shields.io/badge/Status-Ready_for_Implementation-blue)](docs/PROJECT_OVERVIEW.md)
[![Framework](https://img.shields.io/badge/Framework-PIV_(Cole_Medin)-green)](https://www.youtube.com/@ColeMedin)
[![License](https://img.shields.io/badge/License-Private-red)]()

[Features](#-key-features) • [Documentation](#-documentation) • [Quick Start](#-quick-start) • [Demo](#-demo)

</div>

---

## 🎯 What is LeadFlow AI?

**LeadFlow AI** is a premium B2B LinkedIn lead generation platform that combines AI-powered intelligence with human oversight to help sales professionals and consultants identify, qualify, and engage high-value prospects at scale.

### The Problem
- Manual LinkedIn prospecting takes **10-20 minutes per prospect**
- Generic messages get ignored (low response rates)
- No systematic way to prioritize valuable leads
- Difficult to scale outreach without losing personalization

### Our Solution
- ⚡ **40x Time Savings:** AI handles research, scoring, and drafting in **<30 seconds**
- 🎯 **Smart Targeting:** Multi-factor scoring (company size, influence, activity, events)
- ✍️ **Personalized at Scale:** AI-crafted messages based on recent posts and activity
- 🔒 **LinkedIn-Safe:** Rate-limited automation that respects platform rules
- 📊 **Data-Driven:** Real-time analytics to optimize your outreach

---

## ✨ Key Features

### 🔍 Smart Lead Ingestion
- **Evaboot Integration** (Primary) - Extract validated leads from Sales Navigator
- CSV upload with validation and deduplication
- PhantomBuster enrichment for additional data

### 🤖 AI Profile Enrichment
- Automatic scraping of followers, connections, and mutual connections
- Last 10 LinkedIn posts analyzed for engagement signals
- Company data extraction and validation
- Event/conference keyword detection

### 🎯 Multi-Factor Scoring
Intelligent lead ranking based on:
- Company size and industry relevance
- Follower influence and network strength
- Recent activity and engagement
- Event participation and speaking
- Mutual connections
- Title/role relevance

**Output:** Tier A/B/C classification for instant prioritization

### ✍️ AI Message Generation
- Powered by OpenAI GPT-4o
- References specific post content (not generic)
- Includes event mentions when detected
- Tone customization (professional/casual/direct)
- <300 characters (LinkedIn optimized)

### ✅ Approval Workflow
- Beautiful dashboard for reviewing generated messages
- Inline editing with real-time save
- Bulk approve for Tier A leads
- View profile, posts, and score breakdown

### 🔄 LinkedIn Automation
- n8n workflow orchestration
- PhantomBuster Network Booster integration
- Rate limiting (1-3 connections/hour)
- Random delays for human-like behavior
- Activity logging and tracking

### 📊 Analytics Dashboard
- Connection acceptance rate tracking
- Response rate monitoring
- Score distribution analysis
- Campaign performance metrics
- ROI calculation

---

## 🎨 Brand Identity

**Design Philosophy:** Premium dark-first aesthetic with glassmorphism and intelligent micro-interactions

### Visual System
- **Primary Color:** Electric Blue `#2563EB` → Cyan `#06B6D4` gradient
- **Typography:** Inter (body) + Outfit (display headlines)
- **Style:** Dark backgrounds (#0A0E1A), glassmorphic cards, gradient accents
- **Voice:** Intelligent, empowering, professional, modern, human

### Design Principles
1. **Clarity Over Cleverness** - Intuitive, user-friendly design
2. **Data-Driven Aesthetics** - Beautiful visualizations that tell stories
3. **Intelligent Minimalism** - Every element serves a purpose
4. **Premium Dark-First** - Optimized for professionals working long hours
5. **Micro-interactions Matter** - Subtle animations provide delight

**Full brand guide:** [`docs/BRAND_IDENTITY.md`](docs/BRAND_IDENTITY.md)

---

## 🏗️ Tech Stack

### Frontend
```
React 18 + TypeScript          - Modern, type-safe UI
Vite                           - Lightning-fast dev server
Tailwind CSS                   - Utility-first styling with custom design system
React Router v6                - Client-side routing
Lucide Icons                   - Consistent 2px stroke icons
```

### Backend
```
Convex                         - Real-time serverless database + functions
Clerk                          - Authentication and user management
Convex Storage                 - File uploads (CSV)
Convex Scheduled Functions     - Cron jobs for automation
```

### AI & Automation
```
OpenAI GPT-4o                  - Message personalization
Convex Vector Search           - Semantic post analysis
n8n                            - Workflow orchestration
PhantomBuster                  - LinkedIn-safe scraping & automation
Evaboot                        - Lead extraction from Sales Navigator ⭐
```

### Infrastructure
```
Vercel                         - Frontend hosting (auto-deploy)
Convex Cloud                   - Backend (auto-scaling)
Sentry                         - Error tracking
PostHog                        - Product analytics
```

---

## 📚 Documentation

We've created **comprehensive documentation** covering every aspect of the project:

### Core Documents
| Document | Description | Lines |
|----------|-------------|-------|
| **[PROJECT_OVERVIEW.md](docs/PROJECT_OVERVIEW.md)** | 📘 Quick reference guide - START HERE | 550+ |
| **[BRAND_IDENTITY.md](docs/BRAND_IDENTITY.md)** | 🎨 Complete brand bible (logo, colors, voice) | 480+ |
| **[CONTENT_STRATEGY.md](docs/CONTENT_STRATEGY.md)** | 📱 Marketing plan (personas, calendar, SEO) | 900+ |
| **[DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md)** | 🖌️ UI component library and storyboard | 1,500+ |
| **[PIV_FRAMEWORK_PLAN.md](docs/PIV_FRAMEWORK_PLAN.md)** | 🔧 Complete technical blueprint | 1,100+ |

### Quick Start Guides
| Document | Purpose |
|----------|---------|
| **[QUICK_START.md](docs/QUICK_START.md)** | ⚡ Get up and running today |
| **[ROADMAP.md](docs/ROADMAP.md)** | 📅 4-week implementation timeline |
| **[SCOPE_OF_WORK.md](docs/SCOPE_OF_WORK.md)** | 💼 Business requirements |

### Workflows
| Workflow | Description |
|----------|-------------|
| **[piv-implementation.md](.agents/workflows/piv-implementation.md)** | Step-by-step execution guide (60 steps) |
| **[react-convex-clerk.md](.agents/workflows/react-convex-clerk.md)** | React + Convex + Clerk setup |

**Total Documentation:** 114.5 KB | 4,530+ lines

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Git installed
- Accounts for: [Clerk](https://clerk.com), [Convex](https://convex.dev), [OpenAI](https://platform.openai.com), [Evaboot](https://evaboot.com)

### Installation (10 minutes)

```powershell
# 1. Clone repository
git clone <your-repo-url>
cd LeadGenSaaS

# 2. Install dependencies
npm install

# 3. Set up environment variables
Copy-Item .env.example .env.local
# Fill in your API keys (see docs/QUICK_START.md)

# 4. Initialize Convex backend
npx convex dev

# 5. Start development server (new terminal)
npm run dev
```

Visit **http://localhost:5173** 🎉

**Detailed setup:** [`docs/QUICK_START.md`](docs/QUICK_START.md)

---

## 🎬 Demo

### Live Landing Page Demo
Open [`demo/landing-page.html`](demo/landing-page.html) in your browser to see:
- ✅ Premium dark-first design
- ✅ Glassmorphic cards with backdrop blur
- ✅ Gradient buttons with hover glow
- ✅ Smooth animations on scroll
- ✅ Responsive mobile-first layout
- ✅ Complete brand implementation

### Screenshots
*(Coming soon after implementation begins)*

---

## 📊 Database Schema

### Core Tables
```typescript
companies    - Company profiles (name, industry, size, location)
people       - Lead profiles (contact info, enrichment, scores)
posts        - LinkedIn posts (content, engagement, AI analysis)
campaigns    - Outreach campaigns (targeting, templates, limits)
activities   - Activity log (connections sent, accepted, replied)
users        - User accounts (via Clerk integration)
```

**Full schema:** [`docs/PIV_FRAMEWORK_PLAN.md`](docs/PIV_FRAMEWORK_PLAN.md#14-database-schema-plan) Section 1.4

---

## 🎓 PIV Framework Methodology

This project follows **Cole Medin's PIV Framework** for agentic AI coding:

### 1. ✅ PLAN (Complete)
- Clear requirements documented (4,530+ lines)
- Database schema defined (6 tables)
- Features broken into atomic tasks
- Architecture decided and documented
- Brand identity established
- Content strategy planned
- Design system created

### 2. 🚀 IMPLEMENT (Next)
- Build one feature at a time
- Reference PIV plan for context
- Use design system for all UI
- Apply brand tokens consistently
- Test after each feature

### 3. ✓ VALIDATE (Continuous)
- Functionality tests
- Performance checks (page load <2s)
- UX validation
- Accessibility audit (WCAG AA)
- Bug fixes and refinement

**Learn more:** [Cole Medin on YouTube](https://www.youtube.com/@ColeMedin)

---

## 🗓️ Development Roadmap

### ✅ Phase 0: Planning (Complete)
- [x] Requirements gathering
- [x] Technical architecture
- [x] Database schema
- [x] Feature breakdown
- [x] Brand identity system
- [x] Content strategy
- [x] Design system
- [x] Implementation roadmap

### 🚧 Phase 1: Foundation (Week 1)
- [ ] React + Vite + TypeScript setup
- [ ] Design tokens implementation (CSS variables)
- [ ] Convex backend initialized
- [ ] Clerk authentication
- [ ] Base component library

### 📋 Phase 2: Data Layer (Week 2)
- [ ] Evaboot CSV upload feature
- [ ] PhantomBuster integration
- [ ] Profile enrichment pipeline
- [ ] Database CRUD operations

### 🤖 Phase 3: Intelligence (Week 3)
- [ ] Multi-factor scoring engine
- [ ] AI message generation (OpenAI GPT-4o)
- [ ] Event keyword detection
- [ ] Quality testing

### 🎨 Phase 4: User Interface (Week 4)
- [ ] Approval dashboard
- [ ] Analytics charts
- [ ] n8n automation workflows
- [ ] Final testing & polish

**Detailed timeline:** [`docs/ROADMAP.md`](docs/ROADMAP.md)

---

## 📈 Success Metrics

### Product Metrics
- **Time Savings:** 40x faster (30s vs 10-20 min per prospect)
- **Message Quality:** >80% approval rate (minimal edits needed)
- **Connection Acceptance:** >50% (industry average: 35%)
- **Lead Enrichment:** >95% success rate

### Business Metrics
- User sign-ups: 100 in Month 1
- Active users: >60% weekly activity
- NPS score: >50
- Churn: <10% monthly

### Content Metrics
- Blog traffic: +200% YoY
- Email subscribers: 5,000 in Q1
- LinkedIn engagement: >8% rate
- Trial conversions: 5% from content

---

## 🛠️ Development Commands

```powershell
# Development
npx convex dev          # Terminal 1: Convex backend
npm run dev             # Terminal 2: React frontend

# Build for production
npm run build
npx convex deploy --prod

# Deploy frontend
vercel deploy --prod

# Code quality
npm run lint
npm run format
npm run type-check
```

---

## 🔒 Security & Compliance

- ✅ Only public LinkedIn data stored
- ✅ API keys encrypted in environment variables
- ✅ Clerk handles authentication securely
- ✅ Rate limiting prevents LinkedIn bans
- ✅ GDPR-compliant delete endpoint
- ✅ Privacy policy included
- ✅ Accessibility (WCAG AA compliance)

---

## 📁 Project Structure

```
LeadGenSaaS/
├── .agents/
│   └── workflows/              # Implementation guides
├── convex/                     # Backend (Convex)
│   ├── schema.ts              # Database schema
│   ├── people.ts              # Lead CRUD
│   ├── scoring.ts             # Scoring algorithm
│   └── messageGeneration.ts   # AI message gen
├── src/                       # Frontend (React)
│   ├── components/            # UI components
│   │   ├── ui/               # Base components (design system)
│   │   ├── dashboard/        # Dashboard features
│   │   └── leads/            # Lead management
│   ├── pages/                # Route pages
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utilities
│   └── styles/               # Global styles & design tokens
├── demo/                      # Demo files
│   └── landing-page.html     # Live landing page demo
├── docs/                      # Documentation (4,530+ lines)
│   ├── PROJECT_OVERVIEW.md   # Quick reference (START HERE)
│   ├── BRAND_IDENTITY.md     # Brand bible
│   ├── CONTENT_STRATEGY.md   # Marketing plan
│   ├── DESIGN_SYSTEM.md      # UI library
│   ├── PIV_FRAMEWORK_PLAN.md # Technical blueprint
│   ├── QUICK_START.md        # Setup guide
│   ├── ROADMAP.md            # Timeline
│   └── SCOPE_OF_WORK.md      # Requirements
└── .env.example               # Environment template
```

---

## 🎯 Next Steps

### Today (2 hours)
- [ ] Read [`docs/PROJECT_OVERVIEW.md`](docs/PROJECT_OVERVIEW.md)
- [ ] Review brand identity in [`docs/BRAND_IDENTITY.md`](docs/BRAND_IDENTITY.md)
- [ ] Get API keys (Clerk, Convex, OpenAI, Evaboot)

### This Week (10-15 hours)
- [ ] Complete environment setup
- [ ] Initialize Convex schema
- [ ] Set up Clerk authentication
- [ ] Create base components with design system
- [ ] Test Evaboot export/import workflow

### This Month (80-100 hours)
- [ ] Complete Week 1: Foundation
- [ ] Complete Week 2: Data Layer
- [ ] Complete Week 3: Intelligence
- [ ] Complete Week 4: UI & Automation
- [ ] Internal beta testing

**Start here:** [`docs/QUICK_START.md`](docs/QUICK_START.md)

---

## 🔗 Resources

- **Cole Medin (PIV Framework):** https://www.youtube.com/@ColeMedin
- **Convex Documentation:** https://docs.convex.dev
- **Clerk Authentication:** https://clerk.com/docs
- **Evaboot (Lead Extraction):** https://www.evaboot.com
- **PhantomBuster API:** https://docs.phantombuster.com
- **OpenAI API:** https://platform.openai.com/docs
- **Tailwind CSS:** https://tailwindcss.com
- **Lucide Icons:** https://lucide.dev

---

## 👥 Team & Credits

- **Framework:** Cole Medin's PIV Framework
- **Client:** RE ALINE (Andrew Line) → Vistage (Mary Forte)
- **Budget:** $1,000 (at-cost engineering)
- **Timeline:** 4 weeks to MVP
- **Brand Name:** LeadFlow AI
- **Tagline:** Intelligence Meets Opportunity

---

## 📝 Current Status

```
Planning Phase:      ████████████████████ 100% ✅
Brand & Design:      ████████████████████ 100% ✅
Week 1 (Foundation): ░░░░░░░░░░░░░░░░░░░░   0%
Week 2 (Data Layer): ░░░░░░░░░░░░░░░░░░░░   0%
Week 3 (Intelligence):░░░░░░░░░░░░░░░░░░░░   0%
Week 4 (UI/Auto):    ░░░░░░░░░░░░░░░░░░░░   0%
```

**Overall:** 30% (Planning + Brand/Design Complete, Implementation Starting)

---

## 📄 License

Private project - All rights reserved

---

<div align="center">

**Built with ❤️ using Cole Medin's PIV Framework**

**LeadFlow AI** - Intelligence Meets Opportunity

*Transform your LinkedIn connections into qualified leads*

**Last Updated:** February 9, 2026

</div>
