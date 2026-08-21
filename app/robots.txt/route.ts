import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const settings = db.getSettings();
  const siteUrl = (settings.siteUrl || 'https://errorcodewiki.ai.studio').replace(/\/$/, '');
  const customRobots = settings.robotsTxt;

  if (customRobots && customRobots.trim().length > 10) {
    return new Response(customRobots, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=86400'
      }
    });
  }

  const content = `# ErrorCodeWiki Robots & AI Crawler Rules
# LLMs Text File: ${siteUrl}/llms.txt
# Full LLM Text Database: ${siteUrl}/llms-full.txt

User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/admin

# Explicitly Allow AI Search & Retrieval Crawlers for Page 1 Positioning
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: GoogleOther
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: Bingbot
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
Sitemap: ${siteUrl}/sitemap-images.xml
`;

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400'
    }
  });
}

