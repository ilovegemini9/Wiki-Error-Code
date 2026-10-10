import { supabaseAdmin } from './supabase';
import { Brand, Category } from './types';

function client() {
  if (!supabaseAdmin) throw new Error('Supabase is not configured.');
  return supabaseAdmin as any;
}

const categoryFromRow = (r: any): Category => ({ id: r.id, name: r.name, slug: r.slug, icon: r.icon || 'FolderTree', description: r.description || '', language: r.language || 'en' });
const calculatorFromRow = (r: any): Brand => ({ id: r.id, name: r.name, slug: r.slug, logoUrl: r.logo_url || undefined, categoryId: r.category_id || '', deviceTypes: Array.isArray(r.device_types) ? r.device_types : [], description: r.description || '', language: r.language || 'en' });

export async function saveSupabaseCategory(input: Partial<Category> & { name: string; slug: string }): Promise<Category> {
  const row = { id: input.id || `${input.slug}-${Date.now()}`, name: input.name.trim(), slug: input.slug.toLowerCase().trim(), icon: input.icon || 'FolderTree', description: input.description || '', language: input.language || 'en', created_at: new Date().toISOString() };
  const { data, error } = await client().from('categories').upsert(row, { onConflict: 'id' }).select('*').single();
  if (error) throw error;
  return categoryFromRow(data);
}

export async function deleteSupabaseCategory(id: string): Promise<boolean> {
  const { error, count } = await client().from('categories').delete({ count: 'exact' }).eq('id', id);
  if (error) throw error;
  return (count || 0) > 0;
}

export async function saveSupabaseBrand(input: Partial<Brand> & { name: string; slug: string }): Promise<Brand> {
  const row = { id: input.id || `${input.slug}-${Date.now()}`, name: input.name.trim(), slug: input.slug.toLowerCase().trim(), logo_url: input.logoUrl || null, description: input.description || '', category_id: input.categoryId || null, device_types: input.deviceTypes || [], language: input.language || 'en' };
  const { data, error } = await client().from('brands').upsert(row, { onConflict: 'id' }).select('*').single();
  if (error) throw error;
  return calculatorFromRow(data);
}

export async function deleteSupabaseBrand(id: string): Promise<boolean> {
  const { error, count } = await client().from('brands').delete({ count: 'exact' }).eq('id', id);
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
    client().from('categories').select('id', { count: 'exact', head: true }),
    client().from('brands').select('id', { count: 'exact', head: true }),
    client().from('analytics_events').select('id', { count: 'exact', head: true }).eq('event_name', 'page_view').gte('created_at', since + 'T00:00:00.000Z').lte('created_at', today + 'T23:59:59.999Z'),
    client().from('articles').select('id,slug,title,status,updated_at').order('updated_at', { ascending: false }).limit(10),
    client().from('ai_generation_logs').select('id,model,error_code,created_at,status').order('created_at', { ascending: false }).limit(10),
    client().from('ai_generation_logs').select('id', { count: 'exact', head: true }).gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
  ]);
  const results = [articleCountRes, publishedCountRes, draftCountRes, categoryCountRes, calculatorCountRes, viewsRes, recentArticlesRes, recentLogsRes, todayAiCountRes];
  const firstError = results.find((result) => result.error)?.error;
  if (firstError) throw firstError;
  const totalViews = viewsRes.count || 0;
  return {
    totalArticles: articleCountRes.count || 0,
    publishedArticles: publishedCountRes.count || 0,
    draftArticles: draftCountRes.count || 0,
    categoriesCount: categoryCountRes.count || 0,
    calculatorsCount: calculatorCountRes.count || 0,
    totalViews,
    todayAiGenerations: todayAiCountRes.count || 0,
    recentArticles: (recentArticlesRes.data || []).map((a: any) => ({ id: a.id, slug: a.slug || a.id, title: a.title, status: a.status })),
    recentAiLogs: (recentLogsRes.data || []).map((l: any) => ({ id: l.id, taskType: l.error_code || 'AI task', model: l.model || 'unknown', createdAt: l.created_at, status: l.status === 'completed' ? 'completed' : 'failed' })),
  };
}
