import {
  PaperPlaneTilt,
  UserCheck,
  ChatCircle,
  WarningCircle,
  Pause,
  Play,
  X,
  CheckCircle,
  WifiSlash,
  LinkSimple,
  Warning,
  Rocket,
  Plus,
} from '@phosphor-icons/react';
import { Doc } from '../../../convex/_generated/dataModel';

type Activity = Doc<"activities">;

interface ActivityFeedProps {
  activities: Activity[];
}

const typeConfig: Record<
  string,
  { icon: React.ReactNode; color: string; bg: string; label: (meta?: any) => string }
> = {
  connection_sent: {
    icon: <PaperPlaneTilt size={16} weight="bold" />,
    color: '#4F6BED',
    bg: '#EEF1FE',
    label: (meta) =>
      `Connection sent to ${meta?.leadName || 'a lead'}`,
  },
  connection_accepted: {
    icon: <UserCheck size={16} weight="bold" />,
    color: '#2D9D6F',
    bg: '#E8F8F0',
    label: (meta) =>
      `${meta?.leadName || 'A lead'} accepted your connection`,
  },
  reply_received: {
    icon: <ChatCircle size={16} weight="bold" />,
    color: '#7C5CFC',
    bg: '#F0ECFF',
    label: (meta) =>
      `${meta?.leadName || 'A lead'} replied`,
  },
  error: {
    icon: <WarningCircle size={16} weight="bold" />,
    color: '#E04545',
    bg: '#FEF0F0',
    label: (meta) =>
      `Error: ${meta?.message || 'Unknown error'}`,
  },
  batch_paused: {
    icon: <Pause size={16} weight="bold" />,
    color: '#D4930D',
    bg: '#FFF8E6',
    label: () => 'Batch paused',
  },
  batch_resumed: {
    icon: <Play size={16} weight="bold" />,
    color: '#2D9D6F',
    bg: '#E8F8F0',
    label: () => 'Batch resumed',
  },
  batch_cancelled: {
    icon: <X size={16} weight="bold" />,
    color: '#7B8196',
    bg: '#F2F3F7',
    label: () => 'Batch cancelled',
  },
  batch_completed: {
    icon: <CheckCircle size={16} weight="bold" />,
    color: '#2D9D6F',
    bg: '#E8F8F0',
    label: () => 'Batch completed',
  },
  batch_created: {
    icon: <Plus size={16} weight="bold" />,
    color: '#4F6BED',
    bg: '#EEF1FE',
    label: (meta) => `New batch created${meta?.fileName ? `: ${meta.fileName}` : ''}`,
  },
  outreach_started: {
    icon: <Rocket size={16} weight="bold" />,
    color: '#4F6BED',
    bg: '#EEF1FE',
    label: () => 'Outreach started',
  },
  linkedin_disconnected: {
    icon: <WifiSlash size={16} weight="bold" />,
    color: '#E04545',
    bg: '#FEF0F0',
    label: () => 'LinkedIn disconnected',
  },
  linkedin_reconnected: {
    icon: <LinkSimple size={16} weight="bold" />,
    color: '#2D9D6F',
    bg: '#E8F8F0',
    label: () => 'LinkedIn reconnected',
  },
  rate_limit_hit: {
    icon: <Warning size={16} weight="bold" />,
    color: '#D4930D',
    bg: '#FFF8E6',
    label: () => 'Rate limit reached',
  },
  weekly_limit_warning: {
    icon: <Warning size={16} weight="bold" />,
    color: '#D4930D',
    bg: '#FFF8E6',
    label: () => 'Approaching weekly limit',
  },
};

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function ActivityFeed({ activities }: ActivityFeedProps) {
  const items = activities.slice(0, 15);

  if (items.length === 0) {
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
        <p style={{ fontSize: '0.875rem' }}>No recent activity yet.</p>
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'var(--color-bg-primary)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-xl)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--space-lg)' }}>
        Recent Activity
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
        {items.map((activity) => {
          const cfg = typeConfig[activity.type] || {
            icon: <WarningCircle size={16} />,
            color: '#7B8196',
            bg: '#F2F3F7',
            label: () => activity.type,
          };
          return (
            <div
              key={activity._id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-md)',
                padding: 'var(--space-sm) var(--space-sm)',
                borderRadius: 'var(--radius-sm)',
                transition: 'background var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'var(--color-bg-hover)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 'var(--radius-sm)',
                  background: cfg.bg,
                  color: cfg.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {cfg.icon}
              </div>
              <span
                style={{
                  flex: 1,
                  fontSize: '0.8125rem',
                  color: 'var(--color-text-primary)',
                }}
              >
                {cfg.label(activity.metadata)}
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--color-text-tertiary)',
                  flexShrink: 0,
                  whiteSpace: 'nowrap',
                }}
              >
                {relativeTime(activity.createdAt)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ActivityFeed;
