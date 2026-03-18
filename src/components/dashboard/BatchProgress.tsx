import { Pause, Play, X } from '@phosphor-icons/react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Doc } from '../../../convex/_generated/dataModel';

interface BatchProgressProps {
  batch: Doc<"batches">;
}

function BatchProgress({ batch }: BatchProgressProps) {
  const pauseBatch = useMutation(api.batches.pause);
  const resumeBatch = useMutation(api.batches.resume);
  const cancelBatch = useMutation(api.batches.cancel);

  const { stats, totalLeads, rateTier, weeklySentCount, estimatedCompletion, status } = batch;
  const processed = stats.sent + stats.errors + stats.alreadyConnected;
  const progressPct = totalLeads > 0 ? Math.round((processed / totalLeads) * 100) : 0;

  const tierLabel =
    rateTier === 'conservative' ? 'Conservative' : rateTier === 'normal' ? 'Normal' : 'Aggressive';

  const estimatedDate = estimatedCompletion
    ? new Date(estimatedCompletion).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : 'Calculating...';

  const isRunning = status === 'running';
  const isPaused = status === 'paused' || status === 'daily_limit_reached' || status === 'weekly_limit_reached';
  const canControl = isRunning || isPaused;

  return (
    <div
      className="animate-fade-in-up"
      style={{
        background: 'var(--color-bg-primary)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-xl)',
        boxShadow: 'var(--shadow-card)',
        marginBottom: 'var(--space-xl)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--space-lg)',
        }}
      >
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--space-xs)' }}>
            Active Batch
          </h3>
          <span
            style={{
              fontSize: '0.8125rem',
              color: 'var(--color-text-secondary)',
            }}
          >
            {batch.fileName}
          </span>
        </div>
        {canControl && (
          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            {isRunning ? (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => pauseBatch({ batchId: batch._id, reason: 'user_paused' })}
              >
                <Pause size={14} weight="bold" /> Pause
              </button>
            ) : (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => resumeBatch({ batchId: batch._id })}
              >
                <Play size={14} weight="bold" /> Resume
              </button>
            )}
            <button
              className="btn btn-danger btn-sm"
              onClick={() => {
                if (window.confirm('Cancel this batch? Pending leads will not be sent.')) {
                  cancelBatch({ batchId: batch._id });
                }
              }}
            >
              <X size={14} weight="bold" /> Cancel
            </button>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 'var(--space-md)' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 'var(--space-sm)',
          }}
        >
          <span
            className="tabular-nums"
            style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)' }}
          >
            {progressPct}%
          </span>
          <span
            className="tabular-nums"
            style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}
          >
            {processed}/{totalLeads} processed
          </span>
        </div>
        <div
          style={{
            height: 8,
            borderRadius: 'var(--radius-full)',
            background: 'var(--color-bg-tertiary)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progressPct}%`,
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(90deg, var(--color-primary), var(--color-primary-light))',
              transition: 'width var(--transition-slow)',
            }}
          />
        </div>
      </div>

      {/* Info row */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--space-xl)',
          flexWrap: 'wrap',
        }}
      >
        <InfoItem label="Est. completion" value={estimatedDate} />
        <InfoItem label="Rate tier" value={tierLabel} />
        <InfoItem label="This week" value={`${weeklySentCount}/200 used`} />
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginBottom: 2 }}>
        {label}
      </div>
      <div
        className="tabular-nums"
        style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)' }}
      >
        {value}
      </div>
    </div>
  );
}

export default BatchProgress;
