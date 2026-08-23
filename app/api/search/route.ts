import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseArticles } from '@/lib/supabase-db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || undefined;
  const brand = searchParams.get('brand') || undefined;
  const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20', 10), 1), 100);
  const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10), 0);

  try {
    const result = await getSupabaseArticles({
      status: 'published',
      search: q,
      categorySlug: category,
      brandSlug: brand,
      limit,
      offset,
    });

    return NextResponse.json({ articles: result.articles, total: result.total });
  } catch (error) {
    console.error('Supabase search failed:', error);
    return NextResponse.json({ error: 'Search temporarily unavailable' }, { status: 503 });
  }
}
