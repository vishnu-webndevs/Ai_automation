import axios from 'axios';
import { Page, Menu, Service, Industry, UseCase, Solution, Integration, BlogCategory } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.totan.ai/api';

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
        const response = await api.get<Solution[]>('/solutions');
        return response.data;
    },
    getBySlug: async (slug: string): Promise<Solution> => {
        const response = await api.get<Solution>(`/solutions/${slug}`);
        return response.data;
    },
};

export const integrationService = {
    getAll: async (): Promise<Integration[]> => {
        const response = await api.get<Integration[]>('/integrations');
        return response.data;
    },
    getBySlug: async (slug: string): Promise<Integration> => {
        const response = await api.get<Integration>(`/integrations/${slug}`);
        return response.data;
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
