const configured = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')

/** 开发、测试、生产的接口目标都是这个域名。 */
export const API_ORIGIN = configured

/**
 * 本地页面在 localhost，直接请求 woodai.vip 会被浏览器跨域拦截。
 * 开发环境先请求同源 /api，由 Vite 转发到上面的域名；打包后直接请求该域名。
 */
export const API_BASE_URL = import.meta.env.DEV ? '' : configured
