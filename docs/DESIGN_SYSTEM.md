# LeadFlow AI - Design System & Visual Storyboard

## 🎨 Design System Overview

This is the comprehensive design system and visual storyboard for the LeadFlow AI web application. It serves as the single source of truth for all visual design decisions, component specifications, and UI patterns.

---

## 📐 Design Principles

### 1. **Clarity Over Cleverness**
Every design decision should prioritize user understanding. No trendy patterns that sacrifice usability.

### 2. **Data-Driven Aesthetics**
Beautiful data visualizations that tell stories. Numbers should be engaging, not intimidating.

### 3. **Intelligent Minimalism**
Clean interfaces that feel powerful, not empty. Every element serves a purpose.

### 4. **Premium Dark-First**
Dark mode is the primary experience, optimized for professionals working long hours.

### 5. **Micro-interactions Matter**
Subtle animations that provide feedback and delight without distraction.

---

## 🎭 Visual Storyboard

### Scene 1: Landing Page Hero Section

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]                     Product  Pricing  Resources  📱 │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│              Transform LinkedIn Connections                   │
│              Into Qualified Leads                             │
│              ═══════════════════════                          │
│                                                               │
│   AI-powered lead generation that feels human.                │
│   Build relationships at scale without losing authenticity.   │
│                                                               │
│        [Start Free Trial →]    [See How It Works]            │
│                                                               │
│   ✓ 7-day free trial  ✓ No credit card  ✓ Setup in 5 min   │
│                                                               │
│         [Animated Dashboard Preview - Glassmorphic]          │
│         [Real-time metrics flowing in]                        │
│                                                               │
│   🏢 Trusted by 500+ B2B companies                           │
│   [Company Logos: Subtle, Monochrome]                        │
└─────────────────────────────────────────────────────────────┘
```

**Visual Details:**
- **Background**: Dark gradient mesh (midnight blue to deep purple)
- **Text**: White primary, blue gradient on headline words
- **CTA Button**: Gradient (blue to cyan) with glow effect
- **Dashboard Preview**: Floating card with glassmorphic effect, subtle animation
- **Accent**: Glowing particles/dots connecting in background

---

### Scene 2: Features Section (Three-Column Layout)

```
┌─────────────────────────────────────────────────────────────┐
│                                                               │
│          Everything You Need to Generate Leads                │
│          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                  │
│                                                               │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │   🤖         │    │   📊         │    │   ⚡         │     │
│  │             │    │             │    │             │     │
│  │ Smart      │    │ Deep        │    │ Lightning   │     │
│  │ Automation │    │ Insights    │    │ Fast Setup  │     │
│  │             │    │             │    │             │     │
│  │ AI-powered  │    │ Real-time   │    │ Start in    │     │
│  │ outreach    │    │ analytics   │    │ under 5     │     │
│  │ that adapts │    │ that drive  │    │ minutes.    │     │
│  │ to results  │    │ decisions   │    │ No code.    │     │
│  │             │    │             │    │             │     │
│  │ [Learn More]│    │ [Learn More]│    │ [Learn More]│     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**Card Specifications:**
```css
.feature-card {
  background: linear-gradient(135deg, 
    rgba(30, 41, 59, 0.4) 0%, 
    rgba(30, 41, 59, 0.2) 100%);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 48px 32px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.feature-card:hover {
  transform: translateY(-8px) scale(1.02);
  border-color: rgba(37, 99, 235, 0.5);
  box-shadow: 
    0 20px 60px rgba(37, 99, 235, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.feature-icon {
  font-size: 48px;
  margin-bottom: 24px;
  filter: drop-shadow(0 0 20px currentColor);
}
```

---

