import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const settings = db.getSettings();
  const siteUrl = (settings.siteUrl || 'https://errorcodewiki.ai.studio').replace(/\/$/, '');
  const siteName = settings.siteName || 'ErrorCodeWiki';

  const categories = db.getCategories();
  const brands = db.getBrands();
  const { articles } = db.getArticles({ status: 'published', limit: 500 });

  let markdown = `# ${siteName} - Universal Error Code & Diagnostic Knowledge Base\n\n`;
  markdown += `> Comprehensive diagnostic database of error codes, OBD-II vehicle codes, Blue Screens of Death (BSOD), printer hardware errors, and HTTP server exceptions with step-by-step resolution guides.\n\n`;

  markdown += `## Core Resources & System Files\n\n`;
  markdown += `- [Full LLM Knowledge Database](${siteUrl}/llms-full.txt): Complete structured plain-text of all documented error code articles, root causes, and resolution steps for RAG and AI search indexing.\n`;
  markdown += `- [XML Sitemap Index](${siteUrl}/sitemap.xml): Primary XML sitemap containing all published error code URLs.\n`;
  markdown += `- [Image Sitemap](${siteUrl}/sitemap-images.xml): Technical diagrams and error code visual assets.\n`;
  markdown += `- [RSS Diagnostic Feed](${siteUrl}/rss.xml): Real-time feed of newly documented error code solutions.\n\n`;

  markdown += `## Categories Directory\n\n`;
  categories.forEach((cat) => {
    markdown += `- [${cat.name} Manuals](${siteUrl}/category/${cat.slug}): ${cat.description || `${cat.name} error code diagnostic manual.`}\n`;
  });
  markdown += `\n`;

  markdown += `## Equipment & Hardware Brands\n\n`;
  brands.forEach((b) => {
    markdown += `- [${b.name}](${siteUrl}/brand/${b.slug}): ${b.description || `${b.name} hardware and software error code solutions.`}\n`;
  });
  markdown += `\n`;

  markdown += `## Documented Error Codes & Step-by-Step Fixes\n\n`;
  articles.forEach((art) => {
    const brandName = brands.find(b => b.slug === art.brandId)?.name || art.brandId || 'Equipment';
    const artLang = (art.language || 'en').toLowerCase().trim();
    const artUrl = artLang === 'en' ? `${siteUrl}/error/${art.slug}` : `${siteUrl}/${artLang}/error/${art.slug}`;
    const langFlag = artLang === 'fr' ? '🇫🇷' : artLang === 'es' ? '🇪🇸' : artLang === 'de' ? '🇩🇪' : artLang === 'it' ? '🇮🇹' : artLang === 'ja' ? '🇯🇵' : artLang === 'pt' ? '🇵🇹' : artLang === 'zh' ? '🇨🇳' : artLang === 'ru' ? '🇷🇺' : '🇺🇸';
    markdown += `- [${art.errorCode}: ${art.title} (${langFlag} ${artLang.toUpperCase()})](${artUrl}): ${art.shortDefinition || `How to fix ${art.errorCode} on ${brandName} ${art.deviceType}.`}\n`;
  });

  return new Response(markdown, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400'
    }
  });
}
