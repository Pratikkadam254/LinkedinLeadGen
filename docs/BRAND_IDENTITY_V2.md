# LeadFlow AI - Brand Identity Guide V2

## 🎯 Brand Overview - LinkedIn-Inspired Design

### Brand Name
**LeadFlow AI**

### Tagline
"Intelligence Meets Opportunity"

### Design Philosophy
**LinkedIn-inspired** - Professional white/blue color scheme that feels familiar to B2B users while maintaining a premium, modern aesthetic.

---

## 🎨 Color System - LinkedIn-Inspired Palette

### Primary Colors

#### LinkedIn Blue (Primary)
- **Primary Blue**: `#0A66C2`
  - Use: Primary CTAs, headers, links, active states
  - Psychology: Trust, professionalism, familiarity
  - RGB: rgb(10, 102, 194)

#### Light Blue (Accent)
- **Light Blue**: `#70B5F9`
  - Use: Hover states, highlights, secondary actions
  - RGB: rgb(112, 181, 249)

#### Sky Blue (Background Accent)
- **Sky Blue**: `#D0E8FF`
  - Use: Light backgrounds, badges, subtle highlights
  - RGB: rgb(208, 232, 255)

### Background Colors (Light Mode Primary)

#### Pure White (Primary Background)
- **White**: `#FFFFFF`
  - Use: Main content areas, cards, modals
  
#### Off-White (Secondary Background)  
- **Gray 50**: `#F3F2EF`
  - Use: Page background, sidebar, secondary areas
  - This is LinkedIn's exact background color

#### Light Gray (Tertiary)
- **Gray 100**: `#EEF3F8`
  - Use: Borders, dividers, input backgrounds

### Text Colors

#### Dark Text (Primary)
- **Black/Dark Gray**: `#191919`
  - Use: Headlines, primary text, important content

#### Medium Text (Secondary)
- **Gray 600**: `#666666`
  - Use: Body text, secondary information

#### Light Text (Tertiary)
- **Gray 400**: `#8E8E8E`
  - Use: Placeholder text, timestamps, metadata

### Status Colors

#### Success Green
- **Green**: `#057642`
  - Use: Success messages, connected status, positive metrics
  - LinkedIn's exact green

#### Warning Orange
- **Orange**: `#B24020`
  - Use: Warnings, pending status

#### Error Red
- **Red**: `#B90000`
  - Use: Errors, disconnected status, critical alerts

### Dark Mode Colors (Optional)

#### Dark Background
- **Slate 900**: `#1B1F23`
  - Main background in dark mode

#### Dark Surface
- **Slate 800**: `#282E33`
  - Cards, modals in dark mode

#### Dark Border
- **Slate 700**: `#3E4448`
  - Borders in dark mode

---

## ✍️ Typography System

### Primary Font Family
**Inter** (Google Fonts)
- Modern, highly legible sans-serif
- Similar to LinkedIn's font rendering
- Excellent for UI and body text

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
```

### Font Scale

```css
/* Display/Hero */
--font-display-xl: 3rem;      /* 48px - Hero headlines */
--font-display-lg: 2.25rem;   /* 36px - Page titles */
--font-display-md: 1.875rem;  /* 30px - Section headers */

/* Headings */
--font-h1: 1.5rem;            /* 24px */
--font-h2: 1.25rem;           /* 20px */
--font-h3: 1.125rem;          /* 18px */
--font-h4: 1rem;              /* 16px */

