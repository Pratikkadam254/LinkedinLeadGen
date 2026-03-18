import { useNavigate } from 'react-router-dom';
import { Doc } from '../../../convex/_generated/dataModel';

interface BatchHistoryProps {
  batches: Doc<"batches">[];
}

const statusStyles: Record<string, { bg: string; color: string; label: string }> = {
  running: { bg: '#EEF1FE', color: '#4F6BED', label: 'Running' },
  completed: { bg: '#E8F8F0', color: '#2D9D6F', label: 'Completed' },
  paused: { bg: '#FFF8E6', color: '#D4930D', label: 'Paused' },
  cancelled: { bg: '#F2F3F7', color: '#7B8196', label: 'Cancelled' },
  error_disconnected: { bg: '#FEF0F0', color: '#E04545', label: 'Disconnected' },
  draft: { bg: '#F2F3F7', color: '#7B8196', label: 'Draft' },
  daily_limit_reached: { bg: '#FFF8E6', color: '#D4930D', label: 'Daily Limit' },
  weekly_limit_reached: { bg: '#FFF8E6', color: '#D4930D', label: 'Weekly Limit' },
};

function BatchHistory({ batches }: BatchHistoryProps) {
  const navigate = useNavigate();

  if (batches.length === 0) {
    return (
      <div
        style={{
          background: 'var(--color-bg-primary)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-xl)',
          boxShadow: 'var(--shadow-card)',
          textAlign: 'center',
          color: 'var(--color-text-tertiary)',
        }}
      >
        <p style={{ fontSize: '0.875rem' }}>No batches yet. Upload a CSV to get started.</p>
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'var(--color-bg-primary)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-card)',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: 'var(--space-lg) var(--space-xl) var(--space-md)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Batch History</h3>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.8125rem',
          }}
        >
          <thead>
            <tr
              style={{
                borderTop: '1px solid var(--color-border-light)',
                borderBottom: '1px solid var(--color-border-light)',
              }}
            >
              <th style={thStyle}>File</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Sent / Total</th>
              <th style={thStyle}>Date</th>
            </tr>
          </thead>
          <tbody>
            {batches.map((batch) => {
              const st = statusStyles[batch.status] || statusStyles.draft;
              return (
                <tr
                  key={batch._id}
                  onClick={() => navigate(`/dashboard/batch/${batch._id}`)}
                  style={{
                    borderBottom: '1px solid var(--color-border-light)',
                    cursor: 'pointer',
                    transition: 'background var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = 'var(--color-bg-hover)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                  }}
                >
                  <td style={tdStyle}>
                    <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
                      {batch.fileName}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '2px 10px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: st.bg,
                        color: st.color,
                      }}
                    >
                      {st.label}
                    </span>
                  </td>
                  <td style={tdStyle} className="tabular-nums">
                    {batch.stats.sent}/{batch.totalLeads}
                  </td>
                  <td style={{ ...tdStyle, color: 'var(--color-text-tertiary)' }}>
                    {new Date(batch.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: 'var(--space-sm) var(--space-xl)',
  fontSize: '0.75rem',
  fontWeight: 600,
  color: 'var(--color-text-tertiary)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const tdStyle: React.CSSProperties = {
  padding: 'var(--space-md) var(--space-xl)',
  color: 'var(--color-text-secondary)',
};

export default BatchHistory;
