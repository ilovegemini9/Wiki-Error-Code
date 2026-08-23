import { NextRequest, NextResponse } from 'next/server';

const SUPPORTED = new Set(['en', 'fr', 'es', 'de', 'ja', 'it', 'pt', 'nl', 'zh']);

function detectLanguage(request: NextRequest): string {
  const header = request.headers.get('accept-language') || '';
  const candidates = header
    .split(',')
    .map((part) => {
      const [rawTag, ...params] = part.trim().split(';');
      const tag = rawTag.toLowerCase();
      const q = params.find((param) => param.trim().startsWith('q='));
      const quality = q ? Number(q.trim().slice(2)) : 1;
      return { tag, quality: Number.isFinite(quality) ? quality : 0 };
    })
    .filter(({ quality }) => quality > 0)
    .sort((a, b) => b.quality - a.quality);

  for (const { tag } of candidates) {
    const language = tag.split('-')[0];
    if (SUPPORTED.has(language)) return language;
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

  // Public routes without a locale always receive a locale path.
  // Example: fr-FR -> /fr, de-DE -> /de, unsupported -> /en.
  const language = detectLanguage(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${language}${pathname === '/' ? '' : pathname}`;

  const response = NextResponse.redirect(url, 307);
  response.cookies.set('site_language', language, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  });
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
