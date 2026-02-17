import React from 'react';
import { Page } from '../types';

// Import Templates
import BlogModern from './blog-modern';
import BlogClassic from './blog-classic';
import LandingStartup from './landing-startup';
import BlankCanvas from './blank-canvas';
import TotanPreview from './totan-preview';
import ContactDark from './contact-dark';

type TemplateComponent = React.FC<{ page: Page }>;

const templates: Record<string, TemplateComponent> = {
    'blog-modern': BlogModern,
    'blog-classic': BlogClassic,
    'landing-startup': LandingStartup,
    'blank-canvas': BlankCanvas,
    'totan-preview': TotanPreview,
    'contact-dark': ContactDark,
};

export const getTemplateComponent = (slug?: string): TemplateComponent | null => {
    if (!slug) return null;
    return templates[slug] || null;
};

// Also export a component wrapper if needed
export const TemplateLoader: React.FC<{ page: Page; fallback?: React.ReactNode }> = ({ page, fallback }) => {
    const Component = getTemplateComponent(page.template_slug);
    
    if (Component) {
        return <Component page={page} />;
    }
    
    return <>{fallback}</>;
};
