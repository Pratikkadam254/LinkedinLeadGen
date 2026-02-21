# Cinematic Landing Page Builder: LeadFlow AI (Mega Prompt)

## Role
Act as a World-Class Senior Creative Technologist and Lead Frontend Engineer. Your objective is to architect a high-fidelity, cinematic "1:1 Pixel Perfect" landing page for **LeadFlow AI** (a B2B LinkedIn LeadGen SaaS). Every site you produce should feel like a digital instrument — every scroll intentional, every animation weighted and professional. Eradicate all generic AI patterns.

The site should feel like a bridge between an elite intelligence agency and a high-end algorithmic trading desk.

## 1. CORE DESIGN SYSTEM (STRICT)

**Aesthetic Identity:** "Modern B2B Clarity" / "LinkedIn-Inspired Trust"

*   **Palette:**
    *   **Primary Background:** LinkedIn Gray 50 `#F3F2EF`.
    *   **Surface:** Pure White `#FFFFFF` (for cards and modals).
    *   **Accent Primary:** LinkedIn Blue `#0A66C2` (Used for primary CTAs and emphasis).
    *   **Accent Secondary:** Light Blue `#70B5F9` (Used for highlights).
    *   **Text/Light sections:** Dark Gray `#191919` (Primary) and Gray 600 `#666666` (Secondary).
*   **Typography:**
    *   **Headings:** `"Inter"` (ExtraBold, Tracking tight).
    *   **Drama/Emphasis:** `"Cormorant Garamond"` (Must use Italic for philosophical/strategic concepts to create contrast).
    *   **Data:** A clean Monospace (`"JetBrains Mono"`) for clinical telemetry, logs, and stats.
*   **Visual Texture:** Clean, minimalistic, and flat. Use a `rounded-[1rem]` to `rounded-[2rem]` radius system for all containers. Precise borders (`1px solid #E8E8E8`) and soft shadows (`0 4px 12px rgba(0, 0, 0, 0.08)`) instead of heavy gradients or noise.


## 2. MICRO-INTERACTIONS & ANIMATION LIFECYCLE
*   All buttons must have a **"magnetic" feel**: subtle `scale(1.03)` on hover with `cubic-bezier(0.25, 0.46, 0.45, 0.94)`.
*   Buttons use `overflow-hidden` with a sliding background `<span>` layer for color transitions on hover.
*   Links and interactive elements get a `translateY(-1px)` lift on hover.
*   Use `gsap.context()` within `useEffect` for ALL animations. Return `ctx.revert()` in the cleanup function.
*   Default easing: `power3.out` for entrances, `power2.inOut` for morphs. Stagger value: `0.08` for text, `0.15` for cards/containers.

## 3. COMPONENT ARCHITECTURE & BEHAVIOR

### A. NAVBAR ("The Floating Island")
*   A `fixed`, pill-shaped container horizontally centered (`max-w-4xl`).
*   **Morphing Logic:** Transparent array of links at the hero top. Transitions into `bg-white/90 backdrop-blur-xl` with dark text and a subtle 1px border (`#E8E8E8`) upon scrolling past the hero. Trigger via `IntersectionObserver` or GSAP `ScrollTrigger`.

### B. HERO SECTION ("Outreach is an Algorithm")
*   **Visuals:** `100dvh` height. Very clean, white to light-gray `#F3F2EF` gradient. Background should feature subtle geometry or extremely light grid patterns (`stroke: #E8E8E8`). No neon.
*   **Layout:** Content pushed to the **bottom-left third** using flex + padding.
*   **Typography:** Large scale contrast. "Outreach is an" (Bold Sans `"Inter"`, dark gray `#191919`) / "Algorithm." (Massive Serif Italic `"Cormorant Garamond"`, LinkedIn Blue `#0A66C2`).
*   **Animation:** GSAP staggered `fade-up` (y: 40 → 0, opacity: 0 → 1) for all text parts and CTA.
*   "Start Free Trial" CTA button utilizing the accent color (`#0A66C2`).

### C. FEATURES ("Interactive Functional Artifacts")
Replace standard marketing cards with 3 interactive micro-UIs demonstrating the core value propositions:

