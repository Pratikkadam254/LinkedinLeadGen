/**
 * Content Script Entry Point (WXT entrypoint)
 *
 * Injected into LinkedIn Sales Navigator pages (https://www.linkedin.com/sales/*).
 * This is the primary worker — it stays alive as long as the tab is open.
 *
 * Responsibilities:
 * 1. Inject Voyager API interceptor into page's main world
 * 2. Inject the "Extract with LeadFlow" overlay UI
 * 3. Listen for extraction commands from service worker/popup
 * 4. Run the auto-scroll extraction engine
 * 5. Send extracted data to service worker for Convex storage
 * 6. Manage anti-detection (fingerprint, behavior, monitoring)
 */

import { injectVoyagerInterceptor, onVoyagerResponse } from '../core/voyager-interceptor';
import { parseVoyagerSearchResults, deduplicateLeads, mergeLeadData } from '../core/data-parser';
import { extractCurrentPageLeads, detectPageType, waitForSelector } from '../core/dom-scraper';
import { autoScrollExtraction, type ExtractionCallbacks } from '../core/auto-scroller';
import { startProbeMonitor, setupNavigationCleanup, cleanupInjectedElements } from '../anti-detection/fingerprint-guard';
import { startMouseSimulation } from '../anti-detection/behavior-simulator';
import { detectionMonitor } from '../anti-detection/detection-monitor';
import { requestScheduler } from '../anti-detection/request-scheduler';
import { SELECTORS, BATCH_SIZE } from '../shared/constants';
import type { ExtractedLead, ExtractionConfig, ExtractionProgress, ExtensionMessage } from '../shared/types';
import { injectOverlayUI, updateOverlayProgress, showOverlaySummary, removeOverlay } from '../content/injector';

