import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const settings = db.getSettings();
  const baseUrl = (settings.siteUrl || 'https://errorcodewiki.ai.studio').replace(/\/$/, '');
  const { articles } = db.getArticles({ status: 'published', limit: 30 });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${settings.siteName || 'ErrorCodeWiki'}</title>
    <link>${baseUrl}</link>
    <description>Universal Database of Electronics, Software, Vehicles, and Hardware Error Codes.</description>
    <language>en-us</language>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
    ${articles.map(a => `
    <item>
      <title><![CDATA[${a.title}]]></title>
      <link>${baseUrl}/error/${a.slug}</link>
      <guid isPermaLink="true">${baseUrl}/error/${a.slug}</guid>
      <pubDate>${new Date(a.createdAt).toUTCString()}</pubDate>
      <description><![CDATA[${a.shortDefinition} ${a.meaning}]]></description>
    </item>`).join('')}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
