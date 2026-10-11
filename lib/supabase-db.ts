import { Article, Category, Brand, Settings } from './types';
import { supabaseAdmin } from './supabase';

function requireClient() {
  if (!supabaseAdmin) throw new Error('Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  return supabaseAdmin as any;
}

function rowToArticle(row: any): Article {
  return {
    id: row.id,
    errorCode: row.error_code || row.slug || row.id,
    title: row.title || '',
    slug: row.slug || row.id,
    metaTitle: row.meta_title || '',
    metaDescription: row.meta_description || '',
    shortDefinition: row.short_definition || row.meta_description || '',
    meaning: row.meaning || '',
    causes: Array.isArray(row.causes) ? row.causes : [],
    solutions: Array.isArray(row.solutions) ? row.solutions : [],
    technicalExplanation: row.technical_explanation || '',
    faq: Array.isArray(row.faq) ? row.faq : [],
    schemaJsonLd: row.schema_jsonld || undefined,
    canonicalUrl: row.canonical_url || undefined,
    categoryId: row.category_id || '',
    brandId: row.brand_id || '',
    deviceType: row.device_type || '',
    language: row.language || 'en',
    keywords: Array.isArray(row.keywords) ? row.keywords : [],
    tags: Array.isArray(row.tags) ? row.tags : [],
    featuredImage: row.featured_image || undefined,
    status: row.status === 'draft' ? 'draft' : 'published',
    readingTime: `${row.reading_time || '1'} min read`,
    internalLinks: [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    scheduledFor: row.scheduled_for || undefined,
    viewsCount: 0,
    seoScore: undefined,
    aiGenerated: row.ai_generated ?? false,
  };
}

function rowToCategory(row: any): Category {
  return { id: row.id, name: row.name, slug: row.slug, icon: row.icon || 'FolderTree', description: row.description || '', language: row.language || 'en' };
}

function rowToCalculator(row: any): Brand {
  return { id: row.id, name: row.name, slug: row.slug, logoUrl: row.logo_url || undefined, categoryId: row.category_id || '', deviceTypes: Array.isArray(row.device_types) ? row.device_types : [], description: row.description || '', language: row.language || 'en' };
}

function rowToSettings(row: any): Settings {
  return {
    siteName: row?.site_name || 'Wiki Error Code',
    siteUrl: row?.site_url || '',
    openRouterApiKey: '',
    defaultAiModel: row?.default_ai_model === 'gemini-3.6-flash' ? 'auto_cascade' : (row?.default_ai_model || 'auto_cascade'),
    language: row?.language || 'en',
    googleAnalyticsId: row?.google_analytics_id || undefined,
    googleSearchConsoleTag: row?.google_search_console_tag || undefined,
    robotsTxtContent: row?.robots_txt_content || undefined,
    defaultLanguage: row?.default_language || 'en',
    sitemapSettings: row?.sitemap_settings || { autoUpdate: true, includeImages: true },
    automationActive: row?.automation_active ?? false,
    automationIntervalMinutes: row?.automation_interval_minutes || 60,
    automationPublishStatus: row?.automation_publish_status || 'published',
    automationModel: [row?.automation_model, row?.default_ai_model].find((model) => model && model !== 'gemini-3.6-flash') || 'auto_cascade',
  };
}

export async function getSupabaseArticles(params?: { status?: 'draft' | 'published' | 'all'; search?: string; categorySlug?: string; brandSlug?: string; language?: string; limit?: number; offset?: number }): Promise<{ articles: Article[]; total: number }> {
  const client = requireClient();
  const limit = Math.min(Math.max(params?.limit ?? 100, 1), 500);
  const offset = Math.max(params?.offset ?? 0, 0);
  let query = client.from('articles').select('*', { count: 'exact' }).order('updated_at', { ascending: false }).range(offset, offset + limit - 1);
  if (params?.status && params.status !== 'all') query = query.eq('status', params.status);

  if (params?.categorySlug) {
    const { data, error } = await client.from('categories').select('id').eq('slug', params.categorySlug.toLowerCase().trim()).limit(1).maybeSingle();
    if (error) throw error;
    if (!data) return { articles: [], total: 0 };
    query = query.eq('category_id', data.id);
  }
  if (params?.brandSlug) {
    const { data, error } = await client.from('brands').select('id').eq('slug', params.brandSlug.toLowerCase().trim()).limit(1).maybeSingle();
    if (error) throw error;
    if (!data) return { articles: [], total: 0 };
    query = query.eq('brand_id', data.id);
  }
  if (params?.search?.trim()) {
    const q = params.search.trim().replace(/[%(),]/g, ' ');
    query = query.or(`title.ilike.%${q}%,slug.ilike.%${q}%,meaning.ilike.%${q}%`);
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
  const { data, error } = await requireClient().from('categories').select('*').order('name');
  if (error) throw error;
  return (data || []).map(rowToCategory);
}

export async function getSupabaseCategoryBySlug(slug: string): Promise<Category | null> {
  const { data, error } = await requireClient().from('categories').select('*').eq('slug', slug.toLowerCase().trim()).limit(1).maybeSingle();
  if (error) throw error;
  return data ? rowToCategory(data) : null;
}

export async function getSupabaseCategoryById(id: string): Promise<Category | null> {
  if (!id) return null;
  const { data, error } = await requireClient().from('categories').select('*').eq('id', id).limit(1).maybeSingle();
  if (error) throw error;
  return data ? rowToCategory(data) : null;
}

export async function getSupabaseBrands(): Promise<Brand[]> {
  const { data, error } = await requireClient().from('brands').select('*').order('name');
  if (error) throw error;
  return (data || []).map(rowToCalculator);
}

export async function getSupabaseBrandBySlug(slug: string, _language?: string): Promise<Brand | null> {
  const { data, error } = await requireClient().from('brands').select('*').eq('slug', slug.toLowerCase().trim()).limit(1).maybeSingle();
  if (error) throw error;
  return data ? rowToCalculator(data) : null;
}

export async function getSupabaseBrandById(id: string): Promise<Brand | null> {
  if (!id) return null;
  const { data, error } = await requireClient().from('brands').select('*').eq('id', id).limit(1).maybeSingle();
  if (error) throw error;
  return data ? rowToCalculator(data) : null;
}

export async function saveSupabaseArticle(article: Partial<Article> & { errorCode: string; title: string }): Promise<Article> {
  const client = requireClient();
  const now = new Date().toISOString();
  const payload = {
    id: article.id || `art-${Date.now()}`,
    error_code: article.errorCode,
    slug: article.slug || `${article.errorCode.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
    title: article.title.trim(),
    meta_title: article.metaTitle || article.title,
    meta_description: article.metaDescription || article.shortDefinition || '',
    short_definition: article.shortDefinition || article.metaDescription || '',
    meaning: article.meaning || '',
    causes: article.causes || [],
    solutions: article.solutions || [],
    technical_explanation: article.technicalExplanation || '',
    faq: article.faq || [],
    schema_jsonld: article.schemaJsonLd || null,
    canonical_url: article.canonicalUrl || null,
    category_id: article.categoryId || null,
    brand_id: article.brandId || null,
    device_type: article.deviceType || null,
    language: article.language || 'en',
    keywords: article.keywords || [],
    tags: article.tags || [],
    featured_image: article.featuredImage || null,
    status: article.status || 'published',
    reading_time: article.readingTime || '1 min read',
    internal_links: article.internalLinks || [],
    ai_generated: article.aiGenerated ?? false,
    created_at: article.createdAt || now,
    updated_at: now,
    scheduled_for: article.scheduledFor || null,
    views_count: article.viewsCount || 0,
    seo_score: article.seoScore ?? null,
  };
  const { data, error } = await client.from('articles').upsert(payload, { onConflict: 'id' }).select('*').single();
  if (error) throw error;
  return rowToArticle(data);
}

export async function saveSupabaseAiGenerationLog(log: { id?: string; errorCode?: string; brand?: string; device?: string; model?: string; status: 'completed' | 'failed'; articleId?: string; promptText?: string; responseSummary?: string; usage?: unknown }): Promise<void> {
  const { error } = await requireClient().from('ai_generation_logs').upsert({
    id: log.id || `ai-${Date.now()}`,
    model: log.model || null,
    error_code: log.errorCode || null,
    brand: log.brand || null,
    device: log.device || null,
    status: log.status,
    article_id: log.articleId || null,
    prompt_text: log.promptText || null,
    response_summary: log.responseSummary || null,
    usage: log.usage && typeof log.usage === 'object' ? log.usage : {},
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
  const { data, error } = await requireClient().from('global_settings').select('*').eq('id', 'global').limit(1).maybeSingle();
  if (error) throw error;
  return rowToSettings(data);
}

export async function saveSupabaseSettings(settings: Partial<Settings>): Promise<Settings> {
  const client = requireClient();
  const payload: Record<string, unknown> = { id: 'global', updated_at: new Date().toISOString() };
  if (settings.siteName !== undefined) payload.site_name = settings.siteName;
  if (settings.siteUrl !== undefined) payload.site_url = settings.siteUrl;
  if (settings.defaultAiModel !== undefined) payload.default_ai_model = settings.defaultAiModel === 'gemini-3.6-flash' ? 'auto_cascade' : settings.defaultAiModel;
  if (settings.language !== undefined) payload.language = settings.language;
  if (settings.googleAnalyticsId !== undefined) payload.google_analytics_id = settings.googleAnalyticsId || null;
  if (settings.googleSearchConsoleTag !== undefined) payload.google_search_console_tag = settings.googleSearchConsoleTag || null;
  if (settings.robotsTxtContent !== undefined) payload.robots_txt_content = settings.robotsTxtContent || null;
  if (settings.defaultLanguage !== undefined) payload.default_language = settings.defaultLanguage;
  if (settings.sitemapSettings !== undefined) payload.sitemap_settings = settings.sitemapSettings;
  if (settings.automationActive !== undefined) payload.automation_active = settings.automationActive;
  if (settings.automationIntervalMinutes !== undefined) payload.automation_interval_minutes = settings.automationIntervalMinutes;
  if (settings.automationPublishStatus !== undefined) payload.automation_publish_status = settings.automationPublishStatus;
  if (settings.automationModel !== undefined) payload.automation_model = settings.automationModel === 'gemini-3.6-flash' ? 'auto_cascade' : settings.automationModel;
  const { error } = await client.from('global_settings').upsert(payload, { onConflict: 'id' });
  if (error) throw error;
  return getSupabaseSettings();
}
