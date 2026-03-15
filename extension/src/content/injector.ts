/**
 * Overlay UI Injector
 *
 * Injects the "Extract with LeadFlow" button and progress panel
 * into Sales Navigator pages using closed Shadow DOM for isolation.
 *
 * This replicates Evaboot's injected UI approach.
 */

import { SELECTORS } from '../shared/constants';
import type { ExtractedLead, ExtractionProgress, ExtractionSummary, ExtractionConfig } from '../shared/types';
import { downloadCSV, downloadQualifiedCSV } from '../core/csv-exporter';
import { getTotalResultCount } from '../core/dom-scraper';

let shadowRoot: ShadowRoot | null = null;
let lastExtractedLeads: ExtractedLead[] = [];
// Randomized host ID per session to avoid detection by static ID queries
const HOST_ID = `__el-${Math.random().toString(36).slice(2, 10)}`;

/**
 * Inject the overlay UI into Sales Navigator.
 */
export function injectOverlayUI(
  onExtract: (config?: ExtractionConfig) => void
): void {
  // Find the action bar to inject next to
  const actionBar = document.querySelector(SELECTORS.actionBar)
    || document.querySelector(SELECTORS.listActionBar);

  if (!actionBar) {
    // Retry after a short delay (SPA navigation)
    setTimeout(() => injectOverlayUI(onExtract), 2000);
    return;
  }

  // Don't inject twice
  if (document.getElementById(HOST_ID)) return;

  // Create shadow host
  const host = document.createElement('div');
  host.id = HOST_ID;
  host.setAttribute('data-lf-host', '');
  host.style.display = 'inline-flex';
  host.style.alignItems = 'center';
  host.style.marginLeft = '8px';

  // Use closed shadow DOM — harder for LinkedIn to detect
  shadowRoot = host.attachShadow({ mode: 'closed' });

  // Inject styles and button
  shadowRoot.innerHTML = `
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }

      .lf-extract-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 8px 16px;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        color: white;
        border: none;
        border-radius: 6px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: 0 2px 4px rgba(99, 102, 241, 0.3);
      }

      .lf-extract-btn:hover {
        background: linear-gradient(135deg, #4f46e5, #7c3aed);
        box-shadow: 0 4px 8px rgba(99, 102, 241, 0.4);
        transform: translateY(-1px);
      }

      .lf-extract-btn:active {
        transform: translateY(0);
      }

      .lf-extract-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
      }

      .lf-extract-btn svg {
        width: 16px;
        height: 16px;
      }

      .lf-progress-panel {
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 320px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        z-index: 10000;
        overflow: hidden;
      }

      .lf-progress-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        color: white;
      }

      .lf-progress-header h3 {
        font-size: 14px;
        font-weight: 600;
      }

      .lf-progress-body {
        padding: 16px;
      }

      .lf-progress-bar-container {
        width: 100%;
        height: 6px;
        background: #e5e7eb;
        border-radius: 3px;
        margin: 12px 0;
        overflow: hidden;
      }

      .lf-progress-bar {
        height: 100%;
        background: linear-gradient(90deg, #6366f1, #8b5cf6);
        border-radius: 3px;
        transition: width 0.3s ease;
      }

      .lf-stat {
        display: flex;
        justify-content: space-between;
        font-size: 13px;
        color: #4b5563;
        margin: 4px 0;
      }

      .lf-stat-value {
        font-weight: 600;
        color: #1f2937;
      }

      .lf-actions {
        display: flex;
        gap: 8px;
        margin-top: 12px;
      }

      .lf-btn-secondary {
        flex: 1;
        padding: 6px 12px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        background: white;
        color: #374151;
        font-size: 12px;
        cursor: pointer;
      }

      .lf-btn-secondary:hover {
        background: #f9fafb;
      }

      .lf-btn-danger {
        flex: 1;
        padding: 6px 12px;
        border: none;
        border-radius: 6px;
        background: #ef4444;
        color: white;
        font-size: 12px;
        cursor: pointer;
      }

      .lf-summary {
        text-align: center;
        padding: 8px 0;
      }

      .lf-summary-number {
        font-size: 32px;
        font-weight: 700;
        color: #6366f1;
      }

      .lf-summary-label {
        font-size: 13px;
        color: #6b7280;
        margin-top: 4px;
      }

      .lf-btn-primary-full {
        display: block;
        width: 100%;
        padding: 10px;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        margin-top: 12px;
      }

      .lf-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10001;
      }

      .lf-modal {
        background: white;
        border-radius: 12px;
        width: 400px;
        box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        overflow: hidden;
      }

      .lf-modal-header {
        padding: 16px 20px;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        color: white;
      }

      .lf-modal-header h3 {
        font-size: 16px;
        font-weight: 600;
        margin: 0;
      }

      .lf-modal-body {
        padding: 20px;
      }

      .lf-form-group {
        margin-bottom: 16px;
      }

      .lf-form-group label {
        display: block;
        font-size: 13px;
        font-weight: 600;
        color: #374151;
        margin-bottom: 6px;
      }

      .lf-form-group input[type="text"],
      .lf-form-group input[type="number"] {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-size: 13px;
        font-family: inherit;
        outline: none;
      }

      .lf-form-group input:focus {
        border-color: #6366f1;
        box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
      }

      .lf-range-row {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .lf-range-row input[type="range"] {
        flex: 1;
        accent-color: #6366f1;
      }

      .lf-range-row .lf-range-value {
        min-width: 50px;
        text-align: right;
        font-size: 14px;
        font-weight: 600;
        color: #1f2937;
      }

      .lf-credit-info {
        display: flex;
        justify-content: space-between;
        padding: 10px 14px;
        background: #f3f4f6;
        border-radius: 8px;
        font-size: 13px;
        color: #4b5563;
        margin-bottom: 16px;
      }

      .lf-credit-info .lf-credit-cost {
        font-weight: 600;
        color: #6366f1;
      }

      .lf-modal-actions {
        display: flex;
        gap: 8px;
      }

      .lf-modal-actions .lf-btn-cancel {
        flex: 1;
        padding: 10px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        background: white;
        color: #374151;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
      }

      .lf-modal-actions .lf-btn-cancel:hover {
        background: #f9fafb;
      }

      .lf-modal-actions .lf-btn-launch {
        flex: 2;
        padding: 10px;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
      }

      .lf-modal-actions .lf-btn-launch:hover {
        background: linear-gradient(135deg, #4f46e5, #7c3aed);
      }

      .lf-stat-qualified .lf-stat-value {
        color: #16a34a;
      }

      .lf-stat-unqualified .lf-stat-value {
        color: #dc2626;
      }

      .lf-hidden { display: none; }
    </style>

    <button class="lf-extract-btn" id="lf-extract-btn">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
      Extract with LeadFlow
    </button>

    <div class="lf-progress-panel lf-hidden" id="lf-progress-panel">
      <div class="lf-progress-header">
        <h3>Extracting Leads</h3>
        <span id="lf-progress-percent">0%</span>
      </div>
      <div class="lf-progress-body">
        <div class="lf-progress-bar-container">
          <div class="lf-progress-bar" id="lf-progress-bar" style="width: 0%"></div>
        </div>
        <div class="lf-stat">
          <span>Leads extracted</span>
          <span class="lf-stat-value" id="lf-leads-count">0</span>
        </div>
        <div class="lf-stat">
          <span>Page</span>
          <span class="lf-stat-value" id="lf-page-count">0 / 0</span>
        </div>
        <div class="lf-stat">
          <span>Time remaining</span>
          <span class="lf-stat-value" id="lf-time-remaining">Calculating...</span>
        </div>
        <div class="lf-actions">
          <button class="lf-btn-secondary" id="lf-pause-btn">Pause</button>
          <button class="lf-btn-danger" id="lf-cancel-btn">Cancel</button>
        </div>
      </div>
    </div>

    <div class="lf-progress-panel lf-hidden" id="lf-summary-panel">
      <div class="lf-progress-header">
        <h3>Extraction Complete</h3>
        <span>&#10003;</span>
      </div>
      <div class="lf-progress-body">
        <div class="lf-summary">
          <div class="lf-summary-number" id="lf-summary-total">0</div>
          <div class="lf-summary-label">leads extracted</div>
        </div>
        <div class="lf-stat">
          <span>Credits used</span>
          <span class="lf-stat-value" id="lf-summary-credits">0</span>
        </div>
        <div class="lf-stat">
          <span>With company data</span>
          <span class="lf-stat-value" id="lf-summary-company">0</span>
        </div>
        <div class="lf-stat">
          <span>With connection data</span>
          <span class="lf-stat-value" id="lf-summary-connection">0</span>
        </div>
        <div class="lf-stat lf-stat-qualified">
          <span>Qualified</span>
          <span class="lf-stat-value" id="lf-summary-qualified">0</span>
        </div>
        <div class="lf-stat lf-stat-unqualified">
          <span>Unqualified</span>
          <span class="lf-stat-value" id="lf-summary-unqualified">0</span>
        </div>
        <button class="lf-btn-primary-full" id="lf-view-dashboard">
          View in Dashboard
        </button>
        <button class="lf-btn-secondary" id="lf-download-csv" style="width:100%;margin-top:8px;">
          Download CSV
        </button>
        <button class="lf-btn-secondary" id="lf-download-qualified-csv" style="width:100%;margin-top:8px;">
          Download Qualified Only
        </button>
      </div>
    </div>

    <div class="lf-modal-overlay lf-hidden" id="lf-config-modal">
      <div class="lf-modal">
        <div class="lf-modal-header">
          <h3>Configure Extraction</h3>
        </div>
        <div class="lf-modal-body">
          <div class="lf-form-group">
            <label for="lf-extraction-name">Extraction Name</label>
            <input type="text" id="lf-extraction-name" value="" />
          </div>
          <div class="lf-form-group">
            <label>Lead Count</label>
            <div class="lf-range-row">
              <input type="range" id="lf-lead-count-slider" min="25" max="2500" value="100" step="25" />
              <span class="lf-range-value" id="lf-lead-count-display">100</span>
            </div>
            <div style="font-size:11px;color:#6b7280;margin-top:4px;">
              Available: <span id="lf-available-leads">--</span> leads
            </div>
          </div>
          <div class="lf-credit-info">
            <span>Credit cost</span>
            <span class="lf-credit-cost" id="lf-credit-cost">100 credits</span>
          </div>
          <div class="lf-modal-actions">
            <button class="lf-btn-cancel" id="lf-config-cancel">Cancel</button>
            <button class="lf-btn-launch" id="lf-config-launch">Launch Extraction</button>
          </div>
        </div>
      </div>
    </div>
  `;

  actionBar.appendChild(host);

  // Event listeners
  const extractBtn = shadowRoot.getElementById('lf-extract-btn');
  const pauseBtn = shadowRoot.getElementById('lf-pause-btn');
  const cancelBtn = shadowRoot.getElementById('lf-cancel-btn');
  const viewDashboardBtn = shadowRoot.getElementById('lf-view-dashboard');

  const configModal = shadowRoot.getElementById('lf-config-modal');
  const extractionNameInput = shadowRoot.getElementById('lf-extraction-name') as HTMLInputElement;
  const leadCountSlider = shadowRoot.getElementById('lf-lead-count-slider') as HTMLInputElement;
  const leadCountDisplay = shadowRoot.getElementById('lf-lead-count-display');
  const creditCostDisplay = shadowRoot.getElementById('lf-credit-cost');
  const availableLeadsDisplay = shadowRoot.getElementById('lf-available-leads');
  const configCancelBtn = shadowRoot.getElementById('lf-config-cancel');
  const configLaunchBtn = shadowRoot.getElementById('lf-config-launch');

  extractBtn?.addEventListener('click', () => {
    // Set default extraction name
    const dateStr = new Date().toISOString().slice(0, 10);
    if (extractionNameInput) extractionNameInput.value = `Extraction ${dateStr}`;

    // Set available leads count
    const totalResults = getTotalResultCount();
    if (availableLeadsDisplay) {
      availableLeadsDisplay.textContent = totalResults !== null ? String(totalResults) : '--';
    }

    // Reset slider
    if (leadCountSlider) leadCountSlider.value = '100';
    if (leadCountDisplay) leadCountDisplay.textContent = '100';
    if (creditCostDisplay) creditCostDisplay.textContent = '100 credits';

    // Show modal
    if (configModal) configModal.classList.remove('lf-hidden');
  });

  leadCountSlider?.addEventListener('input', () => {
    const val = leadCountSlider.value;
    if (leadCountDisplay) leadCountDisplay.textContent = val;
    if (creditCostDisplay) creditCostDisplay.textContent = `${val} credits`;
  });

  configCancelBtn?.addEventListener('click', () => {
    if (configModal) configModal.classList.add('lf-hidden');
  });

  configLaunchBtn?.addEventListener('click', () => {
    const config: ExtractionConfig = {
      name: extractionNameInput?.value || undefined,
      maxLeads: parseInt(leadCountSlider?.value || '100', 10),
      searchUrl: window.location.href,
    };
    if (configModal) configModal.classList.add('lf-hidden');
    onExtract(config);
  });

  pauseBtn?.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'PAUSE_EXTRACTION' });
    if (pauseBtn.textContent === 'Pause') {
      pauseBtn.textContent = 'Resume';
    } else {
      pauseBtn.textContent = 'Pause';
      chrome.runtime.sendMessage({ type: 'RESUME_EXTRACTION' });
    }
  });

  cancelBtn?.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'CANCEL_EXTRACTION' });
  });

  viewDashboardBtn?.addEventListener('click', () => {
    window.open('https://leadflow-ai.vercel.app/dashboard/leads', '_blank');
  });

  const downloadCsvBtn = shadowRoot.getElementById('lf-download-csv');
  downloadCsvBtn?.addEventListener('click', () => {
    if (lastExtractedLeads.length > 0) {
      downloadCSV(lastExtractedLeads);
    }
  });

  const downloadQualifiedCsvBtn = shadowRoot.getElementById('lf-download-qualified-csv');
  downloadQualifiedCsvBtn?.addEventListener('click', () => {
    if (lastExtractedLeads.length > 0) {
      downloadQualifiedCSV(lastExtractedLeads);
    }
  });
}

