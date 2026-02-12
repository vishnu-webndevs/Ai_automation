import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, ChevronUp, ChevronDown, ExternalLink, ArrowLeft, ArrowRight } from 'lucide-react';
import { api } from '../api';
import type { BlogTag } from '../types';
import Modal from '../components/ui/Modal';

interface BlogTagWithMeta extends BlogTag {
    updated_at?: string;
}

const BlogTagManager = () => {
    const [tags, setTags] = useState<BlogTagWithMeta[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentTag, setCurrentTag] = useState<Partial<BlogTagWithMeta>>({});
    const [searchTerm, setSearchTerm] = useState('');

    // Pagination & Sorting
    const [page, setPage] = useState(1);
    const [perPage] = useState(10);
    const [sort, setSort] = useState<keyof BlogTagWithMeta>('updated_at');
    const [dir, setDir] = useState<'asc' | 'desc'>('desc');

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await api.get('/blog-tags');
            // Handle both wrapped and unwrapped responses
            const data = Array.isArray(response.data) ? response.data : response.data.data || [];
            setTags(data);
        } catch (error) {
            console.error('Failed to fetch blog tags', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (currentTag.id) {
                await api.put(`/blog-tags/${currentTag.id}`, currentTag);
            } else {
                await api.post('/blog-tags', currentTag);
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            console.error('Failed to save tag', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this tag?')) {
            try {
                await api.delete(`/blog-tags/${id}`);
                fetchData();
            } catch (error) {
                console.error('Failed to delete tag', error);
            }
        }
    };

    const toggleSort = (key: keyof BlogTagWithMeta) => {
        if (sort === key) {
            setDir(dir === 'asc' ? 'desc' : 'asc');
        } else {
            setSort(key);
            setDir('asc');
        }
    };

    // Client-side Filtering, Sorting, and Pagination
    const filteredTags = tags.filter(tag => 
        tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tag.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedTags = [...filteredTags].sort((a, b) => {
        const aValue = a[sort];
        const bValue = b[sort];

        if (!aValue && !bValue) return 0;
        if (!aValue) return 1;
        if (!bValue) return -1;

        if (aValue < bValue) return dir === 'asc' ? -1 : 1;
        if (aValue > bValue) return dir === 'asc' ? 1 : -1;
        return 0;
    });

    const totalItems = sortedTags.length;
    const totalPages = Math.ceil(totalItems / perPage);
    const paginatedTags = sortedTags.slice((page - 1) * perPage, page * perPage);

    // Reset page when search changes
    useEffect(() => {
        setPage(1);
    }, [searchTerm]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Blog Tags</h1>
                    <p className="text-gray-500">Manage tags for better discoverability</p>
                </div>
                <button 
                    onClick={() => { setCurrentTag({}); setIsModalOpen(true); }}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    <span>Add Tag</span>
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input 
                            type="text"
                            placeholder="Search tags..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            <tr>
                                <th 
                                    className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors"
                                    onClick={() => toggleSort('name')}
                                >
                                    <div className="flex items-center gap-1">
                                        Name
                                        {sort === 'name' && (dir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                                    </div>
                                </th>
                                <th 
                                    className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors"
                                    onClick={() => toggleSort('slug')}
                                >
                                    <div className="flex items-center gap-1">
                                        Slug
                                        {sort === 'slug' && (dir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                                    </div>
                                </th>
                                <th 
                                    className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors"
                                    onClick={() => toggleSort('updated_at')}
                                >
                                    <div className="flex items-center gap-1">
                                        Last Updated
                                        {sort === 'updated_at' && (dir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Loading tags...</td>
                                </tr>
                            ) : paginatedTags.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No tags found.</td>
                                </tr>
                            ) : (
                                paginatedTags.map((tag) => (
                                    <tr key={tag.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{tag.name}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                                                {tag.slug}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-500">
                                                {tag.updated_at ? new Date(tag.updated_at).toLocaleDateString() : '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <a 
                                                    href={`/blog/tag/${tag.slug}`} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="View Public Page"
                                                >
                                                    <ExternalLink size={18} />
                                                </a>
                                                <button 
                                                    onClick={() => { setCurrentTag(tag); setIsModalOpen(true); }}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(tag.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

                {/* Pagination Controls */}
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div className="text-sm text-gray-500">
                        Showing {Math.min((page - 1) * perPage + 1, totalItems)} to {Math.min(page * perPage, totalItems)} of {totalItems} results
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-2 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ArrowLeft size={16} />
                        </button>
                        <span className="text-sm font-medium text-gray-700">
                            Page {page} of {Math.max(1, totalPages)}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages || totalPages === 0}
                            className="p-2 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={currentTag.id ? 'Edit Tag' : 'Add New Tag'}
                size="sm"
            >
                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tag Name</label>
                        <input
                            type="text"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            value={currentTag.name || ''}
                            onChange={(e) => setCurrentTag({ ...currentTag, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            value={currentTag.slug || ''}
                            onChange={(e) => setCurrentTag({ ...currentTag, slug: e.target.value })}
                            placeholder="Auto-generated if empty"
                        />
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
                            {currentTag.id ? 'Save Changes' : 'Create Tag'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default BlogTagManager;
