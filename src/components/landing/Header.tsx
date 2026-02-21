import { Link } from 'react-router-dom'
import { Menu } from 'lucide-react'
import Logo from '../ui/Logo'
import './Header.css'

function Header() {
    return (
        <header className="header" role="banner">
            <nav className="container header-nav" aria-label="Main navigation">
                <Link to="/" className="header-logo" aria-label="LeadFlow AI - Home">
                    <Logo />
                    <span>LeadFlow AI</span>
                </Link>

                <ul className="header-links" role="list">
                    <li><a href="#features">Features</a></li>
                    <li><a href="#stats">Results</a></li>
                    <li><a href="#cta">Pricing</a></li>
                </ul>

                <div className="header-actions">
                    <Link to="/signin" className="btn btn-text">Sign In</Link>
                    <Link to="/signup" className="btn btn-primary">
                        Start Free Trial
                    </Link>
                    <button
                        className="mobile-menu-btn"
                        aria-label="Open navigation menu"
                        aria-expanded="false"
                    >
                        <Menu size={24} aria-hidden="true" />
                    </button>
                </div>
            </nav>
        </header>
    )
}

export default Header
