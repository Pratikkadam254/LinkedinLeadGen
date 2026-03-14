/**
 * Fingerprint Guard
 *
 * Minimizes the extension's detectable fingerprint.
 * LinkedIn checks for 2,953+ known browser extensions by probing
 * chrome-extension:// URLs. We counter this by:
 * 1. Having zero web_accessible_resources
 * 2. Using closed Shadow DOM for all injected UI
 * 3. Cleaning up all DOM artifacts on navigation
 * 4. Monitoring for extension probing attempts
 */

/**
 * Remove all LeadFlow-injected elements from the DOM.
 * Called on page navigation and when entering safe mode.
 */
export function cleanupInjectedElements(): void {
  // Remove extract button host
  const extractHost = document.getElementById('__lf-extract-host');
  if (extractHost) extractHost.remove();

  // Remove progress panel host
  const progressHost = document.getElementById('__lf-progress-host');
  if (progressHost) progressHost.remove();

  // Remove results summary host
  const summaryHost = document.getElementById('__lf-summary-host');
  if (summaryHost) summaryHost.remove();

  // Remove any injected scripts (should already be removed, but just in case)
  document.querySelectorAll('script[data-lf]').forEach((el) => el.remove());
}

/**
 * Check if the page is trying to detect our extension.
 * LinkedIn probes for known extensions by loading their web_accessible_resources.
 */
export function startProbeMonitor(): () => void {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.name.includes('chrome-extension://')) {
        console.warn('[LeadFlow] Extension probe detected:', entry.name);
        // Trigger safe mode via service worker
        chrome.runtime.sendMessage({ type: 'SAFE_MODE' });
      }
    }
  });

  try {
    observer.observe({ entryTypes: ['resource'] });
  } catch {
    // PerformanceObserver not available in this context
  }

  return () => observer.disconnect();
}

/**
 * Ensure no global variables are leaked to the page context.
 * Content scripts run in an isolated world, but injected main-world
 * scripts could accidentally leave traces.
 */
export function verifyNoGlobalLeaks(): boolean {
  // These should NOT exist on window
  const suspiciousGlobals = [
    '__leadflow',
    '__lf_config',
    '__lf_state',
    'LeadFlowExtension',
    'leadflowData',
  ];

  for (const name of suspiciousGlobals) {
    if ((window as Record<string, unknown>)[name] !== undefined) {
      console.error(`[LeadFlow] LEAK DETECTED: window.${name} exists!`);
      delete (window as Record<string, unknown>)[name];
      return false;
    }
  }

  return true;
}

/**
 * Set up navigation cleanup — remove all traces when leaving Sales Navigator.
 */
export function setupNavigationCleanup(): void {
  // Clean up on page unload
  window.addEventListener('beforeunload', cleanupInjectedElements);

  // Watch for SPA navigation (LinkedIn is a SPA)
  let lastPath = window.location.pathname;

  const navigationObserver = new MutationObserver(() => {
    const currentPath = window.location.pathname;
    if (currentPath !== lastPath) {
      lastPath = currentPath;

      // If navigating away from Sales Navigator, clean up
      if (!currentPath.startsWith('/sales/')) {
        cleanupInjectedElements();
      }
    }
  });

  navigationObserver.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}
