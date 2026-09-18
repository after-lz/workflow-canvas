const configured = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')

export const API_ORIGIN = configured

/**
 * 开发环境走同源 /api，由 Vite 代理到上面的域名，避免浏览器跨域。
 * 测试和生产直接请求该域名。
 */
export const API_BASE_URL = import.meta.env.DEV ? '' : configured
