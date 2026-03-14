---
name: chrome-extension-build
description: Build, validate, and package the Chrome extension for testing or Chrome Web Store submission. Use when the user says "build extension", "package extension", or after making extension code changes.
user-invocable: true
allowed-tools: Bash, Read, Glob, Grep
---

## Build the Chrome Extension

1. Navigate to the extension directory: `cd extension/`
2. Install dependencies if needed: `npm install`
3. Run the WXT build: `npx wxt build`
4. Validate the output:
   - Check `extension/.output/chrome-mv3/` exists
   - Verify `manifest.json` is valid JSON with correct permissions
   - Ensure no `web_accessible_resources` are exposed (anti-detection)
   - Check content script targets `https://www.linkedin.com/sales/*`
5. Report build size and any warnings
6. If building for store submission, create a zip: `cd .output/chrome-mv3 && zip -r ../../extension.zip .`

Current extension version: !`cat extension/package.json 2>/dev/null | jq -r '.version' 2>/dev/null || echo 'not yet created'`
