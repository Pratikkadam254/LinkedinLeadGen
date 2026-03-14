import './Logo.css'

function Logo() {
    return (
        <svg className="logo-icon" viewBox="0 0 32 32" fill="currentColor">
            <circle cx="8" cy="8" r="4" opacity="0.6" />
            <circle cx="24" cy="8" r="4" />
            <circle cx="16" cy="24" r="4" />
            <line x1="8" y1="8" x2="24" y2="8" stroke="currentColor" strokeWidth="2" />
            <line x1="8" y1="8" x2="16" y2="24" stroke="currentColor" strokeWidth="2" opacity="0.6" />
            <line x1="24" y1="8" x2="16" y2="24" stroke="currentColor" strokeWidth="2" />
        </svg>
    )
}

export default Logo
