// import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

const activityData = [
    {
        id: 1,
        type: 'update',
        message: 'Updated "Fintech Solutions" page',
        user: 'Totan Admin',
        time: '2 mins ago',
        icon: FileText,
        color: 'bg-blue-100 text-blue-600'
    },
    {
        id: 2,
        type: 'generate',
        message: 'AI Generated 15 new blog posts',
        user: 'System',
        time: '1 hour ago',
        icon: RefreshCw,
        color: 'bg-purple-100 text-purple-600'
    },
    {
        id: 3,
        type: 'success',
        message: 'SEO Audit completed successfully',
        user: 'System',
        time: '3 hours ago',
        icon: CheckCircle,
        color: 'bg-green-100 text-green-600'
    },
    {
        id: 4,
        type: 'alert',
        message: 'API Rate limit warning (Open-Meteo)',
        user: 'Monitor',
        time: '5 hours ago',
        icon: AlertCircle,
        color: 'bg-orange-100 text-orange-600'
    },
    {
        id: 5,
        type: 'update',
        message: 'Updated "About Us" content blocks',
        user: 'Totan Admin',
        time: '1 day ago',
        icon: FileText,
        color: 'bg-blue-100 text-blue-600'
    }
];

const RecentActivity = () => {
    return (
        <div className="col-span-12 rounded-xl border border-slate-200 bg-white shadow-sm dark:border-strokedark dark:bg-boxdark xl:col-span-4">
            <div className="border-b border-slate-100 px-7.5 py-4 dark:border-strokedark">
                <h3 className="font-bold text-slate-800 dark:text-white">
                    Recent Activity
                </h3>
            </div>

            <div className="p-4 sm:p-7.5">
                <div className="flex flex-col gap-5">
                    {activityData.map((activity) => {
                        const Icon = activity.icon;
                        return (
                            <div key={activity.id} className="flex items-start gap-3">
                                <div className={`flex h-10 w-10 min-w-10 items-center justify-center rounded-full ${activity.color}`}>
                                    <Icon size={18} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-800 dark:text-white">
                                        {activity.message}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {activity.user} • {activity.time}
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