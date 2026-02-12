import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit, Trash2, Sparkles, Lock, Unlock, ExternalLink } from 'lucide-react';
import { api, toggleLock, FRONTEND_URL } from '../api';
import type { Industry } from '../types';
import Modal from '../components/ui/Modal';

// Extend Industry type locally
interface IndustryWithLock extends Industry {
    locked_status?: {
        is_locked: boolean;
        locked_at: string | null;
        locked_by: string | null;
        locked_by_id: number | null;
    };
    updated_at?: string;
}

const IndustriesManager = () => {
    const [industries, setIndustries] = useState<IndustryWithLock[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentIndustry, setCurrentIndustry] = useState<Partial<IndustryWithLock>>({});
    const [searchTerm, setSearchTerm] = useState('');

    // Pagination & Sort
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(20);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [sort, setSort] = useState('updated_at');
    const [dir, setDir] = useState<'asc' | 'desc'>('desc');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/industries', {
                params: {
                    page,
                    per_page: perPage,
                    q: searchTerm,
                    sort,
                    dir
                }
            });
            const data = response.data;
            if (data.data && typeof data.current_page === 'number') {
                setIndustries(data.data);
                setTotalPages(data.last_page);
                setTotalItems(data.total);
            } else {
                setIndustries(Array.isArray(data) ? data : data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch industries', error);
        } finally {
            setLoading(false);
        }
    }, [page, perPage, searchTerm, sort, dir]);

    useEffect(() => {
        const t = setTimeout(fetchData, 300);
        return () => clearTimeout(t);
    }, [fetchData]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (currentIndustry.id) {
                await api.put(`/industries/${currentIndustry.id}`, currentIndustry);
            } else {
                await api.post('/industries', currentIndustry);
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            console.error('Failed to save industry', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this industry?')) {
            try {
                await api.delete(`/industries/${id}`);
                fetchData();
            } catch (error) {
                console.error('Failed to delete industry', error);
            }
        }
    };

    const toggleActive = async (industry: IndustryWithLock) => {
        try {
            await api.patch(`/industries/${industry.id}/toggle-active`);
            fetchData();
        } catch (error) {
            console.error('Failed to toggle status', error);
        }
    };

    const handleToggleLock = async (id: number) => {
        try {
            await toggleLock('industries', id);
            fetchData();
        } catch (error) {
            console.error('Failed to toggle lock', error);
        }
    };

    const toggleSort = (field: string) => {
        if (sort === field) {
            setDir(d => d === 'asc' ? 'desc' : 'asc');
        } else {
            setSort(field);
            setDir('desc');
        }
    };

    const handleBulkGenerate = async () => {
        if (confirm('Trigger bulk AI content generation for all industries? This may take a while.')) {
            try {
                await api.post('/industries/bulk-generate');
                alert('Bulk generation started in background.');
            } catch (error) {
                console.error('Failed to start bulk generation', error);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Industries</h1>
                    <p className="text-gray-500">Manage target industries and verticals</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={handleBulkGenerate}
                        className="flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors"
                    >
                        <Sparkles size={20} />
                        <span>Bulk Generate</span>
                    </button>
                    <button 
                        onClick={() => { setCurrentIndustry({ is_active: true }); setIsModalOpen(true); }}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={20} />
                        <span>Add Industry</span>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input 
                            type="text"
                            placeholder="Search industries..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 cursor-pointer hover:bg-gray-100" onClick={() => toggleSort('name')}>Name</th>
                                <th className="px-6 py-4 cursor-pointer hover:bg-gray-100" onClick={() => toggleSort('slug')}>Slug</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 cursor-pointer hover:bg-gray-100" onClick={() => toggleSort('updated_at')}>Last Updated</th>
                                <th className="px-6 py-4 text-center">Lock</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading industries...</td>
                                </tr>
                            ) : industries.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No industries found.</td>
                                </tr>
                            ) : (
                                industries.map((industry) => (
                                    <tr key={industry.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{industry.name}</div>
                                            {industry.description && (
                                                <div className="text-sm text-gray-500 truncate max-w-xs">{industry.description}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                                                {industry.slug}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button 
                                                onClick={() => toggleActive(industry)}
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                                                    industry.is_active 
                                                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                                }`}
                                            >
                                                {industry.is_active ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {industry.updated_at ? new Date(industry.updated_at).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {industry.locked_status?.is_locked ? (
                                                <div className="flex justify-center group relative cursor-help">
                                                    <Lock size={16} className="text-red-500" />
                                                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 pointer-events-none">
                                                        Locked by {industry.locked_status.locked_by} at {new Date(industry.locked_status.locked_at!).toLocaleString()}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-300">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => window.open(`${FRONTEND_URL}/industries/${industry.slug}`, '_blank')}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="View Public Page"
                                                >
                                                    <ExternalLink size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleToggleLock(industry.id)}
                                                    className={`p-2 rounded-lg transition-colors ${industry.locked_status?.is_locked ? 'text-red-500 hover:bg-red-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                                                    title={industry.locked_status?.is_locked ? 'Unlock' : 'Lock'}
                                                >
                                                    {industry.locked_status?.is_locked ? <Unlock size={18} /> : <Lock size={18} />}
                                                </button>
                                                <button 
                                                    onClick={() => { setCurrentIndustry(industry); setIsModalOpen(true); }}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    disabled={industry.locked_status?.is_locked}
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(industry.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    disabled={industry.locked_status?.is_locked}
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
                        Showing {Math.min(totalItems, (page - 1) * perPage + 1)} to {Math.min(totalItems, page * perPage)} of {totalItems} results
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
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1 || loading}
                            >
                                Previous
                            </button>
                            <span className="flex items-center px-2 text-sm">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                className="px-3 py-1 border rounded text-sm hover:bg-gray-100 disabled:opacity-50"
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages || loading}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={currentIndustry.id ? 'Edit Industry' : 'Add New Industry'}
            >
                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Industry Name</label>
                        <input
                            type="text"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            value={currentIndustry.name || ''}
                            onChange={(e) => setCurrentIndustry({ ...currentIndustry, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            value={currentIndustry.slug || ''}
                            onChange={(e) => setCurrentIndustry({ ...currentIndustry, slug: e.target.value })}
                            placeholder="Auto-generated if empty"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-h-[100px]"
                            value={currentIndustry.description || ''}
                            onChange={(e) => setCurrentIndustry({ ...currentIndustry, description: e.target.value })}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="is_active"
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={currentIndustry.is_active || false}
                            onChange={(e) => setCurrentIndustry({ ...currentIndustry, is_active: e.target.checked })}
                        />
                        <label htmlFor="is_active" className="text-sm font-medium text-gray-700">Active</label>
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
                            {currentIndustry.id ? 'Save Changes' : 'Create Industry'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default IndustriesManager;
