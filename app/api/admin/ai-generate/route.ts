import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticatedAdmin } from '@/lib/auth';
import { getLanguageByCode } from '@/lib/languages';
import { executeWithCascadeFallback } from '@/lib/ai-service';
import { getSupabaseSettings, saveSupabaseAiGenerationLog } from '@/lib/supabase-db';
import { getOpenRouterApiKey } from '@/lib/provider-secrets';

export const dynamic = 'force-dynamic';

const KNOWN_MANUFACTURERS = [
  'Nissan', 'Ford', 'Toyota', 'Honda', 'Chevrolet', 'Hyundai', 'Subaru', 'BMW', 'Mercedes-Benz', 'Volkswagen', 'Audi', 'Kia', 'Mazda', 'Lexus', 'Tesla', 'Jeep', 'Dodge', 'Chrysler', 'Ram', 'Volvo',
  'Microsoft', 'Apple', 'Google', 'Samsung', 'Sony', 'HP', 'Canon', 'Epson', 'Bosch', 'Whirlpool', 'LG', 'Nintendo', 'Xbox', 'PlayStation', 'Nginx', 'Cloudflare'
];

function sanitizeTitle(value: unknown, selectedBrand: string): string {
  let title = String(value ?? '').trim();
  const selected = selectedBrand.toLowerCase().trim();
  if (!title || !selected) return title;
  for (const manufacturer of KNOWN_MANUFACTURERS) {
    if (manufacturer.toLowerCase() === selected) continue;
    const escaped = manufacturer.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    title = title.replace(new RegExp(`(?:\\s*(?:,|/|\\||&|and)\\s*)?${escaped}(?:\\s+(?:vehicles?|cars?|systems?|devices?))?`, 'gi'), ' ');
  }
  return title.replace(/\s{2,}/g, ' ').replace(/\s+([,:;])/g, '$1').trim();
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticatedAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  let errorCode = 'Unknown';
  let brand = 'System';
  let device = 'Server';
  let model = 'Error';
  try {
    const body = await req.json();
    errorCode = body.errorCode || 'Unknown';
    brand = body.brand || 'Generic';
    device = body.device || 'General Device';
    model = body.model || 'auto_cascade';
    const { category = 'Software', language = 'en', keywords = '', articleLength = 'Medium (800 words)', temperature = 0.7 } = body;
    if (!String(errorCode).trim()) return NextResponse.json({ error: 'Error code is required' }, { status: 400 });

    const langObj = getLanguageByCode(language);
    const settings = await getSupabaseSettings();
    const openRouterApiKey = await getOpenRouterApiKey();
    const prompt = `You are an expert technical writer and SEO engineer specializing in electronics, software, hardware, vehicles, and IT infrastructure diagnostic manuals.
Generate a complete, highly accurate, professional Wikipedia-style SEO article for the error code: "${errorCode}".

CRITICAL MULTILINGUAL INSTRUCTION:
- Target Output Language: ${langObj.englishName} (${langObj.name}) [Language Code: "${langObj.code}"]
- You MUST write ALL generated content (title, shortDefinition, meaning, causes list, solution titles & step-by-step instructions, technicalExplanation, FAQ questions & answers, metaTitle, metaDescription, keywords, and tags) NATIVELY AND ENTIRELY IN ${langObj.englishName} (${langObj.name}).
- Do NOT output English unless the requested language is English! The article must read like a native ${langObj.englishName} diagnostic manual.

Context details provided:
- Brand/Manufacturer: ${brand}
- Device/System: ${device}
- Category: ${category}
- Target Language: ${langObj.englishName} (${langObj.name})
- Target Keywords: ${keywords}
- Length Expectation: ${articleLength}
- The supplied Brand, Device, and Category are authoritative; do not substitute another brand or category.
- Keep the title and meta title focused on the selected brand "${brand}". Do not add other manufacturers, such as Ford when Nissan is selected.
- Do not duplicate numbering prefixes in solution titles (avoid forms like "1. 1. Verify...").

Return ONLY a VALID JSON object matching the application's Article shape. Include errorCode, title, slug, metaTitle, metaDescription, shortDefinition, meaning, causes, solutions, technicalExplanation, faq, keywords, tags, readingTime, and internalLinks.`;

    const generationResult = await executeWithCascadeFallback({
      prompt,
      temperature: parseFloat(String(temperature)),
      selectedModel: model,
      openRouterApiKey,
      siteUrl: settings.siteUrl || 'https://errorcodewiki.org',
      siteName: settings.siteName || 'ErrorCodeWiki',
      systemPrompt: 'You are an expert technical diagnostic database generator. Output strictly valid JSON.'
    });

    let cleanedJson = generationResult.text.trim().replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
    const parsedArticle = JSON.parse(cleanedJson);
    parsedArticle.errorCode = String(errorCode).trim();
    const stripNumbering = (value: unknown) => String(value ?? '').replace(/^\s*\d+[.)]\s*/, '').trim();
    if (Array.isArray(parsedArticle.solutions)) {
      parsedArticle.solutions = parsedArticle.solutions.map((solution: any) => ({ ...solution, title: stripNumbering(solution.title) }));
    }
    if (Array.isArray(parsedArticle.causes)) {
      parsedArticle.causes = parsedArticle.causes.map((cause: unknown) => stripNumbering(cause));
    }
    parsedArticle.title = sanitizeTitle(parsedArticle.title, String(brand));
    parsedArticle.metaTitle = sanitizeTitle(parsedArticle.metaTitle, String(brand));
    let seoScore = 70;
    if (parsedArticle.metaTitle?.length >= 40 && parsedArticle.metaTitle?.length <= 65) seoScore += 5;
    if (parsedArticle.metaDescription?.length >= 120 && parsedArticle.metaDescription?.length <= 165) seoScore += 5;
    if (Array.isArray(parsedArticle.causes) && parsedArticle.causes.length >= 3) seoScore += 5;
    if (Array.isArray(parsedArticle.solutions) && parsedArticle.solutions.length >= 2) seoScore += 5;
    if (Array.isArray(parsedArticle.faq) && parsedArticle.faq.length >= 2) seoScore += 5;
    if (parsedArticle.technicalExplanation?.length >= 100) seoScore += 5;
    parsedArticle.seoScore = Math.min(100, seoScore);
    parsedArticle.language = langObj.code;
    parsedArticle.canonicalUrl = `${settings.siteUrl || 'https://errorcodewiki.org'}${langObj.code === 'en' ? '' : `/${langObj.code}`}/error/${parsedArticle.slug}`;
    parsedArticle.schemaJsonLd = JSON.stringify({
      '@context': 'https://schema.org', '@type': 'TechArticle', headline: parsedArticle.title,
      description: parsedArticle.metaDescription,
      articleBody: `${parsedArticle.shortDefinition || ''} ${parsedArticle.meaning || ''} ${parsedArticle.technicalExplanation || ''}`,
      dependencies: brand, proficiencyLevel: 'Expert',
      mainEntity: { '@type': 'FAQPage', mainEntity: (parsedArticle.faq || []).map((f: any) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })) }
    }, null, 2);

    await saveSupabaseAiGenerationLog({
      errorCode, brand, device, model: generationResult.usedModel || model, status: 'completed',
      responseSummary: parsedArticle.title,
    });
    return NextResponse.json({ success: true, article: parsedArticle, usedModel: generationResult.usedModel, cascadeLogs: generationResult.cascadeLogs });
  } catch (e) {
    try { await saveSupabaseAiGenerationLog({ errorCode, brand, device, model, status: 'failed', responseSummary: e instanceof Error ? e.message : 'AI generation failed' }); } catch {}
    return NextResponse.json({ error: e instanceof Error ? e.message : 'AI generation failed' }, { status: 500 });
  }
}
