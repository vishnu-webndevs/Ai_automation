import React from 'react';
import { RefreshCw, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import type { ApiMetrics } from '../../hooks/useVerticalApi';
import Button from '../ui/Button';
import { Card } from '../ui/Card';

interface VerticalPageLayoutProps {
    title: string;
    industry: string;
    apiSource: string;
    metrics: ApiMetrics | null;
    loading: boolean;
    onRefresh: () => void;
    children: React.ReactNode;
}

const VerticalPageLayout: React.FC<VerticalPageLayoutProps> = ({
    title,
    industry,
    apiSource,
    metrics,
    loading,
    onRefresh,
    children
}) => {
    // SLA thresholds
    const LATENCY_THRESHOLD = 800; // ms

    const getStatusColor = () => {
        if (!metrics) return 'text-gray-400';
        if (!metrics.isSuccess) return 'text-red-500';
        if (metrics.latency > LATENCY_THRESHOLD) return 'text-yellow-500';
        return 'text-green-500';
    };

    const getStatusText = () => {
        if (!metrics) return 'Initializing...';
        if (!metrics.isSuccess) return 'API Error';
        if (metrics.latency > LATENCY_THRESHOLD) return 'Degraded Performance';
        return 'Operational';
    };

    return (
        <div className="space-y-8 animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wide">
                            {industry}
                        </span>
                        <span>•</span>
                        <span>Source: {apiSource}</span>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <Card className="!p-2 !mb-0 flex items-center gap-3 bg-white shadow-sm border-gray-200">
                        <div className={`flex items-center gap-2 font-medium text-sm ${getStatusColor()}`}>
                            {metrics?.isSuccess ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                            {getStatusText()}
                        </div>
                        {metrics && (
                            <div className="flex items-center gap-1 text-xs text-gray-400 border-l pl-3">
                                <Clock size={14} />
                                {metrics.latency}ms
                            </div>
                        )}
                    </Card>
                    <Button 
                        variant="secondary"
                        outline 
                        size="sm" 
                        onClick={onRefresh}
                        disabled={loading}
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    </Button>
                </div>
            </div>

            {children}
        </div>
    );
};

export default VerticalPageLayout;
