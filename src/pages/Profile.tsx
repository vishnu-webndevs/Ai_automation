import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
    const { user } = useAuth();

    return (
        <div className="space-y-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">My Profile</h2>
                <p className="text-slate-500">Manage your personal information.</p>
            </div>

            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white">User Details</h3>
                </CardHeader>
                <CardBody>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Name</label>
                            <p className="mt-1 text-slate-900">{user?.name || 'N/A'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Email</label>
                            <p className="mt-1 text-slate-900">{user?.email || 'N/A'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Role</label>
                            <p className="mt-1 text-slate-900">{user?.role || 'N/A'}</p>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};

export default Profile;
