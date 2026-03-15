import React, { useState, useEffect } from 'react';
import type { UserSession, CreditBalance, ExtractionProgress } from '../../shared/types';
import { CREDIT_PLANS } from '../../shared/constants';

export default function App() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [credits, setCredits] = useState<CreditBalance | null>(null);
  const [progress, setProgress] = useState<ExtractionProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch auth state from service worker
    chrome.runtime.sendMessage({ type: 'GET_AUTH_STATE' }, (response) => {
      if (chrome.runtime.lastError) {
        setError('Failed to connect to extension service worker.');
        setLoading(false);
        return;
      }
      if (response?.session) {
        setSession(response.session);
      }
      setLoading(false);
    });

    // Fetch credit balance
    chrome.runtime.sendMessage({ type: 'CHECK_CREDITS' }, (response) => {
      if (chrome.runtime.lastError) {
        setError('Failed to fetch credit balance.');
        return;
      }
      if (response?.error) {
        setError(response.error);
        return;
      }
      if (response?.balance) {
        setCredits(response.balance);
      }
    });

    // Listen for extraction progress updates and errors
    const listener = (message: { type: string; progress?: ExtractionProgress; error?: string }) => {
      if (message.type === 'EXTRACTION_PROGRESS' && message.progress) {
        setProgress(message.progress);
      }
      if (message.type === 'EXTRACTION_ERROR' && message.error) {
        setError(message.error);
      }
    };

    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.logo}>LeadFlow AI</h1>
        </div>
        <div style={styles.body}>
          <p style={styles.loadingText}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!session?.isAuthenticated) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.logo}>LeadFlow AI</h1>
          <p style={styles.subtitle}>Sales Navigator Lead Extractor</p>
        </div>
        <div style={styles.body}>
          <p style={styles.description}>
            Extract leads from LinkedIn Sales Navigator with one click.
            Connect your LeadFlow account to get started.
          </p>
          <button
            style={styles.primaryButton}
            onClick={handleLogin}
          >
            Connect Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.logo}>LeadFlow AI</h1>
        <span style={styles.badge}>Connected</span>
      </div>

      <div style={styles.body}>
        {/* Error Banner */}
        {error && (
          <div style={styles.errorBanner}>
            <span>{error}</span>
            <button style={styles.errorDismiss} onClick={() => setError(null)}>×</button>
          </div>
        )}

        {/* Credit Balance */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardTitle}>Credits</span>
            <span style={styles.planBadge}>
              {CREDIT_PLANS[credits?.plan || 'free'].label}
            </span>
          </div>
          <div style={styles.creditDisplay}>
            <span style={styles.creditNumber}>{credits?.balance || 0}</span>
            <span style={styles.creditLabel}>
              / {credits?.monthlyAllocation || 100} this month
            </span>
          </div>
        </div>

        {/* Extraction Progress */}
        {progress && progress.status === 'extracting' && (
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.cardTitle}>Extracting...</span>
              <span style={styles.progressPercent}>
                {Math.round((progress.leadsExtracted / progress.totalLeads) * 100)}%
              </span>
            </div>
            <div style={styles.progressBarContainer}>
              <div
                style={{
                  ...styles.progressBar,
                  width: `${(progress.leadsExtracted / progress.totalLeads) * 100}%`,
                }}
              />
            </div>
            <p style={styles.progressText}>
              {progress.leadsExtracted} of {progress.totalLeads} leads
            </p>
          </div>
        )}

        {/* Quick Actions */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>Quick Actions</div>
          <button
            style={styles.actionButton}
            onClick={() => window.open('https://leadflow-ai.vercel.app/dashboard/leads', '_blank')}
          >
            View Dashboard
          </button>
          <button
            style={styles.actionButton}
            onClick={() => window.open('https://www.linkedin.com/sales/', '_blank')}
          >
            Open Sales Navigator
          </button>
        </div>

        {/* Logout */}
        <button style={styles.logoutButton} onClick={handleLogout}>
          Disconnect Account
        </button>
      </div>
    </div>
  );
}

async function handleLogin() {
  const loginUrl = 'https://leadflow-ai.vercel.app/sign-in?redirect_url=chrome-extension-callback';
  chrome.tabs.create({ url: loginUrl });
}

async function handleLogout() {
  await chrome.runtime.sendMessage({
    type: 'AUTH_STATE',
    data: { isAuthenticated: false },
  });
  window.close();
}

// ============================================
// STYLES
// ============================================

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '400px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: 'white',
  },
  logo: {
    fontSize: '18px',
    fontWeight: '700',
    margin: 0,
  },
  subtitle: {
    fontSize: '12px',
    opacity: 0.9,
    marginTop: '4px',
  },
  badge: {
    fontSize: '11px',
    padding: '2px 8px',
    background: 'rgba(255,255,255,0.2)',
    borderRadius: '12px',
  },
  body: {
    padding: '16px 20px',
    flex: 1,
  },
  description: {
    fontSize: '13px',
    color: '#6b7280',
    lineHeight: '1.5',
    marginBottom: '16px',
  },
  loadingText: {
    textAlign: 'center' as const,
    color: '#9ca3af',
    padding: '40px 0',
  },
  primaryButton: {
    display: 'block',
    width: '100%',
    padding: '12px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  card: {
    background: 'white',
    borderRadius: '8px',
    padding: '14px',
    marginBottom: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  cardTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
  },
  planBadge: {
    fontSize: '11px',
    padding: '2px 8px',
    background: '#e0e7ff',
    color: '#4338ca',
    borderRadius: '12px',
    fontWeight: '500',
  },
  creditDisplay: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '4px',
  },
  creditNumber: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#6366f1',
  },
  creditLabel: {
    fontSize: '12px',
    color: '#9ca3af',
  },
  progressBarContainer: {
    width: '100%',
    height: '4px',
    background: '#e5e7eb',
    borderRadius: '2px',
    overflow: 'hidden',
    marginBottom: '8px',
  },
  progressBar: {
    height: '100%',
    background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
    borderRadius: '2px',
    transition: 'width 0.3s ease',
  },
  progressPercent: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#6366f1',
  },
  progressText: {
    fontSize: '12px',
    color: '#6b7280',
    margin: 0,
  },
  actionButton: {
    display: 'block',
    width: '100%',
    padding: '8px 12px',
    marginTop: '8px',
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    fontSize: '12px',
    color: '#374151',
    cursor: 'pointer',
    textAlign: 'left' as const,
  },
  logoutButton: {
    display: 'block',
    width: '100%',
    padding: '8px',
    background: 'transparent',
    border: 'none',
    color: '#9ca3af',
    fontSize: '12px',
    cursor: 'pointer',
    marginTop: '8px',
  },
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 12px',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    marginBottom: '12px',
    fontSize: '12px',
    color: '#dc2626',
    lineHeight: '1.4',
  },
  errorDismiss: {
    background: 'none',
    border: 'none',
    color: '#dc2626',
    fontSize: '16px',
    cursor: 'pointer',
    padding: '0 0 0 8px',
    flexShrink: 0,
  },
};
