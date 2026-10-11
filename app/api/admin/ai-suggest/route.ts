import { NextRequest, NextResponse } from 'next/server';
import { getLanguageByCode } from '@/lib/languages';
import { executeWithCascadeFallback } from '@/lib/ai-service';
import { getSupabaseArticles, getSupabaseBrands, getSupabaseCategories, getSupabaseSettings } from '@/lib/supabase-db';
import { saveSupabaseBrand, saveSupabaseCategory } from '@/lib/supabase-admin';
import { getOpenRouterApiKey } from '@/lib/provider-secrets';

export const dynamic = 'force-dynamic';

const KNOWN_MANUFACTURERS = ['Nissan', 'Ford', 'Toyota', 'Honda', 'Chevrolet', 'Hyundai', 'Subaru', 'BMW', 'Mercedes-Benz', 'Volkswagen', 'Audi', 'Kia', 'Mazda', 'Lexus', 'Tesla', 'Jeep', 'Dodge', 'Chrysler', 'Ram', 'Volvo', 'Microsoft', 'Apple', 'Google', 'Samsung', 'Sony', 'HP', 'Canon', 'Epson', 'Bosch', 'Whirlpool', 'LG', 'Nintendo', 'Xbox', 'PlayStation', 'Nginx', 'Cloudflare'];

function sanitizeTitle(value: unknown, selectedBrand: string): string {
  let title = String(value ?? '').trim();
  const selected = selectedBrand.toLowerCase().trim();
  if (!title || !selected) return title;
  for (const manufacturer of KNOWN_MANUFACTURERS) {
    if (manufacturer.toLowerCase() === selected) continue;
    const escaped = manufacturer.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    title = title.replace(new RegExp(`\\b${escaped}\\b(?:\\s+(?:vehicles?|cars?|systems?|devices?))?`, 'gi'), ' ');
  }
  return title.replace(/\s{2,}/g, ' ').replace(/\s+(?:and|or|&)\s*([,.;]|$)/gi, '$1').replace(/\s+([,:;])/g, '$1').trim();
}