/**
 * Update the progress panel with extraction progress.
 */
export function updateOverlayProgress(progress: ExtractionProgress): void {
  if (!shadowRoot) return;

  const panel = shadowRoot.getElementById('lf-progress-panel');
  const summaryPanel = shadowRoot.getElementById('lf-summary-panel');
  const extractBtn = shadowRoot.getElementById('lf-extract-btn') as HTMLButtonElement;

  if (panel) panel.classList.remove('lf-hidden');
  if (summaryPanel) summaryPanel.classList.add('lf-hidden');
  if (extractBtn) extractBtn.disabled = true;

  const percent = progress.totalLeads > 0
    ? Math.round((progress.leadsExtracted / progress.totalLeads) * 100)
    : 0;

  const bar = shadowRoot.getElementById('lf-progress-bar');
  const percentEl = shadowRoot.getElementById('lf-progress-percent');
  const leadsCount = shadowRoot.getElementById('lf-leads-count');
  const pageCount = shadowRoot.getElementById('lf-page-count');
  const timeRemaining = shadowRoot.getElementById('lf-time-remaining');

  if (bar) bar.style.width = `${percent}%`;
  if (percentEl) percentEl.textContent = `${percent}%`;
  if (leadsCount) leadsCount.textContent = String(progress.leadsExtracted);
  if (pageCount) pageCount.textContent = `${progress.currentPage} / ${progress.totalPages}`;

  if (timeRemaining && progress.estimatedTimeRemaining) {
    const minutes = Math.ceil(progress.estimatedTimeRemaining / 60000);
    timeRemaining.textContent = minutes > 1 ? `~${minutes} min` : '<1 min';
  }
}

