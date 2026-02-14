import { useEffect, useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { listMedia, uploadMedia } from '../../api';
import type { MediaRow } from '../../types';

interface MediaLibrarySelectorProps {
    onSelect: (media: MediaRow) => void;
    onCancel?: () => void;
}

const formatBytes = (bytes: number) => {
    if (!bytes || bytes < 1024) return `${bytes || 0} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
};

const MediaLibrarySelector = ({ onSelect, onCancel }: MediaLibrarySelectorProps) => {
    const [q, setQ] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [rows, setRows] = useState<MediaRow[]>([]);
    const [selected, setSelected] = useState<MediaRow | null>(null);

    // Upload state
    const [file, setFile] = useState<File | null>(null);
    const [alt, setAlt] = useState('');
    const [uploading, setUploading] = useState(false);
    const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library');

    const [page, setPage] = useState(1);
    const perPage = 20;

    const fetchRows = async (nextPage = page, nextQ = q) => {
        setLoading(true);
        setError(null);
        try {
            const res = await listMedia({ q: nextQ || undefined, per_page: perPage, page: nextPage });
            setRows(res.data?.data || []);
            setPage(res.data?.current_page || nextPage);
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
        setUploading(true);
        setError(null);
        try {
            const form = new FormData();
            form.append('file', file);
            form.append('alt_text', alt.trim());
            const res = await uploadMedia(form);
            const newMedia = res.data?.data || res.data;
            
            setFile(null);
            setAlt('');
            setActiveTab('library');
            await fetchRows(1, q);
            
            // Auto-select the newly uploaded image if it exists in the response
            if (newMedia && newMedia.id) {
                setSelected(newMedia);
            }
        } catch (e: any) {
            setError(e?.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-lg overflow-hidden">
            <div className="flex items-center border-b px-4">
                <button
                    className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'library' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setActiveTab('library')}
                >
                    Library
                </button>
                <button
                    className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'upload' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setActiveTab('upload')}
                >
                    Upload New
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 min-h-[400px]">
                {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">{error}</div>}

                {activeTab === 'library' ? (
                    <>
                        <div className="mb-4">
                            <Input
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Search media..."
                                className="w-full"
                            />
                        </div>

                        {loading && rows.length === 0 ? (
                            <div className="text-center py-10 text-gray-500">Loading media...</div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {rows.map((r) => (
                                    <div
                                        key={r.id}
                                        onClick={() => setSelected(r)}
                                        className={`cursor-pointer group relative border rounded-lg overflow-hidden transition-all ${
                                            selected?.id === r.id ? 'ring-2 ring-purple-500 border-purple-500' : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="aspect-square bg-gray-50 relative">
                                            <img
                                                src={r.url}
                                                alt={r.alt_text}
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                            />
                                            {selected?.id === r.id && (
                                                <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center">
                                                    <div className="bg-purple-600 text-white rounded-full p-1">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-2 bg-white">
                                            <div className="text-xs font-medium text-gray-900 truncate" title={r.file_name}>{r.file_name}</div>
                                            <div className="text-[10px] text-gray-500 mt-0.5">
                                                {formatBytes(r.size_bytes)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {rows.length === 0 && !loading && (
                                    <div className="col-span-full text-center py-10 text-gray-500">No media found.</div>
                                )}
                            </div>
                        )}

                        <div className="flex items-center justify-between mt-6 pt-4 border-t">
                            <Button
                                variant="secondary"
                                outline
                                size="sm"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={loading || page <= 1}
                            >
                                Previous
                            </Button>
                            <span className="text-xs text-gray-500">Page {page}</span>
                            <Button
                                variant="secondary"
                                outline
                                size="sm"
                                onClick={() => setPage((p) => p + 1)}
                                disabled={loading || rows.length < perPage}
                            >
                                Next
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="max-w-md mx-auto py-6 space-y-4">
                        <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                            <input
                                type="file"
                                id="file-upload"
                                accept="image/jpeg,image/png,image/gif,image/webp"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                className="hidden"
                            />
                            <label
                                htmlFor="file-upload"
                                className="cursor-pointer flex flex-col items-center justify-center"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <span className="text-sm font-medium text-purple-600 hover:text-purple-500">
                                    Click to upload a file
                                </span>
                                <span className="text-xs text-gray-500 mt-1">
                                    PNG, JPG, WEBP, GIF up to 10MB
                                </span>
                            </label>
                            {file && (
                                <div className="mt-4 flex items-center gap-2 text-sm bg-white px-3 py-2 rounded border shadow-sm">
                                    <span className="font-medium text-gray-700 truncate max-w-[200px]">{file.name}</span>
                                    <button onClick={() => setFile(null)} className="text-red-500 hover:text-red-700">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Alt Text (Required)</label>
                            <Input
                                value={alt}
                                onChange={(e) => setAlt(e.target.value)}
                                placeholder="Describe the image..."
                            />
                        </div>
                        <div className="pt-2 flex gap-2">
                            {onCancel && (
                                <Button 
                                    variant="secondary" 
                                    outline 
                                    onClick={onCancel}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                            )}
                            <Button
                                onClick={handleUpload}
                                disabled={uploading || !file}
                                className={onCancel ? 'flex-1' : 'w-full justify-center'}
                            >
                                {uploading ? 'Uploading...' : 'Upload Image'}
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {activeTab === 'library' && (
            <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
                <div className="text-sm text-gray-500">
                    {selected ? (
                        <span>Selected: <span className="font-medium text-gray-900">{selected.file_name}</span></span>
                    ) : (
                        <span>No image selected</span>
                    )}
                </div>
                <div className="flex gap-2">
                    {onCancel && (
                        <Button variant="secondary" outline onClick={onCancel}>
                            Cancel
                        </Button>
                    )}
                    <Button
                        onClick={() => selected && onSelect(selected)}
                        disabled={!selected}
                    >
                        Use Selected Image
                    </Button>
                </div>
            </div>
            )}
        </div>
    );
};

export default MediaLibrarySelector;
