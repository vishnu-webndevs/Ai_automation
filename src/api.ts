import axios from 'axios';

const TOKEN_KEY = 'totan_admin_token';

export const getAdminToken = () => localStorage.getItem(TOKEN_KEY);

export const setAdminToken = (token: string | null) => {
    if (!token) {
        localStorage.removeItem(TOKEN_KEY);
        return;
    }
    localStorage.setItem(TOKEN_KEY, token);
};

export const FRONTEND_URL = (import.meta as any).env?.VITE_FRONTEND_URL || 'https://totan.ai';

export const apiBaseUrl = (import.meta as any).env?.VITE_API_BASE_URL || 'https://api.totan.ai/api';

export const api = axios.create({
    baseURL: `${apiBaseUrl}/admin`,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = getAdminToken();
    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const loginAdmin = async (data: { email: string; password: string }) => {
    // Derive root URL from apiBaseUrl for CSRF cookie
    // Removes '/api' from the end to get the root domain (e.g. http://localhost:8000 or https://api.example.com)
    const rootUrl = apiBaseUrl.replace(/\/api\/?$/, '');
    await axios.get(`${rootUrl}/sanctum/csrf-cookie`, { withCredentials: true });
    
    const res = await api.post('/auth/login', data);
    const token = res.data?.token;
    if (token) {
        setAdminToken(token);
    }
    return res;
};

export const logoutAdmin = async () => {
    const res = await api.post('/auth/logout');
    setAdminToken(null);
    return res;
};

export const listPages = async (params?: {
    type?: string;
    status?: 'draft' | 'published';
    q?: string;
    sort?: string;
    dir?: 'asc' | 'desc';
    per_page?: number;
    page?: number;
}) => {
    return api.get('/pages', { params });
};

export const updatePage = async (id: number, data: any) => {
    return api.patch(`/pages/${id}`, data);
};

export const togglePublish = async (id: number) => {
    return api.post(`/pages/${id}/toggle-publish`);
};

export const bulkUpdatePageStatus = async (ids: number[], status: 'draft' | 'published') => {
    return api.post('/pages/bulk-status', { ids, status });
};

export const validatePageSlug = async (slug: string, page_id?: number) => {
    return api.post('/pages/validate-slug', { slug, page_id });
};

export const duplicatePage = async (id: number) => {
    return api.post(`/pages/${id}/duplicate`);
};

export const toggleLock = async (resource: string, id: number) => {
    return api.post(`/lock/${resource}/${id}`);
};

export const listMenus = async (params?: { location?: string }) => {
    return api.get('/menus', { params });
};

export const createMenu = async (data: { name: string; location: string; slug?: string; is_active?: boolean }) => {
    return api.post('/menus', data);
};

export const updateMenu = async (id: number, data: any) => {
    return api.patch(`/menus/${id}`, data);
};

export const deleteMenu = async (id: number) => {
    return api.delete(`/menus/${id}`);
};

export const listMenuItems = async (menuId: number) => {
    return api.get(`/menus/${menuId}/items`);
};

export const addMenuItem = async (menuId: number, data: any) => {
    return api.post(`/menus/${menuId}/items`, data);
};

export const updateMenuItem = async (id: number, data: any) => {
    return api.patch(`/menu-items/${id}`, data);
};

export const deleteMenuItem = async (id: number) => {
    return api.delete(`/menu-items/${id}`);
};

export const reorderMenuItems = async (
    menuId: number,
    items: Array<{ id: number; parent_id: number | null; order: number }>
) => {
    return api.post(`/menus/${menuId}/reorder`, { items });
};

export const listMedia = async (params?: { q?: string; per_page?: number; page?: number }) => {
    return api.get('/media', { params });
};

export const uploadMedia = async (formData: FormData) => {
    return api.post('/media', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const updateMediaAlt = async (id: number, alt_text: string) => {
    return api.patch(`/media/${id}`, { alt_text });
};

export const replaceMediaFile = async (id: number, formData: FormData) => {
    return api.post(`/media/${id}/replace`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const deleteMedia = async (id: number) => {
    return api.delete(`/media/${id}`);
};

export const scanMediaUsage = async () => {
    return api.post('/media/scan-usage');
};

export const generatePageContent = async (data: any) => {
    return api.post('/ai/generate-page', data);
};

export const createPage = async (data: any) => {
    return api.post('/pages', data);
};

export const getPage = async (id: number) => {
    return api.get(`/pages/${id}`);
};

export const getPageVersions = async (id: number) => {
    return api.get(`/pages/${id}/versions`);
};

export const restorePageVersion = async (id: number, version_id: number) => {
    return api.post(`/pages/${id}/restore`, { version_id });
};

export const checkKeywordConflicts = async (keyword: string, page_id?: number) => {
    return api.post('/pages/check-keyword-conflicts', { keyword, page_id });
};

export default api;
