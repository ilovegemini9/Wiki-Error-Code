import { getSupabaseArticles, getSupabaseSettings } from '@/lib/supabase-db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const [settings, result] = await Promise.all([getSupabaseSettings(), getSupabaseArticles({ status: 'published', limit: 500 })]);
  const baseUrl = (settings.siteUrl || 'https://errorcodewiki.org').replace(/\/$/, '');
  const articlesWithImages = result.articles.filter(a => a.featuredImage);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${articlesWithImages.map(a => { const lang = (a.language || 'en').toLowerCase(); const url = lang === 'en' ? `${baseUrl}/error/${a.slug}` : `${baseUrl}/${lang}/error/${a.slug}`; return `<url><loc>${url}</loc><image:image><image:loc>${a.featuredImage}</image:loc><image:title><![CDATA[${a.title}]]></image:title><image:caption><![CDATA[${a.shortDefinition || ''}]]></image:caption></image:image></url>`; }).join('\n')}\n</urlset>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=86400' } });
}
