import { useUser } from '@clerk/clerk-react';
import { useQuery } from 'convex/react';
import { Link } from 'react-router-dom';
import { UploadSimple, ArrowRight } from '@phosphor-icons/react';
import { api } from '../../convex/_generated/api';
import { useSyncedUser } from '../hooks/useSyncedUser';
import { useBatches } from '../hooks/useBatches';
import { usePolling } from '../hooks/usePolling';
import PageHeader from '../components/layout/PageHeader';
import StatusBanner from '../components/dashboard/StatusBanner';
import MetricCards from '../components/dashboard/MetricCards';
import BatchProgress from '../components/dashboard/BatchProgress';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import BatchHistory from '../components/dashboard/BatchHistory';

function DashboardPage() {
  const { user } = useUser();
  const syncedUser = useSyncedUser();
  const userId = syncedUser.convexId || undefined;

  // Polling to keep data fresh
  usePolling(30000);

  const { batches, activeBatch } = useBatches(userId);

  const activities = useQuery(
    api.activities.listRecent,
    userId ? { userId, limit: 15 } : 'skip'
  );

  // Compute display stats from active batch, or aggregate from all batches
  const displayStats = activeBatch
    ? activeBatch.stats
    : batches.reduce(
        (acc, b) => ({
          sent: acc.sent + b.stats.sent,
          accepted: acc.accepted + b.stats.accepted,
          replied: acc.replied + b.stats.replied,
          alreadyConnected: acc.alreadyConnected + b.stats.alreadyConnected,
          errors: acc.errors + b.stats.errors,
          pending: acc.pending + b.stats.pending,
        }),
        { sent: 0, accepted: 0, replied: 0, alreadyConnected: 0, errors: 0, pending: 0 }
      );

  const totalForMetrics = activeBatch
    ? activeBatch.totalLeads
    : displayStats.sent +
      displayStats.accepted +
      displayStats.replied +
      displayStats.alreadyConnected +
      displayStats.errors +
      displayStats.pending;

  const firstName = user?.firstName || 'there';

  // Loading state
  if (!syncedUser.isLoaded) {
    return (
      <div style={{ padding: 'var(--space-2xl)' }}>
        <div className="skeleton" style={{ width: 200, height: 28, marginBottom: 'var(--space-md)' }} />
        <div className="skeleton" style={{ width: 300, height: 16, marginBottom: 'var(--space-xl)' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-md)' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: 100, borderRadius: 'var(--radius-md)' }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 'var(--space-lg) var(--space-xl)', maxWidth: 1200 }}>
      <PageHeader
        title={`Welcome back, ${firstName}!`}
        subtitle="Here's your outreach at a glance."
        actions={
          <Link to="/dashboard/upload" className="btn btn-primary">
            <UploadSimple size={16} weight="bold" />
            Upload CSV
            <ArrowRight size={14} className="arrow" />
          </Link>
        }
      />

      {/* Status banner for active batch warnings */}
      {activeBatch && activeBatch.status !== 'running' && (
        <StatusBanner
          status={activeBatch.status}
          pauseReason={activeBatch.pauseReason}
          autoResumeAt={activeBatch.autoResumeAt}
          stats={activeBatch.stats}
          totalLeads={activeBatch.totalLeads}
        />
      )}

      {/* Active batch progress */}
      {activeBatch && (
        <BatchProgress batch={activeBatch} />
      )}

      {/* Metric cards */}
      <MetricCards stats={displayStats} total={totalForMetrics} />

      {/* Activity feed + batch history in a two-column layout */}
      <div
        className="dashboard-bottom-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.5fr',
          gap: 'var(--space-xl)',
        }}
      >
        <style>{`
          @media (max-width: 900px) {
            .dashboard-bottom-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
        <ActivityFeed activities={activities ?? []} />
        <BatchHistory batches={batches} />
      </div>
    </div>
  );
}

export default DashboardPage;
