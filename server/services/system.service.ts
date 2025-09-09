import prisma from '../utils/prisma'
import { createError } from 'h3'

/**
 * ======================================================================
 * 系统服务
 * 用于处理一些系统级别的操作或信息获取
 * 你可以在这里添加更多系统相关的服务函数
 * 例如：初始化设置、运行状况检查、清理任务等
 * ======================================================================
 */

/**
 * 示例：获取系统状态信息
 * @returns 返回系统状态对象
 * @throws H3Error 如果发生错误
 */
export async function getSystemStatus() {
  try {
    // 在这里可以添加获取系统状态的逻辑
    // 例如：检查数据库连接、检查外部服务状态等
    const dbConnection = await prisma.$queryRaw`SELECT 1`; // 简单检查数据库连接
    const status = {
      databaseConnected: !!dbConnection,
      serverTime: new Date().toISOString(),
      // 可以添加更多状态信息
    };
    console.log('获取系统状态成功');
    return status;
  } catch (error) {
    console.error('获取系统状态时发生错误:', error);
    throw createError({ statusCode: 500, statusMessage: '无法获取系统状态' });
  }
}


