import { Link } from 'react-router-dom'
import './Footer.css'

function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="footer" role="contentinfo">
            <div className="footer-container">
                <div className="footer-content">
                    <Link to="/" className="footer-logo">
                        LeadFlow AI
                    </Link>
                    <div className="footer-links">
                        <Link to="/signin">Sign In</Link>
                        <Link to="/signup">Get Started</Link>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p className="footer-copyright">
                        &copy; {currentYear} LeadFlow AI. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    )
}

export default Footer
