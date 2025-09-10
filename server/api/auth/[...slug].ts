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