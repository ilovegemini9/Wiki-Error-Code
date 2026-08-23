import { getSupabaseArticles, getSupabaseSettings, getSupabaseCategories, getSupabaseBrands } from '@/lib/supabase-db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const [settings, categories, brands, result] = await Promise.all([getSupabaseSettings(), getSupabaseCategories(), getSupabaseBrands(), getSupabaseArticles({ status: 'published', limit: 500 })]);
  const siteUrl = (settings.siteUrl || 'https://errorcodewiki.org').replace(/\/$/, '');
  const siteName = settings.siteName || 'ErrorCodeWiki';
  let markdown = `# ${siteName} - Universal Error Code & Diagnostic Knowledge Base\n\n`;
  markdown += `> Comprehensive diagnostic database of error codes, OBD-II vehicle codes, BSODs, printer hardware errors, and server exceptions with step-by-step resolution guides.\n\n`;
  markdown += `## Core Resources & System Files\n\n- [Full LLM Knowledge Database](${siteUrl}/llms-full.txt)\n- [XML Sitemap](${siteUrl}/sitemap.xml)\n- [Image Sitemap](${siteUrl}/sitemap-images.xml)\n- [RSS Diagnostic Feed](${siteUrl}/rss.xml)\n\n`;
  markdown += `## Categories Directory\n\n`;
  for (const cat of categories) markdown += `- [${cat.name} Manuals](${siteUrl}/category/${cat.slug}): ${cat.description || `${cat.name} error code diagnostic manual.`}\n`;
  markdown += `\n## Equipment & Hardware Brands\n\n`;
  for (const b of brands) markdown += `- [${b.name}](${siteUrl}/brand/${b.slug}): ${b.description || `${b.name} hardware and software error code solutions.`}\n`;
  markdown += `\n## Documented Error Codes & Step-by-Step Fixes\n\n`;
  for (const art of result.articles) {
    const brandName = brands.find(b => b.id === art.brandId || b.slug === art.brandId)?.name || art.brandId || 'Equipment';
    const lang = (art.language || 'en').toLowerCase().trim();
    const artUrl = lang === 'en' ? `${siteUrl}/error/${art.slug}` : `${siteUrl}/${lang}/error/${art.slug}`;
    const flag = lang === 'fr' ? '🇫🇷' : lang === 'es' ? '🇪🇸' : lang === 'de' ? '🇩🇪' : lang === 'it' ? '🇮🇹' : lang === 'ja' ? '🇯🇵' : lang === 'pt' ? '🇵🇹' : lang === 'zh' ? '🇨🇳' : lang === 'ru' ? '🇷🇺' : '🇺🇸';
    markdown += `- [${art.errorCode}: ${art.title} (${flag} ${lang.toUpperCase()})](${artUrl}): ${art.shortDefinition || `How to fix ${art.errorCode} on ${brandName} ${art.deviceType}.`}\n`;
  }
  return new Response(markdown, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600, s-maxage=86400' } });
}
