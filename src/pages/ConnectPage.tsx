import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
    LinkedinLogo,
    Check,
    WarningCircle,
    ArrowSquareOut,
    ShieldCheck,
    Lightning,
    ArrowsClockwise,
    PlugsConnected,
    CaretDown
} from '@phosphor-icons/react'
import { unipileService, initializeUnipile, type LinkedInAccount } from '../lib/unipile'
import PageHeader from '../components/layout/PageHeader'
import Card from '../components/ui/Card'
import StatusBadge from '../components/ui/StatusBadge'
import './ConnectPage.css'

const FAQ_ITEMS = [
    {
        question: 'Is this safe for my LinkedIn account?',
        answer: 'Yes! We use Unipile\'s official API integration with built-in rate limiting. We never exceed LinkedIn\'s daily limits and follow all platform guidelines.',
    },
    {
        question: 'What data do you access?',
        answer: 'We only access what\'s needed: your profile info, ability to send connection requests, and messages. We never access your conversations or connections list.',
    },
    {
        question: 'Can I disconnect anytime?',
        answer: 'Absolutely! You can disconnect your account at any time. All pending actions will be cancelled and we\'ll delete your connection tokens.',
    },
    {
        question: 'What are the daily limits?',
        answer: 'To keep your account safe, we limit to 100 connection requests and 150 messages per day. These limits reset at midnight UTC.',
    },
]

function ConnectPage() {
    const [isConnecting, setIsConnecting] = useState(false)
    const [account, setAccount] = useState<LinkedInAccount | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [limits, setLimits] = useState(unipileService.getDailyLimits())
    const [openFaq, setOpenFaq] = useState<number | null>(null)

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

    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index)
    }

    return (
        <div className="connect-page">
            <PageHeader
                title="Connect LinkedIn"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Connect' },
                ]}
            />

            <div className="connect-body">
                <div className="connect-container">
                    {error && (
                        <div className="connect-error-banner">
                            <WarningCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    {!account ? (
                        // Not connected state
                        <>
                            <Card padding="lg" className="connect-card">
                                <div className="connect-card__inner">
                                    <div className="connect-linkedin-icon">
                                        <LinkedinLogo size={28} />
                                    </div>
                                    <h2 className="connect-card__title">Connect LinkedIn</h2>
                                    <p className="connect-card__desc">Link your LinkedIn account to automate connection requests and messaging</p>

                                    <div className="connect-benefits">
                                        <div className="connect-benefit">
                                            <Lightning size={24} />
                                            <div>
                                                <h4>Automated Outreach</h4>
                                                <p>Send connection requests and messages automatically</p>
                                            </div>
                                        </div>
                                        <div className="connect-benefit">
                                            <ShieldCheck size={24} />
                                            <div>
                                                <h4>LinkedIn-Safe</h4>
                                                <p>Built-in rate limiting to protect your account</p>
                                            </div>
                                        </div>
                                        <div className="connect-benefit">
                                            <ArrowsClockwise size={24} />
                                            <div>
                                                <h4>Real-time Sync</h4>
                                                <p>Track responses and engagement instantly</p>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        className="btn btn-linkedin btn-lg btn-pill"
                                        onClick={handleConnect}
                                        disabled={isConnecting}
                                    >
                                        {isConnecting ? (
                                            <>
                                                <ArrowsClockwise size={18} className="spinning" />
                                                Connecting...
                                            </>
                                        ) : (
                                            <>
                                                <LinkedinLogo size={18} />
                                                Connect LinkedIn Account
                                            </>
                                        )}
                                    </button>

                                    <p className="connect-note">
                                        We use <a href="https://unipile.com" target="_blank" rel="noopener noreferrer">
                                            Unipile <ArrowSquareOut size={12} />
                                        </a> for secure LinkedIn integration
                                    </p>
                                </div>
                            </Card>

                            {/* FAQ Accordion */}
                            <div className="connect-faq">
                                <h3 className="connect-faq__title">Frequently Asked Questions</h3>
                                <div className="connect-faq__list">
                                    {FAQ_ITEMS.map((item, index) => (
                                        <div
                                            key={index}
                                            className={`connect-faq__item ${openFaq === index ? 'connect-faq__item--open' : ''}`}
                                        >
                                            <button
                                                className="connect-faq__question"
                                                onClick={() => toggleFaq(index)}
                                            >
                                                <span>{item.question}</span>
                                                <CaretDown size={18} className="connect-faq__chevron" />
                                            </button>
                                            <div className="connect-faq__answer">
                                                <p>{item.answer}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        // Connected state
                        <>
                            <div className="connect-status-row">
                                <StatusBadge status="success" label="Connected" showDot />
                            </div>

                            <Card padding="lg" className="connect-card">
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
                                            View Profile <ArrowSquareOut size={12} />
                                        </a>
                                    </div>
                                    <Check size={24} className="check-icon" />
                                </div>
                            </Card>

                            {/* Limits */}
                            <div className="connect-limits-header">
                                <h4>Daily Limits</h4>
                                <button onClick={handleRefreshLimits} className="btn btn-text btn-sm">
                                    <ArrowsClockwise size={14} />
                                    Refresh
                                </button>
                            </div>
                            <div className="connect-limits-grid">
                                <Card padding="md">
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
                                </Card>
                                <Card padding="md">
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
                                </Card>
                            </div>

                            {/* Actions */}
                            <div className="connect-actions">
                                <Link to="/dashboard/leads" className="btn btn-primary btn-lg">
                                    Start Sending
                                </Link>
                                <button
                                    onClick={handleDisconnect}
                                    className="btn btn-danger btn-lg"
                                    disabled={isConnecting}
                                >
                                    <PlugsConnected size={16} />
                                    Disconnect
                                </button>
                            </div>

                            <p className="connected-time">
                                Connected {new Date(account.connectedAt).toLocaleDateString()}
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ConnectPage
