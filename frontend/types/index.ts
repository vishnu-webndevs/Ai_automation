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
    order: number;
}

export interface PageSection {
    id: number;
    name: string;
    type: string; // 'default', 'full-width', etc.
    content: Record<string, any>;
    order: number;
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
    icon?: string;
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

export interface BlogCategory {
    id: number;
    name: string;
    slug: string;
    description?: string;
    pages_count?: number;
}

export interface MenuItem {
    id: number;
    label: string;
    url: string;
    target?: string;
    show_on?: string;
    is_visible?: boolean;
    children?: MenuItem[];
}

export interface Menu {
    id?: number;
    name?: string;
    location: string;
    items: MenuItem[];
}

export interface Page {
    id: number;
    title: string;
    slug: string;
    type?: string; // 'static', 'blog', etc.
    status: 'published' | 'draft' | 'archived';
    template_slug?: string;
    seo_meta: SeoMeta | null;
    sections: PageSection[];
    services?: Service[];
    industries?: Industry[];
    use_cases?: UseCase[];
    blog_categories?: BlogCategory[];
    created_at?: string;
    updated_at?: string;
}
