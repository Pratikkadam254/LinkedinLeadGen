import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import './DashboardLayout.css'

const STORAGE_KEY = 'sidebar-collapsed'

function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true'
    } catch {
      return false
    }
  })

  // Listen for localStorage changes from Sidebar toggle
  useEffect(() => {
    const handleStorage = () => {
      try {
        setSidebarCollapsed(localStorage.getItem(STORAGE_KEY) === 'true')
      } catch {
        // ignore
      }
    }

    // Poll localStorage since storage events don't fire in the same tab
    const interval = setInterval(handleStorage, 100)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="dashboard-layout-wrapper">
      <Sidebar />
      <main
        className={`dashboard-layout-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}
      >
        <div className="dashboard-layout-content">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default DashboardLayout
