import { Article, Category, Brand, Settings } from './types';
import { supabaseAdmin } from './supabase';

function requireClient() {
  if (!supabaseAdmin) throw new Error('Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  return supabaseAdmin as any;
}

function rowToArticle(row: any): Article {
  return {
    id: row.id,
    errorCode: row.calculator_id || row.slug || row.id,
    title: row.title || '',
    slug: row.slug || row.id,
    metaTitle: row.meta_title || '',
    metaDescription: row.meta_description || '',
    shortDefinition: row.meta_description || '',
    meaning: row.content || '',
    causes: [],
    solutions: [],
    technicalExplanation: row.content || '',
    faq: [],
    schemaJsonLd: row.schema_json_ld || undefined,
    canonicalUrl: row.canonical_url || undefined,
    categoryId: row.category_id || '',
    brandId: row.calculator_id || '',
    deviceType: '',
    language: 'en',
    keywords: [],
    tags: [],
    featuredImage: row.og_image || undefined,
    status: row.status === 'draft' ? 'draft' : 'published',
    readingTime: `${row.reading_time || 1} min read`,
    internalLinks: [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    scheduledFor: row.published_at || undefined,
    viewsCount: 0,
    seoScore: undefined,
    aiGenerated: row.ai_generated ?? false,
  };
}

function rowToCategory(row: any): Category {
  return { id: row.id, name: row.name, slug: row.slug, icon: row.icon || 'FolderTree', description: row.description || '' };
}

function rowToCalculator(row: any): Brand {
  return { id: row.id, name: row.name, slug: row.slug, categoryId: row.category_id || '', deviceTypes: [], description: row.description || '' };
}

function rowToSettings(app: any, seo: any, ai: any): Settings {
  return {
    siteName: seo?.site_title || 'CalculatorFree',
    siteUrl: seo?.site_url || app?.site_url || '',
    openRouterApiKey: '',
    defaultAiModel: ai?.article_model || 'auto_cascade',
    language: 'en',
    googleAnalyticsId: app?.analytics_code || undefined,
    googleSearchConsoleTag: seo?.google_verification || undefined,
    robotsTxtContent: seo?.robots_txt || undefined,
    defaultLanguage: 'en',
    sitemapSettings: { autoUpdate: seo?.sitemap_enabled ?? true, includeImages: true },
    automationActive: ai?.ai_enabled ?? false,
    automationIntervalMinutes: 60,
    automationPublishStatus: 'published',
    automationModel: ai?.article_model || undefined,
  };
}

export async function getSupabaseArticles(params?: { status?: 'draft' | 'published' | 'all'; search?: string; categorySlug?: string; brandSlug?: string; language?: string; limit?: number; offset?: number }): Promise<{ articles: Article[]; total: number }> {
  const client = requireClient();
  const limit = Math.min(Math.max(params?.limit ?? 100, 1), 500);
  const offset = Math.max(params?.offset ?? 0, 0);
  let query = client.from('articles').select('*', { count: 'exact' }).order('updated_at', { ascending: false }).range(offset, offset + limit - 1);
  if (params?.status && params.status !== 'all') query = query.eq('status', params.status);

  if (params?.categorySlug) {
    const { data, error } = await client.from('article_categories').select('id').eq('slug', params.categorySlug.toLowerCase().trim()).limit(1).maybeSingle();
    if (error) throw error;
    if (!data) return { articles: [], total: 0 };
    query = query.eq('category_id', data.id);
  }
  if (params?.brandSlug) {
    const { data, error } = await client.from('calculators').select('id').eq('slug', params.brandSlug.toLowerCase().trim()).limit(1).maybeSingle();
    if (error) throw error;
    if (!data) return { articles: [], total: 0 };
    query = query.eq('calculator_id', data.id);
  }
  if (params?.search?.trim()) {
    const q = params.search.trim().replace(/[%(),]/g, ' ');
    query = query.or(`title.ilike.%${q}%,slug.ilike.%${q}%,content.ilike.%${q}%`);
  }
  const { data, error, count } = await query;
  if (error) throw error;
  return { articles: (data || []).map(rowToArticle), total: count || 0 };
}

export async function getSupabaseArticleBySlug(slug: string): Promise<Article | null> {
  const { data, error } = await requireClient().from('articles').select('*').eq('slug', slug.toLowerCase().trim()).limit(1).maybeSingle();
  if (error) throw error;
  return data ? rowToArticle(data) : null;
}

export async function getSupabaseCategories(): Promise<Category[]> {
  const { data, error } = await requireClient().from('article_categories').select('*').order('name');
  if (error) throw error;
  return (data || []).map(rowToCategory);
}

export async function getSupabaseCategoryBySlug(slug: string): Promise<Category | null> {
  const { data, error } = await requireClient().from('article_categories').select('*').eq('slug', slug.toLowerCase().trim()).limit(1).maybeSingle();
  if (error) throw error;
  return data ? rowToCategory(data) : null;
}

export async function getSupabaseCategoryById(id: string): Promise<Category | null> {
  if (!id) return null;
  const { data, error } = await requireClient().from('article_categories').select('*').eq('id', id).limit(1).maybeSingle();
  if (error) throw error;
  return data ? rowToCategory(data) : null;
}

export async function getSupabaseBrands(): Promise<Brand[]> {
  const { data, error } = await requireClient().from('calculators').select('*').order('name');
  if (error) throw error;
  return (data || []).map(rowToCalculator);
}

export async function getSupabaseBrandBySlug(slug: string, _language?: string): Promise<Brand | null> {
  const { data, error } = await requireClient().from('calculators').select('*').eq('slug', slug.toLowerCase().trim()).limit(1).maybeSingle();
  if (error) throw error;
  return data ? rowToCalculator(data) : null;
}

export async function getSupabaseBrandById(id: string): Promise<Brand | null> {
  if (!id) return null;
  const { data, error } = await requireClient().from('calculators').select('*').eq('id', id).limit(1).maybeSingle();
  if (error) throw error;
  return data ? rowToCalculator(data) : null;
}

export async function saveSupabaseArticle(article: Partial<Article> & { errorCode: string; title: string }): Promise<Article> {
  const client = requireClient();
  const now = new Date().toISOString();
  const payload = {
    id: article.id || `art-${Date.now()}`,
    slug: article.slug || `${article.errorCode.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
    title: article.title.trim(),
    content: article.meaning || article.technicalExplanation || article.shortDefinition || '',
    status: article.status || 'published',
    reading_time: Number.parseInt(article.readingTime || '1', 10) || 1,
    version: 1,
    meta_title: article.metaTitle || article.title,
    meta_description: article.metaDescription || article.shortDefinition || '',
    canonical_url: article.canonicalUrl || null,
    og_title: article.metaTitle || article.title,
    og_description: article.metaDescription || null,
    og_image: article.featuredImage || null,
    twitter_title: article.metaTitle || article.title,
    twitter_card: 'summary_large_image',
    schema_json_ld: article.schemaJsonLd || null,
    calculator_id: article.brandId || null,
    category_id: article.categoryId || null,
    ai_generated: article.aiGenerated ?? false,
    ai_model: null,
    ai_generated_at: article.aiGenerated ? now : null,
    created_at: article.createdAt || now,
    updated_at: now,
    published_at: article.status === 'published' ? (article.scheduledFor || now) : null,
  };
  const { data, error } = await client.from('articles').upsert(payload, { onConflict: 'id' }).select('*').single();
  if (error) throw error;
  return rowToArticle(data);
}

export async function saveSupabaseAiGenerationLog(log: { id?: string; errorCode?: string; brand?: string; device?: string; model?: string; status: 'completed' | 'failed'; articleId?: string; promptText?: string; responseSummary?: string; usage?: unknown }): Promise<void> {
  const { error } = await requireClient().from('ai_generation_logs').upsert({
    id: log.id || `ai-${Date.now()}`,
    model: log.model || null,
    prompt: log.promptText || null,
    tokens_used: typeof log.usage === 'object' && log.usage && 'tokens' in log.usage ? Number((log.usage as any).tokens) || null : null,
    cost: null,
    success: log.status === 'completed',
    error: log.status === 'failed' ? (log.responseSummary || 'AI generation failed') : null,
    task_type: log.errorCode || log.brand || 'article_generation',
    created_at: new Date().toISOString(),
  }, { onConflict: 'id' });
  if (error) throw error;
}

export async function incrementSupabaseArticleViews(_id: string): Promise<void> {
  // Article views are tracked by the aggregate analytics table.
}

export async function deleteSupabaseArticle(id: string): Promise<boolean> {
  const { error, count } = await requireClient().from('articles').delete({ count: 'exact' }).eq('id', id);
  if (error) throw error;
  return (count || 0) > 0;
}

export async function getSupabaseSettings(): Promise<Settings> {
  const client = requireClient();
  const [app, seo, ai] = await Promise.all([
    client.from('app_settings').select('*').eq('id', 'global').limit(1).maybeSingle(),
    client.from('seo_settings').select('*').eq('id', 'global').limit(1).maybeSingle(),
    client.from('ai_settings').select('*').eq('id', 'global').limit(1).maybeSingle(),
  ]);
  if (app.error) throw app.error;
  if (seo.error) throw seo.error;
  if (ai.error) throw ai.error;
  return rowToSettings(app.data, seo.data, ai.data);
}

export async function saveSupabaseSettings(settings: Partial<Settings>): Promise<Settings> {
  const client = requireClient();
  const appPayload: Record<string, unknown> = { id: 'global' };
  const seoPayload: Record<string, unknown> = { id: 'global' };
  const aiPayload: Record<string, unknown> = { id: 'global' };
  if (settings.siteUrl !== undefined) { appPayload.site_url = settings.siteUrl; seoPayload.site_url = settings.siteUrl; seoPayload.canonical_base = settings.siteUrl; }
  if (settings.siteName !== undefined) seoPayload.site_title = settings.siteName;
  if (settings.googleSearchConsoleTag !== undefined) seoPayload.google_verification = settings.googleSearchConsoleTag || null;
  if (settings.robotsTxtContent !== undefined) seoPayload.robots_txt = settings.robotsTxtContent || null;
  if (settings.sitemapSettings?.autoUpdate !== undefined) seoPayload.sitemap_enabled = settings.sitemapSettings.autoUpdate;
  if (settings.googleAnalyticsId !== undefined) appPayload.analytics_code = settings.googleAnalyticsId || null;
  if (settings.automationActive !== undefined) aiPayload.ai_enabled = settings.automationActive;
  if (settings.defaultAiModel !== undefined) aiPayload.article_model = settings.defaultAiModel;
  const writes: Promise<unknown>[] = [];
  if (Object.keys(appPayload).length > 1) writes.push(client.from('app_settings').upsert(appPayload, { onConflict: 'id' }));
  if (Object.keys(seoPayload).length > 1) writes.push(client.from('seo_settings').upsert(seoPayload, { onConflict: 'id' }));
  if (Object.keys(aiPayload).length > 1) writes.push(client.from('ai_settings').upsert(aiPayload, { onConflict: 'id' }));
  const results = await Promise.all(writes);
  for (const result of results as any[]) if (result.error) throw result.error;
  return getSupabaseSettings();
}
