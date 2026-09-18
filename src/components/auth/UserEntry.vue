<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { currentPath, loginLocation } from '../../utils/redirect'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const initial = computed(() => auth.user?.name?.slice(0, 1).toUpperCase() || 'U')

function goLogin() {
  if (route.name === 'login') return
  router.push(loginLocation(currentPath(router, route)))
}
</script>

<template>
  <button v-if="!auth.isLoggedIn" class="login" type="button" @click="goLogin">登录</button>
  <div v-else class="user">
    <span class="avatar">{{ initial }}</span>
    <span class="name">{{ auth.user?.name }}</span>
    <button class="logout" type="button" @click="auth.logout()">退出</button>
  </div>
</template>

<style scoped>
.login,
.logout {
  height: 32px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid #2a2b30;
  background: #16171a;
  color: #d1d5db;
  cursor: pointer;
  font-size: 13px;
}

.login {
  background: linear-gradient(90deg, #3b6cff, #6d5efc);
  border: none;
  color: white;
  font-weight: 600;
}

.user {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 12px;
  color: white;
  background: linear-gradient(135deg, #3b82f6, #6366f1);
}

.name {
  max-width: 96px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  color: #e5e7eb;
}
</style>
