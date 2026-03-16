import './StatusBadge.css'

interface StatusBadgeProps {
  status: 'pending' | 'sent' | 'accepted' | 'replied' | 'success' | 'warning' | 'error' | 'info';
  label?: string;
  showDot?: boolean;
  size?: 'sm' | 'md';
}

function StatusBadge({ status, label, showDot = false, size = 'md' }: StatusBadgeProps) {
  const displayLabel = label || status.charAt(0).toUpperCase() + status.slice(1)

  return (
    <span className={`status-badge status-badge--${status} status-badge--${size}`}>
      {showDot && <span className="status-badge__dot" />}
      {displayLabel}
    </span>
  )
}

export default StatusBadge
