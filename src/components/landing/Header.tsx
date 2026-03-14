import { Link } from 'react-router-dom'
import './Header.css'

function Header() {
    return (
        <header className="header" role="banner">
            <nav className="header-nav" aria-label="Main navigation">
                <Link to="/" className="header-logo">
                    LeadFlow AI
                </Link>

                <ul className="header-links" role="list">
                    <li><a href="#how-it-works">How it Works</a></li>
                    <li><a href="#pricing">Pricing</a></li>
                </ul>

                <div className="header-actions">
                    <Link to="/signin" className="header-signin">Sign In</Link>
                    <Link to="/signup" className="header-cta">Get Started</Link>
                </div>
            </nav>
        </header>
    )
}

export default Header
