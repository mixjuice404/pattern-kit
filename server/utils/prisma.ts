import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient

declare global {
  var __prisma: PrismaClient | undefined
}

// 恢复为原生的 TCP 连接方式，以解决 Nitro Plugin 生命周期中
// neon serverless adapter 无法正确获取到 DATABASE_URL 的问题
const createPrismaClient = () => {
  return new PrismaClient();
}

// 防止在开发环境中热重载时创建多个 PrismaClient 实例
if (process.env.NODE_ENV === 'production') {
  prisma = createPrismaClient()
} else {
  if (!global.__prisma) {
    global.__prisma = createPrismaClient()
  }
  prisma = global.__prisma
}

export default prisma