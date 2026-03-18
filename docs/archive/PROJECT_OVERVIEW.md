# LeadFlow AI - Project Overview & Quick Reference

**Project:** LinkedIn Lead Generation SaaS Platform  
**Brand Name:** LeadFlow AI  
**Framework:** PIV (Plan-Implement-Validate) by Cole Medin  
**Status:** Planning Complete ✅ | Implementation Ready 🚀

---

## 📋 Executive Summary

LeadFlow AI is a premium B2B LinkedIn lead generation platform that combines AI-powered intelligence with human oversight to help sales professionals and consultants identify, qualify, and engage high-value prospects at scale.

### Core Value Proposition
**Transform your LinkedIn connections into qualified leads with AI-powered intelligence that feels human.**

---

## 🎯 Key Documents Overview

### 1. **Brand Identity** (`docs/BRAND_IDENTITY.md`)
Your complete brand bible covering:
- **Visual System:** Electric Blue (#2563EB) → Cyan gradients, premium dark theme
- **Typography:** Inter (body) + Outfit (display headlines)
- **Design Philosophy:** Clarity, data-driven aesthetics, intelligent minimalism
- **Brand Voice:** Intelligent, empowering, professional, modern, human
- **Logo Concepts:** Geometric nodes with flowing connections
- **Color Palette:** Full primary, secondary, and neutral systems
- **Applications:** Business cards, email signatures, social templates

**When to reference:** Before any design work, marketing material, or UI component creation

---

### 2. **Content Strategy** (`docs/CONTENT_STRATEGY.md`)
Your marketing and content blueprint:
- **Target Personas:** 
  - Strategic Sarah (VP Sales, revenue responsibility)
  - Growth-Hacking Gary (Head of Growth, lead gen focused)
  - Solo Steve (Consultant/Founder, hands-on)
  
- **Content Pillars:**
  - LinkedIn Strategy (30%)
  - Sales Automation (25%)
  - Data & Analytics (20%)
  - Success Stories (15%)
  - Industry Insights (10%)

- **Publishing Calendar:**
  - 20-25 LinkedIn posts/month
  - 8-10 blog posts/month
  - 4-6 videos/month
  - Weekly newsletter

- **90-Day Quick Start:** Month-by-month execution plan

**When to reference:** Creating any customer-facing content, blog posts, social media, emails

---

### 3. **Design System** (`docs/DESIGN_SYSTEM.md`)
Your complete UI component library and visual storyboard:
- **Component Specs:**
  - Glassmorphic cards with backdrop blur
  - Gradient buttons with glow effects
  - Data tables with real-time updates
  - Interactive charts (Chart.js custom theme)
  
- **Animation Library:**
  - Fade-in-up page transitions
  - Pulse for live data
  - Shimmer loading states
  - Hover glow effects

- **Design Tokens:** CSS variables for colors, spacing, typography, shadows
- **Responsive System:** Mobile-first (640px, 768px, 1024px, 1280px)
- **Accessibility:** WCAG AA compliance, keyboard navigation, screen readers

**When to reference:** Building any UI component, implementing animations, styling pages

---

### 4. **PIV Framework Plan** (`docs/PIV_FRAMEWORK_PLAN.md`)
Your comprehensive technical roadmap (976 lines):
- **Product Definition:** Vision, problem statement, success metrics
- **Architecture:** System components diagram, data flow
- **Tech Stack:** React, Convex, Clerk, PhantomBuster, OpenAI
- **Database Schema:** 6 tables (companies, people, posts, campaigns, activities, users)
- **Feature Breakdown:** Granular tasks for MVP and Phase 2
- **Integration Requirements:** Evaboot, PhantomBuster, OpenAI, LinkedIn
- **4-Week Implementation Roadmap:**
  - Week 1: Foundation (React, Convex, Auth)
  - Week 2: Data Layer (CSV, enrichment, storage)
  - Week 3: Scoring & AI (algorithm, message generation)
  - Week 4: UI & Automation (dashboard, PhantomBuster)
- **Validation Checkpoints:** Testing, UAT, deployment

**When to reference:** Starting any implementation work, understanding system architecture

---

### 5. **PIV Implementation Workflow** (`.agents/workflows/piv-implementation.md`)
Your step-by-step execution guide:
- 60 numbered steps from environment setup to production
- Turbo annotations for auto-runnable commands
- Testing checkpoints after each feature
- User acceptance testing procedures
- Production deployment steps
- Post-launch monitoring

**When to reference:** Daily development work, tracking progress, next steps

---

### 6. **Scope of Work** (`docs/SCOPE_OF_WORK.md`)
Your project requirements and context:
- Original client brief
- System requirements
- User stories
- Success criteria
- Timeline and milestones

**When to reference:** Understanding original requirements, stakeholder communication

---

## 🔧 Technology Stack Summary

### Frontend
```
React 18 + TypeScript
Tailwind CSS + Custom Design System
Vite (build tool)
React Router v6
Lucide Icons
```

### Backend
```
Convex (database + serverless functions)
Clerk (authentication)
Convex storage (file uploads)
Convex scheduled functions (cron jobs)
```

### AI & Automation
```
OpenAI GPT-4o (message personalization)
Convex vector search (semantic analysis)
n8n (workflow orchestration)
PhantomBuster (LinkedIn automation)
Evaboot (lead extraction - PRIMARY)
```

### Infrastructure
```
Vercel (frontend hosting)
Convex Cloud (backend)
Sentry (error tracking)
PostHog (analytics)
```

---

## 🚀 Quick Start Guide

### For Developers

1. **Read First:**
   - `docs/PIV_FRAMEWORK_PLAN.md` (sections 1.1-1.3)
   - `docs/DESIGN_SYSTEM.md` (design tokens)
   
2. **Set Up Environment:**
   - Follow `.agents/workflows/piv-implementation.md` Steps 1-3
   - Get API keys (Clerk, Convex, OpenAI, PhantomBuster, Evaboot)
   - Initialize Convex schema

3. **Start Coding:**
   - Reference design system for all UI components
   - Use brand tokens (CSS variables)
   - Follow TypeScript strict mode
   - Implement one feature at a time

### For Designers

1. **Brand Guidelines:**
   - Review `docs/BRAND_IDENTITY.md` completely
   - Use Figma/design tool with brand tokens
   - Follow design principles (clarity > cleverness)

2. **Component Design:**
   - Reference `docs/DESIGN_SYSTEM.md` for existing components
   - Maintain dark-first aesthetic
   - Use glassmorphism and gradients per brand

3. **Asset Creation:**
   - Logo variations (full color, mono, icon)
   - Marketing templates (social, email)
   - UI mockups following storyboard

### For Content Creators

1. **Voice & Tone:**
   - Review `docs/BRAND_IDENTITY.md` (Brand Voice section)
   - Study persona profiles in `docs/CONTENT_STRATEGY.md`
   
2. **Content Calendar:**
   - Follow publishing rhythm (20-25 LinkedIn posts/month)
   - Use content pillar rotation
   - Reference message templates

3. **SEO & Distribution:**
   - Target keywords in content strategy doc
   - Follow on-page optimization checklist
   - Use approved channels and formats

---

## 🛠️ Evaboot Integration (Primary Lead Source)

### Why Evaboot?
- **Cleaner Data:** Email validation, duplicate removal
- **Safer:** No LinkedIn account restrictions
- **Faster:** 1000+ leads in minutes
- **Enriched:** Comes with validated emails

### Workflow:
```
1. Sales Navigator Search → 2. Evaboot Extract → 3. Export to CSV
       ↓
4. Upload to LeadFlow AI → 5. PhantomBuster Enrichment → 6. AI Scoring & Messages
```

### CSV Format Support:
- Evaboot standard export (recommended)
- LinkedIn CSV export (fallback)
- Custom CSV (with required columns)

**Cost:** $49-99/month (volume-based)  
**Link:** https://www.evaboot.com

---

## 📊 Database Schema Quick Reference

### Core Tables

**companies**
- Company details, industry, size, location
- Linked to people

**people** (Main table)
- Profile data (name, title, LinkedIn URL)
- Enrichment (followers, connections, posts count)
- Scoring (total score, breakdown, tier A/B/C)
- Outreach (message draft, status, timestamps)

**posts**
- LinkedIn post content and engagement
- AI analysis (event keywords, sentiment)
- Linked to people

**campaigns**
- Targeting criteria
- Message templates
- Rate limits

**activities**
- Connection requests, acceptances, messages
- Timeline and tracking

**users**
- Auth via Clerk
- Role-based permissions

---

## 🎨 Brand Quick Reference

### Colors
```css
--primary: #2563EB (Electric Blue)
--accent: #06B6D4 (Cyan)
--gradient: linear-gradient(135deg, #2563EB, #06B6D4)

--bg-primary: #0A0E1A (Midnight)
--bg-secondary: #1E293B (Slate Deep)

--success: #10B981
--warning: #F59E0B
--danger: #EF4444
```

### Typography
```css
--font-sans: 'Inter', sans-serif
--font-display: 'Outfit', 'Inter', sans-serif

--font-size-base: 1rem (16px)
--font-size-lg: 1.125rem (18px)
--font-size-xl: 1.25rem (20px)
--font-size-3xl: 1.875rem (30px)
```

### Spacing
```css
--space-sm: 8px
--space-md: 16px
--space-lg: 24px
--space-xl: 32px
--space-2xl: 48px
```

---

## ✅ Implementation Checklist

### Phase 1: Foundation (Week 1)
- [ ] Initialize React + TypeScript + Vite
- [ ] Set up Convex database
- [ ] Configure Clerk authentication
- [ ] Implement design tokens (CSS variables)
- [ ] Create base components (buttons, inputs, cards)

### Phase 2: Data Layer (Week 2)
- [ ] Build CSV upload component (Evaboot compatible)
- [ ] Integrate PhantomBuster API
- [ ] Implement enrichment queue
- [ ] Test with 100+ lead import

### Phase 3: Intelligence (Week 3)
- [ ] Build scoring algorithm (6 factors)
- [ ] Implement tier classification (A/B/C)
- [ ] Integrate OpenAI for message generation
- [ ] Test message quality (>80% approval rate)

### Phase 4: User Interface (Week 4)
- [ ] Build approval dashboard
- [ ] Create analytics charts
- [ ] Implement n8n automation
- [ ] Test end-to-end flow

### Validation & Launch
- [ ] End-to-end testing (full workflow)
- [ ] User acceptance testing
- [ ] Deploy to production (Vercel + Convex)
- [ ] Monitor for 48 hours

---

## 💡 AI Assistant Instructions

When implementing features:

1. **Always reference relevant docs first:**
   - Design → `DESIGN_SYSTEM.md`
   - Brand/Voice → `BRAND_IDENTITY.md`
   - Technical → `PIV_FRAMEWORK_PLAN.md`

2. **Follow patterns:**
   - Use design tokens (CSS variables)
   - TypeScript strict mode (no `any`)
   - Convex mutations for writes, queries for reads
   - Error handling with try/catch

3. **Code style:**
   - Functional components with hooks
   - Arrow functions
   - Destructure props
   - Tailwind classes (avoid custom CSS)

4. **Testing:**
   - Test after each feature
   - Validate against acceptance criteria
   - Check responsive design
   - Verify accessibility

---

## 📈 Success Metrics

### Product Metrics
- Time savings: 40x (10-20 min → 30 sec per prospect)
- Message quality: >80% approval rate (minimal edits)
- Connection acceptance: >50% (industry average: 35%)
- Lead enrichment: >95% success rate

### Business Metrics
- User sign-ups: Target 100 in Month 1
- Active users: >60% weekly activity
- NPS score: >50
- Churn: <10% monthly

### Content Metrics
- Blog traffic: +200% YoY
- Email subscribers: 5,000 in Q1
- LinkedIn engagement: >8% rate
- Trial conversions: 5% from content

---

## 📞 Next Steps

### Today (Immediate):
1. ✅ Review this overview document
2. ✅ Read brand identity guide
3. ✅ Familiarize with design system
4. ⏭️ Set up development environment (Step 1-3 of workflow)

### This Week:
- Complete Week 1 tasks (Foundation Setup)
- Get all API keys configured
- Push first commit to GitHub
- Create initial Convex schema

### This Month:
- Complete MVP (Weeks 1-4)
- Internal testing with small dataset
- Refine based on feedback
- Prepare for beta launch

---

## 📚 Document Map

```
docs/
├── BRAND_IDENTITY.md          # Brand bible (logo, colors, voice)
├── CONTENT_STRATEGY.md        # Marketing plan (personas, calendar)
├── DESIGN_SYSTEM.md           # UI library (components, animations)
├── PIV_FRAMEWORK_PLAN.md      # Technical blueprint (976 lines)
├── SCOPE_OF_WORK.md           # Original requirements
├── DATABASE_SCHEMA.md         # Data models
└── PROJECT_OVERVIEW.md        # This file ⚡

.agents/workflows/
├── piv-implementation.md      # Step-by-step execution
└── react-convex-clerk.md      # Tech stack setup guide
```

---

## 🎯 Remember

**Brand Essence:** LeadFlow AI = Intelligence Meets Opportunity

**Design Mantra:** Premium, Dark-First, Glassmorphic, Micro-Interactive

**Development Approach:** Plan → Implement → Validate (PIV Loop)

**Content Voice:** Intelligent yet human, empowering not overwhelming

**User Promise:** 40x time savings without sacrificing quality

---

**Version:** 1.0  
**Last Updated:** February 9, 2026  
**Status:** Ready for Implementation 🚀

---

*This document is your north star. Reference it whenever you need clarity on brand, design, technical architecture, or next steps. Keep it updated as the project evolves.*
