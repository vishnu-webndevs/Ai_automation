import { serviceService, pageService, blogCategoryService } from '../services/api';

export async function prefetchBlockData(pageData: any, pathArray: string[]) {
  if (!pageData) return {};
  
  const fallbacks: Record<string, any> = {};
  const first = pathArray[0];
  const second = pathArray.length > 1 ? pathArray[1] : null;
  
  // 1. Detect dynamic layout blocks
  let hasLatestServices = false;
  let hasBlogGrid = false;
  
  const sections = pageData.sections || [];
  for (const s of sections) {
    const blocks = s.blocks || [];
    for (const b of blocks) {
      const type = (b.block_type || b.type || '').toLowerCase();
      if (type === 'latest_services') {
        hasLatestServices = true;
      }
      if (type === 'blog-grid' || type === 'blog_grid' || type === 'blog-list') {
        hasBlogGrid = true;
      }
    }
  }
  
  const promises: Promise<any>[] = [];
  const keys: string[] = [];
  
  if (hasLatestServices) {
    promises.push(serviceService.getAll().catch(() => []));
    keys.push('services');
  }
  
  if (hasBlogGrid) {
    promises.push(pageService.getBlogs(1).catch(() => null));
    keys.push('blogs-1');
  }

  // 2. Fetch sidebar elements for blog details/pages
  const isBlogDetail = first === 'blog' && second && second !== 'categories' && second !== 'category';
  const isBlogList = first === 'blog' && !second;
  const isModernBlogTemplate = pageData.template_slug === 'blog-modern' || pageData.template === 'blog-modern';

  if (isBlogDetail || isBlogList || isModernBlogTemplate) {
    promises.push(pageService.getBlogs(1).catch(() => null));
    keys.push('blogs-recent');

    promises.push(pageService.getBlogs(1).catch(() => null));
    keys.push('recent-posts');

    promises.push(blogCategoryService.getAll().catch(() => []));
    keys.push('blog-categories');
  }
  
  if (promises.length > 0) {
    try {
      const results = await Promise.all(promises);
      for (let i = 0; i < keys.length; i++) {
        fallbacks[keys[i]] = results[i];
      }
    } catch (e) {
      console.error('Failed to prefetch block data:', e);
    }
  }
  
  return fallbacks;
}
