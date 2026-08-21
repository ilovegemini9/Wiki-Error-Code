import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAuthenticatedAdmin } from '@/lib/auth';

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticatedAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const contentType = req.headers.get('content-type') || '';
    let items: any[] = [];

    if (contentType.includes('application/json')) {
      const body = await req.json();
      items = Array.isArray(body) ? body : [body];
    } else {
      const text = await req.text();
      const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
      if (lines.length < 2) {
        return NextResponse.json({ error: 'CSV file must include header and data rows' }, { status: 400 });
      }

      const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase());
      
      for (let i = 1; i < lines.length; i++) {
        const row = parseCSVLine(lines[i]);
        if (row.length === 0) continue;

        const obj: any = {};
        headers.forEach((h, index) => {
          obj[h] = row[index] || '';
        });

        if (obj.errorcode || obj.code || obj['error code']) {
          items.push({
            errorCode: obj.errorcode || obj.code || obj['error code'],
            title: obj.title || `Error ${obj.errorcode || obj.code}`,
            shortDefinition: obj.shortdefinition || obj.definition || obj.description || '',
            meaning: obj.meaning || '',
            causes: obj.causes ? obj.causes.split(';').map((s: string) => s.trim()) : [],
            categoryId: obj.categoryid || obj.category || 'windows',
            brandId: obj.brandid || obj.brand || 'microsoft',
            status: obj.status || 'published'
          });
        }
      }
    }

    const result = db.bulkImportArticles(items);
    return NextResponse.json({ success: true, ...result });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Bulk import failed' }, { status: 500 });
  }
}
