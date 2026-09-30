import { NextRequest, NextResponse } from 'next/server'

const ALWAYS_AVAILABLE = ['/early-access', '/track', '/admin', '/admin-login', '/login', '/register']

export function middleware(request: NextRequest) {
  if (process.env.EARLY_ACCESS_ENABLED !== 'true') {
    return NextResponse.next()
  }

  const { pathname, search } = request.nextUrl
  if (ALWAYS_AVAILABLE.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return NextResponse.next()
  }

  if (request.cookies.get('njd_early_access')?.value === 'granted') {
    return NextResponse.next()
  }

  const earlyAccessUrl = request.nextUrl.clone()
  earlyAccessUrl.pathname = '/early-access'
  earlyAccessUrl.search = ''
  earlyAccessUrl.searchParams.set('return_to', `${pathname}${search}`)
  return NextResponse.redirect(earlyAccessUrl)
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.[^/]+$).*)'],
}
