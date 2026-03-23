import { BasicError } from '../utils/errors';
import prisma from '../utils/prisma';
// 注意：现在可以不再直接导入 createError，除非在 BasicError 无法覆盖的场景下仍需使用

/**
 * 查询所有营销节点
 */
export async function queryMarketingNodes(year?: number, month?: number) {
  return 'success';
}
