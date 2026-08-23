import { Article, Category, Brand, Settings } from './types';
import { supabaseAdmin } from './supabase';

/** Server-side Supabase data access layer. Never import this from client components. */
function requireClient() {
  if (!supabaseAdmin) throw new Error('Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  return supabaseAdmin;
}

function rowToArticle(row: any): Article {
  return {
    id: row.id,
    errorCode: row.error_code,
    title: row.title,
    slug: row.slug,
    metaTitle: row.meta_title || '',
    metaDescription: row.meta_description || '',
    shortDefinition: row.short_definition || '',
    meaning: row.meaning || '',
    causes: row.causes || [],
    solutions: row.solutions || [],
    technicalExplanation: row.technical_explanation || '',
    faq: row.faq || [],
    schemaJsonLd: row.schema_jsonld || undefined,
    canonicalUrl: row.canonical_url || undefined,
    categoryId: row.category_id || '',
    brandId: row.brand_id || '',
    deviceType: row.device_type || '',
    language: row.language || 'en',
    keywords: row.keywords || [],
    tags: row.tags || [],
    featuredImage: row.featured_image || undefined,
    status: row.status === 'draft' ? 'draft' : 'published',
    readingTime: row.reading_time || '3 min read',
    internalLinks: row.internal_links || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    scheduledFor: row.scheduled_for || undefined,
    viewsCount: row.views_count || 0,
    seoScore: row.seo_score ?? undefined,
    aiGenerated: row.ai_generated ?? false,
  };
}

function rowToCategory(row: any): Category {
  return { id: row.id, name: row.name, slug: row.slug, icon: row.icon || 'BookOpen', description: row.description || '', language: row.language || undefined };
}

function rowToBrand(row: any): Brand {
  return { id: row.id, name: row.name, slug: row.slug, logoUrl: row.logo_url || undefined, categoryId: row.category_id || '', deviceTypes: row.device_types || [], description: row.description || '', language: row.language || undefined };
}

function rowToSettings(row: any): Settings {
  return {
    siteName: row.site_name || '',
    siteUrl: row.site_url || '',
    // Secrets are intentionally never read from or returned by Supabase.
    openRouterApiKey: '',
    defaultAiModel: row.default_ai_model || '',
    language: row.language || 'en',
    logoUrl: row.logo_url || undefined,
    faviconUrl: row.favicon_url || undefined,
    googleAnalyticsId: row.google_analytics_id || undefined,
    googleSearchConsoleTag: row.google_search_console_tag || undefined,
    googleSearchConsoleMeta: row.google_search_console_meta || undefined,
    adsTxtContent: row.ads_txt_content || undefined,
    robotsTxtContent: row.robots_txt_content || undefined,
    defaultLanguage: row.default_language || undefined,
    sitemapSettings: row.sitemap_settings || undefined,
    automationActive: row.automation_active ?? undefined,
    automationIntervalMinutes: row.automation_interval_minutes ?? undefined,
    automationLanguages: row.automation_languages || undefined,
    automationPublishStatus: row.automation_publish_status || undefined,
    automationModel: row.automation_model || undefined,
    lastAutomationRunTime: row.last_automation_run_time || undefined,
    automationCount: row.automation_count ?? undefined,
    automationLogs: row.automation_logs || undefined,
  };
}

export async function getSupabaseArticles(params?: { status?: 'draft' | 'published' | 'all'; search?: string; categorySlug?: string; brandSlug?: string; language?: string; limit?: number; offset?: number }): Promise<{ articles: Article[]; total: number }> {
  const client = requireClient();
  const limit = Math.min(Math.max(params?.limit ?? 100, 1), 500);
  const offset = Math.max(params?.offset ?? 0, 0);
  let query = client.from('articles').select('*', { count: 'exact' }).order('updated_at', { ascending: false }).range(offset, offset + limit - 1);
  if (params?.status && params.status !== 'all') query = query.eq('status', params.status);
  if (params?.language && params.language !== 'all') query = query.eq('language', params.language.toLowerCase().trim().split('-')[0]);
  if (params?.categorySlug) {
    const { data, error } = await client.from('categories').select('id').eq('slug', params.categorySlug).maybeSingle();
    if (error) throw error;
    if (data) query = query.eq('category_id', data.id);
  }
  if (params?.brandSlug) {
    const { data, error } = await client.from('brands').select('id').eq('slug', params.brandSlug).maybeSingle();
    if (error) throw error;
    if (data) query = query.eq('brand_id', data.id);
  }
  if (params?.search?.trim()) {
    const q = params.search.trim().replace(/[%(),]/g, ' ');
    query = query.or(`error_code.ilike.%${q}%,title.ilike.%${q}%,slug.ilike.%${q}%`);
  }
  const { data, error, count } = await query;
  if (error) throw error;
  return { articles: (data || []).map(rowToArticle), total: count || 0 };
}

export async function getSupabaseArticleBySlug(slug: string): Promise<Article | null> {
  const { data, error } = await requireClient().from('articles').select('*').eq('slug', slug.toLowerCase().trim()).maybeSingle();
  if (error) throw error;
  return data ? rowToArticle(data) : null;
}

export async function getSupabaseCategories(language?: string): Promise<Category[]> {
  const { data, error } = await requireClient().from('categories').select('*').order('name');
  if (error) throw error;
  const lang = language && language !== 'all' ? language.toLowerCase().trim().split('-')[0] : null;
  return (data || []).filter((r: any) => !lang || !r.language || r.language.toLowerCase().split('-')[0] === lang).map(rowToCategory);
}

export async function getSupabaseCategoryBySlug(slug: string): Promise<Category | null> {
  const { data, error } = await requireClient().from('categories').select('*').eq('slug', slug.toLowerCase().trim()).maybeSingle();
  if (error) throw error;
  return data ? rowToCategory(data) : null;
}

export async function getSupabaseBrands(language?: string): Promise<Brand[]> {
  const { data, error } = await requireClient().from('brands').select('*').order('name');
  if (error) throw error;
  const lang = language && language !== 'all' ? language.toLowerCase().trim().split('-')[0] : null;
  return (data || []).filter((r: any) => !lang || !r.language || r.language.toLowerCase().split('-')[0] === lang).map(rowToBrand);
}

export async function getSupabaseBrandBySlug(slug: string): Promise<Brand | null> {
  const { data, error } = await requireClient().from('brands').select('*').eq('slug', slug.toLowerCase().trim()).maybeSingle();
  if (error) throw error;
  return data ? rowToBrand(data) : null;
}

export async function saveSupabaseArticle(article: Partial<Article> & { errorCode: string; title: string }): Promise<Article> {
  const client = requireClient();
  const now = new Date().toISOString();
  const language = (article.language || 'en').toLowerCase().trim().split('-')[0];
  const payload = {
    id: article.id || `art-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    error_code: article.errorCode.trim(),
    title: article.title,
    slug: article.slug || `${(article.brandId || 'error').toLowerCase()}-${article.errorCode.toLowerCase().replace(/[^a-z0-9_-]/g, '-')}${language === 'en' ? '' : `-${language}`}`,
    meta_title: article.metaTitle || `${article.title} - Fix Guide`,
    meta_description: article.metaDescription || article.shortDefinition || `Learn how to fix ${article.errorCode}.`,
    short_definition: article.shortDefinition || null,
    meaning: article.meaning || null,
    causes: article.causes || [],
    solutions: article.solutions || [],
    technical_explanation: article.technicalExplanation || null,
    faq: article.faq || [],
    schema_jsonld: article.schemaJsonLd || null,
    canonical_url: article.canonicalUrl || null,
    category_id: article.categoryId || null,
    brand_id: article.brandId || null,
    device_type: article.deviceType || null,
    language,
    keywords: article.keywords || [],
    tags: article.tags || [],
    featured_image: article.featuredImage || null,
    status: article.status || 'published',
    reading_time: article.readingTime || '3 min read',
    internal_links: article.internalLinks || [],
    created_at: article.createdAt || now,
    updated_at: now,
    scheduled_for: article.scheduledFor || null,
    views_count: article.viewsCount || 0,
    seo_score: article.seoScore ?? null,
    ai_generated: article.aiGenerated ?? false,
  };
  const { data, error } = await client.from('articles').upsert(payload, { onConflict: 'id' }).select('*').single();
  if (error) throw error;
  return rowToArticle(data);
}

export async function incrementSupabaseArticleViews(id: string): Promise<void> {
  const { error } = await requireClient().rpc('increment_article_views', { article_id: id });
  if (error) throw error;
}

export async function deleteSupabaseArticle(id: string): Promise<boolean> {
  const { error, count } = await requireClient().from('articles').delete({ count: 'exact' }).eq('id', id);
  if (error) throw error;
  return (count || 0) > 0;
}

export async function getSupabaseSettings(): Promise<Settings> {
  const { data, error } = await requireClient().from('global_settings').select('*').eq('id', 'global').maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Global settings row not found. Run the Supabase migration first.');
  return rowToSettings(data);
}

export async function saveSupabaseSettings(settings: Partial<Settings>): Promise<Settings> {
  // Partial update: never overwrite unrelated settings with null/undefined.
  // OPENROUTER_API_KEY is intentionally ignored here and must be configured as a server env var.
  const payload: Record<string, unknown> = { id: 'global' };
  const map: Record<string, string> = {
    siteName: 'site_name',
    siteUrl: 'site_url',
    defaultAiModel: 'default_ai_model',
    language: 'language',
    logoUrl: 'logo_url',
    faviconUrl: 'favicon_url',
    googleAnalyticsId: 'google_analytics_id',
    googleSearchConsoleTag: 'google_search_console_tag',
    googleSearchConsoleMeta: 'google_search_console_meta',
    adsTxtContent: 'ads_txt_content',
    robotsTxtContent: 'robots_txt_content',
    defaultLanguage: 'default_language',
    sitemapSettings: 'sitemap_settings',
    automationActive: 'automation_active',
    automationIntervalMinutes: 'automation_interval_minutes',
    automationLanguages: 'automation_languages',
    automationPublishStatus: 'automation_publish_status',
    automationModel: 'automation_model',
    lastAutomationRunTime: 'last_automation_run_time',
    automationCount: 'automation_count',
    automationLogs: 'automation_logs',
  };
  for (const [key, column] of Object.entries(map)) {
    if (Object.prototype.hasOwnProperty.call(settings, key)) payload[column] = (settings as any)[key];
  }
  const { data, error } = await requireClient().from('global_settings').upsert(payload, { onConflict: 'id' }).select('*').single();
  if (error) throw error;
  return rowToSettings(data);
}
