import React from 'react';
import { Metadata } from 'next';
import { 
  pageService, 
  serviceService, 
  serviceCategoryService,
  industryService,
  useCaseService,
  solutionService,
  integrationService,
  blogCategoryService
} from '@/services/api';
import { STATIC_PAGES } from '@/data/static-fallbacks';
import ClientRouter from '@/components/ClientRouter';

// Need to export this to tell Next.js it can dynamically render params
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string[] } }): Promise<Metadata> {
  const slugArray = params.slug || [];
  
  if (slugArray.length === 0) return { title: 'Totan.ai' };

  let meta_title = '';
  let meta_description = '';
  let og_image = '';
  
  const first = slugArray[0];
  const second = slugArray.length > 1 ? slugArray[1] : null;
  const third = slugArray.length > 2 ? slugArray[2] : null;

  try {
    let data: any = null;

    if (first === 'services') {
      if (!second) meta_title = 'Our Services | Totan AI';
      else if (second === 'category' && third) data = await serviceCategoryService.getBySlug(third);
      else data = await serviceService.getBySlug(second);
    } 
    else if (first === 'industries') {
      if (second) data = await industryService.getBySlug(second);
    } 
    else if (first === 'use-cases') {
      if (second) data = await useCaseService.getBySlug(second);
    } 
    else if (first === 'solutions') {
      if (second) data = await solutionService.getBySlug(second);
    } 
    else if (first === 'integrations') {
      if (second) data = await integrationService.getBySlug(second);
    }
    // For blogs it hits /blogs endpoint which is paginated, or /pages/{slug} ? 
    // In Original App, BlogDetail is just a mapped dynamic page mostly, or has its own API?
    // Let's fallback to pageService if it's not a known prefix
    else {
      // It's a dynamic page!
      const catchAllSlug = slugArray.join('/');
      data = await pageService.getBySlug(catchAllSlug);
      
      if (!data) {
         // Fallback to static
         data = STATIC_PAGES[catchAllSlug];
      }
    }

    if (data) {
      // The API often returns { seo_meta: {...}, title: '...' }
      meta_title = data.seo_meta?.meta_title || data.seo_meta?.og_title || data.title || data.name || 'Totan.ai';
      meta_description = data.seo_meta?.meta_description || data.seo_meta?.og_description || '';
      og_image = data.seo_meta?.og_image || '';
    }

  } catch (error) {
    // API failed, provide graceful fallback
    meta_title = first.charAt(0).toUpperCase() + first.slice(1) + ' | Totan AI';
  }

  // Final fallback
  if (!meta_title) meta_title = 'Totan API Security Framework';

  return {
    title: meta_title,
    description: meta_description,
    openGraph: {
      images: og_image ? [og_image] : [],
    }
  };
}

export default function DynamicRoute({ params }: { params: { slug: string[] } }) {
  return <ClientWrapper slug={params.slug} />;
}

// Separate client component to avoid passing non-serializable data from server component if needed
function ClientWrapper({ slug }: { slug: string[] }) {
  return <ClientRouter slug={slug} />;
}
