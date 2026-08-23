import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticatedAdmin } from '@/lib/auth';
import { getSupabaseArticles, saveSupabaseArticle } from '@/lib/supabase-db';

function parseCSVLine(line: string): string[] {
  const result: string[] = []; let current = ''; let inQuotes = false;
  for (let i = 0; i < line.length; i++) { const char = line[i]; if (char === '"') { if (inQuotes && line[i + 1] === '"') { current += '"'; i++; } else inQuotes = !inQuotes; } else if (char === ',' && !inQuotes) { result.push(current.trim()); current = ''; } else current += char; }
  result.push(current.trim()); return result;
}

function parseCSV(text: string): any[] {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) throw new Error('CSV file must include header and data rows');
  const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase());
  const items: any[] = [];
  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i]); const obj: any = {}; headers.forEach((h, index) => { obj[h] = row[index] || ''; });
    if (obj.errorcode || obj.code || obj['error code']) items.push({
      errorCode: obj.errorcode || obj.code || obj['error code'], title: obj.title || `Error ${obj.errorcode || obj.code}`,
      shortDefinition: obj.shortdefinition || obj.definition || obj.description || '', meaning: obj.meaning || '',
      causes: obj.causes ? obj.causes.split(';').map((s: string) => s.trim()) : [], categoryId: obj.categoryid || obj.category || 'windows',
      brandId: obj.brandid || obj.brand || 'microsoft', status: obj.status === 'draft' ? 'draft' : 'published',
      language: obj.language || 'en', keywords: obj.keywords ? obj.keywords.split(';').map((s: string) => s.trim()) : [],
      tags: obj.tags ? obj.tags.split(';').map((s: string) => s.trim()) : [],
    });
  }
  return items;
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticatedAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const contentType = req.headers.get('content-type') || '';
    let items: any[] = [];
    if (contentType.includes('application/json')) {
      const body = await req.json();
      if (Array.isArray(body)) items = body;
      else if (body && typeof body.content === 'string') {
        const format = body.format === 'json' ? 'json' : 'csv';
        if (format === 'json') {
          const parsed = JSON.parse(body.content);
          items = Array.isArray(parsed) ? parsed : [parsed];
        } else {
          items = parseCSV(body.content);
        }
      } else {
        items = [body];
      }
    } else {
      const text = await req.text();
      items = parseCSV(text);
    }

    const existing = (await getSupabaseArticles({ status: 'all', limit: 500 })).articles;
    let imported = 0; let skipped = 0;
    for (const item of items) {
      if (!item.errorCode || !item.title) { skipped++; continue; }
      const lang = String(item.language || 'en').toLowerCase().split('-')[0];
      const duplicate = existing.some(a => a.errorCode.toLowerCase() === String(item.errorCode).trim().toLowerCase() && (a.language || 'en') === lang);
      if (duplicate) { skipped++; continue; }
      await saveSupabaseArticle(item); imported++;
      existing.push({ ...item, errorCode: String(item.errorCode), language: lang } as any);
    }
    return NextResponse.json({ success: true, imported, importedCount: imported, skipped, total: imported + skipped });
  } catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : 'Bulk import failed' }, { status: 500 }); }
}
