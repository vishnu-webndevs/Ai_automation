import React from 'react';
import DynamicPage from '@/pages/DynamicPage';
import { pageService } from '@/services/api';
import { STATIC_PAGES } from '@/data/static-fallbacks';
import { Metadata } from 'next';
import ClientRouter from '@/components/ClientRouter';

export async function generateMetadata(): Promise<Metadata> {
  let page: any = null;
  try {
    page = await pageService.getBySlug('home');
  } catch (e) {
    page = STATIC_PAGES['home'];
  }

  if (!page) return { title: 'Totan.ai' };

  return {
    title: page.seo_meta?.meta_title || page.seo_meta?.og_title || page.title || 'Totan.ai',
    description: page.seo_meta?.meta_description || page.seo_meta?.og_description,
    openGraph: {
      images: page.seo_meta?.og_image ? [page.seo_meta.og_image] : [],
    }
  };
}

import { Suspense } from 'react';

export default async function HomePage() {
  let initialData: any = null;
  try {
    initialData = await pageService.getBySlug('home');
  } catch (e) {
    initialData = STATIC_PAGES['home'] || null;
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading...</div>}>
      <ClientWrapper slug="home" initialData={initialData} />
    </Suspense>
  );
}

function ClientWrapper({ slug, initialData }: { slug: string; initialData?: any }) {
  return <ClientRouter slug={slug} initialData={initialData} />;
}
