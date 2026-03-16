// import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

export type DashboardActivityItem = {
    kind: 'audit' | 'ai';
    id: number;
    title: string;
    actor: string;
    status: string;
    created_at?: string | null;
};

const timeAgo = (iso?: string | null) => {
    if (!iso) return '';
    const ts = new Date(iso).getTime();
    if (!Number.isFinite(ts)) return '';
    const diff = Math.max(0, Date.now() - ts);
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'} ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hour${hrs === 1 ? '' : 's'} ago`;
    const days = Math.floor(hrs / 24);
    return `${days} day${days === 1 ? '' : 's'} ago`;
};

const activityPresentation = (item: DashboardActivityItem) => {
    const status = (item.status || '').toLowerCase();

    if (item.kind === 'ai') {
        if (status === 'success') return { icon: CheckCircle, color: 'bg-green-100 text-green-600' };
        if (status === 'invalid_json' || status === 'failed') return { icon: AlertCircle, color: 'bg-orange-100 text-orange-600' };
        return { icon: RefreshCw, color: 'bg-purple-100 text-purple-600' };
    }

    return { icon: FileText, color: 'bg-blue-100 text-blue-600' };
};

const RecentActivity = ({ items, loading }: { items?: DashboardActivityItem[]; loading?: boolean }) => {
    const activityData = items ?? [];

    return (
        <div className="col-span-12 rounded-xl border border-slate-200 bg-white shadow-sm dark:border-strokedark dark:bg-boxdark xl:col-span-4">
            <div className="border-b border-slate-100 px-7.5 py-4 dark:border-strokedark">
                <h3 className="font-bold text-slate-800 dark:text-white">
                    Recent Activity
                </h3>
            </div>

            <div className="p-4 sm:p-7.5">
                <div className="flex flex-col gap-5">
                    {loading ? (
                        <div className="text-sm text-slate-500">Loading activity...</div>
                    ) : activityData.length === 0 ? (
                        <div className="text-sm text-slate-500">No recent activity.</div>
                    ) : activityData.map((activity) => {
                        const { icon: Icon, color } = activityPresentation(activity);
                        return (
                            <div key={activity.id} className="flex items-start gap-3">
                                <div className={`flex h-10 w-10 min-w-10 items-center justify-center rounded-full ${color}`}>
                                    <Icon size={18} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-800 dark:text-white break-words">
                                        {activity.title}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {activity.actor}{activity.created_at ? ` • ${timeAgo(activity.created_at)}` : ''}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-6 text-center">
                    <Link
                        to="/web-admin/audit-logs"
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                    >
                        View All Activity
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default RecentActivity;
