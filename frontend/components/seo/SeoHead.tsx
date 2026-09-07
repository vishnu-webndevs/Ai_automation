import React from 'react';
import { Helmet } from 'react-helmet-async';
import { SeoMeta } from '../../types';

interface SeoHeadProps {
    meta?: SeoMeta | null;
    defaultTitle?: string;
}

const SeoHead: React.FC<SeoHeadProps> = ({ meta, defaultTitle = 'Totan.ai' }) => {
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    const rawCanonical = meta?.canonical_url || `https://totan.ai${currentPath}`;
    const canonicalUrl = rawCanonical.replace('://www.totan.ai', '://totan.ai');

    if (!meta) {
        return (
            <Helmet>
                <title>{defaultTitle}</title>
                <link rel="canonical" href={canonicalUrl} />
            </Helmet>
        );
    }

    return (
        <Helmet>
            <title>{meta.meta_title || meta.og_title || defaultTitle}</title>
            <meta name="description" content={meta.meta_description || meta.og_description || ''} />
            <link rel="canonical" href={canonicalUrl} />
            
            {/* OpenGraph */}
            <meta property="og:title" content={meta.og_title || meta.meta_title || defaultTitle} />
            <meta property="og:description" content={meta.og_description || meta.meta_description || ''} />
            {meta.og_image && <meta property="og:image" content={meta.og_image} />}
            <meta property="og:type" content="website" />
            
            {/* Twitter */}
            <meta name="twitter:card" content={meta.twitter_card || 'summary_large_image'} />
            <meta name="twitter:title" content={meta.meta_title || defaultTitle} />
            <meta name="twitter:description" content={meta.meta_description || ''} />
            {meta.og_image && <meta name="twitter:image" content={meta.og_image} />}

            {/* Robots */}
            {(meta.noindex || meta.nofollow) && (
                <meta 
                    name="robots" 
                    content={`${meta.noindex ? 'noindex' : 'index'}, ${meta.nofollow ? 'nofollow' : 'follow'}`} 
                />
            )}

            {/* Schema Markup */}
            {meta.schema_markup && (
                <script type="application/ld+json">
                    {JSON.stringify(meta.schema_markup)}
                </script>
            )}
        </Helmet>
    );
};

export default SeoHead;
