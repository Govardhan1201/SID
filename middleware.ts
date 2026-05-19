import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes accessible without login
const PUBLIC_EXACT = ['/', '/login', '/signup', '/forgot-password', '/support'];
const PUBLIC_PREFIXES = ['/explore', '/project/', '/idea/', '/legal/', '/profile/', '/hackathon/', '/teams'];


export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow Next.js internals and static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('favicon') ||
    pathname.match(/\.(png|jpg|jpeg|svg|ico|webp|css|js|woff2?)$/)
  ) {
    return NextResponse.next();
  }

  // Allow exact public pages
  if (PUBLIC_EXACT.includes(pathname)) return NextResponse.next();

  // Allow public path prefixes (explore, project, idea, profile, legal…)
  if (PUBLIC_PREFIXES.some(prefix => pathname.startsWith(prefix))) return NextResponse.next();

  // Allow judge view — password-gated at page level, not session-gated
  if (pathname.match(/^\/hackathon\/[^/]+\/judge(\/.*)?$/)) {
    return NextResponse.next();
  }

  // Check session cookie set on login
  const session = request.cookies.get('if_session')?.value;
  if (!session) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