/* Body */
--font-body-lg: 1rem;         /* 16px */
--font-body-md: 0.875rem;     /* 14px */
--font-body-sm: 0.813rem;     /* 13px */
--font-body-xs: 0.75rem;      /* 12px */
```

### Font Weights
- Regular: 400 (Body text)
- Medium: 500 (Emphasis)
- Semibold: 600 (Subheadings, buttons)
- Bold: 700 (Headings)

---

## 🎨 Design Tokens - CSS Variables

```css
:root {
  /* Primary Colors - LinkedIn Blue */
  --color-primary: #0A66C2;
  --color-primary-light: #70B5F9;
  --color-primary-lighter: #D0E8FF;
  --color-primary-dark: #084EA0;
  
  /* Backgrounds */
  --color-bg-primary: #FFFFFF;
  --color-bg-secondary: #F3F2EF;
  --color-bg-tertiary: #EEF3F8;
  
  /* Text Colors */
  --color-text-primary: #191919;
  --color-text-secondary: #666666;
  --color-text-tertiary: #8E8E8E;
  
  /* Status Colors */
  --color-success: #057642;
  --color-warning: #B24020;
  --color-error: #B90000;
  
  /* Borders */
  --color-border-light: #E8E8E8;
  --color-border-medium: #D9D9D9;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.08);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.12);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.16);
  --shadow-card: 0 0 0 1px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.08);
  
  /* Typography */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  
  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  --space-3xl: 64px;
  
  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;
}
```

---

## 🖼️ Component Styles - LinkedIn Inspired

### Cards
```css
.card {
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  padding: var(--space-lg);
}

.card:hover {
  box-shadow: var(--shadow-md);
}
```

### Primary Button
```css
.btn-primary {
  background: var(--color-primary);
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  padding: 8px 16px;
  border-radius: var(--radius-full);
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: var(--color-primary-dark);
}
```

### Secondary Button
```css
.btn-secondary {
  background: transparent;
  color: var(--color-primary);
  font-weight: 600;
  font-size: 0.875rem;
  padding: 8px 16px;
  border-radius: var(--radius-full);
  border: 1px solid var(--color-primary);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: var(--color-primary-lighter);
}
```

### Input Fields
```css
.input {
  width: 100%;
  padding: 12px 16px;
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-medium);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  color: var(--color-text-primary);
  transition: all 0.2s;
}

.input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px var(--color-primary-lighter);
}

