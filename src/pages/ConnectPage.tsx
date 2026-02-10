import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
    Linkedin,
    Check,
    AlertCircle,
    ExternalLink,
    Shield,
    Zap,
    RefreshCw,
    Unplug
} from 'lucide-react'
import Logo from '../components/ui/Logo'
import { unipileService, initializeUnipile, type LinkedInAccount } from '../lib/unipile'
import './ConnectPage.css'

function ConnectPage() {
    const [isConnecting, setIsConnecting] = useState(false)
    const [account, setAccount] = useState<LinkedInAccount | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [limits, setLimits] = useState(unipileService.getDailyLimits())

    useEffect(() => {
        // Initialize Unipile on mount
        initializeUnipile()

        // Check if already connected
        const existingAccount = unipileService.getAccount()
        if (existingAccount) {
            setAccount(existingAccount)
        }

        // Check for OAuth callback params
        const params = new URLSearchParams(window.location.search)
        const code = params.get('code')
        if (code) {
            handleOAuthCallback(code)
        }
    }, [])

    const handleConnect = async () => {
        try {
            setIsConnecting(true)
            setError(null)

            // For demo without real API key, simulate connection
            if (!import.meta.env.VITE_UNIPILE_API_KEY) {
                await new Promise(resolve => setTimeout(resolve, 2000))
                const mockAccount: LinkedInAccount = {
                    id: 'demo_account',
                    provider: 'linkedin',
                    status: 'connected',
                    name: 'Demo User',
                    email: 'demo@example.com',
                    profileUrl: 'https://linkedin.com/in/demo-user',
                    connectedAt: new Date().toISOString(),
                }
                setAccount(mockAccount)
                setIsConnecting(false)
                return
            }

            // Get OAuth URL and redirect
            const oauthUrl = await unipileService.getOAuthUrl()
            window.location.href = oauthUrl
        } catch (err) {
            setError('Failed to initiate connection. Please try again.')
            setIsConnecting(false)
        }
    }

    const handleOAuthCallback = async (code: string) => {
        try {
            setIsConnecting(true)
            setError(null)

            const connectedAccount = await unipileService.handleOAuthCallback(code)
            setAccount(connectedAccount)

            // Clear URL params
            window.history.replaceState({}, '', '/dashboard/connect')
        } catch (err) {
            setError('Failed to complete connection. Please try again.')
        } finally {
            setIsConnecting(false)
        }
    }

    const handleDisconnect = async () => {
        if (!confirm('Are you sure you want to disconnect your LinkedIn account?')) {
            return
        }

        try {
            setIsConnecting(true)
            await unipileService.disconnect()
            setAccount(null)
        } catch (err) {
            setError('Failed to disconnect. Please try again.')
        } finally {
            setIsConnecting(false)
        }
    }

    const handleRefreshLimits = () => {
        setLimits(unipileService.getDailyLimits())
    }

    return (
        <div className="connect-page">
            <header className="connect-header">
                <Link to="/dashboard" className="connect-logo">
                    <Logo />
                    <span>LeadFlow AI</span>
                </Link>
                <nav className="connect-nav">
                    <Link to="/dashboard" className="nav-link">← Back to Dashboard</Link>
                </nav>
            </header>

            <main className="connect-main">
                <div className="connect-container">
                    <div className="connect-intro">
                        <div className="linkedin-icon-wrapper">
                            <Linkedin size={32} />
                        </div>
                        <h1>Connect LinkedIn</h1>
                        <p>Link your LinkedIn account to automate connection requests and messaging</p>
                    </div>

                    {error && (
                        <div className="error-banner">
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    {!account ? (
                        // Not connected state
                        <div className="connect-card">
                            <div className="connect-status disconnected">
                                <div className="status-indicator"></div>
                                <span>Not Connected</span>
                            </div>

                            <div className="connect-benefits">
                                <div className="benefit">
                                    <Zap size={20} />
                                    <div>
                                        <h4>Automated Outreach</h4>
                                        <p>Send connection requests and messages automatically</p>
                                    </div>
                                </div>
                                <div className="benefit">
                                    <Shield size={20} />
                                    <div>
                                        <h4>LinkedIn-Safe</h4>
                                        <p>Built-in rate limiting to protect your account</p>
                                    </div>
                                </div>
                                <div className="benefit">
                                    <RefreshCw size={20} />
                                    <div>
                                        <h4>Real-time Sync</h4>
                                        <p>Track responses and engagement instantly</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                className="btn btn-linkedin btn-lg"
                                onClick={handleConnect}
                                disabled={isConnecting}
                            >
                                {isConnecting ? (
                                    <>
                                        <RefreshCw size={18} className="spinning" />
                                        Connecting...
                                    </>
                                ) : (
                                    <>
                                        <Linkedin size={18} />
                                        Connect LinkedIn Account
                                    </>
                                )}
                            </button>

                            <p className="connect-note">
                                We use <a href="https://unipile.com" target="_blank" rel="noopener noreferrer">
                                    Unipile <ExternalLink size={12} />
                                </a> for secure LinkedIn integration
                            </p>
                        </div>
                    ) : (
                        // Connected state
                        <div className="connect-card connected">
                            <div className="connect-status connected">
                                <div className="status-indicator"></div>
                                <span>Connected</span>
                            </div>

                            <div className="account-info">
                                <div className="account-avatar">
                                    {account.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div className="account-details">
                                    <h3>{account.name}</h3>
                                    <p>{account.email}</p>
                                    <a
                                        href={account.profileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="profile-link"
                                    >
                                        View Profile <ExternalLink size={12} />
                                    </a>
                                </div>
                                <Check size={24} className="check-icon" />
                            </div>

                            <div className="limits-section">
                                <div className="limits-header">
                                    <h4>Daily Limits</h4>
                                    <button onClick={handleRefreshLimits} className="btn btn-text btn-sm">
                                        <RefreshCw size={14} />
                                        Refresh
                                    </button>
                                </div>
                                <div className="limits-grid">
                                    <div className="limit-card">
                                        <div className="limit-label">Connection Requests</div>
                                        <div className="limit-bar">
                                            <div
                                                className="limit-fill"
                                                style={{ width: `${(limits.connectionRequests.used / limits.connectionRequests.limit) * 100}%` }}
                                            ></div>
                                        </div>
                                        <div className="limit-values">
                                            <span>{limits.connectionRequests.used} used</span>
                                            <span>{limits.connectionRequests.remaining} remaining</span>
                                        </div>
                                    </div>
                                    <div className="limit-card">
                                        <div className="limit-label">Direct Messages</div>
                                        <div className="limit-bar">
                                            <div
                                                className="limit-fill"
                                                style={{ width: `${(limits.messages.used / limits.messages.limit) * 100}%` }}
                                            ></div>
                                        </div>
                                        <div className="limit-values">
                                            <span>{limits.messages.used} used</span>
                                            <span>{limits.messages.remaining} remaining</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="account-actions">
                                <Link to="/dashboard/leads" className="btn btn-primary">
                                    Start Sending →
                                </Link>
                                <button
                                    onClick={handleDisconnect}
                                    className="btn btn-danger-outline"
                                    disabled={isConnecting}
                                >
                                    <Unplug size={16} />
                                    Disconnect
                                </button>
                            </div>

                            <p className="connected-time">
                                Connected {new Date(account.connectedAt).toLocaleDateString()}
                            </p>
                        </div>
                    )}

                    {/* FAQ Section */}
                    <div className="faq-section">
                        <h3>Frequently Asked Questions</h3>
                        <div className="faq-list">
                            <details className="faq-item">
                                <summary>Is this safe for my LinkedIn account?</summary>
                                <p>Yes! We use Unipile's official API integration with built-in rate limiting. We never exceed LinkedIn's daily limits and follow all platform guidelines.</p>
                            </details>
                            <details className="faq-item">
                                <summary>What data do you access?</summary>
                                <p>We only access what's needed: your profile info, ability to send connection requests, and messages. We never access your conversations or connections list.</p>
                            </details>
                            <details className="faq-item">
                                <summary>Can I disconnect anytime?</summary>
                                <p>Absolutely! You can disconnect your account at any time. All pending actions will be cancelled and we'll delete your connection tokens.</p>
                            </details>
                            <details className="faq-item">
                                <summary>What are the daily limits?</summary>
                                <p>To keep your account safe, we limit to 100 connection requests and 150 messages per day. These limits reset at midnight UTC.</p>
                            </details>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default ConnectPage
