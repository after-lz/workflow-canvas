import type { RouteLocationNormalizedLoaded, Router } from 'vue-router'

export type AuthIntent = 'save' | 'run'

export function safeRedirect(value: unknown, fallback = '/') {
  if (typeof value !== 'string') return fallback
  if (!value.startsWith('/') || value.startsWith('//') || value.startsWith('/login')) return fallback
  return value
}

export function parseIntent(value: unknown): AuthIntent | null {
  return value === 'save' || value === 'run' ? value : null
}

export function withIntent(path: string, intent: AuthIntent | null) {
  if (!intent) return path
  return `${path}${path.includes('?') ? '&' : '?'}intent=${intent}`
}

export function currentPath(router: Router, route: RouteLocationNormalizedLoaded) {
  const query = { ...route.query }
  delete query.intent
  return router.resolve({ path: route.path, query }).fullPath
}

export function loginLocation(redirect: string, intent?: AuthIntent) {
  return {
    name: 'login' as const,
    query: {
      redirect,
      ...(intent ? { intent } : {}),
    },
  }
}
