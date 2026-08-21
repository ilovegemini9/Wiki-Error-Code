import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const settings = db.getSettings();
  const origin = req.nextUrl.origin;
  const siteUrl = (settings.siteUrl || origin).replace(/\/$/, '');

  const endpoints = [
    { name: 'Sitemap XML', path: '/sitemap.xml', type: 'sitemap' },
    { name: 'RSS 2.0 Feed', path: '/rss.xml', type: 'rss' },
    { name: 'Image Sitemap XML', path: '/sitemap-images.xml', type: 'image-sitemap' },
    { name: 'Robots Directives', path: '/robots.txt', type: 'robots' },
    { name: 'LLM Context Index', path: '/llms.txt', type: 'text' },
  ];

  const results = await Promise.all(
    endpoints.map(async (ep) => {
      const startTime = performance.now();
      const targetUrl = `${origin}${ep.path}`;
      
      try {
        const response = await fetch(targetUrl, {
          headers: {
            'User-Agent': 'ErrorCodeWiki-CrawlerMonitor/1.0 (Admin Health Ping)'
          },
          cache: 'no-store'
        });

        const responseTimeMs = Math.round(performance.now() - startTime);
        const text = await response.text();
        const status = response.status;
        const ok = response.ok;
        const contentType = response.headers.get('content-type') || 'unknown';

        let itemCount = 0;
        let details: Record<string, number | string> = {};

        if (ep.type === 'sitemap') {
          // Count <url> tags
          const urlMatches = text.match(/<url>/gi);
          itemCount = urlMatches ? urlMatches.length : 0;

          // Breakdown
          const articleMatches = text.match(/\/error\//gi);
          const categoryMatches = text.match(/\/category\//gi);
          const brandMatches = text.match(/\/brand\//gi);
          details = {
            errorGuides: articleMatches ? articleMatches.length : 0,
            categories: categoryMatches ? categoryMatches.length : 0,
            brands: brandMatches ? brandMatches.length : 0,
          };
        } else if (ep.type === 'rss') {
          // Count <item> tags
          const itemMatches = text.match(/<item>/gi);
          itemCount = itemMatches ? itemMatches.length : 0;
        } else if (ep.type === 'image-sitemap') {
          // Count <image:image> tags or <url> tags
          const imageMatches = text.match(/<image:image>/gi);
          itemCount = imageMatches ? imageMatches.length : 0;
        } else if (ep.type === 'robots') {
          const sitemapRef = text.includes('Sitemap:');
          details = {
            hasSitemapDirective: sitemapRef ? 'Yes' : 'No',
            lineCount: text.split('\n').length
          };
          itemCount = text.split('\n').filter(l => l.trim().length > 0).length;
        } else if (ep.type === 'text') {
          itemCount = text.split('\n').length;
        }

        return {
          name: ep.name,
          path: ep.path,
          fullUrl: `${siteUrl}${ep.path}`,
          status,
          statusText: response.statusText || (ok ? 'OK' : 'Error'),
          ok,
          responseTimeMs,
          contentType,
          sizeBytes: new Blob([text]).size,
          itemCount,
          details,
          lastChecked: new Date().toISOString()
        };
      } catch (err: any) {
        return {
          name: ep.name,
          path: ep.path,
          fullUrl: `${siteUrl}${ep.path}`,
          status: 500,
          statusText: err.message || 'Fetch Failed',
          ok: false,
          responseTimeMs: Math.round(performance.now() - startTime),
          contentType: 'none',
          sizeBytes: 0,
          itemCount: 0,
          details: { error: err.message || 'Network error' },
          lastChecked: new Date().toISOString()
        };
      }
    })
  );

  const totalSitemapUrls = results.find(r => r.path === '/sitemap.xml')?.itemCount || 0;
  const totalRssItems = results.find(r => r.path === '/rss.xml')?.itemCount || 0;
  const healthyCount = results.filter(r => r.ok).length;

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    summary: {
      totalEndpoints: endpoints.length,
      healthyEndpoints: healthyCount,
      allHealthy: healthyCount === endpoints.length,
      totalSitemapUrls,
      totalRssItems,
    },
    results
  });
}
