import React, { useMemo, useState } from 'react';
import useSWR from 'swr';
import { Link } from 'react-router-dom';
import { solutionService } from '../services/api';

const ToolsList: React.FC = () => {
    const { data: tools, isLoading } = useSWR('solutions', solutionService.getAll);
    const [search, setSearch] = useState('');
    const [showActiveOnly, setShowActiveOnly] = useState(true);

    const filteredTools = useMemo(() => {
        if (!tools) return [];
        return tools.filter((tool) => {
            if (showActiveOnly && tool.is_active === false) return false;
            if (!search.trim()) return true;
            const q = search.toLowerCase();
            return (
                tool.name.toLowerCase().includes(q) ||
                tool.description.toLowerCase().includes(q)
            );
        });
    }, [tools, search, showActiveOnly]);

    if (isLoading) {
        return (
            <div className="bg-slate-900 min-h-screen flex items-center justify-center">
                <p className="text-slate-300 text-lg">Loading tools...</p>
            </div>
        );
    }

    return (
        <div className="bg-slate-950 min-h-screen py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-300 mb-4">
                        AI Tools Library
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        All AI tools in one place
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        Discover practical AI tools you can plug into your workflows for security,
                        automation and analytics.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-[2fr,1fr] mb-10">
                    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 md:p-5">
                        <div className="flex flex-col md:flex-row gap-3 md:items-center">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search tools by name or description"
                                    className="w-full rounded-xl bg-slate-950/60 border border-slate-700 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                                <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-500">
                                    ⌘K
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowActiveOnly((prev) => !prev)}
                                className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition-colors border ${
                                    showActiveOnly
                                        ? 'bg-emerald-500 text-emerald-950 border-emerald-400'
                                        : 'bg-slate-900 text-slate-200 border-slate-700 hover:border-emerald-400/60'
                                }`}
                            >
                                <span
                                    className={`mr-2 inline-flex h-4 w-4 items-center justify-center rounded-full border ${
                                        showActiveOnly
                                            ? 'border-emerald-900 bg-emerald-200/90'
                                            : 'border-slate-600'
                                    }`}
                                >
                                    <span
                                        className={`h-2 w-2 rounded-full ${
                                            showActiveOnly ? 'bg-emerald-700' : 'bg-transparent'
                                        }`}
                                    />
                                </span>
                                Active tools only
                            </button>
                        </div>
                    </div>

                    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 md:p-5">
                        <h3 className="text-sm font-medium text-slate-200 mb-3">
                            Categories
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-950/60 px-3 py-1 text-xs font-medium text-slate-200">
                                Workflow automation
                            </span>
                            <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-950/60 px-3 py-1 text-xs font-medium text-slate-200">
                                Security
                            </span>
                            <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-950/60 px-3 py-1 text-xs font-medium text-slate-200">
                                Analytics
                            </span>
                            <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-950/60 px-3 py-1 text-xs font-medium text-slate-200">
                                Integrations
                            </span>
                            <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-950/60 px-3 py-1 text-xs font-medium text-slate-200">
                                Developer tools
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-6">
                    <p className="text-sm text-slate-400">
                        Showing{' '}
                        <span className="font-semibold text-slate-100">
                            {filteredTools.length}
                        </span>{' '}
                        tools
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTools.map((tool) => (
                        <div
                            key={tool.id}
                            className="group relative flex flex-col rounded-2xl border border-slate-800 bg-slate-900/80 p-5 hover:border-emerald-400/80 hover:bg-slate-900 transition-colors"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-xl">
                                        <span>{tool.icon || '🛠️'}</span>
                                    </div>
                                    <div>
                                        <h3 className="text-base font-semibold text-white">
                                            {tool.name}
                                        </h3>
                                        <p className="text-xs text-slate-400">
                                            AI tool
                                        </p>
                                    </div>
                                </div>
                                {tool.is_active && (
                                    <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-medium text-emerald-300">
                                        Active
                                    </span>
                                )}
                            </div>

                            <p className="text-sm text-slate-400 mb-4 line-clamp-3">
                                {tool.description}
                            </p>

                            <div className="flex flex-wrap gap-2 mb-4">
                                <span className="inline-flex items-center rounded-full bg-slate-800 px-2.5 py-0.5 text-[10px] font-medium text-slate-200">
                                    Workflow
                                </span>
                                <span className="inline-flex items-center rounded-full bg-slate-800 px-2.5 py-0.5 text-[10px] font-medium text-slate-200">
                                    Automation
                                </span>
                                <span className="inline-flex items-center rounded-full bg-slate-800 px-2.5 py-0.5 text-[10px] font-medium text-slate-200">
                                    AI
                                </span>
                            </div>

                            <div className="mt-auto flex items-center justify-between pt-2">
                                <Link
                                    to={`/tools/${tool.slug}`}
                                    className="inline-flex items-center text-sm font-medium text-emerald-300 group-hover:text-emerald-200"
                                >
                                    View tool
                                    <svg
                                        className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1"
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
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ToolsList;
