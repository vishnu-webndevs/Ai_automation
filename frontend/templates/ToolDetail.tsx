import React from 'react';
import { useParams } from 'react-router-dom';
import useSWR from 'swr';
import { solutionService } from '../services/api';

const ToolDetail: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const { data: tool, isLoading, error } = useSWR(
        slug ? `tool-${slug}` : null,
        () => solutionService.getBySlug(slug!)
    );

    if (isLoading) {
        return (
            <div className="bg-slate-900 min-h-screen flex items-center justify-center">
                <p className="text-slate-200 text-lg">Loading tool...</p>
            </div>
        );
    }

    if (error || !tool) {
        return (
            <div className="bg-slate-900 min-h-screen flex items-center justify-center">
                <p className="text-slate-200 text-lg">Tool not found</p>
            </div>
        );
    }

    return (
        <div className="bg-slate-950 min-h-screen text-slate-50">
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-slate-900 to-slate-950 pointer-events-none" />
                <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
                        <div className="flex items-start gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-3xl">
                                <span>{tool.icon || '🛠️'}</span>
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                                    {tool.name}
                                </h1>
                                <p className="text-sm uppercase tracking-[0.25em] text-emerald-300/80 mb-3">
                                    AI Tool
                                </p>
                                <p className="text-sm md:text-base text-slate-200 max-w-2xl">
                                    {tool.description}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col items-start md:items-end gap-3">
                            <button
                                type="button"
                                className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-emerald-950 shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 transition-colors"
                            >
                                Visit tool
                            </button>
                            <p className="text-xs text-slate-300/80 max-w-xs text-left md:text-right">
                                Connect this tool into your stack with our implementation team and
                                security best practices.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 space-y-12">
                <div className="grid gap-8 md:grid-cols-3">
                    <section className="md:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
                        <h2 className="text-lg font-semibold text-white mb-3">
                            Features
                        </h2>
                        <p className="text-sm text-slate-300 mb-4">
                            Highlight what this tool does best – automation, monitoring, reporting,
                            or security controls. You can expand this with structured fields later.
                        </p>
                        <ul className="space-y-2 text-sm text-slate-200">
                            <li>Real-time insights on your API and platform activity.</li>
                            <li>Configurable alerts and workflows tailored to your environment.</li>
                            <li>Secure-by-default design aligned with your risk posture.</li>
                        </ul>
                    </section>

                    <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
                        <h2 className="text-lg font-semibold text-white mb-3">
                            Use cases
                        </h2>
                        <ul className="space-y-2 text-sm text-slate-200">
                            <li>Embed into existing dashboards and monitoring flows.</li>
                            <li>Use as a standalone tool for a specific team.</li>
                            <li>Combine with other tools for a full platform story.</li>
                        </ul>
                    </section>
                </div>

                <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
                    <h2 className="text-lg font-semibold text-white mb-3">
                        Screenshots
                    </h2>
                    <p className="text-sm text-slate-300 mb-4">
                        You can drop real screenshots here once available. For now this section is
                        styled and ready to connect to media assets.
                    </p>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="h-32 rounded-xl border border-dashed border-slate-700 bg-slate-950/60" />
                        <div className="h-32 rounded-xl border border-dashed border-slate-700 bg-slate-950/60" />
                        <div className="h-32 rounded-xl border border-dashed border-slate-700 bg-slate-950/60" />
                    </div>
                </section>

                <div className="grid gap-8 md:grid-cols-2">
                    <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
                        <h2 className="text-lg font-semibold text-white mb-3">
                            Pros
                        </h2>
                        <ul className="space-y-2 text-sm text-emerald-200">
                            <li>Fast to integrate into existing workflows.</li>
                            <li>Designed for security-first environments.</li>
                            <li>Backed by automation and AI-driven insights.</li>
                        </ul>
                    </section>

                    <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
                        <h2 className="text-lg font-semibold text-white mb-3">
                            Considerations
                        </h2>
                        <ul className="space-y-2 text-sm text-amber-200">
                            <li>Requires access to your APIs or data sources.</li>
                            <li>Best value when paired with clear ownership and processes.</li>
                        </ul>
                    </section>
                </div>

                <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
                    <h2 className="text-lg font-semibold text-white mb-3">
                        Integrations
                    </h2>
                    <p className="text-sm text-slate-300 mb-4">
                        List the platforms, APIs or providers this tool connects with – you can
                        later link this to the Integrations module.
                    </p>
                    <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-100">
                            REST / GraphQL APIs
                        </span>
                        <span className="inline-flex items-center rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-100">
                            CI/CD pipelines
                        </span>
                        <span className="inline-flex items-center rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-100">
                            Observability tools
                        </span>
                    </div>
                </section>

                <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
                    <h2 className="text-lg font-semibold text-white mb-3">
                        Alternatives
                    </h2>
                    <p className="text-sm text-slate-300 mb-4">
                        Compare this tool with your other solutions so teams can pick the best fit.
                    </p>
                    <ul className="space-y-2 text-sm text-slate-200">
                        <li>Use together with other internal tools as part of a toolkit.</li>
                        <li>Pair with managed services where you need extra support.</li>
                    </ul>
                </section>
            </div>
        </div>
    );
};

export default ToolDetail;
