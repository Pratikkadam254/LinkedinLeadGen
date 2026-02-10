# 🚀 Quick Start Guide - LinkedIn Lead Gen SaaS

**Following Cole Medin's PIV Framework**

---

## ✅ What's Already Done

- [x] **PLANNING PHASE COMPLETE** (PIV Step 1)
  - [x] Comprehensive PIV Framework Plan created
  - [x] Database schema defined
  - [x] Technical architecture documented
  - [x] 4-week roadmap planned
  - [x] Environment variables template ready

---

## 🎯 What You Need To Do RIGHT NOW

### Step 1: Get Your API Keys (30 minutes)

Visit these sites and create accounts:

1. **Clerk** (Authentication)
   - Go to: https://dashboard.clerk.com
   - Create new application: "LinkedIn Lead Gen"
   - Copy **Publishable Key** and **Secret Key**

2. **Convex** (Database)
   - Go to: https://dashboard.convex.dev
   - Create new project: "linkedin-leadgen"
   - Keys will be auto-generated when you run `npx convex dev`

3. **OpenAI** (AI Message Generation)
   - Go to: https://platform.openai.com/api-keys
   - Create new API key
   - Copy and save it (only shown once!)
   - Recommended: Set usage limit to $10/month

4. **PhantomBuster** (LinkedIn Scraping)
   - Go to: https://phantombuster.com
   - Sign up for Starter plan ($30/month) or Free trial
   - Go to Settings → API
   - Copy your API key

---

### Step 2: Set Up Your Environment (15 minutes)

Open PowerShell in `d:\LeadGenSaaS` and run:

```powershell
# Copy environment template
Copy-Item .env.example .env.local

# Open .env.local in your editor
code .env.local
```

Fill in these values:
```bash
# REQUIRED - Clerk Keys
VITE_CLERK_PUBLISHABLE_KEY=pk_test_....
CLERK_SECRET_KEY=sk_test_....

# REQUIRED - OpenAI Key
OPENAI_API_KEY=sk-proj-....

# REQUIRED - PhantomBuster Key
PHANTOMBUSTER_API_KEY=....

# Convex will auto-fill these when you run `npx convex dev`
CONVEX_DEPLOYMENT=
VITE_CONVEX_URL=
```

---

### Step 3: Initialize the Project (10 minutes)

Run these commands in PowerShell:

```powershell
# Initialize React + Vite project
npm create vite@latest . -- --template react-ts

# If it asks to overwrite, choose:
# - package.json: No (keep existing)
# - Other files: Yes (safe to overwrite)

# Install dependencies
npm install

# Install Convex
npm install convex

# Initialize Convex (this will open browser for auth)
npx convex dev
```

Wait for Convex to:
- Open browser for authentication
- Create your deployment
- Auto-fill `CONVEX_DEPLOYMENT` and `VITE_CONVEX_URL` in `.env.local`

---

### Step 4: Install Other Dependencies (5 minutes)

```powershell
# Install Clerk
npm install @clerk/clerk-react

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Install shadcn/ui (component library)
npx shadcn-ui@latest init
# Choose: Default style, Slate color, Yes to CSS variables

# Install utilities
npm install @tanstack/react-table date-fns papaparse
npm install -D @types/papaparse
```

---

### Step 5: Verify Everything Works (5 minutes)

```powershell
# Terminal 1: Start Convex backend
npx convex dev

# Terminal 2: Start React frontend
npm run dev
```

Open browser to `http://localhost:5173`

You should see:
- ✅ Vite welcome page
- ✅ No console errors
- ✅ Convex dev server running

---

## 📋 Today's Checklist

- [ ] Get Clerk API keys
- [ ] Get Convex access
- [ ] Get OpenAI API key
- [ ] Get PhantomBuster API key
- [ ] Copy `.env.example` to `.env.local`
- [ ] Fill in environment variables
- [ ] Initialize React + Vite project
- [ ] Install all dependencies
- [ ] Run `npx convex dev` successfully
- [ ] Run `npm run dev` successfully
- [ ] Commit initial setup to Git

---

## 🎓 Learning the PIV Framework

### The Three Phases

**1. PLAN** (You are here: ✅ Complete)
- Read: `docs/PIV_FRAMEWORK_PLAN.md`
- Understand: Database schema, architecture, features
- Never skip planning when building new features!