.input::placeholder {
  color: var(--color-text-tertiary);
}
```

---

## 🎬 UI Storyboards - Application Flow

### Screen 1: Landing Page
```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]  Product  Pricing  Resources     [Sign In] [Start] │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│        Transform LinkedIn Connections                        │
│        Into Qualified Leads                                  │
│        ═══════════════════════                               │
│                                                              │
│   AI-powered lead generation that feels human.              │
│                                                              │
│        [Start Free Trial]   [See Demo]                      │
│                                                              │
│   ✓ 7-day free trial  ✓ No credit card  ✓ Setup in 5 min  │
│                                                              │
│        [Dashboard Preview Image]                            │
│                                                              │
│   Trusted by 500+ B2B companies                             │
│   [Company Logos]                                            │
└─────────────────────────────────────────────────────────────┘
```

### Screen 2: Sign Up / Sign In (Clerk)
```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│        [Logo] LeadFlow AI                                   │
│                                                              │
│     ┌─────────────────────────────────┐                    │
│     │                                  │                    │
│     │   Create your account            │                    │
│     │                                  │                    │
│     │   [Continue with Google]         │                    │
│     │   [Continue with LinkedIn]       │                    │
│     │                                  │                    │
│     │   ───────── or ─────────         │                    │
│     │                                  │                    │
│     │   Email                          │                    │
│     │   [_________________________]    │                    │
│     │                                  │                    │
│     │   [Continue →]                   │                    │
│     │                                  │                    │
│     │   Already have account? Sign in  │                    │
│     │                                  │                    │
│     └─────────────────────────────────┘                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Screen 3: Onboarding (5-10 Questions)
```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]                                    [Skip Onboarding] │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│        Let's personalize your experience                    │
│        ─────────────────────────────────                    │
│                                                              │
│   Progress: ●●●○○○○○○○ (3 of 10)                           │
│                                                              │
│     ┌─────────────────────────────────────┐                │
│     │                                      │                │
│     │   What's your primary goal?          │                │
│     │                                      │                │
│     │   ○ Generate more qualified leads    │                │
│     │   ○ Scale LinkedIn outreach          │                │
│     │   ○ Improve connection acceptance    │                │
│     │   ○ Automate follow-up messages      │                │
│     │   ○ Build my personal brand          │                │
│     │                                      │                │
│     │           [Continue →]               │                │
│     │                                      │                │
│     └─────────────────────────────────────┘                │
│                                                              │
│        [← Back]                                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Screen 4: Upload Sheet (Skip Onboarding Option)
```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]  Dashboard  Leads  Campaigns  Analytics    [Profile]│
├─────────────────────────────────────────────────────────────┤
│                                                              │
│        Import Your Leads                                     │
│        ─────────────────                                    │
│                                                              │
│     ┌─────────────────────────────────────┐                │
│     │                                      │                │
│     │    📄 Drop your file here            │                │
│     │    or click to browse                │                │
│     │                                      │                │
│     │    Supports: CSV, Excel, Google Sheets│               │
│     │                                      │                │
│     └─────────────────────────────────────┘                │
│                                                              │
│     [Connect Google Sheets]   [Download Template]           │
│                                                              │
│     ─────────────────────────────────────                  │
│                                                              │
│     Recent Imports:                                         │
│     • sales_leads_feb.csv (247 leads) - Today              │
│     • vistage_prospects.xlsx (89 leads) - Yesterday        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Screen 5: Leads Dashboard (Sheet View)
```
┌─────────────────────────────────────────────────────────────────────────┐
│  [Logo]  Dashboard  Leads  Campaigns  Analytics              [Profile] │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  247 Leads  │  [Filter ▼]  [Sort ▼]  [Search...]    [Export] [+ Import]│
│  ───────────────────────────────────────────────────────────────────── │
│                                                                          │
│  ┌─┬─────────┬──────────┬─────────┬──────────┬────────┬────────┬─────┐ │
│  │☐│ Name    │ Company  │ Title   │ Score    │Message │Status  │Post │ │
│  ├─┼─────────┼──────────┼─────────┼──────────┼────────┼────────┼─────┤ │
│  │☑│J. Smith │ Acme Inc │ CEO     │ ■■■■■ 95│ ✓ Ready│🟢 Ready │ ✓   │ │
│  │☐│S. Jones │ TechCo   │ VP Sales│ ■■■■□ 82│ ⟳ Draft│🟡 Review│ ✓   │ │
│  │☐│M. Brown │ StartupX │ Founder │ ■■■□□ 71│ ✗ Empty│🔴 Scrape│ -   │ │
│  │☑│A. Davis │ BigCorp  │ Director│ ■■■■■ 89│ ✓ Ready│🟢 Ready │ ✓   │ │
│  │☐│R. Wilson│ SaaS Ltd │ CTO     │ ■■■■□ 78│ ✓ Ready│🟢 Ready │ ✓   │ │
│  └─┴─────────┴──────────┴─────────┴──────────┴────────┴────────┴─────┘ │
│                                                                          │
│  Legend: 🟢 Ready to Send | 🟡 Needs Review | 🔴 Action Required         │
│          ✓ Post Scraped  | ⟳ In Progress   | ✗ Not Started             │
│                                                                          │
│  Selected: 2 leads     [Generate Messages] [Approve All] [Send Selected]│
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Screen 6: Lead Detail Panel
```
┌─────────────────────────────────────────────────────────────┐
│  ← Back to Leads                                  [⚙] [✕]  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [Avatar]  John Smith                                       │
│            CEO at Acme Inc                                  │
│            📍 San Francisco, CA                             │
│            🔗 View LinkedIn Profile                         │
│                                                              │
│  ─────────────────────────────────────                     │
│                                                              │
│  Score Breakdown                            Overall: 95/100 │
│  ├── Company Size (50-200)           ████████░░ 25/30       │
│  ├── Follower Influence (5.2K)       ████████░░ 22/25       │
│  ├── Recent Activity (7d ago)        ██████████ 20/20       │
│  ├── Event Keywords (2 found)        ██████████ 15/15       │
│  └── Mutual Connections (12)         █████████░ 13/10       │
│                                                              │
│  ─────────────────────────────────────                     │
│                                                              │
│  Recent Posts (Scraped)                                      │
│  ┌──────────────────────────────────────┐                  │
│  │ "Excited to speak at SaaStr 2026..." │                  │
│  │ 📅 3 days ago  ❤️ 234  💬 45         │                  │
│  └──────────────────────────────────────┘                  │
│                                                              │
│  ─────────────────────────────────────                     │
│                                                              │
│  Generated Message                                          │
│  ┌──────────────────────────────────────┐                  │
│  │ Hi John, I noticed you're speaking   │                  │
│  │ at SaaStr 2026 - congrats!...        │                  │
│  │                                 [Edit]│                  │
│  └──────────────────────────────────────┘                  │
│                                                              │
│  [Regenerate Message]  [Approve ✓]  [Send via Unipile →]  │
│                                                              │
│  Unipile Status: 🟢 Connected | Last sync: 2 min ago       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Application Flow Summary

