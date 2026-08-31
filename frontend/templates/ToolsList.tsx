import React, { useMemo, useState } from 'react';
import useSWR from 'swr';
import { Link } from 'react-router-dom';
import { solutionService } from '../services/api';
import { motion, Variants } from 'framer-motion';

const ToolsList: React.FC<{ initialData?: any }> = ({ initialData }) => {
    const { data: tools, isLoading } = useSWR('solutions', solutionService.getAll, {
        fallbackData: initialData
    });
    const [search, setSearch] = useState('');
    const [showActiveOnly, setShowActiveOnly] = useState(true);

    const MotionLink = motion.create(Link);

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

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08,
                delayChildren: 0.05
            }
        }
    };

    const cardVariants: Variants = {
        hidden: { opacity: 0, y: 25 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4, ease: "easeOut" }
        }
    };

    if (isLoading && !tools) {
        return (
            <div className="bg-slate-950 min-h-screen flex items-center justify-center">
                <p className="text-slate-300 text-lg">Loading tools...</p>
            </div>
        );
    }

    return (
        <div className="bg-slate-950 min-h-screen py-20 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <span className="inline-flex items-center rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-300 mb-4">
                        AI Tools Library
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                        All AI tools in one place
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        Discover practical AI tools you can plug into your workflows for security,
                        automation and analytics.
                    </p>
                </motion.div>

                <div className="grid gap-6 md:grid-cols-[2fr,1fr] mb-10">
                    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 md:p-5 backdrop-blur-sm">
                        <div className="flex flex-col md:flex-row gap-3 md:items-center">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search tools by name or description"
                                    className="w-full rounded-xl bg-slate-950/60 border border-slate-700 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 md:p-5 backdrop-blur-sm">
                        <h3 className="text-sm font-medium text-slate-200 mb-3">
                            Categories
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {["Workflow automation", "Security", "Analytics", "Integrations", "Developer tools"].map((cat, idx) => (
                                <span key={idx} className="inline-flex items-center rounded-full border border-slate-700 bg-slate-950/60 px-3 py-1 text-xs font-medium text-slate-200 hover:border-emerald-500/40 transition-colors cursor-pointer">
                                    {cat}
                                </span>
                            ))}
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

                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {filteredTools.map((tool) => (
                        <motion.div
                            key={tool.id}
                            variants={cardVariants}
                            whileHover={{ y: -5, transition: { duration: 0.2 } }}
                            className="group relative flex flex-col rounded-2xl border border-slate-800 bg-slate-900/80 p-5 hover:border-emerald-400/80 hover:bg-slate-900 transition-colors shadow-lg backdrop-blur-sm"
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
                                    </div>
                                </div>
                                {tool.is_active !== false && (
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
                                <MotionLink
                                    whileHover={{ x: 3 }}
                                    to={`/tools/${tool.slug || tool.id}`}
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
                                </MotionLink>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
};

export default ToolsList;

