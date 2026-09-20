<template>
  <div class="login-page">
    <div class="sky" aria-hidden="true">
      <div class="earth" />
      <p class="watermark">Mengtian AI Working Spaces</p>
    </div>

    <section class="card">
      <button class="close" type="button" aria-label="关闭" @click="close">×</button>
      <h1>mengtian AI</h1>
      <p class="sub">登录后可开启内容生成与历史记录</p>

      <form @submit.prevent="onSubmit">
        <label>
          <span>用户名</span>
          <input v-model="account" type="text" autocomplete="username" placeholder="请输入 OMS 用户名" />
        </label>
        <label>
          <span>密码</span>
          <input v-model="password" type="password" autocomplete="current-password" placeholder="请输入密码" />
        </label>

        <p v-if="error" class="error">{{ error }}</p>

        <button class="submit" type="submit" :disabled="submitting">
          {{ submitting ? '登录中' : '登 录' }}
        </button>
        <button class="register" type="button" @click="onRegister">注 册</button>
        <p v-if="registerTip" class="tip">{{ registerTip }}</p>
      </form>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { ApiError } from '../services/http'
import { parseIntent, safeRedirect, withIntent } from '../utils/redirect'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const account = ref('')
const password = ref('')
const error = ref('')
const registerTip = ref('')
const submitting = ref(false)

function close() {
  router.replace(safeRedirect(route.query.redirect))
}

function onRegister() {
  registerTip.value = '注册功能即将开放'
}

async function onSubmit() {
  error.value = ''
  registerTip.value = ''
  if (!account.value.trim() || !password.value) {
    error.value = '请填写用户名和密码'
    return
  }
  if (submitting.value) return

  submitting.value = true
  try {
    await auth.login(account.value.trim(), password.value)
    const redirect = safeRedirect(route.query.redirect)
    await router.replace(withIntent(redirect, parseIntent(route.query.intent)))
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : '登录失败，请稍后重试'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  position: relative;
  overflow: hidden;
  background: #05070d;
  color: #e5e7eb;
}

.sky {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(1px 1px at 12% 22%, rgba(255, 255, 255, 0.8), transparent 55%),
    radial-gradient(1px 1px at 28% 68%, rgba(255, 255, 255, 0.55), transparent 55%),
    radial-gradient(1.5px 1.5px at 72% 18%, rgba(255, 255, 255, 0.7), transparent 55%),
    radial-gradient(1px 1px at 84% 74%, rgba(255, 255, 255, 0.45), transparent 55%),
    radial-gradient(1px 1px at 63% 42%, rgba(255, 255, 255, 0.5), transparent 55%),
    #05070d;
}

.earth {
  position: absolute;
  left: -12vw;
  top: 16vh;
  width: 46vw;
  height: 46vw;
  border-radius: 50%;
  background:
    radial-gradient(circle at 32% 38%, #6d93c4 0%, #2d527f 28%, #163152 52%, #070d18 74%);
  box-shadow:
    inset -50px -20px 80px rgba(0, 0, 0, 0.45),
    0 0 80px rgba(40, 80, 140, 0.25);
}

.watermark {
  position: absolute;
  left: 7%;
  top: 46%;
  margin: 0;
  font-size: clamp(28px, 4vw, 64px);
  font-weight: 650;
  letter-spacing: 0.02em;
  color: rgba(255, 255, 255, 0.07);
  white-space: nowrap;
}

.card {
  position: relative;
  z-index: 1;
  width: min(420px, calc(100% - 32px));
  padding: 36px 32px 28px;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(18, 20, 26, 0.82);
  backdrop-filter: blur(16px);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.45);
}

.close {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: #9ca3af;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
}

h1 {
  margin: 0;
  font-family: Georgia, 'Palatino Linotype', 'Times New Roman', serif;
  font-style: italic;
  font-weight: 500;
  font-size: 32px;
  letter-spacing: 0.01em;
}

.sub {
  margin: 8px 0 22px;
  color: #9ca3af;
  font-size: 13px;
  line-height: 1.6;
}

label {
  display: block;
  margin-bottom: 14px;
}

label span {
  display: block;
  margin-bottom: 6px;
  color: #d1d5db;
  font-size: 13px;
}

input {
  width: 100%;
  height: 42px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid #3a3d44;
  background: #14161b;
  color: #f3f4f6;
  outline: none;
}

input:focus {
  border-color: #6366f1;
}

.error,
.tip {
  margin: 0 0 12px;
  font-size: 13px;
}

.error {
  color: #fca5a5;
}

.tip {
  color: #93c5fd;
  text-align: center;
}

.submit,
.register {
  width: 100%;
  height: 44px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 16px;
  letter-spacing: 0.35em;
  text-indent: 0.35em;
}

.submit {
  border: none;
  color: white;
  font-weight: 650;
  background: linear-gradient(90deg, #3b6cff, #6d5efc);
}

.submit:disabled {
  opacity: 0.7;
  cursor: wait;
}

.register {
  margin-top: 10px;
  border: 1px solid #3a3d44;
  background: transparent;
  color: #e5e7eb;
  letter-spacing: 0.35em;
}
</style>
