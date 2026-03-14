import { Link, useLocation } from 'react-router-dom'
import { UserButton } from '@clerk/clerk-react'
import { LayoutDashboard, Upload, Users, CheckSquare, Settings } from 'lucide-react'
import Logo from '../ui/Logo'
import './DashboardLayout.css'

const NAV_ITEMS = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/dashboard/upload', label: 'Upload', icon: Upload },
    { path: '/dashboard/leads', label: 'Leads', icon: Users },
    { path: '/dashboard/approve', label: 'Approve', icon: CheckSquare },
    { path: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const location = useLocation()

    return (
        <div className="dashboard-layout">
            <header className="dashboard-header">
                <div className="dashboard-header-left">
                    <Link to="/dashboard" className="dashboard-logo">
                        <Logo />
                        <span>LeadFlow AI</span>
                    </Link>
                </div>
                <nav className="dashboard-nav">
                    {NAV_ITEMS.map(item => {
                        const Icon = item.icon
                        const isActive = location.pathname === item.path
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`dashboard-nav-item ${isActive ? 'active' : ''}`}
                            >
                                <Icon size={18} />
                                <span>{item.label}</span>
                            </Link>
                        )
                    })}
                </nav>
                <div className="dashboard-header-right">
                    <UserButton afterSignOutUrl="/" />
                </div>
            </header>
            <main className="dashboard-main">
                {children}
            </main>
        </div>
    )
}
