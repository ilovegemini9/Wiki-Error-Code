import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminCredentials, setAdminSessionCookie, clearAdminSessionCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }

    const isValid = await verifyAdminCredentials(username, password);

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    await setAdminSessionCookie(username);
    return NextResponse.json({ success: true, username });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE() {
  await clearAdminSessionCookie();
  return NextResponse.json({ success: true });
}
