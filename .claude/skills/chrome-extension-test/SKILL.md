---
name: chrome-extension-test
description: Test the Chrome extension by loading it in a browser and verifying injection, scraping, and anti-detection. Use after building the extension.
user-invocable: true
allowed-tools: Bash, Read, Glob, Grep
---

## Test the Chrome Extension

Use the Playwright or Chrome DevTools MCP server to:

1. Launch Chrome with the extension loaded:
   ```
   --load-extension=extension/.output/chrome-mv3-dev
   --disable-extensions-except=extension/.output/chrome-mv3-dev
   ```
2. Navigate to LinkedIn Sales Navigator
3. Verify the "Extract with LeadFlow" button is injected
4. Check browser console for errors
5. Verify no extension artifacts are detectable in the DOM (anti-detection)
6. Test the popup UI loads correctly
7. Verify Clerk auth flow works

Report results with screenshots if possible.
