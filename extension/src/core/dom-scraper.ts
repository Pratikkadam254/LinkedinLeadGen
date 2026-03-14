/**
 * DOM Scraper (Fallback Extraction)
 *
 * Extracts lead data directly from Sales Navigator's rendered DOM.
 * Uses ARIA attributes and data-anonymize selectors for stability.
 * This is the fallback when Voyager API interception fails.
 */

import { SELECTORS } from '../shared/constants';
import type { ExtractedLead } from '../shared/types';

/**
 * Detect the current Sales Navigator page type.
 */
export function detectPageType(): 'search' | 'list' | 'profile' | 'unknown' {
  if (document.querySelector(SELECTORS.searchResultsPage)) return 'search';
  if (document.querySelector(SELECTORS.leadListPage)) return 'list';
  if (window.location.pathname.includes('/sales/lead/')) return 'profile';
  return 'unknown';
}

/**
 * Wait for a DOM element to appear using MutationObserver.
 */
export function waitForSelector(
  selector: string,
  options: { timeout?: number; parent?: Element } = {}
): Promise<Element | null> {
  const { timeout = 10000, parent = document } = options;

  return new Promise((resolve) => {
    // Check if element already exists
    const existing = parent.querySelector(selector);
    if (existing) {
      resolve(existing);
      return;
    }

    const observer = new MutationObserver(() => {
      const element = parent.querySelector(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });

    observer.observe(parent, {
      childList: true,
      subtree: true,
    });

    // Timeout
    setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeout);
  });
}

/**
 * Extract a single lead from a search result card element.
 */
function extractLeadFromCard(card: Element): ExtractedLead | null {
  try {
    // Name
    const nameEl = card.querySelector(SELECTORS.personName);
    const fullName = nameEl?.textContent?.trim() || '';
    const [firstName, ...lastParts] = fullName.split(' ');
    const lastName = lastParts.join(' ');

    if (!firstName) return null;

    // Title
    const titleEl = card.querySelector(SELECTORS.title);
    const title = titleEl?.textContent?.trim() || '';

    // Company
    const companyEl = card.querySelector(SELECTORS.company);
    const company = companyEl?.textContent?.trim() || '';

    // Location
    const locationEl = card.querySelector(SELECTORS.location);
    const location = locationEl?.textContent?.trim() || undefined;

    // LinkedIn URL
    const profileLinkEl = card.querySelector(SELECTORS.profileLink) as HTMLAnchorElement | null;
    let linkedInUrl = '';
    if (profileLinkEl?.href) {
      // Extract the canonical profile URL
      const url = new URL(profileLinkEl.href);
      linkedInUrl = `https://www.linkedin.com${url.pathname}`;
    }

    // Connection degree
    const degreeEl = card.querySelector(SELECTORS.connectionDegree);
    const degreeText = degreeEl?.textContent?.trim() || '';
    const connectionDegree = degreeText.includes('1st')
      ? 1
      : degreeText.includes('2nd')
        ? 2
        : degreeText.includes('3rd')
          ? 3
          : undefined;

    // Shared connections
    const sharedEl = card.querySelector(SELECTORS.sharedConnections);
    const sharedText = sharedEl?.textContent?.trim() || '';
    const sharedMatch = sharedText.match(/(\d+)/);
    const sharedConnections = sharedMatch ? parseInt(sharedMatch[1], 10) : undefined;

    // Company URL
    const companyLinkEl = card.querySelector(SELECTORS.companyLink) as HTMLAnchorElement | null;
    const companyLinkedInUrl = companyLinkEl?.href || undefined;

    return {
      firstName,
      lastName,
      title,
      company,
      linkedInUrl,
      location,
      connectionDegree,
      sharedConnections,
      companyLinkedInUrl,
    };
  } catch (error) {
    console.warn('[LeadFlow] Failed to extract lead from card:', error);
    return null;
  }
}

/**
 * Extract all leads from the current page's search results.
 */
export function extractCurrentPageLeads(): ExtractedLead[] {
  const cards = document.querySelectorAll(SELECTORS.resultCard);
  const leads: ExtractedLead[] = [];

  cards.forEach((card) => {
    const lead = extractLeadFromCard(card);
    if (lead && lead.firstName) {
      leads.push(lead);
    }
  });

  return leads;
}

/**
 * Get the total number of search results from the page.
 */
export function getTotalResultCount(): number | null {
  const totalEl = document.querySelector(SELECTORS.totalResults);
  if (!totalEl) return null;

  const text = totalEl.textContent?.trim() || '';
  const match = text.replace(/,/g, '').match(/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Check if there's a next page available.
 */
export function hasNextPage(): boolean {
  const nextBtn = document.querySelector(SELECTORS.nextButton) as HTMLButtonElement | null;
  return nextBtn !== null && !nextBtn.disabled;
}

/**
 * Click the next page button.
 */
export function clickNextPage(): boolean {
  const nextBtn = document.querySelector(SELECTORS.nextButton) as HTMLButtonElement | null;
  if (nextBtn && !nextBtn.disabled) {
    nextBtn.click();
    return true;
  }
  return false;
}

/**
 * Get the current page number.
 */
export function getCurrentPageNumber(): number {
  const activeIndicator = document.querySelector(
    `${SELECTORS.pageIndicator}.active, ${SELECTORS.pageIndicator}[aria-current="true"]`
  );
  if (activeIndicator) {
    const num = parseInt(activeIndicator.textContent?.trim() || '1', 10);
    return isNaN(num) ? 1 : num;
  }
  return 1;
}
