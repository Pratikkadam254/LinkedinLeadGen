/**
 * Detection Monitor
 *
 * Monitors for signs that LinkedIn is detecting or probing
 * the extension. Triggers safe mode when threats are detected.
 */

import { SAFE_MODE_DURATION_MS } from '../shared/constants';

export type ThreatLevel = 'none' | 'low' | 'medium' | 'high' | 'critical';

interface ThreatEvent {
  type: string;
  timestamp: number;
  details: string;
}

class DetectionMonitor {
  private threats: ThreatEvent[] = [];
  private isInSafeMode = false;
  private safeModeCallbacks: (() => void)[] = [];

  /**
   * Register a callback for when safe mode is triggered.
   */
  onSafeMode(callback: () => void): void {
    this.safeModeCallbacks.push(callback);
  }

  /**
   * Start monitoring for detection signals.
   */
  startMonitoring(): () => void {
    const cleanups: (() => void)[] = [];

    // 1. Monitor for extension resource probes
    cleanups.push(this.monitorResourceProbes());

    // 2. Monitor for rate limit responses (429)
    cleanups.push(this.monitorRateLimits());

    // 3. Monitor for challenge pages (CAPTCHA)
    cleanups.push(this.monitorChallengePages());

    return () => cleanups.forEach((cleanup) => cleanup());
  }

  /**
   * Monitor for extension resource probe attempts.
   */
  private monitorResourceProbes(): () => void {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name.includes('chrome-extension://')) {
          this.recordThreat('probe', 'Extension resource probe detected');
        }
      }
    });

    try {
      observer.observe({ entryTypes: ['resource'] });
    } catch {
      // Not available
    }

    return () => observer.disconnect();
  }

  /**
   * Monitor for rate limit responses from LinkedIn.
   */
  private monitorRateLimits(): () => void {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent;
      const status = customEvent.detail?.status;

      if (status === 429) {
        this.recordThreat('rate_limit', 'Received 429 rate limit response');
      }

      if (status === 403) {
        this.recordThreat('forbidden', 'Received 403 forbidden response');
      }
    };

    window.addEventListener('__lf_response_status', handler);
    return () => window.removeEventListener('__lf_response_status', handler);
  }

  /**
   * Monitor for CAPTCHA/challenge pages.
   */
  private monitorChallengePages(): () => void {
    const observer = new MutationObserver(() => {
      // Check for common challenge page indicators
      const challengeIndicators = [
        '[id*="captcha"]',
        '[class*="captcha"]',
        '[id*="challenge"]',
        '[class*="challenge"]',
        'iframe[src*="recaptcha"]',
        'iframe[src*="hcaptcha"]',
      ];

      for (const selector of challengeIndicators) {
        if (document.querySelector(selector)) {
          this.recordThreat('captcha', `Challenge page detected: ${selector}`);
          break;
        }
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }

  /**
   * Record a threat event and evaluate threat level.
   */
  private recordThreat(type: string, details: string): void {
    const event: ThreatEvent = {
      type,
      timestamp: Date.now(),
      details,
    };

    this.threats.push(event);

    // Keep only last 5 minutes of threats
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    this.threats = this.threats.filter((t) => t.timestamp > fiveMinutesAgo);

    // Evaluate threat level
    const level = this.evaluateThreatLevel();

    if (level === 'high' || level === 'critical') {
      this.triggerSafeMode();
    }
  }

  /**
   * Evaluate the current threat level based on recent events.
   */
  evaluateThreatLevel(): ThreatLevel {
    const recentThreats = this.threats.filter(
      (t) => Date.now() - t.timestamp < 5 * 60 * 1000
    );

    if (recentThreats.length === 0) return 'none';

    // Any CAPTCHA = critical
    if (recentThreats.some((t) => t.type === 'captcha')) return 'critical';

    // Multiple 403s = high
    const forbiddenCount = recentThreats.filter((t) => t.type === 'forbidden').length;
    if (forbiddenCount >= 2) return 'high';

    // Rate limits
    const rateLimitCount = recentThreats.filter((t) => t.type === 'rate_limit').length;
    if (rateLimitCount >= 3) return 'high';
    if (rateLimitCount >= 1) return 'medium';

    // Probes
    if (recentThreats.some((t) => t.type === 'probe')) return 'low';

    return 'low';
  }

  /**
   * Trigger safe mode — stop all extraction, remove UI, go dormant.
   */
  private triggerSafeMode(): void {
    if (this.isInSafeMode) return;
    this.isInSafeMode = true;

    // Safe mode activated — go dormant

    // Notify all listeners
    this.safeModeCallbacks.forEach((cb) => cb());

    // Notify service worker
    chrome.runtime.sendMessage({ type: 'SAFE_MODE' });

    // Auto-exit safe mode after cooldown period (15 minutes)
    setTimeout(() => {
      this.isInSafeMode = false;
      this.threats = [];
    }, SAFE_MODE_DURATION_MS);
  }

  /**
   * Check if we're currently in safe mode.
   */
  isActive(): boolean {
    return this.isInSafeMode;
  }
}

export const detectionMonitor = new DetectionMonitor();
