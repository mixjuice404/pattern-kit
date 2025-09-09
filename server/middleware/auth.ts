import { H3Event } from 'h3'
// 假设你有一个函数来验证 token 并返回用户信息或 null/false
// import { verifyTokenAndGetUser } from '~/server/utils/tokenUtils'
// 引入你的错误处理函数
import { useApiError } from '../utils/apiResponse'
// 导入公共路由配置
import { publicRoutes } from '../config/auth.config'


// 模拟的 token 验证函数 (你需要替换成真实的逻辑)
// 导入必要的模块
import { verifyToken } from '../utils/jwt.util'
import prisma from '../utils/prisma'

// 优化后的 token 验证函数
async function verifyTokenAndGetUser(token: string): Promise<{ id: number; userId: string, email: string; name: string } | null> {
  try {
    // 1. 验证 JWT token 并直接从 token 中获取用户信息
    const decoded = verifyToken<{
      id: number;
      userId: string;
      email: string;
      name: string;
    }>(token)
    
    if (!decoded || !decoded.userId) {
      console.log('Token 解码失败或缺少用户信息')
      return null
    }

    // 2. 只在必要时查询数据库（比如检查用户状态或版本）
    // 可以使用缓存或定期检查来减少数据库查询
    const shouldVerifyUser = Math.random() < 0.1 // 10% 的概率验证用户状态
    
    if (shouldVerifyUser) {
      const user = await prisma.user.findFirst({
        where: {
          user_id: decoded.userId,
          deleted: 0,
          version: decoded.userVersion // 检查用户信息是否有更新
        },
        select: { id: true, status: true }
      })
      
      if (!user || user.status !== 1) {
        console.log('用户状态异常或信息已更新:', decoded.userId)
        return null
      }
    }

    // 3. 直接返回 token 中的用户信息
    return {
      id: decoded.id,
      userId: decoded.userId,
      email: decoded.email,
      name: decoded.name
    }

  } catch (error) {
    console.error('Token 验证过程中发生错误:', error)
    return null
  }
}


export default defineEventHandler(async (event: H3Event) => {
  // 只对 API 路由应用此中间件 (可选，根据需要调整)
  // 你也可以根据路径前缀来进行更精细的控制
  const isApiRoute = event.path.startsWith('/api/') || event.path.startsWith('/trpc/') // 根据你的 API 路径调整

  if (!isApiRoute) {
    // 如果不是 API 路由，则跳过 token 检查
    return
  }

  // 使用从配置文件导入的 publicRoutes，不需要 token 验证的路由
  if (publicRoutes.some(prefix => event.path?.startsWith(prefix))) {
    // 如果是公共路由，则跳过 token 检查
    return
  }

  // 从 Authorization header 获取 token
  const authHeader = getHeader(event, 'Authorization')
  let token: string | null = null
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7) // 提取 'Bearer ' 后面的部分
  }

  if (!token) {
    console.log('Auth middleware: No token provided for', event.path)
    // 如果没有 token，则抛出未授权错误 & 注意：直接抛出错误会中断请求处理
    return useApiError('未授权：需要提供有效的 Token', 401)
  }

  try {
    // 验证 token 并获取用户信息
    const user = await verifyTokenAndGetUser(token)

    if (!user) {
      console.log('Auth middleware: Invalid token for', event.path)
      // 如果 token 无效，则抛出未授权错误
      return useApiError('未授权：Token 无效或已过期', 401)
    }

    // Token 有效，将用户信息附加到 event.context 中，以便后续处理程序使用
    event.context.user = user
    console.log('Auth middleware: User authenticated:', user.id, 'for', event.path)

  } catch (error) {
    console.error('Auth middleware: Error verifying token:', error)
    // 处理 token 验证过程中可能出现的其他错误
    return useApiError('服务器内部错误：无法验证 Token', 500)
  }
})