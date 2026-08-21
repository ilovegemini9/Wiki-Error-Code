import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Article, Settings } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { articles, total } = db.getArticles({ status: 'all' });
    const settings = db.getSettings();
    const categories = db.getCategories();
    const brands = db.getBrands();

    return NextResponse.json({
      success: true,
      totalArticles: total,
      articles,
      settings: {
        ...settings,
        hasOpenRouterKey: !!(settings.openRouterApiKey && settings.openRouterApiKey.length > 5)
      },
      categoriesCount: categories.length,
      brandsCount: brands.length
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Sync GET failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const clientArticles: Article[] = body.articles || [];
    const clientSettings: Partial<Settings> = body.settings || {};

    let restoredArticlesCount = 0;

    if (Array.isArray(clientArticles) && clientArticles.length > 0) {
      const existing = db.getArticles({ status: 'all' }).articles;
      for (const art of clientArticles) {
        if (!art.errorCode || !art.title) continue;
        const exists = existing.some(
          e => e.id === art.id || (e.errorCode.toLowerCase() === art.errorCode.toLowerCase() && (e.language || 'en').toLowerCase() === (art.language || 'en').toLowerCase())
        );
        if (!exists) {
          db.saveArticle(art);
          restoredArticlesCount++;
        }
      }
    }

    if (clientSettings && Object.keys(clientSettings).length > 0) {
      const currentSettings = db.getSettings();
      const newSettings: Partial<Settings> = {};
      if (clientSettings.openRouterApiKey && !currentSettings.openRouterApiKey) {
        newSettings.openRouterApiKey = clientSettings.openRouterApiKey;
      }
      if (clientSettings.automationActive !== undefined && currentSettings.automationActive === undefined) {
        newSettings.automationActive = clientSettings.automationActive;
      }
      if (clientSettings.automationIntervalMinutes && !currentSettings.automationIntervalMinutes) {
        newSettings.automationIntervalMinutes = clientSettings.automationIntervalMinutes;
      }
      if (clientSettings.automationLanguages && (!currentSettings.automationLanguages || currentSettings.automationLanguages.length === 0)) {
        newSettings.automationLanguages = clientSettings.automationLanguages;
      }
      if (Object.keys(newSettings).length > 0) {
        db.saveSettings(newSettings);
      }
    }

    const { articles, total } = db.getArticles({ status: 'all' });
    const settings = db.getSettings();

    return NextResponse.json({
      success: true,
      restoredArticlesCount,
      totalArticles: total,
      articles,
      settings
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Sync POST failed' }, { status: 500 });
  }
}
