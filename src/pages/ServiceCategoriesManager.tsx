import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit, Trash2, ExternalLink } from 'lucide-react';
import { api, FRONTEND_URL } from '../api';
import type { ServiceCategory } from '../types';
import Modal from '../components/ui/Modal';

interface ServiceCategoryWithLock extends ServiceCategory {
    updated_at?: string;
}

const ServiceCategoriesManager = () => {
    const [categories, setCategories] = useState<ServiceCategoryWithLock[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState<Partial<ServiceCategoryWithLock>>({});
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
            const response = await api.get('/service-categories', {
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
                setCategories(data.data);
                setTotalPages(data.last_page);
                setTotalItems(data.total);
            } else {
                setCategories(Array.isArray(data) ? data : data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch service categories', error);
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
            if (currentCategory.id) {
                await api.put(`/service-categories/${currentCategory.id}`, currentCategory);
            } else {
                await api.post('/service-categories', currentCategory);
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            console.error('Failed to save service category', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this category?')) {
            try {
                await api.delete(`/service-categories/${id}`);
                fetchData();
            } catch (error) {
                console.error('Failed to delete service category', error);
            }
        }
    };

    const toggleActive = async (category: ServiceCategoryWithLock) => {
        try {
            await api.patch(`/service-categories/${category.id}/toggle-active`);
            fetchData();
        } catch (error) {
            console.error('Failed to toggle status', error);
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
                    <h1 className="text-2xl font-bold text-gray-800">Service Categories</h1>
                    <p className="text-gray-500">Organize services into categories</p>
                </div>
                <button
                    onClick={() => {
                        setCurrentCategory({ is_active: true });
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    <span>Add Category</span>
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search categories..."
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
                                <th className="px-6 py-4">Services</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 cursor-pointer hover:bg-gray-100" onClick={() => toggleSort('updated_at')}>
                                    Last Updated
                                </th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        Loading categories...
                                    </td>
                                </tr>
                            ) : categories.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        No categories found.
                                    </td>
                                </tr>
                            ) : (
                                categories.map((category) => (
                                    <tr key={category.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{category.name}</div>
                                            {category.description && (
                                                <div className="text-sm text-gray-500 truncate max-w-md">{category.description}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                                                {category.slug}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{category.services_count ?? '-'}</td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => toggleActive(category)}
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                                                    category.is_active
                                                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                                }`}
                                            >
                                                {category.is_active ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {category.updated_at ? new Date(category.updated_at).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                <a
                                                    href={`${FRONTEND_URL}/services/category/${category.slug}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                                >
                                                    <ExternalLink size={16} />
                                                </a>
                                                <button
                                                    onClick={() => {
                                                        setCurrentCategory(category);
                                                        setIsModalOpen(true);
                                                    }}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(category.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={16} />
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

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentCategory.id ? 'Edit Category' : 'Add New Category'}>
                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                            type="text"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            value={currentCategory.name || ''}
                            onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            value={currentCategory.slug || ''}
                            onChange={(e) => setCurrentCategory({ ...currentCategory, slug: e.target.value })}
                            placeholder="Auto-generated if empty"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-h-[120px]"
                            value={currentCategory.description || ''}
                            onChange={(e) => setCurrentCategory({ ...currentCategory, description: e.target.value })}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="is_active"
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={currentCategory.is_active || false}
                            onChange={(e) => setCurrentCategory({ ...currentCategory, is_active: e.target.checked })}
                        />
                        <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
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
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            {currentCategory.id ? 'Save Changes' : 'Create Category'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default ServiceCategoriesManager;