export default defineContentScript({
  matches: ['https://www.linkedin.com/sales/*'],
  runAt: 'document_idle',

  main() {
    // ============================================
    // STATE
    // ============================================

    let isExtracting = false;
    let isPaused = false;
    let isCancelled = false;
    const voyagerLeadCache: Map<string, Partial<ExtractedLead>> = new Map();
    let cleanupFunctions: (() => void)[] = [];

    // ============================================
    // INITIALIZATION
    // ============================================

    async function initialize(): Promise<void> {
      const pageType = detectPageType();
      if (pageType === 'unknown') return;

      // 1. Initialize anti-detection
      await requestScheduler.initialize();
      cleanupFunctions.push(startProbeMonitor());
      cleanupFunctions.push(startMouseSimulation());
      cleanupFunctions.push(detectionMonitor.startMonitoring());
      setupNavigationCleanup();

      // 2. Inject Voyager API interceptor
      injectVoyagerInterceptor();

      // 3. Listen for Voyager responses and cache them
      const cleanupVoyager = onVoyagerResponse((url, data) => {
        if (url.includes('search') || url.includes('Lead')) {
          const leads = parseVoyagerSearchResults(data);
          leads.forEach((lead) => {
            const key = lead.linkedInUrl || `${lead.firstName}-${lead.lastName}`;
            voyagerLeadCache.set(key, lead);
          });
        }
      });
      cleanupFunctions.push(cleanupVoyager);

      // 4. Safe mode handler
      detectionMonitor.onSafeMode(() => {
        if (isExtracting) {
          isCancelled = true;
          removeOverlay();
        }
      });

      // 5. Wait for the page to fully load, then inject overlay UI
      await waitForSelector(SELECTORS.actionBar, { timeout: 10000 });
      injectOverlayUI(handleStartExtraction);

      // 6. Listen for messages from popup/service worker
      chrome.runtime.onMessage.addListener(handleMessage);
    }

    // ============================================
    // MESSAGE HANDLING
    // ============================================

    function handleMessage(
      message: ExtensionMessage,
      _sender: chrome.runtime.MessageSender,
      sendResponse: (response?: unknown) => void
    ): boolean {
      switch (message.type) {
        case 'START_EXTRACTION':
          handleStartExtraction(message.config);
          sendResponse({ success: true });
          break;

        case 'PAUSE_EXTRACTION':
          isPaused = true;
          sendResponse({ success: true });
          break;

        case 'RESUME_EXTRACTION':
          isPaused = false;
          sendResponse({ success: true });
          break;

        case 'CANCEL_EXTRACTION':
          isCancelled = true;
          sendResponse({ success: true });
          break;
      }

      return true; // Keep message channel open for async responses
    }

    // ============================================
    // EXTRACTION
    // ============================================

    async function handleStartExtraction(config?: ExtractionConfig): Promise<void> {
      if (isExtracting) return;

      // Check daily quota
      if (!requestScheduler.canExtract()) {
        chrome.runtime.sendMessage({
          type: 'EXTRACTION_PROGRESS',
          progress: {
            status: 'failed',
            currentPage: 0,
            totalPages: 0,
            leadsExtracted: 0,
            totalLeads: 0,
            creditsUsed: 0,
            error: 'Daily extraction limit reached. Try again tomorrow.',
          },
        } as ExtensionMessage);
        return;
      }

      // Default config
      const extractionConfig: ExtractionConfig = config || {
        maxLeads: Math.min(requestScheduler.getRemainingQuota(), 2500),
        searchUrl: window.location.href,
      };

      isExtracting = true;
      isPaused = false;
      isCancelled = false;
      voyagerLeadCache.clear();

      // Create extraction record in Convex
      try {
        await chrome.runtime.sendMessage({
          type: 'START_EXTRACTION',
          config: extractionConfig,
        });
      } catch {
        // Service worker might not be ready, continue anyway
      }

      const startTime = Date.now();

      // Set up callbacks
      const callbacks: ExtractionCallbacks = {
        onPageExtracted: (leads, page, totalPages) => {
          // Merge with Voyager API data if available
          const enrichedLeads = leads.map((domLead) => {
            const key = domLead.linkedInUrl || `${domLead.firstName}-${domLead.lastName}`;
            const apiLead = voyagerLeadCache.get(key);
            return apiLead ? mergeLeadData(apiLead, domLead) : domLead;
          });

          const uniqueLeads = deduplicateLeads(enrichedLeads);

          // Send batch to service worker
          chrome.runtime.sendMessage({
            type: 'LEADS_EXTRACTED',
            data: uniqueLeads,
            page,
            total: totalPages,
          } as ExtensionMessage);
        },

        onProgress: (progress) => {
          updateOverlayProgress(progress);

          chrome.runtime.sendMessage({
            type: 'EXTRACTION_PROGRESS',
            progress,
          } as ExtensionMessage);
        },

        onComplete: async (allLeads) => {
          isExtracting = false;

          await requestScheduler.recordExtraction(allLeads.length);

          showOverlaySummary({
            totalLeads: allLeads.length,
            creditsUsed: allLeads.length,
            duration: Date.now() - startTime,
            searchUrl: extractionConfig.searchUrl,
            dataQuality: {
              withCompanyData: allLeads.filter((l) => l.companyHeadcount).length,
              withConnectionData: allLeads.filter((l) => l.connectionDegree).length,
              withEngagementData: allLeads.filter((l) => l.followers).length,
            },
          });

          chrome.runtime.sendMessage({
            type: 'EXTRACTION_COMPLETE',
            summary: {
              totalLeads: allLeads.length,
              creditsUsed: allLeads.length,
              duration: Date.now() - startTime,
              searchUrl: extractionConfig.searchUrl,
              dataQuality: {
                withCompanyData: allLeads.filter((l) => l.companyHeadcount).length,
                withConnectionData: allLeads.filter((l) => l.connectionDegree).length,
                withEngagementData: allLeads.filter((l) => l.followers).length,
              },
            },
          } as ExtensionMessage);
        },

        onError: (error) => {
          isExtracting = false;
          console.error('[LeadFlow] Extraction error:', error);

          chrome.runtime.sendMessage({
            type: 'EXTRACTION_PROGRESS',
            progress: {
              status: 'failed',
              currentPage: 0,
              totalPages: 0,
              leadsExtracted: 0,
              totalLeads: 0,
              creditsUsed: 0,
              error: error.message,
            },
          } as ExtensionMessage);
        },

        shouldCancel: () => isCancelled || detectionMonitor.isActive(),
        shouldPause: () => isPaused,
      };

      // Start extraction
      await autoScrollExtraction(extractionConfig, callbacks);
    }

    // ============================================
    // CLEANUP
    // ============================================

    function cleanup(): void {
      cleanupFunctions.forEach((fn) => fn());
      cleanupFunctions = [];
      cleanupInjectedElements();
      chrome.runtime.onMessage.removeListener(handleMessage);
    }

    // Handle page unload
    window.addEventListener('beforeunload', cleanup);

    // Initialize when the content script loads
    initialize().catch(console.error);
  },
});
