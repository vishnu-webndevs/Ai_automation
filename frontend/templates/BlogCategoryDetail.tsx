import React from 'react';
import { useParams, Link } from 'react-router-dom';
import useSWR from 'swr';
import { blogCategoryService } from '../services/api';

const BlogCategoryDetail: React.FC<{ initialData?: any }> = ({ initialData }) => {
    const { slug } = useParams() as { slug: string };
    const { data: category, isLoading, error } = useSWR(
        slug ? `blog-category-${slug}` : null, 
        () => blogCategoryService.getBySlug(slug as string),
        { fallbackData: initialData }
    );
    const [activeFaq, setActiveFaq] = React.useState<number | null>(null);

    if (isLoading && !category) return <div className="text-center py-20 text-white">Loading category...</div>;
    if (error || !category) return <div className="text-center py-20 text-white">Category not found</div>;

    const faqs = [
        {
            question: `What articles are included in the ${category.name} category?`,
            answer: category.description || `In this section, we cover various topics and guides relating to ${category.name}.`
        },
        {
            question: `Why choose Totan AI's insights on ${category.name}?`,
            answer: `Totan AI provides expert, production-grade guidelines and case studies on ${category.name} and AI-driven business automation.`
        }
    ];

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map((faq) => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
            }
        }))
    };

    return (
        <div className="bg-slate-950 min-h-screen pt-28 pb-20">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
                    <Link to="/" className="hover:text-white transition-colors">Home</Link>
                    <span className="text-slate-600">/</span>
                    <Link to="/blog" className="hover:text-white transition-colors">Blog</Link>
                    <span className="text-slate-600">/</span>
                    <span className="text-slate-300">{category.name}</span>
                </div>

                <div className="mb-12">
                    <Link to="/blog" className="inline-flex items-center text-sm font-semibold text-purple-400 hover:text-purple-300 transition-colors mb-6">
                        &larr; Back to all articles
                    </Link>
                    <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">{category.name} Category</h1>
                    <p className="text-lg text-slate-400 max-w-3xl leading-relaxed">{category.description || `Read expert articles and insights in the ${category.name} category.`}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {category.pages?.map((blog) => (
                        <Link 
                            to={`/blog/${blog.slug}`} 
                            key={blog.id}
                            className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden hover:bg-slate-800 transition-colors group flex flex-col"
                        >
                            {blog.seo_meta?.og_image && (
                                <div className="h-48 overflow-hidden">
                                    <img src={blog.seo_meta.og_image} alt={blog.title} width={400} height={200} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                </div>
                            )}
                            <div className="p-6 flex-1 flex flex-col">
                                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-purple-400 transition-colors">{blog.title}</h3>
                                <p className="text-slate-400 mb-4 line-clamp-3 flex-1">{blog.seo_meta?.meta_description}</p>
                                <span className="text-sm text-slate-500 mt-auto">{new Date(blog.created_at || Date.now()).toLocaleDateString()}</span>
                            </div>
                        </Link>
                    ))}
                    {(!category.pages || category.pages.length === 0) && (
                        <div className="col-span-full text-center text-slate-500">
                            No articles found in this category.
                        </div>
                    )}
                </div>

                {/* FAQ Accordion Section */}
                <section className="mt-20 max-w-3xl mx-auto border-t border-slate-800 pt-16">
                    <h2 className="text-2xl font-bold text-white mb-8 text-center">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {faqs.map((faq, idx) => (
                            <div key={idx} className="border border-slate-800 rounded-xl bg-slate-900/20 overflow-hidden">
                                <button 
                                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                                    className="w-full text-left px-6 py-4 flex justify-between items-center text-slate-100 hover:text-white font-medium focus:outline-none"
                                >
                                    <span>{faq.question}</span>
                                    <span className="text-purple-400 text-lg">{activeFaq === idx ? '&minus;' : '+'}</span>
                                </button>
                                {activeFaq === idx && (
                                    <div className="px-6 pb-4 text-slate-400 text-sm leading-relaxed border-t border-slate-850 pt-3">
                                        {faq.answer}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default BlogCategoryDetail;