### Scene 3: Dashboard Interface (Main App View)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ☰  [Logo]        Dashboard  Campaigns  Analytics  Contacts     [👤]    │
├─────────────┬───────────────────────────────────────────────────────────┤
│             │                                                             │
│  📊 Dashboard│  Welcome back, Sarah                                       │
│  🎯 Campaigns│  Here's what's happening with your leads today            │
│  📈 Analytics│                                                             │
│  👥 Contacts │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  ⚙️ Settings │  │   847    │ │   52%    │ │   189    │ │  $45.2K  │   │
│              │  │          │ │ ▲ 12%    │ │ ▼ 3%     │ │ ▲ 28%    │   │
│              │  │ Messages │ │ Accept   │ │ Replies  │ │ Pipeline │   │
│              │  │ Sent     │ │ Rate     │ │ Received │ │ Value    │   │
│              │  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
│              │                                                             │
│              │  Campaign Performance              Active Conversations    │
│              │  ━━━━━━━━━━━━━━━━━━━━━              ━━━━━━━━━━━━━━━━━━  │
│              │  ┌────────────────────┐              ┌─────────────────┐ │
│              │  │  [Line Chart]      │              │ John Smith      │ │
│              │  │  📈 Trending up    │              │ "Thanks for..." │ │
│              │  │                    │              │ 2 min ago   💬  │ │
│              │  │  Last 30 days      │              ├─────────────────┤ │
│              │  │                    │              │ Sarah Johnson   │ │
│              │  └────────────────────┘              │ "Very intere..." │ │
│              │                                       │ 15 min ago  💬  │ │
│              │  Top Performing Messages              └─────────────────┘ │
│              │  ━━━━━━━━━━━━━━━━━━━━━━                                  │
│              │  1. "I noticed your post about..." - 68% response         │
│              │  2. "Quick question about [topic]" - 61% response         │
│              │  3. "Love what you're doing at..." - 58% response         │
│              │                                                             │
└─────────────┴───────────────────────────────────────────────────────────┘
```

**Dashboard Design Specifications:**

**Sidebar:**
```css
.sidebar {
  width: 240px;
  background: #1E293B;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  padding: 24px 0;
}

.nav-item {
  padding: 12px 24px;
  margin: 4px 12px;
  border-radius: 8px;
  transition: all 0.2s;
}

