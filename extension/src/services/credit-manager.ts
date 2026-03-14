/**
 * Credit Manager
 *
 * Client-side credit tracking for the extension.
 * Server-side enforcement happens in Convex mutations —
 * this is for optimistic UI and pre-validation.
 */

import type { CreditBalance } from '../shared/types';
import { saveCreditBalance, getCreditBalance } from './storage';
import { checkCredits as checkCreditsApi } from './convex-client';

class CreditManager {
  private balance: CreditBalance | null = null;

  /**
   * Initialize by fetching the latest balance from Convex.
   */
  async initialize(): Promise<CreditBalance> {
    try {
      this.balance = await checkCreditsApi();
      await saveCreditBalance(this.balance);
    } catch {
      // Fallback to cached balance
      this.balance = await getCreditBalance();
    }

    if (!this.balance) {
      this.balance = {
        balance: 0,
        plan: 'free',
        monthlyAllocation: 100,
        resetDate: Date.now(),
      };
    }

    return this.balance;
  }

  /**
   * Check if the user has enough credits for an extraction.
   */
  hasCredits(count: number = 1): boolean {
    return (this.balance?.balance || 0) >= count;
  }

  /**
   * Get the current balance.
   */
  getBalance(): CreditBalance | null {
    return this.balance;
  }

  /**
   * Optimistically deduct credits (before server confirms).
   */
  async deductOptimistic(count: number): Promise<void> {
    if (this.balance) {
      this.balance = {
        ...this.balance,
        balance: Math.max(0, this.balance.balance - count),
      };
      await saveCreditBalance(this.balance);
    }
  }

  /**
   * Refresh balance from server.
   */
  async refresh(): Promise<CreditBalance> {
    return this.initialize();
  }
}

export const creditManager = new CreditManager();
