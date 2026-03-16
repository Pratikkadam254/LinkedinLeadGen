# AI Skill Architecture for SaaS GTM

> Analysis of the goose-skills pattern and a proposed skill architecture for building and marketing a SaaS product using AI coding agents (Claude Code, Codex, Cursor).

---

## Table of Contents

1. [Goose-Skills Analysis](#part-1-goose-skills-analysis)
2. [Gap Analysis — What's Missing for SaaS Builders](#part-2-gap-analysis)
3. [Proposed Skill Architecture for LeadFlow AI](#part-3-proposed-skill-architecture)
4. [Skill Inventory](#part-4-skill-inventory)
5. [Implementation Roadmap](#part-5-implementation-roadmap)

---

## Part 1: Goose-Skills Analysis

### What Are Goose Skills?

[Goose Skills](https://github.com/athina-ai/goose-skills) is an open-source library of **125 pre-built AI agent workflows** for go-to-market operations. Each "skill" is a structured prompt that an AI coding agent (Claude Code, Codex, or Cursor) follows to execute a specific GTM task — from scraping competitor ads to orchestrating a full outbound prospecting campaign.

**Key insight:** Skills turn AI agents from general-purpose assistants into specialized GTM operators with built-in best practices, safety gates, and cost controls.

### The 3-Tier Architecture

Skills are organized into three levels of complexity:

```
┌─────────────────────────────────────────────────┐
│                  PLAYBOOKS (9)                   │
│        End-to-end processes with governance      │
│        5-7+ phases  │  $5-50+  │  3+ checkpoints │
├─────────────────────────────────────────────────┤
│                 COMPOSITES (61)                  │
│         Chain multiple capabilities together     │
│        4-5+ phases  │  $2-10+  │  0-2 checkpoints│
├─────────────────────────────────────────────────┤
│                CAPABILITIES (55)                 │
│            Atomic, single-purpose tools          │
│        2-5 phases   │  $0-3    │  0-2 checkpoints│
└─────────────────────────────────────────────────┘
```

| Tier | Count | Purpose | Phases | Typical Cost | Human Checkpoints |
|------|-------|---------|--------|-------------|-------------------|
| **Capabilities** | 55 | Single atomic task | 2-5 | $0-3 | 0-2 |
| **Composites** | 61 | Chain capabilities together | 4-5+ | $2-10+ | 0-2 |
| **Playbooks** | 9 | Full business processes | 5-7+ | $5-50+ | 3+ |

### Skill File Structure

Every skill consists of exactly **2 files**:

#### SKILL.md — The Agent Instructions

This is the prompt the AI agent follows. It has a consistent anatomy:

```
1. OVERVIEW         — What the skill does (one paragraph)
2. PHASES           — Numbered steps (Phase 0: Intake, Phase 1: Execute, etc.)
3. HARD RULES       — Explicit constraints ("Never upsert without approval")
4. SAFETY GATES     — Preview-before-write, dry-run, cost approval
5. COST STRUCTURE   — What each API call costs
6. DELIVERABLE      — Exact output format
```

**Example — Email Drafting Capability:**
- Phase 0 (Intake): Gather 16 questions across campaign context, audience, proof, tone
- Phase 1 (Drafting): Apply one of four frameworks (PAS, BAB, AIDA, Signal-Proof-Ask) with strict word targets (50-90 words initial, 30-50 follow-ups)
- Phase 2 (Review): Present 3-5 variants, iterate max 3 rounds, deploy
- Hard Rules: "No filler openers", "Every email references something specific to recipient", "Exactly one CTA per email", subject lines under 50 chars

**Example — Apollo Lead Finder Capability:**
- Phase 1 (Search — Free): Collect ICP criteria, execute free People Search, generate manifest
- Phase 2 (Enrich — Paid): Requires explicit user approval, 1 credit per contact, deduplicates against Supabase
- Safety Gate: "Never upsert leads to Supabase without explicit user approval"
- Cost: Search = free, Enrichment = 1 credit/contact, modes: Test (10), Standard (500), Full (2,500)

**Example — Signal Scanner Capability:**
- 3 phases: free diff-based signals → Apify enrichment → scoring
- Critical rule: "Always run `--dry-run` first"
- 8 signal types across company/person levels (P0: headcount growth, tech stack changes → P2: new C-suite hires)
- Scoring: signal strength × recency multiplier (1.5 recent → 0.5 older) × account tier fit (1.3 for Tier 1)

#### skill.meta.json — Metadata

```json
{
  "slug": "email-drafting",
  "category": "capabilities",
  "tags": ["outreach"],
  "installation": {
    "base_command": "npx goose-skills install email-drafting",
    "supports": ["claude", "cursor", "codex"]
  }
}
```

**Required fields:**
| Field | Type | Values |
|-------|------|--------|
| `slug` | string | Lowercase alphanumeric + hyphens (e.g., `apollo-lead-finder`) |
| `category` | enum | `capabilities`, `composites`, or `playbooks` |
| `tags` | array | From: `ads`, `brand`, `competitive-intel`, `content`, `lead-generation`, `monitoring`, `outreach`, `research`, `seo` |
| `installation.base_command` | string | `npx goose-skills install <slug>` |
| `installation.supports` | array | `claude`, `cursor`, `codex` |

**Optional fields:** `features` (array), `github_url` (string), `author` (string)

### How Skill Chaining Works

Composites and playbooks reference upstream capabilities explicitly:

```
seo-opportunity-finder (composite)
  ├── depends on: site-content-catalog (capability)
  ├── depends on: seo-domain-analyzer (capability)
  └── depends on: seo-traffic-analyzer (capability)

funding-signal-outreach (composite)
  Step 1: Detect funding signals
  Step 2: Qualify against ICP ←── uses icp-identification output
  Step 3: Find people ←── uses apollo-lead-finder
  Step 4: Draft emails ←── uses email-drafting
  Step 5: Handoff to outreach platform
```

**Chaining patterns:**
- Skills pass **context forward** — e.g., `icp-identification` creates an ICP definition that becomes "input context for all downstream skills"
- Safety gates at handoff points prevent premature execution
- Deduplication at skill boundaries (e.g., check Supabase before writing)
- Tool-agnostic: configure vendors once (Apollo, Apify, etc.), composites adapt

### Installation & Integration

```bash
# Install to Claude Code (default)
npx goose-skills install email-drafting

# Install to Codex
npx goose-skills install email-drafting --codex

# Install to Cursor (project-level)
npx goose-skills install email-drafting --cursor --project-dir ./
```

**Where skills live:**

| Platform | Location | Format |
|----------|----------|--------|
| Claude Code | `~/.claude/skills/<slug>/` | SKILL.md + skill.meta.json |
| Codex | `~/.codex/skills/<slug>/` | Full directory copy |
| Cursor | `.cursor/rules/goose-<slug>.mdc` | Transformed .mdc rule file |

**Project-level integration:**
```bash
mkdir -p .claude/skills
cp ~/.claude/skills/<slug>/SKILL.md .claude/skills/<slug>.md
```

### Category Coverage

| Category | Skills | What They Cover |
|----------|--------|----------------|
| **Lead Generation** | 23 | Apollo prospecting, LinkedIn scraping, event attendees, job intent signals, TAM building |
| **Outreach** | 20 | Cold email, LinkedIn campaigns, KOL discovery, signal-triggered sequences, multi-channel engines |
| **Content** | 17 | Blog scraping, campaign briefs, presentations, case studies, carousels |
| **Research** | 17 | ICP definition, website audits, meeting prep, sales coaching, churn detection |
| **Ads** | 12 | Ad scraping (Meta, Google), campaign analysis, creative intelligence, budget optimization |
| **Competitive Intel** | 11 | Battlecards, GTM analysis, pricing monitoring, tech stack reverse-engineering |
| **Monitoring** | 11 | Reddit/Twitter/HN/ProductHunt listening, review aggregation, newsletter tracking |
| **SEO** | 10 | Keyword research, programmatic SEO, content audits, SERP analysis, AI answer optimization |
| **Brand** | 4 | Voice extraction, positioning, messaging testing, visual branding |

### Key Design Patterns Worth Adopting

1. **Safety-first execution** — Every skill that touches paid APIs or databases has dry-run/preview modes and requires explicit user approval before spending money or writing data

2. **Phased intake** — Skills gather all context upfront (Phase 0) before doing any work, preventing wasted API calls on misunderstood requirements

3. **Tool-agnostic design** — Composites configure vendors once; swapping Apollo for a different enrichment provider doesn't require rewriting the workflow

4. **Cost transparency** — Every skill documents per-call pricing so users can estimate costs before execution

5. **Context forwarding** — Upstream skills produce structured output that downstream skills consume, eliminating redundant intake questions

6. **Explicit deliverable format** — Every skill specifies exactly what the output looks like (JSON, CSV, Markdown, etc.)

---

## Part 2: Gap Analysis

### What Goose-Skills Covers Well

Goose-skills is excellent for **GTM execution** — the operational work of finding leads, crafting outreach, analyzing competitors, and monitoring channels. If you need to:

- Find and enrich leads via Apollo → covered
- Write cold email sequences → covered
- Scrape competitor ads → covered
- Monitor Reddit/HN/ProductHunt → covered
- Build SEO content pipelines → covered

### What's Completely Missing

Goose-skills has **zero coverage** for actually building the SaaS product or the full founder journey:

| Gap Area | What's Missing | Why It Matters |
|----------|---------------|----------------|
| **Product Building** | Landing page generation, onboarding flows, pricing page design, feature implementation | You need a product before you can market it |
| **SaaS Infrastructure** | Auth setup, billing/Stripe integration, deployment, database design | The technical foundation |
| **Feedback Loops** | Churn analysis, user interview synthesis, feature request prioritization, NPS tracking | GTM without feedback is flying blind |
| **Blueprint/Lead Magnet Creation** | Actual content creation for the blueprints that power the entire GTM engine | The GTM playbook's #1 cross-cutting strategy has no skill support |
| **Demo & Sales Process** | Qualification routing, demo deck creation, follow-up sequences, trial-to-paid conversion | The revenue conversion layer |
| **Channel Orchestration** | Coordinating across LinkedIn + email + Reddit + ads + influencers simultaneously | Individual channels exist, but the synchronized engine doesn't |
| **Founder Content** | Build-in-public posts, storytelling, journey documentation | The inbound strategy that compounds over time |

### The Opportunity

A **"SaaS Builder + GTM" skill library** would combine:
- Goose-skills' GTM execution patterns (adapted and extended)
- Product-building skills (landing pages, onboarding, pricing)
- The blueprint/lead magnet strategy as a first-class skill category
- Channel orchestration that matches the synchronized multi-channel engine from the GTM playbook

This would be the first skill library covering the **full journey from idea validation to $1M ARR**.

---

## Part 3: Proposed Skill Architecture

### Extended Category System

Building on goose-skills' tag system, adding categories for the full SaaS journey:

| Category | Tag | Description |
|----------|-----|-------------|
| **Product Building** | `build` | Landing pages, onboarding, pricing, features |
| **Outbound GTM** | `gtm-outbound` | LinkedIn outreach, cold email infrastructure |
| **Inbound GTM** | `gtm-inbound` | LinkedIn/X/Reddit content, YouTube SEO |
| **Paid GTM** | `gtm-paid` | Meta ads, influencer marketing |
| **Sales** | `gtm-sales` | Demo process, qualification, closing |
| **Content/Blueprints** | `gtm-content` | Blueprint creation, lead magnets, viral content |
| **Analytics** | `gtm-analytics` | Channel tracking, attribution, ROI metrics |
| **Competitive Intel** | `competitive-intel` | Competitor monitoring, ad scraping, positioning |
| **SEO** | `seo` | Keyword research, content optimization, YouTube SEO |

### Skill Design Standards

Following goose-skills patterns, every skill in this architecture must have:

```
SKILL.md Requirements:
├── Overview (1 paragraph — what it does, when it triggers)
├── Phase 0: Intake (gather context, ask questions)
├── Phase 1-N: Execution (specific steps with clear deliverables)
├── Hard Rules (explicit constraints, never/always rules)
├── Safety Gates (approval points before irreversible actions)
├── Cost Structure (if applicable — API costs, time estimates)
└── Deliverable Format (exact output specification)

skill.meta.json Requirements:
├── slug (lowercase-hyphenated)
├── category (capabilities | composites | playbooks)
├── tags (from extended category system)
└── installation.supports (claude, cursor, codex)
```

---

## Part 4: Skill Inventory

### Capabilities (20 skills)

Atomic, single-purpose tools. Each handles one specific task.

#### GTM Content & Blueprints

| Skill | Tag | Description | Phases |
|-------|-----|-------------|--------|
| `lead-magnet-generator` | `gtm-content` | Creates a complete blueprint/lead magnet from a topic. Researches viral content in the niche, structures the blueprint with value content + product mentions + CTAs, outputs as markdown or HTML. | Phase 0: Topic intake + niche context. Phase 1: Research viral content on the topic. Phase 2: Structure blueprint (intro → demo video slot → playbook → screenshots → social proof → CTA). Phase 3: Review and iterate. |
| `viral-topic-scanner` | `gtm-content` | Monitors LinkedIn, X, and Reddit for trending topics in a specific niche. Identifies what lead magnets people are requesting, what posts are going viral, and what topics have engagement momentum. | Phase 0: Niche/keyword intake. Phase 1: Scan platforms for high-engagement content. Phase 2: Rank topics by virality signals. Phase 3: Output prioritized topic list with engagement data. |
| `brand-voice-definer` | `gtm-content` | Analyzes existing content (website, social posts, emails) to extract tone, style, vocabulary patterns. Produces a voice guide for consistent messaging across all channels. | Phase 0: Collect content samples (URLs, text). Phase 1: Analyze across dimensions (formality, humor, directness, jargon). Phase 2: Generate voice guide with do/don't examples. |

#### Outbound

| Skill | Tag | Description | Phases |
|-------|-----|-------------|--------|
| `cold-email-sequence-writer` | `gtm-outbound` | Writes a 3-email lead-magnet-first cold email sequence. Follows the proven pattern: offer a resource, follow up, final nudge. Text-only, no filler, one CTA per email. | Phase 0: Intake (product, ICP, lead magnet topic, tone). Phase 1: Draft 3 emails with randomization variants. Phase 2: Review against rules (no open tracking, text-only, <90 words, Sunday-optimized). |
| `email-infra-planner` | `gtm-outbound` | Calculates the exact domain/account infrastructure needed for a target daily send volume. Outputs domain count, emails per domain, warmup timeline, and monthly cost estimate. | Phase 0: Target volume + budget intake. Phase 1: Calculate infrastructure (domains = volume ÷ 150, accounts = domains × 3). Phase 2: Generate setup checklist with timeline. |
| `linkedin-post-writer` | `gtm-outbound` | Generates LinkedIn posts in two modes: build-in-public (founder stories with metrics) or lead-magnet (viral topic + CTA to comment). Adapts to brand voice. | Phase 0: Mode selection + context. Phase 1: Draft post with AI-generated image prompt. Phase 2: Add engagement hooks and CTA. |
| `icp-definer` | `gtm-outbound` | Interview-based ICP creation. Asks structured questions about product, current customers, deal size, exclusions. Outputs ICP document with job titles, seniority, company size, industry, geography, and buying signals. | Phase 0: Guided interview (10-15 questions). Phase 1: Research market and competitors. Phase 2: Draft ICP with inclusion/exclusion criteria. Phase 3: Validate and finalize. |

#### Inbound

| Skill | Tag | Description | Phases |
|-------|-----|-------------|--------|
| `reddit-post-crafter` | `gtm-inbound` | Creates long-form Reddit storytelling posts with proof. Takes a marketing action or milestone and turns it into an engaging narrative. Follows the rule: every marketing action becomes content. | Phase 0: Intake (what happened, results, proof screenshots). Phase 1: Draft storytelling post (hook → context → action → results → proof → subtle product mention). Phase 2: Generate 12 title variants for different subreddits. |
| `subreddit-mapper` | `gtm-inbound` | Identifies and qualifies target subreddits for a given niche. Analyzes subscriber count, posting rules, self-promotion tolerance, and engagement patterns. Outputs a prioritized list with warmup strategy. | Phase 0: Niche/product description. Phase 1: Research subreddits (search, related communities). Phase 2: Score and rank by relevance + friendliness to content. Phase 3: Output map with posting rules per subreddit. |
| `youtube-seo-script` | `seo` | Writes competitor review video scripts. Format: show competitor features/pricing → identify gaps → pivot to your alternative. Optimized for "[Competitor] [Year] Review" search queries. | Phase 0: Competitor name + your product details. Phase 1: Research competitor features and pricing. Phase 2: Write script (intro → features walkthrough → pricing → gaps → your alternative → CTA). |
| `x-growth-planner` | `gtm-inbound` | Creates an X (Twitter) growth strategy. Identifies tool founders to tag, plans content mix (journey/lead-magnet/promotional), and designs the first 30 days of posting. | Phase 0: Product, tools used, co-founder accounts. Phase 1: Research tool founders on X. Phase 2: Generate 30-day content calendar with post drafts. |

#### Paid & Influencers

| Skill | Tag | Description | Phases |
|-------|-----|-------------|--------|
| `competitor-ad-analyzer` | `gtm-paid` | Scrapes and analyzes competitor ads from Meta Ad Library and Google Ads Transparency. Identifies winning formats, copy patterns, and CTAs. Outputs recreatable ad concepts. | Phase 0: Competitor list + your product context. Phase 1: Scrape ads (filter by active/long-running). Phase 2: Categorize (static/video/UGC, hooks, CTAs). Phase 3: Generate adapted concepts for your product. |
| `influencer-finder` | `gtm-paid` | Identifies and vets LinkedIn B2B influencers for a given niche. Searches by keywords, analyzes engagement quality (real vs AI-generated), checks comment patterns, and estimates ROI potential. | Phase 0: Niche keywords + budget. Phase 1: Search LinkedIn for keyword traction. Phase 2: Vet top candidates (engagement authenticity, audience alignment). Phase 3: Output ranked list with outreach template. |
| `influencer-post-creator` | `gtm-paid` | Creates a complete influencer collaboration package: post copy + lead magnet + visual prompt + comment reply template. Designed for the "comment to get resource" format. | Phase 0: Influencer profile + product context. Phase 1: Draft post (attention hook → value → CTA). Phase 2: Create lead magnet link + comment reply template. Phase 3: Generate image prompt for ChatGPT/AI. |

#### Sales & Demos

| Skill | Tag | Description | Phases |
|-------|-----|-------------|--------|
| `demo-qualifier` | `gtm-sales` | Designs Calendly-style qualification routing logic. Creates question flows that route prospects to: personal demo (high value), group webinar (mid), or self-serve + blueprint (low). | Phase 0: Product, pricing tiers, team capacity. Phase 1: Design qualification questions and routing rules. Phase 2: Output routing logic + rejection/redirect messages. |
| `channel-metrics-tracker` | `gtm-analytics` | Defines per-channel KPIs and tracking setup. For each active channel, specifies what to measure, expected benchmarks, and how to calculate ROI. | Phase 0: Active channels inventory. Phase 1: Define metrics per channel (CAC, conversion rate, volume). Phase 2: Output tracking dashboard spec with benchmark targets. |

#### Product Building

| Skill | Tag | Description | Phases |
|-------|-----|-------------|--------|
| `landing-page-generator` | `build` | Generates a conversion-focused landing page. Follows SaaS best practices: hero with clear value prop, social proof, feature sections, pricing, FAQ, CTA. Outputs React/HTML components. | Phase 0: Product, ICP, key features, social proof. Phase 1: Structure page sections. Phase 2: Write copy for each section. Phase 3: Generate component code. |
| `pricing-page-designer` | `build` | Designs SaaS pricing page with tier structure, feature comparison, and conversion-optimized layout. Based on proven B2B SaaS patterns. | Phase 0: Features, target segments, competitor pricing. Phase 1: Propose tier structure (free trial + 2-3 paid tiers). Phase 2: Design feature matrix. Phase 3: Output page spec or component code. |
| `onboarding-flow-builder` | `build` | Creates user onboarding sequence — from signup to first value moment. Designs steps, progress indicators, and activation triggers. | Phase 0: Product, key actions for activation, ICP segments. Phase 1: Map onboarding steps to first value moment. Phase 2: Design flow with copy for each step. Phase 3: Output flow spec or component code. |

---

### Composites (8 skills)

Multi-skill chains that combine capabilities into coordinated workflows.

| Skill | Tag | Chains | Description |
|-------|-----|--------|-------------|
| `outbound-engine` | `gtm-outbound` | `icp-definer` → `lead-magnet-generator` → `cold-email-sequence-writer` + `linkedin-post-writer` | Full outbound setup: define ICP, create the lead magnet, write email sequences and LinkedIn DM sequences. Outputs a ready-to-launch outbound campaign package. |
| `inbound-content-machine` | `gtm-inbound` | `viral-topic-scanner` → `linkedin-post-writer` + `reddit-post-crafter` + `x-growth-planner` | Trend research → content creation across all inbound channels → distribution plan. Produces a week's worth of coordinated content. |
| `influencer-campaign` | `gtm-paid` | `influencer-finder` → `influencer-post-creator` → `lead-magnet-generator` | End-to-end influencer collaboration: find and vet influencers → create the complete post package → track ROI. Outputs campaign brief + all assets. |
| `reddit-launch` | `gtm-inbound` | `subreddit-mapper` → `reddit-post-crafter` | Reddit market entry: map target subreddits → create warmup plan → draft first 5 posts with title variants per subreddit. Outputs 30-day Reddit launch calendar. |
| `paid-ads-launcher` | `gtm-paid` | `competitor-ad-analyzer` → `lead-magnet-generator` → `channel-metrics-tracker` | Competitive ad research → create adapted ad concepts + landing page lead magnets → set up tracking. Outputs ad creative package + campaign structure. |
| `full-blueprint-pipeline` | `gtm-content` | `viral-topic-scanner` → `lead-magnet-generator` → `cold-email-sequence-writer` + `linkedin-post-writer` + `reddit-post-crafter` | The core GTM flywheel: research trending topic → create blueprint → generate distribution content for email, LinkedIn, and Reddit simultaneously. |
| `demo-funnel-builder` | `gtm-sales` | `demo-qualifier` → `lead-magnet-generator` → `cold-email-sequence-writer` | Build the complete demo funnel: qualification routing → rejection/redirect blueprints → follow-up email sequences. Outputs Calendly config + all supporting content. |
| `competitor-seo-blitz` | `seo` | `competitor-ad-analyzer` → `youtube-seo-script` → `reddit-post-crafter` | Map competitors → write YouTube review scripts for each → create Reddit posts about the comparison. Outputs complete competitor SEO campaign. |

---

### Playbooks (4 skills)

End-to-end business processes with multiple governance checkpoints.

#### `zero-to-first-customers`

**Tag:** `gtm-outbound`
**Purpose:** Take a SaaS from idea validation to first 10 paying customers.

```
Week 1: Idea Validation
  ├── Create 3-6 slide deck
  ├── Define ICP (uses icp-definer)
  ├── Book 10 ICP calls
  └── Checkpoint: ≥3 people willing to pay? → proceed / pivot

Week 2-3: Outbound Setup
  ├── Create first lead magnet (uses lead-magnet-generator)
  ├── Set up email infrastructure (uses email-infra-planner)
  ├── Write cold email sequence (uses cold-email-sequence-writer)
  ├── Set up LinkedIn outreach account
  └── Checkpoint: Infrastructure live? → proceed

Week 4-6: Launch & Iterate
  ├── Start sending (6,000 emails/day target)
  ├── Launch LinkedIn outreach
  ├── Monitor responses, book demos
  ├── Iterate messaging based on response rates
  └── Checkpoint: First paying customers? → proceed to inbound
```

#### `multi-channel-gtm-launch`

**Tag:** `gtm-outbound`, `gtm-inbound`, `gtm-paid`
**Purpose:** Orchestrate all channels from the GTM playbook simultaneously.

```
Phase 1: Foundation (Week 1-2)
  ├── ICP definition + brand voice
  ├── Create 3 lead magnets for different topics
  ├── Set up outbound (email + LinkedIn)
  └── Checkpoint: Outbound generating responses?

Phase 2: Inbound Layer (Week 3-4)
  ├── Launch LinkedIn inbound (founder + satellite accounts)
  ├── Start Reddit (warmup → first posts)
  ├── Set up X account(s) with 30-day plan
  └── Checkpoint: Content generating views/engagement?

Phase 3: Paid Amplification (Week 5-6)
  ├── Scrape competitor ads → create ad concepts
  ├── Launch Meta ads (retargeting first, then CBO)
  ├── Start first influencer collaboration
  └── Checkpoint: CAC < LTV?

Phase 4: Optimization (Ongoing)
  ├── Weekly content calendar across all channels
  ├── Monthly channel performance review
  ├── Scale winners, cut losers
  └── Checkpoint: Monthly revenue growing?
```

#### `1m-to-10m-scaling`

**Tag:** `gtm-analytics`, `gtm-paid`
**Purpose:** Scale from $1M to $10M ARR with systematic channel expansion.

```
Phase 1: Identify Scalable Winners
  ├── Audit all channel performance (uses channel-metrics-tracker)
  ├── Calculate unit economics per channel
  └── Checkpoint: Which channels have CAC < 60% of LTV?

Phase 2: Scale Paid Channels
  ├── Increase ad budget 2x on profitable campaigns
  ├── Expand influencer pool to 10-20
  ├── Launch affiliate program (30% lifetime)
  └── Checkpoint: Revenue growing proportionally to spend?

Phase 3: Hire & Delegate
  ├── Define roles: product manager, growth, dev, support
  ├── Create job specs + hiring criteria
  ├── Transfer demo calls to sales team
  └── Checkpoint: Founder time freed for strategy?

Phase 4: Product-Led Expansion
  ├── Add multi-channel features (email, WhatsApp)
  ├── Improve onboarding for self-serve conversion
  ├── Launch content on TikTok, Instagram, YouTube
  └── Checkpoint: Self-serve trial-to-paid rate improving?
```

#### `weekly-gtm-rhythm`

**Tag:** `gtm-content`, `gtm-analytics`
**Purpose:** Recurring weekly tasks across all active channels.

```
Monday: Content Planning
  ├── Scan viral topics (uses viral-topic-scanner)
  ├── Plan week's content across LinkedIn, X, Reddit
  └── Draft 2-3 posts

Tuesday-Thursday: Execution
  ├── Post content across channels
  ├── Send lead magnets to commenters
  ├── Review outbound responses in unified inbox
  ├── Take demo calls (afternoon only)
  └── Monitor ad performance

Friday: Analytics & Optimization
  ├── Review channel metrics
  ├── Identify top-performing content for cross-posting
  ├── Update email sequences based on response data
  ├── Plan next influencer collaboration
  └── Create Reddit post from week's best marketing action

Weekend: Low-effort, High-impact
  ├── Send Sunday cold emails (less competition)
  ├── Schedule Monday posts
  └── Upvote/engage on Reddit (account warmup)
```

---

## Part 5: Implementation Roadmap

### Phase 1: High-Impact Capabilities (Start Here)

Build the 5 skills that power the core GTM flywheel:

| Priority | Skill | Why First |
|----------|-------|-----------|
| 1 | `icp-definer` | Foundation for everything — all downstream skills need ICP context |
| 2 | `lead-magnet-generator` | The universal connector across all channels |
| 3 | `cold-email-sequence-writer` | Fastest path to revenue (outbound first) |
| 4 | `linkedin-post-writer` | Dual-purpose: outbound DMs + inbound content |
| 5 | `viral-topic-scanner` | Feeds content ideas to all other skills |

### Phase 2: First Composites

Chain Phase 1 skills into workflows:

| Priority | Skill | Chains |
|----------|-------|--------|
| 1 | `outbound-engine` | icp-definer → lead-magnet-generator → cold-email-sequence-writer |
| 2 | `full-blueprint-pipeline` | viral-topic-scanner → lead-magnet-generator → distribution |
| 3 | `inbound-content-machine` | viral-topic-scanner → linkedin-post-writer + reddit-post-crafter |

### Phase 3: First Playbook

Build `zero-to-first-customers` — the complete path from idea to first 10 paying customers. This is the highest-value playbook because it addresses the most painful stage of the SaaS journey.

### Phase 4: Iterate

- Track which skills are actually used vs. theoretical
- Add capabilities based on real workflow gaps
- Build remaining composites and playbooks based on Phase 1-3 learnings
- Consider contributing back to goose-skills for broadly applicable GTM skills

---

## Appendix: Comparison with Goose-Skills

| Dimension | Goose-Skills | Proposed Architecture |
|-----------|-------------|----------------------|
| **Focus** | GTM execution only | Full SaaS journey (build + GTM) |
| **Categories** | 9 (ads, brand, competitive-intel, content, lead-gen, monitoring, outreach, research, seo) | 9 extended (adds: build, gtm-outbound, gtm-inbound, gtm-paid, gtm-sales, gtm-content, gtm-analytics) |
| **Skill count** | 125 (55 cap + 61 comp + 9 play) | 32 proposed (20 cap + 8 comp + 4 play) |
| **API dependencies** | Heavy (Apollo, Apify, Supabase, Crustdata) | Lighter — many skills are content/strategy generation, not API-dependent |
| **Cost per run** | $0-50+ (API-heavy) | $0-5 typical (mostly AI generation, minimal external APIs) |
| **Blueprint/lead magnet support** | None | First-class category — central to the architecture |
| **Product building** | None | Landing page, pricing, onboarding skills |
| **Channel orchestration** | Individual channels | Multi-channel composites + weekly rhythm playbook |
| **Safety patterns** | Excellent (dry-run, preview, approval gates) | Adopted from goose-skills |

### Key Architectural Decision

Goose-skills optimizes for **data pipeline workflows** (scrape → enrich → store → activate). This architecture optimizes for **content-driven GTM** (research → create → distribute → convert) — matching the blueprint-centric strategy from the GTM playbook where lead magnets are the universal connector across all channels.

---

*This architecture is designed to evolve. Start with the 5 highest-impact capabilities, validate they're useful in practice, then build upward through composites and playbooks.*
