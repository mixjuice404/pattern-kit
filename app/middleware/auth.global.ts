import { defineNuxtRouteMiddleware, navigateTo, useCookie } from '#app'
import { useAuth } from '~/composables/useAuth'

export default defineNuxtRouteMiddleware(async (to) => {
  const { user, hasRole, hasPermission, setUser } = useAuth()
  
  // 1. 公开页面白名单（不需要登录即可访问）
  const publicRoutes = ['/user/login']
  // 如果是公开页面，或者一些允许外部访问的动态路由（如分享的图解预览），直接放行
  if (publicRoutes.includes(to.path) || to.path.startsWith('/pattern/preview/')) {
    return
  }

  // 2. 如果没有用户信息，但存在 token，尝试同步恢复登录状态 (处理刷新页面的情况)
  if (!user.value) {
    const token = useCookie('token')
    if (token.value) {
      try {
        // 使用 await 阻塞路由，直到获取到用户信息
        const res: any = await $fetch('/api/auth/me', {
          headers: import.meta.server ? { cookie: `token=${token.value}` } : {}
        })
        if (res?.success && res?.data?.user) {
          setUser(res.data.user)
        } else {
          token.value = null
        }
      } catch (err) {
        console.warn('恢复登录状态失败', err)
        token.value = null
      }
    }
  }

  // 3. 默认拦截：所有非公开页面，如果没有登录，强制跳转到登录页
  if (!user.value) {
    return navigateTo('/user/login')
  }

  // 4. 获取页面元数据中的权限要求 (从 definePageMeta 中读取)
  const requiredRoles = to.meta.roles as string[] | undefined
  const requiredPermissions = to.meta.permissions as string[] | undefined

  // 如果页面没有配置特定的权限要求（没写或者空数组），只要登录了就默认放行
  if (!requiredRoles?.length && !requiredPermissions?.length) {
    return
  }

  // 5. 校验角色和权限 (满足其一即可，与后端逻辑保持一致)
  const rolePass = requiredRoles ? requiredRoles.some(r => hasRole(r)) : false
  const permPass = requiredPermissions ? requiredPermissions.some(p => hasPermission(p)) : false

  // 6. 如果都不满足，拒绝访问，跳回首页或无权限页
  if (!rolePass && !permPass) {
    console.warn(`无权访问页面: ${to.path}`)
    return navigateTo('/') 
  }
})