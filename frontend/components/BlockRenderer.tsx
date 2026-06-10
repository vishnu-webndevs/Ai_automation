import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useSWR from 'swr';
import { serviceService } from '../services/api';
import { ContentBlock, Page } from '../types';
import Hero from './Hero';
import Features from './Features';
import Pricing from './Pricing';
import Testimonials from './Testimonials';
import LogoTicker from './LogoTicker';
import WhyTrust from './WhyTrust';
import MobileSection from './MobileSection';
import BentoGrid from './BentoGrid';
import BlogGrid from './BlogGrid';
import Newsletter from './Newsletter';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface BlockRendererProps {
    block: ContentBlock;
    page?: Page;
}

const FAQItem = ({ item }: { item: { question: string; answer: string } }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-slate-700 last:border-0">
            <button
                className="w-full py-4 flex items-center justify-between text-left focus:outline-none"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="text-lg font-medium text-slate-200">{item.question}</span>
                {isOpen ? <ChevronUp className="w-5 h-5 text-purple-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </button>
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 pb-4' : 'max-h-0 opacity-0'}`}
            >
                <p className="text-slate-400">{item.answer}</p>
            </div>
        </div>
    );
};

const LatestServicesBlock = ({ heading, count = 3 }: any) => {
    const { data: services, isLoading } = useSWR('services', serviceService.getAll);
    
    if (isLoading) return <div className="py-12 text-center text-slate-400">Loading latest services...</div>;
    if (!services || services.length === 0) return null;

    // Show only the latest 'count' services
    const latest = [...services].sort((a: any, b: any) => String(b?.updated_at || '').localeCompare(String(a?.updated_at || ''))).slice(0, count);

    return (
        <section className="py-16 sm:py-24">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="flex justify-between items-end mb-10">
                    <h2 className="text-3xl md:text-4xl font-bold text-white">{heading || 'Explore Our AI Services'}</h2>
                    <Link to="/services" className="text-purple-400 hover:text-purple-300 font-medium text-sm flex items-center">
                        View All
                        <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {latest.map(service => (
                        <Link
                            to={`/services/${service.slug}`}
                            key={service.id}
                            className="group bg-slate-900/70 border border-slate-800 rounded-2xl p-7 hover:border-purple-500/60 hover:bg-slate-900 transition-colors flex flex-col shadow-lg shadow-black/20"
                        >
                            <div className="mb-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors text-xl">
                                    <span>{(service as any).icon || '🤖'}</span>
                                </div>
                                <h3 className="text-lg font-semibold text-white">
                                    {service.name}
                                </h3>
                            </div>
                            <p className="text-slate-400 text-sm mb-4 line-clamp-3">
                                {(service as any).short_description || 'AI service tailored for your business workflow.'}
                            </p>
                            <span className="mt-auto inline-flex items-center text-xs font-medium text-purple-300 group-hover:text-purple-200">
                                View Service
                                <svg
                                    className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-0.5 transition-transform"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M9 5l7 7-7 7"
                                    />
                                </svg>
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

const BlockRenderer: React.FC<BlockRendererProps> = ({ block, page }) => {
    // Handle potential API vs Static data differences
    const type = block.block_type || block.type;
    const content = block.content || block.content_json || {};

    switch (type) {
        case 'hero':
        case 'hero_simple':
        case 'hero_split':
            const heroMeta = page ? {
                date: page.created_at ? new Date(page.created_at).toLocaleDateString() : undefined,
                categories: (page as any).blog_categories?.map((c: any) => c.name),
                author: 'Totan Team'
            } : undefined;

            return <Hero 
                heading={content.title || content.heading} 
                subheading={content.subtitle || content.subheading}
                image={content.image || page?.seo_meta?.og_image}
                layout={content.layout}
                meta={heroMeta}
                {...content} 
            />;
        
        case 'features':
        case 'features_grid': {
            const heading = content.heading || content.title;
            const subheading = content.subheading || '';
            const items = content.features || content.items || [];
            const layout = content.layout === 'right' ? 'right' : 'left';

            return (
                <Features
                    heading={heading}
                    subheading={subheading}
                    items={items}
                    layout={layout}
                />
            );
        }

        case 'bento_grid':
            return <BentoGrid {...content} />;
            
        case 'pricing':
            return <Pricing {...content} />;
            
        case 'testimonials':
            return <Testimonials {...content} />;

        case 'logo_ticker':
            return <LogoTicker {...content} />;
        
        case 'why_trust':
            return <WhyTrust {...content} />;
        
        case 'mobile_section':
            return <MobileSection {...content} />;

        case 'blog-grid':
        case 'blog-list':
            return <BlogGrid {...content} />;

        case 'latest_services':
            return <LatestServicesBlock count={content.count} heading={content.heading} />;

        case 'newsletter':
            return <Newsletter {...content} />;

        case 'cta':
            return (
                <section className="py-16 sm:py-24">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            {content.heading || 'Ready to get started?'}
                        </h2>
                        {content.subheading && (
                            <p className="text-lg text-slate-300 mb-8">
                                {content.subheading}
                            </p>
                        )}
                        <Link
                            to={content.buttonUrl || '/signup'}
                            className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-full transition-colors duration-200 shadow-lg shadow-purple-500/25"
                        >
                            {content.buttonText || 'Get Started for Free'}
                        </Link>
                    </div>
                </section>
            );

        case 'text':
            return (
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
                     <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: content.html || '' }} />
                </div>
            );

        // Basic Content Blocks
        case 'heading':
            return (
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                        {typeof content === 'string' ? content : content.text || ''}
                    </h2>
                </div>
            );

        case 'paragraph':
            return (
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
                    <p className="text-lg text-slate-300 leading-relaxed">
                        {typeof content === 'string' ? content : content.text || ''}
                    </p>
                </div>
            );

        case 'list':
            return (
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
                    <ul className="space-y-3 list-disc list-inside text-slate-300">
                        {(Array.isArray(content) ? content : []).map((item: string, idx: number) => (
                            <li key={idx} className="text-lg pl-2">
                                <span className="-ml-2">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            );

        case 'button':
            // Content can be just the label string, or an object with label and url
            const label = typeof content === 'string' ? content : content.label || 'Click Here';
            const url = typeof content === 'object' && content.url ? content.url : '/contact';
            
            return (
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
                    <Link 
                        to={url}
                        className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-full transition-colors duration-200 shadow-lg shadow-purple-500/25"
                    >
                        {label}
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </Link>
                </div>
            );

        case 'faq_list':
            return (
                <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
                    <div className="bg-slate-800/50 rounded-2xl p-6 md:p-8 border border-slate-700/50 backdrop-blur-sm">
                        <h3 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h3>
                        <div className="space-y-2">
                            {(Array.isArray(content) ? content : []).map((item: any, idx: number) => (
                                <FAQItem key={idx} item={item} />
                            ))}
                        </div>
                    </div>
                </div>
            );

        case 'internal_links':
            return (
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {(Array.isArray(content) ? content : []).map((link: any, idx: number) => (
                            <Link 
                                key={idx} 
                                to={link.url}
                                className="group flex items-center p-4 bg-slate-800/50 border border-slate-700 hover:border-purple-500/50 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/10"
                            >
                                <span className="flex-1 text-lg font-medium text-slate-200 group-hover:text-purple-400 transition-colors">
                                    {link.text}
                                </span>
                                <svg className="w-5 h-5 text-slate-400 group-hover:text-purple-400 transform group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        ))}
                    </div>
                </div>
            );
        
        case 'cta_bottom':
            return (
                <section className="py-16 sm:py-24">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            {content.title || 'Ready to get started?'}
                        </h2>
                        {content.subtitle && (
                            <p className="text-lg text-slate-300 mb-8">
                                {content.subtitle}
                            </p>
                        )}
                        <Link
                            to={content.url || '/contact'}
                            className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-full transition-colors duration-200 shadow-lg shadow-purple-500/25"
                        >
                            {content.button_text || 'Talk to our team'}
                        </Link>
                    </div>
                </section>
            );
            
        default:
            // For unknown block types, we return nothing or a debug message if needed.
            // In production, it's often better to return null to avoid breaking layout.
            // But for development we can show a warning.
            if (process.env.NODE_ENV === 'development') {
                return (
                    <div className="p-4 border border-yellow-500/50 rounded bg-yellow-500/10 text-yellow-200 my-4 max-w-6xl mx-auto">
                        <p className="font-mono text-sm">Unknown Block Type: {type} (Original: {block.block_type})</p>
                        <pre className="text-xs mt-2 overflow-auto">{JSON.stringify(content, null, 2)}</pre>
                    </div>
                );
            }
            return null;
    }
};

export default BlockRenderer;
