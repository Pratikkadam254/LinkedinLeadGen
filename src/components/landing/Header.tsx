import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import Logo from '../ui/Logo'
import './Header.css'

function Header() {
    const [mobileOpen, setMobileOpen] = useState(false)

    const closeMobile = () => setMobileOpen(false)

    return (
        <header className="header" role="banner">
            <nav className="container header-nav" aria-label="Main navigation">
                <Link to="/" className="header-logo" aria-label="LeadFlow AI - Home">
                    <Logo />
                    <span>LeadFlow AI</span>
                </Link>

                <ul className="header-links" role="list">
                    <li><a href="#features">Features</a></li>
                    <li><a href="#how-it-works">How It Works</a></li>
                    <li><a href="#pricing">Pricing</a></li>
                    <li><a href="#faq">FAQ</a></li>
                </ul>

                <div className="header-actions">
                    <Link to="/signin" className="btn btn-text">Sign In</Link>
                    <Link to="/signup" className="btn btn-primary btn-pill">
                        Get Started Free
                    </Link>
                    <button
                        className="mobile-menu-btn"
                        aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
                        aria-expanded={mobileOpen}
                        onClick={() => setMobileOpen(!mobileOpen)}
                    >
                        {mobileOpen ? (
                            <X size={24} aria-hidden="true" />
                        ) : (
                            <Menu size={24} aria-hidden="true" />
                        )}
                    </button>
                </div>
            </nav>

            {/* Mobile drawer overlay */}
            {mobileOpen && (
                <div className="mobile-overlay" onClick={closeMobile} aria-hidden="true" />
            )}

            {/* Mobile slide-in drawer */}
            <div className={`mobile-drawer ${mobileOpen ? 'open' : ''}`}>
                <nav className="mobile-drawer-nav" aria-label="Mobile navigation">
                    <ul role="list">
                        <li><a href="#features" onClick={closeMobile}>Features</a></li>
                        <li><a href="#how-it-works" onClick={closeMobile}>How It Works</a></li>
                        <li><a href="#pricing" onClick={closeMobile}>Pricing</a></li>
                        <li><a href="#faq" onClick={closeMobile}>FAQ</a></li>
                    </ul>
                    <div className="mobile-drawer-actions">
                        <Link to="/signin" className="btn btn-secondary btn-lg" onClick={closeMobile}>Sign In</Link>
                        <Link to="/signup" className="btn btn-primary btn-pill btn-lg" onClick={closeMobile}>
                            Get Started Free
                        </Link>
                    </div>
                </nav>
            </div>
        </header>
    )
}

export default Header
