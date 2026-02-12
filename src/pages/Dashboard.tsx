// import { useAuth } from '../contexts/AuthContext';
import DashboardStats from '../components/dashboard/DashboardStats';
import TrafficChart from '../components/dashboard/TrafficChart';
import RecentActivity from '../components/dashboard/RecentActivity';

const Dashboard = () => {
    // const { user } = useAuth();

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
                <DashboardStats />

                {/* Charts & Activity Row */}
                <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
                    <TrafficChart />
                    <RecentActivity />
                </div>
            </div>
        </>
    );
};

export default Dashboard;