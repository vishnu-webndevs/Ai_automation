import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Link2 } from 'lucide-react';
import { api, listPages } from '../api';
import type { Cta } from '../types';
import Modal from '../components/ui/Modal';

interface PageOption {
    id: number;
    title: string;
}

const CtaManager = () => {
    const [ctas, setCtas] = useState<Cta[]>([]);
    const [pages, setPages] = useState<PageOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [currentCta, setCurrentCta] = useState<Partial<Cta>>({});
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [ctasRes, pagesRes] = await Promise.all([
                api.get('/ctas'),
                listPages({ per_page: 100, sort: 'title', dir: 'asc' })
            ]);
            setCtas(Array.isArray(ctasRes.data) ? ctasRes.data : ctasRes.data.data || []);
            setPages((pagesRes.data.data || []).map((p: any) => ({ id: p.id, title: p.title })));
        } catch (error) {
            console.error('Failed to fetch data', error);
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
            if (currentCta.id) {
                await api.put(`/ctas/${currentCta.id}`, currentCta);
            } else {
                await api.post('/ctas', currentCta);
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            console.error('Failed to save CTA', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this CTA?')) {
            try {
                await api.delete(`/ctas/${id}`);
                fetchData();
            } catch (error) {
                console.error('Failed to delete CTA', error);
            }
        }
    };

    const toggleActive = async (cta: Cta) => {
        try {
            await api.patch(`/ctas/${cta.id}/toggle-active`);
            fetchData();
        } catch (error) {
            console.error('Failed to toggle status', error);
        }
    };

    const openPreview = (cta: Cta) => {
        setCurrentCta(cta);
        setIsPreviewOpen(true);
    };

    const filteredCtas = ctas.filter(cta => 
        cta.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cta.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">CTA Manager</h1>
                    <p className="text-gray-500">Manage Call-to-Actions, popups, and banners</p>
                </div>
                <button 
                    onClick={() => { setCurrentCta({ is_active: true, type: 'inline' }); setIsModalOpen(true); }}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    <span>Add CTA</span>
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input 
                            type="text"
                            placeholder="Search CTAs..."
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
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Content Preview</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading CTAs...</td>
                                </tr>
                            ) : filteredCtas.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No CTAs found.</td>
                                </tr>
                            ) : (
                                filteredCtas.map((cta) => (
                                    <tr key={cta.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{cta.name}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium capitalize
                                                ${cta.type === 'popup' ? 'bg-purple-100 text-purple-800' : 
                                                  cta.type === 'banner' ? 'bg-orange-100 text-orange-800' : 
                                                  'bg-blue-100 text-blue-800'}`}>
                                                {cta.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-500 truncate max-w-xs">
                                                {cta.content.replace(/<[^>]*>?/gm, '')}
                                            </div>
                                            {cta.page_ids && cta.page_ids.length > 0 && (
                                                <div className="mt-1 flex items-center gap-1 text-xs text-blue-600">
                                                    <Link2 size={12} />
                                                    <span>{cta.page_ids.length} page{cta.page_ids.length !== 1 ? 's' : ''} assigned</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button 
                                                onClick={() => toggleActive(cta)}
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                                                    cta.is_active 
                                                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                                }`}
                                            >
                                                {cta.is_active ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => openPreview(cta)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Preview"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => { setCurrentCta(cta); setIsModalOpen(true); }}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(cta.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
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
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={currentCta.id ? 'Edit CTA' : 'Add New CTA'}
            >
                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CTA Name</label>
                        <input
                            type="text"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            value={currentCta.name || ''}
                            onChange={(e) => setCurrentCta({ ...currentCta, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            value={currentCta.type || 'inline'}
                            onChange={(e) => setCurrentCta({ ...currentCta, type: e.target.value as any })}
                        >
                            <option value="inline">Inline</option>
                            <option value="popup">Popup</option>
                            <option value="banner">Banner</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Content (HTML)</label>
                        <textarea
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-h-[150px] font-mono text-sm"
                            value={currentCta.content || ''}
                            onChange={(e) => setCurrentCta({ ...currentCta, content: e.target.value })}
                            placeholder="<div>Your CTA Content Here</div>"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Assign to Pages</label>
                        <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                            {pages.length === 0 ? (
                                <p className="text-sm text-gray-500">No pages found.</p>
                            ) : (
                                pages.map(page => (
                                    <label key={page.id} className="flex items-center gap-2 hover:bg-gray-50 p-1 rounded cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            checked={currentCta.page_ids?.includes(page.id) || false}
                                            onChange={(e) => {
                                                const newPageIds = e.target.checked
                                                    ? [...(currentCta.page_ids || []), page.id]
                                                    : (currentCta.page_ids || []).filter(id => id !== page.id);
                                                setCurrentCta({ ...currentCta, page_ids: newPageIds });
                                            }}
                                        />
                                        <span className="text-sm text-gray-700">{page.title}</span>
                                    </label>
                                ))
                            )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Select pages where this CTA should appear.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="is_active"
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={currentCta.is_active || false}
                            onChange={(e) => setCurrentCta({ ...currentCta, is_active: e.target.checked })}
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
                            {currentCta.id ? 'Save Changes' : 'Create CTA'}
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                title="CTA Preview"
            >
                <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide">
                            Preview ({currentCta.type})
                        </div>
                        <div 
                            className="prose max-w-none bg-white p-4 border border-dashed border-gray-300 rounded"
                            dangerouslySetInnerHTML={{ __html: currentCta.content || '' }}
                        />
                    </div>
                    <div className="flex justify-end pt-4">
                         <button
                            type="button"
                            onClick={() => setIsPreviewOpen(false)}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default CtaManager;
