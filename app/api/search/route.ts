import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || undefined;
  const brand = searchParams.get('brand') || undefined;
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  const result = db.getArticles({
    status: 'published',
    search: q,
    categorySlug: category,
    brandSlug: brand,
    limit,
    offset
  });

  return NextResponse.json(result);
}
