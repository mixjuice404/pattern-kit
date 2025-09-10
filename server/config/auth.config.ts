/**
 * 不需要 Token 验证的公共路由列表
 * 配置为 path 前缀
 */
export const publicRoutes: string[] = [
  '/api/_nuxt_icon',   // <--- 添加 Nuxt Icon 的路径
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/test',
  // 在这里添加其他不需要验证的 API 路由
  // 例如: '/api/public/some-data'
  '/api/pattern',
  '/api/auth/upload/imagekit',

  
];