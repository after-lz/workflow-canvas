import type { LoginResult } from '../types/auth'
import { request } from './http'

export function login(account: string, password: string) {
  return request<LoginResult>('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ account, password }),
  })
}
