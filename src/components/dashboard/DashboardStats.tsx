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

const DashboardStats = () => {
    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
            <StatCard 
                title="Total Pages" 
                value="2,453" 
                change="12%" 
                isPositive={true} 
                icon={FileText} 
                color="text-indigo-600" 
            />
            <StatCard 
                title="AI Generated" 
                value="856" 
                change="5.4%" 
                isPositive={true} 
                icon={Sparkles} 
                color="text-purple-600" 
            />
            <StatCard 
                title="System Health" 
                value="98.9%" 
                change="0.1%" 
                isPositive={false} 
                icon={Activity} 
                color="text-green-600" 
            />
            <StatCard 
                title="Active Users" 
                value="3.5K" 
                change="18%" 
                isPositive={true} 
                icon={Users} 
                color="text-blue-600" 
            />
        </div>
    );
};

export default DashboardStats;