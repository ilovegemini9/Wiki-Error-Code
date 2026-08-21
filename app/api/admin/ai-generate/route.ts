import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAuthenticatedAdmin } from '@/lib/auth';
import { getLanguageByCode } from '@/lib/languages';
import { executeWithCascadeFallback } from '@/lib/ai-service';

export async function POST(req: NextRequest) {
  if (!(await isAuthenticatedAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      errorCode,
      brand = 'Generic',
      device = 'General Device',
      category = 'Software',
      language = 'en',
      keywords = '',
      articleLength = 'Medium (800 words)',
      model = 'google/gemma-4-31b-it',
      temperature = 0.7
    } = body;

    if (!errorCode || !errorCode.trim()) {
      return NextResponse.json({ error: 'Error code is required' }, { status: 400 });
    }

    const langObj = getLanguageByCode(language);
    const settings = db.getSettings();
    const openRouterApiKey = settings.openRouterApiKey || process.env.OPENROUTER_API_KEY;

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

You MUST return a VALID JSON object (and nothing else, no markdown codeblock wraps if possible, just raw JSON) matching this exact structure:
{
  "errorCode": "${errorCode}",
  "title": "Clear article title in ${langObj.name} e.g. ${brand} Error ${errorCode}: [Short Summary Fix in ${langObj.name}]",
  "slug": "${brand.toLowerCase().replace(/[^a-z0-9]/g, '')}-${errorCode.toLowerCase().replace(/[^a-z0-9]/g, '-')}${langObj.code === 'en' ? '' : '-' + langObj.code}",
  "metaTitle": "SEO Meta Title in ${langObj.name} (50-60 chars)",
  "metaDescription": "SEO Meta Description in ${langObj.name} (140-160 chars with call to action)",
  "shortDefinition": "1-2 sentence concise definition in ${langObj.name}.",
  "meaning": "Detailed paragraph explaining in ${langObj.name} what the error code means, what subsystem is affected, and why it occurred.",
  "causes": [
    "Cause 1 concise statement in ${langObj.name}",
    "Cause 2 concise statement in ${langObj.name}",
    "Cause 3 concise statement in ${langObj.name}"
  ],
  "solutions": [
    {
      "title": "Solution 1 Title in ${langObj.name}",
      "description": "Explanation in ${langObj.name}",
      "steps": [
        "Step 1 instruction in ${langObj.name}",
        "Step 2 instruction in ${langObj.name}"
      ],
      "codeSnippet": "Optional terminal or CLI command snippet if applicable"
    },
    {
      "title": "Solution 2 Title in ${langObj.name}",
      "description": "Explanation in ${langObj.name}",
      "steps": [
        "Step 1 instruction in ${langObj.name}",
        "Step 2 instruction in ${langObj.name}"
      ]
    }
  ],
  "technicalExplanation": "Low-level technical breakdown in ${langObj.name}, protocol flags, memory addresses, or diagnostic log mechanics.",
  "faq": [
    {
      "question": "Frequently asked question 1 in ${langObj.name} about ${errorCode}?",
      "answer": "Direct, clear answer to question 1 in ${langObj.name}."
    },
    {
      "question": "Frequently asked question 2 in ${langObj.name}?",
      "answer": "Direct, clear answer to question 2 in ${langObj.name}."
    }
  ],
  "keywords": ["${errorCode}", "keyword in ${langObj.name}", "fix code in ${langObj.name}"],
  "tags": ["${category}", "${brand}", "${errorCode}"],
  "readingTime": "4 min read",
  "internalLinks": [
    {
      "title": "Related Guide in ${langObj.name}",
      "url": "/error/related-code",
      "anchorText": "Fix Related Error Code"
    }
  ]
}`;

    const generationResult = await executeWithCascadeFallback({
      prompt,
      temperature: parseFloat(String(temperature)),
      selectedModel: model || 'nvidia/nemotron-3-ultra:free',
      openRouterApiKey,
      siteUrl: settings.siteUrl || 'https://errorcodewiki.org',
      siteName: settings.siteName || 'ErrorCodeWiki',
      systemPrompt: 'You are an expert technical diagnostic database generator. Output strictly valid JSON.'
    });

    let cleanedJson = generationResult.text.trim();
    if (cleanedJson.startsWith('```json')) {
      cleanedJson = cleanedJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedJson.startsWith('```')) {
      cleanedJson = cleanedJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const parsedArticle = JSON.parse(cleanedJson);

    // Calculate SEO Score
    let seoScore = 70;
    if (parsedArticle.metaTitle?.length >= 40 && parsedArticle.metaTitle?.length <= 65) seoScore += 5;
    if (parsedArticle.metaDescription?.length >= 120 && parsedArticle.metaDescription?.length <= 165) seoScore += 5;
    if (parsedArticle.causes?.length >= 3) seoScore += 5;
    if (parsedArticle.solutions?.length >= 2) seoScore += 5;
    if (parsedArticle.faq?.length >= 2) seoScore += 5;
    if (parsedArticle.technicalExplanation?.length >= 100) seoScore += 5;

    parsedArticle.seoScore = Math.min(100, seoScore);
    parsedArticle.language = langObj.code;

    // Build Schema JSON-LD
    const siteUrl = settings.siteUrl || 'https://errorcodewiki.org';
    const canonical = langObj.code === 'en' 
      ? `${siteUrl}/error/${parsedArticle.slug}`
      : `${siteUrl}/${langObj.code}/error/${parsedArticle.slug}`;
    parsedArticle.canonicalUrl = canonical;

    const schemaObj = {
      "@context": "https://schema.org",
      "@type": "TechArticle",
      "headline": parsedArticle.title,
      "description": parsedArticle.metaDescription,
      "articleBody": `${parsedArticle.shortDefinition} ${parsedArticle.meaning} ${parsedArticle.technicalExplanation}`,
      "dependencies": brand,
      "proficiencyLevel": "Expert",
      "mainEntity": {
        "@type": "FAQPage",
        "mainEntity": (parsedArticle.faq || []).map((f: any) => ({
          "@type": "Question",
          "name": f.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": f.answer
          }
        }))
      }
    };

    parsedArticle.schemaJsonLd = JSON.stringify(schemaObj, null, 2);

    // Log AI generation
    db.logAiGeneration({
      errorCode,
      brand,
      device,
      model: generationResult.usedModel || model || 'nvidia/nemotron-3-ultra:free',
      status: 'completed'
    });

    return NextResponse.json({
      success: true,
      article: parsedArticle,
      usedModel: generationResult.usedModel,
      cascadeLogs: generationResult.cascadeLogs
    });
  } catch (e) {
    db.logAiGeneration({
      errorCode: req.body ? 'Unknown' : 'Error',
      brand: 'System',
      device: 'Server',
      model: 'Error',
      status: 'failed'
    });

    return NextResponse.json({ error: e instanceof Error ? e.message : 'AI generation failed' }, { status: 500 });
  }
}
