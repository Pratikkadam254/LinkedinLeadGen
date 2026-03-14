/**
 * Chrome Storage Wrappers
 *
 * Type-safe wrappers around chrome.storage for
 * persisting extension state.
 */

import type { UserSession, ExtractionProgress, CreditBalance } from '../shared/types';

const KEYS = {
  userSession: 'lf_user_session',
  extractionState: 'lf_extraction_state',
  creditBalance: 'lf_credit_balance',
  dailyStats: 'lf_daily_stats',
  settings: 'lf_settings',
} as const;

export interface ExtensionSettings {
  autoExtract: boolean;
  showNotifications: boolean;
  maxLeadsPerExtraction: number;
}

const DEFAULT_SETTINGS: ExtensionSettings = {
  autoExtract: false,
  showNotifications: true,
  maxLeadsPerExtraction: 2500,
};

// ============================================
// SESSION STORAGE (cleared when browser closes)
// ============================================

export async function saveUserSession(session: UserSession): Promise<void> {
  await chrome.storage.session.set({ [KEYS.userSession]: session });
}

export async function getUserSession(): Promise<UserSession | null> {
  const result = await chrome.storage.session.get(KEYS.userSession);
  return result[KEYS.userSession] || null;
}

export async function clearUserSession(): Promise<void> {
  await chrome.storage.session.remove(KEYS.userSession);
}

// ============================================
// LOCAL STORAGE (persists across sessions)
// ============================================

export async function saveExtractionState(state: ExtractionProgress): Promise<void> {
  await chrome.storage.local.set({ [KEYS.extractionState]: state });
}

export async function getExtractionState(): Promise<ExtractionProgress | null> {
  const result = await chrome.storage.local.get(KEYS.extractionState);
  return result[KEYS.extractionState] || null;
}

export async function clearExtractionState(): Promise<void> {
  await chrome.storage.local.remove(KEYS.extractionState);
}

export async function saveCreditBalance(balance: CreditBalance): Promise<void> {
  await chrome.storage.local.set({ [KEYS.creditBalance]: balance });
}

export async function getCreditBalance(): Promise<CreditBalance | null> {
  const result = await chrome.storage.local.get(KEYS.creditBalance);
  return result[KEYS.creditBalance] || null;
}

export async function saveSettings(settings: ExtensionSettings): Promise<void> {
  await chrome.storage.local.set({ [KEYS.settings]: settings });
}

export async function getSettings(): Promise<ExtensionSettings> {
  const result = await chrome.storage.local.get(KEYS.settings);
  return { ...DEFAULT_SETTINGS, ...result[KEYS.settings] };
}
