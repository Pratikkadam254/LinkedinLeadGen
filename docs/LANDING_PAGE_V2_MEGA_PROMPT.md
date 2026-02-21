# Cinematic Landing Page Builder: LeadFlow AI (Mega Prompt)

## Role
Act as a World-Class Senior Creative Technologist and Lead Frontend Engineer. Your objective is to architect a high-fidelity, cinematic "1:1 Pixel Perfect" landing page for **LeadFlow AI** (a B2B LinkedIn LeadGen SaaS). Every site you produce should feel like a digital instrument — every scroll intentional, every animation weighted and professional. Eradicate all generic AI patterns.

The site should feel like a bridge between an elite intelligence agency and a high-end algorithmic trading desk.

## 1. CORE DESIGN SYSTEM (STRICT)

**Aesthetic Identity:** "Premium Data-Driven Intelligence" / "Midnight B2B Luxe"

*   **Palette:**
    *   **Primary Background:** Obsidian `#020408` (Deep Navy Black).
    *   **Surface:** Slate `#1E293B` (for glassmorphic cards).
    *   **Accent Primary:** LinkedIn Blue `#0A66C2` (Used for B2B trust & primary CTAs).
    *   **Accent Secondary:** Cyan `#06B6D4` (Used for glowing highlights & data visualizations).
    *   **Text/Dark sections:** White `#FFFFFF` (Primary) and `#94A3B8` (Slate-400 for secondary).
*   **Typography:**
    *   **Headings:** `"Inter"` (ExtraBold, Tracking tight).
    *   **Drama/Emphasis:** `"Cormorant Garamond"` (Must use Italic for philosophical/strategic concepts to create extreme contrast).
    *   **Data:** A clean Monospace (`"JetBrains Mono"`) for clinical telemetry, logs, and stats.
*   **Visual Texture:** Implement a global CSS Noise overlay (inline SVG `<feTurbulence>` filter at **0.05 opacity**) to eliminate flat digital gradients. Use a `rounded-[2rem]` to `rounded-[3rem]` radius system for all containers. No sharp corners anywhere.

## 2. MICRO-INTERACTIONS & ANIMATION LIFECYCLE
*   All buttons must have a **"magnetic" feel**: subtle `scale(1.03)` on hover with `cubic-bezier(0.25, 0.46, 0.45, 0.94)`.
*   Buttons use `overflow-hidden` with a sliding background `<span>` layer for color transitions on hover.
*   Links and interactive elements get a `translateY(-1px)` lift on hover.
*   Use `gsap.context()` within `useEffect` for ALL animations. Return `ctx.revert()` in the cleanup function.
*   Default easing: `power3.out` for entrances, `power2.inOut` for morphs. Stagger value: `0.08` for text, `0.15` for cards/containers.

## 3. COMPONENT ARCHITECTURE & BEHAVIOR

### A. NAVBAR ("The Floating Island")
*   A `fixed`, pill-shaped container horizontally centered (`max-w-4xl`).
*   **Morphing Logic:** Transparent array of links at the hero top. Transitions into `bg-[#0B101B]/80 backdrop-blur-xl` with white text and a subtle 1px translucent border upon scrolling past the hero. Trigger via `IntersectionObserver` or GSAP `ScrollTrigger`.

### B. HERO SECTION ("Outreach is an Algorithm")
*   **Visuals:** `100dvh` height. Full-bleed background image of a dark abstract data node network (sourced from Unsplash, search: `bioluminescence, dark water, neon reflections, microscopy` or `data network`) with a heavy **Midnight-to-Black gradient overlay** (`bg-gradient-to-t`).
*   **Layout:** Content pushed to the **bottom-left third** using flex + padding.
*   **Typography:** Large scale contrast. "Outreach is an" (Bold Sans `"Inter"`) / "Algorithm." (Massive Serif Italic `"Cormorant Garamond"`).
*   **Animation:** GSAP staggered `fade-up` (y: 40 → 0, opacity: 0 → 1) for all text parts and CTA.
*   "Start Free Trial" CTA button utilizing the accent color (`#0A66C2`).

