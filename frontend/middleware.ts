import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

let cachedRedirects: any = null;
let lastFetch = 0;
const CACHE_TTL = 60000; // 1 minute

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  if (host.startsWith('www.')) {
    const nonWwwHost = host.slice(4);
    const destination = new URL(request.nextUrl.pathname + request.nextUrl.search, `https://${nonWwwHost}`);
    return NextResponse.redirect(destination.toString(), 301);
  }

  const path = request.nextUrl.pathname;
  
  // Skip static files, images, and api routes to avoid unnecessary overhead
  if (path.startsWith('/_next') || path.startsWith('/api') || path.match(/\.(png|jpg|jpeg|svg|ico|css|js|webp)$/)) {
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
    const currentUrl = request.url;
    const reqPath = path.replace(/\/$/, '') || '/';
    
    const match = cachedRedirects.find(r => {
      const source = r.source_url.replace(/\/$/, '') || '/';
      return source === currentUrl || source === reqPath || source === `https://totan.ai${reqPath}` || source === `http://localhost:3000${reqPath}`;
    });

    if (match) {
      const target = match.target_url;
      const status = match.status_code === 301 ? 308 : 307; // 308/307 are preferred in Next.js
      
      if (target.startsWith('http')) {
        return NextResponse.redirect(target, status);
      } else {
        return NextResponse.redirect(new URL(target, request.url), status);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
