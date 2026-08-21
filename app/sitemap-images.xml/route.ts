import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const settings = db.getSettings();
  const baseUrl = (settings.siteUrl || 'https://errorcodewiki.ai.studio').replace(/\/$/, '');
  const { articles } = db.getArticles({ status: 'published' });

  const articlesWithImages = articles.filter(a => a.featuredImage);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  ${articlesWithImages.map(a => `
  <url>
    <loc>${baseUrl}/error/${a.slug}</loc>
    <image:image>
      <image:loc>${a.featuredImage}</image:loc>
      <image:title><![CDATA[${a.title}]]></image:title>
      <image:caption><![CDATA[${a.shortDefinition}]]></image:caption>
    </image:image>
  </url>`).join('')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400'
    }
  });
}
