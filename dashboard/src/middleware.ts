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

async function verifySession(token: string): Promise<boolean> {
  if (!DASHBOARD_PASSWORD) return false;
  const dot = token.indexOf('.');
  if (dot === -1) return false;
  const ts = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  const age = Date.now() - parseInt(ts, 10);
  if (isNaN(age) || age > 30 * 24 * 60 * 60 * 1000 || age < 0) return false;

  const expected = await hmacSign(`el-coro:${ts}`, DASHBOARD_PASSWORD);
  // Timing-safe comparison
  if (sig.length !== expected.length) return false;
  const aBuf = new TextEncoder().encode(sig);
  const bBuf = new TextEncoder().encode(expected);
  let diff = 0;
  for (let i = 0; i < aBuf.length; i++) diff |= aBuf[i] ^ bBuf[i];
  return diff === 0;
}

export async function middleware(request: NextRequest) {
  if (!DASHBOARD_USER || !DASHBOARD_PASSWORD) return NextResponse.next();

  const session = request.cookies.get('session')?.value;
  if (session && await verifySession(session)) return NextResponse.next();

  if (request.headers.get('accept')?.includes('text/html')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return new NextResponse('Unauthorized', { status: 401 });
}

export const config = {
  matcher: ['/((?!login|api/auth|_next|favicon).*)'],
};