/**
 * Show the extraction summary panel.
 */
export function showOverlaySummary(summary: ExtractionSummary, leads?: ExtractedLead[]): void {
  if (leads) lastExtractedLeads = leads;
  if (!shadowRoot) return;

  const panel = shadowRoot.getElementById('lf-progress-panel');
  const summaryPanel = shadowRoot.getElementById('lf-summary-panel');
  const extractBtn = shadowRoot.getElementById('lf-extract-btn') as HTMLButtonElement;

  if (panel) panel.classList.add('lf-hidden');
  if (summaryPanel) summaryPanel.classList.remove('lf-hidden');
  if (extractBtn) extractBtn.disabled = false;

  const totalEl = shadowRoot.getElementById('lf-summary-total');
  const creditsEl = shadowRoot.getElementById('lf-summary-credits');
  const companyEl = shadowRoot.getElementById('lf-summary-company');
  const connectionEl = shadowRoot.getElementById('lf-summary-connection');

  if (totalEl) totalEl.textContent = String(summary.totalLeads);
  if (creditsEl) creditsEl.textContent = String(summary.creditsUsed);
  if (companyEl) companyEl.textContent = String(summary.dataQuality.withCompanyData);
  if (connectionEl) connectionEl.textContent = String(summary.dataQuality.withConnectionData);

  const qualifiedEl = shadowRoot.getElementById('lf-summary-qualified');
  const unqualifiedEl = shadowRoot.getElementById('lf-summary-unqualified');
  if (qualifiedEl) qualifiedEl.textContent = String(summary.matchedLeads);
  if (unqualifiedEl) unqualifiedEl.textContent = String(summary.unmatchedLeads);
}

/**
 * Remove the overlay completely.
 */
export function removeOverlay(): void {
  const host = document.getElementById(HOST_ID);
  if (host) host.remove();
  shadowRoot = null;
}
