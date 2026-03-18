import { Warning, WifiSlash, Clock, CheckCircle, ArrowRight } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';

interface StatusBannerProps {
  status: string;
  pauseReason?: string;
  autoResumeAt?: number;
  stats?: { sent: number; pending: number; errors: number; alreadyConnected: number };
  totalLeads?: number;
}

function StatusBanner({ status, pauseReason, autoResumeAt, stats, totalLeads }: StatusBannerProps) {
  if (status === 'running') return null;

  const config = getBannerConfig(status, pauseReason, autoResumeAt, stats, totalLeads);
  if (!config) return null;

  return (
    <div
      className="animate-fade-in-up"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-md)',
        padding: 'var(--space-md) var(--space-lg)',
        borderRadius: 'var(--radius-md)',
        background: config.bg,
        border: `1px solid ${config.border}`,
        marginBottom: 'var(--space-lg)',
      }}
    >
      <span style={{ color: config.iconColor, flexShrink: 0, display: 'flex' }}>
        {config.icon}
      </span>
      <span style={{ flex: 1, color: config.textColor, fontSize: '0.875rem', fontWeight: 500 }}>
        {config.message}
      </span>
      {config.action && (
        <Link
          to={config.action.to}
          className="btn btn-sm"
          style={{
            background: config.iconColor,
            color: '#fff',
            flexShrink: 0,
            textDecoration: 'none',
          }}
        >
          {config.action.label} <ArrowRight size={14} />
        </Link>
      )}
    </div>
  );
}

function getBannerConfig(
  status: string,
  pauseReason?: string,
  autoResumeAt?: number,
  stats?: { sent: number; pending: number; errors: number; alreadyConnected: number },
  totalLeads?: number,
) {
  if (status === 'error_disconnected') {
    return {
      bg: 'var(--color-error-light)',
      border: 'rgba(224, 69, 69, 0.2)',
      iconColor: 'var(--color-error)',
      textColor: 'var(--color-text-primary)',
      icon: <WifiSlash size={20} weight="bold" />,
      message: 'LinkedIn Disconnected — Outreach paused.',
      action: { label: 'Reconnect Now', to: '/dashboard/connect' },
    };
  }

  if (status === 'paused' && pauseReason === 'rate_limited') {
    const minutesLeft = autoResumeAt
      ? Math.max(0, Math.round((autoResumeAt - Date.now()) / 60000))
      : 0;
    return {
      bg: 'var(--color-warning-light)',
      border: 'rgba(229, 163, 32, 0.2)',
      iconColor: 'var(--color-warning)',
      textColor: 'var(--color-text-primary)',
      icon: <Clock size={20} weight="bold" />,
      message: `Rate limit reached — auto-resuming in ${minutesLeft} min`,
      action: undefined,
    };
  }

  if (status === 'weekly_limit_reached') {
    return {
      bg: 'var(--color-warning-light)',
      border: 'rgba(229, 163, 32, 0.2)',
      iconColor: 'var(--color-warning)',
      textColor: 'var(--color-text-primary)',
      icon: <Warning size={20} weight="bold" />,
      message: 'Weekly LinkedIn limit reached — resuming next Monday',
      action: undefined,
    };
  }

  if (status === 'completed' && stats && totalLeads) {
    const sent = stats.sent + stats.alreadyConnected;
    return {
      bg: 'var(--color-success-light)',
      border: 'rgba(45, 157, 111, 0.2)',
      iconColor: 'var(--color-success)',
      textColor: 'var(--color-text-primary)',
      icon: <CheckCircle size={20} weight="bold" />,
      message: `Batch complete! ${sent}/${totalLeads} sent`,
      action: undefined,
    };
  }

  if (status === 'daily_limit_reached') {
    return {
      bg: 'var(--color-warning-light)',
      border: 'rgba(229, 163, 32, 0.2)',
      iconColor: 'var(--color-warning)',
      textColor: 'var(--color-text-primary)',
      icon: <Clock size={20} weight="bold" />,
      message: 'Daily limit reached — resuming tomorrow',
      action: undefined,
    };
  }

  return null;
}

export default StatusBanner;
