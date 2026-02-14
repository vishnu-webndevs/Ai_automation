import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { pageService } from '../services/api';
import { Page } from '../types';
import { Calendar, ArrowRight } from 'lucide-react';

interface BlogGridProps {
    columns?: number;
    show_categories?: boolean;
    limit?: number;
}

const BlogGrid: React.FC<BlogGridProps> = ({ columns = 3, show_categories = true, limit }) => {
    const [blogs, setBlogs] = useState<Page[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const response = await pageService.getBlogs(1);
                // Filter out the current page if needed, or just take the list
                let fetchedBlogs = response.data || [];
                
                if (limit) {
                    fetchedBlogs = fetchedBlogs.slice(0, limit);
                }
                
                setBlogs(fetchedBlogs);
            } catch (error) {
                console.error('Failed to fetch blogs', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBlogs();
    }, [limit]);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
                <div className={`grid grid-cols-1 md:grid-cols-${columns > 1 ? '2' : '1'} lg:grid-cols-${columns} gap-8`}>
                    {Array.from({ length: columns }).map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="bg-slate-800 h-48 rounded-2xl mb-4"></div>
                            <div className="h-4 bg-slate-800 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-slate-800 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (blogs.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-slate-400">No blog posts found.</p>
            </div>
        );
    }

    // List View (Horizontal Card) for 1 column
    if (columns === 1) {
        return (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
                {blogs.map((blog) => (
                    <Link 
                        key={blog.id} 
                        to={`/${blog.slug}`}
                        className="group bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all duration-300 flex flex-col md:flex-row h-full md:h-64"
                    >
                        {/* Image (Left side on desktop) */}
                        <div className="md:w-2/5 h-48 md:h-full bg-slate-800 relative overflow-hidden shrink-0">
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
                            
                            {show_categories && blog.blog_categories && blog.blog_categories.length > 0 && (
                                <div className="absolute top-4 left-4">
                                    <span className="bg-purple-600/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full">
                                        {blog.blog_categories[0].name}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Content (Right side) */}
                        <div className="p-6 md:p-8 flex-1 flex flex-col justify-center">
                            <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    <span>{new Date(blog.created_at || Date.now()).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors line-clamp-2">
                                {blog.title}
                            </h3>

                            <p className="text-slate-400 text-sm mb-6 line-clamp-2">
                                {blog.seo_meta?.meta_description || 'No description available.'}
                            </p>

                            <div className="flex items-center text-purple-400 text-sm font-medium group-hover:translate-x-1 transition-transform mt-auto">
                                Read Article <ArrowRight className="w-4 h-4 ml-1" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        );
    }

    // Grid View for 2+ columns
    const gridCols = {
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    }[columns] || 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
            <div className={`grid ${gridCols} gap-8`}>
                {blogs.map((blog) => (
                    <Link 
                        key={blog.id} 
                        to={`/${blog.slug}`}
                        className="group bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all duration-300 flex flex-col h-full"
                    >
                        {/* Image */}
                        <div className="aspect-video bg-slate-800 relative overflow-hidden">
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
                            
                            {show_categories && blog.blog_categories && blog.blog_categories.length > 0 && (
                                <div className="absolute top-4 left-4">
                                    <span className="bg-purple-600/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full">
                                        {blog.blog_categories[0].name}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="p-6 flex-1 flex flex-col">
                            {/* Meta */}
                            <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    <span>{new Date(blog.created_at || Date.now()).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors line-clamp-2">
                                {blog.title}
                            </h3>

                            <p className="text-slate-400 text-sm mb-6 line-clamp-3 flex-1">
                                {blog.seo_meta?.meta_description || 'No description available.'}
                            </p>

                            <div className="flex items-center text-purple-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                                Read Article <ArrowRight className="w-4 h-4 ml-1" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default BlogGrid;
