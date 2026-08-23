import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticatedAdmin } from '@/lib/auth';
import { getSupabaseCategories } from '@/lib/supabase-db';
import { deleteSupabaseCategory, saveSupabaseCategory } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try { const lang = new URL(req.url).searchParams.get('lang') || undefined; return NextResponse.json({ categories: await getSupabaseCategories(lang) }); }
  catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed to load categories' }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticatedAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try { const body = await req.json(); if (!body.name || !body.slug) return NextResponse.json({ error: 'Name and slug required' }, { status: 400 }); const category = await saveSupabaseCategory(body); return NextResponse.json({ success: true, category }); }
  catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed to save category' }, { status: 500 }); }
}

export async function DELETE(req: NextRequest) {
  if (!(await isAuthenticatedAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = new URL(req.url).searchParams.get('id'); if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
  try { return NextResponse.json({ success: await deleteSupabaseCategory(id) }); }
  catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed to delete category' }, { status: 500 }); }
}
