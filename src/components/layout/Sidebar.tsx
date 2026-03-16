import { useState, useEffect, useCallback } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Rocket,
  Brain,
  Upload,
  Link as LinkIcon,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react'
import { UserButton } from '@clerk/clerk-react'
import Logo from '../ui/Logo'
import './Sidebar.css'

const STORAGE_KEY = 'sidebar-collapsed'

function Sidebar() {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true'
    } catch {
      return false
    }
  })
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const clerkConfigured = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem(STORAGE_KEY, String(next))
      } catch {
        // ignore
      }
      return next
    })
  }, [])

  const toggleMobile = useCallback(() => {
    setMobileOpen((prev) => !prev)
  }, [])

  const closeMobile = useCallback(() => {
    setMobileOpen(false)
  }, [])

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        className="sidebar-mobile-toggle"
        onClick={toggleMobile}
        aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Backdrop for mobile */}
      <div
        className={`sidebar-backdrop ${mobileOpen ? 'visible' : ''}`}
        onClick={closeMobile}
      />

      <aside
        className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}
      >
        {/* Logo */}
        <Link to="/dashboard" className="sidebar-logo">
          <Logo />
          <span className="sidebar-logo-text">LeadFlow</span>
        </Link>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {/* Main nav */}
          <div className="sidebar-section">
            <NavLink
              to="/dashboard"
              end
              className={({ isActive }) =>
                `sidebar-nav-item ${isActive ? 'active' : ''}`
              }
            >
              <span className="sidebar-nav-item-icon">
                <LayoutDashboard size={20} />
              </span>
              <span className="sidebar-nav-item-text">Dashboard</span>
            </NavLink>

            <NavLink
              to="/dashboard/leads"
              className={({ isActive }) =>
                `sidebar-nav-item ${isActive ? 'active' : ''}`
              }
            >
              <span className="sidebar-nav-item-icon">
                <Users size={20} />
              </span>
              <span className="sidebar-nav-item-text">Leads</span>
            </NavLink>

            <NavLink
              to="/dashboard/campaigns"
              className={({ isActive }) =>
                `sidebar-nav-item ${isActive ? 'active' : ''}`
              }
            >
              <span className="sidebar-nav-item-icon">
                <Rocket size={20} />
              </span>
              <span className="sidebar-nav-item-text">Campaigns</span>
              <span className="sidebar-badge-soon">Soon</span>
            </NavLink>

            <NavLink
              to="/dashboard/strategy"
              className={({ isActive }) =>
                `sidebar-nav-item ${isActive ? 'active' : ''}`
              }
            >
              <span className="sidebar-nav-item-icon">
                <Brain size={20} />
              </span>
              <span className="sidebar-nav-item-text">Strategy</span>
              <span className="sidebar-badge-soon">Soon</span>
            </NavLink>
          </div>

          <div className="sidebar-divider" />

          {/* Actions */}
          <div className="sidebar-section">
            <NavLink
              to="/dashboard/upload"
              className={({ isActive }) =>
                `sidebar-nav-item ${isActive ? 'active' : ''}`
              }
            >
              <span className="sidebar-nav-item-icon">
                <Upload size={20} />
              </span>
              <span className="sidebar-nav-item-text">Import Leads</span>
            </NavLink>

            <NavLink
              to="/dashboard/connect"
              className={({ isActive }) =>
                `sidebar-nav-item ${isActive ? 'active' : ''}`
              }
            >
              <span className="sidebar-nav-item-icon">
                <LinkIcon size={20} />
              </span>
              <span className="sidebar-nav-item-text">Connect</span>
            </NavLink>
          </div>
        </nav>

        {/* Bottom section */}
        <div className="sidebar-bottom">
          {clerkConfigured && (
            <div className="sidebar-user">
              <UserButton afterSignOutUrl="/" />
              <span className="sidebar-user-label">Account</span>
            </div>
          )}

          <NavLink
            to="/dashboard/settings"
            className={({ isActive }) =>
              `sidebar-nav-item ${isActive ? 'active' : ''}`
            }
          >
            <span className="sidebar-nav-item-icon">
              <Settings size={20} />
            </span>
            <span className="sidebar-nav-item-text">Settings</span>
            <span className="sidebar-badge-soon">Soon</span>
          </NavLink>

          <button className="sidebar-collapse-btn" onClick={toggleCollapsed}>
            <span className="sidebar-collapse-btn-icon">
              {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </span>
            <span className="sidebar-collapse-btn-text">
              {collapsed ? 'Expand' : 'Collapse'}
            </span>
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
