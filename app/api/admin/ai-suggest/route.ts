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
      errorCode = '',
      brand = '',
      device = '',
      category = '',
      language = 'en',
      model = 'google/gemma-4-31b-it'
    } = body;

    const langObj = getLanguageByCode(language);
    const settings = db.getSettings();
    const openRouterApiKey = settings.openRouterApiKey || process.env.OPENROUTER_API_KEY;

    // Rule-based fallback suggestions when offline or fast auto-fill
    const getFallbackSuggestions = (code: string) => {
      const lowerCode = code.toLowerCase().trim();
      
      let suggestedBrand = 'Microsoft';
      let suggestedDevice = 'Windows 11 PC';
      let suggestedCategory = 'windows';
      let suggestedKeywords = [`${code} fix`, `${code} error code`, 'troubleshooting', 'access denied', 'error manual'];

      if (lowerCode.startsWith('p0') || lowerCode.startsWith('p1') || lowerCode.startsWith('b0') || lowerCode.startsWith('c0')) {
        suggestedBrand = 'Toyota / General Motors';
        suggestedDevice = 'Vehicle Engine ECU / OBD-II Scanner';
        suggestedCategory = 'automotive';
        suggestedKeywords = [`${code} obd2`, `${code} engine light`, 'check engine code', 'car repair', 'diagnostic trouble code'];
      } else if (lowerCode.startsWith('e-') || lowerCode.includes('paper') || lowerCode.includes('ink') || lowerCode.startsWith('50.') || lowerCode.startsWith('e2')) {
        suggestedBrand = 'Epson / Canon / HP';
        suggestedDevice = 'InkJet / Laser Printer';
        suggestedCategory = 'printers';
        suggestedKeywords = [`${code} printer error`, 'paper jam fix', 'printer offline', 'printhead error', 'maintenance reset'];
      } else if (lowerCode.startsWith('ce-') || lowerCode.startsWith('su-') || lowerCode.startsWith('ws-') || lowerCode.includes('e82')) {
        suggestedBrand = 'Sony PlayStation';
        suggestedDevice = 'PlayStation 5 / PS4 Console';
        suggestedCategory = 'gaming';
        suggestedKeywords = [`${code} ps5 error`, 'playstation network fix', 'game crash', 'rebuild database', 'system software update'];
      } else if (lowerCode.startsWith('e24') || lowerCode.startsWith('e15') || lowerCode.startsWith('f21') || lowerCode.startsWith('oe')) {
        suggestedBrand = 'Bosch / Whirlpool / Samsung';
        suggestedDevice = 'Dishwasher / Washing Machine';
        suggestedCategory = 'appliances';
        suggestedKeywords = [`${code} appliance error`, 'drain pump error', 'water supply code', 'reset cycle', 'user manual'];
      } else if (lowerCode.startsWith('err_') || lowerCode.includes('500') || lowerCode.includes('404') || lowerCode.includes('502')) {
        suggestedBrand = 'Google Chrome / Nginx / Apache';
        suggestedDevice = 'Web Server / Chrome Browser';
        suggestedCategory = 'software';
        suggestedKeywords = [`${code} server error`, 'http status code', 'connection refused', 'ssl error', 'dns fix'];
      }

      const brandList = [suggestedBrand, 'Microsoft', 'Apple', 'Dell', 'HP', 'Canon', 'Toyota', 'Sony PlayStation', 'Bosch', 'Cisco'];
      const deviceList = [suggestedDevice, 'Windows 11 PC', 'macOS Sequoia', 'HP LaserJet', 'PS5 Console', 'OBD-II Scanner', 'Bosch Dishwasher'];
      
      return {
        brand: suggestedBrand,
        device: suggestedDevice,
        category: suggestedCategory,
        keywords: suggestedKeywords,
        brands: Array.from(new Set([suggestedBrand, ...brandList])).slice(0, 5),
        devices: Array.from(new Set([suggestedDevice, ...deviceList])).slice(0, 5),
        suggestedTitle: code ? `How to Fix ${code} Error Code (${suggestedBrand} ${suggestedDevice})` : 'Diagnostic Troubleshooting Manual',
        suggestedOutline: ['Symptoms & Meaning', 'Quick Fix Checklist', 'Advanced Step-by-Step Solution', 'Preventive Maintenance']
      };
    };

    if (!errorCode.trim()) {
      return NextResponse.json({
        success: true,
        suggestions: getFallbackSuggestions(''),
        allCategories: db.getCategories(),
        allBrands: db.getBrands()
      });
    }

    // Attempt AI-powered suggestion using Gemini / OpenRouter
    const prompt = `Given the technical error code "${errorCode}" (Brand context: "${brand}", Device context: "${device}"), provide expert SEO & diagnostic metadata suggestions in ${langObj.englishName} (${langObj.name}).
Target Language: ${langObj.englishName} (${langObj.name}) - Code: "${langObj.code}".
CRITICAL REQUIREMENT: Do NOT output placeholder text like "keyword 1", "Brand 1", "Device 1", or generic templates. Provide REAL specific technical keywords, brand names, device names, and section headings.

Return ONLY raw JSON with no markdown formatting:
{
  "brand": "Actual specific brand name (e.g. Microsoft, Canon, Toyota, Sony, Bosch, Cisco, Apple, Epson, HP)",
  "device": "Actual hardware or device model (e.g. Windows 11 PC, EcoTank L3150 Printer, RAV4 Hybrid, PS5 Console, Front Load Washer)",
  "category": "Suggested category slug (e.g. windows, printers, automotive, gaming, appliances, networking, software, database)",
  "keywords": ["specific error fix search term 1 in ${langObj.name}", "specific search term 2 in ${langObj.name}", "specific diagnostic search term 3 in ${langObj.name}"],
  "alternativeBrands": ["Real Brand A", "Real Brand B"],
  "alternativeDevices": ["Real Hardware Model A", "Real Hardware Model B"],
  "suggestedTitle": "SEO title for this specific error in ${langObj.name}",
  "suggestedOutline": ["Real Section Heading 1 in ${langObj.name}", "Real Section Heading 2 in ${langObj.name}"]
}`;

    let jsonText = '';

    try {
      const result = await executeWithCascadeFallback({
        prompt,
        temperature: 0.3,
        selectedModel: model || 'nvidia/nemotron-3-ultra:free',
        openRouterApiKey,
        siteUrl: settings.siteUrl || 'https://errorcodewiki.org',
        siteName: settings.siteName || 'ErrorCodeWiki',
        systemPrompt: 'You are an expert AI diagnostic assistant. Output strictly valid JSON without markdown wrapping.'
      });
      jsonText = result.text;
    } catch (e) {
      console.error('Cascade suggestion error:', e);
    }

    let parsedSuggestions: any = null;
    if (jsonText) {
      try {
        let clean = jsonText.trim();
        if (clean.startsWith('```json')) clean = clean.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        if (clean.startsWith('```')) clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');
        parsedSuggestions = JSON.parse(clean);
      } catch (e) {
        console.error('JSON parse error in AI suggestions:', e);
      }
    }

    if (!parsedSuggestions) {
      parsedSuggestions = getFallbackSuggestions(errorCode);
    }

    // 1. AUTO-CREATE CATEGORY IF MISSING IN DB
    const catSlug = (parsedSuggestions.category || category || 'windows').toLowerCase().trim().replace(/[^a-z0-9_-]/g, '-');
    let categoriesList = db.getCategories();
    let targetCat = categoriesList.find(c => c.slug === catSlug);

    if (!targetCat && catSlug) {
      const friendlyCatName = catSlug
        .split(/[-_]/)
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

      targetCat = db.saveCategory({
        name: friendlyCatName,
        slug: catSlug,
        icon: 'Folder',
        description: `${friendlyCatName} error code manual and troubleshooting database`
      });
      categoriesList = db.getCategories();
    }

    // 2. AUTO-CREATE BRAND IF MISSING IN DB
    const targetBrandName = parsedSuggestions.brand || brand || 'Generic';
    const brandSlug = targetBrandName.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '-');
    let brandsList = db.getBrands();
    let targetBrand = brandsList.find(b => b.slug === brandSlug || b.name.toLowerCase() === targetBrandName.toLowerCase());

    if (!targetBrand && targetBrandName && targetBrandName !== 'Generic') {
      targetBrand = db.saveBrand({
        name: targetBrandName,
        slug: brandSlug,
        categoryId: catSlug,
        deviceTypes: [parsedSuggestions.device || 'General Device'],
        description: `${targetBrandName} hardware & software error code diagnostic solutions`
      });
      brandsList = db.getBrands();
    }

    // 3. CHECK FOR DUPLICATE / EXISTING ARTICLE FOR THIS ERROR CODE
    const allArticles = db.getArticles({ status: 'all' }).articles;
    const cleanSearchCode = errorCode.toLowerCase().replace(/[^a-z0-9]/g, '');
    const existingArticle = allArticles.find(
      a => a.errorCode.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanSearchCode
    );

    return NextResponse.json({
      success: true,
      suggestions: {
        brand: targetBrandName,
        device: parsedSuggestions.device || device || 'General Hardware',
        category: catSlug,
        keywords: parsedSuggestions.keywords || [`${errorCode} fix`, `${errorCode} error`],
        brands: parsedSuggestions.alternativeBrands || [targetBrandName, 'Microsoft', 'Canon', 'Toyota'],
        devices: parsedSuggestions.alternativeDevices || [parsedSuggestions.device || 'Device', 'Windows PC', 'Printer'],
        suggestedTitle: parsedSuggestions.suggestedTitle || `How to Fix ${errorCode} Error Code`,
        suggestedOutline: parsedSuggestions.suggestedOutline || ['Causes & Symptoms', 'Step-by-step Solution', 'FAQ']
      },
      existingArticle: existingArticle ? {
        id: existingArticle.id,
        title: existingArticle.title,
        slug: existingArticle.slug,
        status: existingArticle.status
      } : null,
      allCategories: categoriesList,
      allBrands: brandsList
    });

  } catch (err) {
    return NextResponse.json({
      success: false,
      error: err instanceof Error ? err.message : 'Failed to fetch suggestions'
    }, { status: 500 });
  }
}

