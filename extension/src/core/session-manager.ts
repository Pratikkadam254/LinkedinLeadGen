/**
 * Session Manager
 *
 * Manages LinkedIn authentication state by capturing session cookies
 * and auth headers. Implements a fallback chain:
 * 1. Try header cloning (from intercepted requests) — most reliable
 * 2. Fall back to cookie reading via chrome.cookies API
 */

import { getCapturedAuth, type CapturedAuth } from './voyager-interceptor';

export interface LinkedInSession {
  csrfToken: string;
  liAt: string;
  jsessionId: string;
  isValid: boolean;
  expiresAt?: number;
}

/**
 * Get the current LinkedIn session using the fallback chain.
 */
export async function getLinkedInSession(): Promise<LinkedInSession | null> {
  // Strategy 1: Use headers captured from intercepted requests
  const capturedAuth = getCapturedAuth();
  if (capturedAuth && capturedAuth.csrfToken) {
    const cookies = await readLinkedInCookies();
    if (cookies) {
      return {
        csrfToken: capturedAuth.csrfToken,
        liAt: cookies.liAt,
        jsessionId: cookies.jsessionId,
        isValid: true,
      };
    }
  }

  // Strategy 2: Read cookies directly
  const cookies = await readLinkedInCookies();
  if (cookies) {
    return {
      csrfToken: cookies.jsessionId.replace(/"/g, ''), // CSRF token = JSESSIONID without quotes
      liAt: cookies.liAt,
      jsessionId: cookies.jsessionId,
      isValid: true,
    };
  }

  return null;
}

/**
 * Read LinkedIn session cookies via chrome.cookies API.
 */
async function readLinkedInCookies(): Promise<{
  liAt: string;
  jsessionId: string;
} | null> {
  try {
    const [liAtCookie, jsessionCookie] = await Promise.all([
      chrome.cookies.get({ url: 'https://www.linkedin.com', name: 'li_at' }),
      chrome.cookies.get({ url: 'https://www.linkedin.com', name: 'JSESSIONID' }),
    ]);

    if (!liAtCookie || !jsessionCookie) {
      return null;
    }

    return {
      liAt: liAtCookie.value,
      jsessionId: jsessionCookie.value,
    };
  } catch (error) {
    console.warn('[LeadFlow] Failed to read LinkedIn cookies:', error);
    return null;
  }
}

/**
 * Build request headers for making direct Voyager API calls.
 * Used in the cookie-based fallback strategy.
 */
export function buildVoyagerHeaders(session: LinkedInSession): Record<string, string> {
  return {
    'csrf-token': session.csrfToken,
    'x-restli-protocol-version': '2.0.0',
    'x-li-lang': 'en_US',
    'x-li-page-instance': `urn:li:page:d_sales2_search_people;${crypto.randomUUID()}`,
    'cookie': `li_at=${session.liAt}; JSESSIONID=${session.jsessionId}`,
    'accept': 'application/vnd.linkedin.normalized+json+2.1',
    'accept-language': 'en-US,en;q=0.9',
  };
}

/**
 * Make a direct Voyager API request using captured session.
 * Used when interception isn't capturing the data we need.
 */
export async function fetchVoyagerApi(
  endpoint: string,
  session: LinkedInSession
): Promise<unknown> {
  const headers = buildVoyagerHeaders(session);
  const url = `https://www.linkedin.com${endpoint}`;

  const response = await fetch(url, {
    method: 'GET',
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Voyager API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Check if the user is logged into Sales Navigator.
 */
export async function isLoggedInToSalesNav(): Promise<boolean> {
  const session = await getLinkedInSession();
  return session !== null && session.isValid;
}
