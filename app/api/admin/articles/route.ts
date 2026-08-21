import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAuthenticatedAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!(await isAuthenticatedAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = (searchParams.get('status') as 'draft' | 'published' | 'all') || 'all';
  const q = searchParams.get('q') || undefined;
  const category = searchParams.get('category') || undefined;
  const brand = searchParams.get('brand') || undefined;

  const result = db.getArticles({
    status,
    search: q,
    categorySlug: category,
    brandSlug: brand
  });

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticatedAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body.errorCode || !body.title) {
      return NextResponse.json({ error: 'Error code and title are required' }, { status: 400 });
    }

    const article = db.saveArticle(body);
    return NextResponse.json({ success: true, article });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed to save article' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await isAuthenticatedAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Article ID required' }, { status: 400 });
  }

  const deleted = db.deleteArticle(id);
  return NextResponse.json({ success: deleted });
}
