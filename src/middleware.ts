import { NextRequest, NextResponse } from 'next/server'

// The early-access gate is retired: old /early-access links go straight to the store.
export function middleware(request: NextRequest) {
  const returnTo = request.nextUrl.searchParams.get('return_to')
  const destination = request.nextUrl.clone()
  destination.pathname = returnTo?.startsWith('/') && !returnTo.startsWith('//') ? returnTo.split('?')[0] : '/'
  destination.search = returnTo?.includes('?') ? returnTo.slice(returnTo.indexOf('?')) : ''
  return NextResponse.redirect(destination)
}

export const config = {
  matcher: ['/early-access'],
}
