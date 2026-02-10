import { Link } from 'react-router-dom'
import Logo from '../ui/Logo'
import './Footer.css'

function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="footer" role="contentinfo">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-brand">
                        <Link to="/" className="footer-logo" aria-label="LeadFlow AI - Home">
                            <Logo />
                            <span>LeadFlow AI</span>
                        </Link>
                        <p className="footer-tagline">
                            Intelligence meets opportunity. Transform your LinkedIn
                            outreach with AI-powered lead generation.
                        </p>
                    </div>

                    <nav className="footer-links" aria-label="Footer navigation">
                        <div className="footer-column">
                            <h4>Product</h4>
                            <ul role="list">
                                <li><a href="#features">Features</a></li>
                                <li><Link to="/dashboard">Dashboard</Link></li>
                                <li><a href="#stats">Results</a></li>
                            </ul>
                        </div>
                        <div className="footer-column">
                            <h4>Company</h4>
                            <ul role="list">
                                <li><a href="#about">About</a></li>
                                <li><a href="#contact">Contact</a></li>
                                <li><a href="#careers">Careers</a></li>
                            </ul>
                        </div>
                        <div className="footer-column">
                            <h4>Resources</h4>
                            <ul role="list">
                                <li><a href="#blog">Blog</a></li>
                                <li><a href="#docs">Documentation</a></li>
                                <li><a href="#support">Support</a></li>
                            </ul>
                        </div>
                    </nav>
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
