# Lead Generation AI Agent for Vistage
## Scope of Work Document

**Client:** RE ALINE (Andrew Line) → Vistage (Mary Forte)  
**Project:** AI-Powered Lead Gen Agent for Vistage Membership Recruitment  
**Budget:** $1,000 (at-cost engineering support)  
**Demo Date:** December 11, 2025

---

## Executive Summary

Build an AI Agent to automate the identification, scoring, and personalized LinkedIn outreach to executive-level prospects for Vistage membership. Currently, researching each prospect takes **10-20 minutes** manually. This solution will:

- Automate candidate research and scoring
- Generate personalized LinkedIn messages (not generic/canned)
- Enable Vistage Chairs to connect with high-quality executives at scale
- Save hours of manual effort per day

---

## Target Prospect Profile

### Role Requirements
| Criteria | Requirement |
|----------|-------------|
| **Titles** | CEO, President, Founder, Owner, Managing Partner, Principal, General Manager |
| **Responsibility** | P&L ownership (ultimate decision-maker) |
| **Seniority** | Owner, Partner, CXO, C-Suite |
| **Experience** | 10+ years in leadership |

### Company Requirements
| Criteria | Requirement |
|----------|-------------|
| **Revenue** | $5M+ (focus on $20-30M range) |
| **Employees** | 51+ (proxy for revenue) |
| **Type** | Privately held, partnership preferred |
| **Longevity** | Demonstrated stability |

### Geographic Targeting
- 50-mile radius of **zip code 19146** (Philadelphia)
- Greater Philadelphia Area
- Greater Wilmington, DE
- South Jersey (Cherry Hill region)

### Industry Focus (POC)
**Include:**
1. Financial Services / Banking
2. Wealth Management / Investment Management
3. Tech / Cybersecurity (secondary)
4. Healthcare / Life Sciences (secondary)
5. Manufacturing non-competing subsectors (secondary)

**Exclude:** Direct competitors to current cohort members

---

## Data Collection Requirements

### From LinkedIn Sales Navigator Search
- Profile URL, Name, Headline
- Current title, Company name
- Location, Connection degree (1st/2nd)
- Company LinkedIn URL

### From Profile Enrichment
| Data Point | Purpose |
|-----------|---------|
| **Followers count** | Influence/visibility score (min 5,000) |
| **Total connections** | Network strength |
| **Mutual connections** | Warm intro potential |
| **Years in current role** | Stability signal |
| **Company size band** | Revenue proxy |

### From Activity Scraping (Last 5-10 Posts)
| Data Point | Purpose |
|-----------|---------|
| Post date | Recency scoring |
| Post text | Event/conference signal detection |
| Likes/comments | Engagement metrics |
| **Event keywords** | Spending propensity signal |

### Event/Conference Keywords to Detect
```
Events:     "conference", "summit", "forum", "expo", "symposium"
Networking: "event", "happy hour", "dinner", "roundtable", "breakfast"
Speaking:   "speaking at", "speaker", "panelist", "keynote", "moderating"
Travel:     "offsite", "retreat", "annual meeting"
```

**Why this matters:** If they attend/host conferences, they spend $1k+ on registration + travel → strong signal they can afford Vistage dues.

---

## Scoring Model

### Hard Filters (Must Pass All)
- [ ] Geography: Within target regions
- [ ] Title: CEO/President/Owner/Founder/Partner/GM
- [ ] Company size: 51+ employees
- [ ] Industry: In approved list
- [ ] Experience: 10+ years
- [ ] Connection: 1st or 2nd degree
- [ ] Followers: ≥ 5,000

### Scoring Weights

#### Company Capacity (Revenue Proxy)
| Employees | Points |
|-----------|--------|
| 51-200 | +10 |
| 201-500 | +20 |
| 501-1,000 | +25 |
| 1,001-5,000 | +20 |
| 5,001+ | +10 |

#### Personal Influence (Followers)
| Followers | Points |
|-----------|--------|
| 5,000-9,999 | +10 |
| 10,000-24,999 | +20 |
| 25,000+ | +25 |

#### Activity Score (Last 90 Days)
| Posts | Points |
|-------|--------|
| 0 | 0 |
| 1-3 | +5 |
| 4-8 | +10 |
| 9+ | +15 |

**Recency Bonus:**
- Last post ≤ 7 days: +5 pts
- Last post ≤ 30 days: +3 pts

#### Event/Conference Signals
- Each post with event keyword: +5 pts
- Speaking/keynote/panelist: +5 extra pts
- **Max: 25 pts**

#### Mutual Connections
| Mutual Connections | Points |
|--------------------|--------|
| 1-3 | +5 |
| 4-10 | +10 |
| 11+ | +15 |

#### Title Score
| Title | Points |
|-------|--------|
| CEO, Founder, Owner | +10 |
| President, Managing Partner | +8 |
| General Manager | +5 |

### Tier Classification
| Tier | Score Range |
|------|-------------|
| **Tier A** | ≥ 70 |
| **Tier B** | 50-69 |
| **Tier C** | 30-49 |

---

## E2E Workflow Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        LEAD GENERATION PIPELINE                         │
└─────────────────────────────────────────────────────────────────────────┘

