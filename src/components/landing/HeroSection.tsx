import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'
import './HeroSection.css'

function HeroSection() {
    return (
        <section id="hero" className="hero" aria-labelledby="hero-heading">
            <div className="container">
                <div className="hero-content">
                    {/* Pill badge */}
                    <div className="hero-badge">
                        <Sparkles size={14} />
                        <span>Introducing AI-powered lead generation</span>
                    </div>

                    {/* Headline */}
                    <h1 id="hero-heading">
                        Performance-based{' '}
                        <span className="text-gradient">lead generation</span>
                    </h1>

                    {/* Subtitle */}
                    <p className="hero-subtitle">
                        Our AI system finds, scores, and engages your ideal prospects on autopilot.
                        If we don't deliver qualified leads, you don't pay.
                    </p>

                    {/* CTAs */}
                    <div className="hero-cta">
                        <Link to="/signup" className="btn btn-primary btn-lg">
                            Try it now
                            <ArrowRight size={18} className="arrow" aria-hidden="true" />
                        </Link>
                        <a href="#how-it-works" className="btn btn-secondary btn-lg">
                            Learn more
                        </a>
                    </div>

                    {/* Trust text */}
                    <p className="hero-trust">Built for high-ticket B2B teams</p>
                </div>

                {/* Hero product screenshot */}
                <div className="hero-screenshot-wrapper">
                    <div className="hero-screenshot">
                        {/* Floating overlay badge */}
                        <div className="hero-overlay-badge">
                            <span className="overlay-title">Full Pipeline.</span>
                            <span className="overlay-highlight">Zero Risk.</span>
                        </div>

                        {/* Dashboard mockup */}
                        <div className="dashboard-mockup">
                            <div className="mockup-topbar">
                                <div className="mockup-dots">
                                    <span></span><span></span><span></span>
                                </div>
                                <div className="mockup-url">app.leadflow.ai/dashboard</div>
                                <div></div>
                            </div>
                            <div className="mockup-content">
                                <div className="mockup-sidebar">
                                    <div className="sidebar-item active">Dashboard</div>
                                    <div className="sidebar-item">Leads</div>
                                    <div className="sidebar-item">Strategy</div>
                                    <div className="sidebar-item">Campaigns</div>
                                </div>
                                <div className="mockup-main">
                                    <div className="mockup-stats-row">
                                        <div className="mockup-stat-card">
                                            <div className="mockup-stat-label">Total Leads</div>
                                            <div className="mockup-stat-value">2,847</div>
                                            <div className="mockup-stat-change positive">+12.5%</div>
                                        </div>
                                        <div className="mockup-stat-card">
                                            <div className="mockup-stat-label">Qualified</div>
                                            <div className="mockup-stat-value">486</div>
                                            <div className="mockup-stat-change positive">+8.2%</div>
                                        </div>
                                        <div className="mockup-stat-card">
                                            <div className="mockup-stat-label">Meetings Booked</div>
                                            <div className="mockup-stat-value">127</div>
                                            <div className="mockup-stat-change positive">+23.1%</div>
                                        </div>
                                        <div className="mockup-stat-card">
                                            <div className="mockup-stat-label">Revenue</div>
                                            <div className="mockup-stat-value">$94.2k</div>
                                            <div className="mockup-stat-change positive">+18.7%</div>
                                        </div>
                                    </div>
                                    <div className="mockup-table">
                                        <div className="mockup-table-header">
                                            <span>Name</span><span>Company</span><span>Score</span><span>Status</span>
                                        </div>
                                        <div className="mockup-table-row">
                                            <span>Sarah Chen</span><span>TechCo</span>
                                            <span className="score-badge hot">95</span>
                                            <span className="status-pill sent">Replied</span>
                                        </div>
                                        <div className="mockup-table-row">
                                            <span>James Miller</span><span>Acme Corp</span>
                                            <span className="score-badge hot">88</span>
                                            <span className="status-pill booked">Booked</span>
                                        </div>
                                        <div className="mockup-table-row">
                                            <span>Emily Park</span><span>Vertex AI</span>
                                            <span className="score-badge warm">74</span>
                                            <span className="status-pill sent">Sent</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Trusted by logos placeholder */}
                <div className="hero-social-proof">
                    <p>Loved by 200+ B2B teams worldwide</p>
                    <div className="proof-logos">
                        <div className="proof-logo">★★★★★ <span>5.0</span></div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default HeroSection
