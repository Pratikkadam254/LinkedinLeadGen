---
description: Step-by-step PIV framework implementation workflow
---

# PIV Framework Implementation Workflow

This workflow guides you through implementing the LinkedIn Lead Gen SaaS following Cole Medin's PIV methodology.

---

## 🎯 PLANNING PHASE (Complete ✅)

The planning phase is complete. Review the comprehensive plan at:
- `docs/PIV_FRAMEWORK_PLAN.md` - Complete technical plan
- `docs/SCOPE_OF_WORK.md` - Project scope
- `docs/BRAND_IDENTITY.md` - Brand guidelines and visual identity
- `docs/CONTENT_STRATEGY.md` - Marketing and content plan
- `docs/DESIGN_SYSTEM.md` - UI components and design specs

**Brand Name:** LeadFlow AI  
**Design Style:** Premium dark-first with glassmorphism and gradient accents  
**Colors:** Electric Blue (#2563EB) → Cyan (#06B6D4)  
**Fonts:** Inter (body) + Outfit (display)

---

## 🛠️ IMPLEMENTATION PHASE

### Step 1: Environment Setup

// turbo
1. Initialize the React + TypeScript project with Vite
```bash
npm create vite@latest . -- --template react-ts
```

// turbo
2. Install core dependencies
```bash
npm install
```

// turbo
3. Install Convex
```bash
npm install convex
```

// turbo
4. Initialize Convex
```bash
npx convex dev
```

5. Install Clerk for authentication
```bash
npm install @clerk/clerk-react
```

6. Install Tailwind CSS
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

7. Install shadcn/ui components
```bash
npx shadcn-ui@latest init
```

8. Install additional dependencies
```bash
npm install @tanstack/react-table date-fns zustand papaparse
npm install -D @types/papaparse
```

---

### Step 2: Configure Environment Variables

9. Copy `.env.example` to `.env.local`
```bash
copy .env.example .env.local
```

10. Get API keys from:
- **Clerk**: https://dashboard.clerk.com
- **Convex**: https://dashboard.convex.dev
- **OpenAI**: https://platform.openai.com/api-keys
- **PhantomBuster**: https://phantombuster.com/api

11. Fill in the `.env.local` file with your keys

---

### Step 3: Set Up Database Schema

12. Create the Convex schema following `docs/PIV_FRAMEWORK_PLAN.md` Section 1.4

13. Define the following tables in `convex/schema.ts`:
- companies
- people
- posts
- campaigns
- activities
- users

// turbo
14. Push schema to Convex
```bash
npx convex dev
```

---

### Step 4: Implement Authentication (Week 1)

15. Set up Clerk provider in `src/main.tsx`

16. Create authentication pages:
- `/sign-in`
- `/sign-up`
- Protected route wrapper

17. Test authentication flow:
- Sign up new user
- Sign in existing user
- Protected route redirects

---

### Step 5: Build Data Ingestion (Week 2)

**Primary Method: Evaboot Integration**

18. Set up Evaboot workflow:
- Install Evaboot Chrome extension
- Connect to LinkedIn Sales Navigator
- Configure export format for LeadFlow AI compatibility
- Test export with 10-20 sample leads

19. Create CSV upload component
- File picker with drag-drop
- Evaboot CSV format validation
- Support for standard LinkedIn CSV exports
- Progress indicator

20. Implement CSV parsing
- Use Papa Parse
- Validate required columns (compatible with Evaboot format)
- Handle errors gracefully
- Show preview of imported data

21. Create Convex mutation to insert leads
- Batch insert for performance
- Deduplicate based on LinkedIn URL
- Return success/error counts

22. Test with Evaboot export (100+ rows)
- Verify all fields map correctly
- Check email validation data from Evaboot
- Confirm duplicate handling works

---

### Step 6: Implement Enrichment Pipeline (Week 2)

22. Set up PhantomBuster integration
- API authentication
- Rate limiting logic

23. Create enrichment functions:
- Profile data scraper
- Post scraper
- Company data scraper

24. Implement queue system:
- Process leads in batches
- Respect rate limits
- Log progress

25. Test enrichment with 10 sample profiles

---

### Step 7: Build Scoring Engine (Week 3)

26. Implement hard filters
- Geography check
- Title validation
- Company size filter
- Industry filter

27. Create scoring algorithm
- Company size score
- Follower influence score
- Activity recency score
- Event signal detection
- Mutual connection score
- Title relevance score

28. Implement tier classification (A/B/C)

29. Test scoring accuracy:
- Manually score 20 leads
- Compare with algorithm output
- Adjust weights if needed

---

### Step 8: Build AI Message Generation (Week 3)

30. Set up OpenAI API integration

31. Create prompt template
- Include prospect name
- Reference recent post
- Mention event if detected
- Customize tone

32. Implement event keyword detection
- Regex patterns for conferences
- Speaking engagement detection

33. Generate messages for Tier A leads

34. Test message quality:
- Read 20 generated messages
- Edit rate should be <20%

---

### Step 9: Build Approval Dashboard (Week 4)

35. Create leads table UI
- Sortable columns
- Filter by tier, status
- Search functionality

36. Build lead detail view
- Profile summary
- Score breakdown
- Recent posts
- Generated message

37. Implement approval actions
- Approve
- Reject
- Edit message
- Bulk approve

38. Test real-time updates (Convex reactivity)

---

### Step 10: Implement Automation (Week 4)

39. Set up n8n workflow
- Install n8n (Docker or cloud)
- Create LinkedIn automation workflow

40. Integrate PhantomBuster Network Booster
- API credentials
- Connection request template

41. Implement rate limiting
- 1-3 connections per hour
- Random delays (30-120 minutes)

42. Create activity logging
- Track sent connections
- Log errors
- Update lead status

43. Test automation:
- Send 5 test connections
- Verify rate limiting
- Check LinkedIn account status

---

### Step 11: Build Analytics Dashboard (Optional)

44. Create analytics page
- Connection acceptance rate chart
- Score distribution histogram
- Campaign performance metrics

45. Implement data export
- Export leads to CSV
- Export analytics report

---

## ✅ VALIDATION PHASE

### Step 12: End-to-End Testing

46. Complete user flow test:
- Upload CSV with 100 leads
- Wait for enrichment
- Review scored leads
- Approve top 20
- Monitor automation
- Check analytics

47. Performance validation:
- Page load times <2s
- No console errors
- Database queries optimized

48. UX validation:
- Test on mobile device
- Keyboard navigation works
- Error messages are clear

---

### Step 13: User Acceptance Testing

49. Demo to stakeholder (Vistage client):
- Walk through full workflow
- Explain scoring methodology
- Show sample messages
- Review analytics

50. Collect feedback:
- What works well?
- What's confusing?
- What's missing?

51. Prioritize improvements:
- Critical bugs (fix immediately)
- Nice-to-haves (backlog)

---

### Step 14: Production Deployment

// turbo
52. Deploy frontend to Vercel
```bash
npm run build
vercel deploy --prod
```

// turbo
53. Deploy Convex to production
```bash
npx convex deploy --prod
```

54. Set up monitoring:
- Sentry for error tracking
- PostHog for analytics

55. Configure production environment variables

56. Test production deployment:
- Run full user flow
- Verify all integrations work

---

### Step 15: Post-Launch Monitoring

57. Monitor error rate (first 24 hours)

58. Track key metrics:
- User sign-ups
- Leads enriched
- Messages sent
- Connection acceptance rate

59. Daily check-in (first week):
- Review error logs
- Respond to user feedback
- Fix critical bugs

60. Weekly iteration:
- Refine scoring algorithm
- Improve message templates
- Add requested features

---

## 📋 Current Status

- [x] Planning Phase Complete
- [ ] Week 1: Foundation Setup
- [ ] Week 2: Data Layer
- [ ] Week 3: Scoring & AI
- [ ] Week 4: UI & Automation
- [ ] MVP Launch

---

## 🚀 Quick Start (TODAY)

If you want to start right now:

1. Run Step 1 (Environment Setup)
2. Get API keys (Step 2)
3. Initialize Convex schema (Step 3)
4. Push your first commit to GitHub

**Time estimate:** 2-3 hours to complete Steps 1-3

---

## 💡 Tips for Working with AI Coding Assistant

- **Reference the PIV plan** before asking for code
- **Implement one feature at a time** (don't ask for everything at once)
- **Test after each feature** before moving to the next
- **Update this workflow** as you complete steps
- **Document any deviations** from the original plan

---

## 📚 Resources

### Core Documentation
- **PIV Framework Plan**: `docs/PIV_FRAMEWORK_PLAN.md`
- **Scope of Work**: `docs/SCOPE_OF_WORK.md`
- **Database Schema**: `docs/DATABASE_SCHEMA.md`

### Brand & Design
- **Brand Identity Guide**: `docs/BRAND_IDENTITY.md`
  - Logo concepts and usage
  - Color system (Electric Blue #2563EB → Cyan #06B6D4)
  - Typography (Inter + Outfit)
  - Brand voice and messaging
  - Visual design principles

- **Content Strategy**: `docs/CONTENT_STRATEGY.md`
  - Target personas (Strategic Sarah, Growth-Hacking Gary, Solo Steve)
  - Content pillars and publishing calendar
  - SEO strategy
  - Email marketing sequences
  - 90-day quick start plan

- **Design System**: `docs/DESIGN_SYSTEM.md`
  - Complete component library
  - Glassmorphic cards and gradient buttons
  - Animation library (fade-in-up, pulse, shimmer)
  - Responsive breakpoints
  - Accessibility guidelines
  - Design tokens (CSS variables)

### External Resources
- **Cole Medin (PIV Framework)**: https://www.youtube.com/@ColeMedin
- **Convex Documentation**: https://docs.convex.dev
- **Clerk Authentication**: https://clerk.com/docs
- **Evaboot (Lead Extraction)**: https://www.evaboot.com
- **PhantomBuster (Automation)**: https://phantombuster.com
- **Tailwind CSS**: https://tailwindcss.com
- **Lucide Icons**: https://lucide.dev

### Integration Tools
- **Evaboot**: LinkedIn Sales Navigator → CSV export ($49-99/month)
- **PhantomBuster**: Profile enrichment and automation ($30+/month)
- **OpenAI API**: Message personalization (GPT-4o)
- **n8n**: Workflow automation (self-hosted or cloud)

