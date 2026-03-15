/**
 * Background Service Worker (WXT entrypoint)
 *
 * Handles:
 * - Clerk authentication state
 * - Convex client initialization
 * - Message routing between popup and content scripts
 * - Credit tracking
 * - Extraction state management
 *
 * NOTE: Service workers go idle after 30 seconds of inactivity (MV3).
 * Long-running extraction is managed by the content script.
 * The service worker is woken up via chrome.runtime.sendMessage for each batch.
 */

import { initConvexClient, importLeads, createExtraction, updateExtractionProgress, completeExtraction, checkCredits } from '../services/convex-client';
import { saveUserSession, getUserSession, saveExtractionState } from '../services/storage';
import { BATCH_SIZE, CONVEX_URL } from '../shared/constants';
import type { ExtensionMessage, ExtractedLead, ExtractionProgress } from '../shared/types';

export default defineBackground(() => {
  // ============================================
  // INITIALIZATION
  // ============================================

  // Initialize Convex client
  initConvexClient(CONVEX_URL);

  // Current extraction state
  let currentExtractionId: string | undefined;
  let pendingLeads: ExtractedLead[] = [];

  // ============================================
  // MESSAGE HANDLING
  // ============================================

  chrome.runtime.onMessage.addListener(
    (message: ExtensionMessage, sender, sendResponse) => {
      handleMessage(message, sender, sendResponse);
      return true; // Keep channel open for async responses
    }
  );

  async function handleMessage(
    message: ExtensionMessage,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response?: unknown) => void
  ): Promise<void> {
    try {
      switch (message.type) {
        case 'GET_AUTH_STATE': {
          const session = await getUserSession();
          sendResponse({ session });
          break;
        }

        case 'AUTH_STATE': {
          await saveUserSession(message.data);
          sendResponse({ success: true });
          break;
        }

        case 'CHECK_CREDITS': {
          try {
            const balance = await checkCredits();
            sendResponse({ balance });
          } catch (error) {
            sendResponse({ error: String(error) });
          }
          break;
        }

        case 'START_EXTRACTION': {
          try {
            currentExtractionId = await createExtraction(
              message.config.searchUrl,
              message.config.searchFilters
            );
            pendingLeads = [];
            sendResponse({ extractionId: currentExtractionId });
          } catch (error) {
            sendResponse({ error: String(error) });
          }
          break;
        }

        case 'LEADS_EXTRACTED': {
          pendingLeads.push(...message.data);

          // Batch import when we have enough leads
          if (pendingLeads.length >= BATCH_SIZE) {
            const batch = pendingLeads.splice(0, BATCH_SIZE);
            try {
              await importLeads(batch, currentExtractionId || '');
            } catch (error) {
              console.error('[LeadFlow] Failed to import batch:', error);
              // Re-add failed leads for retry
              pendingLeads.unshift(...batch);
            }
          }

          sendResponse({ success: true, pending: pendingLeads.length });
          break;
        }

        case 'EXTRACTION_PROGRESS': {
          const progress = message.progress;

          // Update badge with lead count
          chrome.action.setBadgeText({
            text: progress.leadsExtracted > 0
              ? String(progress.leadsExtracted)
              : '',
          });
          chrome.action.setBadgeBackgroundColor({ color: '#6366f1' });

          // Save state for persistence
          await saveExtractionState(progress);

          // Update Convex
          if (currentExtractionId) {
            try {
              await updateExtractionProgress(
                currentExtractionId,
                progress.leadsExtracted,
                progress.status
              );
            } catch {
              // Non-critical, continue
            }
          }

          sendResponse({ success: true });
          break;
        }

        case 'EXTRACTION_COMPLETE': {
          // Flush remaining leads
          if (pendingLeads.length > 0) {
            try {
              await importLeads(pendingLeads, currentExtractionId || '');
            } catch (error) {
              console.error('[LeadFlow] Failed to import final batch:', error);
            }
            pendingLeads = [];
          }

          // Complete extraction in Convex
          if (currentExtractionId) {
            try {
              await completeExtraction(
                currentExtractionId,
                message.summary.totalLeads,
                message.summary.creditsUsed
              );
            } catch {
              // Non-critical
            }
          }

          // Update badge
          chrome.action.setBadgeText({
            text: String(message.summary.totalLeads),
          });
          chrome.action.setBadgeBackgroundColor({ color: '#22c55e' });

          // Clear badge after 30 seconds
          setTimeout(() => {
            chrome.action.setBadgeText({ text: '' });
          }, 30000);

          currentExtractionId = undefined;
          sendResponse({ success: true });
          break;
        }

        case 'SAFE_MODE': {
          // Clear badge and state
          chrome.action.setBadgeText({ text: '!' });
          chrome.action.setBadgeBackgroundColor({ color: '#ef4444' });

          // Flush any pending leads
          if (pendingLeads.length > 0 && currentExtractionId) {
            try {
              await importLeads(pendingLeads, currentExtractionId);
            } catch {
              // Best effort
            }
            pendingLeads = [];
          }

          sendResponse({ success: true });
          break;
        }

        default:
          sendResponse({ error: 'Unknown message type' });
      }
    } catch (error) {
      console.error('[LeadFlow] Service worker error:', error);
      sendResponse({ error: String(error) });
    }
  }

  // ============================================
  // ALARM HANDLERS (for periodic tasks)
  // ============================================

  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'refresh-auth') {
      refreshAuth();
    }
  });

  async function refreshAuth(): Promise<void> {
    try {
      const session = await getUserSession();
      if (!session?.clerkToken) return;

      // Attempt to refresh the Clerk token by re-initializing the Convex client
      // with the existing token. If the token is expired, the next Convex call
      // will fail and the user will be prompted to re-authenticate via the popup.
      initConvexClient(CONVEX_URL);

      // Validate token is still working by making a lightweight query
      const balance = await checkCredits();
      if (balance) {
        console.log('[LeadFlow] Auth token still valid, credits:', balance.balance);
      }
    } catch (error) {
      console.warn('[LeadFlow] Auth token expired or invalid, user needs to re-authenticate:', error);
      // Clear the stored session so popup shows login
      await saveUserSession({ isAuthenticated: false });
    }
  }

  // Set up periodic auth refresh (every 15 minutes)
  chrome.alarms.create('refresh-auth', { periodInMinutes: 15 });

  // ============================================
  // INSTALLATION HANDLER
  // ============================================

  chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
      chrome.action.setBadgeText({ text: 'NEW' });
      chrome.action.setBadgeBackgroundColor({ color: '#6366f1' });

      setTimeout(() => {
        chrome.action.setBadgeText({ text: '' });
      }, 60000);
    }
  });
});
