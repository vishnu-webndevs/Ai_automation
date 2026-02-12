import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '../api';
import type { AuditLog } from '../types';

const AuditLogViewer = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedLogId, setExpandedLogId] = useState<number | null>(null);
    const [filterEntity, setFilterEntity] = useState('all');

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await api.get('/audit-logs');
            // Handle pagination response
            setLogs(response.data.data || (Array.isArray(response.data) ? response.data : []));
        } catch (error) {
            console.error('Failed to fetch audit logs', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const toggleExpand = (id: number) => {
        setExpandedLogId(expandedLogId === id ? null : id);
    };

    const filteredLogs = logs.filter(log => {
        const userName = log.user_name || 'Unknown';
        const matchesSearch = 
            userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.action?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesEntity = filterEntity === 'all' || log.entity_type === filterEntity;
        return matchesSearch && matchesEntity;
    });

    const uniqueEntities = Array.from(new Set(logs.map(log => log.entity_type)));

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Audit Logs</h1>
                    <p className="text-gray-500">Track system activity and changes</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row gap-4">
                    <div className="relative max-w-md flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input 
                            type="text"
                            placeholder="Search user or action..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                        value={filterEntity}
                        onChange={(e) => setFilterEntity(e.target.value)}
                    >
                        <option value="all">All Entities</option>
                        {uniqueEntities.map(entity => (
                            <option key={entity} value={entity}>{entity}</option>
                        ))}
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Action</th>
                                <th className="px-6 py-4">Entity</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading logs...</td>
                                </tr>
                            ) : filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No audit logs found.</td>
                                </tr>
                            ) : (
                                filteredLogs.map((log) => (
                                    <React.Fragment key={log.id}>
                                        <tr className="hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => toggleExpand(log.id)}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                                                        {(log.user_name || 'U').charAt(0)}
                                                    </div>
                                                    <span className="font-medium text-gray-900">{log.user_name || 'Unknown'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    log.action === 'create' ? 'bg-green-100 text-green-700' :
                                                    log.action === 'update' ? 'bg-blue-100 text-blue-700' :
                                                    log.action === 'delete' ? 'bg-red-100 text-red-700' :
                                                    'bg-gray-100 text-gray-700'
                                                }`}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">{log.entity_type}</td>
                                            <td className="px-6 py-4 text-gray-500 text-sm">
                                                {new Date(log.created_at).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                {expandedLogId === log.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                            </td>
                                        </tr>
                                        {expandedLogId === log.id && (
                                            <tr className="bg-gray-50">
                                                <td colSpan={5} className="px-6 py-4">
                                                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                                                        <h4 className="font-semibold text-gray-800 mb-2">Change Details</h4>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <h5 className="text-xs font-semibold text-gray-500 uppercase mb-1">Old Values</h5>
                                                                <pre className="bg-gray-900 text-gray-100 p-3 rounded-md overflow-x-auto text-sm">
                                                                    {JSON.stringify(log.old_values || {}, null, 2)}
                                                                </pre>
                                                            </div>
                                                            <div>
                                                                <h5 className="text-xs font-semibold text-gray-500 uppercase mb-1">New Values</h5>
                                                                <pre className="bg-gray-900 text-gray-100 p-3 rounded-md overflow-x-auto text-sm">
                                                                    {JSON.stringify(log.new_values || {}, null, 2)}
                                                                </pre>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AuditLogViewer;
