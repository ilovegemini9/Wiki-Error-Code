import { Article, Category, Brand, Settings } from './types';
import { supabaseAdmin } from './supabase';

function requireClient() {
  if (!supabaseAdmin) throw new Error('Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  return supabaseAdmin as any;
}
function normalizeLanguage(language?: string): string | null { if (!language || language === 'all') return null; return language.toLowerCase().trim().split('-')[0]; }
function rowToArticle(row: any): Article { return { id: row.id, errorCode: row.error_code, title: row.title, slug: row.slug, metaTitle: row.meta_title || '', metaDescription: row.meta_description || '', shortDefinition: row.short_definition || '', meaning: row.meaning || '', causes: row.causes || [], solutions: row.solutions || [], technicalExplanation: row.technical_explanation || '', faq: row.faq || [], schemaJsonLd: row.schema_jsonld || undefined, canonicalUrl: row.canonical_url || undefined, categoryId: row.category_id || '', brandId: row.brand_id || '', deviceType: row.device_type || '', language: row.language || 'en', keywords: row.keywords || [], tags: row.tags || [], featuredImage: row.featured_image || undefined, status: row.status === 'draft' ? 'draft' : 'published', readingTime: row.reading_time || '3 min read', internalLinks: row.internal_links || [], createdAt: row.created_at, updatedAt: row.updated_at, scheduledFor: row.scheduled_for || undefined, viewsCount: row.views_count || 0, seoScore: row.seo_score ?? undefined, aiGenerated: row.ai_generated ?? false }; }
function rowToCategory(row: any): Category { return { id: row.id, name: row.name, slug: row.slug, icon: row.icon || 'BookOpen', description: row.description || '', language: row.language || undefined }; }
function rowToBrand(row: any): Brand { return { id: row.id, name: row.name, slug: row.slug, logoUrl: row.logo_url || undefined, categoryId: row.category_id || '', deviceTypes: row.device_types || [], description: row.description || '', language: row.language || undefined }; }

function rowToSettings(app: any, seo: any, ai: any): Settings {
  return {
    siteName: seo?.site_title || 'CalculatorFree', siteUrl: seo?.site_url || app?.site_url || '', openRouterApiKey: '',
    defaultAiModel: ai?.article_model || 'auto_cascade', language: 'en',
    googleAnalyticsId: app?.analytics_code || undefined, googleSearchConsoleTag: seo?.google_verification || undefined,
    adsTxtContent: undefined, robotsTxtContent: seo?.robots_txt || undefined, defaultLanguage: 'en',
    sitemapSettings: { autoUpdate: seo?.sitemap_enabled ?? true, includeImages: true },
    automationActive: ai?.ai_enabled ?? false, automationIntervalMinutes: 60,
    automationPublishStatus: 'published', automationModel: ai?.article_model || undefined,
  };
}

export async function getSupabaseArticles(params?: { status?: 'draft' | 'published' | 'all'; search?: string; categorySlug?: string; brandSlug?: string; language?: string; limit?: number; offset?: number }): Promise<{ articles: Article[]; total: number }> {
  const client = requireClient(); const limit = Math.min(Math.max(params?.limit ?? 100, 1), 500); const offset = Math.max(params?.offset ?? 0, 0);
  let query = client.from('articles').select('*', { count: 'exact' }).order('updated_at', { ascending: false }).range(offset, offset + limit - 1); const lang = normalizeLanguage(params?.language);
  if (params?.status && params.status !== 'all') query = query.eq('status', params.status); if (lang) query = query.eq('language', lang);
  if (params?.categorySlug) { let q = client.from('categories').select('id').eq('slug', params.categorySlug.toLowerCase().trim()); if (lang) q = q.eq('language', lang); const { data, error } = await q.limit(1).maybeSingle(); if (error) throw error; if (!data) return { articles: [], total: 0 }; query = query.eq('category_id', data.id); }
  if (params?.brandSlug) { let q = client.from('brands').select('id').eq('slug', params.brandSlug.toLowerCase().trim()); if (lang) q = q.eq('language', lang); const { data, error } = await q.limit(1).maybeSingle(); if (error) throw error; if (!data) return { articles: [], total: 0 }; query = query.eq('brand_id', data.id); }
  if (params?.search?.trim()) { const q = params.search.trim().replace(/[%(),]/g, ' '); query = query.or(`error_code.ilike.%${q}%,title.ilike.%${q}%,slug.ilike.%${q}%`); }
  const { data, error, count } = await query; if (error) throw error; return { articles: (data || []).map(rowToArticle), total: count || 0 };
}
export async function getSupabaseArticleBySlug(slug: string, language?: string): Promise<Article | null> { let q = requireClient().from('articles').select('*').eq('slug', slug.toLowerCase().trim()); const lang = normalizeLanguage(language); if (lang) q = q.eq('language', lang); const { data, error } = await q.limit(1).maybeSingle(); if (error) throw error; return data ? rowToArticle(data) : null; }
export async function getSupabaseCategories(language?: string): Promise<Category[]> { const rows = await requireClient().from('categories').select('*').order('name'); if (rows.error) throw rows.error; const lang = normalizeLanguage(language); return (rows.data || []).filter((r: any) => !lang || !r.language || normalizeLanguage(r.language) === lang).map(rowToCategory); }
export async function getSupabaseCategoryBySlug(slug: string, language = 'en'): Promise<Category | null> { const client = requireClient(); let q = client.from('categories').select('*').eq('slug', slug.toLowerCase().trim()); const lang = normalizeLanguage(language); if (lang) q = q.eq('language', lang); const { data, error } = await q.limit(1).maybeSingle(); if (error) throw error; return data ? rowToCategory(data) : null; }
export async function getSupabaseCategoryById(id: string): Promise<Category | null> { if (!id) return null; const { data, error } = await requireClient().from('categories').select('*').eq('id', id).limit(1).maybeSingle(); if (error) throw error; return data ? rowToCategory(data) : null; }
export async function getSupabaseBrands(language?: string): Promise<Brand[]> { const rows = await requireClient().from('brands').select('*').order('name'); if (rows.error) throw rows.error; const lang = normalizeLanguage(language); return (rows.data || []).filter((r: any) => !lang || !r.language || normalizeLanguage(r.language) === lang).map(rowToBrand); }
export async function getSupabaseBrandBySlug(slug: string, language = 'en'): Promise<Brand | null> { const client = requireClient(); let q = client.from('brands').select('*').eq('slug', slug.toLowerCase().trim()); const lang = normalizeLanguage(language); if (lang) q = q.eq('language', lang); const { data, error } = await q.limit(1).maybeSingle(); if (error) throw error; return data ? rowToBrand(data) : null; }
export async function getSupabaseBrandById(id: string): Promise<Brand | null> { if (!id) return null; const { data, error } = await requireClient().from('brands').select('*').eq('id', id).limit(1).maybeSingle(); if (error) throw error; return data ? rowToBrand(data) : null; }

export async function saveSupabaseArticle(article: Partial<Article> & { errorCode: string; title: string }): Promise<Article> { const client = requireClient(); const now = new Date().toISOString(); const language = normalizeLanguage(article.language) || 'en'; const payload = { id: article.id || `art-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, error_code: article.errorCode.trim(), title: article.title, slug: article.slug || `${(article.brandId || 'error').toLowerCase()}-${article.errorCode.toLowerCase().replace(/[^a-z0-9_-]/g, '-')}${language === 'en' ? '' : `-${language}`}`, meta_title: article.metaTitle || `${article.title} - Fix Guide`, meta_description: article.metaDescription || article.shortDefinition || `Learn how to fix ${article.errorCode}.`, short_definition: article.shortDefinition || null, meaning: article.meaning || null, causes: article.causes || [], solutions: article.solutions || [], technical_explanation: article.technicalExplanation || null, faq: article.faq || [], schema_jsonld: article.schemaJsonLd || null, canonical_url: article.canonicalUrl || null, category_id: article.categoryId || null, brand_id: article.brandId || null, device_type: article.deviceType || null, language, keywords: article.keywords || [], tags: article.tags || [], featured_image: article.featuredImage || null, status: article.status || 'published', reading_time: article.readingTime || '3 min read', internal_links: article.internalLinks || [], created_at: article.createdAt || now, updated_at: now, scheduled_for: article.scheduledFor || null, views_count: article.viewsCount || 0, seo_score: article.seoScore ?? null, ai_generated: article.aiGenerated ?? false }; const { data, error } = await client.from('articles').upsert(payload, { onConflict: 'id' }).select('*').single(); if (error) throw error; return rowToArticle(data); }
export async function saveSupabaseAiGenerationLog(log: { id?: string; errorCode?: string; brand?: string; device?: string; model?: string; status: 'completed' | 'failed'; articleId?: string; promptText?: string; responseSummary?: string; usage?: unknown }): Promise<void> { const { error } = await requireClient().from('ai_generation_logs').upsert({ id: log.id || `ai-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, error_code: log.errorCode || null, brand: log.brand || null, device: log.device || null, model: log.model || null, status: log.status, article_id: log.articleId || null, prompt_text: log.promptText || null, response_summary: log.responseSummary || null, usage: log.usage || null }, { onConflict: 'id' }); if (error) throw error; }
export async function incrementSupabaseArticleViews(id: string): Promise<void> { const { error } = await requireClient().rpc('increment_article_views', { article_id: id }); if (error) throw error; }
export async function deleteSupabaseArticle(id: string): Promise<boolean> { const { error, count } = await requireClient().from('articles').delete({ count: 'exact' }).eq('id', id); if (error) throw error; return (count || 0) > 0; }

