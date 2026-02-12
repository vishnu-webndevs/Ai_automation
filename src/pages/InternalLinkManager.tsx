import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, AlertTriangle, Zap } from 'lucide-react';
import { api } from '../api';
import type { InternalLink } from '../types';
import Modal from '../components/ui/Modal';

const InternalLinkManager = () => {
    const [links, setLinks] = useState<InternalLink[]>([]);
    const [orphanPages, setOrphanPages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentLink, setCurrentLink] = useState<Partial<InternalLink>>({});
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [linksRes, orphansRes] = await Promise.all([
                api.get('/internal-links'),
                api.get('/internal-links/orphans')
            ]);
            setLinks(Array.isArray(linksRes.data) ? linksRes.data : linksRes.data.data || []);
            setOrphanPages(Array.isArray(orphansRes.data) ? orphansRes.data : orphansRes.data.data || []);
        } catch (error) {
            console.error('Failed to fetch SEO data', error);
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
            await api.post('/internal-links', currentLink);
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            console.error('Failed to save link', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to remove this internal link?')) {
            try {
                await api.delete(`/internal-links/${id}`);
                fetchData();
            } catch (error) {
                console.error('Failed to delete link', error);
            }
        }
    };

    const handleAutoSuggest = async () => {
        try {
            alert('Running AI Auto-Suggest for internal links...');
            // await api.post('/seo/internal-links/auto-suggest');
        } catch (error) {
            console.error('Auto-suggest failed', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Internal Linking</h1>
                    <p className="text-gray-500">Manage internal link structure and orphan pages</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={handleAutoSuggest}
                        className="flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors"
                    >
                        <Zap size={20} />
                        <span>Auto Suggest</span>
                    </button>
                    <button 
                        onClick={() => { setCurrentLink({}); setIsModalOpen(true); }}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={20} />
                        <span>Add Link</span>
                    </button>
                </div>
            </div>

            {orphanPages.length > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertTriangle className="text-orange-500 shrink-0 mt-1" size={20} />
                    <div>
                        <h3 className="font-semibold text-orange-800">Orphan Pages Detected</h3>
                        <p className="text-orange-700 text-sm mt-1">
                            {orphanPages.length} pages have no internal links pointing to them. Consider linking to these pages to improve SEO.
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {orphanPages.slice(0, 5).map(page => (
                                <span key={page.id} className="inline-flex items-center px-2 py-1 rounded bg-white text-xs font-medium text-orange-800 border border-orange-100">
                                    {page.title}
                                </span>
                            ))}
                            {orphanPages.length > 5 && (
                                <span className="text-xs text-orange-600 self-center">+{orphanPages.length - 5} more</span>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input 
                            type="text"
                            placeholder="Search links..."
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
                                <th className="px-6 py-4">Source Page</th>
                                <th className="px-6 py-4">Target Page</th>
                                <th className="px-6 py-4">Anchor Text</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading links...</td>
                                </tr>
                            ) : links.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No internal links found.</td>
                                </tr>
                            ) : (
                                links.map((link) => (
                                    <tr key={link.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            Page #{link.source_page_id}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            Page #{link.target_page_id}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            "{link.anchor_text}"
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                link.is_manual ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {link.is_manual ? 'Manual' : 'Auto'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => handleDelete(link.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
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
                title="Add Internal Link"
            >
                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Source Page ID</label>
                        <input
                            type="number"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            value={currentLink.source_page_id || ''}
                            onChange={(e) => setCurrentLink({ ...currentLink, source_page_id: Number(e.target.value) })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Target Page ID</label>
                        <input
                            type="number"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            value={currentLink.target_page_id || ''}
                            onChange={(e) => setCurrentLink({ ...currentLink, target_page_id: Number(e.target.value) })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Anchor Text</label>
                        <input
                            type="text"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            value={currentLink.anchor_text || ''}
                            onChange={(e) => setCurrentLink({ ...currentLink, anchor_text: e.target.value })}
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
                            Create Link
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default InternalLinkManager;
