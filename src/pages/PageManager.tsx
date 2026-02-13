import { useCallback, useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, AlertTriangle, CheckCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import { TemplateLibraryModal } from '../components/templates/TemplateLibraryModal';
import {
  bulkUpdatePageStatus,
  duplicatePage,
  listPages,
  togglePublish,
  updatePage,
  validatePageSlug,
  getPageVersions,
  restorePageVersion,
  checkKeywordConflicts,
  toggleLock
} from '../api';
import type { PageVersion, KeywordConflict } from '../types';
import { Lock, Unlock } from 'lucide-react';

type PageRow = {
  id: number;
  title: string;
  slug: string;
  type: string;
  status: 'draft' | 'published';
  updated_at: string;
  sections_count?: number;
  seo?: {
    noindex?: boolean;
    nofollow?: boolean;
  } | null;
  locked_status?: {
    is_locked: boolean;
    locked_at: string | null;
    locked_by: string | null;
    locked_by_id: number | null;
  };
};

const PageManager = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<PageRow[]>([]);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // ... existing filter states ...
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState<'draft' | 'published' | ''>('');
  const [sort, setSort] = useState('updated_at');
  const [dir, setDir] = useState<'asc' | 'desc'>('desc');

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkStatus, setBulkStatus] = useState<'draft' | 'published'>('draft');

  // Inline edit states
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editType, setEditType] = useState('');
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [slugChecking, setSlugChecking] = useState(false);

  // Advanced Edit / History Modal
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [currentDetailId, setCurrentDetailId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'history' | 'seo'>('history');
  
  // Version History States
  const [versions, setVersions] = useState<PageVersion[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);

  // SEO/Conflict States
  const [checkKeyword, setCheckKeyword] = useState('');
  const [noIndex, setNoIndex] = useState(false);
  const [noFollow, setNoFollow] = useState(false);
  const [conflicts, setConflicts] = useState<KeywordConflict[]>([]);
  const [checkingConflicts, setCheckingConflicts] = useState(false);
  const [conflictChecked, setConflictChecked] = useState(false);

  // Template Modal
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [templatePageId, setTemplatePageId] = useState<number | null>(null);

  const openTemplateModal = (id: number) => {
    setTemplatePageId(id);
    setTemplateModalOpen(true);
  };

  const publicBaseUrl = useMemo(() => {
    const url = (import.meta as any).env?.VITE_PUBLIC_SITE_URL;
    // Fix: Prevent preview links from opening on API domain
    if (url && url.includes('api.totan.ai')) {
        return 'https://totan.ai';
    }
    return url || 'https://totan.ai';
  }, []);

  const fetchRows = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listPages({
        q: q || undefined,
        type: type || undefined,
        status: (status as any) || undefined,
        sort,
        dir,
        per_page: perPage,
        page,
      });

      setRows(res.data.data || []);
      setTotalPages(res.data.last_page || 1);
      setTotalItems(res.data.total || 0);
      setSelectedIds([]);
      setEditingId(null);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load pages');
    } finally {
      setLoading(false);
    }
  }, [dir, q, sort, status, type, page, perPage]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      fetchRows();
    }, 400);
    return () => window.clearTimeout(t);
  }, [fetchRows]);

  const handleToggleLock = async (id: number) => {
      try {
          await toggleLock('pages', id);
          await fetchRows();
      } catch (e: any) {
          setError(e?.response?.data?.message || 'Failed to toggle lock');
      }
  };

  const toggleAll = () => {
    if (selectedIds.length === rows.length) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(rows.map((r) => r.id));
  };

  const toggleOne = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const startEdit = (row: PageRow) => {
    setEditingId(row.id);
    setEditTitle(row.title);
    setEditSlug(row.slug);
    setEditType(row.type);
    setSlugAvailable(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditSlug('');
    setEditType('');
    setSlugAvailable(null);
  };

  const checkSlug = async (slug: string, pageId: number) => {
    setSlugChecking(true);
    try {
      const res = await validatePageSlug(slug, pageId);
      setSlugAvailable(!!res.data.available);
    } catch {
      setSlugAvailable(null);
    } finally {
      setSlugChecking(false);
    }
  };

  const saveEdit = async () => {
    if (!editingId) return;

    if (slugAvailable === false) {
      setError('Slug is already taken');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await updatePage(editingId, { title: editTitle, slug: editSlug, type: editType });
      await fetchRows();
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Failed to update page';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const onTogglePublish = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await togglePublish(id);
      await fetchRows();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const onDuplicate = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await duplicatePage(id);
      await fetchRows();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to duplicate page');
    } finally {
      setLoading(false);
    }
  };

  const onBulkUpdate = async () => {
    if (selectedIds.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      await bulkUpdatePageStatus(selectedIds, bulkStatus);
      await fetchRows();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Bulk update failed');
    } finally {
      setLoading(false);
    }
  };

  const openPreview = (slug: string) => {
    window.open(`${publicBaseUrl}/${slug}`, '_blank', 'noreferrer');
  };

  const openRegenerate = (id: number) => {
    navigate(`/web-admin/ai-generator?pageId=${id}&confirmOverwrite=1`);
  };

  const openDetails = async (row: PageRow, tab: 'history' | 'seo' = 'history') => {
    setCurrentDetailId(row.id);
    setActiveTab(tab);
    setDetailsModalOpen(true);
    
    // Reset states
    setVersions([]);
    setCheckKeyword(row.title); // Default to title
    setNoIndex(!!row.seo?.noindex);
    setNoFollow(!!row.seo?.nofollow);
    setConflicts([]);
    setConflictChecked(false);

    if (tab === 'history') {
        loadVersions(row.id);
    }
  };

  const loadVersions = async (id: number) => {
    setLoadingVersions(true);
    try {
        const res = await getPageVersions(id);
        setVersions(res.data.data || []);
    } catch (e) {
        console.error("Failed to load versions", e);
    } finally {
        setLoadingVersions(false);
    }
  };

  const handleRestore = async (versionId: number) => {
    if (!confirm('Are you sure you want to restore this version? Current content will be overwritten.')) return;
    if (!currentDetailId) return;

    try {
        await restorePageVersion(currentDetailId, versionId);
        setDetailsModalOpen(false);
        fetchRows(); // Refresh list
    } catch (e) {
        console.error("Failed to restore version", e);
        alert('Failed to restore version');
    }
  };

  const saveSeoSettings = async () => {
    if (!currentDetailId) return;
    setLoading(true);
    try {
        await updatePage(currentDetailId, {
            seo: {
                noindex: noIndex,
                nofollow: noFollow
            }
        });
        setDetailsModalOpen(false);
        fetchRows(); // Refresh data
    } catch (e: any) {
        setError(e?.response?.data?.message || 'Failed to save SEO settings');
    } finally {
        setLoading(false);
    }
  };

  const handleCheckConflicts = async () => {
    if (!checkKeyword || !currentDetailId) return;
    setCheckingConflicts(true);
    setConflictChecked(false);
    try {
        const res = await checkKeywordConflicts(checkKeyword, currentDetailId);
        setConflicts(res.data.data || []);
        setConflictChecked(true);
    } catch (e) {
        console.error("Failed to check conflicts", e);
    } finally {
        setCheckingConflicts(false);
    }
  };

  const toggleSort = (field: string) => {
    if (sort === field) {
      setDir((d) => (d === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSort(field);
    setDir('desc');
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Pages</h1>
        <Button onClick={() => navigate('/web-admin/ai-generator')} disabled={loading}>
          New Page (AI)
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-lg font-bold text-gray-800">Filters</h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Search</label>
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Title or slug" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <Input value={type} onChange={(e) => setType(e.target.value)} placeholder="service, blog, industry..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full p-2 border rounded bg-white"
              >
                <option value="">All</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div className="flex items-end gap-3">
              <Button onClick={fetchRows} disabled={loading}>
                {loading ? 'Loading...' : 'Apply'}
              </Button>
              <Button
                variant="secondary"
                outline
                onClick={() => {
                  setQ('');
                  setType('');
                  setStatus('');
                  setSort('updated_at');
                  setDir('desc');
                  fetchRows();
                }}
                disabled={loading}
              >
                Reset
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-lg font-bold text-gray-800">Bulk Actions</h2>
        </CardHeader>
        <CardBody>
          <div className="flex flex-wrap items-center gap-3">
            <div className="text-sm text-gray-600">{selectedIds.length} selected</div>
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value as any)}
              className="p-2 border rounded bg-white"
            >
              <option value="draft">Set Draft</option>
              <option value="published">Set Published</option>
            </select>
            <Button onClick={onBulkUpdate} disabled={loading || selectedIds.length === 0}>
              Apply
            </Button>
          </div>
        </CardBody>
      </Card>

      {error && <div className="mb-4 text-sm text-red-600">{error}</div>}

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-gray-800">Page List</h2>
        </CardHeader>
        <CardBody>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-gray-600">
                <tr className="border-b">
                  <th className="py-2 pr-3">
                    <input type="checkbox" checked={rows.length > 0 && selectedIds.length === rows.length} onChange={toggleAll} />
                  </th>
                  <th className="py-2 pr-3 cursor-pointer" onClick={() => toggleSort('title')}>
                    Title
                  </th>
                  <th className="py-2 pr-3 cursor-pointer" onClick={() => toggleSort('slug')}>
                    Slug
                  </th>
                  <th className="py-2 pr-3 cursor-pointer" onClick={() => toggleSort('type')}>
                    Type
                  </th>
                  <th className="py-2 pr-3 cursor-pointer" onClick={() => toggleSort('status')}>
                    Status
                  </th>
                  <th className="py-2 pr-3 cursor-pointer" onClick={() => toggleSort('updated_at')}>
                    Updated
                  </th>
                  <th className="py-2 pr-3 text-center">Lock</th>
                  <th className="py-2 pr-3">Sections</th>
                  <th className="py-2 pr-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const editing = editingId === row.id;
                  return (
                    <tr key={row.id} className="border-b last:border-b-0">
                      <td className="py-2 pr-3">
                        <input type="checkbox" checked={selectedIds.includes(row.id)} onChange={() => toggleOne(row.id)} />
                      </td>
                      <td className="py-2 pr-3">
                        {editing ? (
                          <input
                            className="w-full border rounded p-2"
                            value={editTitle}
                            onChange={(e) => {
                              setEditTitle(e.target.value);
                              const nextSlug = e.target.value
                                .trim()
                                .toLowerCase()
                                .replace(/[^a-z0-9]+/g, '-')
                                .replace(/(^-|-$)/g, '');
                              setEditSlug(nextSlug);
                              checkSlug(nextSlug, row.id);
                            }}
                          />
                        ) : (
                          <div className="font-medium text-gray-900">{row.title}</div>
                        )}
                      </td>
                      <td className="py-2 pr-3">
                        {editing ? (
                          <div>
                            <input
                              className={`w-full border rounded p-2 ${
                                slugAvailable === false ? 'border-red-500' : slugAvailable === true ? 'border-green-500' : ''
                              }`}
                              value={editSlug}
                              onChange={(e) => {
                                setEditSlug(e.target.value);
                                checkSlug(e.target.value, row.id);
                              }}
                            />
                            <div className="text-xs text-gray-500 mt-1">
                              {slugChecking ? 'Checking...' : slugAvailable === false ? 'Slug taken' : slugAvailable === true ? 'Slug available' : ''}
                            </div>
                          </div>
                        ) : (
                          <div className="text-gray-700">{row.slug}</div>
                        )}
                      </td>
                      <td className="py-2 pr-3">
                        {editing ? (
                          <input className="w-full border rounded p-2" value={editType} onChange={(e) => setEditType(e.target.value)} />
                        ) : (
                          <div className="text-gray-700">{row.type}</div>
                        )}
                      </td>
                      <td className="py-2 pr-3">
                        <span
                          className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                            row.status === 'published' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="py-2 pr-3 text-gray-700">{new Date(row.updated_at).toLocaleString()}</td>
                      <td className="py-2 pr-3 text-center">
                        {row.locked_status?.is_locked ? (
                            <div className="flex justify-center group relative cursor-help">
                            <Lock size={16} className="text-red-500" />
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 pointer-events-none">
                                Locked by {row.locked_status.locked_by} at {new Date(row.locked_status.locked_at!).toLocaleString()}
                            </span>
                            </div>
                        ) : (
                            <span className="text-gray-300">-</span>
                        )}
                      </td>
                      <td className="py-2 pr-3 text-gray-700">{row.sections_count ?? 0}</td>
                      <td className="py-2 pr-3">
                        <div className="flex flex-wrap gap-2">
                          {editing ? (
                            <>
                              <Button size="sm" onClick={saveEdit} disabled={loading}>
                                Save
                              </Button>
                              <Button size="sm" variant="secondary" outline onClick={cancelEdit} disabled={loading}>
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button size="sm" variant="secondary" outline onClick={() => startEdit(row)} disabled={loading || (row.locked_status?.is_locked ?? false)}>
                                Quick Edit
                              </Button>
                              <Button size="sm" variant="primary" onClick={() => navigate(`/web-admin/pages/editor?pageId=${row.id}`)} disabled={loading || (row.locked_status?.is_locked ?? false)}>
                                Edit Content
                              </Button>
                              <Button size="sm" variant="secondary" outline onClick={() => openPreview(row.slug)} disabled={loading}>
                                Preview
                              </Button>
                              <Button size="sm" onClick={() => onTogglePublish(row.id)} disabled={loading}>
                                {row.status === 'published' ? 'Unpublish' : 'Publish'}
                              </Button>
                              <Button size="sm" variant="secondary" outline onClick={() => onDuplicate(row.id)} disabled={loading}>
                                Duplicate
                              </Button>
                              <Button size="sm" variant="secondary" outline onClick={() => openTemplateModal(row.id)} disabled={loading}>
                                Template
                              </Button>
                              <Button size="sm" variant="warning" outline onClick={() => openRegenerate(row.id)} disabled={loading}>
                                Regenerate AI
                              </Button>
                              <button 
                                onClick={() => openDetails(row, 'history')}
                                className="p-1 text-gray-500 hover:text-blue-600 rounded hover:bg-gray-100"
                                title="Version History"
                              >
                                <History size={18} />
                              </button>
                              <button
                                onClick={() => handleToggleLock(row.id)}
                                className={`p-1 rounded hover:bg-gray-100 ${row.locked_status?.is_locked ? 'text-red-600' : 'text-gray-400 hover:text-gray-600'}`}
                                title={row.locked_status?.is_locked ? 'Unlock Page' : 'Lock Page'}
                                >
                                {row.locked_status?.is_locked ? <Unlock size={18} /> : <Lock size={18} />}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-10 text-center text-gray-500">
                      No pages found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            
            <div className="flex items-center justify-between border-t border-gray-200 pt-4 mt-4 px-2 pb-2">
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
                    className="border rounded p-1 text-sm"
                    >
                    <option value={10}>10 per page</option>
                    <option value={20}>20 per page</option>
                    <option value={50}>50 per page</option>
                    <option value={100}>100 per page</option>
                    </select>
                    <div className="flex gap-1">
                    <Button
                        size="sm"
                        variant="secondary"
                        outline
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1 || loading}
                    >
                        Previous
                    </Button>
                    <span className="flex items-center px-2 text-sm">
                        Page {page} of {totalPages}
                    </span>
                    <Button
                        size="sm"
                        variant="secondary"
                        outline
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages || loading}
                    >
                        Next
                    </Button>
                    </div>
                </div>
            </div>
          </div>
        </CardBody>
      </Card>

      <Modal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title="Page Details"
        size="lg"
      >
        <div className="flex border-b border-gray-200 mb-4">
            <button
                className={`px-4 py-2 text-sm font-medium ${activeTab === 'history' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => { setActiveTab('history'); if (currentDetailId) loadVersions(currentDetailId); }}
            >
                Version History
            </button>
            <button
                className={`px-4 py-2 text-sm font-medium ${activeTab === 'seo' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('seo')}
            >
                SEO & Conflicts
            </button>
        </div>

        {activeTab === 'history' && (
            <div className="space-y-4">
                {loadingVersions ? (
                    <div className="text-center py-8 text-gray-500">Loading versions...</div>
                ) : versions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No version history found.</div>
                ) : (
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                        {versions.map((version) => (
                            <div key={version.id} className="border border-gray-200 rounded-lg p-3 flex items-center justify-between hover:bg-gray-50">
                                <div>
                                    <div className="text-sm font-medium text-gray-900">Version {version.version_number}</div>
                                    <div className="text-xs text-gray-500">
                                        {new Date(version.created_at).toLocaleString()} • by {version.author_name || 'System'}
                                    </div>
                                </div>
                                <Button size="sm" variant="secondary" outline onClick={() => handleRestore(version.id)}>
                                    Restore
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}

        {activeTab === 'seo' && (
            <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Search Engine Visibility</h3>
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={noIndex} 
                                onChange={(e) => setNoIndex(e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">No Index (Exclude from Search Engines & Sitemap)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={noFollow} 
                                onChange={(e) => setNoFollow(e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">No Follow (Do not follow links on this page)</span>
                        </label>
                    </div>
                    <div className="mt-3">
                         <Button size="sm" onClick={saveSeoSettings} disabled={loading}>
                            Save SEO Settings
                         </Button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Primary Keyword</label>
                    <div className="flex gap-2">
                        <Input 
                            value={checkKeyword} 
                            onChange={(e) => setCheckKeyword(e.target.value)} 
                            placeholder="Enter keyword to check..."
                        />
                        <Button onClick={handleCheckConflicts} disabled={checkingConflicts || !checkKeyword}>
                            {checkingConflicts ? 'Checking...' : 'Check'}
                        </Button>
                    </div>
                </div>

                {conflictChecked && (
                    <div className="mt-4">
                        {conflicts.length > 0 ? (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-center gap-2 text-red-700 font-medium mb-2">
                                    <AlertTriangle size={20} />
                                    <span>Conflicts Detected ({conflicts.length})</span>
                                </div>
                                <ul className="space-y-2">
                                    {conflicts.map((conflict, idx) => (
                                        <li key={idx} className="text-sm text-red-600">
                                            Keyword "{conflict.keyword}" is already used in page: 
                                            <span className="font-medium ml-1">"{conflict.conflicting_page_title}"</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2 text-green-700">
                                <CheckCircle size={20} />
                                <span>No conflicts found. This keyword is safe to use.</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        )}

        <div className="flex justify-end pt-4 border-t border-gray-100 mt-4">
            <Button variant="secondary" onClick={() => setDetailsModalOpen(false)}>
                Close
            </Button>
        </div>
      </Modal>
      <TemplateLibraryModal
        isOpen={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        pageId={templatePageId!}
        onTemplateApplied={() => {
            setTemplateModalOpen(false);
            if (templatePageId) {
                navigate(`/web-admin/pages/editor?pageId=${templatePageId}`);
            } else {
                fetchRows();
            }
        }}
      />
    </div>
  );
};

export default PageManager;

