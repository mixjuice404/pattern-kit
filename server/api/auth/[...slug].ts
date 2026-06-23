import { createRouter, useBase, readBody } from 'h3' // 导入 createError
// 导入新的包装器和响应工具
import { defineApiHandler } from '../../utils/defineApiHandler' // 确保路径正确
import { useApiResponse } from '../../utils/apiResponse' // 保留用于成功响应
import * as authService from '../../services/auth.service'
import ImageKit from 'imagekit'

const router = createRouter()

/**
 * ======================================================================
 * 1. 登录
 * 2. 注册 - 暂不开放，邀请制
 * 3. 登出
 * 4. 重置密码
 * 5. 获取用户信息
 * 6. 更新用户信息
 * ======================================================================
 */

// 用户登录 (使用 defineApiHandler)
router.post('/login', defineApiHandler(async (event) => {
  const body = await readBody(event)
  const { email, password } = body
  // 验证输入参数
  if (!email || !password) {
    // 使用 H3 的 createError 来抛出带有状态码和消息的错误
    throw new BasicError('INPUT_EMAIL_PASSWORD_REQUIRED');
  }
  // 调用登录服务
  return useApiResponse(await authService.loginUser(email, password), '登录成功')
}))

// 获取当前用户信息
router.get('/me', defineApiHandler(async (event) => {
  // 因为配置了空的 roles/permissions 数组（或者利用全局的校验），这里能进来一定是有合法 token 的
  // 但最简单的是，我们直接要求它经过 auth 中间件的拦截
  const userToken = event.context.user;
  if (!userToken || !userToken.id) {
    throw new BasicError('AUTH_INVALID_TOKEN', { statusCode: 401, message: '请先登录' });
  }
  
  // 返回最新的用户信息（包含角色和权限）
  // 为了确保刷新页面时拿到最新权限，我们再调一次 authService 获取（如果需要的话，这里简单起见直接用 token 里的信息，或复用 getUserAuthInfo）
  // 这里演示直接返回 token 中解析出的基础信息，如果你希望每次刷新都查库更新权限，可以调用相关的 service
  return useApiResponse({ user: userToken })
}, { roles: [] })) // 配置空数组，代表“需要登录，但不限制特定角色”

// 用户登出
router.post('/logout', defineApiHandler(async () => {
  // JWT 是无状态的，后端登出主要靠前端清除 Cookie，这里给个成功响应即可
  return useApiResponse({}, '登出成功')
}))

/**
 * ======================================================================
 * auth config (ROOT Panel APIs)
 * ======================================================================
 */

// 获取用户列表 (仅限 ROOT)
router.get('/admin/users', defineApiHandler(async (event) => {
  const query = getQuery(event)
  const page = Number(query.page) || 1
  const pageSize = Number(query.pageSize) || 20
  
  const result = await authService.getUserList(page, pageSize)
  return useApiResponse(result)
}, { roles: ['ROOT'] })) // 这里使用 'ROOT' 作为显式标识，配合 defineApiHandler 的 isRoot 放行机制

// 切换用户状态 (仅限 ROOT)
router.post('/admin/users/:id/status', defineApiHandler(async (event) => {
  const id = Number(event.context.params?.id)
  const { status } = await readBody(event)
  
  if (typeof status !== 'number') throw new BasicError('PARAM_INVALID', { message: 'status 必须是数字' })
  
  const result = await authService.toggleUserStatus(id, status)
  return useApiResponse(result, '用户状态更新成功')
}, { roles: ['ROOT'] }))

// 为用户分配角色 (仅限 ROOT)
router.post('/admin/users/:id/roles', defineApiHandler(async (event) => {
  const id = Number(event.context.params?.id)
  const { roles } = await readBody(event)
  
  if (!Array.isArray(roles)) throw new BasicError('PARAM_INVALID', { message: 'roles 必须是数组' })
  
  const result = await authService.assignUserRoles(id, roles)
  return useApiResponse(result, '用户角色分配成功')
}, { roles: ['ROOT'] }))

/**
 * ======================================================================
 * third auth 
 * ======================================================================
 */

router.get('/upload/imagekit', defineApiHandler(async (event) => {
  console.log("上传图片到ImageKit")
  const config = useRuntimeConfig()
  const imagekit = new ImageKit({
    publicKey: config.public.imagekitPublicKey as string,
    privateKey: config.imagekitPrivateKey as string,
    urlEndpoint: config.public.imagekitUrlEndpoint as string
  })
  try {
    const { token, expire, signature } = imagekit.getAuthenticationParameters()
    console.log(token, expire, signature)
    return { token, expire, signature, publicKey: process.env.IMAGEKIT_PUBLIC_KEY }
  } catch (error) {
    throw new BasicError('UNKNOWN_ERROR', { statusCode: 404, message: '获取上传凭证失败' });
  }
}))


/**
 * ======================================================================
 * system testing
 * ======================================================================
 */

// 测试路由
router.get('/test', defineApiHandler(async () => 'Hello World'))

export default useBase('/api/auth', router.handler)