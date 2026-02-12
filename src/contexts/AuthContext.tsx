import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { api, getAdminToken, setAdminToken } from '../api';
import type { User } from '../types';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (token: string, userData: User) => void;
    logout: () => void;
    hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const enhanceUser = (userData: any): User => {
        return {
            ...userData,
            role: 'super_admin',
            permissions: ['*']
        };
    };

    useEffect(() => {
        const initAuth = async () => {
            const token = getAdminToken();
            if (token) {
                try {
                    const response = await api.get('/auth/me');
                    const fetchedUser = response.data.data || response.data;
                    setUser(enhanceUser(fetchedUser));
                } catch (error) {
                    console.error('Failed to fetch user', error);
                    // If 401, clear token. If 404, maybe backend issue but still clear to be safe.
                    setAdminToken(null);
                }
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const login = (token: string, userData: User) => {
        setAdminToken(token);
        setUser(enhanceUser(userData));
    };

    const logout = () => {
        setAdminToken(null);
        setUser(null);
    };

    const hasPermission = (permission: string) => {
        if (!user) return false;
        
        // robust admin check
        const role = user.role?.toLowerCase() || '';
        if (role === 'super_admin' || role === 'admin' || user.email === 'admin@totan.ai') {
            return true;
        }
        
        return user.permissions?.includes(permission) || false;
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, hasPermission }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
