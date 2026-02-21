import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import Logo from '../ui/Logo'
import './Header.css'

const navLinks = [
    { label: 'Home', href: '#hero' },
    { label: 'Features', href: '#features' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Pricing', href: '#pricing' },
]

function Header() {
    const [mobileOpen, setMobileOpen] = useState(false)

    return (
        <header className="header" role="banner">
            <div className="header-pill" aria-label="Main navigation">
                <Link to="/" className="header-logo" aria-label="LeadFlow AI - Home">
                    <Logo />
                    <span>LeadFlow AI</span>
                </Link>

                <nav className="header-nav">
                    <ul className="header-links" role="list">
                        {navLinks.map(link => (
                            <li key={link.href}>
                                <a href={link.href}>{link.label}</a>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="header-actions">
                    <Link to="/signup" className="btn btn-primary btn-sm">
                        Get started
                    </Link>
                    <button
                        className="mobile-menu-btn"
                        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={mobileOpen}
                        onClick={() => setMobileOpen(!mobileOpen)}
                    >
                        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="mobile-menu">
                    <nav>
                        <ul role="list">
                            {navLinks.map(link => (
                                <li key={link.href}>
                                    <a href={link.href} onClick={() => setMobileOpen(false)}>
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                        <Link to="/signup" className="btn btn-primary btn-mobile-cta" onClick={() => setMobileOpen(false)}>
                            Get started
                        </Link>
                    </nav>
                </div>
            )}
        </header>
    )
}

export default Header
