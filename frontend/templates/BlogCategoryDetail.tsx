import React from 'react';
import { useParams, Link } from 'react-router-dom';
import useSWR from 'swr';
import { blogCategoryService } from '../services/api';

const BlogCategoryDetail: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const { data: category, isLoading, error } = useSWR(slug ? `blog-category-${slug}` : null, () => blogCategoryService.getBySlug(slug!));

    if (isLoading) return <div className="text-center py-20 text-white">Loading category...</div>;
    if (error || !category) return <div className="text-center py-20 text-white">Category not found</div>;

    return (
        <div className="bg-slate-900 min-h-screen pt-32 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-white mb-4">{category.name}</h1>
                    <p className="text-xl text-slate-400">{category.description}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {category.pages?.map((blog) => (
                        <Link 
                            to={`/blog/${blog.slug}`} 
                            key={blog.id}
                            className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden hover:bg-slate-800 transition-colors group flex flex-col"
                        >
                            {blog.seo_meta?.og_image && (
                                <div className="h-48 overflow-hidden">
                                    <img src={blog.seo_meta.og_image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                </div>
                            )}
                            <div className="p-6 flex-1 flex flex-col">
                                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-purple-400 transition-colors">{blog.title}</h3>
                                <p className="text-slate-400 mb-4 line-clamp-3 flex-1">{blog.seo_meta?.meta_description}</p>
                                <span className="text-sm text-slate-500 mt-auto">{new Date(blog.created_at).toLocaleDateString()}</span>
                            </div>
                        </Link>
                    ))}
                    {(!category.pages || category.pages.length === 0) && (
                        <div className="col-span-full text-center text-slate-500">
                            No articles found in this category.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BlogCategoryDetail;
