import { cookies } from 'next/headers'

export const AUTH_COOKIE = 'auth_token'
export const AUTH_ROLE_COOKIE = 'auth_role'
export const AUTH_NAME_COOKIE = 'auth_name'
export const AUTH_DEPT_COOKIE = 'auth_dept'

export async function getServerToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(AUTH_COOKIE)?.value ?? null
}

export async function getServerRole(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(AUTH_ROLE_COOKIE)?.value ?? null
}

export async function getServerUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIE)?.value
  const role = cookieStore.get(AUTH_ROLE_COOKIE)?.value
  const fullName = cookieStore.get(AUTH_NAME_COOKIE)?.value
  if (!token) return null
  return { token, role, fullName }
}