```
1. LANDING PAGE
   │
   ├── CTA: "Start Free Trial" ──→ [Clerk Sign Up]
   │
2. SIGN UP (Clerk)
   │
   ├── Google SSO
   ├── LinkedIn SSO
   └── Email + Password
   │
3. ONBOARDING FLOW
   │
   ├── 5-10 questions about goals, industry, outreach style
   │   ├── Q1: Primary goal?
   │   ├── Q2: Target industry?
   │   ├── Q3: Company size preference?
   │   ├── Q4: Titles you target?
   │   ├── Q5: Weekly outreach volume?
   │   ├── Q6: Message tone preference?
   │   ├── Q7: Connect Unipile/LinkedIn?
   │   ├── Q8: Import existing leads?
   │   ├── Q9: Campaign frequency?
   │   └── Q10: Notification preferences?
   │
   └── [SKIP ONBOARDING] ──→ Direct to Upload Sheet
   │
4. UPLOAD SHEET
   │
   ├── Drag & Drop: CSV, Excel, Google Sheets
   ├── Connect Google Sheets API
   └── Download template
   │
5. LEADS DASHBOARD
   │
   ├── Table view of all uploaded leads
   ├── Columns:
   │   ├── Name, Company, Title (from sheet)
   │   ├── Score (auto-calculated)
   │   ├── Message Status (Ready/Draft/Empty)
   │   ├── Outreach Status (Unipile status)
   │   └── Post Scraping Status (scraped/pending)
   │
   ├── Actions:
   │   ├── Generate AI Messages
   │   ├── Approve Messages
   │   ├── Send via Unipile
   │   └── Bulk operations
   │
6. LEAD DETAIL PANEL
   │
   ├── Profile info + LinkedIn link
   ├── Score breakdown visualization
   ├── Recent posts (scraped)
   ├── Generated message (editable)
   └── Unipile connection status
```

---

## 📱 Responsive Design

### Breakpoints
```css
/* Mobile first */
@media (min-width: 640px) { /* sm: Tablet portrait */ }
@media (min-width: 768px) { /* md: Tablet landscape */ }
@media (min-width: 1024px) { /* lg: Desktop */ }
@media (min-width: 1280px) { /* xl: Wide desktop */ }
```

### Mobile Considerations
- Cards stack vertically on mobile
- Table becomes card list on small screens
- Navigation collapses to hamburger menu
- Touch-friendly button sizes (min 44px)

---

## 🎯 Brand Voice Reminders

### We Sound Like:
- "Transform your LinkedIn connections into qualified leads"
- "AI-powered intelligence that feels human"
- "Simple setup, powerful results"

### We Don't Sound Like:
- "Revolutionary game-changing paradigm shift" ❌
- "Get thousands of leads instantly!" ❌
- "Best-in-class synergy optimization" ❌

---

**Version:** 2.0  
**Date:** February 9, 2026  
**Theme:** LinkedIn-Inspired White/Blue