1. LinkedIn Sales Navigator
   │
   │ Saved Search: "Vistage – POC Financial Services CEOs"
   │ Filters: Geography, Title, Company Size, Industry, Connection Degree
   ▼
2. PhantomBuster Scraper
   │
   │ Extract: Profile URLs, Names, Titles, Companies, Locations
   ▼
3. Profile & Activity Enrichment
   │
   │ Add: Followers, Mutual Connections, Last 5 Posts
   ▼
4. Google Sheets (Data Store)
   │
   │ Tables: Leads | Posts
   ▼
5. Scoring Engine (Formulas/Script)
   │
   │ Apply: Hard Filters → Scoring → Ranking
   ▼
6. Message Generation (LLM)
   │
   │ Personalized drafts based on posts/events
   ▼
7. Human Review Dashboard
   │
   │ Status: Pending → Approved/Rejected
   ▼
8. n8n Automation
   │
   │ Throttled sending: 1-3 per hour
   ▼
9. LinkedIn Connection Requests
   │
   │ Via PhantomBuster or manual assist
   ▼
10. Feedback Loop (Future)
    │
    └─ Track: Accepted, Meeting Booked → Refine Scoring
```

---

## Personalized Message Templates

### For LinkedIn Prospects (Demo Script)
```
Hi [first name], 

I saw your recent post on [summarize recent post] - [LLM observation: 
congratulations, great work, etc]. 

Are you interested in 10x'ing your sales or operations folks? I'd be 
happy to show you how AI Agents my clients use guarantee 10x productivity. 

Feel free to check out my "AI Andrew" intro and demo videos at RE-ALINE.com. 

Can't wait to connect!
```

### For Google-Sourced Leads (SERGIO+LIN Script)
```
Hi [first name], 

My AI Agent found your thriving business on Google - and it told me 
you'd benefit from using AI Agents. 

Are you interested in 10x'ing your employees? I could show you some 
AI Agents my clients use that 10x productivity. 

My face-to-a-name intro: RE-ALINE.com
```

---

## Output Schema (Per Candidate)

```json
{
  "name": "string",
  "profile_url": "string",
  "headline": "string",
  "current_title": "string",
  "company_name": "string",
  "company_url": "string",
  "location": "string",
  "industry": "string",
  "company_size_band": "string",
  "followers_count": "number",
  "connection_degree": "1st|2nd",
  "mutual_connections_count": "number",
  "years_in_current_role": "number",
  "total_years_experience": "number",
  "posts_last_90_days": "number",
  "last_post_date": "date",
  "avg_engagement_per_post": "number",
  "event_keyword_posts_count": "number",
  "event_speaker_posts_count": "number",
  "eligibility_passed": "boolean",
  "score_total": "number",
  "score_breakdown": {
    "company_size_score": "number",
    "follower_score": "number",
    "activity_score": "number",
    "event_signal_score": "number",
    "mutual_connections_score": "number",
    "title_score": "number"
  },
  "message_draft": "string",
  "status": "Pending|Approved|Rejected",
  "sent": "boolean",
  "sent_timestamp": "datetime"
}
```

---

## Deliverables

| # | Deliverable | Status |
|---|-------------|--------|
| 1 | Operational AI-powered lead generation agent | 🔲 |
| 2 | Customizable scoring model | 🔲 |
| 3 | LinkedIn activity scraper (followers + posts) | 🔲 |
| 4 | Automated personalized message generation | 🔲 |
| 5 | Client-accessible approval dashboard/workflow | 🔲 |
| 6 | n8n automation for throttled sending | 🔲 |
| 7 | Periodic reporting and analytics | 🔲 |

---

## Technical Stack

| Component | Tool |
|-----------|------|
| Lead Search | LinkedIn Sales Navigator |
| Scraping | PhantomBuster |
| Data Storage | Google Sheets / Supabase |
| Scoring Logic | Google Sheets formulas / Apps Script |
| Message Generation | OpenAI LLM |
| Automation | n8n |
| LinkedIn Sending | PhantomBuster Network Booster |

---

## POC Scope (95 Prospects)

**Sales Navigator Search URL:**  
`https://www.linkedin.com/sales/search/people?savedSearchId=1954243172`

**POC Industry:** Financial Services only  
**POC Region:** Greater Philadelphia, Wilmington, South Jersey  
**POC Size:** 95 prospects

---

## Key Constraints & Notes

1. **LinkedIn Rate Limits:** Send 1-3 connection requests per hour (human-like)
2. **Human Approval Required:** All messages reviewed before sending
3. **Followers > Connections:** Focus on follower count, not connection quality
4. **Mutual Connections:** Track quantity for warm intro potential
5. **Event Signals Critical:** Conference attendance = ability to pay Vistage dues

---

## Timeline

| Milestone | Date |
|-----------|------|
| Initial requirements | Nov 24, 2025 |
| Technical assessment | Nov 25, 2025 |
| Workflow design | Nov 26, 2025 |
| Internal review | Dec 3, 2025 |
| Demo prep meeting | Dec 11, 2025 (10pm) |
| Client demo | Dec 11, 2025 |
