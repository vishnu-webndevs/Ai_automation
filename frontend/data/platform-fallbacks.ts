export interface FallbackItem {
    id: string;
    slug: string;
    name: string;
    description: string;
    icon: string;
}

export const FALLBACK_SOLUTIONS: FallbackItem[] = [
    {
        id: 'fallback-s1',
        slug: 'lead-generation-agent',
        name: 'Lead Generation Agent',
        description: 'Automate lead collection, qualification, and routing. Our AI agent engages prospects, collects key requirements, and schedules meetings 24/7.',
        icon: '📈'
    },
    {
        id: 'fallback-s2',
        slug: 'dynamic-support-bot',
        name: 'Dynamic Support Bot',
        description: 'Reduce ticket volume by up to 70%. Context-aware support agents resolve common inquiries instantly using your internal knowledge base.',
        icon: '💬'
    },
    {
        id: 'fallback-s3',
        slug: 'data-extraction-pipeline',
        name: 'Data Extraction Pipeline',
        description: 'Parse invoices, contracts, receipts, and structured data automatically. Extract critical metadata with 99% accuracy in seconds.',
        icon: '📄'
    },
    {
        id: 'fallback-s4',
        slug: 'operations-orchestrator',
        name: 'Operations Orchestrator',
        description: 'Connect disparate business apps and orchestrate complex multi-step workflows. Automate manual task handoffs with zero friction.',
        icon: '⚙️'
    }
];

export const FALLBACK_INTEGRATIONS: FallbackItem[] = [
    {
        id: 'fallback-i1',
        slug: 'slack',
        name: 'Slack',
        description: "Connect your AI support agents directly into internal Slack channels to resolve team queries instantly.",
        icon: '💬'
    },
    {
        id: 'fallback-i2',
        slug: 'hubspot',
        name: 'HubSpot',
        description: 'Sync captured leads, conversation histories, and user behavior metrics directly to your CRM.',
        icon: '🔄'
    },
    {
        id: 'fallback-i3',
        slug: 'salesforce',
        name: 'Salesforce',
        description: 'Enrich contacts and push pipeline analytics from lead qualification agents to Salesforce accounts.',
        icon: '☁️'
    },
    {
        id: 'fallback-i4',
        slug: 'whatsapp',
        name: 'WhatsApp',
        description: "Interact with customers on the world's most popular messaging app using custom support and marketing agents.",
        icon: '📱'
    },
    {
        id: 'fallback-i5',
        slug: 'zapier',
        name: 'Zapier',
        description: 'Connect Totan AI agents with over 5,000 apps to build unlimited automation workflows without writing code.',
        icon: '⚡'
    }
];