### C. FEATURES ("Interactive Functional Artifacts")
Replace standard marketing cards with 3 interactive micro-UIs demonstrating the core value propositions:

*   **Card 1 ("Network Extractor"):** Implement a "Diagnostic Shuffler." 3 overlapping Slate cards that cycle vertically using `array.unshift(array.pop())` logic every 3 seconds with a spring-bounce transition (`cubic-bezier(0.34, 1.56, 0.64, 1)`). Labels derived from value prop 1: "Profile Extraction", "Data Enrichment", "Connection Scoring".
*   **Card 2 ("Campaign Telemetry"):** Implement a "Telemetry Typewriter." A monospace live text feed that character-types through simulated backend messages like `[SCANNING] Tech Founders...`, `[DRAFTING] Personalized Pitch...`, `[SENDING] Connect Request...` with a blinking cyan cursor (`#06B6D4`). Include a small "Live Engine" label with a pulsing dot.
*   **Card 3 ("Rate-Limit Guardian"):** Implement a "Mock Cursor Protocol Scheduler." A daily grid where an automated SVG cursor enters, clicks to schedule peak delivery times intelligently, avoids limits, pops a "Safe Delivery Validated" badge, and fades out. 

All cards: `bg-[#0B101B] / 80` glass surface, subtle 1px border, `rounded-[2rem]`, and a custom heavy drop shadow (`shadow-2xl shadow-blue-500/10`).

### D. PHILOSOPHY ("The Manifesto")
*   Full-width section with the Obsidian Deep Navy (`#020408`) color as background.
*   A parallaxing organic dark texture image at low opacity behind the text.
*   **Typography:** Two contrasting statements.
    *   "Most SDR tools focus on: Blind volume and spam." — neutral, smaller.
    *   "We focus on: Surgical precision." — massive, drama serif italic (`Cormorant`), with cyan keyword highlight.
*   **Animation:** GSAP `SplitText`-style reveal (word-by-word fade-up).

### E. PROTOCOL ("Sticky Stacking Archive")
3 full-screen cards that stack on scroll demonstrating the Funnel Blueprint.
*   **Stacking Interaction:** Using GSAP `ScrollTrigger` with `pin: true`. As a new card scrolls into view, the card underneath scales to `0.9`, blurs to `20px`, and fades to `0.5`.
*   **Card 1 (The Audience):** A slowly zooming node-graph background indicating "Deep Context Awareness".
*   **Card 2 (The Score):** A horizontal scanning laser line moving across CV data. "Instant Lead Scoring".
*   **Card 3 (The Delivery):** A pulsing waveform (SVG path animation). "Automated Delivery".

### F. MEMBERSHIP / CTA & FOOTER
*   **The Warp-Speed CTA:** A high-fidelity liquid glass container. Background animates "Star Beams" (thin cyan lines shooting from center to edges). Massive gradient headline: "Start Automating Outreach".
*   **Footer:** Deep dark-colored background, `rounded-t-[4rem]`.
*   Grid layout: Brand name + tagline, navigation columns.
*   **"System Operational" status indicator:** A pulsing green dot and monospace label at the bottom.
*   **Signature Mark:** A screen-filling "LEADFLOW" text (18vw, font-black) at the very bottom, half-cut by the viewport, at 3% opacity.

## 4. TECHNICAL REQUIREMENTS (NEVER CHANGE)
*   **Stack:** React 19, Tailwind CSS v3.4.17, GSAP 3 (with ScrollTrigger plugin), Lucide React for icons.
*   **Fonts:** Load via Google Fonts `<link>` tags in `index.html`. 
*   **Images:** Use real Unsplash URLs. Never use placeholder URLs.
*   **File Structure:** Single `App.jsx` with components defined in the same file (or split into `components/` if large). Single `index.css` for Tailwind directives + noise overlay (`<feTurbulence>`) + custom utilities.
*   **No placeholders:** Every card, every label, every animation must be fully implemented and functional.

**Execution Directive:** "Do not build a website; build a digital instrument. Every scroll should feel intentional, every animation should feel weighted and professional. Eradicate all generic AI patterns."
