import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import useSWR from 'swr';
import { pageService } from '../services/api';
import SeoHead from '../components/seo/SeoHead';
import BlockRenderer from '../components/BlockRenderer';
import { STATIC_PAGES } from '../data/static-fallbacks';
import { getTemplateComponent } from '../templates/TemplateLoader';
import PricingPage from './PricingPage';
import Customers from './Customers';
import Changelog from './Changelog';
import SignIn from './SignIn';
import SignUp from './SignUp';
import StyleGuide from './StyleGuide';
import ContactPage from './ContactPage';

interface DynamicPageProps {
    initialData?: any;
    slug?: string;
}

const DynamicPage: React.FC<DynamicPageProps> = ({ initialData, slug: propSlug }) => {
    const params = useParams();
    
    const resolvedSlug = useMemo(() => {
        if (propSlug) return propSlug;
        
        // Next.js App Router params
        if (params && params.slug) {
            const nextSlug = Array.isArray(params.slug) ? params.slug.join('/') : params.slug;
            if (nextSlug) return nextSlug;
        }
        
        // React Router params
        const slugParam = params ? (params as any)['*'] : null;
        return (slugParam as string) || 'home';
    }, [propSlug, params]);

    const slug = resolvedSlug;

    const { data: apiPage, error, isLoading } = useSWR(
        slug ? `/pages/${slug}` : null,
        () => pageService.getBySlug(slug as string),
        {
            fallbackData: initialData,
            shouldRetryOnError: false,
            revalidateOnFocus: false,
            revalidateIfStale: false
        }
    );

    const page = useMemo(() => {
        let resolved = apiPage || STATIC_PAGES[slug as string] || null;

        if (resolved && !resolved.template_slug && slug === 'contact-us') {
            resolved = { ...resolved, template_slug: 'contact-dark' };
        }

        // Auto-inject pricing block if database version exists but has no pricing block
        if (resolved && slug === 'pricing') {
            const hasPricingBlock = resolved.sections?.some(s => 
                s.blocks?.some(b => (b.block_type || b.type) === 'pricing')
            );
            if (!hasPricingBlock) {
                const sections = resolved.sections ? [...resolved.sections] : [];
                const pricingSection = {
                    id: 99999,
                    name: 'Pricing Section',
                    type: 'default',
                    order: sections.length > 0 ? (sections[0].order + 0.5) : 1,
                    blocks: [
                        {
                            id: 99999,
                            block_type: 'pricing',
                            order: 1,
                            content_json: {
                                heading: "Simple, Transparent Pricing",
                                subheading: "Start for free, scale as you grow. No hidden fees.",
                                plans: [
                                    { name: 'Starter', price: 0, desc: 'For individuals and hobbyists', features: ['Up to 10k requests/mo', 'Basic analytics', 'Community support', '1 Project'] },
                                    { name: 'Pro', price: 49, desc: 'For growing teams', featured: true, features: ['Up to 1M requests/mo', 'Advanced analytics', 'Priority support', 'Unlimited Projects', 'Custom Rate Limiting'] },
                                    { name: 'Enterprise', price: 'Custom', desc: 'For large organizations', features: ['Unlimited requests', 'Dedicated infrastructure', '24/7 SLA support', 'SSO & Audit Logs', 'On-premise deployment'] }
                                ]
                            }
                        }
                    ]
                };
                sections.push(pricingSection);
                resolved = { ...resolved, sections };
            }
        }

        return resolved;
    }, [apiPage, slug]);

    // Check if template exists
    const TemplateComponent = useMemo(() => {
        if (!page?.template_slug) return null;
        return getTemplateComponent(page.template_slug);
    }, [page?.template_slug]);

    // Check if the first block is a Hero block to avoid double padding (only for default layout)
    const hasHero = useMemo(() => {
        if (!page?.sections?.length) return false;
        const firstSection = [...page.sections].sort((a, b) => a.order - b.order)[0];
        if (!firstSection?.blocks?.length) return false;
        const firstBlock = [...firstSection.blocks].sort((a, b) => a.order - b.order)[0];
        const type = firstBlock.block_type || firstBlock.type;
        return type === 'hero';
    }, [page]);

    // Find the very first heading block on the page if there is no Hero block
    const firstHeadingBlockId = useMemo(() => {
        if (hasHero) return null;
        if (!page?.sections?.length) return null;
        
        const sortedSections = [...page.sections].sort((a, b) => a.order - b.order);
        for (const sec of sortedSections) {
            if (sec.blocks?.length) {
                const sortedBlocks = [...sec.blocks].sort((a, b) => a.order - b.order);
                for (const blk of sortedBlocks) {
                    const type = blk.block_type || blk.type;
                    if (type === 'heading') {
                        return blk.id;
                    }
                }
            }
        }
        return null;
    }, [page, hasHero]);

    // Show loading only if we are waiting for API AND have no fallback
    if (isLoading && !page) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!page) {
        // Fallback to static page component based on slug
        switch (slug) {
            case 'pricing':
                return <PricingPage />;
            case 'customers':
                return <Customers />;
            case 'changelog':
                return <Changelog />;
            case 'contact-us':
                return <ContactPage />;
            case 'login':
            case 'signin':
                return <SignIn />;
            case 'signup':
                return <SignUp />;
            case 'style-guide':
                return <StyleGuide />;
        }

        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
                <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
                    404
                </h1>
                <p className="text-xl text-slate-400 mb-8">Page not found</p>
                <Link to="/" className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                    Go Home
                </Link>
            </div>
        );
    }

    // Render Template if available
    if (TemplateComponent) {
        return (
            <>
                <SeoHead meta={page.seo_meta} defaultTitle={page.title} />
                <TemplateComponent page={page} />
            </>
        );
    }

    // Default Layout Rendering
    return (
        <div className={`relative ${!hasHero ? 'pt-24' : ''}`}>
            <SeoHead meta={page.seo_meta} defaultTitle={page.title} />
            
            {/* Render Sections */}
            {page.sections?.sort((a, b) => a.order - b.order).map((section) => (
                <section 
                    key={section.id} 
                    className={`relative ${section.type === 'full-width' ? 'w-full' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'}`}
                >
                    {/* Render Blocks within Section */}
                    {section.blocks?.sort((a, b) => a.order - b.order).map((block) => (
                        <BlockRenderer 
                            key={block.id} 
                            block={block} 
                            isFirstHeading={block.id === firstHeadingBlockId}
                        />
                    ))}
                </section>
            ))}
        </div>
    );
};

export default DynamicPage;
