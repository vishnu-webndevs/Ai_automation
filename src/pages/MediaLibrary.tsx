import { useEffect, useMemo, useState } from 'react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { deleteMedia, listMedia, replaceMediaFile, scanMediaUsage, updateMediaAlt, uploadMedia } from '../api';

type MediaRow = {
  id: number;
  url: string;
  webp_url?: string | null;
  path: string;
  webp_path?: string | null;
  file_name: string;
  original_name?: string | null;
  mime_type?: string | null;
  size_bytes: number;
  width?: number | null;
  height?: number | null;
  alt_text: string;
  usages_count?: number;
  created_at: string;
};

const formatBytes = (bytes: number) => {
  if (!bytes || bytes < 1024) return `${bytes || 0} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
};

const MediaLibrary = () => {
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<MediaRow[]>([]);
  const [selected, setSelected] = useState<MediaRow | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [alt, setAlt] = useState('');

  const [editAlt, setEditAlt] = useState('');
  const [replaceFile, setReplaceFile] = useState<File | null>(null);

  const [page, setPage] = useState(1);
  const perPage = 30;

  const publicBaseUrl = useMemo(() => {
    const apiBaseUrl = (import.meta as any).env?.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';
    return apiBaseUrl.replace(/\/api$/, '');
  }, []);

  const fetchRows = async (nextPage = page, nextQ = q) => {
    setLoading(true);
    setError(null);
    try {
      const res = await listMedia({ q: nextQ || undefined, per_page: perPage, page: nextPage });
      setRows(res.data?.data || []);
      setPage(res.data?.current_page || nextPage);
      if (selected) {
        const updated = (res.data?.data || []).find((r: MediaRow) => r.id === selected.id);
        if (updated) setSelected(updated);
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load media');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = window.setTimeout(() => {
      fetchRows(1, q);
    }, 350);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  useEffect(() => {
    fetchRows(page, q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleUpload = async () => {
    if (!file) {
      setError('Select a file to upload');
      return;
    }
    if (!alt.trim()) {
      setError('Alt text is required');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('alt_text', alt.trim());
      await uploadMedia(form);
      setFile(null);
      setAlt('');
      await fetchRows(1, q);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAlt = async () => {
    if (!selected) return;
    if (!editAlt.trim()) {
      setError('Alt text is required');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await updateMediaAlt(selected.id, editAlt.trim());
      await fetchRows(page, q);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to update alt text');
    } finally {
      setLoading(false);
    }
  };

  const handleReplace = async () => {
    if (!selected) return;
    if (!replaceFile) {
      setError('Select a replacement file');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append('file', replaceFile);
      if (editAlt.trim()) {
        form.append('alt_text', editAlt.trim());
      }
      await replaceMediaFile(selected.id, form);
      setReplaceFile(null);
      await fetchRows(page, q);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Replace failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setLoading(true);
    setError(null);
    try {
      await deleteMedia(selected.id);
      setSelected(null);
      await fetchRows(1, q);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Delete failed');
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async () => {
    setLoading(true);
    setError(null);
    try {
      await scanMediaUsage();
      await fetchRows(page, q);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Usage scan failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold">Media Library</h1>
        <div className="flex items-center gap-2">
          <Button variant="secondary" outline onClick={handleScan} disabled={loading}>
            Scan Usage
          </Button>
          <a className="text-sm text-gray-600 underline" href={`${publicBaseUrl}/storage`} target="_blank" rel="noreferrer">
            Storage
          </a>
        </div>
      </div>

      {error && <div className="mb-4 text-sm text-red-600">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-bold text-gray-800">Search</h2>
            </CardHeader>
            <CardBody>
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by alt text or filename..." />
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-bold text-gray-800">Upload</h2>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">File</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="w-full"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Alt Text (required)</label>
                  <Input value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Describe the image for accessibility & SEO" />
                </div>
                <div className="md:col-span-3">
                  <Button onClick={handleUpload} disabled={loading}>
                    {loading ? 'Working...' : 'Upload'}
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-gray-800">Assets</h2>
                <div className="text-sm text-gray-500">{rows.length} items</div>
              </div>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {rows.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      setSelected(r);
                      setEditAlt(r.alt_text);
                      setReplaceFile(null);
                    }}
                    className={`text-left border rounded-lg overflow-hidden hover:shadow-sm transition ${
                      selected?.id === r.id ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-200'
                    }`}
                  >
                    <div className="bg-gray-50">
                      <img src={r.url} alt={r.alt_text} className="w-full h-28 object-cover" loading="lazy" />
                    </div>
                    <div className="p-2">
                      <div className="text-xs font-medium text-gray-900 truncate">{r.file_name}</div>
                      <div className="text-xs text-gray-500 truncate">{r.alt_text}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatBytes(r.size_bytes)} {r.width && r.height ? `• ${r.width}×${r.height}` : ''} {typeof r.usages_count === 'number' ? `• used ${r.usages_count}` : ''}
                      </div>
                    </div>
                  </button>
                ))}
                {rows.length === 0 && <div className="text-sm text-gray-500">No media found.</div>}
              </div>

              <div className="flex items-center justify-between mt-6">
                <Button
                  variant="secondary"
                  outline
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={loading || page <= 1}
                >
                  Prev
                </Button>
                <div className="text-sm text-gray-600">Page {page}</div>
                <Button variant="secondary" outline onClick={() => setPage((p) => p + 1)} disabled={loading || rows.length < perPage}>
                  Next
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-bold text-gray-800">Details</h2>
            </CardHeader>
            <CardBody>
              {!selected ? (
                <div className="text-sm text-gray-500">Select an image to view details.</div>
              ) : (
                <div className="space-y-4">
                  <img src={selected.url} alt={selected.alt_text} className="w-full rounded-lg border" />
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">#{selected.id}</div>
                    <div className="text-gray-600">{selected.original_name}</div>
                    <div className="text-gray-600">{selected.mime_type}</div>
                    <div className="text-gray-600">{formatBytes(selected.size_bytes)}</div>
                    {selected.width && selected.height && <div className="text-gray-600">{selected.width}×{selected.height}</div>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Alt Text</label>
                    <Input value={editAlt} onChange={(e) => setEditAlt(e.target.value)} />
                    <Button className="mt-2" onClick={handleSaveAlt} disabled={loading}>
                      Save Alt Text
                    </Button>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Replace Image (global)</label>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      onChange={(e) => setReplaceFile(e.target.files?.[0] || null)}
                      className="w-full"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Replacement keeps the same media ID; any references by media_id remain valid.
                    </div>
                    <Button className="mt-2" variant="warning" outline onClick={handleReplace} disabled={loading}>
                      Replace
                    </Button>
                  </div>
                  <div className="pt-2 border-t">
                    <Button variant="danger" outline onClick={handleDelete} disabled={loading}>
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MediaLibrary;

