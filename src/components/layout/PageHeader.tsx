import { Link } from 'react-router-dom'
import { Home, ChevronRight } from 'lucide-react'
import './PageHeader.css'

interface PageHeaderProps {
  title: string
  subtitle?: string
  breadcrumbs?: { label: string; href?: string }[]
  actions?: React.ReactNode
}

function PageHeader({ title, subtitle, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <div className="page-header">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="page-header-breadcrumbs" aria-label="Breadcrumb">
          <Link to="/dashboard" className="page-header-breadcrumb-home" aria-label="Home">
            <Home size={14} />
          </Link>
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1
            return (
              <span key={index} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="page-header-breadcrumb-separator">
                  <ChevronRight size={14} />
                </span>
                {isLast || !crumb.href ? (
                  <span className="page-header-breadcrumb-current">{crumb.label}</span>
                ) : (
                  <Link to={crumb.href}>{crumb.label}</Link>
                )}
              </span>
            )
          })}
        </nav>
      )}

      <div className="page-header-top">
        <div className="page-header-info">
          <h1 className="page-header-title">{title}</h1>
          {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
        </div>
        {actions && <div className="page-header-actions">{actions}</div>}
      </div>
    </div>
  )
}

export default PageHeader
