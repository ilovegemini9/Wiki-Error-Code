import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticatedAdmin } from '@/lib/auth';
import {
  deleteSupabaseArticle,
  getSupabaseArticles,
  getSupabaseBrands,
  getSupabaseCategories,
  saveSupabaseArticle,
} from '@/lib/supabase-db';
import { saveSupabaseBrand, saveSupabaseCategory } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!(await isAuthenticatedAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = (searchParams.get('status') as 'draft' | 'published' | 'all') || 'all';
    const q = searchParams.get('q') || undefined;
    const category = searchParams.get('category') || undefined;
    const brand = searchParams.get('brand') || undefined;
    const limit = Number(searchParams.get('limit') || 100);
    const offset = Number(searchParams.get('offset') || 0);

    const result = await getSupabaseArticles({
      status,
      search: q,
      categorySlug: category,
      brandSlug: brand,
      limit: Number.isFinite(limit) ? limit : 100,
      offset: Number.isFinite(offset) ? offset : 0,
    });

    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed to load articles' }, { status: 500 });
  }
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

    // Automation may submit category/brand names or slugs instead of database IDs.
    // Resolve or create taxonomy records before saving to avoid foreign-key failures.
    const categoryInput = String(body.categoryId || body.category || 'general').trim();
    const categorySlug = categoryInput.toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '') || 'general';
    const categories = await getSupabaseCategories();
    let category = categories.find((item) =>
      item.id === categoryInput || item.slug.toLowerCase() === categorySlug
    );
    if (!category) {
      category = await saveSupabaseCategory({
        name: categoryInput.replace(/[-_]/g, ' ').replace(/\\b\\w/g, (c: string) => c.toUpperCase()),
        slug: categorySlug,
        icon: 'FolderTree',
        description: `Troubleshooting articles for ${categoryInput}.`,
        language: String(body.language || 'en'),
      });
    }

    const brandInput = String(body.brandId || body.brand || 'General').trim();
    const brandSlug = brandInput.toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '') || `brand-${Date.now()}`;
    const brands = await getSupabaseBrands();
    let brand = brands.find((item) =>
      item.id === brandInput ||
      item.slug.toLowerCase() === brandSlug ||
      item.name.toLowerCase() === brandInput.toLowerCase()
    );
    if (!brand) {
      brand = await saveSupabaseBrand({
        name: brandInput,
        slug: brandSlug,
        categoryId: category.id,
        deviceTypes: body.deviceType ? [String(body.deviceType)] : [],
        description: `${brandInput} troubleshooting and diagnostic information.`,
        language: String(body.language || 'en'),
      });
    }

    const article = await saveSupabaseArticle({
      ...body,
      categoryId: category.id,
      brandId: brand.id,
    });
    return NextResponse.json({ success: true, article });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to save article';
    console.error('[ADMIN SAVE ARTICLE]', message);
    return NextResponse.json({ error: message || 'Failed to save article' }, { status: 500 });
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

  try {
    const deleted = await deleteSupabaseArticle(id);
    return NextResponse.json({ success: deleted });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed to delete article' }, { status: 500 });
  }
}