function fallback(code: string, requestedBrand = '', requestedDevice = '', requestedCategory = '') {
  const c = code.toLowerCase().trim();
  let brand = requestedBrand || 'Generic', device = requestedDevice || 'General Device', category = requestedCategory || 'software';
  let keywords = [`${code} fix`, `${code} error code`, 'troubleshooting', 'error manual'];
  if (/^p\d{4}$/.test(c) || /^(b|c|u)\d{4}$/.test(c)) { brand = requestedBrand || 'Toyota'; device = requestedDevice || 'Vehicle Engine ECU / OBD-II Scanner'; category = 'automotive'; keywords = [`${code} obd2`, `${code} engine light`, 'diagnostic trouble code', 'car repair']; }
  else if (/^0x87e|^0x8027025a|^e10[0-9]|^ce-|^su-|^ws-|^2168-/.test(c)) { brand = requestedBrand || 'Microsoft Xbox'; device = requestedDevice || 'Gaming Console'; category = 'gaming'; keywords = [`${code} console error`, 'game launch fix', 'system update', 'console troubleshooting']; }
  else if (/^e-|paper|ink|^50\.|^79$|^5100$|^b200$|^0x97$|^0x9a$/.test(c)) { brand = requestedBrand || 'Epson'; device = requestedDevice || 'InkJet / Laser Printer'; category = 'printers'; keywords = [`${code} printer error`, 'paper jam fix', 'printer offline', 'maintenance reset']; }
  else if (/^(e24|e15|f21|f06|oe|le|4e|5e|e4)$/.test(c)) { brand = requestedBrand || 'Samsung'; device = requestedDevice || 'Dishwasher / Washing Machine'; category = 'appliances'; keywords = [`${code} appliance error`, 'drain pump error', 'water supply code', 'reset cycle']; }
  else if (/^err_|^net::err_|^dns_probe_|^(500|401|403|404|429|502|503|504)(_|$)|econnreset|enotfound|sqlstate/.test(c)) { brand = requestedBrand || 'Google Chrome'; device = requestedDevice || 'Web Browser / Server'; category = 'software'; keywords = [`${code} server error`, 'http status code', 'connection refused', 'dns fix']; }
  else if (/^0x|critical_process_died|inaccessible_boot_device|whea_uncorrectable_error/.test(c)) { brand = requestedBrand || 'Microsoft'; device = requestedDevice || 'Windows 11 PC'; category = 'windows'; }
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
    const model = String(body.model || 'auto_cascade');
    const langObj = getLanguageByCode(language);
    const settings = await getSupabaseSettings();
    const openRouterApiKey = await getOpenRouterApiKey();
    let suggestion: any = fallback(errorCode, brand, device, category);

    if (errorCode) {
      try {
        const result = await executeWithCascadeFallback({
          prompt: `Given technical error code "${errorCode}" with Brand "${brand}" and Device "${device}", return only JSON with brand, device, category, keywords, alternativeBrands, alternativeDevices, suggestedTitle, suggestedOutline. All text should be native ${langObj.englishName}. Never use placeholders. The supplied Brand, Device, and Category are authoritative. Do not add other manufacturers to suggestedTitle. Outline items must not include manual numbering prefixes.`,
          temperature: 0.3, selectedModel: model, openRouterApiKey,
          siteUrl: settings.siteUrl || 'https://errorcodewiki.org', siteName: settings.siteName || 'ErrorCodeWiki',
          systemPrompt: 'You are an expert diagnostic assistant. Output strict JSON only.'
        });
        const clean = result.text.trim().replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
        const aiSuggestion = JSON.parse(clean);
        if (Array.isArray(aiSuggestion.suggestedOutline)) {
          aiSuggestion.suggestedOutline = aiSuggestion.suggestedOutline.map((item: unknown) => String(item ?? '').replace(/^\s*\d+[.)]\s*/, '').trim());
        }
        aiSuggestion.suggestedTitle = sanitizeTitle(aiSuggestion.suggestedTitle, brand);
        suggestion = {
          ...suggestion,
          ...aiSuggestion,
          brand: brand.trim() || aiSuggestion.brand || suggestion.brand,
          device: device.trim() || aiSuggestion.device || suggestion.device,
          category: category.trim() || aiSuggestion.category || suggestion.category,
        };
      } catch (e) { console.error('AI suggestion fallback:', e); }
    }

    suggestion.suggestedTitle = sanitizeTitle(suggestion.suggestedTitle, brand || suggestion.brand || '');
    const catSlug = String(suggestion.category || category || 'windows').toLowerCase().trim().replace(/[^a-z0-9_-]/g, '-');
    let categories = await getSupabaseCategories();
    let targetCat = categories.find(c => c.slug === catSlug);
    if (!targetCat) {
      const name = catSlug.split(/[-_]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      targetCat = await saveSupabaseCategory({ name, slug: catSlug, icon: 'Folder', description: `${name} error code manual and troubleshooting database` });
      categories = [...categories, targetCat];
    }

    const splitBrandNames = (value: unknown): string[] => {
      const values = Array.isArray(value) ? value : [value];
      return values.flatMap(item => String(item || '').split(/\s*(?:\/|,|\||;|\s+&\s+|\s+or\s+)\s*/i))
        .map(name => name.trim().replace(/^['"]|['"]$/g, ''))
        .filter(name => name.length > 1 && name.toLowerCase() !== 'generic');
    };
    const primaryBrandCandidates = splitBrandNames(suggestion.brand || brand || 'Generic');
    const targetBrandName = primaryBrandCandidates[0] || String(brand || 'Generic');
    const suggestedBrandNames = Array.from(new Set([...primaryBrandCandidates, ...splitBrandNames(suggestion.alternativeBrands || suggestion.brands)]));
    let brands = await getSupabaseBrands();
    for (const brandName of suggestedBrandNames) {
      const brandSlug = brandName.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      const existingBrand = brands.find(b => b.slug === brandSlug || b.name.toLowerCase() === brandName.toLowerCase());
      if (!existingBrand && brandSlug) {
        try {
          const savedBrand = await saveSupabaseBrand({ name: brandName, slug: brandSlug, categoryId: targetCat.id, deviceTypes: [suggestion.device || device || 'General Device'], description: brandName + ' diagnostic solutions' });
          brands = [...brands, savedBrand];
        } catch (brandSaveError) {
          console.error('Could not auto-save suggested brand:', brandName, brandSaveError);
        }
      }
    }

    const { articles } = await getSupabaseArticles({ status: 'all', limit: 500 });
    const cleanCode = errorCode.toLowerCase().replace(/[^a-z0-9]/g, '');
    const existingArticle = errorCode ? articles.find(a => a.errorCode.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanCode) : null;

    return NextResponse.json({
      success: true,
      suggestions: { brand: targetBrandName, device: suggestion.device || device || 'General Hardware', category: catSlug, keywords: suggestion.keywords || [`${errorCode} fix`, `${errorCode} error`], brands: Array.from(new Set([...splitBrandNames(suggestion.alternativeBrands || suggestion.brands), ...suggestedBrandNames])), devices: suggestion.alternativeDevices || suggestion.devices, suggestedTitle: suggestion.suggestedTitle, suggestedOutline: suggestion.suggestedOutline },
      existingArticle: existingArticle ? { id: existingArticle.id, title: existingArticle.title, slug: existingArticle.slug, status: existingArticle.status } : null,
      allCategories: categories,
      allBrands: brands,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Failed to fetch suggestions' }, { status: 500 });
  }
}
