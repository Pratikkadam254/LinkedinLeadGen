---
name: anti-detection-audit
description: Audit the Chrome extension for detection vulnerabilities. Use before releasing a new version to ensure LinkedIn cannot detect the extension.
user-invocable: true
allowed-tools: Bash, Read, Glob, Grep
---

## Anti-Detection Audit Checklist

Review the extension for these detection vectors:

### 1. Extension Fingerprint
- [ ] `web_accessible_resources` is empty in manifest.json
- [ ] No `externally_connectable` in manifest.json
- [ ] Shadow DOM uses `mode: 'closed'` for all injected UI
- [ ] No global variables leaked to `window` object
- [ ] No detectable DOM elements outside shadow roots
- [ ] Extension ID is not in LinkedIn's known blocklist

### 2. Request Patterns
- [ ] Randomized delays use Gaussian distribution (not uniform)
- [ ] Time-of-day throttling is active
- [ ] Daily extraction limit enforced (2,500 max)
- [ ] No burst patterns in request timing
- [ ] CSRF token properly rotated

### 3. Behavioral Signals
- [ ] Mouse movement simulation active during extraction
- [ ] Scroll patterns use ease-in-out curves (not linear)
- [ ] Random dwell times between page views
- [ ] Click coordinates have natural variance

### 4. Content Script Hygiene
- [ ] All injected elements cleaned up on navigation
- [ ] No console.log statements in production build
- [ ] Error boundaries prevent extension crashes from leaking to LinkedIn's error tracking

Review each file in `extension/src/anti-detection/` and score the stealth level 1-10.
