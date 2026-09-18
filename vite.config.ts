import vue from '@vitejs/plugin-vue'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiOrigin = env.VITE_API_BASE_URL || 'http://woodai.vip'

  const proxy = {
    '/api': {
      target: apiOrigin,
      changeOrigin: true,
    },
  }

  return {
    plugins: [vue()],
    server: { proxy },
    preview: { proxy },
  }
})
