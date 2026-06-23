import { defineApiHandler } from '../../utils/defineApiHandler'
import { useApiResponse } from '../../utils/apiResponse'

export default defineApiHandler(async (event) => {
  // 如果能执行到这里，说明鉴权已经通过
  return useApiResponse({ 
    message: '鉴权通过！您拥有 ADMIN 角色、ROOT 权限或 user:edit 权限。',
    user: event.context.user 
  })
}, {
  roles: ['ADMIN'],              // 要求有 ADMIN 角色
  permissions: ['user:edit']     // 或者要求有 user:edit 权限 (ROOT 自动放行)
})