import { useState, useEffect } from 'react';
import { RefreshCw, Map, ExternalLink } from 'lucide-react';
import { api } from '../api';
import type { SitemapInfo } from '../types';

const SitemapManager = () => {
    const [sitemapInfo, setSitemapInfo] = useState<SitemapInfo | null>(null);
    const [, setLoading] = useState(true);
    const [rebuilding, setRebuilding] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await api.get('/sitemap');
            setSitemapInfo(response.data);
        } catch (error) {
            console.error('Failed to fetch sitemap info', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRebuild = async () => {
        setRebuilding(true);
        try {
            await api.get('/sitemap/rebuild');
            await fetchData();
            alert('Sitemap rebuilt successfully!');
        } catch (error) {
            console.error('Failed to rebuild sitemap', error);
        } finally {
            setRebuilding(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Sitemap Management</h1>
                    <p className="text-gray-500">Generate and view your XML sitemap</p>
                </div>
                <button 
                    onClick={handleRebuild}
                    disabled={rebuilding}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <RefreshCw size={20} className={rebuilding ? 'animate-spin' : ''} />
                    <span>{rebuilding ? 'Rebuilding...' : 'Rebuild Sitemap'}</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                        <Map size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Total Pages</p>
                        <p className="text-2xl font-bold text-gray-800">{sitemapInfo?.page_count || 0}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                        <RefreshCw size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Last Rebuilt</p>
                        <p className="text-lg font-bold text-gray-800">
                            {sitemapInfo?.last_rebuilt ? new Date(sitemapInfo.last_rebuilt).toLocaleString() : 'Never'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Sitemap URL</h3>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <code className="text-gray-600 flex-1 break-all">{sitemapInfo?.url || 'https://yourwebsite.com/sitemap.xml'}</code>
                    <a 
                        href={sitemapInfo?.url || '#'} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                        <ExternalLink size={20} />
                    </a>
                </div>
            </div>
        </div>
    );
};

export default SitemapManager;
