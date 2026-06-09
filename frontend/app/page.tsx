import React from 'react';
import { pageService } from '@/services/api';
import { STATIC_PAGES } from '@/data/static-fallbacks';
import { Metadata } from 'next';
import ClientRouter from '@/components/ClientRouter';
import { Suspense } from 'react';

export async function generateMetadata(): Promise<Metadata> {
  let page: any = null;
  try {
    page = await pageService.getBySlug('home');
  } catch (e) {
    page = STATIC_PAGES['home'];
  }

  const defaultTitle = 'Totan AI | Custom AI Agents & Automation Solutions';
  const defaultDesc = 'Totan AI builds custom artificial intelligence, ML agents, and scalable automation pipelines to revolutionize your business operations.';

  if (!page) return { title: defaultTitle, description: defaultDesc };

  const meta = page.seo_meta;
  const title = meta?.meta_title || meta?.og_title || page.title || defaultTitle;
  const description = meta?.meta_description || meta?.og_description || defaultDesc;

  return {
    title,
    description,
    alternates: {
      canonical: meta?.canonical_url || 'https://totan.ai',
    },
    openGraph: {
      title: meta?.og_title || title,
      description: meta?.og_description || description,
      url: 'https://totan.ai',
      siteName: 'Totan AI',
      images: meta?.og_image ? [{ url: meta.og_image }] : [{ url: 'https://totan.ai/totan_logo.png' }],
      type: 'website',
    },
    twitter: {
      card: (meta?.twitter_card as any) || 'summary_large_image',
      title: meta?.meta_title || title,
      description: meta?.meta_description || description,
      images: meta?.og_image ? [meta.og_image] : ['https://totan.ai/totan_logo.png'],
    },
    robots: {
      index: meta ? !meta.noindex : true,
      follow: meta ? !meta.nofollow : true,
    }
  };
}

export default async function HomePage() {
  let initialData: any = null;
  try {
    initialData = await pageService.getBySlug('home');
  } catch (e) {
    initialData = STATIC_PAGES['home'] || null;
  }

  // Schema Markup (JSON-LD)
  let schema = initialData?.seo_meta?.schema_markup || null;
  if (!schema) {
    // Inject optimized WebSite & Organization structured data as search engine rank builders
    schema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          "@id": "https://totan.ai/#website",
          "url": "https://totan.ai",
          "name": "Totan AI",
          "description": "Custom AI Agents & Automation Solutions",
          "publisher": {
            "@id": "https://totan.ai/#organization"
          }
        },
        {
          "@type": "Organization",
          "@id": "https://totan.ai/#organization",
          "name": "Totan AI",
          "url": "https://totan.ai",
          "logo": {
            "@type": "ImageObject",
            "url": "https://totan.ai/totan_logo.png",
            "caption": "Totan AI Logo"
          },
          "sameAs": [
            "https://www.facebook.com/people/TotanAI/61588253724105/",
            "https://www.instagram.com/totan_ai/",
            "https://www.linkedin.com/company/totan-ai/"
          ],
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+1-762-760-3015",
            "contactType": "customer service",
            "email": "support@totan.ai"
          }
        }
      ]
    };
  }

  return (
    <>
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      )}
      <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading...</div>}>
        <ClientWrapper slug="home" initialData={initialData} />
      </Suspense>
    </>
  );
}

function ClientWrapper({ slug, initialData }: { slug: string; initialData?: any }) {
  return <ClientRouter slug={slug} initialData={initialData} />;
}
