import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

let cachedRedirects: any = null;
let lastFetch = 0;
const CACHE_TTL = 60000; // 1 minute

function normalizeUrlPath(urlStr: string): string {
  if (!urlStr) return '';
  return urlStr
    .trim()
    .replace(/^https?:\/\/[^\/]+/, '') // Strip protocol and domain
    .toLowerCase()
    .replace(/^\/+|\/+$/g, ''); // Strip leading and trailing slashes
}

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  if (host.startsWith('www.')) {
    const nonWwwHost = host.slice(4);
    const destination = new URL(request.nextUrl.pathname + request.nextUrl.search, `https://${nonWwwHost}`);
    return NextResponse.redirect(destination.toString(), 308);
  }

  const path = request.nextUrl.pathname;
  
  // Skip static files, images, build assets, and api routes to avoid unnecessary overhead
  if (path.startsWith('/_next') || path.startsWith('/api') || path.match(/\.(png|jpg|jpeg|svg|ico|css|js|webp|woff|woff2|ttf)$/)) {
    return NextResponse.next();
  }

  const now = Date.now();
  if (!cachedRedirects || now - lastFetch > CACHE_TTL) {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.totan.ai/api';
      const res = await fetch(`${apiUrl}/redirects`, { 
        next: { revalidate: 60 } 
      });
      if (res.ok) {
        cachedRedirects = await res.json();
        lastFetch = now;
      }
    } catch (e) {
      console.error('Failed to fetch redirects in middleware', e);
    }
  }

  if (cachedRedirects && Array.isArray(cachedRedirects)) {
    const cleanPath = normalizeUrlPath(path);
    
    const match = cachedRedirects.find(r => {
      if (!r.source_url || !r.target_url) return false;
      
      const cleanSource = normalizeUrlPath(r.source_url);
      const cleanTarget = normalizeUrlPath(r.target_url);

      // Rule 1: Ignore self-referential redirects (source === target)
      if (cleanSource === cleanTarget) return false;

      // Rule 2: Check if source matches current requested path
      if (cleanSource !== cleanPath) return false;

      // Rule 3: Never redirect if target resolves to the current requested path
      if (cleanTarget === cleanPath) return false;

      // Rule 4: Prevent 2-step circular loops (e.g. A -> B and B -> A)
      const isCircular = cachedRedirects.some(other => {
        if (!other.source_url || !other.target_url) return false;
        const otherSource = normalizeUrlPath(other.source_url);
        const otherTarget = normalizeUrlPath(other.target_url);
        return otherSource === cleanTarget && otherTarget === cleanPath;
      });

      if (isCircular) {
        console.warn(`[Middleware] Blocked circular redirect loop between "${cleanPath}" and "${cleanTarget}"`);
        return false;
      }

      return true;
    });

    if (match) {
      const target = match.target_url.trim();
      const status = match.status_code === 301 ? 308 : (match.status_code || 307);
      
      let redirectUrl: string;
      if (target.startsWith('http://') || target.startsWith('https://')) {
        redirectUrl = target;
      } else {
        const formattedTarget = target.startsWith('/') ? target : `/${target}`;
        redirectUrl = new URL(formattedTarget + request.nextUrl.search, request.url).toString();
      }

      // Final Guard: Ensure we never redirect to the exact same full URL
      if (redirectUrl === request.url) {
        return NextResponse.next();
      }

      return NextResponse.redirect(redirectUrl, status);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

