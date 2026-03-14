---
name: voyager-api-debug
description: Debug and validate LinkedIn Voyager API interception. Use when troubleshooting data extraction issues or when LinkedIn changes their API.
user-invocable: true
allowed-tools: Bash, Read, Glob, Grep
---

## Debug Voyager API Interception

1. Check the interceptor code in `extension/src/core/voyager-interceptor.ts`
2. Verify the fetch/XHR monkey-patch is correctly injecting into the page's main world
3. Check that CustomEvent listeners are properly bridging page world to content script
4. Review the session manager for auth header capture
5. If interception is failing:
   - Check if LinkedIn has changed their API endpoints (search for `/voyager/api/` and `/salesApi` patterns)
   - Verify the content script is running in the correct world (main vs isolated)
   - Check chrome://extensions for content script errors
6. Log intercepted responses and compare against expected data fields
