import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit, Trash2, Lock, Unlock, ExternalLink, ArrowUp, ArrowDown } from 'lucide-react';
import { api, toggleLock, FRONTEND_URL } from '../api';
import type { Service, ServiceCategory, ServiceFeature } from '../types';
import Modal from '../components/ui/Modal';

interface ServiceWithLock extends Service {
    locked_status?: {
        is_locked: boolean;
        locked_at: string | null;
        locked_by: string | null;
        locked_by_id: number | null;
    };
    updated_at?: string;
}

const ServicesManager = () => {
    const [services, setServices] = useState<ServiceWithLock[]>([]);
    const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentService, setCurrentService] = useState<Partial<ServiceWithLock>>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [features, setFeatures] = useState<ServiceFeature[]>([]);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
    const [aiModel, setAiModel] = useState<'lorum' | 'openai' | 'gemini'>('lorum');
    const [aiTone, setAiTone] = useState('Professional');
    const [aiContentLength, setAiContentLength] = useState<'Short' | 'Medium' | 'Long'>('Long');
    const [confirmOverwriteAi, setConfirmOverwriteAi] = useState(false);
    const [generatingAi, setGeneratingAi] = useState(false);
    
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
            const response = await api.get('/services', {
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
                setServices(data.data);
                setTotalPages(data.last_page);
                setTotalItems(data.total);
            } else {
                setServices(Array.isArray(data) ? data : data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch services', error);
        } finally {
            setLoading(false);
        }
    }, [page, perPage, searchTerm, sort, dir]);

    useEffect(() => {
        const t = setTimeout(fetchData, 300);
        return () => clearTimeout(t);
    }, [fetchData]);

    useEffect(() => {
        api.get('/service-categories', { params: { all: 1 } })
            .then((res) => {
                const rows = Array.isArray(res.data) ? (res.data as ServiceCategory[]) : (res.data?.data || []);
                setServiceCategories(rows);
            })
            .catch((err) => console.error('Failed to load service categories', err));
    }, []);

    const loadService = useCallback(async (id: number) => {
        try {
            const res = await api.get(`/services/${id}`);
            const data = res.data as ServiceWithLock;
            setCurrentService(data);
            const fromRel = Array.isArray((data as any).categories) ? (data as any).categories.map((c: any) => c?.id).filter(Boolean) : [];
            const fromPrimary = (data as any).service_category_id ? [(data as any).service_category_id] : [];
            const combined = Array.from(new Set([...(fromRel as number[]), ...(fromPrimary as number[])]));
            setSelectedCategoryIds(combined);
            const list: ServiceFeature[] = Array.isArray((data as any).features)
                ? ((data as any).features as ServiceFeature[])
                      .slice()
                      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
                : [];
            setFeatures(
                list.map((f, index) => ({
                    id: f.id,
                    title: f.title || `Section ${index + 1}`,
                    description: f.description || '',
                    icon: f.icon || '',
                    sort_order: index,
                }))
            );
            setIsModalOpen(true);
        } catch (error) {
            console.error('Failed to load service', error);
        }
    }, []);

    const generateAi = async () => {
        if (!(currentService as any)?.id) return;
        setGeneratingAi(true);
        try {
            const res = await api.post('/ai/generate-service', {
                service_id: (currentService as any).id,
                model: aiModel,
                tone: aiTone,
                content_length: aiContentLength,
                confirm_overwrite: confirmOverwriteAi,
                run_now: true,
            });
            const updated = res.data?.service;
            if (updated) {
                setCurrentService(updated);
                const list: ServiceFeature[] = Array.isArray((updated as any).features)
                    ? ((updated as any).features as ServiceFeature[])
                          .slice()
                          .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
                    : [];
                setFeatures(
                    list.map((f, index) => ({
                        id: f.id,
                        title: f.title || `Section ${index + 1}`,
                        description: f.description || '',
                        icon: f.icon || '',
                        sort_order: index,
                    }))
                );
            }
            await fetchData();
            alert('AI content generated and saved.');
        } catch (e: any) {
            const code = e?.response?.data?.code;
            if (e?.response?.status === 409 && code === 'CONFIRM_OVERWRITE_REQUIRED') {
                setConfirmOverwriteAi(true);
                alert('This service already has content. Enable overwrite and run again.');
            } else {
                alert(e?.response?.data?.message || 'Failed to queue AI generation');
            }
        } finally {
            setGeneratingAi(false);
        }
    };

    const addFeature = () => {
        setFeatures((prev) => [
            ...prev,
            {
                title: '',
                description: '',
                icon: '',
                sort_order: prev.length,
            },
        ]);
    };

    const updateFeature = (index: number, field: keyof ServiceFeature, value: string) => {
        setFeatures((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: value };
            return next;
        });
    };

    const removeFeature = (index: number) => {
        setFeatures((prev) => prev.filter((_, i) => i !== index));
    };

    const moveFeature = (index: number, direction: 'up' | 'down') => {
        setFeatures((prev) => {
            if (direction === 'up' && index === 0) return prev;
            if (direction === 'down' && index === prev.length - 1) return prev;
            const next = [...prev];
            const targetIndex = direction === 'up' ? index - 1 : index + 1;
            [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
            return next;
        });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const primaryCategoryId =
                (currentService as any).service_category_id ||
                selectedCategoryIds[0] ||
                (serviceCategories[0]?.id ?? undefined);

            const categoryIds = Array.from(
                new Set([...(selectedCategoryIds || []), ...(primaryCategoryId ? [primaryCategoryId] : [])])
            ).filter(Boolean) as number[];

            const payload: any = {
                ...currentService,
                service_category_id: primaryCategoryId,
                category_ids: categoryIds,
                short_description: (currentService as any).description || (currentService as any).short_description,
                features: features.map((f, index) => ({
                    title: f.title || `Section ${index + 1}`,
                    description: f.description || '',
                    icon: f.icon || '',
                    sort_order: index,
                })),
            };

            if (currentService.id) {
                await api.put(`/services/${currentService.id}`, payload);
            } else {
                await api.post('/services', payload);
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            console.error('Failed to save service', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this service?')) {
            try {
                await api.delete(`/services/${id}`);
                fetchData();
            } catch (error) {
                console.error('Failed to delete service', error);
            }
        }
    };

    const toggleActive = async (service: ServiceWithLock) => {
        try {
            await api.patch(`/services/${service.id}/toggle-active`);
            fetchData();
        } catch (error) {
            console.error('Failed to toggle status', error);
        }
    };

    const handleToggleLock = async (id: number) => {
        try {
            await toggleLock('services', id);
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

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Services</h1>
                    <p className="text-gray-500">Manage your service offerings and taxonomy</p>
                </div>
                <button 
                    onClick={() => {
                        const defaultCategoryId = serviceCategories[0]?.id;
                        setCurrentService({ is_active: true, service_category_id: defaultCategoryId });
                        setSelectedCategoryIds(defaultCategoryId ? [defaultCategoryId] : []);
                        setFeatures([]);
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    <span>Add Service</span>
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input 
                            type="text"
                            placeholder="Search services..."
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
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading services...</td>
                                </tr>
                            ) : services.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No services found.</td>
                                </tr>
                            ) : (
                                services.map((service) => (
                                    <tr key={service.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{service.name}</div>
                                            {service.description && (
                                                <div className="text-sm text-gray-500 truncate max-w-xs">{service.description}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                                                {service.slug}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button 
                                                onClick={() => toggleActive(service)}
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                                                    service.is_active 
                                                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                                }`}
                                            >
                                                {service.is_active ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {service.updated_at ? new Date(service.updated_at).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {service.locked_status?.is_locked ? (
                                                <div className="flex justify-center group relative cursor-help">
                                                    <Lock size={16} className="text-red-500" />
                                                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 pointer-events-none">
                                                        Locked by {service.locked_status.locked_by} at {new Date(service.locked_status.locked_at!).toLocaleString()}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-300">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => window.open(`${FRONTEND_URL}/services/${service.slug}`, '_blank')}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="View Public Page"
                                                >
                                                    <ExternalLink size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleToggleLock(service.id)}
                                                    className={`p-2 rounded-lg transition-colors ${service.locked_status?.is_locked ? 'text-red-500 hover:bg-red-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                                                    title={service.locked_status?.is_locked ? 'Unlock' : 'Lock'}
                                                >
                                                    {service.locked_status?.is_locked ? <Unlock size={18} /> : <Lock size={18} />}
                                                </button>
                                                <button 
                                                    onClick={() => loadService(service.id)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    disabled={service.locked_status?.is_locked}
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(service.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    disabled={service.locked_status?.is_locked}
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
                title={currentService.id ? 'Edit Service' : 'Add New Service'}
            >
                <form onSubmit={handleSave} className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Primary Category</label>
                        <select
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            value={(currentService as any).service_category_id || ''}
                            onChange={(e) => {
                                const id = Number(e.target.value);
                                setCurrentService({ ...currentService, service_category_id: id });
                                setSelectedCategoryIds((prev) => {
                                    const next = new Set(prev);
                                    next.add(id);
                                    return Array.from(next);
                                });
                            }}
                        >
                            <option value="" disabled>
                                Select a category
                            </option>
                            {serviceCategories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                        <div className="mt-2 text-sm text-gray-500">
                            Select additional categories below if this service fits multiple groups.
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Additional Categories</label>
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 max-h-40 overflow-y-auto space-y-2">
                            {serviceCategories.length === 0 ? (
                                <div className="text-sm text-gray-500">No categories yet. Create one first.</div>
                            ) : (
                                serviceCategories.map((c) => {
                                    const primaryId = (currentService as any).service_category_id;
                                    const checked = selectedCategoryIds.includes(c.id) || primaryId === c.id;
                                    const disabled = primaryId === c.id;
                                    return (
                                        <label key={c.id} className="flex items-center gap-2 text-sm text-gray-700">
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                disabled={disabled}
                                                onChange={(e) => {
                                                    const nextChecked = e.target.checked;
                                                    setSelectedCategoryIds((prev) => {
                                                        const set = new Set(prev);
                                                        if (nextChecked) set.add(c.id);
                                                        else set.delete(c.id);
                                                        if (primaryId) set.add(primaryId);
                                                        return Array.from(set);
                                                    });
                                                }}
                                            />
                                            <span>{c.name}</span>
                                            {disabled && <span className="text-xs text-gray-500">(Primary)</span>}
                                        </label>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
                        <input
                            type="text"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            value={currentService.name || ''}
                            onChange={(e) => setCurrentService({ ...currentService, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            value={currentService.slug || ''}
                            onChange={(e) => setCurrentService({ ...currentService, slug: e.target.value })}
                            placeholder="Auto-generated if empty"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-h-[100px]"
                            value={currentService.description || ''}
                            onChange={(e) => setCurrentService({ ...currentService, description: e.target.value })}
                        />
                    </div>
                    <div className="border-t border-gray-200 pt-4">
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700">Service Sections</label>
                            <button
                                type="button"
                                onClick={addFeature}
                                className="inline-flex items-center gap-1 text-xs px-2 py-1 border border-blue-500 text-blue-600 rounded-md hover:bg-blue-50"
                            >
                                <Plus size={14} />
                                <span>Add Section</span>
                            </button>
                        </div>
                        {features.length === 0 ? (
                            <div className="text-xs text-gray-500 border border-dashed border-gray-300 rounded-lg px-3 py-4 bg-gray-50">
                                No sections yet. Click "Add Section" to define highlights for this service.
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                                {features.map((feature, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg bg-gray-50 p-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="text-xs font-semibold text-gray-600">
                                                Section {index + 1}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => moveFeature(index, 'up')}
                                                    disabled={index === 0}
                                                    className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30"
                                                >
                                                    <ArrowUp size={14} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => moveFeature(index, 'down')}
                                                    disabled={index === features.length - 1}
                                                    className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30"
                                                >
                                                    <ArrowDown size={14} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => removeFeature(index)}
                                                    className="p-1 rounded text-red-500 hover:bg-red-50"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <input
                                                type="text"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                                placeholder="Section title"
                                                value={feature.title || ''}
                                                onChange={(e) => updateFeature(index, 'title', e.target.value)}
                                            />
                                            <textarea
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                                placeholder="Short description for this section"
                                                value={feature.description || ''}
                                                onChange={(e) => updateFeature(index, 'description', e.target.value)}
                                            />
                                            <input
                                                type="text"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                                placeholder="Icon name (optional, e.g. Zap, Shield)"
                                                value={feature.icon || ''}
                                                onChange={(e) => updateFeature(index, 'icon', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="is_active"
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={currentService.is_active || false}
                            onChange={(e) => setCurrentService({ ...currentService, is_active: e.target.checked })}
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
                            {currentService.id ? 'Save Changes' : 'Create Service'}
                        </button>
                    </div>

                    {currentService.id && (
                        <div className="pt-6 border-t border-gray-200">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <div className="text-sm font-semibold text-gray-900">AI content generation</div>
                                    <div className="text-sm text-gray-500">Generates full service content_json for frontend rendering.</div>
                                </div>
                                <button
                                    type="button"
                                    onClick={generateAi}
                                    disabled={generatingAi}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                                >
                                    {generatingAi ? 'Queuing...' : 'Generate AI Content'}
                                </button>
                            </div>

                            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                                        value={aiModel}
                                        onChange={(e) => setAiModel(e.target.value as any)}
                                    >
                                        <option value="lorum">Lorum</option>
                                        <option value="openai">OpenAI</option>
                                        <option value="gemini">Gemini</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tone</label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                                        value={aiTone}
                                        onChange={(e) => setAiTone(e.target.value)}
                                    >
                                        <option value="Professional">Professional</option>
                                        <option value="Casual">Casual</option>
                                        <option value="Technical">Technical</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Length</label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                                        value={aiContentLength}
                                        onChange={(e) => setAiContentLength(e.target.value as any)}
                                    >
                                        <option value="Short">Short</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Long">Long</option>
                                    </select>
                                </div>
                            </div>

                            <label className="mt-4 flex items-center gap-2 text-sm text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={confirmOverwriteAi}
                                    onChange={(e) => setConfirmOverwriteAi(e.target.checked)}
                                />
                                Overwrite existing service content
                            </label>
                        </div>
                    )}
                </form>
            </Modal>
        </div>
    );
};

export default ServicesManager;
