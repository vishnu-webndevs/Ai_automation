import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import useSWR from 'swr';
import { pageService, blogCategoryService } from '../services/api';
import BlockRenderer from '../components/BlockRenderer';
import SeoHead from '../components/seo/SeoHead';
import type { BlogCategory, Page, PageSection } from '../types';

const BlogDetail: React.FC<{ initialData?: any }> = ({ initialData }) => {
    const { slug } = useParams<{ slug: string }>();
    const { data: page, isLoading, error } = useSWR<Page | undefined>(
        slug ? `blog-${slug}` : null,
        () => pageService.getBySlug(slug!),
        { fallbackData: initialData }
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

    const prevNext = useMemo(() => {
        const list = (recentPosts as any)?.data || [];
        const index = list.findIndex((p: any) => p.id === page?.id);
        if (index === -1) return { prev: null, next: null };
        return {
            prev: index < list.length - 1 ? list[index + 1] : null,
            next: index > 0 ? list[index - 1] : null
        };
    }, [recentPosts, page?.id]);

    if (isLoading && !page) return <div className="text-center py-20 text-white">Loading article...</div>;
    if (error || !page) return <div className="text-center py-20 text-white">Article not found</div>;

    const sortedSections: PageSection[] = [...(page.sections || [])].sort((a, b) => a.order - b.order);

    const contentSections: PageSection[] = sortedSections
        .map((section) => {
            const blocks = (section.blocks || [])
                .slice()
                .sort((a, b) => a.order - b.order)
                .filter((block) => {
                    const type = (block.block_type || block.type || '').toLowerCase();
                    if (!type) return false;
                    if (type.includes('hero')) return false;
                    return true;
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
                    {/* Breadcrumbs */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-6">
                        <Link to="/" className="hover:text-white transition-colors">Home</Link>
                        <span className="text-slate-600">/</span>
                        <Link to="/blog" className="hover:text-white transition-colors">Blog</Link>
                        {page.blog_categories && page.blog_categories.length > 0 && (
                            <>
                                <span className="text-slate-600">/</span>
                                <Link to={`/blog/category/${page.blog_categories[0].slug}`} className="hover:text-white transition-colors">
                                    {page.blog_categories[0].name}
                                </Link>
                            </>
                        )}
                        <span className="text-slate-600">/</span>
                        <span className="text-slate-300 line-clamp-1">{page.title}</span>
                    </div>

                    <div className="mb-6">
                        <p className="text-xs font-semibold tracking-[0.25em] uppercase text-purple-300 mb-2">
                            Article
                        </p>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 leading-tight">
                            {page.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                            <span>Published: {new Date(page.created_at || Date.now()).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>Updated: {new Date(page.updated_at || page.created_at || Date.now()).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>By Totan Team</span>
                            {page.blog_categories && page.blog_categories.length > 0 && (
                                <>
                                    <span>•</span>
                                    <span className="text-purple-300">
                                        {page.blog_categories.map((c: any) => c.name).join(', ')}
                                    </span>
                                </>
                            )}
                        </div>

                        {/* Tags */}
                        {page.blog_tags && page.blog_tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-4">
                                {page.blog_tags.map((tag: any) => (
                                    <Link 
                                        key={tag.id} 
                                        to={`/blog/tag/${tag.slug}`} 
                                        className="text-[10px] uppercase bg-slate-800/80 hover:bg-slate-700 px-3 py-1 rounded-full text-slate-300 transition-colors border border-slate-700/50"
                                    >
                                        #{tag.name}
                                    </Link>
                                ))}
                            </div>
                        )}
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
                                    width={800}
                                    height={420}
                                    fetchPriority="high"
                                    decoding="async"
                                    className="w-full h-full max-h-[420px] object-cover"
                                />
                            </div>
                        )}

                        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 md:p-8">
                            {contentSections.length === 0 ? (
                                <div className="text-slate-300">Content not generated yet. Generate AI content from admin panel.</div>
                            ) : (
                                contentSections.map((section) => (
                                    <section key={section.id} className="mb-10 last:mb-0">
                                        {section.blocks?.map((block) => (
                                            <BlockRenderer key={block.id} block={block} page={page} />
                                        ))}
                                    </section>
                                ))
                            )}
                        </div>

                        {/* Previous / Next Article Navigation */}
                        {(prevNext.prev || prevNext.next) && (
                            <div className="mt-12 pt-6 border-t border-slate-800/80 flex justify-between gap-4">
                                {prevNext.prev ? (
                                    <Link to={`/blog/${prevNext.prev.slug}`} className="text-left group max-w-[45%]">
                                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Previous Post</p>
                                        <p className="text-sm font-semibold text-slate-300 group-hover:text-purple-400 transition-colors line-clamp-1">{prevNext.prev.title}</p>
                                    </Link>
                                ) : <div />}
                                
                                {prevNext.next ? (
                                    <Link to={`/blog/${prevNext.next.slug}`} className="text-right group max-w-[45%]">
                                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Next Post</p>
                                        <p className="text-sm font-semibold text-slate-300 group-hover:text-purple-400 transition-colors line-clamp-1">{prevNext.next.title}</p>
                                    </Link>
                                ) : <div />}
                            </div>
                        )}
                    </article>

                    <aside className="space-y-6">
                        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6">
                            <h2 className="text-sm font-semibold text-white mb-3">Search</h2>
                            <input
                                type="text"
                                aria-label="Search articles"
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
                    </aside>
                </div>
            </section>
        </div>
    );
};

export default BlogDetail;
