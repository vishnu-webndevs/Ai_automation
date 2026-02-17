import React from 'react';
import { useParams } from 'react-router-dom';
import useSWR from 'swr';
import { serviceService } from '../services/api';

const ServiceDetail: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const { data: service, isLoading, error } = useSWR(slug ? `service-${slug}` : null, () => serviceService.getBySlug(slug!));

    if (isLoading) return <div className="text-center py-20 text-white">Loading service...</div>;
    if (error || !service) return <div className="text-center py-20 text-white">Service not found</div>;

    const features = (service as any).features || [];

    return (
        <div className="bg-slate-950 min-h-screen">
            <section className="relative pt-28 pb-10 px-4 sm:px-6 lg:px-8 overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-r from-purple-700/40 via-purple-900/40 to-slate-950 pointer-events-none" />
                <div className="relative max-w-6xl mx-auto">
                    <div className="mb-6">
                        <p className="text-xs font-semibold tracking-[0.25em] uppercase text-purple-300 mb-2">
                            Service details
                        </p>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3">
                            {service.name}
                        </h1>
                        <p className="text-sm text-slate-400">
                            Home <span className="mx-1 text-slate-500">/</span> Services <span className="mx-1 text-slate-500">/</span> {service.name}
                        </p>
                    </div>
                </div>
            </section>

            <section className="px-4 sm:px-6 lg:px-8 pb-16">
                <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-10 items-start">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-gradient-to-b from-slate-900 to-black shadow-2xl">
                            <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/40 via-transparent to-blue-500/40 mix-blend-screen pointer-events-none" />
                            <div className="relative flex flex-col md:flex-row md:items-end gap-6 p-6 md:p-8">
                                <div className="flex-1">
                                    <div className="inline-flex items-center gap-3 rounded-full bg-black/40 border border-purple-500/40 px-4 py-2 mb-4">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/20 text-2xl">
                                            <span>{(service as any).icon || '🤖'}</span>
                                        </div>
                                        <span className="text-xs font-semibold text-purple-100 tracking-wide">
                                            AI service
                                        </span>
                                    </div>
                                    <p className="text-lg md:text-xl text-slate-100 max-w-2xl">
                                        {service.short_description}
                                    </p>
                                </div>
                                <div className="w-full md:w-64 flex-shrink-0">
                                    <div className="rounded-2xl bg-black/60 border border-purple-500/40 p-4">
                                        <p className="text-xs font-semibold tracking-[0.25em] uppercase text-purple-300 mb-3">
                                            Get in touch
                                        </p>
                                        <form
                                            className="space-y-3"
                                            onSubmit={(e) => e.preventDefault()}
                                        >
                                            <input
                                                type="text"
                                                placeholder="Your name"
                                                className="w-full rounded-lg bg-slate-900/80 border border-slate-700 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                                            />
                                            <input
                                                type="email"
                                                placeholder="Email address"
                                                className="w-full rounded-lg bg-slate-900/80 border border-slate-700 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                                            />
                                            <textarea
                                                placeholder="Project details"
                                                className="w-full rounded-lg bg-slate-900/80 border border-slate-700 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 min-h-[72px]"
                                            />
                                            <button
                                                type="submit"
                                                className="w-full inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-xs font-semibold text-white py-2.5 hover:from-purple-600 hover:to-blue-600 transition-colors"
                                            >
                                                Submit enquiry
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8">
                            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                                {service.name}
                            </h2>
                            <div className="prose prose-invert prose-sm sm:prose-base max-w-none">
                                <div dangerouslySetInnerHTML={{ __html: (service as any).full_description }} />
                            </div>
                        </div>

                        {features.length > 0 && (
                            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8">
                                <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                                    Key features of {service.name}
                                </h3>
                                <p className="text-sm text-slate-400 mb-6">
                                    Designed to plug into your existing tools with clear guardrails and measurable outcomes.
                                </p>
                                <div className="grid sm:grid-cols-2 gap-5">
                                    {features.map((feature: any, idx: number) => (
                                        <div
                                            key={idx}
                                            className="rounded-2xl bg-slate-950/60 border border-slate-800 p-4"
                                        >
                                            <h4 className="text-sm font-semibold text-white mb-1.5">
                                                {feature.title || feature.name || `Feature ${idx + 1}`}
                                            </h4>
                                            <p className="text-xs text-slate-400">
                                                {feature.description || 'Configured to match your workflows, data and policies.'}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {features.length > 0 && (
                            <div className="bg-slate-950/60 border border-slate-800 rounded-3xl p-6 md:p-8">
                                <h3 className="text-xl md:text-2xl font-bold text-white mb-4">
                                    Benefits for your team
                                </h3>
                                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {['Faster responses', 'Lower handle time', 'Better quality', 'Consistent CX'].map(
                                        (label, idx) => (
                                            <div
                                                key={idx}
                                                className="rounded-2xl bg-gradient-to-b from-purple-500/10 to-slate-900/80 border border-purple-500/30 px-4 py-5"
                                            >
                                                <p className="text-xs font-semibold text-purple-200 mb-1">
                                                    {label}
                                                </p>
                                                <p className="text-[11px] text-slate-400">
                                                    Tied to metrics you already track in your existing dashboards.
                                                </p>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <aside className="space-y-6">
                        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6">
                            <p className="text-xs font-semibold tracking-[0.25em] uppercase text-purple-300 mb-3">
                                Contact info
                            </p>
                            <ul className="space-y-3 text-xs text-slate-300">
                                <li>
                                    <p className="text-slate-500 mb-0.5">Support</p>
                                    <p>support@totan.ai</p>
                                </li>
                                <li>
                                    <p className="text-slate-500 mb-0.5">Sales</p>
                                    <p>sales@totan.ai</p>
                                </li>
                                <li>
                                    <p className="text-slate-500 mb-0.5">Availability</p>
                                    <p>Mon–Fri · 9:00–18:00 (local time)</p>
                                </li>
                            </ul>
                        </div>

                        <div className="rounded-3xl bg-gradient-to-b from-emerald-500/15 via-slate-950 to-slate-950 border border-emerald-400/40 p-6 flex flex-col justify-between min-h-[220px]">
                            <div>
                                <p className="text-xs font-semibold tracking-[0.25em] uppercase text-emerald-200 mb-2">
                                    Next step
                                </p>
                                <h3 className="text-lg font-bold text-white mb-2">
                                    Let’s map this service to your stack
                                </h3>
                                <p className="text-xs text-slate-200">
                                    Share your channels, tools and volumes and we will come back with a rollout plan for this specific service.
                                </p>
                            </div>
                            <button className="mt-4 inline-flex items-center justify-center rounded-full bg-white text-slate-950 text-xs font-semibold px-5 py-2 hover:bg-slate-200 transition-colors">
                                Book a strategy call
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
                                Whether you are starting with this service or rolling out a full AI roadmap, we can help you design, launch and monitor it end‑to‑end.
                            </p>
                            <button className="inline-flex items-center justify-center rounded-full bg-white text-slate-950 text-sm font-semibold px-6 py-2.5 hover:bg-slate-200 transition-colors">
                                Talk to our team
                            </button>
                        </div>
                        <div className="relative bg-gradient-to-tl from-black via-purple-900/40 to-emerald-900/40">
                            <div className="absolute -bottom-16 right-0 left-0 mx-auto w-64 h-64 rounded-full bg-purple-500/40 blur-[80px]" />
                            <div className="relative h-full flex items-center justify-center py-10">
                                <div className="w-40 h-40 rounded-full border border-purple-300/50 bg-black/40 flex items-center justify-center text-5xl">
                                    <span>{(service as any).icon || '🤖'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ServiceDetail;
