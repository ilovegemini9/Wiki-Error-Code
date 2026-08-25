import { supabaseAdmin } from './supabase';
import { Brand, Category } from './types';

function client() {
  if (!supabaseAdmin) throw new Error('Supabase is not configured.');
  return supabaseAdmin as any;
}

const categoryFromRow = (r: any): Category => ({ id: r.id, name: r.name, slug: r.slug, icon: r.icon || 'FolderTree', description: r.description || '' });
const calculatorFromRow = (r: any): Brand => ({ id: r.id, name: r.name, slug: r.slug, categoryId: r.category_id || '', deviceTypes: [], description: r.description || '' });

export async function saveSupabaseCategory(input: Partial<Category> & { name: string; slug: string }): Promise<Category> {
  const row = { id: input.id || `${input.slug}-${Date.now()}`, name: input.name.trim(), slug: input.slug.toLowerCase().trim(), description: input.description || '', created_at: new Date().toISOString() };
  const { data, error } = await client().from('article_categories').upsert(row, { onConflict: 'id' }).select('*').single();
  if (error) throw error;
  return categoryFromRow(data);
}

export async function deleteSupabaseCategory(id: string): Promise<boolean> {
  const { error, count } = await client().from('article_categories').delete({ count: 'exact' }).eq('id', id);
  if (error) throw error;
  return (count || 0) > 0;
}

export async function saveSupabaseBrand(input: Partial<Brand> & { name: string; slug: string }): Promise<Brand> {
  const row = { id: input.id || `${input.slug}-${Date.now()}`, name: input.name.trim(), slug: input.slug.toLowerCase().trim(), description: input.description || '', category_id: input.categoryId || null, status: 'published' };
  const { data, error } = await client().from('calculators').upsert(row, { onConflict: 'id' }).select('*').single();
  if (error) throw error;
  return calculatorFromRow(data);
}

export async function deleteSupabaseBrand(id: string): Promise<boolean> {
  const { error, count } = await client().from('calculators').delete({ count: 'exact' }).eq('id', id);
  if (error) throw error;
  return (count || 0) > 0;
}

export async function getSupabaseDashboardStats() {
  const today = new Date().toISOString().slice(0, 10);
  const since = new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10);
  const [articleCountRes, publishedCountRes, draftCountRes, categoryCountRes, calculatorCountRes, viewsRes, recentArticlesRes, recentLogsRes, todayAiCountRes] = await Promise.all([
    client().from('articles').select('id', { count: 'exact', head: true }),
    client().from('articles').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    client().from('articles').select('id', { count: 'exact', head: true }).eq('status', 'draft'),
    client().from('article_categories').select('id', { count: 'exact', head: true }),
    client().from('calculators').select('id', { count: 'exact', head: true }),
    client().from('analytics').select('page_views').gte('date', since).lte('date', today),
    client().from('articles').select('id,slug,title,status,updated_at').order('updated_at', { ascending: false }).limit(10),
    client().from('ai_generation_logs').select('id,model,task_type,created_at,success').order('created_at', { ascending: false }).limit(10),
    client().from('ai_generation_logs').select('id', { count: 'exact', head: true }).gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
  ]);
  const results = [articleCountRes, publishedCountRes, draftCountRes, categoryCountRes, calculatorCountRes, viewsRes, recentArticlesRes, recentLogsRes, todayAiCountRes];
  const firstError = results.find((result) => result.error)?.error;
  if (firstError) throw firstError;
  const totalViews = (viewsRes.data || []).reduce((total: number, row: any) => total + Number(row.page_views || 0), 0);
  return {
    totalArticles: articleCountRes.count || 0,
    publishedArticles: publishedCountRes.count || 0,
    draftArticles: draftCountRes.count || 0,
    categoriesCount: categoryCountRes.count || 0,
    brandsCount: calculatorCountRes.count || 0,
    totalViews,
    todayAiGenerations: todayAiCountRes.count || 0,
    recentArticles: (recentArticlesRes.data || []).map((a: any) => ({ id: a.id, errorCode: a.slug || a.id, title: a.title, status: a.status })),
    recentAiLogs: (recentLogsRes.data || []).map((l: any) => ({ id: l.id, errorCode: l.task_type || 'AI task', brand: '', device: '', model: l.model || 'unknown', createdAt: l.created_at, status: l.success ? 'completed' : 'failed' })),
  };
}
