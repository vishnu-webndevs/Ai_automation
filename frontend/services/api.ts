import axios from 'axios';
import { Page, Menu, Service, Industry, UseCase, Solution, Integration, BlogCategory, ServiceCategory } from '../types';
import { FALLBACK_SOLUTIONS, FALLBACK_INTEGRATIONS } from '../data/platform-fallbacks';

const API_URL =
    (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) ||
    (typeof window !== 'undefined' && window.location.hostname === 'localhost'
        ? 'http://127.0.0.1:8000/api'
        : (typeof process !== 'undefined' && process.env.NODE_ENV === 'development'
            ? 'http://127.0.0.1:8000/api'
            : 'https://api.totan.ai/api'));

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

export const fetcher = (url: string) => api.get(url).then((res) => res.data);

export const pageService = {
    getBySlug: async (slug: string): Promise<Page> => {
        // Handle home page slug
        const targetSlug = slug === '/' ? 'home' : slug;
        const response = await api.get<Page>(`/pages/${targetSlug}`);
        return response.data;
    },
    getBlogs: async (page = 1): Promise<{ data: Page[], current_page: number, last_page: number }> => {
        const response = await api.get(`/blogs?page=${page}`);
        return response.data;
    },
};

export const serviceService = {
    getAll: async (): Promise<Service[]> => {
        const response = await api.get<Service[]>('/services');
        return response.data;
    },
    getBySlug: async (slug: string): Promise<Service> => {
        const response = await api.get<Service>(`/services/${slug}`);
        return response.data;
    },
};

export const serviceCategoryService = {
    getAll: async (): Promise<ServiceCategory[]> => {
        const response = await api.get<ServiceCategory[]>('/service-categories');
        return response.data;
    },
    getBySlug: async (slug: string): Promise<ServiceCategory> => {
        const response = await api.get<ServiceCategory>(`/service-categories/${slug}`);
        return response.data;
    },
};

export const industryService = {
    getAll: async (): Promise<Industry[]> => {
        const response = await api.get<Industry[]>('/industries');
        return response.data;
    },
    getBySlug: async (slug: string): Promise<Industry> => {
        const response = await api.get<Industry>(`/industries/${slug}`);
        return response.data;
    },
};

export const useCaseService = {
    getAll: async (): Promise<UseCase[]> => {
        const response = await api.get<UseCase[]>('/use-cases');
        return response.data;
    },
    getBySlug: async (slug: string): Promise<UseCase> => {
        const response = await api.get<UseCase>(`/use-cases/${slug}`);
        return response.data;
    },
};

export const solutionService = {
    getAll: async (): Promise<Solution[]> => {
        try {
            const response = await api.get<Solution[]>('/solutions');
            const data = response.data;
            return data && data.length > 0 ? data : (FALLBACK_SOLUTIONS as unknown as Solution[]);
        } catch (error) {
            return FALLBACK_SOLUTIONS as unknown as Solution[];
        }
    },
    getBySlug: async (slug: string): Promise<Solution> => {
        try {
            const response = await api.get<Solution>(`/solutions/${slug}`);
            return response.data;
        } catch (error) {
            const fallback = FALLBACK_SOLUTIONS.find(s => s.slug === slug);
            if (fallback) {
                return fallback as unknown as Solution;
            }
            throw error;
        }
    },
};

export const integrationService = {
    getAll: async (): Promise<Integration[]> => {
        try {
            const response = await api.get<Integration[]>('/integrations');
            const data = response.data;
            return data && data.length > 0 ? data : (FALLBACK_INTEGRATIONS as unknown as Integration[]);
        } catch (error) {
            return FALLBACK_INTEGRATIONS as unknown as Integration[];
        }
    },
    getBySlug: async (slug: string): Promise<Integration> => {
        try {
            const response = await api.get<Integration>(`/integrations/${slug}`);
            return response.data;
        } catch (error) {
            const fallback = FALLBACK_INTEGRATIONS.find(i => i.slug === slug);
            if (fallback) {
                return fallback as unknown as Integration;
            }
            throw error;
        }
    },
};

export const blogCategoryService = {
    getAll: async (): Promise<BlogCategory[]> => {
        const response = await api.get<BlogCategory[]>('/blog-categories');
        return response.data;
    },
    getBySlug: async (slug: string): Promise<BlogCategory> => {
        const response = await api.get<BlogCategory>(`/blog-categories/${slug}`);
        return response.data;
    },
};

export const blogTagService = {
    getAll: async (): Promise<any[]> => {
        const response = await api.get<any[]>('/blog-tags');
        return response.data;
    },
    getBySlug: async (slug: string): Promise<any> => {
        const response = await api.get<any>(`/blog-tags/${slug}`);
        return response.data;
    },
};

export const menuService = {
    getByLocation: async (location: string): Promise<Menu> => {
        const response = await api.get<Menu>(`/menus/${location}`);
        return response.data;
    },
};

export const authService = {
    register: async (data: any) => {
        const response = await api.post('/auth/register', data);
        return response.data;
    },
    login: async (data: any) => {
        const response = await api.post('/auth/login', data);
        return response.data;
    },
    logout: async () => {
        const response = await api.post('/auth/logout');
        return response.data;
    }
};
