import { NextRequest, NextResponse } from 'next/server';

const DASHBOARD_USER = process.env.DASHBOARD_USER;
const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD;

async function hmacSign(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function timingSafeEqual(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const aBuf = new TextEncoder().encode(a.padEnd(256));
  const bBuf = new TextEncoder().encode(b.padEnd(256));
  if (aBuf.length !== bBuf.length) return false;
  let diff = 0;
  for (let i = 0; i < aBuf.length; i++) diff |= aBuf[i] ^ bBuf[i];
  return diff === 0 && a.length === b.length;
}

async function createSessionToken(): Promise<string> {
  const ts = Date.now().toString();
  const sig = await hmacSign(`el-coro:${ts}`, DASHBOARD_PASSWORD || '');
  return `${ts}.${sig}`;
}

export async function POST(request: NextRequest) {
  const { user, password } = await request.json();

  if (!DASHBOARD_USER || !DASHBOARD_PASSWORD) {
    return NextResponse.json({ error: 'Auth not configured' }, { status: 500 });
  }

  if (!timingSafeEqual(user, DASHBOARD_USER) || !timingSafeEqual(password, DASHBOARD_PASSWORD)) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const sessionToken = await createSessionToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set('session', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set('session', '', { maxAge: 0, path: '/' });
  return response;
}
