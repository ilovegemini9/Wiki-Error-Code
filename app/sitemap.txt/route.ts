import { db } from '@/lib/db';
import { SUPPORTED_LANGUAGES } from '@/lib/languages';

export const dynamic = 'force-dynamic';

export async function GET() {
  const settings = db.getSettings();
  const baseUrl = (settings.siteUrl || 'https://errorcodewiki.ai.studio').replace(/\/$/, '');
  const { articles } = db.getArticles({ status: 'published' });
  const categories = db.getCategories();
  const brands = db.getBrands();

  const urls: string[] = [];

  urls.push(`${baseUrl}`);
  urls.push(`${baseUrl}/sitemap.xml`);
  urls.push(`${baseUrl}/sitemap.txt`);
  urls.push(`${baseUrl}/llms.txt`);
  urls.push(`${baseUrl}/llms-full.txt`);
  urls.push(`${baseUrl}/search`);
  urls.push(`${baseUrl}/about`);
  urls.push(`${baseUrl}/contact`);
  urls.push(`${baseUrl}/privacy`);
  urls.push(`${baseUrl}/terms`);
  urls.push(`${baseUrl}/disclaimer`);

  SUPPORTED_LANGUAGES.forEach(l => {
    urls.push(`${baseUrl}/${l.code}`);
    urls.push(`${baseUrl}/${l.code}/category`);
  });

  categories.forEach(c => {
    urls.push(`${baseUrl}/category/${c.slug}`);
  });

  brands.forEach(b => {
    urls.push(`${baseUrl}/brand/${b.slug}`);
  });

  articles.forEach(a => {
    const artLang = (a.language || 'en').toLowerCase().trim();
    const artUrl = artLang === 'en' ? `${baseUrl}/error/${a.slug}` : `${baseUrl}/${artLang}/error/${a.slug}`;
    urls.push(artUrl);
  });

  return new Response(urls.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400'
    }
  });
}
