import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit, Trash2, Lock, Unlock, ExternalLink } from 'lucide-react';
import { api, toggleLock, FRONTEND_URL, listPageTemplates } from '../api';

type TemplateSummary = { id: number; name: string; slug: string };

interface Integration {
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

const IntegrationsManager = () => {
    const [integrations, setIntegrations] = useState<Integration[]>([]);
    const [templates, setTemplates] = useState<TemplateSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentIntegration, setCurrentIntegration] = useState<Partial<Integration>>({});
    const [searchTerm, setSearchTerm] = useState('');

    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(20);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [sort, setSort] = useState('updated_at');
    const [dir, setDir] = useState<'asc' | 'desc'>('desc');
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/integrations', {
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
                setIntegrations(data.data);
                setTotalPages(data.last_page);
                setTotalItems(data.total);
            } else {
                setIntegrations(Array.isArray(data) ? data : data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch integrations', error);
            setError('Unable to load integrations. Please try again.');
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

    const loadIntegration = useCallback(async (id: number) => {
        try {
            const res = await api.get(`/integrations/${id}`);
            const data = res.data as Integration;
            setCurrentIntegration(data);
            setIsModalOpen(true);
        } catch (error) {
            console.error('Failed to load integration', error);
        }
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload: any = {
                name: currentIntegration.name,
                slug: currentIntegration.slug,
                template_slug: currentIntegration.template_slug,
                description: currentIntegration.description,
                icon: currentIntegration.icon,
                is_active: currentIntegration.is_active ?? true,
            };

            if (currentIntegration.id) {
                await api.put(`/integrations/${currentIntegration.id}`, payload);
            } else {
                await api.post('/integrations', payload);
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            console.error('Failed to save integration', error);
            setError('Saving integration failed. Please check the form and try again.');
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this integration?')) {
            try {
                await api.delete(`/integrations/${id}`);
                fetchData();
            } catch (error) {
                console.error('Failed to delete integration', error);
                setError('Deleting integration failed. Please try again.');
            }
        }
    };

    const toggleActive = async (integration: Integration) => {
        try {
            await api.patch(`/integrations/${integration.id}/toggle-active`);
            fetchData();
        } catch (error) {
            console.error('Failed to toggle status', error);
            setError('Updating status failed. Please try again.');
        }
    };

    const handleToggleLock = async (id: number) => {
        try {
            await toggleLock('integrations', id);
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

    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Integrations</h1>
                    <p className="text-gray-500">Manage integrations with external tools and platforms</p>
                </div>
                <button
                    onClick={() => {
                        setCurrentIntegration({ is_active: true });
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    <span>Add Integration</span>
                </button>
            </div>

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="relative max-w-md w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search integrations..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setPage(1);
                                }}
                            />
                        </div>
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
                                        Loading integrations...
                                    </td>
                                </tr>
                            ) : integrations.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                        No integrations found.
                                    </td>
                                </tr>
                            ) : (
                                integrations.map((integration) => (
                                    <tr key={integration.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{integration.name}</div>
                                            {integration.description && (
                                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                                    {integration.description}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                                                {integration.slug}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-600">
                                                {integration.template_slug || 'Default'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => toggleActive(integration)}
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                                                    integration.is_active
                                                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                                }`}
                                            >
                                                <span
                                                    className={`mr-2 h-2 w-2 rounded-full ${
                                                        integration.is_active ? 'bg-green-500' : 'bg-gray-400'
                                                    }`}
                                                />
                                                {integration.is_active ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {integration.updated_at
                                                ? new Date(integration.updated_at).toLocaleString()
                                                : '—'}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handleToggleLock(integration.id)}
                                                className="inline-flex items-center justify-center rounded-full border border-gray-200 p-1.5 hover:bg-gray-100 transition-colors"
                                                title={integration.locked_status?.is_locked ? 'Unlock' : 'Lock'}
                                            >
                                                {integration.locked_status?.is_locked ? (
                                                    <Lock className="h-4 w-4 text-gray-500" />
                                                ) : (
                                                    <Unlock className="h-4 w-4 text-gray-400" />
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => loadIntegration(integration.id)}
                                                    className="inline-flex items-center rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100"
                                                >
                                                    <Edit className="h-4 w-4 mr-1" />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        window.open(
                                                            `${FRONTEND_URL}/integrations/${integration.slug}`,
                                                            '_blank'
                                                        )
                                                    }
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="View Public Page"
                                                >
                                                    <ExternalLink size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(integration.id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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

                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50 text-sm text-gray-600">
                    <div>
                        Showing{' '}
                        <span className="font-medium">
                            {integrations.length ? (page - 1) * perPage + 1 : 0}-
                            {(page - 1) * perPage + integrations.length}
                        </span>{' '}
                        of <span className="font-medium">{totalItems}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={!hasPrevPage}
                            onClick={() => hasPrevPage && setPage((p) => p - 1)}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-medium ${
                                hasPrevPage
                                    ? 'border-gray-300 text-gray-700 hover:bg-gray-100'
                                    : 'border-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                            Prev
                        </button>
                        <span className="text-xs text-gray-500">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            disabled={!hasNextPage}
                            onClick={() => hasNextPage && setPage((p) => p + 1)}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-medium ${
                                hasNextPage
                                    ? 'border-gray-300 text-gray-700 hover:bg-gray-100'
                                    : 'border-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                            Next
                        </button>
                        <select
                            value={perPage}
                            onChange={(e) => {
                                setPerPage(Number(e.target.value));
                                setPage(1);
                            }}
                            className="ml-2 rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        >
                            {[10, 20, 50].map((size) => (
                                <option key={size} value={size}>
                                    {size} / page
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-800">
                                {currentIntegration.id ? 'Edit Integration' : 'Add Integration'}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="px-6 py-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={currentIntegration.name || ''}
                                    onChange={(e) =>
                                        setCurrentIntegration((prev) => ({
                                            ...prev,
                                            name: e.target.value,
                                        }))
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Slug
                                </label>
                                <input
                                    type="text"
                                    value={currentIntegration.slug || ''}
                                    onChange={(e) =>
                                        setCurrentIntegration((prev) => ({
                                            ...prev,
                                            slug: e.target.value,
                                        }))
                                    }
                                    placeholder="auto-generated if left blank"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={currentIntegration.description || ''}
                                    onChange={(e) =>
                                        setCurrentIntegration((prev) => ({
                                            ...prev,
                                            description: e.target.value,
                                        }))
                                    }
                                    rows={3}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Icon
                                    </label>
                                    <input
                                        type="text"
                                        value={currentIntegration.icon || ''}
                                        onChange={(e) =>
                                            setCurrentIntegration((prev) => ({
                                                ...prev,
                                                icon: e.target.value,
                                            }))
                                        }
                                        placeholder="Emoji or short label"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Template
                                    </label>
                                    <select
                                        value={currentIntegration.template_slug || ''}
                                        onChange={(e) =>
                                            setCurrentIntegration((prev) => ({
                                                ...prev,
                                                template_slug: e.target.value || null,
                                            }))
                                        }
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">Default</option>
                                        {templates.map((t) => (
                                            <option key={t.slug} value={t.slug}>
                                                {t.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="flex items-center justify-between pt-2">
                                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                                    <input
                                        type="checkbox"
                                        checked={currentIntegration.is_active ?? true}
                                        onChange={(e) =>
                                            setCurrentIntegration((prev) => ({
                                                ...prev,
                                                is_active: e.target.checked,
                                            }))
                                        }
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span>Active</span>
                                </label>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IntegrationsManager;

