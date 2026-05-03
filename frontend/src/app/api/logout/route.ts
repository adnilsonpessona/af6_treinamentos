import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  const cookieStore = await cookies()
  cookieStore.delete('auth_token')
  cookieStore.delete('auth_role')
  cookieStore.delete('auth_name')
  cookieStore.delete('auth_dept')
  cookieStore.delete('auth_company')
  return NextResponse.redirect(new URL('/login', process.env.NEXTAUTH_URL ?? 'http://localhost:3000'))
}
