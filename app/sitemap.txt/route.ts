import { getSupabaseArticles, getSupabaseSettings, getSupabaseCategories, getSupabaseBrands } from '@/lib/supabase-db';
import { SUPPORTED_LANGUAGES } from '@/lib/languages';

export const dynamic = 'force-dynamic';

export async function GET() {
  const [settings, articleResult, categories, brands] = await Promise.all([getSupabaseSettings(), getSupabaseArticles({ status: 'published' }), getSupabaseCategories(), getSupabaseBrands()]);
  const baseUrl = (settings.siteUrl || 'https://errorcodewiki.org').replace(/\/$/, '');
  const urls: string[] = [`${baseUrl}`, `${baseUrl}/sitemap.xml`, `${baseUrl}/sitemap.txt`, `${baseUrl}/llms.txt`, `${baseUrl}/llms-full.txt`, `${baseUrl}/search`, `${baseUrl}/about`, `${baseUrl}/contact`, `${baseUrl}/privacy`, `${baseUrl}/terms`, `${baseUrl}/disclaimer`];
  SUPPORTED_LANGUAGES.forEach(l => { urls.push(`${baseUrl}/${l.code}`, `${baseUrl}/${l.code}/category`); });
  categories.forEach(c => urls.push(`${baseUrl}/category/${c.slug}`));
  brands.forEach(b => urls.push(`${baseUrl}/brand/${b.slug}`));
  articleResult.articles.forEach(a => { const lang = (a.language || 'en').toLowerCase().trim(); urls.push(lang === 'en' ? `${baseUrl}/error/${a.slug}` : `${baseUrl}/${lang}/error/${a.slug}`); });
  return new Response(urls.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600, s-maxage=86400' } });
}
