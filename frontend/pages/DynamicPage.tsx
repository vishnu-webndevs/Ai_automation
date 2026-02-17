import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import useSWR from 'swr';
import { pageService } from '../services/api';
import SeoHead from '../components/seo/SeoHead';
import BlockRenderer from '../components/BlockRenderer';
import { STATIC_PAGES } from '../data/static-fallbacks';
import { getTemplateComponent } from '../templates/TemplateLoader';

const DynamicPage: React.FC = () => {
    const params = useParams();
    // Capture the catch-all route parameter (usually '*')
    const slug = params['*'] || 'home';

    const { data: apiPage, error, isLoading } = useSWR(
        slug ? `/pages/${slug}` : null,
        () => pageService.getBySlug(slug),
        {
            shouldRetryOnError: false // Don't retry if API is down, fail fast to fallback
        }
    );

    // Use API data if available, otherwise check static fallback
    const page = useMemo(() => {
        let resolved = apiPage || STATIC_PAGES[slug] || null;

        if (resolved && !resolved.template_slug && slug === 'contact-us') {
            resolved = { ...resolved, template_slug: 'contact-dark' };
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

    // Show loading only if we are waiting for API AND have no fallback
    if (isLoading && !page) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!page) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
                <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
                    404
                </h1>
                <p className="text-xl text-slate-400 mb-8">Page not found</p>
                <a href="/" className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                    Go Home
                </a>
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
                        <BlockRenderer key={block.id} block={block} />
                    ))}
                </section>
            ))}
        </div>
    );
};

export default DynamicPage;
