import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { api } from '../api';
import type { Redirect } from '../types';
import Modal from '../components/ui/Modal';

const RedirectManager = () => {
    const [redirects, setRedirects] = useState<Redirect[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentRedirect, setCurrentRedirect] = useState<Partial<Redirect>>({});
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await api.get('/redirects');
            setRedirects(Array.isArray(response.data) ? response.data : response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch redirects', error);
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
            if (currentRedirect.id) {
                await api.put(`/redirects/${currentRedirect.id}`, currentRedirect);
            } else {
                await api.post('/redirects', currentRedirect);
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            console.error('Failed to save redirect', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this redirect?')) {
            try {
                await api.delete(`/redirects/${id}`);
                fetchData();
            } catch (error) {
                console.error('Failed to delete redirect', error);
            }
        }
    };

    const toggleActive = async (redirect: Redirect) => {
        try {
            await api.patch(`/redirects/${redirect.id}/toggle-active`);
            fetchData();
        } catch (error) {
            console.error('Failed to toggle status', error);
        }
    };

    const filteredRedirects = redirects.filter(redirect => 
        redirect.source_url.toLowerCase().includes(searchTerm.toLowerCase()) ||
        redirect.target_url.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Simple loop detection visualization
    const hasLoop = (redirect: Redirect) => {
        return redirect.source_url === redirect.target_url;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Redirects</h1>
                    <p className="text-gray-500">Manage 301 and 302 redirects</p>
                </div>
                <button 
                    onClick={() => { setCurrentRedirect({ type: 301, is_active: true }); setIsModalOpen(true); }}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    <span>Add Redirect</span>
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input 
                            type="text"
                            placeholder="Search redirects..."
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
                                <th className="px-6 py-4">Source URL</th>
                                <th className="px-6 py-4">Target URL</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading redirects...</td>
                                </tr>
                            ) : filteredRedirects.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No redirects found.</td>
                                </tr>
                            ) : (
                                filteredRedirects.map((redirect) => (
                                    <tr key={redirect.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-mono text-sm text-gray-700">{redirect.source_url}</div>
                                            {hasLoop(redirect) && (
                                                <span className="inline-flex items-center gap-1 text-xs text-red-600 mt-1">
                                                    <AlertTriangle size={12} /> Redirect Loop
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-mono text-sm text-gray-700">{redirect.target_url}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
                                                {redirect.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button 
                                                onClick={() => toggleActive(redirect)}
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                                                    redirect.is_active 
                                                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                                }`}
                                            >
                                                {redirect.is_active ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => { setCurrentRedirect(redirect); setIsModalOpen(true); }}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(redirect.id)}
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
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={currentRedirect.id ? 'Edit Redirect' : 'Add New Redirect'}
            >
                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Source URL</label>
                        <input
                            type="text"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            value={currentRedirect.source_url || ''}
                            onChange={(e) => setCurrentRedirect({ ...currentRedirect, source_url: e.target.value })}
                            placeholder="/old-page"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Target URL</label>
                        <input
                            type="text"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            value={currentRedirect.target_url || ''}
                            onChange={(e) => setCurrentRedirect({ ...currentRedirect, target_url: e.target.value })}
                            placeholder="/new-page"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            value={currentRedirect.type || 301}
                            onChange={(e) => setCurrentRedirect({ ...currentRedirect, type: Number(e.target.value) as 301 | 302 })}
                        >
                            <option value={301}>301 (Permanent)</option>
                            <option value={302}>302 (Temporary)</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="is_active_red"
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={currentRedirect.is_active || false}
                            onChange={(e) => setCurrentRedirect({ ...currentRedirect, is_active: e.target.checked })}
                        />
                        <label htmlFor="is_active_red" className="text-sm font-medium text-gray-700">Active</label>
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
                            {currentRedirect.id ? 'Save Changes' : 'Create Redirect'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default RedirectManager;
