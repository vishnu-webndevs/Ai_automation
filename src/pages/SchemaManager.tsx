import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, AlertCircle } from 'lucide-react';
import { api } from '../api';
import type { SchemaTemplate } from '../types';
import Modal from '../components/ui/Modal';

const SchemaManager = () => {
    const [schemas, setSchemas] = useState<SchemaTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentSchema, setCurrentSchema] = useState<Partial<SchemaTemplate>>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [jsonError, setJsonError] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await api.get('/schemas');
            const data = Array.isArray(response.data) ? response.data : response.data.data || [];
            // Map backend data to frontend format
            const mapped = data.map((item: any) => ({
                ...item,
                template: typeof item.schema_json === 'string' ? item.schema_json : JSON.stringify(item.schema_json, null, 2),
                name: item.page?.title || item.type || 'Untitled Schema'
            }));
            setSchemas(mapped);
        } catch (error) {
            console.error('Failed to fetch schemas', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const validateJson = (json: string) => {
        try {
            JSON.parse(json);
            setJsonError(null);
            return true;
        } catch (e: any) {
            setJsonError(e.message);
            return false;
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (currentSchema.template && !validateJson(currentSchema.template)) {
            return;
        }

        const payload = {
            ...currentSchema,
            schema_json: currentSchema.template ? JSON.parse(currentSchema.template) : {}
        };
        // Remove frontend-only fields
        delete payload.template;
        delete payload.name; 

        try {
            if (currentSchema.id) {
                await api.put(`/schemas/${currentSchema.id}`, payload);
            } else {
                await api.post('/schemas', payload);
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            console.error('Failed to save schema', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this schema template?')) {
            try {
                await api.delete(`/schemas/${id}`);
                fetchData();
            } catch (error) {
                console.error('Failed to delete schema', error);
            }
        }
    };

    const filteredSchemas = schemas.filter(schema => 
        (schema.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (schema.type || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Schema Templates</h1>
                    <p className="text-gray-500">Manage JSON-LD schema markup templates</p>
                </div>
                <button 
                    onClick={() => { setCurrentSchema({ is_active: true, template: '{\n  "@context": "https://schema.org",\n  "@type": "WebPage"\n}' }); setIsModalOpen(true); }}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    <span>Add Template</span>
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input 
                            type="text"
                            placeholder="Search schemas..."
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
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Loading schemas...</td>
                                </tr>
                            ) : filteredSchemas.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No schemas found.</td>
                                </tr>
                            ) : (
                                filteredSchemas.map((schema) => (
                                    <tr key={schema.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{schema.name}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                                                {schema.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                schema.is_active 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {schema.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => { setCurrentSchema(schema); setIsModalOpen(true); }}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(schema.id)}
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
                title={currentSchema.id ? 'Edit Schema' : 'Add New Schema'}
                size="lg"
            >
                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                            type="text"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            value={currentSchema.name || ''}
                            onChange={(e) => setCurrentSchema({ ...currentSchema, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <input
                            type="text"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            value={currentSchema.type || ''}
                            onChange={(e) => setCurrentSchema({ ...currentSchema, type: e.target.value })}
                            placeholder="e.g. Article, Product, FAQ"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">JSON Template</label>
                        <div className="relative">
                            <textarea
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-blue-500 font-mono text-sm min-h-[200px] ${
                                    jsonError ? 'border-red-300 focus:ring-red-500/20' : 'border-gray-300 focus:ring-blue-500/20'
                                }`}
                                value={currentSchema.template || ''}
                                onChange={(e) => {
                                    setCurrentSchema({ ...currentSchema, template: e.target.value });
                                    validateJson(e.target.value);
                                }}
                            />
                            {jsonError && (
                                <div className="absolute bottom-2 left-2 right-2 bg-red-50 text-red-600 text-xs p-2 rounded flex items-center gap-2">
                                    <AlertCircle size={14} />
                                    {jsonError}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="is_active_schema"
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={currentSchema.is_active || false}
                            onChange={(e) => setCurrentSchema({ ...currentSchema, is_active: e.target.checked })}
                        />
                        <label htmlFor="is_active_schema" className="text-sm font-medium text-gray-700">Active</label>
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
                            disabled={!!jsonError}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {currentSchema.id ? 'Save Changes' : 'Create Template'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default SchemaManager;
