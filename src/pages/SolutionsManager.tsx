import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit, Trash2, Lock, Unlock, ExternalLink } from 'lucide-react';
import { api, toggleLock, FRONTEND_URL, listPageTemplates } from '../api';

type TemplateSummary = { id: number; name: string; slug: string };

interface Solution {
    id: number;
    name: string;
    slug: string;
    template_slug?: string | null;
    description?: string | null;
    icon?: string | null;
    is_active: boolean;
    updated_at?: string;
    locked_status?: {
        is_locked: boolean;
        locked_at: string | null;
        locked_by: string | null;
        locked_by_id: number | null;
    };
}

const SolutionsManager = () => {
    const [solutions, setSolutions] = useState<Solution[]>([]);
    const [templates, setTemplates] = useState<TemplateSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentSolution, setCurrentSolution] = useState<Partial<Solution>>({});
    const [searchTerm, setSearchTerm] = useState('');

    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(20);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [sort, setSort] = useState('updated_at');
    const [dir, setDir] = useState<'asc' | 'desc'>('desc');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/solutions', {
                params: {
                    page,
                    per_page: perPage,
                    q: searchTerm,
                    sort,
                    dir,
                },
            });
            const data = response.data;
            if (data.data && typeof data.current_page === 'number') {
                setSolutions(data.data);
                setTotalPages(data.last_page);
                setTotalItems(data.total);
            } else {
                setSolutions(Array.isArray(data) ? data : data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch solutions', error);
        } finally {
            setLoading(false);
        }
    }, [page, perPage, searchTerm, sort, dir]);

    useEffect(() => {
        const t = setTimeout(fetchData, 300);
        return () => clearTimeout(t);
    }, [fetchData]);

    useEffect(() => {
        listPageTemplates()
            .then((res) => {
                const raw = Array.isArray(res.data) ? res.data : [];
                const rows: TemplateSummary[] = raw as unknown as TemplateSummary[];
                setTemplates(rows);
            })
            .catch((err) => console.error('Failed to load templates', err));
    }, []);

    const loadSolution = useCallback(async (id: number) => {
        try {
            const res = await api.get(`/solutions/${id}`);
            const data = res.data as Solution;
            setCurrentSolution(data);
            setIsModalOpen(true);
        } catch (error) {
            console.error('Failed to load solution', error);
        }
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload: any = {
                name: currentSolution.name,
                slug: currentSolution.slug,
                template_slug: currentSolution.template_slug,
                description: currentSolution.description,
                icon: currentSolution.icon,
                is_active: currentSolution.is_active ?? true,
            };

            if (currentSolution.id) {
                await api.put(`/solutions/${currentSolution.id}`, payload);
            } else {
                await api.post('/solutions', payload);
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            console.error('Failed to save solution', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this tool?')) {
            try {
                await api.delete(`/solutions/${id}`);
                fetchData();
            } catch (error) {
                console.error('Failed to delete solution', error);
            }
        }
    };

    const toggleActive = async (solution: Solution) => {
        try {
            await api.patch(`/solutions/${solution.id}/toggle-active`);
            fetchData();
        } catch (error) {
            console.error('Failed to toggle status', error);
        }
    };

    const handleToggleLock = async (id: number) => {
        try {
            await toggleLock('solutions', id);
            fetchData();
        } catch (error) {
            console.error('Failed to toggle lock', error);
        }
    };

    const toggleSort = (field: string) => {
        if (sort === field) {
            setDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        } else {
            setSort(field);
            setDir('desc');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Tools</h1>
                    <p className="text-gray-500">Manage reusable tools and solution bundles</p>
                </div>
                <button
                    onClick={() => {
                        setCurrentSolution({ is_active: true });
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    <span>Add Tool</span>
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search tools..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setPage(1);
                            }}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 cursor-pointer hover:bg-gray-100" onClick={() => toggleSort('name')}>
                                    Name
                                </th>
                                <th className="px-6 py-4 cursor-pointer hover:bg-gray-100" onClick={() => toggleSort('slug')}>
                                    Slug
                                </th>
                                <th className="px-6 py-4">Template</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 cursor-pointer hover:bg-gray-100" onClick={() => toggleSort('updated_at')}>
                                    Last Updated
                                </th>
                                <th className="px-6 py-4 text-center">Lock</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                        Loading tools...
                                    </td>
                                </tr>
                            ) : solutions.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                        No tools found.
                                    </td>
                                </tr>
                            ) : (
                                solutions.map((solution) => (
                                    <tr key={solution.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{solution.name}</div>
                                            {solution.description && (
                                                <div className="text-sm text-gray-500 truncate max-w-xs">{solution.description}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                                                {solution.slug}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-600">
                                                {solution.template_slug || 'Default'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => toggleActive(solution)}
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                                                    solution.is_active
                                                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                                }`}
                                            >
                                                {solution.is_active ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {solution.updated_at ? new Date(solution.updated_at).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {solution.locked_status?.is_locked ? (
                                                <div className="flex justify-center group relative cursor-help">
                                                    <Lock size={16} className="text-red-500" />
                                                    {solution.locked_status.locked_at && solution.locked_status.locked_by && (
                                                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 pointer-events-none">
                                                            Locked by {solution.locked_status.locked_by} at{' '}
                                                            {new Date(solution.locked_status.locked_at).toLocaleString()}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-gray-300">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => window.open(`${FRONTEND_URL}/solutions/${solution.slug}`, '_blank')}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="View Public Page"
                                                >
                                                    <ExternalLink size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleToggleLock(solution.id)}
                                                    className={`p-2 rounded-lg transition-colors ${
                                                        solution.locked_status?.is_locked
                                                            ? 'text-red-500 hover:bg-red-50'
                                                            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                                                    }`}
                                                    title={solution.locked_status?.is_locked ? 'Unlock' : 'Lock'}
                                                >
                                                    {solution.locked_status?.is_locked ? <Unlock size={18} /> : <Lock size={18} />}
                                                </button>
                                                <button
                                                    onClick={() => loadSolution(solution.id)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    disabled={solution.locked_status?.is_locked}
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(solution.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    disabled={solution.locked_status?.is_locked}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 bg-gray-50">
                    <div className="text-sm text-gray-500">
                        Showing {Math.min(totalItems, (page - 1) * perPage + 1)} to {Math.min(totalItems, page * perPage)} of {totalItems}{' '}
                        results
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                            value={perPage}
                            onChange={(e) => {
                                setPerPage(Number(e.target.value));
                                setPage(1);
                            }}
                            className="border rounded p-1 text-sm bg-white"
                        >
                            <option value={10}>10 per page</option>
                            <option value={20}>20 per page</option>
                            <option value={50}>50 per page</option>
                        </select>
                        <div className="flex gap-1">
                            <button
                                className="px-3 py-1 border rounded text-sm hover:bg-gray-100 disabled:opacity-50"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1 || loading}
                            >
                                Previous
                            </button>
                            <span className="flex items-center px-2 text-sm">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                className="px-3 py-1 border rounded text-sm hover:bg-gray-100 disabled:opacity-50"
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages || loading}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-800">
                                {currentSolution.id ? 'Edit Tool' : 'Add New Tool'}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 rounded-full p-1"
                            >
                                <XIcon />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="px-6 py-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tool Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    value={currentSolution.name || ''}
                                    onChange={(e) => setCurrentSolution({ ...currentSolution, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    value={currentSolution.slug || ''}
                                    onChange={(e) => setCurrentSolution({ ...currentSolution, slug: e.target.value })}
                                    placeholder="Auto-generated if empty"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Page Template</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    value={currentSolution.template_slug || ''}
                                    onChange={(e) =>
                                        setCurrentSolution({ ...currentSolution, template_slug: e.target.value || undefined })
                                    }
                                >
                                    <option value="">Default Template</option>
                                    {templates.map((t) => (
                                        <option key={t.id} value={t.slug}>
                                            {t.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-h-[100px]"
                                    value={currentSolution.description || ''}
                                    onChange={(e) => setCurrentSolution({ ...currentSolution, description: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    value={currentSolution.icon || ''}
                                    onChange={(e) => setCurrentSolution({ ...currentSolution, icon: e.target.value })}
                                    placeholder="Optional icon (emoji or name)"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="solution_is_active"
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    checked={currentSolution.is_active ?? true}
                                    onChange={(e) => setCurrentSolution({ ...currentSolution, is_active: e.target.checked })}
                                />
                                <label htmlFor="solution_is_active" className="text-sm font-medium text-gray-700">
                                    Active
                                </label>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    {currentSolution.id ? 'Save Changes' : 'Create Tool'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const XIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
    >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

export default SolutionsManager;
