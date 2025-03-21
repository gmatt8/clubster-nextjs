import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(req) {
  const { event, session } = await req.json()

  if (event === 'SIGNED_IN') {
    cookies().set('supabase-auth-token', JSON.stringify(session), {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 1 settimana
    })
  }

  return NextResponse.json({ message: 'Cookie set' })
}
