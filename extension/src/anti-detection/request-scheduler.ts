/**
 * Request Scheduler
 *
 * Manages request timing with Gaussian jitter, time-of-day awareness,
 * and daily quota tracking to avoid LinkedIn detection.
 */

import { DAILY_EXTRACTION_LIMIT, ANTI_DETECTION } from '../shared/constants';

const STORAGE_KEY = 'lf_daily_stats';

interface DailyStats {
  date: string; // YYYY-MM-DD
  extractedCount: number;
  lastExtractionAt: number;
}

export class RequestScheduler {
  private dailyStats: DailyStats | null = null;

  async initialize(): Promise<void> {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    this.dailyStats = result[STORAGE_KEY] || null;
    this.resetIfNewDay();
  }

  private resetIfNewDay(): void {
    const today = new Date().toISOString().split('T')[0];
    if (!this.dailyStats || this.dailyStats.date !== today) {
      this.dailyStats = {
        date: today,
        extractedCount: 0,
        lastExtractionAt: 0,
      };
      this.persist();
    }
  }

  private async persist(): Promise<void> {
    await chrome.storage.local.set({ [STORAGE_KEY]: this.dailyStats });
  }

  /**
   * Check if extraction is allowed based on daily limits.
   */
  canExtract(): boolean {
    this.resetIfNewDay();
    return (this.dailyStats?.extractedCount || 0) < DAILY_EXTRACTION_LIMIT;
  }

  /**
   * Get remaining daily quota.
   */
  getRemainingQuota(): number {
    this.resetIfNewDay();
    return DAILY_EXTRACTION_LIMIT - (this.dailyStats?.extractedCount || 0);
  }

  /**
   * Record that leads were extracted.
   */
  async recordExtraction(count: number): Promise<void> {
    this.resetIfNewDay();
    if (this.dailyStats) {
      this.dailyStats.extractedCount += count;
      this.dailyStats.lastExtractionAt = Date.now();
      await this.persist();
    }
  }

  /**
   * Calculate a delay with Gaussian jitter.
   * Not uniform distribution — more natural.
   */
  calculateDelay(baseMs: number): number {
    // Gaussian random (Box-Muller transform)
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    const gaussian = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);

    const jitter = gaussian * baseMs * ANTI_DETECTION.jitterStdDev;
    const throttle = this.getThrottleMultiplier();

    return Math.max(500, (baseMs + jitter) * throttle);
  }

  /**
   * Time-of-day throttle multiplier.
   */
  getThrottleMultiplier(): number {
    const hour = new Date().getHours();
    if (hour >= 9 && hour <= 17) return ANTI_DETECTION.throttleMultipliers.businessHours;
    if (hour >= 7 && hour <= 20) return ANTI_DETECTION.throttleMultipliers.extendedHours;
    return ANTI_DETECTION.throttleMultipliers.offHours;
  }

  /**
   * Get today's stats.
   */
  getStats(): DailyStats {
    this.resetIfNewDay();
    return { ...this.dailyStats! };
  }
}

export const requestScheduler = new RequestScheduler();
