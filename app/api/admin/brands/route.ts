import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticatedAdmin } from '@/lib/auth';
import { getSupabaseBrands } from '@/lib/supabase-db';
import { deleteSupabaseBrand, saveSupabaseBrand } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await isAuthenticatedAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try { return NextResponse.json({ brands: await getSupabaseBrands() }); }
  catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed to load brands' }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticatedAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    if (!body.name || !body.slug) return NextResponse.json({ error: 'Name and slug required' }, { status: 400 });
    const brand = await saveSupabaseBrand(body);
    return NextResponse.json({ success: true, brand });
  } catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed to save brand' }, { status: 500 }); }
}

export async function DELETE(req: NextRequest) {
  if (!(await isAuthenticatedAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
  try { return NextResponse.json({ success: await deleteSupabaseBrand(id) }); }
  catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed to delete brand' }, { status: 500 }); }
}
