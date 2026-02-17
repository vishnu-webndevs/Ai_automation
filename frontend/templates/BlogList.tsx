import React, { useState, useMemo } from 'react';
import useSWR from 'swr';
import { Link } from 'react-router-dom';
import { pageService, blogCategoryService } from '../services/api';
import type { BlogCategory, Page } from '../types';

const BlogList: React.FC = () => {
    const { data: blogData, isLoading } = useSWR('blogs', () => pageService.getBlogs(1));
    const { data: categories } = useSWR<BlogCategory[]>('blog-categories', blogCategoryService.getAll);
    const blogs: Page[] = blogData?.data || [];

    const [search, setSearch] = useState('');

    const filteredBlogs = useMemo(() => {
        if (!search.trim()) return blogs;
        const q = search.toLowerCase();
        return blogs.filter((b) => {
            const title = b.title?.toLowerCase() || '';
            const desc = b.seo_meta?.meta_description?.toLowerCase() || '';
            return title.includes(q) || desc.includes(q);
        });
    }, [blogs, search]);

    if (isLoading) return <div className="text-center py-20 text-white">Loading articles...</div>;

    return (
        <div className="bg-slate-950 min-h-screen">
            <section className="relative pt-28 pb-10 px-4 sm:px-6 lg:px-8 overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-r from-purple-700/40 via-purple-900/40 to-slate-950 pointer-events-none" />
                <div className="relative max-w-6xl mx-auto">
                    <div className="mb-6">
                        <p className="text-xs font-semibold tracking-[0.25em] uppercase text-purple-300 mb-2">
                            Blog
                        </p>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3">
                            Latest News
                        </h1>
                        <p className="text-sm text-slate-400 max-w-xl">
                            Stories, updates and opinions on where AI and automation are really working in production.
                        </p>
                    </div>
                </div>
            </section>

            <section className="px-4 sm:px-6 lg:px-8 pb-20">
                <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-10 items-start">
                    <div className="lg:col-span-2 space-y-6">
                        {filteredBlogs.map((blog) => (
                            <Link
                                to={`/blog/${blog.slug}`}
                                key={blog.id}
                                className="group bg-slate-900/70 border border-slate-800 rounded-3xl overflow-hidden hover:border-purple-500/60 transition-all duration-300 flex flex-col md:flex-row"
                            >
                                <div className="md:w-2/5 h-52 md:h-64 bg-slate-800 relative overflow-hidden shrink-0">
                                    {blog.seo_meta?.og_image ? (
                                        <img
                                            src={blog.seo_meta.og_image}
                                            alt={blog.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-600 bg-slate-800/50">
                                            <span className="text-4xl">📝</span>
                                        </div>
                                    )}
                                </div>

                                <div className="p-6 md:p-8 flex-1 flex flex-col">
                                    <div className="flex items-center gap-3 text-xs text-slate-400 mb-2">
                                        <span>{new Date(blog.created_at || Date.now()).toLocaleDateString()}</span>
                                        {blog.blog_categories && blog.blog_categories.length > 0 && (
                                            <>
                                                <span className="text-slate-600">•</span>
                                                <span className="text-purple-300">
                                                    {blog.blog_categories.map((c: any) => c.name).join(', ')}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors line-clamp-2">
                                        {blog.title}
                                    </h3>
                                    <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                                        {blog.seo_meta?.meta_description || 'No description available.'}
                                    </p>
                                    <div className="mt-auto flex items-center text-purple-400 text-xs sm:text-sm font-medium group-hover:translate-x-1 transition-transform">
                                        Read article
                                        <svg
                                            className="w-4 h-4 ml-1"
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
                                    </div>
                                </div>
                            </Link>
                        ))}

                        {filteredBlogs.length === 0 && (
                            <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-8 text-center text-slate-400">
                                No posts match your search right now.
                            </div>
                        )}
                    </div>

                    <aside className="space-y-6">
                        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6">
                            <h2 className="text-sm font-semibold text-white mb-3">
                                Search
                            </h2>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search articles..."
                                className="w-full rounded-full bg-slate-950/80 border border-slate-700 px-4 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                            />
                        </div>

                        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6">
                            <h2 className="text-sm font-semibold text-white mb-3">
                                Categories
                            </h2>
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
        </div>
    );
};

export default BlogList;
