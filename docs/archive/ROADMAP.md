# LinkedIn Lead Gen SaaS - Implementation Roadmap

## 📅 4-Week Development Timeline

Based on Cole Medin's PIV Framework: **Plan → Implement → Validate**

---

## Week 1: Foundation Setup (Days 1-7)
**Goal:** Project scaffolding, authentication, database schema

### Day 1-2: Project Initialization
- ✅ Planning complete (PIV Framework Plan)
- [ ] Initialize React + Vite + TypeScript
- [ ] Configure Tailwind CSS + shadcn/ui
- [ ] Set up folder structure

### Day 3-4: Backend Setup
- [ ] Initialize Convex
- [ ] Define database schema (companies, people, posts, campaigns, activities)
- [ ] Create initial mutations/queries
- [ ] Test Convex dev environment

### Day 5-6: Authentication
- [ ] Set up Clerk project
- [ ] Implement sign-in/sign-up pages
- [ ] Add protected routes
- [ ] Test auth flow

### Day 7: Testing & Documentation
- [ ] Integration testing
- [ ] Document setup process
- [ ] Push to GitHub

**Deliverable:** Working authenticated app with database ready

---

## Week 2: Data Layer (Days 8-14)
**Goal:** CSV upload, enrichment pipeline, data storage

### Day 8-9: CSV Upload Feature
- [ ] File upload component with drag-drop
- [ ] CSV parsing with Papa Parse
- [ ] Validation and error handling
- [ ] Preview imported leads

### Day 10-12: PhantomBuster Integration
- [ ] API authentication
- [ ] Profile enrichment function (followers, connections, experience)
- [ ] Post scraping function (last 10 posts)
- [ ] Queue management for rate limiting

### Day 13-14: Database Operations
- [ ] CRUD operations for all tables
- [ ] Real-time subscriptions (Convex reactivity)
- [ ] Data relationships and queries
- [ ] Test with 100 sample leads

**Deliverable:** System can ingest and enrich LinkedIn profiles automatically

---

## Week 3: Scoring & AI (Days 15-21)
**Goal:** Intelligent lead scoring and AI-powered message generation

### Day 15-16: Scoring Engine
- [ ] Hard filter implementation (geography, title, company size, industry)
- [ ] Multi-factor scoring algorithm
  - [ ] Company size score (51-200: +10, 201-500: +20, etc.)
  - [ ] Follower influence score (5K-10K: +10, 10K-25K: +20, 25K+: +25)
  - [ ] Activity recency score (posts in last 90 days)
  - [ ] Event/conference signal detection (+5 per event post)
  - [ ] Mutual connection score (1-3: +5, 4-10: +10, 11+: +15)
  - [ ] Title relevance score (CEO/Founder: +10, President: +8, GM: +5)
- [ ] Tier classification (A: ≥70, B: 50-69, C: 30-49)
- [ ] Store breakdown in database

### Day 17-19: AI Message Generation
- [ ] OpenAI GPT-4o integration
- [ ] Prompt engineering for personalization
- [ ] Event keyword detection (regex + AI analysis)
  - Events: "conference", "summit", "forum", "expo"
  - Speaking: "speaking at", "panelist", "keynote"
  - Networking: "event", "happy hour", "dinner"
- [ ] Message customization (professional/casual/direct)
- [ ] Test message quality (aim for <20% edit rate)

### Day 20-21: Testing & Refinement
- [ ] Test scoring accuracy (manual vs algorithm)
- [ ] Validate message personalization
- [ ] Adjust weights based on sample data

**Deliverable:** Leads are scored and have personalized, non-generic messages

---

## Week 4: UI & Automation (Days 22-28)
**Goal:** Professional dashboard, approval workflow, LinkedIn automation

### Day 22-24: Approval Dashboard
- [ ] Leads table with sorting and filtering
  - [ ] Filter by tier (A/B/C)
  - [ ] Filter by status (pending/approved/rejected/sent)
  - [ ] Search by name/company
- [ ] Lead detail view
  - [ ] Profile summary
  - [ ] Score breakdown visualization
  - [ ] Recent posts preview
  - [ ] Generated message (editable)
- [ ] Approval actions
  - [ ] Approve button
  - [ ] Reject button
  - [ ] Edit message inline
  - [ ] Bulk approve for Tier A
- [ ] Real-time updates (Convex reactivity)

### Day 25-27: LinkedIn Automation
- [ ] n8n workflow setup (Docker or cloud)
- [ ] PhantomBuster Network Booster integration
- [ ] Rate limiting implementation
  - [ ] 1-3 connections per hour
  - [ ] Random delays (30-120 min between sends)
  - [ ] Daily limit (50 connections max)
