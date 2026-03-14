/**
 * Auto-Scroll Engine
 *
 * Handles human-like pagination through Sales Navigator search results.
 * Simulates natural scrolling, reading pauses, and page navigation.
 */

import { ANTI_DETECTION, LEADS_PER_PAGE, MAX_LEADS_PER_EXTRACTION } from '../shared/constants';
import { waitForSelector, extractCurrentPageLeads, hasNextPage, clickNextPage } from './dom-scraper';
import { SELECTORS } from '../shared/constants';
import type { ExtractedLead, ExtractionConfig, ExtractionProgress } from '../shared/types';

// ============================================
// UTILITY FUNCTIONS
// ============================================

/** Random number between min and max (inclusive) */
function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Gaussian random with mean and stddev */
function gaussianRandom(mean: number, stddev: number): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return num * stddev + mean;
}

/** Sleep for a given number of milliseconds */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Randomized delay with Gaussian jitter */
async function randomDelay(baseMin: number, baseMax: number): Promise<void> {
  const base = randomBetween(baseMin, baseMax);
  const jitter = gaussianRandom(0, base * ANTI_DETECTION.jitterStdDev);
  const delay = Math.max(500, base + jitter);
  await sleep(delay);
}

// ============================================
// SCROLL SIMULATION
// ============================================

/**
 * Simulate human-like scrolling through search results.
 * Uses ease-in-out curves for natural movement.
 */
async function simulateReadingScroll(): Promise<void> {
  const scrollHeight = document.documentElement.scrollHeight;
  const viewportHeight = window.innerHeight;
  const maxScroll = scrollHeight - viewportHeight;

  if (maxScroll <= 0) return;

  const steps = randomBetween(
    ANTI_DETECTION.scrollStepsMin,
    ANTI_DETECTION.scrollStepsMax
  );

  let pauseCounter = 0;
  const pauseEvery = randomBetween(
    ANTI_DETECTION.pauseEveryMin,
    ANTI_DETECTION.pauseEveryMax
  );

  for (let i = 0; i <= steps; i++) {
    // Ease-in-out curve for natural scroll
    const t = i / steps;
    const eased = t < 0.5
      ? 2 * t * t
      : -1 + (4 - 2 * t) * t;

    const targetY = maxScroll * eased;
    window.scrollTo({ top: targetY, behavior: 'auto' });

    // Random delay between scroll steps
    await sleep(randomBetween(
      ANTI_DETECTION.scrollStepDelayMin,
      ANTI_DETECTION.scrollStepDelayMax
    ));

    // Periodic pauses (simulates reading)
    pauseCounter++;
    if (pauseCounter >= pauseEvery) {
      pauseCounter = 0;
      await sleep(randomBetween(
        ANTI_DETECTION.pauseDurationMin,
        ANTI_DETECTION.pauseDurationMax
      ));
    }
  }
}

// ============================================
// TIME-OF-DAY THROTTLING
// ============================================

/**
 * Get the throttle multiplier based on current time of day.
 * Browsing at 3 AM is suspicious — we slow down during off-hours.
 */
function getThrottleMultiplier(): number {
  const hour = new Date().getHours();
  if (hour >= 9 && hour <= 17) return ANTI_DETECTION.throttleMultipliers.businessHours;
  if (hour >= 7 && hour <= 20) return ANTI_DETECTION.throttleMultipliers.extendedHours;
  return ANTI_DETECTION.throttleMultipliers.offHours;
}

// ============================================
// MAIN EXTRACTION LOOP
// ============================================

export interface ExtractionCallbacks {
  onPageExtracted: (leads: ExtractedLead[], page: number, totalPages: number) => void;
  onProgress: (progress: ExtractionProgress) => void;
  onComplete: (allLeads: ExtractedLead[]) => void;
  onError: (error: Error) => void;
  shouldCancel: () => boolean;
  shouldPause: () => boolean;
}

/**
 * Main auto-scroll extraction function.
 * Scrolls through Sales Navigator results, extracts leads page by page.
 */
export async function autoScrollExtraction(
  config: ExtractionConfig,
  callbacks: ExtractionCallbacks
): Promise<ExtractedLead[]> {
  const maxLeads = Math.min(config.maxLeads, MAX_LEADS_PER_EXTRACTION);
  const totalPages = Math.ceil(maxLeads / LEADS_PER_PAGE);
  const allLeads: ExtractedLead[] = [];
  const startTime = Date.now();

  try {
    for (let page = 0; page < totalPages; page++) {
      // Check cancel/pause
      if (callbacks.shouldCancel()) {
        break;
      }

      while (callbacks.shouldPause()) {
        await sleep(1000);
        if (callbacks.shouldCancel()) break;
      }

      // 1. Wait for results to render
      const resultCard = await waitForSelector(SELECTORS.resultCard, { timeout: 15000 });
      if (!resultCard) {
        callbacks.onError(new Error(`Page ${page + 1}: Results did not load within timeout`));
        break;
      }

      // 2. Simulate human reading — scroll through results
      await simulateReadingScroll();

      // 3. Extract leads from current page
      const pageLeads = extractCurrentPageLeads();

      if (pageLeads.length > 0) {
        allLeads.push(...pageLeads);
        callbacks.onPageExtracted(pageLeads, page + 1, totalPages);
      }

      // 4. Update progress
      const elapsed = Date.now() - startTime;
      const avgTimePerPage = elapsed / (page + 1);
      const remainingPages = totalPages - page - 1;

      callbacks.onProgress({
        status: 'extracting',
        currentPage: page + 1,
        totalPages,
        leadsExtracted: allLeads.length,
        totalLeads: maxLeads,
        creditsUsed: allLeads.length,
        startedAt: startTime,
        estimatedTimeRemaining: avgTimePerPage * remainingPages,
      });

      // 5. Check if we've reached the lead limit
      if (allLeads.length >= maxLeads) {
        break;
      }

      // 6. Check if there's a next page
      if (!hasNextPage()) {
        break;
      }

      // 7. Navigate to next page with human-like delay
      const throttle = getThrottleMultiplier();
      await randomDelay(1500 * throttle, 4000 * throttle);
      clickNextPage();

      // 8. Wait for page to load
      await randomDelay(2000 * throttle, 5000 * throttle);

      // 9. Take a long pause periodically
      if (
        allLeads.length > 0 &&
        allLeads.length % ANTI_DETECTION.longPauseThreshold === 0
      ) {
        await randomDelay(
          ANTI_DETECTION.longPauseDurationMin,
          ANTI_DETECTION.longPauseDurationMax
        );
      }
    }

    callbacks.onComplete(allLeads);
    return allLeads;
  } catch (error) {
    callbacks.onError(error instanceof Error ? error : new Error(String(error)));
    return allLeads;
  }
}
