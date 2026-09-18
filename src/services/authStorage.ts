import type { AuthUser } from '../types/auth'

const TOKEN_KEY = 'workflow-canvas-auth-token'
const USER_KEY = 'workflow-canvas-auth-user'
const EXPIRE_KEY = 'workflow-canvas-auth-expire'

export interface AuthSession {
  token: string | null
  user: AuthUser | null
  expireAt: number
}

export function readAuthSession(): AuthSession {
  const token = localStorage.getItem(TOKEN_KEY)
  const expireAt = Number(localStorage.getItem(EXPIRE_KEY) || 0)
  const rawUser = localStorage.getItem(USER_KEY)

  if (!token || (expireAt && Date.now() > expireAt)) {
    clearAuthStorage()
    return { token: null, user: null, expireAt: 0 }
  }

  let user: AuthUser | null = null
  if (rawUser) {
    try {
      user = JSON.parse(rawUser) as AuthUser
    } catch {
      user = null
    }
  }

  return { token, user, expireAt }
}

export function writeAuthSession(session: { token: string; user: AuthUser; expireAt: number }) {
  localStorage.setItem(TOKEN_KEY, session.token)
  localStorage.setItem(USER_KEY, JSON.stringify(session.user))
  localStorage.setItem(EXPIRE_KEY, String(session.expireAt))
}

export function clearAuthStorage() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(EXPIRE_KEY)
}

export function getAccessToken() {
  return readAuthSession().token
}
