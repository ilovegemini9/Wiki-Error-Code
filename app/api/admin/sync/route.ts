import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticatedAdmin } from '@/lib/auth';
import { Article, Settings } from '@/lib/types';
import { getSupabaseArticles, getSupabaseBrands, getSupabaseCategories, getSupabaseSettings, saveSupabaseArticle, saveSupabaseSettings } from '@/lib/supabase-db';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await isAuthenticatedAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const [{ articles, total }, settings, categories, brands] = await Promise.all([
      getSupabaseArticles({ status: 'all' }), getSupabaseSettings(), getSupabaseCategories(), getSupabaseBrands()
    ]);
    return NextResponse.json({ success: true, totalArticles: total, articles, settings: { ...settings, openRouterApiKey: undefined, hasOpenRouterKey: !!settings.openRouterApiKey }, categoriesCount: categories.length, brandsCount: brands.length });
  } catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : 'Sync GET failed' }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticatedAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    const clientArticles: Article[] = Array.isArray(body.articles) ? body.articles : [];
    const clientSettings: Partial<Settings> = body.settings && typeof body.settings === 'object' ? body.settings : {};
    const existing = (await getSupabaseArticles({ status: 'all' })).articles;
    let restoredArticlesCount = 0;

    for (const art of clientArticles) {
      if (!art.errorCode || !art.title) continue;
      const exists = existing.some(e => e.id === art.id || (e.errorCode.toLowerCase() === art.errorCode.toLowerCase() && (e.language || 'en').toLowerCase() === (art.language || 'en').toLowerCase()));
      if (!exists) { await saveSupabaseArticle(art); restoredArticlesCount++; }
    }

    const currentSettings = await getSupabaseSettings();
    const newSettings: Partial<Settings> = {};
    if (clientSettings.openRouterApiKey && !currentSettings.openRouterApiKey) newSettings.openRouterApiKey = clientSettings.openRouterApiKey;
    if (clientSettings.automationActive !== undefined && currentSettings.automationActive === undefined) newSettings.automationActive = clientSettings.automationActive;
    if (clientSettings.automationIntervalMinutes && !currentSettings.automationIntervalMinutes) newSettings.automationIntervalMinutes = clientSettings.automationIntervalMinutes;
    if (clientSettings.automationLanguages?.length && !currentSettings.automationLanguages?.length) newSettings.automationLanguages = clientSettings.automationLanguages;
    if (Object.keys(newSettings).length) await saveSupabaseSettings(newSettings);

    const [{ articles, total }, settings] = await Promise.all([getSupabaseArticles({ status: 'all' }), getSupabaseSettings()]);
    return NextResponse.json({ success: true, restoredArticlesCount, totalArticles: total, articles, settings: { ...settings, openRouterApiKey: undefined, hasOpenRouterKey: !!settings.openRouterApiKey } });
  } catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : 'Sync POST failed' }, { status: 500 }); }
}
