import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import useSWR from 'swr';
import { Helmet } from 'react-helmet-async';
import { serviceCategoryService } from '../services/api';
import type { ServiceCategory } from '../types';

const toMetaDescription = (value: string) => {
    const normalized = value.replace(/\s+/g, ' ').trim();
    if (normalized.length <= 160) return normalized;
    return normalized.slice(0, 157).trim() + '...';
};

const ServiceCategoryDetail: React.FC<{ initialData?: any }> = ({ initialData }) => {
    const { slug } = useParams<{ slug: string }>();
    const { data: category, isLoading, error } = useSWR<ServiceCategory>(
        slug ? `service-category-${slug}` : null,
        () => serviceCategoryService.getBySlug(slug!),
        { fallbackData: initialData }
    );

    const metaTitle = useMemo(() => {
        if (!category) return 'Service Category | Totan.ai';
        return `${category.name} Services | Totan.ai`;
    }, [category]);

    const metaDescription = useMemo(() => {
        if (!category) return 'Explore services by category on Totan.ai.';
        const base = category.description || `Explore ${category.name} services on Totan.ai.`;
        return toMetaDescription(base);
    }, [category]);

    if (isLoading) return <div className="text-center py-20 text-white">Loading category...</div>;
    if (error || !category) return <div className="text-center py-20 text-white">Category not found</div>;

    return (
        <div className="bg-slate-950 min-h-screen pt-28 pb-20">
            <Helmet>
                <title>{metaTitle}</title>
                <meta name="description" content={metaDescription} />
            </Helmet>

            <header className="px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-2 text-sm text-slate-200">
                        <Link to="/services" className="hover:text-white transition-colors">Services</Link>
                        <span className="text-slate-500">/</span>
                        <span className="text-slate-100">{category.name}</span>
                    </div>

                    <h1 className="mt-6 text-4xl sm:text-5xl font-bold text-white tracking-tight">
                        {category.name} Services
                    </h1>
                    <p className="mt-4 text-base text-slate-300 max-w-3xl">
                        {category.description || `Browse Totan.ai services in the ${category.name} category.`}
                    </p>
                </div>
            </header>

            <main className="mt-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    {(!category.services || category.services.length === 0) ? (
                        <div className="text-center text-slate-400 py-16">
                            No services found in this category.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {category.services.map((service) => (
                                <Link
                                    key={service.id}
                                    to={`/services/${service.slug}`}
                                    className="group rounded-3xl bg-slate-900/45 border border-slate-800 p-6 hover:border-slate-700 transition-colors"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-xl">
                                            <span>{(service as any).icon || '🤖'}</span>
                                        </div>
                                        <div className="flex-1">
                                            <h2 className="text-base font-semibold text-white group-hover:text-purple-200 transition-colors">
                                                {service.name}
                                            </h2>
                                            <p className="mt-2 text-base text-slate-300 leading-relaxed line-clamp-3">
                                                {(service as any).short_description || 'Explore this service for workflows and outcomes.'}
                                            </p>
                                            <div className="mt-4 inline-flex items-center text-sm font-semibold text-purple-300 group-hover:text-purple-200">
                                                View service
                                                <span className="ml-2 transition-transform group-hover:translate-x-0.5">→</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ServiceCategoryDetail;

