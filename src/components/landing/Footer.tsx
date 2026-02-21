import { Link } from 'react-router-dom'
import Logo from '../ui/Logo'
import './Footer.css'

function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="footer" role="contentinfo">
            <div className="container">
                <div className="footer-content">
                    <Link to="/" className="footer-logo" aria-label="LeadFlow AI - Home">
                        <Logo />
                        <span>LeadFlow AI</span>
                    </Link>
                    <p className="footer-tagline">
                        LeadFlow AI is the performance-based way to generate qualified leads — without hiring a sales team.
                    </p>
                </div>
                <div className="footer-bottom">
                    <p className="footer-copyright">
                        © {currentYear} LeadFlow AI. All rights reserved.
                    </p>
                    <div className="footer-legal">
                        <a href="#privacy">Privacy Policy</a>
                        <a href="#terms">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