**2. IMPLEMENT** (Starting tomorrow)
- Build one feature at a time
- Reference the PIV plan for context
- Test after each feature
- Use AI coding assistant effectively

**3. VALIDATE** (Continuous)
- Test functionality after each feature
- Check performance (page load <2s)
- Review UX (is it intuitive?)
- Fix bugs before moving to next feature

---

## 🔄 The PIV Loop

```
┌─────────────────────────────────────────────┐
│  PLAN: Define what to build                 │
│  • Read requirements                        │
│  • Break into tasks                         │
│  • Clarify ambiguities                      │
└──────────────┬──────────────────────────────┘
               ▼
┌─────────────────────────────────────────────┐
│  IMPLEMENT: Build the feature               │
│  • Write code (delegate to AI assistant)    │
│  • Follow plan strictly                     │
│  • Don't add scope creep                    │
└──────────────┬──────────────────────────────┘
               ▼
┌─────────────────────────────────────────────┐
│  VALIDATE: Test everything                  │
│  • Does it work? (functionality)            │
│  • Is it fast? (performance)                │
│  • Is it clear? (UX)                        │
└──────────────┬──────────────────────────────┘
               │
               └──> Back to PLAN for next feature
```

---

## 📝 Tomorrow's Tasks (Week 1, Days 1-2)

After setup is complete, you'll work on:

1. **Create Convex Schema**
   - File: `convex/schema.ts`
   - Copy from: `docs/PIV_FRAMEWORK_PLAN.md` Section 1.4
   - Define tables: companies, people, posts, campaigns, activities

2. **Set Up Clerk Authentication**
   - Create sign-in page
   - Create sign-up page
   - Add protected routes

3. **Create Basic App Structure**
   - Dashboard layout
   - Navigation
   - Routing

**Time estimate:** 4-6 hours

---

## 💡 PRO TIPS for Working with AI Coding Assistants

### DO ✅
- Reference the PIV plan before asking for code
- Implement ONE feature at a time
- Test after EACH feature
- Ask specific questions: "Implement Feature 1.1.1 from PIV plan"
- Update the PIV plan if requirements change

### DON'T ❌
- Don't ask AI to "build everything at once"
- Don't skip testing
- Don't add features not in the plan (scope creep!)
- Don't assume AI knows your context (give it the PIV plan)
- Don't move to next feature if current one is broken

---

## 🆘 Troubleshooting

### "npm create vite failed"
```powershell
# Clear npm cache
npm cache clean --force

# Try again
npm create vite@latest . -- --template react-ts
```

### "npx convex dev" won't authenticate
- Make sure you're signed in to Convex dashboard in browser
- Try: `npx convex logout` then `npx convex dev`

### "TypeScript errors everywhere"
- Run: `npm install`
- Restart VS Code
- Check `tsconfig.json` exists

### "Tailwind classes not working"
- Make sure `tailwind.config.js` exists
- Check `src/index.css` has Tailwind directives
- Restart dev server

---

## 📚 Key Documents

| Document | Purpose |
|----------|---------|
| `docs/PIV_FRAMEWORK_PLAN.md` | Master plan (read this first!) |
| `docs/ROADMAP.md` | 4-week timeline |
| `docs/SCOPE_OF_WORK.md` | Business requirements |
| `.agents/workflows/piv-implementation.md` | Step-by-step commands |
| `.env.example` | API keys reference |

---

## 🎯 Success Criteria for Today

At the end of today, you should have:
- ✅ All API keys obtained
- ✅ `.env.local` configured
- ✅ Project initialized with Vite
- ✅ All dependencies installed
- ✅ Convex dev server running
- ✅ React dev server running
- ✅ No console errors
- ✅ Code committed to Git

**Time to complete:** ~1.5 hours

---

## 🚀 Ready to Start?

1. Open PowerShell in `d:\LeadGenSaaS`
2. Follow Step 1: Get Your API Keys
3. Come back when you have all 4 keys

Then proceed through Steps 2-5 sequentially.

**You got this!** 💪

---

**Framework:** Cole Medin's PIV Loop  
**Status:** Planning Complete → Implementation Starting  
**Next Phase:** Week 1, Day 1 - Foundation Setup
