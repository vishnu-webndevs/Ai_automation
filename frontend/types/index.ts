export interface SeoMeta {
    id: number;
    meta_title: string;
    meta_description: string;
    canonical_url: string | null;
    og_title: string | null;
    og_description: string | null;
    og_image: string | null;
    twitter_card: string | null;
    noindex: boolean;
    nofollow: boolean;
    schema_markup: Record<string, any> | null;
}

export interface ContentBlock {
    id: number;
    block_type: string; // 'hero', 'text', 'features', 'cta', etc.
    type?: string; // Fallback for legacy/static data
    content: Record<string, any>;
    content_json?: Record<string, any>; // API response field
    sort_order: number;
}

export interface PageSection {
    id: number;
    name: string;
    type: string; // 'default', 'full-width', etc.
    content: Record<string, any>;
    sort_order: number;
    blocks: ContentBlock[];
}

export interface Service {
    id: number;
    name: string;
    slug: string;
    short_description: string;
    full_description: string;
    icon: string;
    is_active: boolean;
    sort_order: number;
    category?: ServiceCategory;
    features?: any[];
}

export interface ServiceCategory {
    id: number;
    name: string;
    slug: string;
    description: string;
}

export interface Industry {
    id: number;
    name: string;
    slug: string;
    description: string;
    icon: string;
    is_active: boolean;
}

export interface UseCase {
    id: number;
    name: string;
    slug: string;
    description: string;
    content: string;
    is_active: boolean;
}

export interface Solution {
    id: number;
    name: string;
    slug: string;
    description: string;
    icon: string;
    is_active: boolean;
}

export interface Integration {
    id: number;
    name: string;
    slug: string;
    description: string;
    icon: string;
    is_active: boolean;
}

export interface Page {
    id: number;
    title: string;
    slug: string;
    type?: string; // 'static', 'blog', etc.
    status: 'published' | 'draft' | 'archived';
    template: string;
    seo_meta: SeoMeta | null;
    sections: PageSection[];
    services?: Service[];
    industries?: Industry[];
    use_cases?: UseCase[];
    solutions?: Solution[];
    integrations?: Integration[];
    blog_categories?: any[];
    blog_tags?: any[];
    created_at: string;
    updated_at: string;
}

export interface BlogCategory {
    id: number;
    name: string;
    slug: string;
    description: string;
    pages_count?: number;
    pages?: Page[];
}

export interface MenuItem {
    id: number;
    label: string;
    url: string;
    target: '_blank' | '_self';
    order: number;
    children: MenuItem[];
}

export interface Menu {
    id: number;
    name: string;
    location: string; // 'navbar', 'footer', 'social'
    items: MenuItem[];
}

export interface ApiResponse<T> {
    data: T;
    message?: string;
}
