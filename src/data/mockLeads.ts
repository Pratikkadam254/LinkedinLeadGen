// Mock lead data - will be replaced with Convex data
export interface Lead {
    id: string
    firstName: string
    lastName: string
    company: string
    title: string
    linkedInUrl: string
    email?: string
    score: number
    messageStatus: 'empty' | 'draft' | 'ready' | 'sent'
    outreachStatus: 'pending' | 'sent' | 'accepted' | 'replied'
    postScraped: boolean
    createdAt: string
}

export const mockLeads: Lead[] = [
    {
        id: '1',
        firstName: 'John',
        lastName: 'Smith',
        company: 'Acme Inc',
        title: 'CEO',
        linkedInUrl: 'https://linkedin.com/in/johnsmith',
        email: 'john@acme.com',
        score: 95,
        messageStatus: 'ready',
        outreachStatus: 'pending',
        postScraped: true,
        createdAt: '2026-02-10T00:00:00Z',
    },
    {
        id: '2',
        firstName: 'Sarah',
        lastName: 'Jones',
        company: 'TechCo',
        title: 'VP Sales',
        linkedInUrl: 'https://linkedin.com/in/sarahjones',
        email: 'sarah@techco.com',
        score: 82,
        messageStatus: 'draft',
        outreachStatus: 'pending',
        postScraped: true,
        createdAt: '2026-02-10T00:00:00Z',
    },
    {
        id: '3',
        firstName: 'Mike',
        lastName: 'Brown',
        company: 'StartupX',
        title: 'Founder',
        linkedInUrl: 'https://linkedin.com/in/mikebrown',
        score: 71,
        messageStatus: 'empty',
        outreachStatus: 'pending',
        postScraped: false,
        createdAt: '2026-02-10T00:00:00Z',
    },
    {
        id: '4',
        firstName: 'Alice',
        lastName: 'Davis',
        company: 'BigCorp',
        title: 'Director of Marketing',
        linkedInUrl: 'https://linkedin.com/in/alicedavis',
        email: 'alice@bigcorp.com',
        score: 89,
        messageStatus: 'ready',
        outreachStatus: 'sent',
        postScraped: true,
        createdAt: '2026-02-09T00:00:00Z',
    },
    {
        id: '5',
        firstName: 'Robert',
        lastName: 'Wilson',
        company: 'SaaS Ltd',
        title: 'CTO',
        linkedInUrl: 'https://linkedin.com/in/robertwilson',
        email: 'robert@saasltd.com',
        score: 78,
        messageStatus: 'ready',
        outreachStatus: 'accepted',
        postScraped: true,
        createdAt: '2026-02-09T00:00:00Z',
    },
    {
        id: '6',
        firstName: 'Emily',
        lastName: 'Chen',
        company: 'InnovateCo',
        title: 'Head of Growth',
        linkedInUrl: 'https://linkedin.com/in/emilychen',
        score: 91,
        messageStatus: 'sent',
        outreachStatus: 'replied',
        postScraped: true,
        createdAt: '2026-02-08T00:00:00Z',
    },
    {
        id: '7',
        firstName: 'David',
        lastName: 'Lee',
        company: 'Enterprise Inc',
        title: 'VP Engineering',
        linkedInUrl: 'https://linkedin.com/in/davidlee',
        email: 'david@enterprise.com',
        score: 67,
        messageStatus: 'empty',
        outreachStatus: 'pending',
        postScraped: false,
        createdAt: '2026-02-08T00:00:00Z',
    },
    {
        id: '8',
        firstName: 'Jennifer',
        lastName: 'Taylor',
        company: 'ConsultPro',
        title: 'Managing Partner',
        linkedInUrl: 'https://linkedin.com/in/jennifertaylor',
        email: 'jennifer@consultpro.com',
        score: 85,
        messageStatus: 'draft',
        outreachStatus: 'pending',
        postScraped: true,
        createdAt: '2026-02-07T00:00:00Z',
    },
]