- [ ] Activity logging
  - [ ] Track sent connections
  - [ ] Log errors (profile not found, limit hit)
  - [ ] Update lead status
- [ ] Test automation (send 5 test connections)

### Day 28: Final Testing & Polish
- [ ] End-to-end testing (upload → enrich → score → approve → send)
- [ ] Performance optimization (page load <2s)
- [ ] UI polish (responsive design, loading states)
- [ ] Bug fixes
- [ ] Prepare for demo

**Deliverable:** Fully functional MVP ready for production

---

## Post-Launch (Week 5+)
**Goal:** Analytics, monitoring, iteration

### Analytics Dashboard (Optional)
- [ ] Connection acceptance rate chart
- [ ] Score distribution histogram
- [ ] Campaign performance metrics
- [ ] Export reports to CSV

### Feedback Loop
- [ ] Track which score ranges convert best
- [ ] A/B test message styles
- [ ] Automatically adjust scoring weights
- [ ] Suggest new event keywords

### Monitoring
- [ ] Sentry error tracking
- [ ] PostHog product analytics
- [ ] Weekly iteration based on data
- [ ] User feedback sessions

---

## 🎯 Success Metrics

### Quantitative
- [ ] **Time Savings:** 40x faster than manual (30 sec vs 10-20 min per prospect)
- [ ] **Enrichment Speed:** 100 leads enriched in <15 minutes
- [ ] **Scoring Accuracy:** 90%+ of Tier A leads pass manual review
- [ ] **Message Quality:** 80%+ generated messages need no edits
- [ ] **Automation Safety:** 0 LinkedIn account restrictions after 100 sends
- [ ] **System Performance:** 99%+ uptime

### Qualitative
- [ ] User can complete workflow without documentation
- [ ] Dashboard feels responsive and polished
- [ ] Error messages are clear and actionable
- [ ] System feels "intelligent" not "robotic"

---

## 📊 Current Progress

```
Planning Phase:     ████████████████████ 100% ✅
Week 1 (Foundation): ░░░░░░░░░░░░░░░░░░░░   0%
Week 2 (Data Layer): ░░░░░░░░░░░░░░░░░░░░   0%
Week 3 (Scoring/AI): ░░░░░░░░░░░░░░░░░░░░   0%
Week 4 (UI/Auto):    ░░░░░░░░░░░░░░░░░░░░   0%
```

**Overall Progress:** 20% (Planning Complete)

---

## 🚀 Next Steps (Start TODAY)

### Immediate Actions (2-3 hours)
1. [ ] Run environment setup commands (see `.agents/workflows/piv-implementation.md`)
2. [ ] Get API keys:
   - [ ] Clerk: https://dashboard.clerk.com
   - [ ] Convex: https://dashboard.convex.dev
   - [ ] OpenAI: https://platform.openai.com/api-keys
   - [ ] PhantomBuster: https://phantombuster.com/api
3. [ ] Copy `.env.example` to `.env.local` and fill in keys
4. [ ] Run `npx convex dev` and verify connection

### Tomorrow
5. [ ] Implement Convex schema from `docs/PIV_FRAMEWORK_PLAN.md` Section 1.4
6. [ ] Set up Clerk authentication
7. [ ] Create basic React app structure

### This Week
8. [ ] Complete Week 1 tasks (Foundation Setup)
9. [ ] Daily validation: test what you built
10. [ ] Update this roadmap as you progress

---

## 📚 Key Documents

- **PIV Framework Plan:** `docs/PIV_FRAMEWORK_PLAN.md` (comprehensive technical plan)
- **Scope of Work:** `docs/SCOPE_OF_WORK.md` (business requirements)
- **Implementation Workflow:** `.agents/workflows/piv-implementation.md` (step-by-step guide)
- **Environment Variables:** `.env.example` (all API keys needed)

---

## 💡 PIV Framework Principles

### 1. PLAN (Complete ✅)
- Clear requirements documented
- Architecture defined
- Features broken into atomic tasks
- No assumptions about implementation

### 2. IMPLEMENT (In Progress)
- Build one feature at a time
- Test after each feature
- Use AI coding assistant effectively
- Reference PIV plan for context

### 3. VALIDATE (Continuous)
- Unit tests for functions
- Integration tests for APIs
- E2E tests for user flows
- User acceptance testing before launch

---

## 🎓 Resources

- **Cole Medin YouTube:** https://www.youtube.com/@ColeMedin
- **Convex Docs:** https://docs.convex.dev
- **Clerk Docs:** https://clerk.com/docs
- **shadcn/ui:** https://ui.shadcn.com
- **PhantomBuster API:** https://docs.phantombuster.com
- **OpenAI API:** https://platform.openai.com/docs

---

**Last Updated:** 2026-02-09  
**Framework:** Cole Medin's PIV Loop
