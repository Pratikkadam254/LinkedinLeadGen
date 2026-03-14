/**
 * Voyager API Interceptor
 *
 * Intercepts LinkedIn's internal Voyager API calls by monkey-patching
 * fetch/XHR in the page's main world. Captures API responses passively
 * as the user browses Sales Navigator.
 *
 * Architecture:
 * 1. Content script injects a <script> into the page's main world
 * 2. The injected script patches window.fetch and XMLHttpRequest
 * 3. When a Voyager API response is detected, it fires a CustomEvent
 * 4. Content script listens for the CustomEvent and forwards data
 *    to the service worker via chrome.runtime.sendMessage
 */

import { VOYAGER_API_PATTERNS } from '../shared/constants';

/**
 * The script injected into the page's main world.
 * This runs in LinkedIn's JavaScript context (NOT the isolated content script world).
 * It must be self-contained — no imports or external references.
 */
function getInjectedScript(): string {
  return `
    (function() {
      'use strict';

      // Patterns to match Voyager API URLs
      const API_PATTERNS = ${JSON.stringify(VOYAGER_API_PATTERNS)};

      function isVoyagerUrl(url) {
        if (!url || typeof url !== 'string') return false;
        return API_PATTERNS.some(pattern => url.includes(pattern));
      }

      // ============================================
      // PATCH window.fetch
      // ============================================
      const originalFetch = window.fetch;
      window.fetch = async function(...args) {
        const response = await originalFetch.apply(this, args);

        try {
          const url = typeof args[0] === 'string'
            ? args[0]
            : args[0] instanceof Request
              ? args[0].url
              : String(args[0]);

          if (isVoyagerUrl(url)) {
            const clone = response.clone();
            clone.json().then(data => {
              window.dispatchEvent(new CustomEvent('__lf_voyager_response', {
                detail: { url, data, source: 'fetch', timestamp: Date.now() }
              }));
            }).catch(() => {
              // Response wasn't JSON, ignore
            });
          }
        } catch (e) {
          // Silently fail — never break LinkedIn's functionality
        }

        return response;
      };

      // ============================================
      // PATCH XMLHttpRequest
      // ============================================
      const originalXHROpen = XMLHttpRequest.prototype.open;
      const originalXHRSend = XMLHttpRequest.prototype.send;

      XMLHttpRequest.prototype.open = function(method, url, ...rest) {
        this._lfUrl = typeof url === 'string' ? url : String(url);
        this._lfMethod = method;
        return originalXHROpen.apply(this, [method, url, ...rest]);
      };

      XMLHttpRequest.prototype.send = function(...args) {
        if (isVoyagerUrl(this._lfUrl)) {
          this.addEventListener('load', function() {
            try {
              const data = JSON.parse(this.responseText);
              window.dispatchEvent(new CustomEvent('__lf_voyager_response', {
                detail: {
                  url: this._lfUrl,
                  data,
                  source: 'xhr',
                  timestamp: Date.now()
                }
              }));
            } catch (e) {
              // Response wasn't JSON, ignore
            }
          });
        }
        return originalXHRSend.apply(this, args);
      };
    })();
  `;
}

/**
 * Inject the Voyager interceptor script into the page's main world.
 * Must be called from the content script.
 */
export function injectVoyagerInterceptor(): void {
  const script = document.createElement('script');
  script.textContent = getInjectedScript();
  (document.head || document.documentElement).appendChild(script);
  script.remove(); // Remove the script tag after execution (cleaner)
}

/**
 * Listen for intercepted Voyager API responses.
 * Returns a cleanup function to remove the listener.
 */
export function onVoyagerResponse(
  callback: (url: string, data: unknown) => void
): () => void {
  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<{
      url: string;
      data: unknown;
      source: string;
      timestamp: number;
    }>;
    callback(customEvent.detail.url, customEvent.detail.data);
  };

  window.addEventListener('__lf_voyager_response', handler);

  return () => {
    window.removeEventListener('__lf_voyager_response', handler);
  };
}

/**
 * Captured auth headers from intercepted requests.
 * Used as fallback when direct interception isn't available.
 */
export interface CapturedAuth {
  csrfToken: string;
  liAt: string;
  jsessionId: string;
  timestamp: number;
}

let capturedAuth: CapturedAuth | null = null;

/**
 * Capture auth headers from a Voyager API response.
 * This is the "header cloning" approach for the fallback chain.
 */
export function captureAuthFromResponse(headers: Record<string, string>): void {
  const csrfToken = headers['csrf-token'] || headers['x-restli-protocol-version'];

  if (csrfToken) {
    capturedAuth = {
      csrfToken,
      liAt: '', // Will be filled by session manager from cookies
      jsessionId: '',
      timestamp: Date.now(),
    };
  }
}

export function getCapturedAuth(): CapturedAuth | null {
  if (!capturedAuth) return null;

  // Auth expires after 30 minutes
  if (Date.now() - capturedAuth.timestamp > 30 * 60 * 1000) {
    capturedAuth = null;
    return null;
  }

  return capturedAuth;
}
