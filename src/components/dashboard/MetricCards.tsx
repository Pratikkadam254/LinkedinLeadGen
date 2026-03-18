import {
  PaperPlaneTilt,
  UserCheck,
  ChatCircle,
  UsersThree,
  WarningCircle,
  Clock,
} from '@phosphor-icons/react';

interface MetricCardsProps {
  stats: {
    sent: number;
    accepted: number;
    replied: number;
    alreadyConnected: number;
    errors: number;
    pending: number;
  };
  total: number;
}

function MetricCards({ stats, total }: MetricCardsProps) {
  const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);

  const cards = [
    {
      label: 'Sent',
      value: stats.sent,
      percent: pct(stats.sent),
      icon: <PaperPlaneTilt size={20} weight="duotone" />,
      color: '#4F6BED',
      bg: '#EEF1FE',
    },
    {
      label: 'Accepted',
      value: stats.accepted,
      percent: pct(stats.accepted),
      icon: <UserCheck size={20} weight="duotone" />,
      color: '#2D9D6F',
      bg: '#E8F8F0',
    },
    {
      label: 'Replies',
      value: stats.replied,
      percent: pct(stats.replied),
      icon: <ChatCircle size={20} weight="duotone" />,
      color: '#7C5CFC',
      bg: '#F0ECFF',
    },
    {
      label: 'Already Connected',
      value: stats.alreadyConnected,
      percent: pct(stats.alreadyConnected),
      icon: <UsersThree size={20} weight="duotone" />,
      color: '#D4930D',
      bg: '#FFF8E6',
    },
    {
      label: 'Errors',
      value: stats.errors,
      percent: pct(stats.errors),
      icon: <WarningCircle size={20} weight="duotone" />,
      color: '#E04545',
      bg: '#FEF0F0',
    },
    {
      label: 'Pending',
      value: stats.pending,
      percent: pct(stats.pending),
      icon: <Clock size={20} weight="duotone" />,
      color: '#7B8196',
      bg: '#F2F3F7',
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: 'var(--space-md)',
        marginBottom: 'var(--space-xl)',
      }}
      className="animate-fade-in-up animation-delay-1 metric-cards-grid"
    >
      <style>{`
        .metric-card:hover {
          box-shadow: var(--shadow-card-hover) !important;
          transform: translateY(-2px);
        }
        @media (max-width: 1200px) { .metric-cards-grid { grid-template-columns: repeat(3, 1fr) !important; } }
        @media (max-width: 768px) { .metric-cards-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 480px) { .metric-cards-grid { grid-template-columns: 1fr !important; } }
      `}</style>
      {cards.map((card) => (
        <div
          key={card.label}
          className="metric-card"
          style={{
            background: 'var(--color-bg-primary)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-lg)',
            boxShadow: 'var(--shadow-card)',
            transition: 'box-shadow var(--transition-base), transform var(--transition-base)',
            cursor: 'default',
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-sm)',
              background: card.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: card.color,
              marginBottom: 'var(--space-md)',
            }}
          >
            {card.icon}
          </div>
          <div
            className="tabular-nums"
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              lineHeight: 1.2,
            }}
          >
            {card.value}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 'var(--space-xs)',
            }}
          >
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
              {card.label}
            </span>
            <span
              className="tabular-nums"
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: card.color,
                background: card.bg,
                padding: '2px 6px',
                borderRadius: 'var(--radius-xs)',
              }}
            >
              {card.percent}%
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default MetricCards;
