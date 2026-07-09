import React from 'react';
import useSWR from 'swr';
import { solutionService, integrationService } from '../services/api';
import { Link } from 'react-router-dom';

const FALLBACK_SOLUTIONS = [
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

const FALLBACK_INTEGRATIONS = [
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

const PlatformList: React.FC<{ initialData?: any }> = ({ initialData }) => {
    const { data: solutions, isLoading: loadingSolutions } = useSWR('solutions', solutionService.getAll, {
        fallbackData: initialData?.solutions
    });
    const { data: integrations, isLoading: loadingIntegrations } = useSWR('integrations', integrationService.getAll, {
        fallbackData: initialData?.integrations
    });

    const activeSolutions = solutions && solutions.length > 0 ? solutions : FALLBACK_SOLUTIONS;
    const activeIntegrations = integrations && integrations.length > 0 ? integrations : FALLBACK_INTEGRATIONS;

    return (
        <div className="bg-slate-950 min-h-screen relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-purple-950/20 via-slate-950 to-transparent pointer-events-none" />
            <div className="absolute top-1/4 -left-64 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[128px] pointer-events-none" />
            <div className="absolute top-1/2 -right-64 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[128px] pointer-events-none" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
                {/* Header */}
                <div className="text-center mb-20 max-w-3xl mx-auto">
                    <p className="text-xs font-semibold tracking-[0.25em] uppercase text-purple-400 mb-3">
                        Platform Ecosystem
                    </p>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
                        Powering Smarter <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-300 to-blue-400">Automations</span>
                    </h1>
                    <p className="text-lg text-slate-400 leading-relaxed">
                        Discover the tailored solutions and seamless third-party integrations that form the core of the Totan AI ecosystem.
                    </p>
                </div>
                
                {/* Solutions Section */}
                <div className="mb-24">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 border-b border-slate-800/85 pb-6">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Our Solutions</h2>
                            <p className="text-sm text-slate-400">Targeted AI automation services designed for growth and scale.</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {activeSolutions.map((solution) => (
                            <Link 
                                to={`/solutions/${solution.slug}`} 
                                key={solution.id} 
                                className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-8 hover:bg-slate-800/40 hover:border-purple-500/40 transition-all duration-300 group flex flex-col justify-between"
                            >
                                <div>
                                    <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-500/20 transition-colors">
                                        <span className="text-2xl">{solution.icon || '💡'}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors">{solution.name}</h3>
                                    <p className="text-slate-400 text-sm mb-6 leading-relaxed line-clamp-3">{solution.description}</p>
                                </div>
                                <span className="text-purple-400 text-sm font-semibold group-hover:text-purple-300 flex items-center">
                                    Learn More 
                                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Integrations Section */}
                <div>
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 border-b border-slate-800/85 pb-6">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Supported Integrations</h2>
                            <p className="text-sm text-slate-400">Connect custom AI engines directly to the tools you already use.</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {activeIntegrations.map((integration) => (
                            <Link 
                                to={`/integrations/${integration.slug}`} 
                                key={integration.id} 
                                className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-8 hover:bg-slate-800/40 hover:border-blue-500/40 transition-all duration-300 group flex flex-col justify-between"
                            >
                                <div>
                                    <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors">
                                        <span className="text-2xl">{integration.icon || '🔌'}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-300 transition-colors">{integration.name}</h3>
                                    <p className="text-slate-400 text-sm mb-6 leading-relaxed line-clamp-3">{integration.description}</p>
                                </div>
                                <span className="text-blue-400 text-sm font-semibold group-hover:text-blue-300 flex items-center">
                                    Connect Integration
                                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlatformList;
