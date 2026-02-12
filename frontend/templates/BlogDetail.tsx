import React from 'react';
import { useParams } from 'react-router-dom';
import useSWR from 'swr';
import { pageService } from '../services/api';
import BlockRenderer from '../components/BlockRenderer';
import SeoHead from '../components/seo/SeoHead';

const BlogDetail: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const { data: page, isLoading, error } = useSWR(slug ? `blog-${slug}` : null, () => pageService.getBySlug(slug!));

    if (isLoading) return <div className="text-center py-20 text-white">Loading article...</div>;
    if (error || !page) return <div className="text-center py-20 text-white">Article not found</div>;

    return (
        <div className="bg-slate-900 min-h-screen">
            <SeoHead meta={page.seo_meta} defaultTitle={page.title} />
            
            {/* Blog Header */}
            <div className="relative pt-32 pb-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                        {page.title}
                    </h1>
                    <div className="flex items-center justify-center space-x-4 text-slate-400 text-sm">
                        <span>{new Date(page.created_at).toLocaleDateString()}</span>
                        {page.blog_categories && page.blog_categories.length > 0 && (
                            <>
                                <span>•</span>
                                <span className="text-purple-400">{page.blog_categories.map((c: any) => c.name).join(', ')}</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Blog Content */}
            <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                {page.sections?.sort((a, b) => a.sort_order - b.sort_order).map((section) => (
                    <section key={section.id} className="mb-12">
                        {section.blocks?.sort((a, b) => a.sort_order - b.sort_order).map((block) => (
                            <BlockRenderer key={block.id} block={block} />
                        ))}
                    </section>
                ))}
            </article>
        </div>
    );
};

export default BlogDetail;
