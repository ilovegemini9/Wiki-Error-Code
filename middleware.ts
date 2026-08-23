import { NextRequest, NextResponse } from 'next/server';

const SUPPORTED = new Set(['en', 'fr', 'es', 'de', 'ja', 'it', 'pt', 'nl', 'zh']);

function detectLanguage(request: NextRequest): string {
  const cookie = request.cookies.get('user_lang')?.value?.toLowerCase().split('-')[0];
  if (cookie && SUPPORTED.has(cookie)) return cookie;

  const header = request.headers.get('accept-language') || '';
  for (const part of header.split(',')) {
    const code = part.trim().split(';')[0].toLowerCase().split('-')[0];
    if (SUPPORTED.has(code)) return code;
  }
  return 'en';
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Never localize admin, APIs, framework assets, files, or already-localized URLs.
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname === '/ads.txt' ||
    /\.[^/]+$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  const first = pathname.split('/').filter(Boolean)[0]?.toLowerCase();
  if (first && SUPPORTED.has(first)) return NextResponse.next();

  // Root and public routes without a locale are redirected to /<language>/...
  // based on the visitor's browser language. Unsupported browser languages fall back to /en.
  const language = detectLanguage(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${language}${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(url, 307);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
