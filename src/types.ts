export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    permissions?: string[];
}

export interface ServiceFeature {
    id?: number;
    title: string;
    description?: string;
    icon?: string;
    sort_order?: number;
}

export interface Service {
    id: number;
    name: string;
    slug: string;
    template_slug?: string;
    service_category_id?: number;
    short_description?: string;
    full_description?: string;
    icon?: string;
    description?: string;
    is_active: boolean;
    features?: ServiceFeature[];
}

export interface Industry {
    id: number;
    name: string;
    slug: string;
    template_slug?: string;
    description?: string;
    is_active: boolean;
}

export interface UseCase {
    id: number;
    name: string;
    slug: string;
    template_slug?: string;
    description?: string;
    is_active: boolean;
}

export interface Blog {
    id: number;
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    category_id?: number;
    blog_categories?: BlogCategory[];
    tags?: BlogTag[];
    status: 'draft' | 'published' | 'scheduled' | 'archived';
    published_at?: string;
    featured_image?: string;
    is_featured: boolean;
    author_id: number;
    seo_title?: string;
    seo_description?: string;
}

export interface BlogCategory {
    id: number;
    name: string;
    slug: string;
    description?: string;
}

export interface BlogTag {
    id: number;
    name: string;
    slug: string;
}

export interface InternalLink {
    id: number;
    source_page_id: number;
    target_page_id: number;
    anchor_text: string;
    is_manual: boolean;
    created_at: string;
}

export interface Redirect {
    id: number;
    source_url: string;
    target_url: string;
    type: 301 | 302;
    is_active: boolean;
}

export interface SchemaTemplate {
    id: number;
    name?: string; // Optional, might not exist on backend
    type: string;
    schema_json: any; // The actual data from backend
    template?: string; // For frontend editing
    is_active?: boolean;
    page_id?: number;
    page?: { id: number; title: string; slug: string };
}

export interface SitemapInfo {
    last_rebuilt: string;
    page_count: number;
    url: string;
}

export interface AuditLog {
    id: number;
    user_id: number;
    user_name: string;
    action: string;
    entity_type: string;
    entity_id: string;
    old_values?: any;
    new_values?: any;
    created_at: string;
    ip_address: string;
}

export interface Cta {
    id: number;
    name: string;
    content: string; // HTML or Text
    type: 'popup' | 'inline' | 'banner';
    is_active: boolean;
    page_ids?: number[];
}

export interface PageVersion {
    id: number;
    page_id: number;
    version_number: number;
    content: any; // JSON of page content
    created_at: string;
    created_by: number;
    author_name?: string;
}

export interface KeywordConflict {
    keyword: string;
    conflicting_page_id: number;
    conflicting_page_title: string;
}

export interface MediaRow {
    id: number;
    url: string;
    webp_url?: string | null;
    path: string;
    webp_path?: string | null;
    file_name: string;
    original_name?: string | null;
    mime_type?: string | null;
    size_bytes: number;
    width?: number | null;
    height?: number | null;
    alt_text: string;
    usages_count?: number;
    created_at: string;
}
