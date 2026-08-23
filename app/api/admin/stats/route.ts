import { NextResponse } from 'next/server';
import { getSupabaseArticles, getSupabaseBrands, getSupabaseCategories } from '@/lib/supabase-db';
import { isAuthenticatedAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await isAuthenticatedAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const [{ articles }, categories, brands] = await Promise.all([
      getSupabaseArticles({ status: 'all' }), getSupabaseCategories(), getSupabaseBrands()
    ]);
    const published = articles.filter(a => a.status === 'published');
    const drafts = articles.filter(a => a.status === 'draft');
    const views = articles.reduce((sum, a) => sum + (a.viewsCount || 0), 0);
    const aiGenerated = articles.filter(a => (a as any).aiGenerated).length;
    return NextResponse.json({
      totalArticles: articles.length,
      publishedArticles: published.length,
      draftArticles: drafts.length,
      totalCategories: categories.length,
      totalBrands: brands.length,
      totalViews: views,
      aiGeneratedArticles: aiGenerated,
      topArticles: [...articles].sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0)).slice(0, 10)
    });
  } catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed to load dashboard stats' }, { status: 500 }); }
}
