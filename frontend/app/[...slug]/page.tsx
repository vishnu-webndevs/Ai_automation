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
  blogCategoryService,
  blogTagService
} from '@/services/api';
import { STATIC_PAGES } from '@/data/static-fallbacks';
import ClientRouter from '@/components/ClientRouter';
import { prefetchBlockData } from '@/lib/prefetch';

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
  
  const slugPath = slugArray.join('/').toLowerCase();
  const fullUrl = `https://totan.ai/${slugPath}`;

  try {
    let data: any = null;

    if (first === 'services') {
      if (!second) {
        data = await pageService.getBySlug('services').catch(() => null);
        if (!data) {
          meta_title = 'Our Services | Custom AI Agents & Automation | Totan AI';
          meta_description = 'Explore Totan AI custom services built around your workflows: support, sales, and operations automated seamlessly.';
        }
      }
      else if (second === 'category' && third) {
        data = await serviceCategoryService.getBySlug(third).catch(() => null);
        if (data) {
          meta_title = `${data.name} AI Services | Totan AI`;
          meta_description = data.description || `Browse custom AI automation services in the ${data.name} category.`;
        }
      }
      else {
        data = await serviceService.getBySlug(second).catch(() => null);
        if (data) {
          meta_title = `${data.name} | AI Service | Totan AI`;
          meta_description = data.short_description || data.full_description || `Learn about our custom ${data.name} service built to optimize your business operations.`;
        }
      }
    } 
    else if (first === 'industries') {
      if (second) {
        data = await industryService.getBySlug(second).catch(() => null);
        if (data) {
          meta_title = `${data.name} AI Solutions | Totan AI`;
          meta_description = data.description || `Automate workflows and scale operations in the ${data.name} industry with custom AI agents.`;
        }
      }
      else {
        data = await pageService.getBySlug('industries').catch(() => null);
        if (!data) {
          meta_title = 'Industries We Serve | Totan AI';
          meta_description = 'We design bespoke AI agents and automation pipelines for Healthcare, Finance, Logistics, Real Estate, and more.';
        }
      }
    } 
    else if (first === 'use-cases') {
      if (second) {
        data = await useCaseService.getBySlug(second).catch(() => null);
        if (data) {
          meta_title = `${data.name} - AI Use Case | Totan AI`;
          meta_description = data.description || `Explore the AI use case and workflow for ${data.name}.`;
        }
      }
      else {
        data = await pageService.getBySlug('use-cases').catch(() => null);
        if (!data) {
          meta_title = 'AI Use Cases & Workflows | Totan AI';
          meta_description = 'Discover real-world AI use cases: customer support agents, document parsing, sales qualifiers, and more.';
        }
      }
    } 
    else if (first === 'solutions') {
      if (second) {
        data = await solutionService.getBySlug(second).catch(() => null);
        if (data) {
          meta_title = `${data.name} - AI Solution | Totan AI`;
          meta_description = data.description || `Solve operational bottlenecks with our custom AI solution: ${data.name}.`;
        }
      }
      else {
        data = await pageService.getBySlug('solutions').catch(() => null);
        if (!data) {
          meta_title = 'AI Solutions for Enterprise | Totan AI';
          meta_description = 'Custom artificial intelligence, automated workflows, and integrations built for scalable enterprise growth.';
        }
      }
    } 
    else if (first === 'integrations') {
      if (second) {
        data = await integrationService.getBySlug(second).catch(() => null);
        if (data) {
          meta_title = `${data.name} Integration | Totan AI`;
          meta_description = data.description || `Connect ${data.name} with custom AI agents and pipelines. Secure integrations with zero friction.`;
        }
      }
      else {
        data = await pageService.getBySlug('integrations').catch(() => null);
        if (!data) {
          meta_title = 'Ecosystem Integrations | Totan AI';
          meta_description = 'Connect your tools (Slack, HubSpot, Salesforce, WhatsApp) to secure custom AI engines and agents.';
        }
      }
    }
    else if (first === 'tools') {
      if (second) {
        data = await solutionService.getBySlug(second).catch(() => null);
        if (data) {
          meta_title = `${data.name} - AI Tool & Automation | Totan AI`;
          meta_description = data.description || `Try our custom AI tool: ${data.name} to optimize business pipelines.`;
        }
      }
      else {
        data = await pageService.getBySlug('tools').catch(() => null);
        if (!data) {
          meta_title = 'AI Tools & Automations | Totan AI';
          meta_description = 'Bespoke AI tools engineered for specific business tasks: secure, automated, and lightning fast.';
        }
      }
    }
    else if (first === 'blog') {
      if (!second) {
        data = await pageService.getBySlug('blog').catch(() => null);
        if (!data) {
          meta_title = 'Insights & Blog | Totan AI';
          meta_description = 'Expert opinions, engineering deep dives, and case studies on deploying AI and automation in production.';
        }
      }
      else if (second === 'category' && third) {
        data = await blogCategoryService.getBySlug(third).catch(() => null);
        if (data) {
          meta_title = `${data.name} Articles | Insights & Blog | Totan AI`;
          meta_description = data.description || `Read expert articles and insights in the ${data.name} category.`;
        }
      }
      else if (second === 'tag' && third) {
        data = await blogTagService.getBySlug(third).catch(() => null);
        if (data) {
          meta_title = `Articles tagged under #${data.name} | Totan AI`;
          meta_description = `Browse our blog posts and guides tagged with #${data.name}.`;
        } else {
          meta_title = `Articles tagged under #${third} | Totan AI`;
          meta_description = `Browse our blog posts and guides tagged with #${third}.`;
        }
      }
      else {
        data = await pageService.getBySlug(second).catch(() => null);
      }
    }
    else {
      // It's a dynamic page!
      data = await pageService.getBySlug(slugPath).catch(() => null);
      if (!data) {
         data = STATIC_PAGES[slugPath];
      }
    }

    if (data) {
      const meta = data.seo_meta || data.seo;
      meta_title = meta?.meta_title || meta?.og_title || data.title || data.name || meta_title;
      meta_description = meta?.meta_description || meta?.og_description || data.short_description || data.description || meta_description;
      og_image = meta?.og_image || '';
      canonical_url = meta?.canonical_url || '';
      noindex = meta?.noindex || false;
      nofollow = meta?.nofollow || false;
      twitter_card = meta?.twitter_card || 'summary_large_image';
    }

  } catch (error) {
    console.error("Failed to generate metadata in SSR:", error);
  }

  if (!meta_title) meta_title = first.charAt(0).toUpperCase() + first.slice(1) + ' | Totan AI';
  if (!meta_description) meta_description = 'Totan AI builds custom artificial intelligence, ML agents, and scalable automation pipelines to revolutionize your business operations.';

  const cleanCanonical = canonical_url || fullUrl;

  return {
    title: meta_title,
    description: meta_description,
    alternates: {
      canonical: cleanCanonical,
    },
    openGraph: {
      title: meta_title,
      description: meta_description,
      url: cleanCanonical,
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

function generateSchema(slugArray: string[], data: any) {
  if (!data) return null;
  
  if (data.seo_meta?.schema_markup) {
    return data.seo_meta.schema_markup;
  }
  if (data.seo?.schema_json) {
    return data.seo.schema_json;
  }
  
  const first = slugArray[0];
  const second = slugArray.length > 1 ? slugArray[1] : null;
  
  const baseUrl = 'https://totan.ai';
  const url = `${baseUrl}/${slugArray.join('/')}`;

  const org = {
    "@type": "Organization",
    "@id": "https://totan.ai/#organization",
    "name": "Totan AI",
    "url": "https://totan.ai",
    "logo": {
      "@type": "ImageObject",
      "url": "https://totan.ai/totan_logo.png",
      "caption": "Totan AI Logo"
    }
  };

  // 1. Service Detail
  if (first === 'services' && second && second !== 'category') {
    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Service",
          "@id": `${url}#service`,
          "url": url,
          "name": data.name,
          "description": data.short_description || data.full_description,
          "provider": { "@id": "https://totan.ai/#organization" },
          "areaServed": "Worldwide"
        },
        org
      ]
    };
  }

  // 2. Service List
  if (first === 'services' && !second) {
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "AI Automation Services | Totan AI",
      "url": url,
      "description": "Our custom artificial intelligence, ML agents, and automation services.",
      "itemListElement": (data.services || []).map((s: any, idx: number) => ({
        "@type": "ListItem",
        "position": idx + 1,
        "url": `${baseUrl}/services/${s.slug}`,
        "name": s.name
      }))
    };
  }

  // 3. Blog Post Detail
  if (first === 'blog' && second && second !== 'categories' && second !== 'category') {
    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "BlogPosting",
          "@id": `${url}#blogposting`,
          "url": url,
          "headline": data.title,
          "description": data.seo_meta?.meta_description || "Totan AI Insights",
          "datePublished": data.created_at || new Date().toISOString(),
          "dateModified": data.updated_at || data.created_at || new Date().toISOString(),
          "author": {
            "@type": "Organization",
            "name": "Totan AI",
            "url": "https://totan.ai"
          },
          "publisher": { "@id": "https://totan.ai/#organization" },
          "image": data.seo_meta?.og_image || "https://totan.ai/totan_logo.png"
        },
        org
      ]
    };
  }

  // 4. Solutions / Tools / Integrations / Industries / Use Cases Detail
  if (second) {
    const isTool = first === 'tools';
    const type = isTool ? 'SoftwareApplication' : 'Service';
    
    const schemaObj: any = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": type,
          "@id": `${url}#resource`,
          "url": url,
          "name": data.name,
          "description": data.description || data.short_description
        },
        org
      ]
    };
    
    if (isTool) {
      schemaObj["@graph"][0]["applicationCategory"] = "BusinessApplication";
      schemaObj["@graph"][0]["operatingSystem"] = "All";
    }
    
    return schemaObj;
  }

  // Fallback Breadcrumb
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": slugArray.map((slug, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "name": slug.charAt(0).toUpperCase() + slug.slice(1),
      "item": `${baseUrl}/${slugArray.slice(0, idx + 1).join('/')}`
    }))
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
      } else {
        const [services, categories] = await Promise.all([
          serviceService.getAll().catch(() => []),
          serviceCategoryService.getAll().catch(() => [])
        ]);
        initialData = { services, categories };
      }
    } 
    else if (first === 'industries') {
      if (second) {
        initialData = await industryService.getBySlug(second);
      } else {
        initialData = await industryService.getAll().catch(() => []);
      }
    } 
    else if (first === 'use-cases') {
      if (second) {
        initialData = await useCaseService.getBySlug(second);
      } else {
        initialData = await useCaseService.getAll().catch(() => []);
      }
    } 
    else if (first === 'solutions') {
      if (second) {
        initialData = await solutionService.getBySlug(second);
      } else {
        initialData = await solutionService.getAll().catch(() => []);
      }
    } 
    else if (first === 'integrations') {
      if (second) {
        initialData = await integrationService.getBySlug(second);
      } else {
        initialData = await integrationService.getAll().catch(() => []);
      }
    }
    else if (first === 'tools') {
      if (second) {
        initialData = await solutionService.getBySlug(second).catch(() => null);
      } else {
        initialData = await solutionService.getAll().catch(() => []);
      }
    }
    else if (first === 'platform') {
      const [solutions, integrations] = await Promise.all([
        solutionService.getAll().catch(() => []),
        integrationService.getAll().catch(() => [])
      ]);
      initialData = { solutions, integrations };
    }
    else if (first === 'blog') {
      if (second === 'category' && third) {
        initialData = await blogCategoryService.getBySlug(third);
      } else if (second === 'tag' && third) {
        initialData = await blogTagService.getBySlug(third);
      } else if (second && second !== 'categories') {
        initialData = await pageService.getBySlug(second);
      } else {
        const [blogData, categories] = await Promise.all([
          pageService.getBlogs(1).catch(() => null),
          blogCategoryService.getAll().catch(() => [])
        ]);
        initialData = { blogData, categories };
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

  if (initialData) {
    initialData._extraFallbacks = await prefetchBlockData(initialData, slugArray);
  }

  const schema = generateSchema(slugArray, initialData);

  return (
    <>
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      )}
      <ClientWrapper slug={slugArray} initialData={initialData} />
    </>
  );
}

// Separate client component to avoid passing non-serializable data from server component if needed
function ClientWrapper({ slug, initialData }: { slug: string[]; initialData?: any }) {
  return <ClientRouter slug={slug} initialData={initialData} />;
}
