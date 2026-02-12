import { Card, CardHeader, CardBody } from '../components/ui/Card';

const Settings = () => {
    return (
        <div className="space-y-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Account Settings</h2>
                <p className="text-slate-500">Manage your application preferences.</p>
            </div>

            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white">General Settings</h3>
                </CardHeader>
                <CardBody>
                    <p className="text-slate-500">Settings configuration coming soon...</p>
                </CardBody>
            </Card>
        </div>
    );
};

export default Settings;
