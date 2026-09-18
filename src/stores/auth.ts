import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { login as loginApi } from '../services/auth'
import { clearAuthStorage, readAuthSession, writeAuthSession } from '../services/authStorage'
import type { AuthUser } from '../types/auth'

export const useAuthStore = defineStore('auth', () => {
  const session = readAuthSession()
  const token = ref<string | null>(session.token)
  const user = ref<AuthUser | null>(session.user)

  const isLoggedIn = computed(() => Boolean(token.value))

  async function login(account: string, password: string) {
    const data = await loginApi(account, password)
    const expireAt = Date.now() + data.expires_in * 1000
    token.value = data.access_token
    user.value = data.user
    writeAuthSession({
      token: data.access_token,
      user: data.user,
      expireAt,
    })
    return data
  }

  function logout() {
    token.value = null
    user.value = null
    clearAuthStorage()
  }

  return {
    token,
    user,
    isLoggedIn,
    login,
    logout,
  }
})
