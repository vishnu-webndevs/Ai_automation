import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ContentBlock } from '../types';
import Hero from './Hero';
import Features from './Features';
import Pricing from './Pricing';
import Testimonials from './Testimonials';
import LogoTicker from './LogoTicker';
import WhyTrust from './WhyTrust';
import MobileSection from './MobileSection';
import BentoGrid from './BentoGrid';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface BlockRendererProps {
    block: ContentBlock;
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

const BlockRenderer: React.FC<BlockRendererProps> = ({ block }) => {
    // Handle potential API vs Static data differences
    const type = block.block_type || block.type;
    const content = block.content || block.content_json || {};

    switch (type) {
        case 'hero':
            return <Hero {...content} />;
        
        case 'features':
            return <Features {...content} />;

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
                                <svg className="w-5 h-5 text-slate-500 group-hover:text-purple-400 transform group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        ))}
                    </div>
                </div>
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
