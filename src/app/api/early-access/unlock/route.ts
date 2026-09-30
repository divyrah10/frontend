import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ unlocked: true })
  response.cookies.set({
    name: 'njd_early_access',
    value: 'granted',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 60,
  })
  return response
}
