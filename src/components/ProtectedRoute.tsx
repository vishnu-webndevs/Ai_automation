import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

interface ProtectedRouteProps {
    permission?: string;
    redirectPath?: string;
    children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    permission,
    redirectPath = '/authentication',
    children,
}) => {
    const { user, loading, hasPermission } = useAuth();

    if (loading) {
        return <div className="p-6">Loading...</div>;
    }

    if (!user) {
        return <Navigate to={redirectPath} replace />;
    }

    if (permission && !hasPermission(permission)) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] text-center p-6">
                <div className="bg-red-100 p-4 rounded-full mb-4">
                    <AlertTriangle size={48} className="text-red-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
                <p className="text-gray-600 max-w-md">
                    You do not have permission to view this page. Please contact your administrator if you believe this is an error.
                </p>
            </div>
        );
    }

    return children ? <>{children}</> : <Outlet />;
};
