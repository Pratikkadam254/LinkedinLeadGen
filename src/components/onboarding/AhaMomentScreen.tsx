import { useState, useMemo } from 'react'
import { User, Building2, Sparkles } from 'lucide-react'
import TypewriterText from './TypewriterText'
import type { OnboardingData } from '../../hooks/useOnboardingStorage'
import './AhaMomentScreen.css'

const industryLabels: Record<string, string> = {
    technology: 'Technology',
    finance: 'Finance',
    healthcare: 'Healthcare',
    consulting: 'Consulting',
    manufacturing: 'Manufacturing',
    retail: 'Retail',
    real_estate: 'Real Estate',
    education: 'Education',
    other: 'Business',
}

const roleLabels: Record<string, string> = {
    sales: 'Sales Professional',
    founder: 'Founder',
    consultant: 'Consultant',
    recruiter: 'Recruiter',
    biz_dev: 'BD Professional',
}

const sampleProspects: Record<string, { firstName: string; lastName: string; title: string; company: string }> = {
    technology: { firstName: 'Sarah', lastName: 'Chen', title: 'VP of Engineering', company: 'CloudScale AI' },
    finance: { firstName: 'James', lastName: 'Mitchell', title: 'Director of Strategy', company: 'Apex Capital' },
    healthcare: { firstName: 'Dr. Maria', lastName: 'Torres', title: 'Chief Medical Officer', company: 'HealthBridge' },
    consulting: { firstName: 'David', lastName: 'Park', title: 'Managing Partner', company: 'Elevate Consulting' },
    manufacturing: { firstName: 'Robert', lastName: 'Fischer', title: 'Operations Director', company: 'Precision MFG' },
    retail: { firstName: 'Emily', lastName: 'Johnson', title: 'Head of Growth', company: 'ShopNow' },
    real_estate: { firstName: 'Michael', lastName: 'Rivera', title: 'Senior Broker', company: 'Prime Properties' },
    education: { firstName: 'Amanda', lastName: 'Lee', title: 'Dean of Innovation', company: 'TechEd Academy' },
    other: { firstName: 'Alex', lastName: 'Taylor', title: 'Managing Director', company: 'Growth Partners' },
}

const messageTemplates: Record<string, string> = {
    professional: 'Hi {{firstName}}, I noticed your work in {{industry}} at {{company}}. As a {{role}} focused on this space, I\'d value connecting with fellow professionals driving innovation. Would love to exchange insights on {{industry}} trends.',
    friendly: 'Hey {{firstName}}! Saw your profile and loved your background in {{industry}}. I work with {{industry}} companies and thought we might have some great synergies. Would be awesome to connect!',
    casual: 'Hi {{firstName}} — came across your profile and thought it\'d be cool to connect. Always looking to meet people in {{industry}}. Let\'s chat sometime!',
    bold: '{{firstName}}, your work at {{company}} caught my eye. I help {{industry}} leaders book more meetings through AI-powered outreach. Let\'s connect — I think you\'ll find what we\'re building interesting.',
}

interface AhaMomentScreenProps {
    data: Partial<OnboardingData>
}

function AhaMomentScreen({ data }: AhaMomentScreenProps) {
    const [typewriterDone, setTypewriterDone] = useState(false)

    const industry = (data.targetIndustry?.[0]) || 'technology'
    const tone = data.messageTone || 'professional'
    const role = data.role || 'sales'

    const prospect = sampleProspects[industry] || sampleProspects.technology

    const message = useMemo(() => {
        const template = messageTemplates[tone] || messageTemplates.professional
        return template
            .replace(/\{\{firstName\}\}/g, prospect.firstName)
            .replace(/\{\{company\}\}/g, prospect.company)
            .replace(/\{\{industry\}\}/g, industryLabels[industry] || 'Business')
            .replace(/\{\{role\}\}/g, roleLabels[role] || 'professional')
    }, [tone, industry, role, prospect])

    return (
        <div className="aha-screen">
            <div className="aha-header">
                <Sparkles size={24} />
                <h2>Here's what your personalized outreach looks like</h2>
                <p>This is the kind of message AI will generate for each of your prospects.</p>
            </div>

            <div className="aha-prospect-card">
                <div className="aha-prospect-avatar">
                    <User size={24} />
                </div>
                <div className="aha-prospect-info">
                    <span className="aha-prospect-name">{prospect.firstName} {prospect.lastName}</span>
                    <span className="aha-prospect-title">{prospect.title}</span>
                    <span className="aha-prospect-company">
                        <Building2 size={14} />
                        {prospect.company}
                    </span>
                </div>
                <div className="aha-prospect-score">
                    <span className="aha-score-badge">92</span>
                    <span className="aha-score-label">Hot Lead</span>
                </div>
            </div>

            <div className="aha-message-card">
                <div className="aha-message-label">
                    <Sparkles size={14} />
                    AI-Generated Connection Request
                </div>
                <div className="aha-message-body">
                    <TypewriterText
                        text={message}
                        speed={25}
                        onComplete={() => setTypewriterDone(true)}
                    />
                </div>
                {typewriterDone && (
                    <div className="aha-message-meta">
                        {message.length} / 300 characters
                    </div>
                )}
            </div>
        </div>
    )
}

export default AhaMomentScreen
