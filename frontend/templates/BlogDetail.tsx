import React from 'react';
import { useParams, Link } from 'react-router-dom';
import useSWR from 'swr';
import { pageService } from '../services/api';
import BlockRenderer from '../components/BlockRenderer';
import SeoHead from '../components/seo/SeoHead';

const BlogDetail: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const { data: page, isLoading, error } = useSWR(slug ? `blog-${slug}` : null, () => pageService.getBySlug(slug!));
    const { data: recentPosts } = useSWR('recent-posts', () => pageService.getBlogs(1));

    if (isLoading) return <div className="text-center py-20 text-white">Loading article...</div>;
    if (error || !page) return <div className="text-center py-20 text-white">Article not found</div>;

    // Check if the first block is a Hero block
    const hasHero = page.sections?.length > 0 && 
        page.sections.sort((a, b) => a.order - b.order)[0].blocks?.length > 0 && 
        page.sections.sort((a, b) => a.order - b.order)[0].blocks.sort((a, b) => a.order - b.order)[0].block_type.includes('hero');

    return (
        <div className="bg-slate-900 min-h-screen">
            <SeoHead meta={page.seo_meta} defaultTitle={page.title} />
            
            {/* Blog Header - Only show if NO Hero block */}
            {!hasHero && (
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
            )}

            {/* Blog Content Area with Sidebar */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    
                    {/* Main Article Content */}
                    <article className="lg:col-span-2">
                        {page.sections?.sort((a, b) => a.order - b.order).map((section) => (
                            <section key={section.id} className="mb-12">
                                {section.blocks?.sort((a, b) => a.order - b.order).map((block) => (
                                    <BlockRenderer key={block.id} block={block} page={page} />
                                ))}
                            </section>
                        ))}
                    </article>

                    {/* Sidebar */}
                    <aside className="lg:col-span-1 space-y-8">
                        {/* Recent Posts Widget */}
                        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 backdrop-blur-sm sticky top-24">
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
                                Recent Posts
                            </h3>
                            <div className="space-y-6">
                                {recentPosts?.data?.filter((p: any) => p.id !== page.id).slice(0, 5).map((post: any) => (
                                    <Link 
                                        key={post.id} 
                                        to={`/blog/${post.slug}`} 
                                        className="group block"
                                    >
                                        <h4 className="text-slate-200 group-hover:text-purple-400 transition-colors font-medium line-clamp-2 mb-2">
                                            {post.title}
                                        </h4>
                                        <div className="flex items-center text-xs text-slate-500 gap-2">
                                            <span>{new Date(post.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                        </div>
                                    </Link>
                                ))}
                                {(!recentPosts?.data || recentPosts.data.length === 0) && (
                                    <p className="text-slate-500 text-sm">No recent posts found.</p>
                                )}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default BlogDetail;
