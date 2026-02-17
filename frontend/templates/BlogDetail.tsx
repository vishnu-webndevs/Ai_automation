import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import useSWR from 'swr';
import { pageService, blogCategoryService } from '../services/api';
import BlockRenderer from '../components/BlockRenderer';
import SeoHead from '../components/seo/SeoHead';
import type { BlogCategory, Page, PageSection } from '../types';

const BlogDetail: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const { data: page, isLoading, error } = useSWR<Page | undefined>(
        slug ? `blog-${slug}` : null,
        () => pageService.getBySlug(slug!)
    );
    const { data: recentPosts } = useSWR('recent-posts', () => pageService.getBlogs(1));
    const { data: categories } = useSWR<BlogCategory[]>('blog-categories', blogCategoryService.getAll);

    const [search, setSearch] = useState('');

    const otherPosts = useMemo(() => {
        const list = (recentPosts as any)?.data || [];
        if (!page) return list;
        return list.filter((p: Page) => p.id !== page.id);
    }, [recentPosts, page]);

    const filteredPosts = useMemo(() => {
        if (!search.trim()) return otherPosts.slice(0, 5);
        const q = search.toLowerCase();
        return otherPosts
            .filter((p) => {
                const title = p.title?.toLowerCase() || '';
                const desc = p.seo_meta?.meta_description?.toLowerCase() || '';
                return title.includes(q) || desc.includes(q);
            })
            .slice(0, 5);
    }, [otherPosts, search]);

    if (isLoading) return <div className="text-center py-20 text-white">Loading article...</div>;
    if (error || !page) return <div className="text-center py-20 text-white">Article not found</div>;

    const sortedSections: PageSection[] = [...(page.sections || [])].sort((a, b) => a.order - b.order);

    const articleBlockTypes = new Set([
        'text',
        'heading',
        'paragraph',
        'list',
        'button',
        'faq_list',
        'internal_links',
        'cta_bottom',
    ]);

    const contentSections: PageSection[] = sortedSections
        .map((section) => {
            const blocks = (section.blocks || [])
                .slice()
                .sort((a, b) => a.order - b.order)
                .filter((block) => {
                    const type = (block.block_type || block.type || '').toLowerCase();
                    if (!type) return false;
                    if (type.includes('hero')) return false;
                    return articleBlockTypes.has(type);
                });
            return { ...section, blocks };
        })
        .filter((section) => section.blocks && section.blocks.length > 0);

    const featuredImage = page.seo_meta?.og_image;

    return (
        <div className="bg-slate-950 min-h-screen">
            <SeoHead meta={page.seo_meta} defaultTitle={page.title} />

            <section className="relative pt-28 pb-10 px-4 sm:px-6 lg:px-8 overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-r from-purple-700/40 via-purple-900/40 to-slate-950 pointer-events-none" />
                <div className="relative max-w-6xl mx-auto">
                    <div className="mb-6">
                        <p className="text-xs font-semibold tracking-[0.25em] uppercase text-purple-300 mb-2">
                            Article
                        </p>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 leading-tight">
                            {page.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                            <span>{new Date(page.created_at || Date.now()).toLocaleDateString()}</span>
                            {page.blog_categories && page.blog_categories.length > 0 && (
                                <>
                                    <span className="text-slate-600">•</span>
                                    <span className="text-purple-300">
                                        {page.blog_categories.map((c: any) => c.name).join(', ')}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <section className="px-4 sm:px-6 lg:px-8 pb-20">
                <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-10 items-start">
                    <article className="lg:col-span-2 space-y-8">
                        {featuredImage && (
                            <div className="rounded-3xl overflow-hidden border border-slate-800 bg-slate-900/80 shadow-2xl">
                                <img
                                    src={featuredImage}
                                    alt={page.title}
                                    className="w-full h-full max-h-[420px] object-cover"
                                />
                            </div>
                        )}

                        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 md:p-8">
                            {contentSections.map((section) => (
                                <section key={section.id} className="mb-10 last:mb-0">
                                    {section.blocks?.map((block) => (
                                        <BlockRenderer key={block.id} block={block} page={page} />
                                    ))}
                                </section>
                            ))}
                        </div>
                    </article>

                    <aside className="space-y-6">
                        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6">
                            <h2 className="text-sm font-semibold text-white mb-3">Search</h2>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search articles..."
                                className="w-full rounded-full bg-slate-950/80 border border-slate-700 px-4 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                            />
                        </div>

                        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6">
                            <h2 className="text-sm font-semibold text-white mb-3">Categories</h2>
                            <ul className="space-y-2 text-xs text-slate-300">
                                {categories?.map((cat) => (
                                    <li key={cat.id}>
                                        <Link
                                            to={`/blog/category/${cat.slug}`}
                                            className="flex items-center justify-between hover:text-purple-300 transition-colors"
                                        >
                                            <span>{cat.name}</span>
                                            <span className="text-[10px] bg-slate-800 px-2 py-1 rounded-full text-slate-400">
                                                {cat.pages_count ?? 0}
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                                {(!categories || categories.length === 0) && (
                                    <li className="text-slate-500">No categories yet.</li>
                                )}
                            </ul>
                        </div>

                        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6">
                            <h2 className="text-sm font-semibold text-white mb-3">Recent posts</h2>
                            <div className="space-y-4 text-xs text-slate-300">
                                {filteredPosts.map((post) => (
                                    <Link
                                        key={post.id}
                                        to={`/blog/${post.slug}`}
                                        className="block group"
                                    >
                                        <p className="font-medium text-slate-100 group-hover:text-purple-300 mb-1 line-clamp-2">
                                            {post.title}
                                        </p>
                                        <p className="text-[11px] text-slate-500">
                                            {new Date(post.created_at || Date.now()).toLocaleDateString(undefined, {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })}
                                        </p>
                                    </Link>
                                ))}
                                {filteredPosts.length === 0 && (
                                    <p className="text-slate-500">No recent posts found.</p>
                                )}
                            </div>
                        </div>

                        <div className="rounded-3xl bg-gradient-to-b from-purple-700/40 via-slate-950 to-slate-950 border border-purple-500/60 p-6 flex flex-col justify-between min-h-[220px]">
                            <div>
                                <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-purple-200 mb-2">
                                    Newsletter
                                </p>
                                <h3 className="text-md font-bold text-white mb-2">
                                    Stay ahead of AI rollouts
                                </h3>
                                <p className="text-xs text-slate-200">
                                    A short, practical email when we ship something new to production.
                                </p>
                            </div>
                            <button className="mt-4 inline-flex items-center justify-center rounded-full bg-white text-slate-950 text-xs font-semibold px-5 py-2 hover:bg-slate-200 transition-colors">
                                Join the list
                            </button>
                        </div>
                    </aside>
                </div>
            </section>

            <section className="pb-20 pt-4 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto rounded-[2.5rem] bg-gradient-to-br from-purple-900 via-slate-950 to-emerald-900 border border-slate-800 overflow-hidden">
                    <div className="grid md:grid-cols-2 gap-0">
                        <div className="p-8 md:p-10 flex flex-col justify-center">
                            <p className="text-xs font-semibold tracking-[0.25em] uppercase text-purple-200 mb-2">
                                Start a project
                            </p>
                            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                                Let’s make something great together
                            </h2>
                            <p className="text-sm text-slate-200 mb-6">
                                If this article matches a problem you are facing, we can help you design, launch and monitor the AI services behind it.
                            </p>
                            <button className="inline-flex items-center justify-center rounded-full bg-white text-slate-950 text-sm font-semibold px-6 py-2.5 hover:bg-slate-200 transition-colors">
                                Talk to our team
                            </button>
                        </div>
                        <div className="relative bg-gradient-to-tl from-black via-purple-900/40 to-emerald-900/40">
                            <div className="absolute -bottom-16 right-0 left-0 mx-auto w-64 h-64 rounded-full bg-purple-500/40 blur-[80px]" />
                            <div className="relative h-full flex items-center justify-center py-10">
                                <div className="w-40 h-40 rounded-full border border-purple-300/50 bg-black/40 flex items-center justify-center text-5xl">
                                    <span>📰</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default BlogDetail;
