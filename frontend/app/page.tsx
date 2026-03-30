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

export default function HomePage() {
  return <ClientWrapper slug="home" />;
}

function ClientWrapper({ slug }: { slug: string }) {
  return <ClientRouter slug={slug} />;
}
