import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const settings = db.getSettings();
  const siteUrl = (settings.siteUrl || 'https://errorcodewiki.ai.studio').replace(/\/$/, '');
  const siteName = settings.siteName || 'ErrorCodeWiki';

  const categories = db.getCategories();
  const brands = db.getBrands();
  const { articles } = db.getArticles({ status: 'published', limit: 1000 });

  let markdown = `# ${siteName} - Full Text Diagnostic Manual Database\n\n`;
  markdown += `> Complete full-text documentation database of error codes, root causes, technical explanations, and step-by-step resolution procedures for AI models and search engine indexing.\n\n`;

  markdown += `---\n\n`;

  articles.forEach((art) => {
    const cat = categories.find(c => c.slug === art.categoryId)?.name || art.categoryId;
    const brand = brands.find(b => b.slug === art.brandId)?.name || art.brandId;
    const artLang = (art.language || 'en').toLowerCase().trim();
    const artUrl = artLang === 'en' ? `${siteUrl}/error/${art.slug}` : `${siteUrl}/${artLang}/error/${art.slug}`;

    markdown += `# Article: ${art.title} (${art.errorCode}) [Language: ${artLang.toUpperCase()}]\n`;
    markdown += `- URL: ${artUrl}\n`;
    markdown += `- Error Code: ${art.errorCode}\n`;
    markdown += `- Language: ${artLang.toUpperCase()}\n`;
    markdown += `- Category: ${cat}\n`;
    markdown += `- Brand / Manufacturer: ${brand}\n`;
    markdown += `- Device / Target: ${art.deviceType}\n`;
    markdown += `- Updated: ${new Date(art.updatedAt).toISOString().split('T')[0]}\n\n`;

    markdown += `## Short Definition\n${art.shortDefinition}\n\n`;

    markdown += `## Meaning & Subsystem Impact\n${art.meaning}\n\n`;

    if (art.causes && art.causes.length > 0) {
      markdown += `## Causes\n`;
      art.causes.forEach((c) => {
        markdown += `- ${c}\n`;
      });
      markdown += `\n`;
    }

    if (art.solutions && art.solutions.length > 0) {
      markdown += `## Step-by-Step Solutions\n`;
      art.solutions.forEach((sol, idx) => {
        markdown += `### Solution ${idx + 1}: ${sol.title}\n`;
        markdown += `${sol.description}\n`;
        if (sol.steps && sol.steps.length > 0) {
          sol.steps.forEach((st) => {
            markdown += `1. ${st}\n`;
          });
        }
        if (sol.codeSnippet) {
          markdown += `\`\`\`bash\n${sol.codeSnippet}\n\`\`\`\n`;
        }
        markdown += `\n`;
      });
    }

    if (art.technicalExplanation) {
      markdown += `## Technical Explanation\n${art.technicalExplanation}\n\n`;
    }

    if (art.faq && art.faq.length > 0) {
      markdown += `## Frequently Asked Questions\n`;
      art.faq.forEach((f) => {
        markdown += `Q: ${f.question}\nA: ${f.answer}\n\n`;
      });
    }

    markdown += `---\n\n`;
  });

  return new Response(markdown, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400'
    }
  });
}