*   **Card 1 ("Network Extractor"):** Implement a "Diagnostic Shuffler." 3 overlapping white cards with light borders (`#E8E8E8`) that cycle vertically using `array.unshift(array.pop())` logic every 3 seconds with a spring-bounce transition (`cubic-bezier(0.34, 1.56, 0.64, 1)`). Labels derived from value prop 1: "Profile Extraction", "Data Enrichment", "Connection Scoring".
*   **Card 2 ("Campaign Telemetry"):** Implement a "Telemetry Typewriter." A monospace live text feed that character-types through simulated backend messages like `[SCANNING] Tech Founders...`, `[DRAFTING] Personalized Pitch...`, `[SENDING] Connect Request...`. Use a light gray block `#F3F2EF` with dark monospace text `#191919` and a blue cursor (`#0A66C2`). Include a small "Live Engine" label with a pulsing green dot (`#057642`).
*   **Card 3 ("Rate-Limit Guardian"):** Implement a "Mock Cursor Protocol Scheduler." A daily grid where an automated SVG cursor enters, clicks to schedule peak delivery times intelligently, avoids limits, pops a "Safe Delivery Validated" badge, and fades out. 

All cards: `bg-white` surface, subtle 1px border (`#E8E8E8`), `rounded-[1.5rem]`, and a custom soft drop shadow (`shadow-md shadow-[rgba(0,0,0,0.08)]`).

### D. PHILOSOPHY ("The Manifesto")
*   Full-width section with the LinkedIn Gray (`#F3F2EF`) color as background.
*   **Typography:** Two contrasting statements.
    *   "Most SDR tools focus on: Blind volume and spam." — neutral, smaller (`#666666`).
    *   "We focus on: Surgical precision." — massive, drama serif italic (`Cormorant`), `#191919`, with blue keyword highlight (`#0A66C2`).
*   **Animation:** GSAP `SplitText`-style reveal (word-by-word fade-up).

### E. PROTOCOL ("Sticky Stacking Archive")
3 full-screen cards that stack on scroll demonstrating the Funnel Blueprint.
*   **Stacking Interaction:** Using GSAP `ScrollTrigger` with `pin: true`. As a new card scrolls into view, the card underneath scales to `0.9`, blurs to `10px`, and fades to `0.5`.
*   **Card 1 (The Audience):** A slowly zooming light gray node-graph background indicating "Deep Context Awareness".
*   **Card 2 (The Score):** A horizontal scanning laser line moving across CV data. "Instant Lead Scoring".
*   **Card 3 (The Delivery):** A pulsing waveform (SVG path animation). "Automated Delivery".

### F. MEMBERSHIP / CTA & FOOTER
*   **The Warp-Speed CTA:** A high-fidelity white glass container. Background animates "Focus Beams" (thin blue lines showing data flows). Massive clean headline: "Start Automating Outreach".
*   **Footer:** LinkedIn Gray (`#F3F2EF`) background, `rounded-t-[2rem]`. Use a clean separation border from the CTA.
*   Grid layout: Brand name + tagline, navigation columns, dark text `#191919`.
*   **"System Operational" status indicator:** A pulsing green dot (`#057642`) and small label at the bottom.
*   **Signature Mark:** A screen-filling "LEADFLOW" text (18vw, font-black) at the very bottom, half-cut by the viewport, at 3% opacity, colored `#191919`.

## 4. TECHNICAL REQUIREMENTS (NEVER CHANGE)
*   **Stack:** React 19, Tailwind CSS v3.4.17, GSAP 3 (with ScrollTrigger plugin), Lucide React for icons.
*   **Fonts:** Load via Google Fonts `<link>` tags in `index.html`. 
*   **Images:** Use real Unsplash URLs. Never use placeholder URLs.
*   **File Structure:** Single `App.jsx` with components defined in the same file (or split into `components/` if large). Single `index.css` for Tailwind directives + noise overlay (`<feTurbulence>`) + custom utilities.
*   **No placeholders:** Every card, every label, every animation must be fully implemented and functional.

**Execution Directive:** "Do not build a website; build a digital instrument. Every scroll should feel intentional, every animation should feel weighted and professional. Eradicate all generic AI patterns."
