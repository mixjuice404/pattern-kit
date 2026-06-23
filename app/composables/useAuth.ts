import { useState, useCookie, navigateTo } from '#app'

export interface AuthUser {
  id: number;
  userId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  isRoot: boolean;
  roles: string[];
  permissions: string[];
}

export const useAuth = () => {
  // 使用 useState 保持全局共享的用户状态
  const user = useState<AuthUser | null>('auth-user', () => null)
  
  // 检查是否拥有特定角色
  const hasRole = (role: string): boolean => {
    if (!user.value) return false
    if (user.value.isRoot) return true // ROOT 用户拥有一切角色
    return user.value.roles.includes(role)
  }

  // 检查是否拥有特定权限
  const hasPermission = (permission: string): boolean => {
    if (!user.value) return false
    if (user.value.isRoot) return true // ROOT 用户拥有一切权限
    return user.value.permissions.includes(permission)
  }

  // 设置用户信息 (通常在登录成功后调用)
  const setUser = (userData: AuthUser | null) => {
    user.value = userData
  }

  // 登出逻辑
  const logout = () => {
    user.value = null
    const token = useCookie('token')
    token.value = null
    const refreshToken = useCookie('refreshToken')
    refreshToken.value = null
    navigateTo('/login') // 这里的路径请根据你的实际登录页调整
  }

  return {
    user,
    hasRole,
    hasPermission,
    setUser,
    logout
  }
}