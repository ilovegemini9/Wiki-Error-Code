import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticatedAdmin } from '@/lib/auth';
import { getLanguageByCode } from '@/lib/languages';
import { executeWithCascadeFallback } from '@/lib/ai-service';
import { getSupabaseArticles, getSupabaseBrands, getSupabaseCategories, getSupabaseSettings } from '@/lib/supabase-db';
import { saveSupabaseBrand, saveSupabaseCategory } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

function fallback(code: string) {
  const c = code.toLowerCase().trim();
  let brand = 'Microsoft', device = 'Windows 11 PC', category = 'windows';
  let keywords = [`${code} fix`, `${code} error code`, 'troubleshooting', 'error manual'];
  if (/^(p0|p1|b0|c0)/.test(c)) { brand = 'Toyota / General Motors'; device = 'Vehicle Engine ECU / OBD-II Scanner'; category = 'automotive'; keywords = [`${code} obd2`, `${code} engine light`, 'diagnostic trouble code', 'car repair']; }
  else if (/^e-|paper|ink|^50\.|^e2/.test(c)) { brand = 'Epson / Canon / HP'; device = 'InkJet / Laser Printer'; category = 'printers'; keywords = [`${code} printer error`, 'paper jam fix', 'printer offline', 'maintenance reset']; }
  else if (/^(ce-|su-|ws-)|e82/.test(c)) { brand = 'Sony PlayStation'; device = 'PlayStation 5 / PS4 Console'; category = 'gaming'; keywords = [`${code} ps5 error`, 'playstation network fix', 'game crash', 'system software update']; }
  else if (/^(e24|e15|f21|oe)/.test(c)) { brand = 'Bosch / Whirlpool / Samsung'; device = 'Dishwasher / Washing Machine'; category = 'appliances'; keywords = [`${code} appliance error`, 'drain pump error', 'water supply code', 'reset cycle']; }
  else if (/^err_|500|404|502/.test(c)) { brand = 'Google Chrome / Nginx / Apache'; device = 'Web Server / Chrome Browser'; category = 'software'; keywords = [`${code} server error`, 'http status code', 'connection refused', 'dns fix']; }
  return { brand, device, category, keywords, brands: [brand, 'Microsoft', 'Apple', 'HP', 'Canon'], devices: [device, 'Windows 11 PC', 'PS5 Console', 'OBD-II Scanner', 'Printer'], suggestedTitle: code ? `How to Fix ${code} Error Code (${brand} ${device})` : 'Diagnostic Troubleshooting Manual', suggestedOutline: ['Symptoms & Meaning', 'Quick Fix Checklist', 'Advanced Step-by-Step Solution', 'Preventive Maintenance'] };
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticatedAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    const errorCode = String(body.errorCode || '').trim();
    const brand = String(body.brand || '');
    const device = String(body.device || '');
    const category = String(body.category || '');
    const language = String(body.language || 'en');
    const model = String(body.model || 'nvidia/nemotron-3-ultra:free');
    const langObj = getLanguageByCode(language);
    const settings = await getSupabaseSettings();
    let suggestion: any = fallback(errorCode);

    if (errorCode) {
      try {
        const result = await executeWithCascadeFallback({
          prompt: `Given technical error code "${errorCode}" with Brand "${brand}" and Device "${device}", return only JSON with brand, device, category, keywords, alternativeBrands, alternativeDevices, suggestedTitle, suggestedOutline. All text should be native ${langObj.englishName}. Never use placeholders.`,
          temperature: 0.3, selectedModel: model, openRouterApiKey: process.env.OPENROUTER_API_KEY,
          siteUrl: settings.siteUrl || 'https://errorcodewiki.org', siteName: settings.siteName || 'ErrorCodeWiki',
          systemPrompt: 'You are an expert diagnostic assistant. Output strict JSON only.'
        });
        const clean = result.text.trim().replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
        suggestion = { ...suggestion, ...JSON.parse(clean) };
      } catch (e) { console.error('AI suggestion fallback:', e); }
    }

    const catSlug = String(suggestion.category || category || 'windows').toLowerCase().trim().replace(/[^a-z0-9_-]/g, '-');
    let categories = await getSupabaseCategories();
    let targetCat = categories.find(c => c.slug === catSlug);
    if (!targetCat) {
      const name = catSlug.split(/[-_]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      targetCat = await saveSupabaseCategory({ name, slug: catSlug, icon: 'Folder', description: `${name} error code manual and troubleshooting database` });
      categories = [...categories, targetCat];
    }

    const targetBrandName = String(suggestion.brand || brand || 'Generic');
    const brandSlug = targetBrandName.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '-');
    let brands = await getSupabaseBrands();
    let targetBrand = brands.find(b => b.slug === brandSlug || b.name.toLowerCase() === targetBrandName.toLowerCase());
    if (!targetBrand && targetBrandName !== 'Generic') {
      targetBrand = await saveSupabaseBrand({ name: targetBrandName, slug: brandSlug, categoryId: targetCat.id, deviceTypes: [suggestion.device || 'General Device'], description: `${targetBrandName} diagnostic solutions` });
      brands = [...brands, targetBrand];
    }

    const { articles } = await getSupabaseArticles({ status: 'all', limit: 500 });
    const cleanCode = errorCode.toLowerCase().replace(/[^a-z0-9]/g, '');
    const existingArticle = errorCode ? articles.find(a => a.errorCode.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanCode) : null;

    return NextResponse.json({
      success: true,
      suggestions: { brand: targetBrandName, device: suggestion.device || device || 'General Hardware', category: catSlug, keywords: suggestion.keywords || [`${errorCode} fix`, `${errorCode} error`], brands: suggestion.alternativeBrands || suggestion.brands, devices: suggestion.alternativeDevices || suggestion.devices, suggestedTitle: suggestion.suggestedTitle, suggestedOutline: suggestion.suggestedOutline },
      existingArticle: existingArticle ? { id: existingArticle.id, title: existingArticle.title, slug: existingArticle.slug, status: existingArticle.status } : null,
      allCategories: categories,
      allBrands: brands,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Failed to fetch suggestions' }, { status: 500 });
  }
}