export async function getSupabaseSettings(): Promise<Settings> {
  const client = requireClient();
  const [app, seo, ai] = await Promise.all([
    client.from('app_settings').select('*').eq('id', 'global').limit(1).maybeSingle(),
    client.from('seo_settings').select('*').eq('id', 'global').limit(1).maybeSingle(),
    client.from('ai_settings').select('*').eq('id', 'global').limit(1).maybeSingle(),
  ]);
  if (app.error) throw app.error; if (seo.error) throw seo.error; if (ai.error) throw ai.error;
  return rowToSettings(app.data, seo.data, ai.data);
}

export async function saveSupabaseSettings(settings: Partial<Settings>): Promise<Settings> {
  const client = requireClient();
  const appPayload: Record<string, unknown> = { id: 'global' };
  const seoPayload: Record<string, unknown> = { id: 'global' };
  const aiPayload: Record<string, unknown> = { id: 'global' };
  if (settings.siteUrl !== undefined) { appPayload.site_url = settings.siteUrl; seoPayload.site_url = settings.siteUrl; seoPayload.canonical_base = settings.siteUrl; }
  if (settings.siteName !== undefined) seoPayload.site_title = settings.siteName;
  if (settings.googleAnalyticsId !== undefined) appPayload.analytics_code = settings.googleAnalyticsId;
  if (settings.googleSearchConsoleTag !== undefined) seoPayload.google_verification = settings.googleSearchConsoleTag;
  if (settings.robotsTxtContent !== undefined) seoPayload.robots_txt = settings.robotsTxtContent;
  if (settings.defaultAiModel !== undefined) aiPayload.article_model = settings.defaultAiModel;
  if (settings.automationActive !== undefined) aiPayload.ai_enabled = settings.automationActive;
  const writes: Promise<unknown>[] = [];
  if (Object.keys(appPayload).length > 1) writes.push(client.from('app_settings').upsert(appPayload, { onConflict: 'id' }));
  if (Object.keys(seoPayload).length > 1) writes.push(client.from('seo_settings').upsert(seoPayload, { onConflict: 'id' }));
  if (Object.keys(aiPayload).length > 1) writes.push(client.from('ai_settings').upsert(aiPayload, { onConflict: 'id' }));
  const results = await Promise.all(writes);
  for (const result of results as any[]) if (result.error) throw result.error;
  return getSupabaseSettings();
}
