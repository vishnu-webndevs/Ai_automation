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
  let canonical_url = '';
  let noindex = false;
  let nofollow = false;
  let twitter_card = 'summary_large_image';
  
  const first = slugArray[0];
  const second = slugArray.length > 1 ? slugArray[1] : null;
  const third = slugArray.length > 2 ? slugArray[2] : null;
  
  const slugPath = slugArray.join('/');
  const fullUrl = `https://totan.ai/${slugPath}`;

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
      const meta = data.seo_meta;
      meta_title = meta?.meta_title || meta?.og_title || data.title || data.name || '';
      meta_description = meta?.meta_description || meta?.og_description || '';
      og_image = meta?.og_image || '';
      canonical_url = meta?.canonical_url || '';
      noindex = meta?.noindex || false;
      nofollow = meta?.nofollow || false;
      twitter_card = meta?.twitter_card || 'summary_large_image';
    }

  } catch (error) {
    // API failed, provide graceful fallback
    meta_title = first.charAt(0).toUpperCase() + first.slice(1) + ' | Totan AI';
  }

  // Final fallback
  if (!meta_title) meta_title = first.charAt(0).toUpperCase() + first.slice(1) + ' | Totan AI';
  if (!meta_description) meta_description = 'Totan AI builds custom artificial intelligence, ML agents, and scalable automation pipelines to revolutionize your business operations.';

  return {
    title: meta_title,
    description: meta_description,
    alternates: {
      canonical: canonical_url || fullUrl,
    },
    openGraph: {
      title: meta_title,
      description: meta_description,
      url: fullUrl,
      siteName: 'Totan AI',
      images: og_image ? [{ url: og_image }] : [{ url: 'https://totan.ai/totan_logo.png' }],
      type: 'website',
    },
    twitter: {
      card: twitter_card as any,
      title: meta_title,
      description: meta_description,
      images: og_image ? [og_image] : ['https://totan.ai/totan_logo.png'],
    },
    robots: {
      index: !noindex,
      follow: !nofollow,
    }
  };
}

import { Suspense } from 'react';

export default async function DynamicRoute({ params }: { params: { slug: string[] } }) {
  const slugArray = params.slug || [];
  
  if (slugArray.length === 0) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading...</div>}>
        <ClientWrapper slug={slugArray} />
      </Suspense>
    );
  }

  const first = slugArray[0];
  const second = slugArray.length > 1 ? slugArray[1] : null;
  const third = slugArray.length > 2 ? slugArray[2] : null;

  let initialData: any = null;

  try {
    if (first === 'services') {
      if (second === 'category' && third) {
        initialData = await serviceCategoryService.getBySlug(third);
      } else if (second) {
        initialData = await serviceService.getBySlug(second);
      }
    } 
    else if (first === 'industries' && second) {
      initialData = await industryService.getBySlug(second);
    } 
    else if (first === 'use-cases' && second) {
      initialData = await useCaseService.getBySlug(second);
    } 
    else if (first === 'solutions' && second) {
      initialData = await solutionService.getBySlug(second);
    } 
    else if (first === 'integrations' && second) {
      initialData = await integrationService.getBySlug(second);
    }
    else if (first === 'blog') {
      if (second === 'category' && third) {
        initialData = await blogCategoryService.getBySlug(third);
      } else if (second && second !== 'categories') {
        initialData = await pageService.getBySlug(second);
      }
    }
    else {
      const catchAllSlug = slugArray.join('/');
      initialData = await pageService.getBySlug(catchAllSlug);
      if (!initialData) {
        initialData = STATIC_PAGES[catchAllSlug] || null;
      }
    }
  } catch (error) {
    console.error("Failed to fetch initial data for SSR:", error);
  }

  const schema = initialData?.seo_meta?.schema_markup || null;

  return (
    <>
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      )}
      <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading...</div>}>
        <ClientWrapper slug={slugArray} initialData={initialData} />
      </Suspense>
    </>
  );
}

// Separate client component to avoid passing non-serializable data from server component if needed
function ClientWrapper({ slug, initialData }: { slug: string[]; initialData?: any }) {
  return <ClientRouter slug={slug} initialData={initialData} />;
}