.nav-item:hover,
.nav-item.active {
  background: rgba(37, 99, 235, 0.15);
  color: #3B82F6;
}
```

**Stats Cards:**
```css
.stat-card {
  background: linear-gradient(135deg, 
    rgba(37, 99, 235, 0.1) 0%, 
    rgba(6, 182, 212, 0.05) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  min-width: 160px;
}

.stat-value {
  font-size: 2.25rem;
  font-weight: 700;
  background: linear-gradient(135deg, #3B82F6, #06B6D4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stat-change {
  font-size: 0.875rem;
  color: #10B981; /* green for positive */
}

.stat-change.negative {
  color: #EF4444; /* red for negative */
}
```

---

### Scene 4: Campaign Builder Interface

```
┌─────────────────────────────────────────────────────────────┐
│              Create New Campaign                              │
│              ━━━━━━━━━━━━━━━━━                               │
│                                                               │
│  Campaign Name                                                │
│  ┌─────────────────────────────────────┐                    │
│  │ Q1 2026 SaaS Founders Outreach      │                    │
│  └─────────────────────────────────────┘                    │
│                                                               │
│  Target Audience                                              │
│  ┌──┬──┬──┬──┬──┬──┐                                        │
│  │✓ │  │  │✓ │  │  │  Job Titles                           │
│  │  │  │  │  │  │  │  [Founder, CEO, VP Sales...]          │
│  └──┴──┴──┴──┴──┴──┘                                        │
│                                                               │
│  Message Sequence                                             │
│  ━━━━━━━━━━━━━━━━                                           │
│                                                               │
│  ┌───────────────────────────────────────┐                  │
│  │ 1️⃣ Connection Request (Day 0)         │  [Edit]  [△]    │
│  │ "Hi {firstName}, I noticed..."        │                  │
│  │ 📊 68% acceptance rate                │         [▽]      │
│  └───────────────────────────────────────┘                  │
│  ┌───────────────────────────────────────┐                  │
│  │ 2️⃣ Follow-up Message (Day 3)          │  [Edit]  [△]    │
│  │ "Thanks for connecting! I saw..."     │                  │
│  │ 📊 45% response rate                  │         [▽]      │
│  └───────────────────────────────────────┘                  │
│  ┌───────────────────────────────────────┐                  │
│  │ 3️⃣ Value Offer (Day 7)                │  [Edit]  [△]    │
│  │ "Quick question - are you..."         │                  │
│  │ 📊 38% response rate                  │         [▽]      │
│  └───────────────────────────────────────┘                  │
│                                                               │
│  [+ Add Message Step]                                        │
│                                                               │
│           [Save Draft]     [Launch Campaign →]               │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**Message Sequence Card:**
```css
.message-step {
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-left: 4px solid #3B82F6;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  transition: all 0.3s;
}

.message-step:hover {
  border-left-color: #06B6D4;
  background: rgba(30, 41, 59, 0.8);
  transform: translateX(4px);
}

.message-preview {
  color: #E5E7EB;
  font-size: 0.875rem;
  font-style: italic;
  margin: 8px 0;
}

.message-stats {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #10B981;
  font-size: 0.813rem;
  font-weight: 600;
}
```

---

### Scene 5: Analytics Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│                   Campaign Analytics                              │
│                   ━━━━━━━━━━━━━━━━━━                           │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Date Range   │  │ Campaign     │  │ Export       │          │
│  │ Last 30 Days │  │ All Active   │  │ CSV / PDF    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
│  Funnel Overview                                                  │
│  ━━━━━━━━━━━━━━                                                 │
│  ┌──────────────────────────────────────────────────┐           │
│  │                                                    │           │
│  │  1,247 Profiles Viewed                            │           │
│  │    │                                               │           │
│  │    ▼ 68% (847)                                    │           │
│  │  847 Connection Requests Sent                     │           │
│  │    │                                               │           │
│  │    ▼ 52% (440)                                    │           │
│  │  440 Connections Accepted                         │           │
│  │    │                                               │           │
│  │    ▼ 43% (189)                                    │           │
│  │  189 Conversations Started                        │           │
│  │    │                                               │           │
│  │    ▼ 31% (59)                                     │           │
│  │  59 Qualified Leads                               │           │
│  │                                                    │           │
│  └──────────────────────────────────────────────────┘           │
│                                                                   │
│  Performance Over Time                Message Engagement          │
│  ━━━━━━━━━━━━━━━━━━━━                ━━━━━━━━━━━━━━━━━━━━       │
│  ┌──────────────────────┐              ┌──────────────────┐     │
│  │ [Area Chart]         │              │ [Donut Chart]    │     │
│  │ Connections  ──────  │              │                  │     │
│  │ Responses    ──────  │              │ • Opened: 68%    │     │
│  │ Leads        ──────  │              │ • Clicked: 23%   │     │
│  │                      │              │ • Replied: 9%    │     │
│  │ [Interactive Legend] │              │                  │     │
│  └──────────────────────┘              └──────────────────┘     │
│                                                                   │
│  Best Performing Times                  Top Geographies           │
│  ━━━━━━━━━━━━━━━━━━━━                 ━━━━━━━━━━━━━━━━         │
│  ┌──────────────────────┐              ┌──────────────────┐     │
│  │ [Heatmap]            │              │ 1. 🇺🇸 USA 34%    │     │
│  │ Mon-Fri Hours        │              │ 2. 🇬🇧 UK  18%    │     │
│  │ Darker = Higher      │              │ 3. 🇨🇦 CA  12%    │     │
│  │ Response Rates       │              │ 4. 🇦🇺 AU  9%     │     │
│  │                      │              │ 5. 🇩🇪 DE  7%     │     │
│  └──────────────────────┘              └──────────────────┘     │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

**Chart Styling:**
```css
.chart-container {
  background: rgba(30, 41, 59, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
}

/* Chart.js custom theme */
Chart.defaults.color = '#E5E7EB';
Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';
Chart.defaults.font.family = 'Inter';

/* Gradient for area charts */
const gradient = ctx.createLinearGradient(0, 0, 0, 400);
gradient.addColorStop(0, 'rgba(37, 99, 235, 0.4)');
gradient.addColorStop(1, 'rgba(37, 99, 235, 0)');
```

---

## 🎨 Component Library

### Buttons

#### Primary Button
```html
<button class="btn btn-primary">
  Start Free Trial
  <svg class="icon-arrow">→</svg>
</button>
```

```css
.btn-primary {
  background: linear-gradient(135deg, #2563EB 0%, #06B6D4 100%);
  color: white;
  font-weight: 600;
  font-size: 1rem;
  padding: 14px 32px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 16px rgba(37, 99, 235, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.5);
}

.btn-primary:active {
  transform: translateY(0);
}
```

#### Secondary Button
```css
.btn-secondary {
  background: transparent;
  color: #3B82F6;
  border: 2px solid #3B82F6;
  /* ... rest similar to primary ... */
}

.btn-secondary:hover {
  background: rgba(37, 99, 235, 0.1);
  border-color: #06B6D4;
  color: #06B6D4;
}
```

#### Ghost Button
```css
.btn-ghost {
  background: transparent;
  color: #E5E7EB;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-ghost:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.3);
}
```

---

### Input Fields

```html
<div class="input-group">
  <label class="input-label">Email Address</label>
  <input type="email" class="input-field" placeholder="you@company.com">
  <span class="input-helper">We'll never share your email</span>
</div>
```

```css
.input-field {
  width: 100%;
  padding: 14px 16px;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: white;
  font-size: 1rem;
  transition: all 0.3s;
}

.input-field:focus {
  outline: none;
  border-color: #3B82F6;
  background: rgba(30, 41, 59, 0.8);
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
}

.input-field::placeholder {
  color: #64748B;
}

.input-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #E5E7EB;
  font-size: 0.875rem;
}

.input-helper {
  display: block;
  margin-top: 6px;
  font-size: 0.813rem;
  color: #9CA3AF;
}
```

---

### Cards

#### Elevated Card
```css
.card-elevated {
  background: linear-gradient(135deg, 
    rgba(30, 41, 59, 0.8) 0%, 
    rgba(30, 41, 59, 0.6) 100%);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 32px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-elevated:hover {
  transform: translateY(-4px);
  box-shadow: 
    0 16px 48px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}
```

#### Glassmorphic Card
```css
.card-glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.37);
}
```

---

### Badges & Tags

```html
<span class="badge badge-success">Active</span>
<span class="badge badge-warning">Pending</span>
<span class="badge badge-danger">Paused</span>
```

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-success {
  background: rgba(16, 185, 129, 0.15);
  color: #10B981;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.badge-warning {
  background: rgba(245, 158, 11, 0.15);
  color: #F59E0B;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.badge-danger {
  background: rgba(239, 68, 68, 0.15);
  color: #EF4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}
```

---

### Data Tables

```css
.table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 8px;
}

.table thead th {
  text-align: left;
  padding: 12px 16px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #9CA3AF;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.table tbody tr {
  background: rgba(30, 41, 59, 0.4);
  transition: all 0.2s;
}

.table tbody tr:hover {
  background: rgba(30, 41, 59, 0.6);
  transform: scale(1.01);
}

.table tbody td {
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.table tbody tr td:first-child {
  border-left: 1px solid rgba(255, 255, 255, 0.05);
  border-top-left-radius: 8px;
  border-bottom-left-radius: 8px;
}

.table tbody tr td:last-child {
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;
}
```

---

## 🎬 Animation Library

### Page Load Animation
```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-in {
  animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.animate-in-delay-1 { animation-delay: 0.1s; }
.animate-in-delay-2 { animation-delay: 0.2s; }
.animate-in-delay-3 { animation-delay: 0.3s; }
```

### Pulse Animation (for live data)
```css
@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

.pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

### Shimmer Loading
```css
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.skeleton {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.05) 0%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.05) 100%
  );
  background-size: 1000px 100%;
  animation: shimmer 2s infinite;
}
```

### Hover Glow Effect
```css
.glow-on-hover {
  position: relative;
  transition: all 0.3s;
}

.glow-on-hover::before {
  content: '';
  position: absolute;
  inset: -2px;
  background: linear-gradient(135deg, #2563EB, #06B6D4);
  border-radius: inherit;
  opacity: 0;
  filter: blur(20px);
  transition: opacity 0.3s;
  z-index: -1;
}

.glow-on-hover:hover::before {
  opacity: 0.7;
}
```

---

## 📱 Responsive Breakpoints

```css
/* Mobile First Approach */

/* Extra Small (Mobile) */
@media (min-width: 0px) {
  .container { max-width: 100%; padding: 0 16px; }
  .grid { grid-template-columns: 1fr; }
}

/* Small (Large Mobile) */
@media (min-width: 640px) {
  .container { max-width: 640px; }
  .grid-sm-2 { grid-template-columns: repeat(2, 1fr); }
}

/* Medium (Tablet) */
@media (min-width: 768px) {
  .container { max-width: 768px; padding: 0 24px; }
  .text-md-lg { font-size: 1.125rem; }
}

/* Large (Desktop) */
@media (min-width: 1024px) {
  .container { max-width: 1024px; }
  .grid-lg-3 { grid-template-columns: repeat(3, 1fr); }
  .grid-lg-4 { grid-template-columns: repeat(4, 1fr); }
}

/* Extra Large (Wide Desktop) */
@media (min-width: 1280px) {
  .container { max-width: 1280px; padding: 0 32px; }
}
```

---

## ♿ Accessibility Guidelines

### Color Contrast
All text must meet WCAG AA standards:
- **Normal text**: Minimum 4.5:1 contrast ratio
- **Large text** (18pt+): Minimum 3:1 contrast ratio

**Tested Combinations:**
- ✅ White (#FFFFFF) on Midnight (#0A0E1A): 18.2:1
- ✅ Gray 200 (#E5E7EB) on Slate Deep (#1E293B): 12.4:1
- ✅ Blue (#3B82F6) on Midnight (#0A0E1A): 8.3:1

### Keyboard Navigation
```css
/* Focus visible styles */
*:focus-visible {
  outline: 2px solid #3B82F6;
  outline-offset: 2px;
  border-radius: 4px;
}

/* Skip to main content link */
.skip-to-main {
  position: absolute;
  top: -100px;
  left: 0;
  background: #2563EB;
  color: white;
  padding: 12px 24px;
  z-index: 100;
}

.skip-to-main:focus {
  top: 0;
}
```

### Screen Reader Support
```html
<!-- Proper semantic HTML -->
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/dashboard" aria-current="page">Dashboard</a></li>
  </ul>
</nav>

<!-- Descriptive labels -->
<button aria-label="Close dialog">
  <svg aria-hidden="true">×</svg>
</button>

<!-- Loading states -->
<div role="status" aria-live="polite">
  <span class="sr-only">Loading campaign data...</span>
  <div class="spinner"></div>
</div>
```

---

## 🎨 Design Tokens (CSS Custom Properties)

```css
:root {
  /* Colors */
  --color-primary: #2563EB;
  --color-primary-light: #3B82F6;
  --color-primary-dark: #1D4ED8;
  
  --color-accent: #06B6D4;
  --color-accent-light: #22D3EE;
  
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-danger: #EF4444;
  
  --color-bg-primary: #0A0E1A;
  --color-bg-secondary: #1E293B;
  --color-bg-tertiary: #334155;
  
  --color-text-primary: #FFFFFF;
  --color-text-secondary: #E5E7EB;
  --color-text-tertiary: #9CA3AF;
  
  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  --space-3xl: 64px;
  --space-4xl: 96px;
  
  /* Typography */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-display: 'Outfit', var(--font-sans);
  
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;
  --font-size-4xl: 2.25rem;
  
  /* Borders */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 9999px;
  
  /* Shadows */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.2);
  --shadow-md: 0 8px 24px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 16px 48px rgba(0, 0, 0, 0.4);
  --shadow-glow: 0 0 20px rgba(37, 99, 235, 0.5);
  
  /* Transitions */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base: 300ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 500ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## 🖼️ Icon System

### Icon Library
Use **Lucide Icons** or **Heroicons** for consistency

### Icon Sizes
```css
.icon-xs { width: 16px; height: 16px; }
.icon-sm { width: 20px; height: 20px; }
.icon-md { width: 24px; height: 24px; }
.icon-lg { width: 32px; height: 32px; }
.icon-xl { width: 48px; height: 48px; }
```

### Icon Usage Examples
```html
<!-- In buttons -->
<button class="btn-primary">
  <svg class="icon-sm"><!-- icon --></svg>
  Send Message
</button>

<!-- In navigation -->
<a href="/dashboard">
  <svg class="icon-md"><!-- icon --></svg>
  <span>Dashboard</span>
</a>

<!-- Stand-alone with context -->
<div class="stat-card">
  <svg class="icon-lg text-blue-400"><!-- icon --></svg>
  <h3>847</h3>
  <p>Messages Sent</p>
</div>
```

---

## 📊 Data Visualization Style

### Chart Color Palette
```javascript
const chartColors = {
  primary: '#3B82F6',
  secondary: '#06B6D4',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  gradients: {
    blue: ['#2563EB', '#3B82F6', '#60A5FA'],
    multi: ['#3B82F6', '#06B6D4', '#10B981', '#F59E0B']
  }
};
```

### Chart.js Configuration
```javascript
const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'bottom',
      labels: {
        color: '#E5E7EB',
        font: { family: 'Inter', size: 12 },
        padding: 20,
        usePointStyle: true,
        pointStyle: 'circle'
      }
    },
    tooltip: {
      backgroundColor: 'rgba(30, 41, 59, 0.95)',
      titleColor: '#FFFFFF',
      bodyColor: '#E5E7EB',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      padding: 12,
      cornerRadius: 8,
      displayColors: true
    }
  },
  scales: {
    x: {
      grid: {
        color: 'rgba(255, 255, 255, 0.05)',
        drawBorder: false
      },
      ticks: { color: '#9CA3AF' }
    },
    y: {
      grid: {
        color: 'rgba(255, 255, 255, 0.05)',
        drawBorder: false
      },
      ticks: { color: '#9CA3AF' }
    }
  }
};
```

---

## ✅ Design System Checklist

### Before Shipping Any Component:
- [ ] Follows brand color palette
- [ ] Uses design tokens (CSS custom properties)
- [ ] Responsive across all breakpoints
- [ ] Keyboard accessible
- [ ] Screen reader friendly
- [ ]Color contrast meets WCAG AA
- [ ] Smooth transitions/animations
- [ ] Hover/focus states defined
- [ ] Loading states implemented
- [ ] Error states handled
- [ ] Empty states designed
- [ ] Matches Figma design (if applicable)
- [ ] Cross-browser tested
- [ ] Performance optimized

---

## 🚀 Implementation Checklist

### Phase 1: Foundation (Week 1)
- [ ] Set up design tokens
- [ ] Create base CSS reset
- [ ] Implement typography system
- [ ] Build color system
- [ ] Set up responsive grid

### Phase 2: Core Components (Week 2-3)
- [ ] Buttons (all variants)
- [ ] Input fields
- [ ] Cards
- [ ] Navigation
- [ ] Tables
- [ ] Modals/dialogs

### Phase 3: Complex Components (Week 4-5)
- [ ] Charts and data visualizations
- [ ] Campaign builder interface
- [ ] Analytics dashboard
- [ ] Messaging interface
- [ ] Settings panels

### Phase 4: Polish & Optimization (Week 6)
- [ ] Animation refinement
- [ ] Accessibility audit
- [ ] Performance optimization
- [ ] Cross-browser testing
- [ ] Documentation finalization

---

*This design system is a living document. Continuously refine based on user feedback and evolving brand needs.*

**Version**: 1.0  
**Date**: February 2026  
**Owner**: Design & Engineering Team
