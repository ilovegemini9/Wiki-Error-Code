import { getSupabaseArticles, getSupabaseSettings, getSupabaseCategories, getSupabaseBrands } from '@/lib/supabase-db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const [settings, categories, brands, result] = await Promise.all([getSupabaseSettings(), getSupabaseCategories(), getSupabaseBrands(), getSupabaseArticles({ status: 'published', limit: 500 })]);
  const siteUrl = (settings.siteUrl || 'https://errorcodewiki.org').replace(/\/$/, '');
  const getName = (rows: any[], id: string) => rows.find(r => r.id === id || r.slug === id)?.name || id;
  let markdown = `# ${settings.siteName || 'ErrorCodeWiki'} - Full Text Diagnostic Manual Database\n\n`;
  markdown += `> Complete documentation database of error codes, causes, technical explanations, and resolution procedures for AI models and search indexing.\n\n---\n\n`;
  for (const art of result.articles) {
    const lang = (art.language || 'en').toLowerCase().trim();
    const url = lang === 'en' ? `${siteUrl}/error/${art.slug}` : `${siteUrl}/${lang}/error/${art.slug}`;
    markdown += `# Article: ${art.title} (${art.errorCode}) [Language: ${lang.toUpperCase()}]\n- URL: ${url}\n- Error Code: ${art.errorCode}\n- Language: ${lang.toUpperCase()}\n- Category: ${getName(categories, art.categoryId)}\n- Brand / Manufacturer: ${getName(brands, art.brandId)}\n- Device / Target: ${art.deviceType}\n- Updated: ${new Date(art.updatedAt).toISOString().split('T')[0]}\n\n`;
    markdown += `## Short Definition\n${art.shortDefinition || ''}\n\n## Meaning & Subsystem Impact\n${art.meaning || ''}\n\n`;
    if (art.causes?.length) markdown += `## Causes\n${art.causes.map(c => `- ${c}`).join('\n')}\n\n`;
    if (art.solutions?.length) {
      markdown += `## Step-by-Step Solutions\n`;
      art.solutions.forEach((sol, idx) => { markdown += `### Solution ${idx + 1}: ${sol.title}\n${sol.description || ''}\n`; if (Array.isArray(sol.steps) && sol.steps.length) markdown += sol.steps.map(st => `1. ${st}`).join('\n') + '\n'; if (sol.codeSnippet) markdown += `\`\`\`text\n${sol.codeSnippet}\n\`\`\`\n`; markdown += '\n'; });
    }
    if (art.technicalExplanation) markdown += `## Technical Explanation\n${art.technicalExplanation}\n\n`;
    if (art.faq?.length) markdown += `## Frequently Asked Questions\n${art.faq.map(f => `Q: ${f.question}\nA: ${f.answer}\n`).join('\n')}\n`;
    markdown += `---\n\n`;
  }
  return new Response(markdown, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600, s-maxage=86400' } });
}
