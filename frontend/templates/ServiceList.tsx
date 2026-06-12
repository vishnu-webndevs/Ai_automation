import React from 'react';
import useSWR from 'swr';
import { Link } from 'react-router-dom';
import { serviceCategoryService, serviceService } from '../services/api';

const ServiceList: React.FC<{ initialData?: any }> = ({ initialData }) => {
    const { data: services, error, isLoading } = useSWR('services', serviceService.getAll, {
        fallbackData: initialData?.services
    });
    const { data: categories } = useSWR('service-categories', serviceCategoryService.getAll, {
        fallbackData: initialData?.categories
    });

    const totalServices = services?.length || 0;
    const totalCategories = categories?.length || 0;
    const topCategories =
        categories
            ?.slice()
            .sort((a: any, b: any) => ((b?.services_count || 0) as number) - ((a?.services_count || 0) as number))
            .slice(0, 6) || [];
    const mostPopularCategory = topCategories[0];
    const lastUpdatedService = services
        ?.slice()
        .sort((a: any, b: any) => String(b?.updated_at || '').localeCompare(String(a?.updated_at || '')))
        .find(Boolean);

    if (isLoading) return <div className="text-center py-20 text-white">Loading services...</div>;

    if (error)
        return (
            <div className="bg-slate-950 min-h-screen flex items-center justify-center">
                <p className="text-slate-400">Unable to load services right now. Please try again later.</p>
            </div>
        );

    return (
        <div className="bg-slate-950 min-h-screen">
            <section className="relative pt-32 pb-16 overflow-hidden">
                <div className="absolute -top-40 right-0 w-[480px] h-[480px] bg-purple-700/15 blur-[140px] rounded-full pointer-events-none" />
                <div className="absolute top-40 -left-40 w-[420px] h-[420px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

                <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-purple-400 mb-3">
                                Services
                            </p>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                                AI services built around real business workflows
                            </h1>
                            <p className="text-slate-400 text-base md:text-lg mb-6 max-w-xl">
                                Instead of a single generic chatbot, we design focused AI services for your support,
                                sales and operations teams – each wired into your stack, data and compliance rules.
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <Link
                                    to="/contact-us"
                                    className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-white text-slate-900 text-sm font-semibold hover:bg-slate-200 transition-colors"
                                >
                                    Book a strategy call
                                </Link>
                                <Link
                                    to="/use-cases"
                                    className="inline-flex items-center justify-center px-5 py-2.5 rounded-full border border-slate-700 text-sm font-semibold text-slate-100 hover:bg-slate-900 transition-colors"
                                >
                                    See live use cases
                                </Link>
                            </div>
                            {topCategories.length > 0 && (
                                <div className="mt-6 flex flex-wrap gap-2">
                                    {topCategories.map((c: any) => (
                                        <Link
                                            key={c.id}
                                            to={`/services/category/${c.slug}`}
                                            className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-2 text-sm text-slate-200 hover:bg-white/10 transition-colors"
                                        >
                                            <span>{c.name}</span>
                                            {typeof c.services_count === 'number' && (
                                                <span className="text-slate-400">({c.services_count})</span>
                                            )}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="lg:pl-8">
                            <div className="relative rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/80 via-slate-900/40 to-purple-900/40 p-6 shadow-2xl">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-1">
                                            Snapshot
                                        </p>
                                        <p className="text-sm font-medium text-slate-100">
                                            {totalServices} services · {totalCategories} categories
                                        </p>
                                    </div>
                                    {mostPopularCategory && (
                                        <span className="inline-flex items-center gap-2 rounded-full bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-200">
                                            Top category: {mostPopularCategory.name}
                                        </span>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-xs">
                                    <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4">
                                        <p className="text-slate-400 mb-1">Services</p>
                                        <p className="text-slate-100 font-medium">{totalServices}</p>
                                    </div>
                                    <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4">
                                        <p className="text-slate-400 mb-1">Categories</p>
                                        <p className="text-slate-100 font-medium">{totalCategories}</p>
                                    </div>
                                    <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4">
                                        <p className="text-slate-400 mb-1">Latest update</p>
                                        <p className="text-slate-100 font-medium">
                                            {lastUpdatedService?.name || '—'}
                                        </p>
                                    </div>
                                    <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4">
                                        <p className="text-slate-400 mb-1">Outcomes</p>
                                        <p className="text-slate-100 font-medium">
                                            Speed, accuracy, visibility
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-16 border-t border-slate-900/60">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                        <div>
                            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-purple-400 mb-2">
                                Catalog
                            </p>
                            <h2 className="text-2xl md:text-3xl font-bold text-white">
                                Choose a service to start with
                            </h2>
                        </div>
                        <p className="text-sm text-slate-400 max-w-md">
                            Each service is a packaged way to deploy AI into a specific workflow.
                            Once one is live, we can extend the same stack into other parts of your business.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {services && services.length === 0 && (
                            <p className="col-span-full text-sm text-slate-500">
                                No services are available yet. Add services in the admin panel to see them here.
                            </p>
                        )}
                        {services?.map((service) => (
                            <Link
                                to={`/services/${service.slug}`}
                                key={service.id}
                                className="group bg-slate-900/70 border border-slate-800 rounded-2xl p-7 hover:border-purple-500/60 hover:bg-slate-900 transition-colors flex flex-col"
                            >
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors text-xl">
                                        <span>{(service as any).icon || '🤖'}</span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-white">
                                        {service.name}
                                    </h3>
                                </div>
                                <p className="text-slate-400 text-sm mb-4 line-clamp-3">
                                    {(service as any).short_description || 'AI service tailored for this workflow.'}
                                </p>
                                <span className="mt-auto inline-flex items-center text-xs font-medium text-purple-300 group-hover:text-purple-200">
                                    View service
                                    <svg
                                        className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-0.5 transition-transform"
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
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-16 border-t border-slate-900/60">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="grid md:grid-cols-3 gap-10">
                        <div className="md:col-span-1">
                            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-purple-400 mb-2">
                                Delivery
                            </p>
                            <h2 className="text-2xl font-bold text-white mb-3">
                                How an AI service goes live
                            </h2>
                            <p className="text-sm text-slate-400">
                                Each service is packaged and repeatable. We start with one workflow, then expand.
                            </p>
                        </div>
                        <div className="md:col-span-2 space-y-6">
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/40 flex items-center justify-center text-xs font-semibold text-purple-200">
                                    1
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-white mb-1">
                                        Map your stack and guardrails
                                    </h3>
                                    <p className="text-sm text-slate-400">
                                        We capture channels, systems, data sources and all the rules that the AI must respect before any prompts are written.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/40 flex items-center justify-center text-xs font-semibold text-purple-200">
                                    2
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-white mb-1">
                                        Build, test and shadow‑run the service
                                    </h3>
                                    <p className="text-sm text-slate-400">
                                        The service runs against real conversations and tickets in a safe sand‑box so you can see exactly how it behaves.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/40 flex items-center justify-center text-xs font-semibold text-purple-200">
                                    3
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-white mb-1">
                                        Go live with monitoring and controls
                                    </h3>
                                    <p className="text-sm text-slate-400">
                                        We gradually open traffic, add human‑in‑the‑loop approvals where needed and give your team dashboards to monitor performance.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ServiceList;
