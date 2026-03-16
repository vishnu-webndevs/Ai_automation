// import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { getDashboardStats } from '../api';
import DashboardStats from '../components/dashboard/DashboardStats';
import TrafficChart from '../components/dashboard/TrafficChart';
import RecentActivity from '../components/dashboard/RecentActivity';
import type { DashboardStatsPayload } from '../components/dashboard/DashboardStats';
import type { DashboardChartPayload } from '../components/dashboard/TrafficChart';
import type { DashboardActivityItem } from '../components/dashboard/RecentActivity';

type DashboardApiResponse = {
    stats: DashboardStatsPayload;
    chart: DashboardChartPayload;
    recent_activity: DashboardActivityItem[];
};

const Dashboard = () => {
    // const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStatsPayload | undefined>(undefined);
    const [chart, setChart] = useState<DashboardChartPayload | undefined>(undefined);
    const [activity, setActivity] = useState<DashboardActivityItem[] | undefined>(undefined);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);

        getDashboardStats()
            .then((res) => {
                if (cancelled) return;
                const data = res.data as DashboardApiResponse;
                setStats(data.stats);
                setChart(data.chart);
                setActivity(data.recent_activity);
            })
            .catch(() => {
                if (cancelled) return;
                setStats(undefined);
                setChart(undefined);
                setActivity(undefined);
            })
            .finally(() => {
                if (cancelled) return;
                setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                    Dashboard
                </h2>
                <div className="text-sm text-slate-500">
                    Overview of your AI Content Engine
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:gap-6 2xl:gap-7.5">
                {/* Stats Row */}
                <DashboardStats stats={stats} loading={loading} />

                {/* Charts & Activity Row */}
                <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
                    <TrafficChart chart={chart} loading={loading} />
                    <RecentActivity items={activity} loading={loading} />
                </div>
            </div>
        </>
    );
};

export default Dashboard;
