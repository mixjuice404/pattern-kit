import { defineNuxtRouteMiddleware, navigateTo } from '#app'
import { useAuth } from '~/composables/useAuth'

export default defineNuxtRouteMiddleware((to) => {
  const { user, hasRole, hasPermission } = useAuth()
  
  // 获取页面元数据中的权限要求
  const requiredRoles = to.meta.roles as string[] | undefined
  const requiredPermissions = to.meta.permissions as string[] | undefined

  // 如果页面没有配置任何权限要求，直接放行
  if (!requiredRoles?.length && !requiredPermissions?.length) {
    return
  }

  // 如果页面有权限要求，但用户未登录，跳转登录页
  if (!user.value) {
    return navigateTo('/login') // 这里的路径请根据你的实际登录页调整
  }

  // 校验角色和权限 (满足其一即可，与后端逻辑保持一致)
  const needsRoleCheck = !!requiredRoles?.length
  const needsPermCheck = !!requiredPermissions?.length
  
  const rolePass = requiredRoles ? requiredRoles.some(r => hasRole(r)) : false
  const permPass = requiredPermissions ? requiredPermissions.some(p => hasPermission(p)) : false

  let passed = false
  if (needsRoleCheck && rolePass) passed = true
  if (needsPermCheck && permPass) passed = true

  // 如果都不满足，拒绝访问，跳回首页
  if (!passed) {
    console.warn(`无权访问页面: ${to.path}`)
    return navigateTo('/') 
  }
})