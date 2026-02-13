import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Page, BlogCategory } from '../../types';
import SectionRenderer from '../../components/SectionRenderer';
import { blogCategoryService, pageService } from '../../services/api';

interface TemplateProps {
    page: Page;
}

const BlogModernTemplate: React.FC<TemplateProps> = ({ page }) => {
    // Sort sections by order
    const sortedSections = [...(page.sections || [])].sort((a, b) => a.order - b.order);

    const [categories, setCategories] = useState<BlogCategory[]>([]);
    const [recentPosts, setRecentPosts] = useState<Page[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [cats, posts] = await Promise.all([
                    blogCategoryService.getAll(),
                    pageService.getBlogs(1)
                ]);
                setCategories(cats);
                setRecentPosts(posts.data ? posts.data.slice(0, 5) : []);
            } catch (error) {
                console.error('Failed to fetch sidebar data', error);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="blog-modern-template min-h-screen bg-slate-900 text-slate-200">
            {/* Optional: Add a custom hero or header specific to this template if needed */}
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Main Content Area */}
                    <div className="lg:col-span-8">
                        {sortedSections.map((section) => (
                            <SectionRenderer key={section.id} section={section} className="mb-12" />
                        ))}
                    </div>

                    {/* Sidebar Area (Placeholder for now, or could be dynamic) */}
                    <aside className="lg:col-span-4 hidden lg:block">
                        <div className="sticky top-24 space-y-8">
                            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                                <h3 className="text-lg font-bold mb-4 text-white">About</h3>
                                <p className="text-slate-400 text-sm">
                                    Welcome to our modern blog. Here we share the latest insights and updates.
                                </p>
                            </div>
                            
                            {/* Categories Widget */}
                            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 shadow-sm">
                                <h3 className="text-lg font-bold mb-4 text-white">Categories</h3>
                                <ul className="space-y-2">
                                    {categories.map((category) => (
                                        <li key={category.id}>
                                            <Link 
                                                to={`/category/${category.slug}`} 
                                                className="text-slate-400 hover:text-purple-400 transition-colors flex justify-between items-center"
                                            >
                                                <span>{category.name}</span>
                                                <span className="text-xs bg-slate-700 px-2 py-1 rounded-full text-slate-300">{category.pages_count || 0}</span>
                                            </Link>
                                        </li>
                                    ))}
                                    {categories.length === 0 && (
                                        <li className="text-sm text-slate-500">No categories found</li>
                                    )}
                                </ul>
                            </div>

                            {/* Recent Posts Widget */}
                            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 shadow-sm">
                                <h3 className="text-lg font-bold mb-4 text-white">Recent Posts</h3>
                                <ul className="space-y-4">
                                    {recentPosts.map((post) => (
                                        <li key={post.id} className="group">
                                            <Link to={`/${post.slug}`} className="flex gap-4">
                                                <div className="w-16 h-16 bg-slate-700 rounded-lg overflow-hidden flex-shrink-0">
                                                    {post.seo_meta?.og_image ? (
                                                        <img src={post.seo_meta.og_image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-500">📝</div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-semibold text-slate-200 group-hover:text-purple-400 transition-colors line-clamp-2">{post.title}</h4>
                                                    <span className="text-xs text-slate-500 mt-1 block">{new Date(post.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </Link>
                                        </li>
                                    ))}
                                     {recentPosts.length === 0 && (
                                        <li className="text-sm text-slate-500">No recent posts found</li>
                                    )}

                                </ul>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default BlogModernTemplate;
