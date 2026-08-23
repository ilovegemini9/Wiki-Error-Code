import { supabaseAdmin } from './supabase';
import { Brand, Category } from './types';

function client() {
  if (!supabaseAdmin) throw new Error('Supabase is not configured.');
  return supabaseAdmin;
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
    id: input.id || input.slug,
    name: input.name.trim(),
    slug: input.slug.toLowerCase().trim(),
    icon: input.icon || 'BookOpen',
    description: input.description || '',
    language: input.language || null,
    updated_at: new Date().toISOString(),
  };
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
  const row = {
    id: input.id || input.slug,
    name: input.name.trim(),
    slug: input.slug.toLowerCase().trim(),
    logo_url: input.logoUrl || null,
    category_id: input.categoryId || null,
    device_types: input.deviceTypes || [],
    description: input.description || '',
    language: input.language || null,
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await client().from('brands').upsert(row, { onConflict: 'id' }).select('*').single();
  if (error) throw error;
  return brandFromRow(data);
}

export async function deleteSupabaseBrand(id: string): Promise<boolean> {
  const { error, count } = await client().from('brands').delete({ count: 'exact' }).eq('id', id);
  if (error) throw error;
  return (count || 0) > 0;
}

export async function getSupabaseDashboardStats() {
  const [articleRes, categoryRes, brandRes, logRes] = await Promise.all([
    client().from('articles').select('*').order('updated_at', { ascending: false }),
    client().from('categories').select('id, name, slug'),
    client().from('brands').select('id, name, slug'),
    client().from('ai_generation_logs').select('id,error_code,brand,device,model,created_at,status').order('created_at', { ascending: false }).limit(20),
  ]);
  if (articleRes.error) throw articleRes.error;
  if (categoryRes.error) throw categoryRes.error;
  if (brandRes.error) throw brandRes.error;
  if (logRes.error) throw logRes.error;
  const articles = articleRes.data || [];
  const logs = logRes.data || [];
  const today = new Date().toISOString().slice(0, 10);
  return {
    totalArticles: articles.length,
    publishedArticles: articles.filter((a: any) => a.status === 'published').length,
    draftArticles: articles.filter((a: any) => a.status === 'draft').length,
    categoriesCount: (categoryRes.data || []).length,
    brandsCount: (brandRes.data || []).length,
    totalViews: articles.reduce((n: number, a: any) => n + (a.views_count || 0), 0),
    todayAiGenerations: logs.filter((l: any) => String(l.created_at || '').slice(0, 10) === today).length,
    recentArticles: articles.slice(0, 10).map((a: any) => ({ id: a.id, errorCode: a.error_code, title: a.title, status: a.status })),
    recentAiLogs: logs.slice(0, 10).map((l: any) => ({ id: l.id, errorCode: l.error_code || '', brand: l.brand || '', device: l.device || '', model: l.model || '', createdAt: l.created_at, status: l.status })),
  };
}
