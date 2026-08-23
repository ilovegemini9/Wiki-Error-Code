import { supabaseAdmin } from './supabase';
import { Brand, Category } from './types';

function client() {
  if (!supabaseAdmin) throw new Error('Supabase is not configured.');
  return supabaseAdmin as any;
}

const categoryFromRow = (r: any): Category => ({
  id: r.id, name: r.name, slug: r.slug, icon: r.icon || 'BookOpen',
  description: r.description || '', language: r.language || undefined,
});

const brandFromRow = (r: any): Brand => ({
  id: r.id, name: r.name, slug: r.slug, logoUrl: r.logo_url || undefined,
  categoryId: r.category_id || '', deviceTypes: r.device_types || [],
  description: r.description || '', language: r.language || undefined,
});

export async function saveSupabaseCategory(input: Partial<Category> & { name: string; slug: string }): Promise<Category> {
  const row = {
    id: input.id || `${input.slug}-${(input.language || 'en').toLowerCase()}`,
    name: input.name.trim(), slug: input.slug.toLowerCase().trim(), icon: input.icon || 'BookOpen',
    description: input.description || '', language: (input.language || 'en').toLowerCase().trim(), updated_at: new Date().toISOString(),
  };
  const { data, error } = await client().from('categories').upsert(row, { onConflict: 'id' }).select('*').single();
  if (error) throw error; return categoryFromRow(data);
}

export async function deleteSupabaseCategory(id: string): Promise<boolean> {
  const { error, count } = await client().from('categories').delete({ count: 'exact' }).eq('id', id);
  if (error) throw error; return (count || 0) > 0;
}

export async function saveSupabaseBrand(input: Partial<Brand> & { name: string; slug: string }): Promise<Brand> {
  const row = {
    id: input.id || `${input.slug}-${(input.language || 'en').toLowerCase()}`,
    name: input.name.trim(), slug: input.slug.toLowerCase().trim(), logo_url: input.logoUrl || null,
    category_id: input.categoryId || null, device_types: input.deviceTypes || [], description: input.description || '',
    language: (input.language || 'en').toLowerCase().trim(), updated_at: new Date().toISOString(),
  };
  const { data, error } = await client().from('brands').upsert(row, { onConflict: 'id' }).select('*').single();
  if (error) throw error; return brandFromRow(data);
}

export async function deleteSupabaseBrand(id: string): Promise<boolean> {
  const { error, count } = await client().from('brands').delete({ count: 'exact' }).eq('id', id);
  if (error) throw error; return (count || 0) > 0;
}

export async function getSupabaseDashboardStats() {
  const today = new Date().toISOString().slice(0, 10);
  const todayStart = `${today}T00:00:00.000Z`;
  const [articleCountRes, publishedCountRes, draftCountRes, categoryCountRes, brandCountRes, viewsRes, recentArticlesRes, recentLogsRes, todayAiCountRes] = await Promise.all([
    client().from('articles').select('id', { count: 'exact', head: true }),
    client().from('articles').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    client().from('articles').select('id', { count: 'exact', head: true }).eq('status', 'draft'),
    client().from('categories').select('id', { count: 'exact', head: true }),
    client().from('brands').select('id', { count: 'exact', head: true }),
    client().from('articles').select('views_count'),
    client().from('articles').select('id,error_code,title,status').order('updated_at', { ascending: false }).limit(10),
    client().from('ai_generation_logs').select('id,error_code,brand,device,model,created_at,status').order('created_at', { ascending: false }).limit(10),
    client().from('ai_generation_logs').select('id', { count: 'exact', head: true }).gte('created_at', todayStart),
  ]);

  const results = [articleCountRes, publishedCountRes, draftCountRes, categoryCountRes, brandCountRes, viewsRes, recentArticlesRes, recentLogsRes, todayAiCountRes];
  const firstError = results.find((result) => result.error)?.error;
  if (firstError) throw firstError;

  const articles = recentArticlesRes.data || [];
  const logs = recentLogsRes.data || [];
  const totalViews = (viewsRes.data || []).reduce((total: number, row: any) => total + Number(row.views_count || 0), 0);

  return {
    totalArticles: articleCountRes.count || 0,
    publishedArticles: publishedCountRes.count || 0,
    draftArticles: draftCountRes.count || 0,
    categoriesCount: categoryCountRes.count || 0,
    brandsCount: brandCountRes.count || 0,
    totalViews,
    todayAiGenerations: todayAiCountRes.count || 0,
    recentArticles: articles.map((a: any) => ({ id: a.id, errorCode: a.error_code, title: a.title, status: a.status })),
    recentAiLogs: logs.map((l: any) => ({ id: l.id, errorCode: l.error_code || '', brand: l.brand || '', device: l.device || '', model: l.model || '', createdAt: l.created_at, status: l.status })),
  };
}
