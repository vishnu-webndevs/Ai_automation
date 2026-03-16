// import React from 'react';
import { FileText, Sparkles, Activity, Users, ArrowUp, ArrowDown } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string;
    change: string;
    isPositive: boolean;
    icon: any;
    color: string;
}

export type DashboardStatsPayload = {
    pages_total: number;
    pages_delta_percent: number;
    ai_total: number;
    ai_delta_percent: number;
    health_percent: number;
    health_delta_percent: number;
    users_total: number;
};

const StatCard = ({ title, value, change, isPositive, icon: Icon, color }: StatCardProps) => (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-strokedark dark:bg-boxdark">
        <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-slate-50 dark:bg-meta-4">
            <Icon className={`h-6 w-6 ${color}`} />
        </div>

        <div className="mt-4 flex items-end justify-between">
            <div>
                <h4 className="text-2xl font-bold text-slate-800 dark:text-white">
                    {value}
                </h4>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {title}
                </span>
            </div>

            <span className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {change}
                {isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            </span>
        </div>
    </div>
);

const formatCompact = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toLocaleString();
};

const formatDelta = (n: number) => {
    const abs = Math.abs(n);
    const value = abs % 1 === 0 ? abs.toFixed(0) : abs.toFixed(1);
    return `${value}%`;
};

const DashboardStats = ({ stats, loading }: { stats?: DashboardStatsPayload; loading?: boolean }) => {
    const pages = stats?.pages_total ?? 0;
    const ai = stats?.ai_total ?? 0;
    const health = stats?.health_percent ?? 100;
    const users = stats?.users_total ?? 0;

    const pagesDelta = stats?.pages_delta_percent ?? 0;
    const aiDelta = stats?.ai_delta_percent ?? 0;
    const healthDelta = stats?.health_delta_percent ?? 0;
    const usersDelta = 0;

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
            <StatCard 
                title="Total Pages" 
                value={loading ? '—' : pages.toLocaleString()} 
                change={loading ? '—' : formatDelta(pagesDelta)} 
                isPositive={pagesDelta >= 0} 
                icon={FileText} 
                color="text-indigo-600" 
            />
            <StatCard 
                title="AI Generated" 
                value={loading ? '—' : ai.toLocaleString()} 
                change={loading ? '—' : formatDelta(aiDelta)} 
                isPositive={aiDelta >= 0} 
                icon={Sparkles} 
                color="text-purple-600" 
            />
            <StatCard 
                title="System Health" 
                value={loading ? '—' : `${health.toFixed(1)}%`} 
                change={loading ? '—' : formatDelta(healthDelta)} 
                isPositive={healthDelta >= 0} 
                icon={Activity} 
                color="text-green-600" 
            />
            <StatCard 
                title="Active Users" 
                value={loading ? '—' : formatCompact(users)} 
                change={loading ? '—' : formatDelta(usersDelta)} 
                isPositive={usersDelta >= 0} 
                icon={Users} 
                color="text-blue-600" 
            />
        </div>
    );
};

export default DashboardStats;
